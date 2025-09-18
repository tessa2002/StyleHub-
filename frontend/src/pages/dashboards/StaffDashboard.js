import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';
import './StaffDashboard.css';

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const staffId = user?._id || "123"; // Logged-in staff
  const [orders, setOrders] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Per-order selected tailor
  const [selectedTailors, setSelectedTailors] = useState({});

  // For New Task form
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newTailor, setNewTailor] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newFiles, setNewFiles] = useState([]);
  const [formError, setFormError] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const ordersRes = await axios.get(`/api/orders?staffId=${staffId}`);
        const tailorsRes = await axios.get(`/api/tailors`);
        const notificationsRes = await axios.get(`/api/notifications?staffId=${staffId}`);

        setOrders(ordersRes.data);
        setTailors(tailorsRes.data);
        setNotifications(notificationsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [staffId]);

  // Quick stats
  const totalAssignedCount = orders.length;
  const inProgressCount = orders.filter(o => o.status === 'In Progress').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const pendingTasksCount = orders.filter(o => o.status === 'Pending').length;

  // UI filters
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  if (loading) return <DashboardLayout title="Staff Dashboard">Loading...</DashboardLayout>;

  const handleAssignTailor = async (orderId) => {
    const tailorId = selectedTailors[orderId];
    if (!tailorId) return alert("Select a tailor to assign!");
    try {
      await axios.put(`/api/orders/${orderId}/assign`, { tailorId });
      setOrders(orders.map(o =>
        o._id === orderId
          ? { ...o, assignedTailor: tailors.find(t => t._id === tailorId)?.name || "Unknown" }
          : o
      ));
      setSelectedTailors(prev => ({ ...prev, [orderId]: "" }));
    } catch (err) {
      console.error(err);
      alert("Failed to assign tailor. Check console.");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newTaskName || !newDueDate) {
      setFormError('Please enter task name and due date.');
      return;
    }
    if (newTaskName.length > 100) {
      setFormError('Task name should be at most 100 characters.');
      return;
    }
    const due = new Date(newDueDate);
    if (isNaN(due.getTime()) || due.getTime() < Date.now()) {
      setFormError('Due date/time cannot be in the past.');
      return;
    }

    const formData = new FormData();
    formData.append('taskName', newTaskName);
    formData.append('description', newDescription);
    formData.append('dueDate', newDueDate);
    formData.append('assignedTailor', newTailor || '');
    formData.append('priority', newPriority || 'Medium');
    formData.append('status', 'Pending');
    formData.append('staffId', staffId);
    Array.from(newFiles || []).forEach((file) => formData.append('attachments', file));

    try {
      setCreatingTask(true);
      const res = await axios.post('/api/orders', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setOrders(prev => [...prev, res.data]);
      setNewTaskName('');
      setNewDescription('');
      setNewDueDate('');
      setNewTailor('');
      setNewPriority('Medium');
      setNewFiles([]);
      setShowNewTask(false);
    } catch (err) {
      console.error(err);
      setFormError('Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: nextStatus });
      setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, status: nextStatus } : o)));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleAddNotes = async (orderId) => {
    const note = window.prompt('Add notes');
    if (!note) return;
    try {
      await axios.post(`/api/orders/${orderId}/notes`, { note });
      setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, notes: [...(o.notes || []), note] } : o)));
    } catch (err) {
      console.error(err);
      setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, notes: [...(o.notes || []), note] } : o)));
    }
  };

  // Split into tasks (have taskName) and production orders (no taskName)
  const tasks = orders.filter(o => !!o.taskName);
  const filteredTasks = tasks.filter(t => (taskStatusFilter === 'ALL' ? true : t.status === taskStatusFilter));
  const productionOrders = orders.filter(o => !o.taskName);
  const searchedOrders = productionOrders.filter(o => {
    const customerName = (o.customerName || '').toLowerCase();
    const orderIdStr = (o.orderNumber || o._id || '').toString().toLowerCase();
    const term = orderSearch.toLowerCase();
    return customerName.includes(term) || orderIdStr.includes(term);
  });
  const filteredOrders = searchedOrders.filter(o => (orderStatusFilter === 'ALL' ? true : o.status === orderStatusFilter));

  // Alerts: overdue/urgent
  const now = new Date();
  const overdueCount = orders.filter(o => o.dueDate && new Date(o.dueDate) < now && o.status !== 'Completed' && o.status !== 'Ready for Delivery').length;
  const urgentList = orders.filter(o => {
    if (!o.dueDate) return false;
    const due = new Date(o.dueDate);
    const hours = (due - now) / 36e5;
    return hours >= 0 && hours <= 24 && o.status !== 'Completed' && o.status !== 'Ready for Delivery';
  });

  // Tailor availability (simple heuristic based on assignments)
  const tailorIdToCount = orders.reduce((acc, o) => {
    const id = o.assignedTailorId || o.assignedTailor?._id || null;
    if (id) acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      {showNewTask ? (
        <div className="section">
          <h3>Create New Task</h3>
          {formError && <div className="alert warning">{formError}</div>}
          <form onSubmit={handleCreateTask}>
            <div>
              <label>Task Name *</label>
              <input type="text" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} required maxLength={100} placeholder="e.g., Stitch Kurti for John" />
            </div>
            <div>
              <label>Description</label>
              <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} />
            </div>
            <div>
              <label>Due Date & Time *</label>
              <input type="datetime-local" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} required />
            </div>
            <div>
              <label>Assign Tailor (Optional)</label>
              <select value={newTailor} onChange={e => setNewTailor(e.target.value)}>
                <option value="">Select Tailor</option>
                {tailors.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label>Priority</label>
              <select value={newPriority} onChange={e => setNewPriority(e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label>Attachments (Optional)</label>
              <input type="file" multiple accept="image/*,application/pdf" onChange={e => setNewFiles(e.target.files)} />
            </div>
            <button type="submit" className="primary" disabled={creatingTask}>
              {creatingTask ? 'Creating...' : 'Create Task'}
            </button>
            <button type="button" className="secondary" onClick={() => setShowNewTask(false)}>Cancel</button>
          </form>
        </div>
      ) : (
        <DashboardLayout
          title="Staff Dashboard"
          onNewTask={() => setShowNewTask(true)}
          actions={
            <div className="staff-header-actions">
              <div className="bell" title={`Overdue: ${overdueCount}`}>
                🔔{overdueCount > 0 && <span className="badge">{overdueCount}</span>}
              </div>
              <button className="btn" title="Quick Stats">📊</button>
              <div className="profile-chip">
                <span className="avatar">{(user?.name || 'S').slice(0,1).toUpperCase()}</span>
                <span className="name">{user?.name || 'Staff'}</span>
              </div>
              <button 
                className="logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          }
        >
          {/* Summary / Quick Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🧾</div>
              <div className="stat-content">
                <h3>Total Orders Assigned</h3>
                <div className="stat-number">{totalAssignedCount}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚙️</div>
              <div className="stat-content">
                <h3>Orders In Progress</h3>
                <div className="stat-number">{inProgressCount}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Orders Completed</h3>
                <div className="stat-number">{completedCount}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🕒</div>
              <div className="stat-content">
                <h3>Pending Tasks</h3>
                <div className="stat-number">{pendingTasksCount}</div>
              </div>
            </div>
          </div>

          {/* Task Management Section */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">Task Management</h3>
              <div className="filters">
                <label>Status:</label>
                <select value={taskStatusFilter} onChange={e => setTaskStatusFilter(e.target.value)}>
                  <option value="ALL">All</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <button className="btn" onClick={() => setShowNewTask(true)}>New Task</button>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <p className="muted">No tasks to show.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Description</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Assigned Tailor</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => (
                    <tr key={task._id}>
                      <td>{task.taskName}</td>
                      <td className="truncate">{task.description || '-'}</td>
                      <td>{task.dueDate ? new Date(task.dueDate).toLocaleString() : '-'}</td>
                      <td>
                        <select value={task.status} onChange={e => handleUpdateStatus(task._id, e.target.value)}>
                          <option>Pending</option>
                          <option>In Progress</option>
                          <option>Completed</option>
                        </select>
                      </td>
                      <td>
                        {task.assignedTailor || (
                          <div className="assign-inline">
                            <select
                              value={selectedTailors[task._id] || ''}
                              onChange={e => setSelectedTailors(prev => ({ ...prev, [task._id]: e.target.value }))}
                            >
                              <option value="">Select Tailor</option>
                              {tailors.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                            <button className="btn" onClick={() => handleAssignTailor(task._id)}>Assign</button>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="btn" onClick={() => handleAddNotes(task._id)}>Add Notes</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Order Management Section */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">Order Management</h3>
              <div className="filters">
                <input
                  type="text"
                  placeholder="Search by customer or order ID"
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                />
                <label>Status:</label>
                <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
                  <option value="ALL">All</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Ready for Delivery">Ready for Delivery</option>
                </select>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <p className="muted">No orders match your search.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Order ID</th>
                    <th>Order Status</th>
                    <th>Delivery Date</th>
                    <th>Measurements Summary</th>
                    <th>Assigned Tailor</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order._id}>
                      <td>{order.customerName || '-'}</td>
                      <td>{order.orderNumber || order._id}</td>
                      <td>
                        <select value={order.status} onChange={e => handleUpdateStatus(order._id, e.target.value)}>
                          <option>Pending</option>
                          <option>In Progress</option>
                          <option>Completed</option>
                          <option>Ready for Delivery</option>
                        </select>
                      </td>
                      <td>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}</td>
                      <td className="truncate">{order.measurementsSummary || '-'}</td>
                      <td>
                        {order.assignedTailor || (
                          <div className="assign-inline">
                            <select
                              value={selectedTailors[order._id] || ''}
                              onChange={e => setSelectedTailors(prev => ({ ...prev, [order._id]: e.target.value }))}
                            >
                              <option value="">Select Tailor</option>
                              {tailors.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                            <button className="btn" onClick={() => handleAssignTailor(order._id)}>Assign</button>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="btn" onClick={() => handleAddNotes(order._id)}>Add Notes</button>
                          {order.status !== 'Ready for Delivery' && (
                            <button className="btn" onClick={() => handleUpdateStatus(order._id, 'Ready for Delivery')}>Mark Ready</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Tailor Assignment (Availability) */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">Tailor Assignment</h3>
            </div>
            {tailors.length === 0 ? (
              <p className="muted">No tailors available.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Tailor</th>
                    <th>Current Load</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tailors.map(t => {
                    const load = tailorIdToCount[t._id] || 0;
                    const status = load < 3 ? 'Free' : load < 6 ? 'Busy' : 'Very Busy';
                    return (
                      <tr key={t._id}>
                        <td>{t.name}</td>
                        <td>{load} tasks</td>
                        <td>{status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Notifications */}
          <div className="section">
            <h3 className="section-title">Notifications & Alerts</h3>
            {overdueCount > 0 && (
              <div className="alert warning">{overdueCount} item(s) overdue</div>
            )}
            {urgentList.length > 0 && (
              <div className="alert info">{urgentList.length} item(s) due in 24 hours</div>
            )}
            {notifications.length === 0 ? (
              <p className="muted">No new notifications.</p>
            ) : (
              <ul className="notifications">
                {notifications.map(note => <li key={note._id}>{note.message}</li>)}
              </ul>
            )}
          </div>

          {/* Footer */}
          <footer className="dashboard-footer">
            <div className="links">
              <a href="/portal/profile">Profile</a>
              <a href="/settings">Settings</a>
              <a href="/help">Help</a>
            </div>
            <div className="version">v1.0.0</div>
          </footer>
        </DashboardLayout>
      )}
    </>
  );
}
