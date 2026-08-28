"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function BroadcastLogs({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      };

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/send/broadcast/logs`,
        { params }
      );

      setLogs(res.data.data || []);
      setTotalPages(Math.ceil(res.data.total / res.data.limit));
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to load broadcast logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, statusFilter, searchTerm]);

  // Fetch log details
  const fetchLogDetails = async (id) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/send/broadcast/logs/${id}`
      );
      setSelectedLog(res.data.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Error fetching log details:", err);
      alert("Failed to load broadcast details.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-50 text-green-700 border-green-200";
      case "FAILED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Broadcast Logs</h1>
              <p className="mt-1 text-sm text-gray-600">
                View history of all sent broadcast messages
              </p>
            </div>
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Broadcast
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by subject..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attachments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm text-gray-500">Loading logs...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                          <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500">No broadcast logs found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">{formatDate(log.created_at)}</p>
                      </td> */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {log.subject}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded">
                          {log.recipients_count} recipients
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {log.attachments_count > 0 ? (
                            <span className="inline-flex items-center">
                              <svg className="h-4 w-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                              </svg>
                              {log.attachments_count}
                            </span>
                          ) : (
                            "—"
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium border rounded ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">{log.created_by}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => fetchLogDetails(log.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  page === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Broadcast Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Broadcast Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Broadcast Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Subject</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedLog.broadcast.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Message</p>
                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedLog.broadcast.message}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium border rounded mt-1 ${getStatusBadge(selectedLog.broadcast.status)}`}>
                        {selectedLog.broadcast.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created By</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedLog.broadcast.created_by}</p>
                    </div>
                  </div>
                  {/* <div>
                    <p className="text-xs text-gray-500">Sent At</p>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(selectedLog.broadcast.created_at)}</p>
                  </div> */}
                </div>
              </div>

              {/* Recipients */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Recipients ({selectedLog.recipients.length})
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {selectedLog.recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <svg className="h-4 w-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        {recipient.email}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {selectedLog.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Attachments ({selectedLog.attachments.length})
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {selectedLog.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded">
                        <div className="flex items-center min-w-0 flex-1">
                          <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                          </svg>
                          <span className="ml-2 text-sm text-gray-700 truncate">{attachment.filename}</span>
                        </div>
                        <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
                          {attachment.file_size ? `${(attachment.file_size / 1024).toFixed(1)} KB` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}