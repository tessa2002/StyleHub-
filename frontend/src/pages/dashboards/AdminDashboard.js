import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardTile from '../../components/DashboardTile';
import ChartCard from '../../components/ChartCard';
import AdminDashboardLayout from '../../components/AdminDashboardLayout';
import BookAppointmentForm from '../../components/BookAppointmentForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaUsers, 
  FaUserTie, 
  FaShoppingBag, 
  FaCalendarAlt, 
  FaRuler, 
  FaFileInvoiceDollar,
  FaPlus,
  FaChartLine,
  FaBell,
  FaCog,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter,
  FaDownload,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaCheck,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalStaff: 0,
    totalOrders: 0,
    upcomingAppointments: 0,
    totalRevenue: 0,
    pendingPayments: 0
  });

  const [recentData, setRecentData] = useState({
    customers: [],
    orders: [],
    appointments: [],
    notifications: []
  });

  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError('');

        // Parallel requests; adjust endpoints to your backend as needed
        const [customersRes, staffRes, ordersRes, apptsRes, paymentsRes, notificationsRes] = await Promise.all([
          axios.get('/api/customers'),
          axios.get('/api/tailors'),
          axios.get('/api/orders'),
          axios.get('/api/appointments'),
          axios.get('/api/payments'),
          axios.get('/api/notifications')
        ]);

        const customersData = customersRes.data || [];
        const staffData = staffRes.data || [];
        const ordersData = ordersRes.data || [];
        const apptsData = apptsRes.data || [];
        const paymentsData = paymentsRes.data || [];
        const notificationsData = notificationsRes.data || [];

        setCustomers(customersData);
        setStaff(staffData);
        setOrders(ordersData);
        setAppointments(apptsData);
        setPayments(paymentsData);
        setUnreadNotifications((notificationsData || []).filter(n => !n.read).length);

        setStats({
          totalCustomers: customersData.length || 0,
          totalStaff: staffData.length || 0,
          totalOrders: ordersData.length || 0,
          upcomingAppointments: (apptsData || []).filter(a => a.status === 'scheduled').length || 0,
          totalRevenue: (paymentsData || []).filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
          pendingPayments: (paymentsData || []).filter(p => p.status === 'pending' || p.status === 'partial').length || 0,
        });

        setRecentData({
          customers: customersData.slice(0, 5),
          orders: ordersData.slice(0, 5),
          appointments: apptsData.slice(0, 5),
          notifications: notificationsData.slice(0, 5)
        });
      } catch (e) {
        setError('Failed to load dashboard data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const quickActions = [
    { title: 'Add Customer', desc: 'Register new customer', icon: FaUsers, link: '/admin/customers/new' },
    { title: 'Add Staff', desc: 'Hire new team member', icon: FaUserTie, link: '/admin/staff/new' },
    { title: 'New Order', desc: 'Create order', icon: FaShoppingBag, link: '/admin/orders/new' },
    { title: 'Book Appointment', desc: 'Schedule fitting', icon: FaCalendarAlt, link: '/admin/appointments/new' },
    { title: 'Add Measurements', desc: 'Record customer data', icon: FaRuler, link: '/admin/measurements/new' },
    { title: 'Generate Report', desc: 'View analytics', icon: FaChartLine, link: '/admin/reports' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'customers', label: 'Customers', icon: FaUsers },
    { id: 'staff', label: 'Staff', icon: FaUserTie },
    { id: 'orders', label: 'Orders', icon: FaShoppingBag },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
    { id: 'payments', label: 'Payments', icon: FaFileInvoiceDollar },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];
  // Removed dummy arrays; using live state arrays populated via API

  // No dummy loader; page is ready for real data once API is wired

  const renderOverview = () => (
    <>
      {/* Stats Overview */}
      <div className="stats-grid">
        <DashboardTile title="Total Customers" value={stats.totalCustomers} icon={FaUsers} loading={loading} error={error} bgGradient={'linear-gradient(135deg, #10b981, #059669)'} />
        <DashboardTile title="Total Staff" value={stats.totalStaff} icon={FaUserTie} loading={loading} error={error} bgGradient={'linear-gradient(135deg, #3b82f6, #2563eb)'} />
        <DashboardTile title="Total Orders" value={stats.totalOrders} icon={FaShoppingBag} loading={loading} error={error} bgGradient={'linear-gradient(135deg, #8b5cf6, #7c3aed)'} />
        <DashboardTile title="Upcoming Appointments" value={stats.upcomingAppointments} icon={FaCalendarAlt} loading={loading} error={error} bgGradient={'linear-gradient(135deg, #f59e0b, #d97706)'} />
        <DashboardTile title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={FaFileInvoiceDollar} loading={loading} error={error} bgGradient={'linear-gradient(135deg, #10b981, #059669)'} />
        <DashboardTile title="Pending Payments" value={stats.pendingPayments} icon={FaFileInvoiceDollar} loading={loading} error={error} bgGradient={'linear-gradient(135deg, #ef4444, #dc2626)'} />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <ChartCard title="Revenue Trends" loading={loading} error={error} />
        <ChartCard title="Order Status" loading={loading} error={error} />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px', color: 'var(--color-text-primary)' }}>
          Quick Actions
        </h2>
        <div className="quick-actions">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.link} className="quick-action">
                <div className="quick-action-icon">
                  <Icon />
                </div>
                <div className="quick-action-title">{action.title}</div>
                <div className="quick-action-desc">{action.desc}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );

  const renderCustomers = () => (
    <div className="management-section">
      <div className="section-header">
        <h2>Customer Management</h2>
        <div className="section-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn btn-primary">
            <FaPlus style={{ marginRight: '8px' }} />
            Add Customer
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Orders</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(customers
              .filter(c => filterStatus === 'all' || (c.status || '').toLowerCase() === filterStatus)
              .filter(c => {
                const q = searchTerm.trim().toLowerCase();
                if (!q) return true;
                return (
                  (c.name || '').toLowerCase().includes(q) ||
                  (c.email || '').toLowerCase().includes(q) ||
                  (c.phone || '').toLowerCase().includes(q)
                );
              })
            ).map(customer => (
              <tr key={customer.id}>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{customer.name}</div>
                    <div className="customer-email">{customer.email}</div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div><FaPhone className="contact-icon" /> {customer.phone}</div>
                    <div><FaEnvelope className="contact-icon" /> {customer.email}</div>
                  </div>
                </td>
                <td>
                  <div className="address-info">
                    <FaMapMarkerAlt className="address-icon" />
                    {customer.address}
                  </div>
                </td>
                <td>
                  <span className="order-count">{customer.orders}</span>
                </td>
                <td>
                  <span className={`status-badge status-${customer.status}`}>
                    {customer.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="View">
                      <FaEye />
                    </button>
                    <button className="btn-icon" title="Edit">
                      <FaEdit />
                    </button>
                    <button className="btn-icon" title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStaff = () => (
    <div className="management-section">
      <div className="section-header">
        <h2>Staff Management</h2>
        <div className="section-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary">
            <FaPlus style={{ marginRight: '8px' }} />
            Add Staff
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Contact</th>
              <th>Appointments</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(staff
              .filter(s => {
                const q = searchTerm.trim().toLowerCase();
                if (!q) return true;
                return (
                  (s.name || '').toLowerCase().includes(q) ||
                  (s.email || '').toLowerCase().includes(q) ||
                  (s.role || '').toLowerCase().includes(q)
                );
              })
            ).map(staff => (
              <tr key={staff.id}>
                <td>
                  <div className="staff-info">
                    <div className="staff-name">{staff.name}</div>
                    <div className="staff-email">{staff.email}</div>
                  </div>
                </td>
                <td>
                  <span className="role-badge">{staff.role}</span>
                </td>
                <td>
                  <div className="contact-info">
                    <div><FaPhone className="contact-icon" /> {staff.phone}</div>
                    <div><FaEnvelope className="contact-icon" /> {staff.email}</div>
                  </div>
                </td>
                <td>
                  <span className="appointment-count">{staff.appointments}</span>
                </td>
                <td>
                  <span className={`status-badge status-${staff.status}`}>
                    {staff.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="View">
                      <FaEye />
                    </button>
                    <button className="btn-icon" title="Edit">
                      <FaEdit />
                    </button>
                    <button className="btn-icon" title="Deactivate">
                      <FaTimes />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="management-section">
      <div className="section-header">
        <h2>Order Management</h2>
        <div className="section-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button className="btn btn-primary">
            <FaPlus style={{ marginRight: '8px' }} />
            New Order
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Staff</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(orders
              .filter(o => filterStatus === 'all' || (o.status || '').toLowerCase() === filterStatus.replace('-', '_'))
              .filter(o => {
                const q = searchTerm.trim().toLowerCase();
                if (!q) return true;
                return (
                  (o.id || '').toLowerCase().includes(q) ||
                  (o.customer || '').toLowerCase().includes(q)
                );
              })
            ).map(order => (
              <tr key={order.id}>
                <td>
                  <span className="order-id">{order.id}</span>
                </td>
                <td>{order.customer}</td>
                <td>₹{order.amount.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-${order.status.replace('_', '-')}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <span className={`payment-badge payment-${order.payment}`}>
                    {order.payment}
                  </span>
                </td>
                <td>{order.staff}</td>
                <td>{order.date}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="View">
                      <FaEye />
                    </button>
                    <button className="btn-icon" title="Edit">
                      <FaEdit />
                    </button>
                    <button className="btn-icon" title="Update Status">
                      <FaCheck />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="management-section">
      <div className="section-header">
        <h2>Appointment Management</h2>
        <div className="section-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search appointments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary">
            <FaPlus style={{ marginRight: '8px' }} />
            Book Appointment
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Staff</th>
              <th>Date & Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(appointments
              .filter(a => {
                const q = searchTerm.trim().toLowerCase();
                if (!q) return true;
                return (
                  (a.customer || '').toLowerCase().includes(q) ||
                  (a.staff || '').toLowerCase().includes(q)
                );
              })
            ).map(appointment => (
              <tr key={appointment.id}>
                <td>{appointment.customer}</td>
                <td>{appointment.staff}</td>
                <td>
                  <div className="datetime-info">
                    <div>{appointment.date}</div>
                    <div><FaClock className="time-icon" /> {appointment.time}</div>
                  </div>
                </td>
                <td>
                  <span className="type-badge">{appointment.type}</span>
                </td>
                <td>
                  <span className={`status-badge status-${appointment.status}`}>
                    {appointment.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="View">
                      <FaEye />
                    </button>
                    <button className="btn-icon" title="Reschedule">
                      <FaEdit />
                    </button>
                    <button className="btn-icon" title="Cancel">
                      <FaTimes />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="management-section">
      <div className="section-header">
        <h2>Payments & Billing</h2>
        <div className="section-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search payments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
          </select>
          <button className="btn btn-secondary">
            <FaDownload style={{ marginRight: '8px' }} />
            Export
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Method</th>
              <th>Order ID</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(payments
              .filter(p => filterStatus === 'all' || (p.status || '').toLowerCase() === filterStatus)
              .filter(p => {
                const q = searchTerm.trim().toLowerCase();
                if (!q) return true;
                return (
                  (p.id || '').toLowerCase().includes(q) ||
                  (p.customer || '').toLowerCase().includes(q)
                );
              })
            ).map(payment => (
              <tr key={payment.id}>
                <td>
                  <span className="invoice-id">{payment.id}</span>
                </td>
                <td>{payment.customer}</td>
                <td>₹{payment.amount.toLocaleString()}</td>
                <td>
                  <span className={`payment-badge payment-${payment.status}`}>
                    {payment.status}
                  </span>
                </td>
                <td>{payment.method}</td>
                <td>{payment.orderId}</td>
                <td>{payment.date}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="View">
                      <FaEye />
                    </button>
                    <button className="btn-icon" title="Download">
                      <FaDownload />
                    </button>
                    <button className="btn-icon" title="Mark Paid">
                      <FaCheck />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <AdminDashboardLayout 
      title="Admin Dashboard" 
      actions={
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary">
            <FaBell style={{ marginRight: '8px' }} />
            Notifications
          </button>
          <button className="btn btn-primary">
            <FaCog style={{ marginRight: '8px' }} />
            Settings
          </button>
        </div>
      }
    >
      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="tab-icon" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'customers' && renderCustomers()}
        {activeTab === 'staff' && renderStaff()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'payments' && renderPayments()}
      </div>

      <section>
        <h2>Book Appointment</h2>
        <BookAppointmentForm />
      </section>
      <ToastContainer />
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;