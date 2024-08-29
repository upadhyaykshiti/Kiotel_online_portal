



// "use client";

// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { FaBell, FaUserCircle, FaArrowLeft } from "react-icons/fa";
// import axios from "axios";

// export default function Home() {
//   const router = useRouter();
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const [openedTickets, setOpenedTickets] = useState([]);
//   const [closedTickets, setClosedTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const toggleProfileMenu = () => {
//     setIsProfileMenuOpen(!isProfileMenuOpen);
//   };

//   const goBack = () => {
//     router.push("/dashboard");
//   };

//   useEffect(() => {
//     // Fetch the opened tickets
//     const fetchOpenedTickets = async () => {
//       try {
//         const response = await axios.get("http://localhost:8080/api/latest_opened_tickets", { withCredentials: true });
//         setOpenedTickets(response.data);
//       } catch (error) {
//         console.error("Error fetching opened tickets:", error);
//       }
//     };

//     fetchOpenedTickets();
//   }, []);

//   useEffect(() => {
//     const fetchClosedTickets = async () => {
//       try {
//         const response = await axios.get('http://localhost:8080/api/closed_tickets', {
//           withCredentials: true,
//         });
//         if (response.data.error) {
//           setError(response.data.error);
//         } else {
//           setClosedTickets(response.data);
//         }
//       } catch (err) {
//         console.error("Error fetching closed tickets:", err);
//         const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
//         setError(errorMessage);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchClosedTickets();
//   }, []);


//   const convertMSTtoIST = (mstDateString) => {
//     // Parse MST date string to Date object
//     const mstDate = new Date(mstDateString + ' GMT-0700');
    
//     // Convert to IST time zone
//     const istDate = new Date(mstDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

//     return istDate;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
//       <header className="bg-white shadow-lg">
//         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//           <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide">Helpdesk</h1>
//           <div className="flex items-center space-x-4">
//             <input
//               type="text"
//               placeholder="Search..."
//               className="border border-gray-300 rounded-lg px-3 py-1 transition duration-200 ease-in-out focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
//             />
//             <nav className="space-x-4">
//               <a
//                 href="../helpdesk"
//                 className="text-gray-700 hover:text-blue-800 hover:underline underline-offset-4 transition duration-200"
//               >
//                 Overview
//               </a>
//               <a
//                 href="../Helpdesk/newtickets"
//                 className="text-gray-700 hover:text-blue-800 hover:underline underline-offset-4 transition duration-200"
//               >
//                 New Ticket
//               </a>
//             </nav>
//             <button onClick={goBack} className="flex items-center text-gray-700 hover:text-gray-900 transition duration-200">
//               <FaArrowLeft className="mr-2 text-2xl" />
//             </button>

//             <FaBell className="text-gray-700 hover:text-gray-900 transition duration-200 text-2xl" />

//             <div className="relative">
//               <FaUserCircle
//                 className="text-gray-700 hover:text-gray-900 cursor-pointer transition duration-200 text-2xl"
//                 onClick={toggleProfileMenu}
//               />
//               {isProfileMenuOpen && (
//                 <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20">
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
//       </header>

//       <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col space-y-6">
     

//           {/* Opened Tickets Section */}
//           <div className="bg-white shadow-lg rounded-lg p-6 w-full">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">Opened Tickets</h2>
//             {/* <Link href="/opened-tickets">
//               <a className="text-2xl font-bold text-gray-800 mb-4 hover:underline">Opened Tickets</a>
//             </Link> */}
//             <ul>
//               {openedTickets.map((ticket) => (
//                 <li key={ticket.id} className="border-b border-gray-200 py-2">
//                   <Link
//                     href={`/Helpdesk/ticket/${ticket.id}`}
//                     className="text-blue-600 hover:underline"
//                   >
//                     {`Ticket #${ticket.id}: ${ticket.title}`}
//                   </Link>
//                   <p className="text-gray-600">
//                     {`Opened on ${convertMSTtoIST(ticket.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Closed Tickets Section */}
//           <div className="bg-white shadow-lg rounded-lg p-6 w-full">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">Closed Tickets</h2>

