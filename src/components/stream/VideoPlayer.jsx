import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/sea/index.css';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';

const VideoPlayer = ({ 
  src, 
  poster, 
  autoplay = true,
  muted = false,
  onReady,
  onPlay,
  onPause,
  onError,
  className = ""
}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = videoRef.current;

      const player = videojs(videoElement, {
        autoplay,
        controls: false,
        responsive: true,
        fluid: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        html5: {
          hls: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            overrideNative: true
          },
          vhs: {
            overrideNative: true
          }
        },
        sources: [{
          src,
          type: 'application/x-mpegURL'
        }],
        poster
      });

      playerRef.current = player;

      // Event listeners
      player.on('ready', () => {
        console.log('Player is ready');
        onReady?.(player);
      });

      player.on('play', () => {
        setIsPlaying(true);
        onPlay?.(player);
      });

      player.on('pause', () => {
        setIsPlaying(false);
        onPause?.(player);
      });

      player.on('error', (error) => {
        console.error('Video player error:', error);
        onError?.(error);
      });

      player.on('fullscreenchange', () => {
        setIsFullscreen(player.isFullscreen());
      });

      player.on('volumechange', () => {
        setIsMuted(player.muted());
      });

      // Auto-hide controls
      let controlsTimeout;
      const hideControls = () => {
        controlsTimeout = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      };

      const showControlsHandler = () => {
        setShowControls(true);
        clearTimeout(controlsTimeout);
        hideControls();
      };

      videoElement.addEventListener('mousemove', showControlsHandler);
      videoElement.addEventListener('touchstart', showControlsHandler);

      if (autoplay) {
        hideControls();
      }

      return () => {
        videoElement.removeEventListener('mousemove', showControlsHandler);
        videoElement.removeEventListener('touchstart', showControlsHandler);
        clearTimeout(controlsTimeout);
      };
    }
  }, [src, autoplay, muted, onReady, onPlay, onPause, onError, poster]);

  useEffect(() => {
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      playerRef.current.muted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (playerRef.current) {
      if (isFullscreen) {
        playerRef.current.exitFullscreen();
      } else {
        playerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className={`relative bg-black ${className}`}>
      <div data-vjs-player>
        <video 
          ref={videoRef}
          className="video-js vjs-theme-sea vjs-big-play-centered w-full h-full"
          playsInline
        />
      </div>

      {/* Custom Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 flex flex-col justify-between p-4 pointer-events-none">
          {/* Top Controls */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <div className="bg-red-600 px-2 py-1 rounded text-xs font-bold flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                LIVE
              </div>
            </div>
          </div>

          {/* Center Play Button */}
          <div className="flex justify-center items-center">
            <button
              onClick={togglePlay}
              className="bg-black/50 hover:bg-black/70 rounded-full p-4 transition-all pointer-events-auto"
            >
              {isPlaying ? (
                <PauseIcon className="w-8 h-8 text-white" />
              ) : (
                <PlayIcon className="w-8 h-8 text-white ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="flex justify-between items-end">
            <div className="flex space-x-2 pointer-events-auto">
              <button
                onClick={toggleMute}
                className="bg-black/50 hover:bg-black/70 rounded p-2 transition-all"
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="w-5 h-5 text-white" />
                ) : (
                  <SpeakerWaveIcon className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            <div className="flex space-x-2 pointer-events-auto">
              <button
                onClick={toggleFullscreen}
                className="bg-black/50 hover:bg-black/70 rounded p-2 transition-all"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;