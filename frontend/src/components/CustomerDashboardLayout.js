// src/components/CustomerDashboardLayout.js
import React from "react";
import CustomerSidebar from "./CustomerSidebar";
import "./CustomerDashboardLayout.css";

export default function CustomerDashboardLayout({ children, onLogout }) {
  return (
    <div className="dashboard-container">
      <CustomerSidebar onLogout={onLogout} />
      <div className="dashboard-main">{children}</div>
    </div>
  );
}