//             {/* <Link href="/closed-tickets">
//               <a className="text-2xl font-bold text-gray-800 mb-4 hover:underline">Closed Tickets</a>
//             </Link> */}
//             <ul>
//               {closedTickets.map((ticket) => (
//                 <li key={ticket.id} className="border-b border-gray-200 py-2">
//                   <a href={`#`} className="text-blue-600 hover:underline">
//                     Ticket #{ticket.id}: {ticket.title}
//                   </a>
//                   <p className="text-gray-600">
//                     Closed on {new Date(ticket.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }






// "use client";

// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { FaBell, FaUserCircle, FaArrowLeft } from "react-icons/fa";
// import axios from "axios";

// export default function Home() {
//   const router = useRouter();
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const [openedTickets, setOpenedTickets] = useState([]);
//   const [closedTickets, setClosedTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const toggleProfileMenu = () => {
//     setIsProfileMenuOpen(!isProfileMenuOpen);
//   };

//   const goBack = () => {
//     router.push("/dashboard");
//   };

//   useEffect(() => {
//     // Fetch the opened tickets
//     const fetchOpenedTickets = async () => {
//       try {
//         const response = await axios.get("http://localhost:8080/api/latest_opened_tickets", { withCredentials: true });
//         setOpenedTickets(response.data);
//       } catch (error) {
//         console.error("Error fetching opened tickets:", error);
//       }
//     };

//     fetchOpenedTickets();
//   }, []);

//   // useEffect(() => {
//   //   const fetchClosedTickets = async () => {
//   //     try {
//   //       const response = await axios.get('http://localhost:8080/api/tickets/latest-closed', {
//   //         withCredentials: true,
//   //       });
//   //       if (response.data.error) {
//   //         setError(response.data.error);
//   //       } else {
//   //         setClosedTickets(response.data);
//   //       }
//   //     } catch (err) {
//   //       console.error("Error fetching closed tickets:", err);
//   //       const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
//   //       setError(errorMessage);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchClosedTickets();
//   // }, []);

//   useEffect(() => {
//     const fetchClosedTickets = async () => {
//       try {
//         const response = await axios.get("http://localhost:8080/api/tickets/latest-closed", {
//           withCredentials: true,
//         });
//         setClosedTickets(response.data);
//       } catch (err) {
//         console.error("Error fetching closed tickets:", err);
//       }
//     };

//     fetchClosedTickets();
//   }, []);


//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
//       <header className="bg-white shadow-lg">
//         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//           <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide">Helpdesk</h1>
//           <div className="flex items-center space-x-4">
//             <input
//               type="text"
//               placeholder="Search..."
//               className="border border-gray-300 rounded-lg px-3 py-1 transition duration-200 ease-in-out focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
//             />
//             <nav className="space-x-4">
//               <a
//                 href="../helpdesk"
//                 className="text-gray-700 hover:text-blue-800 hover:underline underline-offset-4 transition duration-200"
//               >
//                 Overview
//               </a>
//               <a
//                 href="../Helpdesk/newtickets"
//                 className="text-gray-700 hover:text-blue-800 hover:underline underline-offset-4 transition duration-200"
//               >
//                 New Ticket
//               </a>
//             </nav>
//             <button onClick={goBack} className="flex items-center text-gray-700 hover:text-gray-900 transition duration-200">
//               <FaArrowLeft className="mr-2 text-2xl" />
//             </button>

//             <FaBell className="text-gray-700 hover:text-gray-900 transition duration-200 text-2xl" />

//             <div className="relative">
//               <FaUserCircle
//                 className="text-gray-700 hover:text-gray-900 cursor-pointer transition duration-200 text-2xl"
//                 onClick={toggleProfileMenu}
//               />
//               {isProfileMenuOpen && (
//                 <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20">
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
//       </header>

