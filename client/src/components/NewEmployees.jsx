



"use client"; // Mark this as a Client Component

import axios from "axios";
import { useState } from "react";

export default function NewEmployees() {
  // State to manage form inputs
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "", // Added email field
    date_of_joining: "",
    unique_id: "",
  });

  

  // State for error and success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate the unique ID length
      if (formData.unique_id.length !== 6) {
        setError("Unique ID must be exactly 6 digits.");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address.");
        return;
      }

      // Send a POST request to the backend API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/employee/new_employee`,
        formData
      );

      if (response.data.success) {
        setSuccess("Employee created successfully!");
        setError(""); // Clear any previous errors
        setFormData({
          first_name: "",
          last_name: "",
          email: "", // Reset email field
          date_of_joining: "",
          unique_id: "",
        }); // Reset form
      } else {
        setError(response.data.message || "Failed to create employee.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while creating the employee.");
    }
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-2xl">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Add New Employee</h2>

      {/* Success Message */}
      {success && (
        <p className="text-green-500 text-sm font-medium mb-4">{success}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm font-medium mb-4">{error}</p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name */}
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-blue-700">
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-3 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder:text-gray-400"
            placeholder="Enter first name"
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-blue-700">
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-3 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder:text-gray-400"
            placeholder="Enter last name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-blue-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-3 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder:text-gray-400"
            placeholder="Enter email address"
          />
        </div>

        {/* Date of Joining */}
        <div>
          <label htmlFor="date_of_joining" className="block text-sm font-medium text-blue-700">
            Date of Joining
          </label>
          <input
            type="date"
            id="date_of_joining"
            name="date_of_joining"
            value={formData.date_of_joining}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-3 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder:text-gray-400"
            placeholder="Select date of joining"
          />
        </div>

        {/* Unique ID */}
        <div>
          <label htmlFor="unique_id" className="block text-sm font-medium text-blue-700">
            Unique ID (6 digits)
          </label>
          <input
            type="text"
            id="unique_id"
            name="unique_id"
            value={formData.unique_id}
            onChange={handleChange}
            required
            maxLength={6}
            className="mt-1 block w-full px-4 py-3 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder:text-gray-400"
            placeholder="Enter 6-digit unique ID"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
        >
          Add Employee
        </button>
      </form>
    </div>
  );
}