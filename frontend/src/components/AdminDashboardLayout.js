import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaUsers, FaUserTie, FaUserCheck, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./AdminDashboard.css"; // main dashboard styles

export default function AdminDashboardLayout({ children, title = 'Admin', actions = null }) {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="admin-dashboard-root">
      <div className="admin-main">
        {/* Top header */}
        <div className="admin-header" role="banner">
          <h1 className="page-title" aria-live="polite">{title}</h1>
          <div className="header-actions" role="toolbar" aria-label="Quick actions">
            {actions ? (
              actions
            ) : (
              <>
                <button className="btn btn-light" type="button">New</button>
                <button className="btn btn-primary" type="button">Reports</button>
              </>
            )}
          </div>
        </div>

        {/* Sticky Top Navigation */}
        <nav className="top-nav" role="navigation" aria-label="Admin navigation">
          <button
            className="topnav-toggle"
            aria-expanded={navOpen}
            aria-controls="topnav-links"
            onClick={() => setNavOpen(o => !o)}
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
            <span className="sr-only">Toggle navigation</span>
          </button>
          <ul id="topnav-links" className={`topnav-links ${navOpen ? 'open' : ''}`}>
            <li>
              <NavLink to="/admin/users?role=Customer" className={({isActive})=>`topnav-link ${isActive?'active':''}`}><FaUsers/> <span>Customers</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/users?role=Staff" className={({isActive})=>`topnav-link ${isActive?'active':''}`}><FaUserTie/> <span>Staff</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/users?role=Tailor" className={({isActive})=>`topnav-link ${isActive?'active':''}`}><FaUserCheck/> <span>Tailors</span></NavLink>
            </li>
            <li>
              <NavLink to="/admin/settings" className={({isActive})=>`topnav-link ${isActive?'active':''}`}><FaCog/> <span>Settings</span></NavLink>
            </li>
            <li className="topnav-spacer" aria-hidden="true" />
            <li>
              <a href="/logout" className="topnav-link danger"><FaSignOutAlt/> <span>Logout</span></a>
            </li>
          </ul>
        </nav>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
