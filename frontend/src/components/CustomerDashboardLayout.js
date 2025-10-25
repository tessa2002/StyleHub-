// src/components/CustomerDashboardLayout.js
import React from "react";
import "./CustomerDashboardLayout.css";

export default function CustomerDashboardLayout({ children, onLogout }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        {children}
      </div>
    </div>
  );
}
