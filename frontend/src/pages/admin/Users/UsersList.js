import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminDashboardLayout from '../../../components/AdminDashboardLayout';
import { FaSearch, FaFilter, FaEye, FaEdit, FaUserCheck, FaUserTimes, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Users.css';

export default function UsersList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get current role from URL params
  const currentRole = searchParams.get('role') || 'Customer';
  
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  
  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Load users
  useEffect(() => {
    loadUsers();
  }, [currentRole, search, statusFilter, dateFrom, dateTo, sortBy, sortDir, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        role: currentRole,
        page: page.toString(),
        limit: pageSize.toString(),
        sort: sortBy,
        order: sortDir
      });
      
      if (search.trim()) params.append('q', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);
      
      const { data } = await axios.get(`/api/admin/users?${params}`);
      setUsers(data.users || []);
    } catch (e) {
      console.error('Failed to load users:', e);
      setError(e.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Switch role tab
  const switchRole = (role) => {
    setSearchParams({ role });
    setPage(1);
  };

  // Actions
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
      await axios.patch(`/api/admin/users/${userId}/status`, { status: newStatus });
      toast.success(`User ${newStatus.toLowerCase()}`);
      loadUsers();
    } catch (e) {
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted');
      loadUsers();
    } catch (e) {
      toast.error('Failed to delete user');
    }
  };

  const viewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const editUser = (userId) => {
    navigate(`/admin/users/${userId}/edit`);
  };

  // Filtered and paginated data
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));

  return (
    <AdminDashboardLayout 
      title={`${currentRole} Management`}
      actions={
        <button className="btn btn-primary" onClick={() => navigate('/admin/users/new')}>
          <FaPlus /> Add {currentRole}
        </button>
      }
    >
      <div className="users-page">
        {/* Role Tabs */}
        <div className="role-tabs">
          {['Customer', 'Staff', 'Tailor'].map(role => (
            <button
              key={role}
              className={`role-tab ${currentRole === role ? 'active' : ''}`}
              onClick={() => switchRole(role)}
            >
              {role}s
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={`Search ${currentRole.toLowerCase()}s by name or email...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="filters">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
            </select>
            
            <input
              type="date"
              placeholder="From"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            
            <input
              type="date"
              placeholder="To"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt">Registration Date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>
            
            <select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="loading">Loading {currentRole.toLowerCase()}s...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button className="btn btn-light" onClick={loadUsers}>Retry</button>
          </div>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-info">
                        <div className="user-name">{user.name || 'N/A'}</div>
                        <div className="user-role">{user.role}</div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <div className="contact-info">
                        {user.phone && <div>{user.phone}</div>}
                        {user.address && <div className="address-preview">{user.address.substring(0, 30)}...</div>}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${(user.status || 'pending').toLowerCase()}`}>
                        {user.status || 'Pending'}
                      </span>
                    </td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="View Details" onClick={() => viewUser(user._id)}>
                          <FaEye />
                        </button>
                        <button className="btn-icon" title="Edit User" onClick={() => editUser(user._id)}>
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon" 
                          title={user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                          onClick={() => toggleUserStatus(user._id, user.status)}
                        >
                          {user.status === 'Active' ? <FaUserTimes /> : <FaUserCheck />}
                        </button>
                        <button 
                          className="btn-icon danger" 
                          title="Delete User"
                          onClick={() => deleteUser(user._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <div className="empty-state">
                <p>No {currentRole.toLowerCase()}s found</p>
                <button className="btn btn-primary" onClick={() => navigate('/admin/users/new')}>
                  Add First {currentRole}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {users.length > 0 && (
          <div className="pagination">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
