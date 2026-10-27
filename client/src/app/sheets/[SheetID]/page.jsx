// // sheets/[SheetID]

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { useCurrentUser } from "../../_hooks/useCurrentUser";
// import { workspaceFetch } from "../../workspace/_lib/workspaceApi";
// // import { debounce } from "../../workspace/_lib/debounce";
// import { useDebounce } from "../../workspace/_lib/useDebounce";

// export default function SheetPage() {
//   const params = useParams();
//   const router = useRouter();
//   const sheetId = Number(params.SheetID);

//   const { user, loading: userLoading, error: userError } = useCurrentUser();

//   const [sheet, setSheet] = useState(null);
//   const [role, setRole] = useState("");
//   const [title, setTitle] = useState("");
//   const [sheetJson, setSheetJson] = useState(null);

//   const [status, setStatus] = useState("Saved");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(true);

//   const readOnly = role === "viewer";

// // Replace with: extract the save function separately first, then:
// const saveSheet = useCallback(async (nextTitle, nextSheetJson) => {
//   if (readOnly) return;
//   if (!user?.accountNo) return;
//   setStatus("Saving…");
//   try {
//     await workspaceFetch("/api/workspace/sheets/update", {
//       method: "PUT",
//       userId: user.accountNo,
//       body: { id: sheetId, title: nextTitle, sheet_json: nextSheetJson },
//     });
//     setStatus("Saved");
//   } catch (e) {
//     setStatus("Save failed");
//     console.error(e);
//   }
// }, [readOnly, user, sheetId]);

// const saveDebounced = useDebounce(saveSheet, 3000);

//   useEffect(() => {
//     if (userLoading) return;

//     if (userError || !user?.accountNo) {
//       setError("You are not logged in.");
//       setLoading(false);
//       return;
//     }

//     async function load() {
//       try {
//         const data = await workspaceFetch(`/api/workspace/sheets/${sheetId}`, {
//           method: "GET",
//           userId: user.accountNo,
//         });

//         setSheet(data.sheet);
//         setRole(data.role);
//         setTitle(data.sheet.title || "Untitled sheet");
//         setSheetJson(data.sheet.sheet_json || { version: 1, data: {} });
//       } catch (e) {
//         console.error(e);
//         setError("Failed to load sheet (permission or not found).");
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (!Number.isFinite(sheetId)) {
//       setError("Invalid sheet ID.");
//       setLoading(false);
//       return;
//     }

//     load();
//   }, [sheetId, user, userLoading, userError]);

//   // Save on title change (debounced)
//   useEffect(() => {
//     if (!sheet) return;
//     if (readOnly) return;
//     if (!sheetJson) return;

//     saveDebounced(title, sheetJson);
//   }, [title, sheetJson, sheet, readOnly, saveDebounced]);

//   if (loading) return <div className="p-6">Loading sheet…</div>;

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
//           {error}
//         </div>
//         <button
//           className="mt-4 rounded-lg border px-4 py-2 hover:bg-gray-50"
//           onClick={() => router.push("/workspace")}
//         >
//           Back
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="mx-auto max-w-4xl space-y-4">
//         <div className="flex items-center justify-between">
//           <h1 className="text-xl font-semibold text-gray-900">Sheets</h1>
//           <div className="text-sm text-gray-600">
//             Role: <span className="font-medium">{role}</span> • {status}
//           </div>
//         </div>

//         <input
//           className="w-full rounded-lg border px-3 py-2 text-lg font-semibold"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           disabled={readOnly}
//         />

//         {readOnly && (
//           <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
//             You have view-only access.
//           </div>
//         )}

//         {/* Temporary editor: JSON textarea.
//             Replace this with Univer later, but keep state + saveDebounced. */}
//         <div className="rounded-lg border bg-white p-3">
//           <div className="text-sm text-gray-600 mb-2">
//             Temporary Sheet JSON (replace UI with Univer later)
//           </div>
//           <textarea
//             className="w-full min-h-[40vh] font-mono text-sm border rounded p-3"
//             value={JSON.stringify(sheetJson, null, 2)}
//             disabled={readOnly}
//             onChange={(e) => {
//               try {
//                 const parsed = JSON.parse(e.target.value);
//                 setSheetJson(parsed);
//               } catch {
//                 // ignore invalid JSON while typing
//               }
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCurrentUser } from "../../_hooks/useCurrentUser";
import { workspaceFetch } from "../../workspace/_lib/workspaceApi";
import { useDebounce } from "../../workspace/_lib/useDebounce";
import { toUniverSnapshot, fromUniverSnapshot } from "../../workspace/_lib/sheetAdapter";
import UniverSheetClient from "../_components/UniverSheetClient";
import ShareModal from "../../workspace/_components/ShareModal";
// Add this import at the top:
import ActiveUsers from "../../workspace/_components/ActiveUsers";

