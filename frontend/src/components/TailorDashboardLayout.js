import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaTachometerAlt,
  FaClipboardList,
  FaPlus,
  FaList,
  FaClock,
  FaCheckCircle,
  FaUsers,
  FaUserPlus,
  FaRuler,
  FaBoxes,
  FaTshirt,
  FaGem,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaExclamationTriangle,
  FaChartLine,
  FaWarehouse,
  FaBell,
  FaCog,
  FaUser,
  FaStore,
  FaUsersCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import './TailorDashboardLayout.css';

const TailorDashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: FaTachometerAlt,
      path: '/tailor/dashboard',
      exact: true
    },
    {
      title: 'Orders',
      icon: FaClipboardList,
      submenu: [
        { title: 'New Order', icon: FaPlus, path: '/tailor/orders/new' },
        { title: 'All Orders', icon: FaList, path: '/tailor/orders' },
        { title: 'Pending Orders', icon: FaClock, path: '/tailor/orders/pending' },
        { title: 'Completed Orders', icon: FaCheckCircle, path: '/tailor/orders/completed' }
      ]
    },
    {
      title: 'Customers',
      icon: FaUsers,
      submenu: [
        { title: 'Customer List', icon: FaList, path: '/tailor/customers' },
        { title: 'Add Customer', icon: FaUserPlus, path: '/tailor/customers/new' },
        { title: 'Measurements', icon: FaRuler, path: '/tailor/measurements' }
      ]
    },
    {
      title: 'Inventory',
      icon: FaBoxes,
      submenu: [
        { title: 'Fabric Stock', icon: FaTshirt, path: '/tailor/inventory/fabrics' },
        { title: 'Accessories Stock', icon: FaGem, path: '/tailor/inventory/accessories' }
      ]
    },
    {
      title: 'Payments',
      icon: FaMoneyBillWave,
      submenu: [
        { title: 'Payment Records', icon: FaFileInvoiceDollar, path: '/tailor/payments' },
        { title: 'Pending Payments', icon: FaExclamationTriangle, path: '/tailor/payments/pending' }
      ]
    },
    {
      title: 'Reports',
      icon: FaChartLine,
      submenu: [
        { title: 'Sales Reports', icon: FaChartLine, path: '/tailor/reports/sales' },
        { title: 'Inventory Reports', icon: FaWarehouse, path: '/tailor/reports/inventory' }
      ]
    },
    {
      title: 'Notifications',
      icon: FaBell,
      path: '/tailor/notifications'
    },
    {
      title: 'Settings',
      icon: FaCog,
      submenu: [
        { title: 'Profile Settings', icon: FaUser, path: '/tailor/settings/profile' },
        { title: 'Shop Details', icon: FaStore, path: '/tailor/settings/shop' },
        { title: 'User Management', icon: FaUsersCog, path: '/tailor/settings/users' }
      ]
    },
    {
      title: 'Support',
      icon: FaQuestionCircle,
      path: '/tailor/support'
    }
  ];

  const isActiveRoute = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const MenuItem = ({ item, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(
      item.submenu ? item.submenu.some(sub => isActiveRoute(sub.path)) : false
    );

    if (item.submenu) {
      return (
        <div className={`menu-item has-submenu ${level > 0 ? 'submenu-item' : ''}`}>
          <div
            className={`menu-link ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <item.icon className="menu-icon" />
            <span className="menu-text">{item.title}</span>
            <span className={`submenu-arrow ${isOpen ? 'open' : ''}`}>▼</span>
          </div>
          {isOpen && (
            <div className="submenu">
              {item.submenu.map((subItem, index) => (
                <MenuItem key={index} item={subItem} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        to={item.path}
        className={`menu-item ${level > 0 ? 'submenu-item' : ''}`}
        onClick={() => setSidebarOpen(false)}
      >
        <div className={`menu-link ${isActiveRoute(item.path, item.exact) ? 'active' : ''}`}>
          <item.icon className="menu-icon" />
          <span className="menu-text">{item.title}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="tailor-dashboard">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <h1 className="mobile-title">{title}</h1>
        <div className="mobile-user">
          <span>{user?.name?.charAt(0) || 'T'}</span>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <FaTshirt className="logo-icon" />
            <span className="logo-text">StyleHub Tailor</span>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'T'}
          </div>
          <div className="user-details">
            <h4>{user?.name || 'Tailor'}</h4>
            <p>{user?.email || 'tailor@stylehub.com'}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <MenuItem key={index} item={item} />
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="menu-icon" />
            <span className="menu-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h1 className="page-title">{title}</h1>
          <div className="header-actions">
            <div className="notifications-badge">
              <FaBell />
              <span className="badge">3</span>
            </div>
            <div className="user-menu">
              <div className="user-avatar-small">
                {user?.name?.charAt(0) || 'T'}
              </div>
              <span className="user-name">{user?.name || 'Tailor'}</span>
            </div>
          </div>
        </div>

        <div className="content-body">
          {children}
        </div>
      </main>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default TailorDashboardLayout;
