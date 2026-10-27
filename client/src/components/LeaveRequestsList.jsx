



"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import LeaveRequestDetails from "./LeaveRequestDetails";
import * as XLSX from "xlsx";

export default function LeaveRequestsList() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const itemsPerPage = 30;

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leave-requests`);
        if (response.data.success) {
          setLeaveRequests(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch leave requests.");
        }
      } catch (error) {
        console.error("Error fetching leave requests:", error);
        setError("An error occurred while fetching leave requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, []);

  const formatDateAndTime = (dateString) => {
    if (!dateString) return { formattedDate: "", formattedTime: "" };
    const date = new Date(dateString);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);
    const formattedDate = istDate.toISOString().split("T")[0];
    const hours = istDate.getHours();
    const minutes = String(istDate.getMinutes()).padStart(2, "0");
    const seconds = String(istDate.getSeconds()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = String(hours % 12 || 12).padStart(2, "0");
    const formattedTime = `${formattedHours}:${minutes}:${seconds} ${period}`;
    return { formattedDate, formattedTime };
  };

  const isLeaveInDateRange = (request) => {
    if (!startDateFilter && !endDateFilter) return true;

    const leaveStart = new Date(formatDateAndTime(request.start_date).formattedDate);
    const leaveEnd = new Date(formatDateAndTime(request.end_date).formattedDate);
    leaveStart.setHours(0, 0, 0, 0);
    leaveEnd.setHours(0, 0, 0, 0);

    if (startDateFilter && endDateFilter) {
      const filterStart = new Date(startDateFilter);
      const filterEnd = new Date(endDateFilter);
      filterStart.setHours(0, 0, 0, 0);
      filterEnd.setHours(0, 0, 0, 0);
      return leaveStart <= filterEnd && leaveEnd >= filterStart;
    }

    if (startDateFilter && !endDateFilter) {
      const filterStart = new Date(startDateFilter);
      filterStart.setHours(0, 0, 0, 0);
      return leaveEnd >= filterStart;
    }

    if (!startDateFilter && endDateFilter) {
      const filterEnd = new Date(endDateFilter);
      filterEnd.setHours(0, 0, 0, 0);
      return leaveStart <= filterEnd;
    }

    return true;
  };

  const filteredLeaveRequests = leaveRequests.filter((request) => {
    const matchesSearch =
      String(request.unique_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leave_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDateAndTime(request.start_date).formattedDate.includes(searchTerm) ||
      formatDateAndTime(request.end_date).formattedDate.includes(searchTerm);

    return matchesSearch && isLeaveInDateRange(request);
  });

  const paginatedLeaveRequests = filteredLeaveRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delete-leave-request/${id}`
      );
      if (response.data.success) {
        setLeaveRequests((prev) => prev.filter((req) => req.id !== id));
      } else {
        alert(response.data.message || "Failed to delete leave request.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting the leave request.");
    } finally {
      setRequestToDelete(null);
    }
  };

  const resetDateFilters = () => {
    setStartDateFilter("");
    setEndDateFilter("");
    setCurrentPage(1);
  };

  const handleApplyFilter = () => {
    if (startDateFilter && endDateFilter && new Date(startDateFilter) > new Date(endDateFilter)) {
      alert("Start date cannot be later than end date.");
      return;
    }
    setCurrentPage(1);
    setShowDateFilter(false);
  };

  // Excel download function - downloads ALL filtered results (not just current page)
  const handleDownloadExcel = () => {
    if (filteredLeaveRequests.length === 0) {
      alert("No data to export.");
      return;
    }

    // Build rows for Excel
    const excelData = filteredLeaveRequests.map((request) => {
      const { formattedDate, formattedTime } = formatDateAndTime(request.created_at);
      return {
        "Unique ID": request.unique_id,
        "Employee Name": `${request.first_name} ${request.last_name}`,
        "Request Date": formattedDate,
        // "Request Time": formattedTime,
        "Leave Type": request.leave_type,
        "Leave Start Date": formatDateAndTime(request.start_date).formattedDate,
        "Leave End Date": formatDateAndTime(request.end_date).formattedDate,
        "Number of Days": request.number_of_days,
        "Reason": request.reason,
        "Status": request.status.charAt(0).toUpperCase() + request.status.slice(1),
      };
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    // Set column widths for better readability
    worksheet["!cols"] = [
      { wch: 14 }, // Unique ID
      { wch: 22 }, // Employee Name
      { wch: 14 }, // Request Date
      // { wch: 14 }, // Request Time
      { wch: 18 }, // Leave Type
      { wch: 16 }, // Leave Start Date
      { wch: 16 }, // Leave End Date
      { wch: 16 }, // Number of Days
      { wch: 40 }, // Reason
      { wch: 12 }, // Status
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Requests");

    // Build filename with filter info
    let filename = "leave_requests";
    if (startDateFilter && endDateFilter) {
      filename += `_${startDateFilter}_to_${endDateFilter}`;
    } else if (startDateFilter) {
      filename += `_from_${startDateFilter}`;
    } else if (endDateFilter) {
      filename += `_until_${endDateFilter}`;
    }
    filename += ".xlsx";

    XLSX.writeFile(workbook, filename);
  };

  const isFilterActive = startDateFilter || endDateFilter;
  const totalPages = Math.ceil(filteredLeaveRequests.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-gray-600 font-medium">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 sm:pb-0">

      {/* Search, Filter and Download Bar */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by ID, leave type, status, reason, or date..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          {/* Right side buttons */}
          <div className="flex gap-2">
            {/* Date Filter Toggle Button */}
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-md border transition-colors whitespace-nowrap ${
                isFilterActive
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {isFilterActive ? "Filter Active" : "Filter by Dates"}
              {isFilterActive && (
                <span className="ml-2 bg-white text-blue-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {startDateFilter && endDateFilter ? "2" : "1"}
                </span>
              )}
            </button>

            {/* Download Excel Button */}
            <button
              onClick={handleDownloadExcel}
              disabled={filteredLeaveRequests.length === 0}
              className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-md border transition-colors whitespace-nowrap ${
                filteredLeaveRequests.length === 0
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-green-700 border-green-300 hover:bg-green-50 hover:border-green-400"
              }`}
              title={
                filteredLeaveRequests.length === 0
                  ? "No data to export"
                  : `Download ${filteredLeaveRequests.length} records as Excel`
              }
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Excel
              {filteredLeaveRequests.length > 0 && (
                <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {filteredLeaveRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {isFilterActive && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Active filters:</span>
            {startDateFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium rounded-full">
                From: {startDateFilter}
                <button
                  onClick={() => setStartDateFilter("")}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {endDateFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium rounded-full">
                To: {endDateFilter}
                <button
                  onClick={() => setEndDateFilter("")}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            <button
              onClick={resetDateFilters}
              className="text-xs text-red-600 hover:text-red-700 font-medium underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Date Filter Panel */}
        {showDateFilter && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Filter by Leave Request Dates</h3>
              <p className="text-xs text-gray-500 mt-1">
                Shows all requests where the employee leave falls within or overlaps the selected date range.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDateFilter}
                  min={startDateFilter || undefined}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {filteredLeaveRequests.length} request{filteredLeaveRequests.length !== 1 ? "s" : ""} match
              </p>
              <div className="flex gap-2">
                <button
                  onClick={resetDateFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleApplyFilter}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium text-gray-900">{paginatedLeaveRequests.length}</span> of{" "}
          <span className="font-medium text-gray-900">{filteredLeaveRequests.length}</span> requests
          {isFilterActive && (
            <span className="ml-1 text-blue-600">(filtered)</span>
          )}
        </p>
        {/* Inline download hint */}
        {filteredLeaveRequests.length > 0 && (
          <p className="text-xs text-gray-400">
            Excel export includes all {filteredLeaveRequests.length} filtered records
          </p>
        )}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
        <table className="w-full min-w-[900px] text-sm text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Unique ID</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Request Time</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedLeaveRequests.length > 0 ? (
              paginatedLeaveRequests.map((request) => {
                const { formattedDate, formattedTime } = formatDateAndTime(request.created_at);
                return (
                  <tr
                    key={`${request.unique_id}-${request.id}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {request.unique_id}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {request.first_name} {request.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formattedDate}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formattedTime}</td>
                    <td className="px-4 py-3 text-gray-700">{request.leave_type}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {formatDateAndTime(request.start_date).formattedDate}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {formatDateAndTime(request.end_date).formattedDate}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded">
                        {request.number_of_days}d
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[150px]">
                      <p className="truncate" title={request.reason}>
                        {request.reason}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => setRequestToDelete(request)}
                          className="px-3 py-1.5 text-xs font-medium bg-white text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className="py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">No leave requests found</p>
                    <p className="text-xs text-gray-500">
                      {isFilterActive ? "Try adjusting your date filter or search term." : "No requests have been submitted yet."}
                    </p>
                    {isFilterActive && (
                      <button
                        onClick={resetDateFilters}
                        className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
          <p className="text-sm text-gray-600">
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedRequest && (
        <LeaveRequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {requestToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-start mb-4">
              <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Delete Leave Request</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete the leave request for{" "}
                  <span className="font-medium text-gray-900">
                    {requestToDelete.first_name} {requestToDelete.last_name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setRequestToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(requestToDelete.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusBadge(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "accepted":
      return "bg-green-50 text-green-700 border-green-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}