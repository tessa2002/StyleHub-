import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';

export default function MeasurementsPage() {
  const [data, setData] = useState({ current: {}, history: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/portal/measurements');
        setData({ current: data.current || {}, history: data.history || [], styleNotes: data.styleNotes || '' });
      } catch {
        setData({ current: {}, history: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const m = data.current || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(d => ({ ...d, current: { ...d.current, [name]: value } }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        measurements: Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v === '' || v == null ? undefined : Number(v)])),
        styleNotes: data.styleNotes || '',
      };
      await axios.put('/api/portal/measurements', payload);
      const { data: fresh } = await axios.get('/api/portal/measurements');
      setData({ current: fresh.current || {}, history: fresh.history || [] });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="My Measurements">
      {loading ? 'Loading...' : (
        <>
          <div className="section">
            <h3 className="section-title">Current</h3>
            <form className="form" onSubmit={save}>
              <div className="row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {['chest','waist','hips','shoulder','armLength','legLength','neck','height'].map(k => (
                  <label key={k}>
                    <span>{k}</span>
                    <input name={k} type="number" step="0.1" value={m?.[k] ?? ''} onChange={handleChange} />
                  </label>
                ))}
              </div>
              <label>
                <span>Style Notes</span>
                <textarea value={data.styleNotes || ''} onChange={(e)=> setData(d => ({ ...d, styleNotes: e.target.value }))} placeholder="Preferred fits, fabric notes, collar style, cuffs, etc." />
              </label>
              {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>{error}</div>}
              <button className="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </form>
          </div>

          <div className="section">
            <h3 className="section-title">History</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>chest</th>
                  <th>waist</th>
                  <th>hips</th>
                  <th>shoulder</th>
                  <th>arm</th>
                  <th>leg</th>
                </tr>
              </thead>
              <tbody>
                {(data.history || []).map(row => (
                  <tr key={row._id}>
                    <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</td>
                    <td>{row.measurements?.chest ?? '-'}</td>
                    <td>{row.measurements?.waist ?? '-'}</td>
                    <td>{row.measurements?.hips ?? '-'}</td>
                    <td>{row.measurements?.shoulder ?? '-'}</td>
                    <td>{row.measurements?.armLength ?? '-'}</td>
                    <td>{row.measurements?.legLength ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}