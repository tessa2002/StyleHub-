import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import './Profile.css';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    deliveryAddress: '',
    billingAddress: '',
    gender: '',
    dob: '',
    avatarUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        console.log('🔍 Loading profile data...');
        const { data } = await axios.get('/api/portal/profile');
        console.log('✅ Profile data loaded:', data);
        setForm({
          name: data.user?.name || data.customer?.name || '',
          email: data.user?.email || data.customer?.email || '',
          phone: data.user?.phone || data.customer?.phone || '',
          whatsapp: data.user?.whatsapp || '',
          deliveryAddress: data.user?.deliveryAddress || '',
          billingAddress: data.user?.billingAddress || data.customer?.address || '',
          gender: data.user?.gender || '',
          dob: data.user?.dob || '',
          avatarUrl: data.user?.avatarUrl || ''
        });
      } catch (error) {
        console.error('❌ Profile load error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          data: error.response?.data
        });

        // More specific error messages
        let message = error.response?.data?.message || 'Failed to load profile data. Please try again.';
        if (error.response?.status === 401) {
          message = 'Your session has expired. Please log in again.';
        } else if (error.response?.status === 403) {
          message = 'You are not authorized to access this page.';
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const validateForm = () => {
    const errors = {};
    
    if (!form.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!form.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (form.phone.length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }
    
    if (form.whatsapp && form.whatsapp.length < 10) {
      errors.whatsapp = 'WhatsApp number must be at least 10 digits';
    }
    
    if (form.dob && new Date(form.dob) > new Date()) {
      errors.dob = 'Date of birth cannot be in the future';
    }
    
    return errors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const errors = validateForm();
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    try {
      setSaving(true);
      const { data } = await axios.put('/api/portal/profile', form);
      // Update auth context user so other pages reflect immediately
      if (data?.user) setUser(data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/dashboard/customer');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Edit Profile">
      {loading ? (
        <div className="loading">Loading profile...</div>
      ) : (
        <div className="profile-edit-container">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Profile Settings</h1>
            <p className="page-subtitle">Manage your personal information and preferences</p>
          </div>
          
          {/* Success/Error Messages */}
          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✅</span>
              {success}
            </div>
          )}
          
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">❌</span>
              {error}
            </div>
          )}

          <form className="profile-form" onSubmit={onSubmit}>
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={`form-input ${fieldErrors.name ? 'error' : ''}`}
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                  {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email address"
                  />
                  {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className={`form-input ${fieldErrors.phone ? 'error' : ''}`}
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                  {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="whatsapp" className="form-label">
                    WhatsApp Number
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    className={`form-input ${fieldErrors.whatsapp ? 'error' : ''}`}
                    value={form.whatsapp}
                    onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="Enter your WhatsApp number (optional)"
                  />
                  {fieldErrors.whatsapp && <span className="field-error">{fieldErrors.whatsapp}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Personal Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="gender" className="form-label">Gender</label>
                  <select
                    id="gender"
                    className="form-select"
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="dob" className="form-label">Date of Birth</label>
                  <input
                    id="dob"
                    type="date"
                    className={`form-input ${fieldErrors.dob ? 'error' : ''}`}
                    value={form.dob}
                    onChange={e => setForm({ ...form, dob: e.target.value })}
                  />
                  {fieldErrors.dob && <span className="field-error">{fieldErrors.dob}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="avatarUrl" className="form-label">Avatar URL</label>
                  <input
                    id="avatarUrl"
                    type="url"
                    className="form-input"
                    value={form.avatarUrl}
                    onChange={e => setForm({ ...form, avatarUrl: e.target.value })}
                    placeholder="Enter avatar image URL (optional)"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Address Information</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="deliveryAddress" className="form-label">Delivery Address</label>
                  <textarea
                    id="deliveryAddress"
                    className="form-textarea"
                    value={form.deliveryAddress}
                    onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
                    placeholder="Enter your delivery address"
                    rows={3}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="billingAddress" className="form-label">Billing Address</label>
                  <textarea
                    id="billingAddress"
                    className="form-textarea"
                    value={form.billingAddress}
                    onChange={e => setForm({ ...form, billingAddress: e.target.value })}
                    placeholder="Enter your billing address"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard/customer')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          <PasswordForm />
        </div>
      )}
    </DashboardLayout>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePassword = () => {
    const errors = {};
    
    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters';
    }
    
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return;
    }
    
    try {
      setLoading(true);
      await axios.post('/api/portal/password', { currentPassword, newPassword });
      setSuccess('Password updated successfully!');
      setCurrent('');
      setNew('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-section">
      <h3 className="section-title">Change Password</h3>
      <form className="password-form" onSubmit={submit}>
        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {success}
          </div>
        )}
        
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="currentPassword" className="form-label">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            className="form-input"
            value={currentPassword}
            onChange={e => setCurrent(e.target.value)}
            placeholder="Enter your current password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword" className="form-label">New Password</label>
          <input
            id="newPassword"
            type="password"
            className="form-input"
            value={newPassword}
            onChange={e => setNew(e.target.value)}
            placeholder="Enter your new password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
          <input
            id="confirmPassword"
            type="password"
            className="form-input"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}