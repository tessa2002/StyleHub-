import React from 'react';
import { FaBell, FaCog } from 'react-icons/fa';

const TopNav = ({ onNotifications, onSettings, unreadCount = 0, rightContent }) => {
  return (
    <div className="admin-header" role="banner">
      <div className="header-left">
        <h1 className="page-title">Admin Dashboard</h1>
      </div>
      <div className="header-right">
        {rightContent}
        <button className="btn btn-secondary" aria-label="Notifications" onClick={onNotifications} style={{ position: 'relative' }}>
          <FaBell style={{ marginRight: 8 }} />
          Notifications
          {unreadCount > 0 && (
            <span aria-label={`${unreadCount} unread`} className="notif-badge">{unreadCount}</span>
          )}
        </button>
        <button className="btn btn-primary" aria-label="Settings" onClick={onSettings}>
          <FaCog style={{ marginRight: 8 }} />
          Settings
        </button>
      </div>
    </div>
  );
};

export default TopNav;















