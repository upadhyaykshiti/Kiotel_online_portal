// import React, { useState, useEffect } from 'react';
// import { format, getDaysInMonth, parseISO } from 'date-fns';
// import { FaTimes, FaImage, FaClock } from 'react-icons/fa';

// const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';

// export default function EmployeeMonthlyPhotosModal({ employeeId, employeeName, year, month, onClose }) {
//   const [loading, setLoading] = useState(true);
//   const [daysData, setDaysData] = useState([]);

//   useEffect(() => {
//     const fetchPhotos = async () => {
//       setLoading(true);
//       try {
//         // Now using your custom backend endpoint
//         const res = await fetch(`${API_BASE}/clockin/admin/employee/${encodeURIComponent(employeeId)}/monthly-photos?year=${year}&month=${month}`);
//         const result = await res.json();
        
//         const dbRecords = result.success && Array.isArray(result.data) ? result.data : [];

//         // Generate all days in the selected month
//         const daysInMonth = getDaysInMonth(new Date(year, month - 1));
//         const allDays = Array.from({ length: daysInMonth }, (_, i) => {
//           const d = new Date(year, month - 1, i + 1);
//           const dateString = format(d, 'yyyy-MM-dd');
          
//           // Filter records matching this date using the 'formatted_date' from your backend query
//           const recordsForDay = dbRecords.filter(r => r.formatted_date === dateString);
          
//           return {
//             date: dateString,
//             dayName: format(d, 'EEE, MMM d'),
//             isSunday: d.getDay() === 0,
//             records: recordsForDay
//           };
//         });

//         setDaysData(allDays);
//       } catch (err) {
//         console.error('Failed to fetch employee monthly photos', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (employeeId) {
//       fetchPhotos();
//     } else {
//       setLoading(false);
//     }
//   }, [employeeId, year, month]);

//   const formatTime = (timeStr) => {
//     if (!timeStr) return '—';
//     if (timeStr === 'Missed') return 'Missed';
//     try {
//       if (timeStr.includes('T')) return format(parseISO(timeStr), 'h:mm a');
//       return timeStr;
//     } catch {
//       return timeStr;
//     }
//   };

//   const renderPhotoBox = (url, label, time) => {
//     return (
//       <div className="flex flex-col items-center flex-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
//         <div className="w-full flex justify-between items-center mb-2 px-1">
//           <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</span>
//           {time && time !== '—' && (
//             <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
//               <FaClock className="text-[9px]" /> {formatTime(time)}
//             </span>
//           )}
//         </div>
        
//         {url ? (
//           <div className="relative w-full aspect-square max-w-[160px] rounded-lg overflow-hidden border border-gray-200 shadow-inner group">
//             <img src={url} alt={label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
//           </div>
//         ) : (
//           <div className="w-full aspect-square max-w-[160px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
//             <FaImage className="text-3xl mb-2 opacity-40" />
//             <span className="text-xs font-medium text-center px-2">No Image</span>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const safeName = employeeName || 'Employee';

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm">
//       <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200/50 animate-in fade-in zoom-in-95 duration-200">
        
//         {/* Header */}
//         <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10">
//           <div>
//             <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//               <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm">
//                 {safeName.charAt(0)}
//               </span>
//               {safeName}
//             </h3>
//             <p className="text-sm text-gray-500 font-medium mt-1">
//               Attendance Photos — {format(new Date(year, month - 1), 'MMMM yyyy')}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-10 h-10 bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-500 rounded-full flex items-center justify-center transition-colors"
//           >
//             <FaTimes />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center h-64 text-blue-600">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4"></div>
//               <p className="font-medium text-gray-600">Loading photos...</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {daysData.map((day, idx) => (
//                 <div 
//                   key={idx} 
//                   className={`flex flex-col p-4 rounded-2xl border ${
//                     day.isSunday ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-200 shadow-sm'
//                   }`}
//                 >
//                   <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
//                     <span className={`font-bold ${day.isSunday ? 'text-red-600' : 'text-gray-800'}`}>
//                       {day.dayName}
//                     </span>
//                     {day.isSunday && <span className="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">SUNDAY</span>}
//                   </div>

