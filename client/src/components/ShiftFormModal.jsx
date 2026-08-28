"use client";

import React, { useState } from "react";

export default function ShiftFormModal({ onClose, onSave, selectedDate }) {
  const [employeeId, setEmployeeId] = useState("");
  const [shiftType, setShiftType] = useState("morning");
  const [date, setDate] = useState(selectedDate ? selectedDate.toISOString().split("T")[0] : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newShift = {
      id: Math.random().toString(36).substr(2, 9),
      title: `${shiftType.charAt(0).toUpperCase() + shiftType.slice(1)} - Employee ${employeeId}`,
      start: new Date(date + "T08:00:00"), // Placeholder time based on shift
      end: new Date(date + "T16:00:00"),
      extendedProps: {
        employeeId,
        shiftType,
      },
    };
    onSave(newShift);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Assign Shift</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">-- Select Employee --</option>
              <option value="1">John Doe</option>
              <option value="2">Alice Smith</option>
              {/* These should come from your backend */}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
            <select
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="night">Night</option>
              <option value="off">Day Off</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}