// components/TicketDetails.jsx
"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Select from "react-select";
import DOMPurify from "isomorphic-dompurify";
import {
  FaTasks,
  FaUser,
  FaTag,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaPaperclip,
  FaChevronDown,
  FaChevronUp,
  FaSave,
  FaCheck,
  FaTimes,
  FaEllipsisV,
  FaCommentDots,
  FaUserPlus,
  FaSync,
  FaArrowLeft
} from "react-icons/fa";

export default function TicketDetails({ params }) {
  const ticketId = params.taskId;
  const [ticketDetails, setTicketDetails] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [taskState, setTaskState] = useState(null);
  const [taskPriority, setTaskPriority] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [subtasks, setSubtasks] = useState([]); 

  const statusDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);
  const assignDropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target)) {
        setIsPriorityDropdownOpen(false);
      }
      if (assignDropdownRef.current && !assignDropdownRef.current.contains(event.target)) {
        setIsAssignDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // attachment_urls comes back comma-separated (may be a JSON-encoded string,
  // a plain "url1,url2" string, or an array). Normalise to a URL array.
  const parseAttachmentUrls = (val) => {
    if (!val) return [];
    let s = val;
    if (typeof s !== "string") {
      if (Array.isArray(s)) return s.filter(Boolean);
      s = String(s);
    }
    try {
      const p = JSON.parse(s);
      if (Array.isArray(p)) return p.filter(Boolean);
      if (typeof p === "string") s = p;
    } catch (_) {
      /* not JSON — treat as plain comma-separated */
    }
    return s.split(",").map((x) => x.trim()).filter(Boolean);
  };

  const isImage = (filename) => {
    if (!filename || typeof filename !== "string") {
      return false;
    }
    const imageExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp",
      "svg",
      "tiff",
      "tif",
    ];
    const parts = filename.split(".");
    if (parts.length < 2) {
      return false;
    }
    const ext = parts.pop().toLowerCase();
    return imageExtensions.includes(ext);
  };

  const checkFileExistence = async (filePath) => {
    try {
      const response = await axios.head(filePath);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const handleDownload = async (filePath, filename) => {
    const fileExists = await checkFileExistence(filePath);
    if (fileExists) {
      const link = document.createElement("a");
      link.href = filePath;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("File not found on the server.");
    }
  };

  // Fetch ticket details and replies
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const [ticketResponse, repliesResponse] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/${ticketId}/v2`,
            {
              withCredentials: true,
            }
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/${ticketId}/replies/v2`,
            {
              withCredentials: true,
            }
          ),
        ]);
        const ticketData = ticketResponse.data;
        let multi = ticketData.unique_multi;

        if (!multi) {
          ticketData.unique_multi = [];
        } else if (typeof multi === "string") {
          try {
            ticketData.unique_multi = JSON.parse(multi);
            if (!Array.isArray(ticketData.unique_multi)) ticketData.unique_multi = [];
          } catch {
            ticketData.unique_multi = [];
          }
        } else if (!Array.isArray(multi)) {
          ticketData.unique_multi = [];
        }

        setTicketDetails(ticketData);
        setSelectedStatus(ticketData.status_id?.toString() || "");
        setSelectedPriority(ticketData.priority_id?.toString() || "");
        
        const repliesWithAttachments = repliesResponse.data.map((reply) => ({
          ...reply,
          attachments: reply.unique_name,
        }));
        setReplies(repliesWithAttachments);
      } catch (err) {
        console.error("Error fetching ticket details:", err);
        setError(err.response?.data?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    if (ticketId) fetchTicketDetails();
  }, [ticketId]);

  // Fetch subtasks when ticketDetails.id is available
  useEffect(() => {
    const fetchSubtasks = async () => {
      if (!ticketDetails?.id) return; 

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/subtasks/${ticketId}`,
          { withCredentials: true }
        );
        setSubtasks(response.data || []); 
      } catch (err) {
        console.error("Error fetching subtasks:", err);
        setSubtasks([]); 
      }
    };

    fetchSubtasks();
  }, [ticketDetails?.id]);

  // Fetch statuses and priorities
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [statusRes, priorityRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskstate`),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/priority`),
        ]);
        setStatuses(statusRes.data);
        setPriorities(priorityRes.data);
      } catch (err) {
        console.error("Failed to fetch options:", err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch current task state
  useEffect(() => {
    const fetchTaskState = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get_assigned_state_for_task/${ticketId}`,
          { withCredentials: true }
        );
        if (response.data && !response.data.error) {
          setTaskState(response.data);
        }
      } catch (err) {
        console.error("Error fetching task state:", err);
      }
    };
    if (ticketId) fetchTaskState();
  }, [ticketId]);

  // Fetch current task priority
  useEffect(() => {
    const fetchTaskPriority = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get_assigned_priority_for_task/${ticketId}`,
          { withCredentials: true }
        );
        if (response.data && !response.data.error) {
          setTaskPriority(response.data);
        }
      } catch (err) {
        console.error("Error fetching task priority:", err);
      }
    };
    if (ticketId) fetchTaskPriority();
  }, [ticketId]);

  // Fetch assigned users
  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get_assigned_user_for_task/${ticketId}`,
          { withCredentials: true }
        );
        if (response.data && Array.isArray(response.data)) {
          setAssignedUsers(response.data);
        } else if (response.data && !Array.isArray(response.data)) {
          setAssignedUsers([response.data]);
        } else {
          setAssignedUsers([]);
        }
      } catch (err) {
        console.error("Error fetching assigned users:", err);
        setAssignedUsers([]);
      }
    };
    if (ticketId) fetchAssignedUsers();
  }, [ticketId]);

  // Fetch user session
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };
    fetchUserDetails();
  }, []);
 
  // Fetch users for assignment dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`
        );
        const filteredUsers = response.data
          .filter((user) => user.role !== "Client")
          .map((user) => ({
            value: user.id,
            label: `${user.fname} ${user.lname}`,
          }));
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleStatusChange = async (statusId) => {
    const statusName = statuses.find((s) => s.Id.toString() === statusId.toString())?.status_name;
    
    setSelectedStatus(statusId.toString());
    setTaskState({ status_name: statusName });
    setTicketDetails((prev) => ({ ...prev, status_id: statusId, status_name: statusName }));
    setIsStatusDropdownOpen(false);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update_task_state/v2`,
        { status_id: statusId, ticketId },
        { withCredentials: true, headers: { "x-user-id": user?.id } }
      );
    } catch (err) {
      console.error("🚨 Error updating status:", err);
    }
  };

  const handlePriorityChange = async (priorityId) => {
    const priorityName = priorities.find((p) => p.Id.toString() === priorityId.toString())?.priority_name;
    
    setSelectedPriority(priorityId.toString());
    setTaskPriority({ priority_name: priorityName });
    setTicketDetails((prev) => ({ ...prev, priority_id: priorityId, priority_name: priorityName }));
    setIsPriorityDropdownOpen(false);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update_task_priority`,
        { priority_id: priorityId, ticketId },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("🚨 Error updating priority:", err);
    }
  };

  const handleDueDateChange = async (e) => {
    const newDate = e.target.value || null;
    
    setTicketDetails((prev) => ({ ...prev, due_date: newDate }));

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update_task_due_date`,
        { ticketId, due_date: newDate },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error updating due date:", err);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUser) {
      alert("⚠️ Please select a user to assign.");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/assign_user_to_task`,
        {
          task_id: ticketId,
          assigned_to: selectedUser.value,
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        const updatedUsersResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get_assigned_user_for_task/${ticketId}`,
          { withCredentials: true }
        );
        const updatedUsers = Array.isArray(updatedUsersResponse.data)
          ? updatedUsersResponse.data
          : [updatedUsersResponse.data];
        setAssignedUsers(updatedUsers);
        setSelectedUser(null);
        setIsAssignDropdownOpen(false);
      }
    } catch (err) {
      console.error("🚨 Error assigning user:", err);
      alert("❌ Failed to assign user.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-700 font-medium">Loading task details...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">Failed to load task details: {error}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  if (!ticketDetails)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-gray-700 font-medium">No task details available.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- UNIFIED MODERN HEADER CARD --- */}
        <header className="bg-white shadow-sm shadow-blue-100/60 rounded-2xl mb-8 p-6 border border-blue-100">
          {/* Top Row: Back Button & User/Logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-100">
            <button
              onClick={() => router.push('/TaskManager/openTasks')}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200 border border-blue-100 hover:border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FaArrowLeft className="mr-2" /> Back to Tasks
            </button>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              {user && (user.name || user.fname) && (
                <div className="hidden sm:flex items-center gap-4">
                  <span className="text-gray-500 text-sm font-medium">
                    Welcome, <span className="text-gray-900">{user.name || user.fname}</span>
                  </span>
                  <div className="h-6 w-px bg-gray-200"></div>
                </div>
              )}
              <img
                src="/Kiotel_Logo_bg.PNG"
                alt="Kiotel Logo"
                className="h-8 sm:h-10 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onClick={() => router.push("/TaskManager")}
              />
            </div>
          </div>

          {/* Bottom Row: Page Title */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-md shadow-blue-200">
              <FaTasks className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Task Details</h1>
              <div className="flex items-center mt-1 space-x-2 text-sm font-medium text-gray-500">
                <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">#{ticketDetails.id}</span>
                <span>•</span>
                <span className="text-gray-600">{ticketDetails.title}</span>
              </div>
            </div>
          </div>
        </header>
        {/* --- END UNIFIED MODERN HEADER CARD --- */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Task Information Card */}
            <div className="bg-white rounded-2xl shadow-sm shadow-blue-100/50 overflow-hidden border border-blue-100">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{ticketDetails.title}</h2>
                    <p className="text-gray-600 mt-1">Created on {new Date(ticketDetails.created_at).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        router.push(
                          `/TaskManager/task/${ticketId}/replyTicket?title=${encodeURIComponent(
                            ticketDetails.title
                          )}`
                        )
                      }
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      <FaCommentDots className="mr-2" />
                      Reply
                    </button>
                    <div className="relative" ref={assignDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}
                        className="inline-flex items-center px-4 py-2 bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 text-sm font-medium rounded-lg shadow-sm transition-all duration-300"
                      >
                        <FaUserPlus className="mr-2" />
                        Assign
                      </button>
                      {isAssignDropdownOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 p-4 border border-gray-200">
                          <h4 className="font-medium text-gray-800 mb-3">Assign to user</h4>
                          <Select
                            value={selectedUser}
                            onChange={setSelectedUser}
                            options={users}
                            placeholder="Search & select user..."
                            className="mb-3"
                          />
                          <button
                            onClick={handleAssignUser}
                            disabled={!selectedUser}
                            className={`w-full py-2 px-4 rounded-lg shadow transition ${
                              !selectedUser
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white transform hover:-translate-y-0.5 shadow-blue-200/50"
                            }`}
                          >
                            Confirm Assignment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Priority Badges */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        taskState?.status_name?.toLowerCase() === "open"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : taskState?.status_name?.toLowerCase() === "in progress"
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : taskState?.status_name?.toLowerCase() === "resolved"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : taskState?.status_name?.toLowerCase() === "closed"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full mr-2 bg-current"></span>
                      {taskState?.status_name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">Priority:</span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        taskPriority?.priority_name?.toLowerCase() === "low"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : taskPriority?.priority_name?.toLowerCase() === "medium"
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : taskPriority?.priority_name?.toLowerCase() === "important"
                          ? "bg-orange-100 text-orange-800 border border-orange-200"
                          : taskPriority?.priority_name?.toLowerCase() === "urgent"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full mr-2 bg-current"></span>
                      {taskPriority?.priority_name || "Not Set"}
                    </span>
                  </div>
                </div>

                {/* Description (rich HTML from the editor, sanitized) */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                  <div
                    className="task-html bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(ticketDetails.description || ""),
                    }}
                  />
                </div>
                <style>{`
                  .task-html p { margin: 0 0 0.5rem; }
                  .task-html p:last-child { margin-bottom: 0; }
                  .task-html ul { list-style: disc; padding-left: 1.25rem; margin: 0 0 0.5rem; }
                  .task-html ol { list-style: decimal; padding-left: 1.25rem; margin: 0 0 0.5rem; }
                  .task-html a { color: #2563eb; text-decoration: underline; }
                  .task-html strong { font-weight: 600; }
                  .task-html h1, .task-html h2, .task-html h3 { font-weight: 600; margin: 0.5rem 0; }
                  .task-html pre { background: #0f172a; color: #e2e8f0; padding: 0.75rem; border-radius: 6px; overflow-x: auto; }
                `}</style>

                {/* Subtasks */}
                {subtasks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                      <FaTasks className="mr-2 text-blue-600" />
                      Subtasks
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <ul className="space-y-2">
                        {subtasks.map((subtask) => (
                          <li key={subtask.id}>
                            <button
                              onClick={() => router.push(`/TaskManager/task/${subtask.id}`)}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left block"
                            >
                              #{subtask.id}: {subtask.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Attachments (served from DigitalOcean Spaces via attachment_urls) */}
                {parseAttachmentUrls(ticketDetails.attachment_urls).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                      <FaPaperclip className="mr-2 text-blue-600" />
                      Attachments
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {parseAttachmentUrls(ticketDetails.attachment_urls).map((url, idx) =>
                        isImage(url) ? (
                          <div key={idx} className="relative group overflow-hidden rounded-lg shadow-md">
                            <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                              <img
                                src={url}
                                alt={`Task Attachment ${idx + 1}`}
                                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </a>
                          </div>
                        ) : (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow transition transform hover:-translate-y-0.5 flex items-center justify-center text-center"
                          >
                            Download File
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Replies Section */}
            <div className="bg-white rounded-2xl shadow-sm shadow-blue-100/50 overflow-hidden border border-blue-100">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaCommentDots className="mr-2 text-blue-600" />
                  Conversation ({replies.length})
                </h3>
                {replies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No replies yet. Be the first to comment!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {replies.map((reply, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center font-semibold text-sm mr-3">
                              {reply.fname.charAt(0)}
                              {reply.lname?.charAt(0) || ""}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{reply.fname} {reply.lname || ''}</h4>
                              <p className="text-xs text-gray-500">
                                {new Date(reply.created_at).toLocaleString("en-US", {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4">{reply.reply_text}</p>
                        
                        {/* Reply Attachments (from Spaces via attachment_urls) */}
                        {parseAttachmentUrls(reply.attachment_urls).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {parseAttachmentUrls(reply.attachment_urls).map((url, i) =>
                                isImage(url) ? (
                                  <div key={i} className="relative group overflow-hidden rounded-lg shadow-md">
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                                      <img
                                        src={url}
                                        alt={`Reply Attachment ${i + 1}`}
                                        className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                                      />
                                    </a>
                                  </div>
                                ) : (
                                  <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow transition transform hover:-translate-y-0.5 flex items-center justify-center text-center"
                                  >
                                    Download Attachment
                                  </a>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Assignment Card */}
            <div className="bg-white rounded-2xl shadow-sm shadow-blue-100/50 overflow-hidden border border-blue-100">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Assignment
                </h3>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned To</h4>
                  {assignedUsers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {assignedUsers.map((user, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                        >
                          <FaUser className="mr-1 text-blue-600" size="0.8em" />
                          {user.fname} {user.lname?.charAt(0) || ''}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Unassigned</p>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="bg-white rounded-2xl shadow-sm shadow-blue-100/50 overflow-hidden border border-blue-100">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaTag className="mr-2 text-blue-600" />
                  Metadata
                </h3>
                <div className="space-y-6">
                  
                  {/* Status Auto-Save Dropdown */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
                    <div className="relative" ref={statusDropdownRef}>
                      <button
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="w-full px-4 py-2 text-left bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 hover:border-gray-400 flex justify-between items-center"
                      >
                        <span className="font-medium text-gray-800">{taskState?.status_name || "Select Status"}</span>
                        <div className="flex items-center">
                          {isStatusDropdownOpen ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
                        </div>
                      </button>
                      {isStatusDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {statuses.map((status) => (
                            <div
                              key={status.Id}
                              onClick={() => handleStatusChange(status.Id)}
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-800"
                            >
                              {status.status_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Priority Auto-Save Dropdown */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Priority</h4>
                    <div className="relative" ref={priorityDropdownRef}>
                      <button
                        onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                        className="w-full px-4 py-2 text-left bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 hover:border-gray-400 flex justify-between items-center"
                      >
                        <span className="font-medium text-gray-800">{taskPriority?.priority_name || "Select Priority"}</span>
                        <div className="flex items-center">
                          {isPriorityDropdownOpen ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
                        </div>
                      </button>
                      {isPriorityDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {priorities.map((priority) => (
                            <div
                              key={priority.Id}
                              onClick={() => handlePriorityChange(priority.Id)}
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-800"
                            >
                              {priority.priority_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Due Date Editable Input */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Due Date</h4>
                    <input
                      type="date"
                      value={ticketDetails.due_date ? new Date(ticketDetails.due_date).toISOString().split('T')[0] : ''}
                      onChange={handleDueDateChange}
                      className="w-full px-4 py-2 text-left bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 hover:border-gray-400 text-gray-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}