//                   {day.records.length > 0 ? (
//                     <div className="flex flex-col gap-4">
//                       {day.records.map((record, rIdx) => (
//                         <div key={rIdx} className="flex gap-3 relative">
//                           {day.records.length > 1 && (
//                             <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-500 rounded-full"></div>
//                           )}
//                           {renderPhotoBox(record.photo_in_url, "Clock In", record.clock_in)}
//                           {renderPhotoBox(record.photo_out_url, "Clock Out", record.clock_out)}
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="flex gap-3 opacity-60">
//                       {renderPhotoBox(null, "Clock In", null)}
//                       {renderPhotoBox(null, "Clock Out", null)}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <style jsx>{`
//         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
//       `}</style>
//     </div>
//   );
// }



import React, { useState, useEffect } from 'react';
import { format, getDaysInMonth, parseISO } from 'date-fns';
import { FaTimes, FaImage, FaClock } from 'react-icons/fa';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';

export default function EmployeeMonthlyPhotosModal({ employeeId, employeeName, year, month, onClose }) {
  const [loading, setLoading] = useState(true);
  const [daysData, setDaysData] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        // Now using your custom backend endpoint
        const res = await fetch(`${API_BASE}/clockin/admin/employee/${encodeURIComponent(employeeId)}/monthly-photos?year=${year}&month=${month}`);
        const result = await res.json();
        
        const dbRecords = result.success && Array.isArray(result.data) ? result.data : [];

        // Generate all days in the selected month
        const daysInMonth = getDaysInMonth(new Date(year, month - 1));
        const allDays = Array.from({ length: daysInMonth }, (_, i) => {
          const d = new Date(year, month - 1, i + 1);
          const dateString = format(d, 'yyyy-MM-dd');
          
          // Filter records matching this date using the 'formatted_date' from your backend query
          const recordsForDay = dbRecords.filter(r => r.formatted_date === dateString);
          
          return {
            date: dateString,
            dayName: format(d, 'EEE, MMM d'),
            isSunday: d.getDay() === 0,
            records: recordsForDay
          };
        });

        setDaysData(allDays);
      } catch (err) {
        console.error('Failed to fetch employee monthly photos', err);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchPhotos();
    } else {
      setLoading(false);
    }
  }, [employeeId, year, month]);

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    if (timeStr === 'Missed') return 'Missed';
    try {
      if (timeStr.includes('T')) {
        // Remove 'Z' to prevent the browser from applying the +5:30 UTC timezone offset
        const exactLocalTimeStr = timeStr.replace('Z', '');
        return format(parseISO(exactLocalTimeStr), 'h:mm a');
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  const renderPhotoBox = (url, label, time) => {
    return (
      <div className="flex flex-col items-center flex-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="w-full flex justify-between items-center mb-2 px-1">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</span>
          {time && time !== '—' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              <FaClock className="text-[9px]" /> {formatTime(time)}
            </span>
          )}
        </div>
        
        {url ? (
          <div className="relative w-full aspect-square max-w-[160px] rounded-lg overflow-hidden border border-gray-200 shadow-inner group">
            <img src={url} alt={label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
        ) : (
          <div className="w-full aspect-square max-w-[160px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
            <FaImage className="text-3xl mb-2 opacity-40" />
            <span className="text-xs font-medium text-center px-2">No Image</span>
          </div>
        )}
      </div>
    );
  };

  const safeName = employeeName || 'Employee';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200/50 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm">
                {safeName.charAt(0)}
              </span>
              {safeName}
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Attendance Photos — {format(new Date(year, month - 1), 'MMMM yyyy')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-500 rounded-full flex items-center justify-center transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-blue-600">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4"></div>
              <p className="font-medium text-gray-600">Loading photos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {daysData.map((day, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col p-4 rounded-2xl border ${
                    day.isSunday ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                    <span className={`font-bold ${day.isSunday ? 'text-red-600' : 'text-gray-800'}`}>
                      {day.dayName}
                    </span>
                    {day.isSunday && <span className="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">SUNDAY</span>}
                  </div>

                  {day.records.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {day.records.map((record, rIdx) => (
                        <div key={rIdx} className="flex gap-3 relative">
                          {day.records.length > 1 && (
                            <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-500 rounded-full"></div>
                          )}
                          {renderPhotoBox(record.photo_in_url, "Clock In", record.clock_in)}
                          {renderPhotoBox(record.photo_out_url, "Clock Out", record.clock_out)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-3 opacity-60">
                      {renderPhotoBox(null, "Clock In", null)}
                      {renderPhotoBox(null, "Clock Out", null)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}