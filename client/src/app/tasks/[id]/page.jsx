
// // task/[id]
// "use client";

// import React, { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import axios from "axios";

// const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';
// const API_BASE2 = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
// const API_EXT = process.env.NEXT_PUBLIC_URL_ext || 'http://localhost:3001/api';

// const STATUS_STYLES = {
//   completed:   "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
//   escalated:   "bg-red-50 text-red-700 ring-1 ring-red-200",
//   in_progress: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
//   pending:     "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
// };

// const PRIORITY_STYLES = {
//   urgent: "bg-red-50 text-red-700 ring-1 ring-red-200",
//   high:   "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
//   medium: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
//   low:    "bg-stone-100 text-stone-500 ring-1 ring-stone-200",
// };

// const TaskDetails = () => {
//   const params = useParams();
//   const router = useRouter();
//   const taskId = params.id;

//   const [currentUser, setCurrentUser] = useState({ id: "", role: null, name: "" });
//   const [task, setTask] = useState(null);
//   const [instances, setInstances] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All statuses");

//   const [selectedOcc, setSelectedOcc] = useState(null);
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState("");
//   const [actionLoading, setActionLoading] = useState(false);

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, { withCredentials: true });
//         setCurrentUser({
//           id: res.data.unique_id,
//           role: parseInt(res.data.role, 10),
//           name: res.data.fname ? `${res.data.fname} ${res.data.lname || ''}`.trim() : res.data.unique_id
//         });
//       } catch (err) {
//         console.error("Auth error:", err);
//       }
//     };
//     fetchUser();
//   }, []);

