import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';

const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login',
  requireAuth = true,
  requireRole = null,
  fallback = null 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return fallback || <Loading message="Checking authentication..." />;
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with the current location as state
    // This allows redirecting back after successful login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access if specified
  if (requireRole && isAuthenticated) {
    // Handle single role requirement
    if (typeof requireRole === 'string') {
      if (user?.role !== requireRole) {
        return (
          <Navigate 
            to="/unauthorized" 
            state={{ requiredRole: requireRole, userRole: user?.role }} 
            replace 
          />
        );
      }
    }
    
    // Handle multiple role requirements (array)
    if (Array.isArray(requireRole)) {
      if (!user?.role || !requireRole.includes(user.role)) {
        return (
          <Navigate 
            to="/unauthorized" 
            state={{ requiredRoles: requireRole, userRole: user?.role }} 
            replace 
          />
        );
      }
    }
  }

  // If all checks pass, render the protected component
  return children;
};

// Higher-order component for role-based protection
export const withRoleProtection = (Component, requiredRole) => {
  return (props) => (
    <ProtectedRoute requireRole={requiredRole}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specialized protected routes for common use cases
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requireRole="admin" {...props}>
    {children}
  </ProtectedRoute>
);

export const ModeratorRoute = ({ children, ...props }) => (
  <ProtectedRoute requireRole={['admin', 'moderator']} {...props}>
    {children}
  </ProtectedRoute>
);

export const StreamerRoute = ({ children, ...props }) => (
  <ProtectedRoute requireRole={['admin', 'moderator', 'streamer']} {...props}>
    {children}
  </ProtectedRoute>
);

// Component for handling unauthorized access
export const UnauthorizedPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { requiredRole, requiredRoles, userRole } = location.state || {};

  const formatRoles = (roles) => {
    if (Array.isArray(roles)) {
      return roles.join(', ');
    }
    return roles;
  };

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-container">
        <div className="unauthorized-content">
          <h1>Access Denied</h1>
          <div className="unauthorized-icon">🚫</div>
          
          <div className="unauthorized-details">
            <p>You don't have permission to access this page.</p>
            
            {(requiredRole || requiredRoles) && (
              <div className="role-info">
                <p>
                  <strong>Required role:</strong> {formatRoles(requiredRole || requiredRoles)}
                </p>
                {userRole && (
                  <p>
                    <strong>Your role:</strong> {userRole}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="unauthorized-actions">
            <button 
              onClick={() => window.history.back()}
              className="btn btn-outline"
            >
              Go Back
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="btn btn-primary"
            >
              Home
            </button>
          </div>

          {!user && (
            <div className="login-suggestion">
              <p>Need to log in?</p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="btn btn-secondary"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook for checking permissions in components
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (requiredRole) => {
    if (!isAuthenticated || !user?.role) return false;
    
    if (typeof requiredRole === 'string') {
      return user.role === requiredRole;
    }
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return false;
  };

  const isAdmin = () => hasRole('admin');
  const isModerator = () => hasRole(['admin', 'moderator']);
  const isStreamer = () => hasRole(['admin', 'moderator', 'streamer']);
  
  const canModerate = () => isModerator();
  const canStream = () => isStreamer();
  const canAccessAdminPanel = () => isAdmin();

  return {
    hasRole,
    isAdmin,
    isModerator,
    isStreamer,
    canModerate,
    canStream,
    canAccessAdminPanel,
    user,
    isAuthenticated
  };
};

export default ProtectedRoute;