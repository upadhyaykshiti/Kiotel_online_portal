
// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import AddTaskModal from "./AddTaskModal";
// import EditTaskModal from "./EditTaskModal";

// const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';
// const API_BASE2 = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
// const API_EXT = process.env.NEXT_PUBLIC_URL_ext || 'http://localhost:3001/api';

// const PRIORITY_STYLES = {
//   urgent: "bg-red-50 text-red-700 ring-1 ring-red-200",
//   high:   "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
//   medium: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
//   low:    "bg-stone-100 text-stone-500 ring-1 ring-stone-200",
// };

// const TaskManager = () => {
//   const router = useRouter();

//   const [userUniqueId, setUserUniqueId] = useState("");
//   const [userRole, setUserRole] = useState(null);
//   const [authLoading, setAuthLoading] = useState(true);
//   const [tasks, setTasks] = useState([]);
//   const [properties, setProperties] = useState([]);
//   const [selectedPropertyFilter, setSelectedPropertyFilter] = useState("ALL");
//   const [searchTitle, setSearchTitle] = useState("");
//   const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingTask, setEditingTask] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await axios.get(`${API_BASE2}/api/user-email`, { withCredentials: true });
//         setUserUniqueId(res.data.unique_id);
//         setUserRole(parseInt(res.data.role, 10));
//       } catch (err) {
//         console.error("Failed to fetch user:", err);
//         setErrorMessage("Authentication error: Please make sure you are logged in.");
//       } finally {
//         setAuthLoading(false);
//       }
//     };
//     fetchUser();
//   }, []);

//   const fetchProperties = async () => {
//     try {
//       const url = (userRole === 1 || userRole === 3)
//         ? `${API_BASE}/admin/properties`
//         : `${API_BASE}/customer/properties?customer_id=${userUniqueId}`;
//       const res = await axios.get(url, { withCredentials: true });
//       setProperties(res.data.properties || res.data);
//     } catch (err) {
//       console.error("Failed to fetch properties:", err);
//     }
//   };

//   const fetchTasks = async () => {
//     setLoading(true);
//     setErrorMessage("");
//     try {
//       const url = `${API_BASE}/v1/internal/tasks?customer_id=${userUniqueId}&device_id=${selectedPropertyFilter}&role=${userRole}`;
//       const res = await axios.get(url, { withCredentials: true });
//       setTasks(res.data);
//     } catch (err) {
//       console.error("Failed to fetch tasks:", err);
//       setErrorMessage(`Task Fetch Error: ${err.response?.data?.error || err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (userUniqueId && userRole !== null) {
//       fetchProperties();
//       fetchTasks();
//     }
//   }, [userUniqueId, userRole, selectedPropertyFilter]);

//   const handleDeleteTask = async (e, task) => {
//     e.stopPropagation();
//     if (!window.confirm("Are you sure you want to delete this task?")) return;
//     try {
//       const externalApiToken = process.env.NEXT_PUBLIC_EXTERNAL_API_TOKEN;
//       if (task.hk_task_id) {
//         try {
//           await axios.delete(`${API_EXT}api/v1/external/tasks/${task.hk_task_id}`, {
//             headers: { Authorization: `Bearer ${externalApiToken}` }
//           });
//         } catch (extErr) {
//           throw new Error(`External API Error: ${extErr.response?.data?.error || extErr.message}`);
//         }
//       }
//       await axios.delete(`${API_BASE}/v1/internal/tasks/${task.id}`, { withCredentials: true });
//       fetchTasks();
//     } catch (err) {
//       alert(`Delete Error: ${err.message || err.response?.data?.error}`);
//     }
//   };

//   const handleToggleActive = async (e, task) => {
//     e.stopPropagation();
//     try {
//       const externalApiToken = process.env.NEXT_PUBLIC_EXTERNAL_API_TOKEN;
//       if (task.hk_task_id) {
//         try {
//           await axios.patch(`${API_EXT}api/v1/external/tasks/${task.hk_task_id}`, { is_active: !task.is_active }, {
//             headers: { Authorization: `Bearer ${externalApiToken}` }
//           });
//         } catch (extErr) {
//           throw new Error(`External API Error: ${extErr.response?.data?.error || extErr.message}`);
//         }
//       }
//       await axios.patch(`${API_BASE}/v1/internal/tasks/${task.id}`, { is_active: !task.is_active }, { withCredentials: true });
//       fetchTasks();
//     } catch (err) {
//       alert(`Update Error: ${err.message || err.response?.data?.error}`);
//     }
//   };

//   const filteredTasks = tasks.filter(task => {
//     const matchesTitle = task.title.toLowerCase().includes(searchTitle.toLowerCase());
//     const matchesType = selectedTypeFilter === "ALL" || task.kind === selectedTypeFilter;
//     return matchesTitle && matchesType;
//   });

