import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './EditCustomer.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const phoneRegex = /^[0-9]{7,15}$/;

const emptyCustomer = {
  name: '',
  phone: '',
  email: '',
  address: '',
  measurements: {
    chest: '',
    waist: '',
    hips: '',
    shoulder: '',
    armLength: '',
    legLength: ''
  },
  notes: ''
};

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(emptyCustomer);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/customers/${id}`);
      // Ensure measurements object exists
      setCustomer({
        ...res.data.customer,
        measurements: {
          chest: res.data.customer?.measurements?.chest ?? '',
          waist: res.data.customer?.measurements?.waist ?? '',
          hips: res.data.customer?.measurements?.hips ?? '',
          shoulder: res.data.customer?.measurements?.shoulder ?? '',
          armLength: res.data.customer?.measurements?.armLength ?? '',
          legLength: res.data.customer?.measurements?.legLength ?? ''
        }
      });
    } catch (err) {
      toast.error('Failed to load customer');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (Object.prototype.hasOwnProperty.call(customer.measurements, name)) {
      setCustomer(prev => ({
        ...prev,
        measurements: { ...prev.measurements, [name]: value }
      }));
    } else {
      setCustomer(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const errs = {};
    const name = customer.name?.trim() || '';
    const email = customer.email?.trim() || '';
    const phone = customer.phone?.trim() || '';

    if (!name) errs.name = 'Name is required';
    if (!email) errs.email = 'Email is required';
    else if (!emailRegex.test(email)) errs.email = 'Invalid email format';

    if (!phone) errs.phone = 'Phone is required';
    else if (!phoneRegex.test(phone)) errs.phone = 'Phone must be 7-15 digits';

    return errs;
  };

  const numberOrUndefined = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) {
      toast.error('Please fix the highlighted errors.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim(),
        address: customer.address?.trim() || '',
        measurements: Object.fromEntries(
          Object.entries(customer.measurements).map(([k, val]) => [k, numberOrUndefined(val)])
        ),
        notes: customer.notes || ''
      };

      await axios.put(`http://localhost:5000/api/customers/${id}`, payload);
      toast.success('Customer updated successfully');
      navigate('/customers');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update customer';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="edit-customer-container">Loading...</div>;

  return (
    <div className="edit-customer-container">
      <h2>Edit Customer</h2>
      <form onSubmit={handleSubmit} noValidate>
        <input name="name" value={customer.name} onChange={handleChange} placeholder="Name" required aria-invalid={!!errors.name} />
        {errors.name && <small style={{ color: 'red' }}>{errors.name}</small>}

        <input name="email" value={customer.email} onChange={handleChange} placeholder="Email" required aria-invalid={!!errors.email} />
        {errors.email && <small style={{ color: 'red' }}>{errors.email}</small>}

        <input name="phone" value={customer.phone} onChange={handleChange} placeholder="Phone" required aria-invalid={!!errors.phone} pattern={phoneRegex.source} />
        {errors.phone && <small style={{ color: 'red' }}>{errors.phone}</small>}

        <input name="address" value={customer.address} onChange={handleChange} placeholder="Address" />

        <h4>Measurements</h4>
        <input name="chest" value={customer.measurements.chest} onChange={handleChange} placeholder="Chest" type="number" />
        <input name="waist" value={customer.measurements.waist} onChange={handleChange} placeholder="Waist" type="number" />
        <input name="hips" value={customer.measurements.hips} onChange={handleChange} placeholder="Hips" type="number" />
        <input name="shoulder" value={customer.measurements.shoulder} onChange={handleChange} placeholder="Shoulder" type="number" />
        <input name="armLength" value={customer.measurements.armLength} onChange={handleChange} placeholder="Arm Length" type="number" />
        <input name="legLength" value={customer.measurements.legLength} onChange={handleChange} placeholder="Leg Length" type="number" />

        <textarea name="notes" value={customer.notes} onChange={handleChange} placeholder="Notes" />
        <button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Update Customer'}</button>
      </form>
    </div>
  );
};

export default EditCustomer;