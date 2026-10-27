"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

export default function AvailableLeave({ uniqueId }) {
  const [paidLeave, setPaidLeave] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uniqueId) return;

    const fetchLeave = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/employee/employees/leave/${uniqueId}`
        );

        // Only take annual_leave
        setPaidLeave(res.data.data?.annual_leave || 0);

      } catch (err) {
        console.error("Error fetching leave data");
      } finally {
        setLoading(false);
      }
    };

    fetchLeave();
  }, [uniqueId]);

  if (loading) {
    return <p className="text-gray-500">Loading paid leave...</p>;
  }

  return (
    <div className="flex items-center justify-center py-6">
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 w-full max-w-sm text-center shadow-sm">
        
        <p className="text-sm text-gray-500 mb-2">
          Available Paid Leave
        </p>

        <p className="text-4xl font-bold text-green-600">
          {paidLeave}
        </p>

        <p className="text-xs text-gray-400 mt-2">
          Days remaining
        </p>

      </div>
    </div>
  );
}