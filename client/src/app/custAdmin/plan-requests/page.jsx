'use client';

import { useState, useEffect } from 'react';
import { sharedStyles, LoadingSpinner, Alert, EmptyState } from '../../../lib/custadd/components';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export default function PlanChangeRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE}/cust/admin/plan-change-requests?status=PENDING`);
      const data = await response.json();

      if (response.ok) {
        setRequests(Array.isArray(data) ? data : []);
      } else {
        setAlert({ type: 'error', message: 'Failed to load plan change requests' });
        setRequests([]);
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this plan change request?')) {
      return;
    }

    setProcessingId(requestId);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE}/cust/admin/plan-change-requests/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          approved_by: 'ADMIN-001', // TODO: Replace with auth context
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlert({ type: 'success', message: 'Plan change request approved successfully!' });
        // Remove the approved request from the list
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to approve request' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="admin-page">
      <style jsx>{sharedStyles}</style>
      <style jsx>{`
        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }

        .refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: rgba(100, 120, 255, 0.08);
          border: 1px solid rgba(100, 120, 255, 0.2);
          border-radius: 8px;
          color: #6478ff;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.2s;
          margin-bottom: 1.5rem;
        }

        .refresh-btn:hover {
          background: rgba(100, 120, 255, 0.15);
          border-color: rgba(100, 120, 255, 0.3);
        }

        .request-count {
          display: inline-block;
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-left: 0.75rem;
        }

        .plan-details {
          font-size: 0.85rem;
          color: #8892b0;
          margin-top: 0.25rem;
        }

        .price-highlight {
          color: #10b981;
          font-weight: 600;
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">
          Plan Change Requests
          {!loading && requests.length > 0 && (
            <span className="request-count">{requests.length} Pending</span>
          )}
        </h1>
        <p className="page-description">
          Review and approve customer-requested plan changes
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <button
        className="refresh-btn"
        onClick={fetchRequests}
        disabled={loading}
      >
        <span>{loading ? '↻' : '⟳'}</span>
        Refresh List
      </button>

      {loading ? (
        <div className="card">
          <LoadingSpinner />
        </div>
      ) : requests.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="✓"
            message="No pending plan change requests"
          />
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Customer ID</th>
                  <th>Property ID</th>
                  <th>Current Plan</th>
                  <th>Requested Plan</th>
                  <th>Requested Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>#{request.id}</strong>
                    </td>
                    <td>{request.customer_id}</td>
                    <td>{request.property_id}</td>
                    <td>
                      <div>Plan ID: {request.current_plan_id}</div>
                    </td>
                    <td>
                      <div>
                        <strong>{request.requested_plan_name}</strong>
                      </div>
                      <div className="plan-details">
                        {request.requested_shift_hours} hrs •{' '}
                        <span className="price-highlight">
                          {formatCurrency(request.requested_monthly_price)}/mo
                        </span>
                      </div>
                    </td>
                    <td>{formatDate(request.requested_at)}</td>
                    <td>
                      <span className="badge badge-pending">{request.status}</span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn btn-success"
                          onClick={() => handleApprove(request.id)}
                          disabled={processingId !== null}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          {processingId === request.id ? 'Approving...' : 'Approve'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ color: '#ccd6f6', marginBottom: '1rem', fontSize: '1.1rem' }}>
          Approval Workflow
        </h3>
        <ul style={{ color: '#8892b0', lineHeight: '1.8' }}>
          <li>Customers cannot directly modify their service plans</li>
          <li>All plan changes must be requested and approved by an admin</li>
          <li>Upon approval, the new plan becomes ACTIVE and the old plan is marked EXPIRED</li>
          <li>Approved requests are automatically removed from the pending queue</li>
          <li>The customer is notified when their request is approved</li>
        </ul>
      </div>
    </div>
  );
}