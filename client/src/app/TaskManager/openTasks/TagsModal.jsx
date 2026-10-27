"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FaTimes, FaPlus, FaTag, FaSpinner } from "react-icons/fa";

const overlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
const content = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};
const tagItem = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.03, duration: 0.2 } }),
};

export default function TagsModal({ isOpen, onClose }) {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => { if (isOpen) fetchTags(); }, [isOpen]);

  const fetchTags = async () => {
    try { setLoading(true); const r = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/task/api/tags`); setTags(r.data); }
    catch { toast.error("Failed to fetch tags"); }
    finally { setLoading(false); }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) { toast.warning("Tag name cannot be empty"); return; }
    try { setCreating(true); await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/task/api/tags`, { tag: newTagName.trim() }, { withCredentials: true }); setNewTagName(""); toast.success("Tag created!"); fetchTags(); }
    catch { toast.error("Failed to create tag"); }
    finally { setCreating(false); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div variants={overlay} initial="hidden" animate="visible" exit="exit"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <motion.div variants={content} initial="hidden" animate="visible" exit="exit"
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <FaTag className="text-[13px] text-violet-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Manage Tags</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><FaTimes /></button>
          </div>

          {/* Create Form */}
          <div className="px-6 py-4 border-b border-slate-100">
            <form onSubmit={handleCreateTag} className="flex gap-2">
              <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Enter new tag name…" disabled={creating}
                className="flex-1 px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400 disabled:opacity-60" />
              <button type="submit" disabled={creating || !newTagName.trim()}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-lg transition-all ${creating || !newTagName.trim() ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"}`}>
                {creating ? <FaSpinner className="text-[11px] animate-spin" /> : <FaPlus className="text-[10px]" />} Add
              </button>
            </form>
          </div>

          {/* Tags List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Current Tags</h4>
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">{tags.length}</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
                </div>
              </div>
            ) : tags.length > 0 ? (
              <div className="space-y-1.5">
                {tags.map((tag, i) => (
                  <motion.div key={tag.id} custom={i} variants={tagItem} initial="hidden" animate="visible"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100/80 transition-all group">
                    <div className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                    <span className="text-[13px] text-slate-700 font-medium">{tag.tag}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaTag className="text-slate-400" />
                </div>
                <p className="text-[13px] text-slate-500">No tags yet</p>
                <p className="text-[11px] text-slate-400 mt-1">Create your first tag above</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}