// 'use client';

// import { useState } from 'react';
// import { format, parseISO } from 'date-fns';

// export default function EmployeeAttendanceModal({ employeeData, onClose }) {
//   const [previewImage, setPreviewImage] = useState(null);

//   if (!employeeData) return null;

//   const { employee, attendance_records } = employeeData;

//   return (
//     <>
//       {/* ================= MAIN MODAL ================= */}
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
//         <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">

//           {/* Header */}
//           <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
//             <h2 className="text-xl font-semibold text-gray-900">
//               Employee Attendance Details
//             </h2>
//             <button
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-800 text-2xl"
//             >
//               ×
//             </button>
//           </div>

//           {/* Employee Info */}
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
//                 <span className="text-xl font-bold text-gray-600">
//                   {employee.name.charAt(0)}
//                 </span>
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   {employee.name}
//                 </h3>
//                 <p className="text-gray-600">Employee ID: {employee.unique_id}</p>
//                 <p className="text-gray-600">
//                   Default Shift ID: {employee.default_shift_id || 'N/A'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Attendance Table */}
//           <div className="p-6">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">
//               Attendance Records
//             </h3>

//             {attendance_records && attendance_records.length > 0 ? (
//               <div className="overflow-x-auto">
//                 <table className="w-full min-w-[800px]">
//                   <thead>
//                     <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
//                       <th className="px-4 py-3">Date</th>
//                       <th className="px-4 py-3">Shift</th>
//                       <th className="px-4 py-3">Clock In</th>
//                       <th className="px-4 py-3">Clock Out</th>
//                       <th className="px-4 py-3">Photo In</th>
//                       <th className="px-4 py-3">Photo Out</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {attendance_records.map((record, index) => (
//                       <tr key={index} className="hover:bg-gray-50">
//                         <td className="px-4 py-3 text-gray-600">
//                           {record.attendance_date}
//                         </td>

//                         <td className="px-4 py-3 text-gray-700">
//                           <div>{record.shift_name || '—'}</div>
//                           <div className="text-xs text-gray-500">
//                             {record.start_time} - {record.end_time}
//                           </div>
//                         </td>

//                         <td className="px-4 py-3 text-gray-600">
//                           {record.clock_in
//                             ? format(parseISO(record.clock_in), 'h:mm a')
//                             : '—'}
//                         </td>

//                         <td className="px-4 py-3 text-gray-600">
//                           {record.clock_out
//                             ? format(parseISO(record.clock_out), 'h:mm a')
//                             : '—'}
//                         </td>

//                         {/* Photo In */}
//                         <td className="px-4 py-3">
//                           {record.photo_in_url ? (
//                             <button
//                               onClick={() => setPreviewImage(record.photo_in_url)}
//                               className="text-blue-600 hover:underline"
//                             >
//                               View
//                             </button>
//                           ) : (
//                             <span className="text-gray-400">—</span>
//                           )}
//                         </td>

//                         {/* Photo Out */}
//                         <td className="px-4 py-3">
//                           {record.photo_out_url ? (
//                             <button
//                               onClick={() => setPreviewImage(record.photo_out_url)}
//                               className="text-blue-600 hover:underline"
//                             >
//                               View
//                             </button>
//                           ) : (
//                             <span className="text-gray-400">—</span>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <div className="text-center py-8 text-gray-500">
//                 No attendance records found.
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ================= IMAGE PREVIEW MODAL ================= */}
//       {previewImage && (
//         <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
//           <div className="relative bg-white rounded-lg p-4 max-w-3xl max-h-[90vh]">

//             {/* Close */}
//             <button
//               onClick={() => setPreviewImage(null)}
//               className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
//             >
//               ✕
//             </button>

//             {/* Image */}
//             <img
//               src={previewImage}
//               alt="Attendance"
//               className="max-w-full max-h-[80vh] object-contain"
//               onError={(e) => {
//                 e.target.src = '/image-not-found.png'; // optional fallback
//               }}
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }


// 'use client';

