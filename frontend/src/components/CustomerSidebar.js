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
  FaPlus
} from "react-icons/fa";
import "./CustomerSidebar.css";

export default function CustomerSidebar({ collapsed, onToggle, onLogout }) {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/portal", icon: <FaTachometerAlt />, exact: true },
    { label: "Profile", path: "/portal/profile", icon: <FaUser /> },
    { label: "Orders", path: "/portal/orders", icon: <FaShoppingBag /> },
    { label: "New Order", path: "/portal/orders/new", icon: <FaPlus /> },
    { label: "Appointments", path: "/portal/appointments", icon: <FaCalendarAlt /> },
    { label: "Measurements", path: "/portal/measurements", icon: <FaRuler /> },
    { label: "Payments", path: "/portal/payments", icon: <FaFileInvoiceDollar /> },
    { label: "Notifications", path: "/portal/notifications", icon: <FaBell /> },
    { label: "Support", path: "/portal/support", icon: <FaLifeRing /> },
    { label: "Settings", path: "/portal/settings", icon: <FaCog /> }
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