"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProtectedRoute from "../../context/ProtectedRoute";
import {
  FaArrowLeft,
  FaSave,
  FaEdit,
  FaTimes,
  FaHighlighter,
  FaExchangeAlt,
  FaHistory,
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaUndo,
  FaRedo,
  FaCheck,
  FaChevronDown,
  FaPalette,
  FaEye,
  FaTrash,
  FaUser,
  FaClock,
  FaComment,
  FaReply,
} from "react-icons/fa";
import Link from "next/link";


/* ───────────────────────── constants ───────────────────────── */
const FONT_SIZES = [
  { label: "Small", value: "1" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "5" },
  { label: "Huge", value: "7" },
];

const TEXT_COLORS = [
  "#000000", "#333333", "#555555", "#777777",
  "#DC2626", "#EA580C", "#D97706", "#CA8A04",
  "#16A34A", "#059669", "#0D9488", "#0891B2",
  "#2563EB", "#4F46E5", "#7C3AED", "#9333EA",
  "#C026D3", "#DB2777", "#E11D48", "#FFFFFF",
];

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#FEF08A", border: "#EAB308" },
  { label: "Green", value: "#BBF7D0", border: "#22C55E" },
  { label: "Blue", value: "#BFDBFE", border: "#3B82F6" },
  { label: "Pink", value: "#FBCFE8", border: "#EC4899" },
  { label: "Orange", value: "#FED7AA", border: "#F97316" },
  { label: "Purple", value: "#E9D5FF", border: "#A855F7" },
];

/* ─────────────────── toolbar helpers ──────────────────────── */
function ToolbarButton({ icon: Icon, onClick, active, title, disabled }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
        active
          ? "bg-blue-100 text-blue-700 shadow-sm"
          : disabled
          ? "text-gray-300 cursor-not-allowed"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon className="text-xs sm:text-sm" />
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-200 mx-0.5 sm:mx-1" />;
}

