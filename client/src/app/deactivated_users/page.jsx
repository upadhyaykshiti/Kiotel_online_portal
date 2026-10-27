"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserSlash, FaCalendarAlt, FaClock, FaSignOutAlt, FaSearch } from 'react-icons/fa';

// const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';
const API_BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` || 'http://localhost:3001/api';

export default function DeactivatedUsersPage() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail View State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('schedules');
  const [detailsData, setDetailsData] = useState({ schedules: [], attendance: [], leaves: [] });
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch Master List
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Adjust endpoint path if your API_BASE already includes '/api'
        const response = await axios.get(`${API_BASE}/deactivated-employees`);
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } catch (err) {
        console.error("Error fetching deactivated employees:", err);
        setError("Failed to load deactivated accounts.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Search Filter
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = employees.filter(emp => 
      emp.first_name?.toLowerCase().includes(query) || 
      emp.last_name?.toLowerCase().includes(query) || 
      emp.unique_id?.toLowerCase().includes(query)
    );
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  // Fetch Details when an employee is selected
  // Fetch Details when an employee is selected
  useEffect(() => {
    if (!selectedEmployee) return;

    const fetchDetails = async () => {
      setDetailsLoading(true);
      try {
        // ✅ FIX: Use unique_id (which holds account_no) instead of the database ID
        const accountNo = selectedEmployee.unique_id; 

        const [schedRes, attRes, leavesRes] = await Promise.all([
          axios.get(`${API_BASE}/deactivated-employees/${accountNo}/schedules`),
          axios.get(`${API_BASE}/deactivated-employees/${accountNo}/attendance`),
          axios.get(`${API_BASE}/deactivated-employees/${accountNo}/leaves`)
        ]);

        setDetailsData({
          schedules: schedRes.data || [],
          attendance: attRes.data || [],
          leaves: leavesRes.data || []
        });
      } catch (err) {
        console.error("Error fetching employee details:", err);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchDetails();
  }, [selectedEmployee]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex flex-col md:flex-row gap-6">
      
      {/* LEFT PANEL: Master List */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-3rem)]">
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaUserSlash className="text-red-500" />
            Deactivated Users
          </h2>
          <div className="mt-3 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <p className="text-center text-gray-500 mt-10">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500 mt-10">{error}</p>
          ) : filteredEmployees.length === 0 ? (
            <p className="text-center text-gray-500 mt-10 text-sm">No deactivated users found.</p>
          ) : (
            filteredEmployees.map(emp => (
              <div 
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors border ${
                  selectedEmployee?.id === emp.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="font-semibold text-gray-800">{emp.first_name} {emp.last_name}</div>
                <div className="text-xs text-gray-500">ID: {emp.unique_id}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Details View */}
      <div className="w-full md:w-2/3 lg:w-3/4 bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-3rem)] flex flex-col">
        {!selectedEmployee ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
            <FaUserSlash className="text-6xl mb-4 text-gray-200" />
            <p className="text-lg">Select a deactivated user to view their records</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">{selectedEmployee.first_name} {selectedEmployee.last_name}</h2>
              <p className="text-gray-500 text-sm mt-1">
                Account ID: <span className="font-medium">{selectedEmployee.unique_id}</span> | Email: {selectedEmployee.email}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-4">
              <button 
                onClick={() => setActiveTab('schedules')}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 ${activeTab === 'schedules' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
              >
                <FaCalendarAlt /> Schedules
              </button>
              <button 
                onClick={() => setActiveTab('attendance')}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 ${activeTab === 'attendance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
              >
                <FaClock /> Attendance
              </button>
              <button 
                onClick={() => setActiveTab('leaves')}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 ${activeTab === 'leaves' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
              >
                <FaSignOutAlt /> Leave Requests
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {detailsLoading ? (
                <p className="text-center text-gray-500 mt-10">Loading records...</p>
              ) : (
                <>
                  {/* SCHEDULES TAB */}
                  {activeTab === 'schedules' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-100 text-gray-600 uppercase">
                            <th className="p-3 border-b">Date</th>
                            <th className="p-3 border-b">Shift</th>
                            <th className="p-3 border-b">Property</th>
                            <th className="p-3 border-b">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailsData.schedules.length === 0 ? (
                            <tr><td colSpan="4" className="p-4 text-center text-gray-500">No schedules found.</td></tr>
                          ) : (
                            detailsData.schedules.map(row => (
                              <tr key={row.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{new Date(row.entry_date).toLocaleDateString()}</td>
                                <td className="p-3">{row.shift_name || 'N/A'}</td>
                                <td className="p-3">{row.property_name || 'N/A'}</td>
                                <td className="p-3">{row.assignment_status}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ATTENDANCE TAB
                  {activeTab === 'attendance' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-100 text-gray-600 uppercase">
                            <th className="p-3 border-b">Clock In</th>
                            <th className="p-3 border-b">Clock Out</th>
                            <th className="p-3 border-b">Total Hours</th>
                            <th className="p-3 border-b">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailsData.attendance.length === 0 ? (
                            <tr><td colSpan="4" className="p-4 text-center text-gray-500">No attendance records found.</td></tr>
                          ) : (
                            detailsData.attendance.map(row => (
                              <tr key={row.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{new Date(row.clock_in_time).toLocaleString()}</td>
                                <td className="p-3">{row.clock_out_time ? new Date(row.clock_out_time).toLocaleString() : 'Missed'}</td>
                                <td className="p-3">{row.total_hours || '0'} hrs</td>
                                <td className="p-3">{row.status}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )} */}
                                    {/* ATTENDANCE TAB */}
                  {activeTab === 'attendance' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-100 text-gray-600 uppercase">
                            <th className="p-3 border-b font-semibold">Date</th>
                            <th className="p-3 border-b font-semibold">Clock In</th>
                            <th className="p-3 border-b font-semibold">Clock Out</th>
                            <th className="p-3 border-b font-semibold">Total Hours</th>
                            <th className="p-3 border-b font-semibold">Photos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailsData.attendance.length === 0 ? (
                            <tr><td colSpan="5" className="p-4 text-center text-gray-500">No attendance records found.</td></tr>
                          ) : (
                            detailsData.attendance.map(row => (
                              <tr key={row.id} className="border-b hover:bg-gray-50 transition-colors">
                                {/* Date */}
                                <td className="p-3 font-medium text-gray-800">
                                  {new Date(row.attendance_date).toLocaleDateString()}
                                </td>
                                
                                {/* Clock In Time */}
                                <td className="p-3 text-green-700 font-medium">
                                  {row.clock_in ? new Date(row.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </td>
                                
                                {/* Clock Out Time */}
                                <td className="p-3 text-red-600 font-medium">
                                  {row.clock_out ? new Date(row.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Missed'}
                                </td>
                                
                                {/* Total Hours Calculation */}
                                <td className="p-3">
                                  {row.total_hours ? (
                                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-medium">
                                      {row.total_hours} hrs
                                    </span>
                                  ) : '—'}
                                </td>

                                {/* Photos (If available) */}
                                <td className="p-3 flex gap-2">
                                  {row.photo_in_url ? (
                                    <a href={row.photo_in_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">In</a>
                                  ) : <span className="text-gray-300 text-xs">-</span>}
                                  
                                  {row.photo_out_url ? (
                                    <a href={row.photo_out_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">Out</a>
                                  ) : <span className="text-gray-300 text-xs">-</span>}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* LEAVES TAB */}
                  {activeTab === 'leaves' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-100 text-gray-600 uppercase">
                            <th className="p-3 border-b">Type</th>
                            <th className="p-3 border-b">Start Date</th>
                            <th className="p-3 border-b">End Date</th>
                            <th className="p-3 border-b">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailsData.leaves.length === 0 ? (
                            <tr><td colSpan="4" className="p-4 text-center text-gray-500">No leave requests found.</td></tr>
                          ) : (
                            detailsData.leaves.map(row => (
                              <tr key={row.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium text-gray-800">{row.leave_type}</td>
                                <td className="p-3">{new Date(row.start_date).toLocaleDateString()}</td>
                                <td className="p-3">{new Date(row.end_date).toLocaleDateString()}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
  row.status === 'accepted' ? 'bg-green-100 text-green-800' :
  row.status === 'rejected' ? 'bg-red-100 text-red-800' :
  'bg-yellow-100 text-yellow-800'
}`}>
  {row.status}
</span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}