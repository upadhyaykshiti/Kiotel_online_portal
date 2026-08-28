
// components/OpenedTickets.jsx
"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaGripLinesVertical,
  FaTasks,
  FaFilter,
  FaList,
  FaThLarge,
  FaCog,
  FaTag,
  FaUser,
  FaExclamationCircle,
  FaSearch,
  FaTimes,
  FaPlus,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

export default function OpenedTickets() {
  const router = useRouter();
  const [openedTickets, setOpenedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [allAssignedUsers, setAllAssignedUsers] = useState({});
  const [taskStates, setTaskStates] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [tags, setTags] = useState([]);
  const [ticketState, setTicketState] = useState({});
  const [ticketPriority, setTicketPriority] = useState({});
  // --- Updated: Multi-select filter states for all filters ---
  const [selectedStates, setSelectedStates] = useState(new Set());
  const [selectedPriorities, setSelectedPriorities] = useState(new Set());
  const [selectedTags, setSelectedTags] = useState(new Set());
  // --- END Updated ---
  const [assignedUserSearch, setAssignedUserSearch] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" or "kanban"
  const [kanbanSettings, setKanbanSettings] = useState({
    columns: [],
    columnOrder: [],
  });
  const [showKanbanSettings, setShowKanbanSettings] = useState(false);
  const [draggedTicket, setDraggedTicket] = useState(null);
  // Column resizing states
  const [columnWidths, setColumnWidths] = useState({
    tags: 150,
    title: 250,
    createdBy: 180,
    assignedUsers: 200,
    dueDate: 120, // NEW: Added dueDate column
    state: 120,
    priority: 120,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [currentResizingColumn, setCurrentResizingColumn] = useState(null);
  const tableRef = useRef(null);

  // --- NEW: Priority Order Map ---
  const priorityOrder = {
    urgent: 4,
    important: 3,
    medium: 2,
    low: 1,
    "not set": 0, // Default for undefined priorities
  };
  // --- END NEW ---

  // --- NEW: dropdown open states ---
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const [openPriorityDropdown, setOpenPriorityDropdown] = useState(false);
  const [openTagDropdown, setOpenTagDropdown] = useState(false);
  // tag search
  const [tagSearch, setTagSearch] = useState("");
  // --- END NEW ---

  // Fetch the user's role from the session
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        setUserRole(response.data.role);
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        setError("Failed to fetch user role");
      }
    };
    fetchUserRole();
  }, []);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/opened_tasks`,
          { withCredentials: true }
        );
        const tasks = response.data;
        setOpenedTickets(tasks);
        const taskStatesTemp = {};
        const taskPrioritiesTemp = {};
        const allAssignedUsersMap = {};
        tasks.forEach((task) => {
          const taskId = task.task_id;
          taskStatesTemp[taskId] = task.status_name;
          taskPrioritiesTemp[taskId] = task.priority_name;
          if (task.assigned_users && task.assigned_users.length > 0) {
            allAssignedUsersMap[taskId] = task.assigned_users;
          } else {
            allAssignedUsersMap[taskId] = [];
          }
        });
        setTicketState(taskStatesTemp);
        setTicketPriority(taskPrioritiesTemp);
        setAllAssignedUsers(allAssignedUsersMap);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Fetch task states
  useEffect(() => {
    const fetchTaskStates = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskstate`);
        setTaskStates(response.data);
      } catch (error) {
        console.error("Error fetching task states:", error);
      }
    };
    fetchTaskStates();
  }, []);

  // Fetch priorities
  useEffect(() => {
    const fetchPriorities = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/priority`);
        setPriorities(response.data);
      } catch (error) {
        console.error("Error fetching priorities:", error);
      }
    };
    fetchPriorities();
  }, []);

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags`);
        const tagOptions = response.data.map((tag) => ({
          value: tag.id,
          label: tag.tag,
        }));
        setTags(tagOptions);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
  }, []);

  // --- NEW: Set default filters after states/priorities/tags are loaded ---
  // 1) Status default: all except 'Completed' (keeps prior behavior)
  useEffect(() => {
    if (taskStates.length > 0) {
      const defaultStates = new Set();
      taskStates.forEach((state) => {
        if (state.status_name.toLowerCase() !== "completed") {
          defaultStates.add(state.Id.toString());
        }
      });
      setSelectedStates(defaultStates);
    }
  }, [taskStates]);

  // 2) Priorities default: select ALL priorities by default and show names in control
  useEffect(() => {
    if (priorities.length > 0) {
      const all = new Set(priorities.map((p) => p.Id.toString()));
      setSelectedPriorities(all);
    }
  }, [priorities]);

  // 3) Tags default: select ALL tags by default and show names in control
  useEffect(() => {
    if (tags.length > 0) {
      const all = new Set(tags.map((t) => t.value.toString()));
      setSelectedTags(all);
    }
  }, [tags]);
  // --- END NEW ---

  // Fetch user's Kanban settings
  useEffect(() => {
    const fetchKanbanSettings = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kanban-settings`, {
          withCredentials: true,
        });
        if (response.data && response.data.settings) {
          const settings = JSON.parse(response.data.settings);
          setKanbanSettings(settings);
        } else {
          // Default settings if none exist
          const defaultColumns = taskStates.map((state) => ({
            id: state.Id.toString(),
            title: state.status_name,
            visible: true,
          }));
          const defaultSettings = {
            columns: defaultColumns,
            columnOrder: defaultColumns.map((col) => col.id),
          };
          setKanbanSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Error fetching Kanban settings:", error);
        // Fallback to default settings
        const defaultColumns = taskStates.map((state) => ({
          id: state.Id.toString(),
          title: state.status_name,
          visible: true,
        }));
        const defaultSettings = {
          columns: defaultColumns,
          columnOrder: defaultColumns.map((col) => col.id),
        };
        setKanbanSettings(defaultSettings);
      }
    };
    if (taskStates.length > 0) {
      fetchKanbanSettings();
    }
  }, [taskStates]);

  // Save Kanban settings
  const saveKanbanSettings = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/save-kanban-settings`,
        { settings: JSON.stringify(kanbanSettings) },
        { withCredentials: true }
      );
      alert("Kanban settings saved successfully!");
      setShowKanbanSettings(false);
    } catch (error) {
      console.error("Error saving Kanban settings:", error);
      alert("Failed to save Kanban settings");
    }
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnId) => {
    setKanbanSettings((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col)),
    }));
  };

  // Move column in order
  const moveColumn = (columnId, direction) => {
    setKanbanSettings((prev) => {
      const newOrder = [...prev.columnOrder];
      const currentIndex = newOrder.indexOf(columnId);
      if (direction === "left" && currentIndex > 0) {
        [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      } else if (direction === "right" && currentIndex < newOrder.length - 1) {
        [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      }
      return { ...prev, columnOrder: newOrder };
    });
  };

  // Column resizing functions
  const startResizing = (column, e) => {
    e.preventDefault();
    setIsResizing(true);
    setCurrentResizingColumn(column);
  };
  const handleMouseMove = (e) => {
    if (!isResizing || !currentResizingColumn || !tableRef.current) return;
    const containerRect = tableRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    setColumnWidths((prev) => ({
      ...prev,
      [currentResizingColumn]: Math.max(100, x),
    }));
  };
  const stopResizing = () => {
    setIsResizing(false);
    setCurrentResizingColumn(null);
  };

  // Add event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", stopResizing);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", stopResizing);
      };
    }
  }, [isResizing, currentResizingColumn]);

  // --- Updated: Filtering logic with multi-select for all filters ---
  const filteredTickets = openedTickets.filter((ticket) => {
    const taskId = ticket.task_id;
    const currentState = ticketState[taskId];
    const currentPriority = ticketPriority[taskId];
    const assignedUsers = allAssignedUsers[taskId] || [];

    // Find state ID based on name
    const currentStateObj = taskStates.find((s) => s.status_name === currentState);
    const currentStateId = currentStateObj ? currentStateObj.Id.toString() : null;

    // Find priority ID based on name
    const currentPriorityObj = priorities.find((p) => p.priority_name === currentPriority);
    const currentPriorityId = currentPriorityObj ? currentPriorityObj.Id.toString() : null;

    const matchesState = selectedStates.size === 0 || (currentStateId && selectedStates.has(currentStateId));
    const matchesPriority = selectedPriorities.size === 0 || (currentPriorityId && selectedPriorities.has(currentPriorityId));
    const matchesUser =
      !assignedUserSearch ||
      assignedUsers.some((u) => {
        const fullName = `${u.fname || ""} ${u.lname || ""}`.trim().toLowerCase();
        return fullName.includes(assignedUserSearch.trim().toLowerCase());
      });

    // Fixed Match tag - correctly parse task_tags string
    const taskTagString = ticket.task_tags;
    const taskTagsArray =
      typeof taskTagString === "string" ? taskTagString.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
    // For tags we store selectedTags as tag IDs (strings) so we need to map names to ids.
    // We'll assume the tags array contains {value, label} where label matches tag text.
    const tagNameToId = Object.fromEntries(tags.map((t) => [t.label, t.value.toString()]));
    const ticketTagIds = taskTagsArray.map((name) => tagNameToId[name]).filter(Boolean);
    const matchesTag = selectedTags.size === 0 || ticketTagIds.some((tid) => selectedTags.has(tid));

    return matchesState && matchesPriority && matchesUser && matchesTag;
  });

  // --- Updated: Sort tickets by priority after filtering ---
  const sortedFilteredTickets = [...filteredTickets].sort((a, b) => {
    const priorityA = ticketPriority[a.task_id]?.toLowerCase() || "not set";
    const priorityB = ticketPriority[b.task_id]?.toLowerCase() || "not set";
    return priorityOrder[priorityB] - priorityOrder[priorityA]; // Descending order
  });

  // Group tickets by status for Kanban view (uses sorted list)
  const groupTicketsByStatus = () => {
    const statusGroups = {};
    // Initialize with visible columns only
    kanbanSettings.columns.filter((col) => col.visible).forEach((column) => {
      statusGroups[column.title] = [];
    });
    // Group sorted tickets by their status
    sortedFilteredTickets.forEach((ticket) => {
      const status = ticketState[ticket.task_id] || "Open";
      // Only add to groups that are visible
      if (statusGroups.hasOwnProperty(status)) {
        statusGroups[status].push(ticket);
      }
    });
    return statusGroups;
  };
  // --- END Updated ---

  // Handle drag start
  const handleDragStart = (e, ticket) => {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Handle drop
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTicket) return;
    try {
      // Find the status ID for the new status
      const statusObj = taskStates.find((s) => s.status_name === newStatus);
      if (!statusObj) return;
      // Update task status
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update_task_state`,
        {
          ticketId: draggedTicket.task_id,
          status_id: statusObj.Id,
        },
        { withCredentials: true }
      );
      // Update local state
      setTicketState((prev) => ({
        ...prev,
        [draggedTicket.task_id]: newStatus,
      }));
      alert("Task status updated successfully!");
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status");
    } finally {
      setDraggedTicket(null);
    }
  };

  // Badge styling
  const getStateBadge = (statusName) => {
    switch (statusName?.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800 border border-green-200";
      case "in progress":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "resolved":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "completed":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };
  const getPriorityBadge = (priorityName) => {
    switch (priorityName?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 border border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "important":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "urgent":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // --- NEW: Multi-select filter handler functions ---
  const toggleState = (stateId) => {
    setSelectedStates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stateId)) {
        newSet.delete(stateId);
      } else {
        newSet.add(stateId);
      }
      return newSet;
    });
  };

  const togglePriority = (priorityId) => {
    setSelectedPriorities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(priorityId)) {
        newSet.delete(priorityId);
      } else {
        newSet.add(priorityId);
      }
      return newSet;
    });
  };

  const toggleTag = (tagValue) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tagValue)) {
        newSet.delete(tagValue);
      } else {
        newSet.add(tagValue);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    // Clear states, priorities, tags, and assigned user search
    // States keep default (all except completed)
    if (taskStates.length > 0) {
      const defaultStates = new Set();
      taskStates.forEach((state) => {
        if (state.status_name.toLowerCase() !== "completed") {
          defaultStates.add(state.Id.toString());
        }
      });
      setSelectedStates(defaultStates);
    } else {
      setSelectedStates(new Set());
    }

    // Priorities and tags reset to ALL selected (per your default requirement)
    if (priorities.length > 0) {
      setSelectedPriorities(new Set(priorities.map((p) => p.Id.toString())));
    } else {
      setSelectedPriorities(new Set());
    }
    if (tags.length > 0) {
      setSelectedTags(new Set(tags.map((t) => t.value.toString())));
    } else {
      setSelectedTags(new Set());
    }

    setAssignedUserSearch("");
  };
  // --- END NEW ---

  // --- NEW: Close dropdowns when clicking outside & small UX improvements ---
useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      !e.target.closest("#status-dropdown") &&
      !e.target.closest("#priority-dropdown") &&
      !e.target.closest("#tag-dropdown")
    ) {
      setOpenStatusDropdown(false);
      setOpenPriorityDropdown(false);
      setOpenTagDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  // --- END NEW ---

  // Helper: get selected priority names (for label display)
  const getSelectedPriorityNames = () => {
    if (!priorities || priorities.length === 0 || selectedPriorities.size === 0) return "All Priorities";
    const selected = priorities.filter((p) => selectedPriorities.has(p.Id.toString())).map((p) => p.priority_name);
    if (selected.length === priorities.length) return selected.slice(0, 3).join(", ") + (selected.length > 3 ? ` +${selected.length - 3}` : "");
    return selected.slice(0, 3).join(", ") + (selected.length > 3 ? ` +${selected.length - 3}` : "");
  };

  // Helper: get selected tag labels (for label display)
  const getSelectedTagNames = () => {
    if (!tags || tags.length === 0 || selectedTags.size === 0) return "All Tags";
    const selected = tags.filter((t) => selectedTags.has(t.value.toString())).map((t) => t.label);
    if (selected.length === tags.length) return selected.slice(0, 3).join(", ") + (selected.length > 3 ? ` +${selected.length - 3}` : "");
    return selected.slice(0, 3).join(", ") + (selected.length > 3 ? ` +${selected.length - 3}` : "");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-700 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <header className="bg-white shadow-sm rounded-xl mb-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <FaTasks className="mr-3 text-blue-600" />
              All Tasks
            </h1>
            <p className="text-sm text-gray-600 mt-1">Manage and track your open tasks</p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* --- NEW: Create New Task Button --- */}
            <Link
              href="/TaskManager/newTask" // Adjust path if needed
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2 text-sm" />
              New Task
            </Link>
            <img
              src="/Kiotel_Logo_bg.PNG"
              alt="Dashboard Logo"
              className="h-10 sm:h-12 w-auto cursor-pointer hover:opacity-90 transition-opacity duration-200"
              onClick={() => router.push("/TaskManager")}
            />
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaFilter className="mr-2 text-blue-500" />
            Filter Tasks
          </h2>
          <div className="flex items-center gap-3">
            {viewMode === "kanban" && (
              <button
                onClick={() => setShowKanbanSettings(true)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
              >
                <FaCog className="mr-1" /> Customize Board
              </button>
            )}
            <button
              onClick={clearFilters}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
            >
              <FaTimes className="mr-1" /> Clear All
            </button>
          </div>
        </div>

        {/* Redesigned multi-select filters area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* State Filter - Multi-select */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
              <FaTasks className="mr-1 text-blue-500" /> Status
            </label>
            <div className="relative" id="status-dropdown">
              <button
                id="status-button"
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:border-gray-400 text-left flex justify-between items-center ${openStatusDropdown ? "ring-2 ring-blue-500" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenStatusDropdown((s) => !s);
                  setOpenPriorityDropdown(false);
                  setOpenTagDropdown(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedStates.size === 0 ? "All Statuses" : `${selectedStates.size} selected`}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">Except Completed</span>
                </div>
                <FaChevronDown className="text-gray-500" />
              </button>

              {openStatusDropdown && (
                <div
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto p-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-xs text-gray-500 px-2 py-1 mb-2">Select statuses to include</div>
                  {taskStates.map((state) => (
                    <div
                      key={state.Id}
                      className="flex items-center px-3 py-2 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleState(state.Id.toString())}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStates.has(state.Id.toString())}
                        readOnly
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <FaCheck
                        className={`ml-2 h-4 w-4 ${selectedStates.has(state.Id.toString()) ? "text-blue-600" : "text-transparent"}`}
                      />
                      <span className={`ml-3 ${selectedStates.has(state.Id.toString()) ? "font-medium text-gray-900" : "text-gray-700"}`}>
                        {state.status_name}
                      </span>
                      {state.status_name.toLowerCase() === "completed" && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                          Completed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Priority Filter - Multi-select (redesigned) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
              <FaExclamationCircle className="mr-1 text-orange-500" /> Priority
            </label>
            <div className="relative" id="priority-dropdown">
              <button
                id="priority-button"
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:border-gray-400 text-left flex justify-between items-center ${openPriorityDropdown ? "ring-2 ring-blue-500" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPriorityDropdown((s) => !s);
                  setOpenStatusDropdown(false);
                  setOpenTagDropdown(false);
                }}
              >
                <div className="text-sm text-gray-700">
                  {getSelectedPriorityNames()}
                </div>
                <FaChevronDown className="text-gray-500" />
              </button>

              {openPriorityDropdown && (
                <div
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto p-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-2 mb-2">
                    <div className="text-xs text-gray-500">Select priorities</div>
                    <button
                      onClick={() => {
                        // toggle select all / none for priorities
                        if (selectedPriorities.size === priorities.length) {
                          setSelectedPriorities(new Set());
                        } else {
                          setSelectedPriorities(new Set(priorities.map((p) => p.Id.toString())));
                        }
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {selectedPriorities.size === priorities.length ? "Clear" : "Select all"}
                    </button>
                  </div>

                  {priorities.map((priority) => (
                    <div
                      key={priority.Id}
                      className="flex items-center px-3 py-2 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => togglePriority(priority.Id.toString())}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPriorities.has(priority.Id.toString())}
                        readOnly
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <FaCheck
                        className={`ml-2 h-4 w-4 ${selectedPriorities.has(priority.Id.toString()) ? "text-blue-600" : "text-transparent"}`}
                      />
                      <span className={`ml-3 ${selectedPriorities.has(priority.Id.toString()) ? "font-medium text-gray-900" : "text-gray-700"}`}>
                        {priority.priority_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tag Filter - Multi-select with search (redesigned) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
              <FaTag className="mr-1 text-purple-500" /> Tag
            </label>
            <div className="relative" id="tag-dropdown">
              <button
                id="tag-button"
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:border-gray-400 text-left flex justify-between items-center ${openTagDropdown ? "ring-2 ring-blue-500" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenTagDropdown((s) => !s);
                  setOpenStatusDropdown(false);
                  setOpenPriorityDropdown(false);
                }}
              >
                <div className="text-sm text-gray-700">{getSelectedTagNames()}</div>
                <FaChevronDown className="text-gray-500" />
              </button>

              {openTagDropdown && (
                <div
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-y-auto p-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 mb-2">
                    <input
                      type="text"
                      placeholder="Search tags..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between px-2 mb-2">
                    <div className="text-xs text-gray-500">Select tags</div>
                    <button
                      onClick={() => {
                        if (selectedTags.size === tags.length) {
                          setSelectedTags(new Set());
                        } else {
                          setSelectedTags(new Set(tags.map((t) => t.value.toString())));
                        }
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {selectedTags.size === tags.length ? "Clear" : "Select all"}
                    </button>
                  </div>

                  {tags
                    .filter((t) => t.label.toLowerCase().includes(tagSearch.toLowerCase()))
                    .map((tag) => (
                      <div
                        key={tag.value}
                        className="flex items-center px-3 py-2 rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleTag(tag.value.toString())}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.has(tag.value.toString())}
                          readOnly
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <FaCheck className={`ml-2 h-4 w-4 ${selectedTags.has(tag.value.toString()) ? "text-blue-600" : "text-transparent"}`} />
                        <span className={`ml-3 ${selectedTags.has(tag.value.toString()) ? "font-medium text-gray-900" : "text-gray-700"}`}>{tag.label}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Assigned User Search */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
              <FaUser className="mr-1 text-green-500" /> Assigned User
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                value={assignedUserSearch}
                onChange={(e) => setAssignedUserSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:border-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Settings Modal */}
      {showKanbanSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Customize Kanban Board</h3>
                <button onClick={() => setShowKanbanSettings(false)} className="text-gray-500 hover:text-gray-700 text-xl">
                  ✕
                </button>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Columns</h4>
                <div className="space-y-3">
                  {kanbanSettings.columns.map((column, index) => (
                    <div key={column.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={() => toggleColumnVisibility(column.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 font-medium text-gray-700">{column.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveColumn(column.id, "left")}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
                        >
                          ←
                        </button>
                        <button
                          onClick={() => moveColumn(column.id, "right")}
                          disabled={index === kanbanSettings.columns.length - 1}
                          className={`p-1 rounded ${index === kanbanSettings.columns.length - 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
                        >
                          →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowKanbanSettings(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button onClick={saveKanbanSettings} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Content */}
      {viewMode === "table" ? (
        // Table View with Resizable Columns
        <div className="bg-white shadow-sm rounded-xl overflow-hidden" ref={tableRef}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Tags Column */}
                  <th scope="col" className="relative group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.tags }}>
                    <div className="flex items-center justify-between">
                      Tags
                      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500 hover:bg-opacity-20 transition-colors duration-200 flex items-center justify-center" onMouseDown={(e) => startResizing("tags", e)}>
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  {/* Task Title Column */}
                  <th scope="col" className="relative group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.title }}>
                    <div className="flex items-center justify-between">
                      Task Title
                      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500 hover:bg-opacity-20 transition-colors duration-200 flex items-center justify-center" onMouseDown={(e) => startResizing("title", e)}>
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  {/* Created By Column */}
                  <th scope="col" className="relative group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.createdBy }}>
                    <div className="flex items-center justify-between">
                      Created By
                      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500 hover:bg-opacity-20 transition-colors duration-200 flex items-center justify-center" onMouseDown={(e) => startResizing("createdBy", e)}>
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  {/* Assigned Users Column */}
                  <th scope="col" className="relative group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.assignedUsers }}>
                    <div className="flex items-center justify-between">
                      Assigned Users
                      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500 hover:bg-opacity-20 transition-colors duration-200 flex items-center justify-center" onMouseDown={(e) => startResizing("assignedUsers", e)}>
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  {/* NEW: Due Date Column */}
                  <th scope="col" className="relative group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.dueDate }}>
                    <div className="flex items-center justify-between">
                      Due Date
                      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500 hover:bg-opacity-20 transition-colors duration-200 flex items-center justify-center" onMouseDown={(e) => startResizing("dueDate", e)}>
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  {/* State Column */}
                  <th scope="col" className="relative group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.state }}>
                    <div className="flex items-center justify-between">
                      State
                      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500 hover:bg-opacity-20 transition-colors duration-200 flex items-center justify-center" onMouseDown={(e) => startResizing("state", e)}>
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  {/* Priority Column */}
                  <th scope="col" className="relative group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.priority }}>
                    <div className="flex items-center justify-between">
                      Priority
                      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500 hover:bg-opacity-20 transition-colors duration-200 flex items-center justify-center" onMouseDown={(e) => startResizing("priority", e)}>
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedFilteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="text-lg font-medium py-2">No tasks found</h3>
                        <p className="text-sm">Try adjusting your search or filter criteria.</p>
                        <button onClick={clearFilters} className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedFilteredTickets.map((ticket) => {
                    // Process task_tags for display
                    const taskTagString = ticket.task_tags;
                    const taskTagsArray = typeof taskTagString === "string" ? taskTagString.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
                    return (
                      <tr key={ticket.task_id} className="hover:bg-gray-50 transition-colors duration-150">
                        {/* Tags */}
                        <td className="px-6 py-4 whitespace-nowrap" style={{ width: columnWidths.tags }}>
                          <div className="flex flex-wrap gap-1">
                            {taskTagsArray.length > 0 ? (
                              taskTagsArray.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                  <FaTag className="mr-1 text-purple-500" size="0.7em" />
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs italic">No tags</span>
                            )}
                          </div>
                        </td>
                        {/* Task Title */}
                        <td className="px-6 py-4 max-w-xs" style={{ width: columnWidths.title }}>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            <a href={`/TaskManager/task/${ticket.task_id}`} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200">
                              {ticket.title}
                            </a>
                          </div>
                          <div className="text-xs text-gray-500 truncate">{ticket.description}</div>
                        </td>
                        {/* Created By */}
                        <td className="px-6 py-4 whitespace-nowrap" style={{ width: columnWidths.createdBy }}>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 text-xs font-semibold">
                              {ticket.creator.fname.charAt(0)}
                              {ticket.creator.lname?.charAt(0) || ""}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {ticket.creator.fname} {ticket.creator.lname || ""}
                              </div>
                              <div className="text-xs text-gray-500">{ticket.creator.role}</div>
                            </div>
                          </div>
                        </td>
                        {/* Assigned Users */}
                        <td className="px-6 py-4" style={{ width: columnWidths.assignedUsers }}>
                          <div className="flex flex-wrap gap-1">
                            {allAssignedUsers[ticket.task_id]?.length > 0 ? (
                              allAssignedUsers[ticket.task_id].slice(0, 3).map((user, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200" title={`${user.fname} ${user.lname} (${user.role})`}>
                                  <FaUser className="mr-1 text-indigo-500" size="0.7em" />
                                  {user.fname} {user.lname?.charAt(0) || ""}.
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs italic">Unassigned</span>
                            )}
                            {allAssignedUsers[ticket.task_id]?.length > 3 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">+{allAssignedUsers[ticket.task_id].length - 3} more</span>}
                          </div>
                        </td>
                        {/* NEW: Due Date */}
                        <td className="px-6 py-4 whitespace-nowrap" style={{ width: columnWidths.dueDate }}>
                          <div className="text-sm text-gray-900">
                            {ticket.due_date ? new Date(ticket.due_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "No due date"}
                          </div>
                          {ticket.due_date && <div className={`text-xs ${new Date(ticket.due_date) < new Date() ? "text-red-600" : "text-gray-500"}`}>{new Date(ticket.due_date) < new Date() ? "Overdue" : "Upcoming"}</div>}
                        </td>
                        {/* Task State */}
                        <td className="px-6 py-4 whitespace-nowrap" style={{ width: columnWidths.state }}>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateBadge(ticketState[ticket.task_id])}`}>{ticketState[ticket.task_id] || "Unknown"}</span>
                        </td>
                        {/* Task Priority */}
                        <td className="px-6 py-4 whitespace-nowrap" style={{ width: columnWidths.priority }}>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(ticketPriority[ticket.task_id])}`}>{ticketPriority[ticket.task_id] || "Not Set"}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Kanban View
        <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(groupTicketsByStatus()).map(([status, tickets]) => {
              const statusObj = taskStates.find((s) => s.status_name === status);
              const statusColor = statusObj ? getStateBadge(status) : "bg-gray-100 text-gray-800 border border-gray-200";
              return (
                <div key={status} className="bg-gray-50 rounded-lg border border-gray-300 min-h-[150px]" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, status)}>
                  <div className={`p-3 rounded-t-lg ${statusColor.replace("text-", "text-").replace("border-", "border-")} border-b-0`}>
                    <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                      <span>{status}</span>
                      <span className="bg-white bg-opacity-70 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">{tickets.length}</span>
                    </h3>
                  </div>
                  <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto bg-gray-100 rounded-b-lg">
                    {tickets.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-white bg-opacity-50">
                        <p className="text-sm">Drop tasks here</p>
                      </div>
                    ) : (
                      tickets.map((ticket) => {
                        // Process task_tags for display
                        const taskTagString = ticket.task_tags;
                        const taskTagsArray = typeof taskTagString === "string" ? taskTagString.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
                        return (
                          <div key={ticket.task_id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 hover:shadow-md transition-shadow cursor-move hover:border-blue-300" draggable onDragStart={(e) => handleDragStart(e, ticket)}>
                            <div className="mb-2">
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                <a href={`/TaskManager/task/${ticket.task_id}`} className="text-blue-600 hover:text-blue-800 hover:underline" onClick={(e) => e.stopPropagation()}>
                                  {ticket.title}
                                </a>
                              </h4>
                              <p className="text-xs text-gray-500 mt-1 truncate">{ticket.description}</p>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {taskTagsArray.length > 0 ? (
                                taskTagsArray.slice(0, 2).map((tag, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    <FaTag className="mr-1 text-purple-500" size="0.6em" />
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs italic">No tags</span>
                              )}
                              {taskTagsArray.length > 2 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">+{taskTagsArray.length - 2}</span>}
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 text-xs font-semibold">
                                  {ticket.creator.fname.charAt(0)}
                                  {ticket.creator.lname?.charAt(0) || ""}
                                </div>
                                <div className="ml-2 text-xs text-gray-600 truncate max-w-[60px]">{ticket.creator.fname}</div>
                              </div>
                              <div className="flex gap-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(ticketPriority[ticket.task_id])}`}>{ticketPriority[ticket.task_id] || "Not Set"}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {allAssignedUsers[ticket.task_id]?.length > 0 ? (
                                allAssignedUsers[ticket.task_id].slice(0, 2).map((user, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800" title={`${user.fname} ${user.lname} (${user.role})`}>
                                    <FaUser className="mr-1 text-indigo-500" size="0.6em" />
                                    {user.fname} {user.lname?.charAt(0) || ""}.
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs italic">Unassigned</span>
                              )}
                              {allAssignedUsers[ticket.task_id]?.length > 2 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">+{allAssignedUsers[ticket.task_id].length - 2}</span>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
