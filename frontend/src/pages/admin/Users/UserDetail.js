import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminDashboardLayout from '../../../components/AdminDashboardLayout';
import { FaEdit, FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaUserTag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Users.css';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get(`/api/admin/users/${id}`);
      setUser(data.user);
    } catch (e) {
      console.error('Failed to load user:', e);
      setError(e.response?.data?.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async () => {
    if (!user) return;
    
    try {
      const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
      await axios.patch(`/api/admin/users/${id}/status`, { status: newStatus });
      toast.success(`User ${newStatus.toLowerCase()}`);
      setUser({ ...user, status: newStatus });
    } catch (e) {
      toast.error('Failed to update user status');
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout title="User Details">
        <div className="loading">Loading user details...</div>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout title="User Details">
        <div className="error-message">
          <p>{error}</p>
          <button className="btn btn-light" onClick={loadUser}>Retry</button>
          <button className="btn btn-light" onClick={() => navigate('/admin/users')}>Back to Users</button>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!user) {
    return (
      <AdminDashboardLayout title="User Details">
        <div className="empty-state">
          <p>User not found</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>Back to Users</button>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout 
      title={`${user.name || 'User'} Details`}
      actions={
        <>
          <button className="btn btn-light" onClick={() => navigate('/admin/users')}>
            <FaArrowLeft /> Back
          </button>
          <button className="btn btn-light" onClick={() => navigate(`/admin/users/${id}/edit`)}>
            <FaEdit /> Edit User
          </button>
        </>
      }
    >
      <div className="user-detail-page">
        {/* User Header */}
        <div className="user-header-card">
          <div className="user-avatar">
            <FaUser />
          </div>
          <div className="user-header-info">
            <h2>{user.name || 'N/A'}</h2>
            <div className="user-meta">
              <span className={`status-badge status-${(user.status || 'pending').toLowerCase()}`}>
                {user.status || 'Pending'}
              </span>
              <span className="role-badge">
                <FaUserTag /> {user.role}
              </span>
            </div>
          </div>
          <div className="user-actions">
            <button 
              className={`btn ${user.status === 'Active' ? 'btn-warning' : 'btn-success'}`}
              onClick={toggleUserStatus}
            >
              {user.status === 'Active' ? 'Suspend User' : 'Activate User'}
            </button>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="user-details-grid">
          {/* Contact Information */}
          <div className="detail-card">
            <h3>Contact Information</h3>
            <div className="detail-list">
              <div className="detail-item">
                <FaEnvelope className="detail-icon" />
                <div>
                  <label>Email</label>
                  <span>{user.email}</span>
                </div>
              </div>
              {user.phone && (
                <div className="detail-item">
                  <FaPhone className="detail-icon" />
                  <div>
                    <label>Phone</label>
                    <span>{user.phone}</span>
                  </div>
                </div>
              )}
              {user.address && (
                <div className="detail-item">
                  <FaMapMarkerAlt className="detail-icon" />
                  <div>
                    <label>Address</label>
                    <span>{user.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="detail-card">
            <h3>Account Information</h3>
            <div className="detail-list">
              <div className="detail-item">
                <FaUserTag className="detail-icon" />
                <div>
                  <label>Role</label>
                  <span>{user.role}</span>
                </div>
              </div>
              <div className="detail-item">
                <FaCalendarAlt className="detail-icon" />
                <div>
                  <label>Registered</label>
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              {user.updatedAt && (
                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <div>
                    <label>Last Updated</label>
                    <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Section (placeholder for future enhancement) */}
        <div className="detail-card">
          <h3>Recent Activity</h3>
          <div className="empty-state">
            <p>Activity tracking will be available in a future update</p>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
