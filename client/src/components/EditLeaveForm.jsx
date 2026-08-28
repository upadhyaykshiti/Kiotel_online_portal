

"use client"; // Mark this as a Client Component

import axios from "axios";
import { useState } from "react";

export default function EditLeaveForm({ employee, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    annual_leave: employee.annual_leave,
    sick_leave: employee.sick_leave,
    casual_leave: employee.casual_leave,
    other_leave: employee.other_leave,
  });

  // // Handle input changes
  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prevData) => ({ ...prevData, [name]: value }));
  // };

const handleInputChange = (e) => {
  const { name, value } = e.target;

  setFormData((prevData) => ({
    ...prevData,
    [name]: parseFloat(value) || 0,
  }));
};


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the updated leave balances to the backend
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/update-leave-balances/${employee.unique_id}`,
        formData
      );

      if (response.data.success) {
        alert("Leave balances updated successfully!");
        onUpdate({ ...employee, ...formData }); // Notify parent component of the update
        onClose(); // Close the form after successful update
      } else {
        alert("Failed to update leave balances. Please try again.");
      }
    } catch (error) {
      console.error("Error updating leave balances:", error);
      alert("An error occurred while updating leave balances. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Heading with Employee Name */}
        <h2 className="text-xl font-bold text-blue-700 mb-4">Edit Leave Balances - {employee.first_name}</h2>

        {/* Edit Leave Balances Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Paid Leave</label>
            {/* <input
              type="number"
              name="annual_leave"
              value={formData.annual_leave}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            /> */}
            <input
  type="number"
  step="0.01"
  min="0"
  name="annual_leave"
  value={formData.annual_leave}
  onChange={handleInputChange}
  className="mt-1 block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
/>
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition duration-200"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}