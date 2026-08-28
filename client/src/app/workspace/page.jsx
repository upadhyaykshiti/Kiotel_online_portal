"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../_hooks/useCurrentUser";
import { workspaceFetch } from "./_lib/workspaceApi";

function FileCard({ title, role, updatedAt, onClick, type }) {
  const icon = type === "doc" ? "📄" : "📊";
  const iconBg = type === "doc" ? "#4285f4" : "#0f9d58";

  function formatDate(str) {
    if (!str) return "";
    const d = new Date(str);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  const roleColors = {
    owner: "bg-blue-50 text-blue-700",
    editor: "bg-green-50 text-green-700",
    viewer: "bg-gray-100 text-gray-500",
  };

  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-gray-300 hover:shadow-md transition-all duration-150"
    >
      <div
        className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm"
        style={{ backgroundColor: iconBg }}
      >
        {type === "doc" ? "D" : "S"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate text-sm group-hover:text-blue-600 transition-colors">
          {title || (type === "doc" ? "Untitled document" : "Untitled sheet")}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          Edited {formatDate(updatedAt)}
        </div>
      </div>

      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[role] || roleColors.viewer}`}>
        {role}
      </span>
    </button>
  );
}

export default function WorkspacePage() {
  const router = useRouter();
  const { user, loading: userLoading, error: userError } = useCurrentUser();

  const [docs, setDocs] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (userLoading) return;
    if (userError || !user?.accountNo) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    async function loadAll() {
      try {
        const [docsData, sheetsData] = await Promise.all([
          workspaceFetch("/api/workspace/docs/list", { method: "GET", userId: user.accountNo }),
          workspaceFetch("/api/workspace/sheets/list", { method: "GET", userId: user.accountNo }),
        ]);
        setDocs(docsData.documents || []);
        setSheets(sheetsData.sheets || []);
      } catch (e) {
        setError(e.message || "Failed to load workspace.");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [user, userLoading, userError]);

  const filteredDocs = docs.filter((d) =>
    d.title?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSheets = sheets.filter((s) =>
    s.title?.toLowerCase().includes(search.toLowerCase())
  );

  const allItems = [
    ...filteredDocs.map((d) => ({ ...d, _type: "doc" })),
    ...filteredSheets.map((s) => ({ ...s, _type: "sheet" })),
  ].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-400 text-sm">Loading workspace…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1a73e8] flex items-center justify-center">
              <span className="text-white text-xs font-bold">W</span>
            </div>
            <span className="font-semibold text-gray-800 text-base">Workspace</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              type="search"
              placeholder="Search docs and sheets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>

          <div className="ml-auto">
            <button
              className="rounded-full bg-[#1a73e8] hover:bg-[#1558b0] text-white text-sm px-5 py-2 font-medium transition-colors shadow-sm"
              onClick={() => router.push("/workspace/new")}
            >
              + New
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back{user?.fname ? `, ${user.fname}` : ""}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {docs.length + sheets.length} files in your workspace
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
          {[
            { key: "all", label: `All (${allItems.length})` },
            { key: "docs", label: `Documents (${filteredDocs.length})` },
            { key: "sheets", label: `Sheets (${filteredSheets.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick create */}
        <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
          <button
            onClick={() => router.push("/docs/new")}
            className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#4285f4] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-700">
              New Document
            </span>
          </button>

          <button
            onClick={() => router.push("/sheets/new")}
            className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-green-300 hover:bg-green-50 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0f9d58] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-sm font-medium text-gray-600 group-hover:text-green-700">
              New Sheet
            </span>
          </button>
        </div>

        {/* Files grid */}
        {activeTab === "all" && (
          <>
            {allItems.length === 0 ? (
              <EmptyState search={search} router={router} />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {allItems.map((item) => (
                  <FileCard
                    key={`${item._type}-${item.id}`}
                    title={item.title}
                    role={item.role}
                    updatedAt={item.updated_at}
                    type={item._type}
                    onClick={() =>
                      router.push(
                        item._type === "doc"
                          ? `/docs/${item.id}`
                          : `/sheets/${item.id}`
                      )
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "docs" && (
          <>
            {filteredDocs.length === 0 ? (
              <EmptyState search={search} type="doc" router={router} />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDocs.map((doc) => (
                  <FileCard
                    key={doc.id}
                    title={doc.title}
                    role={doc.role}
                    updatedAt={doc.updated_at}
                    type="doc"
                    onClick={() => router.push(`/docs/${doc.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "sheets" && (
          <>
            {filteredSheets.length === 0 ? (
              <EmptyState search={search} type="sheet" router={router} />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSheets.map((sheet) => (
                  <FileCard
                    key={sheet.id}
                    title={sheet.title}
                    role={sheet.role}
                    updatedAt={sheet.updated_at}
                    type="sheet"
                    onClick={() => router.push(`/sheets/${sheet.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ search, type, router }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{type === "sheet" ? "📊" : "📄"}</div>
      <div className="text-gray-600 font-medium">
        {search ? `No results for "${search}"` : "No files yet"}
      </div>
      <div className="text-gray-400 text-sm mt-1">
        {search ? "Try a different search term" : "Create your first file to get started"}
      </div>
      {!search && (
        <button
          className="mt-4 rounded-full bg-[#1a73e8] text-white text-sm px-5 py-2 hover:bg-[#1558b0] transition-colors"
          onClick={() => router.push("/workspace/new")}
        >
          + Create new
        </button>
      )}
    </div>
  );
}