import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

export default function OrderDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [bill, setBill] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', method: 'Cash', reference: '' });

  const load = async () => {
    try {
      const { data } = await axios.get(`/api/orders/${id}`);
      setOrder(data.order);
      setStatus(data.order?.status || '');
      try {
        const { data: b } = await axios.get(`/api/bills/by-order/${id}`);
        setBill(b.bill);
      } catch {
        setBill(null);
      }
    } catch {
      setOrder(null);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const updateStatus = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(`/api/orders/${id}`, { status });
      setOrder(data.order);
    } finally {
      setSaving(false);
    }
  };

  if (!order) return <DashboardLayout title="Order"><div className="section">Not found</div></DashboardLayout>;

  return (
    <DashboardLayout title={`Order · ${order.customer?.name || ''}`} actions={<>
      <button className="secondary" onClick={() => navigate(-1)}>Back</button>
    </>}>
      <div className="section">
        <h3 className="section-title">Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><strong>Customer:</strong> {order.customer?.name} ({order.customer?.phone})</div>
          <div><strong>Type:</strong> {order.orderType || '-'}</div>
          <div><strong>Status:</strong> {order.status}</div>
          <div><strong>Delivery:</strong> {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : '-'}</div>
          <div><strong>Total:</strong> ₹{Number(order.totalAmount || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Items</h3>
        <table className="table">
          <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
          <tbody>
            {(order.items || []).map((it, idx) => (
              <tr key={idx}><td>{it.name}</td><td>{it.quantity}</td><td>₹{Number(it.price || 0).toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h3 className="section-title">Fabric</h3>
        {order.fabric?.source === 'shop' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <div><strong>Fabric:</strong> {order.fabric?.name || '-'}{order.fabric?.color ? ` — ${order.fabric.color}` : ''}</div>
            <div><strong>Used:</strong> {order.fabric?.quantity} {order.fabric?.unit || 'm'}</div>
            <div><strong>Cost:</strong> ₹{Number(order.fabric?.cost || 0).toLocaleString()}</div>
          </div>
        ) : order.fabric?.source === 'customer' ? (
          <div>
            <strong>Customer Provided:</strong> {order.fabric?.notes || '-'}{order.fabric?.quantity ? ` — ${order.fabric.quantity} ${order.fabric.unit || 'm'}` : ''}
          </div>
        ) : (
          <div style={{ color: 'var(--muted)' }}>No fabric recorded</div>
        )}
      </div>

      <div className="section">
        <h3 className="section-title">Embroidery</h3>
        {!order.customizations?.embroidery?.enabled ? (
          <div style={{ color: 'var(--muted)' }}>No embroidery</div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 10 }}>
              <div><strong>Type:</strong> {order.customizations.embroidery.type}</div>
              <div><strong>Pattern:</strong> {order.customizations.embroidery.pattern}</div>
              <div><strong>Placement:</strong> {(order.customizations.embroidery.placements||[]).join(', ') || '-'}</div>
              <div><strong>Colors:</strong> {(order.customizations.embroidery.colors||[]).join(', ') || '-'}</div>
              <div><strong>Status:</strong> {order.customizations.embroidery.status || 'pending'}</div>
              <div><strong>Cost:</strong> ₹{Number(order.customizations.embroidery.pricing?.total || 0).toLocaleString()}</div>
              {order.customizations.embroidery.notes ? (
                <div style={{ gridColumn:'1 / -1' }}><strong>Notes:</strong> {order.customizations.embroidery.notes}</div>
              ) : null}
            </div>
            {order.customizations.embroidery.status !== 'complete' && (
              <div style={{ marginTop: 10 }}>
                <button className="secondary" onClick={async () => {
                  const { data } = await axios.put(`/api/orders/${order._id}/embroidery/complete`);
                  setOrder(data.order);
                }}>Mark Embroidery Complete (move to Finishing)</button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="section">
        <h3 className="section-title">Attachments</h3>
        {(!order.attachments || order.attachments.length === 0) ? (
          <div style={{ color: 'var(--muted)' }}>No files uploaded</div>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {order.attachments.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noreferrer" style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 6, textDecoration: 'none' }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>{a.category}</div>
                {a.mimeType?.startsWith('image/') ? (
                  <img alt={a.filename} src={a.url} style={{ width: 120, height: 120, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 120, height: 120, display: 'grid', placeItems: 'center', background: '#f8fafc', color: '#64748b' }}>File</div>
                )}
                <div style={{ fontSize: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.filename}</div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h3 className="section-title">Status</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={status} onChange={e=> setStatus(e.target.value)}>
            {['Pending','In Progress','Ready','Delivered','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="primary" onClick={updateStatus} disabled={saving}>{saving ? 'Saving…' : 'Update'}</button>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Billing & Payments</h3>
        {!bill ? (
          <button className="primary" onClick={async () => {
            const amount = Number(order.totalAmount || 0);
            const { data } = await axios.post('/api/bills/generate', { orderId: order._id, amount, paymentMethod: 'Cash' });
            setBill(data.bill);
          }}>Generate Bill</button>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div><strong>Amount:</strong> ₹{Number(bill.amount || 0).toLocaleString()}</div>
              <div><strong>Paid:</strong> ₹{Number(bill.amountPaid || 0).toLocaleString()}</div>
              <div><strong>Status:</strong> {bill.status}</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <h4 style={{ marginBottom: 8 }}>Record Payment</h4>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" step="0.01" placeholder="Amount" value={payForm.amount} onChange={e=> setPayForm(f => ({ ...f, amount: e.target.value }))} />
                <select value={payForm.method} onChange={e=> setPayForm(f => ({ ...f, method: e.target.value }))}>
                  {['Cash','Card','UPI'].map(m => <option key={m}>{m}</option>)}
                </select>
                <input placeholder="Reference (optional)" value={payForm.reference} onChange={e=> setPayForm(f => ({ ...f, reference: e.target.value }))} />
                <button className="secondary" onClick={async () => {
                  const payload = { amount: Number(payForm.amount || 0), method: payForm.method, reference: payForm.reference };
                  const { data } = await axios.post(`/api/bills/${bill._id}/payments`, payload);
                  setBill(data.bill);
                  setPayForm({ amount: '', method: 'Cash', reference: '' });
                }}>Add Payment</button>
                <button className="secondary" onClick={() => {
                  // Simple print-friendly receipt: open a new window with content and trigger print.
                  const w = window.open('', '_blank');
                  const rows = (bill.payments || []).map(p => `<tr><td>${new Date(p.paidAt).toLocaleString()}</td><td>${p.method}</td><td>₹${Number(p.amount).toLocaleString()}</td><td>${p.reference || ''}</td></tr>`).join('');
                  w.document.write(`
                    <html><head><title>Receipt</title></head><body>
                      <h2>Receipt</h2>
                      <div>Order: ${order._id}</div>
                      <div>Customer: ${order.customer?.name} (${order.customer?.phone})</div>
                      <div>Amount: ₹${Number(bill.amount || 0).toLocaleString()}</div>
                      <div>Paid: ₹${Number(bill.amountPaid || 0).toLocaleString()}</div>
                      <div>Status: ${bill.status}</div>
                      <hr/>
                      <table border="1" cellspacing="0" cellpadding="6">
                        <thead><tr><th>Date</th><th>Method</th><th>Amount</th><th>Reference</th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="4">No payments</td></tr>'}</tbody>
                      </table>
                      <script>window.print();</script>
                    </body></html>
                  `);
                  w.document.close();
                }}>Print Receipt</button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="section">
        <h3 className="section-title">Measurement Snapshot</h3>
        <div className="cards">
          {['height','chest','waist','hips','shoulder','sleeve','armLength','legLength','neck'].map(k => (
            <div key={k} className="card">
              <div className="card-title">{k}</div>
              <div className="card-value">{order.measurementSnapshot?.[k] ?? '-'}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}