"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaBell, FaUserCircle, FaSignOutAlt, FaUsers, FaCalendarAlt, FaTasks, FaChartLine, FaUserShield, FaClipboardCheck, FaCog, FaBuilding, FaUserTie, FaMapMarkerAlt, FaUsersCog } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../context/ProtectedRoute";

/**
 * ONLY these emails can see Attendance (and NOTHING else)
 */
const ATTENDANCE_ONLY_EMAILS = [
  "Clockin@kiotel.co",
];

/**
 * These emails can see Attendance ALONG WITH other tabs
 */
const ATTENDANCE_WITH_OTHER_TABS_EMAILS = [
  "shuvam.r@kiotel.co",
  "bhuvnesh.s@kiotel.co",
  "vishals@kiotel.co",
  "tushars@kiotel.co",
  "adityas@kiotel.co",
  "arbaz.p@valianthotels.com",
];

/**
 * NEW: These emails get access to the Admin Attendance tab even if they aren't admins
 */
const ADMIN_ATTENDANCE_ACCESS_EMAILS = [
  "qateam@kiotel.co", // <-- Replace with the 1st email ID
  "kioteltrainer@kiotel.co", // <-- Replace with the 2nd email ID
];

function Dashboard() {
  const [userFname, setUserFname] = useState(null);
  const [userRole, setUserRole] = useState(null);
  // Feature flags for this user. An absent key means the feature has no flag
  // row yet, which counts as ON — same rule the server applies.
  const [featureFlags, setFeatureFlags] = useState({});
  const [userEmail, setUserEmail] = useState(null);
  const [userUniqueID, setuserUniqueID] = useState(null);
  const [userProfilePic, setUserProfilePic] = useState(null); // NEW: Profile Pic State

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // State to control the image modal
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );

        const fetchedRole = res.data.role;
        setUserFname(res.data.fname);
        setUserRole(fetchedRole);
        setUserEmail(res.data.email);
        setuserUniqueID(res.data.unique_id);
        setUserProfilePic(res.data.profile_pic); // NEW: Save the profile picture

        // Which modules this person is allowed to see. Failing quietly is
        // deliberate: a flag lookup that cannot run must not blank the
        // dashboard, and every card is re-checked by its own page anyway.
        if (res.data.unique_id) {
          axios
            .get(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/features/my-flags/${encodeURIComponent(res.data.unique_id)}`,
              { withCredentials: true }
            )
            .then((r) => setFeatureFlags(r.data || {}))
            .catch(() => {});
        }

        // CHECK ROLE AND SESSION STORAGE
        if (fetchedRole !== 1 && fetchedRole !== 4) {
          // Check if they have already seen it this session
          const hasSeen = sessionStorage.getItem("hasSeenAnnouncement");
          if (!hasSeen) {
            setShowAnnouncement(true);
          }
        }

      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const isAttendanceOnlyUser = userEmail && ATTENDANCE_ONLY_EMAILS.includes(userEmail);
  const canSeeAttendanceWithOtherTabs = userEmail && ATTENDANCE_WITH_OTHER_TABS_EMAILS.includes(userEmail);
  
  // ✅ Check if user is in the special Admin Attendance list
  const canSeeAdminAttendance = userEmail && ADMIN_ATTENDANCE_ACCESS_EMAILS.includes(userEmail);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("hasSeenAnnouncement");
      
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

  const handleCloseAnnouncement = () => {
    sessionStorage.setItem("hasSeenAnnouncement", "true");
    setShowAnnouncement(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 animate-pulse">
          <div className="relative z-50 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/50 mb-6 sm:mb-8 overflow-hidden">
            <div className="h-1.5 sm:h-2 bg-gray-200"></div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                <div className="flex-1 flex items-center gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-200 rounded-xl sm:rounded-2xl"></div>
                  <div>
                    <div className="h-6 sm:h-8 w-48 sm:w-64 bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 w-24 sm:w-32 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navigationCards = [
    { title: "Company Policy", href: "/Company-policy", icon: FaClipboardCheck, gradient: "from-blue-600 to-indigo-500", description: "View company policies", show: !isAttendanceOnlyUser && userRole !== 4 },
    { title: "Company Bonus", href: "/Company_Bonus", icon: FaClipboardCheck, gradient: "from-blue-600 to-indigo-500", description: "View company bonus information", show: !isAttendanceOnlyUser && userRole !== 4 },
    { title: "HR", href: "/emp-dashboard", icon: FaUsers, gradient: "from-blue-500 to-blue-600", description: "Employee management", show: !isAttendanceOnlyUser && userRole !== 4 },
    { title: "Schedule", href: "/schedule", icon: FaCalendarAlt, gradient: "from-blue-600 to-blue-700", description: "View your schedule", show: !isAttendanceOnlyUser && userRole !== 4 },
    { title: "Task Manager", href: "/TaskManager/openTasks", icon: FaTasks, gradient: "from-blue-500 to-indigo-600", description: "Manage your tasks", show: !isAttendanceOnlyUser },
    { title: "Work-Space", href: "/workspace", icon: FaCalendarAlt, gradient: "from-blue-600 to-blue-700", description: "Manage you work space", show: !isAttendanceOnlyUser && userRole !== 4 },
    { title: "Invoices", href: "/Customer_Portal", icon: FaChartLine, gradient: "from-indigo-500 to-blue-600", description: "", show: !isAttendanceOnlyUser && (userRole === 1 || userRole === 4) },
    { title: "Attendance", href: "/Attendance", icon: FaClipboardCheck, gradient: "from-blue-500 to-blue-600", description: "Clock in/out", show: isAttendanceOnlyUser || canSeeAttendanceWithOtherTabs },
    { title: "Customer Portal", href: "/customer", icon: FaBuilding, gradient: "from-blue-500 to-cyan-600", description: "Service Plan, Agents, Shared Folder", show: !isAttendanceOnlyUser && userRole === 4 },
    { title: "Task-Manager/HelpDesk", href: "/tasks", icon: FaBuilding, gradient: "from-blue-500 to-cyan-600", description: "Service Plan, Agents, Shared Folder", show: !isAttendanceOnlyUser && userRole === 4 },
    { title: "Current Property", href: "/agent", icon: FaMapMarkerAlt, gradient: "from-blue-600 to-sky-500", description: "Your assigned working property", show: !isAttendanceOnlyUser && (userRole === 2 || userRole === 3) },
    { title: "HR (Admin)", href: "/admin-dashboard", icon: FaUserShield, gradient: "from-indigo-600 to-purple-600", description: "Admin HR controls", show: !isAttendanceOnlyUser && (userRole === 1 || userRole === 5 || userRole === 8), isAdminCard: true },
    
    // ✅ Updated Admin Attendance condition to include 'canSeeAdminAttendance'
    { title: "Admin Attendance", href: "/Admin_Attendance", icon: FaClipboardCheck, gradient: "from-violet-500 to-purple-600", description: "Attendance oversight", show: !isAttendanceOnlyUser && (userRole === 1 || userRole === 8 || canSeeAdminAttendance), isAdminCard: true },
    
    // Payroll is salary data: role 1 only, and the page re-checks server-side.
    { title: "Payroll", href: "/Payroll", icon: FaClipboardCheck, gradient: "from-emerald-700 to-teal-800", description: "Salaries, pay sheets and payroll runs", show: !isAttendanceOnlyUser && userRole === 1 && featureFlags?.payroll !== false, isAdminCard: true },
    { title: "Careers Admin", href: "/Admin_careers", icon: FaClipboardCheck, gradient: "from-fuchsia-600 to-pink-600", description: "Careers view", show: !isAttendanceOnlyUser && userRole === 1, isAdminCard: true },
    { title: "Admin Panel", href: "/components/Admin", icon: FaCog, gradient: "from-slate-600 to-slate-800", description: "System administration", show: !isAttendanceOnlyUser && (userRole === 1 || userRole === 8), isAdminCard: true },
    { title: "Inventory Management", href: "/inventory", icon: FaCog, gradient: "from-slate-600 to-slate-800", description: "Manage Your Inventory", show: !isAttendanceOnlyUser && (userRole === 1 || userRole === 6), isAdminCard: true },
    { title: "Customer Admin", href: "/custAdmin", icon: FaUserTie, gradient: "from-indigo-600 to-blue-700", description: "Manage customers & plans", show: !isAttendanceOnlyUser && userRole === 1, isAdminCard: true },
    { title: "Active Agents", href: "/active-agents", icon: FaUsersCog, gradient: "from-purple-600 to-indigo-600", description: "Monitor currently active agents", show: !isAttendanceOnlyUser && userRole === 1, isAdminCard: true },
    { title: "Deactivated Users", href: "/deactivated_users", icon: FaUsersCog, gradient: "from-rose-500 to-red-600", description: "Manage disabled accounts", show: !isAttendanceOnlyUser && userRole === 1, isAdminCard: true },
    { title: "Clockin Browser approval", href: "/browser_approval", icon: FaUsersCog, gradient: "from-violet-600 to-indigo-600", description: "Approve clock-in browsers", show: !isAttendanceOnlyUser && userRole === 1, isAdminCard: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      
      {showAnnouncement && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md animate-slideDown">
          <button onClick={handleCloseAnnouncement} className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src="/Kiotel_Grooming_image.jpeg" alt="Important Announcement" className="w-full h-full object-contain p-4 sm:p-12" />
          <div className="absolute bottom-8 sm:bottom-12 z-10">
            <button onClick={handleCloseAnnouncement} className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-full backdrop-blur-md shadow-2xl transition-all hover:scale-105">
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Card */}
        <div className="relative z-50 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/50 mb-6 sm:mb-8 overflow-visible">
          <div className="h-1.5 sm:h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              {/* Left section - User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  
                  {/* --- NEW PROFILE PICTURE RENDERER --- */}
                  <div className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg overflow-hidden border-2 border-white/50">
                    {userProfilePic ? (
                      <img src={userProfilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      userFname?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 truncate">
                      {error ? "Error loading user" : `Welcome back, ${userFname}`}
                    </h1>
                    {!error && (
                      <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                        ID: {userUniqueID}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                    <FaCalendarAlt className="text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium truncate">{formatDate(currentTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                    <span className="text-xl sm:text-2xl">🕐</span>
                    <span className="text-gray-700 font-mono font-semibold">{formatTime(currentTime)}</span>
                  </div>
                </div>
              </div>

              {/* Right section - Actions */}
              <div className="flex items-center justify-end gap-2 sm:gap-3">
                <div className="relative profile-menu-container">
                  
                  {/* --- NEW PROFILE PIC BUTTON --- */}
                  <button
                    onClick={toggleProfileMenu}
                    className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-all duration-300 group shadow-sm hover:shadow-md flex items-center justify-center"
                  >
                    {userProfilePic ? (
                      <img src={userProfilePic} alt="Profile Menu" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover shadow-sm border border-gray-200" />
                    ) : (
                      <FaUserCircle className="text-xl sm:text-2xl text-gray-600 group-hover:text-blue-600 transition-colors" />
                    )}
                  </button>

                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-[100]" onClick={toggleProfileMenu}></div>
                      <div className="absolute right-0 mt-2 sm:mt-3 w-48 sm:w-56 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 z-[101] overflow-hidden animate-slideDown">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 sm:py-3">
                          <p className="text-white font-semibold text-xs sm:text-sm">Account Settings</p>
                        </div>
                        <ul className="py-1 sm:py-2">
                          <li>
                            <Link href="/components/updateProfile" legacyBehavior>
                              <a className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 transition text-gray-700 font-medium text-sm">
                                <FaUserCircle className="text-blue-600 flex-shrink-0" />
                                <span>Update Profile</span>
                              </a>
                            </Link>
                          </li>
                          <li className="border-t border-gray-100">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-red-50 transition text-red-600 font-medium text-sm"
                            >
                              <FaSignOutAlt className="flex-shrink-0" />
                              <span>Logout</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {navigationCards.filter(card => card.show).map((card, index) => {
            const Icon = card.icon;
            const cardWrapperClass = card.isAdminCard 
              ? "bg-gradient-to-br from-indigo-50/40 to-white/90 border-indigo-100 shadow-lg hover:shadow-indigo-200/60" 
              : "bg-white/80 border-gray-200/50 shadow-lg hover:shadow-xl";

            const titleClass = card.isAdminCard ? "group-hover:text-indigo-600" : "group-hover:text-blue-600";
            const arrowClass = card.isAdminCard ? "group-hover:text-indigo-600" : "group-hover:text-blue-600";

            return (
              <Link
                key={card.title}
                href={card.href}
                className={`group relative backdrop-blur-xl rounded-xl sm:rounded-2xl border overflow-hidden transition-all duration-500 hover:-translate-y-2 ${cardWrapperClass}`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  opacity: 0
                }}
              >
                {card.isAdminCard && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100/80 text-indigo-700 text-[10px] uppercase tracking-wider font-bold rounded-full border border-indigo-200/50 z-10 shadow-sm backdrop-blur-sm">
                    <FaUserShield className="text-[10px]" />
                    Admin
                  </div>
                )}

                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                <div className={`h-1 sm:h-1.5 bg-gradient-to-r ${card.gradient}`}></div>
                
                <div className="relative p-4 sm:p-5 lg:p-6">
                  <div className={`mb-3 sm:mb-4 h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 rounded-lg sm:rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-500`}>
                    <Icon className="text-xl sm:text-2xl text-white" />
                  </div>
                  <h3 className={`text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2 transition-colors duration-300 ${titleClass}`}>
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mb-3 sm:mb-4">
                    {card.description}
                  </p>
                  <div className={`flex items-center text-gray-400 transition-colors duration-300 ${arrowClass}`}>
                    <span className="text-xs sm:text-sm font-semibold">Access</span>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div className={`h-0.5 sm:h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500 font-medium">Powered by Kiotel</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
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