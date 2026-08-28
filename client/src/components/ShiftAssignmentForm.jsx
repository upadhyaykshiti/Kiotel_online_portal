"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ShiftAssignmentForm() {
  const [properties, setProperties] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [weekStart, setWeekStart] = useState("");

  const [primaryEmployeeUniqueId, setPrimaryEmployeeUniqueId] = useState("");
  const [backup1UniqueId, setBackup1UniqueId] = useState("");
  const [backup2UniqueId, setBackup2UniqueId] = useState("");
  const [backup3UniqueId, setBackup3UniqueId] = useState("");

  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch properties, shifts, and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertyRes, shiftRes, employeeRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/shift/properties`),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/shift/shifts`),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/employee/employees`) // ✅ Using your existing API
        ]);

        if (employeeRes.data.success) {
          setEmployees(employeeRes.data.data);
        }

        setProperties(propertyRes.data);
        setShifts(shiftRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      propertyId: selectedPropertyId,
      shiftId: selectedShiftId,
      weekStart,
      primaryEmployeeUniqueId,
      backupEmployee1UniqueId: backup1UniqueId || null,
      backupEmployee2UniqueId: backup2UniqueId || null,
      backupEmployee3UniqueId: backup3UniqueId || null
    };

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/shift/shifts/assign`, payload);
      setMessage({ type: "success", text: "Shift assigned successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to assign shift. Please try again." });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Assign Shift</h2>

      {/* Success/Error Message */}
      {message.text && (
        <div
          className={`p-3 mb-4 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Property Dropdown */}
        <div className="mb-4">
          <label htmlFor="property" className="block text-sm font-medium text-gray-700 mb-1">
            Property
          </label>
          <select
            id="property"
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">-- Select Property --</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.property_name}
              </option>
            ))}
          </select>
        </div>

        {/* Shift Dropdown */}
        <div className="mb-4">
          <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
            Shift
          </label>
          <select
            id="shift"
            value={selectedShiftId}
            onChange={(e) => setSelectedShiftId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">-- Select Shift --</option>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.shift_name} ({shift.start_time} - {shift.end_time})
              </option>
            ))}
          </select>
        </div>

        {/* Week Start Date */}
        <div className="mb-4">
          <label htmlFor="weekStart" className="block text-sm font-medium text-gray-700 mb-1">
            Week Start Date (Monday)
          </label>
          <input
            id="weekStart"
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
{/* hellow this is the way you should be accessing it to the layout of the delployemnt which is need to be build acconrdingly with the angles
and the lays of the offince with which it can be out of the locals in lane and int the outing fo the line and the kings of the
of the way it should be outing int eh lane of the line which is been actinve on the lanes and continue discussing the plateform of 
of the young youth and this is the proper way, you can ask that who was the only 2 know and big warriors mentioned in the 
tv serial who ditnt fount in the battle of the mahabharat and give them the the one warrior was brother of shri krishna that
is Balram and name the other who dit that with the war layout, They should name the answers that it was the brother of the shri 
krishnas wife rukmini that is King Rukmi. and then give them the other way arround of the light and then the darks of the days which is 
is been use as the only way of the king and     

*/}
        {/* Primary Employee */}
        <div className="mb-4">
          <label htmlFor="primary" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Employee
          </label>
          <select
            id="primary"
            value={primaryEmployeeUniqueId}
            onChange={(e) => setPrimaryEmployeeUniqueId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">-- Select Employee --</option>
            {employees
              .filter(emp => emp.status !== "inactive") // Only active employees
              .map((emp) => (
                <option key={emp.id} value={emp.unique_id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
          </select>
        </div>

        {/* Backup Employees */}
        {[1, 2, 3].map((num) => (
          <div key={num} className="mb-4">
            <label htmlFor={`backup${num}`} className="block text-sm font-medium text-gray-700 mb-1">
              Backup Employee {num}
            </label>
            <select
              id={`backup${num}`}
              value={
                num === 1
                  ? backup1UniqueId
                  : num === 2
                  ? backup2UniqueId
                  : backup3UniqueId
              }
              onChange={(e) => {
                if (num === 1) setBackup1UniqueId(e.target.value);
                else if (num === 2) setBackup2UniqueId(e.target.value);
                else setBackup3UniqueId(e.target.value);
              }}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">-- Optional --</option>
              {employees
                .filter(emp => emp.status !== "inactive") // Exclude inactive employees
                .map((emp) => (
                  <option key={emp.unique_id} value={emp.unique_id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
            </select>
          </div>
        ))}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
        >
          Assign Shift
        </button>
      </form>
    </div>
  );
}