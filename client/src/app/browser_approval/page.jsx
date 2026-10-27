// // "use client";

// // import React, { useState, useEffect } from "react";
// // import axios from "axios";

// // const BrowserApproval = () => {
// //   const [approvals, setApprovals] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [message, setMessage] = useState("");

// //   // Fetch data on load
// //   const fetchApprovals = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await axios.get(
// //         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/browser_approvals`,
// //         { withCredentials: true }
// //       );
// //       setApprovals(res.data);
// //     } catch (err) {
// //       console.error("Failed to fetch approvals", err);
// //       setMessage("Failed to load approval requests.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchApprovals();
// //   }, []);

// //   // Handle Approve or Reject
// //   const handleUpdateStatus = async (id, newStatus) => {
// //     try {
// //       setMessage(""); // Clear old messages
// //       await axios.put(
// //         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/browser_approvals/${id}`,
// //         { status: newStatus },
// //         { withCredentials: true }
// //       );
      
// //       // Update the local state so the UI reflects the change instantly
// //       setApprovals((prev) =>
// //         prev.map((appr) =>
// //           appr.id === id ? { ...appr, status: newStatus } : appr
// //         )
// //       );
      
// //       setMessage(`Device ${newStatus} successfully!`);
// //       setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
// //     } catch (err) {
// //       console.error(`Failed to mark as ${newStatus}`, err);
// //       setMessage(`Error updating device status.`);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-50 p-8">
// //       <div className="max-w-6xl mx-auto">
// //         <h1 className="text-3xl font-bold text-gray-800 mb-6">
// //           Browser Approvals
// //         </h1>

// //         {message && (
// //           <div className="mb-4 p-4 rounded-lg bg-blue-100 text-blue-800 font-medium">
// //             {message}
// //           </div>
// //         )}

// //         {loading ? (
// //           <p className="text-gray-500">Loading requests...</p>
// //         ) : (
// //           <div className="bg-white rounded-lg shadow overflow-hidden">
// //             <table className="min-w-full divide-y divide-gray-200">
// //               <thead className="bg-gray-50">
// //                 <tr>
// //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
// //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device ID</th>
// //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested On</th>
// //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
// //                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
// //                 </tr>
// //               </thead>
// //               <tbody className="bg-white divide-y divide-gray-200">
// //                 {approvals.length === 0 ? (
// //                   <tr>
// //                     <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
// //                       No browser approval requests found.
// //                     </td>
// //                   </tr>
// //                 ) : (
// //                   approvals.map((req) => (
// //                     <tr key={req.id} className={req.status === "pending" ? "bg-yellow-50" : ""}>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         <div className="text-sm font-medium text-gray-900">
// //                           {req.fname} {req.lname}
// //                         </div>
// //                         <div className="text-sm text-gray-500">{req.emailid}</div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
// //                         {req.device_id.substring(0, 15)}...
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
// //                         {new Date(req.created_at).toLocaleString()}
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
// //                           ${req.status === 'approved' ? 'bg-green-100 text-green-800' : 
// //                             req.status === 'rejected' ? 'bg-red-100 text-red-800' : 
// //                             'bg-yellow-100 text-yellow-800'}`}>
// //                           {req.status.toUpperCase()}
// //                         </span>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
// //                         {req.status !== 'approved' && (
// //                           <button
// //                             onClick={() => handleUpdateStatus(req.id, "approved")}
// //                             className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded transition-colors"
// //                           >
// //                             Approve
// //                           </button>
// //                         )}
// //                         {req.status !== 'rejected' && (
// //                           <button
// //                             onClick={() => handleUpdateStatus(req.id, "rejected")}
// //                             className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
// //                           >
// //                             Reject
// //                           </button>
// //                         )}
// //                       </td>
// //                     </tr>
// //                   ))
// //                 )}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default BrowserApproval;


// "use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const BrowserApproval = () => {
//   const [approvals, setApprovals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState({ text: "", type: "" });

//   const fetchApprovals = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/browser_approvals`,
//         { withCredentials: true }
//       );
//       setApprovals(res.data);
//     } catch (err) {
//       console.error("Failed to fetch approvals", err);
//       setMessage({ text: "Failed to load approval requests.", type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchApprovals();
//   }, []);

//   const handleUpdateStatus = async (id, newStatus) => {
//     try {
//       setMessage({ text: "", type: "" });
//       await axios.put(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/browser_approvals/${id}`,
//         { status: newStatus },
//         { withCredentials: true }
//       );
      
