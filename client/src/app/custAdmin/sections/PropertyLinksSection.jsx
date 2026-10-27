'use client';

import { useState } from 'react';
import { sharedStyles, Alert } from '../admin-components';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL + '/cust' || '';

export default function PropertyLinksSection({ user }) {
  const [formData, setFormData] = useState({
    property_id: '',
    shared_folder_url: '',
    invoice_portal_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.property_id) {
      setAlert({ type: 'error', message: 'Property ID is required' });
      return;
    }

    if (formData.shared_folder_url && !validateUrl(formData.shared_folder_url)) {
      setAlert({ type: 'error', message: 'Invalid shared folder URL' });
      return;
    }

    if (formData.invoice_portal_url && !validateUrl(formData.invoice_portal_url)) {
      setAlert({ type: 'error', message: 'Invalid invoice portal URL' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE}/admin/property-links`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: formData.property_id,
          shared_folder_url: formData.shared_folder_url || null,
          invoice_portal_url: formData.invoice_portal_url || null,
          created_by: user?.unique_id || 'ADMIN-001',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlert({ type: 'success', message: 'Property links updated successfully' });
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to update links' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const testLink = (url) => {
    if (url && validateUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="page">
      <style jsx>{sharedStyles}</style>
      <style jsx>{`
        .info-banner {
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 6px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.25rem;
          font-size: 13px;
          color: #1e40af;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .info-banner svg {
          flex-shrink: 0;
        }

        .url-input-wrap {
          display: flex;
          gap: 0.5rem;
        }

        .url-input-wrap .form-input {
          flex: 1;
        }

        .test-btn {
          padding: 0.5rem 0.875rem;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .test-btn:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .test-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .form-card {
          max-width: 720px;
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Property Links</h1>
        <p className="page-subtitle">Manage shared folder and invoice portal links</p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="info-banner">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        Links are displayed in the customer portal. Empty links wont be shown to customers.
      </div>

      <div className="card form-card">
        <h3 className="card-title">Update Links</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="property_id">Property ID</label>
            <input
              type="text"
              id="property_id"
              name="property_id"
              className="form-input"
              placeholder="PROP-001"
              value={formData.property_id}
              onChange={handleChange}
              disabled={loading}
              required
              style={{ maxWidth: '300px' }}
            />
            <div className="form-hint">Enter property ID to update links</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="shared_folder_url">Shared Folder URL</label>
            <div className="url-input-wrap">
              <input
                type="url"
                id="shared_folder_url"
                name="shared_folder_url"
                className="form-input"
                placeholder="https://drive.google.com/..."
                value={formData.shared_folder_url}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="test-btn"
                onClick={() => testLink(formData.shared_folder_url)}
                disabled={!formData.shared_folder_url || loading}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Test
              </button>
            </div>
            <div className="form-hint">Google Drive, Dropbox, or any shared folder</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="invoice_portal_url">Invoice Portal URL</label>
            <div className="url-input-wrap">
              <input
                type="url"
                id="invoice_portal_url"
                name="invoice_portal_url"
                className="form-input"
                placeholder="https://billing.example.com/..."
                value={formData.invoice_portal_url}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="test-btn"
                onClick={() => testLink(formData.invoice_portal_url)}
                disabled={!formData.invoice_portal_url || loading}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Test
              </button>
            </div>
            <div className="form-hint">Billing or invoice management system</div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Links'}
          </button>
        </form>
      </div>
    </div>
  );
}