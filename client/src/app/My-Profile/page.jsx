"use client"; // Mark this as a Client Component

import { useEffect, useState } from "react";
import axios from "axios";
import EmployeeProfile from "../../components/EmployeeProfile"; // Import the EmployeeProfile component

export default function ProfilePage() {
  const [employee, setEmployee] = useState(null); // State to store employee data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state

  // Fetch employee data when the component mounts
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const uniqueId = localStorage.getItem("uniqueId"); // Retrieve the logged-in employee's unique ID

        if (!uniqueId) {
          setError("No employee ID found. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch employee data from the backend
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/employee/employees/${uniqueId}`
        );

        if (response.data.success) {
          setEmployee(response.data.data); // Set the employee data
        } else {
          setError(response.data.message || "Failed to fetch employee data.");
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setError("An error occurred while fetching employee data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  if (loading) return <p className="text-center text-blue-700 font-medium">Loading...</p>;
  if (error) return <p className="text-center text-red-500 font-medium">{error}</p>;

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Employee Profile</h1>

      {/* Render the EmployeeProfile component */}
      {employee ? (
        <EmployeeProfile employee={employee} />
      ) : (
        <p className="text-center text-gray-500">No employee data available.</p>
      )}
    </div>
  );
}