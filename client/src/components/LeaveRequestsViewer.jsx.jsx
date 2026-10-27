

"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import moment from "moment";

export default function LeaveRequestsViewer({ onClose }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // For edit modal
  const [editingRequest, setEditingRequest] = useState(null);
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const uniqueId = localStorage.getItem("uniqueId");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        if (!uniqueId) {
          setError("Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leave-requests/${uniqueId}`
        );

        if (response.data.success) {
          setLeaveRequests(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch leave requests.");
        }
      } catch (err) {
        console.error("Error fetching leave requests:", err);
        setError("An error occurred while fetching leave requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [uniqueId]);

  const handleEditClick = (request) => {
    // Extract the date part (YYYY-MM-DD) from the full ISO date
    const startDate = moment(request.start_date).format("YYYY-MM-DD");
    const endDate = moment(request.end_date).format("YYYY-MM-DD");

    setEditingRequest(request);
    setFormData({
      leave_type: request.leave_type,
      start_date: startDate,
      end_date: endDate,
      reason: request.reason,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leave-requests-edits/${editingRequest.id}`,
        {
          ...formData,
          unique_id: uniqueId,
        }
      );

      if (response.data.success) {
        // Update the list locally
        setLeaveRequests((prev) =>
          prev.map((req) =>
            req.id === editingRequest.id ? { ...req, ...formData } : req
          )
        );
        setEditingRequest(null); // Close modal
      } else {
        alert("Failed to update leave request.");
      }
    } catch (err) {
      console.error("Error updating leave request:", err);
      alert("An error occurred while saving changes.");
    }
  };

  if (loading)
    return <p className="text-center text-blue-700 font-medium">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500 font-medium">{error}</p>;

  return (
    <>
      {/* Main View - Leave Requests List */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white w-[400px] p-6 rounded-lg shadow-lg overflow-y-auto max-h-[80vh] relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-xl font-bold text-blue-700 mb-4">My Leave Requests</h2>

          {leaveRequests.length > 0 ? (
            leaveRequests.map((request) => (
              <div
                key={`${request.unique_id}-${request.id}`}
                className="bg-gray-100 p-4 mb-4 rounded-md shadow-sm relative"
              >
                <p className="font-medium text-gray-700">
                  Leave Type:{" "}
                  <span className="text-gray-900">{request.leave_type}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Start Date:{" "}
                  <span className="text-gray-800">
                    {moment(request.start_date).format("MMMM D, YYYY")}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  End Date:{" "}
                  <span className="text-gray-800">
                    {moment(request.end_date).format("MMMM D, YYYY")}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Reason: <span className="text-gray-800">{request.reason}</span>
                </p>
                {/* <p className={`text-sm font-medium mt-2 ${getStatusColor(request.status)}`}>
                  Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </p> */}
                <p className={`text-sm font-medium mt-2 ${getStatusColor(request.status)}`}>
                   Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </p>
                {/* Edit Button (only if Pending) */}
                {/* {request.status === "pending" && (
                  <button
                    onClick={() => handleEditClick(request)}
                    className="mt-3 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                )} */}


                {/* 
                */}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No leave requests found.</p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">Edit Leave Request</h3>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                <input
                  type="text"
                  name="leave_type"
                  value={formData.leave_type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                ></textarea>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Helper function to style status based on its value
function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "text-yellow-500";
    case "accepted":
      return "text-green-500";
    case "rejected":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}