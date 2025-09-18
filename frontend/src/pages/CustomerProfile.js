import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

function PaymentStatusPill({ status }){
  const color = { Paid: '#22c55e', Partial: '#f59e0b', Unpaid: '#ef4444' }[status] || '#64748b';
  return <span style={{ padding: '2px 8px', borderRadius: 999, border: `1px solid ${color}`, color }}>{status}</span>;
}

export default function CustomerProfile(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: c }, { data: o }] = await Promise.all([
        axios.get(`/api/customers/${id}`),
        axios.get(`/api/orders/by-customer/${id}`),
      ]);
      setCustomer(c.customer);
      setOrders(o.orders || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const header = useMemo(() => customer ? (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
      <div><strong>Name:</strong> {customer.name}</div>
      <div><strong>Phone:</strong> {customer.phone}</div>
      <div><strong>Email:</strong> {customer.email || '-'}</div>
      <div><strong>Address:</strong> {customer.address || '-'}</div>
      <div><strong>Style Notes:</strong> {customer.styleNotes || '-'}</div>
      <div>
        <Link to={`/customers/${id}/measurements`} className="secondary">Edit Measurements</Link>
      </div>
    </div>
  ) : null, [customer, id]);

  return (
    <DashboardLayout title={`Customer · ${customer?.name || ''}`} actions={<>
      <button className="secondary" onClick={() => navigate(-1)}>Back</button>
    </>}>
      {loading ? 'Loading…' : error ? (<div style={{ color: '#b91c1c' }}>{error}</div>) : (
        <>
          <div className="section">
            <h3 className="section-title">Profile</h3>
            {header}
          </div>

          <div className="section">
            <h3 className="section-title">Order History</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Bill</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(orders || []).map((o) => (
                  <OrderRow key={o._id} order={o} />
                ))}
                {(!orders || orders.length === 0) && (
                  <tr><td colSpan={7} style={{ color: 'var(--muted)' }}>No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function OrderRow({ order }){
  const [bill, setBill] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/bills/by-order/${order._id}`);
        setBill(data.bill);
      } catch {
        setBill(null);
      }
    })();
  }, [order._id]);

  return (
    <tr>
      <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
      <td>{order.orderType || '-'}</td>
      <td>{order.status}</td>
      <td>₹{Number(order.totalAmount || 0).toLocaleString()}</td>
      <td>{bill ? <PaymentStatusPill status={bill.status} /> : '-'}</td>
      <td>{bill ? `₹${Number(bill.amountPaid || 0).toLocaleString()} / ₹${Number(bill.amount || 0).toLocaleString()}` : '-'}</td>
      <td>
        <Link to={`/orders/${order._id}`} className="secondary">View</Link>
      </td>
    </tr>
  );
}