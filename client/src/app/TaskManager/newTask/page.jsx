
"use client";

// components/TicketCreateForm.jsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import DatePicker from "react-datepicker";
import dynamic from "next/dynamic"; // <-- NEW: For Rich Text Editor in Next.js

import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import "react-quill/dist/quill.snow.css"; // <-- NEW: Rich Text Editor CSS

import {
  FaPaperclip,
  FaTag,
  FaTasks,
  FaExclamationTriangle,
  FaUserFriends,
  FaUsers,
  FaSave,
  FaBell,
  FaSitemap,
  FaCalendarAlt,
  FaSync,
  FaInfoCircle
} from "react-icons/fa";

// --- NEW: Dynamic import for ReactQuill to prevent Next.js SSR errors ---
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function TicketCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // This now holds HTML!
  const [attachments, setAttachments] = useState(null);
  const [users, setUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [taskStates, setTaskStates] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [ticketState, setTicketState] = useState(""); 
  const [ticketPriority, setTicketPriority] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState({});
  const [loadingGroupMembers, setLoadingGroupMembers] = useState({});

  const [parentTasks, setParentTasks] = useState([]);
  const [selectedParentTask, setSelectedParentTask] = useState(null);
  const [loadingParentTasks, setLoadingParentTasks] = useState(false);

  const [isSubtask, setIsSubtask] = useState(false);
  const [dueDate, setDueDate] = useState(null);

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState("daily");
  const [weeklyDay, setWeeklyDay] = useState(1); 
  const [monthlyDate, setMonthlyDate] = useState(1); 
  const [endDate, setEndDate] = useState(null);

  // --- NEW: Rich Text Editor Toolbar Modules ---
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'code-block'],
      ['clean']
    ],
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`);
        const filteredUsers = response.data.filter((user) => user.role !== "Client");
        const userOptions = filteredUsers.map(user => ({
          value: user.id,
          label: `${user.fname} ${user.lname} (${user.role})`
        }));
        setUsers(userOptions);
      } catch (error) {
        toast.error("Failed to load users.");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        setCurrentUserId(res.data.id);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchTaskStates = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskstate`);
        setTaskStates(response.data);
        const notStartedState = response.data.find(state => state.status_name.toLowerCase() === "not started");
        if (notStartedState) setTicketState(notStartedState.Id.toString());
      } catch (error) {
        toast.error("Failed to load task states.");
      }
    };
    fetchTaskStates();
  }, []);

  useEffect(() => {
    const fetchPriorities = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/priority`);
        setPriorities(response.data);
        const lowPriority = response.data.find(priority => priority.priority_name.toLowerCase() === "low");
        if (lowPriority) setTicketPriority(lowPriority.Id.toString());
      } catch (error) {
        toast.error("Failed to load priorities.");
      }
    };
    fetchPriorities();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags`);
        const tagOptions = response.data.map(tag => ({ value: tag.id, label: tag.tag }));
        setTags(tagOptions);
        // Default-select "Tech support" (tag id 10) if present.
        const defaultTag = tagOptions.find(t => Number(t.value) === 10);
        if (defaultTag) setSelectedTags([defaultTag]);
      } catch (error) {
        toast.error("Failed to load tags.");
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/groups`);
        const groupOptions = response.data.map(group => ({ value: group.id, label: group.name }));
        setGroups(groupOptions);
      } catch (error) {
        toast.error("Failed to load groups.");
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchParentTasks = async () => {
      if (!isSubtask) {
        setParentTasks([]);
        setSelectedParentTask(null);
        return;
      }
      setLoadingParentTasks(true);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/parents`);
        const taskOptions = response.data.map(task => ({
          value: task.id,
          label: `${task.title} (ID: ${task.id})`
        }));
        setParentTasks(taskOptions);
      } catch (error) {
        toast.error("Failed to load parent tasks.");
        setParentTasks([]); 
      } finally {
        setLoadingParentTasks(false);
      }
    };
    fetchParentTasks();
  }, [isSubtask]); 

  useEffect(() => {
    const fetchMembersForSelectedGroups = async () => {
      const groupsToFetch = selectedGroups.filter(
        groupOption => !groupMembers[groupOption.value] && !loadingGroupMembers[groupOption.value]
      );
      if (groupsToFetch.length === 0) return;

      const newLoadingStates = {};
      groupsToFetch.forEach(groupOption => { newLoadingStates[groupOption.value] = true; });
      setLoadingGroupMembers(prev => ({ ...prev, ...newLoadingStates }));

      try {
        const memberFetchPromises = groupsToFetch.map(groupOption =>
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/group/${groupOption.value}/users`)
            .then(res => ({ groupId: groupOption.value, users: res.data }))
            .catch(err => { return { groupId: groupOption.value, users: [] }; })
        );
        const results = await Promise.all(memberFetchPromises);
        const newGroupMembers = {};
        results.forEach(result => { newGroupMembers[result.groupId] = result.users; });
        setGroupMembers(prev => ({ ...prev, ...newGroupMembers }));
      } catch (error) {
        toast.error("An unexpected error occurred while fetching group members.");
      } finally {
        const finishedLoadingStates = {};
        groupsToFetch.forEach(groupOption => { finishedLoadingStates[groupOption.value] = false; });
        setLoadingGroupMembers(prev => ({ ...prev, ...finishedLoadingStates }));
      }
    };
    fetchMembersForSelectedGroups();
  }, [selectedGroups]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title.trim()) {
        toast.error("Title is required.");
        return;
    }
    if (isSubtask && !selectedParentTask) {
      toast.error("Parent task is required for subtasks.");
      return;
    }
    if (!isRecurring && !currentUserId) {
      toast.error("Could not identify the current user. Please refresh and try again.");
      return;
    }
    if (selectedTags.length === 0) {
      toast.error("At least one tag is required.");
      return;
    }

    if (isRecurring) {
      if (recurrenceType === "weekly" && (weeklyDay < 0 || weeklyDay > 6)) return toast.error("Invalid day.");
      if (recurrenceType === "monthly" && (monthlyDate < 1 || monthlyDate > 31)) return toast.error("Invalid date.");
      if (endDate && new Date(endDate) < new Date()) return toast.error("End date cannot be in the past.");
    }

    setIsSubmitting(true);
    const userIdsFromIndividuals = assignedUsers.map(userOption => userOption.value);
    const userIdsFromGroups = new Set();
    selectedGroups.forEach(groupOption => {
        const members = groupMembers[groupOption.value];
        if (members && Array.isArray(members)) {
            members.forEach(user => userIdsFromGroups.add(user.id));
        }
    });

    const allAssignedUserIds = [...new Set([...userIdsFromIndividuals, ...userIdsFromGroups])];

    // Non-recurring tasks now use the Node v2 API (attachments -> DigitalOcean Spaces).
    // Recurring tasks still use the existing Flask endpoint (unchanged).
    let apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/v2`;
    let formData = new FormData();

    if (isRecurring) {
      apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recurring-task`;
      formData.append("recurrence_type", recurrenceType);
      if (recurrenceType === "weekly") formData.append("weekly_day", weeklyDay);
      if (recurrenceType === "monthly") formData.append("monthly_date", monthlyDate);
      if (endDate) formData.append("end_date", endDate.toISOString().split('T')[0]);
    }

    formData.append("title", title);
    // --- NEW: Sending HTML from ReactQuill ---
    formData.append("description", description); 
    
    allAssignedUserIds.forEach((userId) => formData.append("assignedUsers[]", userId));
    formData.append("ticketState", ticketState || "");
    formData.append("ticketPriority", ticketPriority || "");
    selectedTags.forEach((tag) => formData.append("tags[]", tag.value));

    if (isSubtask && selectedParentTask) {
      formData.append("is_subtask", true);
      formData.append("parent_task_id", selectedParentTask.value);
    }
    if (dueDate) formData.append("due_date", dueDate.toISOString());

    if (attachments && attachments.length > 0) {
      for (let i = 0; i < attachments.length; i++) formData.append("attachments", attachments[i]);
    }

    try {
      const headers = { "Content-Type": "multipart/form-data" };
      // v2 (non-recurring) authenticates via the user's tblusers id.
      if (!isRecurring) headers["x-user-id"] = currentUserId;
      const response = await axios.post(apiUrl, formData, {
        headers,
        withCredentials: true,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.scheduled ? "Task scheduled successfully!" : "Task created successfully!");
        setTimeout(() => router.push("/TaskManager/openTasks"), 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided, minHeight: '42px',
      borderColor: state.isFocused ? '#4f46e5' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(79, 70, 229, 0.1)' : null,
      borderRadius: '0.5rem',
    }),
  };
 
  const datePickerClassNames = "w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6">
      <ToastContainer position="top-center" autoClose={5000} theme="colored" />

      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 sm:px-8 sm:py-10 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
              <FaTasks className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Create New Task</h1>
              <p className="text-sm text-blue-100 mt-1">Fill in the details below to create a new task.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-8 sm:px-8 sm:py-10">
          <div className="space-y-8">
            {/* Task Details Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <span className="bg-gray-100 p-2 rounded-lg mr-3">
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </span>
                Task Details
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    required
                  />
                </div>
                
                {/* --- NEW: Rich Text Editor --- */}
                <div className="pb-8"> {/* Added padding bottom because Quill toolbar takes space */}
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
                    <ReactQuill 
                      theme="snow"
                      value={description} 
                      onChange={setDescription} 
                      modules={quillModules}
                      placeholder="Write task details, add lists, links, or code blocks..."
                      className="h-40"
                    />
                  </div>
                </div>

                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    id="isSubtask"
                    checked={isSubtask}
                    onChange={(e) => setIsSubtask(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isSubtask" className="ml-2 block text-sm text-gray-900">
                    This is a subtask
                  </label>
                </div>
                
                {isSubtask && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaSitemap className="mr-2 text-indigo-500" /> Parent Task <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={parentTasks}
                      value={selectedParentTask}
                      onChange={setSelectedParentTask}
                      styles={customSelectStyles}
                      placeholder="Select parent task..."
                      isLoading={loadingParentTasks}
                      isClearable
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Recurring Task Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <span className="bg-gray-100 p-2 rounded-lg mr-3"><FaSync className="h-5 w-5 text-gray-600" /></span>
                Recurring Task Settings
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center">
                  <input type="checkbox" id="isRecurring" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded"/>
                  <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-900">This is a recurring task</label>
                </div>

                {isRecurring && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence Type</label>
                        <select value={recurrenceType} onChange={e => setRecurrenceType(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg">
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      {recurrenceType === "weekly" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                          <select value={weeklyDay} onChange={e => setWeeklyDay(parseInt(e.target.value))} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg">
                            <option value="0">Sunday</option><option value="1">Monday</option><option value="2">Tuesday</option><option value="3">Wednesday</option><option value="4">Thursday</option><option value="5">Friday</option><option value="6">Saturday</option>
                          </select>
                        </div>
                      )}
                      {recurrenceType === "monthly" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
                          <select value={monthlyDate} onChange={e => setMonthlyDate(parseInt(e.target.value))} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg">
                            {Array.from({ length: 31 }, (_, i) => (<option key={i+1} value={i+1}>{i+1}</option>))}
                          </select>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                      <DatePicker selected={endDate} onChange={setEndDate} className={datePickerClassNames} minDate={new Date()}/>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Assignment & Metadata Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <span className="bg-gray-100 p-2 rounded-lg mr-3">
                  <FaTag className="h-5 w-5 text-gray-600" />
                </span>
                Assignment & Metadata
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FaTag className="mr-2 text-purple-500" />Tags</label>
                  <Select isMulti options={tags} value={selectedTags} onChange={setSelectedTags} styles={customSelectStyles} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FaTasks className="mr-2 text-blue-500" />State</label>
                  <select value={ticketState} onChange={e => setTicketState(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                    <option value="">Select State</option>
                    {taskStates.map(state => <option key={state.Id} value={state.Id}>{state.status_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FaExclamationTriangle className="mr-2 text-orange-500" />Priority</label>
                  <select value={ticketPriority} onChange={e => setTicketPriority(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                    <option value="">Select Priority</option>
                    {priorities.map(p => <option key={p.Id} value={p.Id}>{p.priority_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FaUserFriends className="mr-2 text-indigo-500" />Assign Users</label>
                  <Select isMulti options={users} value={assignedUsers} onChange={setAssignedUsers} styles={customSelectStyles} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FaUsers className="mr-2 text-green-500" />Assign Groups</label>
                  <Select isMulti options={groups} value={selectedGroups} onChange={setSelectedGroups} styles={customSelectStyles} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FaCalendarAlt className="mr-2 text-blue-500" />Due Date</label>
                  <DatePicker selected={dueDate} onChange={setDueDate} className={datePickerClassNames} minDate={new Date()} />
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <span className="bg-gray-100 p-2 rounded-lg mr-3"><FaPaperclip className="h-5 w-5 text-gray-600" /></span> Attachments
              </h2>
              <input type="file" multiple onChange={(e) => setAttachments(e.target.files)} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white" />
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm hover:from-blue-600 hover:to-indigo-700">
              {isSubmitting ? "Creating..." : <><FaSave className="mr-2" /> {isRecurring ? "Create Recurring Task" : "Create Task"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}