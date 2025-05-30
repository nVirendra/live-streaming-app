import React, { useState, useEffect, useCallback } from 'react';
import { useAuthActions } from '../../hooks/useAuth';

const StreamSettings = ({
  config,
  onChange,
  onSave,
  isLive = false,
  onUpdateLive = null
}) => {
  const { user } = useAuthActions();
  
  // Local state for settings
  const [localConfig, setLocalConfig] = useState(config);
  const [activeTab, setActiveTab] = useState('general');
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Stream quality options
  const qualityOptions = [
    { value: 'auto', label: 'Auto (Adaptive)', bitrate: 'Variable' },
    { value: '1080p60', label: '1080p 60fps', bitrate: '6000 kbps' },
    { value: '1080p30', label: '1080p 30fps', bitrate: '4500 kbps' },
    { value: '720p60', label: '720p 60fps', bitrate: '4000 kbps' },
    { value: '720p30', label: '720p 30fps', bitrate: '2500 kbps' },
    { value: '480p30', label: '480p 30fps', bitrate: '1000 kbps' }
  ];

  // Chat moderation options
  const moderationOptions = [
    { key: 'slowMode', label: 'Slow Mode', description: 'Limit chat messages to one per 30 seconds' },
    { key: 'subscribersOnly', label: 'Subscribers Only', description: 'Only subscribers can chat' },
    { key: 'followersOnly', label: 'Followers Only', description: 'Only followers can chat' },
    { key: 'emoteOnly', label: 'Emote Only', description: 'Only emotes allowed in chat' }
  ];

  // Privacy options
  const privacyOptions = [
    { key: 'isPrivate', label: 'Private Stream', description: 'Stream is unlisted and not discoverable' },
    { key: 'allowRecording', label: 'Allow Recording', description: 'Viewers can record/clip your stream' },
    { key: 'allowEmbeds', label: 'Allow Embeds', description: 'Stream can be embedded on other websites' },
    { key: 'requireAuth', label: 'Require Login', description: 'Only logged-in users can watch' }
  ];

  // Notification options
  const notificationOptions = [
    { key: 'notifyFollowers', label: 'Notify Followers', description: 'Send notification when going live' },
    { key: 'notifySubscribers', label: 'Notify Subscribers', description: 'Send push notification to subscribers' },
    { key: 'socialMediaPost', label: 'Social Media', description: 'Auto-post to connected social accounts' }
  ];

  // Update local config when prop changes
  useEffect(() => {
    setLocalConfig(config);
    setIsDirty(false);
  }, [config]);

  // Handle input changes
  const handleChange = useCallback((field, value) => {
    setLocalConfig(prev => {
      const updated = { ...prev, [field]: value };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(config));
      return updated;
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [config, errors]);

  // Handle nested object changes
  const handleNestedChange = useCallback((parent, field, value) => {
    setLocalConfig(prev => {
      const updated = {
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value
        }
      };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(config));
      return updated;
    });
  }, [config]);

  // Validate settings
  const validateSettings = useCallback(() => {
    const newErrors = {};

    // Validate title
    if (!localConfig.title?.trim()) {
      newErrors.title = 'Stream title is required';
    } else if (localConfig.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (localConfig.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Validate category
    if (!localConfig.category) {
      newErrors.category = 'Category is required';
    }

    // Validate description
    if (localConfig.description && localConfig.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Validate tags
    if (localConfig.tags && localConfig.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [localConfig]);

  // Save settings
  const handleSave = async () => {
    if (!validateSettings()) return;

    setIsUpdating(true);
    try {
      if (isLive && onUpdateLive) {
        // Update live stream settings (only certain fields can be updated)
        const liveUpdates = {
          title: localConfig.title,
          description: localConfig.description,
          slowModeEnabled: localConfig.slowModeEnabled,
          subscribersOnly: localConfig.subscribersOnly,
          followersOnly: localConfig.followersOnly,
          emoteOnly: localConfig.emoteOnly
        };
        await onUpdateLive(liveUpdates);
      } else {
        // Update all settings
        onChange(localConfig);
      }
      
      setIsDirty(false);
      onSave();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset to original settings
  const handleReset = () => {
    setLocalConfig(config);
    setIsDirty(false);
    setErrors({});
  };

  // Tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-section">
            <h3>General Settings</h3>
            
            {/* Stream Title */}
            <div className="form-group">
              <label htmlFor="title">
                Stream Title <span className="required">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={localConfig.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className={errors.title ? 'error' : ''}
                maxLength={100}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
              <div className="char-count">{(localConfig.title || '').length}/100</div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                value={localConfig.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                className={errors.category ? 'error' : ''}
                disabled={isLive}
              >
                <option value="">Select a category...</option>
                <option value="Gaming">Gaming</option>
                <option value="Just Chatting">Just Chatting</option>
                <option value="Music">Music</option>
                <option value="Art">Art</option>
                <option value="Technology">Technology</option>
                <option value="Education">Education</option>
                <option value="Sports">Sports</option>
                <option value="Cooking">Cooking</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
              {isLive && <div className="form-help">Category cannot be changed while live</div>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={localConfig.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your stream..."
                rows={4}
                maxLength={500}
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
              <div className="char-count">{(localConfig.description || '').length}/500</div>
            </div>

            {/* Language */}
            <div className="form-group">
              <label htmlFor="language">Stream Language</label>
              <select
                id="language"
                value={localConfig.language || 'en'}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          </div>
        );

      case 'quality':
        return (
          <div className="settings-section">
            <h3>Stream Quality</h3>
            
            {/* Quality Preset */}
            <div className="form-group">
              <label>Quality Preset</label>
              <div className="quality-options">
                {qualityOptions.map(option => (
                  <div key={option.value} className="quality-option">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="quality"
                        value={option.value}
                        checked={localConfig.quality === option.value}
                        onChange={(e) => handleChange('quality', e.target.value)}
                        disabled={isLive}
                      />
                      <span className="radio-custom"></span>
                      <div className="quality-info">
                        <span className="quality-label">{option.label}</span>
                        <span className="quality-bitrate">{option.bitrate}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              {isLive && <div className="form-help">Quality cannot be changed while live</div>}
            </div>

            {/* Advanced Quality Settings */}
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={localConfig.enableAdaptiveQuality || false}
                  onChange={(e) => handleChange('enableAdaptiveQuality', e.target.checked)}
                  disabled={isLive}
                />
                <span className="checkbox-custom"></span>
                Enable Adaptive Quality
              </label>
              <div className="form-help">
                Automatically adjust quality based on viewer connection speed
              </div>
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="settings-section">
            <h3>Chat & Moderation</h3>
            
            {/* Chat Enabled */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localConfig.chatEnabled !== false}
                  onChange={(e) => handleChange('chatEnabled', e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                Enable Chat
              </label>
            </div>

            {/* Moderation Options */}
            {localConfig.chatEnabled !== false && (
              <div className="moderation-options">
                {moderationOptions.map(option => (
                  <div key={option.key} className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={localConfig[option.key] || false}
                        onChange={(e) => handleChange(option.key, e.target.checked)}
                      />
                      <span className="checkbox-custom"></span>
                      <div className="option-info">
                        <span className="option-label">{option.label}</span>
                        <span className="option-description">{option.description}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Chat Commands */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localConfig.enableChatCommands !== false}
                  onChange={(e) => handleChange('enableChatCommands', e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                Enable Chat Commands
              </label>
              <div className="form-help">
                Allow moderators to use chat commands for moderation
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="settings-section">
            <h3>Privacy & Security</h3>
            
            {privacyOptions.map(option => (
              <div key={option.key} className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={localConfig[option.key] || false}
                    onChange={(e) => handleChange(option.key, e.target.checked)}
                    disabled={isLive && option.key === 'isPrivate'}
                  />
                  <span className="checkbox-custom"></span>
                  <div className="option-info">
                    <span className="option-label">{option.label}</span>
                    <span className="option-description">{option.description}</span>
                  </div>
                </label>
                {isLive && option.key === 'isPrivate' && (
                  <div className="form-help">Privacy mode cannot be changed while live</div>
                )}
              </div>
            ))}

            {/* Mature Content */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localConfig.matureContent || false}
                  onChange={(e) => handleChange('matureContent', e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                <div className="option-info">
                  <span className="option-label">Mature Content</span>
                  <span className="option-description">Stream contains mature content (18+)</span>
                </div>
              </label>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-section">
            <h3>Notifications</h3>
            
            {notificationOptions.map(option => (
              <div key={option.key} className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={localConfig[option.key] || false}
                    onChange={(e) => handleChange(option.key, e.target.checked)}
                  />
                  <span className="checkbox-custom"></span>
                  <div className="option-info">
                    <span className="option-label">{option.label}</span>
                    <span className="option-description">{option.description}</span>
                  </div>
                </label>
              </div>
            ))}

            {/* Custom notification message */}
            <div className="form-group">
              <label htmlFor="notificationMessage">Custom Notification Message</label>
              <textarea
                id="notificationMessage"
                value={localConfig.notificationMessage || ''}
                onChange={(e) => handleChange('notificationMessage', e.target.value)}
                placeholder="Custom message for go-live notifications..."
                rows={3}
                maxLength={280}
              />
              <div className="char-count">{(localConfig.notificationMessage || '').length}/280</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="stream-settings">
      {/* Settings Tabs */}
      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`tab ${activeTab === 'quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality')}
        >
          Quality
        </button>
        <button
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          Privacy
        </button>
        <button
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        {renderTabContent()}
      </div>

      {/* Settings Footer */}
      <div className="settings-footer">
        <div className="footer-left">
          {isDirty && (
            <span className="unsaved-changes">
              ⚠️ You have unsaved changes
            </span>
          )}
        </div>
        
        <div className="footer-actions">
          <button
            onClick={handleReset}
            className="btn btn-outline"
            disabled={!isDirty || isUpdating}
          >
            Reset
          </button>
          
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={!isDirty || isUpdating || Object.keys(errors).length > 0}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamSettings;