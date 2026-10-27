

"use client"; // Mark this as a Client Component

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function EmployeeLoginForm() {
  const [uniqueId, setUniqueId] = useState("");
  const [error, setError] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false); // State to toggle admin login
  const router = useRouter();

  // Dynamically import the AdminLogin component
  const AdminLogin = showAdminLogin ? require("./AdminLoginForm").default : null;
  const handleadminbutton = async (e) => {
    e.preventDefault();
    router.push("/admin");
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/employee/login`, { unique_id: uniqueId });

      if (response.data.success) {
        // Store the user's unique_id in localStorage
        localStorage.setItem("uniqueId", uniqueId);

        // Redirect to the employee dashboard
        router.push("/emp-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during employee login.");
    }
  };

  return (
    <div className="relative max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      {/* Toggle Button for Admin Login
      {!showAdminLogin && (
        <button
          type="button"
          onClick={handleadminbutton} // Show admin login
          className="absolute top-4 right-4 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          Admin Login
        </button>
      )} */}

      {/* Conditional Rendering of Admin Login Component */}
      {showAdminLogin && (
        <div
          style={{
            transform: showAdminLogin ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s ease-in-out",
          }}
          className="absolute top-0 left-0 w-full h-full bg-white rounded-lg shadow-lg z-10 p-8"
        >
          {/* Back Button to Return to Employee Login */}
          <button
            type="button"
            onClick={() => setShowAdminLogin(false)} // Go back to employee login
            className="absolute top-4 left-4 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Back
          </button>

          {/* Render the External Admin Login Component */}
          <AdminLogin />
        </div>
      )}

      {/* Employee Login Form */}
      {!showAdminLogin && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unique ID Field */}
          <div>
            <label htmlFor="uniqueId" className="block text-sm font-medium text-blue-700">
              Welcome, Please Verify your employee ID
            </label>
            <input
              type="text"
              id="uniqueId"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 placeholder:text-gray-600"
              placeholder="Enter your employee unique ID"
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Verify Employee ID
          </button>
        </form>
      )}
    </div>
  );
}