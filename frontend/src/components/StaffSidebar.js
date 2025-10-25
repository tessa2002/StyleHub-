import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FaHome, FaBox, FaUser, FaSignOutAlt, FaRuler, FaCalendarAlt, FaUserPlus
} from 'react-icons/fa';
import './StaffSidebar.css';

const StaffSidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaHome },
    { id: 'assignments', label: 'Assignments', icon: FaUserPlus },
    { id: 'orders', label: 'My Orders', icon: FaBox },
    { id: 'measurements', label: 'Measurements', icon: FaRuler },
    { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt },
    { id: 'profile', label: 'Profile', icon: FaUser },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="staff-sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <h2>Style Hub</h2>
          <p>Staff Portal</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default StaffSidebar;
