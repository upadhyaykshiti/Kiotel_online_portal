'use client';

import { useState } from 'react';
import { sharedStyles, LoadingSpinner, Alert } from '../../../lib/custadd/components';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export default function ServicePlansPage() {
  const [formData, setFormData] = useState({
    customer_id: '',
    property_id: '',
    plan_name: '',
    service_type: '',
    shift_hours: '',
    monthly_price: '',
    onboarding_fee: '',
    installation_fee: '',
    start_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (['shift_hours', 'monthly_price', 'onboarding_fee', 'installation_fee'].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customer_id || !formData.property_id || !formData.plan_name || 
        !formData.service_type || !formData.shift_hours || !formData.monthly_price || 
        !formData.start_date) {
      setAlert({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE}cust/admin/service-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: formData.customer_id,
          property_id: formData.property_id,
          plan_name: formData.plan_name,
          service_type: formData.service_type,
          shift_hours: Number(formData.shift_hours),
          monthly_price: Number(formData.monthly_price),
          onboarding_fee: Number(formData.onboarding_fee) || 0,
          installation_fee: Number(formData.installation_fee) || 0,
          start_date: formData.start_date,
          created_by: 'ADMIN-001', // TODO: Replace with auth context
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlert({ type: 'success', message: 'Service plan assigned successfully! Previous plan marked as expired.' });
        // Reset form
        setFormData({
          customer_id: '',
          property_id: '',
          plan_name: '',
          service_type: '',
          shift_hours: '',
          monthly_price: '',
          onboarding_fee: '',
          installation_fee: '',
          start_date: '',
        });
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to assign service plan' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Quick plan templates
  const applyTemplate = (template) => {
    const templates = {
      dedicated8: {
        plan_name: 'Dedicated 8hr',
        service_type: 'DEDICATED',
        shift_hours: 8,
        monthly_price: 1800,
        onboarding_fee: 1500,
        installation_fee: 1500,
      },
      dedicated16: {
        plan_name: 'Dedicated 16hr',
        service_type: 'DEDICATED',
        shift_hours: 16,
        monthly_price: 2800,
        onboarding_fee: 1500,
        installation_fee: 1500,
      },
      dedicated24: {
        plan_name: 'Dedicated 24hr',
        service_type: 'DEDICATED',
        shift_hours: 24,
        monthly_price: 3800,
        onboarding_fee: 1500,
        installation_fee: 1500,
      },
      shared: {
        plan_name: 'Shared Plan',
        service_type: 'SHARED',
        shift_hours: 8,
        monthly_price: 1200,
        onboarding_fee: 1000,
        installation_fee: 1000,
      },
    };

    setFormData((prev) => ({ ...prev, ...templates[template] }));
  };

  return (
    <div className="admin-page">
      <style jsx>{sharedStyles}</style>
      <style jsx>{`
        .service-plan-form {
          max-width: 900px;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .template-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .template-btn {
          padding: 0.625rem 1.25rem;
          background: rgba(100, 120, 255, 0.08);
          border: 1px solid rgba(100, 120, 255, 0.2);
          border-radius: 6px;
          color: #6478ff;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .template-btn:hover {
          background: rgba(100, 120, 255, 0.15);
          border-color: rgba(100, 120, 255, 0.3);
        }

        @media (max-width: 768px) {
          .form-grid-3,
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Service Plan Assignment</h1>
        <p className="page-description">
          Assign or update service plans for properties
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="card service-plan-form">
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#ccd6f6', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            Quick Templates
          </h3>
          <div className="template-buttons">
            <button
              type="button"
              className="template-btn"
              onClick={() => applyTemplate('dedicated8')}
            >
              Dedicated 8hr
            </button>
            <button
              type="button"
              className="template-btn"
              onClick={() => applyTemplate('dedicated16')}
            >
              Dedicated 16hr
            </button>
            <button
              type="button"
              className="template-btn"
              onClick={() => applyTemplate('dedicated24')}
            >
              Dedicated 24hr
            </button>
            <button
              type="button"
              className="template-btn"
              onClick={() => applyTemplate('shared')}
            >
              Shared Plan
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="customer_id">
                Customer ID *
              </label>
              <input
                type="text"
                id="customer_id"
                name="customer_id"
                className="form-input"
                placeholder="CUST-1001"
                value={formData.customer_id}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="property_id">
                Property ID *
              </label>
              <input
                type="text"
                id="property_id"
                name="property_id"
                className="form-input"
                placeholder="PROP-001"
                value={formData.property_id}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="plan_name">
                Plan Name *
              </label>
              <input
                type="text"
                id="plan_name"
                name="plan_name"
                className="form-input"
                placeholder="Dedicated 8hr"
                value={formData.plan_name}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="service_type">
                Service Type *
              </label>
              <select
                id="service_type"
                name="service_type"
                className="form-select"
                value={formData.service_type}
                onChange={handleInputChange}
                disabled={loading}
                required
              >
                <option value="">Select type</option>
                <option value="DEDICATED">DEDICATED</option>
                <option value="SHARED">SHARED</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="shift_hours">
                Shift Hours *
              </label>
              <select
                id="shift_hours"
                name="shift_hours"
                className="form-select"
                value={formData.shift_hours}
                onChange={handleInputChange}
                disabled={loading}
                required
              >
                <option value="">Select hours</option>
                <option value="8">8 hours</option>
                <option value="16">16 hours</option>
                <option value="24">24 hours</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="monthly_price">
                Monthly Price ($) *
              </label>
              <input
                type="number"
                id="monthly_price"
                name="monthly_price"
                className="form-input"
                placeholder="1800"
                value={formData.monthly_price}
                onChange={handleInputChange}
                disabled={loading}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="start_date">
                Start Date *
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                className="form-input"
                value={formData.start_date}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="onboarding_fee">
                Onboarding Fee ($)
              </label>
              <input
                type="number"
                id="onboarding_fee"
                name="onboarding_fee"
                className="form-input"
                placeholder="1500"
                value={formData.onboarding_fee}
                onChange={handleInputChange}
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="installation_fee">
                Installation Fee ($)
              </label>
              <input
                type="number"
                id="installation_fee"
                name="installation_fee"
                className="form-input"
                placeholder="1500"
                value={formData.installation_fee}
                onChange={handleInputChange}
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Assigning Plan...' : 'Assign Service Plan'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ color: '#ccd6f6', marginBottom: '1rem', fontSize: '1.1rem' }}>
          Important Notes
        </h3>
        <ul style={{ color: '#8892b0', lineHeight: '1.8' }}>
          <li>Submitting a new plan automatically marks the previous plan as EXPIRED</li>
          <li>Service plans are always assigned to a property, not directly to a customer</li>
          <li>One-time fees (onboarding, installation) are optional</li>
          <li>Start date should be set appropriately for billing cycles</li>
        </ul>
      </div>
    </div>
  );
}