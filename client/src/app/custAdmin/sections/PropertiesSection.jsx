'use client';

import { useState } from 'react';
import { sharedStyles, Alert } from '../admin-components';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL + '/cust' || '';

export default function PropertiesSection({ user }) {
  const [formData, setFormData] = useState({
    customer_id: '',
    property_id: '',
    property_name: '',
    property_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.property_id || !formData.property_name || !formData.property_address) {
      setAlert({ type: 'error', message: 'All fields are required' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE}/admin/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, created_by: user?.unique_id || 'ADMIN-001' }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlert({ type: 'success', message: 'Property created successfully' });
        setFormData({ customer_id: '', property_id: '', property_name: '', property_address: '' });
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to create property' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <style jsx>{sharedStyles}</style>
      <style jsx>{`
        .two-col {
          display: grid;
          grid-template-columns: 1.4fr 0.6fr;
          gap: 1.25rem;
          align-items: start;
        }

        @media (max-width: 900px) {
          .two-col {
            grid-template-columns: 1fr;
          }
        }

        .guidelines {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .guidelines li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
          color: #6b7280;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .guidelines li:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .guidelines li .bullet {
          width: 4px;
          height: 4px;
          background: #2563eb;
          border-radius: 50%;
          flex-shrink: 0;
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Create Property</h1>
        <p className="page-subtitle">Add a new property and assign it to a customer</p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="two-col">
        <div className="card">
          <h3 className="card-title">Property Details</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="customer_id">Customer ID</label>
                <input type="text" id="customer_id" name="customer_id" className="form-input" placeholder="CUST-1001"
                  value={formData.customer_id} onChange={handleChange} disabled={loading} required />
                <div className="form-hint">Unique customer identifier</div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="property_id">Property ID</label>
                <input type="text" id="property_id" name="property_id" className="form-input" placeholder="PROP-001"
                  value={formData.property_id} onChange={handleChange} disabled={loading} required />
                <div className="form-hint">Must be unique</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="property_name">Property Name</label>
              <input type="text" id="property_name" name="property_name" className="form-input" placeholder="Hotel Sunrise"
                value={formData.property_name} onChange={handleChange} disabled={loading} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="property_address">Property Address</label>
              <textarea id="property_address" name="property_address" className="form-textarea" placeholder="109 W 8TH ST, Mound City, MO"
                value={formData.property_address} onChange={handleChange} disabled={loading} required />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Property'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="card-title">Guidelines</h3>
          <ul className="guidelines">
            <li><span className="bullet"></span> Each property belongs to one customer</li>
            <li><span className="bullet"></span> Property IDs must be unique system-wide</li>
            <li><span className="bullet"></span> Use format: CUST-#### for customer IDs</li>
            <li><span className="bullet"></span> Properties can have multiple plans over time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}