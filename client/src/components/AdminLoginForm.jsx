"use client"; // Mark this as a Client Component

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const [uniqueId, setUniqueId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/admin/login`,
        { unique_id: uniqueId }
      );

      if (response.data.success) {
        // Store the user's role in localStorage
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("uniqueId", uniqueId);

        // Redirect to the admin dashboard
        router.push("/admin-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during admin verification.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Unique ID Field */}
      <div>
        <label htmlFor="uniqueId" className="block text-sm font-medium text-blue-700">
          Welcome, Please Verify your Admin ID
        </label>
        <input
          type="text"
          id="uniqueId"
          value={uniqueId}
          onChange={(e) => setUniqueId(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder:text-gray-500"
          placeholder="Enter your admin unique ID"
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Login Button */}
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Verify  Admin ID
      </button>
    </form>
  );
}