//   const formatRecurringDays = (daysData) => {
//     if (!daysData) return "—";
//     try {
//       const daysArray = typeof daysData === 'string' ? JSON.parse(daysData) : daysData;
//       return Array.isArray(daysArray) && daysArray.length > 0 ? daysArray.join(", ") : "—";
//     } catch (e) { return "—"; }
//   };

//   const formatDateUTC = (dateString) => {
//     if (!dateString) return "—";
//     const date = new Date(dateString);
//     return `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`;
//   };

//   if (authLoading) return (
//     <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="flex h-screen items-center justify-center bg-[#F7F5F0]">
//       <div className="flex items-center gap-3 text-stone-500">
//         <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
//         <span className="text-sm font-medium">Authenticating…</span>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');`}</style>
//       <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#F7F5F0] text-stone-900">
//         <div className="max-w-7xl mx-auto px-8 py-10 space-y-6">

//           {/* Header */}
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center">
//                 <svg className="w-[17px] h-[17px] text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//                 </svg>
//               </div>
//               <div>
//                 <h1 className="text-xl font-semibold tracking-tight leading-tight">Tasks</h1>
//                 <p className="text-xs text-stone-400 mt-0.5">Manage and track all task assignments</p>
//               </div>
//             </div>
//             <button
//               onClick={() => setIsModalOpen(true)}
//               disabled={!userUniqueId}
//               className="inline-flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
//             >
//               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
//               </svg>
//               Add Task
//             </button>
//           </div>

//           {/* Error */}
//           {errorMessage && (
//             <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
//               <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//               </svg>
//               <span><strong className="font-semibold">Error: </strong>{errorMessage}</span>
//             </div>
//           )}

