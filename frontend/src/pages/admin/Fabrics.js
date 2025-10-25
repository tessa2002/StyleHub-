import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye,
  FaMoneyBillWave, FaBox, FaTag, FaImage, FaSave, FaTimes
} from 'react-icons/fa';
import './Fabrics.css';

const AdminFabrics = () => {
  const { user } = useAuth();
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFabric, setEditingFabric] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockFilter, setStockFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    material: '',
    color: '',
    pattern: 'solid',
    price: '',
    stock: '',
    unit: 'meters',
    category: '',
    description: '',
    lowStockThreshold: 5,
    supplier: {
      name: '',
      contact: '',
      address: ''
    }
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFabrics();
  }, [searchTerm, categoryFilter, priceRange, stockFilter]);

  const fetchFabrics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      if (stockFilter === 'inStock') params.append('inStock', 'true');
      if (stockFilter === 'lowStock') params.append('lowStock', 'true');

      const response = await axios.get(`/api/fabrics?${params}`);
      setFabrics(response.data.fabrics || []);
    } catch (error) {
      console.error('Error fetching fabrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      const fabricData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold)
      };

      if (editingFabric) {
        await axios.put(`/api/fabrics/${editingFabric._id}`, fabricData);
      } else {
        await axios.post('/api/fabrics', fabricData);
      }

      setShowForm(false);
      setEditingFabric(null);
      resetForm();
      fetchFabrics();
    } catch (error) {
      console.error('Error saving fabric:', error);
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (fabric) => {
    setEditingFabric(fabric);
    setFormData({
      name: fabric.name || '',
      material: fabric.material || '',
      color: fabric.color || '',
      pattern: fabric.pattern || 'solid',
      price: fabric.price || '',
      stock: fabric.stock || '',
      unit: fabric.unit || 'meters',
      category: fabric.category || '',
      description: fabric.description || '',
      lowStockThreshold: fabric.lowStockThreshold || 5,
      supplier: {
        name: fabric.supplier?.name || '',
        contact: fabric.supplier?.contact || '',
        address: fabric.supplier?.address || ''
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (fabricId) => {
    if (window.confirm('Are you sure you want to delete this fabric?')) {
      try {
        await axios.delete(`/api/fabrics/${fabricId}`);
        fetchFabrics();
      } catch (error) {
        console.error('Error deleting fabric:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      material: '',
      color: '',
      pattern: 'solid',
      price: '',
      stock: '',
      unit: 'meters',
      category: '',
      description: '',
      lowStockThreshold: 5,
      supplier: {
        name: '',
        contact: '',
        address: ''
      }
    });
    setFormErrors({});
  };

  const getStockStatus = (fabric) => {
    if (fabric.stock === 0) return { status: 'Out of Stock', color: '#ef4444' };
    if (fabric.stock <= fabric.lowStockThreshold) return { status: 'Low Stock', color: '#f59e0b' };
    return { status: 'In Stock', color: '#10b981' };
  };

  const categories = [
    'cotton', 'silk', 'linen', 'wool', 'polyester', 
    'denim', 'chiffon', 'georgette', 'other'
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="admin-fabrics">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading fabrics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="admin-fabrics">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Fabric Management</h1>
            <p>Manage fabric inventory and pricing</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setEditingFabric(null);
                setShowForm(true);
              }}
            >
              <FaPlus /> Add Fabric
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
                  placeholder="Search fabrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Stock Status</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="inStock">In Stock</option>
                <option value="lowStock">Low Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fabrics Table */}
        <div className="fabrics-table-section">
          <div className="table-responsive">
            <table className="fabrics-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Material</th>
                  <th>Color</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fabrics.length > 0 ? (
                  fabrics.map(fabric => {
                    const stockStatus = getStockStatus(fabric);
                    return (
                      <tr key={fabric._id}>
                        <td>
                          <div className="fabric-name">
                            <strong>{fabric.name}</strong>
                            {fabric.description && (
                              <small>{fabric.description}</small>
                            )}
                          </div>
                        </td>
                        <td>{fabric.material}</td>
                        <td>
                          <div className="color-info">
                            <span className="color-dot" style={{ backgroundColor: fabric.color }}></span>
                            {fabric.color}
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">
                            {fabric.category}
                          </span>
                        </td>
                        <td>
                          <span className="price">₹{fabric.price?.toLocaleString()}</span>
                          <small>per {fabric.unit}</small>
                        </td>
                        <td>
                          <span className="stock-amount">{fabric.stock}</span>
                          <small>{fabric.unit}</small>
                        </td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: stockStatus.color }}
                          >
                            {stockStatus.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon edit"
                              onClick={() => handleEdit(fabric)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-icon delete"
                              onClick={() => handleDelete(fabric._id)}
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
                    <td colSpan="8" className="no-data">
                      No fabrics found. Add your first fabric to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fabric Form Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content fabric-form-modal">
              <div className="modal-header">
                <h2>{editingFabric ? 'Edit Fabric' : 'Add New Fabric'}</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingFabric(null);
                    resetForm();
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="fabric-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Fabric Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                    {formErrors.name && <span className="error">{formErrors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label>Material *</label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                      required
                    />
                    {formErrors.material && <span className="error">{formErrors.material}</span>}
                  </div>

                  <div className="form-group">
                    <label>Color *</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      required
                    />
                    {formErrors.color && <span className="error">{formErrors.color}</span>}
                  </div>

                  <div className="form-group">
                    <label>Pattern</label>
                    <select
                      value={formData.pattern}
                      onChange={(e) => setFormData(prev => ({ ...prev, pattern: e.target.value }))}
                    >
                      <option value="solid">Solid</option>
                      <option value="striped">Striped</option>
                      <option value="polka-dot">Polka Dot</option>
                      <option value="floral">Floral</option>
                      <option value="geometric">Geometric</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                    />
                    {formErrors.price && <span className="error">{formErrors.price}</span>}
                  </div>

                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      required
                    />
                    {formErrors.stock && <span className="error">{formErrors.stock}</span>}
                  </div>

                  <div className="form-group">
                    <label>Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    >
                      <option value="meters">Meters</option>
                      <option value="yards">Yards</option>
                      <option value="pieces">Pieces</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && <span className="error">{formErrors.category}</span>}
                  </div>

                  <div className="form-group">
                    <label>Low Stock Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Supplier Information</label>
                    <div className="supplier-info">
                      <input
                        type="text"
                        placeholder="Supplier Name"
                        value={formData.supplier.name}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          supplier: { ...prev.supplier, name: e.target.value }
                        }))}
                      />
                      <input
                        type="text"
                        placeholder="Contact"
                        value={formData.supplier.contact}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          supplier: { ...prev.supplier, contact: e.target.value }
                        }))}
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={formData.supplier.address}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          supplier: { ...prev.supplier, address: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setEditingFabric(null);
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
                    {saving ? 'Saving...' : (editingFabric ? 'Update Fabric' : 'Add Fabric')}
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

export default AdminFabrics;





















