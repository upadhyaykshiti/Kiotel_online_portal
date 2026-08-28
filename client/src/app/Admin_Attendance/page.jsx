'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import EmployeeAttendanceModal from './EmployeeAttendanceModal';
import EmployeeMonthlyPhotosModal from './EmployeeMonthlyPhotosModal';
import {
  FaCalendarAlt,
  FaFileExport,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaTimesCircle,
  FaBriefcase,
  FaChartLine,
  FaSearch,
  FaEdit,
  FaTrash
} from 'react-icons/fa';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';
const API2 = process.env.NEXT_PUBLIC_API_BASE_URL;

const StatusBadge = ({ status }) => {
  const config =
    {
      Present: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: <FaCheckCircle className="text-emerald-600" />
      },
      Late: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: <FaExclamationTriangle className="text-amber-600" />
      },
      'Early Clock Out': {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        icon: <FaClock className="text-orange-600" />
      },
      'Late & Early': {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: <FaExclamationTriangle className="text-purple-600" />
      },
      Missed: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <FaTimesCircle className="text-red-600" />
      },
      Absent: {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-200',
        icon: <FaTimesCircle className="text-rose-600" />
      }
    }[status] || {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
      icon: <span className="text-gray-400">–</span>
    };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-xs border ${config.bg} ${config.text} ${config.border} shadow-sm`}
    >
      {config.icon}
      <span>{status}</span>
    </span>
  );
};

const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="w-20 h-4 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

function formatHHMMForInput(timeRaw) {
  if (!timeRaw || timeRaw === 'Missed') return '';
  if (/^\d{2}:\d{2}$/.test(timeRaw)) return timeRaw;
  if (typeof timeRaw === 'string') {
    if (/AM|PM/i.test(timeRaw)) {
      const isPM = /PM/i.test(timeRaw);
      const timeOnly = timeRaw.replace(/AM|PM/i, '').trim();
      const parts = timeOnly.split(':').map(Number);
      if (parts.length >= 2) {
        let hours = parts[0];
        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        return `${String(hours).padStart(2, '0')}:${String(parts[1]).padStart(2, '0')}`;
      }
    }
    const timeMatch = timeRaw.match(/T?(\d{2}:\d{2})/);
    if (timeMatch) return timeMatch[1].replace('T', '');
    const spaceMatch = timeRaw.match(/\s(\d{2}:\d{2})/);
    if (spaceMatch) return spaceMatch[1];
  }
  const d = new Date(timeRaw);
  if (!isNaN(d.getTime())) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return '';
}

function calculateAttendanceDetails(clockIn, clockOut, shiftStart, shiftEnd, graceMinutes = 0, earlyGraceMinutes = 0) {
  const details = {
    status: 'Absent',
    late_minutes: 0,
    early_clock_out_minutes: 0,
    overtime_minutes: 0,
    penalty_minutes: 0
  };
  if (!clockIn) return details;

  const isVersion2 =
    typeof clockIn === 'string' && clockIn.length <= 20 && !clockIn.includes('T') && !clockIn.includes('Z');
  let clockInDate, clockOutDate;

  if (isVersion2) {
    const today = new Date();
    today.setSeconds(0);
    today.setMilliseconds(0);

    const parseTimeString = (timeStr) => {
      if (!timeStr || timeStr === 'Missed') return null;
      timeStr = timeStr.trim();
      const hasAMPM = /AM|PM/i.test(timeStr);
      if (hasAMPM) {
        const isPM = /PM/i.test(timeStr);
        const timeOnly = timeStr.replace(/AM|PM/i, '').trim();
        const parts = timeOnly.split(':').map((p) => parseInt(p));
        if (parts.length >= 2) {
          let hours = parts[0];
          const minutes = parts[1];
          if (isPM && hours !== 12) hours += 12;
          if (!isPM && hours === 12) hours = 0;
          return { hour: hours, minute: minutes, second: parts[2] || 0 };
        }
      } else {
        const parts = timeStr.split(':').map((p) => parseInt(p));
        if (parts.length >= 2) {
          return { hour: parts[0], minute: parts[1], second: parts[2] || 0 };
        }
      }
      return null;
    };

    const clockInParsed = parseTimeString(clockIn);
    if (clockInParsed) {
      clockInDate = new Date(today);
      clockInDate.setHours(clockInParsed.hour, clockInParsed.minute, clockInParsed.second, 0);
    }

    if (clockOut && clockOut !== 'Missed') {
      const clockOutParsed = parseTimeString(clockOut);
      if (clockOutParsed) {
        clockOutDate = new Date(today);
        clockOutDate.setHours(clockOutParsed.hour, clockOutParsed.minute, clockOutParsed.second, 0);
        if (clockOutDate < clockInDate) {
          clockOutDate.setDate(clockOutDate.getDate() + 1);
        }
      }
    }
  } else {
    clockInDate = new Date(clockIn);
    clockOutDate = clockOut && clockOut !== 'Missed' ? new Date(clockOut) : null;
  }

  if (!clockInDate || isNaN(clockInDate.getTime())) {
    details.status = 'Present';
    return details;
  }

  let parsedShiftStart = null;
  let parsedShiftEnd = null;

  if (shiftStart && typeof shiftStart === 'string') {
    const parts = shiftStart.split(':').map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      parsedShiftStart = { hour: parts[0], minute: parts[1], second: parts[2] || 0 };
    }
  }

  if (shiftEnd && typeof shiftEnd === 'string') {
    const parts = shiftEnd.split(':').map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      parsedShiftEnd = { hour: parts[0], minute: parts[1], second: parts[2] || 0 };
    }
  }

  if (!parsedShiftStart || !parsedShiftEnd) {
    details.status = 'Present';
    return details;
  }

  const shiftStartHour = parsedShiftStart.hour;
  const shiftStartMin = parsedShiftStart.minute;
  const shiftStartSec = parsedShiftStart.second;
  const shiftEndHour = parsedShiftEnd.hour;
  const shiftEndMin = parsedShiftEnd.minute;
  const shiftEndSec = parsedShiftEnd.second;

  const isOvernightShift =
    shiftEndHour < shiftStartHour || (shiftEndHour === shiftStartHour && shiftEndMin < shiftStartMin);

  const shiftStartDate = new Date(clockInDate);
  shiftStartDate.setHours(shiftStartHour, shiftStartMin, shiftStartSec, 0);

  if (isOvernightShift && clockInDate.getHours() < 12 && shiftStartHour >= 12) {
    shiftStartDate.setDate(shiftStartDate.getDate() - 1);
  }

  const timeDiffStart = clockInDate - shiftStartDate;
  const minutesDiffStart = Math.floor(timeDiffStart / 60000);

  if (minutesDiffStart > graceMinutes) {
    details.late_minutes = minutesDiffStart - graceMinutes;
    details.status = 'Late';
  } else {
    details.status = 'Present';
  }

  if (clockOutDate) {
    const shiftEndDate = new Date(clockInDate);
    shiftEndDate.setHours(shiftEndHour, shiftEndMin, shiftEndSec, 0);
    if (isOvernightShift) shiftEndDate.setDate(shiftEndDate.getDate() + 1);

    const timeDiffEnd = clockOutDate - shiftEndDate;
    const minutesDiffEnd = Math.floor(timeDiffEnd / 60000);

    if (minutesDiffEnd < -earlyGraceMinutes) {
      details.early_clock_out_minutes = Math.abs(minutesDiffEnd + earlyGraceMinutes);
      details.status = details.status === 'Late' ? 'Late & Early' : 'Early Clock Out';
      details.overtime_minutes = 0;
    } else if (minutesDiffEnd > 0) {
      details.overtime_minutes = minutesDiffEnd;
      details.early_clock_out_minutes = 0;
    } else {
      details.overtime_minutes = 0;
      details.early_clock_out_minutes = 0;
    }
  }

  details.penalty_minutes = details.late_minutes + details.early_clock_out_minutes;
  return details;
}

export default function AdminDashboard() {
  // ===== Role =====
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const canManage = userRole === 1;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, { withCredentials: true });
        setUserRole(res?.data?.role ?? null);
      } catch (err) {
        console.error('Failed to fetch user role:', err);
        setUserRole(null);
      } finally {
        setRoleLoading(false);
      }
    };
    if (API2) fetchUser();
    else setRoleLoading(false);
  }, []);

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyStartDate, setMonthlyStartDate] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`
  );
  const [monthlyExportType, setMonthlyExportType] = useState('monthly_detailed');

  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [activeTab, setActiveTab] = useState('daily');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [monthlyPhotoEmployee, setMonthlyPhotoEmployee] = useState(null);

  const [availableShifts, setAvailableShifts] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    employee_id: '',
    employee_name: '',
    shift_id: '',
    clock_in_time: '',
    clock_out_time: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    attendance_id: '',
    employee_name: '',
    unique_id: '',
    shift_id: '',
    attendance_date: '',
    clock_in_time: '',
    clock_out_time: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setMonthlyStartDate(`${monthlyYear}-${String(monthlyMonth).padStart(2, '0')}-01`);
  }, [monthlyYear, monthlyMonth]);

  const fetchShifts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/clockin/shifts`);
      const data = await res.json();
      if (Array.isArray(data)) setAvailableShifts(data);
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const fetchDaily = useCallback(async () => {
    setLoadingDaily(true);
    try {
      const res = await fetch(`${API_BASE}/clockin/admin/daily?date=${date}`);
      const result = await res.json();
      const processedData = (result.success ? result.data : []).map((employee) => {
        const shiftStart = employee.shift_start || '09:00:00';
        const shiftEnd = employee.shift_end || '18:00:00';
        const isFlexible = employee.shift_name === 'ADMIN';

        let { status, late_minutes, early_clock_out_minutes, overtime_minutes, penalty_minutes } =
          calculateAttendanceDetails(employee.clock_in, employee.clock_out, shiftStart, shiftEnd, 0, 15);

        if (employee.is_missed) {
          status = 'Missed';
        } else if (isFlexible && employee.clock_in) {
          status = 'Present';
          late_minutes = 0;
          early_clock_out_minutes = 0;
          overtime_minutes = 0;
          penalty_minutes = 0;
        }

        // Apply late waive
        if (employee.is_late_waived) {
          late_minutes = 0;
          penalty_minutes = early_clock_out_minutes;
          if (status === 'Late') status = 'Present';
          if (status === 'Late & Early') status = 'Early Clock Out';
        }

        // Apply early waive
        if (employee.is_early_waived) {
          early_clock_out_minutes = 0;
          penalty_minutes = late_minutes;
          if (status === 'Early Clock Out') status = 'Present';
          if (status === 'Late & Early') status = 'Late';
        }

        // Recalculate penalty after both waives
        penalty_minutes = late_minutes + early_clock_out_minutes;

        return {
          ...employee,
          status,
          late_minutes,
          early_clock_out_minutes,
          penalty_minutes,
          overtime_minutes,
          total_ot_minutes: overtime_minutes
        };
      });
      setDailyData(processedData);
    } catch (err) {
      console.error('Failed to fetch daily data', err);
      setDailyData([]);
    } finally {
      setLoadingDaily(false);
    }
  }, [date]);

  // ===== Waive Late =====
  const handleToggleWaiveLate = async (id, currentStatus) => {
    if (!canManage) return;
    if (!id || String(id).startsWith('absent')) return;
    try {
      const res = await fetch(`${API_BASE}/clockin/admin/daily/waive-late`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_waived: !currentStatus })
      });
      const result = await res.json();
      if (result.success) fetchDaily();
    } catch (err) {
      console.error(err);
    }
  };

  // ===== Waive Early (NEW) =====
  const handleToggleWaiveEarly = async (id, currentStatus) => {
    if (!canManage) return;
    if (!id || String(id).startsWith('absent')) return;
    try {
      const res = await fetch(`${API_BASE}/clockin/admin/daily/waive-early`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_waived: !currentStatus })
      });
      const result = await res.json();
      if (result.success) fetchDaily();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!canManage) return;
    if (!id || String(id).startsWith('absent')) return;
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE}/clockin/admin/record/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) fetchDaily();
      else alert(result.message || 'Failed to delete record');
    } catch (err) {
      console.error('Failed to delete record:', err);
      alert('Error deleting record.');
    }
  };

  const fetchMonthly = useCallback(async () => {
    setLoadingMonthly(true);
    try {
      const res = await fetch(
        `${API_BASE}/clockin/admin/monthly?year=${monthlyYear}&month=${monthlyMonth}&start_date=${monthlyStartDate}`
      );
      const result = await res.json();
      setMonthlyData(result.success ? result.data : []);
    } catch (err) {
      console.error('Failed to fetch monthly data', err);
      setMonthlyData([]);
    } finally {
      setLoadingMonthly(false);
    }
  }, [monthlyYear, monthlyMonth, monthlyStartDate]);

  useEffect(() => { fetchDaily(); }, [fetchDaily]);
  useEffect(() => { fetchMonthly(); }, [fetchMonthly]);

  const uiDailyData = useMemo(() => {
    const map = new Map();
    const flattened = [];
    dailyData.forEach((row) => {
      if (!map.has(row.unique_id)) map.set(row.unique_id, []);
      map.get(row.unique_id).push(row);
    });
    map.forEach((shifts) => {
      shifts.forEach((shift, index) => {
        flattened.push({ ...shift, is_first_shift: index === 0, shift_index: index + 1, total_shifts: shifts.length });
      });
    });
    return flattened;
  }, [dailyData]);

  const uniqueEmployeesForSummary = useMemo(() => {
    const map = new Map();
    uiDailyData.forEach((row) => map.set(row.unique_id, row));
    return Array.from(map.values());
  }, [uiDailyData]);

  const filteredDailyData = useMemo(() => {
    if (!searchQuery.trim()) return uiDailyData;
    const q = searchQuery.toLowerCase();
    return uiDailyData.filter(
      (row) =>
        (row.name && row.name.toLowerCase().includes(q)) ||
        (row.unique_id && String(row.unique_id).toLowerCase().includes(q))
    );
  }, [uiDailyData, searchQuery]);

  const filteredMonthlyData = useMemo(() => {
    if (!searchQuery.trim()) return monthlyData;
    const q = searchQuery.toLowerCase();
    return monthlyData.filter(
      (row) =>
        (row.name && row.name.toLowerCase().includes(q)) ||
        (row.unique_id && String(row.unique_id).toLowerCase().includes(q))
    );
  }, [monthlyData, searchQuery]);

  const openEditModal = (row) => {
    if (!canManage) return;
    let targetShiftId = row.shift_id;
    if (!targetShiftId && row.shift_name && row.shift_name !== '—') {
      const matchingShift = availableShifts.find(
        (s) => s.shift_name === row.shift_name || (row.shift_name === 'Flexible 8-Hour' && s.shift_name === 'ADMIN')
      );
      if (matchingShift) targetShiftId = matchingShift.id;
    }
    setEditFormData({
      attendance_id: row.id,
      employee_name: row.name,
      unique_id: row.unique_id,
      shift_id: targetShiftId ? String(targetShiftId) : '',
      attendance_date: date,
      clock_in_time: formatHHMMForInput(row.raw_clock_in || row.clock_in),
      clock_out_time:
        row.clock_out && row.clock_out !== 'Missed' ? formatHHMMForInput(row.raw_clock_out || row.clock_out) : ''
    });
    setIsEditModalOpen(true);
  };

  const openManualAdd = (row) => {
    if (!canManage) return;
    setAddFormData({ employee_id: row.unique_id, employee_name: row.name, shift_id: row.shift_id || '', clock_in_time: '', clock_out_time: '' });
    setIsAddModalOpen(true);
  };

  const handleManualAddSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    setIsAdding(true);
    try {
      const res = await fetch(`${API_BASE}/clockin/admin/manual-add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: addFormData.employee_id,
          shift_id: addFormData.shift_id,
          attendance_date: date,
          clock_in_time: addFormData.clock_in_time,
          clock_out_time: addFormData.clock_out_time || null
        })
      });
      const result = await res.json();
      if (result.success) {
        setIsAddModalOpen(false);
        setAddFormData({ employee_id: '', employee_name: '', shift_id: '', clock_in_time: '', clock_out_time: '' });
        fetchDaily();
      } else {
        alert(result.message || 'Failed to add record');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding manual record.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    setIsEditing(true);
    try {
      const payload = {
        attendance_id: editFormData.attendance_id,
        shift_id: editFormData.shift_id,
        attendance_date: editFormData.attendance_date,
        clock_in_time: editFormData.clock_in_time
      };
      if (editFormData.clock_out_time) payload.clock_out_time = editFormData.clock_out_time;
      const res = await fetch(`${API_BASE}/clockin/admin/manual-edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        setIsEditModalOpen(false);
        fetchDaily();
      } else {
        alert(result.message || 'Failed to update record');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating manual record.');
    } finally {
      setIsEditing(false);
    }
  };

  // ===== Colors & helpers =====
  const COLORS = {
    primary: 'FF2563EB', primaryDark: 'FF1D4ED8', primaryLight: 'FFDBEAFE',
    white: 'FFFFFFFF', black: 'FF111827', gray50: 'FFF9FAFB', gray100: 'FFF3F4F6',
    gray200: 'FFE5E7EB', gray500: 'FF6B7280', gray700: 'FF374151', gray900: 'FF111827',
    green: 'FF16A34A', greenLight: 'FFF0FDF4', red: 'FFDC2626', redLight: 'FFFEF2F2',
    orange: 'FFEA580C', orangeLight: 'FFFFF7ED', amber: 'FFD97706', amberLight: 'FFFFFBEB',
    purple: 'FF7C3AED', purpleLight: 'FFF3E8FF', sundayBg: 'FFFFF1F2'
  };

  const thinBorder = (color = COLORS.gray200) => ({
    top: { style: 'thin', color: { argb: color } },
    bottom: { style: 'thin', color: { argb: color } },
    left: { style: 'thin', color: { argb: color } },
    right: { style: 'thin', color: { argb: color } }
  });

  const solidFill = (color) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: color } });

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const formatTime = (value) => {
    if (!value) return '—';
    if (value === 'Missed') return 'Missed';
    if (typeof value === 'string' && value.length <= 8) return value;
    try { return format(new Date(value), 'h:mm a'); } catch { return '—'; }
  };

  const dailySummary = {
    present: uniqueEmployeesForSummary.filter((e) => e.status === 'Present').length,
    late: uniqueEmployeesForSummary.filter((e) => e.status === 'Late' || e.status === 'Late & Early').length,
    earlyClockOut: uniqueEmployeesForSummary.filter((e) => e.status === 'Early Clock Out' || e.status === 'Late & Early').length,
    absent: uniqueEmployeesForSummary.filter((e) => e.status === 'Absent').length,
    missed: uniqueEmployeesForSummary.filter((e) => e.status === 'Missed').length
  };

  const monthlySummary = monthlyData.reduce(
    (acc, emp) => {
      acc.present += Number(emp.present) || 0;
      acc.late += Number(emp.late) || 0;
      acc.earlyClockOut += Number(emp.early_clock_out) || 0;
      acc.absent += Number(emp.absent) || 0;
      acc.totalOt += Number(emp.total_ot_minutes) || 0;
      return acc;
    },
    { present: 0, late: 0, earlyClockOut: 0, absent: 0, totalOt: 0 }
  );

  const handleViewEmployee = async (accountId) => {
    try {
      const url = `${API_BASE}/clockin/employee/${accountId}/attendance?start_date=${date}&end_date=${date}`;
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setModalData(result.data);
        setModalOpen(true);
      } else {
        alert('Failed to fetch employee details: ' + result.message);
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      alert('Error fetching employee details');
    }
  };

  const closeModal = () => { setModalOpen(false); setModalData(null); };

  // ===== Export: Daily =====
  const exportDailyStyled = async () => {
    if (!canManage) return;
    const wb = new ExcelJS.Workbook();
    wb.creator = 'KIOTEL Attendance System';
    const ws = wb.addWorksheet('Daily Report');
    const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');

    ws.mergeCells('A1:N1');
    const t1 = ws.getCell('A1');
    t1.value = 'KIOTEL — Daily Attendance Report';
    t1.font = { size: 18, bold: true, color: { argb: COLORS.primary } };
    t1.alignment = { horizontal: 'center', vertical: 'middle' };
    t1.fill = solidFill(COLORS.primaryLight);
    ws.getRow(1).height = 36;

    ws.mergeCells('A2:N2');
    const t2 = ws.getCell('A2');
    t2.value = formattedDate;
    t2.font = { size: 12, bold: true, color: { argb: COLORS.gray700 } };
    t2.alignment = { horizontal: 'center', vertical: 'middle' };
    t2.fill = solidFill(COLORS.primaryLight);
    ws.getRow(2).height = 24;

    ws.addRow([]);

    const headers = [
      'Employee ID','Name','Shift','Shift Start','Shift End',
      'Clock In','Clock Out','Status','Late (min)','Early Out (min)',
      'Penalty (min)','OT (min)','Working Hours','Photo'
    ];
    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: COLORS.white }, size: 10 };
      cell.fill = solidFill(COLORS.primary);
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder(COLORS.primaryDark);
    });
    ws.getRow(headerRow.number).height = 30;

    filteredDailyData.forEach((row, index) => {
      let workingHours = '—';
      if (row.clock_in && row.clock_out && row.clock_out !== 'Missed') {
        try {
          const inD = new Date(row.clock_in);
          const outD = new Date(row.clock_out);
          if (!isNaN(inD.getTime()) && !isNaN(outD.getTime())) {
            const diffMin = Math.floor((outD - inD) / 60000);
            if (diffMin >= 0) workingHours = `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
          }
        } catch (e) {}
      }

      const isFlexible = row.shift_name === 'ADMIN';
      const outText = row.is_missed ? 'Missed' : formatTime(row.clock_out);
      const lateValue = row.is_late_waived ? 0 : row.late_minutes > 0 ? row.late_minutes : 0;
      const earlyValue = row.is_early_waived ? 0 : row.early_clock_out_minutes > 0 ? row.early_clock_out_minutes : 0;

      const empName = row.is_first_shift ? row.name : `   └─ Shift ${row.shift_index}`;
      const empId = row.is_first_shift ? row.unique_id : '';
      const photoLabel =
        row.photo_placeholder === 'manual_entry' ? 'Admin Entry' : row.photo_captured ? 'Captured' : 'No';

      const dataRow = ws.addRow([
        empId, empName,
        isFlexible ? 'Flexible 8-Hour' : row.shift_name || 'N/A',
        isFlexible ? '—' : row.shift_start || '—',
        isFlexible ? '—' : row.shift_end || '—',
        formatTime(row.clock_in), outText, row.status || '—',
        lateValue || '', earlyValue || '',
        (lateValue + earlyValue) || '', row.overtime_minutes || '',
        workingHours, photoLabel
      ]);

      const bgColor = index % 2 === 0 ? COLORS.white : COLORS.gray50;
      dataRow.eachCell((cell) => {
        cell.fill = solidFill(bgColor);
        cell.border = thinBorder(COLORS.gray200);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { size: 10 };
      });

      dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
      dataRow.getCell(2).font = row.is_first_shift
        ? { size: 10, bold: true }
        : { size: 9, italic: true, color: { argb: COLORS.gray500 } };

      if (lateValue > 0) {
        dataRow.getCell(9).font = { bold: true, color: { argb: COLORS.red }, size: 10 };
        dataRow.getCell(9).fill = solidFill(COLORS.redLight);
      }
      if (earlyValue > 0) {
        dataRow.getCell(10).font = { bold: true, color: { argb: COLORS.orange }, size: 10 };
        dataRow.getCell(10).fill = solidFill(COLORS.orangeLight);
      }
      if ((lateValue + earlyValue) > 0) {
        dataRow.getCell(11).font = { bold: true, color: { argb: COLORS.purple }, size: 10 };
        dataRow.getCell(11).fill = solidFill(COLORS.purpleLight);
      }
      if (row.overtime_minutes > 0) {
        dataRow.getCell(12).font = { bold: true, color: { argb: COLORS.green }, size: 10 };
        dataRow.getCell(12).fill = solidFill(COLORS.greenLight);
      }

      const statusCell = dataRow.getCell(8);
      if (row.status === 'Present') statusCell.font = { bold: true, color: { argb: COLORS.green }, size: 10 };
      else if (row.status === 'Late' || row.status === 'Late & Early')
        statusCell.font = { bold: true, color: { argb: COLORS.red }, size: 10 };
      else if (row.status === 'Early Clock Out')
        statusCell.font = { bold: true, color: { argb: COLORS.orange }, size: 10 };
      else if (row.status === 'Missed' || row.status === 'Absent')
        statusCell.font = { bold: true, color: { argb: COLORS.red }, size: 10 };
    });

    ws.columns = [
      { width: 14 },{ width: 24 },{ width: 20 },{ width: 12 },{ width: 12 },
      { width: 12 },{ width: 12 },{ width: 16 },{ width: 12 },{ width: 14 },
      { width: 14 },{ width: 12 },{ width: 14 },{ width: 12 }
    ];

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Attendance_Daily_${date}.xlsx`);
  };

  // ===== Export: Monthly Detailed =====
  const exportMonthlyStyled = async () => {
    try {
      const res = await fetch(`${API_BASE}/clockin/admin/report/monthly-detailed?year=${monthlyYear}&month=${monthlyMonth}`);
      const result = await res.json();
      if (!result.success || !result.data) { alert('Failed to fetch detailed report.'); return; }

      const employees = result.data.employees || [];
      const dates = result.data.dates || [];
      const month_name = result.data.month_name || 'Month';

      if (dates.length === 0) { alert('No dates available in this data range.'); return; }

      const wb = new ExcelJS.Workbook();
      wb.creator = 'KIOTEL Attendance System';

      const ws = wb.addWorksheet('Monthly Overview', { views: [{ state: 'frozen', xSplit: 2, ySplit: 5 }] });
      const totalCols = 2 + dates.length + 5;

      ws.mergeCells(1, 1, 1, totalCols);
      const t1 = ws.getCell('A1');
      t1.value = 'KIOTEL — Monthly Attendance Report';
      t1.font = { size: 20, bold: true, color: { argb: COLORS.white } };
      t1.fill = solidFill(COLORS.primary);
      t1.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(1).height = 40;

      ws.mergeCells(2, 1, 2, totalCols);
      const t2 = ws.getCell('A2');
      t2.value = `${month_name} ${monthlyYear}`;
      t2.font = { size: 13, bold: true, color: { argb: COLORS.white } };
      t2.fill = solidFill(COLORS.primaryDark);
      t2.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(2).height = 28;

      ws.addRow([]);

      const labelRow = ws.addRow([]);
      labelRow.getCell(1).value = 'Sub-rows →';
      labelRow.getCell(1).font = { size: 9, italic: true, color: { argb: COLORS.gray500 } };
      labelRow.getCell(2).value = '① In  ② Out  ③ L/E/OT  ④ Shift';
      labelRow.getCell(2).font = { size: 9, italic: true, color: { argb: COLORS.gray500 } };
      ws.mergeCells(4, 2, 4, 5);

      const headerRow = ws.addRow([]);
      headerRow.getCell(1).value = 'Employee';
      headerRow.getCell(2).value = 'ID';
      dates.forEach((d, i) => {
        const dateObj = new Date(d + 'T00:00:00');
        headerRow.getCell(3 + i).value = `${dateObj.getDate()}\n${dateObj.toLocaleDateString('en-US', { weekday: 'short' })}`;
      });
      const totalsStartCol = 3 + dates.length;
      headerRow.getCell(totalsStartCol).value = 'Total\nLate';
      headerRow.getCell(totalsStartCol + 1).value = 'Total\nEarly';
      headerRow.getCell(totalsStartCol + 2).value = 'Total\nOT';
      headerRow.getCell(totalsStartCol + 3).value = 'Total\nHours';
      headerRow.getCell(totalsStartCol + 4).value = 'Days\nPresent';
      ws.getRow(5).height = 36;
      for (let c = 1; c <= totalCols; c++) {
        const cell = headerRow.getCell(c);
        cell.font = { bold: true, color: { argb: COLORS.white }, size: 9 };
        cell.fill = solidFill(COLORS.primary);
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = thinBorder(COLORS.primaryDark);
      }
      dates.forEach((d, i) => {
        if (new Date(d + 'T00:00:00').getDay() === 0) headerRow.getCell(3 + i).fill = solidFill(COLORS.red);
      });

      employees.forEach((emp, empIndex) => {
        const startRow = ws.rowCount + 1;
        const isEvenEmployee = empIndex % 2 === 0;
        const baseBg = isEvenEmployee ? COLORS.white : COLORS.gray50;

        const inRowData = [emp.name, emp.employee_id];
        const outRowData = ['', ''];
        const metricsRowData = ['', ''];
        const shiftRowData = ['', ''];
        let maxShiftsInDay = 1;

        dates.forEach(d => {
          const dayRecords = emp.dates[d];
          if (dayRecords && dayRecords.length > 0) {
            if (dayRecords.length > maxShiftsInDay) maxShiftsInDay = dayRecords.length;
            const ins = [], outs = [], metrics = [], shifts = [];
            dayRecords.forEach(rec => {
              const isFlexible = rec.shift_name === 'ADMIN';
              ins.push(rec.clock_in || '—');
              outs.push(rec.clock_out === 'Missed' ? 'Missed' : (rec.clock_out || '—'));
              const parts = [];
              const lateM = isFlexible ? 0 : rec.late_min;
              const earlyM = isFlexible ? 0 : rec.early_min;
              const otM = isFlexible ? 0 : rec.ot_min;
              if (lateM > 0) parts.push(`L:${lateM}`);
              if (earlyM > 0) parts.push(`E:${earlyM}`);
              if (otM > 0) parts.push(`O:${otM}`);
              metrics.push(parts.length > 0 ? parts.join(' ') : '—');
              shifts.push(isFlexible ? 'Flexible' : (rec.shift_name || '—'));
            });
            inRowData.push(ins.join('\n'));
            outRowData.push(outs.join('\n'));
            metricsRowData.push(metrics.join('\n'));
            shiftRowData.push(shifts.join('\n'));
          } else {
            inRowData.push(''); outRowData.push(''); metricsRowData.push(''); shiftRowData.push('');
          }
        });

        inRowData.push(
          emp.totals.total_late_min || '', emp.totals.total_early_min || '',
          emp.totals.total_ot_min || '',
          emp.totals.total_working_min > 0 ? `${Math.floor(emp.totals.total_working_min / 60)}h ${emp.totals.total_working_min % 60}m` : '—',
          emp.totals.present
        );
        for (let i = 0; i < 5; i++) { outRowData.push(''); metricsRowData.push(''); shiftRowData.push(''); }

        const rowIn = ws.addRow(inRowData);
        const rowOut = ws.addRow(outRowData);
        const rowMetrics = ws.addRow(metricsRowData);
        const rowShift = ws.addRow(shiftRowData);

        ws.mergeCells(startRow, 1, startRow + 3, 1);
        ws.mergeCells(startRow, 2, startRow + 3, 2);

        const nameCell = ws.getCell(startRow, 1);
        nameCell.font = { bold: true, size: 10, color: { argb: COLORS.gray900 } };
        nameCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        nameCell.fill = solidFill(COLORS.primaryLight);
        nameCell.border = thinBorder(COLORS.gray200);

        const idCell = ws.getCell(startRow, 2);
        idCell.font = { size: 9, color: { argb: COLORS.gray500 } };
        idCell.alignment = { horizontal: 'center', vertical: 'middle' };
        idCell.fill = solidFill(COLORS.primaryLight);
        idCell.border = thinBorder(COLORS.gray200);

        const baseHeight = 18;
        rowIn.height = baseHeight * maxShiftsInDay;
        rowOut.height = baseHeight * maxShiftsInDay;
        rowMetrics.height = baseHeight * maxShiftsInDay;
        rowShift.height = 16 * maxShiftsInDay;

        [rowIn, rowOut, rowMetrics, rowShift].forEach((row, subIdx) => {
          for (let c = 3; c <= totalCols; c++) {
            const cell = row.getCell(c);
            const dateIdx = c - 3;
            const isDateCol = dateIdx < dates.length;
            const isSunday = isDateCol && new Date(dates[dateIdx] + 'T00:00:00').getDay() === 0;
            let bg = baseBg;
            if (isSunday) bg = COLORS.sundayBg;
            cell.fill = solidFill(bg);
            cell.border = thinBorder(COLORS.gray200);
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            if (subIdx === 0) cell.font = { size: 9, color: { argb: cell.value ? COLORS.green : COLORS.gray200 } };
            else if (subIdx === 1) cell.font = { size: 9, color: { argb: String(cell.value).includes('Missed') ? COLORS.orange : (cell.value ? COLORS.red : COLORS.gray200) } };
            else if (subIdx === 2) {
              const val = String(cell.value || '');
              if (val.includes('L:') && val.includes('E:')) cell.font = { size: 8, bold: true, color: { argb: COLORS.purple } };
              else if (val.includes('L:')) cell.font = { size: 8, bold: true, color: { argb: COLORS.red } };
              else if (val.includes('E:')) cell.font = { size: 8, bold: true, color: { argb: COLORS.orange } };
              else if (val.includes('O:')) cell.font = { size: 8, bold: true, color: { argb: COLORS.green } };
              else cell.font = { size: 8, color: { argb: COLORS.gray200 } };
            } else cell.font = { size: 7, italic: true, color: { argb: COLORS.gray500 } };
          }
        });

        const totColStart = totalsStartCol;
        if (emp.totals.total_late_min > 0) {
          const c = rowIn.getCell(totColStart);
          c.font = { bold: true, size: 10, color: { argb: COLORS.red } };
          c.fill = solidFill(COLORS.redLight);
        }
        if (emp.totals.total_early_min > 0) {
          const c = rowIn.getCell(totColStart + 1);
          c.font = { bold: true, size: 10, color: { argb: COLORS.orange } };
          c.fill = solidFill(COLORS.orangeLight);
        }
        if (emp.totals.total_ot_min > 0) {
          const c = rowIn.getCell(totColStart + 2);
          c.font = { bold: true, size: 10, color: { argb: COLORS.green } };
          c.fill = solidFill(COLORS.greenLight);
        }
        rowIn.getCell(totColStart + 3).font = { bold: true, size: 10, color: { argb: COLORS.primary } };
        const presentCell = rowIn.getCell(totColStart + 4);
        presentCell.font = { bold: true, size: 11, color: { argb: COLORS.primary } };
        presentCell.fill = solidFill(COLORS.primaryLight);

        const sepRow = ws.addRow([]);
        sepRow.height = 4;
        for (let c = 1; c <= totalCols; c++) sepRow.getCell(c).fill = solidFill(COLORS.gray200);
      });

      ws.getColumn(1).width = 22; ws.getColumn(2).width = 14;
      dates.forEach((_, i) => { ws.getColumn(3 + i).width = 12; });
      ws.getColumn(totalsStartCol).width = 12; ws.getColumn(totalsStartCol + 1).width = 12;
      ws.getColumn(totalsStartCol + 2).width = 10; ws.getColumn(totalsStartCol + 3).width = 13;
      ws.getColumn(totalsStartCol + 4).width = 11;

      const ws2 = wb.addWorksheet('Detailed Report');
      ws2.mergeCells('A1:L1');
      const dt1 = ws2.getCell('A1');
      dt1.value = 'KIOTEL — Detailed Attendance Report';
      dt1.font = { size: 18, bold: true, color: { argb: COLORS.white } };
      dt1.fill = solidFill(COLORS.primary);
      dt1.alignment = { horizontal: 'center', vertical: 'middle' };
      ws2.getRow(1).height = 36;

      ws2.mergeCells('A2:L2');
      const dt2 = ws2.getCell('A2');
      dt2.value = `${month_name} ${monthlyYear}`;
      dt2.font = { size: 12, bold: true, color: { argb: COLORS.white } };
      dt2.fill = solidFill(COLORS.primaryDark);
      dt2.alignment = { horizontal: 'center', vertical: 'middle' };
      ws2.getRow(2).height = 26;

      ws2.addRow([]);

      const dHeaders = ['Employee','ID','Date','Day','Shift','Clock In','Clock Out','Hours','Late (min)','Early (min)','OT (min)','Status'];
      const dHeaderRow = ws2.addRow(dHeaders);
      dHeaderRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: COLORS.white }, size: 10 };
        cell.fill = solidFill(COLORS.primary);
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = thinBorder(COLORS.primaryDark);
      });
      ws2.getRow(dHeaderRow.number).height = 28;

      let rowIdx = 0;
      employees.forEach((emp) => {
        let isFirst = true;
        dates.forEach(d => {
          const dayRecords = emp.dates[d];
          if (dayRecords && dayRecords.length > 0) {
            dayRecords.forEach(rec => {
              const dateObj = new Date(d + 'T00:00:00');
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const isSunday = dateObj.getDay() === 0;
              const isFlexible = rec.shift_name === 'ADMIN';
              const row = ws2.addRow([
                isFirst ? emp.name : '', isFirst ? emp.employee_id : '',
                rec.attendance_date, dayName,
                isFlexible ? 'Flexible 8-Hour' : rec.shift_name,
                rec.clock_in || '—', rec.clock_out || '—',
                rec.working_hours || '—',
                isFlexible ? 0 : (rec.late_min || ''),
                isFlexible ? 0 : (rec.early_min || ''),
                isFlexible ? 0 : (rec.ot_min || ''),
                rec.status === 'completed' ? 'Done' : (rec.status === 'Missed' ? 'Missed Out' : 'Active'),
              ]);
              const bg = isSunday ? COLORS.sundayBg : (rowIdx % 2 === 0 ? COLORS.white : COLORS.gray50);
              row.eachCell((cell) => {
                cell.fill = solidFill(bg);
                cell.border = thinBorder(COLORS.gray200);
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.font = { size: 10 };
              });
              if (isFirst) { row.getCell(1).font = { bold: true, size: 10 }; row.getCell(1).alignment = { horizontal: 'left' }; }
              if (!isFlexible && rec.late_min > 0) row.getCell(9).font = { bold: true, color: { argb: COLORS.red }, size: 10 };
              if (!isFlexible && rec.early_min > 0) row.getCell(10).font = { bold: true, color: { argb: COLORS.orange }, size: 10 };
              if (!isFlexible && rec.ot_min > 0) row.getCell(11).font = { bold: true, color: { argb: COLORS.green }, size: 10 };
              if (rec.clock_out === 'Missed') row.getCell(7).font = { bold: true, color: { argb: COLORS.red } };
              isFirst = false;
              rowIdx++;
            });
          }
        });

        const totalHrs = Math.floor(emp.totals.total_working_min / 60);
        const totalMins = emp.totals.total_working_min % 60;
        const totalRow = ws2.addRow([
          `TOTAL: ${emp.name}`, emp.employee_id, '', '', `${emp.totals.present} days`,
          '', '', `${totalHrs}h ${totalMins}m`,
          emp.totals.total_late_min || '', emp.totals.total_early_min || '', emp.totals.total_ot_min || '', '',
        ]);
        totalRow.eachCell((cell) => {
          cell.font = { bold: true, size: 10 };
          cell.fill = solidFill(COLORS.primaryLight);
          cell.border = thinBorder(COLORS.gray200);
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        totalRow.getCell(1).alignment = { horizontal: 'left' };
        ws2.addRow([]);
        rowIdx = 0;
      });

      [22,14,12,8,20,12,12,13,11,11,11,10].forEach((w, i) => { ws2.getColumn(i + 1).width = w; });

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Attendance_Monthly_${monthlyYear}-${String(monthlyMonth).padStart(2, '0')}.xlsx`);
    } catch (err) {
      console.error('Monthly export failed:', err);
      alert('Failed to export. Please try again.');
    }
  };

  // ===== Export: Missed Clock-In =====
  const exportMonthlyMissedClockInReport = async () => {
    if (!canManage) return;
    try {
      const res = await fetch(
        `${API_BASE}/clockin/admin/monthly-missed-clockin?year=${monthlyYear}&month=${monthlyMonth}&start_date=${monthlyStartDate}`
      );
      const result = await res.json();
      if (!result.success || !result.data) { alert(result.message || 'Failed to fetch missed/not-clocked-in report.'); return; }

      const employees = result.data.employees || [];
      const endDate = result.data.end_date || '';
      const totalDays = result.data.total_days || '';

      const wb = new ExcelJS.Workbook();
      wb.creator = 'KIOTEL Attendance System';

      const joinDatesWrapped = (dates) => {
        const perLine = 8;
        const chunks = [];
        for (let i = 0; i < dates.length; i += perLine) chunks.push(dates.slice(i, i + perLine).join(', '));
        return chunks.join('\n');
      };

      const wsSummary = wb.addWorksheet('Summary', {
        views: [{ state: 'frozen', ySplit: 4 }],
        pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
      });

      wsSummary.mergeCells('A1:H1');
      const title = wsSummary.getCell('A1');
      title.value = 'KIOTEL — Monthly Missed / Not Clocked In Report (Summary)';
      title.font = { size: 18, bold: true, color: { argb: COLORS.white } };
      title.fill = solidFill(COLORS.primary);
      title.alignment = { horizontal: 'center', vertical: 'middle' };
      wsSummary.getRow(1).height = 34;

      wsSummary.mergeCells('A2:H2');
      const subtitle = wsSummary.getCell('A2');
      subtitle.value = `${monthNames[monthlyMonth - 1]} ${monthlyYear} (From ${monthlyStartDate} to ${endDate}) • Total Days: ${totalDays}`;
      subtitle.font = { size: 11, bold: true, color: { argb: COLORS.gray700 } };
      subtitle.fill = solidFill(COLORS.primaryLight);
      subtitle.alignment = { horizontal: 'center', vertical: 'middle' };
      wsSummary.getRow(2).height = 22;

      wsSummary.addRow([]);

      const summaryHeaders = ['Employee ID','Name','Total Incidents','NO_RECORD Count','NO_RECORD Dates','MISSED_CLOCKOUT Count','MISSED_CLOCKOUT Dates','Notes'];
      const summaryHeaderRow = wsSummary.addRow(summaryHeaders);
      summaryHeaderRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: COLORS.white }, size: 10 };
        cell.fill = solidFill(COLORS.primaryDark);
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = thinBorder(COLORS.primaryDark);
      });
      wsSummary.getRow(summaryHeaderRow.number).height = 24;

      employees.forEach((emp) => {
        const incidents = Array.isArray(emp.dates) ? emp.dates : [];
        if (incidents.length === 0) return;

        const noRecordDates = incidents.filter((x) => x.reason === 'NO_RECORD').map((x) => x.date).filter(Boolean);
        const missedClockOutDates = incidents.filter((x) => x.reason === 'MISSED_CLOCKOUT').map((x) => x.date).filter(Boolean);
        const totalIncidents = emp.not_clocked_in_count ?? incidents.length;
        const noRecordDatesText = noRecordDates.length ? joinDatesWrapped(noRecordDates) : '—';
        const missedDatesText = missedClockOutDates.length ? joinDatesWrapped(missedClockOutDates) : '—';

        const row = wsSummary.addRow([
          emp.employee_id, emp.name, totalIncidents,
          noRecordDates.length, noRecordDatesText,
          missedClockOutDates.length, missedDatesText, ''
        ]);

        row.eachCell((cell) => {
          cell.border = thinBorder(COLORS.gray200);
          cell.font = { size: 10, color: { argb: COLORS.gray900 } };
          cell.alignment = { vertical: 'top', horizontal: 'center', wrapText: true };
        });
        row.getCell(2).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        row.getCell(5).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        row.getCell(7).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

        if (noRecordDates.length > 0) {
          row.getCell(4).font = { bold: true, color: { argb: COLORS.orange }, size: 10 };
          row.getCell(4).fill = solidFill(COLORS.orangeLight);
          row.getCell(5).fill = solidFill(COLORS.orangeLight);
        }
        if (missedClockOutDates.length > 0) {
          row.getCell(6).font = { bold: true, color: { argb: COLORS.red }, size: 10 };
          row.getCell(6).fill = solidFill(COLORS.redLight);
          row.getCell(7).fill = solidFill(COLORS.redLight);
        }

        const linesNo = String(noRecordDatesText).split('\n').length;
        const linesMissed = String(missedDatesText).split('\n').length;
        wsSummary.getRow(row.number).height = Math.min(200, 18 + Math.max(linesNo, linesMissed, 1) * 14);
      });

      wsSummary.columns = [{ width: 14 },{ width: 26 },{ width: 14 },{ width: 16 },{ width: 45 },{ width: 20 },{ width: 45 },{ width: 18 }];
      wsSummary.autoFilter = { from: { row: summaryHeaderRow.number, column: 1 }, to: { row: summaryHeaderRow.number, column: summaryHeaders.length } };

      const wsDetails = wb.addWorksheet('Details', {
        views: [{ state: 'frozen', ySplit: 1 }],
        pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
      });

      const detailHeaders = ['Employee ID','Name','Date','Reason','Notes','Attendance ID','Shift ID'];
      const detailHeaderRow = wsDetails.addRow(detailHeaders);
      detailHeaderRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: COLORS.white }, size: 10 };
        cell.fill = solidFill(COLORS.primaryDark);
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = thinBorder(COLORS.primaryDark);
      });

      employees.forEach((emp) => {
        const list = Array.isArray(emp.dates) ? emp.dates : [];
        if (list.length === 0) return;
        list.forEach((d) => {
          const row = wsDetails.addRow([emp.employee_id, emp.name, d.date || '—', d.reason || '—', d.notes || '', d.attendance_id || '', d.shift_id || '']);
          row.eachCell((cell) => {
            cell.border = thinBorder(COLORS.gray200);
            cell.font = { size: 10, color: { argb: COLORS.gray900 } };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          });
          row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          row.getCell(5).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          const reasonCell = row.getCell(4);
          if (d.reason === 'MISSED_CLOCKOUT') { reasonCell.font = { bold: true, color: { argb: COLORS.red }, size: 10 }; reasonCell.fill = solidFill(COLORS.redLight); }
          else if (d.reason === 'NO_RECORD') { reasonCell.font = { bold: true, color: { argb: COLORS.orange }, size: 10 }; reasonCell.fill = solidFill(COLORS.orangeLight); }
        });
      });

      wsDetails.columns = [{ width: 14 },{ width: 28 },{ width: 12 },{ width: 18 },{ width: 60 },{ width: 14 },{ width: 10 }];
      wsDetails.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: detailHeaders.length } };

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Attendance_Monthly_MissedClockIn_${monthlyYear}-${String(monthlyMonth).padStart(2, '0')}.xlsx`);
    } catch (err) {
      console.error('Missed/not-clocked-in export failed:', err);
      alert('Failed to export. Please try again.');
    }
  };

  // ===== Export: Penalty Over =====
  const exportMonthlyPenaltyOverReport = async (threshold = 100) => {
    if (!canManage) return;
    try {
      const res = await fetch(
        `${API_BASE}/clockin/admin/report/monthly-penalty-over?year=${monthlyYear}&month=${monthlyMonth}&start_date=${monthlyStartDate}&threshold=${threshold}`
      );
      const result = await res.json();
      if (!result.success || !result.data) { alert(result.message || 'Failed to fetch penalty report.'); return; }

      const employees = result.data.employees || [];
      const th = result.data.threshold ?? threshold;

      const wb = new ExcelJS.Workbook();
      wb.creator = 'KIOTEL Attendance System';
      const ws = wb.addWorksheet('Penalty Report');

      const titleRow = ws.addRow([`Monthly Penalty Report (≥ ${th} min)`]);
      titleRow.font = { bold: true, size: 14 };
      ws.addRow([]);

      const headerRow = ws.addRow(['Employee ID','Name','Penalty Minutes']);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      employees.forEach((emp) => {
        ws.addRow([emp.employee_id || '', emp.name || '', Number(emp.total_penalty_min) || 0]);
      });

      ws.columns = [{ width: 20 },{ width: 35 },{ width: 20 }];
      ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: 3 } };

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Attendance_Monthly_PenaltyOver_${th}_${monthlyYear}-${String(monthlyMonth).padStart(2, '0')}.xlsx`);
    } catch (err) {
      console.error('Penalty export failed:', err);
      alert('Failed to export. Please try again.');
    }
  };

  // =====================================================================
