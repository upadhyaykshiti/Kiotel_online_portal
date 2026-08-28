"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const REFRESH_INTERVAL = 20; // seconds

export default function ActiveAgentsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [error, setError] = useState("");
  const [agents, setAgents] = useState([]);
  const [summary, setSummary] = useState({ total_active: 0, total_agents: 0 });
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("duration");
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [isPaused, setIsPaused] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const countdownRef = useRef(null);
  const fetchRef = useRef(null);
  const router = useRouter();

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        if (res.data.role !== 1) {
          router.push("/Dashboard");
          return;
        }
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to authenticate");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  // Fetch active agents — no loading spinner on subsequent calls (silent refresh)
  const fetchActiveAgents = useCallback(async (isManual = false) => {
    if (isFirstLoad) setLoadingAgents(true);
    try {
      const res = await axios.get(`${API_BASE}/clockin/admin/active-agents`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setAgents(res.data.data || []);
        setSummary(res.data.summary || { total_active: 0, total_agents: 0 });
        setLastRefreshed(new Date());
        setIsFirstLoad(false);
      }
    } catch (err) {
      console.error("Failed to fetch active agents:", err);
    } finally {
      setLoadingAgents(false);
      setCountdown(REFRESH_INTERVAL); // reset countdown after each fetch
    }
  }, [isFirstLoad]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchActiveAgents();
    }
  }, [user, fetchActiveAgents]);

  // Countdown timer — ticks every second
  useEffect(() => {
    if (!user || isPaused) return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Time to refresh
          fetchActiveAgents();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [user, isPaused, fetchActiveAgents]);

  // Live duration ticker — updates active_duration every second without API call
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const liveTicker = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(liveTicker);
  }, []);

  // Calculate live duration from active_minutes (incremented locally each tick)
  const getLiveDuration = (agent) => {
    if (!lastRefreshed) return agent.active_duration;
    const secondsSinceRefresh = Math.floor((Date.now() - lastRefreshed.getTime()) / 1000);
    const totalMinutes = agent.active_minutes + Math.floor(secondsSinceRefresh / 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getLiveMinutes = (agent) => {
    if (!lastRefreshed) return agent.active_minutes;
    const secondsSinceRefresh = Math.floor((Date.now() - lastRefreshed.getTime()) / 1000);
    return agent.active_minutes + Math.floor(secondsSinceRefresh / 60);
  };

  // Manual refresh
  const handleManualRefresh = () => {
    fetchActiveAgents(true);
    setCountdown(REFRESH_INTERVAL);
  };

  // Filter and sort
  const filtered = agents
    .filter((a) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.unique_id.toLowerCase().includes(q) ||
        a.shift_name.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "duration") return getLiveMinutes(b) - getLiveMinutes(a);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "shift") return a.shift_name.localeCompare(b.shift_name);
      return 0;
    });

  const activePercent =
    summary.total_agents > 0
      ? Math.round((summary.total_active / summary.total_agents) * 100)
      : 0;

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Access Denied</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.3s ease-out forwards; opacity: 0; }
        .fade-up-1 { animation-delay: 0.04s; }
        .fade-up-2 { animation-delay: 0.08s; }
        .fade-up-3 { animation-delay: 0.12s; }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .pulse-ring { animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }

        @keyframes live-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .live-blink { animation: live-blink 1.5s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="fade-up">
              <div className="flex items-center gap-2.5 mb-1">
                <button
                  onClick={() => router.push("/Dashboard")}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <h1 className="text-xl font-bold text-slate-900">Active In Office</h1>
                {/* Live indicator */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full ml-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full live-blink"></span>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Live</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 ml-7.5">
                Auto-refreshes every {REFRESH_INTERVAL}s • Durations update in real time
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Countdown ring */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18" cy="18" r="15"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="18" cy="18" r="15"
                      fill="none"
                      stroke={isPaused ? "#94a3b8" : "#2563eb"}
                      strokeWidth="2.5"
                      strokeDasharray={`${(countdown / REFRESH_INTERVAL) * 94.25} 94.25`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-600">
                    {countdown}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isPaused ? "Paused" : "Next refresh"}
                </p>
              </div>

              {/* Pause / Resume */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isPaused
                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
                title={isPaused ? "Resume auto-refresh" : "Pause auto-refresh"}
              >
                {isPaused ? (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                  </svg>
                )}
                <span className="hidden sm:inline">{isPaused ? "Resume" : "Pause"}</span>
              </button>

              {/* Manual Refresh */}
              <button
                onClick={handleManualRefresh}
                disabled={loadingAgents}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <svg className={`w-3.5 h-3.5 ${loadingAgents ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Refresh Now
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5 fade-up fade-up-1">
          {/* Active Now */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Now</p>
              <div className="relative">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full block"></span>
                <span className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full pulse-ring"></span>
              </div>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600">{summary.total_active}</p>
          </div>

          {/* Total Agents */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Agents</p>
            <p className="text-3xl font-extrabold text-slate-900">{summary.total_agents}</p>
          </div>

          {/* Active Rate */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Rate</p>
            <p className="text-3xl font-extrabold text-blue-600">{activePercent}%</p>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${activePercent}%` }}
              ></div>
            </div>
          </div>

          {/* Inactive */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Not Active</p>
            <p className="text-3xl font-extrabold text-slate-400">
              {summary.total_agents - summary.total_active}
            </p>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5 fade-up fade-up-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, ID, or shift..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
          <div className="flex gap-1.5">
            {[
              { key: "duration", label: "Duration" },
              { key: "name", label: "Name" },
              { key: "shift", label: "Shift" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  sortBy === s.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Agent List */}
        <div className="fade-up fade-up-3">
          {loadingAgents && agents.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
              <div className="w-8 h-8 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-400">Loading active agents...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM6.75 9.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {searchQuery ? "No matching agents" : "No Active Agents"}
              </h3>
              <p className="text-sm text-slate-500">
                {searchQuery
                  ? "Try a different search term"
                  : "No agents have clocked in without clocking out yet today."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Table Header — Desktop */}
              <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-5 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <div className="col-span-3">Agent</div>
                <div className="col-span-2">ID</div>
                <div className="col-span-2">Shift</div>
                <div className="col-span-2">Clock In</div>
                <div className="col-span-2">Active Duration</div>
                <div className="col-span-1 text-right">Status</div>
              </div>

              {filtered.map((agent) => {
                const liveMinutes = getLiveMinutes(agent);
                const liveDuration = getLiveDuration(agent);
                const isOvertime = liveMinutes > 480;

                return (
                  <div
                    key={agent.employee_id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    {/* Desktop Row */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center px-5 py-4">
                      {/* Agent */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                            {agent.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 truncate">{agent.name}</p>
                      </div>

                      {/* ID */}
                      <div className="col-span-2">
                        <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                          {agent.unique_id}
                        </span>
                      </div>

                      {/* Shift */}
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-slate-900">{agent.shift_name}</p>
                        {agent.shift_start && agent.shift_end && (
                          <p className="text-[11px] text-slate-400">
                            {agent.shift_start} – {agent.shift_end}
                          </p>
                        )}
                      </div>

                      {/* Clock In */}
                      <div className="col-span-2">
                        <p className="text-sm font-semibold text-slate-900">{agent.clock_in || "—"}</p>
                      </div>

                      {/* Live Duration */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOvertime ? "bg-amber-500" : "bg-emerald-500 live-blink"}`}></div>
                          <p className={`text-sm font-bold tabular-nums ${isOvertime ? "text-amber-600" : "text-slate-900"}`}>
                            {liveDuration}
                          </p>
                        </div>
                        {isOvertime && (
                          <p className="text-[10px] text-amber-500 font-semibold ml-3.5">Overtime</p>
                        )}
                      </div>

                      {/* Status */}
                      <div className="col-span-1 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full live-blink"></span>
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Mobile Card */}
                    <div className="lg:hidden p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                              {agent.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{agent.unique_id}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full live-blink"></span>
                          Active
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Shift</p>
                          <p className="text-xs font-semibold text-slate-900">{agent.shift_name}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Clock In</p>
                          <p className="text-xs font-semibold text-slate-900">{agent.clock_in || "—"}</p>
                        </div>
                        <div className={`rounded-lg px-3 py-2 border ${isOvertime ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100"}`}>
                          <p className={`text-[10px] font-semibold uppercase mb-0.5 ${isOvertime ? "text-amber-500" : "text-blue-500"}`}>Duration</p>
                          <p className={`text-xs font-bold tabular-nums ${isOvertime ? "text-amber-700" : "text-blue-700"}`}>{liveDuration}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Showing {filtered.length} active agent{filtered.length !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
            {lastRefreshed && (
              <p className="text-[11px] text-slate-400">
                Last synced: {lastRefreshed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}