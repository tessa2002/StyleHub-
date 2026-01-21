import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaUsers, FaShoppingBag, FaRuler, 
  FaUserTie, FaMoneyBillWave, FaCog, FaSignOutAlt,
  FaStore, FaCut, FaCalendarAlt, FaBrain
} from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/admin/customers', label: 'Customers', icon: FaUsers },
    { path: '/admin/orders', label: 'Orders', icon: FaShoppingBag },
    { path: '/admin/appointments', label: 'Appointments', icon: FaCalendarAlt },
    { path: '/admin/fabrics', label: 'Fabrics', icon: FaCut },
    { path: '/admin/measurements', label: 'Measurements', icon: FaRuler },
    { path: '/admin/staff', label: 'Staff', icon: FaUserTie },
    { path: '/admin/billing', label: 'Billing', icon: FaMoneyBillWave },
    { path: '/admin/ml', label: '🤖 AI/ML', icon: FaBrain },
    { path: '/admin/settings', label: 'Settings', icon: FaCog }
  ];

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-logo-pink">
            <svg viewBox="0 0 24 24" fill="#ff4d8d" width="30" height="30">
               <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.41,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.59,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
            </svg>
          </div>
          <span className="brand-name">StyleHub</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
