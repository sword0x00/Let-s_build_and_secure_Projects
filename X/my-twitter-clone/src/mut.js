import { gql } from '@apollo/client';

export const CREATE_POST = gql`
  mutation CreatePost($content: String!, $userId: ID!, $isSubscribersOnly: Boolean, $imageData: String) { # Changed imageUrl to imageData
    createPost(content: $content, userId: $userId, isSubscribersOnly: $isSubscribersOnly, imageData: $imageData) { # Changed imageUrl to imageData
      id
      content
      imageUrl # Request imageUrl in response (will be the data URL)
      createdAt
      isRetweet
      isSubscribersOnly
      isContentTruncated
      author {
        id
        username
        displayName
        userType
      }
      likesCount
      commentsCount
      retweetsCount
    }
  }
`;

export const CREATE_RETWEET = gql`
  mutation CreateRetweet($postId: ID!, $content: String!, $userId: ID!) {
    createRetweet(postId: $postId, content: $content, userId: $userId) {
      id
      content
      imageUrl # Request imageUrl in response
      createdAt
      isRetweet
      isSubscribersOnly
      isContentTruncated
      author {
        id
        username
        displayName
        userType
      }
      originalPost {
        id
        content
        imageUrl # Request imageUrl for original post in response
        author {
          id
          username
          displayName
        }
      }
      likesCount
      commentsCount
      retweetsCount
    }
  }
`;

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!, $userId: ID!) {
    likePost(postId: $postId, userId: $userId)
  }
`;

export const UNLIKE_POST = gql`
  mutation UnlikePost($postId: ID!, $userId: ID!) {
    unlikePost(postId: $postId, userId: $userId)
  }
`;

export const COMMENT_ON_POST = gql`
  mutation CommentOnPost($postId: ID!, $content: String!, $userId: ID!) {
    commentOnPost(postId: $postId, content: $content, userId: $userId) {
      id
      content
      createdAt
      commenter {
        id
        username
        displayName
      }
      post {
        id
      }
    }
  }
`;

export const FOLLOW_USER = gql`
  mutation FollowUser($followerId: ID!, $followingId: ID!) {
    followUser(followerId: $followerId, followingId: $followingId)
  }
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($followerId: ID!, $followingId: ID!) {
    unfollowUser(followerId: $followerId, followingId: $followingId)
  }
`;

export const SUBSCRIBE_TO_USER = gql`
  mutation SubscribeToUser($subscriberId: ID!, $publisherId: ID!) {
    subscribeToUser(subscriberId: $subscriberId, publisherId: $publisherId)
  }
`;

export const UNSUBSCRIBE_FROM_USER = gql`
  mutation UnsubscribeFromUser($subscriberId: ID!, $publisherId: ID!) {
    unsubscribeFromUser(subscriberId: $subscriberId, publisherId: $publisherId)
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($username: String!, $email: String!, $displayName: String!, $userType: UserType) {
    createUser(username: $username, email: $email, displayName: $displayName, userType: $userType) {
      id
      username
      displayName
      email
      userType
      createdAt
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;
