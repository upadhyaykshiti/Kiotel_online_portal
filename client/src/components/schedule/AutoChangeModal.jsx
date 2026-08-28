// src/components/schedule/AutoChangeModal.jsx
//
// The "AUTO Change" panel. Shows what the nightly job flips missed clock-ins
// to, lets an admin change that target, and lists every entry it has touched
// with the employee + shift so it can be reviewed and reverted.
//
// Reverting puts the entry back to ASSIGNED but leaves auto_marked_at set, so
// the job will not mark it a second time — see backend/jobs/markMissedAsOff.js.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { format, subDays } from 'date-fns';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const STATE_TABS = [
  { id: 'active', label: 'Auto-marked' },
  { id: 'reverted', label: 'Reverted' },
  { id: 'edited', label: 'Edited since' },
  { id: 'all', label: 'All' },
];

// Mirrors the `leaveTypes` colours in app/schedule/page.jsx so a status reads
// the same here as it does in the grid.
const STATUS_COLORS = {
  ASSIGNED: 'bg-blue-100 text-blue-800',
  PTO_REQUESTED: 'bg-gray-800 text-red-400',
  PTO_APPROVED: 'bg-purple-100 text-purple-800',
  FESTIVE_LEAVE: 'bg-pink-100 text-pink-800',
  UNAVAILABLE: 'bg-green-100 text-green-800',
  OFF: 'bg-red-100 text-red-800',
  LLOP_EX: 'bg-gray-800 text-red-400',
};

const StatusPill = ({ status, label }) => (
  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-700'}`}>
    {label || status}
  </span>
);

