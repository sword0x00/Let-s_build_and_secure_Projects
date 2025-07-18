import { useState, useEffect } from 'react';
import ComposeForm from './ComposeForm';
import Timeline from './Timeline';
import { FaTwitter } from 'react-icons/fa';
import './App.css';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TIMELINE, GET_ALL_USERS } from '../queries';
import { LIKE_POST, UNLIKE_POST } from '../mut';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const { loading: usersLoading, error: usersError, data: usersData } = useQuery(GET_ALL_USERS);

  const { loading: timelineLoading, error: timelineError, data: timelineData, refetch: refetchTimeline } = useQuery(
    GET_TIMELINE,
    {
      variables: { userId: currentUser?.id },
      skip: !currentUser?.id,
    }
  );

  const [likePost] = useMutation(LIKE_POST);
  const [unlikePost] = useMutation(UNLIKE_POST);

  useEffect(() => {
    if (timelineData && timelineData.getTimeline) {
      const convertedPosts = timelineData.getTimeline.map(post => ({
        content: post.content,
        id: String(post.id),
        createdAt: post.createdAt,
        user: post.author?.username || 'Anonymous',
        comments_count: post.commentsCount ?? 0,
        retweets_count: post.retweetsCount ?? 0,
        favorites_count: post.likesCount ?? 0,
        isRetweet: post.isRetweet ?? false,
        isSubscribersOnly: post.isSubscribersOnly ?? false,
        isContentTruncated: post.isContentTruncated ?? false,
        imageUrl: post.imageUrl || null, // Map imageUrl
        originalPost: post.originalPost ? { // Map original post details correctly
          ...post.originalPost,
          imageUrl: post.originalPost.imageUrl || null // Map imageUrl for original post
        } : null,
        isFromGraphQL: true
      }));
      setTweets(convertedPosts);
    }
  }, [timelineData]);

  const handlePostTweet = (post) => {
    const newTweet = {
      content: post.content,
      id: String(post.id),
      createdAt: post.createdAt,
      user: post.author?.username || 'Anonymous',
      comments_count: post.commentsCount ?? 0,
      retweets_count: post.retweetsCount ?? 0,
      favorites_count: post.likesCount ?? 0,
      isRetweet: post.isRetweet ?? false,
      isSubscribersOnly: post.isSubscribersOnly ?? false,
      isContentTruncated: post.isContentTruncated ?? false,
      imageUrl: post.imageUrl || null,
      originalPost: post.originalPost ? {
        ...post.originalPost,
        imageUrl: post.originalPost.imageUrl || null
      } : null,
      isFromGraphQL: true
    };
    setTweets(prevTweets => [newTweet, ...prevTweets]);
    refetchTimeline();
  };

  const handleToggleFavorite = async (tweetId) => {
    if (!currentUser) {
      console.warn('No user selected. Please select a user to like posts.');
      return;
    }

    const currentTweet = tweets.find(t => t.id === tweetId);
    if (!currentTweet) return;

    try {
      const isCurrentlyLiked = favorites.includes(tweetId);
      let success;

      if (isCurrentlyLiked) {
        const { data } = await unlikePost({ variables: { postId: tweetId, userId: currentUser.id } });
        success = data?.unlikePost;
        if (success) {
          setFavorites(favorites.filter(fav => fav !== tweetId));
          setTweets(prevTweets => prevTweets.map(tweet =>
            tweet.id === tweetId ? { ...tweet, favorites_count: Math.max(0, tweet.favorites_count - 1) } : tweet
          ));
        }
      } else {
        const { data } = await likePost({ variables: { postId: tweetId, userId: currentUser.id } });
        success = data?.likePost;
        if (success) {
          setFavorites([...favorites, tweetId]);
          setTweets(prevTweets => prevTweets.map(tweet =>
            tweet.id === tweetId ? { ...tweet, favorites_count: tweet.favorites_count + 1 } : tweet
          ));
        }
      }
      refetchTimeline();
    } catch (err) {
      console.error('Like/Unlike failed:', err.message);
      setTweets(prevTweets => prevTweets.map(tweet => {
        if (tweet.id === tweetId) {
          return {
            ...tweet,
            favorites_count: favorites.includes(tweetId) ? tweet.favorites_count - 1 : tweet.favorites_count + 1
          };
        }
        return tweet;
      }));
    }
  };

  if (usersLoading) return <div className="app"><div>Loading users...</div></div>;
  if (usersError) return <div className="app"><div>Error loading users: {usersError.message}</div></div>;

  const availableUsers = usersData?.getAllUsers || [];

  return (
    <div className="app">
      <FaTwitter className="app-logo" size="2em" />

      <div className="user-selection mb-4 p-4 bg-gray-100 rounded-lg shadow-md w-full max-w-md mx-auto">
        <label htmlFor="user-select" className="block text-gray-700 text-sm font-bold mb-2">
          Select Current User:
        </label>
        <select
          id="user-select"
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onChange={(e) => {
            const selectedUserId = e.target.value;
            const user = availableUsers.find(u => String(u.id) === selectedUserId);
            setCurrentUser(user);
            setTweets([]);
            setFavorites([]);
          }}
          value={currentUser?.id || ''}
        >
          <option value="" disabled>-- Choose a User --</option>
          {availableUsers.map(user => (
            <option key={user.id} value={user.id}>
              @{user.username} ({user.userType})
            </option>
          ))}
        </select>
        {currentUser && (
          <p className="mt-2 text-sm text-gray-600">
            Current User: <strong>@{currentUser.username}</strong> (ID: {currentUser.id}, Type: {currentUser.userType})
          </p>
        )}
      </div>

      {currentUser ? (
        <>
          <ComposeForm onSubmit={handlePostTweet} currentUserId={currentUser.id} currentUserType={currentUser.userType} />
          <div className="separator"></div>
          {timelineLoading ? (
            <div className="app-loading-timeline">Loading timeline...</div>
          ) : timelineError ? (
            <div className="app-error-timeline">Error loading timeline: {timelineError.message}</div>
          ) : (
            <Timeline
              tweets={tweets}
              onRetweet={handlePostTweet}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              currentUserId={currentUser.id}
            />
          )}
        </>
      ) : (
        <div className="app-no-user-selected p-4 text-center text-gray-600">
          Please select a user to view their timeline and compose posts.
        </div>
      )}
    </div>
  );
}

export default App;
