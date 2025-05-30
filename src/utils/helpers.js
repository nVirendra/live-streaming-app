/**
 * Token management utilities
 */

const TOKEN_KEY = 'token';
const USER_KEY = 'user_data';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Get authentication token from localStorage
 * @returns {string|null} The stored token or null if not found
 */
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to get token from localStorage:', error);
    return null;
  }
};

/**
 * Set authentication token in localStorage
 * @param {string} token - The token to store
 * @returns {boolean} True if successful, false otherwise
 */
export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Failed to set token in localStorage:', error);
    return false;
  }
};

/**
 * Remove authentication token from localStorage
 * @returns {boolean} True if successful, false otherwise
 */
export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    return true;
  } catch (error) {
    console.warn('Failed to remove token from localStorage:', error);
    return false;
  }
};

/**
 * Get refresh token from localStorage
 * @returns {string|null} The stored refresh token or null if not found
 */
export const getRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to get refresh token from localStorage:', error);
    return null;
  }
};

/**
 * Set refresh token in localStorage
 * @param {string} token - The refresh token to store
 * @returns {boolean} True if successful, false otherwise
 */
export const setRefreshToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Failed to set refresh token in localStorage:', error);
    return false;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token && !isTokenExpired(token);
};

/**
 * Check if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.warn('Failed to parse token:', error);
    return true;
  }
};

/**
 * Get user data from localStorage
 * @returns {Object|null} The stored user data or null
 */
export const getUserData = () => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.warn('Failed to get user data from localStorage:', error);
    return null;
  }
};

/**
 * Set user data in localStorage
 * @param {Object} userData - The user data to store
 * @returns {boolean} True if successful, false otherwise
 */
export const setUserData = (userData) => {
  try {
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Failed to set user data in localStorage:', error);
    return false;
  }
};

/**
 * URL and routing utilities
 */

/**
 * Generate a safe URL slug from a string
 * @param {string} text - The text to convert to a slug
 * @returns {string} URL-safe slug
 */
export const generateSlug = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Parse URL parameters
 * @param {string} url - The URL to parse (optional, uses current URL if not provided)
 * @returns {Object} Object containing URL parameters
 */
export const parseUrlParams = (url = window.location.search) => {
  const params = new URLSearchParams(url);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
};

/**
 * Build URL with parameters
 * @param {string} baseUrl - The base URL
 * @param {Object} params - Object containing parameters
 * @returns {string} Complete URL with parameters
 */
export const buildUrlWithParams = (baseUrl, params) => {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  
  const url = new URL(baseUrl, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    }
  });
  
  return url.toString();
};

/**
 * Data validation utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {boolean} True if username is valid
 */
export const isValidUsername = (username) => {
  // Username should be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validate stream title
 * @param {string} title - Stream title to validate
 * @returns {boolean} True if title is valid
 */
export const isValidStreamTitle = (title) => {
  return title && title.trim().length >= 3 && title.trim().length <= 100;
};

/**
 * Array and object utilities
 */

/**
 * Deep clone an object or array
 * @param {any} obj - Object to clone
 * @returns {any} Deep cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
};

/**
 * Remove duplicates from array
 * @param {Array} array - Array with potential duplicates
 * @param {string} key - Key to use for comparison (for objects)
 * @returns {Array} Array without duplicates
 */
export const removeDuplicates = (array, key = null) => {
  if (!Array.isArray(array)) return [];
  
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }
  
  return [...new Set(array)];
};

/**
 * Sort array of objects by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortByKey = (array, key, direction = 'asc') => {
  if (!Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * String utilities
 */

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert camelCase to kebab-case
 * @param {string} str - String to convert
 * @returns {string} kebab-case string
 */
export const camelToKebab = (str) => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Convert kebab-case to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 */
export const kebabToCamel = (str) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Generate random string
 * @param {number} length - Length of the string
 * @param {string} charset - Character set to use
 * @returns {string} Random string
 */
export const generateRandomString = (length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

/**
 * Browser and device utilities
 */

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Check if browser supports WebRTC
 * @returns {boolean} True if WebRTC is supported
 */
export const supportsWebRTC = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Check if browser supports fullscreen API
 * @returns {boolean} True if fullscreen is supported
 */
export const supportsFullscreen = () => {
  return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.warn('Failed to copy text to clipboard:', err);
    return false;
  }
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Download file from URL
 * @param {string} url - File URL
 * @param {string} filename - Filename for download
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format error message for display
 * @param {Error|string} error - Error object or message
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  
  if (error && error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Storage utilities with error handling
 */

/**
 * Safe localStorage setItem
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} True if successful
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Failed to set storage item:', error);
    return false;
  }
};

/**
 * Safe localStorage getItem
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Stored value or default
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to get storage item:', error);
    return defaultValue;
  }
};

/**
 * Safe localStorage removeItem
 * @param {string} key - Storage key
 * @returns {boolean} True if successful
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Failed to remove storage item:', error);
    return false;
  }
};