export default function SheetPage() {
  const params = useParams();
  const router = useRouter();
  const sheetId = Number(params.SheetID);

  const { user, loading: userLoading, error: userError } = useCurrentUser();

  const [sheet, setSheet] = useState(null);
  const [role, setRole] = useState("");
  const [title, setTitle] = useState("");
  const [initialSnapshot, setInitialSnapshot] = useState(null);

  const [status, setStatus] = useState("Saved");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  const readOnly = role === "viewer";
  const canManageShare = role === "owner";

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (userLoading) return;
    if (userError || !user?.accountNo) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(sheetId)) {
      setError("Invalid sheet ID.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const data = await workspaceFetch(`/api/workspace/sheets/${sheetId}`, {
          method: "GET",
          userId: user.accountNo,
        });

        setSheet(data.sheet);
        setRole(data.role);
        setTitle(data.sheet.title || "Untitled sheet");
        // Convert DB JSON → Univer IWorkbookData
        setInitialSnapshot(toUniverSnapshot(data.sheet.sheet_json));
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load sheet.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [sheetId, user, userLoading, userError]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const saveSheet = useCallback(
    async (nextTitle, workbookSnapshot) => {
      if (readOnly) return;
      if (!user?.accountNo) return;

      setStatus("Saving…");
      try {
        await workspaceFetch("/api/workspace/sheets/update", {
          method: "PUT",
          userId: user.accountNo,
          body: {
            id: sheetId,
            title: nextTitle,
            // Wrap Univer snapshot into our DB storage format
            sheet_json: fromUniverSnapshot(workbookSnapshot),
          },
        });
        setStatus("Saved");
      } catch (e) {
        setStatus("Save failed — will retry");
        console.error("Sheet autosave failed:", e);
      }
    },
    [readOnly, user, sheetId]
  );

  const saveDebounced = useDebounce(saveSheet, 2000);

  // Called by UniverSheet whenever any command executes
  const handleUniverSave = useCallback(
    (workbookSnapshot) => {
      saveDebounced(title, workbookSnapshot);
    },
    [saveDebounced, title]
  );

  // Save when title changes
  const isMounted = useRef(false);
  const latestSnapshotRef = useRef(null);

  const handleApiReady = useCallback((univerAPI) => {
    // Keep a ref to the latest workbook for title-change saves
    univerAPI.onCommandExecuted(() => {
      const wb = univerAPI.getActiveWorkbook();
      if (wb) latestSnapshotRef.current = wb.save();
    });
  }, []);

  useEffect(() => {
    if (!sheet) return;
    if (readOnly) return;
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    // Title change → save with latest snapshot
    if (latestSnapshotRef.current) {
      saveDebounced(title, latestSnapshotRef.current);
    }
  }, [title, sheet, readOnly, saveDebounced]);

  // ── Status color ──────────────────────────────────────────────────────────
  const statusColor =
    status === "Saved"
      ? "text-green-600"
      : status.includes("failed")
      ? "text-red-500"
      : "text-gray-400";

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="p-6 text-gray-500">Loading sheet…</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
        <button
          className="mt-4 rounded-lg border px-4 py-2 hover:bg-gray-50"
          onClick={() => router.push("/workspace")}
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">

      {/* Top bar */}
      <div className="flex items-center gap-3 border-b px-4 py-2 bg-white shrink-0">
        <button
          className="text-sm text-gray-500 hover:text-gray-900 px-1"
          onClick={() => router.push("/workspace")}
          title="Back to workspace"
        >
          ←
        </button>

        <input
          className="flex-1 max-w-xs rounded border px-2 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-gray-300"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={readOnly}
        />

        <span className={`text-xs ${statusColor}`}>{status}</span>

        {readOnly && (
          <span className="rounded-full bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5">
            View only
          </span>
        )}

        <span className="rounded-full bg-gray-100 text-gray-600 text-xs px-2 py-0.5">
          {role}
        </span>

        <button
          className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
          onClick={() => setShareOpen(true)}
        >
          Share
        </button>
      </div>

      {/* Univer spreadsheet — fills remaining height */}
      <div className="flex-1 overflow-hidden">
        {initialSnapshot && (
          <UniverSheetClient
            initialSnapshot={initialSnapshot}
            onSave={handleUniverSave}
            readOnly={readOnly}
            onApiReady={handleApiReady}
          />
        )}
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        userId={user.accountNo}
        entityType="sheet"
        entityId={sheetId}
        canManage={canManageShare}
      />
    </div>
  );
}