/* ───────────── Rich-text Editor Toolbar ─────────────────── */
function EditorToolbar({ editorRef }) {
  const [showFontSize, setShowFontSize] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showBgColor, setShowBgColor] = useState(false);

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 sm:p-3 bg-gray-50 border-b border-gray-200 rounded-t-xl">
      <ToolbarButton icon={FaUndo} onClick={() => exec("undo")} title="Undo" />
      <ToolbarButton icon={FaRedo} onClick={() => exec("redo")} title="Redo" />
      <ToolbarDivider />

      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { setShowFontSize(!showFontSize); setShowTextColor(false); setShowBgColor(false); }}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs sm:text-sm text-gray-600 hover:bg-gray-100 transition"
          title="Font Size"
        >
          A<FaChevronDown className="text-[10px]" />
        </button>
        {showFontSize && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-50 min-w-[120px] py-1">
            {FONT_SIZES.map((s) => (
              <button
                key={s.value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { exec("fontSize", s.value); setShowFontSize(false); }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <ToolbarDivider />

      <ToolbarButton icon={FaBold} onClick={() => exec("bold")} title="Bold" />
      <ToolbarButton icon={FaItalic} onClick={() => exec("italic")} title="Italic" />
      <ToolbarButton icon={FaUnderline} onClick={() => exec("underline")} title="Underline" />
      <ToolbarButton icon={FaStrikethrough} onClick={() => exec("strikeThrough")} title="Strikethrough" />
      <ToolbarDivider />

      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { setShowTextColor(!showTextColor); setShowFontSize(false); setShowBgColor(false); }}
          className="p-1.5 sm:p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          title="Text Color"
        >
          <FaPalette className="text-xs sm:text-sm" />
        </button>
        {showTextColor && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-3 w-[180px]">
            <p className="text-xs font-semibold text-gray-500 mb-2">Text Color</p>
            <div className="grid grid-cols-5 gap-1.5">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { exec("foreColor", c); setShowTextColor(false); }}
                  className="w-6 h-6 rounded-md border border-gray-200 hover:scale-125 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { setShowBgColor(!showBgColor); setShowFontSize(false); setShowTextColor(false); }}
          className="p-1.5 sm:p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          title="Background Color"
        >
          <FaHighlighter className="text-xs sm:text-sm" />
        </button>
        {showBgColor && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-3 w-[180px]">
            <p className="text-xs font-semibold text-gray-500 mb-2">Highlight</p>
            <div className="grid grid-cols-5 gap-1.5">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { exec("hiliteColor", c); setShowBgColor(false); }}
                  className="w-6 h-6 rounded-md border border-gray-200 hover:scale-125 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <ToolbarDivider />

      <ToolbarButton icon={FaAlignLeft} onClick={() => exec("justifyLeft")} title="Align Left" />
      <ToolbarButton icon={FaAlignCenter} onClick={() => exec("justifyCenter")} title="Align Center" />
      <ToolbarButton icon={FaAlignRight} onClick={() => exec("justifyRight")} title="Align Right" />
      <ToolbarButton icon={FaAlignJustify} onClick={() => exec("justifyFull")} title="Justify" />
      <ToolbarDivider />

      <ToolbarButton icon={FaListUl} onClick={() => exec("insertUnorderedList")} title="Bullet List" />
      <ToolbarButton icon={FaListOl} onClick={() => exec("insertOrderedList")} title="Numbered List" />
    </div>
  );
}

/* ────────── Annotation Side Panel ────────── */
function AnnotationPanel({
  highlights,
  changeRequests,
  comments,
  userRole,
  onDeleteHighlight,
  onDeleteChangeRequest,
  onApproveChangeRequest,
  onDeleteComment,
  showHistory,
  setShowHistory,
  history,
}) {
  const [tab, setTab] = useState("highlights");

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setTab("highlights")}
          className={`flex-1 py-3 text-sm font-semibold transition whitespace-nowrap px-2 ${
            tab === "highlights"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaHighlighter className="inline mr-1.5" />
          Highlights ({highlights.length})
        </button>

        {(userRole === 1 || userRole === 5) && (
          <button
            onClick={() => setTab("requests")}
            className={`flex-1 py-3 text-sm font-semibold transition whitespace-nowrap px-2 ${
              tab === "requests"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaExchangeAlt className="inline mr-1.5" />
            Changes ({changeRequests.length})
          </button>
        )}

        {(userRole === 1 || userRole === 5) && (
          <button
            onClick={() => setTab("comments")}
            className={`flex-1 py-3 text-sm font-semibold transition whitespace-nowrap px-2 ${
              tab === "comments"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaComment className="inline mr-1.5" />
            Comments ({comments.length})
          </button>
        )}

        <button
          onClick={() => { setTab("history"); setShowHistory(true); }}
          className={`flex-1 py-3 text-sm font-semibold transition whitespace-nowrap px-2 ${
            tab === "history"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaHistory className="inline mr-1.5" />
          History
        </button>
      </div>

      <div className="p-4 max-h-[60vh] overflow-y-auto">
        {/* ── Highlights Tab ── */}
        {tab === "highlights" && (
          <div className="space-y-3">
            {highlights.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No highlights yet</p>
            ) : (
              highlights.map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl border"
                  style={{
                    borderColor: h.color || "#EAB308",
                    backgroundColor: (h.bg_color || "#FEF08A") + "33",
                  }}
                >
                  <p className="text-sm text-gray-800 font-medium mb-2 line-clamp-3">{`"${h.text}"`}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-block w-3 h-3 rounded-full border"
                      style={{ backgroundColor: h.bg_color || "#FEF08A", borderColor: h.color || "#EAB308" }}
                    />
                    <span className="text-xs text-gray-400 capitalize">
                      {h.visible_to === "admin_hr" ? "Admin & HR only" : "All users"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-[10px]" />
                      {h.created_by_name || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-[10px]" />
                      {new Date(h.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {userRole === 1 && (
                    <button
                      onClick={() => onDeleteHighlight(h.id)}
                      className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                    >
                      <FaTrash className="text-[10px]" /> Remove
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Change Requests Tab ── */}
        {tab === "requests" && (userRole === 1 || userRole === 5) && (
          <div className="space-y-3">
            {changeRequests.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No change requests</p>
            ) : (
              changeRequests.map((cr) => (
                <div key={cr.id} className="p-3 rounded-xl border border-orange-200 bg-orange-50/50">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      cr.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : cr.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {cr.status?.charAt(0).toUpperCase() + cr.status?.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Original:</span> {`"${cr.original_text}"`}
                  </p>
                  <p className="text-sm text-gray-800 mb-2">
                    <span className="font-semibold">Suggested:</span> {`"${cr.suggested_text}"`}
                  </p>
                  {cr.note && (
                    <p className="text-xs text-gray-500 italic mb-2">Note: {cr.note}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-[10px]" />
                      {cr.requested_by_name || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-[10px]" />
                      {new Date(cr.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {userRole === 1 && cr.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApproveChangeRequest(cr.id, "approved")}
                        className="flex-1 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-1"
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        onClick={() => onApproveChangeRequest(cr.id, "rejected")}
                        className="flex-1 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-1"
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Comments Tab ── */}
        {tab === "comments" && (userRole === 1 || userRole === 5) && (
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No comments yet</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="p-3 rounded-xl border border-blue-200 bg-blue-50/30">
                  <p className="text-sm text-gray-800 mb-2">{c.comment_text}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      c.visible_to === "admin_hr"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {c.visible_to === "admin_hr" ? "Admin & HR only" : "All users"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-[10px]" />
                      {c.created_by_name || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-[10px]" />
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {userRole === 1 && (
                    <button
                      onClick={() => onDeleteComment(c.id)}
                      className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                    >
                      <FaTrash className="text-[10px]" /> Remove
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── History Tab ── */}
        {tab === "history" && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No history yet</p>
            ) : (
              history.map((h, i) => (
                <div key={i} className="p-3 rounded-xl border border-gray-200 bg-gray-50/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      h.action === "highlight_added"
                        ? "bg-yellow-100 text-yellow-700"
                        : h.action === "change_requested"
                        ? "bg-orange-100 text-orange-700"
                        : h.action === "change_approved"
                        ? "bg-green-100 text-green-700"
                        : h.action === "change_rejected"
                        ? "bg-red-100 text-red-700"
                        : h.action === "bonus_updated"
                        ? "bg-blue-100 text-blue-700"
                        : h.action === "comment_added"
                        ? "bg-teal-100 text-teal-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {h.action?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{h.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-[10px]" />
                      {h.performed_by_name || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-[10px]" />
                      {new Date(h.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────── Highlight Modal ────────────────────────────── */
function HighlightModal({ selectedText, onClose, onSubmit, visibleTo, setVisibleTo }) {
  const [color, setColor] = useState(HIGHLIGHT_COLORS[0]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <FaHighlighter /> Add Highlight
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Selected Text</label>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200 max-h-24 overflow-y-auto">
               {`"${selectedText}"`}
            </p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Highlight Color</label>
            <div className="flex gap-2">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    color.value === c.value ? "border-gray-800 scale-110 shadow-md" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Visible To</label>
            <div className="flex gap-3">
              <button
                onClick={() => setVisibleTo("all")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all ${
                  visibleTo === "all"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <FaEye className="inline mr-1.5" /> All Users
              </button>
              <button
                onClick={() => setVisibleTo("admin_hr")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all ${
                  visibleTo === "admin_hr"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <FaUser className="inline mr-1.5" /> Admin & HR
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(color)}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg transition"
          >
            Highlight
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────── Change Request Modal ───────────────────────── */
function ChangeRequestModal({ selectedText, onClose, onSubmit }) {
  const [suggestedText, setSuggestedText] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <FaExchangeAlt /> Request Change
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Original Text</label>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200 max-h-24 overflow-y-auto">
              
               {`"${selectedText}"`}
            </p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Suggested Change</label>
            <textarea
              value={suggestedText}
              onChange={(e) => setSuggestedText(e.target.value)}
              rows={3}
              placeholder="Enter your suggested text..."
              className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Note (optional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for change..."
              className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(suggestedText, note)}
            disabled={!suggestedText.trim()}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────── Comment Modal ───────────────────────── */
function CommentModal({ onClose, onSubmit }) {
  const [commentText, setCommentText] = useState("");
  const [visibleTo, setVisibleTo] = useState("all");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <FaComment /> Add Comment
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Comment</label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              placeholder="Write your comment here..."
              className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Visible To</label>
            <div className="flex gap-3">
              <button
                onClick={() => setVisibleTo("all")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all ${
                  visibleTo === "all"
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <FaEye className="inline mr-1.5" /> All Users
              </button>
              <button
                onClick={() => setVisibleTo("admin_hr")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all ${
                  visibleTo === "admin_hr"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <FaUser className="inline mr-1.5" /> Admin & HR
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(commentText, visibleTo)}
            disabled={!commentText.trim()}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════════════ */
function CompanyBonusPage() {
  const router = useRouter();
  const editorRef = useRef(null);

  /* ── state ── */
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bonusContent, setBonusContent] = useState("");
  const [bonusId, setBonusId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [highlights, setHighlights] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);

  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [highlightVisibility, setHighlightVisibility] = useState("all");
  const [showHistory, setShowHistory] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);

  const uniqueId = typeof window !== 'undefined' ? localStorage.getItem("uniqueId") : null;

  /* ── fetch user ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        setUserRole(res.data.role);
        setUserEmail(res.data.email);
        setUserName(res.data.fname);
        setUserId(res.data.unique_id);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── fetch bonus + annotations ── */
  const fetchBonus = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company-bonus?account_no=${uniqueId}`,
        { withCredentials: true }
      );
      if (res.data.bonus) {
        setBonusContent(res.data.bonus.content || "");
        setBonusId(res.data.bonus.id);
      }
    } catch (err) {
      console.error("Failed to fetch bonus:", err);
    }
  }, [uniqueId]);

  const fetchHighlights = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company-bonus/highlights?account_no=${uniqueId}`,
        { withCredentials: true }
      );
      setHighlights(res.data.highlights || []);
    } catch (err) {
      console.error("Failed to fetch highlights:", err);
    }
  }, [uniqueId]);

  const fetchChangeRequests = useCallback(async () => {
    if (userRole !== 1 && userRole !== 5) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company-bonus/change-requests?account_no=${uniqueId}`,
        { withCredentials: true }
      );
      setChangeRequests(res.data.changeRequests || []);
    } catch (err) {
      console.error("Failed to fetch change requests:", err);
    }
  }, [userRole, uniqueId]);

  const fetchComments = useCallback(async () => {
    if (userRole !== 1 && userRole !== 5) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company-bonus/comments?account_no=${uniqueId}`,
        { withCredentials: true }
      );
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  }, [userRole, uniqueId]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company-bonus/history?account_no=${uniqueId}`,
        { withCredentials: true }
      );
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }, [uniqueId]);

  useEffect(() => {
    if (userRole !== null) {
      fetchBonus();
      fetchHighlights();
      fetchChangeRequests();
      fetchComments();
      fetchHistory();
    }
  }, [userRole, fetchBonus, fetchHighlights, fetchChangeRequests, fetchComments, fetchHistory]);

  /* ── set editor content when editing starts ── */
  useEffect(() => {
    if (isEditing && editorRef.current && bonusContent) {
      editorRef.current.innerHTML = bonusContent;
    }
  }, [isEditing, bonusContent]);

  /* ── handlers ── */
  const handleSaveBonus = async () => {
    if (userRole !== 1) return;
    setSaving(true);
    try {
      const content = editorRef.current?.innerHTML || "";
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company-bonus`,
        { content, account_no: uniqueId },
        { withCredentials: true }
      );
      setBonusContent(content);
      setIsEditing(false);
      fetchHistory();
    } catch (err) {
      console.error("Failed to save bonus:", err);
      alert("Failed to save bonus");
    } finally {
      setSaving(false);
    }
  };

  const getSelectedText = () => {
    const selection = window.getSelection();
    return selection ? selection.toString().trim() : "";
  };

  const handleHighlightClick = () => {
    const text = getSelectedText();
    if (!text) { alert("Please select some text to highlight."); return; }
    setSelectedText(text);
    setShowHighlightModal(true);
  };

  const handleChangeRequestClick = () => {
    const text = getSelectedText();
    if (!text) { alert("Please select some text to request a change."); return; }
    setSelectedText(text);
    setShowChangeRequestModal(true);
  };

  const submitHighlight = async (color) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company-bonus/highlights`,
        {
          text: selectedText,
          color: color.border,
          bgColor: color.value,
          visible_to: highlightVisibility,
          account_no: uniqueId,
        },
        { withCredentials: true }
      );
      setShowHighlightModal(false);
      setSelectedText("");
      fetchHighlights();
      fetchHistory();
    } catch (err) {
      console.error("Failed to add highlight:", err);
      alert("Failed to add highlight");
    }
  };

  const submitChangeRequest = async (suggestedText, note) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company-bonus/change-requests`,
        {
          original_text: selectedText,
          suggested_text: suggestedText,
          note,
          account_no: uniqueId,
        },
        { withCredentials: true }
      );
      setShowChangeRequestModal(false);
      setSelectedText("");
      fetchChangeRequests();
      fetchHistory();
    } catch (err) {
      console.error("Failed to submit change request:", err);
      alert("Failed to submit change request");
    }
  };

  const submitComment = async (commentText, visibleTo) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company-bonus/comments`,
        {
          comment_text: commentText,
          visible_to: visibleTo,
          account_no: uniqueId,
        },
        { withCredentials: true }
      );
      setShowCommentModal(false);
      fetchComments();
      fetchHistory();
    } catch (err) {
      console.error("Failed to post comment:", err);
      alert("Failed to post comment");
    }
  };

  const deleteHighlight = async (id) => {
    if (!confirm("Remove this highlight?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company-bonus/highlights/${id}?account_no=${uniqueId}`,
        { withCredentials: true }
      );
      fetchHighlights();
      fetchHistory();
    } catch (err) {
      console.error("Failed to delete highlight:", err);
    }
  };

  const handleApproveChangeRequest = async (id, status) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company-bonus/change-requests/${id}`,
        { status, account_no: uniqueId },
        { withCredentials: true }
      );
      fetchChangeRequests();
      fetchHistory();
    } catch (err) {
      console.error("Failed to update change request:", err);
    }
  };

  const deleteComment = async (id) => {
    if (!confirm("Remove this comment?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/company-bonus/comments/${id}?account_no=${uniqueId}`,
        { withCredentials: true }
      );
      fetchComments();
      fetchHistory();
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const getDisplayContent = () => {
    let content = bonusContent;
    if (!content) return "";

    const visibleHighlights = highlights.filter((h) => {
      if (h.visible_to === "all") return true;
      if (h.visible_to === "admin_hr" && (userRole === 1 || userRole === 5)) return true;
      return false;
    });

    visibleHighlights.forEach((h) => {
      if (h.text && content.includes(h.text)) {
        const escapedText = h.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(?!<[^>]*)(${escapedText})(?![^<]*>)`, "g");
        content = content.replace(
          regex,
          `<mark style="background-color:${h.bg_color || "#FEF08A"};border-bottom:2px solid ${h.color || "#EAB308"};padding:2px 4px;border-radius:4px;" title="Highlighted by ${h.created_by_name || "Unknown"}">$1</mark>`
        );
      }
    });

    return content;
  };

  /* ── redirect clients ── */
  if (!loading && userRole === 4) {
    router.push("/dashboard");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const isAdminOrHR = userRole === 1 || userRole === 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* ── Header ── */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/50 mb-6 sm:mb-8 overflow-hidden">
          <div className="h-1.5 sm:h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href="/Dashboard">
                  <button className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-600">
                    <FaArrowLeft />
                  </button>
                </Link>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Company Bonus
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Official company bonus structure and guidelines
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isAdminOrHR && (
                  <button
                    onClick={handleHighlightClick}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-yellow-50 border border-yellow-300 text-yellow-700 hover:bg-yellow-100 transition text-xs sm:text-sm font-semibold"
                  >
                    <FaHighlighter /> Highlight
                  </button>
                )}

                {userRole === 5 && (
                  <button
                    onClick={handleChangeRequestClick}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-orange-50 border border-orange-300 text-orange-700 hover:bg-orange-100 transition text-xs sm:text-sm font-semibold"
                  >
                    <FaExchangeAlt /> Request Change
                  </button>
                )}

                {isAdminOrHR && (
                  <button
                    onClick={() => setShowCommentModal(true)}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-teal-50 border border-teal-300 text-teal-700 hover:bg-teal-100 transition text-xs sm:text-sm font-semibold"
                  >
                    <FaComment /> Comment
                  </button>
                )}

                {isAdminOrHR && (
                  <button
                    onClick={() => setShowSidePanel(!showSidePanel)}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-xs sm:text-sm font-semibold"
                  >
                    <FaHistory /> {showSidePanel ? "Hide Panel" : "Show Panel"}
                  </button>
                )}

                {userRole === 1 && (
                  <>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition text-xs sm:text-sm font-semibold"
                        >
                          <FaTimes /> Cancel
                        </button>
                        <button
                          onClick={handleSaveBonus}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition text-xs sm:text-sm font-semibold disabled:opacity-50"
                        >
                          <FaSave /> {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition text-xs sm:text-sm font-semibold"
                      >
                        <FaEdit /> Edit Bonus
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div className={`grid gap-6 ${showSidePanel ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}>
          {/* Bonus Content */}
          <div className={showSidePanel ? "lg:col-span-2" : ""}>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              {isEditing && userRole === 1 ? (
                <>
                  <EditorToolbar editorRef={editorRef} />
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="p-4 sm:p-6 lg:p-8 min-h-[400px] sm:min-h-[500px] focus:outline-none prose prose-sm sm:prose max-w-none"
                    style={{ lineHeight: "1.8" }}
                  />
                </>
              ) : (
                <div className="p-4 sm:p-6 lg:p-8">
                  {bonusContent ? (
                    <div
                      className="prose prose-sm sm:prose max-w-none"
                      style={{ lineHeight: "1.8" }}
                      dangerouslySetInnerHTML={{ __html: getDisplayContent() }}
                    />
                  ) : (
                    <div className="text-center py-16 sm:py-20">
                      <div className="text-4xl sm:text-6xl mb-4">💰</div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">
                        No Bonus Structure Published Yet
                      </h3>
                      <p className="text-sm text-gray-500">
                        {userRole === 1
                          ? 'Click "Edit Bonus" to create the company bonus structure.'
                          : "The company bonus structure has not been published yet."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          {showSidePanel && isAdminOrHR && (
            <div className="lg:col-span-1">
              <AnnotationPanel
                highlights={highlights.filter((h) => {
                  if (h.visible_to === "all") return true;
                  if (h.visible_to === "admin_hr" && isAdminOrHR) return true;
                  return false;
                })}
                changeRequests={changeRequests}
                comments={comments.filter((c) => {
                  if (c.visible_to === "all") return true;
                  if (c.visible_to === "admin_hr" && isAdminOrHR) return true;
                  return false;
                })}
                userRole={userRole}
                onDeleteHighlight={deleteHighlight}
                onDeleteChangeRequest={() => {}}
                onApproveChangeRequest={handleApproveChangeRequest}
                onDeleteComment={deleteComment}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                history={history}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showHighlightModal && (
        <HighlightModal
          selectedText={selectedText}
          onClose={() => { setShowHighlightModal(false); setSelectedText(""); }}
          onSubmit={submitHighlight}
          visibleTo={highlightVisibility}
          setVisibleTo={setHighlightVisibility}
        />
      )}

      {showChangeRequestModal && (
        <ChangeRequestModal
          selectedText={selectedText}
          onClose={() => { setShowChangeRequestModal(false); setSelectedText(""); }}
          onSubmit={submitChangeRequest}
        />
      )}

      {showCommentModal && (
        <CommentModal
          onClose={() => setShowCommentModal(false)}
          onSubmit={submitComment}
        />
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}

export default function CompanyBonusWrapper() {
  return (
    <ProtectedRoute>
      <CompanyBonusPage />
    </ProtectedRoute>
  );
}