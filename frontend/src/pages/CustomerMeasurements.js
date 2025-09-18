import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import './CustomerMeasurements.css';

const fields = [
  { name: 'height', label: 'Height (cm)' },
  { name: 'chest', label: 'Chest (cm)' },
  { name: 'waist', label: 'Waist (cm)' },
  { name: 'hips', label: 'Hips (cm)' },
  { name: 'shoulder', label: 'Shoulder (cm)' },
  { name: 'sleeve', label: 'Sleeve (cm)' },
  { name: 'armLength', label: 'Arm Length (cm)' },
  { name: 'legLength', label: 'Leg Length (cm)' },
  { name: 'neck', label: 'Neck (cm)' },
];

export default function CustomerMeasurements(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [styleNotes, setStyleNotes] = useState('');
  const [m, setM] = useState({});
  const [history, setHistory] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: cur }, { data: hist }] = await Promise.all([
        axios.get(`/api/measurements/customer/${id}`),
        axios.get(`/api/measurements/history/${id}`),
      ]);
      setName(cur?.customer?.name || '');
      setM(cur?.customer?.measurements || {});
      setStyleNotes(cur?.customer?.styleNotes || '');
      setHistory(hist?.history || []);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404) {
        setError('Customer not found. It may have been removed.');
      } else if (status === 401) {
        setError('Unauthorized. Please log in again.');
      } else {
        setError(e?.response?.data?.message || 'Failed to load');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setM(prev => ({ ...prev, [name]: value }));
  };

  const numberOrUndefined = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

  const payload = useMemo(() => ({
    measurements: Object.fromEntries(Object.entries(m).map(([k,v]) => [k, numberOrUndefined(v)])),
    styleNotes,
  }), [m, styleNotes]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.put(`/api/measurements/customer/${id}`, payload);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title={`Measurements — ${name || ''}`}
      actions={
        <div className="cm-toolbar">
          <button className="btn btn-secondary" onClick={() => navigate(-1)} aria-label="Go back to previous page">Back</button>
          <button className="btn btn-primary" onClick={save} disabled={saving} aria-label="Save measurements from toolbar">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      }
    >
      {loading ? (
        <div className="cm-loading">Loading…</div>
      ) : (
        <div className="cm-grid">
          <section className="card">
            <header className="card-header">
              <h3>Current Measurements</h3>
              <span className="card-subtitle">Enter values in centimeters. Decimals allowed.</span>
            </header>
            <form className="cm-form" onSubmit={save}>
              <div className="cm-form-grid">
                {fields.map(f => (
                  <label key={f.name} className="cm-field">
                    <span className="cm-label">{f.label}</span>
                    <input
                      className="cm-input"
                      name={f.name}
                      type="number"
                      step="0.1"
                      value={m?.[f.name] ?? ''}
                      onChange={handleChange}
                      inputMode="decimal"
                    />
                  </label>
                ))}
              </div>
              <label className="cm-field">
                <span className="cm-label">Style Notes</span>
                <textarea
                  className="cm-textarea"
                  value={styleNotes}
                  onChange={(e)=> setStyleNotes(e.target.value)}
                  placeholder="Preferred fits, fabric notes, collar style, cuffs, etc."
                  rows={4}
                />
              </label>
              {error && <div className="cm-error" role="alert">{error}</div>}
              <div className="cm-actions">
                <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
              </div>
            </form>
          </section>

          <section className="card">
            <header className="card-header">
              <h3>History</h3>
              <span className="card-subtitle">Previous measurement snapshots</span>
            </header>
            <div className="table-wrapper">
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    {fields.map(f => <th key={f.name}>{f.name}</th>)}
                    <th>Style Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(history || []).map(row => (
                    <tr key={row._id}>
                      <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</td>
                      {fields.map(f => (
                        <td key={f.name}>{row.measurements?.[f.name] ?? '-'}</td>
                      ))}
                      <td className="cm-notes">{row.styleNotes || '-'}</td>
                    </tr>
                  ))}
                  {(!history || history.length === 0) && (
                    <tr><td colSpan={fields.length + 2} className="cm-empty">No history yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}