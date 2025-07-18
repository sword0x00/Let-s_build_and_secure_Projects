import { gql } from '@apollo/client';

// Query to get all users (for selecting a current user)
export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      username
      userType
    }
  }
`;

// Query to get posts for a user's timeline, respecting subscription and follow logic
export const GET_TIMELINE = gql`
  query GetTimeline($userId: ID!) {
    getTimeline(userId: $userId) {
      id
      content
      imageUrl # Request imageUrl
      createdAt
      isRetweet
      isSubscribersOnly # Include this to display status
      isContentTruncated # New field for truncated content
      author {
        id
        username
        displayName
        userType
      }
      originalPost {
        id
        content
        imageUrl # Request imageUrl for original post
        author {
          id
          username
          displayName
        }
      }
      likesCount
      commentsCount
      retweetsCount
      # isLiked # These would require user context in the backend, currently always false
      # isRetweeted # These would require user context in the backend, currently always false
    }
  }
`;

// Query to get a specific user's public posts (for profile view)
export const GET_USER_POSTS = gql`
  query UserPosts($username: String!, $limit: Int, $offset: Int) {
    userPosts(username: $username, limit: $limit, offset: $offset) {
      id
      content
      imageUrl # Request imageUrl
      createdAt
      isRetweet
      isSubscribersOnly
      isContentTruncated # Include for consistency, though likely false here
      author {
        id
        username
        displayName
        userType
      }
      originalPost {
        id
        content
        imageUrl # Request imageUrl for original post
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

// Exporting GET_POSTS as it was in your original file, though GET_TIMELINE will be primary
// for the main feed. This one fetches only public posts.
export const GET_POSTS = gql`
  query GetAllPosts {
    getAllPosts {
      id
      content
      imageUrl # Request imageUrl
      createdAt
      isRetweet
      isSubscribersOnly
      isContentTruncated # Include for consistency, though likely false here
      author {
        username
      }
      originalPost {
        id
        content
        imageUrl # Request imageUrl for original post
        author {
          username
        }
      }
      commentsCount
      retweetsCount
      likesCount
    }
  }
`;

// Query to get a single post (for detailed view or comments)
export const GET_POST_BY_ID = gql`
  query Post($postId: ID!) {
    post(id: $postId) {
      id
      content
      imageUrl # Request imageUrl
      createdAt
      isRetweet
      isSubscribersOnly
      isContentTruncated # Include for consistency
      author {
        id
        username
        displayName
        userType
      }
      originalPost {
        id
        content
        imageUrl # Request imageUrl for original post
        author {
          id
          username
          displayName
        }
      }
      likesCount
      commentsCount
      retweetsCount
      comments {
        id
        content
        createdAt
        commenter {
          id
          username
          displayName
        }
      }
    }
  }
`;
