"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../../context/ProtectedRoute'; // Import your ProtectedRoute

export default function TicketDetails({ params }) {
  const ticketId = params.ticketId;
  const [ticketDetails, setTicketDetails] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // State to hold user data
  const router = useRouter();

  // Utility to check if a file is an image
  const isImage = (filename) => {
    if (!filename) return false; // Check if filename is null or undefined
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    return imageExtensions.includes(filename.split('.').pop().toLowerCase());
  };

  // Utility to check if a file exists on the server
  const checkFileExistence = async (filePath) => {
    try {
      const response = await axios.head(filePath);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  // Handle file download
  const handleDownload = async (filePath, filename) => {
    const fileExists = await checkFileExistence(filePath);
    if (fileExists) {
      const link = document.createElement('a');
      link.href = filePath;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('File not found on the server.');
    }
  };

  // Fetch ticket details and replies
  useEffect(() => {
    if (ticketId) {
      const fetchTicketDetails = async () => {
        try {
          const [ticketResponse, repliesResponse] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tickets/${ticketId}`, {
              withCredentials: true,
            }),
            axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ticket/${ticketId}/replies`, {
              withCredentials: true,
            }),
          ]);

          setTicketDetails(ticketResponse.data);

          const repliesWithAttachments = repliesResponse.data.map(reply => ({
            ...reply,
            attachments: reply.unique_name,
          }));
          setReplies(repliesWithAttachments);
        } catch (err) {
          console.error("Error fetching ticket details:", err);
          setError(err.response?.data?.message || 'An error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchTicketDetails();
    }
  }, [ticketId]);

  // Fetch the user's session (Assuming API exists to get user info)
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    fetchUserDetails();
  }, []);

  if (loading) return <p className="text-center text-gray-700">Loading...</p>;
  if (error) return <p className="text-center text-red-600">Error loading ticket details: {error}</p>;

  if (!ticketDetails) {
    return <p className="text-center text-gray-700">No ticket details available.</p>;
  }

  return (
    <ProtectedRoute>
      {/* Navbar */}
      <nav className="bg-gray-100 text-black py-4 shadow-lg mb-6">
        <div className="container mx-auto flex justify-between items-center">
          {/* User's Name */}
          <div>
            {user && <span className="text-lg font-bold">Welcome, {user.name}</span>}
          </div>
          
          {/* Centered Image */}
          <div className="cursor-pointer" onClick={() => router.push('/Dashboard')}>
            <img 
              src="/Kiotel logo.jpg" 
              alt="Dashboard Logo" 
              className="h-12 w-auto mx-auto"
            />
          </div>

          <div></div> {/* Empty div for balancing the layout */}
        </div>
      </nav>

      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6">
        {/* <header className="bg-white shadow-lg rounded-lg mb-6">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide">Ticket Details</h1>
            <button
              onClick={() => router.push(`/Helpdesk/ticket/${ticketId}/replyTicket?title=${encodeURIComponent(ticketDetails.title)}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              Reply to Ticket
            </button>
          </div>
        </header> */}

        <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg mb-6 p-6">
          {/* Ticket Details */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide"></h1>
            <button
              onClick={() => router.push(`/Helpdesk/ticket/${ticketId}/replyTicket?title=${encodeURIComponent(ticketDetails.title)}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              Reply to Ticket
            </button>
          </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ticket #{ticketDetails.id}</h2>
            <p><strong className="font-medium text-gray-700">Title:</strong> {ticketDetails.title}</p>
            {/* <p><strong className="font-medium text-gray-700">Created At:</strong> {new Date(ticketDetails.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p> */}
            <p><strong className="font-medium text-gray-700">Created At:</strong> {new Date(ticketDetails.created_at).toLocaleString("en-US", {
                        timeZone: "America/Chicago",
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })} CST</p>
            <p><strong className="font-medium text-gray-700">Status:</strong> {ticketDetails.status_name}</p>
            <p><strong className="font-medium text-gray-700">Created by:</strong> {ticketDetails.fname}</p>
          </div>

          {/* Ticket Description */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
            <label htmlFor="" className="font-medium text-gray-700">Description:</label>
            <p className="text-gray-700 whitespace-pre-wrap break-words overflow-wrap break-word mt-2">
              {ticketDetails.description}
            </p>
          </div>
          
          {/* Ticket Attachments */}
          {ticketDetails.unique_name && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Attachments:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {isImage(ticketDetails.unique_name) ? (
                  <div className="relative group overflow-hidden rounded-lg shadow-md">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${ticketDetails.unique_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${ticketDetails.unique_name}`}
                        alt="Ticket Attachment"
                        className="w-full h-32 object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-105"
                      />
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDownload(`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${ticketDetails.unique_name}`, ticketDetails.unique_name)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                  >
                    Download 
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Replies Section */}
        {replies.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Replies:</h3>
            <div className="space-y-6">
              {replies.map((reply, index) => (
                <div key={index} className="bg-white border border-gray-300 shadow-sm rounded-lg p-5 transition-transform transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-lg font-semibold text-blue-600">{reply.fname}</p>
                    <span className="text-sm text-gray-400">
                      {new Date(reply.created_at).toLocaleString("en-US", {
                        timeZone: "America/Chicago",
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
                    <label htmlFor="" className="font-medium text-gray-700">Description:</label>
                    <p className="text-gray-700 whitespace-pre-wrap break-words overflow-wrap break-word mt-2">
                      {reply.reply_text}
                    </p>
                  </div>

                  {/* Reply Attachments */}
                  {reply.unique_name && (
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Attachments:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {isImage(reply.unique_name) ? (
                          <div className="relative group overflow-hidden rounded-lg shadow-md">
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/replies/${reply.unique_name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/replies/${reply.unique_name}`}
                                alt={`Reply Attachment`}
                                className="w-full h-32 object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-105"
                              />
                            </a>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDownload(`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/replies/${reply.unique_name}`, reply.unique_name)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                          >
                            Download 
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}