// import { useState } from 'react';
// import { format, parseISO } from 'date-fns';
// import { FaUser, FaCalendarAlt, FaClock, FaTimes, FaImage, FaIdBadge } from 'react-icons/fa';

// export default function EmployeeAttendanceModal({ employeeData, onClose }) {
//   const [previewImage, setPreviewImage] = useState(null);

//   if (!employeeData) return null;

//   const { employee, attendance_records } = employeeData;
// const formatTime = (value, version) => {
//   if (!value) return '—';

//   // 🟢 VERSION 2 — NO timezone conversion
//   if (version === 2) {
//     try {
//       let hours, minutes;

//       // Case 1: ISO string (2026-01-28T06:35:13.000Z)
//       if (value.includes('T')) {
//         const timePart = value.split('T')[1].replace('Z', '');
//         [hours, minutes] = timePart.split(':').map(Number);
//       }
//       // Case 2: MySQL datetime (2026-01-28 12:05:13)
//       else if (value.includes(' ')) {
//         const timePart = value.split(' ')[1];
//         [hours, minutes] = timePart.split(':').map(Number);
//       } else {
//         return '—';
//       }

//       if (Number.isNaN(hours) || Number.isNaN(minutes)) return '—';

//       const hour12 = hours % 12 || 12;
//       const ampm = hours >= 12 ? 'PM' : 'AM';

//       return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
//     } catch {
//       return '—';
//     }
//   }

//   // 🟡 VERSION 1 — legacy behavior (UNCHANGED)
//   try {
//     return format(parseISO(value), 'h:mm a');
//   } catch {
//     return '—';
//   }
// };


//   return (
//     <>
//       {/* ================= MAIN MODAL ================= */}
//       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-2 sm:p-4 animate-fadeIn">
//         <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">

//           {/* Header */}
//           <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 p-4 sm:p-6 flex justify-between items-center shadow-lg z-10">
//             <div className="flex items-center gap-3">
//               <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
//                 <FaUser className="text-white text-lg sm:text-xl" />
//               </div>
//               <div>
//                 <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
//                   Employee Attendance Details
//                 </h2>
//                 <p className="text-xs sm:text-sm text-blue-100 hidden sm:block">
//                   View attendance records and clock-in history
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="h-10 w-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 flex items-center justify-center group"
//             >
//               <FaTimes className="text-white text-xl group-hover:rotate-90 transition-transform duration-300" />
//             </button>
//           </div>

//           {/* Scrollable Content */}
//           <div className="flex-1 overflow-y-auto">
//             {/* Employee Info Card */}
//             <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
//               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
//                 <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
//                   <span className="text-2xl sm:text-3xl font-bold text-white">
//                     {employee.name.charAt(0)}
//                   </span>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 truncate">
//                     {employee.name}
//                   </h3>
//                   <div className="flex flex-wrap gap-3 sm:gap-4">
//                     <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-blue-200 shadow-sm">
//                       <FaIdBadge className="text-blue-600 flex-shrink-0" />
//                       <span className="text-sm font-medium text-gray-700">
//                         ID: <span className="text-gray-900">{employee.unique_id}</span>
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-blue-200 shadow-sm">
//                       <FaClock className="text-blue-600 flex-shrink-0" />
//                       <span className="text-sm font-medium text-gray-700">
//                         Shift: <span className="text-gray-900">{employee.default_shift_id || 'N/A'}</span>
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Attendance Records Section */}
//             <div className="p-4 sm:p-6">
//               <div className="flex items-center gap-3 mb-4 sm:mb-6">
//                 <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
//                   <FaCalendarAlt className="text-white" />
//                 </div>
//                 <h3 className="text-lg sm:text-xl font-bold text-gray-900">
//                   Attendance Records
//                   {attendance_records && attendance_records.length > 0 && (
//                     <span className="ml-2 text-sm font-normal text-gray-500">
//                       ({attendance_records.length} records)
//                     </span>
//                   )}
//                 </h3>
//               </div>

