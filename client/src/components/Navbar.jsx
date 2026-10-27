
"use client"; // Mark this as a Client Component

import { useRouter } from "next/navigation";
import { useState } from "react";
import LeaveRequestForm from "./LeaveRequestForm"; // Import the reusable form
import LeaveRequestsViewer from "./LeaveRequestsViewer.jsx"; // Import the new LeaveRequestsViewer component
import Notifications from "./Notifications"; // Import the Notifications component

export default function Navbar({ employee }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false); // State for LeaveRequestForm modal
  const [isLeaveRequestsOpen, setIsLeaveRequestsOpen] = useState(false); // State for LeaveRequestsViewer modal
  const [showNotifications, setShowNotifications] = useState(false); // State for notifications dropdown
  const [showDropdown, setShowDropdown] = useState(false); // State for profile/logout dropdown

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("uniqueId");
    router.push("/sign-in"); // Redirect to the login page
  };

  return (
    <>
      <nav className="bg-blue-700 text-white py-4 px-6 flex justify-between items-center font-inter">
        {/* Left Side: User Name */}
        <div className="flex items-center space-x-4">
          <p className="text-lg font-semibold tracking-wide">
            Hello, {employee?.first_name || "Employee First Name"}{" "}
            {employee?.last_name || "Employee Last Name"}!
          </p>
        </div>

        {/* Right Side: Buttons */}
        <div className="flex items-center space-x-4 relative">
          {/* Request Leave Button */}
          <button
            onClick={() => setIsModalOpen(true)} // Open the LeaveRequestForm modal
            className="bg-white text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition duration-200"
          >
            Request Leave
          </button>

          {/* View Leave Requests Button */}
          <button
            onClick={() => setIsLeaveRequestsOpen(true)} // Open the LeaveRequestsViewer modal
            className="bg-green-500 text-white px-4 py-2 rounded-md font-medium hover:bg-green-600 transition duration-200"
          >
            View Leave Requests
          </button>

          {/* Notification Button */}
          {/* <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative group focus:outline-none"
          >
            
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white hover:text-gray-300 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.841A6.002 6.002 0 006 11v3.159c0 .538-.154 1.055-.435 1.5L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 transform translate-x-1/2 -translate-y-1/2">
              ! 
            </span>
          </button> */}

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors focus:outline-none"
            >
              <span className="font-medium">{employee?.first_name || "Profile"}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-10 right-0 bg-white rounded-lg shadow-md p-2 w-40 z-50">
                <button
                  onClick={() => router.push("/My-Profile")} // Navigate to the profile page
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Employee Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Conditional Rendering of LeaveRequestForm Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[400px] max-h-[80vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)} // Close the modal
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Leave Request Form */}
            <LeaveRequestForm
              employeeName={`${employee?.first_name || "Employee First Name"} ${
                employee?.last_name || "Employee Last Name"
              }`}
              onClose={() => setIsModalOpen(false)} // Close the modal
            />
          </div>
        </div>
      )}

      {/* Conditional Rendering of LeaveRequestsViewer Modal */}
      {isLeaveRequestsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[800px] max-h-[80vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setIsLeaveRequestsOpen(false)} // Close the modal
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Leave Requests Viewer */}
            <LeaveRequestsViewer onClose={() => setIsLeaveRequestsOpen(false)} />
          </div>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 right-16 bg-white rounded-lg shadow-md p-4 w-80 z-50">
          <Notifications onClose={() => setShowNotifications(false)} />
        </div>
      )}
    </>
  );
}