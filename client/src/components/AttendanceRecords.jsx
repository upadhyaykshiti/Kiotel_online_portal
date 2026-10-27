


// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   FaCalendarAlt,
//   FaCalendarCheck,
//   FaClock,
//   FaSignInAlt,
//   FaSignOutAlt,
//   FaFileDownload,
//   FaChevronLeft,
//   FaChevronRight,
//   FaHourglass,
//   FaCheckCircle,
//   FaSearch,
//   FaTimes,
//   FaShieldAlt,
// } from "react-icons/fa";

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

// const MONTHS = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December",
// ];

// export default function AttendanceRecords({ uniqueId, employeeName }) {
//   const [viewMode, setViewMode] = useState("month");
//   const [selectedDate, setSelectedDate] = useState(() => {
//     const now = new Date();
//     const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
//     return ist.toISOString().slice(0, 10);
//   });
//   const [selectedYear, setSelectedYear] = useState(() => {
//     const now = new Date();
//     const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
//     return ist.getUTCFullYear();
//   });
//   const [selectedMonth, setSelectedMonth] = useState(() => {
//     const now = new Date();
//     const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
//     return ist.getUTCMonth() + 1;
//   });

//   const [attendanceData, setAttendanceData] = useState(null);
//   const [attendanceLoading, setAttendanceLoading] = useState(false);
//   const [attendanceError, setAttendanceError] = useState("");
//   const [downloading, setDownloading] = useState(false);

//   useEffect(() => {
//     if (!uniqueId) return;
//     fetchAttendance();
//   }, [uniqueId, viewMode, selectedDate, selectedYear, selectedMonth]);

//   const fetchAttendance = async () => {
//     if (!uniqueId) return;
//     setAttendanceLoading(true);
//     setAttendanceError("");
//     setAttendanceData(null);

//     try {
//       let url;
//       if (viewMode === "date") {
//         url = `${API_BASE_URL}/employee/attendance/by-date?unique_id=${encodeURIComponent(uniqueId)}&date=${selectedDate}`;
//       } else {
//         url = `${API_BASE_URL}/employee/attendance/by-month?unique_id=${encodeURIComponent(uniqueId)}&year=${selectedYear}&month=${selectedMonth}`;
//       }

//       const res = await axios.get(url);
//       if (res.data.success) {
//         setAttendanceData(res.data.data);
//       } else {
//         setAttendanceError(res.data.message || "Failed to fetch records");
//       }
//     } catch (err) {
//       setAttendanceError("Failed to fetch attendance records.");
//     } finally {
//       setAttendanceLoading(false);
//     }
//   };

//   const handleDownload = async () => {
//     if (!uniqueId) return;
//     setDownloading(true);

//     try {
//       const y = viewMode === "date" ? selectedDate.split("-")[0] : selectedYear;
//       const m = viewMode === "date" ? parseInt(selectedDate.split("-")[1], 10) : selectedMonth;

//       const url = `${API_BASE_URL}/employee/attendance/download?unique_id=${encodeURIComponent(uniqueId)}&year=${y}&month=${m}&employee_name=${encodeURIComponent(employeeName || "")}`;

//       const response = await axios.get(url, { responseType: "blob" });

//       const blob = new Blob([response.data], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });

//       const link = document.createElement("a");
//       link.href = window.URL.createObjectURL(blob);
//       link.download = `Attendance_${(employeeName || uniqueId).replace(/\s+/g, "_")}_${MONTHS[m - 1]}_${y}.xlsx`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(link.href);
//     } catch (err) {
//       console.error("Download failed:", err);
//       alert("Failed to download report. Please try again.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const goToPrevMonth = () => {
//     if (selectedMonth === 1) {
//       setSelectedMonth(12);
//       setSelectedYear(selectedYear - 1);
//     } else {
//       setSelectedMonth(selectedMonth - 1);
//     }
//   };

//   const goToNextMonth = () => {
//     if (selectedMonth === 12) {
//       setSelectedMonth(1);
//       setSelectedYear(selectedYear + 1);
//     } else {
//       setSelectedMonth(selectedMonth + 1);
//     }
//   };

//   const records = attendanceData?.records || [];

