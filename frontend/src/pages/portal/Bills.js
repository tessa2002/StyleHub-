import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

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

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('http://localhost:5000/api/portal/bills');
      setRows(data.bills || []);
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
      const { data } = await axios.get(`http://localhost:5000/api/portal/bills/${id}`);
      setBill(data.bill);
    } catch (e) {
      setDetailsOpen(false);
      alert(e.response?.data?.message || 'Failed to load bill');
    } finally {
      setDetailsLoading(false);
    }
  }

  const formatCurrency = (n) => (n ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Bills & Invoices</h2>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <input placeholder="Search bill/order/date/status/amount" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="field-error" role="alert">{error}</div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table responsive-table">
              <thead>
                <tr>
                  <th>Bill / Invoice No</th>
                  <th>Order ID</th>
                  <th>Date Issued</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Balance</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const balance = (r.amount || 0) - (r.amountPaid || 0);
                  return (
                    <tr key={r._id}>
                      <td data-label="Bill / Invoice No" style={{ fontFamily:'monospace', color:'#6b7280' }}>{r._id}</td>
                      <td data-label="Order ID" style={{ fontFamily:'monospace' }}>{r.order?._id || '-'}</td>
                      <td data-label="Date Issued">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td data-label="Total Amount">{formatCurrency(r.amount)}</td>
                      <td data-label="Paid Amount">{formatCurrency(r.amountPaid)}</td>
                      <td data-label="Balance">{formatCurrency(balance)}</td>
                      <td data-label="Payment Status">{statusBadge(r.status)}</td>
                      <td data-label="Actions" style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <button className="btn btn-sm" onClick={() => openDetails(r._id)}>View Details</button>
                        {/* Mini: omit Pay Now and PDF */}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan="8" style={{ textAlign:'center', padding: 16 }}>No bills found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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