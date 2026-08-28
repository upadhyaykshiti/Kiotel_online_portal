"use client";

import { useState, useEffect } from "react";

export default function ShiftTimeChange() {
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [shiftDetails, setShiftDetails] = useState(null);

  // Load shift details from local storage on component mount
  useEffect(() => {
    const storedDetails = localStorage.getItem("shiftDetails");
    if (storedDetails) {
      setShiftDetails(JSON.parse(storedDetails));
    }
  }, []);

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Handle start time change
  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  // Handle end time change
  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  // Save shift details to local storage and display them
  const handleSaveShift = () => {
    if (!selectedDate || !startTime || !endTime) {
      alert("Please select a date, start time, and end time.");
      return;
    }

    if (startTime >= endTime) {
      alert("Start time must be earlier than end time.");
      return;
    }

    const details = {
      date: selectedDate,
      timeSlot: `${startTime} - ${endTime}`,
    };

    localStorage.setItem("shiftDetails", JSON.stringify(details));
    setShiftDetails(details);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Shift Time Change</h1>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        {/* Date Picker */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="date">
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* Start Time Picker */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="startTime">
            Start Time
          </label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={handleStartTimeChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* End Time Picker */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="endTime">
            End Time
          </label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={handleEndTimeChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveShift}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Request shift time changes
        </button>
      </div>

      {/* Display Selected Shift Details */}
      {shiftDetails && (
        <div className="bg-green-50 p-4 rounded-lg shadow-md mt-6 w-full max-w-md text-center">
          <h2 className="text-lg font-semibold text-green-700">Requested Shift Details</h2>
          <p className="text-gray-700 mt-2">
            <strong>Date:</strong> {shiftDetails.date}
          </p>
          <p className="text-gray-700">
            <strong>Time Slot:</strong> {shiftDetails.timeSlot}
          </p>
        </div>
      )}
    </div>
  );
}
