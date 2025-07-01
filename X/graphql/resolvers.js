import db from '../models/index.js';
import { Op } from 'sequelize';

const { User, Post, Like, Comment, Retweet, Follow, Subscription } = db;

// Common associations for posts to reduce repetition
const includePostRelations = [
  { model: User, as: 'author' },
  { model: Like, as: 'likes' },
  { model: Comment, as: 'comments' },
  { model: Retweet, as: 'retweets' }
];

const resolvers = {
  Query: {
    // Fetches all users
    getAllUsers: () => User.findAll(),

    // Fetches all public posts. Subscriber-only posts are excluded here.
    getAllPosts: async () => {
      const posts = await Post.findAll({
        where: { isSubscribersOnly: false }, // Only public posts
        order: [['createdAt', 'DESC']],
        include: includePostRelations
      });
      // Filter out posts if the author relationship fails (e.g., author deleted)
      return posts.filter(post => post.author);
    },

    // getTimeline: Fetches posts relevant to a specific user's timeline based on their userType.
    // - Normal users see all public posts and truncated subscriber-only posts.
    // - Premium users see all public posts, their own posts (public and subscriber-only),
    //   and full subscriber-only posts from users they subscribe to.
    getTimeline: async (_, { userId }) => {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      let whereConditions = [];

      // Always include all public posts for both normal and premium users
      whereConditions.push({ isSubscribersOnly: false });

      // If the user is premium, expand the timeline logic
      if (user.userType === 'premium') {
        // Include the premium user's own posts (public or subscriber-only)
        whereConditions.push({ userId: userId });

        // Get IDs of users this premium user is subscribed to
        const subscriptions = await Subscription.findAll({
          where: { subscriberId: userId },
          attributes: ['publisherId']
        });
        const subscribedToIds = subscriptions.map(s => s.publisherId);

        // If the premium user is subscribed to anyone, include subscriber-only posts from those publishers
        if (subscribedToIds.length > 0) {
          whereConditions.push({
            userId: { [Op.in]: subscribedToIds },
            isSubscribersOnly: true // Specifically fetch subscriber-only posts from these publishers
          });
        }
      } else { // Normal user
        // For normal users, fetch all subscriber-only posts for truncation
        whereConditions.push({ isSubscribersOnly: true });
      }


      const posts = await Post.findAll({
        where: { [Op.or]: whereConditions },
        order: [['createdAt', 'DESC']],
        include: [
          ...includePostRelations,
          {
            model: Post,
            as: 'originalPost',
            include: [{ model: User, as: 'author' }]
          }
        ]
      });

      // Filter and process posts based on user type and subscription status
      const processedPosts = await Promise.all(posts.map(async (post) => {
        const postData = post.toJSON(); // Get a plain JSON object for modification
        postData.isContentTruncated = false; // Default to false

        // Check if the current user is subscribed to the author of this post
        const isSubscribed = await Subscription.findOne({
          where: { subscriberId: userId, publisherId: post.userId }
        });

        // Apply truncation for normal users if they are not the author and not subscribed
        if (postData.isSubscribersOnly && user.userType === 'normal' && postData.userId !== userId && !isSubscribed) {
          postData.content = postData.content.substring(0, 10) + '...';
          postData.isContentTruncated = true;
          postData.imageUrl = null; // Set imageUrl to null if content is truncated
        }

        return postData;
      }));

      // Use a Map to ensure unique posts, as a post might satisfy multiple conditions
      const uniquePosts = Array.from(new Map(processedPosts.map(post => [post.id, post])).values());

      // Filter out any posts where the author might have been deleted
      return uniquePosts.filter(post => post.author);
    },

    // Fetches a single user by username
    user: (_, { username }) => User.findOne({ where: { username } }),

    // Fetches a single post by ID, including its comments and their authors
    post: (_, { id }) => Post.findByPk(id, {
      include: [
        ...includePostRelations,
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'commenter' }]
        }
      ]
    }),

    // Fetches public posts for a specific user's profile.
    userPosts: async (_, { username, limit = 20, offset = 0 }) => {
      const user = await User.findOne({ where: { username } });
      if (!user) throw new Error('User not found');

      return Post.findAll({
        where: {
          userId: user.id,
          isSubscribersOnly: false
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: includePostRelations
      });
    }
  },

  Mutation: {
    // Creates a new user
    createUser: async (_, { username, email, displayName, userType = 'normal' }) => {
      return await User.create({ username, email, displayName, userType });
    },

    // Creates a new post.
    // Only 'premium' users can mark a post as 'isSubscribersOnly'.
    // Accepts imageData (Base64 string) instead of imageUrl
    createPost: async (_, { content, imageData, isSubscribersOnly = false, userId }) => {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      // Enforce that only premium users can create subscriber-only posts
      if (isSubscribersOnly && user.userType !== 'premium') {
        throw new Error('Only premium users can create subscriber-only posts');
      }

      // imageUrl will now store the Base64 data (data URL)
      const post = await Post.create({
        content,
        imageUrl: imageData, // Store imageData directly in imageUrl field
        isSubscribersOnly,
        userId
      });

      // Return the created post with its associated data
      return Post.findByPk(post.id, { include: includePostRelations });
    },

    // Creates a retweet.
    // Checks if the user has permission to retweet subscriber-only posts.
    createRetweet: async (_, { postId, content, userId }) => {
      const postToRetweet = await Post.findByPk(postId);
      if (!postToRetweet) throw new Error('Post not found');

      let actualOriginalPostId = postId;
      // If the post being retweeted is itself a retweet, get its originalPostId
      if (postToRetweet.isRetweet && postToRetweet.originalPostId) {
        actualOriginalPostId = postToRetweet.originalPostId;
      }

      const originalPost = await Post.findByPk(actualOriginalPostId);
      if (!originalPost) throw new Error('Original post for retweet not found');


      // If the original post is subscriber-only, check if the retweeter is subscribed or is the author
      if (originalPost.isSubscribersOnly) {
        const isSubscribed = await Subscription.findOne({
          where: { subscriberId: userId, publisherId: originalPost.userId }
        });
        // If not subscribed and not the author, deny retweet
        if (!isSubscribed && originalPost.userId !== userId) {
          throw new Error('Cannot retweet a subscriber-only post without a subscription');
        }
      }

      // Prevent duplicate retweets by the same user for the same original post
      const alreadyRetweeted = await Retweet.findOne({
        where: { userId, postId: actualOriginalPostId } // Check against actual original post
      });
      if (alreadyRetweeted) throw new Error('You have already retweeted this post');

      // Create the retweet record
      await Retweet.create({ userId, postId: actualOriginalPostId }); // Link to actual original post

      // Create a new Post entry for the retweet itself
      const retweet = await Post.create({
        content, // The new content for the retweet (can be empty)
        userId,
        isRetweet: true, // Mark this post as a retweet
        originalPostId: actualOriginalPostId // Link to the actual original post
      });

      // Return the newly created retweet post with its associated data
      return Post.findByPk(retweet.id, { include: includePostRelations });
    },

    // Likes a post.
    // Checks if the user has permission to like subscriber-only posts.
    likePost: async (_, { postId, userId }) => {
      const post = await Post.findByPk(postId);
      if (!post) throw new Error('Post not found');

      // If the post is subscriber-only, check if the user is subscribed or is the author
      if (post.isSubscribersOnly && post.userId !== userId) {
        const isSubscribed = await Subscription.findOne({
          where: { subscriberId: userId, publisherId: post.userId }
        });
        if (!isSubscribed) throw new Error('Cannot like a subscriber-only post without a subscription');
      }

      // Check if the user has already liked this post
      const existingLike = await Like.findOne({
        where: { userId, postId }
      });

      if (existingLike) return false; // Already liked, no action needed

      await Like.create({ userId, postId });
      return true;
    },

    // Unlikes a post
    unlikePost: async (_, { postId, userId }) => {
      const like = await Like.findOne({
        where: { userId, postId }
      });

      if (!like) return false; // Not liked, no action needed

      await like.destroy();
      return true;
    },

    // Comments on a post.
    // Checks if the user has permission to comment on subscriber-only posts.
    commentOnPost: async (_, { postId, content, userId }) => {
      const post = await Post.findByPk(postId);
      if (!post) throw new Error('Post not found');

      // If the post is subscriber-only, check if the user is subscribed or is the author
      if (post.isSubscribersOnly && post.userId !== userId) {
        const isSubscribed = await Subscription.findOne({
          where: { subscriberId: userId, publisherId: post.userId }
        });
        if (!isSubscribed) throw new Error('Cannot comment on a subscriber-only post without a subscription');
      }

      const comment = await Comment.create({ content, postId, userId });
      // Return the created comment with its associated user and post data
      return Comment.findByPk(comment.id, {
        include: [
          { model: User, as: 'commenter' },
          { model: Post, as: 'post' }
        ]
      });
    },

    // Allows a user to follow another user.
    followUser: async (_, { followerId, followingId }) => {
      if (followerId === followingId) throw new Error('A user cannot follow themselves');

      // Prevent duplicate follows
      const existingFollow = await Follow.findOne({
        where: { followerId, followingId }
      });
      if (existingFollow) return false; // Already following

      await Follow.create({ followerId, followingId });
      return true;
    },

    // Allows a user to unfollow another user.
    unfollowUser: async (_, { followerId, followingId }) => {
      const follow = await Follow.findOne({
        where: { followerId, followingId }
      });
      if (!follow) return false; // Not following

      await follow.destroy();
      return true;
    },

    // Allows a user to subscribe to a premium user.
    subscribeToUser: async (_, { subscriberId, publisherId }) => {
      if (subscriberId === publisherId) throw new Error('A user cannot subscribe to themselves');

      const publisher = await User.findByPk(publisherId);
      // Only premium users can be subscribed to
      if (!publisher || publisher.userType !== 'premium') {
        throw new Error('You can only subscribe to premium users');
      }

      // Prevent duplicate subscriptions
      const existingSubscription = await Subscription.findOne({
        where: { subscriberId, publisherId }
      });
      if (existingSubscription) return false; // Already subscribed

      await Subscription.create({ subscriberId, publisherId });
      return true;
    },

    // Allows a user to unsubscribe from another user.
    unsubscribeFromUser: async (_, { subscriberId, publisherId }) => {
      const subscription = await Subscription.findOne({
        where: { subscriberId, publisherId }
      });
      if (!subscription) return false; // Not subscribed

      await subscription.destroy();
      return true;
    },

    // Deletes a post
    deletePost: async (_, { id }) => {
      const post = await Post.findByPk(id);
      if (!post) throw new Error('Post not found');
      await post.destroy();
      return true;
    },

    // Deletes a comment
    deleteComment: async (_, { id }) => {
      const comment = await Comment.findByPk(id);
      if (!comment) throw new Error('Comment not found');
      await comment.destroy();
      return true;
    }
  },

  // Resolvers for the User type's fields
  User: {
    // Get all posts by a user
    posts: (parent) => Post.findAll({
      where: { userId: parent.id },
      order: [['createdAt', 'DESC']]
    }),

    // Get users who follow this user
    followers: async (parent) => {
      const follows = await Follow.findAll({
        where: { followingId: parent.id },
        include: [{ model: User, as: 'followerUser' }]
      });
      return follows.map(f => f.followerUser);
    },

    // Get users this user is following
    following: async (parent) => {
      const follows = await Follow.findAll({
        where: { followerId: parent.id },
        include: [{ model: User, as: 'followingUser' }]
      });
      return follows.map(f => f.followingUser);
    },

    // Count of followers
    followersCount: (parent) => Follow.count({ where: { followingId: parent.id } }),
    // Count of users this user is following
    followingCount: (parent) => Follow.count({ where: { followerId: parent.id } }),
    // Count of subscribers this user has (if premium)
    subscribersCount: (parent) => Subscription.count({ where: { publisherId: parent.id } }),
    // Count of users this user is subscribed to
    subscriptionsCount: (parent) => Subscription.count({ where: { subscriberId: parent.id } })
  },

  // Resolvers for the Post type's fields
  Post: {
    // Count of likes for a post
    likesCount: (parent) => parent.likes?.length || 0,
    // Count of comments for a post
    commentsCount: (parent) => parent.comments?.length || 0,
    // Count of retweets for a post
    retweetsCount: (parent) => parent.retweets?.length || 0,

    isLiked: () => false,
    isRetweeted: () => false,

    // Resolves the original post if the current post is a retweet
    originalPost: async (parent) => {
      if (parent.isRetweet && parent.originalPostId) {
        return Post.findByPk(parent.originalPostId, {
          include: [{ model: User, as: 'author' }]
        });
      }
      return null;
    }
  }
};

export default resolvers;
