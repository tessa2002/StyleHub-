import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaUser, 
  FaShoppingBag, 
  FaCalendarAlt, 
  FaRuler, 
  FaFileInvoiceDollar, 
  FaBell, 
  FaLifeRing, 
  FaCog, 
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaStore,
  FaPlus,
  FaRobot
} from "react-icons/fa";
import "./CustomerSidebar.css";

export default function CustomerSidebar({ collapsed, onToggle, onLogout }) {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/portal", icon: <FaTachometerAlt />, exact: true },
    { label: "New Request", path: "/portal/orders/new", icon: <FaPlus /> },
    { label: "My Orders", path: "/portal/orders", icon: <FaShoppingBag /> },
    { label: "Measurements", path: "/portal/measurements", icon: <FaRuler /> },
    { label: "Fabric Catalog", path: "/fabrics", icon: <FaStore /> },
    { label: "Appointments", path: "/portal/appointments", icon: <FaCalendarAlt /> },
    { label: "Kids' Profiles", path: "/portal/kids", icon: <FaUser /> },
    { label: "AI Stylist", path: "/portal/ai-stylist", icon: <FaRobot /> }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`customer-sidebar ${collapsed ? 'collapsed' : ''}`}>
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
                <Link to={item.path} className="nav-link">
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
  );
}