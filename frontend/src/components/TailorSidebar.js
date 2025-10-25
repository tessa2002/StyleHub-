import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaClipboardList,
  FaExclamationTriangle,
  FaTools,
  FaCheckCircle,
  FaRuler,
  FaStickyNote,
  FaCalendarAlt,
  FaBell,
  FaChartLine,
  FaCoins,
  FaUser,
  FaLock,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaStore
} from "react-icons/fa";
import "./Dashboard.css";
import "./TailorSidebar.css";

export default function TailorSidebar({ collapsed, onToggle, onLogout }) {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Grouped menu structure
  const menuItems = [
    { label: "My Orders", path: "/dashboard/tailor/orders", icon: <FaClipboardList /> },
    { label: "In Progress", path: "/dashboard/tailor/in-progress", icon: <FaTools /> },
    { label: "Ready to Deliver", path: "/dashboard/tailor/ready", icon: <FaCheckCircle /> }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (window.innerWidth <= 1024) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`tailor-sidebar ${collapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-logo">
              <FaStore />
            </div>
            {!collapsed && (
              <h2 className="brand-name">Style Hub</h2>
            )}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {menuItems.map((item, index) => {
              const active = isActive(item.path, item.exact);
              return (
                <li key={index} className={`nav-item ${active ? 'active' : ''}`}>
                  <Link 
                    to={item.path} 
                    className="nav-link"
                    onClick={handleLinkClick}
                    title={collapsed ? item.label : ''}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!collapsed && <span className="nav-label">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={onLogout}
            title="Logout"
          >
            <FaSignOutAlt />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

