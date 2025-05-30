import React, { useState, useRef, useCallback } from 'react';
import { useAuthActions } from '../../hooks/useAuth';

const BroadcastSetup = ({
  config,
  onChange,
  streamUrl,
  streamKey,
  onEnablePreview,
  onDisablePreview,
  previewEnabled = false
}) => {
  const { user } = useAuthActions();
  
  // Local state for form handling
  const [tagInput, setTagInput] = useState('');
  const [showStreamDetails, setShowStreamDetails] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [errors, setErrors] = useState({});
  
  // File input ref
  const thumbnailInputRef = useRef(null);
  
  // Common categories for streaming
  const categories = [
    'Gaming',
    'Just Chatting',
    'Music',
    'Art',
    'Technology',
    'Education',
    'Sports',
    'Cooking',
    'Travel',
    'Fitness',
    'Business',
    'Entertainment',
    'News',
    'Other'
  ];

  // Validation rules
  const validateField = useCallback((field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'Stream title is required';
        } else if (value.length < 3) {
          newErrors.title = 'Title must be at least 3 characters';
        } else if (value.length > 100) {
          newErrors.title = 'Title must be less than 100 characters';
        } else {
          delete newErrors.title;
        }
        break;
        
      case 'description':
        if (value.length > 500) {
          newErrors.description = 'Description must be less than 500 characters';
        } else {
          delete newErrors.description;
        }
        break;
        
      case 'category':
        if (!value) {
          newErrors.category = 'Category is required';
        } else {
          delete newErrors.category;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors]);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    onChange({ [field]: value });
    validateField(field, value);
  }, [onChange, validateField]);

  // Handle tag input
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Add tag
  const addTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !config.tags.includes(tag) && config.tags.length < 10) {
      onChange({ tags: [...config.tags, tag] });
      setTagInput('');
    }
  }, [tagInput, config.tags, onChange]);

  // Remove tag
  const removeTag = useCallback((tagToRemove) => {
    onChange({ tags: config.tags.filter(tag => tag !== tagToRemove) });
  }, [config.tags, onChange]);

  // Handle tag input key press
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, thumbnail: 'Please select an image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => ({ ...prev, thumbnail: 'Image must be less than 5MB' }));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Update config
    onChange({ thumbnail: file });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.thumbnail;
      return newErrors;
    });
  }, [onChange]);

  // Remove thumbnail
  const removeThumbnail = useCallback(() => {
    setThumbnailPreview(null);
    onChange({ thumbnail: null });
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  }, [onChange]);

  // Copy stream details to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="broadcast-setup">
      <div className="setup-header">
        <h2>Stream Setup</h2>
        <p>Configure your stream before going live</p>
      </div>

      <div className="setup-form">
        {/* Stream Title */}
        <div className="form-group">
          <label htmlFor="stream-title">
            Stream Title <span className="required">*</span>
          </label>
          <input
            id="stream-title"
            type="text"
            value={config.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter your stream title..."
            className={errors.title ? 'error' : ''}
            maxLength={100}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
          <div className="char-count">{config.title.length}/100</div>
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="stream-category">
            Category <span className="required">*</span>
          </label>
          <select
            id="stream-category"
            value={config.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={errors.category ? 'error' : ''}
          >
            <option value="">Select a category...</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="stream-description">Description</label>
          <textarea
            id="stream-description"
            value={config.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Tell viewers what your stream is about..."
            rows={3}
            maxLength={500}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
          <div className="char-count">{config.description.length}/500</div>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label htmlFor="stream-tags">Tags</label>
          <div className="tags-input-container">
            <div className="tags-display">
              {config.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="tag-input-wrapper">
              <input
                id="stream-tags"
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyPress={handleTagKeyPress}
                placeholder="Add tags..."
                disabled={config.tags.length >= 10}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim() || config.tags.length >= 10}
                className="add-tag-btn"
              >
                Add
              </button>
            </div>
          </div>
          <div className="form-help">
            Press Enter or comma to add tags. Maximum 10 tags. ({config.tags.length}/10)
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="form-group">
          <label>Stream Thumbnail</label>
          <div className="thumbnail-upload">
            {thumbnailPreview ? (
              <div className="thumbnail-preview">
                <img src={thumbnailPreview} alt="Thumbnail preview" />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="remove-thumbnail"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="thumbnail-placeholder">
                <span>📷</span>
                <p>Upload a thumbnail</p>
              </div>
            )}
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="thumbnail-input"
            />
          </div>
          {errors.thumbnail && <span className="error-text">{errors.thumbnail}</span>}
          <div className="form-help">
            Recommended: 1920x1080 (16:9). Max file size: 5MB
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="form-group">
          <label>Privacy & Settings</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.isPrivate}
                onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              Private Stream (Unlisted)
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.allowRecording}
                onChange={(e) => handleInputChange('allowRecording', e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              Allow Recording
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.chatEnabled}
                onChange={(e) => handleInputChange('chatEnabled', e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              Enable Chat
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.slowModeEnabled}
                onChange={(e) => handleInputChange('slowModeEnabled', e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              Enable Slow Mode
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.subscribersOnly}
                onChange={(e) => handleInputChange('subscribersOnly', e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              Subscribers Only
            </label>
          </div>
        </div>

        {/* Camera Preview Controls */}
        <div className="form-group">
          <label>Camera Preview</label>
          <div className="preview-controls">
            <button
              type="button"
              onClick={previewEnabled ? onDisablePreview : onEnablePreview}
              className={`btn ${previewEnabled ? 'btn-secondary' : 'btn-primary'}`}
            >
              {previewEnabled ? 'Disable Preview' : 'Enable Preview'}
            </button>
            <div className="form-help">
              Test your camera and microphone before going live
            </div>
          </div>
        </div>

        {/* Stream Details */}
        <div className="form-group">
          <button
            type="button"
            onClick={() => setShowStreamDetails(!showStreamDetails)}
            className="stream-details-toggle"
          >
            {showStreamDetails ? 'Hide' : 'Show'} Stream Details
            <span className={`arrow ${showStreamDetails ? 'up' : 'down'}`}>▼</span>
          </button>

          {showStreamDetails && (
            <div className="stream-details">
              <div className="detail-item">
                <label>Stream URL:</label>
                <div className="detail-value">
                  <code>{streamUrl}</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(streamUrl)}
                    className="copy-btn"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="detail-item">
                <label>Stream Key:</label>
                <div className="detail-value">
                  <code>{streamKey ? '•'.repeat(streamKey.length) : 'Loading...'}</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(streamKey)}
                    className="copy-btn"
                    title="Copy to clipboard"
                    disabled={!streamKey}
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="stream-details-help">
                <p>Use these details to configure your streaming software (OBS, XSplit, etc.)</p>
                <p><strong>Warning:</strong> Never share your stream key publicly!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BroadcastSetup;