//   return (
//     <div>
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <div className="inline-flex rounded-xl shadow-sm overflow-hidden border border-gray-200">
//             <button
//               onClick={() => setViewMode("date")}
//               className={`px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${
//                 viewMode === "date" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
//               }`}
//             >
//               <FaCalendarAlt className="text-xs" /> By Date
//             </button>
//             <button
//               onClick={() => setViewMode("month")}
//               className={`px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${
//                 viewMode === "month" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
//               }`}
//             >
//               <FaCalendarCheck className="text-xs" /> By Month
//             </button>
//           </div>

//           <div className="flex items-center gap-3 flex-wrap">
//             {viewMode === "date" ? (
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm font-medium"
//               />
//             ) : (
//               <div className="flex items-center gap-2">
//                 <button onClick={goToPrevMonth} className="p-2.5 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition">
//                   <FaChevronLeft className="text-gray-600 text-xs" />
//                 </button>
//                 <div className="px-5 py-2.5 bg-gray-50 rounded-xl border-2 border-gray-200 font-semibold text-gray-800 text-sm min-w-[160px] text-center">
//                   {MONTHS[selectedMonth - 1]} {selectedYear}
//                 </div>
//                 <button onClick={goToNextMonth} className="p-2.5 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition">
//                   <FaChevronRight className="text-gray-600 text-xs" />
//                 </button>
//               </div>
//             )}

//             <button
//               onClick={handleDownload}
//               disabled={downloading || records.length === 0}
//               className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm ${
//                 downloading || records.length === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700 hover:shadow-md"
//               }`}
//             >
//               <FaFileDownload />
//               {downloading ? "Downloading..." : "Download Excel"}
//             </button>
//           </div>
//         </div>
//       </div>

//       {viewMode === "month" && attendanceData?.summary && (
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
//             <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2"><FaCalendarCheck className="text-blue-600" /></div>
//             <p className="text-2xl font-bold text-gray-900">{attendanceData.summary.total_days_present}</p>
//             <p className="text-xs text-gray-500 font-medium">Days Present</p>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
//             <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-2"><FaCheckCircle className="text-green-600" /></div>
//             <p className="text-2xl font-bold text-gray-900">{attendanceData.summary.completed_sessions}</p>
//             <p className="text-xs text-gray-500 font-medium">Completed</p>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
//             <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mb-2"><FaHourglass className="text-orange-500" /></div>
//             <p className="text-2xl font-bold text-gray-900">{attendanceData.summary.in_progress_sessions}</p>
//             <p className="text-xs text-gray-500 font-medium">In Progress</p>
//           </div>
//           {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
//             <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mb-2"><FaClock className="text-purple-600" /></div>
//             <p className="text-2xl font-bold text-gray-900">{attendanceData.summary.total_working_hours}</p>
//             <p className="text-xs text-gray-500 font-medium">Total Hours</p>
//           </div> */}
//         </div>
//       )}

//       <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//         {attendanceLoading ? (
//           <div className="flex items-center justify-center py-20">
//             <div className="text-center">
//               <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-3"></div>
//               <p className="text-gray-500 font-medium">Loading records...</p>
//             </div>
//           </div>
//         ) : attendanceError ? (
//           <div className="flex items-center justify-center py-20">
//             <div className="text-center">
//               <p className="text-red-500 font-semibold">{attendanceError}</p>
//               <button onClick={fetchAttendance} className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">Retry</button>
//             </div>
//           </div>
//         ) : records.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-20">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4"><FaSearch className="text-gray-400 text-2xl" /></div>
//             <p className="text-gray-500 font-semibold text-lg">No records found</p>
//             <p className="text-gray-400 text-sm mt-1">{viewMode === "date" ? `No attendance on ${selectedDate}` : `No records for ${MONTHS[selectedMonth - 1]} ${selectedYear}`}</p>
//           </div>
//         ) : (
//           <>
//             <div className="hidden lg:block overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
//                     <th className="px-5 py-4 text-left font-semibold whitespace-nowrap">Date</th>
//                     <th className="px-5 py-4 text-left font-semibold">Day</th>
//                     <th className="px-5 py-4 text-left font-semibold">Shift</th>
//                     <th className="px-5 py-4 text-center font-semibold">Clock In</th>
//                     <th className="px-5 py-4 text-center font-semibold">Clock Out</th>
//                     <th className="px-5 py-4 text-center font-semibold">Late In</th>
//                     <th className="px-5 py-4 text-center font-semibold">Early Out</th>
//                     <th className="px-5 py-4 text-center font-semibold">Penalty</th>
//                     {/* <th className="px-5 py-4 text-center font-semibold">Hours</th> */}
//                     <th className="px-5 py-4 text-center font-semibold">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {records.map((record, index) => {
//                     const dateObj = new Date(record.attendance_date + "T00:00:00");
//                     const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
//                     const isSunday = dateObj.getDay() === 0;

