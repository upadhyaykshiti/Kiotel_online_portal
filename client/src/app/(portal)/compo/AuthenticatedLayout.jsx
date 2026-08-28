"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "./SocketProvider";
import Newsfeed from "./Newsfeed";
import toast from "react-hot-toast";

export default function AuthenticatedLayout({ children }) {
  const { 
    socket, userUniqueID, userFname, onlineUsers, 
    setActiveChatUser, unreadPerUser, featureFlags 
  } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("live"); 
  const [recentChats, setRecentChats] = useState([]);

  // --- NEW: Mobile Navigation State ---
  const [mobileTab, setMobileTab] = useState("home"); // 'home', 'directory', 'newsfeed'

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

  const fetchRecentChats = async () => {
    if (!userUniqueID) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/chat/recent/${userUniqueID}`, { withCredentials: true });
      setRecentChats(res.data);
    } catch (err) {}
  };

  useEffect(() => { fetchRecentChats(); }, [userUniqueID, API_BASE_URL]);

  useEffect(() => {
    if (!socket) return;
    const handleChatUpdate = () => fetchRecentChats();
    socket.on("receive_message", handleChatUpdate);
    socket.on("message_sent_success", handleChatUpdate);
    return () => {
      socket.off("receive_message", handleChatUpdate);
      socket.off("message_sent_success", handleChatUpdate);
    };
  }, [socket, userUniqueID]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/chat-users/search?q=${searchQuery}`, { withCredentials: true });
        setSearchResults(res.data.filter(u => String(u.userId) !== String(userUniqueID)));
      } catch (err) {} finally { setIsSearching(false); }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, userUniqueID, API_BASE_URL]);

  const handlePing = (e, targetUserId) => {
    e.stopPropagation(); 
    if (socket) {
      socket.emit("send_ping", { targetUserId, fromName: userFname });
      socket.emit("send_message", { receiverId: targetUserId, message: "🔔 Pinged you!", senderName: userFname });
      toast.success("Ping sent!", { position: "bottom-right", duration: 2000 });
    }
  };

  const handleHideChat = async (e, otherUserId) => {
    e.stopPropagation();
    try {
      await axios.put(`${API_BASE_URL}/api/chat/hide-chat`, { userId: userUniqueID, otherUserId }, { withCredentials: true });
      setRecentChats(prev => prev.filter(c => String(c.other_user_id) !== String(otherUserId)));
    } catch (err) { }
  };

  const getUnreadCount = (userId) => unreadPerUser.find(u => String(u.sender_id) === String(userId))?.count || 0;
  const displayLiveUsers = onlineUsers.filter(u => String(u.userId) !== String(userUniqueID));
  
  // Calculate total unread for the mobile badge
  const totalUnread = unreadPerUser.reduce((acc, curr) => acc + curr.count, 0);

  const renderAvatar = (name, profilePic, isOnline) => (
    <div className="relative flex-shrink-0 mr-3">
      {profilePic ? (
        <img src={profilePic} alt={name} className="h-10 w-10 md:h-8 md:w-8 rounded-full object-cover border border-gray-200 shadow-sm bg-white" />
      ) : (
        <div className="h-10 w-10 md:h-8 md:w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm border border-blue-50">
          {name?.charAt(0)?.toUpperCase()}
        </div>
      )}
      <span className="absolute bottom-0 right-0 flex h-3 w-3 md:h-2.5 md:w-2.5">
        {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
        <span className={`relative inline-flex rounded-full h-3 w-3 md:h-2.5 md:w-2.5 border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
      </span>
    </div>
  );

  // --- REUSABLE DIRECTORY CONTENT (For Desktop Sidebar AND Mobile Tab) ---
  const renderDirectoryContent = () => (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="p-4 border-b bg-white">
        <div className="font-bold text-xl text-blue-600 mb-3 hidden md:block">Directory</div>
        <div className="font-bold text-2xl text-gray-900 mb-4 md:hidden">Contacts</div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
          <input 
            type="text" placeholder="Search users to chat..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {!searchQuery.trim() && (
        <div className="flex border-b text-sm font-semibold bg-white">
          <button onClick={() => setActiveTab("live")} className={`flex-1 py-3.5 transition-colors ${activeTab === 'live' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>Live Agents</button>
          <button onClick={() => setActiveTab("recent")} className={`flex-1 py-3.5 transition-colors ${activeTab === 'recent' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>Recent Chats</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-1 bg-slate-50/50 pb-20 md:pb-3">
        {searchQuery.trim() ? (
          isSearching ? <div className="text-sm text-gray-500 text-center py-6">Searching...</div> : 
          searchResults.length === 0 ? <div className="text-sm text-gray-500 text-center py-6">No users found.</div> : 
          searchResults.map(user => {
            const isOnline = onlineUsers.some(ou => String(ou.userId) === String(user.userId));
            const unread = getUnreadCount(user.userId);
            return (
              <div key={user.userId} onClick={() => setActiveChatUser({ userId: user.userId, name: user.name, profilePic: user.profile_pic })} className="flex items-center justify-between p-3 md:p-2 bg-white hover:bg-blue-50 rounded-xl md:rounded-lg border border-gray-100 hover:border-blue-100 cursor-pointer shadow-sm md:shadow-none group transition-all">
                <div className="flex items-center overflow-hidden">
                  {renderAvatar(user.name, user.profile_pic, isOnline)}
                  <span className={`text-[15px] md:text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{user.name}</span>
                  {unread > 0 && <span className="ml-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unread}</span>}
                </div>
                {isOnline && <button onClick={(e) => handlePing(e, user.userId)} className="text-[12px] md:text-[11px] bg-blue-50 text-blue-600 px-3 md:px-2 py-1.5 md:py-1 rounded-lg md:rounded-md hover:bg-blue-600 hover:text-white font-semibold">Ping</button>}
              </div>
            );
          })
        ) : 
        activeTab === 'live' ? (
          displayLiveUsers.length === 0 ? <div className="text-sm text-gray-500 text-center py-6">No one else is online.</div> : 
          displayLiveUsers.map(user => {
            const unread = getUnreadCount(user.userId);
            return (
              <div key={user.userId} onClick={() => setActiveChatUser({ userId: user.userId, name: user.name, profilePic: user.profilePic || user.profile_pic })} className="flex items-center justify-between p-3 md:p-2 bg-white hover:bg-blue-50 rounded-xl md:rounded-lg border border-gray-100 hover:border-blue-100 cursor-pointer shadow-sm md:shadow-none group transition-all mb-1">
                <div className="flex items-center overflow-hidden">
                  {renderAvatar(user.name, user.profilePic || user.profile_pic, true)}
                  <span className={`text-[15px] md:text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{user.name}</span>
                  {unread > 0 && <span className="ml-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unread}</span>}
                </div>
                <button onClick={(e) => handlePing(e, user.userId)} className="text-[12px] md:text-[11px] bg-blue-50 text-blue-600 px-3 md:px-2 py-1.5 md:py-1 rounded-lg md:rounded-md hover:bg-blue-600 hover:text-white font-semibold">Ping</button>
              </div>
            );
          })
        ) : (
          recentChats.length === 0 ? <div className="text-sm text-gray-500 text-center py-6">No recent chats.</div> : 
          recentChats.map(chat => {
            const isOnline = onlineUsers.some(ou => String(ou.userId) === String(chat.other_user_id));
            const fullName = `${chat.fname} ${chat.lname}`;
            const unread = getUnreadCount(chat.other_user_id);
            
            return (
              <div key={chat.conv_id} onClick={() => setActiveChatUser({ userId: chat.other_user_id, name: fullName, profilePic: chat.profile_pic })} className="flex items-center justify-between p-3 md:p-2 bg-white hover:bg-blue-50 rounded-xl md:rounded-lg border border-gray-100 hover:border-blue-100 cursor-pointer shadow-sm md:shadow-none group transition-all mb-2 md:mb-1">
                <div className="flex items-center flex-1 overflow-hidden pr-2">
                  {renderAvatar(fullName, chat.profile_pic, isOnline)}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[15px] md:text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>{fullName}</span>
                      {unread > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{unread}</span>}
                    </div>
                    <span className={`text-[13px] md:text-xs truncate mt-0.5 ${unread > 0 ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>{chat.last_message || "Started a chat"}</span>
                  </div>
                </div>
                <button onClick={(e) => handleHideChat(e, chat.other_user_id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-2 md:px-2 md:py-1 transition-all" title="Hide Chat">✕</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    // Added pb-[70px] on mobile to prevent content from hiding behind the new bottom nav
    <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-50 relative pb-[65px] md:pb-0">
      
      {/* DESKTOP: Left Sidebar */}
      {featureFlags?.media_share && (
        <aside className="w-[300px] bg-white border-r shadow-sm hidden lg:flex flex-col z-10">
          {renderDirectoryContent()}
        </aside>
      )}

      {/* DYNAMIC CONTENT AREA */}
      
      {/* 1. Dashboard (Always visible on Desktop. On mobile, visible only if 'home' is selected) */}
      <main className={`flex-1 overflow-y-auto relative ${mobileTab !== 'home' ? 'hidden md:block' : 'block'}`}>
        {children}
      </main>

      {/* 2. Mobile Directory View */}
      {mobileTab === 'directory' && featureFlags?.media_share && (
        <main className="flex-1 overflow-hidden relative md:hidden w-full bg-white z-0">
          {renderDirectoryContent()}
        </main>
      )}

      {/* 3. Mobile Newsfeed View */}
      {mobileTab === 'newsfeed' && featureFlags?.media_share && (
        <main className="flex-1 overflow-y-auto relative md:hidden w-full bg-slate-100 pb-10 z-0">
          <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-center sticky top-0 z-10 border-b">
            <h1 className="text-xl font-bold text-gray-900">Company Wall</h1>
          </div>
          <Newsfeed />
        </main>
      )}

      {/* DESKTOP: Right Sidebar (Newsfeed) */}
      {featureFlags?.media_share && (
        <aside className="w-[320px] bg-white border-l shadow-sm hidden md:flex flex-col z-10">
          <div className="p-4 border-b bg-white sticky top-0 z-10 flex items-center gap-2">
            <span className="text-xl">📰</span>
            <span className="font-bold text-lg text-gray-900">Newsfeed</span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50/50">
            <Newsfeed />
          </div>
        </aside>
      )}

      {/* --- NEW: MOBILE BOTTOM NAVIGATION BAR --- */}
      {featureFlags?.media_share && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full h-[65px] bg-white/90 backdrop-blur-lg border-t border-gray-200 flex justify-around items-center z-[5000] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button onClick={() => setMobileTab('home')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${mobileTab === 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <span className="text-2xl mb-1">🏠</span>
            <span className="text-[10px] font-bold tracking-wide">Home</span>
          </button>
          
          <button onClick={() => setMobileTab('directory')} className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${mobileTab === 'directory' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <div className="relative">
              <span className="text-2xl mb-1 block">💬</span>
              {totalUnread > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">{totalUnread}</span>}
            </div>
            <span className="text-[10px] font-bold tracking-wide">Chats</span>
          </button>
          
          <button onClick={() => setMobileTab('newsfeed')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${mobileTab === 'newsfeed' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <span className="text-2xl mb-1">📰</span>
            <span className="text-[10px] font-bold tracking-wide">Feed</span>
          </button>
        </nav>
      )}

    </div>
  );
}