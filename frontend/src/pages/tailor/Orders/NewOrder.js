import React, { useState, useEffect } from 'react';
import TailorDashboardLayout from '../../../components/TailorDashboardLayout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';

const NewOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    serviceType: '',
    description: '',
    fabricId: '',
    measurements: {
      chest: '',
      waist: '',
      shoulder: '',
      length: '',
      sleeve: ''
    },
    deliveryDate: '',
    amount: '',
    advancePayment: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [customersRes, fabricsRes] = await Promise.all([
        axios.get('/api/tailor/customers').catch(() => ({ data: [] })),
        axios.get('/api/tailor/fabrics').catch(() => ({ data: [] }))
      ]);

      setCustomers(customersRes.data);
      setFabrics(fabricsRes.data);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('measurements.')) {
      const measurementField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [measurementField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerId && !formData.customerName) {
      newErrors.customer = 'Please select or enter customer details';
    }
    if (!formData.serviceType) {
      newErrors.serviceType = 'Service type is required';
    }
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    }
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        ...formData,
        orderNumber: `ORD-${Date.now()}`,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      await axios.post('/api/tailor/orders', orderData);
      
      alert('Order created successfully!');
      navigate('/tailor/orders');
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TailorDashboardLayout title="New Order">
      <div className="new-order-container">
        <form onSubmit={handleSubmit} className="order-form">
          {/* Customer Selection */}
          <div className="form-section">
            <h3>Customer Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Select Existing Customer</label>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Or Enter New Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Customer Name"
                />
              </div>
            </div>
            {errors.customer && <span className="error">{errors.customer}</span>}
          </div>

          {/* Order Details */}
          <div className="form-section">
            <h3>Order Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Service Type *</label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Service</option>
                  <option value="Suit Tailoring">Suit Tailoring</option>
                  <option value="Shirt Tailoring">Shirt Tailoring</option>
                  <option value="Dress Making">Dress Making</option>
                  <option value="Alterations">Alterations</option>
                  <option value="Custom Design">Custom Design</option>
                </select>
                {errors.serviceType && <span className="error">{errors.serviceType}</span>}
              </div>
              <div className="form-group">
                <label>Fabric</label>
                <select
                  name="fabricId"
                  value={formData.fabricId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Fabric</option>
                  {fabrics.map(fabric => (
                    <option key={fabric._id} value={fabric._id}>
                      {fabric.name} - {fabric.color}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Order description and special requirements"
                rows="3"
              />
            </div>
          </div>

          {/* Measurements */}
          <div className="form-section">
            <h3>Measurements (in inches)</h3>
            <div className="measurements-grid">
              <div className="form-group">
                <label>Chest</label>
                <input
                  type="number"
                  name="measurements.chest"
                  value={formData.measurements.chest}
                  onChange={handleInputChange}
                  placeholder="Chest"
                  step="0.5"
                />
              </div>
              <div className="form-group">
                <label>Waist</label>
                <input
                  type="number"
                  name="measurements.waist"
                  value={formData.measurements.waist}
                  onChange={handleInputChange}
                  placeholder="Waist"
                  step="0.5"
                />
              </div>
              <div className="form-group">
                <label>Shoulder</label>
                <input
                  type="number"
                  name="measurements.shoulder"
                  value={formData.measurements.shoulder}
                  onChange={handleInputChange}
                  placeholder="Shoulder"
                  step="0.5"
                />
              </div>
              <div className="form-group">
                <label>Length</label>
                <input
                  type="number"
                  name="measurements.length"
                  value={formData.measurements.length}
                  onChange={handleInputChange}
                  placeholder="Length"
                  step="0.5"
                />
              </div>
              <div className="form-group">
                <label>Sleeve</label>
                <input
                  type="number"
                  name="measurements.sleeve"
                  value={formData.measurements.sleeve}
                  onChange={handleInputChange}
                  placeholder="Sleeve"
                  step="0.5"
                />
              </div>
            </div>
          </div>

          {/* Payment & Delivery */}
          <div className="form-section">
            <h3>Payment & Delivery</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Total Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Total Amount"
                  required
                />
                {errors.amount && <span className="error">{errors.amount}</span>}
              </div>
              <div className="form-group">
                <label>Advance Payment</label>
                <input
                  type="number"
                  name="advancePayment"
                  value={formData.advancePayment}
                  onChange={handleInputChange}
                  placeholder="Advance Payment"
                />
              </div>
              <div className="form-group">
                <label>Delivery Date *</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  required
                />
                {errors.deliveryDate && <span className="error">{errors.deliveryDate}</span>}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="form-section">
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes or special instructions"
                rows="3"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/tailor/orders')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Order...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </TailorDashboardLayout>
  );
};

export default NewOrder;
