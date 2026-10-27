'use client';

import { useState } from 'react';
import { sharedStyles, Alert } from '../admin-components';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL + '/cust' || '';

const PLAN_OPTIONS = {
  dedicated: [
    {
      id: 'dedicated_8',
      name: '8 hour (1 shift)',
      service_type: 'DEDICATED',
      shift_hours: 8,
      shifts: 1,
      monthly_price: 1800,
      hourly_rate: 7.50,
      onboarding_fee: 1500,
      installation_fee: 1500,
      hardware_cost: 0,
      additional_shifts_rate: 7,
      cash_machine_cost: 999,
      remote_support: true,
      onsite_support_rate: 800,
    },
    {
      id: 'dedicated_16',
      name: '16 hour (2 shifts)',
      service_type: 'DEDICATED',
      shift_hours: 16,
      shifts: 2,
      monthly_price: 2880,
      hourly_rate: 6.00,
      onboarding_fee: 1500,
      installation_fee: 1500,
      hardware_cost: 0,
      additional_shifts_rate: 7,
      cash_machine_cost: 999,
      remote_support: true,
      onsite_support_rate: 800,
    },
    {
      id: 'dedicated_24',
      name: '24 hour (3 shifts)',
      service_type: 'DEDICATED',
      shift_hours: 24,
      shifts: 3,
      monthly_price: 3600,
      hourly_rate: 5.00,
      onboarding_fee: 1500,
      installation_fee: 1500,
      hardware_cost: 0,
      additional_shifts_rate: 0,
      cash_machine_cost: 999,
      remote_support: true,
      onsite_support_rate: 800,
    },
  ],
  shared: [
    {
      id: 'shared_8',
      name: '8 hour (1 shift)',
      service_type: 'SHARED',
      shift_hours: 8,
      shifts: 1,
      monthly_price: 1400,
      hourly_rate: 5.83,
      onboarding_fee: 1500,
      installation_fee: 1500,
      hardware_cost: 0,
      additional_shifts_rate: 7,
      cash_machine_cost: 999,
      remote_support: true,
      onsite_support_rate: 800,
    },
    {
      id: 'shared_16',
      name: '16 hour (2 shifts)',
      service_type: 'SHARED',
      shift_hours: 16,
      shifts: 2,
      monthly_price: 1900,
      hourly_rate: 3.96,
      onboarding_fee: 1500,
      installation_fee: 1500,
      hardware_cost: 0,
      additional_shifts_rate: 7,
      cash_machine_cost: 999,
      remote_support: true,
      onsite_support_rate: 800,
    },
    {
      id: 'shared_24',
      name: '24 hour (3 shifts)',
      service_type: 'SHARED',
      shift_hours: 24,
      shifts: 3,
      monthly_price: 2400,
      hourly_rate: 3.33,
      onboarding_fee: 1500,
      installation_fee: 1500,
      hardware_cost: 0,
      additional_shifts_rate: 0,
      cash_machine_cost: 999,
      remote_support: true,
      onsite_support_rate: 800,
    },
  ],
};

