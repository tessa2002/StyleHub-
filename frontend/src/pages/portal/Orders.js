import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import './Orders.css';
import { FaSearch, FaFilter, FaEye, FaTruck, FaRedoAlt, FaFileInvoice } from 'react-icons/fa';
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
  const pageSize = 10;

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

    // Payment filter is evaluated from bill status via child component; for list filtering we skip, but we’ll allow later enhancement.

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
      // Basic order details
      const { data: ordRes } = await axios.get(`/api/portal/orders/${order._id}`);
      const orderDetail = ordRes.order || order;
      // Bill
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

  const reorder = async (order) => {
    try {
      const items = (order.items || []).map(it => ({ name: it.name || it.itemType || '', quantity: it.quantity || 1, price: it.price || 0 }));
      if (!items.length) return toast.error('This order has no items to reorder');
      const { data } = await axios.post('/api/portal/orders', { items, notes: `Reorder of ${order._id}` });
      toast.success('Order placed');
      setOrders(prev => [data.order, ...prev]);
    } catch (e) {
      toast.error('Failed to place reorder');
    }
  };

  return (
    <DashboardLayout title="My Orders">
      <div className="orders-page">
        {/* Filters & Search */}
        <div className="orders-toolbar">
          <div className="filters">
            <div className="filter-group">
              <FaFilter className="icon" />
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="filter-group">
              <label>From</label>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="filter-group">
              <label>To</label>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
            </div>
            <div className="filter-group">
              <label>Sort</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="createdAt">Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
              </select>
              <select value={sortDir} onChange={e => setSortDir(e.target.value)}>
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
          <div className="search">
            <FaSearch className="icon" />
            <input
              placeholder="Search by Order ID or product name"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading">Loading orders…</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {current.map(o => (
                  <OrderRow
                    key={o._id}
                    order={o}
                    onView={() => openDetails(o)}
                    onReorder={() => reorder(o)}
                  />
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty">No orders found</div>}
          </div>
        )}

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
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

        {/* Optional: Quick new order (kept) */}
        <NewOrderForm onCreated={o => setOrders([o, ...orders])} />
      </div>
    </DashboardLayout>
  );
}

function OrderRow({ order, onView, onReorder }) {
  const [bill, setBill] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [paying, setPaying] = React.useState(false);

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

  const payNow = async () => {
    if (!bill || bill.status === 'Paid') return;
    setPaying(true);
    try {
      const { data } = await axios.post(`/api/portal/bills/${bill._id}/pay`);
      setBill({ ...bill, status: data.bill.status, amountPaid: data.bill.amountPaid });
      toast.success('Payment recorded');
    } catch {
      toast.error('Failed to pay bill');
    }
    setPaying(false);
  };

  return (
    <tr className="order-row">
      <td className="order-id">
        <button className="link" onClick={onView}>{order._id?.slice(-6)}</button>
      </td>
      <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
      <td>
        <span className={`badge status-${(order.status || 'default').toLowerCase().replace(/\s+/g,'-')}`}>{order.status || '-'}</span>
      </td>
      <td>
        {loading ? (
          <span className="badge payment-loading">Loading…</span>
        ) : bill ? (
          <span className={`badge payment-${(bill.status || 'Pending').toLowerCase()}`}>{bill.status}</span>
        ) : (
          <span className="badge payment-none">No bill</span>
        )}
      </td>
      <td>₹{Number(order.totalAmount || 0).toLocaleString()}</td>
      <td className="actions">
        <button className="btn btn-light" title="View Details" onClick={onView}><FaEye /></button>
        {order.tracking?.number ? (
          <a className="btn btn-light" href={order.tracking.url || '#'} target="_blank" rel="noreferrer" title="Track Shipment"><FaTruck /></a>
        ) : (
          <button className="btn btn-light" title="Track Shipment" disabled><FaTruck /></button>
        )}
        <button className="btn btn-light" title="Reorder" onClick={onReorder}><FaRedoAlt /></button>
        {!loading && bill && bill.status !== 'Paid' ? (
          <button className="btn btn-primary" disabled={paying} onClick={payNow}>{paying ? 'Paying…' : 'Pay Now'}</button>
        ) : null}
      </td>
    </tr>
  );
}

function NewOrderForm({ onCreated }) {
  const [items, setItems] = useState([{ name: '', quantity: 1, price: 0 }]);
  const [notes, setNotes] = useState('');

  const addItem = () => setItems([...items, { name: '', quantity: 1, price: 0 }]);
  const updateItem = (idx, key, val) => {
    const next = items.slice();
    next[idx][key] = key === 'quantity' || key === 'price' ? Number(val) : val;
    setItems(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/portal/orders', { items, notes });
      onCreated(data.order);
      setItems([{ name: '', quantity: 1, price: 0 }]);
      setNotes('');
      alert('Order placed');
    } catch (e) {
      alert('Failed to place order');
    }
  };

  return (
    <div className="section">
      <h3 className="section-title">Place New Order</h3>
      <form className="form" onSubmit={submit}>
        {items.map((it, i) => (
          <div className="row" key={i}>
            <input placeholder="Service (e.g., stitching)" value={it.name} onChange={e => updateItem(i, 'name', e.target.value)} />
            <input type="number" placeholder="Qty" value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
            <input type="number" placeholder="Price" value={it.price} onChange={e => updateItem(i, 'price', e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={addItem}>+ Add Item</button>
        <label>Special Instructions<textarea value={notes} onChange={e => setNotes(e.target.value)} /></label>
        <button className="primary" type="submit">Submit Order</button>
      </form>
    </div>
  );
}

// Details Modal for an order
function OrderDetailsModal({ order, details, loading, onClose }) {
  const ord = details?.order || order;
  const bill = details?.bill || null;

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
            <div className="details-grid">
              <div>
                <div className="detail"><strong>Order ID:</strong> {ord._id}</div>
                <div className="detail"><strong>Date:</strong> {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : '-'}</div>
                <div className="detail"><strong>Status:</strong> {ord.status}</div>
                {ord.expectedDelivery && (
                  <div className="detail"><strong>ETA:</strong> {new Date(ord.expectedDelivery).toLocaleDateString()}</div>
                )}
              </div>
              <div>
                <div className="detail"><strong>Total:</strong> ₹{Number(ord.totalAmount || 0).toLocaleString()}</div>
                <div className="detail"><strong>Payment:</strong> {bill ? bill.status : '—'}</div>
                {bill && (
                  <div className="detail"><strong>Invoice:</strong> <a className="btn btn-link" href={`/api/bills/${bill._id}`} target="_blank" rel="noreferrer"><FaFileInvoice /> Download</a></div>
                )}
              </div>
            </div>

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