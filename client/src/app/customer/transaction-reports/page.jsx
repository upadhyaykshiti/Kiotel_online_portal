



"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import ShellLayout from "../../ShellLayout"; 

const STATUS_OPTIONS = ["ongoing", "completed", "timed-out"];
const PAGE_LIMIT = 25;

function statusPillClass(status) {
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "ongoing") return "bg-amber-100 text-amber-700";
  if (status === "timed-out") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

function formatUTC(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function TransactionReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("device_id") || "";
  const propertyName = searchParams.get("property_name") || "";

  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ data: [], total: 0, limit: PAGE_LIMIT });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!deviceId) {
      router.replace("/customer");
    }
  }, [deviceId, router]);

  useEffect(() => {
    if (!deviceId) return;
    const fetchReports = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const externalApiToken = process.env.NEXT_PUBLIC_EXTERNAL_API_TOKEN;
        const params = { device_id: deviceId, page, limit: PAGE_LIMIT };
        if (status) params.status = status;
        if (startDate) params.start = startDate;
        if (endDate) params.end = endDate;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_URL_ext}api/v1/external/transaction-reports`,
          {
            headers: { Authorization: `Bearer ${externalApiToken}` },
            params,
          }
        );
        setData({
          data: res.data.data || [],
          total: res.data.total || 0,
          limit: res.data.limit || PAGE_LIMIT,
        });
      } catch (err) {
        const msg = err.response?.data?.error || err.message || "Failed to load reports";
        setErrorMsg(msg);
        setData({ data: [], total: 0, limit: PAGE_LIMIT });
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [deviceId, status, startDate, endDate, page]);

  const totalPages = Math.max(1, Math.ceil(data.total / (data.limit || PAGE_LIMIT)));

  const goToDetail = (sessionId) => {
    const qs = new URLSearchParams({
      device_id: deviceId,
      property_name: propertyName,
      page: String(page),
    });
    if (status) qs.set("status", status);
    if (startDate) qs.set("start", startDate);
    if (endDate) qs.set("end", endDate);
    router.push(`/customer/transaction-reports/${encodeURIComponent(sessionId)}?${qs.toString()}`);
  };

  const updateFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="space-y-2">
          <button
            onClick={() => router.push("/customer")}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Transaction Reports</h1>
          {propertyName && (
            <p className="text-sm text-slate-500">
              Property: <span className="font-medium text-slate-700">{propertyName}</span>
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => updateFilter(setStatus)(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none min-w-[160px]"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => updateFilter(setStartDate)(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => updateFilter(setEndDate)(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            {(status || startDate || endDate) && (
              <button
                onClick={() => { setStatus(""); setStartDate(""); setEndDate(""); setPage(1); }}
                className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear filters
              </button>
            )}
            <div className="ml-auto text-sm text-slate-500">
              Total: <span className="font-semibold text-slate-900">{data.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Session ID</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Guest</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Date &amp; Time
                    <span className="ml-2 text-[10px] font-medium text-slate-400 normal-case">(UTC)</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center">
                      <div className="w-7 h-7 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-xs text-slate-400">Loading reports...</p>
                    </td>
                  </tr>
                ) : errorMsg ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-rose-600">{errorMsg}</td>
                  </tr>
                ) : data.data.length > 0 ? (
                  data.data.map((row) => {
                    const guest = (row.guest_name || "").trim();
                    return (
                      <tr
                        key={row.session_id}
                        onClick={() => goToDetail(row.session_id)}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3 font-mono text-xs text-slate-700" title={row.session_id}>
                          {row.session_id?.slice(0, 8)}…
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-700">
                          {guest || "-"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusPillClass(row.status)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-700 font-mono">
                          {formatUTC(row.start_time)}
                          <span className="ml-2 text-[10px] text-slate-400">UTC</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-slate-500">
                      No transaction reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ‹ Prev
            </button>
            <p className="text-xs text-slate-500">
              Page <span className="font-semibold text-slate-900">{page}</span> of <span className="font-semibold text-slate-900">{totalPages}</span>
            </p>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next ›
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// export default function TransactionReportsPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="w-8 h-8 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
//       </div>
//     }>
//       <TransactionReportsContent />
//     </Suspense>
//   );
// }

export default function TransactionReportsPage() {
  return (
    <ShellLayout>
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      }>
        <TransactionReportsContent />
      </Suspense>
    </ShellLayout>
  );
}
