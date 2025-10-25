import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye,
  FaBell, FaCalendar, FaUsers, FaTag, FaSave, FaTimes,
  FaChartLine, FaBullhorn, FaClock, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import './Offers.css';

const AdminOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    offerType: 'promotion',
    discountType: 'none',
    discountValue: '',
    validFrom: '',
    validUntil: '',
    targetAudience: 'all',
    targetRoles: [],
    targetUsers: [],
    conditions: {
      minOrderAmount: '',
      applicableServices: [],
      maxUsage: ''
    },
    priority: 'medium',
    image: {
      url: '',
      alt: ''
    },
    actionUrl: '',
    actionText: 'View Details'
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    actionUrl: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchOffers();
  }, [searchTerm, typeFilter, statusFilter]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`/api/offers?${params}`);
      setOffers(response.data.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      const offerData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue) || 0,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
        conditions: {
          ...formData.conditions,
          minOrderAmount: parseFloat(formData.conditions.minOrderAmount) || 0,
          maxUsage: parseInt(formData.conditions.maxUsage) || 0
        }
      };

      if (editingOffer) {
        await axios.put(`/api/offers/${editingOffer._id}`, offerData);
      } else {
        await axios.post('/api/offers', offerData);
      }

      setShowForm(false);
      setEditingOffer(null);
      resetForm();
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title || '',
      description: offer.description || '',
      offerType: offer.offerType || 'promotion',
      discountType: offer.discountType || 'none',
      discountValue: offer.discountValue || '',
      validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().slice(0, 16) : '',
      validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().slice(0, 16) : '',
      targetAudience: offer.targetAudience || 'all',
      targetRoles: offer.targetRoles || [],
      targetUsers: offer.targetUsers || [],
      conditions: {
        minOrderAmount: offer.conditions?.minOrderAmount || '',
        applicableServices: offer.conditions?.applicableServices || [],
        maxUsage: offer.conditions?.maxUsage || ''
      },
      priority: offer.priority || 'medium',
      image: {
        url: offer.image?.url || '',
        alt: offer.image?.alt || ''
      },
      actionUrl: offer.actionUrl || '',
      actionText: offer.actionText || 'View Details'
    });
    setShowForm(true);
  };

  const handleDelete = async (offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await axios.delete(`/api/offers/${offerId}`);
        fetchOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/offers/broadcast', broadcastData);
      setShowBroadcast(false);
      setBroadcastData({ title: '', message: '', actionUrl: '', priority: 'medium' });
      alert('Broadcast sent successfully!');
    } catch (error) {
      console.error('Error broadcasting:', error);
      alert('Failed to send broadcast');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      offerType: 'promotion',
      discountType: 'none',
      discountValue: '',
      validFrom: '',
      validUntil: '',
      targetAudience: 'all',
      targetRoles: [],
      targetUsers: [],
      conditions: {
        minOrderAmount: '',
        applicableServices: [],
        maxUsage: ''
      },
      priority: 'medium',
      image: {
        url: '',
        alt: ''
      },
      actionUrl: '',
      actionText: 'View Details'
    });
    setFormErrors({});
  };

  const getStatusInfo = (offer) => {
    const now = new Date();
    const validFrom = new Date(offer.validFrom);
    const validUntil = new Date(offer.validUntil);

    if (!offer.isActive) return { status: 'Inactive', color: '#6b7280', icon: FaTimes };
    if (now < validFrom) return { status: 'Scheduled', color: '#3b82f6', icon: FaClock };
    if (now > validUntil) return { status: 'Expired', color: '#ef4444', icon: FaExclamationTriangle };
    return { status: 'Active', color: '#10b981', icon: FaCheckCircle };
  };

  const offerTypes = [
    { value: 'discount', label: 'Discount' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'special', label: 'Special Offer' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'event', label: 'Event' }
  ];

  const targetAudiences = [
    { value: 'all', label: 'All Users' },
    { value: 'customers', label: 'Customers Only' },
    { value: 'staff', label: 'Staff Only' },
    { value: 'tailors', label: 'Tailors Only' },
    { value: 'specific', label: 'Specific Users' }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="admin-offers">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading offers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="admin-offers">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Offer Management</h1>
            <p>Create and manage promotional offers for customers</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowBroadcast(true)}
            >
              <FaBullhorn /> Broadcast Message
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setEditingOffer(null);
                setShowForm(true);
              }}
            >
              <FaPlus /> Create Offer
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <div className="search-input">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {offerTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Offers Table */}
        <div className="offers-table-section">
          <div className="table-responsive">
            <table className="offers-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Target</th>
                  <th>Valid Period</th>
                  <th>Status</th>
                  <th>Analytics</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.length > 0 ? (
                  offers.map(offer => {
                    const statusInfo = getStatusInfo(offer);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={offer._id}>
                        <td>
                          <div className="offer-title">
                            <strong>{offer.title}</strong>
                            <p className="offer-description">{offer.description}</p>
                          </div>
                        </td>
                        <td>
                          <span className="offer-type-badge">
                            {offer.offerType}
                          </span>
                        </td>
                        <td>
                          <span className="target-audience">
                            {offer.targetAudience}
                          </span>
                        </td>
                        <td>
                          <div className="validity-period">
                            <div className="valid-from">
                              <FaCalendar /> {new Date(offer.validFrom).toLocaleDateString()}
                            </div>
                            <div className="valid-until">
                              <FaClock /> {new Date(offer.validUntil).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: statusInfo.color }}
                          >
                            <StatusIcon />
                            {statusInfo.status}
                          </span>
                        </td>
                        <td>
                          <div className="analytics-info">
                            <div className="analytics-item">
                              <FaEye /> {offer.usageStats?.totalViews || 0}
                            </div>
                            <div className="analytics-item">
                              <FaChartLine /> {offer.usageStats?.totalClicks || 0}
                            </div>
                            <div className="analytics-item">
                              <FaCheckCircle /> {offer.usageStats?.totalUsage || 0}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon view"
                              onClick={() => handleEdit(offer)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-icon delete"
                              onClick={() => handleDelete(offer._id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No offers found. Create your first offer to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Offer Form Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content offer-form-modal">
              <div className="modal-header">
                <h2>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingOffer(null);
                    resetForm();
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="offer-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Offer Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      maxLength={100}
                    />
                    {formErrors.title && <span className="error">{formErrors.title}</span>}
                  </div>

                  <div className="form-group">
                    <label>Offer Type *</label>
                    <select
                      value={formData.offerType}
                      onChange={(e) => setFormData(prev => ({ ...prev, offerType: e.target.value }))}
                      required
                    >
                      {offerTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                      maxLength={500}
                      rows="3"
                    />
                    {formErrors.description && <span className="error">{formErrors.description}</span>}
                  </div>

                  <div className="form-group">
                    <label>Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    >
                      <option value="none">No Discount</option>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  {formData.discountType !== 'none' && (
                    <div className="form-group">
                      <label>Discount Value</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.discountValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Valid From *</label>
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Valid Until *</label>
                    <input
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Target Audience *</label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      required
                    >
                      {targetAudiences.map(audience => (
                        <option key={audience.value} value={audience.value}>
                          {audience.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Action URL</label>
                    <input
                      type="url"
                      value={formData.actionUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Action Text</label>
                    <input
                      type="text"
                      value={formData.actionText}
                      onChange={(e) => setFormData(prev => ({ ...prev, actionText: e.target.value }))}
                      placeholder="View Details"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Image URL</label>
                    <input
                      type="url"
                      value={formData.image.url}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        image: { ...prev.image, url: e.target.value }
                      }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setEditingOffer(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (editingOffer ? 'Update Offer' : 'Create Offer')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Broadcast Modal */}
        {showBroadcast && (
          <div className="modal-overlay">
            <div className="modal-content broadcast-modal">
              <div className="modal-header">
                <h2>Broadcast Message</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowBroadcast(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleBroadcast} className="broadcast-form">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={broadcastData.title}
                    onChange={(e) => setBroadcastData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Offer title"
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={broadcastData.message}
                    onChange={(e) => setBroadcastData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    rows="4"
                    placeholder="Your message to all users..."
                  />
                </div>

                <div className="form-group">
                  <label>Action URL</label>
                  <input
                    type="url"
                    value={broadcastData.actionUrl}
                    onChange={(e) => setBroadcastData(prev => ({ ...prev, actionUrl: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={broadcastData.priority}
                    onChange={(e) => setBroadcastData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowBroadcast(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <FaBullhorn /> Send Broadcast
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminOffers;
