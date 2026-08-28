// import React from 'react';

// // Shared Styles
// export const sharedStyles = `
//   .admin-page {
//     max-width: 1400px;
//     animation: fadeIn 0.4s ease-out;
//   }

//   @keyframes fadeIn {
//     from {
//       opacity: 0;
//       transform: translateY(10px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }

//   .page-header {
//     margin-bottom: 2.5rem;
//   }

//   .page-title {
//     font-size: 2rem;
//     font-weight: 700;
//     color: #fff;
//     margin-bottom: 0.5rem;
//     letter-spacing: -0.03em;
//   }

//   .page-description {
//     color: #8892b0;
//     font-size: 0.95rem;
//   }

//   .card {
//     background: rgba(15, 20, 40, 0.6);
//     backdrop-filter: blur(20px);
//     border: 1px solid rgba(100, 120, 255, 0.15);
//     border-radius: 12px;
//     padding: 2rem;
//     margin-bottom: 1.5rem;
//     transition: all 0.3s ease;
//   }

//   .card:hover {
//     border-color: rgba(100, 120, 255, 0.25);
//     box-shadow: 0 8px 32px rgba(100, 120, 255, 0.1);
//   }

//   .form-group {
//     margin-bottom: 1.5rem;
//   }

//   .form-label {
//     display: block;
//     color: #ccd6f6;
//     font-size: 0.875rem;
//     font-weight: 600;
//     margin-bottom: 0.5rem;
//     text-transform: uppercase;
//     letter-spacing: 0.05em;
//   }

//   .form-input,
//   .form-select {
//     width: 100%;
//     padding: 0.875rem 1rem;
//     background: rgba(10, 14, 39, 0.6);
//     border: 1px solid rgba(100, 120, 255, 0.2);
//     border-radius: 8px;
//     color: #fff;
//     font-size: 0.95rem;
//     font-family: inherit;
//     transition: all 0.2s;
//   }

//   .form-input:focus,
//   .form-select:focus {
//     outline: none;
//     border-color: #6478ff;
//     box-shadow: 0 0 0 3px rgba(100, 120, 255, 0.1);
//   }

//   .form-input::placeholder {
//     color: #8892b0;
//   }

//   .btn {
//     padding: 0.875rem 1.75rem;
//     border-radius: 8px;
//     font-weight: 600;
//     font-size: 0.95rem;
//     cursor: pointer;
//     transition: all 0.2s;
//     border: none;
//     font-family: inherit;
//     text-transform: uppercase;
//     letter-spacing: 0.05em;
//   }

//   .btn-primary {
//     background: linear-gradient(135deg, #6478ff 0%, #4f63ff 100%);
//     color: #fff;
//     box-shadow: 0 4px 16px rgba(100, 120, 255, 0.3);
//   }

//   .btn-primary:hover:not(:disabled) {
//     transform: translateY(-2px);
//     box-shadow: 0 6px 24px rgba(100, 120, 255, 0.4);
//   }

//   .btn-primary:disabled {
//     opacity: 0.5;
//     cursor: not-allowed;
//   }

//   .btn-secondary {
//     background: rgba(100, 120, 255, 0.1);
//     color: #6478ff;
//     border: 1px solid rgba(100, 120, 255, 0.3);
//   }

//   .btn-secondary:hover:not(:disabled) {
//     background: rgba(100, 120, 255, 0.2);
//     border-color: rgba(100, 120, 255, 0.4);
//   }

//   .btn-success {
//     background: linear-gradient(135deg, #10b981 0%, #059669 100%);
//     color: #fff;
//   }

//   .btn-success:hover:not(:disabled) {
//     transform: translateY(-2px);
//     box-shadow: 0 6px 24px rgba(16, 185, 129, 0.4);
//   }

//   .table-container {
//     overflow-x: auto;
//     border-radius: 12px;
//     border: 1px solid rgba(100, 120, 255, 0.15);
//   }

//   .data-table {
//     width: 100%;
//     border-collapse: collapse;
//     font-size: 0.9rem;
//   }

//   .data-table thead {
//     background: rgba(100, 120, 255, 0.05);
//   }

