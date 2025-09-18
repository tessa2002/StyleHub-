import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Customers.css';  // New CSS file for styling

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customersRef, setCustomersRef] = useState([]); // keeps original for search

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers');
      if (response.data.success) {
        setCustomers(response.data.customers);
        setCustomersRef(response.data.customers);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/customers/${id}`);
        setCustomers(customers.filter(customer => customer._id !== id));
      } catch (error) {
        console.error('Failed to delete customer:', error);
      }
    }
  };

  return (
    <div className="customers-container">
      <h1>👥 Customers</h1>

      <div className="customers-toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, phone, or email..."
          onChange={(e) => {
            const q = e.target.value.toLowerCase();
            const filtered = customersRef.filter((c) =>
              [c.name, c.phone, c.email, c.address]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
            );
            setCustomers(filtered);
          }}
        />
        <Link to="/add-customer">
          <button className="add-button">➕ Add New Customer</button>
        </Link>
      </div>

      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <table className="customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer._id}>
                <td>
                  <div className="customer-cell">
                    <span className="avatar">{(customer.name || '?').slice(0,2).toUpperCase()}</span>
                    <span>{customer.name}</span>
                  </div>
                </td>
                <td><span className="badge">{customer.phone}</span></td>
                <td>{customer.email || '-'}</td>
                <td>{customer.address || '-'}</td>
                <td className="actions-cell">
                  <Link to={`/edit-customer/${customer._id}`}>
                    <button className="edit-button">✏️ Edit</button>
                  </Link>
                  <Link to={`/customers/${customer._id}`}>
                    <button className="edit-button">👤 Profile</button>
                  </Link>
                  <Link to={`/customers/${customer._id}/measurements`}>
                    <button className="edit-button">📏 Measurements</button>
                  </Link>
                  <button className="delete-button" onClick={() => handleDelete(customer._id)}>
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Customers;
