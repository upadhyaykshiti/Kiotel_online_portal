import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle, FaBriefcase, FaRegClock } from "react-icons/fa";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

function formatTime12Hour(timeStr) {
  if (!timeStr) return "";
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${hour}:${minuteStr} ${ampm}`;
}

export default function PromotionHub({ uniqueId }) {
  const [loading, setLoading] = useState(true);
  const [existingApp, setExistingApp] = useState(null);
  
  const [positions, setPositions] = useState([]);
  const [selectedPosId, setSelectedPosId] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fitReason: "",
    shifts: [],
    slotId: ""
  });

  useEffect(() => {
    if (uniqueId) {
      checkExistingApplication();
      fetchPositions();
    }
  }, [uniqueId]);

  const checkExistingApplication = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/careers/internal-applications/me/${uniqueId}`);
      if (res.data.hasApplied) {
        setExistingApp(res.data.application);
      }
    } catch (err) {
      console.error("Error checking application status:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/careers/internal-positions`);
      setPositions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShiftToggle = (shift) => {
    setFormData(prev => {
      const shifts = prev.shifts.includes(shift)
        ? prev.shifts.filter(s => s !== shift)
        : [...prev.shifts, shift];
      return { ...prev, shifts };
    });
  };

//   const submitApplication = async () => {
//     if (formData.shifts.length < 2) return alert("Please select at least 2 shifts.");
//     if (!formData.fitReason || !formData.slotId) return alert("Please fill in all required fields.");

//     setSubmitting(true);
//     try {
//       const payload = {
//         employeeId: uniqueId,
//         positionId: selectedPosId,
//         slotId: formData.slotId,
//         fitReason: formData.fitReason,
//         shifts: formData.shifts
//       };

//       await axios.post(`${API_BASE_URL}/api/careers/internal-applications`, payload);
//       await checkExistingApplication(); 
//     } catch (err) {
//       alert(err.response?.data?.error || "Error submitting application");
//     } finally {
//       setSubmitting(false);
//     }
//   };

  const submitApplication = async () => {
    if (formData.shifts.length < 2) return alert("Please select at least 2 shifts.");
    if (!formData.fitReason || !formData.slotId) return alert("Please fill in all required fields.");

    setSubmitting(true);
    try {
      const payload = {
        employeeId: uniqueId,
        positionId: selectedPosId,
        slotId: formData.slotId,
        fitReason: formData.fitReason,
        shifts: formData.shifts
      };

      await axios.post(`${API_BASE_URL}/api/careers/internal-applications`, payload);
      await checkExistingApplication(); 
    } catch (err) {
      if (err.response?.status === 409) {
        // Handle Slot Conflict gracefully
        alert(err.response.data.error || "Slot already taken.");
        // Clear the slot selection so they are forced to pick a new one
        setFormData(prev => ({ ...prev, slotId: "" }));
        // Refresh the positions to get updated slot availability
        fetchPositions();
      } else {
        alert(err.response?.data?.error || "Error submitting application");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPosition = positions.find(p => p.id === parseInt(selectedPosId));

  if (loading) return <div className="p-6 text-center text-gray-500 animate-pulse">Loading opportunities...</div>;

  // --- ALREADY APPLIED VIEW ---
  if (existingApp) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FaCheckCircle className="text-3xl text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-8 max-w-md">
            You have already applied for an internal opportunity. Our HR team will review your application and contact you soon.
          </p>

          <div className="w-full max-w-lg bg-gray-50 rounded-xl p-5 border border-gray-200 text-left">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Application Details</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                existingApp.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                existingApp.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {existingApp.status}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaBriefcase className="text-blue-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-semibold text-gray-800">{existingApp.position_title} <span className="text-sm text-gray-400 font-normal">({existingApp.department})</span></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaRegClock className="text-purple-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Interview Slot</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(existingApp.interview_date).toLocaleDateString()} <span className="mx-1">•</span> 
                    {formatTime12Hour(existingApp.start_time)} - {formatTime12Hour(existingApp.end_time)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- APPLICATION FORM VIEW ---
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Internal Opportunities</h2>
        <p className="text-gray-500 text-sm mt-1">Apply for a new role within the company.</p>
      </div>
      
      {positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border border-gray-200">
          <FaBriefcase className="text-4xl text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-700">No Active Positions</h3>
          <p className="text-gray-500 mt-1 text-center px-4">There are currently no active internal positions available to apply for.</p>
        </div>
      ) : !isApplying ? (
        <div className="space-y-5">
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <label className="block text-sm font-semibold text-blue-900 mb-2">Select an Available Position</label>
            <select 
              className="w-full p-3 rounded-lg border border-blue-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
              value={selectedPosId}
              onChange={(e) => setSelectedPosId(e.target.value)}
            >
              <option value="">-- Choose a Role --</option>
              {positions.map(pos => (
                <option key={pos.id} value={pos.id}>{pos.title} ({pos.department})</option>
              ))}
            </select>
          </div>
          
          <button 
            disabled={!selectedPosId}
            onClick={() => setIsApplying(true)}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
          >
            Start Application
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Applying For</p>
              <p className="font-bold text-gray-800 text-lg">{selectedPosition?.title}</p>
            </div>
            <button onClick={() => setIsApplying(false)} className="text-sm text-gray-500 hover:text-red-500 font-medium transition">
              Change Position
            </button>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Why do you feel that you are the right fit for this position? <span className="text-red-500">*</span></label>
            <textarea 
              rows="3"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none shadow-sm"
              placeholder="Tell us about your experience and motivation..."
              value={formData.fitReason}
              onChange={(e) => setFormData({...formData, fitReason: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Shifts comfortable with (Select at least 2) <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-3">
              {['7am-3pm', '3pm-11pm', '11pm-7am'].map(shift => {
                const isSelected = formData.shifts.includes(shift);
                return (
                  <label key={shift} className={`cursor-pointer px-4 py-2 border rounded-lg text-sm font-medium transition ${
                    isSelected ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={isSelected}
                      onChange={() => handleShiftToggle(shift)}
                    />
                    {shift}
                  </label>
                );
              })}
            </div>
          </div>

          {/* <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Select Interview Time Slot <span className="text-red-500">*</span></label>
            {selectedPosition?.slots?.filter(s => !s.is_booked).length > 0 ? (
              <select 
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
                value={formData.slotId}
                onChange={(e) => setFormData({...formData, slotId: e.target.value})}
              >
                <option value="">-- Pick an available slot --</option>
                {selectedPosition.slots.filter(s => !s.is_booked).map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {new Date(slot.interview_date).toLocaleDateString()} | {formatTime12Hour(slot.start_time)} - {formatTime12Hour(slot.end_time)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                No time slots currently available for this position.
              </div>
            )}
          </div> */}

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Select Interview Time Slot <span className="text-red-500">*</span></label>
            {selectedPosition?.slots?.filter(s => !s.is_booked).length > 0 ? (
              <select 
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
                value={formData.slotId}
                onChange={(e) => setFormData({...formData, slotId: e.target.value})}
                onFocus={fetchPositions} // <--- Added: Fetches latest slots when dropdown is opened
              >
                <option value="">-- Pick an available slot --</option>
                {selectedPosition.slots.filter(s => !s.is_booked).map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {new Date(slot.interview_date).toLocaleDateString()} | {formatTime12Hour(slot.start_time)} - {formatTime12Hour(slot.end_time)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                No time slots currently available for this position.
              </div>
            )}
          </div>


          <div className="flex gap-4 pt-4">
            <button 
              disabled={submitting}
              onClick={submitApplication}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition shadow-md disabled:bg-green-400 flex items-center justify-center"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}