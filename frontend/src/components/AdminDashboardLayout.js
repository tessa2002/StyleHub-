import React from "react";
import AdminSidebar from "./AdminSidebar";
import "./AdminDashboard.css"; // main dashboard styles

export default function AdminDashboardLayout({ children }) {
  return (
    <div className="dashboard-container">
      <AdminSidebar />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
