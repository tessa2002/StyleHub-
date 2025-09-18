import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/portal/orders');
        setOrders(data.orders || []);
      } catch {
        setOrders([]);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout title="My Orders">
      <div className="section">
        <h3 className="section-title">Orders</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Status</th>
              <th>Created</th>
              <th>Total</th>
              <th>Bill</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <OrderRow key={o._id} order={o} />
            ))}
          </tbody>
        </table>
      </div>

      <NewOrderForm onCreated={o => setOrders([o, ...orders])} />
    </DashboardLayout>
  );
}

function OrderRow({ order }) {
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
    } catch {}
    setPaying(false);
  };

  return (
    <tr>
      <td>{order._id?.slice(-6)}</td>
      <td>{order.status}</td>
      <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
      <td>{typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : '-'}</td>
      <td>
        {loading ? 'Loading…' : bill ? (
          <div style={{ display: 'grid', gap: 4 }}>
            <div>Amount: ₹{Number(bill.amount || 0).toLocaleString()}</div>
            <div>Status: {bill.status}</div>
          </div>
        ) : (
          <span style={{ color: '#64748b' }}>No bill</span>
        )}
      </td>
      <td>
        {!loading && bill && bill.status !== 'Paid' ? (
          <button className="primary" disabled={paying} onClick={payNow}>{paying ? 'Paying…' : 'Pay Now'}</button>
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