//   .data-table th {
//     padding: 1rem;
//     text-align: left;
//     color: #8892b0;
//     font-weight: 600;
//     text-transform: uppercase;
//     font-size: 0.75rem;
//     letter-spacing: 0.05em;
//     border-bottom: 1px solid rgba(100, 120, 255, 0.15);
//   }

//   .data-table td {
//     padding: 1rem;
//     color: #ccd6f6;
//     border-bottom: 1px solid rgba(100, 120, 255, 0.08);
//   }

//   .data-table tbody tr {
//     transition: background 0.2s;
//   }

//   .data-table tbody tr:hover {
//     background: rgba(100, 120, 255, 0.03);
//   }

//   .badge {
//     display: inline-block;
//     padding: 0.375rem 0.75rem;
//     border-radius: 6px;
//     font-size: 0.75rem;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.05em;
//   }

//   .badge-pending {
//     background: rgba(251, 191, 36, 0.15);
//     color: #fbbf24;
//     border: 1px solid rgba(251, 191, 36, 0.3);
//   }

//   .badge-approved {
//     background: rgba(16, 185, 129, 0.15);
//     color: #10b981;
//     border: 1px solid rgba(16, 185, 129, 0.3);
//   }

//   .badge-active {
//     background: rgba(59, 130, 246, 0.15);
//     color: #3b82f6;
//     border: 1px solid rgba(59, 130, 246, 0.3);
//   }

//   .loading-spinner {
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     padding: 3rem;
//     color: #6478ff;
//   }

//   .spinner {
//     width: 40px;
//     height: 40px;
//     border: 3px solid rgba(100, 120, 255, 0.2);
//     border-top-color: #6478ff;
//     border-radius: 50%;
//     animation: spin 0.8s linear infinite;
//   }

//   @keyframes spin {
//     to { transform: rotate(360deg); }
//   }

//   .alert {
//     padding: 1rem 1.25rem;
//     border-radius: 8px;
//     margin-bottom: 1.5rem;
//     font-size: 0.9rem;
//     animation: slideDown 0.3s ease-out;
//   }

//   @keyframes slideDown {
//     from {
//       opacity: 0;
//       transform: translateY(-10px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }

//   .alert-success {
//     background: rgba(16, 185, 129, 0.15);
//     color: #10b981;
//     border: 1px solid rgba(16, 185, 129, 0.3);
//   }

//   .alert-error {
//     background: rgba(239, 68, 68, 0.15);
//     color: #ef4444;
//     border: 1px solid rgba(239, 68, 68, 0.3);
//   }

//   .grid-2 {
//     display: grid;
//     grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//     gap: 1.5rem;
//   }

//   .empty-state {
//     text-align: center;
//     padding: 4rem 2rem;
//     color: #8892b0;
//   }

//   .empty-state-icon {
//     font-size: 3rem;
//     margin-bottom: 1rem;
//     opacity: 0.3;
//   }
// `;

// // Loading Spinner Component
// export const LoadingSpinner = () => (
//   <div className="loading-spinner">
//     <div className="spinner"></div>
//   </div>
// );

// // Alert Component
// export const Alert = ({ type, message, onClose }) => (
//   <div className={`alert alert-${type}`}>
//     {message}
//     {onClose && (
//       <button
//         onClick={onClose}
//         style={{
//           float: 'right',
//           background: 'none',
//           border: 'none',
//           color: 'inherit',
//           cursor: 'pointer',
//           fontSize: '1.25rem',
//           lineHeight: 1,
//         }}
//       >
//         ×
//       </button>
//     )}
//   </div>
// );

// // Empty State Component
// export const EmptyState = ({ icon = '◯', message }) => (
//   <div className="empty-state">
//     <div className="empty-state-icon">{icon}</div>
//     <p>{message}</p>
//   </div>
// );


// import React from 'react';

// // Shared Styles
// export const sharedStyles = `
//   .page-container {
//     animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
//   }

//   @keyframes fadeInUp {
//     from {
//       opacity: 0;
//       transform: translateY(20px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }

//   .page-header {
//     margin-bottom: 2rem;
//   }

