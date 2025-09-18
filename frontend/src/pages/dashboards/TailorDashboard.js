import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import "./TailorDashboard.css";

const TailorDashboard = ({ tailorId }) => {
  const { user } = useAuth();
  const myTailorId = tailorId || user?._id;
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    active: 0,
    completed: 0,
    dueSoon: 0,
  });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [uploading, setUploading] = useState({});

  // ✅ Fetch assigned orders for this tailor
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`/api/orders/tailor/${myTailorId}`);
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching tailor orders:", err);
      }
    };
    fetchOrders();
  }, [myTailorId]);

  // ✅ Calculate summary
  useEffect(() => {
    const active = orders.filter((o) => o.status !== "Completed").length;
    const completed = orders.filter((o) => o.status === "Completed").length;
    const dueSoon = orders.filter((o) => {
      const today = new Date();
      const due = new Date(o.dueDate);
      const diff = (due - today) / (1000 * 60 * 60 * 24);
      return diff <= 2 && o.status !== "Completed";
    }).length;

    setSummary({ active, completed, dueSoon });
  }, [orders]);

  // ✅ Update status in DB
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/orders/${id}/status`, { status: newStatus });
      setOrders(
        orders.map((o) =>
          o._id === id ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // ✅ Update notes in DB
  const updateNotes = async (id, notes) => {
    try {
      await axios.put(`/api/orders/${id}/notes`, { notes });
      setOrders(
        orders.map((o) =>
          o._id === id ? { ...o, notes } : o
        )
      );
    } catch (err) {
      console.error("Error updating notes:", err);
    }
  };

  // Progress helpers (fallback to status-based)
  const getProgressPercent = (o) => {
    if (typeof o.progress === 'number') return Math.max(0, Math.min(100, o.progress));
    if (o.status === 'Completed') return 100;
    if (o.status === 'In Progress') return 60;
    return 10;
  };

  const uploadImages = async (id, files) => {
    if (!files || files.length === 0) return;
    const form = new FormData();
    Array.from(files).forEach(f => form.append('images', f));
    try {
      setUploading(prev => ({ ...prev, [id]: true }));
      await axios.post(`/api/uploads/order/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      // optionally refresh or mark uploaded flag
    } catch (err) {
      console.error('Error uploading images:', err);
      alert('Failed to upload images');
    } finally {
      setUploading(prev => ({ ...prev, [id]: false }));
    }
  };

  const now = new Date();
  const overdueCount = orders.filter(o => o.dueDate && new Date(o.dueDate) < now && o.status !== 'Completed').length;
  const filtered = orders.filter(o => (statusFilter === 'ALL' ? true : o.status === statusFilter));

  return (
    <DashboardLayout
      title="Tailor Dashboard"
      actions={
        <div className="tailor-header-actions">
          <div className="bell" title={`Overdue: ${overdueCount}`}>
            🔔{overdueCount > 0 && <span className="badge">{overdueCount}</span>}
          </div>
          <div className="profile-chip">
            <span className="avatar">{(user?.name || 'T').slice(0,1).toUpperCase()}</span>
            <span className="name">{user?.name || 'Tailor'}</span>
          </div>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">Total Assigned: {orders.length}</div>
        <div className="card">In Progress: {orders.filter(o => o.status === 'In Progress').length}</div>
        <div className="card">Completed: {orders.filter(o => o.status === 'Completed').length}</div>
        <div className="card">Overdue: {overdueCount}</div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <label>Status:</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Orders Table */}
      <h3>My Tasks / Orders</h3>
      {filtered.length === 0 ? (
        <p>No items to show.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order / Task</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Due</th>
              <th>Instructions</th>
              <th>Progress</th>
              <th>Notes</th>
              <th>Uploads</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o._id}>
                <td>{o.taskName || o.orderNumber || o._id}</td>
                <td>{o.customerName || '-'}</td>
                <td>
                  <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td>{o.dueDate ? new Date(o.dueDate).toLocaleString() : '-'}</td>
                <td className="truncate">{o.measurementsSummary || o.specialInstructions || '-'}</td>
                <td>
                  <div className="progress">
                    <div className="bar" style={{ width: `${getProgressPercent(o)}%` }} />
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Add work note..."
                    value={o.notes || ''}
                    onChange={(e) => updateNotes(o._id, e.target.value)}
                  />
                </td>
                <td>
                  <input type="file" multiple accept="image/*" onChange={(e) => uploadImages(o._id, e.target.files)} />
                  {uploading[o._id] ? <span className="muted">Uploading...</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Notifications / Alerts */}
      <h3>Notifications & Alerts</h3>
      {overdueCount > 0 && <div className="alert warning">{overdueCount} overdue item(s)</div>}
      <ul className="notifications">
        {orders
          .filter((o) => o.status === "Pending")
          .map((o) => (
            <li key={o._id}>New task assigned: {o.taskName || o.orderNumber || o._id}</li>
          ))}
      </ul>

      {/* Footer */}
      <footer className="tailor-footer">
        <div className="links">
          <a href="/portal/profile">Profile</a>
          <a href="/help">Help</a>
        </div>
        <div className="version">v1.0.0</div>
      </footer>
    </DashboardLayout>
  );
};

export default TailorDashboard;
