/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: none;
}

@media (max-width: 768px) {
  .sidebar-overlay {
    display: block;
  }
}

/* Main Sidebar Container */
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 280px;
  background: #1f2937;
  color: white;
  z-index: 999;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  transform: translateX(-100%);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar.left {
  left: 0;
}

.sidebar.right {
  right: 0;
  transform: translateX(100%);
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar.collapsed {
  width: 80px;
}

@media (min-width: 769px) {
  .sidebar {
    position: relative;
    transform: translateX(0);
  }
}

/* Sidebar Header */
.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #374151;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;
  background: #111827;
}

.sidebar-logo {
  height: 2rem;
  width: auto;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-toggle {
  background: #374151;
  border: none;
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  font-size: 0.875rem;
}

.sidebar-toggle:hover {
  background: #4b5563;
}

.sidebar-toggle:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1f2937;
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: #1f2937;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Menu Lists */
.sidebar-menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar-item,
.sidebar-group {
  margin-bottom: 0.25rem;
}

/* Menu Links and Group Headers */
.sidebar-link,
.sidebar-group-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #d1d5db;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.sidebar-link:hover,
.sidebar-group-header:hover {
  background: #374151;
  color: white;
}

.sidebar-link.active,
.sidebar-group-header.active {
  background: #3b82f6;
  color: white;
  box-shadow: inset 3px 0 0 #1d4ed8;
}

.sidebar-link.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sidebar-link.disabled:hover {
  background: none;
  color: #d1d5db;
}

/* Icons */
.sidebar-icon {
  font-size: 1.25rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Labels */
.sidebar-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Badges */
.sidebar-badge {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 1.25rem;
  text-align: center;
  font-weight: 600;
  line-height: 1;
}

/* Expand Icon */
.expand-icon {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  color: #9ca3af;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

/* Submenu */
.sidebar-submenu {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #111827;
  border-left: 2px solid #374151;
}

.sidebar-subitem {
  margin: 0;
}

.sidebar-sublink {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem 0.5rem 3rem;
  color: #9ca3af;
  text-decoration: none;
  transition: all 0.2s ease;
  gap: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 400;
}

.sidebar-sublink:hover {
  background: #1f2937;
  color: white;
}

.sidebar-sublink.active {
  background: #3b82f6;
  color: white;
  box-shadow: inset 3px 0 0 #1d4ed8;
}

/* User Section */
.sidebar-user {
  padding: 1rem;
  border-top: 1px solid #374151;
  margin-top: auto;
  background: #111827;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #374151;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  font-weight: 600;
  color: white;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.user-role {
  display: block;
  color: #9ca3af;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.logout-btn {
  width: 100%;
  padding: 0.5rem;
  background: #374151;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s ease;
}

.logout-btn:hover {
  background: #4b5563;
}

.logout-btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Footer */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #374151;
  text-align: center;
  background: #111827;
}

.sidebar-version {
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 400;
}

/* Collapsed State Styles */
.sidebar.collapsed .sidebar-title,
.sidebar.collapsed .sidebar-label,
.sidebar.collapsed .sidebar-badge,
.sidebar.collapsed .expand-icon,
.sidebar.collapsed .user-details,
.sidebar.collapsed .logout-btn,
.sidebar.collapsed .sidebar-version {
  display: none;
}

.sidebar.collapsed .sidebar-submenu {
  display: none;
}

.sidebar.collapsed .sidebar-link,
.sidebar.collapsed .sidebar-group-header {
  justify-content: center;
  padding: 0.75rem;
  position: relative;
}

.sidebar.collapsed .user-info {
  justify-content: center;
  margin-bottom: 0;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 1rem;
}

/* Tooltip for collapsed state */
.sidebar.collapsed .sidebar-link:hover::after,
.sidebar.collapsed .sidebar-group-header:hover::after {
  content: attr(title);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: #1f2937;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  white-space: nowrap;
  z-index: 1000;
  margin-left: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #374151;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .sidebar {
    width: 280px;
  }
  
  .sidebar.collapsed {
    width: 280px;
  }
  
  .sidebar.collapsed .sidebar-title,
  .sidebar.collapsed .sidebar-label,
  .sidebar.collapsed .sidebar-badge,
  .sidebar.collapsed .expand-icon,
  .sidebar.collapsed .user-details,
  .sidebar.collapsed .logout-btn,
  .sidebar.collapsed .sidebar-version {
    display: block;
  }
  
  .sidebar.collapsed .sidebar-link,
  .sidebar.collapsed .sidebar-group-header {
    justify-content: flex-start;
    padding: 0.75rem 1rem;
  }
  
  .sidebar.collapsed .user-info {
    justify-content: flex-start;
    margin-bottom: 0.75rem;
  }
}

/* Animation for menu items */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.sidebar-submenu {
  animation: slideIn 0.2s ease-out;
}

/* Focus styles for accessibility */
.sidebar-link:focus,
.sidebar-group-header:focus,
.sidebar-sublink:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .sidebar {
    border-right: 2px solid #fff;
  }
  
  .sidebar-link.active,
  .sidebar-group-header.active {
    background: #000;
    color: #fff;
  }
}