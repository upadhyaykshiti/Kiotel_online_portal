'use client';

import { useState } from 'react';
import { sharedStyles, LoadingSpinner, Alert } from '../../../lib/custadd/components';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export default function PropertiesPage() {
  const [formData, setFormData] = useState({
    customer_id: '',
    property_id: '',
    property_name: '',
    property_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customer_id || !formData.property_id || !formData.property_name || !formData.property_address) {
      setAlert({ type: 'error', message: 'All fields are required' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE}/cust/admin/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          created_by: 'ADMIN-001', // TODO: Replace with auth context
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlert({ type: 'success', message: 'Property created successfully!' });
        // Reset form
        setFormData({
          customer_id: '',
          property_id: '',
          property_name: '',
          property_address: '',
        });
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to create property' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <style jsx>{sharedStyles}</style>
      <style jsx>{`
        .property-form {
          max-width: 800px;
        }

        .address-input {
          min-height: 80px;
          resize: vertical;
        }

        .form-hint {
          font-size: 0.8rem;
          color: #8892b0;
          margin-top: 0.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Properties Management</h1>
        <p className="page-description">
          Create new properties and assign them to customers
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="card property-form">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="customer_id">
                Customer ID
              </label>
              <input
                type="text"
                id="customer_id"
                name="customer_id"
                className="form-input"
                placeholder="e.g., CUST-1001"
                value={formData.customer_id}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <div className="form-hint">Unique customer identifier</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="property_id">
                Property ID
              </label>
              <input
                type="text"
                id="property_id"
                name="property_id"
                className="form-input"
                placeholder="e.g., PROP-001"
                value={formData.property_id}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <div className="form-hint">Must be unique across all properties</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="property_name">
              Property Name
            </label>
            <input
              type="text"
              id="property_name"
              name="property_name"
              className="form-input"
              placeholder="e.g., Hotel Sunrise"
              value={formData.property_name}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="property_address">
              Property Address
            </label>
            <textarea
              id="property_address"
              name="property_address"
              className="form-input address-input"
              placeholder="e.g., 109 W 8TH ST, Mound City, MO"
              value={formData.property_address}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Property'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ color: '#ccd6f6', marginBottom: '1rem', fontSize: '1.1rem' }}>
          Property Creation Rules
        </h3>
        <ul style={{ color: '#8892b0', lineHeight: '1.8' }}>
          <li>Each property belongs to exactly one customer</li>
          <li>Property IDs must be unique system-wide</li>
          <li>Customer IDs are VARCHAR (alphanumeric with hyphens)</li>
          <li>Properties can have multiple service plans over time</li>
        </ul>
      </div>
    </div>
  );
}