

"use client";
// components/OpenedTickets.jsx
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
  FaEdit,
  FaSave,
  FaTimesCircle,
  FaCalendar,
  FaFileExcel,
  FaFilePdf,
  FaCheckSquare,
  FaSquare,
  FaShare,
  FaWhatsapp,
  FaEnvelope,
  FaSort,
  FaArrowLeft
} from "react-icons/fa";

// Import the TagsModal component (create this separately)
import TagsModal from './TagsModal'; // Adjust the path as needed

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
  const [ticketDueDate, setTicketDueDate] = useState({});
  const [ticketCreatedAt, setTicketCreatedAt] = useState({});

  const [selectedStates, setSelectedStates] = useState(new Set());
  const [selectedPriorities, setSelectedPriorities] = useState(new Set());
  const [selectedTags, setSelectedTags] = useState(new Set());

  const [assignedUserSearch, setAssignedUserSearch] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [kanbanSettings, setKanbanSettings] = useState({
    columns: [],
    columnOrder: [],
  });
  const [showKanbanSettings, setShowKanbanSettings] = useState(false);
  const [draggedTicket, setDraggedTicket] = useState(null);

  const [columnWidths, setColumnWidths] = useState({
    tags: 150,
    title: 250,
    createdBy: 180,
    assignedUsers: 200,
    dueDate: 120,
    upSince: 150,
    state: 120,
    priority: 120,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [currentResizingColumn, setCurrentResizingColumn] = useState(null);
  const resizingStartX = useRef(0);
  const resizingStartWidth = useRef(0);
  const tableRef = useRef(null);

  const priorityOrder = {
    urgent: 4,
    important: 3,
    medium: 2,
    low: 1,
    "not set": 0,
  };

  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const [openPriorityDropdown, setOpenPriorityDropdown] = useState(false);
  const [openTagDropdown, setOpenTagDropdown] = useState(false);
  const [openSortDropdown, setOpenSortDropdown] = useState(false);
  const [tagSearch, setTagSearch] = useState("");

  const [editingPriority, setEditingPriority] = useState(null);
  const [editingState, setEditingState] = useState(null);
  const [editingDueDate, setEditingDueDate] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());

  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTaskForShare, setSelectedTaskForShare] = useState(null);
  const [shareMethod, setShareMethod] = useState('whatsapp');
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  const [showTagsModal, setShowTagsModal] = useState(false);

  const [sortOption, setSortOption] = useState('priority');

  const allowedEmails = [
    "shuvam.r@kiotel.co",
    "raj@kiotel.co"
  ];

  const isAllowedUser = user && allowedEmails.includes(user.email);

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
    if (!user) {
         fetchUserRole();
    }
  }, [user]);

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
        const taskDueDateTemp = {};
        const taskCreatedAtTemp = {};
        const allAssignedUsersMap = {};
        tasks.forEach((task) => {
          const taskId = task.task_id;
          taskStatesTemp[taskId] = task.status_name;
          taskPrioritiesTemp[taskId] = task.priority_name;
          taskDueDateTemp[taskId] = task.due_date;
          taskCreatedAtTemp[taskId] = task.created_at;
          if (task.assigned_users && task.assigned_users.length > 0) {
            allAssignedUsersMap[taskId] = task.assigned_users;
          } else {
            allAssignedUsersMap[taskId] = [];
          }
        });
        setTicketState(taskStatesTemp);
        setTicketPriority(taskPrioritiesTemp);
        setTicketDueDate(taskDueDateTemp);
        setTicketCreatedAt(taskCreatedAtTemp);
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

  useEffect(() => {
    if (priorities.length > 0) {
      const all = new Set(priorities.map((p) => p.Id.toString()));
      setSelectedPriorities(all);
    }
  }, [priorities]);

  useEffect(() => {
    if (tags.length > 0) {
      const all = new Set(tags.map((t) => t.value.toString()));
      setSelectedTags(all);
    }
  }, [tags]);

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

  const saveKanbanSettings = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/save-kanban-settings`,
        { settings: JSON.stringify(kanbanSettings) },
        { withCredentials: true }
      );
      setShowKanbanSettings(false);
    } catch (error) {
      console.error("Error saving Kanban settings:", error);
      alert("Failed to save Kanban settings");
    }
  };

  const toggleColumnVisibility = (columnId) => {
    setKanbanSettings((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col)),
    }));
  };

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

  const startResizing = (column, e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setCurrentResizingColumn(column);
    resizingStartX.current = e.clientX;
    resizingStartWidth.current = columnWidths[column];
  };
  const handleMouseMove = (e) => {
    if (!isResizing || !currentResizingColumn) return;
    const deltaX = e.clientX - resizingStartX.current;
    const newWidth = resizingStartWidth.current + deltaX;
    setColumnWidths((prev) => ({
      ...prev,
      [currentResizingColumn]: Math.max(80, newWidth),
    }));
  };
  const stopResizing = () => {
    setIsResizing(false);
    setCurrentResizingColumn(null);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", stopResizing);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  const filteredTickets = openedTickets.filter((ticket) => {
    const taskId = ticket.task_id;
    const currentState = ticketState[taskId];
    const currentPriority = ticketPriority[taskId];
    const assignedUsers = allAssignedUsers[taskId] || [];
    const currentStateObj = taskStates.find((s) => s.status_name === currentState);
    const currentStateId = currentStateObj ? currentStateObj.Id.toString() : null;
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
    const taskTagString = ticket.task_tags;
    const taskTagsArray =
      typeof taskTagString === "string" ? taskTagString.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
    const tagNameToId = Object.fromEntries(tags.map((t) => [t.label, t.value.toString()]));
    const ticketTagIds = taskTagsArray.map((name) => tagNameToId[name]).filter(Boolean);
    const matchesTag = selectedTags.size === 0 || ticketTagIds.some((tid) => selectedTags.has(tid));
    const matchesSearch = !searchQuery ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignedUsers.some(u =>
        `${u.fname || ""} ${u.lname || ""}`.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesState && matchesPriority && matchesUser && matchesTag && matchesSearch;
  });

  const sortedFilteredTickets = [...filteredTickets].sort((a, b) => {
    const createdA = new Date(ticketCreatedAt[a.task_id] || 0).getTime();
    const createdB = new Date(ticketCreatedAt[b.task_id] || 0).getTime();
    const titleA = (a.title || "").toLowerCase();
    const titleB = (b.title || "").toLowerCase();
    const dueA = ticketDueDate[a.task_id] ? new Date(ticketDueDate[a.task_id]).getTime() : null;
    const dueB = ticketDueDate[b.task_id] ? new Date(ticketDueDate[b.task_id]).getTime() : null;

    switch (sortOption) {
      case 'priority': {
        const priorityA = ticketPriority[a.task_id]?.toLowerCase() || "not set";
        const priorityB = ticketPriority[b.task_id]?.toLowerCase() || "not set";
        return priorityOrder[priorityB] - priorityOrder[priorityA];
      }
      case 'longest_created': // Oldest first (up since longest)
        return createdA - createdB;
      case 'newest_created': // Newest first
        return createdB - createdA;
      case 'title_asc':
        return titleA.localeCompare(titleB);
      case 'title_desc':
        return titleB.localeCompare(titleA);
      case 'due_asc': // earliest due first; no-due-date last
        if (dueA === null && dueB === null) return 0;
        if (dueA === null) return 1;
        if (dueB === null) return -1;
        return dueA - dueB;
      case 'due_desc': // latest due first; no-due-date last
        if (dueA === null && dueB === null) return 0;
        if (dueA === null) return 1;
        if (dueB === null) return -1;
        return dueB - dueA;
      default:
        return 0;
    }
  });

  // Column-header sorting helpers (item 2). "upsince" maps to created_at.
  const SORT_LABELS = {
    priority: "Priority",
    longest_created: "Oldest First",
    newest_created: "Newest First",
    title_asc: "Title A→Z",
    title_desc: "Title Z→A",
    due_asc: "Due ↑",
    due_desc: "Due ↓",
  };
  const toggleSort = (key) => {
    setSortOption((prev) => {
      if (key === "title") return prev === "title_asc" ? "title_desc" : "title_asc";
      if (key === "due") return prev === "due_asc" ? "due_desc" : "due_asc";
      if (key === "upsince") return prev === "longest_created" ? "newest_created" : "longest_created";
      return prev;
    });
  };
  const sortArrow = (key) => {
    if (key === "title") return sortOption === "title_asc" ? " ▲" : sortOption === "title_desc" ? " ▼" : "";
    if (key === "due") return sortOption === "due_asc" ? " ▲" : sortOption === "due_desc" ? " ▼" : "";
    if (key === "upsince") return sortOption === "longest_created" ? " ▲" : sortOption === "newest_created" ? " ▼" : "";
    return "";
  };

  const groupTicketsByStatus = () => {
    const statusGroups = {};
    kanbanSettings.columns.filter((col) => col.visible).forEach((column) => {
      statusGroups[column.title] = [];
    });
    sortedFilteredTickets.forEach((ticket) => {
      const status = ticketState[ticket.task_id] || "Open";
      if (statusGroups.hasOwnProperty(status)) {
        statusGroups[status].push(ticket);
      }
    });
    return statusGroups;
  };

  const handleDragStart = (e, ticket) => {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTicket) return;
    try {
      const statusObj = taskStates.find((s) => s.status_name === newStatus);
      if (!statusObj) return;

      // Optimistic state update
      setTicketState((prev) => ({
        ...prev,
        [draggedTicket.task_id]: newStatus,
      }));

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update_task_state/v2`,
        {
          ticketId: draggedTicket.task_id,
          status_id: statusObj.Id,
        },
        { withCredentials: true, headers: { "x-user-id": user?.id } }
      );
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status");
    } finally {
      setDraggedTicket(null);
    }
  };

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
    setSearchQuery("");
    setSortOption('priority'); 
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest("#status-dropdown") &&
        !e.target.closest("#priority-dropdown") &&
        !e.target.closest("#tag-dropdown") &&
        !e.target.closest("#sort-dropdown")
      ) {
        setOpenStatusDropdown(false);
        setOpenPriorityDropdown(false);
        setOpenTagDropdown(false);
        setOpenSortDropdown(false); 
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePriorityChange = async (taskId, newPriorityId) => {
    const priorityName = priorities.find(p => p.Id.toString() === newPriorityId)?.priority_name;
    if (!priorityName) return;

    setTicketPriority(prev => ({
      ...prev,
      [taskId]: priorityName
    }));
    setEditingPriority(null);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update_task_priority`,
        {
          ticketId: taskId,
          priority_id: parseInt(newPriorityId),
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error updating task priority:", error);
      alert("Failed to update task priority");
    }
  };

  const handleStateChange = async (taskId, newStateId) => {
    const stateName = taskStates.find(s => s.Id.toString() === newStateId)?.status_name;
    if (!stateName) return;

    setTicketState(prev => ({
      ...prev,
      [taskId]: stateName
    }));
    setEditingState(null);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update_task_state/v2`,
        {
          ticketId: taskId,
          status_id: parseInt(newStateId),
        },
        { withCredentials: true, headers: { "x-user-id": user?.id } }
      );
    } catch (error) {
      console.error("Error updating task state:", error);
      alert("Failed to update task state");
    }
  };

  const handleDueDateChange = async (taskId, newDueDate) => {
    setTicketDueDate(prev => ({
      ...prev,
      [taskId]: newDueDate
    }));
    setEditingDueDate(null);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update_task_due_date`,
        {
          ticketId: taskId,
          due_date: newDueDate,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error updating due date:", error);
      alert("Failed to update due date");
    }
  };

  const cancelEditing = () => {
    setEditingPriority(null);
    setEditingState(null);
    setEditingDueDate(null);
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };
  const toggleAllTasks = () => {
    if (selectedTaskIds.size === sortedFilteredTickets.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(sortedFilteredTickets.map(ticket => ticket.task_id)));
    }
  };
  const selectedCount = selectedTaskIds.size;

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return "";
    let v = value.toString();
    v = v.replace(/"/g, '""');
    return `"${v}"`;
  };

  const exportToExcel = () => {
    if (selectedCount === 0) {
      alert("Please select at least one task to export.");
      return;
    }
    const selectedTasks = sortedFilteredTickets.filter(ticket => selectedTaskIds.has(ticket.task_id));
    const headers = ['Task ID', 'Title', 'Description', 'Status', 'Priority', 'Created By', 'Assigned Users', 'Due Date', 'Tags', 'Up Since']; 
    const csvContent = [
      headers.map(escapeCSV),
      ...selectedTasks.map(ticket => {
        const assignedUsers = allAssignedUsers[ticket.task_id]
          ?.map(u => `${u.fname} ${u.lname}`)
          .join(", ") || "Unassigned";
        const dueDate = ticketDueDate[ticket.task_id]
          ? new Date(ticketDueDate[ticket.task_id]).toLocaleDateString()
          : "No due date";
        const createdAt = ticketCreatedAt[ticket.task_id];
        const creationDate = new Date(createdAt);
        const today = new Date();
        const timeDiff = today - creationDate;
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        const upSinceText = `${creationDate.toLocaleDateString()} (${daysDiff} day${daysDiff !== 1 ? 's' : ''} ago)`;

        return [
          escapeCSV(ticket.task_id),
          escapeCSV(ticket.title),
          escapeCSV(ticket.description),
          escapeCSV(ticketState[ticket.task_id] || ""),
          escapeCSV(ticketPriority[ticket.task_id] || ""),
          escapeCSV(`${ticket.creator.fname} ${ticket.creator.lname}`),
          escapeCSV(assignedUsers),
          escapeCSV(dueDate),
          escapeCSV(ticket.task_tags || ""),
          escapeCSV(upSinceText) 
        ];
      })
    ]
      .map(row => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'tasks_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportToPDF = () => {
    if (selectedCount === 0) {
      alert("Please select at least one task to export.");
      return;
    }
    alert("PDF export functionality would be implemented here. For now, please use Excel export.");
  };

  const openShareModal = (task) => {
    setSelectedTaskForShare(task);
    setShareMethod('whatsapp');
    setShareEmail('');
    setShareMessage(`Check out this task: ${task.title} - ${window.location.origin}/TaskManager/task/${task.task_id}`);
    setShowShareModal(true);
  };
  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedTaskForShare(null);
  };
  const handleShare = () => {
    if (shareMethod === 'whatsapp') {
      const encodedMessage = encodeURIComponent(shareMessage);
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    } else if (shareMethod === 'email') {
      if (!shareEmail) {
        alert("Please enter an email address.");
        return;
      }
      const subject = encodeURIComponent(`Task: ${selectedTaskForShare.title}`);
      const body = encodeURIComponent(shareMessage);
      const mailtoUrl = `mailto:${shareEmail}?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;
    }
    closeShareModal();
  };

  const getSelectedPriorityNames = () => {
    if (!priorities || priorities.length === 0 || selectedPriorities.size === 0) return "All Priorities";
    const selected = priorities.filter((p) => selectedPriorities.has(p.Id.toString())).map((p) => p.priority_name);
    if (selected.length === priorities.length) return selected.slice(0, 3).join(", ") + (selected.length > 3 ? ` +${selected.length - 3}` : "");
    return selected.slice(0, 3).join(", ") + (selected.length > 3 ? ` +${selected.length - 3}` : "");
  };

  const getSelectedTagNames = () => {
    if (!tags || tags.length === 0 || selectedTags.size === 0) return "All Tags";
    const selected = tags.filter((t) => selectedTags.has(t.value.toString())).map((t) => t.label);
    if (selected.length === tags.length) return selected.slice(0, 3).join(", ") + (selected.length > 3 ? ` +${selected.length - 3}` : "");
    return selected.slice(0, 3).join(", ") + (selected.length > 3 ? ` +${selected.length - 3}` : "");
  };

  const getDaysSinceCreated = (createdAt) => {
    if (!createdAt) return "Unknown";
    const creationDate = new Date(createdAt);
    const today = new Date();
    const timeDiff = today - creationDate;
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
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
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 flex flex-col">
      {/* --- COMPACT CONTROL PANEL --- */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-3 sm:p-4 mb-4">
        
        {/* Row 1: Header & Main Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.push('/Dashboard')}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200 focus:outline-none"
            >
              <FaArrowLeft className="mr-1.5" /> Back
            </button>
            <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>
            <img
              src="/Kiotel_Logo_bg.PNG"
              alt="Dashboard Logo"
              className="h-6 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => router.push("/TaskManager")}
            />
            <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center">
              <FaTasks className="mr-2 text-blue-600" />
              All Tasks
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isAllowedUser && (
              <button
                onClick={() => setShowTagsModal(true)}
                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white text-xs font-medium rounded shadow-sm transition-all focus:outline-none"
              >
                <FaTag className="mr-1.5" /> Tags
              </button>
            )}

            {/* --- NEW BUTTON ADDED HERE --- */}
            {/* <button
              onClick={() => router.push('/activeTasks')}
              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 text-white text-xs font-medium rounded shadow-sm transition-all focus:outline-none"
            >
              <FaTasks className="mr-1.5" /> Kiotel Tasks
            </button> */}
<button
  onClick={() => router.push('/TaskManager/reocuuringTask')}
  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-medium rounded shadow-sm transition-all focus:outline-none"
>
  <FaCalendar className="mr-1.5" /> Recurring Task
</button>
            <Link
              href="/TaskManager/newTask"
              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-medium rounded shadow-sm transition-all focus:outline-none"
            >
              <FaPlus className="mr-1.5" /> New Task
            </Link>
          </div>
        </div>

        {/* Row 2: Search, Export & View Options */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
          <div className="flex-1 w-full lg:max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-xs" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by title, description..."
                className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleAllTasks}
              className="flex items-center text-xs text-gray-700 hover:text-gray-900 transition-colors font-medium border border-gray-200 bg-gray-50 px-2.5 py-1.5 rounded"
            >
              {selectedCount === sortedFilteredTickets.length && sortedFilteredTickets.length > 0 ? <FaCheckSquare className="mr-1.5 text-blue-600" /> : <FaSquare className="mr-1.5 text-gray-400" />}
              {selectedCount > 0 ? `${selectedCount} sel` : 'Select All'}
            </button>
            <button
              onClick={exportToExcel}
              disabled={selectedCount === 0}
              className={`flex items-center px-2.5 py-1.5 text-xs font-medium rounded shadow-sm transition ${
                selectedCount === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  : "bg-green-600 text-white border border-green-700 hover:bg-green-700"
              }`}
            >
              <FaFileExcel className="mr-1.5" /> Excel
            </button>
            <div className="relative" id="sort-dropdown">
              <button
                className={`flex items-center px-2.5 py-1.5 text-xs font-medium rounded shadow-sm transition ${
                  sortOption !== 'priority'
                    ? "bg-blue-600 text-white border border-blue-700"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenSortDropdown((s) => !s);
                  setOpenStatusDropdown(false);
                  setOpenPriorityDropdown(false);
                  setOpenTagDropdown(false);
                }}
              >
                <FaSort className="mr-1.5" />
                {SORT_LABELS[sortOption] || 'Priority'}
              </button>
              {openSortDropdown && (
                <div
                  className="absolute right-0 z-10 mt-1 w-40 bg-white border border-gray-300 rounded shadow-lg overflow-y-auto p-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className={`px-3 py-2 text-xs rounded hover:bg-gray-50 cursor-pointer ${
                      sortOption === 'priority' ? 'font-medium text-blue-600' : 'text-gray-700'
                    }`}
                    onClick={() => {
                      setSortOption('priority');
                      setOpenSortDropdown(false);
                    }}
                  >
                    Priority (Default)
                  </div>
                  <div
                    className={`px-3 py-2 text-xs rounded hover:bg-gray-50 cursor-pointer ${
                      sortOption === 'newest_created' ? 'font-medium text-blue-600' : 'text-gray-700'
                    }`}
                    onClick={() => {
                      setSortOption('newest_created');
                      setOpenSortDropdown(false);
                    }}
                  >
                    Newest First
                  </div>
                  <div
                    className={`px-3 py-2 text-xs rounded hover:bg-gray-50 cursor-pointer ${
                      sortOption === 'longest_created' ? 'font-medium text-blue-600' : 'text-gray-700'
                    }`}
                    onClick={() => {
                      setSortOption('longest_created');
                      setOpenSortDropdown(false);
                    }}
                  >
                    Oldest First
                  </div>
                </div>
              )}
            </div>
             <button
              onClick={clearFilters}
              className="flex items-center text-xs text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded transition-colors font-medium ml-1"
            >
              <FaTimes className="mr-1" /> Clear
            </button>
          </div>
        </div>

        {/* Row 3: Filters (4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Tag Filter */}
          <div className="relative" id="tag-dropdown">
            <button
              id="tag-button"
              className={`w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded shadow-sm transition duration-200 bg-white hover:border-gray-400 text-left flex justify-between items-center ${openTagDropdown ? "ring-1 ring-blue-500 border-blue-500" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpenTagDropdown((s) => !s);
                setOpenStatusDropdown(false);
                setOpenPriorityDropdown(false);
                setOpenSortDropdown(false); 
              }}
            >
              <div className="flex items-center gap-1.5 text-gray-700 truncate">
                <FaTag className="text-purple-500 flex-shrink-0" />
                <span className="truncate">{getSelectedTagNames()}</span>
              </div>
              <FaChevronDown className="text-gray-400 ml-1 flex-shrink-0" />
            </button>
            {openTagDropdown && (
              <div
                className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto p-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-1 mb-1.5">
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between px-2 mb-1">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Tags</div>
                  <button
                    onClick={() => setSelectedTags(selectedTags.size === tags.length ? new Set() : new Set(tags.map((t) => t.value.toString())))}
                    className="text-[10px] text-blue-600 hover:underline"
                  >
                    {selectedTags.size === tags.length ? "Clear" : "All"}
                  </button>
                </div>
                {tags
                  .filter((t) => t.label.toLowerCase().includes(tagSearch.toLowerCase()))
                  .map((tag) => (
                    <div
                      key={tag.value}
                      className="flex items-center px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleTag(tag.value.toString())}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.has(tag.value.toString())}
                        readOnly
                        className="h-3 w-3 text-blue-600 rounded border-gray-300"
                      />
                      <span className={`ml-2 text-xs ${selectedTags.has(tag.value.toString()) ? "font-medium text-gray-900" : "text-gray-700"}`}>{tag.label}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Assigned User Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <FaUser className="text-green-500 text-xs" />
            </div>
            <input
              type="text"
              value={assignedUserSearch}
              onChange={(e) => setAssignedUserSearch(e.target.value)}
              placeholder="Assigned user..."
              className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-gray-300 rounded shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
            />
          </div>

          {/* Status Filter */}
          <div className="relative" id="status-dropdown">
            <button
              id="status-button"
              className={`w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded shadow-sm transition duration-200 bg-white hover:border-gray-400 text-left flex justify-between items-center ${openStatusDropdown ? "ring-1 ring-blue-500 border-blue-500" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpenStatusDropdown((s) => !s);
                setOpenPriorityDropdown(false);
                setOpenTagDropdown(false);
                setOpenSortDropdown(false);
              }}
            >
              <div className="flex items-center gap-1.5 text-gray-700 truncate">
                <FaTasks className="text-blue-500 flex-shrink-0" />
                <span className="truncate">
                  {selectedStates.size === 0 ? "All Statuses" : `${selectedStates.size} Statuses`}
                </span>
              </div>
              <FaChevronDown className="text-gray-400 ml-1 flex-shrink-0" />
            </button>
            {openStatusDropdown && (
              <div
                className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto p-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2 mb-1">Statuses</div>
                {taskStates.map((state) => (
                  <div
                    key={state.Id}
                    className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleState(state.Id.toString())}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedStates.has(state.Id.toString())}
                        readOnly
                        className="h-3 w-3 text-blue-600 rounded border-gray-300"
                      />
                      <span className={`ml-2 text-xs ${selectedStates.has(state.Id.toString()) ? "font-medium text-gray-900" : "text-gray-700"}`}>
                        {state.status_name}
                      </span>
                    </div>
                    {state.status_name.toLowerCase() === "completed" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                        Hide
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priority Filter */}
          <div className="relative" id="priority-dropdown">
            <button
              id="priority-button"
              className={`w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded shadow-sm transition duration-200 bg-white hover:border-gray-400 text-left flex justify-between items-center ${openPriorityDropdown ? "ring-1 ring-blue-500 border-blue-500" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpenPriorityDropdown((s) => !s);
                setOpenStatusDropdown(false);
                setOpenTagDropdown(false);
                setOpenSortDropdown(false); 
              }}
            >
              <div className="flex items-center gap-1.5 text-gray-700 truncate">
                <FaExclamationCircle className="text-orange-500 flex-shrink-0" />
                <span className="truncate">{getSelectedPriorityNames()}</span>
              </div>
              <FaChevronDown className="text-gray-400 ml-1 flex-shrink-0" />
            </button>
            {openPriorityDropdown && (
              <div
                className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto p-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-2 mb-1">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Priorities</div>
                  <button
                    onClick={() => setSelectedPriorities(selectedPriorities.size === priorities.length ? new Set() : new Set(priorities.map((p) => p.Id.toString())))}
                    className="text-[10px] text-blue-600 hover:underline"
                  >
                    {selectedPriorities.size === priorities.length ? "Clear" : "All"}
                  </button>
                </div>
                {priorities.map((priority) => (
                  <div
                    key={priority.Id}
                    className="flex items-center px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => togglePriority(priority.Id.toString())}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPriorities.has(priority.Id.toString())}
                      readOnly
                      className="h-3 w-3 text-blue-600 rounded border-gray-300"
                    />
                    <span className={`ml-2 text-xs ${selectedPriorities.has(priority.Id.toString()) ? "font-medium text-gray-900" : "text-gray-700"}`}>
                      {priority.priority_name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {showKanbanSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Customize Kanban Board</h3>
                <button
                  onClick={() => setShowKanbanSettings(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
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
                <button
                  onClick={saveKanbanSettings}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showShareModal && selectedTaskForShare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Share Task</h3>
                <button
                  onClick={closeShareModal}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">{selectedTaskForShare.title}</h4>
                <p className="text-sm text-gray-600">{selectedTaskForShare.description}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Link
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={`${window.location.origin}/TaskManager/task/${selectedTaskForShare.task_id}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/TaskManager/task/${selectedTaskForShare.task_id}`
                      );
                      alert("Task link copied!");
                    }}
                    className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Share via Email</h4>
                <input
                  type="email"
                  placeholder="recipient@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg text-sm"
                />
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                />
                <button
                  onClick={async () => {
                    if (!shareEmail) {
                      alert("Please enter recipient email");
                      return;
                    }
                    await axios.post(
                      `${process.env.NEXT_PUBLIC_BACKEND_URL}/send/api/share_task_email`,
                      {
                        taskId: selectedTaskForShare.task_id,
                        title: selectedTaskForShare.title,
                        description: selectedTaskForShare.description,
                        recipientEmail: shareEmail,
                        message: shareMessage,
                      },
                      { withCredentials: true }
                    );
                    alert("Email sent successfully!");
                    closeShareModal();
                  }}
                  className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTagsModal && (
        <TagsModal
          isOpen={showTagsModal}
          onClose={() => setShowTagsModal(false)}
        />
      )}

      {viewMode === "table" ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden flex-1" ref={tableRef}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-10">
                    <input
                      type="checkbox"
                      checked={sortedFilteredTickets.length > 0 && selectedTaskIds.size === sortedFilteredTickets.length}
                      onChange={toggleAllTasks}
                      className="h-3.5 w-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th scope="col" className="relative group px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.tags }}>
                    <div className="flex items-center justify-between">
                      Tags
                      <div onMouseDown={(e) => startResizing('tags', e)} className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-300/20 active:bg-blue-400/30 transition">
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="relative group px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.title }}>
                    <div className="flex items-center justify-between">
                      <span className="cursor-pointer select-none hover:text-blue-600" onClick={() => toggleSort('title')}>Task Title{sortArrow('title')}</span>
                      <div onMouseDown={(e) => startResizing('title', e)} className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-300/20 active:bg-blue-400/30 transition">
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="relative group px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.createdBy }}>
                    <div className="flex items-center justify-between">
                      Created By
                      <div onMouseDown={(e) => startResizing('createdBy', e)} className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-300/20 active:bg-blue-400/30 transition">
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="relative group px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.assignedUsers }}>
                    <div className="flex items-center justify-between">
                      Assigned Users
                      <div onMouseDown={(e) => startResizing('assignedUsers', e)} className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-300/20 active:bg-blue-400/30 transition">
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="relative group px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.dueDate }}>
                    <div className="flex items-center justify-between">
                      <span className="cursor-pointer select-none hover:text-blue-600" onClick={() => toggleSort('due')}>Due Date{sortArrow('due')}</span>
                      <div onMouseDown={(e) => startResizing('dueDate', e)} className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-300/20 active:bg-blue-400/30 transition">
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="relative group px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.upSince }}>
                    <div className="flex items-center justify-between">
                      <span className="cursor-pointer select-none hover:text-blue-600" onClick={() => toggleSort('upsince')}>Up Since{sortArrow('upsince')}</span>
                      <div onMouseDown={(e) => startResizing('upSince', e)} className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-300/20 active:bg-blue-400/30 transition">
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="relative group px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.state }}>
                    <div className="flex items-center justify-between">
                      State
                      <div onMouseDown={(e) => startResizing('state', e)} className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-300/20 active:bg-blue-400/30 transition">
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="relative group px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider" style={{ width: columnWidths.priority }}>
                    <div className="flex items-center justify-between">
                      Priority
                      <div onMouseDown={(e) => startResizing('priority', e)} className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-300/20 active:bg-blue-400/30 transition">
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="relative group px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider" style={{ width: 80 }}>
                    <div className="flex items-center justify-between">
                      Share
                      <div onMouseDown={(e) => startResizing('share', e)} className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-300/20 active:bg-blue-400/30 transition">
                        <FaGripLinesVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {sortedFilteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="text-sm font-medium py-1">No tasks found</h3>
                        <p className="text-xs">Try adjusting your search or filter criteria.</p>
                        <button
                          onClick={clearFilters}
                          className="mt-2 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-[10px] font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedFilteredTickets.map((ticket) => {
                    const taskTagString = ticket.task_tags;
                    const taskTagsArray = typeof taskTagString === 'string'
                      ? taskTagString.split(',').map(tag => tag.trim()).filter(Boolean)
                      : [];

                    const daysSinceCreated = getDaysSinceCreated(ticketCreatedAt[ticket.task_id]);
                    const creationDate = ticketCreatedAt[ticket.task_id] ? new Date(ticketCreatedAt[ticket.task_id]).toLocaleDateString() : 'Unknown';

                    return (
                      <tr key={ticket.task_id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedTaskIds.has(ticket.task_id)}
                            onChange={() => toggleTaskSelection(ticket.task_id)}
                            className="h-3.5 w-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap" style={{ width: columnWidths.tags }}>
                          <div className="flex flex-wrap gap-1">
                            {taskTagsArray.length > 0 ? (
                              taskTagsArray.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200"
                                >
                                  <FaTag className="mr-1 text-purple-500" size="0.6em" />
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-[10px] italic">No tags</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 max-w-[200px]" style={{ width: columnWidths.title }}>
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            <a href={`/TaskManager/task/${ticket.task_id}`} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200">
                              {ticket.title}
                            </a>
                          </div>
                          <div className="text-xs text-gray-500 truncate">{ticket.description}</div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap" style={{ width: columnWidths.createdBy }}>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 text-[10px] font-semibold">
                              {ticket.creator.fname.charAt(0)}{ticket.creator.lname?.charAt(0) || ''}
                            </div>
                            <div className="ml-2">
                              <div className="text-xs font-medium text-gray-900">
                                {ticket.creator.fname} {ticket.creator.lname || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-2" style={{ width: columnWidths.assignedUsers }}>
                          <div className="relative group inline-flex items-center gap-1">
                            {allAssignedUsers[ticket.task_id]?.length > 0 ? (
                              <>
                                {allAssignedUsers[ticket.task_id].slice(0, 1).map((user, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 cursor-default"
                                  >
                                    <FaUser className="mr-1 text-indigo-400" size="0.7em" />
                                    {user.fname} {user.lname?.charAt(0) || ''}.
                                  </span>
                                ))}
                                
                                {allAssignedUsers[ticket.task_id].length > 1 && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 cursor-default">
                                    +{allAssignedUsers[ticket.task_id].length - 1} more
                                  </span>
                                )}
                                
                                {allAssignedUsers[ticket.task_id].length > 1 && (
                                  <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-50 bg-gray-800 text-white text-xs rounded px-2 py-1.5 shadow-xl whitespace-nowrap border border-gray-700">
                                    <div className="font-semibold mb-1 border-b border-gray-600 pb-1 text-[10px] uppercase tracking-wider text-gray-300">Assigned Users</div>
                                    <ul className="space-y-1">
                                      {allAssignedUsers[ticket.task_id].map((u, i) => (
                                        <li key={i} className="flex items-center gap-1.5 text-xs">
                                          <FaUser className="text-gray-400" size="0.7em" />
                                          {u.fname} {u.lname || ''} <span className="text-gray-400 text-[10px]">({u.role})</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 text-[10px] italic">Unassigned</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-2 whitespace-nowrap" style={{ width: columnWidths.dueDate }}>
                          {editingDueDate === ticket.task_id ? (
                            <div className="flex items-center space-x-1">
                              <input
                                type="date"
                                defaultValue={ticketDueDate[ticket.task_id] ? new Date(ticketDueDate[ticket.task_id]).toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const newDate = e.target.value || null; 
                                  handleDueDateChange(ticket.task_id, newDate);
                                }}
                                className="text-[10px] font-medium bg-white border border-gray-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button onClick={() => handleDueDateChange(ticket.task_id, null)} className="text-red-600 hover:text-red-800">
                                <FaTimesCircle className="h-3 w-3" />
                              </button>
                              <button onClick={cancelEditing} className="text-red-600 hover:text-red-800">
                                <FaTimesCircle className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  ticketDueDate[ticket.task_id] && new Date(ticketDueDate[ticket.task_id]) < new Date() ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-50 text-gray-700 border border-gray-200'
                                } cursor-pointer hover:opacity-90`}
                                onClick={() => setEditingDueDate(ticket.task_id)}
                              >
                                {ticketDueDate[ticket.task_id] ? new Date(ticketDueDate[ticket.task_id]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : 'None'}
                              </span>
                              <FaEdit className="h-2.5 w-2.5 text-gray-400 ml-1 cursor-pointer" onClick={() => setEditingDueDate(ticket.task_id)} />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap" style={{ width: columnWidths.upSince }}>
                          <div className="text-xs text-gray-800 font-medium">
                            {creationDate}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {daysSinceCreated} day{daysSinceCreated !== 1 ? 's' : ''} ago
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap" style={{ width: columnWidths.state }}>
                          {editingState === ticket.task_id ? (
                            <div className="flex items-center space-x-1">
                              <select
                                value={ticketState[ticket.task_id] ? taskStates.find(s => s.status_name === ticketState[ticket.task_id])?.Id : ''}
                                onChange={(e) => handleStateChange(ticket.task_id, e.target.value)}
                                className="text-[10px] font-medium bg-white border border-gray-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {taskStates.map((state) => (
                                  <option key={state.Id} value={state.Id}>{state.status_name}</option>
                                ))}
                              </select>
                              <button onClick={cancelEditing} className="text-red-600 hover:text-red-800">
                                <FaTimesCircle className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getStateBadge(ticketState[ticket.task_id])} cursor-pointer hover:opacity-90`}
                                onClick={() => setEditingState(ticket.task_id)}
                              >
                                {ticketState[ticket.task_id] || "Unknown"}
                              </span>
                              <FaEdit className="h-2.5 w-2.5 text-gray-400 ml-1 cursor-pointer" onClick={() => setEditingState(ticket.task_id)} />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap" style={{ width: columnWidths.priority }}>
                          {editingPriority === ticket.task_id ? (
                            <div className="flex items-center space-x-1">
                              <select
                                value={ticketPriority[ticket.task_id] ? priorities.find(p => p.priority_name === ticketPriority[ticket.task_id])?.Id : ''}
                                onChange={(e) => handlePriorityChange(ticket.task_id, e.target.value)}
                                className="text-[10px] font-medium bg-white border border-gray-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {priorities.map((priority) => (
                                  <option key={priority.Id} value={priority.Id}>{priority.priority_name}</option>
                                ))}
                              </select>
                              <button onClick={cancelEditing} className="text-red-600 hover:text-red-800">
                                <FaTimesCircle className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getPriorityBadge(ticketPriority[ticket.task_id])} cursor-pointer hover:opacity-90`}
                                onClick={() => setEditingPriority(ticket.task_id)}
                              >
                                {ticketPriority[ticket.task_id] || "Not Set"}
                              </span>
                              <FaEdit className="h-2.5 w-2.5 text-gray-400 ml-1 cursor-pointer" onClick={() => setEditingPriority(ticket.task_id)} />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <button
                            onClick={() => openShareModal(ticket)}
                            className="inline-flex items-center justify-center p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                            title="Share Task"
                          >
                            <FaShare className="h-3 w-3" />
                          </button>
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
        <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(groupTicketsByStatus()).map(([status, tickets]) => {
              const statusObj = taskStates.find(s => s.status_name === status);
              const statusColor = statusObj ? getStateBadge(status) : "bg-gray-100 text-gray-800 border border-gray-200";
              return (
                <div
                  key={status}
                  className="bg-gray-50 rounded-lg border border-gray-300 min-h-[150px]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className={`p-3 rounded-t-lg ${statusColor.replace('text-', 'text-').replace('border-', 'border-')} border-b-0`}>
                    <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                      <span>{status}</span>
                      <span className="bg-white bg-opacity-70 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {tickets.length}
                      </span>
                    </h3>
                  </div>
                  <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto bg-gray-100 rounded-b-lg">
                    {tickets.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-white bg-opacity-50">
                        <p className="text-sm">Drop tasks here</p>
                      </div>
                    ) : (
                      tickets.map((ticket) => {
                        const taskTagString = ticket.task_tags;
                        const taskTagsArray = typeof taskTagString === 'string'
                          ? taskTagString.split(',').map(tag => tag.trim()).filter(Boolean)
                          : [];

                        const daysSinceCreated = getDaysSinceCreated(ticketCreatedAt[ticket.task_id]);
                        const creationDate = ticketCreatedAt[ticket.task_id] ? new Date(ticketCreatedAt[ticket.task_id]).toLocaleDateString() : 'Unknown';

                        return (
                          <div
                            key={ticket.task_id}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 hover:shadow-md transition-shadow cursor-move hover:border-blue-300"
                            draggable
                            onDragStart={(e) => handleDragStart(e, ticket)}
                          >
                            <div className="mb-2">
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                <a
                                  href={`/TaskManager/task/${ticket.task_id}`}
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {ticket.title}
                                </a>
                              </h4>
                              <p className="text-xs text-gray-500 mt-1 truncate">{ticket.description}</p>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {taskTagsArray.length > 0 ? (
                                taskTagsArray.slice(0, 2).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                  >
                                    <FaTag className="mr-1 text-purple-500" size="0.6em" />
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs italic">No tags</span>
                              )}
                              {taskTagsArray.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{taskTagsArray.length - 2}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 text-xs font-semibold">
                                  {ticket.creator.fname.charAt(0)}{ticket.creator.lname?.charAt(0) || ''}
                                </div>
                                <div className="ml-2 text-xs text-gray-600 truncate max-w-[60px]">
                                  {ticket.creator.fname}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(ticketPriority[ticket.task_id])}`}>
                                  {ticketPriority[ticket.task_id] || "Not Set"}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Created:</span> {creationDate}
                            </div>
                            <div className="text-xs text-gray-600 mb-3">
                              <span className="font-medium">Up:</span> {daysSinceCreated} day{daysSinceCreated !== 1 ? 's' : ''} ago
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {allAssignedUsers[ticket.task_id]?.length > 0 ? (
                                allAssignedUsers[ticket.task_id].slice(0, 2).map((user, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                    title={`${user.fname} ${user.lname} (${user.role})`}
                                  >
                                    <FaUser className="mr-1 text-indigo-500" size="0.6em" />
                                    {user.fname} {user.lname?.charAt(0) || ''}.
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs italic">Unassigned</span>
                              )}
                              {allAssignedUsers[ticket.task_id]?.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{allAssignedUsers[ticket.task_id].length - 2}
                                </span>
                              )}
                            </div>
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => openShareModal(ticket)}
                                className="flex items-center text-blue-600 hover:text-blue-800 text-xs"
                              >
                                <FaShare className="mr-1" />
                                Share
                              </button>
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