"use client";

import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Account() {
  const [userFname, setUserFname] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUserFname = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
          withCredentials: true,
        });
        setUserFname(response.data.name);
      } catch (error) {
        console.error("Failed to fetch user name:", error);
        setError("Failed to fetch user name");
        setUserFname(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFname();
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logout`, {}, { withCredentials: true });
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, { withCredentials: true });
        const role = response.data.role;
        const id = response.data.id;
        console.log("Fetched Role ID:", role);
        console.log("Fetched ID:", id);
        setUserRole(role);
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

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, { withCredentials: true });
        const role = response.data.role;
        const id = response.data.id;
        console.log("Fetched Role ID:", role);
        console.log("Fetched ID:", id);
        setUserId(id);
      } catch (error) {
        console.error("Failed to fetch user ID:", error);
        setError("Failed to fetch user ID");
        setUserId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  const handleGoToForm1 = () => {
    router.push("/accounts/form1");
  };

  const handleGoToForm2 = () => {
    router.push("/accounts/form2");
  };

  const handleViewSubmittedForm1 = () => {
    router.push(`/accounts/form/${userId}`);
  };

  const handleViewSubmittedForm2 = () => {
    router.push(`/accounts/tblforCust/${userId}`);
  };

  const handleRequestShiftChange = () => {
    router.push("/accounts/shiftchangereq");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar Section */}
      <div className="w-full p-4 bg-white shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">
            {loading ? "Loading..." : error ? "Error loading user" : `Hello, ${userFname}`}
          </h1>
          <div className="relative">
            <FaUserCircle className="cursor-pointer text-2xl" onClick={toggleProfileMenu} />
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                <Link href="/update-profile" legacyBehavior>
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Update Profile</a>
                </Link>
                <a
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Logout
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex flex-col items-center justify-center mt-10 space-y-6 text-center">
        {/* Welcome Message */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-md w-11/12 md:w-3/4">
          <h2 className="text-2xl font-semibold text-blue-800">
            Welcome, {loading ? "Guest" : userFname || "User"}!
          </h2>
          <p className="text-gray-700 mt-2">
            We are glad to have you here. Please take a moment to complete the forms below to provide all the necessary details.
          </p>
        </div>

        {/* Buttons for Forms */}
        <button
          onClick={handleGoToForm1}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md w-11/12 md:w-1/2 hover:bg-blue-600"
        >
          Third Party Equipment Form
        </button>
        <button
          onClick={handleGoToForm2}
          className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md w-11/12 md:w-1/2 hover:bg-green-600"
        >
          Property Onboarding Form
        </button>
        <button
          onClick={handleViewSubmittedForm1}
          className="bg-purple-500 text-white px-6 py-3 rounded-lg shadow-md w-11/12 md:w-1/2 hover:bg-purple-600"
        >
          View Submitted Third Party Equipment Forms
        </button>
        <button
          onClick={handleViewSubmittedForm2}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg shadow-md w-11/12 md:w-1/2 hover:bg-orange-600"
        >
          View Submitted Property Onboarding Forms
        </button>
      </div>

      {/* New Section: Request for Shift Change */}
      <div className="flex flex-col items-center justify-center mt-10 space-y-6 text-center">
        <div className="bg-gray-50 p-6 rounded-lg shadow-md w-11/12 md:w-3/4">
          <h2 className="text-xl font-semibold text-gray-800">Request a Shift Change</h2>
          <p className="text-gray-600 mt-2">
            If you need to change your shift, click the button below to make a request.
          </p>
        </div>
        <button
          onClick={handleRequestShiftChange}
          className="bg-indigo-500 text-white px-6 py-3 rounded-lg shadow-md w-11/12 md:w-1/2 hover:bg-indigo-600"
        >
          Request Shift Change
        </button>
      </div>
    </div>
  );
}