// Paste this function INSIDE the AdminDashboard component, next to your
// other export functions (e.g. right after exportMonthlyPenaltyOverReport).
// It relies on component-scope helpers you already have:
//   API_BASE, monthlyYear, monthlyMonth, monthlyStartDate, monthNames,
//   COLORS, thinBorder, solidFill, ExcelJS, saveAs, format, canManage
// =====================================================================

const exportAdminActivityReport = async () => {
  if (!canManage) return;
  try {
    const res = await fetch(
      `${API_BASE}/clockin/admin/report/admin-activity?year=${monthlyYear}&month=${monthlyMonth}&start_date=${monthlyStartDate}`
    );
    const result = await res.json();
    if (!result.success || !result.data) {
      alert(result.message || 'Failed to fetch admin activity report.');
      return;
    }

    const activities = result.data.activities || [];
    const startDate = result.data.start_date || monthlyStartDate;
    const endDate = result.data.end_date || '';

    // Only these four can appear: adds + waives come from the attendance
    // table, edits come from the log. (Deletes are not tracked.)
    const ACTION_META = {
      MANUAL_ADD:  { label: 'Manual Entry Added', color: COLORS.purple, bg: COLORS.purpleLight },
      EDIT:        { label: 'Record Edited',      color: COLORS.primary, bg: COLORS.primaryLight },
      WAIVE_LATE:  { label: 'Late Waived',        color: COLORS.amber,   bg: COLORS.amberLight },
      WAIVE_EARLY: { label: 'Early Waived',       color: COLORS.orange,  bg: COLORS.orangeLight },
    };
    const metaFor = (t) => ACTION_META[t] || { label: t || '—', color: COLORS.gray700, bg: COLORS.white };

    const fmtWhen = (ts) => {
      if (!ts) return '—';
      try { return format(new Date(ts), 'MMM d, yyyy h:mm a'); } catch { return String(ts); }
    };

    const wb = new ExcelJS.Workbook();
    wb.creator = 'KIOTEL Attendance System';

    // ---------- Sheet 1: Activity Log ----------
    const ws = wb.addWorksheet('Admin Activity', { views: [{ state: 'frozen', ySplit: 4 }] });
    const COLS = 9;

    ws.mergeCells(1, 1, 1, COLS);
    const t1 = ws.getCell('A1');
    t1.value = 'KIOTEL — Admin Activity Log';
    t1.font = { size: 18, bold: true, color: { argb: COLORS.white } };
    t1.fill = solidFill(COLORS.primary);
    t1.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 34;

    ws.mergeCells(2, 1, 2, COLS);
    const t2 = ws.getCell('A2');
    t2.value = `${monthNames[monthlyMonth - 1]} ${monthlyYear} (${startDate} to ${endDate}) • ${activities.length} action(s)`;
    t2.font = { size: 11, bold: true, color: { argb: COLORS.gray700 } };
    t2.fill = solidFill(COLORS.primaryLight);
    t2.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 22;

    ws.addRow([]);

    const headers = ['When', 'Employee ID', 'Name', 'Action', 'Field Changed', 'Old Value', 'New Value',  'Notes'];
    // const headers = ['When', 'Employee ID', 'Name', 'Action', 'Field Changed', 'Old Value', 'New Value', 'Admin', 'Notes'];
    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: COLORS.white }, size: 10 };
      cell.fill = solidFill(COLORS.primaryDark);
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder(COLORS.primaryDark);
    });
    ws.getRow(headerRow.number).height = 24;

    if (activities.length === 0) {
      const empty = ws.addRow(['No admin activity found in this period.']);
      ws.mergeCells(empty.number, 1, empty.number, COLS);
      empty.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      empty.getCell(1).font = { italic: true, color: { argb: COLORS.gray500 } };
    } else {
      activities.forEach((a, idx) => {
        const meta = metaFor(a.action_type);
        const row = ws.addRow([
          a.attendance_date || '—',
          a.employee_id || '—',
          a.employee_name || '—',
          meta.label,
          a.field_changed || '—',
          a.old_value ?? '—',
          a.new_value ?? '—',
          // a.admin_name || '—',
          a.notes || '—',
        ]);
        const bg = idx % 2 === 0 ? COLORS.white : COLORS.gray50;
        row.eachCell((cell) => {
          cell.fill = solidFill(bg);
          cell.border = thinBorder(COLORS.gray200);
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.font = { size: 10 };
        });
        row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };  // name
        row.getCell(9).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }; // notes

        const actionCell = row.getCell(4);
        actionCell.font = { bold: true, size: 10, color: { argb: meta.color } };
        actionCell.fill = solidFill(meta.bg);

        if (a.action_type === 'EDIT') {
          row.getCell(6).font = { size: 10, color: { argb: COLORS.gray500 } }; // old value muted
          row.getCell(7).font = { size: 10, bold: true, color: { argb: COLORS.gray900 } }; // new value strong
        }
      });
    }

    ws.columns = [
      { width: 22 }, { width: 14 }, { width: 24 }, { width: 18 },
      { width: 16 }, { width: 22 }, { width: 22 }, { width: 18 }, { width: 30 },
    ];
    ws.autoFilter = { from: { row: headerRow.number, column: 1 }, to: { row: headerRow.number, column: COLS } };

    // ---------- Sheet 2: Summary ----------
    const ws2 = wb.addWorksheet('Summary');
    ws2.mergeCells('A1:C1');
    const s1 = ws2.getCell('A1');
    s1.value = 'Activity Summary';
    s1.font = { size: 16, bold: true, color: { argb: COLORS.white } };
    s1.fill = solidFill(COLORS.primary);
    s1.alignment = { horizontal: 'center', vertical: 'middle' };
    ws2.getRow(1).height = 30;
    ws2.addRow([]);

    const byAction = {};
    const byAdmin = {};
    activities.forEach((a) => {
      byAction[a.action_type] = (byAction[a.action_type] || 0) + 1;
      const who = a.admin_name || 'Unknown / Not logged';
      byAdmin[who] = (byAdmin[who] || 0) + 1;
    });

    const ah = ws2.addRow(['Action Type', 'Count']);
    ah.eachCell((c) => {
      c.font = { bold: true, color: { argb: COLORS.white } };
      c.fill = solidFill(COLORS.primaryDark);
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = thinBorder(COLORS.primaryDark);
    });
    Object.entries(byAction).forEach(([t, n]) => {
      const meta = metaFor(t);
      const r = ws2.addRow([meta.label, n]);
      r.eachCell((c) => { c.border = thinBorder(COLORS.gray200); c.alignment = { horizontal: 'center', vertical: 'middle' }; });
      r.getCell(1).font = { bold: true, color: { argb: meta.color } };
      r.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    });

    ws2.addRow([]);
    const bh = ws2.addRow(['Admin', 'Actions']);
    bh.eachCell((c) => {
      c.font = { bold: true, color: { argb: COLORS.white } };
      c.fill = solidFill(COLORS.primaryDark);
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = thinBorder(COLORS.primaryDark);
    });
    Object.entries(byAdmin).forEach(([who, n]) => {
      const r = ws2.addRow([who, n]);
      r.eachCell((c) => { c.border = thinBorder(COLORS.gray200); c.alignment = { horizontal: 'center', vertical: 'middle' }; });
      r.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    });

    ws2.columns = [{ width: 28 }, { width: 14 }, { width: 10 }];

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Attendance_AdminActivity_${monthlyYear}-${String(monthlyMonth).padStart(2, '0')}.xlsx`);
  } catch (err) {
    console.error('Admin activity export failed:', err);
    alert('Failed to export. Please try again.');
  }
};

  const handleExport = async (type) => {
    if (!canManage) return;
    if (type === 'daily') { await exportDailyStyled(); return; }
    if (type === 'monthly') {
      if (monthlyExportType === 'monthly_detailed') await exportMonthlyStyled();
      else if (monthlyExportType === 'missed_clockin') await exportMonthlyMissedClockInReport();
      else if (monthlyExportType === 'penalty_over_100') await exportMonthlyPenaltyOverReport(100);
        else if (monthlyExportType === 'admin_activity') await exportAdminActivityReport();
      else await exportMonthlyStyled();
    }
  };

  // ===== RENDER =====
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="text-center mb-3">
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              KIOTEL
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto rounded-full mt-1"></div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <FaChartLine className="text-white text-lg sm:text-xl" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Attendance Analytics</h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Daily and monthly attendance reports</p>
            </div>
          </div>

          {roleLoading ? (
            <div className="text-xs text-gray-500 mb-2">Loading permissions…</div>
          ) : !canManage ? (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
              Read-only access: export/edit/delete/waive-late/waive-early are disabled for your role (role_id {String(userRole)}).
            </div>
          ) : null}
        </div>

        {/* Summary Cards */}
        <div className="flex-shrink-0 px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3 mb-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200/50 p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                  <FaCheckCircle className="text-white text-base sm:text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">Present</h3>
                  <p className="text-lg sm:text-xl font-bold text-emerald-700">{dailySummary.present}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200/50 p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                  <FaTimesCircle className="text-white text-base sm:text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">Missed Out</h3>
                  <p className="text-lg sm:text-xl font-bold text-red-700">{dailySummary.missed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200/50 p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                  <FaExclamationTriangle className="text-white text-base sm:text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">Late</h3>
                  <p className="text-lg sm:text-xl font-bold text-amber-700">{dailySummary.late}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200/50 p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                  <FaClock className="text-white text-base sm:text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">Early Out</h3>
                  <p className="text-lg sm:text-xl font-bold text-orange-700">{dailySummary.earlyClockOut}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200/50 p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                  <FaTimesCircle className="text-white text-base sm:text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">Absent</h3>
                  <p className="text-lg sm:text-xl font-bold text-gray-700">{dailySummary.absent}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200/50 p-2 sm:p-3 col-span-2 lg:col-span-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                  <FaBriefcase className="text-white text-base sm:text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">OT (hrs)</h3>
                  <p className="text-lg sm:text-xl font-bold text-blue-700">
                    {isFinite(monthlySummary.totalOt) ? Math.floor(monthlySummary.totalOt / 60) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-shrink-0 px-4 sm:px-6 mb-4">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Employee Name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-200 rounded-xl leading-5 bg-white/80 backdrop-blur-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-1 flex flex-col px-4 sm:px-6 pb-4 sm:pb-6 min-h-0">
          <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl rounded-t-xl border border-gray-200/50 shadow-lg overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 px-4 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm transition-all duration-300 relative ${
                  activeTab === 'daily' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('daily')}
              >
                {activeTab === 'daily' && <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-blue-600 to-blue-500"></div>}
                Daily Attendance
              </button>
              <button
                className={`flex-1 px-4 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm transition-all duration-300 relative ${
                  activeTab === 'monthly' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('monthly')}
              >
                {activeTab === 'monthly' && <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-blue-600 to-blue-500"></div>}
                Monthly Summary
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-b-xl shadow-lg border border-t-0 border-gray-200/50 overflow-hidden flex flex-col min-h-0">

            {/* ===== DAILY TAB ===== */}
            {activeTab === 'daily' && (
              <>
                <div className="flex-shrink-0 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-gray-900">Daily Attendance</h2>
                      <p className="text-xs text-gray-600 mt-0.5">{format(parseISO(date), 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none flex-1 sm:flex-none"
                      />
                      {canManage && (
                        <button
                          onClick={() => handleExport('daily')}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold px-3 py-1.5 rounded-lg transition text-xs sm:text-sm whitespace-nowrap"
                        >
                          <FaFileExport className="text-xs" />
                          <span>Export</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto min-h-0">
                  {loadingDaily ? (
                    <div className="p-4"><TableSkeleton /></div>
                  ) : filteredDailyData && filteredDailyData.length > 0 ? (
                    <div className="overflow-x-auto h-full">
                      <table className="w-full min-w-[1000px]">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-gradient-to-r from-blue-600 to-blue-500">
                            <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-white uppercase">Employee</th>
                            <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-white uppercase">Shift</th>
                            <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-white uppercase">In</th>
                            <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-white uppercase">Out</th>
                            <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-white uppercase">Status</th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-white uppercase">Late</th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-white uppercase">Early</th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-white uppercase">Penalty</th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-white uppercase">OT</th>
                            <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-white uppercase">Photo</th>
                            <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-white uppercase">Actions</th>
                          </tr>
                        </thead>

                        <tbody className="bg-white">
                          {filteredDailyData.map((row, index) => (
                            <tr
                              key={row.id || `${row.unique_id}-${index}`}
                              className={`transition-colors ${
                                row.is_first_shift
                                  ? 'border-t border-gray-200 bg-white hover:bg-blue-50'
                                  : 'border-t-0 bg-gray-50/40 hover:bg-gray-100'
                              }`}
                            >
                              {/* Employee */}
                              <td className="px-2 sm:px-3 py-2">
                                {row.is_first_shift ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleViewEmployee(row.unique_id)}
                                      className="font-semibold text-gray-900 hover:text-blue-600 hover:underline text-xs sm:text-sm text-left flex items-center gap-1.5"
                                    >
                                      <span className="truncate">{row.name}</span>
                                    </button>
                                    <div className="text-[10px] sm:text-xs text-gray-500">{row.unique_id}</div>
                                  </>
                                ) : (
                                  <div className="flex items-center pl-3 mt-1 relative">
                                    <span className="text-gray-300 font-light mr-1.5 -translate-y-0.5" style={{ fontSize: '18px', lineHeight: '1' }}>↳</span>
                                    <span className="text-[10px] sm:text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shadow-sm">
                                      Shift {row.shift_index}
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Shift */}
                              <td className="px-2 sm:px-3 py-2">
                                <div className="font-medium text-gray-900 text-xs">
                                  {row.shift_name === 'ADMIN' ? 'Flexible 8-Hour' : row.shift_name}
                                </div>
                                {row.shift_name !== 'ADMIN' && row.shift_name !== '—' && (
                                  <div className="text-[10px] text-gray-500">{row.shift_start} - {row.shift_end}</div>
                                )}
                              </td>

                              {/* Clock In */}
                              <td className="px-2 sm:px-3 py-2">
                                {row.clock_in ? (
                                  <span className="inline-flex px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[10px] sm:text-xs font-medium">
                                    {formatTime(row.clock_in)}
                                  </span>
                                ) : canManage ? (
                                  <button
                                    onClick={() => openManualAdd(row)}
                                    className="inline-flex items-center justify-center px-3 py-0.5 rounded-md bg-gray-100 hover:bg-blue-500 text-gray-500 hover:text-white transition-all cursor-pointer border border-dashed border-gray-300 hover:border-transparent shadow-sm"
                                    title="Add Record"
                                  >
                                    —
                                  </button>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>

                              {/* Clock Out */}
                              <td className="px-2 sm:px-3 py-2">
                                {row.clock_out && !row.is_missed ? (
                                  <span className="inline-flex px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[10px] sm:text-xs font-medium">
                                    {formatTime(row.clock_out)}
                                  </span>
                                ) : row.clock_in ? (
                                  <span className={`inline-flex px-1.5 py-0.5 rounded ${row.is_missed ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'} text-[10px] sm:text-xs font-medium`}>
                                    {row.is_missed ? 'Missed' : '—'}
                                  </span>
                                ) : canManage ? (
                                  <button
                                    onClick={() => openManualAdd(row)}
                                    className="inline-flex items-center justify-center px-3 py-0.5 rounded-md bg-gray-100 hover:bg-blue-500 text-gray-500 hover:text-white transition-all cursor-pointer border border-dashed border-gray-300 hover:border-transparent shadow-sm"
                                    title="Add Record"
                                  >
                                    —
                                  </button>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="px-2 sm:px-3 py-2">
                                <StatusBadge status={row.status} />
                              </td>

                              {/* Late (with Waive Late button) */}
                              <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-semibold text-amber-700">
                                <div className="flex items-center justify-end gap-2">
                                  {row.is_late_waived ? '0' : row.late_minutes > 0 ? row.late_minutes : '—'}
                                  {canManage && row.status !== 'Absent' && (row.late_minutes > 0 || row.is_late_waived) && (
                                    <button
                                      onClick={() => handleToggleWaiveLate(row.id, row.is_late_waived)}
                                      className={`text-[10px] px-1 rounded transition-colors ${
                                        row.is_late_waived
                                          ? 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                      }`}
                                      title={row.is_late_waived ? 'Restore Late Minutes' : 'Waive Late Minutes'}
                                    >
                                      {row.is_late_waived ? 'Restore' : 'Waive'}
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Early (with Waive Early button — NEW) */}
                              <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-semibold text-orange-700">
                                <div className="flex items-center justify-end gap-2">
                                  {row.is_early_waived ? '0' : row.early_clock_out_minutes > 0 ? row.early_clock_out_minutes : '—'}
                                  {canManage && row.status !== 'Absent' && (row.early_clock_out_minutes > 0 || row.is_early_waived) && (
                                    <button
                                      onClick={() => handleToggleWaiveEarly(row.id, row.is_early_waived)}
                                      className={`text-[10px] px-1 rounded transition-colors ${
                                        row.is_early_waived
                                          ? 'bg-teal-100 hover:bg-teal-200 text-teal-600'
                                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                      }`}
                                      title={row.is_early_waived ? 'Restore Early Clock-Out Minutes' : 'Waive Early Clock-Out Minutes'}
                                    >
                                      {row.is_early_waived ? 'Restore' : 'Waive'}
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Penalty */}
                              <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-semibold text-purple-700 bg-purple-50/30">
                                {row.penalty_minutes > 0 ? row.penalty_minutes : '—'}
                              </td>

                              {/* OT */}
                              <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-semibold text-blue-700">
                                {row.overtime_minutes || 0}
                              </td>

                              {/* Photo */}
                              <td className="px-2 sm:px-3 py-2 text-center">
                                {row.photo_placeholder === 'manual_entry' ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] sm:text-xs font-semibold border border-purple-100">
                                    Admin Entry
                                  </span>
                                ) : row.photo_captured ? (
                                  <FaCheckCircle className="inline text-emerald-600" />
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="px-2 sm:px-3 py-2 text-center">
                                {canManage && row.clock_in && !String(row.id).startsWith('absent') && (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => openEditModal(row)}
                                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                      title="Edit Times"
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRecord(row.id)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                      title="Delete Record"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                        <FaSearch className="text-blue-400 text-2xl" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">No Records Found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ===== MONTHLY TAB ===== */}
            {activeTab === 'monthly' && (
              <>
                <div className="flex-shrink-0 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-gray-900">Monthly Summary</h2>
                      <p className="text-xs text-gray-600 mt-0.5">{monthNames[monthlyMonth - 1]} {monthlyYear}</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={monthlyYear}
                        onChange={(e) => setMonthlyYear(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {[2023, 2024, 2025, 2026, 2027, 2028].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>

                      <select
                        value={monthlyMonth}
                        onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {monthNames.map((name, idx) => (
                          <option key={idx} value={idx + 1}>{name}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1 border-l pl-2 ml-1 border-gray-300">
                        <span className="text-xs font-semibold text-gray-600">Start:</span>
                        <input
                          type="date"
                          value={monthlyStartDate}
                          onChange={(e) => setMonthlyStartDate(e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      {canManage && (
                        <select
                          value={monthlyExportType}
                          onChange={(e) => setMonthlyExportType(e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          title="Choose monthly report type"
                        >
                          <option value="monthly_detailed">Monthly Attendance Report (Current)</option>
                          <option value="missed_clockin">Missed / Not Clocked In</option>
                          <option value="penalty_over_100">Penalty &gt; 100 Minutes</option>
                          <option value="admin_activity">Admin Activity Log</option> 
                        </select>
                      )}

                      {canManage && (
                        <button
                          onClick={() => handleExport('monthly')}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold px-3 py-1.5 rounded-lg transition text-xs sm:text-sm whitespace-nowrap ml-2"
                        >
                          <FaFileExport className="text-xs" />
                          <span>Export</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto min-h-0">
                  {loadingMonthly ? (
                    <div className="p-4"><TableSkeleton /></div>
                  ) : filteredMonthlyData && filteredMonthlyData.length > 0 ? (
                    <div className="overflow-x-auto h-full">
                      <table className="w-full min-w-[900px]">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-gradient-to-r from-blue-600 to-blue-500">
                            <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-white uppercase">Employee</th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-white uppercase">Days</th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-white uppercase">Present</th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-white uppercase">Late</th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-white uppercase">Early</th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-white uppercase">Penalty</th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-white uppercase">Absent</th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-white uppercase">OT (min)</th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-white uppercase">OT (hrs)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {filteredMonthlyData.map((row) => (
                            <tr key={row.unique_id} className="hover:bg-blue-50 transition-colors">
                              <td className="px-2 sm:px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => setMonthlyPhotoEmployee({ unique_id: row.unique_id, name: row.name })}
                                  className="font-semibold text-gray-900 hover:text-blue-600 hover:underline text-xs sm:text-sm text-left block w-full"
                                >
                                  {row.name}
                                </button>
                                <div className="text-[10px] sm:text-xs text-gray-500">{row.unique_id}</div>
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-semibold text-gray-900">{row.total_working_days || '—'}</td>
                              <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-semibold text-emerald-700">{row.present}</td>
                              <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-semibold text-amber-700">{row.late}</td>
                              <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-semibold text-orange-700">{row.early_clock_out || 0}</td>
                              <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-semibold text-purple-700 bg-purple-50/50">{row.penalty_minutes || 0}</td>
                              <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-semibold text-rose-700">{row.absent}</td>
                              <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-semibold text-blue-700">{row.total_ot_minutes}</td>
                              <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-semibold text-blue-700">
                                {Math.floor((Number(row.total_ot_minutes) || 0) / 60)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                        <FaSearch className="text-blue-400 text-2xl" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">No Records Found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== Add Modal ===== */}
      {isAddModalOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" /> Add Attendance Record
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
                  {addFormData.employee_name} ({addFormData.employee_id})
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                <select
                  required
                  value={addFormData.shift_id}
                  onChange={(e) => setAddFormData((prev) => ({ ...prev, shift_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="">Select Shift...</option>
                  {availableShifts.map((shift) => (
                    <option key={shift.id} value={String(shift.id)}>
                      {shift.shift_name} ({shift.start_time} - {shift.end_time})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clock In Time</label>
                  <input
                    type="time"
                    required
                    value={addFormData.clock_in_time}
                    onChange={(e) => setAddFormData({ ...addFormData, clock_in_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clock Out Time (Optional)</label>
                  <input
                    type="time"
                    value={addFormData.clock_out_time}
                    onChange={(e) => setAddFormData({ ...addFormData, clock_out_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isAdding ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Edit Modal ===== */}
      {isEditModalOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaEdit className="text-purple-600" /> Edit Attendance Record
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
                  {editFormData.employee_name} ({editFormData.unique_id})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Date</label>
                  <input
                    type="date"
                    required
                    value={editFormData.attendance_date}
                    onChange={(e) => setEditFormData({ ...editFormData, attendance_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                  <select
                    required
                    value={editFormData.shift_id}
                    onChange={(e) => setEditFormData({ ...editFormData, shift_id: e.target.value })}
                    className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm transition-all"
                  >
                    <option value="">Select Shift...</option>
                    {availableShifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.shift_name} ({shift.start_time} - {shift.end_time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clock In Time</label>
                  <input
                    type="time"
                    required
                    value={editFormData.clock_in_time}
                    onChange={(e) => setEditFormData({ ...editFormData, clock_in_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clock Out Time (Optional)</label>
                  <input
                    type="time"
                    value={editFormData.clock_out_time}
                    onChange={(e) => setEditFormData({ ...editFormData, clock_out_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isEditing ? 'Updating...' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalOpen && <EmployeeAttendanceModal employeeData={modalData} onClose={closeModal} />}

      {monthlyPhotoEmployee && (
        <EmployeeMonthlyPhotosModal
          employeeId={monthlyPhotoEmployee.unique_id}
          employeeName={monthlyPhotoEmployee.name}
          year={monthlyYear}
          month={monthlyMonth}
          onClose={() => setMonthlyPhotoEmployee(null)}
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