//   .page-title {
//     font-family: 'Outfit', sans-serif;
//     font-size: 2rem;
//     font-weight: 700;
//     color: var(--gray-900);
//     margin-bottom: 0.5rem;
//     letter-spacing: -0.03em;
//   }

//   .page-description {
//     color: var(--gray-600);
//     font-size: 1rem;
//     line-height: 1.6;
//   }

//   .card {
//     background: white;
//     border-radius: 16px;
//     padding: 2rem;
//     margin-bottom: 1.5rem;
//     box-shadow: var(--shadow);
//     border: 1px solid var(--gray-200);
//     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//   }

//   .card:hover {
//     box-shadow: var(--shadow-lg);
//     transform: translateY(-2px);
//   }

//   .card-header {
//     font-size: 1.125rem;
//     font-weight: 700;
//     color: var(--gray-900);
//     margin-bottom: 1.5rem;
//     padding-bottom: 1rem;
//     border-bottom: 2px solid var(--gray-100);
//   }

//   .form-group {
//     margin-bottom: 1.5rem;
//   }

//   .form-label {
//     display: block;
//     color: var(--gray-700);
//     font-size: 0.875rem;
//     font-weight: 600;
//     margin-bottom: 0.5rem;
//   }

//   .form-label-required::after {
//     content: ' *';
//     color: var(--blue-600);
//   }

//   .form-input,
//   .form-select,
//   .form-textarea {
//     width: 100%;
//     padding: 0.875rem 1rem;
//     background: var(--gray-50);
//     border: 2px solid var(--gray-200);
//     border-radius: 12px;
//     color: var(--gray-900);
//     font-size: 0.9375rem;
//     font-family: inherit;
//     transition: all 0.2s ease;
//   }

//   .form-input:focus,
//   .form-select:focus,
//   .form-textarea:focus {
//     outline: none;
//     background: white;
//     border-color: var(--blue-500);
//     box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
//   }

//   .form-input::placeholder,
//   .form-textarea::placeholder {
//     color: var(--gray-400);
//   }

//   .form-textarea {
//     min-height: 100px;
//     resize: vertical;
//   }

//   .form-hint {
//     font-size: 0.8125rem;
//     color: var(--gray-500);
//     margin-top: 0.375rem;
//   }

//   .form-row {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 1.5rem;
//   }

//   .form-row-3 {
//     display: grid;
//     grid-template-columns: repeat(3, 1fr);
//     gap: 1.5rem;
//   }

//   @media (max-width: 768px) {
//     .form-row,
//     .form-row-3 {
//       grid-template-columns: 1fr;
//     }
//   }

//   .btn {
//     display: inline-flex;
//     align-items: center;
//     justify-content: center;
//     gap: 0.5rem;
//     padding: 0.875rem 2rem;
//     border-radius: 12px;
//     font-weight: 600;
//     font-size: 0.9375rem;
//     cursor: pointer;
//     transition: all 0.2s ease;
//     border: none;
//     font-family: inherit;
//   }

//   .btn-primary {
//     background: linear-gradient(135deg, var(--blue-600) 0%, var(--blue-700) 100%);
//     color: white;
//     box-shadow: var(--shadow-md);
//   }

//   .btn-primary:hover:not(:disabled) {
//     transform: translateY(-2px);
//     box-shadow: var(--shadow-lg);
//   }

//   .btn-primary:active:not(:disabled) {
//     transform: translateY(0);
//   }

//   .btn-primary:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }

//   .btn-secondary {
//     background: white;
//     color: var(--blue-700);
//     border: 2px solid var(--blue-200);
//     box-shadow: var(--shadow-sm);
//   }

//   .btn-secondary:hover:not(:disabled) {
//     background: var(--blue-50);
//     border-color: var(--blue-300);
//   }

//   .btn-success {
//     background: linear-gradient(135deg, #10b981 0%, #059669 100%);
//     color: white;
//     box-shadow: var(--shadow-md);
//   }

//   .btn-success:hover:not(:disabled) {
//     transform: translateY(-2px);
//     box-shadow: var(--shadow-lg);
//   }

//   .btn-group {
//     display: flex;
//     gap: 0.75rem;
//     flex-wrap: wrap;
//   }

//   .table-container {
//     overflow-x: auto;
//     border-radius: 12px;
//     border: 1px solid var(--gray-200);
//     background: white;
//   }