//       setApprovals((prev) =>
//         prev.map((appr) =>
//           appr.id === id ? { ...appr, status: newStatus } : appr
//         )
//       );
      
//       setMessage({ text: `Device ${newStatus} successfully!`, type: "success" });
//       setTimeout(() => setMessage({ text: "", type: "" }), 3000);
//     } catch (err) {
//       console.error(`Failed to mark as ${newStatus}`, err);
//       setMessage({ text: "Error updating device status.", type: "error" });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8 font-sans text-gray-800">
//       <div className="max-w-6xl mx-auto space-y-6">
        
//         {/* Header Section */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
//               Browser Approvals
//             </h1>
//             <p className="text-sm text-gray-500 mt-1">
//               Manage and authorize new devices for secure accounts.
//             </p>
//           </div>
//           <button
//             onClick={fetchApprovals}
//             disabled={loading}
//             className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all shadow-sm disabled:opacity-50"
//           >
//             <svg className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//             </svg>
//             {loading ? "Refreshing..." : "Refresh List"}
//           </button>
//         </div>

//         {/* Alert Message */}
//         {message.text && (
//           <div className={`flex items-center gap-3 p-4 rounded-lg border text-sm font-medium animate-fade-in-down ${
//             message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
//           }`}>
//             {message.type === 'success' ? (
//               <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
//             ) : (
//               <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
//             )}
//             {message.text}
//           </div>
//         )}

//         {/* Main Card / Table */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
//               <thead className="bg-gray-50/75">
//                 <tr>
//                   <th className="px-6 py-4 font-semibold text-gray-500">User Details</th>
//                   <th className="px-6 py-4 font-semibold text-gray-500">Device Fingerprint</th>
//                   <th className="px-6 py-4 font-semibold text-gray-500">Requested Date</th>
//                   <th className="px-6 py-4 font-semibold text-gray-500">Status</th>
//                   <th className="px-6 py-4 font-semibold text-gray-500 text-right">Actions</th>
//                 </tr>
//               </thead>
              
//               <tbody className="divide-y divide-gray-100 bg-white">
//                 {loading && approvals.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
//                       <div className="flex flex-col items-center justify-center space-y-3">
//                         <svg className="w-8 h-8 animate-spin text-gray-300" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         <span>Loading records...</span>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : approvals.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
//                       <div className="flex flex-col items-center justify-center space-y-3">
//                         <div className="p-3 bg-gray-50 rounded-full">
//                           <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
//                         </div>
//                         <p>No browser approval requests pending.</p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   approvals.map((req) => (
//                     <tr 
//                       key={req.id} 
//                       className={`hover:bg-gray-50/80 transition-colors duration-150 ${req.status === "pending" ? "bg-amber-50/30" : ""}`}
//                     >
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="font-medium text-gray-900">{req.fname} {req.lname}</div>
//                         <div className="text-gray-500 mt-0.5">{req.emailid}</div>
//                       </td>
                      
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
//                         <div className="flex items-center gap-2">
//                           <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
//                           {req.device_id.substring(0, 18)}...
//                         </div>
//                       </td>
                      
//                       <td className="px-6 py-4 whitespace-nowrap text-gray-500">
//                         {new Date(req.created_at).toLocaleDateString(undefined, {
//                           month: 'short', day: 'numeric', year: 'numeric'
//                         })}
//                         <span className="text-gray-400 ml-2">
//                           {new Date(req.created_at).toLocaleTimeString(undefined, {
//                             hour: '2-digit', minute: '2-digit'
//                           })}
//                         </span>
//                       </td>
                      
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
//                           ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
//                             req.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
//                             'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          
//                           {/* Colored Dot */}
//                           <span className={`w-1.5 h-1.5 rounded-full ${
//                             req.status === 'approved' ? 'bg-emerald-500' : 
//                             req.status === 'rejected' ? 'bg-rose-500' : 
//                             'bg-amber-500'
//                           }`}></span>
                          
//                           {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
//                         </span>
//                       </td>
                      
//                       <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
//                         {req.status !== 'approved' && (
//                           <button
//                             onClick={() => handleUpdateStatus(req.id, "approved")}
//                             className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-colors"
//                           >
//                             Approve
//                           </button>
//                         )}
//                         {req.status !== 'rejected' && (
//                           <button
//                             onClick={() => handleUpdateStatus(req.id, "rejected")}
//                             className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 transition-colors"
//                           >
//                             Reject
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BrowserApproval;


