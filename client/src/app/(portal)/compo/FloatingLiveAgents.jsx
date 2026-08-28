"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "./SocketProvider";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

export default function FloatingLiveAgents() {
  const { 
    socket, userUniqueID, userFname, onlineUsers, 
    setActiveChatUser, unreadCount, unreadPerUser 
  } = useAppContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("live");
  const [recentChats, setRecentChats] = useState([]);
  
  const pathname = usePathname();
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

  const isPublicRoute = pathname === "/" || pathname === "/login";
  const isDashboard = pathname?.startsWith("/Dashboard");
  
  const fetchRecentChats = async () => {
    if (!userUniqueID) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/chat/recent/${userUniqueID}`, { withCredentials: true });
      setRecentChats(res.data);
    } catch (err) {}
  };

  useEffect(() => { fetchRecentChats(); }, [isOpen, userUniqueID, API_BASE_URL]);

  useEffect(() => {
    if (!socket || !isOpen) return;
    const handleChatUpdate = () => fetchRecentChats();
    socket.on("receive_message", handleChatUpdate);
    socket.on("message_sent_success", handleChatUpdate);
    return () => {
      socket.off("receive_message", handleChatUpdate);
      socket.off("message_sent_success", handleChatUpdate);
    };
  }, [socket, isOpen]);

  if (!userUniqueID || isPublicRoute || isDashboard) return null;

  const handlePing = (e, targetUserId) => {
    e.stopPropagation();
    if (socket) {
      socket.emit("send_ping", { targetUserId, fromName: userFname });
      toast.success("Ping sent!", { position: "bottom-right", duration: 2000 });
    }
  };

  const handleHideChat = async (e, otherUserId) => {
    e.stopPropagation();
    try {
      await axios.put(`${API_BASE_URL}/api/chat/hide-chat`, { userId: userUniqueID, otherUserId }, { withCredentials: true });
      setRecentChats(prev => prev.filter(c => String(c.other_user_id) !== String(otherUserId)));
    } catch (err) {}
  };

  const getUnreadCount = (userId) => unreadPerUser.find(u => String(u.sender_id) === String(userId))?.count || 0;
  const safeOnlineUsers = onlineUsers || [];
  const otherUsersCount = safeOnlineUsers.filter(u => String(u.userId) !== String(userUniqueID)).length;

  const renderAvatar = (name, profilePic, isOnline) => (
    <div className="relative flex-shrink-0 mr-2.5">
      {profilePic ? (
        <img src={profilePic} alt={name} className="h-8 w-8 rounded-full object-cover border border-gray-200 shadow-sm" />
      ) : (
        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm border border-blue-50">
          {name?.charAt(0)?.toUpperCase()}
        </div>
      )}
      <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
        {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 border border-white ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
      </span>
    </div>
  );

  return (
    // HIDDEN ON MOBILE (md:block) because mobile uses the Bottom Navigation Tab!
    <div className="fixed bottom-6 right-6 z-50 font-sans hidden md:block">
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-3 bg-blue-600 text-white font-bold flex justify-between items-center">
            <span>Directory</span>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200 font-bold px-2">✕</button>
          </div>
          
          <div className="flex border-b text-sm font-semibold">
            <button onClick={() => setActiveTab("live")} className={`flex-1 py-2 ${activeTab === 'live' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>Live ({otherUsersCount})</button>
            <button onClick={() => setActiveTab("quick")} className={`flex-1 py-2 ${activeTab === 'quick' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>Quick Chats</button>
          </div>

          <div className="max-h-72 overflow-y-auto p-2 bg-slate-50">
            {activeTab === 'live' && safeOnlineUsers.map(user => {
              const isCurrentUser = String(user.userId) === String(userUniqueID);
              if (isCurrentUser) return null;
              
              const unread = getUnreadCount(user.userId);
              return (
                <div key={user.userId} onClick={() => setActiveChatUser({ userId: user.userId, name: user.name, profilePic: user.profilePic || user.profile_pic })} className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 mb-1.5 cursor-pointer hover:bg-blue-50 transition-colors">
                  <div className="flex items-center overflow-hidden">
                    {renderAvatar(user.name, user.profilePic || user.profile_pic, true)}
                    <span className={`text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{user.name}</span>
                    {unread > 0 && <span className="ml-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>}
                  </div>
                  <button onClick={(e) => handlePing(e, user.userId)} className="text-[11px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-600 hover:text-white font-semibold">Ping</button>
                </div>
              );
            })}

            {activeTab === 'quick' && recentChats.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No recent chats.</p>}
            {activeTab === 'quick' && recentChats.map(chat => {
              const unread = getUnreadCount(chat.other_user_id);
              const fullName = `${chat.fname} ${chat.lname}`;
              const isOnline = safeOnlineUsers.some(ou => String(ou.userId) === String(chat.other_user_id));
              
              return (
                <div key={chat.conv_id} onClick={() => setActiveChatUser({ userId: chat.other_user_id, name: fullName, profilePic: chat.profile_pic })} className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm border border-transparent hover:border-blue-100 mb-1.5 cursor-pointer hover:bg-blue-50 transition-colors group">
                  <div className="flex items-center flex-1 overflow-hidden pr-2">
                    {renderAvatar(fullName, chat.profile_pic, isOnline)}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>{fullName}</span>
                        {unread > 0 && <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>}
                      </div>
                      <span className={`text-xs truncate ${unread > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>{chat.last_message || "Started a chat"}</span>
                    </div>
                  </div>
                  <button onClick={(e) => handleHideChat(e, chat.other_user_id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 px-1" title="Hide Chat">✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full shadow-xl hover:bg-blue-700 transition-colors relative ml-auto focus:outline-none">
        <span className="text-2xl">👥</span>
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">{unreadCount > 99 ? "99+" : unreadCount}</span>
        ) : otherUsersCount > 0 ? (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">{otherUsersCount > 99 ? "99+" : otherUsersCount}</span>
        ) : null}
      </button>
    </div>
  );
}