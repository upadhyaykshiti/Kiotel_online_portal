
"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { FaUserCircle, FaSearch, FaPlus, FaEdit, FaTrash, FaUsersCog, FaCalendarAlt, FaTimes, FaCalendarCheck, FaUser, FaHistory, FaUsers, FaLayerGroup, FaClock, FaChevronDown } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../context/ProtectedRoute";
import DataTable from "react-data-table-component";
import ManageAllGroupsModal from "../../../components/ManageAllGroupsModal";
import ShiftManagement from './ShiftManagement';
import ManageNonGeneralShifts from './ManageNonGeneralShifts';

// --- Modern Professional Custom Styles for DataTable ---
const customStyles = {
  table: {
    style: {
      minHeight: '400px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }
  },
  head: {
    style: {
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e5e9f0'
    }
  },
  headCells: {
    style: {
      fontSize: '0.72rem',
      fontWeight: '700',
      color: '#64748b',
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '15px',
      paddingBottom: '15px',
      textTransform: 'uppercase',
      letterSpacing: '0.06em'
    },
  },
  cells: {
    style: {
      fontSize: '0.875rem',
      color: '#334155',
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '14px',
      paddingBottom: '14px',
    },
  },
  rows: {
    style: {
      minHeight: '64px',
      fontWeight: '500',
      '&:hover': {
        backgroundColor: '#f8fafc',
        transition: 'background-color 0.2s ease'
      },
      '&:not(:last-of-type)': {
        borderBottom: '1px solid #f1f5f9'
      }
    },
    selectedHighlightStyle: {
      backgroundColor: '#dbeafe',
      borderBottomColor: '#bfdbfe'
    }
  },
  pagination: {
    style: {
      color: '#475569',
      fontSize: '0.875rem',
      minHeight: '56px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      padding: '0 16px'
    },
    pageButtonsStyle: {
      borderRadius: '6px',
      height: '36px',
      width: '36px',
      padding: '0',
      margin: '0 2px',
      cursor: 'pointer',
      color: '#475569',
      fill: '#475569',
      backgroundColor: 'transparent',
      border: '1px solid #e2e8f0',
      '&:disabled': {
        cursor: 'unset',
        color: '#94a3b8',
        fill: '#94a3b8',
        borderColor: '#e2e8f0'
      },
      '&:hover:not(:disabled)': {
        backgroundColor: '#f1f5f9',
        borderColor: '#cbd5e1'
      },
      '&:focus': {
        outline: 'none',
        backgroundColor: '#e2e8f0'
      },
    },
  },
};

// --- Sub-component for displaying groups ---
const GroupsCell = ({ groups }) => {
  if (!groups || groups.length === 0) {
    return <span className="text-gray-400 text-sm italic">No Groups</span>;
  }
  const displayGroups = groups.slice(0, 2);
  const remainingCount = groups.length - displayGroups.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {displayGroups.map((group, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
        >
          {group}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

// --- Modal Component for Managing Groups ---
const ManageGroupsModal = ({ isOpen, onClose, user, allGroups, onSave, isSaving }) => {
  const [localSelectedGroupIds, setLocalSelectedGroupIds] = useState([]);
  const modalRef = useRef();

  useEffect(() => {
    if (isOpen && user) {
      const initialGroupIds = (user.groups || [])
        .map(groupName => {
          const groupObj = allGroups.find(g => g.name === groupName);
          return groupObj ? String(groupObj.id) : null;
        })
        .filter(id => id !== null);

      setLocalSelectedGroupIds(initialGroupIds);
    }
  }, [isOpen, user, allGroups]);

  const handleGroupChange = (groupId) => {
    const groupIdStr = String(groupId);
    setLocalSelectedGroupIds(prev => {
      if (prev.includes(groupIdStr)) {
        return prev.filter(id => id !== groupIdStr);
      } else {
        return [...prev, groupIdStr];
      }
    });
  };

  const handleRemoveFromGroup = (groupIdToRemove) => {
    const groupIdStr = String(groupIdToRemove);
    setLocalSelectedGroupIds(prev => prev.filter(id => id !== groupIdStr));
  };

  const handleSave = async () => {
    const groupIdsToSend = localSelectedGroupIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    const originalUserGroupIds = (user?.groups || [])
      .map(groupName => {
        const groupObj = allGroups.find(g => g.name === groupName);
        return groupObj ? groupObj.id : null;
      })
      .filter(id => id !== null);

    const finalGroupIdsSet = new Set(groupIdsToSend);
    const originalGroupIdsSet = new Set(originalUserGroupIds);

    const groupsToAdd = groupIdsToSend.filter(id => !originalGroupIdsSet.has(id));
    const groupsToRemove = originalUserGroupIds.filter(id => !finalGroupIdsSet.has(id));

    await onSave(user.id, { add: groupsToAdd, remove: groupsToRemove });
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={onClose}
          ></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div
          ref={modalRef}
          className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div className="bg-white px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <FaUsersCog className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-semibold text-gray-900" id="modal-headline">
                  Manage Groups for {user.fname} {user.lname}
                </h3>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-3">
                    Select groups or remove user from specific groups.
                  </p>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {allGroups.length > 0 ? (
                      allGroups.map((group) => {
                        const groupIdStr = String(group.id);
                        const isChecked = localSelectedGroupIds.includes(groupIdStr);
                        return (
                          <div key={group.id} className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`modal-group-${group.id}`}
                                checked={isChecked}
                                onChange={() => handleGroupChange(group.id)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label htmlFor={`modal-group-${group.id}`} className="ml-3 text-sm text-gray-700">
                                {group.name}
                              </label>
                            </div>
                            {isChecked && (
                              <button
                                type="button"
                                onClick={() => handleRemoveFromGroup(group.id)}
                                className="text-xs text-red-600 hover:text-red-800 focus:outline-none font-medium"
                                title={`Remove from ${group.name}`}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500 italic">No groups available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={isSaving}
              className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                isSaving ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const ScheduleDeletionModal = ({ isOpen, onClose, user, onSchedule, onCancelSchedule, isSaving }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) setSelectedDate(user?.scheduled_date || '');
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-100 mr-3">
            <FaCalendarAlt className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Schedule Deactivation — {user.fname} {user.lname}
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          The account will be automatically deactivated on the selected date.
          {user.scheduled_date && (
            <span className="block mt-2 text-amber-700 font-medium">
              Currently scheduled for {user.scheduled_date}.
            </span>
          )}
        </p>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Deactivation date</label>
        <input
          type="date"
          min={tomorrow}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2.5 px-3 mb-5 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <div className="flex justify-end gap-3">
          {user.scheduled_date && (
            <button
              type="button"
              onClick={() => onCancelSchedule(user)}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              Cancel Schedule
            </button>
          )}
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Close
          </button>
          <button
            type="button"
            disabled={isSaving || !selectedDate}
            onClick={() => onSchedule(user, selectedDate)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${isSaving || !selectedDate ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'}`}
          >
            {isSaving ? 'Saving...' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
};
// --- Reusable avatar (image or placeholder) ---
const Avatar = ({ src, name, size = "h-9 w-9" }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "User"}
        className={`${size} rounded-full object-cover ring-1 ring-gray-200`}
      />
    );
  }
  return (
    <div className={`${size} rounded-full bg-gray-100 flex items-center justify-center text-gray-400`}>
      <FaUser className="h-1/2 w-1/2" />
    </div>
  );
};

// --- KPI stat card ---
const STAT_TONES = {
  indigo: "bg-indigo-50 text-indigo-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
};
const StatCard = ({ icon, label, value, tone = "indigo", onClick, highlight }) => {
  const inner = (
    <>
      <div className={`h-12 w-12 flex-shrink-0 rounded-xl flex items-center justify-center text-lg ${STAT_TONES[tone] || STAT_TONES.indigo}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[26px] font-bold text-slate-900 leading-none" style={{ fontFamily: "var(--font-syne)" }}>{value}</p>
        <p className="text-sm text-slate-500 mt-1.5 truncate">{label}</p>
      </div>
    </>
  );
  const base = `flex items-center gap-4 rounded-2xl bg-white border shadow-sm p-4 sm:p-5 transition-all duration-200 ${highlight ? "border-amber-200 ring-1 ring-amber-100" : "border-slate-200"}`;
  return onClick
    ? <button type="button" onClick={onClick} className={`${base} w-full text-left hover:shadow-md hover:-translate-y-0.5`}>{inner}</button>
    : <div className={base}>{inner}</div>;
};

// --- Role badge color mapping ---
const roleBadgeClass = (role) => {
  const r = String(role || "").toLowerCase();
  if (r.includes("admin")) return "bg-indigo-50 text-indigo-700 border-indigo-100";
  if (r.includes("hr")) return "bg-violet-50 text-violet-700 border-violet-100";
  if (r.includes("client")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (r.includes("trainee")) return "bg-amber-50 text-amber-700 border-amber-100";
  if (r.includes("operator")) return "bg-sky-50 text-sky-700 border-sky-100";
  if (r.includes("agent")) return "bg-blue-50 text-blue-700 border-blue-100";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

// --- Modal: view employees scheduled for deletion (not yet deleted) ---
const ViewScheduledDeletionsModal = ({ isOpen, onClose, scheduledUsers, onCancelSchedule, isSaving }) => {
  if (!isOpen) return null;
  const todayMid = new Date();
  todayMid.setHours(0, 0, 0, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-100 mr-3">
              <FaHistory className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Scheduled Deletions</h3>
              <p className="text-sm text-gray-500">Employees scheduled for deactivation but not yet deleted.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100">
            <FaTimes />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {scheduledUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <FaCalendarAlt className="h-6 w-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-900">No scheduled deletions</p>
              <p className="text-sm">No employees are currently scheduled for deletion.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {scheduledUsers.map((u) => {
                const d = new Date(`${u.scheduled_date}T00:00:00`);
                const days = Math.ceil((d - todayMid) / 86400000);
                return (
                  <li key={u.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={u.profile_pic} name={`${u.fname} ${u.lname}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{u.fname} {u.lname}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {u.account_no}{u.emailid ? ` · ${u.emailid}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-medium text-amber-700">{u.scheduled_date}</p>
                        <p className="text-xs text-gray-500">
                          {days > 0 ? `in ${days} day${days !== 1 ? "s" : ""}` : "due"}
                        </p>
                      </div>
                      <button
                        onClick={() => onCancelSchedule(u)}
                        disabled={isSaving}
                        className="text-xs font-medium text-red-600 hover:text-red-800 border border-red-200 hover:bg-red-50 px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function Dashboard() {
  const [userFname, setUserFname] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const profileMenuRef = useRef(null);

  // State for Manage Groups Modal
  const [isManageGroupsModalOpen, setIsManageGroupsModalOpen] = useState(false);
  const [selectedUserForGroups, setSelectedUserForGroups] = useState(null);
  const [allGroups, setAllGroups] = useState([]);
  const [isSavingGroups, setIsSavingGroups] = useState(false);
  const [groupsError, setGroupsError] = useState(null);

  // NEW: Batch Shift Assignment State
  const [isAssignShiftPanelOpen, setIsAssignShiftPanelOpen] = useState(false);
  const [allShifts, setAllShifts] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [isSavingShift, setIsSavingShift] = useState(false);
  const [shiftError, setShiftError] = useState(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState(null);

  const [isManageAllGroupsModalOpen, setIsManageAllGroupsModalOpen] = useState(false);
  const [isShiftManagementOpen, setIsShiftManagementOpen] = useState(false);
  const [isManageNonGeneralShiftsOpen, setIsManageNonGeneralShiftsOpen] = useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
const [selectedUserForSchedule, setSelectedUserForSchedule] = useState(null);
const [isSavingSchedule, setIsSavingSchedule] = useState(false);
const [scheduledMap, setScheduledMap] = useState({}); // { [user_id]: 'YYYY-MM-DD' }
const [isViewScheduledOpen, setIsViewScheduledOpen] = useState(false); // scheduled-deletions viewer


const fetchScheduledDeletions = async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scheduled-deletions`,
      { withCredentials: true }
    );
    const map = {};
    (res.data || []).forEach(s => { map[s.user_id] = s.scheduled_date; });
    setScheduledMap(map);
  } catch (err) {
    console.error("Failed to fetch scheduled deletions:", err);
  }
};

const openScheduleModal = (user) => {
  setSelectedUserForSchedule({ ...user, scheduled_date: scheduledMap[user.id] || null });
  setIsScheduleModalOpen(true);
};

const handleSchedule = async (user, dateStr) => {
  setIsSavingSchedule(true);
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/schedule-deletion`,
      { user_id: user.id, account_no: user.account_no, scheduled_date: dateStr },
      { withCredentials: true }
    );
    await fetchScheduledDeletions();
    setIsScheduleModalOpen(false);
    alert("Deletion scheduled successfully");
  } catch (err) {
    alert(err.response?.data?.error || "Failed to schedule deletion");
  } finally {
    setIsSavingSchedule(false);
  }
};

const handleCancelSchedule = async (user) => {
  setIsSavingSchedule(true);
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cancel-scheduled-deletion`,
      { user_id: user.id },
      { withCredentials: true }
    );
    await fetchScheduledDeletions();
    setIsScheduleModalOpen(false);
  } catch (err) {
    alert("Failed to cancel scheduled deletion");
  } finally {
    setIsSavingSchedule(false);
  }
};

useEffect(() => { fetchScheduledDeletions(); }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch All Groups
  useEffect(() => {
    const fetchAllGroups = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/groups`);
        setAllGroups(response.data || []);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
        setGroupsError("Failed to load groups.");
        setAllGroups([]);
      }
    };
    fetchAllGroups();
  }, []);

  // Fetch All Shifts
  useEffect(() => {
    const fetchAllShifts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clockin/shifts`);
        setAllShifts(response.data || []);
      } catch (err) {
        console.error("Failed to fetch shifts:", err);
      }
    };
    fetchAllShifts();
  }, []);

  // Fetch User Role and Users
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        setUserFname(response.data.fname);
        setUserRole(response.data.role);

        const usersResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`,
          { withCredentials: true }
        );
        setUsers(usersResponse.data);
        setFilteredUsers(usersResponse.data);
      } catch (error) {
        console.error("Failed to fetch user ", error);
        setError("Failed to fetch user data");
        setUserFname(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logout`,
        {},
        { withCredentials: true }
      );
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleDeleteUserAccount = async (accountNo) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delete-user-account/${accountNo}`,
        { withCredentials: true }
      );
      console.log("Employee deleted from HR DB successfully");
    } catch (error) {
      // A 404 just means this account has no HR record (admins never get one),
      // which is fine. Anything else left the two databases disagreeing about
      // whether this person is deleted, so say so instead of only logging it.
      if (error?.response?.status === 404) {
        console.log("No HR employee record for", accountNo, "— nothing to delete there");
        return;
      }
      console.error("Error deleting HR employee:", error);
      alert(
        "The portal account was deleted, but the HR employee record could not be. " +
          "Please retry so the two stay in step."
      );
    }
  };

  const deleteUserAndAccount = async (id, accountNo) => {
    try {
      // Only touch the HR record once the portal account is actually gone.
      // Running it unconditionally meant cancelling the confirm — or the portal
      // delete failing — still deleted the employee in HR, leaving an account
      // that reads as deleted in one place and active in the other.
      const deleted = await handleDeleteUser(id);
      if (!deleted) return;
      await handleDeleteUserAccount(accountNo);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Resolves true only when the portal account was really deleted.
  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return false;
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delete-user`,
        { user_id: userId },
        { withCredentials: true }
      );
      setUsers(users.filter((user) => user.id !== userId));
      setFilteredUsers(filteredUsers.filter((user) => user.id !== userId));
      alert("User deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
      return false;
    }
  };

  // Open Manage Groups Modal
  const openManageGroupsModal = (user) => {
    setSelectedUserForGroups(user);
    setIsManageGroupsModalOpen(true);
  };

  // Batch Shift Assignment
  const assignShiftToUsers = async () => {
    if (selectedUserIds.size === 0) {
      alert("Please select at least one user");
      return;
    }
    
    if (!selectedShiftId) {
      alert("Please select a shift");
      return;
    }
    
    setIsSavingShift(true);
    setShiftError(null);
    setAssignmentSuccess(null);
    
    try {
      const newShiftName = allShifts.find(s => s.id === parseInt(selectedShiftId))?.shift_name || 'No Shift';
      
      setUsers(prev => prev.map(user => 
        selectedUserIds.has(user.id) ? { ...user, shift_name: newShiftName } : user
      ));
      
      setFilteredUsers(prev => prev.map(user => 
        selectedUserIds.has(user.id) ? { ...user, shift_name: newShiftName } : user
      ));
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/clockin/users/assign-shift`,
        { user_ids: Array.from(selectedUserIds), shift_id: selectedShiftId },
        { withCredentials: true }
      );
      
      setAssignmentSuccess(`${response.data.assigned_count} user(s) updated successfully!`);
      setSelectedUserIds(new Set());
      
    } catch (err) {
      console.error("Error assigning shifts:", err);
      setShiftError("Failed to assign shifts");
      const usersResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`,
        { withCredentials: true }
      );
      setUsers(usersResponse.data);
      setFilteredUsers(usersResponse.data);
    } finally {
      setIsSavingShift(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) newSet.delete(userId);
      else newSet.add(userId);
      return newSet;
    });
  };

  const clearSelections = () => {
    setSelectedUserIds(new Set());
  };

  const saveUserGroups = async (userId, groupOperations) => {
    setIsSavingGroups(true);
    setGroupsError(null);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${userId}/manage-groups`,
        groupOperations,
        { withCredentials: true }
      );

      if (response.status === 200) {
        const usersResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`,
          { withCredentials: true }
        );
        setUsers(usersResponse.data);
        setFilteredUsers(usersResponse.data);
        alert("Groups updated successfully!");
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err) {
      console.error("Error saving groups:", err);
      const errorMessage = err.response?.data?.error || "Failed to update groups.";
      setGroupsError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSavingGroups(false);
    }
  };

  // Restrict access for non-admin users (Role 1 or 8)
  if (!loading && userRole && String(userRole) !== '1' && String(userRole) !== '8') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-200">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <FaTimes className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-8">You do not have permission to access the User & Group Management dashboard.</p>
          <button 
            onClick={() => router.push('/Dashboard')} 
            className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const columns = [
    ...(isAssignShiftPanelOpen && String(userRole) === '1' ? [{
      name: "Select",
      width: "60px",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedUserIds.has(row.id)}
          onChange={() => toggleUserSelection(row.id)}
          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
        />
      ),
      ignoreRowClick: true,
    }] : []),
    {
      name: "",
      width: "64px",
      center: true,
      cell: (row) => (
        <Avatar src={row.profile_pic} name={`${row.fname} ${row.lname}`} size="h-9 w-9" />
      ),
      ignoreRowClick: true,
    },
    {
      name: "ID",
      selector: (row) => row.account_no,
      sortable: true,
      width: "105px",
      cell: (row) => <span className="font-semibold text-gray-800">{row.account_no}</span>,
    },
    {
      name: "Agent ID",
      selector: (row) => row.agent_id || "-",
      sortable: true,
      width: "105px",
    },
    {
      name: "Name",
      selector: (row) => `${row.fname} ${row.lname}`,
      sortable: true,
      grow: 1,
      cell: (row) => (
        <span className="font-semibold text-gray-900 truncate" title={`${row.fname} ${row.lname}`}>
          {row.fname} {row.lname}
        </span>
      ),
    },
    {
      name: "Email",
      selector: (row) => row.emailid,
      sortable: true,
      grow: 1,
      cell: (row) => (
        <span className="text-gray-500 truncate" title={row.emailid}>{row.emailid}</span>
      ),
    },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
      width: "130px",
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border capitalize ${roleBadgeClass(row.role)}`}>
          {row.role || "—"}
        </span>
      ),
    },
    {
      name: "Shift",
      selector: (row) => row.shift_name,
      sortable: false,
      width: "140px",
      cell: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          row.shift_name 
            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
            : 'bg-gray-50 text-gray-500 border border-gray-200'
        }`}>
          {row.shift_name || "No Shift"}
        </span>
      ),
    },
    {
      name: "Groups",
      selector: (row) => row.groups,
      sortable: false,
      grow: 2,
      cell: (row) => <GroupsCell groups={row.groups} />,
    },
    {
      name: "Actions",
      button: true,
      width: "160px",
      cell: (row) => (
        <div className="flex space-x-2.5">
          <button
            onClick={() => openManageGroupsModal(row)}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-1.5 rounded-full hover:bg-gray-100"
            title="Manage Groups"
            disabled={isSavingGroups}
          >
            <FaUsersCog className="text-lg" />
          </button>
          <Link
            href={`/components/Admin/user/${row.id}`}
            className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 p-1.5 rounded-full hover:bg-indigo-50"
            title="Edit User"
          >
            <FaEdit className="text-lg" />
          </Link>
          <button
            className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1.5 rounded-full hover:bg-red-50"
            onClick={() => deleteUserAndAccount(row.id, row.account_no)}
            title="Delete User"
          >
            <FaTrash className="text-lg" />
          </button>
          <button
  onClick={() => openScheduleModal(row)}
  className={`transition-colors duration-200 p-1.5 rounded-full ${
    scheduledMap[row.id]
      ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`}
  title={scheduledMap[row.id] ? `Scheduled: ${scheduledMap[row.id]}` : "Schedule Deletion"}
>
  <FaCalendarAlt className="text-lg" />
</button>
        </div>
      ),
    },
  ];

  const handleGroupsChange = () => {
    const fetchUserData = async () => {
      try {
        const usersResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`,
          { withCredentials: true }
        );
        setUsers(usersResponse.data);
        setFilteredUsers(usersResponse.data);
      } catch (error) {
        console.error("Failed to re-fetch user data after group change:", error);
      }
    };
    fetchUserData();
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = users.filter((user) => {
      const idMatch = user.account_no?.toLowerCase().includes(query);
      const agentIdMatch = String(user.agent_id || "")?.toLowerCase().includes(query);
      const nameMatch =
        (user.fname?.toLowerCase().includes(query) || '') ||
        (user.lname?.toLowerCase().includes(query) || '');
      const emailMatch = user.emailid?.toLowerCase().includes(query);
      const roleMatch = user.role?.toLowerCase().includes(query);
      const groupMatch = user.groups?.some(group =>
        group?.toLowerCase().includes(query)
      );
      return idMatch || agentIdMatch || nameMatch || emailMatch || roleMatch || groupMatch;
    });
    setFilteredUsers(filtered);
  };

  // Users scheduled for deletion (pending) — joined with full user records.
  const scheduledUsers = users
    .filter((u) => scheduledMap[u.id])
    .map((u) => ({ ...u, scheduled_date: scheduledMap[u.id] }))
    .sort((a, b) => String(a.scheduled_date).localeCompare(String(b.scheduled_date)));
  const scheduledCount = scheduledUsers.length;

  const toolbarBtn = "inline-flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors";
  const primaryBtn = "inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-sm shadow-indigo-600/30 hover:from-indigo-700 hover:to-violet-700 transition-colors";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <header className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur border border-slate-200 shadow-sm px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-11 w-11 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25">
              <FaUsersCog className="text-lg" />
            </div>
            <div className="min-w-0">
              <h1
                className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-none truncate"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                User Management
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 truncate">
                {loading ? 'Loading…' : error ? 'Error loading data' : (
                  <>Welcome back, <span className="font-semibold text-slate-700">{userFname}</span></>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/Kiotel logo.jpg"
              alt="Kiotel"
              onClick={() => router.push('/Dashboard')}
              className="hidden sm:block h-9 w-auto cursor-pointer opacity-90 hover:opacity-100 transition"
            />
            <div className="hidden sm:block h-8 w-px bg-slate-200" />
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={toggleProfileMenu}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white pl-1 pr-2 sm:pr-3 py-1 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <span className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  {userFname ? userFname.charAt(0).toUpperCase() : <FaUserCircle className="text-lg" />}
                </span>
                <span className="hidden sm:block text-sm font-semibold text-slate-700 max-w-[110px] truncate">
                  {userFname || 'Account'}
                </span>
                <FaChevronDown className="hidden sm:block text-xs text-slate-400" />
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate">{userFname || 'Account'}</p>
                    <p className="text-xs text-slate-400">Administrator</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-1 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* KPI stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<FaUsers />} tone="indigo" label="Total Users" value={loading ? '—' : users.length} />
          <StatCard icon={<FaClock />} tone="sky" label="With Shift" value={loading ? '—' : users.filter((u) => u.shift_name).length} />
          <StatCard icon={<FaLayerGroup />} tone="emerald" label="Groups" value={allGroups.length} />
          <StatCard
            icon={<FaHistory />}
            tone="amber"
            label="Scheduled Deletions"
            value={scheduledCount}
            onClick={() => setIsViewScheduledOpen(true)}
            highlight={scheduledCount > 0}
          />
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
            <div className="relative flex-grow lg:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FaSearch className="text-slate-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Search users by ID, name, email, role or group…"
                value={searchQuery}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 h-11 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 focus:bg-white transition"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              {String(userRole) === '1' && (
                <>
                  <button
                    onClick={() => {
                      setIsAssignShiftPanelOpen(!isAssignShiftPanelOpen);
                      if (isAssignShiftPanelOpen) {
                        setSelectedUserIds(new Set());
                        setSelectedShiftId('');
                        setAssignmentSuccess(null);
                        setShiftError(null);
                      }
                    }}
                    className={isAssignShiftPanelOpen
                      ? "inline-flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
                      : toolbarBtn}
                  >
                    {isAssignShiftPanelOpen
                      ? <><FaTimes /> Close Assignment</>
                      : <><FaCalendarAlt className="text-indigo-500" /> Assign Shifts</>}
                  </button>

                  <button onClick={() => setIsShiftManagementOpen(true)} className={toolbarBtn}>
                    <FaCalendarAlt className="text-orange-500" />
                    Shift Management
                  </button>
                </>
              )}

              <button onClick={() => setIsManageNonGeneralShiftsOpen(true)} className={toolbarBtn}>
                <FaCalendarCheck className="text-violet-500" />
                Non-General Access
              </button>

              <button onClick={() => setIsManageAllGroupsModalOpen(true)} className={toolbarBtn}>
                <FaUsersCog className="text-emerald-500" />
                Manage Groups
              </button>

              <Link href="/components/Create_new_user" className={primaryBtn}>
                <FaPlus />
                New User
              </Link>
            </div>
          </div>
          
          {/* Inline Shift Assignment Panel (Only available to role 1) */}
          {isAssignShiftPanelOpen && String(userRole) === '1' && (
            <div className="mt-5 p-5 bg-indigo-50/60 border border-indigo-100 rounded-2xl animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'var(--font-syne)' }}>Batch Shift Assignment</h3>
                  <p className="text-slate-500 mt-1 text-sm">
                    Select users using checkboxes and choose a shift to assign to all selected users.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white px-3 py-1.5 rounded-lg border border-indigo-200">
                    <span className="text-indigo-700 font-semibold text-sm">
                      {selectedUserIds.size} user{selectedUserIds.size !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  {selectedUserIds.size > 0 && (
                    <button
                      onClick={clearSelections}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Select Shift to Assign
                  </label>
                  <select
                    value={selectedShiftId}
                    onChange={(e) => setSelectedShiftId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  >
                    <option value="">Select a shift</option>
                    {allShifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.shift_name} ({shift.start_time} - {shift.end_time})
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={assignShiftToUsers}
                  disabled={isSavingShift || selectedUserIds.size === 0 || !selectedShiftId}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                    isSavingShift || selectedUserIds.size === 0 || !selectedShiftId
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow'
                  }`}
                >
                  {isSavingShift ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Assigning...
                    </>
                  ) : 'Assign to Selected Users'}
                </button>
              </div>
              
              {(shiftError || assignmentSuccess) && (
                <div className={`mt-3 p-3 rounded-lg ${
                  shiftError 
                    ? 'bg-red-50 border border-red-200 text-red-700' 
                    : 'bg-green-50 border border-green-200 text-green-700'
                }`}>
                  {shiftError || assignmentSuccess}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* User Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'var(--font-syne)' }}>All Users</h2>
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {loading ? '…' : filteredUsers.length}
              </span>
            </div>
            {searchQuery && !loading && (
              <span className="text-xs text-gray-400">Filtered from {users.length}</span>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 font-medium">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {groupsError && (
                <div className="text-center py-3 text-red-500 text-sm bg-red-50 border-b border-red-200 font-medium">
                  {groupsError}
                </div>
              )}
              
              <DataTable
                columns={columns}
                data={filteredUsers}
                pagination
                highlightOnHover
                pointerOnHover
                responsive
                customStyles={customStyles}
                paginationRowsPerPageOptions={[10, 20, 50, 100, 300]}
                paginationDefaultPage={1}
                paginationPerPage={20}
                noDataComponent={
                  <div className="text-center py-12 text-gray-500">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your search criteria</p>
                  </div>
                }
              />
            </>
          )}
        </div>
      </div>
      
      {/* Shift Management Modal (Role 1 Only) */}
      {isShiftManagementOpen && String(userRole) === '1' && (
        <ShiftManagement
          onClose={() => setIsShiftManagementOpen(false)}
        />
      )}
     
