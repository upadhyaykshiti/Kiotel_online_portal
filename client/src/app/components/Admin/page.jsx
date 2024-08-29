
// "use client";

// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { FaBell, FaUserCircle } from 'react-icons/fa';
// import axios from 'axios';

// export default function Dashboard() {
//   const [userFname, setUserFname] = useState(null);
//   const [userRole, setUserRole] = useState(null);
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchUserFname = async () => {
//       try {
//         const response = await axios.get('${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-email', { withCredentials: true });
//         setUserFname(response.data.name);
//       } catch (error) {
//         console.error("Failed to fetch user name:", error);
//         setError('Failed to fetch user name');
//         setUserFname(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserFname();
//   }, []);


//   useEffect(() => {
//     const fetchUserRole = async () => {
//       try {
//         const response = await axios.get('http://localhost:8080/api/user-email', { withCredentials: true });
//         setUserRole(response.data.role);
       
//       } catch (error) {
//         console.error("Failed to fetch user name:", error);
//         setError('Failed to fetch user name');
//         setUserRole(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserRole();
//   }, []);

//   const toggleProfileMenu = () => {
//     setIsProfileMenuOpen(!isProfileMenuOpen);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="w-full min-h-screen p-4 bg-white rounded-lg shadow-md">
//         <div className="flex justify-between items-center border-b pb-4 mb-4">
//           <div>
//             <h1 className="text-xl font-bold">
//               {loading ? "Loading..." : error ? "Error loading email" : `Welcome, ${userFname}`}
//             </h1>
//           </div>
//           <div className="flex items-center space-x-4">
//             <div className="relative">
//               <FaBell className="cursor-pointer text-2xl" />
//             </div>
//             <div className="relative">
//               <FaUserCircle 
//                 className="cursor-pointer text-2xl" 
//                 onClick={toggleProfileMenu}
//               />
//               {isProfileMenuOpen && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
//                   <Link href="/update-profile" legacyBehavior>
//                     <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                       Update Profile
//                     </a>
//                   </Link>
//                   <Link href="/sign-in" legacyBehavior>
//                     <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                       Logout
//                     </a>
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="w-full flex justify-end p-4">
//           <Link href="/components/Create_new_user" className="block p-4 bg-blue-500 text-white text-center rounded-lg shadow hover:bg-blue-600">
//             Create New User
//           </Link>
          
          
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import DataTable from 'react-data-table-component';

function Dashboard() {
  const [userFname, setUserFname] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch the current user details
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-email`, { withCredentials: true });
        setUserFname(response.data.name);
        setUserRole(response.data.role);

        // Fetch all users data for the table
        const usersResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, { withCredentials: true });
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError('Failed to fetch user data');
        setUserFname(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const columns = [
    {
      name: 'ID',
      selector: row => row.id,
      sortable: true,
    },
    {
      name: 'First Name',
      selector: row => row.fname,
      sortable: true,
    },
    {
      name: 'Last Name',
      selector: row => row.lname,
      sortable: true,
    },
    {
      name: 'Email ID',
      selector: row => row.emailid,
      sortable: true,
    },
    {
      name: 'Role',
      selector: row => row.role,
      sortable: true,
    },
    {
      name: '',
      cell: row => <Link href={`/user/${row.id}`} className="text-blue-500 hover:underline">Update</Link>,
    },
    {
      name: '',
      cell: row => <Link href={`/user/${row.id}`} className="text-blue-500 hover:underline">Delete User</Link>,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full min-h-screen p-4 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h1 className="text-xl font-bold">
              {loading ? "Loading..." : error ? "Error loading data" : `Welcome, ${userFname}`}
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
        <div className="w-full">
          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <DataTable
              columns={columns}
              data={users}
              pagination
              highlightOnHover
              pointerOnHover
              responsive
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
