
"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaBell, FaUserCircle, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import ProtectedRoute from '../../context/ProtectedRoute'; // Import your ProtectedRoute
import { RollerShadesClosed } from "@mui/icons-material";

export default function Home() {
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [openedTickets, setOpenedTickets] = useState([]);
  const [createdTickets, setCreatedTickets] = useState([]);
  const [closedTickets, setClosedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null); // State to store user role

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const goBack = () => {
    router.push("/Dashboard");
  };

  // Fetch the user's role from the session
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        console.log(response.data.role)
        setUserRole(response.data.role); // Set user role
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

  // Fetch My tickets (Assigned to me)
  useEffect(() => {
    const fetchOpenedTickets = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/my-task`,
          { withCredentials: true }
        );
        setOpenedTickets(response.data);
      } catch (error) {
        console.error("Error fetching opened tickets:", error);
      }
    };
    fetchOpenedTickets();
  }, []);

  // Fetch tickets created by me and separate into opened and closed
  useEffect(() => {
    const fetchCreatedTickets = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/created-task`,
          { withCredentials: true }
        );
        const allTickets = response.data;

        // Separate tickets into opened and closed
        const openTickets = allTickets.filter(
          (ticket) => ticket.taskstatus_id === 1 || ticket.taskstatus_id === 2
        );
        const closedTickets = allTickets.filter(
          (ticket) => ticket.taskstatus_id === 3
        );

        setCreatedTickets(openTickets);
        setClosedTickets(closedTickets);
      } catch (error) {
        console.error("Error fetching created tickets:", error);
      }
    };
    fetchCreatedTickets();
  }, []);

  const handleLogout = async () => {
    try {
      // Send logout API request
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logout`,
        {},
        { withCredentials: true }
      );
      // Clear session data and redirect to sign-in page
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Function to convert MST to CST (IST in your case)
  const convertMSTtoCST = (mstTime) => {
    const mstDate = new Date(mstTime + " UTC");
    return mstDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  // Function to handle redirect based on user role
  const handleRedirect = (link) => {
    if (userRole === 1 || userRole === "my-kiotel@kiotel.co") {
      router.push(link);
    } else {
      alert("You do not have permission to access this page.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:justify-between items-center">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-wide">
            Task Manager
          </h1>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto mt-4 sm:mt-0">
            <nav className="flex space-x-4 mt-2 sm:mt-0">
              <a
                href="../TaskManager/newTask"
                className="text-gray-700 hover:text-blue-800 hover:underline underline-offset-4 transition duration-200"
              >
                New Task
              </a>
            </nav>
            <div className="flex space-x-4 items-center">
              <button
                onClick={goBack}
                className="text-gray-700 hover:text-gray-900 transition duration-200"
                aria-label="Go back"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              
              {/* Conditionally render All Tasks button only if role is 1 */}
              {userRole === 1 && (
                <button
                  onClick={() => handleRedirect("/TaskManager/openTasks")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none"
                >
                  All Tasks
                </button>
              )}
              <div className="relative">
                <FaUserCircle
                  className="text-gray-700 hover:text-gray-900 cursor-pointer transition duration-200 text-xl"
                  onClick={toggleProfileMenu}
                />
                {isProfileMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20">
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Tasks Assigned to Me */}
          {userRole !== 4 && (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-900">
                Tasks Assigned to Me
              </h2>
              <div className="bg-white shadow-lg rounded-lg p-6">
                <ul className="space-y-4">
                  {openedTickets.length > 0 ? (
                    openedTickets.map((ticket) => (
                      <li
                        key={ticket.id}
                        className="border-b border-gray-200 py-2 hover:bg-gray-50 transition duration-200 rounded-lg"
                      >
                        <Link href={`/TaskManager/task/${ticket.id}`} legacyBehavior>
                          <a className="text-blue-600 hover:underline font-semibold">
                            {`Task #${ticket.id}: ${ticket.title}`}
                          </a>
                        </Link>
                        <p className="text-gray-600">
                          {`Opened on ${convertMSTtoCST(ticket.created_at)} IST`}
                        </p>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No tasks assigned to you.</p>
                  )}
                </ul>
              </div>
            </>
          )}

          {/* Tasks Created by Me */}
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Tasks Created by Me
          </h2>

          {/* Opened Tasks Created by Me */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold text-center text-blue-600 mb-4">
              Opened Tasks
            </h3>
            <ul className="space-y-4">
              {createdTickets.length > 0 ? (
                createdTickets.map((ticket) => (
                  <li
                    key={ticket.id}
                    className="border-b border-gray-200 py-2 hover:bg-gray-50 transition duration-200 rounded-lg"
                  >
                    <Link href={`/TaskManager/task/${ticket.id}`} legacyBehavior>
                      <a className="text-blue-600 hover:underline font-semibold">
                        {`Task #${ticket.id}: ${ticket.title}`}
                      </a>
                    </Link>
                    <p className="text-gray-600">
                      {`Created on ${convertMSTtoCST(ticket.created_at)} IST`}
                    </p>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-500">No opened tasks created by you.</p>
              )}
            </ul>
          </div>

          {/* Closed Tasks Created by Me */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold text-center text-green-600 mb-4">
              Completed Tasks
            </h3>
            <ul className="space-y-4">
              {closedTickets.length > 0 ? (
                closedTickets.map((ticket) => (
                  <li
                    key={ticket.id}
                    className="border-b border-gray-200 py-2 hover:bg-gray-50 transition duration-200 rounded-lg"
                  >
                    <Link href={`/TaskManager/task/${ticket.id}`} legacyBehavior>
                      <a className="text-green-600 hover:underline font-semibold">
                        {`Task #${ticket.id}: ${ticket.title}`}
                      </a>
                    </Link>
                    <p className="text-gray-600">
                      {/* {`Closed on ${convertMSTtoCST(ticket.closed_at)} IST`} */}
                    </p>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-500">No closed tasks created by you.</p>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}



// // app/Dashboard/page.jsx
// "use client";
// import { useRouter } from "next/navigation";
// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { FaBell, FaUserCircle, FaArrowLeft, FaTasks, FaUsers, FaChartBar, FaCog } from "react-icons/fa";
// import axios from "axios";
// import ProtectedRoute from '../../context/ProtectedRoute';

// export default function Home() {
//   const router = useRouter();
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const [openedTickets, setOpenedTickets] = useState([]);
//   const [userFname, setUserFname] = useState('');
//   const [userRole, setUserRole] = useState('');
//   const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0 }); // Example stats
//   const profileMenuRef = useRef(null);

//   // Close profile menu on outside click
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
//         setIsProfileMenuOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Fetch user data and tickets
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch user details
//         const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, { withCredentials: true });
//         setUserFname(userResponse.data.fname);
//         setUserRole(userResponse.data.role);

//         // Fetch opened tickets count (you might need to adjust the endpoint)
//         const ticketsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/opened_tasks`, { withCredentials: true });
//         setOpenedTickets(ticketsResponse.data || []);

//         // Example: Calculate stats (replace with actual API calls if needed)
//         const allTickets = ticketsResponse.data || [];
//         const openCount = allTickets.filter(t => t.status_name === "Open").length;
//         const inProgressCount = allTickets.filter(t => t.status_name === "In Progress").length;
//         setStats({
//           total: allTickets.length,
//           open: openCount,
//           inProgress: inProgressCount
//         });

//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logout`, {}, { withCredentials: true });
//       router.push("/sign-in");
//     } catch (error) {
//       console.error("Logout failed", error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* Header/Navbar */}
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16 items-center">
//             <div className="flex items-center">
//               {/* Logo - Replace with your actual logo */}
//               <div
//                 className="flex-shrink-0 flex items-center cursor-pointer"
//                 onClick={() => router.push('/Dashboard')}
//               >
//                 <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
//                   <span className="text-white font-bold text-lg">K</span>
//                 </div>
//                 <span className="ml-3 text-xl font-bold text-gray-900 hidden sm:block">Kiotel</span>
//               </div>
//               <nav className="ml-6 flex space-x-4">
//                 <Link href="/TaskManager" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 flex items-center">
//                   <FaTasks className="mr-2" />
//                   <span>Tasks</span>
//                 </Link>
//                 {(userRole === 'Admin' || userRole === 'HRManager') && (
//                   <Link href="/components/Admin" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 flex items-center">
//                     <FaUsers className="mr-2" />
//                     <span>Users</span>
//                   </Link>
//                 )}
//                 {/* Add more navigation links as needed */}
//               </nav>
//             </div>
//             <div className="flex items-center space-x-4">
//               <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
//                 <span className="sr-only">View notifications</span>
//                 <FaBell className="h-6 w-6" />
//               </button>

//               {/* Profile dropdown */}
//               <div className="relative" ref={profileMenuRef}>
//                 <div>
//                   <button
//                     onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
//                     className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                     id="user-menu-button"
//                     aria-expanded="false"
//                     aria-haspopup="true"
//                   >
//                     <span className="sr-only">Open user menu</span>
//                     <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
//                       {userFname.charAt(0)}
//                     </div>
//                     {/* <FaUserCircle className="h-8 w-8 rounded-full text-gray-400" /> */}
//                   </button>
//                 </div>

//                 {isProfileMenuOpen && (
//                   <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition transform duration-100 ease-out"
//                     role="menu"
//                     aria-orientation="vertical"
//                     aria-labelledby="user-menu-button"
//                     tabIndex="-1"
//                   >
//                     <div className="px-4 py-2 border-b border-gray-200">
//                       <p className="text-sm font-medium text-gray-900 truncate">{userFname}</p>
//                       <p className="text-xs text-gray-500">{userRole}</p>
//                     </div>
//                     {/* <Link href="/components/updateProfile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabIndex="-1" id="user-menu-item-0">Your Profile</Link> */}
//                     <button
//                       onClick={handleLogout}
//                       className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
//                       role="menuitem"
//                       tabIndex="-1"
//                       id="user-menu-item-2"
//                     >
//                       <FaArrowLeft className="mr-2 text-gray-500" />
//                       Sign out
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="py-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           {/* Welcome Banner */}
//           <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//               <div>
//                 <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {userFname}!</h1>
//                 <p className="mt-1 max-w-2xl text-blue-100 md:mt-2">
//                   Here's what's happening with your tasks today.
//                 </p>
//               </div>
//               <div className="mt-4 flex md:mt-0 md:ml-4">
//                 <Link
//                   href="/TaskManager"
//                   className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-0.5"
//                 >
//                   <FaTasks className="mr-2 -ml-1 h-5 w-5" />
//                   View All Tasks
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* Stats Section */}
//           <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
//             {/* Total Tasks Card */}
//             <div className="bg-white overflow-hidden shadow rounded-2xl transition-all duration-300 hover:shadow-lg">
//               <div className="p-5">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
//                     <FaTasks className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <div className="ml-5 w-0 flex-1">
//                     <dl>
//                       <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
//                       <dd className="flex items-baseline">
//                         <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
//                       </dd>
//                     </dl>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 px-5 py-3">
//                 <div className="text-sm">
//                   <Link href="/TaskManager/Tasks" className="font-medium text-blue-600 hover:text-blue-500 flex items-center">
//                     View all
//                     <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
//                     </svg>
//                   </Link>
//                 </div>
//               </div>
//             </div>

//             {/* Open Tasks Card */}
//             <div className="bg-white overflow-hidden shadow rounded-2xl transition-all duration-300 hover:shadow-lg">
//               <div className="p-5">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
//                     <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                     </svg>
//                   </div>
//                   <div className="ml-5 w-0 flex-1">
//                     <dl>
//                       <dt className="text-sm font-medium text-gray-500 truncate">Open Tasks</dt>
//                       <dd className="flex items-baseline">
//                         <div className="text-2xl font-semibold text-gray-900">{stats.open}</div>
//                         {/* <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
//                           <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                             <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
//                           </svg>
//                           <span className="sr-only">Increased by</span>12.5%
//                         </div> */}
//                       </dd>
//                     </dl>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 px-5 py-3">
//                 <div className="text-sm">
//                   <Link href="/TaskManager?status=open" className="font-medium text-yellow-600 hover:text-yellow-500 flex items-center">
//                     View open tasks
//                     <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
//                     </svg>
//                   </Link>
//                 </div>
//               </div>
//             </div>

//             {/* In Progress Tasks Card */}
//             <div className="bg-white overflow-hidden shadow rounded-2xl transition-all duration-300 hover:shadow-lg">
//               <div className="p-5">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
//                     <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
//                     </svg>
//                   </div>
//                   <div className="ml-5 w-0 flex-1">
//                     <dl>
//                       <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
//                       <dd className="flex items-baseline">
//                         <div className="text-2xl font-semibold text-gray-900">{stats.inProgress}</div>
//                       </dd>
//                     </dl>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 px-5 py-3">
//                 <div className="text-sm">
//                   <Link href="/TaskManager?status=in_progress" className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
//                     View in progress
//                     <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
//                     </svg>
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Recent Activity / Quick Links Section */}
//           <div className="bg-white shadow rounded-2xl overflow-hidden">
//             <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
//               <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
//               <p className="mt-1 max-w-2xl text-sm text-gray-500">Get started quickly with common actions.</p>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-0.5 bg-gray-200 divide-y divide-gray-200 sm:divide-y-0 sm:divide-x">
//               <Link href="/TaskManager" className="p-6 bg-white hover:bg-gray-50 transition-colors duration-200 flex flex-col items-center justify-center text-center group">
//                 <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors duration-200">
//                   <FaTasks className="h-6 w-6 text-blue-600 group-hover:text-blue-700" />
//                 </div>
//                 <span className="mt-3 text-sm font-medium text-gray-900 group-hover:text-blue-600">My Tasks</span>
//               </Link>
//               {(userRole === 'Admin' || userRole === 'HRManager') && (
//                 <>
//                   <Link href="/components/Admin" className="p-6 bg-white hover:bg-gray-50 transition-colors duration-200 flex flex-col items-center justify-center text-center group">
//                     <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors duration-200">
//                       <FaUsers className="h-6 w-6 text-green-600 group-hover:text-green-700" />
//                     </div>
//                     <span className="mt-3 text-sm font-medium text-gray-900 group-hover:text-green-600">Manage Users</span>
//                   </Link>
//                   <Link href="/reports" className="p-6 bg-white hover:bg-gray-50 transition-colors duration-200 flex flex-col items-center justify-center text-center group">
//                     <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors duration-200">
//                       <FaChartBar className="h-6 w-6 text-purple-600 group-hover:text-purple-700" />
//                     </div>
//                     <span className="mt-3 text-sm font-medium text-gray-900 group-hover:text-purple-600">Reports</span>
//                   </Link>
//                 </>
//               )}
//               <Link href="/settings" className="p-6 bg-white hover:bg-gray-50 transition-colors duration-200 flex flex-col items-center justify-center text-center group">
//                 <div className="bg-gray-100 p-3 rounded-full group-hover:bg-gray-200 transition-colors duration-200">
//                   <FaCog className="h-6 w-6 text-gray-600 group-hover:text-gray-700" />
//                 </div>
//                 <span className="mt-3 text-sm font-medium text-gray-900 group-hover:text-gray-600">Settings</span>
//               </Link>
//             </div>
//           </div>

//           {/* Recent Tickets Section (Optional - can be expanded) */}
//           {/* <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
//             <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
//               <h3 className="text-lg leading-6 font-medium text-gray-900">Recently Opened Tasks</h3>
//             </div>
//             <ul className="divide-y divide-gray-200">
//               {openedTickets.slice(0, 5).map((ticket) => (
//                 <li key={ticket.task_id}>
//                   <Link href={`/TaskManager/task/${ticket.task_id}`} className="block hover:bg-gray-50">
//                     <div className="px-4 py-4 sm:px-6">
//                       <div className="flex items-center justify-between">
//                         <p className="text-sm font-medium text-indigo-600 truncate">{ticket.title}</p>
//                         <div className="ml-2 flex-shrink-0 flex">
//                           <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                             {ticket.status_name}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="mt-2 sm:flex sm:justify-between">
//                         <div className="sm:flex">
//                           <p className="flex items-center text-sm text-gray-500">
//                             {ticket.creator.fname} {ticket.creator.lname}
//                           </p>
//                         </div>
//                         <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
//                           <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                             <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
//                           </svg>
//                           <p>
//                             Created on <time dateTime={ticket.created_at}>{new Date(ticket.created_at).toLocaleDateString()}</time>
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </Link>
//                 </li>
//               ))}
//               {openedTickets.length === 0 && (
//                 <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
//                   No recent tasks found.
//                 </li>
//               )}
//             </ul>
//           </div> */}
//         </div>
//       </main>
//     </div>
//   );
// }

// // Wrap with ProtectedRoute if needed, or handle it in your layout
// // export default function HomeWrapper() {
// //   return (
// //     <ProtectedRoute>
// //       <Home />
// //     </ProtectedRoute>
// //   );
// // }
// // If ProtectedRoute is handled at the layout level, you can export Home directly.
// // Assuming it's handled, we export Home directly.