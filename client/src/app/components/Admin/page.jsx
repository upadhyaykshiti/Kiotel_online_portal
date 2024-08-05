
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';

export default function Dashboard() {
  const [userFname, setUserFname] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserFname = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/user-email', { withCredentials: true });
        setUserFname(response.data.name);
      } catch (error) {
        console.error("Failed to fetch user name:", error);
        setError('Failed to fetch user name');
        setUserFname(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFname();
  }, []);


  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/user-email', { withCredentials: true });
        setUserRole(response.data.role);
       
      } catch (error) {
        console.error("Failed to fetch user name:", error);
        setError('Failed to fetch user name');
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full min-h-screen p-4 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h1 className="text-xl font-bold">
              {loading ? "Loading..." : error ? "Error loading email" : `Welcome, ${userFname}`}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaBell className="cursor-pointer text-2xl" />
            </div>
            <div className="relative">
              <FaUserCircle 
                className="cursor-pointer text-2xl" 
                onClick={toggleProfileMenu}
              />
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                  <Link href="/update-profile" legacyBehavior>
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Update Profile
                    </a>
                  </Link>
                  <Link href="/sign-in" legacyBehavior>
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Logout
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full flex justify-end p-4">
          <Link href="/components/Create_new_user" className="block p-4 bg-blue-500 text-white text-center rounded-lg shadow hover:bg-blue-600">
            Create New User
          </Link>
          
          
        </div>
      </div>
    </div>
  );
}