//           {/* Filters */}
//           <div className="bg-white border border-stone-200 rounded-2xl p-5">
//             <div className="flex flex-col md:flex-row gap-4">
//               {[
//                 { label: "Title", el: (
//                   <input type="text" placeholder="Search by title…" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)}
//                     className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-300 transition-all" />
//                 )},
//                 { label: "Device", el: (
//                   <select value={selectedPropertyFilter} onChange={(e) => setSelectedPropertyFilter(e.target.value)}
//                     disabled={!userUniqueId || properties.length === 0}
//                     className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-300 transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed">
//                     <option value="ALL">All devices</option>
//                     {properties.map(p => <option key={p.property_id} value={p.property_id}>{p.property_name} ({p.property_id})</option>)}
//                   </select>
//                 )},
//                 { label: "Type", el: (
//                   <select value={selectedTypeFilter} onChange={(e) => setSelectedTypeFilter(e.target.value)}
//                     className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-300 transition-all bg-white">
//                     <option value="ALL">All types</option>
//                     <option value="recurring">Recurring</option>
//                     <option value="one_time">One-time</option>
//                   </select>
//                 )},
//               ].map(({ label, el }) => (
//                 <div key={label} className="flex-1 w-full">
//                   <label className="block text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400 mb-2">{label}</label>
//                   {el}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Table */}
//           <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead>
//                   <tr className="border-b border-stone-100 bg-stone-50/60">
//                     <th className="px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400 w-[22%]">Title</th>
//                     <th className="px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400">Device</th>
//                     <th className="px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400">Type</th>
//                     <th className="px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400">Recurring Days</th>
//                     <th className="px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400">Priority</th>
//                     <th className="px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400">Active</th>
//                     <th className="px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400">Created</th>
//                     <th className="px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400 text-right">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     <tr><td colSpan="8" className="py-20 text-center">
//                       <div className="inline-flex items-center gap-2.5 text-stone-400">
//                         <div className="w-4 h-4 border-2 border-stone-200 border-t-stone-400 rounded-full animate-spin" />
//                         <span className="text-sm font-medium">Loading tasks…</span>
//                       </div>
//                     </td></tr>
//                   ) : filteredTasks.length === 0 ? (
//                     <tr><td colSpan="8" className="py-20 text-center">
//                       <svg className="w-9 h-9 text-stone-200 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                       </svg>
//                       <p className="text-sm text-stone-400 font-medium">No tasks found</p>
//                     </td></tr>
//                   ) : filteredTasks.map((task, idx) => (
//                     <tr
//                       key={task.id}
//                       className={`hover:bg-stone-50 transition-colors cursor-pointer group ${idx < filteredTasks.length - 1 ? 'border-b border-stone-100' : ''}`}
//                       onClick={() => router.push(`/tasks/${task.id}`)}
//                     >
//                       <td className="px-6 py-4">
//                         <p className="text-sm font-semibold text-stone-900 leading-snug">{task.title}</p>
//                         <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[200px]">{task.description}</p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-sm font-medium text-stone-800">{task.device_id}</p>
//                         <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[150px]">{task.property_name || '—'}</p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex text-[11px] px-2.5 py-1 rounded-full font-medium ${task.kind === 'recurring' ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' : 'bg-stone-100 text-stone-600 ring-1 ring-stone-200'}`}>
//                           {task.kind === 'one_time' ? 'One-time' : 'Recurring'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-xs text-stone-500 font-mono tracking-tight">{formatRecurringDays(task.recurring_days)}</td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex text-[11px] px-2.5 py-1 rounded-full font-medium capitalize ${PRIORITY_STYLES[task.priority_level] || PRIORITY_STYLES.medium}`}>
//                           {task.priority_level}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <button
//                           onClick={(e) => handleToggleActive(e, task)}
//                           className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${task.is_active ? 'bg-stone-900' : 'bg-stone-200'}`}
//                         >
//                           <span className={`inline-block h-4 w-4 mt-0.5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${task.is_active ? 'translate-x-4.5' : 'translate-x-0.5'}`} style={{ marginLeft: task.is_active ? '17px' : '2px' }} />
//                         </button>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-stone-500 whitespace-nowrap tabular-nums">{formatDateUTC(task.created_at)}</td>
//                       <td className="px-6 py-4 text-right">
//                         <div className="flex justify-end items-center gap-0.5">
//                           <button onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}
//                             className="p-2 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-all" title="Edit">
//                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//                             </svg>
//                           </button>
//                           <button onClick={(e) => handleDeleteTask(e, task)}
//                             className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete">
//                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                             </svg>
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {!loading && filteredTasks.length > 0 && (
//               <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/40">
//                 <p className="text-[11px] text-stone-400 font-medium">{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {isModalOpen && <AddTaskModal userUniqueId={userUniqueId} properties={properties} onClose={() => setIsModalOpen(false)} onTaskCreated={fetchTasks} />}
//         {editingTask && <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} onTaskUpdated={fetchTasks} />}
//       </div>
//     </>
//   );
// };

// export default TaskManager;


"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useGlobal } from "../GlobalContext";
import ShellLayout from "../ShellLayout";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';
const API_EXT = process.env.NEXT_PUBLIC_URL_ext || 'http://localhost:3001/api';

const PRIORITY_STYLES = {
  urgent: "bg-red-50 text-red-700 ring-1 ring-red-200",
  high:   "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  medium: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  low:    "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
};

export default function TaskManager() {
  const router = useRouter();
  const { user, customerProperties, selectedProperty } = useGlobal();

  const [tasks, setTasks] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchTasks = async () => {
    if (!user || !selectedProperty) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const url = `${API_BASE}/v1/internal/tasks?customer_id=${user.unique_id}&device_id=${selectedProperty.property_id}&role=${user.role}`;
      const res = await axios.get(url, { withCredentials: true });
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setErrorMessage(`Task Fetch Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, selectedProperty]);

  const handleDeleteTask = async (e, task) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const externalApiToken = process.env.NEXT_PUBLIC_EXTERNAL_API_TOKEN;
      if (task.hk_task_id) {
        await axios.delete(`${API_EXT}api/v1/external/tasks/${task.hk_task_id}`, {
          headers: { Authorization: `Bearer ${externalApiToken}` }
        });
      }
      await axios.delete(`${API_BASE}/v1/internal/tasks/${task.id}`, { withCredentials: true });
      fetchTasks();
    } catch (err) {
      alert(`Delete Error: ${err.message || err.response?.data?.error}`);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesTitle = task.title.toLowerCase().includes(searchTitle.toLowerCase());
    const matchesType = selectedTypeFilter === "ALL" || task.kind === selectedTypeFilter;
    return matchesTitle && matchesType;
  });

  return (
    <ShellLayout>
      <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Task Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage operations for <span className="font-semibold text-blue-600">{selectedProperty?.property_name || "All"}</span></p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add New Task
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Search Title</label>
              <input type="text" placeholder="Search tasks..." value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Task Type</label>
              <select value={selectedTypeFilter} onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white cursor-pointer">
                <option value="ALL">All Types</option>
                <option value="recurring">Recurring</option>
                <option value="one_time">One-time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 w-1/3">Task Details</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Priority</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="4" className="py-16 text-center"><div className="w-8 h-8 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div></td></tr>
                ) : filteredTasks.length === 0 ? (
                  <tr><td colSpan="4" className="py-16 text-center text-sm text-gray-500 font-medium">No tasks found.</td></tr>
                ) : filteredTasks.map(task => (
                  <tr key={task.id} onClick={() => router.push(`/tasks/${task.id}`)} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate max-w-sm">{task.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${task.kind === 'recurring' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        {task.kind === 'one_time' ? 'One-time' : 'Recurring'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${PRIORITY_STYLES[task.priority_level]}`}>
                        {task.priority_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setEditingTask(task); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={(e) => handleDeleteTask(e, task)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && <AddTaskModal userUniqueId={user?.unique_id} properties={customerProperties} onClose={() => setIsModalOpen(false)} onTaskCreated={fetchTasks} />}
        {editingTask && <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} onTaskUpdated={fetchTasks} />}
      </div>
    </ShellLayout>
  );
}