//                     return (
//                       <tr key={record.id || index} className={`border-b border-gray-100 transition-colors ${isSunday ? "bg-red-50/50" : index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/50`}>
//                         <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">{record.attendance_date}</td>
//                         <td className={`px-5 py-3.5 font-medium ${isSunday ? "text-red-500" : "text-gray-600"}`}>{dayName}</td>
//                         <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">{record.shift_name}</td>
//                         <td className="px-5 py-3.5 text-center whitespace-nowrap">
//                           <span className="inline-flex items-center gap-1.5 text-green-700 font-medium"><FaSignInAlt className="text-xs" />{record.clock_in || "—"}</span>
//                         </td>
//                         <td className="px-5 py-3.5 text-center whitespace-nowrap">
//                           <span className={`inline-flex items-center gap-1.5 font-medium ${record.clock_out ? "text-red-600" : "text-gray-400"}`}><FaSignOutAlt className="text-xs" />{record.clock_out || "—"}</span>
//                         </td>
                        
//                         <td className="px-5 py-3.5 text-center whitespace-nowrap">
//                           {record.is_late_waived ? (
//                             <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-bold">
//                               <FaShieldAlt className="text-[10px]" /> 0 (Waived)
//                             </span>
//                           ) : record.late_minutes > 0 ? (
//                             <span className="text-red-600 font-semibold">{record.late_minutes} min</span>
//                           ) : (
//                             <span className="text-gray-400">—</span>
//                           )}
//                         </td>

//                         <td className="px-5 py-3.5 text-center whitespace-nowrap">
//                           {record.early_minutes > 0 ? (
//                             <span className="text-orange-600 font-semibold">{record.early_minutes} min</span>
//                           ) : (
//                             <span className="text-gray-400">—</span>
//                           )}
//                         </td>

//                         <td className="px-5 py-3.5 text-center whitespace-nowrap">
//                           {record.total_penalty > 0 ? (
//                             <span className="text-red-700 font-bold bg-red-50 px-2 py-1 rounded">{record.total_penalty} min</span>
//                           ) : (
//                             <span className="text-gray-400">—</span>
//                           )}
//                         </td>

//                         {/* <td className="px-5 py-3.5 text-center font-semibold text-gray-800 whitespace-nowrap">{record.working_hours?.display || "—"}</td> */}
//                         <td className="px-5 py-3.5 text-center whitespace-nowrap">
//                           {record.status === "completed" ? (
//                             <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><FaCheckCircle className="text-[10px]" />Done</span>
//                           ) : (
//                             <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold"><FaHourglass className="text-[10px]" />Active</span>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             <div className="lg:hidden divide-y divide-gray-100">
//               {records.map((record, index) => {
//                 const dateObj = new Date(record.attendance_date + "T00:00:00");
//                 const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });

//                 return (
//                   <div key={record.id || index} className="p-4">
//                     <div className="flex items-center justify-between mb-3">
//                       <div>
//                         <p className="font-bold text-gray-900">{record.attendance_date}</p>
//                         <p className="text-xs text-gray-500">{dayName} • {record.shift_name}</p>
//                       </div>
//                       {record.status === "completed" ? (
//                         <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Done</span>
//                       ) : (
//                         <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Active</span>
//                       )}
//                     </div>
                    