//   const fetchTaskData = async () => {
//     if (!taskId) return;
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE}/v1/internal/tasks/${taskId}`, { withCredentials: true });
//       let intTask = res.data.task;
//       let intOccurrences = res.data.occurrences?.data || [];

//       const getDateStr = (d) => {
//         if (!d) return "";
//         try { return new Date(d).toISOString().split('T')[0]; }
//         catch (e) { return String(d).substring(0, 10); }
//       };

//       if (intTask.hk_task_id) {
//         try {
//           const externalApiToken = process.env.NEXT_PUBLIC_EXTERNAL_API_TOKEN;
//           const extRes = await axios.get(`${API_EXT}api/v1/external/tasks/${intTask.hk_task_id}`, {
//             headers: { Authorization: `Bearer ${externalApiToken}` }
//           });

//           const extTask = extRes.data.task || {};
//           const extOcc = extRes.data.occurrences?.data || [];

//           Object.keys(extTask).forEach(key => {
//             const isInternalEmpty = intTask[key] === null || intTask[key] === undefined || intTask[key] === "" || (Array.isArray(intTask[key]) && intTask[key].length === 0);
//             if (isInternalEmpty) intTask[key] = extTask[key];
//           });

//           intOccurrences = intOccurrences.map(intO => {
//             const intDateStr = getDateStr(intO.occurrence_date);
//             const matchedExtO = extOcc.find(eo => getDateStr(eo.occurrence_date) === intDateStr);
//             if (matchedExtO) {
//               const mergedO = { ...intO };
//               Object.keys(matchedExtO).forEach(key => {
//                 const isEmpty = mergedO[key] === null || mergedO[key] === undefined || mergedO[key] === "" || (Array.isArray(mergedO[key]) && mergedO[key].length === 0);
//                 if (isEmpty) mergedO[key] = matchedExtO[key];
//               });
//               return mergedO;
//             }
//             return intO;
//           });

//           const internalDates = new Set(intOccurrences.map(o => getDateStr(o.occurrence_date)));
//           extOcc.forEach(eo => {
//             if (!internalDates.has(getDateStr(eo.occurrence_date))) intOccurrences.push(eo);
//           });

//           intOccurrences.sort((a, b) => new Date(b.occurrence_date) - new Date(a.occurrence_date));
//         } catch (extErr) {
//           console.warn("External API merge failed.", extErr.message);
//         }
//       }

//       setTask(intTask);
//       setInstances(intOccurrences);
//     } catch (err) {
//       setError("Could not load task details. " + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchTaskData(); }, [taskId]);

//   const fetchComments = async (occId) => {
//     try {
//       const res = await axios.get(`${API_BASE}/v1/internal/tasks/occurrences/${occId}/comments`, { withCredentials: true });
//       setComments(res.data);
//     } catch (err) {
//       console.error("Failed to fetch comments", err);
//     }
//   };

//   const openOccurrence = (occ) => {
//     setSelectedOcc(occ);
//     if (occ.occurrence_id) fetchComments(occ.occurrence_id);
//     else setComments([]);
//   };

//   const closeOccurrence = () => {
//     setSelectedOcc(null);
//     setComments([]);
//     setNewComment("");
//   };

//   const handleClaim = async () => {
//     if (!selectedOcc.occurrence_id) { alert("Cannot claim an external-only occurrence. It must be synchronized first."); return; }
//     setActionLoading(true);
//     try {
//       await axios.post(`${API_BASE}/v1/internal/tasks/occurrences/${selectedOcc.occurrence_id}/claim`, {
//         user_id: currentUser.id, user_name: currentUser.name, role: currentUser.role
//       }, { withCredentials: true });
//       await fetchTaskData();
//       closeOccurrence();
//     } catch (err) {
//       alert(`Error: ${err.response?.data?.error || err.message}`);
//     } finally { setActionLoading(false); }
//   };

//   const handleEscalate = async () => {
//     if (!selectedOcc.occurrence_id) return;
//     if (!window.confirm("Are you sure you want to escalate this task?")) return;
//     setActionLoading(true);
//     try {
//       await axios.post(`${API_BASE}/v1/internal/tasks/occurrences/${selectedOcc.occurrence_id}/escalate`, {
//         user_id: currentUser.id, user_name: currentUser.name
//       }, { withCredentials: true });
//       await fetchTaskData();
//       closeOccurrence();
//     } catch (err) {
//       alert(`Error: ${err.response?.data?.error || err.message}`);
//     } finally { setActionLoading(false); }
//   };

//   const handlePostComment = async () => {
//     if (!newComment.trim() || !selectedOcc.occurrence_id) return;
//     setActionLoading(true);
//     try {
//       await axios.post(`${API_BASE}/v1/internal/tasks/occurrences/${selectedOcc.occurrence_id}/comments`, {
//         user_id: currentUser.id, user_name: currentUser.name, role: currentUser.role, comment_text: newComment
//       }, { withCredentials: true });
//       setNewComment("");
//       await fetchComments(selectedOcc.occurrence_id);
//     } catch (err) {
//       alert(`Error posting comment: ${err.response?.data?.error || err.message}`);
//     } finally { setActionLoading(false); }
//   };

//   const filteredInstances = instances.filter(inst => {
//     if (statusFilter === "All statuses") return true;
//     return inst.status?.toLowerCase() === statusFilter.toLowerCase();
//   });

//   if (loading) return (
//     <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="flex h-screen items-center justify-center bg-[#F7F5F0]">
//       <div className="flex items-center gap-3 text-stone-500">
//         <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
//         <span className="text-sm font-medium">Loading task details…</span>
//       </div>
//     </div>
//   );

//   if (error || !task) return (
//     <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#F7F5F0] p-8">
//       <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors mb-5">
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//         </svg>
//         Back to Tasks
//       </button>
//       <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error || "Task not found."}</div>
//     </div>
//   );

//   const isAssigned = !!selectedOcc?.agent?.agent_id;
//   const isAgentAssignedToMe = selectedOcc?.agent?.agent_id === currentUser.id;
//   const isSuperAdminOrAdmin = currentUser.role === 1 || currentUser.role === 6;
//   const isClient = currentUser.role === 4;

//   const canClaim = !isClient && selectedOcc?.status === 'pending' && !isAssigned;
//   const canTakeOver = isSuperAdminOrAdmin && isAssigned && !isAgentAssignedToMe && selectedOcc?.status !== 'completed';
//   const canEscalate = isAgentAssignedToMe && selectedOcc?.status !== 'completed' && selectedOcc?.status !== 'escalated' && currentUser.role !== 1;
//   const canComment = isAssigned && (isSuperAdminOrAdmin || isClient || isAgentAssignedToMe);

//   return (
//     <>
//       <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');`}</style>
//       <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#F7F5F0] text-stone-900">
//         <div className="max-w-7xl mx-auto px-8 py-10 space-y-6">

//           {/* Breadcrumb / Header */}
//           <div className="flex items-center gap-3">
//             <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//               </svg>
//               Tasks
//             </button>
//             <svg className="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//             </svg>
//             <span className="text-sm font-semibold text-stone-900">{task.title}</span>
//           </div>

//           {/* Task Summary Card */}
//           <div className="bg-white border border-stone-200 rounded-2xl p-6">
//             <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400 mb-4">Summary</p>
//             <div className="flex justify-between items-start gap-6">
//               <div className="space-y-2 flex-1">
//                 <h2 className="text-lg font-semibold text-stone-900 leading-tight">{task.title}</h2>
//                 <p className="text-sm text-stone-600 leading-relaxed">{task.description}</p>
//                 <div className="flex items-center gap-1.5 pt-1">
//                   <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                   </svg>
//                   <span className="text-xs text-stone-500">Device: <span className="font-medium text-stone-700">{task.device_id}</span></span>
//                 </div>
//               </div>
//               <div className="flex flex-col gap-2 items-end flex-shrink-0">
//                 <span className={`inline-flex text-[11px] px-3 py-1 rounded-full font-medium ${task.is_active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-stone-100 text-stone-500 ring-1 ring-stone-200'}`}>
//                   {task.is_active ? 'Active' : 'Inactive'}
//                 </span>
//                 <span className="inline-flex text-[11px] px-3 py-1 rounded-full font-medium bg-stone-100 text-stone-600 ring-1 ring-stone-200">
//                   {task.kind === 'one_time' ? 'One-time' : 'Recurring'}
//                 </span>
//                 <span className={`inline-flex text-[11px] px-3 py-1 rounded-full font-medium capitalize ${PRIORITY_STYLES[task.priority_level] || PRIORITY_STYLES.medium}`}>
//                   {task.priority_level || 'medium'}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Instances Table */}
//           <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
//             <div className="flex justify-between items-center px-6 py-4 border-b border-stone-100">
//               <div>
//                 <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400">Scheduled Instances</p>
//                 <p className="text-xs text-stone-500 mt-0.5">{filteredInstances.length} {filteredInstances.length === 1 ? 'instance' : 'instances'}</p>
//               </div>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-300 bg-white transition-all"
//               >
//                 <option value="All statuses">All statuses</option>
//                 <option value="pending">Pending</option>
//                 <option value="in_progress">In Progress</option>
//                 <option value="escalated">Escalated</option>
//                 <option value="completed">Completed</option>
//               </select>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead>
//                   <tr className="border-b border-stone-100 bg-stone-50/60">
//                     <th className="px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400">Date</th>
//                     <th className="px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400">Status</th>
//                     <th className="px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400">Assigned Agent</th>
//                     <th className="px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400 text-right">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredInstances.length === 0 ? (
//                     <tr><td colSpan="4" className="py-16 text-center">
//                       <svg className="w-9 h-9 text-stone-200 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                       </svg>
//                       <p className="text-sm text-stone-400 font-medium">No instances found</p>
//                     </td></tr>
//                   ) : filteredInstances.map((inst, idx) => (
//                     <tr
//                       key={inst.occurrence_id || inst.occurrence_uuid || Math.random()}
//                       className={`hover:bg-stone-50 transition-colors cursor-pointer group ${idx < filteredInstances.length - 1 ? 'border-b border-stone-100' : ''}`}
//                       onClick={() => openOccurrence(inst)}
//                     >
//                       <td className="px-6 py-4 text-sm font-medium text-stone-800 whitespace-nowrap tabular-nums">
//                         {new Date(inst.occurrence_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex text-[11px] px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[inst.status] || STATUS_STYLES.pending}`}>
//                           {inst.status ? inst.status.replace('_', ' ') : 'Pending'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-stone-600">
//                         {inst.agent?.agent_name || <span className="italic text-stone-400">Unassigned</span>}
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 group-hover:text-stone-700 transition-colors">
//                           View Details
//                           <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//                           </svg>
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* Occurrence Modal */}
//         {selectedOcc && (
//           <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
//             <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col h-[88vh] border border-stone-200/80">

