import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import { FaComment, FaHeart, FaRetweet, FaShare } from 'react-icons/fa';
import './TweetActions.css';
import { useMutation } from '@apollo/client';
import { CREATE_RETWEET } from '../mut';

function TweetActions({ user, content, tweetId, favorite, counters, onRetweet, onToggleFavorite, currentUserId }) {
  const [createRetweet] = useMutation(CREATE_RETWEET);

  const handleShareButtonClick = () => {
    copy(`@${user}: "${content}"`);
    console.log('Tweet content copied to clipboard!');
  };

  const handleRetweetButtonClick = async () => {
    if (!tweetId) {
      console.error('No tweet ID for retweet.');
      return;
    }
    if (!currentUserId) {
      console.warn('No current user selected. Please select a user to retweet.');
      return;
    }

    try {
      const { data } = await createRetweet({
        variables: {
          postId: tweetId,
          content: `Retweeted from @${user}: ${content}`,
          userId: currentUserId
        }
      });
      if (data && data.createRetweet) {
        onRetweet(data.createRetweet);
      }
    } catch (err) {
      console.error('Retweet failed:', err.message);
    }
  };

  return (
    <ul className="tweet-actions">
      <li>
        <button type="button" className="tweet-actions-button">
          <FaComment size="18" /> {counters.comments}
        </button>
      </li>
      <li>
        <button type="button" className="tweet-actions-button" onClick={handleRetweetButtonClick}>
          <FaRetweet size="25" /> {counters.retweets}
        </button>
      </li>
      <li>
        <button type="button" className="tweet-actions-button" onClick={() => onToggleFavorite(tweetId)}>
          <FaHeart size="18" color={favorite ? 'rgb(224, 36, 94)' : ''} />{' '}
          {counters.favorites}
        </button>
      </li>
      <li>
        <button type="button" className="tweet-actions-button" onClick={handleShareButtonClick}>
          <FaShare size="18" />
        </button>
      </li>
    </ul>
  );
}

TweetActions.propTypes = {
  user: PropTypes.string,
  content: PropTypes.string,
  tweetId: PropTypes.string.isRequired,
  favorite: PropTypes.bool,
  counters: PropTypes.shape({
    comments: PropTypes.number,
    retweets: PropTypes.number,
    favorites: PropTypes.number,
  }),
  onRetweet: PropTypes.func.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  currentUserId: PropTypes.string,
};

export default TweetActions;