{isManageNonGeneralShiftsOpen && (
  <ManageNonGeneralShifts
    onClose={() => setIsManageNonGeneralShiftsOpen(false)}
  />
)}

<ScheduleDeletionModal
  isOpen={isScheduleModalOpen}
  onClose={() => setIsScheduleModalOpen(false)}
  user={selectedUserForSchedule}
  onSchedule={handleSchedule}
  onCancelSchedule={handleCancelSchedule}
  isSaving={isSavingSchedule}
/>

<ViewScheduledDeletionsModal
  isOpen={isViewScheduledOpen}
  onClose={() => setIsViewScheduledOpen(false)}
  scheduledUsers={scheduledUsers}
  onCancelSchedule={handleCancelSchedule}
  isSaving={isSavingSchedule}
/>

      {/* Manage Groups Modal */}
      <ManageGroupsModal
        isOpen={isManageGroupsModalOpen}
        onClose={() => {
          setIsManageGroupsModalOpen(false);
          setGroupsError(null);
        }}
        user={selectedUserForGroups}
        allGroups={allGroups}
        onSave={saveUserGroups}
        isSaving={isSavingGroups}
      />
      
      {/* Manage All Groups Modal */}
      <ManageAllGroupsModal
        isOpen={isManageAllGroupsModalOpen}
        onClose={() => setIsManageAllGroupsModalOpen(false)}
        onGroupsChange={handleGroupsChange}
      />
    </div>
  );
}

export default function DashboardWrapper() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}