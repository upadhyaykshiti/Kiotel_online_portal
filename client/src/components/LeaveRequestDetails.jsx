



// components/LeaveRequestDetails.jsx
"use client";

import axios from "axios";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // For smooth animations
import { FaTimes, FaUser, FaCalendarAlt, FaClock, FaStickyNote, FaInfoCircle, FaCheck, FaBan, FaHourglassHalf } from "react-icons/fa"; // Icons for better visuals

export default function LeaveRequestDetails({ request, onClose }) {
  const [status, setStatus] = useState(request.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdateStatus = async () => {
    // Prevent updating to the same status
    if (status === request.status) {
      setError("Status is already set to this value.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leave-requests/${request.id}`,
        { status }
      );

      if (response.data.success) {
        // Use a subtle animation or toast notification library (like react-toastify) for better UX
        // For now, a simple alert as in your original code
        alert("Status updated successfully!");
        onClose(); // Close the modal on success
      } else {
        setError(response.data.message || "Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      // Provide more specific error messages if possible from the backend
      const errorMsg = error.response?.data?.message || "An error occurred while updating the status. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping for leave types (example)
  const getLeaveTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
        case 'annual':
        case 'vacation':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'sick':
        case 'medical':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
        case 'personal':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
        default:
            return <FaInfoCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
        onClick={onClose} // Close modal if backdrop is clicked
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[95vh]"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-200 relative">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                  <div className="p-2 rounded-lg bg-white shadow-sm mr-3">
                    {getLeaveTypeIcon(request.leave_type)}
                  </div>
                  Leave Request Details
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Review and manage <span className="font-semibold">{request.first_name} {request.last_name}</span> leave request.
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 transition-colors duration-200 p-2 rounded-full hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                aria-label="Close"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Body - Scrollable Content */}
          <div className="flex-grow overflow-y-auto p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoCard
                icon={<FaUser className="text-indigo-600" />}
                label="Employee"
                value={`${request.first_name} ${request.last_name}`}
              />
              <InfoCard
                icon={getLeaveTypeIcon(request.leave_type)}
                label="Leave Type"
                value={request.leave_type}
              />
              <InfoCard
                icon={<FaCalendarAlt className="text-blue-500" />}
                label="Start Date"
                value={trimDate(request.start_date)}
              />
              <InfoCard
                icon={<FaCalendarAlt className="text-green-500" />}
                label="End Date"
                value={trimDate(request.end_date)}
              />
              <InfoCard
                icon={<FaClock className="text-amber-500" />}
                label="Number of Days"
                value={request.number_of_days}
              />
              
              <InfoCard
                icon={<FaStickyNote className="text-purple-500" />}
                label="Reason"
                value={request.reason}
                isFullWidth={true} // Span full width for longer content
              />
              <InfoCard
                icon={
                  request.status === "pending" ? <FaHourglassHalf className="text-yellow-500" /> :
                  request.status === "accepted" ? <FaCheck className="text-green-500" /> :
                  <FaBan className="text-red-500" />
                }
                label="Current Status"
                value={
                  <span className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${getStatusBadgeStyle(request.status)}`}>
                    {capitalize(request.status)}
                  </span>
                }
                isFullWidth={true}
              />
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-gray-200"></div>

            

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm flex items-start"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-5 sm:px-8 sm:py-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button" // Prevent form submission
              onClick={onClose}
              disabled={loading}
              className={`px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Cancel
            </button>
            <button
              type="button" // Prevent form submission
              onClick={handleUpdateStatus}
              disabled={loading || status === request.status} // Disable if status hasn't changed
              className={`px-5 py-2.5 text-base font-medium rounded-xl shadow-sm text-white transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading || status === request.status
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                <span className="flex items-center">
                  <FaCheck className="mr-2" />
                  Update Status
                </span>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- Reusable Info Card Component ---
function InfoCard({ icon, label, value, isFullWidth = false }) {
  return (
    <div className={`bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ${isFullWidth ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm mr-3">
          {icon}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-1 flex items-center">
            {label}
          </div>
          <div className="font-medium text-gray-900 break-words">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Utility Functions ---
function trimDate(dateStr) {
  return dateStr.split("T")[0];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusBadgeStyle(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "accepted":
      return "bg-green-100 text-green-800 border border-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
}

function getStatusButtonStyle(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border border-yellow-300 focus:ring-yellow-500";
    case "accepted":
      return "bg-green-100 text-green-800 border border-green-300 focus:ring-green-500";
    case "rejected":
      return "bg-red-100 text-red-800 border border-red-300 focus:ring-red-500";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-300 focus:ring-gray-500";
  }
}