export default function ServicePlansSection({ user }) {
  const [activeCategory, setActiveCategory] = useState('dedicated');
  const [selectedPlan, setSelectedPlan] = useState(null);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectPlan = (plan) => {
    setSelectedPlan(plan.id);
    setFormData(prev => ({
      ...prev,
      plan_name: plan.name,
      service_type: plan.service_type,
      shift_hours: plan.shift_hours,
      monthly_price: plan.monthly_price,
      onboarding_fee: plan.onboarding_fee,
      installation_fee: plan.installation_fee,
    }));
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSelectedPlan(null);
    setFormData(prev => ({
      ...prev,
      plan_name: '',
      service_type: '',
      shift_hours: '',
      monthly_price: '',
      onboarding_fee: '',
      installation_fee: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.property_id || !formData.plan_name ||
        !formData.service_type || !formData.shift_hours || !formData.monthly_price || !formData.start_date) {
      setAlert({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE}/admin/service-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          shift_hours: Number(formData.shift_hours),
          monthly_price: Number(formData.monthly_price),
          onboarding_fee: Number(formData.onboarding_fee) || 0,
          installation_fee: Number(formData.installation_fee) || 0,
          created_by: user?.unique_id || 'ADMIN-001',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlert({ type: 'success', message: 'Service plan assigned successfully' });
        setFormData({
          customer_id: '', property_id: '', plan_name: '', service_type: '',
          shift_hours: '', monthly_price: '', onboarding_fee: '', installation_fee: '', start_date: ''
        });
        setSelectedPlan(null);
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to assign plan' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fmt = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
  };

  const plans = PLAN_OPTIONS[activeCategory];

  return (
    <div className="page">
      <style jsx>{sharedStyles}</style>
      <style jsx>{`
        /* Category Toggle */
        .category-toggle {
          display: inline-flex;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 3px;
          margin-bottom: 1.25rem;
        }

        .category-btn {
          padding: 0.5rem 1.25rem;
          border: none;
          background: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .category-btn:hover {
          color: #334155;
        }

        .category-btn.active {
          background: #ffffff;
          color: #2563eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .category-btn .icon {
          width: 16px;
          height: 16px;
        }

        /* Plans Grid */
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 0.25rem;
        }

        @media (max-width: 900px) {
          .plans-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Plan Card */
        .plan-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
          position: relative;
          overflow: hidden;
        }

        .plan-card:hover {
          border-color: #93c5fd;
        }

        .plan-card.selected {
          border-color: #2563eb;
        }

        .plan-card.selected .plan-header {
          background: #2563eb;
        }

        .plan-header {
          background: #1e3a5f;
          color: white;
          padding: 0.875rem 1rem;
          text-align: center;
          transition: background 0.15s;
        }

        .plan-header-name {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 0.125rem;
        }

        .plan-header-shifts {
          font-size: 11px;
          opacity: 0.8;
          font-weight: 500;
        }

        .plan-body {
          padding: 1rem;
        }

        /* Price Block */
        .price-block {
          text-align: center;
          padding-bottom: 0.875rem;
          margin-bottom: 0.875rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .price-main {
          font-size: 24px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.02em;
        }

        .price-sub {
          font-size: 12px;
          color: #6b7280;
          margin-top: 0.125rem;
        }

        .price-period {
          font-size: 11px;
          color: #9ca3af;
        }

        /* Detail Rows */
        .detail-section-label {
          font-size: 10px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.5rem;
          margin-top: 0.75rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.35rem 0;
          font-size: 12px;
        }

        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          color: #111827;
          font-weight: 600;
        }

        .detail-value.included {
          color: #059669;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .detail-value.zero {
          color: #d1d5db;
        }

        .detail-divider {
          border: none;
          border-top: 1px solid #f1f5f9;
          margin: 0.625rem 0;
        }

        /* Selected indicator */
        .selected-badge {
          position: absolute;
          top: 0.625rem;
          right: 0.625rem;
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .selected-badge svg {
          width: 14px;
          height: 14px;
          color: #2563eb;
        }

        /* Assignment Form */
        .assignment-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 640px) {
          .assignment-grid {
            grid-template-columns: 1fr;
          }
        }

        .full-span {
          grid-column: 1 / -1;
        }

        /* Category description */
        .category-desc {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .category-desc .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2563eb;
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Assign Service Plan</h1>
        <p className="page-description">Select a plan category, choose a plan, and assign it to a property</p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Category Toggle */}
      <div className="card">
        <div className="category-toggle">
          <button
            className={`category-btn ${activeCategory === 'dedicated' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('dedicated')}
          >
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Dedicated Service
          </button>
          <button
            className={`category-btn ${activeCategory === 'shared' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('shared')}
          >
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Shared Service
          </button>
        </div>

        <div className="category-desc">
          <span className="dot"></span>
          {activeCategory === 'dedicated'
            ? 'Dedicated service with agreement — exclusive agent assigned to the property'
            : 'Shared service with agreement — cost-effective solution with shared resources'}
        </div>

        {/* Plans Grid */}
        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
              onClick={() => selectPlan(plan)}
            >
              {/* Selected Check */}
              {selectedPlan === plan.id && (
                <div className="selected-badge">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}

              {/* Header */}
              <div className="plan-header">
                <div className="plan-header-name">{plan.shift_hours} Hour</div>
                <div className="plan-header-shifts">{plan.shifts} Shift{plan.shifts > 1 ? 's' : ''}</div>
              </div>

              <div className="plan-body">
                {/* Price */}
                <div className="price-block">
                  <div className="price-main">{fmt(plan.monthly_price)}</div>
                  <div className="price-sub">{fmt(plan.hourly_rate)}/hr</div>
                  <div className="price-period">Kiosk subscription fee monthly</div>
                </div>

                {/* Fees */}
                <div className="detail-section-label">One-Time Fees</div>
                <div className="detail-row">
                  <span className="detail-label">Onboarding fee</span>
                  <span className="detail-value">{fmt(plan.onboarding_fee)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Installation fee</span>
                  <span className="detail-value">{fmt(plan.installation_fee)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Hardware cost</span>
                  <span className={`detail-value ${plan.hardware_cost === 0 ? 'zero' : ''}`}>
                    {plan.hardware_cost === 0 ? '$0' : fmt(plan.hardware_cost)}
                  </span>
                </div>

                <hr className="detail-divider" />

                {/* Add-ons */}
                <div className="detail-section-label">Add-ons</div>
                <div className="detail-row">
                  <span className="detail-label">Additional shifts</span>
                  <span className={`detail-value ${plan.additional_shifts_rate === 0 ? 'zero' : ''}`}>
                    {plan.additional_shifts_rate > 0 ? `$${plan.additional_shifts_rate}/hr` : '$0'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Cash machine</span>
                  <span className="detail-value">{fmt(plan.cash_machine_cost)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">24/7 Remote Support</span>
                  <span className="detail-value included">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    included
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">On-Site Support</span>
                  <span className="detail-value">${plan.onsite_support_rate}/trip</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assignment Form */}
      <div className="card">
        <h3 className="card-title">Assignment Details</h3>

        {selectedPlan && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #dbeafe',
            borderRadius: '6px',
            padding: '0.625rem 0.875rem',
            marginBottom: '1rem',
            fontSize: '13px',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Selected: <strong>{plans.find(p => p.id === selectedPlan)?.service_type}</strong> — {plans.find(p => p.id === selectedPlan)?.name} at {fmt(plans.find(p => p.id === selectedPlan)?.monthly_price)}/mo
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="assignment-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="customer_id">Customer ID</label>
              <input type="text" id="customer_id" name="customer_id" className="form-input" placeholder="CUST-1001"
                value={formData.customer_id} onChange={handleChange} disabled={loading} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="property_id">Property ID</label>
              <input type="text" id="property_id" name="property_id" className="form-input" placeholder="PROP-001"
                value={formData.property_id} onChange={handleChange} disabled={loading} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="plan_name">Plan Name</label>
              <input type="text" id="plan_name" name="plan_name" className="form-input"
                value={formData.plan_name} onChange={handleChange} disabled={loading} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="monthly_price">Monthly Price ($)</label>
              <input type="number" id="monthly_price" name="monthly_price" className="form-input"
                value={formData.monthly_price} onChange={handleChange} disabled={loading} required min="0" step="0.01" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="onboarding_fee">Onboarding Fee ($)</label>
              <input type="number" id="onboarding_fee" name="onboarding_fee" className="form-input"
                value={formData.onboarding_fee} onChange={handleChange} disabled={loading} min="0" step="0.01" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="installation_fee">Installation Fee ($)</label>
              <input type="number" id="installation_fee" name="installation_fee" className="form-input"
                value={formData.installation_fee} onChange={handleChange} disabled={loading} min="0" step="0.01" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="start_date">Start Date</label>
              <input type="date" id="start_date" name="start_date" className="form-input"
                value={formData.start_date} onChange={handleChange} disabled={loading} required />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={loading || !selectedPlan} style={{ width: '100%' }}>
                {loading ? 'Assigning...' : 'Assign Service Plan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}