const AutoChangeModal = ({ isOpen, onClose, userRole, onReverted }) => {
  const [settings, setSettings] = useState(null);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, reverted: 0, edited: 0 });
  const [truncated, setTruncated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [activeTab, setActiveTab] = useState('active');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [draftStatus, setDraftStatus] = useState('');
  const [search, setSearch] = useState('');

  const [range, setRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  const canManage = [1, 5, '1', '5'].includes(userRole);

  const loadSettings = useCallback(async () => {
    const res = await axios.get(`${API}/api/auto-mark/settings`, { withCredentials: true });
    setSettings(res.data);
    setDraftStatus(res.data.target_status);
  }, []);

  const loadEntries = useCallback(async () => {
    const res = await axios.get(`${API}/api/auto-mark/entries`, {
      params: { from: range.from, to: range.to },
      withCredentials: true,
    });
    setEntries(res.data.entries || []);
    setSummary(res.data.summary || { total: 0, active: 0, reverted: 0, edited: 0 });
    setTruncated(!!res.data.truncated);
  }, [range.from, range.to]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadSettings(), loadEntries()]);
    } catch (err) {
      const status = err.response?.status;
      setError(
        status === 401
          ? 'Your session has expired — please sign in again.'
          : status === 403
            ? 'You do not have permission to view this panel.'
            : err.response?.data?.message || 'Could not load auto-change data.'
      );
    } finally {
      setLoading(false);
    }
  }, [loadSettings, loadEntries]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds(new Set());
    setNotice(null);
    refresh();
  }, [isOpen, refresh]);

  const visibleEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries
      .filter((e) => activeTab === 'all' || e.state === activeTab)
      .filter((e) =>
        !term ||
        e.employee_name.toLowerCase().includes(term) ||
        (e.employee_unique_id || '').toLowerCase().includes(term) ||
        (e.shift_name || '').toLowerCase().includes(term) ||
        (e.property_name || '').toLowerCase().includes(term)
      );
  }, [entries, activeTab, search]);

  // Only entries still sitting at what the job set them to can be reverted —
  // the backend enforces this too, this just keeps the checkboxes honest.
  const revertableVisible = useMemo(
    () => visibleEntries.filter((e) => e.state === 'active'),
    [visibleEntries]
  );

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allVisibleSelected =
    revertableVisible.length > 0 && revertableVisible.every((e) => selectedIds.has(e.id));

  const toggleAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) revertableVisible.forEach((e) => next.delete(e.id));
      else revertableVisible.forEach((e) => next.add(e.id));
      return next;
    });
  };

  const handleSaveStatus = async () => {
    if (!draftStatus || draftStatus === settings?.target_status) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await axios.put(
        `${API}/api/auto-mark/settings`,
        { target_status: draftStatus },
        { withCredentials: true }
      );
      setNotice(`${res.data.message}. ${res.data.note}`);
      await loadSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the target status.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await axios.put(
        `${API}/api/auto-mark/settings`,
        { is_enabled: !settings.is_enabled },
        { withCredentials: true }
      );
      setNotice(res.data.is_enabled ? 'Auto-change switched ON.' : 'Auto-change switched OFF.');
      await loadSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change the on/off switch.');
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = async () => {
    if (!selectedIds.size) return;
    setReverting(true);
    setError(null);
    setNotice(null);
    try {
      const res = await axios.post(
        `${API}/api/auto-mark/revert`,
        { entry_ids: Array.from(selectedIds) },
        { withCredentials: true }
      );
      setNotice(
        res.data.skipped
          ? `${res.data.message} ${res.data.skipped} skipped (already edited by hand).`
          : res.data.message
      );
      setSelectedIds(new Set());
      await loadEntries();
      onReverted?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not revert the selected entries.');
    } finally {
      setReverting(false);
    }
  };

  if (!isOpen) return null;

  const targetLabel = settings?.target_label || '—';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b flex-shrink-0">
          <div>
            <h3 className="font-bold text-2xl text-slate-800">AUTO Change</h3>
            <p className="text-sm text-slate-500 mt-1">
              Scheduled shifts with no clock-in are changed automatically
              {settings && ` ${settings.grace_hours}h after the day ends`}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none px-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Settings strip */}
        <div className="p-6 border-b bg-slate-50 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Currently changing missed shifts to
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <StatusPill status={settings?.target_status} label={targetLabel} />
                <span className="text-xs text-slate-400 font-mono">{settings?.target_status}</span>
                {settings && !settings.is_enabled && (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                    PAUSED
                  </span>
                )}
              </div>
            </div>

            {canManage && settings && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    Change to
                  </label>
                  <select
                    value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value)}
                    className="p-3 border border-slate-300 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 min-w-[190px]"
                  >
                    {(settings.options || []).map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSaveStatus}
                  disabled={saving || draftStatus === settings.target_status}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-medium transition-all shadow-md"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={handleToggleEnabled}
                  disabled={saving}
                  className="bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 text-slate-700 px-5 py-3 rounded-xl font-medium transition-colors"
                >
                  {settings.is_enabled ? 'Pause' : 'Resume'}
                </button>
              </div>
            )}
          </div>

          {settings && (
            <p className="text-xs text-slate-500 mt-3">
              Applies from {settings.start_date} onward. Changing the target affects future runs only —
              entries already changed keep what they were given.
              {settings.updated_by && ` Last changed by ${settings.updated_by}.`}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b flex flex-col lg:flex-row lg:items-center gap-3 flex-shrink-0">
          <div className="flex gap-2 flex-wrap">
            {STATE_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === t.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
                <span className="ml-1.5 opacity-70">
                  {t.id === 'all' ? summary.total : summary[t.id] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
              className="p-2 border border-slate-300 rounded-lg text-sm text-slate-700"
            />
            <span className="text-slate-400 text-sm">to</span>
            <input
              type="date"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
              className="p-2 border border-slate-300 rounded-lg text-sm text-slate-700"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee / shift"
              className="p-2 border border-slate-300 rounded-lg text-sm text-slate-700 w-48"
            />
            <button
              onClick={refresh}
              disabled={loading}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700"
            >
              {loading ? '…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {(error || notice) && (
          <div className="px-6 pt-4 flex-shrink-0">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            {notice && !error && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl px-4 py-3">
                {notice}
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="text-center text-slate-500 py-12">Loading…</div>
          ) : visibleEntries.length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              No entries in this view for {range.from} → {range.to}.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500 border-b">
                <tr>
                  <th className="py-2 pr-3 w-8">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      disabled={!canManage || revertableVisible.length === 0}
                      className="w-4 h-4 rounded border-slate-300 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </th>
                  <th className="py-2 pr-3">Employee</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Scheduled shift</th>
                  <th className="py-2 pr-3">Changed to</th>
                  <th className="py-2 pr-3">Now</th>
                  <th className="py-2 pr-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-3 align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(e.id)}
                        onChange={() => toggleOne(e.id)}
                        disabled={!canManage || e.state !== 'active'}
                        title={e.state !== 'active' ? 'Only auto-marked entries can be reverted' : ''}
                        className="w-4 h-4 rounded border-slate-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                      />
                    </td>
                    <td className="py-3 pr-3 align-top">
                      <div className="font-medium text-slate-800">{e.employee_name}</div>
                      <div className="text-xs text-slate-400 font-mono">{e.employee_unique_id}</div>
                    </td>
                    <td className="py-3 pr-3 align-top whitespace-nowrap text-slate-700">
                      {format(new Date(`${e.entry_date}T00:00:00`), 'EEE, MMM d')}
                    </td>
                    <td className="py-3 pr-3 align-top">
                      {e.shift_name ? (
                        <>
                          <div className="text-slate-800">{e.shift_name}</div>
                          <div className="text-xs text-slate-500">
                            {e.shift_start}–{e.shift_end}
                            {e.property_name ? ` · ${e.property_name}` : ''}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400">
                          {e.property_name || 'No shift type'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3 align-top">
                      <StatusPill status={e.auto_marked_status} label={e.auto_marked_label} />
                    </td>
                    <td className="py-3 pr-3 align-top">
                      {e.state === 'active' ? (
                        <span className="text-xs text-slate-400">unchanged</span>
                      ) : (
                        <StatusPill status={e.assignment_status} label={e.current_label} />
                      )}
                    </td>
                    <td className="py-3 pr-3 align-top text-xs text-slate-500 whitespace-nowrap">
                      {e.auto_marked_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {truncated && (
            <p className="text-xs text-amber-700 mt-4">
              Showing the most recent results only — narrow the date range to see the rest.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-6 border-t flex-shrink-0">
          <div className="text-sm text-slate-500">
            {selectedIds.size > 0
              ? `${selectedIds.size} selected — reverting restores them to Assigned and they will not be auto-changed again.`
              : canManage
                ? 'Select auto-marked rows to revert them.'
                : 'View only — ask an admin to make changes.'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleRevert}
              disabled={!canManage || reverting || selectedIds.size === 0}
              className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md"
            >
              {reverting ? 'Reverting…' : `Revert${selectedIds.size ? ` (${selectedIds.size})` : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoChangeModal;
