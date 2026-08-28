// // sheets/new

// "use client";

// import { useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useCurrentUser } from "../../_hooks/useCurrentUser";
// import { workspaceFetch } from "../../workspace/_lib/workspaceApi";

// export default function NewSheetPage() {
//   const router = useRouter();
//   const sp = useSearchParams();
//   const [createError, setCreateError] = useState("");
//   const { user, loading, error } = useCurrentUser();

//   useEffect(() => {
//     if (loading) return;
//     if (error || !user?.accountNo) {
//       router.replace("/workspace/new");
//       return;
//     }

//     const workspaceId = sp.get("workspaceId");
//     const folderId = sp.get("folderId");

//     async function create() {
//       const data = await workspaceFetch("/api/workspace/sheets/create", {
//         method: "POST",
//         userId: user.accountNo, // <-- send UniqueID/account_no to backend
//         body: {
//           title: "Untitled sheet",
//           workspace_id: workspaceId ? Number(workspaceId) : null,
//           folder_id: folderId ? Number(folderId) : null,
//         },
//       });

//       router.replace(`/sheets/${data.id}`);
//     }

// create().catch((e) => {
//   console.error(e);
//   setCreateError("Failed to create sheet. Please try again.");
// });
//   }, [loading, error, user, router, sp]);

//   return (
//   <div className="p-6">
//     {createError ? (
//       <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
//         {createError}
//         <button
//           className="ml-4 underline"
//           onClick={() => router.replace("/workspace/new")}
//         >
//           Go back
//         </button>
//       </div>
//     ) : (
//       <div>Creating sheet…</div>
//     )}
//   </div>
// );
// }


"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "../../_hooks/useCurrentUser";
import { workspaceFetch } from "../../workspace/_lib/workspaceApi";

export default function NewSheetPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user, loading, error } = useCurrentUser();

  // Change 6: replace alert() with inline error state
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (error || !user?.accountNo) {
      router.replace("/workspace/new");
      return;
    }

    const workspaceId = sp.get("workspaceId");
    const folderId = sp.get("folderId");

    async function create() {
      const data = await workspaceFetch("/api/workspace/sheets/create", {
        method: "POST",
        userId: user.accountNo,
        body: {
          title: "Untitled sheet",
          workspace_id: workspaceId ? Number(workspaceId) : null,
          folder_id: folderId ? Number(folderId) : null,
        },
      });

      router.replace(`/sheets/${data.id}`);
    }

    create().catch((e) => {
      console.error(e);
      setCreateError(e.message || "Failed to create sheet. Please try again.");
    });
  }, [loading, error, user, router, sp]);

  if (createError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {createError}
          <button
            className="ml-4 underline text-red-700"
            onClick={() => router.replace("/workspace/new")}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return <div className="p-6 text-gray-600">Creating sheet…</div>;
}