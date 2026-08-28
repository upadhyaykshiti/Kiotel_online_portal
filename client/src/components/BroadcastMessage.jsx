


"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import BroadcastLogs from "./BroadcastLogs";


export default function BroadcastMessage() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogs, setShowLogs] = useState(false);


  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/employee/employees2`);
        const employeeData = res.data.data || [];
        const formatted = employeeData.map(emp => ({
          ...emp,
          name: `${emp.first_name} ${emp.last_name}`,
        }));
        setEmployees(formatted);
        setFilteredEmployees(formatted);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError("Failed to load employees.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filter employees by search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = employees.filter(emp =>
        emp.name?.toLowerCase().includes(lowercasedTerm) ||
        emp.email?.toLowerCase().includes(lowercasedTerm) ||
        emp.unique_id?.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  // Select all toggle
  const handleSelectAll = e => {
    if (e.target.checked) {
      const ids = filteredEmployees.map(emp => emp.unique_id);
      setSelectedEmployees(ids);
    } else {
      setSelectedEmployees([]);
    }
  };

  // Individual checkbox toggle
  const handleCheckboxChange = id => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + attachments.length > 5) {
      alert("Maximum 5 attachments allowed.");
      return;
    }
    setAttachments(prev => [...prev, ...files]);
  };

  // Remove a specific attachment
  const removeAttachment = (indexToRemove) => {
    setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim()) return alert("Please enter a message.");
    if (!subject.trim()) return alert("Please enter a subject.");

    const selectedEmps = employees.filter(emp =>
      selectedEmployees.includes(emp.unique_id)
    );

    const emails = selectedEmps.map(emp => emp.email);

    const formData = new FormData();
    formData.append('emails', JSON.stringify(emails));
    formData.append('message', message);
    formData.append('subject', subject);

    attachments.forEach((file, index) => {
      formData.append('attachments', file);
    });

    try {
      setLoading(true);
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/send/broadcast`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert("Message sent successfully with attachments!");
      setMessage("");
      setSubject("");
      setAttachments([]);
      setSelectedEmployees([]);
    } catch (err) {
      console.error("Send error:", err);
      alert(err.response?.data?.error || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  // If showing logs, render the BroadcastLogs component
  if (showLogs) {
    return <BroadcastLogs onBack={() => setShowLogs(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Broadcast Message</h1>
              <p className="mt-1 text-sm text-gray-600">
                Send email notifications to multiple employees at once
              </p>
            </div>
            <button
              onClick={() => setShowLogs(true)}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Broadcast Logs
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          
          {/* Left Column - Employee Selection (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Search & Filter Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search employees by name, email, or ID"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="whitespace-nowrap">
                      {filteredEmployees.length} found
                    </span>
                    <span className="text-blue-600 font-medium whitespace-nowrap">
                      {selectedEmployees.length} selected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={
                            selectedEmployees.length === filteredEmployees.length &&
                            filteredEmployees.length > 0
                          }
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-sm text-gray-500">Loading employees...</p>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                              <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <p className="text-sm text-red-600">{error}</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-500">No employees found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map(emp => (
                        <tr 
                          key={emp.unique_id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleCheckboxChange(emp.unique_id)}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedEmployees.includes(emp.unique_id)}
                              onChange={() => handleCheckboxChange(emp.unique_id)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-9 w-9 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-700">
                                  {emp.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{emp.name || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600">{emp.email || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                              {emp.unique_id || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Message Composition (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Subject Input */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-5">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Enter subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Message Textarea */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-5">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows="6"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                ></textarea>
                <div className="mt-2 text-right">
                  <span className="text-xs text-gray-500">{message.length} characters</span>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-5">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Attachments
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Max 5 files, 10MB each</p>
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-md">
                        <div className="flex items-center min-w-0 flex-1">
                          <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                          </svg>
                          <span className="ml-2 text-xs text-gray-700 truncate">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || !subject.trim() || selectedEmployees.length === 0 || loading}
              className={`w-full py-2.5 px-4 text-sm font-medium rounded-md transition-colors ${
                message.trim() && subject.trim() && selectedEmployees.length > 0 && !loading
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                `Send to ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}`
              )}
            </button>

            {/* Info Notice */}
            {selectedEmployees.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-blue-700">
                    Message will be sent to {selectedEmployees.length} recipient{selectedEmployees.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";

// export default function BroadcastMessage() {
//   const router = useRouter();

//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployees, setSelectedEmployees] = useState([]);
//   const [filteredEmployees, setFilteredEmployees] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [message, setMessage] = useState("");
//   const [subject, setSubject] = useState("");
//   const [attachments, setAttachments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Fetch employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await axios.get(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/employee/employees`
//         );
//         const employeeData = res.data.data || [];
//         const formatted = employeeData.map(emp => ({
//           ...emp,
//           name: `${emp.first_name} ${emp.last_name}`,
//         }));
//         setEmployees(formatted);
//         setFilteredEmployees(formatted);
//       } catch (err) {
//         console.error("Error fetching employees:", err);
//         setError("Failed to load employees.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEmployees();
//   }, []);

//   // Filter employees
//   useEffect(() => {
//     if (!searchTerm.trim()) {
//       setFilteredEmployees(employees);
//     } else {
//       const lower = searchTerm.toLowerCase();
//       setFilteredEmployees(
//         employees.filter(emp =>
//           emp.name?.toLowerCase().includes(lower) ||
//           emp.email?.toLowerCase().includes(lower) ||
//           emp.unique_id?.toLowerCase().includes(lower)
//         )
//       );
//     }
//   }, [searchTerm, employees]);

//   const handleSelectAll = e => {
//     if (e.target.checked) {
//       setSelectedEmployees(filteredEmployees.map(emp => emp.unique_id));
//     } else {
//       setSelectedEmployees([]);
//     }
//   };

//   const handleCheckboxChange = id => {
//     setSelectedEmployees(prev =>
//       prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
//     );
//   };

//   const handleFileChange = e => {
//     const files = Array.from(e.target.files);
//     if (files.length + attachments.length > 5) {
//       alert("Maximum 5 attachments allowed.");
//       return;
//     }
//     setAttachments(prev => [...prev, ...files]);
//   };

//   const removeAttachment = index => {
//     setAttachments(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleSendMessage = async () => {
//     if (!message.trim()) return alert("Please enter a message.");
//     if (!subject.trim()) return alert("Please enter a subject.");

//     const selectedEmps = employees.filter(emp =>
//       selectedEmployees.includes(emp.unique_id)
//     );

//     const emails = selectedEmps.map(emp => emp.email);

//     const formData = new FormData();
//     formData.append("emails", JSON.stringify(emails));
//     formData.append("message", message);
//     formData.append("subject", subject);

//     attachments.forEach(file => {
//       formData.append("attachments", file);
//     });

//     try {
//       setLoading(true);
//       await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/send/broadcast`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       alert("Message sent successfully!");
//       setMessage("");
//       setSubject("");
//       setAttachments([]);
//       setSelectedEmployees([]);
//     } catch (err) {
//       console.error("Send error:", err);
//       alert(err.response?.data?.error || "Failed to send message.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 py-8">

//         {/* Header */}
//         <div className="mb-8 flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-900">
//               Broadcast Message
//             </h1>
//             <p className="text-sm text-gray-600">
//               Send email notifications to multiple employees
//             </p>
//           </div>

//           {/* ✅ VIEW LOGS BUTTON (NEW) */}
//           <button
//             onClick={() => router.push("/send/broadcast/logs")}
//             className="px-4 py-2 text-sm font-medium rounded-md
//                        bg-gray-100 text-gray-700
//                        hover:bg-gray-200 transition"
//           >
//             View Logs
//           </button>
//         </div>

//         {/* Main Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

//           {/* LEFT COLUMN */}
//           <div className="lg:col-span-8 space-y-6">

//             {/* Search */}
//             <div className="bg-white border rounded-lg p-5">
//               <input
//                 type="text"
//                 placeholder="Search employees by name, email, or ID"
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//                 className="w-full px-4 py-2 border rounded-md"
//               />
//             </div>

//             {/* Table */}
//             <div className="bg-white border rounded-lg overflow-hidden">
//               <table className="min-w-full divide-y">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3">
//                       <input
//                         type="checkbox"
//                         checked={
//                           selectedEmployees.length === filteredEmployees.length &&
//                           filteredEmployees.length > 0
//                         }
//                         onChange={handleSelectAll}
//                       />
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium">
//                       Employee
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium">
//                       Email
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium">
//                       ID
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y">
//                   {filteredEmployees.map(emp => (
//                     <tr
//                       key={emp.unique_id}
//                       onClick={() => handleCheckboxChange(emp.unique_id)}
//                       className="hover:bg-gray-50 cursor-pointer"
//                     >
//                       <td className="px-4 py-3">
//                         <input
//                           type="checkbox"
//                           checked={selectedEmployees.includes(emp.unique_id)}
//                           onChange={() => handleCheckboxChange(emp.unique_id)}
//                           onClick={e => e.stopPropagation()}
//                         />
//                       </td>
//                       <td className="px-6 py-3">{emp.name}</td>
//                       <td className="px-6 py-3">{emp.email}</td>
//                       <td className="px-6 py-3">{emp.unique_id}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* RIGHT COLUMN */}
//           <div className="lg:col-span-4 space-y-6">
//             <input
//               placeholder="Subject"
//               value={subject}
//               onChange={e => setSubject(e.target.value)}
//               className="w-full px-3 py-2 border rounded-md"
//             />

//             <textarea
//               rows={6}
//               placeholder="Type your message..."
//               value={message}
//               onChange={e => setMessage(e.target.value)}
//               className="w-full px-3 py-2 border rounded-md resize-none"
//             />

//             <input
//               type="file"
//               multiple
//               onChange={handleFileChange}
//               className="block w-full text-sm"
//             />

//             <button
//               onClick={handleSendMessage}
//               disabled={!subject || !message || selectedEmployees.length === 0 || loading}
//               className="w-full py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300"
//             >
//               Send to {selectedEmployees.length} employee
//               {selectedEmployees.length !== 1 && "s"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
