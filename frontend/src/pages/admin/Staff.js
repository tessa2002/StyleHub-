import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FaSearch, FaPlus, FaFilter, FaDownload, FaBell, FaUser,
  FaShoppingBag, FaCalendarAlt, FaCog, FaUserTie, FaTrash, FaSignOutAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Staff.css';

const Staff = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tailorToDelete, setTailorToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTailorModal, setShowAddTailorModal] = useState(false);
  const [addTailorLoading, setAddTailorLoading] = useState(false);
  const [newTailorData, setNewTailorData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    experience: '',
    address: ''
  });
  const [stats, setStats] = useState({
    totalActiveOrders: 0,
    avgTeamWorkload: 0,
    activeTailors: 0,
    totalActiveOrdersChange: 0,
    avgTeamWorkloadChange: 0,
    activeTailorsChange: 0
  });

  useEffect(() => {
    fetchTailors();
  }, []);

  const fetchTailors = async () => {
    try {
      setLoading(true);
      
      // Get auth token
      const token = localStorage.getItem('token');
      const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {};
      
      // Use the correct endpoint for fetching tailors
      const response = await axios.get('/api/staff/tailors', { headers });
      const tailorData = response.data.users || [];
      
      console.log('✅ Fetched tailors from API:', tailorData);
      
      // Transform real data to match our component structure
      const transformedTailors = tailorData.map(tailor => ({
        id: tailor._id || tailor.id,
        name: tailor.name,
        role: tailor.specialization || tailor.role || 'Tailor',
        avatar: tailor.avatar || '/api/placeholder/60/60',
        workloadPercentage: tailor.workloadPercentage || Math.floor(Math.random() * 100), // Random for demo
        activeOrders: tailor.activeOrders || Math.floor(Math.random() * 20), // Random for demo
        nextDue: tailor.nextDue || getRandomDueDate(),
        status: tailor.status || 'active',
        email: tailor.email,
        phone: tailor.phone,
        joinDate: tailor.joinDate || tailor.createdAt
      }));
      
      setTailors(transformedTailors);
      
      // Update stats based on real data
      const totalOrders = transformedTailors.reduce((sum, tailor) => sum + tailor.activeOrders, 0);
      const avgWorkload = transformedTailors.length > 0 
        ? Math.round(transformedTailors.reduce((sum, tailor) => sum + tailor.workloadPercentage, 0) / transformedTailors.length)
        : 0;
      const activeTailorCount = transformedTailors.filter(tailor => tailor.status === 'active').length;
      
      setStats(prevStats => ({
        ...prevStats,
        totalActiveOrders: totalOrders,
        avgTeamWorkload: avgWorkload,
        activeTailors: activeTailorCount
      }));
      
    } catch (error) {
      console.error('❌ Error fetching tailors:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error('Failed to load tailors: ' + (error.response?.data?.message || error.message));
      setTailors([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate random due dates for demo
  const getRandomDueDate = () => {
    const dates = ['Tomorrow', 'Jan 25', 'Jan 26', 'Jan 27', 'Jan 28', 'Next Week'];
    return dates[Math.floor(Math.random() * dates.length)];
  };

  const handleDeleteTailor = (tailor) => {
    setTailorToDelete(tailor);
    setShowDeleteModal(true);
  };

  const confirmDeleteTailor = async () => {
    if (!tailorToDelete) return;

    try {
      // Get auth token
      const token = localStorage.getItem('token');
      const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {};
      
      // Use the correct API endpoint for deleting users
      await axios.delete(`/api/admin/users/${tailorToDelete.id}`, { headers });
      toast.success(`✅ ${tailorToDelete.name} has been removed successfully`);
      setShowDeleteModal(false);
      setTailorToDelete(null);
      // Refresh the tailors list
      fetchTailors();
    } catch (error) {
      console.error('❌ Error deleting tailor:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error('Failed to remove tailor. ' + (error.response?.data?.message || error.message));
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTailorToDelete(null);
  };

  const handleAssignTask = (tailor) => {
    // For now, show a toast message. This can be expanded to open a task assignment modal
    toast.info(`Task assignment for ${tailor.name} - Feature coming soon!`);
    console.log('Assign task to:', tailor);
  };

  const handleAddNewTailor = () => {
    setShowAddTailorModal(true);
    // Reset form data
    setNewTailorData({
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      experience: '',
      address: ''
    });
  };

  const handleCloseAddTailorModal = () => {
    setShowAddTailorModal(false);
    setNewTailorData({
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      experience: '',
      address: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTailorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateTailorForm = () => {
    const { name, email, password, phone } = newTailorData;
    
    if (!name.trim()) {
      toast.error('Tailor name is required');
      return false;
    }
    
    if (!email.trim()) {
      toast.error('Email is required');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (!password.trim()) {
      toast.error('Password is required');
      return false;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    
    if (!phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    
    return true;
  };

  const handleSubmitNewTailor = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Starting tailor creation process...');
    console.log('📋 Form data:', newTailorData);
    
    if (!validateTailorForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    
    console.log('✅ Form validation passed');
    
    try {
      setAddTailorLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      console.log('🔑 Token check:', {
        exists: !!token,
        length: token ? token.length : 0,
        preview: token ? token.substring(0, 30) + '...' : 'None'
      });
      
      if (!token) {
        console.log('❌ No token found');
        toast.error('❌ You must be logged in to create tailors');
        setAddTailorLoading(false);
        return;
      }
      
      // Decode token to check user role
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log('👤 Token payload:', {
          role: tokenPayload.role,
          email: tokenPayload.email,
          exp: new Date(tokenPayload.exp * 1000)
        });
        
        if (tokenPayload.role !== 'Admin') {
          console.log('❌ User is not admin:', tokenPayload.role);
          toast.error('❌ Only admins can create tailors');
          setAddTailorLoading(false);
          return;
        }
      } catch (tokenError) {
        console.error('❌ Error decoding token:', tokenError);
        toast.error('❌ Invalid authentication token. Please login again.');
        setAddTailorLoading(false);
        return;
      }
      
      // Prepare tailor data for API (only send fields the API expects)
      const tailorPayload = {
        name: newTailorData.name.trim(),
        email: newTailorData.email.trim().toLowerCase(),
        password: newTailorData.password,
        phone: newTailorData.phone.trim(),
        role: 'Tailor'
      };
      
      console.log('📤 Sending tailor payload:', tailorPayload);
      console.log('🚀 Making API call to /api/admin/users...');
      
      // Call API to create new tailor with explicit headers
      const response = await axios.post('/api/admin/users', tailorPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ API Response received:', response.status, response.data);
      
      // The API returns the created user directly, not wrapped in a success object
      if (response.data && (response.data.id || response.data._id)) {
        console.log('✅ Tailor created successfully');
        toast.success(`✅ ${newTailorData.name} has been added successfully!`);
        toast.info(`📧 Login Email: ${newTailorData.email}`);
        toast.info(`🔑 Login Password: ${newTailorData.password}`);
        
        // Close modal and refresh tailors list
        handleCloseAddTailorModal();
        fetchTailors();
      } else {
        console.error('❌ Unexpected response format:', response.data);
        toast.error('Failed to create tailor: Unexpected response format');
      }
      
    } catch (error) {
      console.error('❌ Error creating tailor:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || 'Unknown server error';
        
        console.log('📋 Server error details:', { status, message });
        
        if (status === 400) {
          if (message.includes('Email already registered')) {
            toast.error('❌ This email is already registered. Please use a different email.');
          } else if (message.includes('Missing fields')) {
            toast.error('❌ Please fill in all required fields.');
          } else if (message.includes('Invalid role')) {
            toast.error('❌ Invalid role specified.');
          } else {
            toast.error('❌ ' + message);
          }
        } else if (status === 401) {
          toast.error('❌ You are not authorized to create tailors. Please log in as admin.');
          // Try to refresh the page or redirect to login
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (status === 403) {
          toast.error('❌ Access denied. Admin privileges required.');
        } else if (status === 500) {
          toast.error('❌ Server error. Please try again later.');
        } else {
          toast.error('❌ Failed to create tailor: ' + message);
        }
      } else if (error.request) {
        // Network error
        console.error('❌ Network error details:', error.request);
        toast.error('❌ Network error. Please check your connection and try again.');
      } else {
        // Other error
        console.error('❌ Other error:', error.message);
        toast.error('❌ An unexpected error occurred: ' + error.message);
      }
    } finally {
      console.log('🏁 Tailor creation process finished');
      setAddTailorLoading(false);
    }
  };

  const getWorkloadColor = (percentage) => {
    if (percentage >= 80) return '#e91e63';
    if (percentage >= 60) return '#ff9800';
    if (percentage >= 40) return '#4caf50';
    return '#9e9e9e';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Filter tailors based on search term
  const filteredTailors = tailors.filter(tailor => 
    tailor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tailor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tailor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="tailor-admin loading">
        <div className="loading-spinner"></div>
        <p>Loading tailor team...</p>
      </div>
    );
  }

  return (
    <div className="tailor-admin">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">TA</div>
            <div className="logo-text">
              <h3>Tailor Admin</h3>
              <p>Workflow Hub</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaShoppingBag className="nav-icon" />
            </div>
            <span>Overview</span>
          </Link>
          <Link to="/admin/staff" className="nav-item active">
            <div className="nav-icon-wrapper">
              <FaUserTie className="nav-icon" />
            </div>
            <span>Tailor Team</span>
          </Link>
          <Link to="/admin/orders" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaShoppingBag className="nav-icon" />
            </div>
            <span>Orders</span>
          </Link>
          <Link to="/admin/appointments" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaCalendarAlt className="nav-icon" />
            </div>
            <span>Schedule</span>
          </Link>
          <Link to="/admin/settings" className="nav-item">
            <div className="nav-icon-wrapper">
              <FaCog className="nav-icon" />
            </div>
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
            <div className="nav-icon-wrapper">
              <FaSignOutAlt className="nav-icon" />
            </div>
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="page-header">
          <div className="header-left">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search tailors by name or specialty"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="header-right">
            <button className="notification-btn">
              <FaBell />
            </button>
            <div className="user-profile">
              <span className="user-name">Admin Profile</span>
              <span className="user-role">Shop Manager</span>
              <div className="user-avatar">A</div>
            </div>
          </div>
        </header>

        {/* Page Title */}
        <div className="page-title-section">
          <h1>Tailor Team Overview</h1>
          <p>Real-time workload and performance monitoring</p>
          <div className="page-actions">
            <button className="action-btn filter-btn">
              <FaFilter />
              Filter
            </button>
            <button className="action-btn export-btn">
              <FaDownload />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon orders">
              <FaShoppingBag />
            </div>
            <div className="stat-content">
              <div className="stat-label">TOTAL ACTIVE ORDERS</div>
              <div className="stat-value">{stats.totalActiveOrders}</div>
              <div className="stat-change positive">
                +{stats.totalActiveOrdersChange}%
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon workload">
              <div className="workload-circle">
                <span>{stats.avgTeamWorkload}%</span>
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-label">AVG TEAM WORKLOAD</div>
              <div className="stat-value">{stats.avgTeamWorkload}%</div>
              <div className="stat-change negative">
                {stats.avgTeamWorkloadChange}%
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon tailors">
              <FaUserTie />
            </div>
            <div className="stat-content">
              <div className="stat-label">ACTIVE TAILORS</div>
              <div className="stat-value">{stats.activeTailors}</div>
              <div className="stat-change stable">
                Stable
              </div>
            </div>
          </div>
        </div>

        {/* Tailors Grid */}
        <div className="tailors-grid">
          {filteredTailors.length > 0 ? (
            filteredTailors.map(tailor => (
              <div key={tailor.id} className="tailor-card">
                <div className="tailor-header">
                  <div className="tailor-avatar">
                    <div className="avatar-circle">
                      {getInitials(tailor.name)}
                    </div>
                    {tailor.status === 'active' && <div className="status-indicator active"></div>}
                  </div>
                  <div className="workload-chart">
                    <svg width="60" height="60" viewBox="0 0 60 60">
                      <circle
                        cx="30"
                        cy="30"
                        r="25"
                        fill="none"
                        stroke="#f0f0f0"
                        strokeWidth="4"
                      />
                      <circle
                        cx="30"
                        cy="30"
                        r="25"
                        fill="none"
                        stroke={getWorkloadColor(tailor.workloadPercentage)}
                        strokeWidth="4"
                        strokeDasharray={`${tailor.workloadPercentage * 1.57} 157`}
                        strokeDashoffset="39.25"
                        transform="rotate(-90 30 30)"
                      />
                      <text
                        x="30"
                        y="35"
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="600"
                        fill={getWorkloadColor(tailor.workloadPercentage)}
                      >
                        {tailor.workloadPercentage}%
                      </text>
                    </svg>
                  </div>
                  <button 
                    className="delete-tailor-btn"
                    onClick={() => handleDeleteTailor(tailor)}
                    title="Remove Tailor"
                  >
                    <FaTrash />
                  </button>
                </div>

                <div className="tailor-info">
                  <h3 className="tailor-name">{tailor.name}</h3>
                  <p className="tailor-role">{tailor.role}</p>
                </div>

                <div className="tailor-stats">
                  <div className="stat-row">
                    <span className="stat-label">ACTIVE</span>
                    <span className="stat-label">NEXT DUE</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-value">{tailor.activeOrders} Orders</span>
                    <span className="stat-value next-due">{tailor.nextDue || 'N/A'}</span>
                  </div>
                </div>

                <div className="tailor-actions">
                  {tailor.status === 'active' ? (
                    <button 
                      className="assign-task-btn"
                      onClick={() => handleAssignTask(tailor)}
                    >
                      <FaPlus />
                      Assign Task
                    </button>
                  ) : (
                    <button className="unavailable-btn" disabled>
                      Unavailable
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-tailors">
              <div className="no-tailors-content">
                <FaUserTie className="no-tailors-icon" />
                <h3>{searchTerm ? 'No Matching Tailors' : 'No Tailors Found'}</h3>
                <p>
                  {searchTerm 
                    ? `No tailors match "${searchTerm}". Try a different search term.`
                    : 'No tailors are currently registered in the system.'
                  }
                </p>
                {!searchTerm && (
                  <button 
                    className="add-first-tailor-btn"
                    onClick={handleAddNewTailor}
                  >
                    <FaPlus />
                    Add Your First Tailor
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add New Tailor Button - Only show if tailors exist */}
        {tailors.length > 0 && (
          <div className="add-tailor-section">
            <button 
              className="add-tailor-btn"
              onClick={handleAddNewTailor}
            >
              <FaPlus />
              Add New Tailor
            </button>
          </div>
        )}
      </div>

      {/* Add New Tailor Modal */}
      {showAddTailorModal && (
        <div className="modal-overlay" onClick={handleCloseAddTailorModal}>
          <div className="modal-content add-tailor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Tailor</h2>
              <button className="close-btn" onClick={handleCloseAddTailorModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmitNewTailor}>
              <div className="modal-body">
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
                        value={newTailorData.name}
                        onChange={handleInputChange}
                        placeholder="Enter tailor's full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={newTailorData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email for login"
                        required
                      />
                      <small className="help-text">This will be used for tailor login</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Login Password *</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={newTailorData.password}
                        onChange={handleInputChange}
                        placeholder="Create a secure password"
                        minLength="6"
                        required
                      />
                      <small className="help-text">Minimum 6 characters</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={newTailorData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter contact number"
                        required
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="form-section">
                    <h3>Professional Details</h3>
                    
                    <div className="form-group">
                      <label htmlFor="specialization">Specialization</label>
                      <select
                        id="specialization"
                        name="specialization"
                        value={newTailorData.specialization}
                        onChange={handleInputChange}
                      >
                        <option value="">Select specialization</option>
                        <option value="General Tailoring">General Tailoring</option>
                        <option value="Suit Specialist">Suit Specialist</option>
                        <option value="Wedding Dresses">Wedding Dresses</option>
                        <option value="Alterations">Alterations</option>
                        <option value="Embroidery">Embroidery</option>
                        <option value="Fabric Specialist">Fabric Specialist</option>
                        <option value="Custom Designs">Custom Designs</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="experience">Years of Experience</label>
                      <input
                        type="number"
                        id="experience"
                        name="experience"
                        value={newTailorData.experience}
                        onChange={handleInputChange}
                        placeholder="Years of experience"
                        min="0"
                        max="50"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <textarea
                        id="address"
                        name="address"
                        value={newTailorData.address}
                        onChange={handleInputChange}
                        placeholder="Enter full address"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

                {/* Login Credentials Preview */}
                {newTailorData.email && newTailorData.password && (
                  <div className="credentials-preview">
                    <h4>🔑 Login Credentials Preview</h4>
                    <div className="credentials-info">
                      <div className="credential-item">
                        <span className="label">Email:</span>
                        <span className="value">{newTailorData.email}</span>
                      </div>
                      <div className="credential-item">
                        <span className="label">Password:</span>
                        <span className="value">{'•'.repeat(newTailorData.password.length)}</span>
                      </div>
                    </div>
                    <p className="credentials-note">
                      💡 The tailor will use these credentials to log into the system
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={handleCloseAddTailorModal}
                  disabled={addTailorLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={addTailorLoading}
                >
                  {addTailorLoading ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Create Tailor
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && tailorToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Remove Tailor</h2>
              <button className="close-btn" onClick={cancelDelete}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="warning-icon">
                <FaTrash />
              </div>
              <p>Are you sure you want to remove <strong>{tailorToDelete.name}</strong> from the team?</p>
              <p className="warning-text">This action cannot be undone. The tailor will be permanently removed from the system.</p>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDeleteTailor}>
                <FaTrash />
                Remove Tailor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;