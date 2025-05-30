import React, { useState, useEffect } from 'react';

const GoLiveButton = ({ 
  onStartStream, 
  disabled = false, 
  isLoading = false,
  requiresConfirmation = true 
}) => {
  // State for confirmation dialog and readiness checks
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [readinessChecks, setReadinessChecks] = useState({
    streamConfig: false,
    cameraAccess: false,
    microphoneAccess: false,
    networkConnection: true
  });

  // Countdown timer for "going live" animation
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && showConfirmation) {
      // Start the stream when countdown reaches 0
      handleConfirmStart();
    }
  }, [countdown, showConfirmation]);

  // Perform readiness checks
  useEffect(() => {
    const checkReadiness = async () => {
      const checks = { ...readinessChecks };

      // Check camera and microphone access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        checks.cameraAccess = true;
        checks.microphoneAccess = true;
        
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.warn('Media access check failed:', err);
        checks.cameraAccess = false;
        checks.microphoneAccess = false;
      }

      // Check network connection
      checks.networkConnection = navigator.onLine;

      setReadinessChecks(checks);
    };

    checkReadiness();

    // Listen for online/offline events
    const handleOnline = () => {
      setReadinessChecks(prev => ({ ...prev, networkConnection: true }));
    };

    const handleOffline = () => {
      setReadinessChecks(prev => ({ ...prev, networkConnection: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle button click
  const handleClick = () => {
    if (disabled || isLoading) return;

    if (requiresConfirmation) {
      setShowConfirmation(true);
    } else {
      onStartStream();
    }
  };

  // Handle confirmation and start countdown
  const handleConfirmWithCountdown = () => {
    setCountdown(3); // 3 second countdown
  };

  // Actually start the stream
  const handleConfirmStart = () => {
    setShowConfirmation(false);
    setCountdown(0);
    onStartStream();
  };

  // Cancel the confirmation
  const handleCancel = () => {
    setShowConfirmation(false);
    setCountdown(0);
  };

  // Check if all requirements are met
  const allChecksPass = Object.values(readinessChecks).every(check => check);
  const isReady = allChecksPass && !disabled;

  return (
    <div className="go-live-button-container">
      {/* Readiness Checks Display */}
      <div className="readiness-checks">
        <h3>Pre-Stream Checklist</h3>
        <div className="checks-list">
          <div className={`check-item ${readinessChecks.cameraAccess ? 'passed' : 'failed'}`}>
            <span className="check-icon">
              {readinessChecks.cameraAccess ? '✅' : '❌'}
            </span>
            <span className="check-label">Camera Access</span>
            {!readinessChecks.cameraAccess && (
              <span className="check-help">Grant camera permission</span>
            )}
          </div>

          <div className={`check-item ${readinessChecks.microphoneAccess ? 'passed' : 'failed'}`}>
            <span className="check-icon">
              {readinessChecks.microphoneAccess ? '✅' : '❌'}
            </span>
            <span className="check-label">Microphone Access</span>
            {!readinessChecks.microphoneAccess && (
              <span className="check-help">Grant microphone permission</span>
            )}
          </div>

          <div className={`check-item ${readinessChecks.networkConnection ? 'passed' : 'failed'}`}>
            <span className="check-icon">
              {readinessChecks.networkConnection ? '✅' : '❌'}
            </span>
            <span className="check-label">Network Connection</span>
            {!readinessChecks.networkConnection && (
              <span className="check-help">Check internet connection</span>
            )}
          </div>

          <div className={`check-item ${!disabled ? 'passed' : 'failed'}`}>
            <span className="check-icon">
              {!disabled ? '✅' : '❌'}
            </span>
            <span className="check-label">Stream Configuration</span>
            {disabled && (
              <span className="check-help">Complete title and category</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Go Live Button */}
      <div className="go-live-section">
        <button
          onClick={handleClick}
          disabled={!isReady || isLoading}
          className={`go-live-button ${isReady ? 'ready' : 'not-ready'} ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? (
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <span>Starting Stream...</span>
            </div>
          ) : (
            <div className="button-content">
              <div className="live-icon">🔴</div>
              <span className="button-text">Go Live</span>
            </div>
          )}
        </button>

        {!isReady && (
          <div className="not-ready-message">
            <p>Complete the checklist above to go live</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-header">
              <h2>Ready to Go Live?</h2>
              <p>Make sure everything looks good before starting your stream.</p>
            </div>

            <div className="confirmation-body">
              {countdown > 0 ? (
                <div className="countdown-display">
                  <div className="countdown-circle">
                    <span className="countdown-number">{countdown}</span>
                  </div>
                  <p>Going live in {countdown}...</p>
                  <button 
                    onClick={handleCancel}
                    className="btn btn-outline cancel-countdown"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="confirmation-actions">
                  <div className="final-checks">
                    <p>✅ Stream title and category set</p>
                    <p>✅ Camera and microphone ready</p>
                    <p>✅ You're about to go live!</p>
                  </div>

                  <div className="action-buttons">
                    <button
                      onClick={handleCancel}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmWithCountdown}
                      className="btn btn-primary confirm-live"
                    >
                      Start Stream
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="confirmation-footer">
              <p className="warning-text">
                ⚠️ Once live, your stream will be visible to viewers immediately
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="streaming-tips">
        <h4>Streaming Tips</h4>
        <ul>
          <li>Ensure stable internet connection (5+ Mbps upload recommended)</li>
          <li>Test your audio levels and lighting beforehand</li>
          <li>Have engaging content planned for your stream</li>
          <li>Interact with your chat to build community</li>
        </ul>
      </div>
    </div>
  );
};

export default GoLiveButton;