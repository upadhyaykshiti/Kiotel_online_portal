// // workspace/_components/ShareModal.jsx

// "use client";

// import { useEffect, useState } from "react";
// import { workspaceFetch } from "../_lib/workspaceApi";

// export default function ShareModal({
//   open,
//   onClose,
//   userId,
//   entityType, // "document" | "sheet"
//   entityId,   // docId or sheetId
//   canManage,  // owner only
// }) {
//   const [target, setTarget] = useState("");
//   const [role, setRole] = useState("viewer");
//   const [permissions, setPermissions] = useState([]);
//   const [status, setStatus] = useState("");
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     if (!open) return;
//     setErr("");
//     setStatus("Loading…");

//     workspaceFetch(`/api/workspace/share/${entityType}/${entityId}`, {
//       method: "GET",
//       userId,
//     })
//       .then((data) => {
//         setPermissions(data.permissions || []);
//         setStatus("");
//       })
//       .catch((e) => {
//         console.error(e);
//         setErr("Failed to load share list");
//         setStatus("");
//       });
//   }, [open, entityType, entityId, userId]);

//   async function addOrUpdate() {
//     setErr("");
//     setStatus("Saving…");
//     try {
//       const body =
//         entityType === "document"
//           ? { document_id: entityId, target_user_account_no: target, role }
//           : { sheet_id: entityId, target_user_account_no: target, role };

//       await workspaceFetch(`/api/workspace/share/${entityType}`, {
//         method: "POST",
//         userId,
//         body,
//       });

//       const data = await workspaceFetch(`/api/workspace/share/${entityType}/${entityId}`, {
//         method: "GET",
//         userId,
//       });

//       setPermissions(data.permissions || []);
//       setTarget("");
//       setRole("viewer");
//       setStatus("Saved");
//       setTimeout(() => setStatus(""), 1200);
//     } catch (e) {
//       console.error(e);
//       setErr(e.message || "Failed to share");
//       setStatus("");
//     }
//   }

//   async function removeAccess(user_account_no) {
//     setErr("");
//     setStatus("Removing…");
//     try {
//       const body =
//         entityType === "document"
//           ? { document_id: entityId, target_user_account_no: user_account_no }
//           : { sheet_id: entityId, target_user_account_no: user_account_no };

//       await workspaceFetch(`/api/workspace/share/${entityType}/remove`, {
//         method: "POST",
//         userId,
//         body,
//       });

//       const data = await workspaceFetch(`/api/workspace/share/${entityType}/${entityId}`, {
//         method: "GET",
//         userId,
//       });

//       setPermissions(data.permissions || []);
//       setStatus("");
//     } catch (e) {
//       console.error(e);
//       setErr(e.message || "Failed to remove access");
//       setStatus("");
//     }
//   }

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
//       <div className="w-full max-w-xl rounded-xl bg-white shadow">
//         <div className="flex items-center justify-between border-b p-4">
//           <div className="font-semibold">Share</div>
//           <button className="rounded border px-3 py-1" onClick={onClose}>
//             Close
//           </button>
//         </div>

//         <div className="p-4 space-y-4">
//           {!canManage && (
//             <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
//               You can view sharing, but only the owner can modify access.
//             </div>
//           )}

//           {canManage && (
//             <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
//               <input
//                 className="rounded border px-3 py-2 sm:col-span-2"
//                 placeholder="Enter account_no (UniqueID)"
//                 value={target}
//                 onChange={(e) => setTarget(e.target.value)}
//               />
//               <select
//                 className="rounded border px-3 py-2"
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//               >
//                 <option value="viewer">viewer</option>
//                 <option value="editor">editor</option>
//                 <option value="owner">owner</option>
//               </select>

//               <button
//                 className="rounded bg-gray-900 text-white px-4 py-2 sm:col-span-3 disabled:opacity-50"
//                 disabled={!target.trim()}
//                 onClick={addOrUpdate}
//               >
//                 Add / Update
//               </button>
//             </div>
//           )}

