import PropTypes from 'prop-types';
import { useState } from 'react';
import Avatar from './Avatar';
import './ComposeForm.css';
import { useMutation } from '@apollo/client';
import { CREATE_POST } from '../mut';

function ComposeForm({ onSubmit, currentUserId, currentUserType }) {
  const [editorValue, setEditorValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // State for selected File object
  const [imagePreview, setImagePreview] = useState(null); // State for image preview data URL
  const [isSubscribersOnly, setIsSubscribersOnly] = useState(false);
  const [createPost] = useMutation(CREATE_POST);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // This will be a data URL (Base64)
      };
      reader.readAsDataURL(file); // Read file as Base64
    } else {
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editorValue.trim() && !selectedFile) { // Allow empty content if there's an image
      console.warn('Post content or image must not be empty.');
      return;
    }
    if (!currentUserId) {
      console.error('No current user selected. Cannot create post.');
      return;
    }

    try {
      const { data } = await createPost({
        variables: {
          content: editorValue,
          imageData: imagePreview, // Send Base64 string as imageData
          userId: currentUserId,
          isSubscribersOnly: isSubscribersOnly
        }
      });
      onSubmit(data.createPost);
      setEditorValue('');
      setSelectedFile(null); // Clear selected file
      setImagePreview(null); // Clear image preview
      setIsSubscribersOnly(false);
    } catch (error) {
      console.error('Error creating post:', error.message);
    }
  };

  return (
    <form className="compose-form" onSubmit={handleSubmit}>
      <div className="compose-form-container">
        <Avatar name={currentUserType === 'premium' ? 'P' : 'N'} />
        <textarea
          value={editorValue}
          onChange={(e) => setEditorValue(e.target.value)}
          className="compose-form-textarea"
          placeholder="What's happening?"
        />
      </div>
      <div className="compose-form-image-input">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="compose-form-file-input"
        />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="compose-form-image-preview" />
        )}
      </div>
      {currentUserType === 'premium' && (
        <div className="compose-form-options">
          <input
            type="checkbox"
            id="subscribers-only"
            checked={isSubscribersOnly}
            onChange={(e) => setIsSubscribersOnly(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="subscribers-only" className="text-gray-700 text-sm">
            Subscribers Only
          </label>
        </div>
      )}
      <button type="submit" className="compose-form-submit">Tweet</button>
    </form>
  );
}

ComposeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  currentUserId: PropTypes.string,
  currentUserType: PropTypes.string,
};

export default ComposeForm;
