import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaUserTie, FaShoppingBag, FaCalendarAlt, FaFileInvoiceDollar, FaBell, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./AdminSidebar.css";

export default function AdminSidebar({ onLogout }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { label: "Dashboard", path: "/admin", icon: <FaTachometerAlt /> },
    { label: "Customers", path: "/admin/customers", icon: <FaUsers /> },
    { label: "Staff", path: "/admin/staff", icon: <FaUserTie /> },
    { label: "Orders", path: "/admin/orders", icon: <FaShoppingBag /> },
    { label: "Appointments", path: "/admin/appointments", icon: <FaCalendarAlt /> },
    { label: "Payments", path: "/admin/payments", icon: <FaFileInvoiceDollar /> },
    { label: "Notifications", path: "/admin/notifications", icon: <FaBell /> },
    { label: "Settings", path: "/admin/settings", icon: <FaCog /> },
    { label: "Logout", path: "/logout", icon: <FaSignOutAlt />, action: onLogout }
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <h2>Style Hub Admin</h2>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "▶" : "◀"}
        </button>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item, idx) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <li key={idx} className={active ? "active" : ""} onClick={item.action || (() => {})}>
              {item.action ? (
                <span className="menu-item">{item.icon} {!collapsed && <span>{item.label}</span>}</span>
              ) : (
                <Link to={item.path} className="menu-item">{item.icon} {!collapsed && <span>{item.label}</span>}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
