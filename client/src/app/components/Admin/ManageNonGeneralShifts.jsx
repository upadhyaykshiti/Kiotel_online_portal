// "use client";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { FaTimes, FaUsers, FaCalendarCheck, FaPlus, FaSearch, FaTrash, FaExchangeAlt } from "react-icons/fa";

// export default function ManageNonGeneralShifts({ onClose }) {
//   const [allUsers, setAllUsers] = useState([]);
//   const [nonGeneralShifts, setNonGeneralShifts] = useState([]);
//   const [selectedUserIds, setSelectedUserIds] = useState(new Set());
//   const [userSearchQuery, setUserSearchQuery] = useState("");
  
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [message, setMessage] = useState(null);
//   const [messageType, setMessageType] = useState('success');
  
//   // View mode: 'assign' or 'manage'
//   const [viewMode, setViewMode] = useState('assign');
  
//   // Assigned users data
//   const [assignedUsers, setAssignedUsers] = useState([]);
//   const [manageSearchQuery, setManageSearchQuery] = useState("");

//   // Fetch all users and non-general shifts
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [usersRes, shiftsRes, assignmentsRes] = await Promise.all([
//           axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, { withCredentials: true }),
//           axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clockin/shifts`),
//           axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clockin/non-general-shift-assignments`)
//         ]);

//         // Filter only Non-General shifts (category_id = 3)
//         const ngShifts = shiftsRes.data.filter(shift => shift.category_id === 3);
//         setNonGeneralShifts(ngShifts);
//         setAllUsers(usersRes.data);

//         // Process assignments to group by user
//         if (assignmentsRes.data.success) {
//           const assignments = assignmentsRes.data.data;
//           const userAssignmentsMap = {};
          
//           assignments.forEach(assignment => {
//             if (!userAssignmentsMap[assignment.user_id]) {
//               userAssignmentsMap[assignment.user_id] = {
//                 user_id: assignment.user_id,
//                 account_no: assignment.account_no,
//                 user_name: assignment.user_name,
//                 shifts: []
//               };
//             }
//             userAssignmentsMap[assignment.user_id].shifts.push({
//               id: assignment.shift_id,
//               name: assignment.shift_name,
//               start_time: assignment.start_time,
//               end_time: assignment.end_time
//             });
//           });
          
//           setAssignedUsers(Object.values(userAssignmentsMap));
//         }

//       } catch (error) {
//         console.error('Failed to fetch data:', error);
//         setMessage('Failed to load users or shifts');
//         setMessageType('error');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Filter users based on search query (for assignment)
//   const filteredUsers = allUsers.filter(user => {
//     const query = userSearchQuery.toLowerCase();
//     return (
//       user.fname?.toLowerCase().includes(query) ||
//       user.lname?.toLowerCase().includes(query) ||
//       user.account_no?.toLowerCase().includes(query) ||
//       user.role?.toLowerCase().includes(query)
//     );
//   });

//   // Filter assigned users based on search query (for management)
//   const filteredAssignedUsers = assignedUsers.filter(assignment => {
//     const query = manageSearchQuery.toLowerCase();
//     return (
//       assignment.user_name.toLowerCase().includes(query) ||
//       assignment.account_no.toLowerCase().includes(query)
//     );
//   });

//   const toggleUserSelection = (userId) => {
//     setSelectedUserIds(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(userId)) {
//         newSet.delete(userId);
//       } else {
//         newSet.add(userId);
//       }
//       return newSet;
//     });
//   };

//   const selectAllFilteredUsers = () => {
//     setSelectedUserIds(prev => {
//       const newSet = new Set(prev);
//       const allFilteredSelected = filteredUsers.every(u => newSet.has(u.id));
      
//       if (allFilteredSelected) {
//         // Deselect all filtered users
//         filteredUsers.forEach(u => newSet.delete(u.id));
//       } else {
//         // Select all filtered users
//         filteredUsers.forEach(u => newSet.add(u.id));
//       }
//       return newSet;
//     });
//   };

//   const handleAssign = async () => {
//     if (selectedUserIds.size === 0) {
//       setMessage('Please select at least one user');
//       setMessageType('error');
//       return;
//     }

//     if (nonGeneralShifts.length === 0) {
//       setMessage('No Non-General shifts found in the system.');
//       setMessageType('error');
//       return;
//     }

//     setIsSaving(true);
//     setMessage(null);

//     try {
//       const allNonGeneralShiftIds = nonGeneralShifts.map(s => s.id);

//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/clockin/users/assign-non-general-shift`,
//         {
//           user_ids: Array.from(selectedUserIds),
//           shift_ids: allNonGeneralShiftIds
//         },
//         { withCredentials: true }
//       );

//       if (response.data.success) {
//         setMessage(`✅ Successfully granted access to ${response.data.assigned_count} shift(s) for ${selectedUserIds.size} user(s)!`);
//         setMessageType('success');
//         setSelectedUserIds(new Set());
//         setUserSearchQuery("");
        
//         // Refresh assignments list
//         await refreshAssignments();
//       }
//     } catch (error) {
//       console.error('Assignment error:', error);
//       setMessage(error.response?.data?.message || 'Failed to assign shifts');
//       setMessageType('error');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleRemoveAccess = async (userId, userName) => {
//     const confirmed = window.confirm(`Remove Non-General shift access from ${userName}?`);
//     if (!confirmed) return;

//     setIsSaving(true);
//     setMessage(null);

//     try {
//       const allNonGeneralShiftIds = nonGeneralShifts.map(s => s.id);

//       const response = await axios.delete(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/clockin/users/remove-non-general-shift`,
//         {
//           data: {
//             user_ids: [userId],
//             shift_ids: allNonGeneralShiftIds
//           },
//           withCredentials: true
//         }
//       );

//       if (response.data.success) {
//         setMessage(`✅ Access removed successfully for ${userName}`);
//         setMessageType('success');
//         await refreshAssignments();
//       }
//     } catch (error) {
//       console.error('Removal error:', error);
//       setMessage(error.response?.data?.message || 'Failed to remove access');
//       setMessageType('error');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const refreshAssignments = async () => {
//     try {
//       const assignmentsRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clockin/non-general-shift-assignments`);
      
//       if (assignmentsRes.data.success) {
//         const assignments = assignmentsRes.data.data;
//         const userAssignmentsMap = {};
        
//         assignments.forEach(assignment => {
//           if (!userAssignmentsMap[assignment.user_id]) {
//             userAssignmentsMap[assignment.user_id] = {
//               user_id: assignment.user_id,
//               account_no: assignment.account_no,
//               user_name: assignment.user_name,
//               shifts: []
//             };
//           }
//           userAssignmentsMap[assignment.user_id].shifts.push({
//             id: assignment.shift_id,
//             name: assignment.shift_name,
//             start_time: assignment.start_time,
//             end_time: assignment.end_time
//           });
//         });
        
//         setAssignedUsers(Object.values(userAssignmentsMap));
//       }
//     } catch (error) {
//       console.error('Failed to refresh assignments:', error);
//     }
//   };

//   const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.has(u.id));

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        
//         {/* Header */}
//         <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between shrink-0">
//           <div className="flex items-center gap-3">
//             <FaCalendarCheck className="text-white text-2xl" />
//             <div>
//               <h2 className="text-xl font-bold text-white">Manage Non-General Shift Access</h2>
//               <p className="text-purple-100 text-sm">Grant or revoke access to ALL Non-General shifts</p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
//           >
//             <FaTimes className="text-xl" />
//           </button>
//         </div>

//         {/* View Mode Tabs */}
//         <div className="flex border-b border-gray-200 shrink-0">
//           <button
//             onClick={() => setViewMode('assign')}
//             className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
//               viewMode === 'assign'
//                 ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50'
//                 : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//             }`}
//           >
//             <FaPlus className="text-lg" />
//             Assign New Access
//           </button>
//           <button
//             onClick={() => setViewMode('manage')}
//             className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
//               viewMode === 'manage'
//                 ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50'
//                 : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//             }`}
//           >
//             <FaExchangeAlt className="text-lg" />
//             View & Manage ({assignedUsers.length})
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6 overflow-y-auto flex-1">
          
//           {/* Message */}
//           {message && (
//             <div className={`mb-6 p-4 rounded-xl border-2 ${
//               messageType === 'success' 
//                 ? 'bg-green-50 border-green-200 text-green-800' 
//                 : 'bg-red-50 border-red-200 text-red-800'
//             }`}>
//               {message}
//             </div>
//           )}

//           {isLoading ? (
//             <div className="flex justify-center items-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
//             </div>
//           ) : viewMode === 'assign' ? (
//             // ASSIGN MODE
//             <div className="w-full">
//               {/* Search and Select All Header */}
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
//                 <div className="relative flex-1 max-w-md">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaSearch className="text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search users by name, ID, or role..."
//                     value={userSearchQuery}
//                     onChange={(e) => setUserSearchQuery(e.target.value)}
//                     className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
//                   />
//                 </div>
                
//                 <button
//                   onClick={selectAllFilteredUsers}
//                   className="text-sm text-purple-600 hover:text-purple-800 font-medium whitespace-nowrap"
//                 >
//                   {allFilteredSelected ? 'Deselect All' : 'Select All Visible'}
//                 </button>
//               </div>

//               {/* Users List */}
//               <div className="border border-gray-200 rounded-xl max-h-[50vh] overflow-y-auto">
//                 {filteredUsers.length === 0 ? (
//                   <div className="p-8 text-center text-gray-500">
//                     No users found matching {userSearchQuery}
//                   </div>
//                 ) : (
//                   filteredUsers.map((user) => (
//                     <label
//                       key={user.id}
//                       className={`flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
//                         selectedUserIds.has(user.id) ? 'bg-purple-50' : ''
//                       }`}
//                     >
//                       <input
//                         type="checkbox"
//                         checked={selectedUserIds.has(user.id)}
//                         onChange={() => toggleUserSelection(user.id)}
//                         className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
//                       />
//                       <div className="ml-3 flex-1">
//                         <p className="text-sm font-medium text-gray-900">{user.fname} {user.lname}</p>
//                         <p className="text-xs text-gray-500">{user.account_no} • {user.role}</p>
//                       </div>
//                     </label>
//                   ))
//                 )}
//               </div>
              
//               <p className="text-xs text-gray-500 mt-2">
//                 {selectedUserIds.size} user(s) selected out of {filteredUsers.length} visible
//               </p>
//             </div>
//           ) : (
//             // MANAGE MODE
//             <div className="w-full">
//               {/* Search Header */}
//               <div className="mb-4">
//                 <div className="relative max-w-md">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaSearch className="text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search assigned users..."
//                     value={manageSearchQuery}
//                     onChange={(e) => setManageSearchQuery(e.target.value)}
//                     className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
//                   />
//                 </div>
//               </div>

//               {/* Assigned Users Table */}
//               {filteredAssignedUsers.length === 0 ? (
//                 <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
//                   <FaUsers className="text-gray-400 text-5xl mx-auto mb-3" />
//                   <p className="text-gray-500 font-medium">
//                     {assignedUsers.length === 0 
//                       ? "No users have been assigned Non-General shift access yet"
//                       : "No users found matching your search"}
//                   </p>
//                 </div>
//               ) : (
//                 <div className="border border-gray-200 rounded-xl overflow-hidden">
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             User
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             User ID
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Assigned Shifts
//                           </th>
//                           <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {filteredAssignedUsers.map((assignment) => (
//                           <tr key={assignment.user_id} className="hover:bg-gray-50 transition-colors">
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="text-sm font-medium text-gray-900">
//                                 {assignment.user_name}
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="text-sm text-gray-600">
//                                 {assignment.account_no}
//                               </div>
//                             </td>
//                             <td className="px-6 py-4">
//                               <div className="text-sm text-gray-600">
//                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                                   {assignment.shifts.length} Non-General Shift(s)
//                                 </span>
//                                 <p className="text-xs text-gray-500 mt-1">
//                                   All Non-General shifts in the system
//                                 </p>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-right">
//                               <button
//                                 onClick={() => handleRemoveAccess(assignment.user_id, assignment.user_name)}
//                                 disabled={isSaving}
//                                 className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
//                               >
//                                 <FaTrash className="mr-1.5" />
//                                 Remove Access
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
              
//               <p className="text-xs text-gray-500 mt-2">
//                 Showing {filteredAssignedUsers.length} of {assignedUsers.length} assigned user(s)
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         {viewMode === 'assign' && (
//           <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
//             <button
//               onClick={onClose}
//               className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium transition-colors"
//             >
//               Cancel
//             </button>
            
//             <button
//               onClick={handleAssign}
//               disabled={isSaving || selectedUserIds.size === 0}
//               className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
//                 isSaving || selectedUserIds.size === 0
//                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                   : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg'
//               }`}
//             >
//               {isSaving ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                   Assigning...
//                 </>
//               ) : (
//                 <>
//                   <FaPlus />
//                   Assign All Non-General Shifts to {selectedUserIds.size} User(s)
//                 </>
//               )}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaUsers, FaCalendarCheck, FaPlus, FaSearch, FaTrash } from "react-icons/fa";

export default function ManageNonGeneralShifts({ onClose }) {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [userSearchQuery, setUserSearchQuery] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  
  // View mode: 'assign' or 'manage'
  const [viewMode, setViewMode] = useState('assign');
  
  // Users with access
  const [usersWithAccess, setUsersWithAccess] = useState([]);
  const [manageSearchQuery, setManageSearchQuery] = useState("");

  // Fetch all users and users with access
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, accessRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, { withCredentials: true }),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clockin/non-general-access-users`)
        ]);

        setAllUsers(usersRes.data);

        if (accessRes.data.success) {
          setUsersWithAccess(accessRes.data.data);
        }

      } catch (error) {
        console.error('Failed to fetch data:', error);
        setMessage('Failed to load users');
        setMessageType('error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter users based on search query (for assignment)
  const filteredUsers = allUsers.filter(user => {
    const query = userSearchQuery.toLowerCase();
    return (
      user.fname?.toLowerCase().includes(query) ||
      user.lname?.toLowerCase().includes(query) ||
      user.account_no?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  // Filter users with access based on search query (for management)
  const filteredUsersWithAccess = usersWithAccess.filter(user => {
    const query = manageSearchQuery.toLowerCase();
    return (
      user.user_name.toLowerCase().includes(query) ||
      user.account_no.toLowerCase().includes(query)
    );
  });

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const selectAllFilteredUsers = () => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      const allFilteredSelected = filteredUsers.every(u => newSet.has(u.id));
      
      if (allFilteredSelected) {
        filteredUsers.forEach(u => newSet.delete(u.id));
      } else {
        filteredUsers.forEach(u => newSet.add(u.id));
      }
      return newSet;
    });
  };

  const handleGrantAccess = async () => {
    if (selectedUserIds.size === 0) {
      setMessage('Please select at least one user');
      setMessageType('error');
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/clockin/users/grant-non-general-access`,
        {
          user_ids: Array.from(selectedUserIds)
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage(`✅ Access granted to ${response.data.granted_count} user(s)!`);
        setMessageType('success');
        setSelectedUserIds(new Set());
        setUserSearchQuery("");
        await refreshAccessUsers();
      }
    } catch (error) {
      console.error('Grant access error:', error);
      setMessage(error.response?.data?.message || 'Failed to grant access');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeAccess = async (userId, userName) => {
    const confirmed = window.confirm(`Revoke Non-General shift access from ${userName}?`);
    if (!confirmed) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/clockin/users/revoke-non-general-access`,
        {
          data: { user_ids: [userId] },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setMessage(`✅ Access revoked for ${userName}`);
        setMessageType('success');
        await refreshAccessUsers();
      }
    } catch (error) {
      console.error('Revoke access error:', error);
      setMessage(error.response?.data?.message || 'Failed to revoke access');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const refreshAccessUsers = async () => {
    try {
      const accessRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clockin/non-general-access-users`);
      if (accessRes.data.success) {
        setUsersWithAccess(accessRes.data.data);
      }
    } catch (error) {
      console.error('Failed to refresh access users:', error);
    }
  };

  const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.has(u.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <FaCalendarCheck className="text-white text-2xl" />
            <div>
              <h2 className="text-xl font-bold text-white">Manage Non-General Shift Access</h2>
              <p className="text-purple-100 text-sm">Users with access can see ALL Non-General shifts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex border-b border-gray-200 shrink-0">
          <button
            onClick={() => setViewMode('assign')}
            className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              viewMode === 'assign'
                ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FaPlus className="text-lg" />
            Grant Access
          </button>
          <button
            onClick={() => setViewMode('manage')}
            className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              viewMode === 'manage'
                ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FaUsers className="text-lg" />
            Manage Access ({usersWithAccess.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl border-2 ${
              messageType === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : viewMode === 'assign' ? (
            // ASSIGN MODE
            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users by name, ID, or role..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                  />
                </div>
                
                <button
                  onClick={selectAllFilteredUsers}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium whitespace-nowrap"
                >
                  {allFilteredSelected ? 'Deselect All' : 'Select All Visible'}
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl max-h-[50vh] overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No users found matching {userSearchQuery}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className={`flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedUserIds.has(user.id) ? 'bg-purple-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{user.fname} {user.lname}</p>
                        <p className="text-xs text-gray-500">{user.account_no} • {user.role}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                {selectedUserIds.size} user(s) selected out of {filteredUsers.length} visible
              </p>
            </div>
          ) : (
            // MANAGE MODE
            <div className="w-full">
              <div className="mb-4">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users with access..."
                    value={manageSearchQuery}
                    onChange={(e) => setManageSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                  />
                </div>
              </div>

              {filteredUsersWithAccess.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <FaUsers className="text-gray-400 text-5xl mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    {usersWithAccess.length === 0 
                      ? "No users have Non-General shift access yet"
                      : "No users found matching your search"}
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Access Granted
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsersWithAccess.map((user) => (
                          <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {user.user_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {user.account_no}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {new Date(user.granted_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => handleRevokeAccess(user.user_id, user.user_name)}
                                disabled={isSaving}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                              >
                                <FaTrash className="mr-1.5" />
                                Revoke Access
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Showing {filteredUsersWithAccess.length} of {usersWithAccess.length} user(s) with access
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {viewMode === 'assign' && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleGrantAccess}
              disabled={isSaving || selectedUserIds.size === 0}
              className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
                isSaving || selectedUserIds.size === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Granting...
                </>
              ) : (
                <>
                  <FaPlus />
                  Grant Access to {selectedUserIds.size} User(s)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}