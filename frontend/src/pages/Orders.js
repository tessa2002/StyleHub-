import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const StatusPill = ({ value }) => {
  const color = {
    Pending: '#f59e0b',
    'In Progress': '#0ea5e9',
    Ready: '#10b981',
    Delivered: '#22c55e',
    Cancelled: '#ef4444',
  }[value] || '#64748b';
  return <span style={{ padding: '4px 8px', border: `1px solid ${color}`, borderRadius: 999, color }}>{value}</span>
};

export default function Orders(){
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`);
      setOrders(data.orders || []);
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return (orders || []).filter(o => [o.customer?.name, o.customer?.phone, o.notes, o.orderType]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(term)));
  }, [orders, q]);

  return (
    <DashboardLayout title="Orders" actions={<>
      <Link to="/orders/new" className="primary">New Order</Link>
    </>}>
      <div className="section">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <input placeholder="Search orders" value={q} onChange={e=>setQ(e.target.value)} style={{ flex: 1, padding: 10, border: '1px solid var(--border)', borderRadius: 10 }} />
          <select value={status} onChange={e=>setStatus(e.target.value)} style={{ padding: 10, border: '1px solid var(--border)', borderRadius: 10 }}>
            <option value="">All</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Ready</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>

        {loading ? 'Loading…' : (
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Delivery</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(filtered || []).map(o => (
                <tr key={o._id}>
                  <td>{o.customer?.name} <div style={{ color: '#64748b', fontSize: 12 }}>{o.customer?.phone}</div></td>
                  <td>{o.orderType || '-'}</td>
                  <td>₹{Number(o.totalAmount || 0).toLocaleString()}</td>
                  <td><StatusPill value={o.status} /></td>
                  <td>{o.expectedDelivery ? new Date(o.expectedDelivery).toLocaleDateString() : '-'}</td>
                  <td>
                    <Link to={`/orders/${o._id}`} className="secondary" style={{ marginRight: 8 }}>View</Link>
                  </td>
                </tr>
              ))}
              {(!filtered || filtered.length === 0) && (
                <tr><td colSpan={6} style={{ color: 'var(--muted)' }}>No orders</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}