//               {/* Modal Header */}
//               <div className="flex justify-between items-start px-6 py-5 border-b border-stone-100">
//                 <div>
//                   <div className="flex items-center gap-2.5 mb-1">
//                     <span className={`inline-flex text-[11px] px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[selectedOcc.status] || STATUS_STYLES.pending}`}>
//                       {selectedOcc.status ? selectedOcc.status.replace('_', ' ') : 'Pending'}
//                     </span>
//                   </div>
//                   <h3 className="text-base font-semibold text-stone-900">
//                     {new Date(selectedOcc.occurrence_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
//                   </h3>
//                   <p className="text-xs text-stone-500 mt-0.5">
//                     Assigned to: <span className="font-medium text-stone-700">{selectedOcc.agent?.agent_name || 'Nobody'}</span>
//                   </p>
//                 </div>
//                 <button onClick={closeOccurrence} className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all">
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               {/* Agent Response */}
//               {selectedOcc.agent_response && (
//                 <div className="px-6 py-3.5 bg-blue-50/60 border-b border-blue-100">
//                   <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-blue-600 mb-1">Agent Response</p>
//                   <p className="text-sm text-stone-700 leading-relaxed">{selectedOcc.agent_response}</p>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="px-6 py-3.5 border-b border-stone-100 bg-stone-50/50 flex gap-2 flex-wrap">
//                 {canClaim && (
//                   <button onClick={handleClaim} disabled={actionLoading}
//                     className="inline-flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-50">
//                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
//                     </svg>
//                     Claim Task
//                   </button>
//                 )}
//                 {canTakeOver && (
//                   <button onClick={handleClaim} disabled={actionLoading}
//                     className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-700 active:scale-[0.98] transition-all disabled:opacity-50">
//                     Take Over Task
//                   </button>
//                 )}
//                 {canEscalate && (
//                   <button onClick={handleEscalate} disabled={actionLoading}
//                     className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50">
//                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                     </svg>
//                     Escalate Issue
//                   </button>
//                 )}
//                 {!canClaim && !canTakeOver && !canEscalate && (
//                   <span className="text-xs text-stone-400 italic flex items-center">No actions available for this occurrence</span>
//                 )}
//               </div>

//               {/* Attached Images */}
//               {selectedOcc.images && selectedOcc.images.length > 0 && (
//                 <div className="px-6 py-4 border-b border-stone-100">
//                   <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400 mb-3">Attachments</p>
//                   <div className="flex gap-3 overflow-x-auto pb-1">
//                     {selectedOcc.images.map((img, idx) => (
//                       <a key={idx} href={img.resource_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 group/img">
//                         <img src={img.resource_url} alt={img.original_name || "Attachment"} className="h-20 w-20 object-cover rounded-xl border border-stone-200 group-hover/img:opacity-80 transition-opacity" />
//                       </a>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Comments Thread */}
//               <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
//                 {comments.length === 0 ? (
//                   <div className="flex flex-col items-center justify-center h-full text-center py-10">
//                     <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
//                       <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                       </svg>
//                     </div>
//                     <p className="text-sm text-stone-400 font-medium">No messages yet</p>
//                     <p className="text-xs text-stone-300 mt-1">Start the conversation below</p>
//                   </div>
//                 ) : comments.map(c => {
//                   if (c.user_id === 'system') {
//                     return (
//                       <div key={c.id} className="flex justify-center">
//                         <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-500 text-[11px] px-4 py-1.5 rounded-full font-medium">
//                           <div className="w-1 h-1 rounded-full bg-stone-400" />
//                           {c.comment_text}
//                           <span className="text-stone-400">·</span>
//                           <span className="text-stone-400">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
//                         </div>
//                       </div>
//                     );
//                   }

