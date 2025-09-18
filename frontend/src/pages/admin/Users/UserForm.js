import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminDashboardLayout from '../../../components/AdminDashboardLayout';
import { FaSave, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Users.css';

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Customer',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      loadUser();
    }
  }, [id, isEdit]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/admin/users/${id}`);
      setFormData({
        name: data.user.name || '',
        email: data.user.email || '',
        role: data.user.role || 'Customer',
        phone: data.user.phone || '',
        address: data.user.address || '',
        password: '',
        confirmPassword: ''
      });
    } catch (e) {
      toast.error('Failed to load user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Role validation
    if (!['Customer', 'Staff', 'Tailor', 'Admin'].includes(formData.role)) {
      newErrors.role = 'Please select a valid role';
    }

    // Password validation (only for new users or when changing password)
    if (!isEdit || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Phone validation (optional but format check)
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        phone: formData.phone.trim(),
        address: formData.address.trim()
      };

      // Only include password if it's provided
      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEdit) {
        await axios.put(`/api/admin/users/${id}`, payload);
        toast.success('User updated successfully');
      } else {
        await axios.post('/api/admin/users', payload);
        toast.success('User created successfully');
      }

      navigate('/admin/users');
    } catch (e) {
      const message = e.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`;
      toast.error(message);
      
      // Handle specific validation errors
      if (e.response?.status === 400 && message.includes('Email already registered')) {
        setErrors({ email: 'This email is already registered' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout title={isEdit ? 'Edit User' : 'Add User'}>
        <div className="loading">Loading...</div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout 
      title={isEdit ? 'Edit User' : 'Add User'}
      actions={
        <button className="btn btn-light" onClick={() => navigate('/admin/users')}>
          <FaArrowLeft /> Back to Users
        </button>
      }
    >
      <div className="user-form-page">
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter full name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter email address"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={errors.role ? 'error' : ''}
                >
                  <option value="Customer">Customer</option>
                  <option value="Staff">Staff</option>
                  <option value="Tailor">Tailor</option>
                  <option value="Admin">Admin</option>
                </select>
                {errors.role && <span className="error-text">{errors.role}</span>}
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section">
              <h3>Contact Information</h3>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="Enter phone number"
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="form-section">
            <h3>{isEdit ? 'Change Password (Optional)' : 'Password *'}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">{isEdit ? 'New Password' : 'Password'}</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter password'}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn-light" onClick={() => navigate('/admin/users')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <FaSave /> {saving ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </AdminDashboardLayout>
  );
}
