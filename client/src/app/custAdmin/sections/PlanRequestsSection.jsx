'use client';

import { useState, useEffect } from 'react';
import { sharedStyles, LoadingSpinner, Alert, EmptyState } from '../admin-components';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL + '/cust' || '';

export default function PlanRequestsSection({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editableData, setEditableData] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE}/admin/plan-change-requests?status=PENDING`, {
        credentials: 'include'
      });
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load requests' });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const openApprovalModal = (request) => {
    setSelectedRequest(request);
    setEditableData({
      requested_plan_name: request.requested_plan_name,
      requested_service_type: request.requested_service_type,
      requested_shift_hours: request.requested_shift_hours,
      requested_monthly_price: request.requested_monthly_price,
    });
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setEditableData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmApproval = async () => {
    if (!selectedRequest) return;

    setProcessingId(selectedRequest.id);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE}/admin/plan-change-requests/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          request_id: selectedRequest.id,
          approved_by: user?.unique_id || 'ADMIN-001',
          ...editableData
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlert({ type: 'success', message: 'Request approved successfully' });
        setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
        setShowModal(false);
        setSelectedRequest(null);
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to approve' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (str) => {
    return new Date(str).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatPrice = (amt) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amt);
  };

  return (
    <div className="page">
      <style jsx>{sharedStyles}</style>
      <style jsx>{`
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .count-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          background: #fef3c7;
          color: #92400e;
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
        }

        .count-badge .dot {
          width: 6px;
          height: 6px;
          background: #d97706;
          border-radius: 50%;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal {
          background: white;
          border-radius: 10px;
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }

        .modal-close {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.15s;
        }

        .modal-close:hover {
          color: #374151;
          background: #f3f4f6;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .info-grid {
          background: #f9fafb;
          border: 1px solid #f3f4f6;
          border-radius: 6px;
          padding: 0.875rem;
          margin-bottom: 1.25rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.375rem 0;
        }

        .info-row + .info-row {
          border-top: 1px solid #e5e7eb;
        }

        .info-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .info-value {
          font-size: 13px;
          color: #111827;
          font-weight: 600;
        }

        .section-label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .remarks-box {
          padding: 0.75rem;
          background: #f9fafb;
          border: 1px solid #f3f4f6;
          border-radius: 6px;
          font-size: 13px;
          color: #374151;
          line-height: 1.5;
        }

        .modal-footer {
          display: flex;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .modal-footer button {
          flex: 1;
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Plan Change Requests</h1>
        <p className="page-description">Review and approve customer plan changes</p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="toolbar">
        <div>
          {!loading && requests.length > 0 && (
            <div className="count-badge">
              <span className="dot"></span>
              {requests.length} Pending
            </div>
          )}
        </div>
        <button className="btn btn-secondary" onClick={fetchRequests} disabled={loading}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card"><LoadingSpinner /></div>
      ) : requests.length === 0 ? (
        <div className="card"><EmptyState icon="✓" message="No pending requests" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Property</th>
                <th>Current Plan</th>
                <th>Requested Plan</th>
                <th>Price</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td><strong>#{req.id}</strong></td>
                  <td>{req.customer_id}</td>
                  <td>{req.property_id}</td>
                  <td>Plan #{req.current_plan_id}</td>
                  <td><strong>{req.requested_plan_name}</strong></td>
                  <td>{formatPrice(req.requested_monthly_price)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(req.requested_at)}</td>
                  <td><span className="badge badge-pending">{req.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => openApprovalModal(req)}
                      disabled={processingId !== null}
                      style={{ padding: '0.3rem 0.75rem', fontSize: '12px' }}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approval Modal */}
      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Review Request #{selectedRequest.id}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {/* Request Info */}
              <div className="section-label">Request Details</div>
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">Customer ID</span>
                  <span className="info-value">{selectedRequest.customer_id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Property ID</span>
                  <span className="info-value">{selectedRequest.property_id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Current Plan</span>
                  <span className="info-value">#{selectedRequest.current_plan_id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Requested At</span>
                  <span className="info-value">{formatDate(selectedRequest.requested_at)}</span>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="section-label" style={{ marginTop: '1.25rem' }}>Plan Details (Editable)</div>

              <div className="form-group">
                <label className="form-label" htmlFor="requested_plan_name">Plan Name</label>
                <input
                  type="text"
                  id="requested_plan_name"
                  name="requested_plan_name"
                  className="form-input"
                  value={editableData.requested_plan_name}
                  onChange={handleModalChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="requested_service_type">Service Type</label>
                  <select
                    id="requested_service_type"
                    name="requested_service_type"
                    className="form-select"
                    value={editableData.requested_service_type}
                    onChange={handleModalChange}
                  >
                    <option value="DEDICATED">DEDICATED</option>
                    <option value="SHARED">SHARED</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="requested_shift_hours">Shift Hours</label>
                  <input
                    type="number"
                    id="requested_shift_hours"
                    name="requested_shift_hours"
                    className="form-input"
                    value={editableData.requested_shift_hours}
                    onChange={handleModalChange}
                    min="1"
                    max="24"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="requested_monthly_price">Monthly Price ($)</label>
                <input
                  type="number"
                  id="requested_monthly_price"
                  name="requested_monthly_price"
                  className="form-input"
                  value={editableData.requested_monthly_price}
                  onChange={handleModalChange}
                  min="0"
                  step="0.01"
                />
              </div>

              {selectedRequest.remarks && (
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <div className="section-label">Customer Remarks</div>
                  <div className="remarks-box">{selectedRequest.remarks}</div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
                disabled={processingId !== null}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleConfirmApproval}
                disabled={processingId !== null}
              >
                {processingId === selectedRequest.id ? 'Approving...' : 'Confirm & Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}