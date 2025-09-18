import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import logo from '../logo.svg';

// Dashboard layout with header, sidebar and content area
export default function DashboardLayout({ title, actions, children, showTitle = true, showRole = true, onNewTask }) {
  const { user, logout } = useAuth();

  const isCustomer = user?.role === 'Customer';
  const isAdmin = user?.role === 'Admin';

  return (
    <div className="dashboard-root">
      <aside className="dashboard-sidebar">
        <div className="brand">
          <img src={logo} alt="Style Hub logo" className="brand-logo" />
          <span>Style Hub</span>
        </div>
        <nav className="nav">
          {isCustomer && (
            <>
              <NavItem to="/dashboard/customer" label="Dashboard" />
              <NavItem to="/portal/profile" label="Profile" />
              <NavItem to="/portal/orders" label="All Orders" />
              <NavItem to="/portal/bills" label="All Bills" />
              <NavItem to="/portal/appointments" label="Appointments" />
              <NavItem to="/portal/measurements" label="Measurements" />
            </>
          )}
          {isAdmin && (
            <>
              <NavItem to="/dashboard/admin" label="Admin Dashboard" />
              <NavItem to="/orders/new" label="Create New Order" />
              <NavItem to="/add-customer" label="Add Customer" />
              <NavItem to="/fabrics" label="Add Fabric" />
              <NavItem to="/reports" label="View Reports" />
              <NavItem to="/admin/users" label="Manage Staff" />
            </>
          )}
          {!isCustomer && !isAdmin && (
            <>
              <NavItem to="/dashboard/staff" label="Dashboard" />
              {onNewTask ? <NavButton onClick={onNewTask} label="New Task" /> : null}
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-logout" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <div>
              {showTitle && title ? <h1 className="page-title">{title}</h1> : null}
              <div className="user-meta">{user?.name}{showRole && user?.role ? ` · ${user.role}` : ''}</div>
            </div>
          </div>
          <div className="header-right">
            <div className="header-actions">{actions}</div>
          </div>
        </header>

        <section className="dashboard-content">
          {children}
        </section>
      </main>
    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <Link className="nav-item" to={to}>
      {label}
    </Link>
  );
}

function NavButton({ onClick, label }) {
  return (
    <button className="nav-item" onClick={onClick}>
      {label}
    </button>
  );
}