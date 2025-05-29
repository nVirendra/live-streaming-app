import React, { useState } from 'react';
import '../styles/sidebar.css';

const Sidebar = ({
  isOpen = true,
  onToggle,
  logo,
  title = "Dashboard",
  menuItems = [],
  userProfile = null,
  onLogout,
  position = "left", // "left" or "right"
  collapsible = true,
  showUserSection = true,
  activeItem = null,
  onItemClick
}) => {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggle) onToggle(!isCollapsed);
  };

  const handleItemClick = (item, e) => {
    if (item.onClick) {
      item.onClick(e);
    }
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const renderMenuItem = (item, index) => {
    const isActive = activeItem === item.id || activeItem === item.label;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups[item.id] || expandedGroups[item.label];

    if (hasChildren) {
      return (
        <li key={index} className="sidebar-group">
          <button
            className={`sidebar-group-header ${isActive ? 'active' : ''}`}
            onClick={() => toggleGroup(item.id || item.label)}
          >
            {item.icon && <span className="sidebar-icon">{item.icon}</span>}
            {!isCollapsed && (
              <>
                <span className="sidebar-label">{item.label}</span>
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                  ▼
                </span>
              </>
            )}
          </button>
          {isExpanded && !isCollapsed && (
            <ul className="sidebar-submenu">
              {item.children.map((child, childIndex) => (
                <li key={childIndex} className="sidebar-subitem">
                  <a
                    href={child.href || '#'}
                    className={`sidebar-sublink ${activeItem === child.id || activeItem === child.label ? 'active' : ''}`}
                    onClick={(e) => handleItemClick(child, e)}
                  >
                    {child.icon && <span className="sidebar-icon">{child.icon}</span>}
                    <span className="sidebar-label">{child.label}</span>
                    {child.badge && (
                      <span className="sidebar-badge">{child.badge}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={index} className="sidebar-item">
        <a
          href={item.href || '#'}
          className={`sidebar-link ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
          onClick={(e) => !item.disabled && handleItemClick(item, e)}
        >
          {item.icon && <span className="sidebar-icon">{item.icon}</span>}
          {!isCollapsed && (
            <>
              <span className="sidebar-label">{item.label}</span>
              {item.badge && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
            </>
          )}
        </a>
      </li>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}
      
      <aside className={`sidebar ${position} ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Header Section */}
        <div className="sidebar-header">
          {logo ? (
            <img src={logo} alt={title} className="sidebar-logo" />
          ) : (
            !isCollapsed && <h2 className="sidebar-title">{title}</h2>
          )}
          
          {collapsible && (
            <button
              className="sidebar-toggle"
              onClick={toggleCollapse}
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? '→' : '←'}
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </ul>
        </nav>

        {/* User Section */}
        {showUserSection && userProfile && (
          <div className="sidebar-user">
            <div className="user-info">
              {userProfile.avatar && (
                <img 
                  src={userProfile.avatar} 
                  alt="User Avatar" 
                  className="user-avatar"
                />
              )}
              {!isCollapsed && (
                <div className="user-details">
                  <span className="user-name">{userProfile.name}</span>
                  <span className="user-role">{userProfile.role}</span>
                </div>
              )}
            </div>
            {!isCollapsed && onLogout && (
              <button
                className="logout-btn"
                onClick={onLogout}
                title="Logout"
              >
                Logout
              </button>
            )}
          </div>
        )}

        {/* Footer Section */}
        <div className="sidebar-footer">
          {!isCollapsed && (
            <div className="sidebar-version">
              v1.0.0
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

// Default menu items example
Sidebar.defaultProps = {
  menuItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      href: '/dashboard'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📊',
      children: [
        { id: 'reports', label: 'Reports', href: '/analytics/reports' },
        { id: 'metrics', label: 'Metrics', href: '/analytics/metrics' }
      ]
    },
    {
      id: 'users',
      label: 'Users',
      icon: '👥',
      href: '/users',
      badge: '12'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      href: '/settings'
    }
  ]
};

export default Sidebar;