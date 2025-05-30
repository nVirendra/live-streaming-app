import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { useStreaming } from '../hooks/useStreaming';
import BroadcastSetup from '../components/broadcast/BroadcastSetup';
import StreamSettings from '../components/broadcast/StreamSettings';
import GoLiveButton from '../components/broadcast/GoLiveButton';
import ChatContainer from '../components/chat/ChatContainer';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import { streamingAPI } from '../services/streaming';
import { formatDuration } from '../utils/formatters';

const Broadcast = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket, connected } = useSocket();
  const { 
    startBroadcast, 
    stopBroadcast, 
    isStreaming, 
    streamData,
    streamStats 
  } = useStreaming();

  // Stream state
  const [isLive, setIsLive] = useState(false);
  const [streamId, setStreamId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [streamKey, setStreamKey] = useState('');

  // Stream configuration
  const [streamConfig, setStreamConfig] = useState({
    title: '',
    description: '',
    category: '',
    tags: [],
    thumbnail: null,
    isPrivate: false,
    allowRecording: true,
    chatEnabled: true,
    slowModeEnabled: false,
    subscribersOnly: false
  });

  // Stream stats
  const [viewerCount, setViewerCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [streamStartTime, setStreamStartTime] = useState(null);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showEndStreamModal, setShowEndStreamModal] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [previewEnabled, setPreviewEnabled] = useState(false);

  // Refs
  const previewVideoRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/broadcast' } });
      return;
    }
  }, [isAuthenticated, navigate]);

  // Initialize stream key and URL
  useEffect(() => {
    const initializeBroadcast = async () => {
      try {
        const response = await streamingAPI.getBroadcastConfig();
        if (response.success) {
          setStreamUrl(response.data.streamUrl);
          setStreamKey(response.data.streamKey);
        }
      } catch (err) {
        console.error('Error initializing broadcast:', err);
        setError('Failed to initialize broadcast settings');
      }
    };

    if (user) {
      initializeBroadcast();
    }
  }, [user]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !connected || !isLive) return;

    const handleViewerJoined = () => {
      setViewerCount(prev => prev + 1);
    };

    const handleViewerLeft = () => {
      setViewerCount(prev => Math.max(0, prev - 1));
    };

    const handleChatMessage = (message) => {
      setChatMessages(prev => [...prev, message]);
    };

    const handleStreamError = (error) => {
      setError(error.message);
      handleStopStream();
    };

    socket.on('viewer:joined', handleViewerJoined);
    socket.on('viewer:left', handleViewerLeft);
    socket.on('chat:message', handleChatMessage);
    socket.on('stream:error', handleStreamError);

    return () => {
      socket.off('viewer:joined', handleViewerJoined);
      socket.off('viewer:left', handleViewerLeft);
      socket.off('chat:message', handleChatMessage);
      socket.off('stream:error', handleStreamError);
    };
  }, [socket, connected, isLive]);

  // Duration timer
  useEffect(() => {
    if (isLive && streamStartTime) {
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - streamStartTime) / 1000));
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isLive, streamStartTime]);

  // Handle stream configuration change
  const handleConfigChange = useCallback((updates) => {
    setStreamConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Start streaming
  const handleStartStream = async () => {
    if (!streamConfig.title.trim()) {
      setError('Stream title is required');
      return;
    }

    if (!streamConfig.category) {
      setError('Stream category is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await startBroadcast(streamConfig);
      
      if (response.success) {
        setIsLive(true);
        setStreamId(response.data.streamId);
        setStreamStartTime(Date.now());
        setViewerCount(0);
        setDuration(0);
        setChatMessages([]);
      } else {
        setError(response.message || 'Failed to start stream');
      }
    } catch (err) {
      console.error('Error starting stream:', err);
      setError('Failed to start stream');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop streaming
  const handleStopStream = async () => {
    setIsLoading(true);

    try {
      if (streamId) {
        await stopBroadcast(streamId);
      }

      setIsLive(false);
      setStreamId(null);
      setStreamStartTime(null);
      setViewerCount(0);
      setDuration(0);
      setChatMessages([]);
      setShowEndStreamModal(false);
    } catch (err) {
      console.error('Error stopping stream:', err);
      setError('Failed to stop stream');
    } finally {
      setIsLoading(false);
    }
  };

  // Enable camera preview
  const enablePreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
        setPreviewEnabled(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  // Disable camera preview
  const disablePreview = () => {
    if (previewVideoRef.current && previewVideoRef.current.srcObject) {
      const tracks = previewVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      previewVideoRef.current.srcObject = null;
    }
    setPreviewEnabled(false);
  };

  // Toggle chat visibility
  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  // Update stream settings while live
  const updateLiveSettings = async (updates) => {
    if (!streamId) return;

    try {
      const response = await streamingAPI.updateStreamSettings(streamId, updates);
      if (response.success) {
        setStreamConfig(prev => ({ ...prev, ...updates }));
      }
    } catch (err) {
      console.error('Error updating stream settings:', err);
    }
  };

  if (!isAuthenticated) {
    return <Loading message="Checking authentication..." />;
  }

  return (
    <div className="broadcast-page">
      <div className="broadcast-container">
        {/* Header */}
        <div className="broadcast-header">
          <h1>
            {isLive ? (
              <span className="live-indicator">
                <span className="live-dot"></span>
                LIVE
              </span>
            ) : (
              'Go Live'
            )}
          </h1>
          
          {isLive && (
            <div className="stream-stats">
              <div className="stat">
                <span className="stat-label">Viewers:</span>
                <span className="stat-value">{viewerCount}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Duration:</span>
                <span className="stat-value">{formatDuration(duration)}</span>
              </div>
            </div>
          )}

          <div className="header-actions">
            {!isLive && (
              <button
                onClick={() => setShowSettings(true)}
                className="btn btn-outline"
              >
                Settings
              </button>
            )}
            
            {isLive && (
              <button
                onClick={toggleChat}
                className="btn btn-outline"
              >
                {isChatVisible ? 'Hide Chat' : 'Show Chat'}
              </button>
            )}
          </div>
        </div>

        <div className="broadcast-content">
          {/* Main Content */}
          <div className="broadcast-main">
            {!isLive ? (
              // Pre-stream setup
              <div className="pre-stream">
                <BroadcastSetup
                  config={streamConfig}
                  onChange={handleConfigChange}
                  streamUrl={streamUrl}
                  streamKey={streamKey}
                  onEnablePreview={enablePreview}
                  onDisablePreview={disablePreview}
                  previewEnabled={previewEnabled}
                />

                {/* Camera Preview */}
                <div className="preview-container">
                  <div className="preview-video">
                    <video
                      ref={previewVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className={previewEnabled ? 'active' : 'inactive'}
                    />
                    {!previewEnabled && (
                      <div className="preview-placeholder">
                        <p>Camera preview disabled</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>Dismiss</button>
                  </div>
                )}

                {/* Go Live Button */}
                <GoLiveButton
                  onStartStream={handleStartStream}
                  disabled={isLoading || !streamConfig.title.trim() || !streamConfig.category}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              // Live stream dashboard
              <div className="live-dashboard">
                <div className="stream-info">
                  <h2>{streamConfig.title}</h2>
                  <p className="stream-category">{streamConfig.category}</p>
                  {streamConfig.description && (
                    <p className="stream-description">{streamConfig.description}</p>
                  )}
                </div>

                <div className="stream-actions">
                  <button
                    onClick={() => setShowEndStreamModal(true)}
                    className="btn btn-danger"
                    disabled={isLoading}
                  >
                    End Stream
                  </button>
                </div>

                {/* Stream Preview/Monitor */}
                <div className="stream-monitor">
                  <div className="monitor-placeholder">
                    <p>Stream Monitor</p>
                    <p>Viewers can see your stream at:</p>
                    <code>/stream/{streamId}</code>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          {isLive && isChatVisible && (
            <div className="broadcast-chat">
              <ChatContainer
                streamId={streamId}
                messages={chatMessages}
                isSlowMode={streamConfig.slowModeEnabled}
                disabled={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Stream Settings Modal */}
      {showSettings && (
        <Modal
          title="Stream Settings"
          onClose={() => setShowSettings(false)}
          size="large"
        >
          <StreamSettings
            config={streamConfig}
            onChange={handleConfigChange}
            onSave={() => setShowSettings(false)}
            isLive={isLive}
            onUpdateLive={updateLiveSettings}
          />
        </Modal>
      )}

      {/* End Stream Confirmation Modal */}
      {showEndStreamModal && (
        <Modal
          title="End Stream"
          onClose={() => setShowEndStreamModal(false)}
        >
          <div className="end-stream-modal">
            <p>Are you sure you want to end your stream?</p>
            <p>Duration: {formatDuration(duration)}</p>
            <p>Peak viewers: {viewerCount}</p>
            
            <div className="modal-actions">
              <button
                onClick={() => setShowEndStreamModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleStopStream}
                className="btn btn-danger"
                disabled={isLoading}
              >
                {isLoading ? 'Ending...' : 'End Stream'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Broadcast;