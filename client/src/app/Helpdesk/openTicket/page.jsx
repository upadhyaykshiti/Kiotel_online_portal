


// "use client";

// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import axios from "axios";
// import { Toaster, toast } from "sonner";
// import ProtectedRoute from "../../../context/ProtectedRoute";
// import {
//   FaTicketAlt,
//   FaUser,
//   FaCalendarAlt,
//   FaExternalLinkAlt,
//   FaUserTag,
//   FaTrash,
//   FaPlus,
//   FaFilter,
//   FaSearch,
//   FaTag,
//   FaTasks,
//   FaExclamationCircle,
//   FaChevronDown,
//   FaChevronUp,
//   FaBell,
//   FaCog,
//   FaSignOutAlt
// } from "react-icons/fa";

// const OpenedTickets = () => {
//   const router = useRouter();
//   const [openedTickets, setOpenedTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [users, setUsers] = useState([]);
//   const [assignedUsers, setAssignedUsers] = useState({});
//   const [userRole, setUserRole] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [expandedTicket, setExpandedTicket] = useState(null);
//   const [isFilterOpen, setIsFilterOpen] = useState(false);

//   useEffect(() => {
//     const fetchUserRole = async () => {
//       try {
//         const { data } = await axios.get(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
//           { withCredentials: true }
//         );
//         setUserRole(data.role);
//       } catch (error) {
//         console.error("Failed to fetch user role:", error);
//         setUserRole(null);
//       } finally {
//         // Don't set loading to false here to keep it true until tasks are loaded
//       }
//     };
//     fetchUserRole();
//   }, []);

//   useEffect(() => {
//     const fetchOpenedTickets = async () => {
//       setLoading(true);
//       try {
//         const { data } = await axios.get(
//           `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/opened_tickets`,
//           { withCredentials: true }
//         );
//         setOpenedTickets(data);

//         const assignedUserPromises = data.map(ticket =>
//           axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get_assigned_user/${ticket.id}`)
//         );
//         const assignedUserResponses = await Promise.all(assignedUserPromises);

//         const mapped = assignedUserResponses.reduce((acc, res, i) => {
//           acc[data[i].id] = res.data;
//           return acc;
//         }, {});
//         setAssignedUsers(mapped);
//       } catch (error) {
//         console.error("Error fetching opened tickets:", error);
//         toast.error("Failed to load tickets.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOpenedTickets();
//   }, []);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`);
//         setUsers(data.filter(user => user.role !== "Client"));
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };
//     fetchUsers();
//   }, []);

//   const handleAssignTicket = async (ticketId, userId) => {
//     try {
//       await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assign_ticket`, {
//         ticket_id: ticketId,
//         user_id: userId,
//       });
//       setAssignedUsers(prev => ({ ...prev, [ticketId]: { user_id: userId } }));
//       toast.success("Ticket assigned successfully!");
//     } catch (error) {
//       toast.error("Error assigning ticket.");
//       console.error("Error assigning ticket:", error);
//     }
//   };

//   const handleDeleteTicket = async (ticketId) => {
//     try {
//       await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/delete-ticket`, {
//         ticket_id: ticketId,
//       });
//       setOpenedTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
//       // Also remove from assignedUsers state if needed
//       const updatedAssignedUsers = { ...assignedUsers };
//       delete updatedAssignedUsers[ticketId];
//       setAssignedUsers(updatedAssignedUsers);
//       toast.success("Ticket deleted successfully!");
//     } catch (error) {
//       toast.error("Error deleting ticket.");
//       console.error("Error deleting ticket:", error);
//     }
//   };

//   // Filter tickets based on search term
//   const filteredTickets = openedTickets.filter(ticket => {
//     const matchesSearch = 
//       ticket.id.toString().includes(searchTerm) ||
//       (ticket.title && ticket.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (ticket.creator && 
//         (`${ticket.creator.fname} ${ticket.creator.lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
//          ticket.creator.role.toLowerCase().includes(searchTerm.toLowerCase()))
//       ) ||
//       (ticket.task_tags && ticket.task_tags.toLowerCase().includes(searchTerm.toLowerCase()));

