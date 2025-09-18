import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

function FabricForm({ open, onClose, onSaved, initial }){
  const [form, setForm] = useState(initial || { name: '', type: '', color: '', stock: 0, price: 0, supplier: '', description: '', status: 'Available', tags: '' });
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { setForm(initial || { name: '', type: '', color: '', stock: 0, price: 0, supplier: '', description: '', status: 'Available', tags: '' }); setFile(null); setError(''); }, [initial]);
  if (!open) return null;
  const save = async () => {
    setError('');
    if (!form.name || form.name.length > 50) { setError('Name required, max 50 chars'); return; }
    if (!form.type) { setError('Type is required'); return; }
    if (Number(form.stock) < 0) { setError('Quantity must be ≥ 0'); return; }
    if (!(Number(form.price) > 0)) { setError('Price must be positive'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('type', form.type);
      fd.append('color', form.color || '');
      fd.append('stock', String(Number(form.stock||0)));
      fd.append('price', String(Number(form.price||0)));
      fd.append('supplier', form.supplier || '');
      fd.append('description', form.description || '');
      fd.append('status', form.status || 'Available');
      if (form.tags) fd.append('tags', form.tags);
      if (file) fd.append('image', file);
      if (initial?._id) await axios.put(`/api/fabrics/${initial._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await axios.post('/api/fabrics', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSaved?.();
    } finally { setSaving(false); }
  };
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>{initial?._id ? 'Edit Fabric' : 'Add Fabric'}</h3>
        {error && <div className="alert warning">{error}</div>}
        <div className="row">
          <label><span>Name</span><input value={form.name} maxLength={50} onChange={e=> setForm(f=> ({...f, name: e.target.value}))} /></label>
          <label><span>Type</span>
            <select value={form.type} onChange={e=> setForm(f=> ({...f, type: e.target.value}))}>
              <option value="">Select type</option>
              <option value="Cotton">Cotton</option>
              <option value="Silk">Silk</option>
              <option value="Synthetic">Synthetic</option>
              <option value="Wool">Wool</option>
              <option value="Denim">Denim</option>
            </select>
          </label>
          <label><span>Color</span><input value={form.color} onChange={e=> setForm(f=> ({...f, color: e.target.value}))} /></label>
          <label><span>Stock</span><input type="number" min={0} value={form.stock} onChange={e=> setForm(f=> ({...f, stock: e.target.value}))} /></label>
          <label><span>Price</span><input type="number" min={0.01} step={0.01} value={form.price} onChange={e=> setForm(f=> ({...f, price: e.target.value}))} /></label>
          <label><span>Supplier</span><input value={form.supplier} onChange={e=> setForm(f=> ({...f, supplier: e.target.value}))} /></label>
          <label><span>Status</span>
            <select value={form.status} onChange={e=> setForm(f=> ({...f, status: e.target.value}))}>
              <option>Available</option>
              <option>Out of Stock</option>
            </select>
          </label>
          <label><span>Image</span><input type="file" accept="image/*" onChange={e=> setFile(e.target.files?.[0] || null)} /></label>
          <label style={{ gridColumn: '1 / -1' }}><span>Description</span><textarea value={form.description} onChange={e=> setForm(f=> ({...f, description: e.target.value}))} /></label>
          <label style={{ gridColumn: '1 / -1' }}><span>Tags</span><input placeholder="comma,separated,tags" value={form.tags} onChange={e=> setForm(f=> ({...f, tags: e.target.value}))} /></label>
        </div>
        <div className="actions">
          <button onClick={onClose} className="secondary">Cancel</button>
          <button onClick={save} disabled={saving || !form.name}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Fabrics(){
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [onlyInStock, setOnlyInStock] = useState(false);

  const canModify = user?.role === 'Admin' || user?.role === 'Staff';

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/fabrics', { params: { q, page, limit, inStock: onlyInStock ? 1 : undefined } });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, page, onlyInStock]);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const del = async (id) => {
    if (!window.confirm('Delete fabric?')) return;
    await axios.delete(`/api/fabrics/${id}`);
    load();
  };

  const handleUseFabric = async (item) => {
    const qtyStr = window.prompt(`Use how many units of "${item.name}"?`, '1');
    if (!qtyStr) return;
    const qty = Number(qtyStr);
    if (!Number.isFinite(qty) || qty <= 0) return alert('Enter a valid quantity');
    await axios.post(`/api/fabrics/${item._id}/use`, { quantity: qty });
    load();
  };

  return (
    <DashboardLayout title="Fabrics" actions={
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input placeholder="Search name/type/color/supplier" value={q} onChange={e=> { setPage(1); setQ(e.target.value); }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={onlyInStock} onChange={e=> { setPage(1); setOnlyInStock(e.target.checked); }} />
          <span>In stock</span>
        </label>
        {canModify && <button onClick={() => { setEditing(null); setShowForm(true); }}>Add Fabric</button>}
      </div>
    }>
      {loading ? 'Loading…' : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Color</th>
                <th>Supplier</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it._id} className={it.stock < 5 ? 'warning-row' : ''}>
                  <td>{it.name}</td>
                  <td>{it.type}</td>
                  <td>{it.color}</td>
                  <td>{it.supplier}</td>
                  <td>
                    {it.stock}
                    {it.stock < 5 && <span className="badge warning" style={{ marginLeft: 6 }}>Low stock</span>}
                  </td>
                  <td>₹{Number(it.price || 0).toLocaleString()}</td>
                  <td>
                    {canModify && (
                      <>
                        <button className="secondary" onClick={() => { setEditing(it); setShowForm(true); }}>Edit</button>
                        <button className="danger" onClick={() => del(it._id)}>Delete</button>
                      </>
                    )}
                    <button onClick={() => handleUseFabric(it)}>Use</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: 'var(--muted)' }}>No fabrics</td></tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button className="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span>Page {page} of {pages}</span>
            <button className="secondary" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </>
      )}

      <FabricForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={() => { setShowForm(false); load(); }}
        initial={editing}
      />
    </DashboardLayout>
  );
}