// components/EmbeddedLink.jsx
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ProtectedRoute from "../../context/ProtectedRoute";

function EmbeddedLink() {
  const [userId, setUserId] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        const role = response.data.role;
        const id = response.data.id;
        const url = response.data.link;
        
        console.log("Fetched Role ID:", role);
        console.log("Fetched ID:", id);
        console.log("link", url);
        
        setRole(role);
        setUserId(id);
        setLinkUrl(url || ""); // Set the link URL
      } catch (error) {
        console.error("Failed to fetch user ID:", error);
        setError("Failed to fetch user data");
        setUserId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your content...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Content</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show "no link assigned" message when there's no link
  if (!linkUrl) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-gray-500 text-5xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Link Assigned</h2>
          <p className="text-gray-600">You dont have any external link assigned to your account.</p>
          <p className="text-gray-500 text-sm mt-2">Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  // Validate URL format
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  if (!isValidUrl(linkUrl)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid Link</h2>
          <p className="text-gray-600">The assigned link is not valid.</p>
          <p className="text-gray-500 text-sm mt-2 break-words">{linkUrl}</p>
        </div>
      </div>
    );
  }

  // Render the embedded content
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <h1 className="text-lg font-semibold">Embedded Content</h1>
            <div className="text-sm text-gray-300">
              User ID: {userId}
            </div>
          </div>
          
          <div className="p-1 bg-gray-200">
            <div className="flex items-center justify-between bg-white p-2 border-b">
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">🔗</span>
                <span className="text-sm text-gray-600 truncate max-w-md">{linkUrl}</span>
              </div>
              <a 
                href={linkUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
              >
                Open in new tab
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            
            <div className="h-[calc(100vh-150px)]">
              <iframe
                src={linkUrl}
                title="Embedded Content"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmbeddedLinkWrapper() {
  return (
    <ProtectedRoute>
      <EmbeddedLink />
    </ProtectedRoute>
  );
}