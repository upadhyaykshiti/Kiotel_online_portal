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
  const [hotelSubmissions, setHotelSubmissions] = useState([]); // State for submissions

  const router = useRouter();

  // Fetch user information and role
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
          withCredentials: true,
        });
        const { name, role } = response.data;
        setUserFname(name);
        setUserRole(role);

        // Fetch hotel submissions if role_id is 1
        
          const submissionResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/propertyOnboarding`,
            { withCredentials: true }
          );
          setHotelSubmissions(submissionResponse.data);
        
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        setError("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
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

  // Handle navigation to form pages
 

  const handleGoToForm2 = () => {
    router.push("/accounts/form2");
  };

  // Render loading or error state
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar Section */}
      <div className="w-full p-4 bg-white shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Hello, {userFname}</h1>
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

      {/* Conditional Rendering Based on Role */}
      <div className="mt-10 p-4">
        

       

{userRole === 1 && (
  <div>
    <h2 className="text-2xl font-bold mb-4">Property On boarding</h2>
    <table className="w-full table-auto border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2">ID</th>
          <th className="border border-gray-300 px-4 py-2">Hotel Name</th>
          {/* <th className="border border-gray-300 px-4 py-2">Date of Submission</th> */}
          {/* <th className="border border-gray-300 px-4 py-2">Verified/Not Verified</th> */}
          <th className="border border-gray-300 px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {hotelSubmissions.length === 0 ? (
          <tr>
            <td className="border border-gray-300 px-4 py-2 text-center" colSpan="5">
              No data found
            </td>
          </tr>
        ) : (
          hotelSubmissions.map((submission) => (
            <tr key={submission.id}>
              <td className="border border-gray-300 px-4 py-2">{submission.id}</td>
              <td className="border border-gray-300 px-4 py-2">{submission.hotelName}</td>
              {/* <td className="border border-gray-300 px-4 py-2">{submission.CreatedBy}</td> */}
              {/* <td className="border border-gray-300 px-4 py-2">
                {submission.isVerified ? "Verified" : "Not Verified"}
              </td> */}
              <td className="border border-gray-300 px-4 py-2 space-x-2">
                {/* <button
                  onClick={handleGoToForm1}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  View Form 1
                </button> */}
                <Link href={`/accounts/form/${submission.CreatedBy}`} className="text-blue-600 hover:text-blue-900">
                      Open
                    </Link>
                {/* <button
                  onClick={handleGoToForm2}
                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                >
                  View Form 2
                </button> */}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)}
      </div>
    </div>
  );
}
