const typeDefs = `
  type User {
    id: ID!
    username: String!
    email: String!
    displayName: String!
    profileImage: String
    userType: UserType! # 'normal' or 'premium' users
    createdAt: String!
    posts: [Post!]!
    followers: [User!]!
    following: [User!]!
    followersCount: Int!
    followingCount: Int!
    subscribersCount: Int!
    subscriptionsCount: Int!
  }

  enum UserType {
    normal
    premium
  }

  type Post {
    id: ID!
    content: String!
    imageUrl: String # This will now store the base64 image data (data URL)
    isSubscribersOnly: Boolean! # True if only subscribers can see it
    isContentTruncated: Boolean # New field: True if content is truncated for the viewer
    createdAt: String!
    author: User!
    likes: [Like!]!
    comments: [Comment!]!
    retweets: [Retweet!]!
    likesCount: Int!
    commentsCount: Int!
    retweetsCount: Int!
    isLiked: Boolean! # Indicates if the current viewer has liked the post (requires user context)
    isRetweeted: Boolean! # Indicates if the current viewer has retweeted the post (requires user context)
    isRetweet: Boolean! # True if this post is a retweet
    originalPostId: ID
    originalPost: Post # The original post if this is a retweet
  }

  type Like {
    id: ID!
    user: User!
    post: Post!
    createdAt: String!
  }

  type Comment {
    id: ID!
    content: String!
    commenter: User!
    post: Post!
    createdAt: String!
  }

  type Retweet {
    id: ID!
    retweeter: User!
    retweetedPost: Post!
    createdAt: String!
  }

  type Subscription {
    id: ID!
    subscriber: User!
    publisher: User!
    createdAt: String!
  }

  type Query {
    getAllUsers: [User!]!
    getAllPosts: [Post!]! # Fetches all public posts
    getTimeline(userId: ID!): [Post!]! # Fetches posts for a user's timeline, respecting user type and subscriptions
    user(username: String!): User
    post(id: ID!): Post
    userPosts(username: String!, limit: Int, offset: Int): [Post!]! # Fetches public posts for a specific user's profile
  }

  type Mutation {
    createUser(username: String!, email: String!, displayName: String!, userType: UserType): User!
    # Changed imageUrl to imageData to accept Base64 string
    createPost(content: String!, imageData: String, isSubscribersOnly: Boolean, userId: ID!): Post!
    createRetweet(postId: ID!, content: String!, userId: ID!): Post! # Retweet an existing post
    likePost(postId: ID!, userId: ID!): Boolean! # Like a post
    unlikePost(postId: ID!, userId: ID!): Boolean! # Unlike a post
    commentOnPost(postId: ID!, content: String!, userId: ID!): Comment! # Comment on a post
    followUser(followerId: ID!, followingId: ID!): Boolean! # Follow a user
    unfollowUser(followerId: ID!, followingId: Boolean!): Boolean! # Unfollow a user
    subscribeToUser(subscriberId: ID!, publisherId: ID!): Boolean! # Subscribe to a premium user
    unsubscribeFromUser(subscriberId: ID!, publisherId: ID!): Boolean! # Unsubscribe from a user
    deletePost(id: ID!): Boolean!
    deleteComment(id: ID!): Boolean!
  }
`;

export default typeDefs;
