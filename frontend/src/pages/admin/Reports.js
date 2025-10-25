import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import {
  FaMoneyBillWave, FaShoppingBag, FaUsers, FaCalendarAlt,
  FaDownload, FaChartLine, FaFileInvoice, FaPrint
} from 'react-icons/fa';
import './Reports.css';

const Reports = () => {
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingPayments: 0,
    paidPayments: 0,
    partialPayments: 0,
    monthlyRevenue: [],
    topCustomers: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportType, setReportType] = useState('all');

  useEffect(() => {
    fetchReportData();
  }, [dateFrom, dateTo, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      if (reportType !== 'all') params.set('type', reportType);

      const response = await axios.get(`/api/reports/income?${params.toString()}`);
      setReportData(response.data.report || {});
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format = 'pdf') => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      params.set('format', format);

      const response = await axios.get(`/api/reports/download?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `income-report-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="reports-page">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading reports...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="reports-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Income Reports</h1>
            <p>View detailed income reports, customer data, and order history</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={printReport}>
              <FaPrint /> Print Report
            </button>
            <button className="btn btn-primary" onClick={() => downloadReport('pdf')}>
              <FaDownload /> Download PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>From Date:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="filter-group">
            <label>To Date:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="filter-group">
            <label>Report Type:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-control"
            >
              <option value="all">All</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card revenue">
            <div className="card-icon">
              <FaMoneyBillWave />
            </div>
            <div className="card-content">
              <h3>Total Revenue</h3>
              <p className="card-value">₹{reportData.totalRevenue?.toLocaleString() || '0'}</p>
              <span className="card-label">All time</span>
            </div>
          </div>

          <div className="summary-card orders">
            <div className="card-icon">
              <FaShoppingBag />
            </div>
            <div className="card-content">
              <h3>Total Orders</h3>
              <p className="card-value">{reportData.totalOrders || 0}</p>
              <span className="card-label">Completed & Delivered</span>
            </div>
          </div>

          <div className="summary-card customers">
            <div className="card-icon">
              <FaUsers />
            </div>
            <div className="card-content">
              <h3>Total Customers</h3>
              <p className="card-value">{reportData.totalCustomers || 0}</p>
              <span className="card-label">Active customers</span>
            </div>
          </div>

          <div className="summary-card average">
            <div className="card-icon">
              <FaChartLine />
            </div>
            <div className="card-content">
              <h3>Average Order Value</h3>
              <p className="card-value">
                ₹{reportData.totalOrders > 0 
                  ? Math.round(reportData.totalRevenue / reportData.totalOrders).toLocaleString()
                  : '0'}
              </p>
              <span className="card-label">Per order</span>
            </div>
          </div>
        </div>

        {/* Payment Status Breakdown */}
        <div className="report-section">
          <h2>Payment Status Breakdown</h2>
          <div className="payment-status-grid">
            <div className="status-card paid">
              <div className="status-header">
                <h4>Fully Paid</h4>
                <FaFileInvoice />
              </div>
              <p className="status-value">₹{reportData.paidPayments?.toLocaleString() || '0'}</p>
            </div>
            <div className="status-card partial">
              <div className="status-header">
                <h4>Partially Paid</h4>
                <FaFileInvoice />
              </div>
              <p className="status-value">₹{reportData.partialPayments?.toLocaleString() || '0'}</p>
            </div>
            <div className="status-card pending">
              <div className="status-header">
                <h4>Pending</h4>
                <FaFileInvoice />
              </div>
              <p className="status-value">₹{reportData.pendingPayments?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="report-section">
          <h2>Top Customers by Revenue</h2>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Total Orders</th>
                  <th>Total Spent</th>
                  <th>Last Order</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topCustomers && reportData.topCustomers.length > 0 ? (
                  reportData.topCustomers.map((customer, index) => (
                    <tr key={index}>
                      <td>{customer.name || 'N/A'}</td>
                      <td>{customer.totalOrders || 0}</td>
                      <td>₹{customer.totalSpent?.toLocaleString() || '0'}</td>
                      <td>{customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">No customer data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="report-section">
          <h2>Recent Order History</h2>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {reportData.recentOrders && reportData.recentOrders.length > 0 ? (
                  reportData.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id?.slice(-6)}</td>
                      <td>{order.customer?.name || 'N/A'}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge status-${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge payment-${order.paymentStatus?.toLowerCase()}`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td>₹{order.totalAmount?.toLocaleString() || '0'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Revenue Chart (Simplified table view) */}
        <div className="report-section">
          <h2>Monthly Revenue Breakdown</h2>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {reportData.monthlyRevenue && reportData.monthlyRevenue.length > 0 ? (
                  reportData.monthlyRevenue.map((month, index) => (
                    <tr key={index}>
                      <td>{month.month}</td>
                      <td>{month.orders}</td>
                      <td>₹{month.revenue?.toLocaleString() || '0'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="no-data">No monthly data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;

