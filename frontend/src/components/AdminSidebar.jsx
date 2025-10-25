import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaUsers, FaShoppingBag, FaRuler, 
  FaUserTie, FaMoneyBillWave, FaCog, FaSignOutAlt,
  FaStore, FaCut
} from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/admin/customers', label: 'Customers', icon: FaUsers },
    { path: '/admin/orders', label: 'Orders', icon: FaShoppingBag },
    { path: '/admin/fabrics', label: 'Fabrics', icon: FaCut },
    { path: '/admin/measurements', label: 'Measurements', icon: FaRuler },
    { path: '/admin/staff', label: 'Staff', icon: FaUserTie },
    { path: '/admin/billing', label: 'Billing', icon: FaMoneyBillWave },
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
          <FaStore className="brand-icon" />
          <span className="brand-name">Style Hub</span>
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