//       <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col space-y-6">
//           {/* Opened Tickets Section */}
//           <div className="bg-white shadow-lg rounded-lg p-6 w-full">
//             <Link href="/Helpdesk/openTicket" legacyBehavior>
//               <a className="text-2xl font-bold text-gray-800 mb-4 block hover:underline">
//                 Opened Tickets
//               </a>
//             </Link>
//             <ul>
//               {openedTickets.map((ticket) => (
//                 <li key={ticket.id} className="border-b border-gray-200 py-2">
//                   <Link
//                     href={`/Helpdesk/ticket/${ticket.id}`}
//                     legacyBehavior
//                   >
//                     <a className="text-blue-600 hover:underline">
//                       {`Ticket #${ticket.id}: ${ticket.title}`}
//                     </a>
//                   </Link>
//                   <p className="text-gray-600">
//                     {`Opened on ${new Date(ticket.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Closed Tickets Section */}
//           <div className="bg-white shadow-lg rounded-lg p-6 w-full">
//       <Link href="/Helpdesk/closedtickets" legacyBehavior>
//         <a className="text-2xl font-bold text-gray-800 mb-4 block hover:underline">
//           Closed Tickets
//         </a>
//       </Link>
//       <ul>
//         {closedTickets.map((ticket) => (
//           <li key={ticket.id} className="border-b border-gray-200 py-2">
//             <Link href={`/Helpdesk/ticket/${ticket.id}`} legacyBehavior>
//               <a className="text-blue-600 hover:underline">
//                 {`Ticket #${ticket.id}: ${ticket.title}`}
//               </a>
//             </Link>
//             <p className="text-gray-600">
//               {`Closed on ${new Date(ticket.closed_date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}`}
//             </p>
//           </li>
//         ))}
//       </ul>
//     </div>
  

//         </div>
//       </main>
//     </div>
//   );
// }


// "use client";

// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { FaBell, FaUserCircle, FaArrowLeft } from "react-icons/fa";
// import axios from "axios";
// import { DateTime } from "luxon"; // Import Luxon for handling timezones

// export default function Home() {
//   const router = useRouter();
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const [openedTickets, setOpenedTickets] = useState([]);
//   const [closedTickets, setClosedTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const toggleProfileMenu = () => {
//     setIsProfileMenuOpen(!isProfileMenuOpen);
//   };

//   const goBack = () => {
//     router.push("/dashboard");
//   };

//   useEffect(() => {
//     // Fetch the opened tickets
//     const fetchOpenedTickets = async () => {
//       try {
//         const response = await axios.get("http://localhost:8080/api/latest_opened_tickets", { withCredentials: true });
//         setOpenedTickets(response.data);
//       } catch (error) {
//         console.error("Error fetching opened tickets:", error);
//       }
//     };

//     fetchOpenedTickets();
//   }, []);

//   useEffect(() => {
//     const fetchClosedTickets = async () => {
//       try {
//         const response = await axios.get('http://localhost:8080/api/latestclosed', {
//           withCredentials: true,
//         });
//         if (response.data.error) {
//           setError(response.data.error);
//         } else {
//           setClosedTickets(response.data);
//         }
//       } catch (err) {
//         console.error("Error fetching closed tickets:", err);
//         const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
//         setError(errorMessage);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchClosedTickets();
//   }, []);

