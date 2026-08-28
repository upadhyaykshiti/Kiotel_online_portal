// src/components/schedule/BroadcastModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API2 = process.env.NEXT_PUBLIC_BACKEND_URL;

// Prefilled defaults — editable by the user before sending
const DEFAULT_SUBJECT = 'Schedule is Live';
const DEFAULT_MESSAGE = 'Please log in to portal.kiotel.co';

const BroadcastModal = ({ showBroadcastModal, setShowBroadcastModal, uniqueId }) => {
  const [employees, setEmployees] = useState([]); // Store fetched employees
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Fetch employees when modal opens
  useEffect(() => {
    if (showBroadcastModal) {
      const fetchEmployees = async () => {
        try {
          const res = await axios.get(`${API2}/api/employees-for-broadcast`, {
            headers: { 'X-Unique-ID': uniqueId },
            withCredentials: true,
          });
          setEmployees(res.data); // Set the fetched list
          setSelectedEmployees(new Set()); // Reset selection
          setSubject(DEFAULT_SUBJECT);
          setMessage(DEFAULT_MESSAGE);
          setSending(false);
          setSendResult(null);
        } catch (err) {
          console.error("Failed to fetch employees:", err);
          setEmployees([]); // Set to empty array on error
          setSendResult({ success: false, message: 'Failed to load employee list.' });
        }
      };
      fetchEmployees();
    }
  }, [showBroadcastModal, uniqueId]);

  const handleSelectAll = () => {
    const allIds = new Set(employees.map(emp => emp.id));
    setSelectedEmployees(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedEmployees(new Set());
  };

  const handleSelectEmployee = (empId) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(empId)) {
      newSelected.delete(empId);
    } else {
      newSelected.add(empId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSendBroadcast = async () => {
    if (selectedEmployees.size === 0) {
      setSendResult({ success: false, message: 'Please select at least one employee.' });
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setSendResult({ success: false, message: 'Subject and message are required.' });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      // Get emails for selected employee IDs
      const selectedEmpObjects = employees.filter(emp => selectedEmployees.has(emp.id));
      const emails = selectedEmpObjects.map(emp => emp.emailid).filter(email => email); // Filter out potentially undefined emails

      if (emails.length === 0) {
        setSendResult({ success: false, message: 'No valid emails found for selected employees.' });
        setSending(false);
        return;
      }

      // Call the broadcast API
      const res = await axios.post(`${API2}/send/broadcast`, {
        emails,
        subject,
        message,
      }, {
        headers: { 'X-Unique-ID': uniqueId },
        withCredentials: true,
      });

      if (res.status === 200) {
        setSendResult({ success: true, message: 'Broadcast sent successfully!' });
        // Optionally clear selection after successful send
        // setSelectedEmployees(new Set());
      } else {
        setSendResult({ success: false, message: res.data.error || 'Failed to send broadcast.' });
      }
    } catch (err) {
      console.error("Broadcast error:", err);
      setSendResult({ success: false, message: err.response?.data?.error || 'An error occurred while sending the broadcast.' });
    } finally {
      setSending(false);
    }
  };

  if (!showBroadcastModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl p-7 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-2xl text-slate-800">Broadcast Email</h3>
          <button
            onClick={() => setShowBroadcastModal(false)}
            className="text-slate-500 hover:text-slate-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Controls */}
          <div className="flex justify-between items-center mb-4 gap-4">
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Deselect All
              </button>
            </div>
            <div className="text-sm text-slate-600">
              Selected: {selectedEmployees.size} / {employees.length}
            </div>
          </div>

          {/* Employee Table */}
          <div className="overflow-y-auto flex-1 mb-4 border border-slate-200 rounded-xl shadow-sm">
            <table className="min-w-full">
              <thead className="bg-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left text-slate-700 font-semibold border-r border-slate-200 w-12">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.size === employees.length && employees.length > 0}
                      onChange={employees.length > 0 ? (selectedEmployees.size === employees.length ? handleDeselectAll : handleSelectAll) : undefined}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="p-3 text-left text-slate-700 font-semibold border-r border-slate-200">ID</th>
                  <th className="p-3 text-left text-slate-700 font-semibold border-r border-slate-200">Unique ID</th>
                  <th className="p-3 text-left text-slate-700 font-semibold border-r border-slate-200">Email</th>
                  <th className="p-3 text-left text-slate-700 font-semibold border-r border-slate-200">First Name</th>
                  <th className="p-3 text-left text-slate-700 font-semibold border-r border-slate-200">Last Name</th>
                  <th className="p-3 text-left text-slate-700 font-semibold">Role</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr
                    key={emp.id}
                    className={`border-b border-slate-200 ${selectedEmployees.has(emp.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="p-3 border-r border-slate-200">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(emp.id)}
                        onChange={() => handleSelectEmployee(emp.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="p-3 border-r border-slate-200 text-slate-700">{emp.id}</td>
                    <td className="p-3 border-r border-slate-200 text-slate-700">{emp.unique_id}</td>
                    <td className="p-3 border-r border-slate-200 text-slate-700">{emp.emailid}</td>
                    <td className="p-3 border-r border-slate-200 text-slate-700">{emp.fname}</td>
                    <td className="p-3 border-r border-slate-200 text-slate-700">{emp.lname}</td>
                    <td className="p-3 text-slate-700">{emp.role_name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subject and Message */}
          <div className="space-y-4 mb-4">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full p-3 border border-slate-300 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message (HTML allowed)"
              rows="6"
              className="w-full p-3 border border-slate-300 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          {/* Result Message */}
          {sendResult && (
            <div className={`p-3 rounded-lg mb-4 ${
              sendResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {sendResult.message}
            </div>
          )}

          {/* Send Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowBroadcastModal(false)}
              disabled={sending}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSendBroadcast}
              disabled={sending}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md disabled:opacity-70"
            >
              {sending ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastModal;