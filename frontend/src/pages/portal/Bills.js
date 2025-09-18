import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Bills.css';

function statusBadge(status) {
  const map = {
    Paid: 'badge badge-success',
    Partial: 'badge badge-warning',
    Unpaid: 'badge badge-danger',
  };
  return <span className={map[status] || 'badge'}>{status}</span>;
}

export default function BillsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);

  const [q, setQ] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [bill, setBill] = useState(null);

  // Billing address edit
  const [editingAddress, setEditingAddress] = useState(false);
  const [billingAddress, setBillingAddress] = useState('');
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Payment methods (stubbed UI)
  const [methods, setMethods] = useState([]); // [{id,type,last4,brand,expiry}]

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/portal/bills');
      const bills = data.bills || [];
      setRows(bills);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const t = q.toLowerCase();
    return rows.filter(r => {
      const billNo = String(r._id);
      const orderId = String(r.order?._id || '');
      const date = new Date(r.createdAt).toLocaleDateString().toLowerCase();
      const amount = String(r.amount || '');
      return billNo.toLowerCase().includes(t)
        || orderId.toLowerCase().includes(t)
        || date.includes(t)
        || amount.includes(t)
        || (r.status || '').toLowerCase().includes(t);
    });
  }, [rows, q]);

  async function openDetails(id) {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setBill(null);
    try {
      const { data } = await axios.get(`/api/portal/bills/${id}`);
      setBill(data.bill);
    } catch (e) {
      setDetailsOpen(false);
      alert(e.response?.data?.message || 'Failed to load bill');
    } finally {
      setDetailsLoading(false);
    }
  }

  const formatCurrency = (n) => (n ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

  // Summary metrics
  const summary = useMemo(() => {
    const totalBilled = rows.reduce((s, r) => s + (r.amount || 0), 0);
    const totalPaid = rows.reduce((s, r) => s + (r.amountPaid || 0), 0);
    const outstanding = Math.max(0, totalBilled - totalPaid);
    // Next due: pick the earliest created unpaid as placeholder (until dueDate exists)
    const unpaid = rows.filter(r => r.status !== 'Paid').sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt));
    const nextDue = unpaid[0] ? new Date(unpaid[0].createdAt) : null;
    return { totalPaid, outstanding, nextDue };
  }, [rows]);

  // Load initial billing address from profile once at mount (lazy)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get('/api/portal/profile');
        if (mounted) setBillingAddress(data.user?.billingAddress || data.customer?.address || '');
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const saveBillingAddress = async () => {
    setAddressError('');
    if (!billingAddress || billingAddress.trim().length < 5) {
      setAddressError('Please enter a valid billing address (min 5 characters).');
      return;
    }
    setAddressSaving(true);
    try {
      await axios.put('/api/portal/profile', { billingAddress });
      setEditingAddress(false);
    } catch (e) {
      setAddressError(e.response?.data?.message || 'Failed to save billing address');
    } finally {
      setAddressSaving(false);
    }
  };

  return (
    <div className="bills-page">
      <div className="bills-header">
        <h2>Bills & Payments</h2>
        <input className="search-input" placeholder="Search bill/order/date/status/amount" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {/* Summary */}
      <div className="summary-grid">
        <div className="card kpi">
          <div className="kpi-title">Total Paid</div>
          <div className="kpi-value">{formatCurrency(summary.totalPaid)}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-title">Outstanding Balance</div>
          <div className="kpi-value warning">{formatCurrency(summary.outstanding)}</div>
          {summary.outstanding > 0 && (
            <div className="kpi-subtext">{summary.nextDue ? `Next due approx: ${summary.nextDue.toLocaleDateString()}` : 'No due date available'}</div>
          )}
        </div>
        <div className="card kpi">
          <div className="kpi-title">Invoices</div>
          <div className="kpi-value">{rows.length}</div>
        </div>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="loading">Loading…</div>
      ) : error ? (
        <div className="alert alert-error" role="alert">{error}</div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table responsive-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Order</th>
                  <th>Issued</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const balance = (r.amount || 0) - (r.amountPaid || 0);
                  const overdue = r.status !== 'Paid' && new Date(r.createdAt) < new Date(Date.now() - 14*24*60*60*1000);
                  return (
                    <tr key={r._id} className={overdue ? 'row-overdue' : ''}>
                      <td data-label="Invoice"><button className="link" onClick={() => openDetails(r._id)}>{r._id}</button></td>
                      <td data-label="Order">{r.order?._id || '-'}</td>
                      <td data-label="Issued">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td data-label="Amount">{formatCurrency(r.amount)}</td>
                      <td data-label="Paid">{formatCurrency(r.amountPaid)}</td>
                      <td data-label="Balance">{formatCurrency(balance)}</td>
                      <td data-label="Status">{statusBadge(r.status)}</td>
                      <td data-label="Actions" className="actions">
                        <button className="btn btn-light" onClick={() => openDetails(r._id)}>View</button>
                        {r._id && (
                          <a className="btn btn-light" href={`/api/bills/${r._id}`} target="_blank" rel="noreferrer">Download</a>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan="8" className="empty">No bills found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Methods (stub UI) */}
      <div className="card methods">
        <div className="card-header">
          <h3>Payment Methods</h3>
          <button className="btn btn-primary" onClick={() => setMethods(m => [...m, { id: Date.now(), type: 'Card', brand: 'Visa', last4: '4242', expiry: '12/29' }])}>Add Method</button>
        </div>
        <div className="methods-list">
          {methods.length === 0 ? (
            <div className="empty">No saved payment methods</div>
          ) : (
            methods.map(m => (
              <div key={m.id} className="method-item">
                <div>{m.brand || m.type} •••• {m.last4} <span className="muted">Exp {m.expiry}</span></div>
                <div className="actions">
                  <button className="btn btn-light" onClick={() => setMethods(list => list.filter(x => x.id !== m.id))}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="note">Note: This is a demo UI; wiring to a real payment vault is required for production.</div>
      </div>

      {/* Billing Address */}
      <div className="card address">
        <div className="card-header"><h3>Billing Address</h3></div>
        {!editingAddress ? (
          <div className="address-view">
            <div className="addr-box">{billingAddress || 'No billing address set'}</div>
            <button className="btn btn-light" onClick={() => setEditingAddress(true)}>Edit</button>
          </div>
        ) : (
          <div className="address-edit">
            <textarea value={billingAddress} onChange={e => setBillingAddress(e.target.value)} rows={3} />
            {addressError && <div className="alert alert-error" role="alert">{addressError}</div>}
            <div className="actions">
              <button className="btn" onClick={() => setEditingAddress(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={addressSaving} onClick={saveBillingAddress}>{addressSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {detailsOpen && (
        <div className="modal-backdrop" onClick={() => (detailsLoading ? null : setDetailsOpen(false))}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Bill Details</h3>
            {detailsLoading ? (
              <div>Loading...</div>
            ) : !bill ? (
              <div className="field-error">Unable to load bill</div>
            ) : (
              <div style={{ display:'grid', gap: 10 }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:8 }}>
                  <div><strong>Invoice No:</strong> <span style={{ fontFamily:'monospace' }}>{bill._id}</span></div>
                  <div><strong>Order ID:</strong> <span style={{ fontFamily:'monospace' }}>{bill.order?._id || '-'}</span></div>
                  <div><strong>Date Issued:</strong> {new Date(bill.createdAt).toLocaleString()}</div>
                  <div><strong>Payment Method:</strong> {bill.paymentMethod}</div>
                  <div><strong>Total Amount:</strong> {formatCurrency(bill.amount)}</div>
                  <div><strong>Paid Amount:</strong> {formatCurrency(bill.amountPaid)}</div>
                  <div><strong>Balance:</strong> {formatCurrency((bill.amount||0)-(bill.amountPaid||0))}</div>
                  <div><strong>Status:</strong> {statusBadge(bill.status)}</div>
                </div>

                {/* Mini breakdown (optional) */}
                {bill.order ? (
                  <div className="card" style={{ padding:8 }}>
                    <div style={{ fontWeight:600, marginBottom:6 }}>Order Summary</div>
                    <div><strong>Order Status:</strong> {bill.order.status}</div>
                    <div><strong>Items:</strong> {(bill.order.items || []).map(it => `${it.name} x${it.quantity}`).join(', ') || '-'}</div>
                    <div><strong>Order Total:</strong> {formatCurrency(bill.order.totalAmount || bill.amount)}</div>
                  </div>
                ) : null}

                {/* Payments list */}
                {bill.payments?.length ? (
                  <div>
                    <div style={{ fontWeight:600, marginBottom:6 }}>Payments</div>
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Date</th><th>Amount</th><th>Method</th><th>Reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bill.payments.map((p, i) => (
                            <tr key={i}>
                              <td>{new Date(p.paidAt).toLocaleString()}</td>
                              <td>{formatCurrency(p.amount)}</td>
                              <td>{p.method}</td>
                              <td>{p.reference || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button className="btn btn-secondary" onClick={() => setDetailsOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .page-container { padding: 16px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px; flex-wrap: wrap; }
        .card { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); padding: 8px; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { border-bottom: 1px solid #eee; padding: 10px; text-align: left; vertical-align: top; }
        .table thead th { background: #fafafa; font-weight: 600; }
        .table-responsive { overflow-x: auto; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #ddd; font-size: 12px; }
        .badge-success { background: #10b981; color: #fff; }
        .badge-warning { background: #f59e0b; color: #fff; }
        .badge-danger { background: #ef4444; color: #fff; }
        .btn { background: #111827; color: #fff; border: 0; padding: 8px 12px; border-radius: 6px; cursor: pointer; }
        .btn:hover { opacity: 0.95; }
        .btn-sm { padding: 6px 10px; font-size: 12px; }
        .btn-secondary { background: #6b7280; }
      `}</style>
    </div>
  );
}