//   // Function to convert MST time to CST using Luxon
//   const convertToCST = (mstDateTime) => {
//     return DateTime.fromISO(mstDateTime, { zone: 'America/Denver' }) // Assuming MST is equivalent to 'America/Denver'
//       .setZone('America/Chicago') // Convert to CST
//       .toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY); // Format the date and time
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
//       <header className="bg-white shadow-lg">
//         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//           <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide">Helpdesk</h1>
//           <div className="flex items-center space-x-4">
//             <input
//               type="text"
//               placeholder="Search..."
//               className="border border-gray-300 rounded-lg px-3 py-1 transition duration-200 ease-in-out focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
//             />
//             <nav className="space-x-4">
//               <a
//                 href="../helpdesk"
//                 className="text-gray-700 hover:text-blue-800 hover:underline underline-offset-4 transition duration-200"
//               >
//                 Overview
//               </a>
//               <a
//                 href="../Helpdesk/newtickets"
//                 className="text-gray-700 hover:text-blue-800 hover:underline underline-offset-4 transition duration-200"
//               >
//                 New Ticket
//               </a>
//             </nav>
//             <button onClick={goBack} className="flex items-center text-gray-700 hover:text-gray-900 transition duration-200">
//               <FaArrowLeft className="mr-2 text-2xl" />
//             </button>

//             <FaBell className="text-gray-700 hover:text-gray-900 transition duration-200 text-2xl" />

//             <div className="relative">
//               <FaUserCircle
//                 className="text-gray-700 hover:text-gray-900 cursor-pointer transition duration-200 text-2xl"
//                 onClick={toggleProfileMenu}
//               />
//               {isProfileMenuOpen && (
//                 <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20">
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
//       </header>

//       <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col space-y-6">
//           {/* Opened Tickets Section */}
//           <div className="bg-white shadow-lg rounded-lg p-6 w-full">
//             <Link href="/Helpdesk/openTicket" legacyBehavior>
//               <a className="text-2xl font-bold text-gray-800 mb-4 block hover:underline">
//                 Opened Tickets
//               </a>
//             </Link>
//             <ul>
//               {openedTickets.map((ticket) => (
//                 <li key={ticket.id} className="border-b border-gray-200 py-2">
//                   <Link
//                     href={`/Helpdesk/ticket/${ticket.id}`}
//                     legacyBehavior
//                   >
//                     <a className="text-blue-600 hover:underline">
//                       {`Ticket #${ticket.id}: ${ticket.title}`}
//                     </a>
//                   </Link>
//                   <p className="text-gray-600">
//                     {`Opened on ${convertToCST(ticket.created_at)}`}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Closed Tickets Section */}
//           <div className="bg-white shadow-lg rounded-lg p-6 w-full">
//             <Link href="/Helpdesk/closedTicket" legacyBehavior>
//               <a className="text-2xl font-bold text-gray-800 mb-4 block hover:underline">
//                 Closed Tickets
//               </a>
//             </Link>
//             <ul>
//               {closedTickets.map((ticket) => (
//                 <li key={ticket.id} className="border-b border-gray-200 py-2">
//                   <Link
//                     href="#"
//                     legacyBehavior
//                   >
//                     <a className="text-blue-600 hover:underline">
//                       {`Ticket #${ticket.id}: ${ticket.title}`}
//                     </a>
//                   </Link>
//                   <p className="text-gray-600">
//                     Closed on {convertToCST(ticket.created_at)}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }





// "use client";

// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { FaBell, FaUserCircle, FaArrowLeft } from "react-icons/fa";
// import axios from "axios";

// export default function Home() {
//   const router = useRouter();
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const [openedTickets, setOpenedTickets] = useState([]);
//   const [closedTickets, setClosedTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const toggleProfileMenu = () => {
//     setIsProfileMenuOpen(!isProfileMenuOpen);
//   };

//   const goBack = () => {
//     router.push("/dashboard");
//   };

//   useEffect(() => {
//     // Fetch the opened tickets
//     const fetchOpenedTickets = async () => {
//       try {
//         const response = await axios.get(
//           "http://localhost:8080/api/latest_opened_tickets",
//           { withCredentials: true }
//         );
//         setOpenedTickets(response.data);
//       } catch (error) {
//         console.error("Error fetching opened tickets:", error);
//       }
//     };