//           {(status || err) && (
//             <div className="text-sm">
//               {status && <div className="text-gray-600">{status}</div>}
//               {err && <div className="text-red-700">{err}</div>}
//             </div>
//           )}

//           <div>
//             <div className="font-medium mb-2">People with access</div>
//             <div className="space-y-2">
//               {permissions.map((p) => (
//                 <div key={p.user_account_no} className="flex items-center justify-between rounded border p-2">
//                   <div>
//                     <div className="font-mono text-sm">{p.user_account_no}</div>
//                     <div className="text-xs text-gray-600">role: {p.role}</div>
//                   </div>

//                   {canManage && p.user_account_no !== userId && (
//                     <button
//                       className="rounded border px-3 py-1 hover:bg-gray-50"
//                       onClick={() => removeAccess(p.user_account_no)}
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               ))}

//               {permissions.length === 0 && (
//                 <div className="text-sm text-gray-600">No permissions found.</div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useEffect, useState } from "react";
// import { workspaceFetch } from "../_lib/workspaceApi";

// export default function ShareModal({
//   open,
//   onClose,
//   userId,
//   entityType, // "document" | "sheet"
//   entityId,
//   canManage,  // owner only
// }) {
//   const [target, setTarget] = useState("");
//   const [role, setRole] = useState("viewer");
//   const [permissions, setPermissions] = useState([]);
//   const [status, setStatus] = useState("");
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     if (!open) return;
//     setErr("");
//     setStatus("Loading…");

//     workspaceFetch(`/api/workspace/share/${entityType}/${entityId}`, {
//       method: "GET",
//       userId,
//     })
//       .then((data) => {
//         setPermissions(data.permissions || []);
//         setStatus("");
//       })
//       .catch((e) => {
//         console.error(e);
//         setErr("Failed to load share list");
//         setStatus("");
//       });
//   }, [open, entityType, entityId, userId]);

//   async function addOrUpdate() {
//     setErr("");
//     setStatus("Saving…");
//     try {
//       const body =
//         entityType === "document"
//           ? { document_id: entityId, target_user_account_no: target, role }
//           : { sheet_id: entityId, target_user_account_no: target, role };

//       await workspaceFetch(`/api/workspace/share/${entityType}`, {
//         method: "POST",
//         userId,
//         body,
//       });

//       const data = await workspaceFetch(
//         `/api/workspace/share/${entityType}/${entityId}`,
//         { method: "GET", userId }
//       );

//       setPermissions(data.permissions || []);
//       setTarget("");
//       setRole("viewer");
//       setStatus("Saved");
//       setTimeout(() => setStatus(""), 1200);
//     } catch (e) {
//       console.error(e);
//       setErr(e.message || "Failed to share");
//       setStatus("");
//     }
//   }

//   async function removeAccess(user_account_no) {
//     setErr("");
//     setStatus("Removing…");
//     try {
//       const body =
//         entityType === "document"
//           ? { document_id: entityId, target_user_account_no: user_account_no }
//           : { sheet_id: entityId, target_user_account_no: user_account_no };

//       await workspaceFetch(`/api/workspace/share/${entityType}/remove`, {
//         method: "POST",
//         userId,
//         body,
//       });

//       const data = await workspaceFetch(
//         `/api/workspace/share/${entityType}/${entityId}`,
//         { method: "GET", userId }
//       );

//       setPermissions(data.permissions || []);
//       setStatus("");
//     } catch (e) {
//       console.error(e);
//       setErr(e.message || "Failed to remove access");
//       setStatus("");
//     }
//   }

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
//       <div className="w-full max-w-xl rounded-xl bg-white shadow">
//         <div className="flex items-center justify-between border-b p-4">
//           <div className="font-semibold">Share</div>
//           <button className="rounded border px-3 py-1" onClick={onClose}>
//             Close
//           </button>
//         </div>

//         <div className="p-4 space-y-4">
//           {!canManage && (
//             <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
//               You can view sharing, but only the owner can modify access.
//             </div>
//           )}