//     // Add status filtering logic if needed
//     // const matchesStatus = filterStatus === "all" || ticket.status_name === filterStatus;

//     return matchesSearch; // && matchesStatus;
//   });

//   const toggleTicketExpansion = (ticketId) => {
//     setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-xl font-semibold text-gray-700">Loading tickets...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
//       <Toaster position="top-right" richColors />

//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//                 <FaTicketAlt className="text-blue-600" />
//                 Opened Tickets
//               </h1>
//               <p className="text-gray-600 mt-2">Manage and track all open support tickets</p>
//             </div>

//             <div className="flex items-center gap-4">
//               <Link
//                 href="/Helpdesk/newTask"
//                 className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
//               >
//                 <FaPlus />
//                 <span>New Ticket</span>
//               </Link>

//               <div className="relative group">
//                 <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300">
//                   <span className="text-white font-bold text-lg">K</span>
//                 </div>
//                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
//                   <button 
//                     onClick={() => router.push('/Dashboard')}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
//                   >
//                     <FaCog className="text-gray-500" />
//                     Dashboard
//                   </button>
//                   <button 
//                     onClick={() => router.push('/Helpdesk/profile')}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
//                   >
//                     <FaUser className="text-gray-500" />
//                     Profile
//                   </button>
//                   <button 
//                     onClick={() => {
//                       axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logout`, {}, { withCredentials: true });
//                       router.push('/sign-in');
//                     }}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
//                   >
//                     <FaSignOutAlt className="text-gray-500" />
//                     Logout
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1">
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FaSearch className="text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Search tickets by ID, title, creator, or tags..."
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="w-full md:w-48">
//               <div className="relative">
//                 <select 
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white appearance-none"
//                   value={filterStatus}
//                   onChange={(e) => setFilterStatus(e.target.value)}
//                 >
//                   <option value="all">All Statuses</option>
//                   <option value="open">Open</option>
//                   <option value="in-progress">In Progress</option>
//                   <option value="resolved">Resolved</option>
//                 </select>
//                 <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
//                   <FaChevronDown className="text-gray-400" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tickets Table */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
//                 <tr>
//                   <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
//                   <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
//                   <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
//                   <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
//                   <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                   <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign Ticket</th>
//                   {userRole === 1 && (
//                     <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete Ticket</th>
//                   )}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredTickets.length === 0 ? (
//                   <tr>
//                     <td colSpan="7" className="px-6 py-12 text-center">
//                       <div className="flex flex-col items-center justify-center text-gray-500">
//                         <FaTicketAlt className="h-16 w-16 text-gray-300 mb-4" />
//                         <h3 className="text-lg font-medium py-2">No tickets found</h3>
//                         <p className="text-sm">Try adjusting your search or filter criteria.</p>
//                         <button
//                           onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}
//                           className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                         >
//                           Clear Filters
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredTickets.map(ticket => (
//                     <tr key={ticket.task_id} className="hover:bg-gray-50 transition-colors duration-150">
//                       {/* Ticket ID */}
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">#{ticket.id}</div>
//                       </td>

//                       {/* Title & Tags */}
//                       <td className="px-6 py-4 max-w-xs">
//                         <div className="text-sm font-medium text-gray-900 truncate">
//                           {ticket.title}
//                         </div>
//                         <div className="mt-1 flex flex-wrap gap-1">
//                           {ticket.task_tags ? (
//                             ticket.task_tags.split(',').map((tag, idx) => (
//                               <span
//                                 key={idx}
//                                 className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"
//                               >
//                                 <FaTag className="mr-1 text-purple-500" size="0.7em" />
//                                 {tag.trim()}
//                               </span>
//                             ))
//                           ) : (
//                             <span className="text-gray-400 text-xs italic">No tags</span>
//                           )}
//                         </div>
//                       </td>

//                       {/* Created By */}
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 text-xs font-semibold">
//                             {ticket.created_by.charAt(0) || ''}
//                           </div>
//                           <div className="ml-3">
//                             <div className="text-sm font-medium text-gray-900">
//                               {ticket.created_by || ''}
//                             </div>
//                             <div className="text-xs text-gray-500">{ticket.role}</div>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Created At */}
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900 flex items-center gap-2">
//                           <FaCalendarAlt className="text-gray-400 flex-shrink-0" />
//                           {new Date(ticket.created_at).toLocaleDateString("en-US", {
//                             year: "numeric",
//                             month: "short",
//                             day: "numeric"
//                           })}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {new Date(ticket.created_at).toLocaleTimeString("en-US", {
//                             hour: "2-digit",
//                             minute: "2-digit"
//                           })} CST
//                         </div>
//                       </td>

//                       {/* Actions */}
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <Link
//                           href={`/TaskManager/task/${ticket.task_id}`}
//                           className="text-indigo-600 hover:text-indigo-900 hover:underline transition-colors duration-200 flex items-center gap-1 group"
//                         >
//                           <span>View</span>
//                           <FaExternalLinkAlt className="opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
//                         </Link>
//                       </td>

//                       {/* Assign Ticket */}
//                       <td className="px-6 py-4">
//                         <select
//                           className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm"
//                           value={assignedUsers[ticket.id]?.user_id || ""}
//                           onChange={(e) => handleAssignTicket(ticket.id, e.target.value)}
//                         >
//                           <option value="">Assign to...</option>
//                           {users.map(user => (
//                             <option key={user.id} value={user.id}>
//                               {user.fname} {user.lname}
//                             </option>
//                           ))}
//                         </select>
//                       </td>

//                       {/* Delete Ticket (Admin Only) */}
//                       {userRole === 1 && (
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                           <button
//                             onClick={() => handleDeleteTicket(ticket.task_id)}
//                             className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors duration-200 flex items-center justify-center"
//                             aria-label={`Delete ticket ${ticket.task_id}`}
//                           >
//                             <FaTrash />
//                           </button>
//                         </td>
//                       )}
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Table Footer */}
//           <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
//             <div className="flex items-center justify-between">
//               <p className="text-sm text-gray-700">
//                 Showing <span className="font-medium">{filteredTickets.length}</span> of{' '}
//                 <span className="font-medium">{openedTickets.length}</span> tickets
//               </p>
//               <div className="flex gap-2">
//                 <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
//                   Previous
//                 </button>
//                 <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function OpenedTicketsWrapper() {
//   return (
//     <ProtectedRoute>
//       <OpenedTickets />
//     </ProtectedRoute>
//   );
// }



"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Toaster, toast } from "sonner";
import ProtectedRoute from "../../../context/ProtectedRoute";
import {
  FaTicketAlt,
  FaUser,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaUserTag,
  FaTrash,
  FaPlus,
  FaFilter,
  FaSearch,
  FaTag,
  FaTasks,
  FaExclamationCircle,
  FaChevronDown,
  FaChevronUp,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaThLarge,
  FaList
} from "react-icons/fa";

const OpenedTickets = () => {
  const router = useRouter();
  const [openedTickets, setOpenedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" or "kanban"

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        setUserRole(data.role);
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        setUserRole(null);
      } finally {
        // Don't set loading to false here to keep it true until tasks are loaded
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchOpenedTickets = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/opened_tickets`,
          { withCredentials: true }
        );
        setOpenedTickets(data);

        const assignedUserPromises = data.map(ticket =>
          axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get_assigned_user/${ticket.id}`)
        );
        const assignedUserResponses = await Promise.all(assignedUserPromises);

        const mapped = assignedUserResponses.reduce((acc, res, i) => {
          acc[data[i].id] = res.data;
          return acc;
        }, {});
        setAssignedUsers(mapped);
      } catch (error) {
        console.error("Error fetching opened tickets:", error);
        toast.error("Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };
    fetchOpenedTickets();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`);
        setUsers(data.filter(user => user.role !== "Client"));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleAssignTicket = async (ticketId, userId) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assign_ticket`, {
        ticket_id: ticketId,
        user_id: userId,
      });
      setAssignedUsers(prev => ({ ...prev, [ticketId]: { user_id: userId } }));
      toast.success("Ticket assigned successfully!");
    } catch (error) {
      toast.error("Error assigning ticket.");
      console.error("Error assigning ticket:", error);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/delete-ticket`, {
        ticket_id: ticketId,
      });
      setOpenedTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      // Also remove from assignedUsers state if needed
      const updatedAssignedUsers = { ...assignedUsers };
      delete updatedAssignedUsers[ticketId];
      setAssignedUsers(updatedAssignedUsers);
      toast.success("Ticket deleted successfully!");
    } catch (error) {
      toast.error("Error deleting ticket.");
      console.error("Error deleting ticket:", error);
    }
  };

  // Filter tickets based on search term
  const filteredTickets = openedTickets.filter(ticket => {
    const matchesSearch = 
      ticket.id.toString().includes(searchTerm) ||
      (ticket.title && ticket.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.creator && 
        (`${ticket.creator.fname} ${ticket.creator.lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
         ticket.creator.role.toLowerCase().includes(searchTerm.toLowerCase()))
      ) ||
      (ticket.task_tags && ticket.task_tags.toLowerCase().includes(searchTerm.toLowerCase()));

    // Add status filtering logic if needed
    // const matchesStatus = filterStatus === "all" || ticket.status_name === filterStatus;

    return matchesSearch; // && matchesStatus;
  });

  const toggleTicketExpansion = (ticketId) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  };

  // Group tickets by status for Kanban view
  const groupTicketsByStatus = () => {
    const statusGroups = {
      "Open": [],
      "In Progress": [],
      "Resolved": [],
      "Closed": []
    };

    filteredTickets.forEach(ticket => {
      const status = ticket.status_name || "Open";
      if (statusGroups[status]) {
        statusGroups[status].push(ticket);
      } else {
        statusGroups["Open"].push(ticket);
      }
    });

    return statusGroups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaTicketAlt className="text-blue-600" />
                Opened Tickets
              </h1>
              <p className="text-gray-600 mt-2">Manage and track all open support tickets</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FaList />
                  Table
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "kanban"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FaThLarge />
                  Kanban
                </button>
              </div>

              <Link
                href="/Helpdesk/newTask"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <FaPlus />
                <span>New Ticket</span>
              </Link>

              <div className="relative group">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <button 
                    onClick={() => router.push('/Dashboard')}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FaCog className="text-gray-500" />
                    Dashboard
                  </button>
                  <button 
                    onClick={() => router.push('/Helpdesk/profile')}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FaUser className="text-gray-500" />
                    Profile
                  </button>
                  <button 
                    onClick={() => {
                      axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logout`, {}, { withCredentials: true });
                      router.push('/sign-in');
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FaSignOutAlt className="text-gray-500" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tickets by ID, title, creator, or tags..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <div className="relative">
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white appearance-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FaChevronDown className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Content */}
        {viewMode === "table" ? (
          // Table View
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign Ticket</th>
                    {userRole === 1 && (
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete Ticket</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <FaTicketAlt className="h-16 w-16 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium py-2">No tickets found</h3>
                          <p className="text-sm">Try adjusting your search or filter criteria.</p>
                          <button
                            onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}
                            className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Clear Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map(ticket => (
                      <tr key={ticket.task_id} className="hover:bg-gray-50 transition-colors duration-150">
                        {/* Ticket ID */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{ticket.id}</div>
                        </td>

                        {/* Title & Tags */}
                        <td className="px-6 py-4 max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {ticket.title}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {ticket.task_tags ? (
                              ticket.task_tags.split(',').map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"
                                >
                                  <FaTag className="mr-1 text-purple-500" size="0.7em" />
                                  {tag.trim()}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs italic">No tags</span>
                            )}
                          </div>
                        </td>

                        {/* Created By */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 text-xs font-semibold">
                              {ticket.created_by.charAt(0) || ''}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {ticket.created_by || ''}
                              </div>
                              <div className="text-xs text-gray-500">{ticket.role}</div>
                            </div>
                          </div>
                        </td>

                        {/* Created At */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400 flex-shrink-0" />
                            {new Date(ticket.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(ticket.created_at).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })} CST
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/TaskManager/task/${ticket.task_id}`}
                            className="text-indigo-600 hover:text-indigo-900 hover:underline transition-colors duration-200 flex items-center gap-1 group"
                          >
                            <span>View</span>
                            <FaExternalLinkAlt className="opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
                          </Link>
                        </td>

                        {/* Assign Ticket */}
                        <td className="px-6 py-4">
                          <select
                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm"
                            value={assignedUsers[ticket.id]?.user_id || ""}
                            onChange={(e) => handleAssignTicket(ticket.id, e.target.value)}
                          >
                            <option value="">Assign to...</option>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>
                                {user.fname} {user.lname}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Delete Ticket (Admin Only) */}
                        {userRole === 1 && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteTicket(ticket.task_id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors duration-200 flex items-center justify-center"
                              aria-label={`Delete ticket ${ticket.task_id}`}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredTickets.length}</span> of{' '}
                  <span className="font-medium">{openedTickets.length}</span> tickets
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Kanban View
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(groupTicketsByStatus()).map(([status, tickets]) => (
                <div key={status} className="bg-gray-50 rounded-xl border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${
                        status === "Open" ? "bg-blue-500" :
                        status === "In Progress" ? "bg-yellow-500" :
                        status === "Resolved" ? "bg-green-500" : "bg-gray-500"
                      }`}></span>
                      {status}
                      <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {tickets.length}
                      </span>
                    </h3>
                  </div>
                  <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                    {tickets.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FaTicketAlt className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-sm">No tickets</p>
                      </div>
                    ) : (
                      tickets.map(ticket => (
                        <div 
                          key={ticket.id} 
                          className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                {ticket.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">#{ticket.id}</p>
                            </div>
                            <div className="flex gap-1">
                              <Link
                                href={`/TaskManager/task/${ticket.task_id}`}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                aria-label="View ticket"
                              >
                                <FaExternalLinkAlt size="0.8em" />
                              </Link>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-1">
                            {ticket.task_tags ? (
                              ticket.task_tags.split(',').map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                >
                                  <FaTag className="mr-1 text-purple-500" size="0.6em" />
                                  {tag.trim()}
                                </span>
                              ))
                            ) : null}
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 text-xs font-semibold">
                                {ticket.created_by.charAt(0) || ''}
                              </div>
                              <div className="ml-2 text-xs text-gray-600 truncate max-w-[80px]">
                                {ticket.created_by || ''}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(ticket.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric"
                              })}
                            </div>
                          </div>

                          <div className="mt-4">
                            <select
                              className="block w-full text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              value={assignedUsers[ticket.id]?.user_id || ""}
                              onChange={(e) => handleAssignTicket(ticket.id, e.target.value)}
                            >
                              <option value="">Assign to...</option>
                              {users.map(user => (
                                <option key={user.id} value={user.id}>
                                  {user.fname} {user.lname}
                                </option>
                              ))}
                            </select>
                          </div>

                          {userRole === 1 && (
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => handleDeleteTicket(ticket.task_id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                aria-label={`Delete ticket ${ticket.task_id}`}
                              >
                                <FaTrash size="0.8em" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function OpenedTicketsWrapper() {
  return (
    <ProtectedRoute>
      <OpenedTickets />
    </ProtectedRoute>
  );
}