//                   const isMe = c.user_id === currentUser.id;
//                   const roleLabel = c.user_role === 4 ? 'Client' : c.user_role === 6 ? 'Admin' : c.user_role === 1 ? 'Super Admin' : 'Agent';

//                   return (
//                     <div key={c.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
//                       <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
//                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${isMe ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-600'}`}>
//                           {c.user_name?.charAt(0)?.toUpperCase() || '?'}
//                         </div>
//                         <span className="text-[11px] font-medium text-stone-500">{c.user_name}</span>
//                         <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isMe ? 'bg-stone-100 text-stone-500' : 'bg-stone-100 text-stone-500'}`}>{roleLabel}</span>
//                       </div>
//                       <div className={`px-4 py-2.5 rounded-2xl max-w-[78%] text-sm leading-relaxed ${isMe ? 'bg-stone-900 text-white rounded-tr-sm' : 'bg-stone-100 text-stone-800 rounded-tl-sm'}`}>
//                         {c.comment_text}
//                       </div>
//                       <p className="text-[10px] text-stone-400 mt-1.5 tabular-nums">{new Date(c.created_at).toLocaleString()}</p>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Message Input */}
//               <div className="px-6 py-4 border-t border-stone-100 bg-white rounded-b-2xl">
//                 {canComment ? (
//                   <div className="flex gap-3 items-end">
//                     <input
//                       type="text"
//                       value={newComment}
//                       onChange={(e) => setNewComment(e.target.value)}
//                       onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
//                       placeholder="Write a message…"
//                       className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-300 transition-all placeholder:text-stone-400"
//                     />
//                     <button
//                       onClick={handlePostComment}
//                       disabled={actionLoading || !newComment.trim()}
//                       className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
//                     >
//                       Send
//                     </button>
//                   </div>
//                 ) : (
//                   <p className="text-center text-xs text-stone-400 italic py-1">
//                     {!isAssigned ? "This task must be claimed before anyone can reply." : "You do not have permission to reply to this occurrence."}
//                   </p>
//                 )}
//               </div>

//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default TaskDetails;


"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import ShellLayout from "../../ShellLayout"; // Adjust path if needed

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';
const API_BASE2 = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
const API_EXT = process.env.NEXT_PUBLIC_URL_ext || 'http://localhost:3001/api';

const STATUS_STYLES = {
  completed:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
  escalated:   "bg-red-50 text-red-700 border border-red-200",
  in_progress: "bg-blue-50 text-blue-700 border border-blue-200",
  pending:     "bg-gray-100 text-gray-600 border border-gray-200",
};

const PRIORITY_STYLES = {
  urgent: "bg-red-50 text-red-700 border border-red-200",
  high:   "bg-orange-50 text-orange-700 border border-orange-200",
  medium: "bg-blue-50 text-blue-700 border border-blue-200",
  low:    "bg-gray-100 text-gray-500 border border-gray-200",
};

