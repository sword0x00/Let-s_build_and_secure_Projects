import PropTypes from 'prop-types';
import './Avatar.css';

function Avatar({ name = '', imageUrl }) {
  return (
    <div className="avatar">
      {imageUrl ? (
        <img src={imageUrl} alt={name.charAt(0)} className="avatar-image" />
      ) : (
        name.charAt(0)
      )}
    </div>
  );
}

Avatar.propTypes = {
  name: PropTypes.string,
  imageUrl: PropTypes.string,
};

export default Avatar;
