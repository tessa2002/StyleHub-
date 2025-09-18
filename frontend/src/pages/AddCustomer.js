import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AddCustomer.css"; // ✅ Import your CSS

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const phoneRegex = /^[0-9]{7,15}$/; // digits only, 7-15 length

const initialForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  measurements: {
    chest: "",
    waist: "",
    hips: "",
    shoulder: "",
    armLength: "",
    legLength: "",
  },
  notes: "",
};

const AddCustomer = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (Object.prototype.hasOwnProperty.call(customer.measurements, name)) {
      setCustomer((prev) => ({
        ...prev,
        measurements: { ...prev.measurements, [name]: value },
      }));
    } else {
      setCustomer((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const errs = {};
    const name = customer.name.trim();
    const email = customer.email.trim();
    const phone = customer.phone.trim();

    if (!name) errs.name = "Name is required";
    if (!email) errs.email = "Email is required";
    else if (!emailRegex.test(email)) errs.email = "Invalid email format";

    if (!phone) errs.phone = "Phone is required";
    else if (!phoneRegex.test(phone)) errs.phone = "Phone must be 7-15 digits";

    return errs;
  };

  const numberOrUndefined = (v) =>
    v === "" || v === null || v === undefined ? undefined : Number(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) {
      toast.error("Please fix the highlighted errors.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim(),
        address: customer.address.trim(),
        measurements: Object.fromEntries(
          Object.entries(customer.measurements).map(([k, val]) => [
            k,
            numberOrUndefined(val),
          ])
        ),
        notes: customer.notes,
      };

      await axios.post("http://localhost:5000/api/customers", payload);
      toast.success("Customer added successfully");
      navigate("/customers");
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to add customer";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-customer">
      <h2>Add New Customer</h2>

      <form onSubmit={handleSubmit} noValidate>
        {/* Basic Info */}
        <div className="form-group">
          <label>Name*</label>
          <input
            type="text"
            name="name"
            value={customer.name}
            onChange={handleChange}
            required
            aria-invalid={!!errors.name}
          />
          {errors.name && <small className="error">{errors.name}</small>}
        </div>

        <div className="form-group">
          <label>Email*</label>
          <input
            type="email"
            name="email"
            value={customer.email}
            onChange={handleChange}
            required
            aria-invalid={!!errors.email}
          />
          {errors.email && <small className="error">{errors.email}</small>}
        </div>

        <div className="form-group">
          <label>Phone* (digits only)</label>
          <input
            type="tel"
            name="phone"
            value={customer.phone}
            onChange={handleChange}
            required
            aria-invalid={!!errors.phone}
            pattern={phoneRegex.source}
          />
          {errors.phone && <small className="error">{errors.phone}</small>}
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={customer.address}
            onChange={handleChange}
          />
        </div>

        {/* Measurements */}
        <h3>Measurements</h3>
        <div className="measurements">
          {["chest", "waist", "hips", "shoulder", "armLength", "legLength"].map(
            (field) => (
              <div className="form-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type="number"
                  name={field}
                  value={customer.measurements[field]}
                  onChange={handleChange}
                />
              </div>
            )
          )}
        </div>

        {/* Notes */}
        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={customer.notes}
            onChange={handleChange}
          ></textarea>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "➕ Add Customer"}
        </button>
      </form>
    </div>
  );
};

export default AddCustomer;
