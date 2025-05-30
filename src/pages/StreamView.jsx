import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useStreaming } from '../hooks/useStreaming';
import VideoPlayer from '../components/stream/VideoPlayer';
import StreamControls from '../components/stream/StreamControls';
import QualitySelector from '../components/stream/QualitySelector';
import ChatContainer from '../components/chat/ChatContainer';
import Loading from '../components/common/Loading';
import { streamingAPI } from '../services/streaming';
import { formatViewCount, formatDuration } from '../utils/formatters';

const StreamView = () => {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const { joinStream, leaveStream, isStreamActive } = useStreaming();

  // Stream state
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQuality] = useState('auto');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Chat state
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [isSlowMode, setIsSlowMode] = useState(false);

  // Fetch stream data
  const fetchStreamData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await streamingAPI.getStream(streamId);
      
      if (response.success) {
        setStream(response.data.stream);
        setViewCount(response.data.viewCount || 0);
        setIsFollowing(response.data.isFollowing || false);
        
        // Join the stream room
        if (socket && connected) {
          await joinStream(streamId);
        }
      } else {
        setError(response.message || 'Stream not found');
      }
    } catch (err) {
      console.error('Error fetching stream:', err);
      setError('Failed to load stream');
    } finally {
      setIsLoading(false);
    }
  }, [streamId, socket, connected, joinStream]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !connected) return;

    const handleViewerJoined = (data) => {
      setViewCount(prev => prev + 1);
    };

    const handleViewerLeft = (data) => {
      setViewCount(prev => Math.max(0, prev - 1));
    };

    const handleStreamEnded = () => {
      setError('Stream has ended');
      setTimeout(() => navigate('/'), 3000);
    };

    const handleChatMessage = (message) => {
      setChatMessages(prev => [...prev, message]);
    };

    const handleSlowModeToggle = (enabled) => {
      setIsSlowMode(enabled);
    };

    socket.on('viewer:joined', handleViewerJoined);
    socket.on('viewer:left', handleViewerLeft);
    socket.on('stream:ended', handleStreamEnded);
    socket.on('chat:message', handleChatMessage);
    socket.on('chat:slow-mode', handleSlowModeToggle);

    return () => {
      socket.off('viewer:joined', handleViewerJoined);
      socket.off('viewer:left', handleViewerLeft);
      socket.off('stream:ended', handleStreamEnded);
      socket.off('chat:message', handleChatMessage);
      socket.off('chat:slow-mode', handleSlowModeToggle);
    };
  }, [socket, connected, navigate]);

  // Initialize stream
  useEffect(() => {
    if (streamId) {
      fetchStreamData();
    }

    // Cleanup on unmount
    return () => {
      if (socket && connected && streamId) {
        leaveStream(streamId);
      }
    };
  }, [streamId, fetchStreamData, socket, connected, leaveStream]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!user || !stream) return;

    try {
      const response = isFollowing 
        ? await streamingAPI.unfollowStreamer(stream.streamerId)
        : await streamingAPI.followStreamer(stream.streamerId);

      if (response.success) {
        setIsFollowing(!isFollowing);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  // Handle quality change
  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
  };

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle volume controls
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  // Handle chat toggle
  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="stream-view loading">
        <Loading message="Loading stream..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="stream-view error">
        <div className="error-container">
          <h2>Stream Unavailable</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Stream not found
  if (!stream) {
    return (
      <div className="stream-view error">
        <div className="error-container">
          <h2>Stream Not Found</h2>
          <p>The stream you're looking for doesn't exist or is no longer available.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`stream-view ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="stream-content">
        {/* Video Player Section */}
        <div className="video-section">
          <div className="video-container">
            <VideoPlayer
              streamUrl={stream.streamUrl}
              posterUrl={stream.thumbnail}
              quality={quality}
              volume={volume}
              isMuted={isMuted}
              isFullscreen={isFullscreen}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
              onFullscreenToggle={handleFullscreenToggle}
            />
            
            {/* Stream Controls Overlay */}
            <StreamControls
              isPlaying={isStreamActive(streamId)}
              volume={volume}
              isMuted={isMuted}
              isFullscreen={isFullscreen}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
              onFullscreenToggle={handleFullscreenToggle}
            />
          </div>

          {/* Quality Selector */}
          <QualitySelector
            currentQuality={quality}
            availableQualities={stream.qualities || ['auto', '1080p', '720p', '480p']}
            onQualityChange={handleQualityChange}
          />
        </div>

        {/* Stream Info Section */}
        <div className="stream-info">
          <div className="stream-header">
            <div className="stream-details">
              <h1 className="stream-title">{stream.title}</h1>
              <div className="stream-meta">
                <span className="streamer-name">{stream.streamerName}</span>
                <span className="category">{stream.category}</span>
                <span className="viewer-count">
                  {formatViewCount(viewCount)} viewers
                </span>
                {duration > 0 && (
                  <span className="duration">
                    {formatDuration(duration)}
                  </span>
                )}
              </div>
            </div>

            <div className="stream-actions">
              {user && user.id !== stream.streamerId && (
                <button
                  onClick={handleFollowToggle}
                  className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              
              <button
                onClick={toggleChat}
                className="btn btn-outline chat-toggle"
              >
                {isChatVisible ? 'Hide Chat' : 'Show Chat'}
              </button>
            </div>
          </div>

          {stream.description && (
            <div className="stream-description">
              <p>{stream.description}</p>
            </div>
          )}

          {stream.tags && stream.tags.length > 0 && (
            <div className="stream-tags">
              {stream.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      {isChatVisible && (
        <div className="chat-section">
          <ChatContainer
            streamId={streamId}
            messages={chatMessages}
            isSlowMode={isSlowMode}
            disabled={!user}
          />
        </div>
      )}
    </div>
  );
};

export default StreamView;