"use client";

import React, { useEffect, useState, createContext, useContext, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Toaster, toast } from "react-hot-toast";
import { usePathname } from "next/navigation";
import FloatingLiveAgents from "./FloatingLiveAgents";
import FloatingChatBox from "./FloatingChatBox";

export const AppContext = createContext();

export default function SocketProvider({ children }) {
  const [userFname, setUserFname] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userUniqueID, setUserUniqueID] = useState("");
  const [userProfilePic, setUserProfilePic] = useState(null); // NEW: Store profile picture
  
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); 
  const [unreadPerUser, setUnreadPerUser] = useState([]); 
  const [featureFlags, setFeatureFlags] = useState({});

  const activeChatUserRef = useRef(null);
  useEffect(() => {
    activeChatUserRef.current = activeChatUser;
  }, [activeChatUser]);

  const pathname = usePathname();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

  // 1. Session & Initial Data Fetch
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, { withCredentials: true });
        
        if (isMounted) {
          setUserFname(res.data.fname || "");
          setUserRole(res.data.role || "");
          setUserUniqueID(res.data.unique_id || "");
          setUserProfilePic(res.data.profile_pic || null); // NEW: Save the picture

          if (res.data.unique_id) {
            axios.get(`${SOCKET_URL}/api/chat/unread-count/${res.data.unique_id}`, { withCredentials: true })
              .then(response => setUnreadCount(response.data.unreadTotal || 0))
              .catch(err => {});

            axios.get(`${SOCKET_URL}/api/chat/unread-per-user/${res.data.unique_id}`, { withCredentials: true })
              .then(response => setUnreadPerUser(response.data || []))
              .catch(err => {});

            axios.get(`${SOCKET_URL}/api/features/my-flags/${res.data.unique_id}`, { withCredentials: true })
              .then(response => setFeatureFlags(response.data || {}))
              .catch(err => console.error("Failed to load feature flags"));
          }
        }
      } catch (err) {
        if (isMounted) {
          setUserUniqueID("");
          setUserFname("");
          setUserRole("");
          setUserProfilePic(null);
        }
      }
    };

    verifySession();
    return () => { isMounted = false; };
  }, [pathname, API_URL]); 

  // 2. WebSocket Connection
  useEffect(() => {
    if (!userUniqueID || !featureFlags.media_share) {
       if (socket) {
          socket.disconnect();
          setSocket(null);
       }
       return; 
    }

    const newSocket = io(SOCKET_URL, {
      // NEW: Passing profilePic to the socket connection!
      query: { userId: userUniqueID, userName: userFname, profilePic: userProfilePic || "" },
      transports: ["websocket"],
      reconnection: true,
    });

    setSocket(newSocket);

    newSocket.on("online_users_update", (users) => setOnlineUsers(users || []));

    newSocket.on("receive_ping", (data) => {
      const audio = new Audio("https://actions.google.com/sounds/v1/alarms/pop_ding.ogg");
      audio.volume = 0.7;
      audio.play().catch(e => console.log("Audio play blocked by browser:", e));

      toast(`🔔 PING from ${data.fromName}!`, {
        icon: "🚨", 
        position: "top-center", 
        duration: 10000,
        style: { 
          borderRadius: "10px", 
          background: "#ef4444", 
          color: "#fff",
          fontWeight: "bold",
          padding: "16px",
          fontSize: "16px"
        },
      });
    });

    newSocket.on("receive_message", (data) => {
      if (!activeChatUserRef.current || String(activeChatUserRef.current.userId) !== String(data.sender_id)) {
        setUnreadCount(prev => prev + 1);
        
        setUnreadPerUser(prev => {
          const existing = prev.find(u => String(u.sender_id) === String(data.sender_id));
          if (existing) {
            return prev.map(u => String(u.sender_id) === String(data.sender_id) ? { ...u, count: u.count + 1 } : u);
          }
          return [...prev, { sender_id: data.sender_id, count: 1 }];
        });

        toast(`New message from ${data.senderName}!`, {
          icon: "💬", position: "top-right", duration: 4000,
          style: { borderRadius: "10px", background: "#2563eb", color: "#fff" },
        });
      }
    });

    return () => { newSocket.disconnect(); };
  }, [userUniqueID, userFname, userProfilePic, SOCKET_URL, featureFlags.media_share]); 

  useEffect(() => {
    if (socket && socket.disconnected && userUniqueID) socket.connect();
  }, [pathname, socket, userUniqueID]);

  return (
    <AppContext.Provider value={{ 
      socket, userUniqueID, userFname, userRole, onlineUsers, userProfilePic, // EXPOSED PIC
      activeChatUser, setActiveChatUser,
      unreadCount, setUnreadCount,
      unreadPerUser, setUnreadPerUser,
      featureFlags
    }}>
      {children}
      <Toaster /> 
      {featureFlags.media_share && <FloatingLiveAgents />}
      {activeChatUser && featureFlags.media_share && (
        <FloatingChatBox targetUser={activeChatUser} onClose={() => setActiveChatUser(null)} />
      )}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);