//           {canManage && (
//             <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
//               <input
//                 className="rounded border px-3 py-2 sm:col-span-2"
//                 placeholder="Enter account_no (UniqueID)"
//                 value={target}
//                 onChange={(e) => setTarget(e.target.value)}
//               />
//               <select
//                 className="rounded border px-3 py-2"
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//               >
//                 <option value="viewer">viewer</option>
//                 <option value="editor">editor</option>
//                 <option value="owner">owner</option>
//               </select>

//               <button
//                 className="rounded bg-gray-900 text-white px-4 py-2 sm:col-span-3 disabled:opacity-50"
//                 disabled={!target.trim()}
//                 onClick={addOrUpdate}
//               >
//                 Add / Update
//               </button>
//             </div>
//           )}

//           {(status || err) && (
//             <div className="text-sm">
//               {status && <div className="text-gray-600">{status}</div>}
//               {err && <div className="text-red-700">{err}</div>}
//             </div>
//           )}

//           <div>
//             <div className="font-medium mb-2">People with access</div>
//             <div className="space-y-2">
//               {permissions.map((p) => (
//                 <div
//                   key={p.user_account_no}
//                   className="flex items-center justify-between rounded border p-2"
//                 >
//                   <div>
//                     {/* Change 9: show name/email if available, fallback to account_no */}
//                     <div className="text-sm font-medium">
//                       {p.name || p.user_account_no}
//                     </div>
//                     {p.email && (
//                       <div className="text-xs text-gray-500">{p.email}</div>
//                     )}
//                     <div className="text-xs text-gray-600">role: {p.role}</div>
//                   </div>

//                   {canManage && p.user_account_no !== userId && (
//                     <button
//                       className="rounded border px-3 py-1 hover:bg-gray-50"
//                       onClick={() => removeAccess(p.user_account_no)}
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               ))}

//               {permissions.length === 0 && (
//                 <div className="text-sm text-gray-600">No permissions found.</div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState, useRef } from "react";
import { workspaceFetch } from "../_lib/workspaceApi";

