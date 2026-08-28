"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "../../components/Navbar";
import DashboardModule from "../../components/DashboardModule";
import AttendanceRecords from "../../components/AttendanceRecords";
import { FaCalendarCheck, FaCalendarAlt } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";
import LeaveRequest from "../../components/LeaveRequestForm";
import AvailableLeave from "../../components/AvailableLeave";
import PromotionHub from "../../components/PromotionHub";
// import { FaCalendarAlt } from "react-icons/fa";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const uniqueId = localStorage.getItem("uniqueId");
        if (!uniqueId) {
          setError("No employee ID found. Please log in again.");
          setLoading(false);
          return;
        }
        const response = await axios.get(
          `${API_BASE_URL}/employee/employees/${uniqueId}`
        );
        setEmployee(response.data.data);
      } catch (err) {
        setError("Failed to fetch employee details.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeDetails();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <p className="text-red-500 font-semibold text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push("/sign-in")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar employee={employee} />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome, {employee?.first_name || "Employee First Name"}{" "}
            {employee?.last_name || "Employee Last Name"}!
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your work modules from here
          </p>
        </div>

        {/* ─── MODULE: Attendance Records ─── */}
        <DashboardModule
          title="My Attendance"
          description="View your attendance records and download reports"
          icon={FaCalendarCheck}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          defaultOpen={false}
        >
          <AttendanceRecords
            uniqueId={employee?.unique_id}
            employeeName={employee?.first_name}
          />
        </DashboardModule>

       <DashboardModule
  title="Available Leave"
  description="View your remaining paid leaves"
  icon={FaCalendarAlt}
  iconBgColor="bg-green-100"
  iconColor="text-green-600"
  defaultOpen={false}
>
  <AvailableLeave uniqueId={employee?.unique_id} />
</DashboardModule>

<DashboardModule
  title="Promotion Hub"
  description="Apply for internal opportunities and track your growth"
  icon={FaChartLine} // Import from react-icons
  iconBgColor="bg-purple-100"
  iconColor="text-purple-600"
  defaultOpen={false}
>
  <PromotionHub uniqueId={employee?.unique_id} />
</DashboardModule>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            <span className="font-bold text-blue-600">KIOTEL</span> Employee Portal
          </p>
        </div>
      </div>
    </div>
  );
}