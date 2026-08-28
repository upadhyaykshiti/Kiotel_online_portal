
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../../context/ProtectedRoute";

export default function TicketDetails({ params }) {
  const ticketId = params.createdbyid;
  const [ticketDetails, setTicketDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // State to hold user data
  const router = useRouter();

  // Fetch ticket details
  useEffect(() => {
    if (ticketId) {
      const fetchTicketDetails = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/forms_PropertyOnBoardingForm/${ticketId}`,
            {
              withCredentials: true,
            }
          );
          setTicketDetails(response.data);
        } catch (err) {
          console.error("Error fetching ticket details:", err);
          setError(err.response?.data?.message || "An error occurred");
        } finally {
          setLoading(false);
        }
      };

      fetchTicketDetails();
    }
  }, [ticketId]);

  // Fetch the user's session
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    fetchUserDetails();
  }, []);

  if (loading) return <p className="text-center text-gray-700">Loading...</p>;
  if (error)
    return (
      <p className="text-center text-red-600">
        Error loading ticket details: {error}
      </p>
    );

  if (!ticketDetails) {
    return (
      <p className="text-center text-gray-700">No data available.</p>
    );
  }

  return (
    <ProtectedRoute>
      {/* Navbar */}
      <nav className="bg-gray-100 text-black py-4 shadow-lg mb-6">
        <div className="container mx-auto flex justify-between items-center">
          {/* User's Name */}
          <div>
            {user && (
              <span className="text-lg font-bold">Welcome, {user.name}</span>
            )}
          </div>

          {/* Centered Image */}
          <div
            className="cursor-pointer"
            onClick={() => router.push("/Dashboard")}
          >
            <img
              src="/Kiotel logo.jpg"
              alt="Dashboard Logo"
              className="h-12 w-auto mx-auto"
            />
          </div>

          <div></div> {/* Empty div for balancing the layout */}
        </div>
      </nav>

      {/* Main Section */}
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Property On Boarding Form
          </h1>

          <div className="space-y-6">
            {[
              { label: "Hotel Name", value: ticketDetails.hotelName },
              { label: "Last Name", value: ticketDetails.lastname },
              { label: "Property Name", value: ticketDetails.propertyName },
              { label: "Address", value: ticketDetails.address },
              { label: "Address Line 2", value: ticketDetails.addressLine2 },
              { label: "Email", value: ticketDetails.email },
              { label: "Phone", value: ticketDetails.phone },
              { label: "City", value: ticketDetails.city },
            ].map(({ label, value }, index) => (
              <div key={index}>
                <h2 className="text-lg font-semibold text-gray-600">
                  {label}
                </h2>
                <p className="text-gray-800 border-b border-gray-200 pb-2">
                  {value || "Not Available"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() =>
                router.push(
                  `/Helpdesk/ticket/${ticketId}/replyTicket?title=${encodeURIComponent(
                    ticketDetails.lastname
                  )}`
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
            >
              Reply to Ticket
            </button>
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() =>
                router.push(
                  `/accounts/DateInstallation`
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
            >
              Add Dilevery discription
            </button>
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() =>
                router.push(
                  `/accounts/dilevery`
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
            >
              Add Installation Date
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
