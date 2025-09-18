import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

// Lightweight inline chart without external deps if Recharts isn't installed
function MiniBar({ data }){
  const max = Math.max(1, ...data.map(d => d.v || 0));
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'end', height: 120 }}>
      {data.map((d, i) => (
        <div key={i} title={`${d.k}: ₹${d.v}`} style={{ width: 10, height: Math.max(2, (d.v / max) * 110), background: '#0ea5e9' }} />
      ))}
    </div>
  );
}

export default function Reports(){
  const [range, setRange] = useState({ from: '', to: '' });
  const [daily, setDaily] = useState([]);
  const [pending, setPending] = useState({ pending: 0, inProgress: 0, total: 0 });
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (range.from) qs.set('from', range.from);
      if (range.to) qs.set('to', range.to);
      const [{ data: d }, { data: p }, { data: t }] = await Promise.all([
        axios.get(`/api/reports/daily-sales?${qs.toString()}`),
        axios.get('/api/reports/pending-orders'),
        axios.get('/api/reports/top-customers?limit=5'),
      ]);
      setDaily((d.rows || []).map(r => ({ k: r._id, v: r.total })));
      setPending(p);
      setTop(t.rows || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const totalSales = useMemo(() => daily.reduce((s, d) => s + (d.v || 0), 0), [daily]);

  return (
    <DashboardLayout title="Reports" actions={<>
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="date" value={range.from} onChange={e=> setRange(r => ({ ...r, from: e.target.value }))} />
        <input type="date" value={range.to} onChange={e=> setRange(r => ({ ...r, to: e.target.value }))} />
        <button className="secondary" onClick={load}>Apply</button>
      </div>
    </>}>
      {loading ? 'Loading…' : (
        <>
          <div className="cards">
            <div className="card">
              <div className="card-title">Daily Sales (Total)</div>
              <div className="card-value">₹{Number(totalSales).toLocaleString()}</div>
              <MiniBar data={daily} />
            </div>
            <div className="card">
              <div className="card-title">Pending Orders</div>
              <div className="card-value">{pending.total}</div>
              <div style={{ color: '#64748b', marginTop: 8 }}>Pending: {pending.pending} · In Progress: {pending.inProgress}</div>
            </div>
            <div className="card">
              <div className="card-title">Top Customers</div>
              <table className="table" style={{ marginTop: 8 }}>
                <thead><tr><th>Name</th><th>Phone</th><th>Orders</th><th>Total</th></tr></thead>
                <tbody>
                  {top.map(r => (
                    <tr key={r.id}><td>{r.customer?.name}</td><td>{r.customer?.phone}</td><td>{r.orders}</td><td>₹{Number(r.total).toLocaleString()}</td></tr>
                  ))}
                  {(!top || top.length === 0) && <tr><td colSpan={4} style={{ color: 'var(--muted)' }}>No data</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}