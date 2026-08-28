



"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function LeaveRequestForm({ employeeName, onClose }) {
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    numberOfDays: 0,
  });
  const [leaveBalances, setLeaveBalances] = useState(null);
  const [selectedLeaveBalance, setSelectedLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overlapWarning, setOverlapWarning] = useState("");
  const [exceedsLeaveWarning, setExceedsLeaveWarning] = useState("");
  const [leaveMode, setLeaveMode] = useState("single"); // 'single' or 'multiple'
  const [multipleLeaves, setMultipleLeaves] = useState([]); // For multiple leave entries
  const [isDisclaimerAgreed, setIsDisclaimerAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const uniqueId = localStorage.getItem("uniqueId");

  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        if (!uniqueId) {
          console.error("Unique ID not found in localStorage.");
          setError("Please log in again.");
          setLoading(false);
          return;
        }
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/employee/employees/${uniqueId}/leave-balances`
        );
        if (response.data.success) {
          setLeaveBalances(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch leave balances.");
        }
      } catch (error) {
        console.error("Error fetching leave balances:", error);
        setError("An error occurred while fetching leave balances. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveBalances();
  }, [uniqueId]);

  let debounceTimeout;
  const debounce = (func, delay) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(func, delay);
  };

  const checkForOverlaps = async (startDate, endDate) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/check-overlaps`, {
        params: { start_date: startDate, end_date: endDate },
      });
      if (response.data.message === "Overlap detected") {
        setOverlapWarning("The selected dates overlap with existing leave requests.");
      } else {
        setOverlapWarning("");
      }
    } catch (error) {
      console.error("Error checking overlaps:", error);
      setOverlapWarning("An error occurred while checking for overlaps.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newData = { ...prevData, [name]: value };
      if (name === "startDate" || name === "endDate") {
        const currentStartDate = name === "startDate" ? value : prevData.startDate;
        const currentEndDate = name === "endDate" ? value : prevData.endDate;
        if (currentStartDate && currentEndDate) {
          const start = new Date(currentStartDate);
          const end = new Date(currentEndDate);
          const dayDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          newData.numberOfDays = dayDiff > 0 ? dayDiff : 0;
        } else {
          newData.numberOfDays = 0;
        }
      }

      // Real-time leave balance validation
      if (
        selectedLeaveBalance !== null &&
        newData.numberOfDays > 0 &&
        formData.leaveType !== "LOP" &&
        formData.leaveType !== "Week Off"
      ) {
        const remainingAfterRequest = selectedLeaveBalance - newData.numberOfDays;
        if (remainingAfterRequest < 0) {
          setExceedsLeaveWarning("Requested leave exceeds your available balance.");
        } else {
          setExceedsLeaveWarning("");
        }
      } else {
        setExceedsLeaveWarning("");
      }

      return newData;
    });

    if (name === "leaveType") {
      if (value === "LOP" || value === "Week Off") {
        setSelectedLeaveBalance(null);
        setExceedsLeaveWarning("");
      } else if (leaveBalances) {
        const leaveFieldMapping = {
          "Paid Leave": "annual_leave",
          "Festive Leave": "sick_leave",
          "Casual Leave": "casual_leave",
        };
        const selectedField = leaveFieldMapping[value];
        const selectedBalance = leaveBalances[selectedField];
        setSelectedLeaveBalance(selectedBalance);
        if (formData.numberOfDays > 0 && selectedBalance - formData.numberOfDays < 0) {
          setExceedsLeaveWarning("Requested leave exceeds your available balance.");
        } else {
          setExceedsLeaveWarning("");
        }
      }
    }

    if (name === "startDate" || name === "endDate") {
      const currentStartDate = name === "startDate" ? value : formData.startDate;
      const currentEndDate = name === "endDate" ? value : formData.endDate;
      if (currentStartDate && currentEndDate) {
        debounce(() => checkForOverlaps(currentStartDate, currentEndDate), 500);
      }
    }
  };

  const handleAddLeaveEntry = () => {
    setMultipleLeaves([...multipleLeaves, { date: "", leaveType: "" }]);
  };

  const handleMultipleLeaveChange = (index, field, value) => {
    const updatedLeaves = [...multipleLeaves];
    updatedLeaves[index][field] = value;
    setMultipleLeaves(updatedLeaves);
  };

  const handleRemoveLeaveEntry = (index) => {
    const updatedLeaves = multipleLeaves.filter((_, i) => i !== index);
    setMultipleLeaves(updatedLeaves);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      if (leaveMode === "single") {
        if (
          !formData.leaveType ||
          !formData.startDate ||
          !formData.endDate ||
          !formData.reason ||
          formData.numberOfDays <= 0
        ) {
          alert("All fields are required and the number of days must be greater than zero.");
          return;
        }
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leave-requests`, {
          unique_id: uniqueId,
          leave_type: formData.leaveType,
          start_date: formData.startDate,
          end_date: formData.endDate,
          reason: formData.reason,
          number_of_days: formData.numberOfDays,
        });
        if (response.data.success) {
          alert("Leave request submitted successfully!");
          onClose();
        } else {
          alert(response.data.message || "Failed to submit leave request.");
        }
      } else {
        if (multipleLeaves.some((leave) => !leave.date || !leave.leaveType)) {
          alert("All leave entries must have a valid date and leave type.");
          return;
        }
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/multiple-leave-requests`,
          {
            unique_id: uniqueId,
            leaves: multipleLeaves.map((leave) => ({
              date: leave.date,
              leave_type: leave.leaveType,
            })),
            reason: formData.reason,
          }
        );
        if (response.data.success) {
          alert("Multiple leave requests submitted successfully!");
          onClose();
        } else {
          alert(response.data.message || "Failed to submit multiple leave requests.");
        }
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      alert("An error occurred while submitting the leave request. Please try again.");
    }finally {
    setIsSubmitting(false);
  }
  };

  const isSubmitDisabled =
    (selectedLeaveBalance !== null && selectedLeaveBalance <= 0) || exceedsLeaveWarning !== "";

  if (loading) return <p className="text-center text-blue-700 font-medium">Loading...</p>;
  if (error) return <p className="text-center text-red-500 font-medium">{error}</p>;

    // Disclaimer Component
  if (!isDisclaimerAgreed) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl h-[80vh] overflow-y-auto relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-blue-700 mb-4">Leave Policy Disclaimer</h2>
          <div className="space-y-6">
            {/* PAID LEAVES */}
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">PAID LEAVES</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>The utilization of paid leaves is restricted until six months from the date of joining.</li>
                <li>The maximum consecutive days for paid leave cannot exceed seven.</li>
                <li>Requests for paid leaves should be made exclusively through email to the HR.</li>
                <li>A request for paid leave must be submitted at least seven days in advance.</li>
                <li>Paid leaves are not permissible during the notice period and cannot be encashed.</li>
                <li>Paid leaves remain valid until the date of your resignation and do not expire.</li>
                <li>Paid leaves will be carried forward to the following year at the end of the year, specifically in December.</li>
              </ul>
            </div>

            {/* FESTIVE LEAVES */}
            {/* <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">FESTIVE LEAVES</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                <li>If you choose to take a week off that overlaps with a festive off on the same day, it will be considered as having been used.</li>
                <li>It is necessary to request a festive off before the schedule for that week is live in order to use it.</li>
                <li>You are limited to using a maximum of two consecutive festive offs.</li>
                <li>Requests for Festive leaves should be made exclusively through email to the HR.</li>
                <li>If a request for festive leave is denied for any reason, and its approaching its expiration date, the expiration cannot be prolonged.</li>
                <li>Once you have exhausted your six festive offs, taking leave on a festival day later to that will result in Loss of Pay (LOP).</li>
              </ol>
            </div> */}

            {/* CASUAL LEAVES */}
            {/* <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">CASUAL LEAVES</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>One leave will be credited every 2 months.</li>
                <li>The maximum consecutive days for casual leave cannot exceed two.</li>
                <li>Requests for casual leaves should be made exclusively through email to the HR.</li>
                <li>It is necessary to request a casual leave before the schedule for that week is live in order to use it.</li>
                <li>Casual leaves are not permissible during the training / notice period and cannot be encashed.</li>
                <li>Casual leaves remain valid until the end of the year and will not be carried forward.</li>
                <li>If a request for Casual leave is denied for any reason, and its approaching its expiration date, the expiration cannot be prolonged.</li>
              </ul>
            </div> */}

            {/* LAST MINUTE LOPs */}
            <div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">LAST Minute LOPs</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>If you take more than 2 days of loss of pay(LOP) in a single month after the schedule is live, any additional LOP days will be counted as double LOP.</li>
                <li>This means additional absences beyond the first two days will result in twice the salary deduction.</li>
              </ul>
              {/* <p className="text-sm text-gray-700">
                If you take more than 2 days of loss of pay(LOP) in a single month after the schedule is live, any additional LOP days will be counted as double LOP.
                <p>This means additional absences beyond the first two days will result in twice the salary deduction</p>
              </p> */}
            </div>

            {/* LEAVES DURING NOTICE PERIOD */}
            <div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">LEAVES DURING NOTICE PERIOD</h3>
              <p className="text-sm text-gray-700">
                Any leave taken during the notice period will result in a deduction of 2 days pay.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDisclaimerAgreed(true)}
            className="w-full px-4 py-2 mt-4 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
          >
            I Agree
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative mx-auto my-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Request Leave - {employeeName}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Radio Buttons for Leave Mode */}
          <div className="flex space-x-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="leaveMode"
                value="single"
                checked={leaveMode === "single"}
                onChange={() => setLeaveMode("single")}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-gray-700 font-medium">Single Leave Type</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="leaveMode"
                value="multiple"
                checked={leaveMode === "multiple"}
                onChange={() => setLeaveMode("multiple")}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-gray-700 font-medium">Multiple Leave Types</span>
            </label>
          </div>

          {/* Single Leave Type Form */}
          {leaveMode === "single" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Leave Type</option>
                  <option value="LOP">Loss of Pay (LOP)</option>
                  <option value="Week Off">Week Off</option>
                  <option value="Paid Leave">Paid Leave</option>
                  {/* <option value="Festive Leave">Festive Leave</option> */}
                  {/* <option value="Casual Leave">Casual Leave</option> */}
                </select>
              </div>
              {formData.leaveType &&
                formData.leaveType !== "LOP" &&
                formData.leaveType !== "Week Off" &&
                leaveBalances && (
                  <p className="text-sm text-gray-600">
                    Remaining {formData.leaveType}:{" "}
                    {selectedLeaveBalance !== null ? selectedLeaveBalance : "Loading..."}
                  </p>
                )}
              

<div>
  <label className="block text-sm font-medium text-gray-700">Start Date</label>
  <input
    type="date"
    name="startDate"
    value={formData.startDate}
    onChange={handleInputChange}
    min={new Date().toISOString().split("T")[0]} // 🔒 Prevent past dates
    className="mt-1 block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700">End Date</label>
  <input
    type="date"
    name="endDate"
    value={formData.endDate}
    onChange={handleInputChange}
    min={formData.startDate || new Date().toISOString().split("T")[0]} 
    className="mt-1 block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    required
  />
</div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Days</label>
                <input
                  type="text"
                  value={formData.numberOfDays || 0}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                />
              </div>
              {overlapWarning && (
                <div className="rounded-md bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.778-.377 1.667-.377 2.444 0l2.082 1.041a1 1 0 010 1.882l-2.082 1.041a4.106 4.106 0 01-2.444 0L6.816 6.98a1 1 0 010-1.882l2.082-1.041zM10 15a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 font-medium">{overlapWarning}</p>
                    </div>
                  </div>
                </div>
              )}
              {exceedsLeaveWarning && (
                <div className="rounded-md bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">{exceedsLeaveWarning}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Multiple Leave Type Form */}
          {leaveMode === "multiple" && (
            <div>
              {multipleLeaves.map((leave, index) => (
                <div key={index} className="flex space-x-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={leave.date}
                      onChange={(e) => handleMultipleLeaveChange(index, "date", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="mt-1 block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                    <select
                      value={leave.leaveType}
                      onChange={(e) => handleMultipleLeaveChange(index, "leaveType", e.target.value)}
                      className="mt-1 block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select Leave Type</option>
                      <option value="LOP">Loss of Pay (LOP)</option>
                      <option value="Week Off">Week Off</option>
                      <option value="Paid Leave">Paid Leave</option>
                      {/* <option value="Festive Leave">Festive Leave</option> */}
                      {/* <option value="Casual Leave">Casual Leave</option> */}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLeaveEntry(index)}
                    className="self-end mt-7 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddLeaveEntry}
                className="w-full px-4 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
              >
                Add Another Leave Entry
              </button>
            </div>
          )}

          {/* Common Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              rows="3"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter reason for leave..."
            ></textarea>
          </div>

          {/* Submit Button */}
          {/* <button
            type="submit"
            disabled={isSubmitDisabled}
            title={
              isSubmitDisabled
                ? "Leave request exceeds available balance or balance is zero."
                : ""
            }
            className={`w-full px-4 py-3 rounded-md font-medium transition duration-200 ${
              isSubmitDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Submit Request
          </button> */}

<button
  type="submit"
  disabled={isSubmitting}
  className={`w-full px-4 py-3 rounded-md font-medium transition duration-200 ${
    isSubmitting
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700 text-white"
  }`}
>
  {isSubmitting ? (
    <span className="flex items-center justify-center">
      <svg
        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V2a10 10 0 1010 10h-2zm4-8a8 8 0 011.71 15.29L10 17.7V19a8 8 0 11-6-14z"
        ></path>
      </svg>
      Submitting...
    </span>
  ) : leaveMode === "single" ? "Submit Request" : "Submit Multiple Requests"}
</button>
        </form>
      </div>
    </div>
  );
}

















// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   FaCalendarAlt,
//   FaCalendarPlus,
//   FaPaperPlane,
//   FaClipboardList,
//   FaTimes,
//   FaTrash,
//   FaPlus,
//   FaExclamationTriangle,
//   FaTimesCircle,
//   FaCheckCircle,
//   FaClock,
//   FaBan,
//   FaChevronLeft,
//   FaChevronRight,
//   FaInfoCircle,
//   FaFileAlt,
// } from "react-icons/fa";

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

// const MONTHS = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December",
// ];

// // ═══════════════════════════════════════════════════════════
// // MAIN COMPONENT
// // ══════════════════════════════════════════════════════════��
// export default function LeaveRequest({ uniqueId, employeeName }) {
//   const [activeTab, setActiveTab] = useState("apply"); // "apply" | "history"

//   return (
//     <div>
//       {/* Tab Toggle */}
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
//         <div className="inline-flex rounded-xl shadow-sm overflow-hidden border border-gray-200">
//           <button
//             onClick={() => setActiveTab("apply")}
//             className={`px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${
//               activeTab === "apply"
//                 ? "bg-blue-600 text-white"
//                 : "bg-white text-gray-700 hover:bg-gray-50"
//             }`}
//           >
//             <FaCalendarPlus className="text-xs" />
//             Apply Leave
//           </button>
//           <button
//             onClick={() => setActiveTab("history")}
//             className={`px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${
//               activeTab === "history"
//                 ? "bg-blue-600 text-white"
//                 : "bg-white text-gray-700 hover:bg-gray-50"
//             }`}
//           >
//             <FaClipboardList className="text-xs" />
//             Leave History
//           </button>
//         </div>
//       </div>

//       {activeTab === "apply" && (
//         <LeaveApplyForm uniqueId={uniqueId} employeeName={employeeName} />
//       )}

//       {activeTab === "history" && (
//         <LeaveHistory uniqueId={uniqueId} />
//       )}
//     </div>
//   );
// }


// // ═══════════════════════════════════════════════════════════
// // LEAVE APPLY FORM
// // ═══════════════════════════════════════════════════════════
// function LeaveApplyForm({ uniqueId, employeeName }) {
//   const [formData, setFormData] = useState({
//     leaveType: "",
//     startDate: "",
//     endDate: "",
//     reason: "",
//     numberOfDays: 0,
//   });
//   const [leaveBalances, setLeaveBalances] = useState(null);
//   const [selectedLeaveBalance, setSelectedLeaveBalance] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [overlapWarning, setOverlapWarning] = useState("");
//   const [exceedsLeaveWarning, setExceedsLeaveWarning] = useState("");
//   const [leaveMode, setLeaveMode] = useState("single");
//   const [multipleLeaves, setMultipleLeaves] = useState([]);
//   const [isDisclaimerAgreed, setIsDisclaimerAgreed] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitSuccess, setSubmitSuccess] = useState(false);

//   useEffect(() => {
//     const fetchLeaveBalances = async () => {
//       try {
//         if (!uniqueId) {
//           setError("Please log in again.");
//           setLoading(false);
//           return;
//         }
//         const response = await axios.get(
//           `${API_BASE_URL}/employee/employees/${uniqueId}/leave-balances`
//         );
//         if (response.data.success) {
//           setLeaveBalances(response.data.data);
//         } else {
//           setError(response.data.message || "Failed to fetch leave balances.");
//         }
//       } catch (err) {
//         console.error("Error fetching leave balances:", err);
//         setError("An error occurred while fetching leave balances.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchLeaveBalances();
//   }, [uniqueId]);

//   let debounceTimeout;
//   const debounce = (func, delay) => {
//     clearTimeout(debounceTimeout);
//     debounceTimeout = setTimeout(func, delay);
//   };

//   const checkForOverlaps = async (startDate, endDate) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/api/check-overlaps`, {
//         params: { start_date: startDate, end_date: endDate },
//       });
//       if (response.data.message === "Overlap detected") {
//         setOverlapWarning("The selected dates overlap with existing leave requests.");
//       } else {
//         setOverlapWarning("");
//       }
//     } catch (err) {
//       console.error("Error checking overlaps:", err);
//       setOverlapWarning("An error occurred while checking for overlaps.");
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => {
//       const newData = { ...prevData, [name]: value };
//       if (name === "startDate" || name === "endDate") {
//         const currentStartDate = name === "startDate" ? value : prevData.startDate;
//         const currentEndDate = name === "endDate" ? value : prevData.endDate;
//         if (currentStartDate && currentEndDate) {
//           const start = new Date(currentStartDate);
//           const end = new Date(currentEndDate);
//           const dayDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
//           newData.numberOfDays = dayDiff > 0 ? dayDiff : 0;
//         } else {
//           newData.numberOfDays = 0;
//         }
//       }

//       if (
//         selectedLeaveBalance !== null &&
//         newData.numberOfDays > 0 &&
//         formData.leaveType !== "LOP" &&
//         formData.leaveType !== "Week Off"
//       ) {
//         const remainingAfterRequest = selectedLeaveBalance - newData.numberOfDays;
//         if (remainingAfterRequest < 0) {
//           setExceedsLeaveWarning("Requested leave exceeds your available balance.");
//         } else {
//           setExceedsLeaveWarning("");
//         }
//       } else {
//         setExceedsLeaveWarning("");
//       }

//       return newData;
//     });

//     if (name === "leaveType") {
//       if (value === "LOP" || value === "Week Off") {
//         setSelectedLeaveBalance(null);
//         setExceedsLeaveWarning("");
//       } else if (leaveBalances) {
//         const leaveFieldMapping = {
//           "Paid Leave": "annual_leave",
//           "Festive Leave": "sick_leave",
//           "Casual Leave": "casual_leave",
//         };
//         const selectedField = leaveFieldMapping[value];
//         const selectedBalance = leaveBalances[selectedField];
//         setSelectedLeaveBalance(selectedBalance);
//         if (formData.numberOfDays > 0 && selectedBalance - formData.numberOfDays < 0) {
//           setExceedsLeaveWarning("Requested leave exceeds your available balance.");
//         } else {
//           setExceedsLeaveWarning("");
//         }
//       }
//     }

//     if (name === "startDate" || name === "endDate") {
//       const currentStartDate = name === "startDate" ? value : formData.startDate;
//       const currentEndDate = name === "endDate" ? value : formData.endDate;
//       if (currentStartDate && currentEndDate) {
//         debounce(() => checkForOverlaps(currentStartDate, currentEndDate), 500);
//       }
//     }
//   };

//   const handleAddLeaveEntry = () => {
//     setMultipleLeaves([...multipleLeaves, { date: "", leaveType: "" }]);
//   };

//   const handleMultipleLeaveChange = (index, field, value) => {
//     const updatedLeaves = [...multipleLeaves];
//     updatedLeaves[index][field] = value;
//     setMultipleLeaves(updatedLeaves);
//   };

//   const handleRemoveLeaveEntry = (index) => {
//     setMultipleLeaves(multipleLeaves.filter((_, i) => i !== index));
//   };

//   const resetForm = () => {
//     setFormData({ leaveType: "", startDate: "", endDate: "", reason: "", numberOfDays: 0 });
//     setMultipleLeaves([]);
//     setOverlapWarning("");
//     setExceedsLeaveWarning("");
//     setSelectedLeaveBalance(null);
//     setSubmitSuccess(false);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       if (leaveMode === "single") {
//         if (
//           !formData.leaveType || !formData.startDate || !formData.endDate ||
//           !formData.reason || formData.numberOfDays <= 0
//         ) {
//           alert("All fields are required and the number of days must be greater than zero.");
//           setIsSubmitting(false);
//           return;
//         }
//         const response = await axios.post(`${API_BASE_URL}/api/leave-requests`, {
//           unique_id: uniqueId,
//           leave_type: formData.leaveType,
//           start_date: formData.startDate,
//           end_date: formData.endDate,
//           reason: formData.reason,
//           number_of_days: formData.numberOfDays,
//         });
//         if (response.data.success) {
//           setSubmitSuccess(true);
//         } else {
//           alert(response.data.message || "Failed to submit leave request.");
//         }
//       } else {
//         if (multipleLeaves.some((leave) => !leave.date || !leave.leaveType)) {
//           alert("All leave entries must have a valid date and leave type.");
//           setIsSubmitting(false);
//           return;
//         }
//         if (!formData.reason) {
//           alert("Reason is required.");
//           setIsSubmitting(false);
//           return;
//         }
//         const response = await axios.post(`${API_BASE_URL}/api/multiple-leave-requests`, {
//           unique_id: uniqueId,
//           leaves: multipleLeaves.map((leave) => ({
//             date: leave.date,
//             leave_type: leave.leaveType,
//           })),
//           reason: formData.reason,
//         });
//         if (response.data.success) {
//           setSubmitSuccess(true);
//         } else {
//           alert(response.data.message || "Failed to submit multiple leave requests.");
//         }
//       }
//     } catch (err) {
//       console.error("Error submitting leave request:", err);
//       alert("An error occurred while submitting the leave request.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
//         <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-3"></div>
//         <p className="text-gray-500 font-medium">Loading leave balances...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
//         <p className="text-red-500 font-semibold">{error}</p>
//       </div>
//     );
//   }

//   // Success state
//   if (submitSuccess) {
//     return (
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
//         <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
//           <FaCheckCircle className="text-green-600 text-4xl" />
//         </div>
//         <h3 className="text-xl font-bold text-gray-900 mb-2">Leave Request Submitted!</h3>
//         <p className="text-gray-500 mb-6">Your leave request has been sent for approval.</p>
//         <button
//           onClick={resetForm}
//           className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
//         >
//           Apply Another Leave
//         </button>
//       </div>
//     );
//   }

//   // Disclaimer
//   if (!isDisclaimerAgreed) {
//     return (
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
//           <h3 className="text-lg font-bold text-white flex items-center gap-2">
//             <FaInfoCircle />
//             Leave Policy Disclaimer
//           </h3>
//         </div>
//         <div className="p-6 max-h-[500px] overflow-y-auto space-y-6">
//           {/* PAID LEAVES */}
//           <div>
//             <h4 className="text-base font-semibold text-blue-700 mb-2 flex items-center gap-2">
//               <FaFileAlt className="text-sm" />
//               PAID LEAVES
//             </h4>
//             <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
//               <li>The utilization of paid leaves is restricted until six months from the date of joining.</li>
//               <li>The maximum consecutive days for paid leave cannot exceed seven.</li>
//               <li>Requests for paid leaves should be made exclusively through email to the HR.</li>
//               <li>A request for paid leave must be submitted at least seven days in advance.</li>
//               <li>Paid leaves are not permissible during the notice period and cannot be encashed.</li>
//               <li>Paid leaves remain valid until the date of your resignation and do not expire.</li>
//               <li>Paid leaves will be carried forward to the following year at the end of the year, specifically in December.</li>
//             </ul>
//           </div>

//           {/* LAST MINUTE LOPs */}
//           <div>
//             <h4 className="text-base font-semibold text-red-700 mb-2 flex items-center gap-2">
//               <FaExclamationTriangle className="text-sm" />
//               LAST MINUTE LOPs
//             </h4>
//             <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
//               <li>If you take more than 2 days of loss of pay (LOP) in a single month after the schedule is live, any additional LOP days will be counted as double LOP.</li>
//               <li>This means additional absences beyond the first two days will result in twice the salary deduction.</li>
//             </ul>
//           </div>

//           {/* NOTICE PERIOD */}
//           <div>
//             <h4 className="text-base font-semibold text-red-700 mb-2 flex items-center gap-2">
//               <FaBan className="text-sm" />
//               LEAVES DURING NOTICE PERIOD
//             </h4>
//             <p className="text-sm text-gray-700">
//               Any leave taken during the notice period will result in a deduction of 2 days pay.
//             </p>
//           </div>
//         </div>

//         <div className="px-6 pb-6">
//           <button
//             onClick={() => setIsDisclaimerAgreed(true)}
//             className="w-full px-4 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
//           >
//             I Agree — Continue to Apply
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between">
//         <h3 className="text-lg font-bold text-white flex items-center gap-2">
//           <FaCalendarPlus />
//           Apply Leave — {employeeName}
//         </h3>
//       </div>

//       <div className="p-6">
//         {/* Leave Balances Summary */}
//         {leaveBalances && (
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
//             <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
//               <p className="text-2xl font-bold text-blue-700">{leaveBalances.annual_leave ?? "—"}</p>
//               <p className="text-xs text-gray-500 font-medium">Paid Leave</p>
//             </div>
//             <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
//               <p className="text-2xl font-bold text-green-700">{leaveBalances.sick_leave ?? "—"}</p>
//               <p className="text-xs text-gray-500 font-medium">Festive Leave</p>
//             </div>
//             <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
//               <p className="text-2xl font-bold text-purple-700">{leaveBalances.casual_leave ?? "—"}</p>
//               <p className="text-xs text-gray-500 font-medium">Casual Leave</p>
//             </div>
//           </div>
//         )}

//         {/* Leave Mode Toggle */}
//         <div className="flex gap-3 mb-6">
//           <button
//             type="button"
//             onClick={() => setLeaveMode("single")}
//             className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
//               leaveMode === "single"
//                 ? "border-blue-500 bg-blue-50 text-blue-700"
//                 : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
//             }`}
//           >
//             Single Leave
//           </button>
//           <button
//             type="button"
//             onClick={() => setLeaveMode("multiple")}
//             className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
//               leaveMode === "multiple"
//                 ? "border-blue-500 bg-blue-50 text-blue-700"
//                 : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
//             }`}
//           >
//             Multiple Leaves
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* Single Leave Mode */}
//           {leaveMode === "single" && (
//             <>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">Leave Type</label>
//                 <select
//                   name="leaveType"
//                   value={formData.leaveType}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-700"
//                   required
//                 >
//                   <option value="">Select Leave Type</option>
//                   <option value="LOP">Loss of Pay (LOP)</option>
//                   <option value="Week Off">Week Off</option>
//                   <option value="Paid Leave">Paid Leave</option>
//                 </select>
//               </div>

//               {formData.leaveType &&
//                 formData.leaveType !== "LOP" &&
//                 formData.leaveType !== "Week Off" &&
//                 selectedLeaveBalance !== null && (
//                   <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-xl border border-blue-100">
//                     <FaInfoCircle className="text-blue-500 text-sm flex-shrink-0" />
//                     <p className="text-sm text-blue-700 font-medium">
//                       Remaining {formData.leaveType}: <span className="font-bold">{selectedLeaveBalance}</span>
//                     </p>
//                   </div>
//                 )}

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
//                   <input
//                     type="date"
//                     name="startDate"
//                     value={formData.startDate}
//                     onChange={handleInputChange}
//                     min={new Date().toISOString().split("T")[0]}
//                     className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-700"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date</label>
//                   <input
//                     type="date"
//                     name="endDate"
//                     value={formData.endDate}
//                     onChange={handleInputChange}
//                     min={formData.startDate || new Date().toISOString().split("T")[0]}
//                     className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-700"
//                     required
//                   />
//                 </div>
//               </div>

//               {formData.numberOfDays > 0 && (
//                 <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
//                   <FaCalendarAlt className="text-gray-500 text-sm" />
//                   <p className="text-sm text-gray-700 font-medium">
//                     Number of days: <span className="font-bold text-gray-900">{formData.numberOfDays}</span>
//                   </p>
//                 </div>
//               )}

//               {overlapWarning && (
//                 <div className="flex items-start gap-3 px-4 py-3 bg-yellow-50 rounded-xl border border-yellow-200">
//                   <FaExclamationTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" />
//                   <p className="text-sm text-yellow-700 font-medium">{overlapWarning}</p>
//                 </div>
//               )}

//               {exceedsLeaveWarning && (
//                 <div className="flex items-start gap-3 px-4 py-3 bg-red-50 rounded-xl border border-red-200">
//                   <FaTimesCircle className="text-red-500 mt-0.5 flex-shrink-0" />
//                   <p className="text-sm text-red-700 font-medium">{exceedsLeaveWarning}</p>
//                 </div>
//               )}
//             </>
//           )}

//           {/* Multiple Leave Mode */}
//           {leaveMode === "multiple" && (
//             <div className="space-y-3">
//               {multipleLeaves.map((leave, index) => (
//                 <div key={index} className="flex items-end gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
//                   <div className="flex-1">
//                     <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
//                     <input
//                       type="date"
//                       value={leave.date}
//                       onChange={(e) => handleMultipleLeaveChange(index, "date", e.target.value)}
//                       min={new Date().toISOString().split("T")[0]}
//                       className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-700"
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <label className="block text-xs font-semibold text-gray-500 mb-1">Leave Type</label>
//                     <select
//                       value={leave.leaveType}
//                       onChange={(e) => handleMultipleLeaveChange(index, "leaveType", e.target.value)}
//                       className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-700"
//                     >
//                       <option value="">Select Type</option>
//                       <option value="LOP">LOP</option>
//                       <option value="Week Off">Week Off</option>
//                       <option value="Paid Leave">Paid Leave</option>
//                     </select>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveLeaveEntry(index)}
//                     className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition flex-shrink-0"
//                   >
//                     <FaTrash className="text-xs" />
//                   </button>
//                 </div>
//               ))}

//               <button
//                 type="button"
//                 onClick={handleAddLeaveEntry}
//                 className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2"
//               >
//                 <FaPlus className="text-xs" />
//                 Add Leave Entry
//               </button>

//               {multipleLeaves.length > 0 && (
//                 <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
//                   <FaCalendarAlt className="text-gray-500 text-sm" />
//                   <p className="text-sm text-gray-700 font-medium">
//                     Total entries: <span className="font-bold text-gray-900">{multipleLeaves.length}</span>
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Reason (common) */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason</label>
//             <textarea
//               rows="3"
//               name="reason"
//               value={formData.reason}
//               onChange={handleInputChange}
//               placeholder="Enter reason for leave..."
//               className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-700 resize-none"
//               required
//             />
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
//               isSubmitting
//                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-xl"
//             }`}
//           >
//             {isSubmitting ? (
//               <>
//                 <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 Submitting...
//               </>
//             ) : (
//               <>
//                 <FaPaperPlane />
//                 {leaveMode === "single" ? "Submit Request" : "Submit Multiple Requests"}
//               </>
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }


// // ═══════════════════════════════════════════════════════════
// // LEAVE HISTORY
// // ═══════════════════════════════════════════════════════════
// function LeaveHistory({ uniqueId }) {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
//   const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);

//   useEffect(() => {
//     fetchHistory();
//   }, [uniqueId, selectedYear, selectedMonth]);

//   const fetchHistory = async () => {
//     if (!uniqueId) return;
//     setLoading(true);
//     setError("");

//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/api/leave-requests?unique_id=${encodeURIComponent(uniqueId)}&year=${selectedYear}&month=${selectedMonth}`
//       );
//       if (response.data.success) {
//         setRecords(response.data.data || []);
//       } else {
//         setError(response.data.message || "Failed to fetch leave history");
//       }
//     } catch (err) {
//       console.error("Error fetching leave history:", err);
//       setError("Failed to fetch leave history.");
//     } finally {
//       setLoading(false);
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

//   const getStatusBadge = (status) => {
//     const s = (status || "").toLowerCase();
//     if (s === "approved") {
//       return (
//         <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
//           <FaCheckCircle className="text-[10px]" /> Approved
//         </span>
//       );
//     }
//     if (s === "rejected" || s === "denied") {
//       return (
//         <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
//           <FaTimesCircle className="text-[10px]" /> Rejected
//         </span>
//       );
//     }
//     return (
//       <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
//         <FaClock className="text-[10px]" /> Pending
//       </span>
//     );
//   };

//   const getLeaveTypeBadge = (type) => {
//     const colors = {
//       "LOP": "bg-red-50 text-red-700 border-red-200",
//       "Week Off": "bg-gray-50 text-gray-700 border-gray-200",
//       "Paid Leave": "bg-blue-50 text-blue-700 border-blue-200",
//       "Festive Leave": "bg-purple-50 text-purple-700 border-purple-200",
//       "Casual Leave": "bg-green-50 text-green-700 border-green-200",
//     };
//     const colorClass = colors[type] || "bg-gray-50 text-gray-700 border-gray-200";
//     return (
//       <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${colorClass}`}>
//         {type}
//       </span>
//     );
//   };

//   return (
//     <div>
//       {/* Month Navigation */}
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
//         <div className="flex items-center justify-center gap-3">
//           <button onClick={goToPrevMonth} className="p-2.5 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition">
//             <FaChevronLeft className="text-gray-600 text-xs" />
//           </button>
//           <div className="px-5 py-2.5 bg-gray-50 rounded-xl border-2 border-gray-200 font-semibold text-gray-800 text-sm min-w-[160px] text-center">
//             {MONTHS[selectedMonth - 1]} {selectedYear}
//           </div>
//           <button onClick={goToNextMonth} className="p-2.5 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition">
//             <FaChevronRight className="text-gray-600 text-xs" />
//           </button>
//         </div>
//       </div>

//       {/* Records */}
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//         {loading ? (
//           <div className="flex items-center justify-center py-20">
//             <div className="text-center">
//               <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-3"></div>
//               <p className="text-gray-500 font-medium">Loading...</p>
//             </div>
//           </div>
//         ) : error ? (
//           <div className="flex items-center justify-center py-20 text-center">
//             <div>
//               <p className="text-red-500 font-semibold">{error}</p>
//               <button onClick={fetchHistory} className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
//                 Retry
//               </button>
//             </div>
//           </div>
//         ) : records.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-20">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
//               <FaClipboardList className="text-gray-400 text-2xl" />
//             </div>
//             <p className="text-gray-500 font-semibold text-lg">No leave requests</p>
//             <p className="text-gray-400 text-sm mt-1">
//               No records for {MONTHS[selectedMonth - 1]} {selectedYear}
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Desktop Table */}
//             <div className="hidden md:block overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
//                     <th className="px-5 py-4 text-left font-semibold">Date(s)</th>
//                     <th className="px-5 py-4 text-left font-semibold">Leave Type</th>
//                     <th className="px-5 py-4 text-center font-semibold">Days</th>
//                     <th className="px-5 py-4 text-left font-semibold">Reason</th>
//                     <th className="px-5 py-4 text-center font-semibold">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {records.map((record, index) => (
//                     <tr
//                       key={record.id || index}
//                       className={`border-b border-gray-100 transition-colors ${
//                         index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
//                       } hover:bg-blue-50/50`}
//                     >
//                       <td className="px-5 py-3.5 font-medium text-gray-900">
//                         {record.start_date === record.end_date
//                           ? record.start_date
//                           : `${record.start_date} → ${record.end_date}`}
//                       </td>
//                       <td className="px-5 py-3.5">
//                         {getLeaveTypeBadge(record.leave_type)}
//                       </td>
//                       <td className="px-5 py-3.5 text-center font-semibold text-gray-800">
//                         {record.number_of_days || 1}
//                       </td>
//                       <td className="px-5 py-3.5 text-gray-600 max-w-[200px] truncate">
//                         {record.reason || "—"}
//                       </td>
//                       <td className="px-5 py-3.5 text-center">
//                         {getStatusBadge(record.status)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile Cards */}
//             <div className="md:hidden divide-y divide-gray-100">
//               {records.map((record, index) => (
//                 <div key={record.id || index} className="p-4">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="font-bold text-gray-900 text-sm">
//                       {record.start_date === record.end_date
//                         ? record.start_date
//                         : `${record.start_date} → ${record.end_date}`}
//                     </p>
//                     {getStatusBadge(record.status)}
//                   </div>
//                   <div className="flex items-center gap-3 mb-2">
//                     {getLeaveTypeBadge(record.leave_type)}
//                     <span className="text-sm text-gray-600">
//                       {record.number_of_days || 1} day{(record.number_of_days || 1) > 1 ? "s" : ""}
//                     </span>
//                   </div>
//                   {record.reason && (
//                     <p className="text-xs text-gray-500 mt-1">{record.reason}</p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }