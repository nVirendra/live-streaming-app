export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const STREAM_QUALITY = {
  LOW: '480p',
  MEDIUM: '720p',
  HIGH: '1080p'
};

export const STREAM_STATUS = {
  OFFLINE: 'offline',
  LIVE: 'live',
  STARTING: 'starting',
  ENDING: 'ending'
};