//   .data-table {
//     width: 100%;
//     border-collapse: collapse;
//   }

//   .data-table thead {
//     background: var(--gray-50);
//   }

//   .data-table th {
//     padding: 1rem 1.25rem;
//     text-align: left;
//     color: var(--gray-700);
//     font-weight: 700;
//     font-size: 0.8125rem;
//     text-transform: uppercase;
//     letter-spacing: 0.05em;
//     border-bottom: 2px solid var(--gray-200);
//   }

//   .data-table td {
//     padding: 1.25rem;
//     color: var(--gray-700);
//     border-bottom: 1px solid var(--gray-100);
//     font-size: 0.9375rem;
//   }

//   .data-table tbody tr {
//     transition: background 0.2s ease;
//   }

//   .data-table tbody tr:hover {
//     background: var(--gray-50);
//   }

//   .badge {
//     display: inline-flex;
//     align-items: center;
//     padding: 0.375rem 0.875rem;
//     border-radius: 8px;
//     font-size: 0.8125rem;
//     font-weight: 600;
//     letter-spacing: 0.01em;
//   }

//   .badge-pending {
//     background: #fef3c7;
//     color: #92400e;
//     border: 1px solid #fde68a;
//   }

//   .badge-approved {
//     background: #d1fae5;
//     color: #065f46;
//     border: 1px solid #a7f3d0;
//   }

//   .badge-active {
//     background: #dbeafe;
//     color: #1e40af;
//     border: 1px solid #bfdbfe;
//   }

//   .loading-container {
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     padding: 4rem 2rem;
//   }

//   .spinner {
//     width: 48px;
//     height: 48px;
//     border: 4px solid var(--blue-100);
//     border-top-color: var(--blue-600);
//     border-radius: 50%;
//     animation: spin 0.8s linear infinite;
//   }

//   @keyframes spin {
//     to { transform: rotate(360deg); }
//   }

//   .alert {
//     padding: 1rem 1.5rem;
//     border-radius: 12px;
//     margin-bottom: 1.5rem;
//     display: flex;
//     align-items: center;
//     gap: 0.75rem;
//     font-size: 0.9375rem;
//     animation: slideDown 0.3s ease-out;
//   }

//   @keyframes slideDown {
//     from {
//       opacity: 0;
//       transform: translateY(-10px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }

//   .alert-success {
//     background: #d1fae5;
//     color: #065f46;
//     border: 1px solid #a7f3d0;
//   }

//   .alert-error {
//     background: #fee2e2;
//     color: #991b1b;
//     border: 1px solid #fecaca;
//   }

//   .alert-close {
//     margin-left: auto;
//     background: none;
//     border: none;
//     color: inherit;
//     cursor: pointer;
//     font-size: 1.5rem;
//     line-height: 1;
//     opacity: 0.6;
//     transition: opacity 0.2s;
//   }

//   .alert-close:hover {
//     opacity: 1;
//   }

//   .empty-state {
//     text-align: center;
//     padding: 4rem 2rem;
//     color: var(--gray-500);
//   }

//   .empty-state-icon {
//     font-size: 4rem;
//     margin-bottom: 1rem;
//     opacity: 0.3;
//   }

//   .empty-state-text {
//     font-size: 1rem;
//     color: var(--gray-600);
//   }

//   .stats-grid {
//     display: grid;
//     grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//     gap: 1.5rem;
//     margin-bottom: 2rem;
//   }

//   .stat-card {
//     background: white;
//     border-radius: 16px;
//     padding: 1.75rem;
//     box-shadow: var(--shadow);
//     border: 1px solid var(--gray-200);
//     position: relative;
//     overflow: hidden;
//     transition: all 0.3s ease;
//   }

//   .stat-card::before {
//     content: '';
//     position: absolute;
//     top: 0;
//     left: 0;
//     right: 0;
//     height: 4px;
//     background: linear-gradient(90deg, var(--blue-600), var(--blue-400));
//   }

//   .stat-card:hover {
//     transform: translateY(-4px);
//     box-shadow: var(--shadow-xl);
//   }

