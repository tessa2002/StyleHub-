import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import './Staff.css';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/staff');
      // Handle the API response format: { success: true, staff: [...] }
      const staffData = response.data.staff || [];
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (staffId, newStatus) => {
    try {
      await axios.put(`/api/staff/${staffId}/status`, { status: newStatus });
      setStaff(staff.map(member => 
        member.id === staffId ? { ...member, status: newStatus } : member
      ));
      alert('Staff status updated successfully');
    } catch (error) {
      console.error('Error updating staff status:', error);
      alert('Error updating staff status');
    }
  };

  const filteredStaff = Array.isArray(staff) ? staff.filter(member => {
    const name = member.name || '';
    const email = member.email || '';
    const phone = member.phone || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         phone.includes(searchTerm);
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  }) : [];

  const getRoleColor = (role) => {
    switch (role) {
      case 'Tailor': return '#10b981';
      case 'Assistant': return '#3b82f6';
      case 'Manager': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#ef4444';
      case 'on-leave': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="staff-page">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading staff...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="staff-page">
        <div className="page-header">
          <h1>Staff Management</h1>
          <p>Manage your team members and their performance</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="controls-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="Tailor">Tailor</option>
              <option value="Assistant">Assistant</option>
              <option value="Manager">Manager</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="staff-grid">
          {filteredStaff.length > 0 ? (
            filteredStaff.map(member => (
              <div key={member.id} className="staff-card">
                <div className="staff-header">
                  <div className="staff-avatar">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="staff-info">
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                  </div>
                  <div className="staff-status">
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(member.status) }}
                    >
                      {member.status}
                    </span>
                  </div>
                </div>
                
                <div className="staff-details">
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{member.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">{member.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Join Date:</span>
                    <span className="value">{member.joinDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total Orders:</span>
                    <span className="value">{member.totalOrders || 0}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Performance:</span>
                    <span className="value performance">{member.performance || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="staff-actions">
                  <button 
                    onClick={() => handleStatusUpdate(member.id, member.status === 'active' ? 'inactive' : 'active')}
                    className={`btn ${member.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                  >
                    {member.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <Link to={`/admin/staff/${member.id}`} className="btn btn-primary">
                    <FaEye /> View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <p>No staff members found.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Staff;