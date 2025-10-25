import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import {
  FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaTshirt, FaMale, FaFemale
} from 'react-icons/fa';
import './Measurements.css';

const Measurements = () => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [filterGarment, setFilterGarment] = useState('all');

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/measurements');
      // Handle the API response format: { success: true, measurements: [...] }
      const measurementsData = response.data.measurements || [];
      setMeasurements(Array.isArray(measurementsData) ? measurementsData : []);
    } catch (error) {
      console.error('Error fetching measurements:', error);
      setMeasurements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (measurementId) => {
    if (window.confirm('Are you sure you want to delete this measurement?')) {
      try {
        await axios.delete(`/api/measurements/${measurementId}`);
        setMeasurements(measurements.filter(m => m.id !== measurementId));
        alert('Measurement deleted successfully');
      } catch (error) {
        console.error('Error deleting measurement:', error);
        alert('Error deleting measurement');
      }
    }
  };

  const filteredMeasurements = Array.isArray(measurements) ? measurements.filter(measurement => {
    const customerName = measurement.customerName || '';
    const garmentType = measurement.garmentType || '';
    const measurementId = measurement.id || measurement._id || '';
    
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         garmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         measurementId.toString().includes(searchTerm);
    const matchesCustomer = filterCustomer === 'all' || customerName === filterCustomer;
    const matchesGarment = filterGarment === 'all' || garmentType === filterGarment;
    return matchesSearch && matchesCustomer && matchesGarment;
  }) : [];

  const getGarmentIcon = (garmentType) => {
    switch (garmentType) {
      case 'Shirt': return <FaTshirt />;
      case 'Dress': return <FaFemale />;
      case 'Pant': return <FaMale />;
      case 'Blouse': return <FaFemale />;
      case 'Suit': return <FaMale />;
      default: return <FaTshirt />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="measurements-page">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading measurements...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="measurements-page">
        <div className="page-header">
          <h1>Measurements Management</h1>
          <p>Manage customer measurements and sizing data</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="controls-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search measurements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Customers</option>
              {Array.from(new Set(measurements.map(m => m.customerName))).map(customer => (
                <option key={customer} value={customer}>{customer}</option>
              ))}
            </select>
            
            <select
              value={filterGarment}
              onChange={(e) => setFilterGarment(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Garments</option>
              <option value="Shirt">Shirt</option>
              <option value="Pant">Pant</option>
              <option value="Dress">Dress</option>
              <option value="Blouse">Blouse</option>
              <option value="Suit">Suit</option>
            </select>
          </div>
        </div>

        {/* Measurements Table */}
        <div className="table-section">
          <div className="table-header">
            <h3>All Measurements ({filteredMeasurements.length})</h3>
            <Link to="/admin/measurements/new" className="btn btn-primary">
              <FaPlus /> Add Measurement
            </Link>
          </div>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Garment Type</th>
                  <th>Measurements</th>
                  <th>Last Updated</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeasurements.length > 0 ? (
                  filteredMeasurements.map(measurement => (
                    <tr key={measurement.id}>
                      <td>
                        <div className="customer-info">
                          <div className="customer-name">{measurement.customerName}</div>
                          <div className="customer-id">ID: {measurement.customerId}</div>
                        </div>
                      </td>
                      <td>
                        <div className="garment-type">
                          {getGarmentIcon(measurement.garmentType)}
                          <span>{measurement.garmentType}</span>
                        </div>
                      </td>
                      <td>
                        <div className="measurements-preview">
                          {Object.entries(measurement.measurements || {}).slice(0, 3).map(([key, value]) => (
                            <span key={key} className="measurement-item">
                              {key}: {value}
                            </span>
                          ))}
                          {Object.keys(measurement.measurements || {}).length > 3 && (
                            <span className="more-indicator">+{Object.keys(measurement.measurements || {}).length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td>{measurement.lastUpdated || measurement.updatedAt || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${measurement.status || 'active'}`}>
                          {measurement.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/admin/measurements/${measurement.id}`} className="btn-icon view">
                            <FaEye />
                          </Link>
                          <Link to={`/admin/measurements/${measurement.id}/edit`} className="btn-icon edit">
                            <FaEdit />
                          </Link>
                          <button 
                            onClick={() => handleDelete(measurement.id)}
                            className="btn-icon delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No measurements found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Measurements;