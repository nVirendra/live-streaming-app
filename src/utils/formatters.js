/**
 * Format viewer count with appropriate suffixes (K, M, B)
 * @param {number} count - The viewer count to format
 * @returns {string} Formatted viewer count string
 */
export const formatViewerCount = (count) => {
  if (!count || count < 0) return '0';
  
  if (count < 1000) {
    return count.toString();
  }
  
  if (count < 1000000) {
    const thousands = count / 1000;
    return thousands % 1 === 0 
      ? `${thousands}K` 
      : `${thousands.toFixed(1)}K`;
  }
  
  if (count < 1000000000) {
    const millions = count / 1000000;
    return millions % 1 === 0 
      ? `${millions}M` 
      : `${millions.toFixed(1)}M`;
  }
  
  const billions = count / 1000000000;
  return billions % 1 === 0 
    ? `${billions}B` 
    : `${billions.toFixed(1)}B`;
};

/**
 * Format duration from milliseconds to human readable format
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0:00';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format stream uptime from start date
 * @param {string|Date} startDate - The start date of the stream
 * @returns {string} Formatted uptime string
 */
export const formatUptime = (startDate) => {
  if (!startDate) return '0:00';
  
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now - start;
  
  if (diffMs < 0) return '0:00';
  
  return formatDuration(diffMs);
};

/**
 * Format relative time (e.g., "2 hours ago", "just now")
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  
  if (diffMs < 0) return 'in the future';
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format bitrate for streaming
 * @param {number} bps - Bitrate in bits per second
 * @returns {string} Formatted bitrate string
 */
export const formatBitrate = (bps) => {
  if (!bps || bps === 0) return '0 bps';
  
  if (bps < 1000) return `${bps} bps`;
  if (bps < 1000000) return `${(bps / 1000).toFixed(1)} Kbps`;
  
  return `${(bps / 1000000).toFixed(1)} Mbps`;
};

/**
 * Format currency with appropriate symbols
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (e.g., 'USD', 'EUR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return '$0.00';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Format percentage with optional decimal places
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (!value && value !== 0) return '0%';
  
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format username with proper capitalization and length limits
 * @param {string} username - Username to format
 * @param {number} maxLength - Maximum length (default: 20)
 * @returns {string} Formatted username
 */
export const formatUsername = (username, maxLength = 20) => {
  if (!username) return 'Anonymous';
  
  let formatted = username.trim();
  
  if (formatted.length > maxLength) {
    formatted = formatted.substring(0, maxLength - 3) + '...';
  }
  
  return formatted;
};

/**
 * Format stream title with proper length limits
 * @param {string} title - Stream title to format
 * @param {number} maxLength - Maximum length (default: 50)
 * @returns {string} Formatted stream title
 */
export const formatStreamTitle = (title, maxLength = 50) => {
  if (!title) return 'Untitled Stream';
  
  let formatted = title.trim();
  
  if (formatted.length > maxLength) {
    formatted = formatted.substring(0, maxLength - 3) + '...';
  }
  
  return formatted;
};

/**
 * Format date for display in different formats
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time', 'datetime')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'Unknown';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };
  
  try {
    return new Intl.DateTimeFormat('en-US', options[format] || options.short).format(dateObj);
  } catch (error) {
    return dateObj.toLocaleDateString();
  }
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Format quality label for video streams
 * @param {string|number} quality - Quality identifier
 * @returns {string} Formatted quality label
 */
export const formatQuality = (quality) => {
  if (!quality) return 'Auto';
  
  const qualityMap = {
    '240': '240p',
    '360': '360p',
    '480': '480p SD',
    '720': '720p HD',
    '1080': '1080p FHD',
    '1440': '1440p QHD',
    '2160': '4K UHD',
    'auto': 'Auto',
    'source': 'Source'
  };
  
  return qualityMap[quality.toString()] || `${quality}p`;
};

/**
 * Format network latency
 * @param {number} latency - Latency in milliseconds
 * @returns {string} Formatted latency string with status
 */
export const formatLatency = (latency) => {
  if (!latency && latency !== 0) return 'Unknown';
  
  let status = '';
  if (latency < 50) status = ' (Excellent)';
  else if (latency < 100) status = ' (Good)';
  else if (latency < 200) status = ' (Fair)';
  else status = ' (Poor)';
  
  return `${latency}ms${status}`;
};

/**
 * Format FPS (frames per second)
 * @param {number} fps - Frames per second
 * @returns {string} Formatted FPS string
 */
export const formatFPS = (fps) => {
  if (!fps && fps !== 0) return '0 FPS';
  
  return `${Math.round(fps)} FPS`;
};

/**
 * Format resolution
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @returns {string} Formatted resolution string
 */
export const formatResolution = (width, height) => {
  if (!width || !height) return 'Unknown';
  
  return `${width}×${height}`;
};