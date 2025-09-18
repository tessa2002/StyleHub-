import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import './Dashboard.css';

const emptyForm = { name: '', email: '', phone: '', role: 'Staff', password: '' };

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const roleParam = roleFilter !== 'All' ? `?role=${encodeURIComponent(roleFilter)}` : '';
      const { data } = await axios.get(`/api/admin/users${roleParam}`);
      setUsers(data.users || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [roleFilter]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(u => [u.name, u.email, u.phone, u.role].filter(Boolean).some(v => String(v).toLowerCase().includes(q)));
  }, [users, query]);

  const startCreate = () => { setEditingId('new'); setForm(emptyForm); setError(''); };
  const startEdit = (u) => { setEditingId(u._id); setForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role, password: '' }); setError(''); };
  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); setError(''); };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId === 'new') {
        await axios.post('/api/admin/users', form);
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password; // don't update when empty
        await axios.put(`/api/admin/users/${editingId}`, payload);
      }
      await load();
      cancelEdit();
    } catch (er) {
      setError(er?.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <DashboardLayout title="Manage Staff & Roles" actions={<>
      <button className="primary" onClick={startCreate}>New Member</button>
    </>}>
      <div className="section">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <input placeholder="Search by name, email, phone, role" value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1, padding: 10, border: '1px solid var(--border)', borderRadius: 10 }} />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: 10, border: '1px solid var(--border)', borderRadius: 10 }}>
            <option>All</option>
            <option>Admin</option>
            <option>Staff</option>
            <option>Tailor</option>
          </select>
        </div>

        {loading ? <div>Loading...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.role}</td>
                  <td>
                    <button className="secondary" onClick={() => startEdit(u)} style={{ marginRight: 8 }}>Edit</button>
                    <button className="secondary" onClick={() => remove(u._id)} style={{ borderColor: '#ef4444', color: '#ef4444' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={5} style={{ color: 'var(--muted)' }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {(editingId !== null) && (
        <div className="section">
          <h3 className="section-title">{editingId === 'new' ? 'Create Member' : 'Edit Member'}</h3>
          <form className="form" onSubmit={save}>
            <div className="row">
              <label>
                <span>Name</span>
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label>
                <span>Email</span>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </label>
              <label>
                <span>Phone</span>
                <input name="phone" value={form.phone} onChange={handleChange} />
              </label>
            </div>
            <div className="row">
              <label>
                <span>Role</span>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="Staff">Staff</option>
                  <option value="Tailor">Tailor</option>
                  <option value="Admin">Admin</option>
                </select>
              </label>
              <label>
                <span>Password {editingId === 'new' ? '' : '(leave blank to keep)'}</span>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder={editingId === 'new' ? 'Temp password' : '••••••••'} />
              </label>
            </div>
            {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>{error}</div>}
            <div>
              <button className="primary" type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
              <button type="button" className="secondary" style={{ marginLeft: 8 }} onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}