"use client"; // Mark this as a Client Component

import React, { useState } from "react";
import axios from "axios";

export default function NewAdmin() {
  const [formData, setFormData] = useState({
    unique_id: "",
    first_name: "",
    last_name: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate input fields
      if (!formData.unique_id || !formData.first_name || !formData.last_name) {
        setError("All fields are required.");
        return;
      }

      // Send the data to the backend API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/new_admin`,
        formData
      );

      // Check if the API call was successful
      if (response.data.success) {
        setSuccess("Admin created successfully!");
        setError(""); // Clear any previous errors
        setFormData({ unique_id: "", first_name: "", last_name: "" }); // Reset form
      } else {
        setError(response.data.message || "An error occurred while creating the admin.");
      }
    } catch (err) {
      console.error("Error creating admin:", err);
      setError(err.response?.data?.message || "An error occurred while creating the admin.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg ">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Add New Admin</h2>

      {/* Success Message */}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Unique ID */}
        <div>
          <label htmlFor="unique_id" className="block text-sm font-medium text-blue-700">
            Unique ID
          </label>
          <input
            type="text"
            id="unique_id"
            name="unique_id"
            value={formData.unique_id}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder:text-gray-400"
            placeholder="Enter unique ID"
          />
        </div>

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
            className="mt-1 block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder:text-gray-400"
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
            className="mt-1 block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder:text-gray-400"
            placeholder="Enter last name"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Admin
        </button>
      </form>
    </div>
  );
}