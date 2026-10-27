'use client';

import { useState, useEffect } from 'react';
import { sharedStyles, LoadingSpinner } from '../admin-components';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL + '/cust' || '';

export default function DashboardSection({ user }) {
  const [stats, setStats] = useState({
    total_properties: '—',
    active_plans: '—',
    pending_requests: '—',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/dashboard/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats({
          total_properties: data.total_properties || '—',
          active_plans: data.active_plans || '—',
          pending_requests: data.pending_requests || '—',
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <style jsx>{sharedStyles}</style>
      <style jsx>{`
        .welcome-banner {
          background: #2563eb;
          border-radius: 10px;
          padding: 1.5rem 1.75rem;
          margin-bottom: 1.5rem;
          color: white;
        }

        .welcome-banner h2 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .welcome-banner p {
          font-size: 13px;
          opacity: 0.85;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 640px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
        }

        .info-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.25rem;
        }

        .info-card h3 {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .info-card h3 .dot {
          width: 6px;
          height: 6px;
          background: #2563eb;
          border-radius: 50%;
        }

        .info-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .info-list li {
          padding: 0.5rem 0;
          color: #6b7280;
          font-size: 13px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .info-list li:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .info-list li::before {
          content: '';
          width: 4px;
          height: 4px;
          background: #d1d5db;
          border-radius: 50%;
          flex-shrink: 0;
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Monitor properties and service plans at a glance</p>
      </div>

      {user && (
        <div className="welcome-banner">
          <h2>Welcome back, {user.fname}</h2>
          <p>Manage your properties, service plans, and customer requests from here.</p>
        </div>
      )}

      {loading ? (
        <div className="card">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="stats">
          <div className="stat-card">
            <div className="stat-label">Total Properties</div>
            <div className="stat-value stat-blue">{stats.total_properties}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Plans</div>
            <div className="stat-value stat-green">{stats.active_plans}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Requests</div>
            <div className="stat-value stat-amber">{stats.pending_requests}</div>
          </div>
        </div>
      )}

      <div className="info-grid">
        <div className="info-card">
          <h3><span className="dot"></span> Features</h3>
          <ul className="info-list">
            <li>Create and manage properties</li>
            <li>Assign service plans</li>
            <li>Update property links</li>
            <li>Approve plan changes</li>
          </ul>
        </div>

        <div className="info-card">
          <h3><span className="dot"></span> System Rules</h3>
          <ul className="info-list">
            <li>Each property has one customer</li>
            <li>Property IDs are unique</li>
            <li>Plans assigned to properties</li>
            <li>Changes need approval</li>
          </ul>
        </div>
      </div>
    </div>
  );
}