//               {attendance_records && attendance_records.length > 0 ? (
//                 <div className="overflow-x-auto -mx-4 sm:mx-0">
//                   <div className="inline-block min-w-full align-middle">
//                     <div className="overflow-hidden rounded-xl border border-gray-200 shadow-md">
//                       <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-gradient-to-r from-blue-600 to-blue-500">
//                           <tr>
//                             <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
//                               Date
//                             </th>
//                             <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
//                               Shift Details
//                             </th>
//                             <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
//                               Clock In
//                             </th>
//                             <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
//                               Clock Out
//                             </th>
//                             <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
//                               Photos
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-100">
//                           {attendance_records.map((record, index) => (
//                             <tr 
//                               key={index} 
//                               className="hover:bg-blue-50 transition-colors duration-200"
//                             >
//                               {/* Date */}
//                               <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
//                                 <div className="flex items-center gap-2">
//                                   <FaCalendarAlt className="text-blue-600 flex-shrink-0 hidden sm:block" />
//                                   <span className="text-sm font-medium text-gray-900">
//                                     {record.attendance_date}
//                                   </span>
//                                 </div>
//                               </td>

//                               {/* Shift Details */}
//                               <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
//                                 <div className="text-sm">
//                                   <div className="font-semibold text-gray-900">
//                                     {record.shift_name || '—'}
//                                   </div>
//                                   <div className="text-xs text-gray-500 mt-0.5">
//                                     {record.start_time} - {record.end_time}
//                                   </div>
//                                 </div>
//                               </td>

//                               {/* Clock In */}
//                               <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
//                                 <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium ${
//                                   record.clock_in 
//                                     ? 'bg-green-100 text-green-800' 
//                                     : 'bg-gray-100 text-gray-500'
//                                 }`}>
//                                   {/* {record.clock_in
//                                     ? format(parseISO(record.clock_in), 'h:mm a')
//                                     : '—'} */}
//                                     {record.clock_in
//   ? formatTime(record.clock_in, record.timezone_logic_version)
//   : '—'}

//                                 </span>
//                               </td>

//                               {/* Clock Out */}
//                               <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
//                                 <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium ${
//                                   record.clock_out 
//                                     ? 'bg-red-100 text-red-800' 
//                                     : 'bg-gray-100 text-gray-500'
//                                 }`}>
//                                   {/* {record.clock_out
//                                     ? format(parseISO(record.clock_out), 'h:mm a')
//                                     : '—'} */}
//                                     {record.clock_out
//   ? formatTime(record.clock_out, record.timezone_logic_version)
//   : '—'}

//                                 </span>
//                               </td>

//                               {/* Photos */}
//                               <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
//                                 <div className="flex items-center justify-center gap-2">
//                                   {/* Photo In */}
//                                   {record.photo_in_url ? (
//                                     <button
//                                       onClick={() => setPreviewImage(record.photo_in_url)}
//                                       className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md group"
//                                     >
//                                       <FaImage className="group-hover:scale-110 transition-transform" />
//                                       <span className="hidden sm:inline">In</span>
//                                     </button>
//                                   ) : (
//                                     <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg">
//                                       <span className="hidden sm:inline">No In</span>
//                                       <span className="sm:hidden">—</span>
//                                     </span>
//                                   )}

//                                   {/* Photo Out */}
//                                   {record.photo_out_url ? (
//                                     <button
//                                       onClick={() => setPreviewImage(record.photo_out_url)}
//                                       className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md group"
//                                     >
//                                       <FaImage className="group-hover:scale-110 transition-transform" />
//                                       <span className="hidden sm:inline">Out</span>
//                                     </button>
//                                   ) : (
//                                     <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg">
//                                       <span className="hidden sm:inline">No Out</span>
//                                       <span className="sm:hidden">—</span>
//                                     </span>
//                                   )}
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center py-12 sm:py-16">
//                   <div className="inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 bg-gray-100 rounded-full mb-4">
//                     <FaCalendarAlt className="text-gray-400 text-2xl sm:text-3xl" />
//                   </div>
//                   <p className="text-gray-500 text-sm sm:text-base font-medium">
//                     No attendance records found
//                   </p>
//                   <p className="text-gray-400 text-xs sm:text-sm mt-2">
//                     This employee has not clocked in yet
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="sticky bottom-0 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
//               <p className="text-xs sm:text-sm text-gray-500">
//                 Powered by Kiotel Attendance System
//               </p>
//               <button
//                 onClick={onClose}
//                 className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ================= IMAGE PREVIEW MODAL ================= */}
//       {previewImage && (
//         <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
//           <div className="relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 max-w-4xl max-h-[90vh] shadow-2xl animate-zoomIn">
            
