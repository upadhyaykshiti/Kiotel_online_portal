"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateApp = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [savedDate, setSavedDate] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the saved date from local storage when the component mounts
  useEffect(() => {
    const storedDate = localStorage.getItem("date");
    setSavedDate(storedDate ? new Date(storedDate) : null);
  }, []);

  // Fetch user role from the API
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        setUserRole(response.data.role);
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        setError("Failed to fetch user role");
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  // Save the selected date to local storage whenever it changes
  useEffect(() => {
    if (savedDate) {
      localStorage.setItem("date", savedDate.toISOString());
    }
  }, [savedDate]);

  const handleSaveDate = () => {
    if (selectedDate) {
      setSavedDate(selectedDate); // Override the existing date
      setSelectedDate(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-300 flex flex-col items-center p-6">
      {userRole === 1 && (
        <div className="max-w-md w-full bg-white shadow-2xl rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Select a Date
          </h1>
          <div className="flex flex-col items-center space-y-4">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Choose a date"
              className="w-full text-lg p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-200"
              onClick={handleSaveDate}
            >
              Save Date
            </button>
          </div>
        </div>
      )}

      <div className="max-w-md w-full mt-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Selected Date
        </h2>
        {savedDate ? (
          <div className="bg-blue-50 p-4 rounded-lg shadow-md text-blue-900 text-center text-lg">
            {savedDate.toLocaleDateString("en-GB")}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No date selected yet.</p>
        )}
      </div>
    </div>
  );
};

export default DateApp;
