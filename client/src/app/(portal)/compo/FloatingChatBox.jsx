"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Draggable from "react-draggable";
import EmojiPicker from "emoji-picker-react";
import { useAppContext } from "./SocketProvider";
import toast from "react-hot-toast";

export default function FloatingChatBox({ targetUser, onClose }) {
  const { socket, userUniqueID, userFname, setUnreadCount, setUnreadPerUser } = useAppContext();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [firstUnreadId, setFirstUnreadId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showRetentionWarning, setShowRetentionWarning] = useState(false);
  
  const [safeProfilePic, setSafeProfilePic] = useState(null);
  
  // --- NEW: Mobile Detection State ---
  const [isMobile, setIsMobile] = useState(false);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); 
  const typingTimeoutRef = useRef(null);
  const isEmittingTypingRef = useRef(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on mount
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let pic = targetUser?.profilePic || targetUser?.profile_pic || null;
    setSafeProfilePic(pic);

    if (!pic && targetUser?.name) {
      const fetchTargetProfile = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/chat-users/search?q=${targetUser.name.split(" ")[0]}`, { withCredentials: true });
          const matchedUser = res.data.find(u => String(u.userId) === String(targetUser.userId));
          if (matchedUser && matchedUser.profile_pic) {
            setSafeProfilePic(matchedUser.profile_pic);
          }
        } catch (err) {}
      };
      fetchTargetProfile();
    }
  }, [targetUser, API_BASE_URL]);

  useEffect(() => {
    const hasSeenWarning = localStorage.getItem("chat_retention_warning_seen");
    if (!hasSeenWarning) setShowRetentionWarning(true);
  }, []);

  const dismissRetentionWarning = () => {
    localStorage.setItem("chat_retention_warning_seen", "true");
    setShowRetentionWarning(false);
  };

  const scrollToBottom = (behavior = "auto") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  const fetchHistory = async (pageNum, isInitial = false) => {
    if (!hasMore && !isInitial) return;
    setIsLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/chat/${userUniqueID}/${targetUser.userId}?page=${pageNum}&limit=50`, { withCredentials: true });
      const fetchedMessages = res.data;
      if (fetchedMessages.length < 50) setHasMore(false);

      if (isInitial) {
        setMessages(fetchedMessages);
        const firstUnread = fetchedMessages.find(m => String(m.sender_id) === String(targetUser.userId) && !m.is_read);
        if (firstUnread) setFirstUnreadId(firstUnread.id);
        
        await axios.put(`${API_BASE_URL}/api/chat/mark-read`, { senderId: targetUser.userId, receiverId: userUniqueID }, { withCredentials: true });
        if (socket) socket.emit("messages_read", { senderId: targetUser.userId, receiverId: userUniqueID });
        setUnreadPerUser(prev => prev.filter(u => String(u.sender_id) !== String(targetUser.userId)));
        
        setTimeout(() => scrollToBottom(), 100);
      } else {
        const container = messagesContainerRef.current;
        const scrollHeightBefore = container.scrollHeight;
        setMessages(prev => [...fetchedMessages, ...prev]);
        setTimeout(() => { container.scrollTop = container.scrollHeight - scrollHeightBefore; }, 0);
      }
    } catch (err) {} finally { setIsLoadingHistory(false); }
  };

  useEffect(() => {
    if (targetUser && userUniqueID) fetchHistory(1, true);
  }, [targetUser, userUniqueID]);

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMore && !isLoadingHistory) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(nextPage, false);
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = async (msg) => {
      if (String(msg.sender_id) === String(targetUser.userId) || String(msg.receiver_id) === String(targetUser.userId)) {
        setMessages((prev) => [...prev, msg]);
        setIsTyping(false);
        setTimeout(() => scrollToBottom("smooth"), 50);
        if (String(msg.sender_id) === String(targetUser.userId)) {
          try {
            await axios.put(`${API_BASE_URL}/api/chat/mark-read`, { senderId: targetUser.userId, receiverId: userUniqueID }, { withCredentials: true });
            socket.emit("messages_read", { senderId: targetUser.userId, receiverId: userUniqueID });
          } catch (e) {}
        }
      }
    };
    const handleReceiptUpdate = (data) => {
        if (String(data.readerId) === String(targetUser.userId)) {
            setMessages(prev => prev.map(m => String(m.sender_id) === String(userUniqueID) ? { ...m, is_read: true } : m));
        }
    };
    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_sent_success", handleReceiveMessage);
    socket.on("receipt_read_update", handleReceiptUpdate);
    socket.on("user_typing", (data) => { if (String(data.senderId) === String(targetUser.userId)) setIsTyping(true); setTimeout(() => scrollToBottom("smooth"), 50); });
    socket.on("user_stopped_typing", (data) => { if (String(data.senderId) === String(targetUser.userId)) setIsTyping(false); });

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_sent_success", handleReceiveMessage);
      socket.off("receipt_read_update", handleReceiptUpdate);
    };
  }, [socket, targetUser.userId, userUniqueID]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (socket) {
      if (!isEmittingTypingRef.current) {
        socket.emit("typing_start", { receiverId: targetUser.userId });
        isEmittingTypingRef.current = true;
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing_end", { receiverId: targetUser.userId });
        isEmittingTypingRef.current = false;
      }, 2000);
    }
  };

  const handleEmojiClick = (emojiObject) => setNewMessage((prev) => prev + emojiObject.emoji);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error("File is too large (Max 10MB)");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat/api/upload-media`, formData, { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true });
      socket.emit("send_message", { receiverId: targetUser.userId, message: newMessage || "Sent an attachment", senderName: userFname, attachmentUrl: res.data.url, attachmentType: res.data.type });
      setNewMessage("");
      setShowEmojiPicker(false);
      setTimeout(() => scrollToBottom("smooth"), 50);
    } catch (err) { toast.error("Failed to upload file"); } finally { setIsUploading(false); e.target.value = ""; }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !isUploading) return;
    if (socket && newMessage.trim()) socket.emit("send_message", { receiverId: targetUser.userId, message: newMessage, senderName: userFname });
    socket.emit("typing_end", { receiverId: targetUser.userId });
    isEmittingTypingRef.current = false; 
    setNewMessage("");
    setShowEmojiPicker(false);
    setTimeout(() => scrollToBottom("smooth"), 50);
  };

  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };
  let lastDateLabel = "";

  // --- THE UI CORE ---
  const ChatContent = (
    <div className={`${isMobile ? 'fixed inset-0 w-full h-[100dvh] rounded-none z-[99999]' : 'fixed bottom-0 right-0 w-[340px] h-[440px] rounded-xl z-[9999] shadow-[0_5px_25px_rgba(0,0,0,0.15)] border border-gray-200'} bg-white flex flex-col font-sans overflow-hidden`}>
      
      {/* HEADER */}
      <div className={`chat-header bg-blue-600 text-white p-3 md:p-3 flex justify-between items-center shadow-sm hover:bg-blue-700 transition-colors z-20 ${isMobile ? 'rounded-none cursor-default pt-safe-top' : 'rounded-t-xl cursor-move'}`}>
        <div className="flex items-center gap-3 select-none flex-1">
          {/* Mobile Back Button */}
          {isMobile && (
             <button onClick={onClose} className="mr-1 p-1 hover:bg-white/20 rounded-full transition-colors">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
             </button>
          )}

          {safeProfilePic ? (
            <img src={safeProfilePic} alt={targetUser.name} className="w-10 h-10 md:w-8 md:h-8 rounded-full object-cover border-2 border-white/30 shadow-sm bg-white" />
          ) : (
            <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg md:text-sm border-2 border-white/30">
              {targetUser.name?.charAt(0)}
            </div>
          )}
          
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-[17px] md:text-[15px] leading-tight tracking-wide truncate">{targetUser.name}</span>
            {isTyping ? (
              <span className="text-xs md:text-[11px] text-blue-200 mt-0.5 italic animate-pulse">typing...</span>
            ) : (
              <span className="text-xs md:text-[11px] text-blue-200 mt-0.5 opacity-0">spacer</span>
            )}
          </div>
        </div>
        
        {/* Desktop Close Button */}
        {!isMobile && (
          <button onMouseDown={(e) => e.stopPropagation()} onClick={onClose} className="hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors focus:outline-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
      </div>

      {showRetentionWarning && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 z-10 relative shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 text-lg mt-0.5">ℹ️</span>
            <div>
              <h3 className="text-sm font-bold text-yellow-800">Notice: Disappearing Messages</h3>
              <p className="mt-1 text-[11px] text-yellow-700 leading-tight">Older messages are automatically deleted. To protect your privacy, all chats will self-destruct after 24 hours.</p>
              <button onClick={dismissRetentionWarning} className="mt-2 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 text-[11px] font-bold py-1 px-3 rounded transition-colors">Got it!</button>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGES AREA */}
      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 bg-[#efeae2] relative" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
        {isLoadingHistory && <div className="text-center text-xs text-gray-500 my-2 animate-pulse">Loading...</div>}

        {!hasMore && !isLoadingHistory && (
           <div className="flex justify-center mb-6 mt-2">
             <div className="bg-[#fff3c4] text-[#856404] text-[11px] md:text-[10.5px] px-4 md:px-3 py-2 rounded-lg shadow-[0_1px_1px_rgba(0,0,0,0.1)] text-center max-w-[90%] leading-snug">
               🔒 <b>Secure Chat</b><br/>Messages automatically disappear after 24 hours.
             </div>
           </div>
        )}

        {messages.map((msg, index) => {
          const isMe = String(msg.sender_id) === String(userUniqueID);
          const showUnreadDivider = firstUnreadId === msg.id;
          const currentDateLabel = formatDateLabel(msg.created_at);
          const showDateHeader = currentDateLabel !== lastDateLabel;
          lastDateLabel = currentDateLabel;

          return (
            <React.Fragment key={msg.id || index}>
              {showDateHeader && (
                <div className="flex justify-center my-3">
                  <span className="bg-white/90 backdrop-blur-sm shadow-sm text-gray-600 text-xs md:text-[11px] font-bold px-3 py-1 rounded-lg tracking-wide">{currentDateLabel}</span>
                </div>
              )}
              {showUnreadDivider && (
                <div className="flex items-center justify-center my-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink-0 px-3 py-0.5 text-[10px] font-bold text-gray-500 bg-white/50 rounded-full mx-2 uppercase tracking-wider shadow-sm">Unread Messages</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              )}

              <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3`}>
                <div className={`relative max-w-[85%] px-3 md:px-2.5 py-2 md:py-1.5 rounded-xl md:rounded-lg text-[15px] md:text-[14.5px] shadow-[0_1px_1px_rgba(0,0,0,0.1)] ${isMe ? "bg-[#dcf8c6] rounded-tr-none" : "bg-white rounded-tl-none"}`}>
                  
                  {msg.attachment_url && (
                    <div className="mb-1 mt-1 rounded overflow-hidden">
                      {msg.attachment_type?.includes('image') ? (
                        <img src={msg.attachment_url} alt="attachment" className="max-w-full h-auto rounded max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.attachment_url, '_blank')} />
                      ) : msg.attachment_type?.includes('pdf') ? (
                        <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/5 p-2 rounded text-sm font-semibold text-red-600 hover:bg-black/10">📄 View PDF</a>
                      ) : (
                        <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/5 p-2 rounded text-sm text-blue-600 hover:underline">📁 Download File</a>
                      )}
                    </div>
                  )}

                  <span className="text-gray-900 break-words leading-snug">
                    {msg.message !== "Sent an attachment" && msg.message}
                    <span className="inline-block w-[3.8rem] h-1"></span>
                  </span>
                  
                  <div className="absolute bottom-1 right-2 flex items-center gap-1">
                    <span className="text-[10px] text-gray-500 font-medium">{formatTime(msg.created_at)}</span>
                    {isMe && (
                        <span className="flex items-center justify-center h-full mb-[1px]">
                            {msg.is_read ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline><polyline points="20 12 15 17 10 12" className="opacity-50"></polyline></svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            )}
                        </span>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        
        {isUploading && (
           <div className="flex justify-center mb-2">
              <div className="text-[11px] text-gray-600 bg-white/70 px-3 py-1 rounded-full animate-pulse shadow-sm font-medium">Uploading file...</div>
           </div>
        )}
        {isTyping && !isUploading && (
          <div className="flex justify-start mb-2">
            <div className="bg-white px-3 py-2.5 rounded-xl rounded-tl-none shadow-[0_1px_1px_rgba(0,0,0,0.1)] flex gap-1.5 items-center w-[46px] h-[32px]">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* INPUT AREA */}
      <div className="p-2 md:p-2 border-t border-gray-200 bg-[#f0f2f5] flex flex-col relative z-20 pb-safe">
        {showEmojiPicker && (
          <div className="absolute bottom-[100%] left-2 z-50 mb-2 shadow-xl rounded-lg overflow-hidden border border-gray-200 bg-white">
            <EmojiPicker onEmojiClick={handleEmojiClick} width={isMobile ? window.innerWidth - 16 : 280} height={350} searchDisabled skinTonesDisabled />
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <div className="flex gap-1 mb-1">
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-500 hover:text-gray-700 p-2 md:p-1.5 transition-colors focus:outline-none">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-gray-700 p-2 md:p-1.5 transition-colors transform hover:rotate-12 focus:outline-none">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            </button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/jpeg, image/png, image/webp, image/gif, application/pdf" />
          <textarea 
            className="flex-1 max-h-24 min-h-[44px] md:min-h-[40px] resize-none border-none rounded-2xl md:rounded-xl px-4 py-3 md:py-2.5 text-[15px] md:text-sm focus:outline-none shadow-sm custom-scrollbar bg-white" 
            placeholder="Type a message..." value={newMessage} onChange={handleInputChange} onClick={() => setShowEmojiPicker(false)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isMobile) { e.preventDefault(); handleSendMessage(e); } }} rows="1"
          />
          <button type="submit" disabled={(!newMessage.trim() && !isUploading)} className="bg-blue-500 text-white rounded-full w-11 h-11 md:w-10 md:h-10 flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-sm shrink-0 mb-[1px] focus:outline-none">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className="ml-1 md:w-5 md:h-5"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
          </button>
        </form>
      </div>
    </div>
  );

  // If Mobile, render standard div. If Desktop, wrap in Draggable.
  return isMobile ? ChatContent : (
    <Draggable handle=".chat-header" bounds="body" defaultPosition={{x: -30, y: -30}}>
      {ChatContent}
    </Draggable>
  );
}