import moment from 'moment';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import './Tweet.css';

function Tweet({ tweet }) {
  const {
    user,
    createdAt,
    content,
    imageUrl, // New prop for image URL
    isRetweet,
    originalPost,
    isSubscribersOnly,
    isContentTruncated
  } = tweet;

  // --- Debugging Logs ---
  console.log("Tweet Component - Receiving Tweet:", tweet);
  console.log("Tweet Component - imageUrl:", imageUrl);
  console.log("Tweet Component - createdAt:", createdAt);
  // --- End Debugging Logs ---

  const displayContent = isContentTruncated ? content.substring(0, 10) + '...' : content;
  const displayImageUrl = !isContentTruncated && imageUrl; // Only display image if not truncated

  return (
    <div className="tweet">
      <Avatar name={user} />
      <div>
        <div className="tweet-header">
          <span className="tweet-user">@{user}</span> ·
          <span className="tweet-created-on">
            {/* Explicitly convert createdAt to a Number for moment.js to handle timestamps */}
            {moment(Number(createdAt)).isValid() ? moment(Number(createdAt)).fromNow() : 'Invalid Date'}
          </span>
          {isSubscribersOnly && (
            <span className="tweet-subscribers-only-badge">🔒 Subscribers Only</span>
          )}
        </div>

        {isRetweet && originalPost ? (
          <div className="tweet-retweeted">
            <div className="retweet-by">🔁 Retweeted by @{user}</div>
            <div className="original-post">
              <div className="original-author">@{originalPost.author?.username || 'unknown'}</div>
              <div className="tweet-content">
                {/* Apply truncation to original post's content if needed */}
                {isContentTruncated ? originalPost.content.substring(0, 10) + '...' : originalPost.content}
                {/* Conditionally render image for original post based on truncation */}
                {!isContentTruncated && originalPost.imageUrl && (
                  <img
                    src={originalPost.imageUrl}
                    alt="Original post image"
                    className="tweet-image"
                    onError={(e) => {
                      e.target.style.display = 'none'; // Hide broken image icon
                      console.error("Failed to load original post image:", originalPost.imageUrl);
                    }}
                  />
                )}
                {isContentTruncated && ( // Display subscribe message if truncated
                   <div className="subscribe-to-unlock-message">
                     <button type="button" className="subscribe-button">Subscribe to unlock</button>
                   </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="tweet-content">
            {/* Display truncated or full content */}
            {displayContent}
            {/* Conditionally render image based on truncation */}
            {displayImageUrl && (
              <img
                src={imageUrl}
                alt="Post image"
                className="tweet-image"
                onError={(e) => {
                  e.target.style.display = 'none'; // Hide broken image icon
                  console.error("Failed to load post image:", imageUrl);
                }}
              />
            )}
            {isContentTruncated && ( // Display subscribe message if truncated
              <div className="subscribe-to-unlock-message">
                <button type="button" className="subscribe-button">Subscribe to unlock</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

Tweet.propTypes = {
  tweet: PropTypes.shape({
    user: PropTypes.string,
    createdAt: PropTypes.string,
    content: PropTypes.string,
    imageUrl: PropTypes.string, // Add imageUrl propType
    isRetweet: PropTypes.bool,
    originalPost: PropTypes.object,
    isSubscribersOnly: PropTypes.bool,
    isContentTruncated: PropTypes.bool,
  }),
};

export default Tweet;
