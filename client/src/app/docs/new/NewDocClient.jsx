// docs/new

"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "../../_hooks/useCurrentUser";
import { workspaceFetch } from "../../workspace/_lib/workspaceApi";


export default function NewDocPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [createError, setCreateError] = useState("");
  const { user, loading, error } = useCurrentUser();

  useEffect(() => {
    if (loading) return;
    if (error || !user?.accountNo) {
      router.replace("/workspace/new");
      return;
    }

    const workspaceId = sp.get("workspaceId");
    const folderId = sp.get("folderId");

    async function create() {
      const data = await workspaceFetch("/api/workspace/docs/create", {
        method: "POST",
        userId: user.accountNo, // <-- send UniqueID/account_no to backend
        body: {
          title: "Untitled document",
          workspace_id: workspaceId ? Number(workspaceId) : null,
          folder_id: folderId ? Number(folderId) : null,
        },
      });

      router.replace(`/docs/${data.id}`);
    }

  // Replace the .catch block:
create().catch((e) => {
  console.error(e);
  setCreateError("Failed to create document. Please try again.");
});
  }, [loading, error, user, router, sp]);

  // Replace return JSX:
return (
  <div className="p-6">
    {createError ? (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        {createError}
        <button
          className="ml-4 underline"
          onClick={() => router.replace("/workspace/new")}
        >
          Go back
        </button>
      </div>
    ) : (
      <div>Creating document…</div>
    )}
  </div>
);
}