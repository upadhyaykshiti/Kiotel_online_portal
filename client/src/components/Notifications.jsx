
"use client"; // Mark this as a Client Component

import axios from "axios";
import { useEffect, useState } from "react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch notifications when the component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const uniqueId = localStorage.getItem("uniqueId");
        if (!uniqueId) {
          setError("No employee ID found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications?employee_id=${uniqueId}`
        );

        if (response.data.success) {
          setNotifications(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch notifications.");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("An error occurred while fetching notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) return <p className="text-center text-blue-700 font-medium">Loading notifications...</p>;
  if (error) return <p className="text-center text-red-500 font-medium">{error}</p>;

  return (
    <ul className="space-y-3">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <li
            key={notification.id}
            className={`flex items-start space-x-3 p-3 rounded-md ${
              notification.status === "pending"
                ? "bg-yellow-50 border-l-4 border-yellow-300"
                : notification.status === "accepted"
                ? "bg-green-50 border-l-4 border-green-300"
                : "bg-red-50 border-l-4 border-red-300"
            }`}
          >
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 ${
                  notification.status === "pending"
                    ? "text-yellow-500"
                    : notification.status === "accepted"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    notification.status === "pending"
                      ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      : notification.status === "accepted"
                      ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M9 19l2-7 4 4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  }
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    notification.status === "pending"
                      ? "text-yellow-500"
                      : notification.status === "accepted"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                </span>
              </p>
            </div>
          </li>
        ))
      ) : (
        <p className="text-center text-gray-500">No notifications found.</p>
      )}
    </ul>
  );
}