export default function ShareModal({
  open,
  onClose,
  userId,
  entityType,
  entityId,
  canManage,
}) {
  const [permissions, setPermissions] = useState([]);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [shareWithAll, setShareWithAll] = useState(false);
  const [role, setRole] = useState("viewer");
  const [isSearching, setIsSearching] = useState(false);
  
  const searchRef = useRef(null);

  // 1. Load existing permissions when modal opens
  useEffect(() => {
    if (!open) return;
    setErr("");
    setStatus("Loading…");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);
    setShareWithAll(false);

    workspaceFetch(`/api/workspace/share/${entityType}/${entityId}`, {
      method: "GET",
      userId,
    })
      .then((data) => {
        setPermissions(data.permissions || []);
        setStatus("");
      })
      .catch((e) => {
        setErr("Failed to load share list");
        setStatus("");
      });
  }, [open, entityType, entityId, userId]);

  // 2. Debounced Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await workspaceFetch(
          `/api/workspace/share/users/search?q=${encodeURIComponent(searchQuery)}`,
          { method: "GET", userId }
        );
        // Filter out users who already have access or are selected
        const existingIds = new Set([
          ...permissions.map(p => p.user_account_no),
          ...selectedUsers.map(u => u.account_no),
          userId // exclude self
        ]);
        
        setSearchResults(data.users.filter(u => !existingIds.has(u.account_no)));
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, permissions, selectedUsers, userId]);

  // Close search dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addUser(user) {
    setSelectedUsers((prev) => [...prev, user]);
    setSearchQuery("");
    setSearchResults([]);
  }

  function removeUser(account_no) {
    setSelectedUsers((prev) => prev.filter((u) => u.account_no !== account_no));
  }

  async function handleShare() {
    setErr("");
    setStatus("Sharing…");
    try {
      const body = entityType === "document" 
        ? { document_id: entityId, role }
        : { sheet_id: entityId, role };

      if (shareWithAll) {
        body.share_with_all = true;
      } else {
        if (selectedUsers.length === 0) {
          setErr("Please select at least one user or choose 'Share with all'");
          setStatus("");
          return;
        }
        body.targets = selectedUsers.map((u) => u.account_no);
      }

      await workspaceFetch(`/api/workspace/share/${entityType}`, {
        method: "POST",
        userId,
        body,
      });

      // Refresh permissions list
      const data = await workspaceFetch(
        `/api/workspace/share/${entityType}/${entityId}`,
        { method: "GET", userId }
      );
      
      setPermissions(data.permissions || []);
      setSelectedUsers([]);
      setShareWithAll(false);
      setStatus("Shared successfully!");
      setTimeout(() => setStatus(""), 2000);
    } catch (e) {
      setErr(e.message || "Failed to share");
      setStatus("");
    }
  }

  async function removeAccess(user_account_no) {
    setErr("");
    setStatus("Removing…");
    try {
      const body = entityType === "document"
        ? { document_id: entityId, target_user_account_no: user_account_no }
        : { sheet_id: entityId, target_user_account_no: user_account_no };

      await workspaceFetch(`/api/workspace/share/${entityType}/remove`, {
        method: "POST",
        userId,
        body,
      });

      const data = await workspaceFetch(
        `/api/workspace/share/${entityType}/${entityId}`,
        { method: "GET", userId }
      );
      setPermissions(data.permissions || []);
      setStatus("");
    } catch (e) {
      setErr(e.message || "Failed to remove access");
      setStatus("");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 shrink-0">
          <div className="font-semibold text-lg">Share</div>
          <button className="rounded border px-3 py-1 hover:bg-gray-50" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {!canManage && (
            <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              You can view sharing, but only the owner can modify access.
            </div>
          )}

          {/* Add Users Section */}
          {canManage && (
            <div className="space-y-3">
              <div className="relative" ref={searchRef}>
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  placeholder="Search by name, email, or Unique ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={shareWithAll}
                />
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((u) => (
                      <button
                        key={u.account_no}
                        onClick={() => addUser(u)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex flex-col border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium text-sm text-gray-800">{u.name || "Unknown"}</span>
                        <span className="text-xs text-gray-500">{u.email} • {u.account_no}</span>
                      </button>
                    ))}
                  </div>
                )}
                {isSearching && (
                  <div className="absolute right-3 top-2.5 text-xs text-gray-400">Searching...</div>
                )}
              </div>

              {/* Selected Users Pills */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((u) => (
                    <div key={u.account_no} className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-medium">
                      {u.name || u.account_no}
                      <button onClick={() => removeUser(u.account_no)} className="ml-1 hover:text-blue-900">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Share with All Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none p-2 rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={shareWithAll}
                  onChange={(e) => setShareWithAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Share with ALL users in the organization</span>
              </label>

              {/* Role & Share Button */}
              <div className="flex gap-2 pt-2">
                <select
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="owner">Owner</option>
                </select>
                <button
                  className="flex-1 rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={(!shareWithAll && selectedUsers.length === 0)}
                  onClick={handleShare}
                >
                  {status === "Sharing…" ? "Sharing..." : "Share"}
                </button>
              </div>
            </div>
          )}

          {/* Status / Error Messages */}
          {(status || err) && (
            <div className="text-sm">
              {status && <div className="text-green-600 font-medium">{status}</div>}
              {err && <div className="text-red-600">{err}</div>}
            </div>
          )}

          {/* Existing Permissions List */}
          <div className="pt-4 border-t">
            <div className="font-medium mb-2 text-gray-700">People with access ({permissions.length})</div>
            <div className="space-y-2">
              {permissions.map((p) => (
                <div
                  key={p.user_account_no}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {p.name || p.user_account_no}
                    </div>
                    {p.email && (
                      <div className="text-xs text-gray-500 truncate">{p.email}</div>
                    )}
                    <div className="text-xs text-blue-600 font-medium mt-0.5 capitalize">{p.role}</div>
                  </div>

                  {canManage && p.user_account_no !== userId && (
                    <button
                      className="rounded border border-red-200 text-red-600 px-3 py-1 text-xs hover:bg-red-50 transition-colors"
                      onClick={() => removeAccess(p.user_account_no)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {permissions.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">No one else has access yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}