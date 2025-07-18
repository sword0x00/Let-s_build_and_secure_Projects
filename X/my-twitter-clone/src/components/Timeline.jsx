import PropTypes from 'prop-types';
import Tweet from './Tweet.jsx';
import './Timeline.css';
import TweetActions from './TweetActions.jsx';

function Timeline({ tweets, favorites, onRetweet, onToggleFavorite, currentUserId }) {
  return (
    <ul className="timeline">
      {tweets
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt
        .map((tweet) => {
          const isFavorite = favorites.includes(tweet.id);
          return (
            <li key={tweet.id} className="timeline-item">
              <Tweet tweet={tweet} />
              <TweetActions
                tweetId={tweet.id}
                user={tweet.user}
                content={tweet.content}
                favorite={isFavorite}
                counters={{
                  comments: tweet.comments_count,
                  retweets: tweet.retweets_count,
                  favorites: tweet.favorites_count,
                }}
                onRetweet={onRetweet}
                onToggleFavorite={() => onToggleFavorite(tweet.id)}
                currentUserId={currentUserId}
              />
            </li>
          );
        })}
    </ul>
  );
}

Timeline.propTypes = {
  tweets: PropTypes.array,
  favorites: PropTypes.array,
  onRetweet: PropTypes.func.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  currentUserId: PropTypes.string,
};

export default Timeline;