//     fetchOpenedTickets();
//   }, []);

//   useEffect(() => {
//     const fetchClosedTickets = async () => {
//       try {
//         const response = await axios.get(
//           "http://localhost:8080/api/latestclosed",
//           {
//             withCredentials: true,
//           }
//         );
//         if (response.data.error) {
//           setError(response.data.error);
//         } else {
//           setClosedTickets(response.data);
//         }
//       } catch (err) {
//         console.error("Error fetching closed tickets:", err);
//         const errorMessage =
//           err.response?.data?.message || err.message || "An error occurred";
//         setError(errorMessage);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchClosedTickets();
//   }, []);

//   // Function to convert MST to CST
//   const convertMSTtoCST = (mstTime) => {
//     const mstDate = new Date(mstTime + " MST");
//     return mstDate.toLocaleString("en-US", { timeZone: "America/Chicago" });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
//       <header className="bg-white shadow-lg">
//         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//           <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide">
//             Helpdesk
//           </h1>
//           <div className="flex items-center space-x-4">
//             <input
//               type="text"
//               placeholder="Search..."
//               className="border border-gray-300 rounded-lg px-3 py-1 transition duration-200 ease-in-out focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
//             />
//             <nav className="space-x-4">
//               <a
//                 href="../helpdesk"
//                 className="text-gray-700 hover:text-blue-800 hover:underline underline-offset-4 transition duration-200"
//               >
//                 Overview
//               </a>
//               <a
//                 href="../Helpdesk/newtickets"
//                 className="text-gray-700 hover:text-blue-800 hover:underline underline-offset-4 transition duration-200"
//               >
//                 New Ticket
//               </a>
//             </nav>
//             <button
//               onClick={goBack}
//               className="flex items-center text-gray-700 hover:text-gray-900 transition duration-200"
//             >
//               <FaArrowLeft className="mr-2 text-2xl" />
//             </button>

//             <FaBell className="text-gray-700 hover:text-gray-900 transition duration-200 text-2xl" />

//             <div className="relative">
//               <FaUserCircle
//                 className="text-gray-700 hover:text-gray-900 cursor-pointer transition duration-200 text-2xl"
//                 onClick={toggleProfileMenu}
//               />
//               {isProfileMenuOpen && (
//                 <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20">
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
//       </header>

//       <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col space-y-6">
//           {/* Opened Tickets Section */}
//           <div className="bg-white shadow-lg rounded-lg p-6 w-full">
//             <Link href="/Helpdesk/openTicket" legacyBehavior>
//               <a className="text-2xl font-bold text-gray-800 mb-4 block hover:underline">
//                 Opened Tickets
//               </a>
//             </Link>
//             <ul>
//               {openedTickets.map((ticket) => (
//                 <li key={ticket.id} className="border-b border-gray-200 py-2">
//                   <Link href={`/Helpdesk/ticket/${ticket.id}`} legacyBehavior>
//                     <a className="text-blue-600 hover:underline">
//                       {`Ticket #${ticket.id}: ${ticket.title}`}
//                     </a>
//                   </Link>
//                   <p className="text-gray-600">
//                     {`Opened on ${convertMSTtoCST(ticket.created_at)}`}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Closed Tickets Section */}
//           <div className="bg-white shadow-lg rounded-lg p-6 w-full">
//             <Link href="/Helpdesk/closedTicket" legacyBehavior>
//               <a className="text-2xl font-bold text-gray-800 mb-4 block hover:underline">
//                 Closed Tickets
//               </a>
//             </Link>
//             <ul>
//               {closedTickets.map((ticket) => (
//                 <li key={ticket.id} className="border-b border-gray-200 py-2">
//                   <Link href="#" legacyBehavior>
//                     <a className="text-blue-600 hover:underline">
//                       {`Ticket #${ticket.id}: ${ticket.title}`}
//                     </a>
//                   </Link>
//                   <p className="text-gray-600">
//                     {`Closed on ${convertMSTtoCST(ticket.closed_at)}`}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaBell, FaUserCircle, FaArrowLeft } from "react-icons/fa";
import axios from "axios";

