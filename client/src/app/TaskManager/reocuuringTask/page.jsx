"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";

export default function RecurringTasksPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const dayName = (n) => {
    const map = {
      1: "Mon",
      2: "Tue",
      3: "Wed",
      4: "Thu",
      5: "Fri",
      6: "Sat",
      7: "Sun",
    };
    return map[Number(n)] || "";
  };

  useEffect(() => {
    const fetchRecurring = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recurring_tasks`,
          { withCredentials: true }
        );
        setRows(res.data || []);
      } catch (e) {
        console.error("Failed to fetch recurring tasks", e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecurring();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-700 text-sm">Loading recurring tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-5">
      {/* Header */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-3 sm:p-4 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/TaskManager")}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200 focus:outline-none"
            >
              <FaArrowLeft className="mr-1.5" /> Back
            </button>

            <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>

            <h1 className="text-lg font-bold text-gray-900 flex items-center">
              <FaCalendarAlt className="mr-2 text-orange-600" />
              Recurring Tasks
            </h1>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Recurrence
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Weekly Day
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Monthly Date
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Start
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  End
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No recurring tasks found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-2 whitespace-nowrap">{r.id}</td>

                    <td className="px-4 py-2">
                      <div className="text-sm font-semibold text-gray-900 truncate max-w-[420px]">
                        <Link
                          href={`/TaskManager/task/${r.task_id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                        >
                          {r.task_title || `Task #${r.task_id}`}
                        </Link>
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[420px]">
                        {r.task_description || ""}
                      </div>
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        {r.recurrence_type || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap">
                      {r.weekly_day ? dayName(r.weekly_day) : "—"}
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap">{r.monthly_date ?? "—"}</td>

                    <td className="px-4 py-2 whitespace-nowrap">
                      {r.start_date ? new Date(r.start_date).toLocaleDateString() : "—"}
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap">
                      {r.end_date ? new Date(r.end_date).toLocaleDateString() : "—"}
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}