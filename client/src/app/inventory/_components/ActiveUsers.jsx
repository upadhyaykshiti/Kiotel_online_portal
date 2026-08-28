"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// Generates a consistent color for a userId
const USER_COLORS = [
  "#4F46E5", "#7C3AED", "#DB2777", "#DC2626",
  "#D97706", "#059669", "#0284C7", "#0891B2",
];

function colorForUser(userId) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * ActiveUsers component
 * Shows avatar circles of all users currently viewing this doc/sheet.
 *
 * Props:
 *   entityType  — "document" | "sheet"
 *   entityId    — doc or sheet id
 *   userId      — current user's account_no
 *   userName    — current user's name
 */
export default function ActiveUsers({ entityType, entityId, userId, userName }) {
  const [users, setUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!entityId || !userId) return;

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("presence:join", {
        entityType,
        entityId,
        userId,
        userName: userName || userId,
      });
    });

    socket.on("presence:update", ({ users: updatedUsers }) => {
      setUsers(updatedUsers);
    });

    return () => {
      socket.emit("presence:leave");
      socket.disconnect();
    };
  }, [entityType, entityId, userId, userName]);

  if (users.length === 0) return null;

  const MAX_VISIBLE = 4;
  const visible = users.slice(0, MAX_VISIBLE);
  const overflow = users.length - MAX_VISIBLE;

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        {visible.map((u) => (
          <div
            key={u.userId}
            title={u.userName}
            className="relative w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold shadow-sm cursor-default select-none"
            style={{ backgroundColor: colorForUser(u.userId) }}
          >
            {getInitials(u.userName)}
            {/* Green dot for current user */}
            {u.userId === userId && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
            )}
          </div>
        ))}
        {overflow > 0 && (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold shadow-sm">
            +{overflow}
          </div>
        )}
      </div>
      {users.length === 1 && (
        <span className="text-xs text-gray-400 ml-1">Only you</span>
      )}
    </div>
  );
}