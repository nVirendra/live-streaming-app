import api from './api';
import { 
  getToken, 
  setToken, 
  removeToken, 
  getRefreshToken, 
  setRefreshToken,
  setUserData,
  getUserData,
  isTokenExpired 
} from '../utils/helpers';

/**
 * Authentication service for handling all auth-related API calls
 */
class AuthService {
  constructor() {
    this.baseURL = '/auth';
    this.tokenRefreshPromise = null;
  }

  /**
   * Login user with email/username and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email or username
   * @param {string} credentials.password - User password
   * @param {boolean} credentials.rememberMe - Whether to remember login
   * @returns {Promise<Object>} Login response with user data and tokens
   */
  async login(credentials) {
    try {
      const response = await api.post(`${this.baseURL}/login`, {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe || false
      });

      const { user, token, refreshToken } = response.data;

      // Store tokens and user data
      setToken(token);
      setUserData(user);
      
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      return {
        success: true,
        user,
        token,
        message: 'Login successful'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Register new user account
   * @param {Object} userData - Registration data
   * @param {string} userData.username - Unique username
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.confirmPassword - Password confirmation
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      const response = await api.post(`${this.baseURL}/register`, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        acceptTerms: userData.acceptTerms || false
      });

      const { user, token, refreshToken } = response.data;

      // Store tokens and user data
      setToken(token);
      setUserData(user);
      
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      return {
        success: true,
        user,
        token,
        message: 'Registration successful'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout user and clear all auth data
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      const token = getToken();
      
      if (token) {
        // Notify server about logout
        await api.post(`${this.baseURL}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      // Continue with logout even if server request fails
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local auth data
      removeToken();
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} New token data
   */
  async refreshToken() {
    // Prevent multiple simultaneous refresh requests
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = this._performTokenRefresh();
    
    try {
      const result = await this.tokenRefreshPromise;
      return result;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  /**
   * Internal method to perform token refresh
   * @private
   */
  async _performTokenRefresh() {
    try {
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post(`${this.baseURL}/refresh`, {
        refreshToken
      });

      const { token: newToken, refreshToken: newRefreshToken, user } = response.data;

      // Update stored tokens and user data
      setToken(newToken);
      setUserData(user);
      
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      return {
        success: true,
        token: newToken,
        user
      };
    } catch (error) {
      // If refresh fails, clear all auth data
      removeToken();
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verify current token validity
   * @param {string} token - Token to verify (optional, uses stored token if not provided)
   * @returns {Promise<Object>} User data if token is valid
   */
  async verifyToken(token = null) {
    try {
      const tokenToVerify = token || getToken();
      
      if (!tokenToVerify) {
        throw new Error('No token provided');
      }

      // Check if token is expired locally first
      if (isTokenExpired(tokenToVerify)) {
        throw new Error('Token is expired');
      }

      const response = await api.post(`${this.baseURL}/verify`, {}, {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      });

      const { user } = response.data;
      
      // Update stored user data
      setUserData(user);

      return user;
    } catch (error) {
      // If verification fails, try to refresh token
      if (getRefreshToken()) {
        try {
          const refreshResult = await this.refreshToken();
          return refreshResult.user;
        } catch (refreshError) {
          removeToken();
          throw this.handleAuthError(refreshError);
        }
      }
      
      removeToken();
      throw this.handleAuthError(error);
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request response
   */
  async requestPasswordReset(email) {
    try {
      const response = await api.post(`${this.baseURL}/forgot-password`, {
        email
      });

      return {
        success: true,
        message: response.data.message || 'Password reset email sent'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data
   * @param {string} resetData.token - Reset token from email
   * @param {string} resetData.password - New password
   * @param {string} resetData.confirmPassword - Password confirmation
   * @returns {Promise<Object>} Reset response
   */
  async resetPassword(resetData) {
    try {
      const response = await api.post(`${this.baseURL}/reset-password`, {
        token: resetData.token,
        password: resetData.password,
        confirmPassword: resetData.confirmPassword
      });

      return {
        success: true,
        message: response.data.message || 'Password reset successful'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Change user password (when authenticated)
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @param {string} passwordData.confirmPassword - Password confirmation
   * @returns {Promise<Object>} Change response
   */
  async changePassword(passwordData) {
    try {
      const response = await api.put(`${this.baseURL}/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      return {
        success: true,
        message: response.data.message || 'Password changed successfully'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} Update response
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put(`${this.baseURL}/profile`, profileData);

      const { user } = response.data;
      
      // Update stored user data
      setUserData(user);

      return {
        success: true,
        user,
        message: response.data.message || 'Profile updated successfully'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Upload user avatar
   * @param {File} file - Avatar image file
   * @returns {Promise<Object>} Upload response
   */
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post(`${this.baseURL}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { user } = response.data;
      
      // Update stored user data
      setUserData(user);

      return {
        success: true,
        user,
        message: 'Avatar updated successfully'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Delete user account
   * @param {string} password - User password for confirmation
   * @returns {Promise<Object>} Deletion response
   */
  async deleteAccount(password) {
    try {
      const response = await api.delete(`${this.baseURL}/account`, {
        data: { password }
      });

      // Clear all auth data
      removeToken();

      return {
        success: true,
        message: response.data.message || 'Account deleted successfully'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Enable two-factor authentication
   * @returns {Promise<Object>} 2FA setup data
   */
  async enable2FA() {
    try {
      const response = await api.post(`${this.baseURL}/2fa/enable`);

      return {
        success: true,
        qrCode: response.data.qrCode,
        secret: response.data.secret,
        backupCodes: response.data.backupCodes
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verify and confirm 2FA setup
   * @param {string} token - 2FA token from authenticator app
   * @returns {Promise<Object>} Verification response
   */
  async verify2FA(token) {
    try {
      const response = await api.post(`${this.baseURL}/2fa/verify`, {
        token
      });

      const { user } = response.data;
      
      // Update stored user data
      setUserData(user);

      return {
        success: true,
        user,
        backupCodes: response.data.backupCodes,
        message: '2FA enabled successfully'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Disable two-factor authentication
   * @param {string} token - 2FA token or backup code
   * @returns {Promise<Object>} Disable response
   */
  async disable2FA(token) {
    try {
      const response = await api.post(`${this.baseURL}/2fa/disable`, {
        token
      });

      const { user } = response.data;
      
      // Update stored user data
      setUserData(user);

      return {
        success: true,
        user,
        message: '2FA disabled successfully'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user data
   * @returns {Object|null} Current user data from storage
   */
  getCurrentUser() {
    return getUserData();
  }

  /**
   * Check if user is currently authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = getToken();
    return !!token && !isTokenExpired(token);
  }

  /**
   * Handle authentication errors
   * @private
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  handleAuthError(error) {
    const defaultMessage = 'An authentication error occurred';
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.message || 'Invalid request data');
        case 401:
          return new Error(data.message || 'Invalid credentials');
        case 403:
          return new Error(data.message || 'Access forbidden');
        case 404:
          return new Error(data.message || 'User not found');
        case 409:
          return new Error(data.message || 'User already exists');
        case 422:
          return new Error(data.message || 'Validation error');
        case 429:
          return new Error(data.message || 'Too many requests. Please try again later');
        case 500:
          return new Error('Server error. Please try again later');
        default:
          return new Error(data.message || defaultMessage);
      }
    }
    
    if (error.request) {
      return new Error('Network error. Please check your connection');
    }
    
    return new Error(error.message || defaultMessage);
  }
}

// Create and export singleton instance
const authService = new AuthService();

// Export both the service instance and individual methods for convenience
export { authService }; // Export authService as named export
export const authAPI = authService;

export const {
  login,
  register,
  logout,
  refreshToken,
  verifyToken,
  requestPasswordReset,
  resetPassword,
  changePassword,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  enable2FA,
  verify2FA,
  disable2FA,
  getCurrentUser,
  isAuthenticated
} = authService;

export default authService;