//   .stat-label {
//     font-size: 0.875rem;
//     color: var(--gray-600);
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.05em;
//     margin-bottom: 0.5rem;
//   }

//   .stat-value {
//     font-family: 'Outfit', sans-serif;
//     font-size: 2.5rem;
//     font-weight: 700;
//     color: var(--gray-900);
//     letter-spacing: -0.02em;
//   }
// `;

// // Loading Spinner Component
// export const LoadingSpinner = () => (
//   <div className="loading-container">
//     <div className="spinner"></div>
//   </div>
// );

// // Alert Component
// export const Alert = ({ type, message, onClose }) => (
//   <div className={`alert alert-${type}`}>
//     <span>{type === 'success' ? '✓' : '⚠'}</span>
//     <span>{message}</span>
//     {onClose && (
//       <button className="alert-close" onClick={onClose}>
//         ×
//       </button>
//     )}
//   </div>
// );

// // Empty State Component
// export const EmptyState = ({ icon = '○', message }) => (
//   <div className="empty-state">
//     <div className="empty-state-icon">{icon}</div>
//     <div className="empty-state-text">{message}</div>
//   </div>
// );



import React from 'react';

export const sharedStyles = `
  .page {
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .page-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.5rem;
  }

  .page-subtitle {
    font-size: 0.9375rem;
    color: #64748b;
    line-height: 1.5;
  }

  .card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .card-title {
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #334155;
    margin-bottom: 0.5rem;
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 0.625rem 0.875rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9375rem;
    color: #0f172a;
    transition: all 0.15s ease;
  }

  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .form-input::placeholder,
  .form-textarea::placeholder {
    color: #94a3b8;
  }

  .form-textarea {
    min-height: 90px;
    resize: vertical;
    font-family: inherit;
  }

  .form-hint {
    font-size: 0.8125rem;
    color: #64748b;
    margin-top: 0.375rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  .form-row-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  @media (max-width: 768px) {
    .form-row,
    .form-row-3 {
      grid-template-columns: 1fr;
    }
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    border: none;
    font-family: inherit;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
  }

  .btn-secondary:hover:not(:disabled) {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  .btn-success {
    background: #10b981;
    color: white;
  }

  .btn-success:hover:not(:disabled) {
    background: #059669;
  }

  .table-wrapper {
    overflow-x: auto;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table thead {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .table th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .table td {
    padding: 1rem;
    font-size: 0.9375rem;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
  }

  .table tbody tr:last-child td {
    border-bottom: none;
  }

  .table tbody tr:hover {
    background: #f8fafc;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.625rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .badge-pending {
    background: #fef3c7;
    color: #92400e;
  }

  .badge-approved {
    background: #d1fae5;
    color: #065f46;
  }

  .badge-active {
    background: #dbeafe;
    color: #1e40af;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e2e8f0;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .alert {
    padding: 0.875rem 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-size: 0.9375rem;
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .alert-success {
    background: #d1fae5;
    color: #065f46;
  }

  .alert-error {
    background: #fee2e2;
    color: #991b1b;
  }

  .alert-close {
    margin-left: auto;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.25rem;
    opacity: 0.7;
  }

  .alert-close:hover {
    opacity: 1;
  }

  .empty {
    text-align: center;
    padding: 3rem 1.5rem;
    color: #94a3b8;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 0.75rem;
    opacity: 0.3;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .stat-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 2.25rem;
    font-weight: 700;
    color: #0f172a;
  }

  .stat-blue {
    color: #2563eb;
  }

  .stat-green {
    color: #10b981;
  }

  .stat-amber {
    color: #f59e0b;
  }
`;

export const LoadingSpinner = () => (
  <div className="loading">
    <div className="spinner"></div>
  </div>
);

export const Alert = ({ type, message, onClose }) => (
  <div className={`alert alert-${type}`}>
    <span>{type === 'success' ? '✓' : '⚠'}</span>
    <span>{message}</span>
    {onClose && (
      <button className="alert-close" onClick={onClose}>×</button>
    )}
  </div>
);

export const EmptyState = ({ icon = '○', message }) => (
  <div className="empty">
    <div className="empty-icon">{icon}</div>
    <div>{message}</div>
  </div>
);