"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const BrowserApproval = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // State for inline editing of the device name
  const [editingId, setEditingId] = useState(null);
  const [editNameValue, setEditNameValue] = useState("");

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/browser_approvals`,
        { withCredentials: true }
      );
      setApprovals(res.data);
    } catch (err) {
      console.error("Failed to fetch approvals", err);
      setMessage({ text: "Failed to load approval requests.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  // 1. Independent Status Update (Approve / Reject)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setMessage({ text: "", type: "" });
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/browser_approvals/${id}`,
        { status: newStatus },
        { withCredentials: true }
      );
      
      setApprovals((prev) =>
        prev.map((appr) =>
          appr.id === id ? { ...appr, status: newStatus } : appr
        )
      );
      
      setMessage({ text: `Device ${newStatus} successfully!`, type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      console.error(`Failed to mark as ${newStatus}`, err);
      setMessage({ text: "Error updating device status.", type: "error" });
    }
  };

  // 2. Open the inline name editor
  const startEditing = (id, currentName) => {
    setEditingId(id);
    setEditNameValue(currentName || "");
  };

  // 3. Independent Name Update (Uses the NEW API Endpoint)
  const handleSaveName = async (id) => {
    try {
      // Call the newly created /name endpoint
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/browser_approvals/${id}/name`,
        { device_name: editNameValue },
        { withCredentials: true }
      );
      
      // Update local state to show the new name instantly
      setApprovals((prev) =>
        prev.map((appr) =>
          appr.id === id ? { ...appr, device_name: editNameValue } : appr
        )
      );
      
      setEditingId(null); // Close the editor
      setMessage({ text: "Device name saved successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      console.error("Failed to update name", err);
      setMessage({ text: "Error saving device name.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Browser Approvals
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage, name, and authorize new devices for secure accounts.
            </p>
          </div>
          <button
            onClick={fetchApprovals}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? "Refreshing..." : "Refresh List"}
          </button>
        </div>

        {/* Notification Toast */}
        {message.text && (
          <div className={`flex items-center gap-3 p-4 rounded-lg border text-sm font-medium ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? '✓' : '✕'} {message.text}
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
              <thead className="bg-gray-50/75">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-500">User Details</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 w-1/4">Device Name</th>
                  <th className="px-6 py-4 font-semibold text-gray-500">Device ID</th>
                  <th className="px-6 py-4 font-semibold text-gray-500">Requested Date</th>
                  <th className="px-6 py-4 font-semibold text-gray-500">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100 bg-white">
                {approvals.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No browser approval requests pending.
                    </td>
                  </tr>
                ) : (
                  approvals.map((req) => (
                    <tr 
                      key={req.id} 
                      className={`hover:bg-gray-50/80 transition-colors duration-150 ${req.status === "pending" ? "bg-amber-50/30" : ""}`}
                    >
                      {/* USER INFO */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{req.fname} {req.lname}</div>
                        <div className="text-gray-500 mt-0.5">{req.emailid}</div>
                      </td>
                      
                      {/* 📝 SEPARATED DEVICE NAME COLUMN */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === req.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editNameValue}
                              onChange={(e) => setEditNameValue(e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="e.g. Front Desk PC"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveName(req.id)}
                            />
                            {/* Save Button */}
                            <button onClick={() => handleSaveName(req.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Save">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                            </button>
                            {/* Cancel Button */}
                            <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded" title="Cancel">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className={req.device_name ? "text-gray-900 font-medium" : "text-gray-400 italic"}>
                              {req.device_name || "Unnamed Device"}
                            </span>
                            
                            {/* Always visible Add/Edit link */}
                            <button 
                              onClick={() => startEditing(req.id, req.device_name)}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                            >
                              {req.device_name ? "Edit" : "+ Add Name"}
                            </button>
                          </div>
                        )}
                      </td>
                      
                      {/* DEVICE ID */}
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                        {req.device_id.substring(0, 15)}...
                      </td>
                      
                      {/* DATE */}
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      
                      {/* STATUS BADGE */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                          ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            req.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                            'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            req.status === 'approved' ? 'bg-emerald-500' : 
                            req.status === 'rejected' ? 'bg-rose-500' : 
                            'bg-amber-500'
                          }`}></span>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </td>
                      
                      {/* ACTION BUTTONS (APPROVE/REJECT ONLY) */}
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        {req.status !== 'approved' && (
                          <button onClick={() => handleUpdateStatus(req.id, "approved")} className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors">
                            Approve
                          </button>
                        )}
                        {req.status !== 'rejected' && (
                          <button onClick={() => handleUpdateStatus(req.id, "rejected")} className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors">
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserApproval;