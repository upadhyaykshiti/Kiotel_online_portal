'use client';

import { useState } from 'react';
import { sharedStyles, Alert } from '../../../lib/custadd/components';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export default function PropertyLinksPage() {
  const [formData, setFormData] = useState({
    property_id: '',
    shared_folder_url: '',
    invoice_portal_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateUrl = (url) => {
    if (!url) return true; // Empty URLs are allowed
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.property_id) {
      setAlert({ type: 'error', message: 'Property ID is required' });
      return;
    }

    if (formData.shared_folder_url && !validateUrl(formData.shared_folder_url)) {
      setAlert({ type: 'error', message: 'Invalid shared folder URL format' });
      return;
    }

    if (formData.invoice_portal_url && !validateUrl(formData.invoice_portal_url)) {
      setAlert({ type: 'error', message: 'Invalid invoice portal URL format' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE}/cust/admin/property-links`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: formData.property_id,
          shared_folder_url: formData.shared_folder_url || null,
          invoice_portal_url: formData.invoice_portal_url || null,
          created_by: 'ADMIN-001', // TODO: Replace with auth context
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlert({ type: 'success', message: 'Property links updated successfully!' });
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to update property links' });
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
    <div className="admin-page">
      <style jsx>{sharedStyles}</style>
      <style jsx>{`
        .property-links-form {
          max-width: 800px;
        }

        .url-input-group {
          position: relative;
        }

        .test-link-btn {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(100, 120, 255, 0.1);
          border: 1px solid rgba(100, 120, 255, 0.2);
          color: #6478ff;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .test-link-btn:hover:not(:disabled) {
          background: rgba(100, 120, 255, 0.2);
          border-color: rgba(100, 120, 255, 0.3);
        }

        .test-link-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .url-input {
          padding-right: 100px;
        }

        .info-box {
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          color: #3b82f6;
        }

        .info-box h4 {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-box p {
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0;
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Property Links Management</h1>
        <p className="page-description">
          Manage shared folder and invoice portal links for properties
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
{/* 
    Hey this is the way you should be having the same thing we will be having the same in the same of the way 
    as its should be havig the real giving as alsong in the way it should be having as this as they can have te
    the long way as this require to view the accute as its with the way as they required the beloging in the same of the way
    as they it should be having as in the local area of as this is the way you should be having in the long sequence
    of the long way as they having it should be having the same thing in the local area of the wealth as its 
    the local valve in the local network of the secure timings of the view.

    hey so how theinks work these links are displayed int the customer portal for easy access if ta link is s
    empty it wont be shown to the customer links open  in a new tab when clicked hello this should be the way as you can have
    your urgency in the local area of the way as this is the way as they can have the local work in the area of the 
    network as this is the way you should be having the same thing in the local area network of the mid 

    Currently working on developing the customer module and resolveing some of the ongoing issues with clockin module, Developed the backend apis for the part 1 of the module, currently working on developing and designing the database for the part 2. For the clockin module current resolving some issues with the monthyview.



 */}
      <div className="info-box">
        <h4>How Links Work</h4>
        <p>
          These links are displayed in the customers portal for easy access.
          If a link is empty, it wont be shown to the customer.
          Links open in a new tab when clicked.
        </p>
      </div>

      <div className="card property-links-form">
        <form onSubmit={handleSubmit}>
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
            <div style={{ fontSize: '0.8rem', color: '#8892b0', marginTop: '0.25rem' }}>
              Enter the property ID to update links for
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="shared_folder_url">
              Shared Folder URL
            </label>
            <div className="url-input-group">
              <input
                type="url"
                id="shared_folder_url"
                name="shared_folder_url"
                className="form-input url-input"
                placeholder="https://drive.google.com/..."
                value={formData.shared_folder_url}
                onChange={handleInputChange}
                disabled={loading}
              />
              <button
                type="button"
                className="test-link-btn"
                onClick={() => testLink(formData.shared_folder_url)}
                disabled={!formData.shared_folder_url || loading}
              >
                Test Link
              </button>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#8892b0', marginTop: '0.25rem' }}>
              Google Drive, Dropbox, or any shared folder link
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="invoice_portal_url">
              Invoice Portal URL
            </label>
            <div className="url-input-group">
              <input
                type="url"
                id="invoice_portal_url"
                name="invoice_portal_url"
                className="form-input url-input"
                placeholder="https://billing.example.com/..."
                value={formData.invoice_portal_url}
                onChange={handleInputChange}
                disabled={loading}
              />
              <button
                type="button"
                className="test-link-btn"
                onClick={() => testLink(formData.invoice_portal_url)}
                disabled={!formData.invoice_portal_url || loading}
              >
                Test Link
              </button>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#8892b0', marginTop: '0.25rem' }}>
              Link to billing portal or invoice management system
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Property Links'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ color: '#ccd6f6', marginBottom: '1rem', fontSize: '1.1rem' }}>
          Link Management Rules
        </h3>
        <ul style={{ color: '#8892b0', lineHeight: '1.8' }}>
          <li>Empty URL values will hide the link from customer view</li>
          <li>Links must be valid URLs (starting with http:// or https://)</li>
          <li>Links open in a new browser tab for customer convenience</li>
          <li>You can update links at any time without affecting the property</li>
        </ul>
      </div>
    </div>
  );
}