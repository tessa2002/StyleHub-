import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { 
  FaPlus, FaSearch, FaChevronDown, FaFilter,
  FaTh, FaBox, FaUsers, FaChartBar, FaCog, FaExclamationTriangle,
  FaTimes, FaUpload, FaSave, FaSignOutAlt
} from 'react-icons/fa';
import './Inventory.css';

const Inventory = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Materials');
  const [fabricFilter, setFabricFilter] = useState('Fabrics');
  const [hardwareFilter, setHardwareFilter] = useState('Hardware');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Add Material Form State
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    price: '',
    category: 'PREMIUM FABRIC',
    description: '',
    stock: '',
    unit: 'm',
    color: '',
    composition: '',
    width: '',
    weight: ''
  });
  const [materialImage, setMaterialImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Fetch materials from API
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/fabrics', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const fabricsData = response.data.fabrics || [];
      
      // Transform API data to match our component structure
      const transformedMaterials = fabricsData.map(fabric => ({
        id: fabric._id,
        name: fabric.name,
        price: fabric.price || 0,
        category: fabric.category?.toUpperCase() || 'FABRIC',
        image: fabric.images?.[0]?.url || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop&crop=center',
        stock: fabric.stock || 0,
        unit: fabric.unit || 'm',
        isLowStock: (fabric.stock || 0) < 10,
        stockText: `${fabric.stock || 0} ${fabric.unit || 'm'} left`,
        color: fabric.color,
        description: fabric.description,
        composition: fabric.composition,
        width: fabric.width,
        weight: fabric.weight
      }));
      
      setMaterials(transformedMaterials);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMaterials = () => {
    return materials.filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  const filteredMaterials = getFilteredMaterials();

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMaterialImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setNewMaterial({
      name: '',
      price: '',
      category: 'PREMIUM FABRIC',
      description: '',
      stock: '',
      unit: 'm',
      color: '',
      composition: '',
      width: '',
      weight: ''
    });
    setMaterialImage(null);
    setImagePreview('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Form submission started');
    console.log('📋 Form data:', newMaterial);
    
    // More detailed validation
    const requiredFields = ['name', 'price', 'stock'];
    const missingFields = requiredFields.filter(field => !newMaterial[field] || newMaterial[field].toString().trim() === '');
    
    if (missingFields.length > 0) {
      console.log('❌ Validation failed - missing fields:', missingFields);
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token found:', !!token);
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'none');
      
      if (!token) {
        console.log('❌ No authentication token found');
        toast.error('Authentication required. Please login again.');
        setSubmitting(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      
      // Add required fields
      formData.append('name', newMaterial.name.trim());
      formData.append('price', parseFloat(newMaterial.price));
      formData.append('stock', parseFloat(newMaterial.stock));
      formData.append('category', newMaterial.category || 'PREMIUM FABRIC');
      formData.append('unit', newMaterial.unit || 'm');
      
      // Add optional fields only if they have values
      if (newMaterial.description && newMaterial.description.trim()) {
        formData.append('description', newMaterial.description.trim());
      }
      if (newMaterial.color && newMaterial.color.trim()) {
        formData.append('color', newMaterial.color.trim());
      }
      if (newMaterial.composition && newMaterial.composition.trim()) {
        formData.append('composition', newMaterial.composition.trim());
      }
      if (newMaterial.width && newMaterial.width.toString().trim()) {
        formData.append('width', newMaterial.width);
      }
      if (newMaterial.weight && newMaterial.weight.toString().trim()) {
        formData.append('weight', newMaterial.weight);
      }
      
      if (materialImage) {
        console.log('📸 Adding image to form data:', materialImage.name);
        formData.append('image', materialImage);
      }

      // Log what we're sending
      console.log('📤 Sending form data:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      console.log('🚀 Sending request to /api/fabrics');
      const response = await axios.post('/api/fabrics', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ Material added successfully:', response.data);
      toast.success('Material added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchMaterials(); // Refresh the list
    } catch (error) {
      console.error('❌ Error adding material:', error);
      console.error('📋 Error response:', error.response?.data);
      console.error('📋 Error status:', error.response?.status);
      console.error('📋 Error headers:', error.response?.headers);
      
      let errorMessage = 'Failed to add material';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit material
  const handleEdit = (material) => {
    setEditingMaterial(material);
    setNewMaterial({
      name: material.name,
      price: material.price.toString(),
      category: material.category,
      description: material.description || '',
      stock: material.stock.toString(),
      unit: material.unit,
      color: material.color || '',
      composition: material.composition || '',
      width: material.width || '',
      weight: material.weight || ''
    });
    setImagePreview(material.image);
    setShowEditModal(true);
  };

  // Handle update material
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!newMaterial.name || !newMaterial.price || !newMaterial.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', newMaterial.name);
      formData.append('price', parseFloat(newMaterial.price));
      formData.append('category', newMaterial.category);
      formData.append('description', newMaterial.description);
      formData.append('stock', parseFloat(newMaterial.stock));
      formData.append('unit', newMaterial.unit);
      formData.append('color', newMaterial.color);
      formData.append('composition', newMaterial.composition);
      formData.append('width', newMaterial.width);
      formData.append('weight', newMaterial.weight);
      
      if (materialImage) {
        formData.append('image', materialImage);
      }

      await axios.put(`/api/fabrics/${editingMaterial.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Material updated successfully!');
      setShowEditModal(false);
      setEditingMaterial(null);
      resetForm();
      fetchMaterials(); // Refresh the list
    } catch (error) {
      console.error('Error updating material:', error);
      toast.error(error.response?.data?.message || 'Failed to update material');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle restock
  const handleRestock = async (materialId, currentStock) => {
    const newStock = prompt(`Current stock: ${currentStock}. Enter additional stock to add:`);
    if (!newStock || isNaN(newStock) || parseFloat(newStock) <= 0) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      await axios.put(`/api/fabrics/${materialId}/stock`, {
        action: 'add',
        quantity: parseFloat(newStock)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success(`Added ${newStock} units to stock successfully!`);
      fetchMaterials(); // Refresh the list
    } catch (error) {
      console.error('Error restocking material:', error);
      toast.error('Failed to restock material');
    }
  };
  
  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      await axios.delete(`/api/fabrics/${materialId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Material deleted successfully!');
      fetchMaterials(); // Refresh the list
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  if (loading) {
    return (
      <div className="inventory-page loading">
        <div className="loading-spinner"></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <div className="logo-circle"></div>
            </div>
            <div className="logo-text">
              <h3>StitchStudio</h3>
              <p>Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item">
            <FaTh className="nav-icon" />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/inventory" className="nav-item active">
            <FaBox className="nav-icon" />
            <span>Inventory</span>
          </Link>
          <Link to="/admin/orders" className="nav-item">
            <FaBox className="nav-icon" />
            <span>Orders</span>
          </Link>
          <Link to="/admin/appointments" className="nav-item">
            <FaUsers className="nav-icon" />
            <span>Clients</span>
          </Link>
          <Link to="/admin/staff" className="nav-item">
            <FaChartBar className="nav-icon" />
            <span>Reports</span>
          </Link>
          <Link to="/admin/settings" className="nav-item">
            <FaCog className="nav-icon" />
            <span>Settings</span>
          </Link>
          
          <div className="nav-section-divider"></div>
          
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }} 
            className="nav-item logout-btn"
          >
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="page-header">
          <div className="header-content">
            <div className="page-title">
              <h1>Inventory & Fabric</h1>
              <p>Curate and monitor your atelier's premium materials.</p>
            </div>
            <button className="add-new-btn" onClick={() => setShowAddModal(true)}>
              <FaPlus />
              Add New Material
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search fabrics, buttons, zippers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <div className="filter-dropdown">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All Materials">All Materials</option>
                <option value="Fabrics">Fabrics</option>
                <option value="Hardware">Hardware</option>
              </select>
              <FaChevronDown className="dropdown-icon" />
            </div>
            
            <div className="filter-dropdown">
              <select 
                value={fabricFilter}
                onChange={(e) => setFabricFilter(e.target.value)}
              >
                <option value="Fabrics">Fabrics</option>
                <option value="Cotton">Cotton</option>
                <option value="Silk">Silk</option>
                <option value="Wool">Wool</option>
                <option value="Linen">Linen</option>
              </select>
              <FaChevronDown className="dropdown-icon" />
            </div>
            
            <div className="filter-dropdown">
              <select 
                value={hardwareFilter}
                onChange={(e) => setHardwareFilter(e.target.value)}
              >
                <option value="Hardware">Hardware</option>
                <option value="Buttons">Buttons</option>
                <option value="Zippers">Zippers</option>
                <option value="Thread">Thread</option>
              </select>
              <FaChevronDown className="dropdown-icon" />
            </div>
            
            <button className="filter-btn">
              <FaFilter />
            </button>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="materials-grid">
          {filteredMaterials.map(material => (
            <div key={material.id} className={`material-card ${material.isLowStock ? 'low-stock' : ''}`}>
              {material.isLowStock && (
                <div className="stock-indicator">
                  <FaExclamationTriangle />
                  LOW STOCK
                </div>
              )}
              
              <div className="material-image">
                <img src={material.image} alt={material.name} onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkM3NTdEIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk1hdGVyaWFsIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                }} />
              </div>
              
              <div className="material-info">
                <h3 className="material-name">{material.name}</h3>
                <p className="material-price">₹{material.price.toFixed(2)}<span>/{material.unit}</span></p>
                <p className="material-category">{material.category}</p>
                
                <div className="stock-info">
                  <div className="stock-bar">
                    <div 
                      className={`stock-fill ${material.isLowStock ? 'low' : material.stock > 20 ? 'high' : 'medium'}`}
                      style={{ width: `${Math.min((material.stock / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="stock-text">{material.stockText}</span>
                </div>
              </div>
              
              <div className="material-actions">
                {material.isLowStock ? (
                  <button className="restock-btn" onClick={() => handleRestock(material.id, material.stock)}>
                    Restock Now
                  </button>
                ) : (
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(material)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(material.id)}>
                      🗑
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Add New Material Card */}
          <div className="add-material-card" onClick={() => setShowAddModal(true)}>
            <div className="add-content">
              <FaPlus className="add-icon" />
              <h3>Add New Swatch</h3>
              <p>Drag & drop or click to upload</p>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span className="pagination-info">
            Showing 7 of 124 materials
          </span>
          <div className="pagination-controls">
            <button className="pagination-btn">Previous</button>
            <button className="pagination-btn primary">Next</button>
          </div>
        </div>
      </div>

      {/* Bottom Profile */}
      <div className="bottom-profile">
        <div className="profile-avatar">
          <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" alt="Elena Rossi" onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFOTFFNjMiLz4KPHRleHQgeD0iMjAiIHk9IjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+RVI8L3RleHQ+Cjwvc3ZnPgo=';
          }} />
        </div>
        <div className="profile-info">
          <span className="profile-name">Elena Rossi</span>
          <span className="profile-role">Senior Tailor</span>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content add-material-modal">
            <div className="modal-header">
              <h2>Add New Material</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="add-material-form">
              <div className="form-grid">
                {/* Basic Information */}
                <div className="form-section">
                  <h3>Basic Information</h3>
                  
                  <div className="form-group">
                    <label>Material Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={newMaterial.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Premium Silk Fabric"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price per Unit (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        value={newMaterial.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Unit</label>
                      <select
                        name="unit"
                        value={newMaterial.unit}
                        onChange={handleInputChange}
                      >
                        <option value="m">Meters</option>
                        <option value="yards">Yards</option>
                        <option value="units">Units</option>
                        <option value="pieces">Pieces</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="category"
                        value={newMaterial.category}
                        onChange={handleInputChange}
                      >
                        <option value="PREMIUM FABRIC">Premium Fabric</option>
                        <option value="WOOL BLEND">Wool Blend</option>
                        <option value="NATURAL FIBER">Natural Fiber</option>
                        <option value="EVERYDAY COTTON">Everyday Cotton</option>
                        <option value="LININGS">Linings</option>
                        <option value="HARDWARE">Hardware</option>
                        <option value="FASTENERS">Fasteners</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Stock Quantity *</label>
                      <input
                        type="number"
                        name="stock"
                        value={newMaterial.stock}
                        onChange={handleInputChange}
                        placeholder="0"
                        step="0.1"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={newMaterial.description}
                      onChange={handleInputChange}
                      placeholder="Describe the material properties, texture, and best use cases..."
                      rows="3"
                    />
                  </div>
                </div>

                {/* Material Properties */}
                <div className="form-section">
                  <h3>Material Properties</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Color</label>
                      <input
                        type="text"
                        name="color"
                        value={newMaterial.color}
                        onChange={handleInputChange}
                        placeholder="e.g., Navy Blue, Crimson Red"
                      />
                    </div>
                    <div className="form-group">
                      <label>Composition</label>
                      <input
                        type="text"
                        name="composition"
                        value={newMaterial.composition}
                        onChange={handleInputChange}
                        placeholder="e.g., 100% Silk, 80% Cotton 20% Polyester"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Width (inches)</label>
                      <input
                        type="number"
                        name="width"
                        value={newMaterial.width}
                        onChange={handleInputChange}
                        placeholder="45"
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Weight (GSM)</label>
                      <input
                        type="number"
                        name="weight"
                        value={newMaterial.weight}
                        onChange={handleInputChange}
                        placeholder="150"
                        step="1"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="form-group">
                    <label>Material Image</label>
                    <div className="image-upload-area">
                      <input
                        type="file"
                        id="materialImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="materialImage" className="upload-label">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="image-preview" />
                        ) : (
                          <div className="upload-placeholder">
                            <FaUpload />
                            <span>Click to upload image</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="spinner"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Add Material
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Material Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content add-material-modal">
            <div className="modal-header">
              <h2>Edit Material</h2>
              <button className="close-btn" onClick={() => {
                setShowEditModal(false);
                setEditingMaterial(null);
                resetForm();
              }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="add-material-form">
              <div className="form-grid">
                {/* Basic Information */}
                <div className="form-section">
                  <h3>Basic Information</h3>
                  
                  <div className="form-group">
                    <label>Material Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={newMaterial.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Premium Silk Fabric"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price per Unit (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        value={newMaterial.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Unit</label>
                      <select
                        name="unit"
                        value={newMaterial.unit}
                        onChange={handleInputChange}
                      >
                        <option value="m">Meters</option>
                        <option value="yards">Yards</option>
                        <option value="units">Units</option>
                        <option value="pieces">Pieces</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="category"
                        value={newMaterial.category}
                        onChange={handleInputChange}
                      >
                        <option value="PREMIUM FABRIC">Premium Fabric</option>
                        <option value="WOOL BLEND">Wool Blend</option>
                        <option value="NATURAL FIBER">Natural Fiber</option>
                        <option value="EVERYDAY COTTON">Everyday Cotton</option>
                        <option value="LININGS">Linings</option>
                        <option value="HARDWARE">Hardware</option>
                        <option value="FASTENERS">Fasteners</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Stock Quantity *</label>
                      <input
                        type="number"
                        name="stock"
                        value={newMaterial.stock}
                        onChange={handleInputChange}
                        placeholder="0"
                        step="0.1"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={newMaterial.description}
                      onChange={handleInputChange}
                      placeholder="Describe the material properties, texture, and best use cases..."
                      rows="3"
                    />
                  </div>
                </div>

                {/* Material Properties */}
                <div className="form-section">
                  <h3>Material Properties</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Color</label>
                      <input
                        type="text"
                        name="color"
                        value={newMaterial.color}
                        onChange={handleInputChange}
                        placeholder="e.g., Navy Blue, Crimson Red"
                      />
                    </div>
                    <div className="form-group">
                      <label>Composition</label>
                      <input
                        type="text"
                        name="composition"
                        value={newMaterial.composition}
                        onChange={handleInputChange}
                        placeholder="e.g., 100% Silk, 80% Cotton 20% Polyester"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Width (inches)</label>
                      <input
                        type="number"
                        name="width"
                        value={newMaterial.width}
                        onChange={handleInputChange}
                        placeholder="45"
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Weight (GSM)</label>
                      <input
                        type="number"
                        name="weight"
                        value={newMaterial.weight}
                        onChange={handleInputChange}
                        placeholder="150"
                        step="1"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="form-group">
                    <label>Material Image</label>
                    <div className="image-upload-area">
                      <input
                        type="file"
                        id="editMaterialImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="editMaterialImage" className="upload-label">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="image-preview" />
                        ) : (
                          <div className="upload-placeholder">
                            <FaUpload />
                            <span>Click to upload image</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMaterial(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="spinner"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Update Material
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
