// // /workspace/new
// "use client";

// import { useRouter, useSearchParams } from "next/navigation";

// export default function NewWorkspaceFilePage() {
//   const router = useRouter();
//   const sp = useSearchParams();

//   const workspaceId = sp.get("workspaceId");
//   const folderId = sp.get("folderId");

//   const qs = new URLSearchParams();
//   if (workspaceId) qs.set("workspaceId", workspaceId);
//   if (folderId) qs.set("folderId", folderId);

//   const suffix = qs.toString() ? `?${qs.toString()}` : "";

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow">
//         <h1 className="text-2xl font-semibold">Create new</h1>
//         <p className="mt-2 text-gray-600">Choose what you want to create.</p>

//         <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
//           <button
//             className="rounded-lg border p-4 text-left hover:bg-gray-50"
//             onClick={() => router.push(`/docs/new${suffix}`)}
//           >
//             <div className="font-medium">Doc</div>
//             <div className="text-sm text-gray-600">Rich text document</div>
//           </button>

//           <button
//             className="rounded-lg border p-4 text-left hover:bg-gray-50"
//             onClick={() => router.push(`/sheets/new${suffix}`)}
//           >
//             <div className="font-medium">Sheet</div>
//             <div className="text-sm text-gray-600">Spreadsheet</div>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useCurrentUser } from "../../_hooks/useCurrentUser";
// import { workspaceFetch } from "../../workspace/_lib/workspaceApi";

// export default function NewDocPage() {
//   const router = useRouter();
//   const sp = useSearchParams();
//   const { user, loading, error } = useCurrentUser();

//   // Change 6: replace alert() with inline error state
//   const [createError, setCreateError] = useState("");

//   useEffect(() => {
//     if (loading) return;
//     if (error || !user?.accountNo) {
//       router.replace("/workspace/new");
//       return;
//     }

//     const workspaceId = sp.get("workspaceId");
//     const folderId = sp.get("folderId");

//     async function create() {
//       const data = await workspaceFetch("/api/workspace/docs/create", {
//         method: "POST",
//         userId: user.accountNo,
//         body: {
//           title: "Untitled document",
//           workspace_id: workspaceId ? Number(workspaceId) : null,
//           folder_id: folderId ? Number(folderId) : null,
//         },
//       });

//       router.replace(`/docs/${data.id}`);
//     }

//     create().catch((e) => {
//       console.error(e);
//       setCreateError(e.message || "Failed to create document. Please try again.");
//     });
//   }, [loading, error, user, router, sp]);

//   if (createError) {
//     return (
//       <div className="p-6">
//         <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
//           {createError}
//           <button
//             className="ml-4 underline text-red-700"
//             onClick={() => router.replace("/workspace/new")}
//           >
//             Go back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return <div className="p-6 text-gray-600">Creating document…</div>;
// }



"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function NewWorkspaceFilePage() {
  const router = useRouter();
  const sp = useSearchParams();

  const workspaceId = sp.get("workspaceId");
  const folderId = sp.get("folderId");

  const qs = new URLSearchParams();
  if (workspaceId) qs.set("workspaceId", workspaceId);
  if (folderId) qs.set("folderId", folderId);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow">

        <div className="flex items-center gap-3 mb-6">
          <button
            className="text-sm text-gray-500 hover:text-gray-900 underline"
            onClick={() => router.push("/workspace")}
          >
            ← Back to workspace
          </button>
        </div>

        <h1 className="text-2xl font-semibold">Create new</h1>
        <p className="mt-2 text-gray-600">Choose what you want to create.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            className="rounded-lg border p-4 text-left hover:bg-gray-50 hover:border-gray-400 transition-colors"
            onClick={() => router.push(`/docs/new${suffix}`)}
          >
            <div className="text-2xl mb-2">📄</div>
            <div className="font-medium">Document</div>
            <div className="text-sm text-gray-500 mt-1">
              Rich text editor with formatting
            </div>
          </button>

          <button
            className="rounded-lg border p-4 text-left hover:bg-gray-50 hover:border-gray-400 transition-colors"
            onClick={() => router.push(`/sheets/new${suffix}`)}
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Sheet</div>
            <div className="text-sm text-gray-500 mt-1">
              Spreadsheet with rows and columns
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}