export default function TaskDetails() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id;

  const [currentUser, setCurrentUser] = useState({ id: "", role: null, name: "" });
  const [task, setTask] = useState(null);
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [selectedOcc, setSelectedOcc] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Authentication & User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, { withCredentials: true });
        setCurrentUser({
          id: res.data.unique_id,
          role: parseInt(res.data.role, 10),
          name: res.data.fname ? `${res.data.fname} ${res.data.lname || ''}`.trim() : res.data.unique_id
        });
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    fetchUser();
  }, []);

  // Fetch Task Details & Merge External Data
  const fetchTaskData = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/v1/internal/tasks/${taskId}`, { withCredentials: true });
      let intTask = res.data.task;
      let intOccurrences = res.data.occurrences?.data || [];

      const getDateStr = (d) => {
        if (!d) return "";
        try { return new Date(d).toISOString().split('T')[0]; }
        catch (e) { return String(d).substring(0, 10); }
      };

      if (intTask.hk_task_id) {
        try {
          const externalApiToken = process.env.NEXT_PUBLIC_EXTERNAL_API_TOKEN;
          const extRes = await axios.get(`${API_EXT}api/v1/external/tasks/${intTask.hk_task_id}`, {
            headers: { Authorization: `Bearer ${externalApiToken}` }
          });

          const extTask = extRes.data.task || {};
          const extOcc = extRes.data.occurrences?.data || [];

          Object.keys(extTask).forEach(key => {
            const isInternalEmpty = intTask[key] === null || intTask[key] === undefined || intTask[key] === "" || (Array.isArray(intTask[key]) && intTask[key].length === 0);
            if (isInternalEmpty) intTask[key] = extTask[key];
          });

          intOccurrences = intOccurrences.map(intO => {
            const intDateStr = getDateStr(intO.occurrence_date);
            const matchedExtO = extOcc.find(eo => getDateStr(eo.occurrence_date) === intDateStr);
            if (matchedExtO) {
              const mergedO = { ...intO };
              Object.keys(matchedExtO).forEach(key => {
                const isEmpty = mergedO[key] === null || mergedO[key] === undefined || mergedO[key] === "" || (Array.isArray(mergedO[key]) && mergedO[key].length === 0);
                if (isEmpty) mergedO[key] = matchedExtO[key];
              });
              return mergedO;
            }
            return intO;
          });

          const internalDates = new Set(intOccurrences.map(o => getDateStr(o.occurrence_date)));
          extOcc.forEach(eo => {
            if (!internalDates.has(getDateStr(eo.occurrence_date))) intOccurrences.push(eo);
          });

          intOccurrences.sort((a, b) => new Date(b.occurrence_date) - new Date(a.occurrence_date));
        } catch (extErr) {
          console.warn("External API merge failed.", extErr.message);
        }
      }

      setTask(intTask);
      setInstances(intOccurrences);
    } catch (err) {
      setError("Could not load task details. " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTaskData(); }, [taskId]);

  const fetchComments = async (occId) => {
    try {
      const res = await axios.get(`${API_BASE}/v1/internal/tasks/occurrences/${occId}/comments`, { withCredentials: true });
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  const openOccurrence = (occ) => {
    setSelectedOcc(occ);
    if (occ.occurrence_id) fetchComments(occ.occurrence_id);
    else setComments([]);
  };

  const closeOccurrence = () => {
    setSelectedOcc(null);
    setComments([]);
    setNewComment("");
  };

  const handleClaim = async () => {
    if (!selectedOcc.occurrence_id) { alert("Cannot claim an external-only occurrence. It must be synchronized first."); return; }
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE}/v1/internal/tasks/occurrences/${selectedOcc.occurrence_id}/claim`, {
        user_id: currentUser.id, user_name: currentUser.name, role: currentUser.role
      }, { withCredentials: true });
      await fetchTaskData();
      closeOccurrence();
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`);
    } finally { setActionLoading(false); }
  };

  const handleEscalate = async () => {
    if (!selectedOcc.occurrence_id) return;
    if (!window.confirm("Are you sure you want to escalate this task?")) return;
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE}/v1/internal/tasks/occurrences/${selectedOcc.occurrence_id}/escalate`, {
        user_id: currentUser.id, user_name: currentUser.name
      }, { withCredentials: true });
      await fetchTaskData();
      closeOccurrence();
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`);
    } finally { setActionLoading(false); }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !selectedOcc.occurrence_id) return;
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE}/v1/internal/tasks/occurrences/${selectedOcc.occurrence_id}/comments`, {
        user_id: currentUser.id, user_name: currentUser.name, role: currentUser.role, comment_text: newComment
      }, { withCredentials: true });
      setNewComment("");
      await fetchComments(selectedOcc.occurrence_id);
    } catch (err) {
      alert(`Error posting comment: ${err.response?.data?.error || err.message}`);
    } finally { setActionLoading(false); }
  };

  const filteredInstances = instances.filter(inst => {
    if (statusFilter === "All statuses") return true;
    return inst.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  // State Views
  if (loading) {
    return (
      <ShellLayout>
        <div className="flex h-full min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-semibold">Loading task details…</span>
          </div>
        </div>
      </ShellLayout>
    );
  }

  if (error || !task) {
    return (
      <ShellLayout>
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Tasks
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm font-medium shadow-sm">
            {error || "Task not found."}
          </div>
        </div>
      </ShellLayout>
    );
  }

  // Permissions
  const isAssigned = !!selectedOcc?.agent?.agent_id;
  const isAgentAssignedToMe = selectedOcc?.agent?.agent_id === currentUser.id;
  const isSuperAdminOrAdmin = currentUser.role === 1 || currentUser.role === 6;
  const isClient = currentUser.role === 4;

  const canClaim = !isClient && selectedOcc?.status === 'pending' && !isAssigned;
  const canTakeOver = isSuperAdminOrAdmin && isAssigned && !isAgentAssignedToMe && selectedOcc?.status !== 'completed';
  const canEscalate = isAgentAssignedToMe && selectedOcc?.status !== 'completed' && selectedOcc?.status !== 'escalated' && currentUser.role !== 1;
  const canComment = isAssigned && (isSuperAdminOrAdmin || isClient || isAgentAssignedToMe);

  return (
    <ShellLayout>
      <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">

        {/* Breadcrumb / Header */}
        <div className="flex items-center gap-3 bg-white px-5 py-3.5 rounded-xl border border-gray-200 shadow-sm">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Tasks
          </button>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          <span className="text-sm font-bold text-gray-900 truncate">{task.title}</span>
        </div>

        {/* Task Summary Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="space-y-3 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Task Overview</p>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">{task.title}</h2>
              <p className="text-sm font-medium text-gray-600 leading-relaxed max-w-3xl">{task.description}</p>
              <div className="flex items-center gap-2 pt-2">
                <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Target Device: <span className="text-gray-900 font-extrabold">{task.device_id}</span>
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap lg:flex-col gap-3 items-end shrink-0">
              <span className={`inline-flex text-[11px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider ${task.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                {task.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="inline-flex text-[11px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-200">
                {task.kind === 'one_time' ? 'One-time' : 'Recurring'}
              </span>
              <span className={`inline-flex text-[11px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider ${PRIORITY_STYLES[task.priority_level] || PRIORITY_STYLES.medium}`}>
                {task.priority_level || 'medium'}
              </span>
            </div>
          </div>
        </div>

        {/* Instances Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <div>
              <p className="text-sm font-bold text-gray-900">Scheduled Instances</p>
              <p className="text-xs font-medium text-gray-500 mt-1">{filteredInstances.length} {filteredInstances.length === 1 ? 'instance' : 'instances'} found</p>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm transition-all"
            >
              <option value="All statuses">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="escalated">Escalated</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">Assigned Agent</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInstances.length === 0 ? (
                  <tr><td colSpan="4" className="py-16 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-500">No instances match your filter.</p>
                  </td></tr>
                ) : filteredInstances.map((inst) => (
                  <tr
                    key={inst.occurrence_id || inst.occurrence_uuid || Math.random()}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    onClick={() => openOccurrence(inst)}
                  >
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                      {new Date(inst.occurrence_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex text-[11px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${STATUS_STYLES[inst.status] || STATUS_STYLES.pending}`}>
                        {inst.status ? inst.status.replace('_', ' ') : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                      {inst.agent?.agent_name || <span className="italic text-gray-400 font-normal">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 group-hover:text-blue-600 transition-colors">
                        View Details
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Occurrence Modal */}
        {selectedOcc && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col h-[88vh] border border-gray-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="flex justify-between items-start px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex text-[11px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${STATUS_STYLES[selectedOcc.status] || STATUS_STYLES.pending}`}>
                      {selectedOcc.status ? selectedOcc.status.replace('_', ' ') : 'Pending'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                    {new Date(selectedOcc.occurrence_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 mt-1">
                    Assigned to: <span className="font-bold text-gray-900">{selectedOcc.agent?.agent_name || 'Nobody'}</span>
                  </p>
                </div>
                <button onClick={closeOccurrence} className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Agent Response */}
              {selectedOcc.agent_response && (
                <div className="px-8 py-5 bg-blue-50/80 border-b border-blue-100">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-2">Resolution Note</p>
                  <p className="text-sm font-medium text-blue-900 leading-relaxed">{selectedOcc.agent_response}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="px-8 py-4 border-b border-gray-100 bg-gray-50/30 flex gap-3 flex-wrap">
                {canClaim && (
                  <button onClick={handleClaim} disabled={actionLoading} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
                    Claim Task
                  </button>
                )}
                {canTakeOver && (
                  <button onClick={handleClaim} disabled={actionLoading} className="inline-flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Take Over Task
                  </button>
                )}
                {canEscalate && (
                  <button onClick={handleEscalate} disabled={actionLoading} className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Escalate Issue
                  </button>
                )}
                {!canClaim && !canTakeOver && !canEscalate && (
                  <span className="text-xs font-semibold text-gray-400 italic flex items-center bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">No actions available</span>
                )}
              </div>

              {/* Attached Images */}
              {selectedOcc.images && selectedOcc.images.length > 0 && (
                <div className="px-8 py-5 border-b border-gray-100 bg-white">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Attachments</p>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {selectedOcc.images.map((img, idx) => (
                      <a key={idx} href={img.resource_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 group/img block rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <img src={img.resource_url} alt={img.original_name || "Attachment"} className="h-24 w-24 object-cover group-hover/img:scale-105 group-hover/img:opacity-90 transition-all duration-300" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Thread */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5 bg-gray-50/30">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-900">No activity yet</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">Updates and messages will appear here.</p>
                  </div>
                ) : comments.map(c => {
                  if (c.user_id === 'system') {
                    return (
                      <div key={c.id} className="flex justify-center my-4">
                        <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-600 text-[11px] px-4 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          {c.comment_text}
                          <span className="text-gray-300 mx-1">|</span>
                          <span className="text-gray-400 font-mono">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  }

                  const isMe = c.user_id === currentUser.id;
                  const roleLabel = c.user_role === 4 ? 'Client' : c.user_role === 6 ? 'Admin' : c.user_role === 1 ? 'Super Admin' : 'Agent';

                  return (
                    <div key={c.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm border ${isMe ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-700 border-gray-200'}`}>
                          {c.user_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-xs font-bold text-gray-700">{c.user_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">{roleLabel}</span>
                      </div>
                      <div className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm font-medium leading-relaxed shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-sm border border-blue-700' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'}`}>
                        {c.comment_text}
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1.5 uppercase tracking-wider">{new Date(c.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="px-8 py-5 border-t border-gray-200 bg-white">
                {canComment ? (
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-xl px-5 py-3.5 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 bg-gray-50 focus:bg-white"
                    />
                    <button
                      onClick={handlePostComment}
                      disabled={actionLoading || !newComment.trim()}
                      className="bg-blue-600 text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-shrink-0 inline-flex items-center gap-2"
                    >
                      Send Message
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 py-3 rounded-xl border border-gray-200">
                    {!isAssigned ? "Task must be claimed before replying." : "You do not have permission to reply."}
                  </p>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </ShellLayout>
  );
}