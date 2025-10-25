import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import './Dashboard.css';
import './CustomerSidebar.css';
import logo from '../logo.svg';

// Dashboard layout with header, sidebar and content area
export default function DashboardLayout({ title, actions, children, showTitle = true, showRole = true, onNewTask }) {
  const { user, logout } = useAuth();

  const isCustomer = user?.role === 'Customer';
  const isAdmin = user?.role === 'Admin';
  
  // Debug: Log user role and sidebar visibility
  console.log('DashboardLayout - user:', user);
  console.log('DashboardLayout - isAdmin:', isAdmin);
  console.log('DashboardLayout - isCustomer:', isCustomer);

  return (
    <div className="dashboard-root">
      {/* Customer Sidebar */}
      {isCustomer && (
        <aside className="dashboard-sidebar customer-sidebar">
          <div className="sidebar-header">
            <div className="brand">
              <div className="brand-logo">S</div>
              <span className="brand-name">Style Hub</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            <ul className="nav-menu">
              <NavItem to="/portal" label="Dashboard" />
              <NavItem to="/portal/profile" label="Profile" />
              <NavItem to="/portal/orders" label="Orders" />
              <NavItem to="/portal/orders/new" label="New Order" />
              <NavItem to="/portal/appointments" label="Appointments" />
              <NavItem to="/portal/measurements" label="Measurements" />
              <NavItem to="/portal/payments" label="Payments" />
              <NavItem to="/portal/settings" label="Settings" />
            </ul>
          </nav>
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={logout}>
              <span>Logout</span>
            </button>
          </div>
        </aside>
      )}

      {/* Admin Sidebar */}
      {isAdmin && <AdminSidebar />}

      <main className={`dashboard-main ${(isCustomer || isAdmin) ? 'with-sidebar' : ''}`}>
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      end
    >
      {label}
    </NavLink>
  );
}

function NavButton({ onClick, label }) {
  return (
    <button className="nav-item" onClick={onClick}>
      {label}
    </button>
  );
}