//                     <div className="grid grid-cols-3 gap-2 text-center mb-2">
//                       <div className="bg-green-50 rounded-lg p-2 flex flex-col justify-center">
//                         <p className="text-[10px] text-gray-500 mb-0.5">In</p>
//                         <p className="text-xs font-semibold text-green-700 truncate">{record.clock_in || "—"}</p>
//                       </div>
//                       <div className="bg-red-50 rounded-lg p-2 flex flex-col justify-center">
//                         <p className="text-[10px] text-gray-500 mb-0.5">Out</p>
//                         <p className="text-xs font-semibold text-red-600 truncate">{record.clock_out || "—"}</p>
//                       </div>
//                       <div className="bg-blue-50 rounded-lg p-2 flex flex-col justify-center">
//                         <p className="text-[10px] text-gray-500 mb-0.5">Hours</p>
//                         <p className="text-xs font-semibold text-blue-700 truncate">{record.working_hours?.display || "—"}</p>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-3 gap-2 text-center">
//                       <div className="bg-amber-50 rounded-lg p-2 flex flex-col justify-center items-center">
//                         <p className="text-[10px] text-gray-500 mb-0.5">Late</p>
//                         {record.is_late_waived ? (
//                           <span className="text-[9px] font-bold text-blue-700 leading-tight">0<br/>(Waived)</span>
//                         ) : record.late_minutes > 0 ? (
//                           <p className="text-xs font-semibold text-red-600 truncate">{record.late_minutes}m</p>
//                         ) : (
//                           <p className="text-xs font-semibold text-gray-400">—</p>
//                         )}
//                       </div>
//                       <div className="bg-orange-50 rounded-lg p-2 flex flex-col justify-center items-center">
//                         <p className="text-[10px] text-gray-500 mb-0.5">Early</p>
//                         {record.early_minutes > 0 ? (
//                           <p className="text-xs font-semibold text-orange-600 truncate">{record.early_minutes}m</p>
//                         ) : (
//                           <p className="text-xs font-semibold text-gray-400">—</p>
//                         )}
//                       </div>
//                       <div className="bg-red-100 rounded-lg p-2 flex flex-col justify-center items-center">
//                         <p className="text-[10px] text-gray-600 mb-0.5 font-semibold">Penalty</p>
//                         {record.total_penalty > 0 ? (
//                           <p className="text-xs font-bold text-red-700 truncate">{record.total_penalty}m</p>
//                         ) : (
//                           <p className="text-xs font-semibold text-gray-400">—</p>
//                         )}
//                       </div>
//                     </div>

