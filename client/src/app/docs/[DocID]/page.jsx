"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCurrentUser } from "../../_hooks/useCurrentUser";
import { workspaceFetch } from "../../workspace/_lib/workspaceApi";
import DocEditor from "../_components/DocEditor";
import ShareModal from "../../workspace/_components/ShareModal";
import ActiveUsers from "../../workspace/_components/ActiveUsers";

export default function DocPage() {
  const params = useParams();
  const router = useRouter();
  const docId = Number(params.DocID);

  const { user, loading: userLoading, error: userError } = useCurrentUser();

  const [doc, setDoc] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (userLoading) return;
    if (userError || !user?.accountNo) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(docId)) {
      setError("Invalid document ID.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const data = await workspaceFetch(`/api/workspace/docs/${docId}`, {
          method: "GET",
          userId: user.accountNo,
        });
        setDoc(data.document);
        setRole(data.role);
      } catch (e) {
        setError(e.message || "Failed to load document.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [docId, user, userLoading, userError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f0f4f8]">
        <div className="text-gray-400 text-sm">Loading document…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f0f4f8] gap-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-red-700 text-sm max-w-md">
          {error}
        </div>
        <button
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          onClick={() => router.push("/workspace")}
        >
          ← Back to workspace
        </button>
      </div>
    );
  }

  const readOnly = role === "viewer";
  const canManageShare = role === "owner";

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">

      {/* Top bar — Google Docs style */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white shrink-0">
        {/* Back + Doc icon */}
        <button
          className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded"
          onClick={() => router.push("/workspace")}
          title="Back to workspace"
        >
          ←
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Doc icon */}
          <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded"
            style={{ backgroundColor: "#4285f4" }}>
            <span className="text-white text-xs font-bold">D</span>
          </div>

          {/* Title input */}
          <input
            className="flex-1 min-w-0 text-base font-medium text-gray-800 bg-transparent border-none outline-none hover:bg-gray-100 focus:bg-gray-100 rounded px-2 py-0.5 truncate"
            value={doc?.title || ""}
            onChange={async (e) => {
              setDoc((prev) => ({ ...prev, title: e.target.value }));
            }}
            disabled={readOnly}
            placeholder="Untitled document"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Active users */}
          {user && (
            <ActiveUsers
              entityType="document"
              entityId={docId}
              userId={user.accountNo}
              userName={user.fname}
            />
          )}

          {readOnly && (
            <span className="rounded-full bg-yellow-100 text-yellow-700 text-xs px-3 py-1">
              View only
            </span>
          )}

          <span className="rounded-full bg-gray-100 text-gray-500 text-xs px-2 py-1">
            {role}
          </span>

          <button
            className="rounded-full bg-[#1a73e8] hover:bg-[#1558b0] text-white text-sm px-4 py-1.5 font-medium transition-colors"
            onClick={() => setShareOpen(true)}
          >
            Share
          </button>
        </div>
      </div>

      {/* Editor fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <DocEditor
          docId={doc.id}
          userId={user.accountNo}
          initialTitle={doc.title}
          initialContent={doc.content_json}
          readOnly={readOnly}
        />
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        userId={user.accountNo}
        entityType="document"
        entityId={doc.id}
        canManage={canManageShare}
      />
    </div>
  );
}