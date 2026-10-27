

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Navbar({ userFname }) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString("en-US", { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      // sessionStorage.removeItem("hasSeenAnnouncement");
      
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

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50 shadow-sm">
      {/* Brand / Logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Kiotel<span className="text-blue-600">.</span></h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Date & Time */}
        <div className="hidden sm:flex items-center text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {currentTime}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-xl border border-transparent hover:border-gray-200 transition-all focus:outline-none"
          >
            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200 shadow-sm">
              {userFname?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">{userFname}</span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              {/* Invisible backdrop to click away */}
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                </div>
                
                <button onClick={() => { setDropdownOpen(false); router.push('/components/updateProfile'); }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Update Profile
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}