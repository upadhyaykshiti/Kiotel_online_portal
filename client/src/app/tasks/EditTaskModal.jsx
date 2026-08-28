
"use client";

import React, { useState } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';
const API_BASE2 = process.env.NEXT_PUBLIC_URL_ext || 'http://localhost:3001/api';

const EditTaskModal = ({ task, onClose, onTaskUpdated }) => {
  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority_level || "medium");

  const initialDays = typeof task.recurring_days === 'string'
    ? JSON.parse(task.recurring_days)
    : (task.recurring_days || []);
  const [recurringDays, setRecurringDays] = useState(initialDays);

  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const toggleDay = (day) => {
    setRecurringDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSubmit = async () => {
    setSubmitError("");
    if (!title.trim() || !description.trim()) {
      setSubmitError("Please fill in all required fields (Title and Description).");
      return;
    }
    if (task.kind === "recurring" && recurringDays.length === 0) {
      setSubmitError("Please select at least one recurring day.");
      return;
    }

    setIsSubmitting(true);
    try {
      const externalApiToken = process.env.NEXT_PUBLIC_EXTERNAL_API_TOKEN;
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority_level: priority,
      };
      if (task.kind === "recurring") payload.recurring_days = recurringDays;

      if (task.hk_task_id) {
        try {
          await axios.patch(`${API_BASE2}api/v1/external/tasks/${task.hk_task_id}`, payload, {
            headers: { Authorization: `Bearer ${externalApiToken}` }
          });
        } catch (extErr) {
          throw new Error(`External API Error: ${extErr.response?.data?.error || extErr.message}`);
        }
      }

      await axios.patch(`${API_BASE}/v1/internal/tasks/${task.id}`, payload, { withCredentials: true });
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error("Error updating task:", err);
      setSubmitError(err.message || "Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');`}</style>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-stone-200/80 flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-stone-100">
            <div>
              <h2 className="text-base font-semibold text-stone-900">Edit Task</h2>
              <p className="text-xs text-stone-400 mt-0.5">Update the task details below</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">

            {/* Error */}
            {submitError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{submitError}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400 mb-2">Title <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-300 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400 mb-2">Description <span className="text-red-400">*</span></label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-300 resize-none transition-all"
              />
            </div>

            {/* Priority & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400 mb-2">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-300 bg-white transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400 mb-2">Type</label>
                <div className="w-full border border-stone-100 rounded-xl px-4 py-2.5 text-sm bg-stone-50 text-stone-400 cursor-not-allowed flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-stone-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {task.kind === 'one_time' ? 'One-time' : 'Recurring'}
                </div>
              </div>
            </div>

            {/* Recurring Days */}
            {task.kind === "recurring" && (
              <div>
                <label className="block text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400 mb-3">Recurring Days <span className="text-red-400">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-2 rounded-xl border text-xs font-semibold tracking-wide transition-all ${recurringDays.includes(day) ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50"}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata hint */}
            <div className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-stone-400 mb-2">Task Info</p>
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-[10px] text-stone-400 mb-0.5">Device</p>
                  <p className="text-xs font-mono font-medium text-stone-700">{task.device_id || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 mb-0.5">Task ID</p>
                  <p className="text-xs font-mono font-medium text-stone-700">{task.id || '—'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3 bg-stone-50/40 rounded-b-2xl">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-stone-200 rounded-xl bg-white text-stone-700 hover:bg-stone-50 transition-all font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTaskModal;