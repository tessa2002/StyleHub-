import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminDashboardLayout from '../../components/AdminDashboardLayout';
import { FaUsers, FaUserTie, FaUserCheck, FaShoppingCart, FaCalendarCheck, FaRupeeSign, FaFileInvoiceDollar, FaPlus, FaChartLine } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { toast } from 'react-toastify';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load metrics and charts data
      const [metricsRes, chartsRes] = await Promise.all([
        axios.get('/api/admin/metrics/overview'),
        axios.get('/api/admin/metrics/charts')
      ]);
      
      setMetrics(metricsRes.data);
      setCharts(chartsRes.data);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
      setError('');
      
      // Fallback to mock data for demo
      setMetrics({
        customers: 156,
        staff: 8,
        tailors: 12,
        orders: 89,
        upcomingAppointments: 23,
        revenue: 125000,
        pendingPayments: 15,
        notificationsCount: 5
      });
      
      setCharts({
        revenueOverTime: [
          { month: 'Jan', revenue: 45000 },
          { month: 'Feb', revenue: 52000 },
          { month: 'Mar', revenue: 48000 },
          { month: 'Apr', revenue: 61000 },
          { month: 'May', revenue: 55000 },
          { month: 'Jun', revenue: 67000 }
        ],
        orderStatus: [
          { name: 'Completed', value: 45, color: '#10b981' },
          { name: 'In Progress', value: 25, color: '#3b82f6' },
          { name: 'Pending', value: 20, color: '#f59e0b' },
          { name: 'Cancelled', value: 10, color: '#ef4444' }
        ],
        customerGrowth: [
          { month: 'Jan', customers: 120 },
          { month: 'Feb', customers: 135 },
          { month: 'Mar', customers: 142 },
          { month: 'Apr', customers: 148 },
          { month: 'May', customers: 152 },
          { month: 'Jun', customers: 156 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const summaryCards = [
    {
      title: 'Total Customers',
      value: metrics?.customers || 0,
      icon: FaUsers,
      color: '#3b82f6',
      link: '/admin/users?role=Customer'
    },
    {
      title: 'Total Staff',
      value: metrics?.staff || 0,
      icon: FaUserTie,
      color: '#8b5cf6',
      link: '/admin/users?role=Staff'
    },
    {
      title: 'Total Tailors',
      value: metrics?.tailors || 0,
      icon: FaUserCheck,
      color: '#06b6d4',
      link: '/admin/users?role=Tailor'
    },
    {
      title: 'Total Orders',
      value: metrics?.orders || 0,
      icon: FaShoppingCart,
      color: '#10b981',
      link: '/admin/orders'
    },
    {
      title: 'Upcoming Appointments',
      value: metrics?.upcomingAppointments || 0,
      icon: FaCalendarCheck,
      color: '#f59e0b',
      link: '/admin/appointments'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics?.revenue || 0),
      icon: FaRupeeSign,
      color: '#059669',
      link: '/admin/billing'
    },
    {
      title: 'Pending Payments',
      value: metrics?.pendingPayments || 0,
      icon: FaFileInvoiceDollar,
      color: '#dc2626',
      link: '/admin/billing?status=pending'
    }
  ];

  if (loading) {
    return (
      <AdminDashboardLayout title="Dashboard Overview">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout 
      title="Dashboard Overview"
      actions={
        <>
          <button className="btn btn-light" onClick={loadDashboardData}>
            <FaChartLine /> Refresh
          </button>
          <button className="btn btn-primary">
            <FaPlus /> Quick Actions
          </button>
        </>
      }
    >
      <div className="dashboard-page">
        {/* Summary Cards */}
        <div className="summary-cards">
          {summaryCards.map((card, index) => (
            <div key={index} className="summary-card" onClick={() => navigate(card.link)}>
              <div className="card-icon" style={{ backgroundColor: card.color }}>
                <card.icon />
              </div>
              <div className="card-content">
                <h3>{card.title}</h3>
                <div className="card-value">{card.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          {/* Revenue Trends */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Revenue Trends</h3>
              <span className="chart-subtitle">Last 6 months</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts?.revenueOverTime || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Order Status</h3>
              <span className="chart-subtitle">Current distribution</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts?.orderStatus || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(charts?.orderStatus || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Growth */}
          <div className="chart-card full-width">
            <div className="chart-header">
              <h3>Customer Growth</h3>
              <span className="chart-subtitle">Monthly registrations</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts?.customerGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="customers" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <div className="activity-card">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <FaUsers />
                </div>
                <div className="activity-content">
                  <p><strong>New customer registered:</strong> John Doe</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <FaShoppingCart />
                </div>
                <div className="activity-content">
                  <p><strong>Order completed:</strong> #ORD-001234</p>
                  <span className="activity-time">4 hours ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <FaCalendarCheck />
                </div>
                <div className="activity-content">
                  <p><strong>Appointment scheduled:</strong> Fitting session</p>
                  <span className="activity-time">6 hours ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="notifications-card">
            <h3>Notifications</h3>
            <div className="notification-list">
              <div className="notification-item urgent">
                <p>5 pending payments require attention</p>
                <button className="btn btn-sm btn-primary">Review</button>
              </div>
              <div className="notification-item">
                <p>System backup completed successfully</p>
                <span className="notification-time">1 hour ago</span>
              </div>
              <div className="notification-item">
                <p>Weekly report is ready for download</p>
                <button className="btn btn-sm btn-light">Download</button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <button className="quick-action-btn" onClick={() => navigate('/admin/users/new')}>
              <FaUsers />
              <span>Add Customer</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/admin/users/new?role=Staff')}>
              <FaUserTie />
              <span>Add Staff</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/admin/orders/new')}>
              <FaShoppingCart />
              <span>Create Order</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/admin/appointments/new')}>
              <FaCalendarCheck />
              <span>Schedule Appointment</span>
            </button>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
