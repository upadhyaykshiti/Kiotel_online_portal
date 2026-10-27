// components/ManageAllGroupsModal.jsx
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaTimes, FaPlus, FaTrash, FaSave, FaUserPlus, FaUserMinus, FaUsersCog } from "react-icons/fa";

const ManageAllGroupsModal = ({ isOpen, onClose, onGroupsChange }) => { // onGroupsChange to notify parent
  const [allGroups, setAllGroups] = useState([]); // [{id, name}, ...]
  const [users, setUsers] = useState([]); // [{id, fname, lname, email, role}, ...] - All users for adding
  const [groupUsersMap, setGroupUsersMap] = useState({}); // { groupId: [userObj, ...] }
  const [loading, setLoading] = useState({ groups: true, users: true, groupUsers: false });
  const [error, setError] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(null); // For managing users in a group
  const [availableUsersToAdd, setAvailableUsersToAdd] = useState([]); // Filtered list for multi-select
  const [usersToRemove, setUsersToRemove] = useState([]); // Selected users to remove from group
  const [usersToAdd, setUsersToAdd] = useState([]); // Selected users to add to group
  const [isSaving, setIsSaving] = useState(false);

  const modalRef = useRef();

  // --- Close modal on outside click ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // --- Fetch All Groups ---
  const fetchGroups = async () => {
    setLoading(prev => ({ ...prev, groups: true }));
    setError(null);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/groups`);
      setAllGroups(response.data || []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setError("Failed to load groups.");
    } finally {
      setLoading(prev => ({ ...prev, groups: false }));
    }
  };

  // --- Fetch All Users (for adding to groups) ---
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`); // Or a specific endpoint for all users
      setUsers(response.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // --- Fetch Users for a Specific Group ---
  const fetchUsersForGroup = async (groupId) => {
    if (!groupId) return;
    setLoading(prev => ({ ...prev, groupUsers: true }));
    try {
      // Assuming your backend has an endpoint like this
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/group/${groupId}/users`);
      setGroupUsersMap(prev => ({ ...prev, [groupId]: response.data || [] }));
    } catch (err) {
      console.error(`Failed to fetch users for group ${groupId}:`, err);
      setError(`Failed to load users for group.`);
    } finally {
      setLoading(prev => ({ ...prev, groupUsers: false }));
    }
  };

  // --- Initial Load ---
  useEffect(() => {
    if (isOpen) {
      fetchGroups();
      fetchUsers();
    }
  }, [isOpen]);

  // --- Fetch Group Users when a group is selected ---
  useEffect(() => {
    if (selectedGroupId) {
        // Reset selections when group changes
        setUsersToAdd([]);
        setUsersToRemove([]);
        // Fetch users if not already loaded
        if (!groupUsersMap[selectedGroupId]) {
             fetchUsersForGroup(selectedGroupId);
        }
    } else {
        // Clear selections if no group is selected
        setUsersToAdd([]);
        setUsersToRemove([]);
    }
  }, [selectedGroupId, groupUsersMap]);

  // --- Update available users to add (exclude those already in the group) ---
  useEffect(() => {
    if (selectedGroupId) {
      const currentGroupUsers = groupUsersMap[selectedGroupId] || [];
      const currentGroupUserIds = new Set(currentGroupUsers.map(u => u.id));
      const available = users.filter(user => !currentGroupUserIds.has(user.id));
      setAvailableUsersToAdd(available);
    } else {
      setAvailableUsersToAdd([]);
    }
  }, [selectedGroupId, groupUsersMap, users]);


  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/groups`,
        { name: newGroupName.trim() },
        { withCredentials: true }
      );
      if (response.status === 201) {
        setNewGroupName("");
        await fetchGroups(); // Refresh list
        onGroupsChange(); // Notify parent (e.g., Dashboard) to refresh its group list if needed
        alert("Group created successfully!");
      }
    } catch (err) {
      console.error("Error creating group:", err);
      const errorMsg = err.response?.data?.error || "Failed to create group.";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditingGroup = (group) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const handleRenameGroup = async () => {
    if (!editingGroupName.trim() || !editingGroupId) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/group/${editingGroupId}`,
        { name: editingGroupName.trim() },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setEditingGroupId(null);
        setEditingGroupName("");
        await fetchGroups(); // Refresh list
        onGroupsChange(); // Notify parent
        alert("Group renamed successfully!");
      }
    } catch (err) {
      console.error("Error renaming group:", err);
      const errorMsg = err.response?.data?.error || "Failed to rename group.";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    const confirmed = window.confirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`);
    if (!confirmed) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/group/${groupId}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        // If the deleted group was selected, deselect it
        if (selectedGroupId === groupId) {
            setSelectedGroupId(null);
            setUsersToAdd([]);
            setUsersToRemove([]);
        }
        await fetchGroups(); // Refresh list
        // Remove deleted group's users from map
        setGroupUsersMap(prev => {
            const newMap = { ...prev };
            delete newMap[groupId];
            return newMap;
        });
        onGroupsChange(); // Notify parent
        alert("Group deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting group:", err);
      const errorMsg = err.response?.data?.error || "Failed to delete group.";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGroupUserChange = (userId, action) => { // action: 'add' or 'remove'
    if (action === 'add') {
        setUsersToAdd(prev => {
            if (prev.includes(userId)) return prev;
            return [...prev, userId];
        });
        setUsersToRemove(prev => prev.filter(id => id !== userId)); // Remove from remove list if added back
    } else if (action === 'remove') {
        setUsersToRemove(prev => {
            if (prev.includes(userId)) return prev;
            return [...prev, userId];
        });
        setUsersToAdd(prev => prev.filter(id => id !== userId)); // Remove from add list if removed
    }
  };

  const handleSaveGroupUsers = async () => {
    if (!selectedGroupId) return;
    setIsSaving(true);
    setError(null);

    // Prepare operations
    const operations = { add: usersToAdd, remove: usersToRemove };

    try {
      // Use the same endpoint as user-specific group management
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/group/${selectedGroupId}/manage-users`,
        operations,
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Refresh the user list for this group
        await fetchUsersForGroup(selectedGroupId);
        // Reset selections
        setUsersToAdd([]);
        setUsersToRemove([]);
        onGroupsChange(); // Notify parent if global user data might be affected
        alert("Group users updated successfully!");
      }
    } catch (err) {
      console.error("Error updating group users:", err);
      const errorMsg = err.response?.data?.error || "Failed to update group users.";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div
          ref={modalRef}
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row sm:items-center sm:justify-between border-b">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <FaUserPlus className="mr-2 text-indigo-600" />
              Manage All Groups & Users
            </h3>
            <button
              type="button"
              className="mt-3 sm:mt-0 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>

          {/* Modal Body */}
          <div className="px-4 py-5 sm:p-6 overflow-y-auto max-h-[70vh]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* --- Left Column: Group Management --- */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <FaUserPlus className="mr-2 text-indigo-500" /> Groups
                </h4>

                {/* Create New Group */}
                <div className="flex mb-4">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="New group name"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    disabled={isSaving}
                  />
                  <button
                    onClick={handleCreateGroup}
                    disabled={isSaving || !newGroupName.trim()}
                    className={`px-3 py-2 rounded-r-md text-white text-sm font-medium flex items-center ${
                      isSaving || !newGroupName.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <FaPlus className="mr-1" /> Add
                  </button>
                </div>

                {/* Groups List */}
                <div className="border border-gray-300 rounded-md bg-white max-h-80 overflow-y-auto">
                  {loading.groups ? (
                    <div className="p-4 text-center text-gray-500">Loading groups...</div>
                  ) : allGroups.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No groups found.</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {allGroups.map((group) => (
                        <li key={group.id} className="p-3 hover:bg-gray-50">
                          {editingGroupId === group.id ? (
                            <div className="flex items-center">
                              <input
                                type="text"
                                value={editingGroupName}
                                onChange={(e) => setEditingGroupName(e.target.value)}
                                className="flex-grow px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={isSaving}
                              />
                              <button
                                onClick={handleRenameGroup}
                                disabled={isSaving || !editingGroupName.trim() || editingGroupName.trim() === group.name}
                                className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FaSave />
                              </button>
                              <button
                                onClick={() => setEditingGroupId(null)}
                                disabled={isSaving}
                                className="ml-1 px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span
                                className={`cursor-pointer px-2 py-1 rounded ${
                                  selectedGroupId === group.id
                                    ? 'bg-indigo-100 text-indigo-800 font-medium'
                                    : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedGroupId(group.id === selectedGroupId ? null : group.id)}
                              >
                                {group.name}
                              </span>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => startEditingGroup(group)}
                                  className="p-1 text-indigo-600 hover:text-indigo-800 text-xs"
                                  title="Rename Group"
                                  disabled={isSaving}
                                >
                                  <FaSave />
                                </button>
                                <button
                                  onClick={() => handleDeleteGroup(group.id, group.name)}
                                  className="p-1 text-red-600 hover:text-red-800 text-xs"
                                  title="Delete Group"
                                  disabled={isSaving}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* --- Right Column: User Management for Selected Group --- */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <FaUsersCog className="mr-2 text-indigo-500" />
                  {selectedGroupId
                    ? `Users in "${allGroups.find(g => g.id === selectedGroupId)?.name}"`
                    : 'Select a Group'}
                </h4>

                {selectedGroupId ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Users in Group */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Users in Group <span className="text-red-500">*</span>
                        </label>
                        <div className="border border-gray-300 rounded-md bg-white p-2 h-40 overflow-y-auto">
                          {loading.groupUsers ? (
                            <p className="text-gray-500 text-sm">Loading users...</p>
                          ) : groupUsersMap[selectedGroupId]?.length > 0 ? (
                            groupUsersMap[selectedGroupId].map((user) => (
                              <div key={`in-${user.id}`} className="flex items-center justify-between py-1 text-sm">
                                <span>{user.fname} {user.lname} ({user.email})</span>
                                <input
                                  type="checkbox"
                                  checked={usersToRemove.includes(user.id)}
                                  onChange={() => handleGroupUserChange(user.id, 'remove')}
                                  className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm italic">No users in this group.</p>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 flex items-center">
                          <FaUserMinus className="mr-1 text-red-500" />
                          Check users to remove
                        </p>
                      </div>

                      {/* Available Users */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Available Users
                        </label>
                        <div className="border border-gray-300 rounded-md bg-white p-2 h-40 overflow-y-auto">
                          {loading.users ? (
                            <p className="text-gray-500 text-sm">Loading all users...</p>
                          ) : availableUsersToAdd.length > 0 ? (
                            availableUsersToAdd.map((user) => (
                              <div key={`avail-${user.id}`} className="flex items-center justify-between py-1 text-sm">
                                <span>{user.fname} {user.lname} ({user.email})</span>
                                <input
                                  type="checkbox"
                                  checked={usersToAdd.includes(user.id)}
                                  onChange={() => handleGroupUserChange(user.id, 'add')}
                                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm italic">No users available to add.</p>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 flex items-center">
                          <FaUserPlus className="mr-1 text-green-500" />
                          Check users to add
                        </p>
                      </div>
                    </div>

                    {/* Save Button for Group Users */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveGroupUsers}
                        disabled={isSaving || (usersToAdd.length === 0 && usersToRemove.length === 0)}
                        className={`px-4 py-2 rounded-md text-white text-sm font-medium flex items-center ${
                          isSaving || (usersToAdd.length === 0 && usersToRemove.length === 0)
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {isSaving ? 'Saving...' : <><FaSave className="mr-1" /> Save User Changes</>}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 text-gray-500 text-sm">
                    Select a group from the list to manage its users.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAllGroupsModal;