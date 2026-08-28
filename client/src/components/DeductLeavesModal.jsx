


"use client";

import { useState } from "react";

export default function AddLeavesModal({ onClose, onAddLeaves }) {
  const [leaveType, setLeaveType] = useState("annual_leave");
  const [leaveCount, setLeaveCount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leaveCount || isNaN(leaveCount)) {
      alert("Please enter a valid number of leaves.");
      return;
    }

    // Use parseFloat to handle decimals like 1.5
    await onAddLeaves(leaveType, parseFloat(leaveCount));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
      {/* Modal Container */}
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">Deduct Leaves for All Employees</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 focus:outline-none transition duration-200"
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
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type Dropdown */}
          <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-800">
              Select Leave Type
            </label>
            <select
              id="leaveType"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300  font-medium text-gray-700 mb-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
            >
              <option value="annual_leave">Paid Leave</option>
              <option value="sick_leave">Festive Leave</option>
              <option value="casual_leave">Casual Leave</option>
            </select>
          </div>

          {/* Leave Count Input */}
          <div>
            <label htmlFor="leaveCount" className="block text-sm font-medium text-gray-800">
              Enter Number of Leaves
            </label>
            <input
              type="number"
              step="any"
              id="leaveCount"
              value={leaveCount}
              onChange={(e) => setLeaveCount(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
          >
            Deduct Leaves
          </button>
        </form>
      </div>
    </div>
  );
}