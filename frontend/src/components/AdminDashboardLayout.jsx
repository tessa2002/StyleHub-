import React from 'react';
import './AdminDashboard.css';

const AdminDashboardLayout = ({ children, title, actions }) => {
  return (
    <div className="admin-dashboard-root">
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title">{title || 'Admin Dashboard'}</h1>
          </div>
          <div className="header-right">
            <div className="header-actions">{actions}</div>
          </div>
        </header>

        <section className="admin-content">
          {children}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboardLayout;