export default function Home() {
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [openedTickets, setOpenedTickets] = useState([]);
  const [closedTickets, setClosedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const goBack = () => {
    router.push("/dashboard");
  };

  useEffect(() => {
    const fetchOpenedTickets = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/latest_opened_tickets`,
          { withCredentials: true }
        );
        setOpenedTickets(response.data);
      } catch (error) {
        console.error("Error fetching opened tickets:", error);
      }
    };

    fetchOpenedTickets();
  }, []);

  useEffect(() => {
    const fetchClosedTickets = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/latestclosed`,
          {
            withCredentials: true,
          }
        );
        if (response.data.error) {
          setError(response.data.error);
        } else {
          setClosedTickets(response.data);
        }
      } catch (err) {
        console.error("Error fetching closed tickets:", err);
        const errorMessage =
          err.response?.data?.message || err.message || "An error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchClosedTickets();
  }, []);

  // Function to convert MST to CST
  const convertMSTtoCST = (mstTime) => {
    const mstDate = new Date(mstTime + " MST");
    return mstDate.toLocaleString("en-US", { timeZone: "America/Chicago" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:justify-between items-center">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-wide">
            Helpdesk
          </h1>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto mt-4 sm:mt-0">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-lg px-3 py-1 w-full sm:w-auto transition duration-200 ease-in-out focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <nav className="flex space-x-4 mt-2 sm:mt-0">
              <a
                href="../helpdesk"
                className="text-gray-700 hover:text-blue-800 hover:underline underline-offset-4 transition duration-200"
              >
                Overview
              </a>
              <a
                href="../Helpdesk/newtickets"
                className="text-gray-700 hover:text-blue-800 hover:underline underline-offset-4 transition duration-200"
              >
                New Ticket
              </a>
            </nav>
            <div className="flex space-x-4 items-center">
              <button
                onClick={goBack}
                className="text-gray-700 hover:text-gray-900 transition duration-200"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <FaBell className="text-gray-700 hover:text-gray-900 transition duration-200 text-xl" />
              <div className="relative">
                <FaUserCircle
                  className="text-gray-700 hover:text-gray-900 cursor-pointer transition duration-200 text-xl"
                  onClick={toggleProfileMenu}
                />
                {isProfileMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20">
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Opened Tickets Section */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <Link href="/Helpdesk/openTicket" legacyBehavior>
              <a className="text-xl font-bold text-gray-800 mb-4 block hover:underline">
                Opened Tickets
              </a>
            </Link>
            <ul className="space-y-4">
              {openedTickets.map((ticket) => (
                <li key={ticket.id} className="border-b border-gray-200 py-2">
                  <Link href={`/Helpdesk/ticket/${ticket.id}`} legacyBehavior>
                    <a className="text-blue-600 hover:underline">
                      {`Ticket #${ticket.id}: ${ticket.title}`}
                    </a>
                  </Link>
                  <p className="text-gray-600">
                    {`Opened on ${convertMSTtoCST(ticket.created_at)}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Closed Tickets Section */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <Link href="/Helpdesk/closedTicket" legacyBehavior>
              <a className="text-xl font-bold text-gray-800 mb-4 block hover:underline">
                Closed Tickets
              </a>
            </Link>
            <ul className="space-y-4">
              {closedTickets.map((ticket) => (
                <li key={ticket.id} className="border-b border-gray-200 py-2">
                  <Link href="#" legacyBehavior>
                    <a className="text-blue-600 hover:underline">
                      {`Ticket #${ticket.id}: ${ticket.title}`}
                    </a>
                  </Link>
                  <p className="text-gray-600">
                    {`Closed on ${convertMSTtoCST(ticket.closed_at)}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
