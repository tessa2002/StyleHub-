import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import OrderStatusTracker from '../../components/OrderStatusTracker';
import './Orders.css';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaTruck, 
  FaRedoAlt, 
  FaFileInvoice, 
  FaDownload, 
  FaChevronLeft, 
  FaChevronRight,
  FaMoon,
  FaTshirt,
  FaCrown,
  FaRegCalendarAlt,
  FaMoneyBillWave,
  FaWallet
} from 'react-icons/fa';
import { GiAmpleDress, GiTrousers, GiSuitcase } from 'react-icons/gi';
import { toast } from 'react-toastify';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, amount, status
  const [sortDir, setSortDir] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Details modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await axios.get('/api/portal/orders');
        setOrders(data.orders || []);
        
        // Check if redirected from successful payment
        const params = new URLSearchParams(window.location.search);
        if (params.get('paymentSuccess') === '1') {
          toast.success('✅ Payment completed! You can download your receipt below.', {
            position: 'top-center',
            autoClose: 5000,
          });
          // Clean up URL
          window.history.replaceState({}, '', '/portal/orders');
        }
      } catch (e) {
        console.error('Failed to load orders', e);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derived list
  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    let list = orders.slice();

    // Search by order id suffix or product name
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(o =>
        (o._id || '').toLowerCase().includes(q) ||
        (o.items || []).some(it => (it.name || it.itemType || '').toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'all') list = list.filter(o => (o.status || '').toLowerCase() === statusFilter);

    // Date range
    if (from) list = list.filter(o => o.createdAt && new Date(o.createdAt) >= from);
    if (to) list = list.filter(o => o.createdAt && new Date(o.createdAt) <= new Date(new Date(to).getTime() + 24*60*60*1000 - 1));

    // Sort
    list.sort((a, b) => {
      let av, bv;
      if (sortBy === 'createdAt') {
        av = new Date(a.createdAt || 0).getTime();
        bv = new Date(b.createdAt || 0).getTime();
      } else if (sortBy === 'amount') {
        av = Number(a.totalAmount || 0);
        bv = Number(b.totalAmount || 0);
      } else if (sortBy === 'status') {
        av = (a.status || '').localeCompare(b.status || '');
        bv = 0; // av already contains compare result; handle below
        return sortDir === 'asc' ? av : -av;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    return list;
  }, [orders, query, statusFilter, dateFrom, dateTo, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openDetails = async (order) => {
    setSelectedOrder(order);
    setDetails(null);
    setDetailsLoading(true);
    try {
      const { data: ordRes } = await axios.get(`/api/portal/orders/${order._id}`);
      const orderDetail = ordRes.order || order;
      let bill = null;
      try {
        const { data: billRes } = await axios.get(`/api/portal/bills/by-order/${order._id}`);
        bill = billRes.bill || null;
      } catch {}
      setDetails({ order: orderDetail, bill });
    } catch (e) {
      toast.error('Failed to load order details');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <DashboardLayout title="My Orders">
      <div className="orders-page-v2">
        {/* Page Header */}
        <div className="page-header-v2">
          <div className="header-left">
            <h1 className="page-title">My Orders</h1>
            <p className="page-subtitle">Manage and track your bespoke tailoring requests.</p>
          </div>
          <div className="header-right">
            <button className="theme-toggle"><FaMoon /></button>
            <div className="user-avatar-circle">T</div>
          </div>
        </div>
        
        {/* Filters Toolbar */}
        <div className="orders-toolbar-v2">
          <div className="filter-item">
            <label>STATUS</label>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">All Status</option>
              <option value="order placed">Order Placed</option>
              <option value="cutting">Cutting</option>
              <option value="stitching">Stitching</option>
              <option value="trial">Trial</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-item">
            <label>FROM DATE</label>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="filter-item">
            <label>TO DATE</label>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
          </div>
          <div className="filter-item">
            <label>SORT BY</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="createdAt">Date (Newest)</option>
              <option value="amount">Amount</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div className="search-box-v2">
            <FaSearch className="search-icon" />
            <input
              placeholder="Search orders.."
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading">Loading orders…</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <div className="orders-grid-v2">
            {current.map(o => (
              <OrderCard
                key={o._id}
                order={o}
                onView={() => openDetails(o)}
              />
            ))}
            {filtered.length === 0 && <div className="empty">No orders found</div>}
          </div>
        )}

        {/* Pagination V2 */}
        {filtered.length > 0 && (
          <div className="pagination-v2">
            <button className="page-nav" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              <FaChevronLeft />
            </button>
            <div className="page-numbers">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i+1} 
                  className={`page-num ${page === i + 1 ? 'active' : ''}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button className="page-nav" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              <FaChevronRight />
            </button>
          </div>
        )}

        {/* Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            details={details}
            loading={detailsLoading}
            onClose={() => { setSelectedOrder(null); setDetails(null); }}
          />)
        }
      </div>
    </DashboardLayout>
  );
}

function OrderCard({ order, onView }) {
  const [bill, setBill] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [downloadingReceipt, setDownloadingReceipt] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get(`/api/portal/bills/by-order/${order._id}`);
        if (active) setBill(data.bill);
      } catch {
        if (active) setBill(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [order._id]);

  const downloadReceipt = async (e) => {
    e.stopPropagation();
    if (!bill) return;
    setDownloadingReceipt(true);
    try {
      const response = await axios.get(`/api/portal/bills/${bill._id}/receipt`);
      const receiptWindow = window.open('', '_blank');
      if (receiptWindow) {
        receiptWindow.document.write(response.data);
        receiptWindow.document.close();
      } else {
        toast.error('Please allow popups to view receipt');
      }
    } catch (error) {
      toast.error('Failed to load receipt');
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const getOrderIcon = () => {
    const type = (order.items?.[0]?.itemType || '').toLowerCase();
    const name = (order.items?.[0]?.name || '').toLowerCase();
    
    if (name.includes('blazer') || name.includes('suit')) return <GiSuitcase style={{ color: '#64748b' }} />;
    if (name.includes('shirt')) return <FaTshirt style={{ color: '#64748b' }} />;
    if (name.includes('gown') || name.includes('dress')) return <GiAmpleDress style={{ color: '#64748b' }} />;
    if (name.includes('trousers') || name.includes('pant')) return <GiTrousers style={{ color: '#64748b' }} />;
    
    // Fallback by type
    if (type.includes('shirt')) return <FaTshirt />;
    if (type.includes('blazer') || type.includes('suit')) return <GiSuitcase />;
    if (type.includes('dress')) return <GiAmpleDress />;
    
    return <FaTshirt />; // Default icon
  };

  const date = order.createdAt ? new Date(order.createdAt) : new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();

  const isPaid = bill?.status === 'Paid';

  return (
    <div className="order-card-v2" onClick={onView}>
      <div className="card-icon-area">
        <div className="icon-circle">
           {getOrderIcon()}
        </div>
      </div>
      <div className="card-content-area">
        <div className="card-top">
          <span className="order-number">ORDER #{order._id?.slice(-7).toUpperCase()}</span>
          <span className={`status-badge-v2 ${(order.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
            {(order.status || 'ORDER PLACED').toUpperCase()}
          </span>
        </div>
        <h3 className="order-item-title">{order.items?.[0]?.name || 'Bespoke Item'}</h3>
        <div className="card-details">
          <div className="detail-col">
            <span className="detail-label">DATE</span>
            <span className="detail-value">{day} {month} {year}</span>
          </div>
          <div className="detail-col">
            <span className="detail-label">PAYMENT</span>
            <span className={`payment-status ${isPaid ? 'paid' : 'pending'}`}>
              {isPaid ? '● Paid' : '● Pending'}
            </span>
          </div>
          <div className="detail-col">
            <span className="detail-label">TOTAL</span>
            <span className="detail-value">₹{Number(order.totalAmount || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="card-actions-v2">
        <button className="action-btn" onClick={(e) => { e.stopPropagation(); onView(); }}>
          <FaEye />
        </button>
        {isPaid && (
          <button className="action-btn download" onClick={downloadReceipt} disabled={downloadingReceipt}>
            <FaDownload />
          </button>
        )}
        {!isPaid && !loading && bill && (
          <button className="action-btn pay" title="Pay Now" onClick={(e) => { e.stopPropagation(); /* Pay logic */ }}>
            <FaWallet />
          </button>
        )}
      </div>
    </div>
  );
}


// Details Modal for an order
function OrderDetailsModal({ order, details, loading, onClose }) {
  const ord = details?.order || order;
  const bill = details?.bill || null;
  const [payments, setPayments] = React.useState([]);
  const [loadingPayments, setLoadingPayments] = React.useState(true);
  const [downloadingReceipt, setDownloadingReceipt] = React.useState(false);

  const downloadReceipt = async () => {
    if (!bill) return;
    setDownloadingReceipt(true);
    try {
      const response = await axios.get(`/api/portal/bills/${bill._id}/receipt`);
      const receiptWindow = window.open('', '_blank');
      if (receiptWindow) {
        receiptWindow.document.write(response.data);
        receiptWindow.document.close();
      } else {
        toast.error('Please allow popups to view receipt');
      }
    } catch (error) {
      console.error('Receipt download error:', error);
      toast.error('Failed to load receipt: ' + (error.response?.data?.message || error.message));
    } finally {
      setDownloadingReceipt(false);
    }
  };

  React.useEffect(() => {
    const fetchPayments = async () => {
      if (!bill?._id) {
        setLoadingPayments(false);
        return;
      }
      try {
        const { data } = await axios.get(`/api/portal/payments/by-bill/${bill._id}`);
        setPayments(data.payments || []);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoadingPayments(false);
      }
    };
    fetchPayments();
  }, [bill?._id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Order Details</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {loading ? (
          <div className="loading">Loading details…</div>
        ) : (
          <div className="modal-content">
            {/* Order Status Tracker */}
            <OrderStatusTracker currentStatus={ord.status} />

            <div className="details-grid">
              <div>
                <div className="detail"><strong>Order ID:</strong> {ord._id}</div>
                <div className="detail"><strong>Date:</strong> {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : '-'}</div>
                <div className="detail"><strong>Status:</strong> <span className={`badge status-${(ord.status || 'default').toLowerCase().replace(/\s+/g,'-')}`}>{ord.status || '-'}</span></div>
                {ord.expectedDelivery && (
                  <div className="detail"><strong>ETA:</strong> {new Date(ord.expectedDelivery).toLocaleDateString()}</div>
                )}
              </div>
              <div>
                <div className="detail"><strong>Total:</strong> ₹{Number(ord.totalAmount || 0).toLocaleString()}</div>
                <div className="detail"><strong>Payment Status:</strong> {bill ? <span className={`badge payment-${(bill.status || 'pending').toLowerCase()}`}>{bill.status}</span> : '—'}</div>
                {bill && bill.amountPaid > 0 && (
                  <div className="detail"><strong>Amount Paid:</strong> ₹{Number(bill.amountPaid || 0).toLocaleString()}</div>
                )}
                {bill && bill.amount > bill.amountPaid && (
                  <div className="detail"><strong>Balance Due:</strong> ₹{Number(bill.amount - bill.amountPaid || 0).toLocaleString()}</div>
                )}
                {bill && (
                  <>
                    <div className="detail">
                      <strong>Invoice:</strong> 
                      <button 
                        className="btn btn-success btn-small" 
                        onClick={downloadReceipt}
                        disabled={downloadingReceipt}
                        style={{ marginLeft: '10px' }}
                      >
                        <FaFileInvoice /> {downloadingReceipt ? 'Loading...' : 'Download Receipt'}
                      </button>
                    </div>
                    <div className="detail">
                      <strong>Bill Number:</strong> 
                      <span>{bill.billNumber || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment History Section */}
            {bill && (
              <div className="payment-history-section">
                <h4>Payment Details</h4>
                {loadingPayments ? (
                  <div className="loading-small">Loading payment details...</div>
                ) : payments.length > 0 ? (
                  <table className="payment-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Transaction ID</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment, idx) => (
                        <tr key={idx}>
                          <td>{payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '-'}</td>
                          <td>{payment.method || payment.paymentMode || '-'}</td>
                          <td>₹{Number(payment.amount || 0).toLocaleString()}</td>
                          <td><code>{payment.razorpayPaymentId || payment.transactionId || '-'}</code></td>
                          <td>
                            <span className={`badge payment-${(payment.status || 'pending').toLowerCase()}`}>
                              {payment.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty">No payment records found</div>
                )}
              </div>
            )}

            {/* Items */}
            <div className="items-section">
              <h4>Items</h4>
              {Array.isArray(ord.items) && ord.items.length ? (
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ord.items.map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="product-cell">
                            {it.thumbnail && <img alt="" src={it.thumbnail} />}
                            <span>{it.name || it.itemType || 'Item'}</span>
                          </div>
                        </td>
                        <td>{it.quantity || 1}</td>
                        <td>₹{Number(it.price || 0).toLocaleString()}</td>
                        <td>₹{Number((it.price || 0) * (it.quantity || 1)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty">No items</div>
              )}
            </div>

            {/* Addresses */}
            <div className="addresses">
              <div>
                <h4>Shipping Address</h4>
                <div className="addr">{ord.shippingAddress || ord.deliveryAddress || '—'}</div>
              </div>
              <div>
                <h4>Billing Address</h4>
                <div className="addr">{ord.billingAddress || '—'}</div>
              </div>
            </div>

            {/* Tracking */}
            <div className="tracking">
              <h4>Shipment</h4>
              {ord.tracking?.number ? (
                <div className="tracking-grid">
                  <div><strong>Carrier:</strong> {ord.tracking.carrier || '—'}</div>
                  <div><strong>Tracking #:</strong> {ord.tracking.number}</div>
                  <div><strong>Link:</strong> <a href={ord.tracking.url} target="_blank" rel="noreferrer">Track</a></div>
                </div>
              ) : (
                <div className="empty">No tracking available</div>
              )}
            </div>

            {/* Support */}
            <div className="support">
              Having an issue with this order? <a href="/portal/support">Contact Support</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}