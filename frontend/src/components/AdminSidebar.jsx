import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaUserTie, 
  FaShoppingBag, 
  FaCalendarAlt, 
  FaRuler, 
  FaFileInvoiceDollar, 
  FaBell, 
  FaLifeRing, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = ({ collapsed = false, onToggle, user }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const sections = [
    {
      title: 'General',
      items: [
        { path: '/dashboard/admin', label: 'Dashboard', icon: FaTachometerAlt },
        { path: '/admin/customers', label: 'Customers', icon: FaUsers },
        { path: '/admin/staff', label: 'Staff', icon: FaUserTie },
      ]
    },
    {
      title: 'Operations',
      items: [
        { path: '/admin/orders', label: 'Orders', icon: FaShoppingBag },
        { path: '/admin/appointments', label: 'Appointments', icon: FaCalendarAlt },
        { path: '/admin/billing', label: 'Payments', icon: FaFileInvoiceDollar },
        { path: '/admin/measurements', label: 'Measurements', icon: FaRuler },
      ]
    },
    {
      title: 'Settings',
      items: [
        { path: '/admin/notifications', label: 'Notifications', icon: FaBell },
        { path: '/admin/support', label: 'Support', icon: FaLifeRing },
        { path: '/admin/settings', label: 'Settings', icon: FaCog },
      ]
    }
  ];

  const [darkMode, setDarkMode] = React.useState(false);
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', !darkMode ? 'dark' : 'light');
  };

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Sidebar navigation" role="navigation">
      <div className="sidebar-header">
        <div className="brand" role="img" aria-label="Style Hub Admin">
          <div className="brand-logo">SH</div>
          {!collapsed && <span className="brand-name">Style Hub Admin</span>}
        </div>
        <div className="header-controls">
          <button className="theme-btn" aria-label="Toggle theme" onClick={toggleTheme}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button className="toggle-btn" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={onToggle}>
            <FaBars />
          </button>
        </div>
      </div>

      <div className="profile-box" tabIndex={0} aria-label="Admin profile">
        <div className="avatar" aria-hidden="true">{(user?.name || 'S H').slice(0,1)}</div>
        {!collapsed && (
          <div className="profile-meta">
            <div className="profile-name">{user?.name || 'Style Hub Admin'}</div>
            <div className="profile-email">{user?.email || 'admin@stylehub.com'}</div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {sections.map((section, idx) => (
          <div key={section.title} className="sidebar-section">
            {!collapsed && <div className="section-title">{section.title}</div>}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : ''}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="nav-icon" />
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                </Link>
              );
            })}
            {idx < sections.length - 1 && <hr className="section-divider" />}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout} aria-label="Logout">
          <FaSignOutAlt className="nav-icon" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