//             {/* Close Button */}
//             <button
//               onClick={() => setPreviewImage(null)}
//               className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-10"
//             >
//               <FaTimes className="text-lg sm:text-xl group-hover:rotate-90 transition-transform duration-300" />
//             </button>

//             {/* Image Container */}
//             <div className="relative">
//               <img
//                 src={previewImage}
//                 alt="Attendance Photo"
//                 className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
//                 onError={(e) => {
//                   e.target.src = '/image-not-found.png';
//                 }}
//               />
//             </div>

//             {/* Image Label */}
//             <div className="mt-4 text-center">
//               <p className="text-sm text-gray-600 font-medium">
//                 Attendance Photo
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Styles */}
//       <style jsx>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }

//         @keyframes slideUp {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes zoomIn {
//           from {
//             opacity: 0;
//             transform: scale(0.95);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }

//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }

//         .animate-slideUp {
//           animation: slideUp 0.3s ease-out;
//         }

//         .animate-zoomIn {
//           animation: zoomIn 0.3s ease-out;
//         }
//       `}</style>
//     </>
//   );
// }



'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FaUser, FaCalendarAlt, FaClock, FaTimes, FaImage, FaIdBadge } from 'react-icons/fa';

export default function EmployeeAttendanceModal({ employeeData, onClose }) {
  const [previewImage, setPreviewImage] = useState(null);

  // ✅ Safely destructure with defaults
  const employee = employeeData?.employee || { name: 'Unknown', unique_id: 'N/A', default_shift_id: 'N/A' };
  const attendance_records = Array.isArray(employeeData?.attendance_records) 
    ? employeeData.attendance_records 
    : [];

  const formatTime = (value, version) => {
    if (!value || typeof value !== 'string') return '—';

    // 🟢 VERSION 2 — NO timezone conversion
    if (version === 2) {
      try {
        let hours, minutes;

        // Case 1: ISO string (2026-01-28T06:35:13.000Z)
        if (value.includes('T')) {
          const timePart = value.split('T')[1].replace('Z', '');
          const [h, m] = timePart.split(':');
          hours = parseInt(h, 10);
          minutes = parseInt(m, 10);
        }
        // Case 2: MySQL datetime (2026-01-28 12:05:13)
        else if (value.includes(' ')) {
          const timePart = value.split(' ')[1];
          const [h, m] = timePart.split(':');
          hours = parseInt(h, 10);
          minutes = parseInt(m, 10);
        } else {
          return '—';
        }

        if (isNaN(hours) || isNaN(minutes)) return '—';

        const hour12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';

        return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
      } catch {
        return '—';
      }
    }

    // 🟡 VERSION 1 — legacy behavior
    try {
      return format(parseISO(value), 'h:mm a');
    } catch {
      return '—';
    }
  };

  // ✅ Use stable key: prefer record.id or attendance_date + employee_id if available
  const getRecordKey = (record, index) => {
    if (record.id) return record.id;
    if (record.attendance_date && record.employee_id) {
      return `${record.employee_id}-${record.attendance_date}`;
    }
    return index; // fallback (safe only if list doesn’t reorder)
  };

  return (
    <>
      {/* ================= MAIN MODAL ================= */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-2 sm:p-4 animate-fadeIn">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">

          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 p-4 sm:p-6 flex justify-between items-center shadow-lg z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FaUser className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  Employee Attendance Details
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 hidden sm:block">
                  View attendance records and clock-in history
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 flex items-center justify-center group"
            >
              <FaTimes className="text-white text-xl group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Employee Info Card */}
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {employee.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 truncate">
                    {employee.name || 'Unknown Employee'}
                  </h3>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-blue-200 shadow-sm">
                      <FaIdBadge className="text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">
                        ID: <span className="text-gray-900">{employee.unique_id || 'N/A'}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-blue-200 shadow-sm">
                      <FaClock className="text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">
                        Shift: <span className="text-gray-900">{employee.default_shift_id || 'N/A'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Records Section */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <FaCalendarAlt className="text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Attendance Records
                  {attendance_records.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({attendance_records.length} records)
                    </span>
                  )}
                </h3>
              </div>

              {attendance_records.length > 0 ? (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-600 to-blue-500">
                          <tr>
                            <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                              Shift Details
                            </th>
                            <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                              Clock In
                            </th>
                            <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                              Clock Out
                            </th>
                            <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                              Photos
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {attendance_records.map((record, index) => (
                            <tr 
                              key={getRecordKey(record, index)} // ✅ FIXED: stable key
                              className="hover:bg-blue-50 transition-colors duration-200"
                            >
                              {/* Date */}
                              <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <FaCalendarAlt className="text-blue-600 flex-shrink-0 hidden sm:block" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {record.attendance_date || '—'}
                                  </span>
                                </div>
                              </td>

                              {/* Shift Details */}
                              <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                                <div className="text-sm">
                                  <div className="font-semibold text-gray-900">
                                    {record.shift_name || '—'}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {record.start_time || '—'} - {record.end_time || '—'}
                                  </div>
                                </div>
                              </td>

                              {/* Clock In */}
                              <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium ${
                                  record.clock_in 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {record.clock_in
                                    ? formatTime(record.clock_in, record.timezone_logic_version ?? 1)
                                    : '—'}
                                </span>
                              </td>

                              {/* Clock Out */}
                              <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium ${
                                  record.clock_out 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {record.clock_out
                                    ? formatTime(record.clock_out, record.timezone_logic_version ?? 1)
                                    : '—'}
                                </span>
                              </td>

                              {/* Photos */}
                              <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                                <div className="flex items-center justify-center gap-2">
                                  {/* Photo In */}
                                  {record.photo_in_url ? (
                                    <button
                                      onClick={() => setPreviewImage(record.photo_in_url)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md group"
                                    >
                                      <FaImage className="group-hover:scale-110 transition-transform" />
                                      <span className="hidden sm:inline">In</span>
                                    </button>
                                  ) : (
                                    <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg">
                                      <span className="hidden sm:inline">No In</span>
                                      <span className="sm:hidden">—</span>
                                    </span>
                                  )}

                                  {/* Photo Out */}
                                  {record.photo_out_url ? (
                                    <button
                                      onClick={() => setPreviewImage(record.photo_out_url)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md group"
                                    >
                                      <FaImage className="group-hover:scale-110 transition-transform" />
                                      <span className="hidden sm:inline">Out</span>
                                    </button>
                                  ) : (
                                    <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg">
                                      <span className="hidden sm:inline">No Out</span>
                                      <span className="sm:hidden">—</span>
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 bg-gray-100 rounded-full mb-4">
                    <FaCalendarAlt className="text-gray-400 text-2xl sm:text-3xl" />
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base font-medium">
                    No attendance records found
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-2">
                    This employee has no attendance data for the selected period
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-gray-500">
                Powered by Kiotel Attendance System
              </p>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= IMAGE PREVIEW MODAL ================= */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 max-w-4xl max-h-[90vh] shadow-2xl animate-zoomIn">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-10"
            >
              <FaTimes className="text-lg sm:text-xl group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <div className="relative">
              <img
                src={previewImage}
                alt="Attendance Photo"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = '/image-not-found.png';
                }}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 font-medium">
                Attendance Photo
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-zoomIn { animation: zoomIn 0.3s ease-out; }
      `}</style>
    </>
  );
}