//                   </div>
//                 );
//               })}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaClock,
  FaSignInAlt,
  FaSignOutAlt,
  FaFileDownload,
  FaChevronLeft,
  FaChevronRight,
  FaHourglass,
  FaCheckCircle,
  FaSearch,
  FaTimes,
  FaShieldAlt,
} from "react-icons/fa";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AttendanceRecords({ uniqueId, employeeName }) {
  const [viewMode, setViewMode] = useState("month");
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return ist.toISOString().slice(0, 10);
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date();
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return ist.getUTCFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return ist.getUTCMonth() + 1;
  });

  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!uniqueId) return;
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueId, viewMode, selectedDate, selectedYear, selectedMonth]);

  const fetchAttendance = async () => {
    if (!uniqueId) return;
    setAttendanceLoading(true);
    setAttendanceError("");
    setAttendanceData(null);

    try {
      let url;
      if (viewMode === "date") {
        url = `${API_BASE_URL}/employee/attendance/by-date?unique_id=${encodeURIComponent(
          uniqueId
        )}&date=${selectedDate}`;
      } else {
        url = `${API_BASE_URL}/employee/attendance/by-month?unique_id=${encodeURIComponent(
          uniqueId
        )}&year=${selectedYear}&month=${selectedMonth}`;
      }

      const res = await axios.get(url);
      if (res.data.success) {
        setAttendanceData(res.data.data);
      } else {
        setAttendanceError(res.data.message || "Failed to fetch records");
      }
    } catch (err) {
      setAttendanceError("Failed to fetch attendance records.");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!uniqueId) return;
    setDownloading(true);

    try {
      const y = viewMode === "date" ? selectedDate.split("-")[0] : selectedYear;
      const m =
        viewMode === "date"
          ? parseInt(selectedDate.split("-")[1], 10)
          : selectedMonth;

      const url = `${API_BASE_URL}/employee/attendance/download?unique_id=${encodeURIComponent(
        uniqueId
      )}&year=${y}&month=${m}&employee_name=${encodeURIComponent(
        employeeName || ""
      )}`;

      const response = await axios.get(url, { responseType: "blob" });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Attendance_${(employeeName || uniqueId).replace(
        /\s+/g,
        "_"
      )}_${MONTHS[m - 1]}_${y}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const goToPrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const records = attendanceData?.records || [];

  // NEW: Total penalty block should be visible only for previous months (IST month)
  const now = new Date();
  const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const currentISTYear = istNow.getUTCFullYear();
  const currentISTMonth = istNow.getUTCMonth() + 1;

  const isPreviousMonth =
    viewMode === "month" &&
    (selectedYear < currentISTYear ||
      (selectedYear === currentISTYear && selectedMonth < currentISTMonth));

  const totalPenaltyForMonth = records.reduce(
    (sum, r) => sum + (Number(r.total_penalty) || 0),
    0
  );

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="inline-flex rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <button
              onClick={() => setViewMode("date")}
              className={`px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${
                viewMode === "date"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FaCalendarAlt className="text-xs" /> By Date
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${
                viewMode === "month"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FaCalendarCheck className="text-xs" /> By Month
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {viewMode === "date" ? (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm font-medium"
              />
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevMonth}
                  className="p-2.5 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition"
                >
                  <FaChevronLeft className="text-gray-600 text-xs" />
                </button>
                <div className="px-5 py-2.5 bg-gray-50 rounded-xl border-2 border-gray-200 font-semibold text-gray-800 text-sm min-w-[160px] text-center">
                  {MONTHS[selectedMonth - 1]} {selectedYear}
                </div>
                <button
                  onClick={goToNextMonth}
                  className="p-2.5 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition"
                >
                  <FaChevronRight className="text-gray-600 text-xs" />
                </button>
              </div>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading || records.length === 0}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm ${
                downloading || records.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 hover:shadow-md"
              }`}
            >
              <FaFileDownload />
              {downloading ? "Downloading..." : "Download Excel"}
            </button>
          </div>
        </div>
      </div>

      {viewMode === "month" && attendanceData?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
              <FaCalendarCheck className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {attendanceData.summary.total_days_present}
            </p>
            <p className="text-xs text-gray-500 font-medium">Days Present</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-2">
              <FaCheckCircle className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {attendanceData.summary.completed_sessions}
            </p>
            <p className="text-xs text-gray-500 font-medium">Completed</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mb-2">
              <FaHourglass className="text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {attendanceData.summary.in_progress_sessions}
            </p>
            <p className="text-xs text-gray-500 font-medium">In Progress</p>
          </div>

          {/* NEW: Total Penalty (only for previous months) */}
          {isPreviousMonth ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mb-2">
                <FaTimes className="text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {totalPenaltyForMonth} min
              </p>
              <p className="text-xs text-gray-500 font-medium">Total Penalty</p>
            </div>
          ) : (
            // keeps the grid aligned (4 columns on sm+) without showing the block
            <div className="hidden sm:block" />
          )}

          {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mb-2"><FaClock className="text-purple-600" /></div>
            <p className="text-2xl font-bold text-gray-900">{attendanceData.summary.total_working_hours}</p>
            <p className="text-xs text-gray-500 font-medium">Total Hours</p>
          </div> */}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {attendanceLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-3"></div>
              <p className="text-gray-500 font-medium">Loading records...</p>
            </div>
          </div>
        ) : attendanceError ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-500 font-semibold">{attendanceError}</p>
              <button
                onClick={fetchAttendance}
                className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FaSearch className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-500 font-semibold text-lg">
              No records found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {viewMode === "date"
                ? `No attendance on ${selectedDate}`
                : `No records for ${MONTHS[selectedMonth - 1]} ${selectedYear}`}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                    <th className="px-5 py-4 text-left font-semibold whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-5 py-4 text-left font-semibold">Day</th>
                    <th className="px-5 py-4 text-left font-semibold">
                      Shift
                    </th>
                    <th className="px-5 py-4 text-center font-semibold">
                      Clock In
                    </th>
                    <th className="px-5 py-4 text-center font-semibold">
                      Clock Out
                    </th>
                    <th className="px-5 py-4 text-center font-semibold">
                      Late In
                    </th>
                    <th className="px-5 py-4 text-center font-semibold">
                      Early Out
                    </th>
                    <th className="px-5 py-4 text-center font-semibold">
                      Penalty
                    </th>
                    {/* <th className="px-5 py-4 text-center font-semibold">Hours</th> */}
                    <th className="px-5 py-4 text-center font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => {
                    const dateObj = new Date(record.attendance_date + "T00:00:00");
                    const dayName = dateObj.toLocaleDateString("en-US", {
                      weekday: "short",
                    });
                    const isSunday = dateObj.getDay() === 0;

                    return (
                      <tr
                        key={record.id || index}
                        className={`border-b border-gray-100 transition-colors ${
                          isSunday
                            ? "bg-red-50/50"
                            : index % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50/50"
                        } hover:bg-blue-50/50`}
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                          {record.attendance_date}
                        </td>
                        <td
                          className={`px-5 py-3.5 font-medium ${
                            isSunday ? "text-red-500" : "text-gray-600"
                          }`}
                        >
                          {dayName}
                        </td>
                        <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">
                          {record.shift_name}
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-green-700 font-medium">
                            <FaSignInAlt className="text-xs" />
                            {record.clock_in || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 font-medium ${
                              record.clock_out ? "text-red-600" : "text-gray-400"
                            }`}
                          >
                            <FaSignOutAlt className="text-xs" />
                            {record.clock_out || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          {record.is_late_waived ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-bold">
                              <FaShieldAlt className="text-[10px]" /> 0
                              (Waived)
                            </span>
                          ) : record.late_minutes > 0 ? (
                            <span className="text-red-600 font-semibold">
                              {record.late_minutes} min
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          {record.is_early_waived ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-bold">
                              <FaShieldAlt className="text-[10px]" /> 0
                              (Waived)
                            </span>
                          ) : record.early_minutes > 0 ? (
                            <span className="text-orange-600 font-semibold">
                              {record.early_minutes} min
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          {record.total_penalty > 0 ? (
                            <span className="text-red-700 font-bold bg-red-50 px-2 py-1 rounded">
                              {record.total_penalty} min
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* <td className="px-5 py-3.5 text-center font-semibold text-gray-800 whitespace-nowrap">{record.working_hours?.display || "—"}</td> */}
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          {record.status === "completed" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              <FaCheckCircle className="text-[10px]" />
                              Done
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                              <FaHourglass className="text-[10px]" />
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-gray-100">
              {records.map((record, index) => {
                const dateObj = new Date(record.attendance_date + "T00:00:00");
                const dayName = dateObj.toLocaleDateString("en-US", {
                  weekday: "short",
                });

                return (
                  <div key={record.id || index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">
                          {record.attendance_date}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dayName} • {record.shift_name}
                        </p>
                      </div>
                      {record.status === "completed" ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Done
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center mb-2">
                      <div className="bg-green-50 rounded-lg p-2 flex flex-col justify-center">
                        <p className="text-[10px] text-gray-500 mb-0.5">In</p>
                        <p className="text-xs font-semibold text-green-700 truncate">
                          {record.clock_in || "—"}
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2 flex flex-col justify-center">
                        <p className="text-[10px] text-gray-500 mb-0.5">Out</p>
                        <p className="text-xs font-semibold text-red-600 truncate">
                          {record.clock_out || "—"}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 flex flex-col justify-center">
                        <p className="text-[10px] text-gray-500 mb-0.5">
                          Hours
                        </p>
                        <p className="text-xs font-semibold text-blue-700 truncate">
                          {record.working_hours?.display || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-amber-50 rounded-lg p-2 flex flex-col justify-center items-center">
                        <p className="text-[10px] text-gray-500 mb-0.5">
                          Late
                        </p>
                        {record.is_late_waived ? (
                          <span className="text-[9px] font-bold text-blue-700 leading-tight">
                            0
                            <br />
                            (Waived)
                          </span>
                        ) : record.late_minutes > 0 ? (
                          <p className="text-xs font-semibold text-red-600 truncate">
                            {record.late_minutes}m
                          </p>
                        ) : (
                          <p className="text-xs font-semibold text-gray-400">
                            —
                          </p>
                        )}
                      </div>
                      <div className="bg-orange-50 rounded-lg p-2 flex flex-col justify-center items-center">
                        <p className="text-[10px] text-gray-500 mb-0.5">
                          Early
                        </p>
                        {record.is_early_waived ? (
                          <span className="text-[9px] font-bold text-blue-700 leading-tight">
                            0
                            <br />
                            (Waived)
                          </span>
                        ) : record.early_minutes > 0 ? (
                          <p className="text-xs font-semibold text-orange-600 truncate">
                            {record.early_minutes}m
                          </p>
                        ) : (
                          <p className="text-xs font-semibold text-gray-400">
                            —
                          </p>
                        )}
                      </div>
                      <div className="bg-red-100 rounded-lg p-2 flex flex-col justify-center items-center">
                        <p className="text-[10px] text-gray-600 mb-0.5 font-semibold">
                          Penalty
                        </p>
                        {record.total_penalty > 0 ? (
                          <p className="text-xs font-bold text-red-700 truncate">
                            {record.total_penalty}m
                          </p>
                        ) : (
                          <p className="text-xs font-semibold text-gray-400">
                            —
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}