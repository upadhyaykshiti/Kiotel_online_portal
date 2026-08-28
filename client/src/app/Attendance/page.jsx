"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import PhotoCapture from "./PhotoCapture";
import FaceScan from "./FaceScan";
import FaceRegister from "./FaceRegister";
import {
  FaUser,
  FaClock,
  FaCheckCircle,
  FaSignInAlt,
  FaSignOutAlt,
  FaIdCard,
  FaCalendarAlt,
  FaCamera,
} from "react-icons/fa";
import { format } from "date-fns";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";
const ALLOWED_EMAIL = "Clockin@kiotel.co";

const DIRECT_SHIFT_EMAILS = [
  "shuvam.r@kiotel.co",
  "bhuvnesh.s@kiotel.co",
  "tushars@kiotel.co",
  "vishals@kiotel.co",
  "adityas@kiotel.co",
  "arbaz.p@valianthotels.com",
];

// 🔴 DIRECT SHIFT USER GROUPS (subset of DIRECT_SHIFT_EMAILS, keep lowercase) 🔴
// Dev team -> only Non General shifts (category_id 3)
const DEV_TEAM_EMAILS = [
  "shuvam.r@kiotel.co",
  "bhuvnesh.s@kiotel.co",
  "tushars@kiotel.co",
  "vishals@kiotel.co",
  "adityas@kiotel.co",
];

// Office admins -> only the ADMIN shift
const OFFICE_ADMIN_DIRECT_EMAILS = [
  "arbaz.p@valianthotels.com",
];

// 🔴 ADD YOUR SPECIFIC EMPLOYEE IDs HERE 🔴
const QA_TEAM_IDS = ["1QD211Q", "J9CI294", "L48FR84", "P0623XZ"];
const OFFICE_ADMIN_IDS = ["8P4YX26", "16YM0V6", "FF39G61"];

export default function ClockPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState("face_scan");
  const [accountNo, setAccountNo] = useState("");
  const [employee, setEmployee] = useState(null);
  const [allShifts, setAllShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [frequentShift, setFrequentShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [photoData, setPhotoData] = useState(null);
  const [photoType, setPhotoType] = useState("clock_in");

  const [showFaceRegister, setShowFaceRegister] = useState(false);
  const [isNewFaceUser, setIsNewFaceUser] = useState(false);

  const [shiftTab, setShiftTab] = useState("General");

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userUniqueID, setUserUniqueID] = useState("");
  const [userFname, setUserFname] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [isDirectShiftUser, setIsDirectShiftUser] = useState(false);

  const [pendingEmployee, setPendingEmployee] = useState(null);

  const [isMobile, setIsMobile] = useState(false);

  const [adminSelectedDate, setAdminSelectedDate] = useState(null);

  // const [allowedNonGeneralShiftIds, setAllowedNonGeneralShiftIds] = useState([]);
  const [hasNonGeneralAccess, setHasNonGeneralAccess] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const wakeupSpeechEngine = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance("");
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  };

// Add this useEffect to check access when employee is loaded
useEffect(() => {
  if (employee?.unique_id && !isDirectShiftUser) {
    const checkAccess = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/clockin/employee/has-non-general-access?account_no=${encodeURIComponent(employee.unique_id)}`
        );
        const data = await res.json();
        
        if (res.ok && data.success) {
          setHasNonGeneralAccess(data.data.has_access);
        }
      } catch (err) {
        console.error("Failed to check non-general access:", err);
      }
    };
    
    checkAccess();
  }
}, [employee?.unique_id, isDirectShiftUser]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }

    const checkAuth = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
          withCredentials: true,
        });

        const userData = res.data;
        const email = userData.email;

        setUserEmail(email);
        setUserFname(userData.fname);
        setUserRole(userData.role);
        setUserUniqueID(userData.unique_id);
        setLoggedInUser(userData);

        if (email !== ALLOWED_EMAIL && !DIRECT_SHIFT_EMAILS.includes(email)) {
          router.push("/sign-in?error=access_denied");
          return;
        }

        setIsAuthorized(true);

        if (DIRECT_SHIFT_EMAILS.includes(email)) {
          setIsDirectShiftUser(true);
          setAccountNo(userData.unique_id);

          try {
            const empRes = await fetch(
              `${API_BASE_URL}/clockin/employee/by-unique-id?account_no=${encodeURIComponent(
                userData.unique_id
              )}`
            );
            const empDataResponse = await empRes.json();

            if (empRes.ok && empDataResponse.success) {
              const empData = empDataResponse.data;
              setEmployee(empData);

              if (isNewFaceUser) {
                setShowFaceRegister(true);
                setStep("face_register");
              } else if (
                empData.current_attendance &&
                empData.current_attendance.clock_in &&
                !empData.current_attendance.clock_out &&
                empData.current_shift
              ) {
                setSelectedShift(empData.current_shift);
                setClockInTime(empData.current_attendance.clock_in);
                setIsClockedIn(true);
                setPhotoType("clock_out");
                setMessage(`Currently clocked in. Ready to clock out.`);
                setStep("action");
              } else {
                if (empData.frequent_shift) {
                  setFrequentShift(empData.frequent_shift);
                  setStep("frequent_shift_prompt");
                } else {
                  setStep("shift");
                }
              }
            } else {
              setMessage("Employee data not found. Please contact administrator.");
              setStep("face_scan");
            }
          } catch (err) {
            console.error("Failed to fetch employee data:", err);
            setMessage("Failed to load employee data.");
            setStep("face_scan");
          }
        } else {
          setStep("face_scan");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/sign-in?error=session_expired");
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;
    const fetchShifts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/clockin/shifts`);
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setAllShifts(data);
        } else {
          setAllShifts([]);
        }
      } catch (err) {
        console.error("Fetch shifts error", err);
        setAllShifts([]);
      }
    };
    fetchShifts();
  }, [isAuthorized]);

  // Direct shift users (attendance module on their dashboard) are further split
  // into a dev team group and an office admin group.
  const normalizedEmail = String(userEmail || "").trim().toLowerCase();
  const isDevTeamDirect =
    isDirectShiftUser && DEV_TEAM_EMAILS.includes(normalizedEmail);
  const isOfficeAdminDirect =
    isDirectShiftUser && OFFICE_ADMIN_DIRECT_EMAILS.includes(normalizedEmail);

  const isGeneralUser =
    employee &&
    !isDevTeamDirect &&
    !isOfficeAdminDirect &&
    !QA_TEAM_IDS.includes(String(employee.unique_id)) &&
    !OFFICE_ADMIN_IDS.includes(String(employee.unique_id));

  // const availableShifts = allShifts.filter((shift) => {
  //   if (!employee) return false;
  //   const empId = String(employee.unique_id);

  //   if (QA_TEAM_IDS.includes(empId)) {
  //     return shift.category_id === 2;
  //   }

  //   if (OFFICE_ADMIN_IDS.includes(empId)) {
  //     return shift.shift_name === "ADMIN";
  //   }

  //   return (shift.category_id === 1 || shift.category_id === 3) && shift.shift_name !== "ADMIN";
  // });

//   const availableShifts = allShifts.filter((shift) => {
//   if (!employee) return false;
//   const empId = String(employee.unique_id);

//   // QA Team - No change
//   if (QA_TEAM_IDS.includes(empId)) {
//     return shift.category_id === 2;
//   }

//   // Office Admins - No change
//   if (OFFICE_ADMIN_IDS.includes(empId)) {
//     return shift.shift_name === "ADMIN";
//   }

//   // General Users
//   // Always show General Shifts (Category 1)
//   if (shift.category_id === 1 && shift.shift_name !== "ADMIN") {
//     return true;
//   }

//   // Only show Non-General Shifts (Category 3) if explicitly assigned
//   if (shift.category_id === 3 && shift.shift_name !== "ADMIN") {
//     return allowedNonGeneralShiftIds.includes(shift.id);
//   }

//   return false;
// });

// Update the availableShifts filter
const availableShifts = allShifts.filter((shift) => {
  if (!employee) return false;
  const empId = String(employee.unique_id);

  // Dev Team (direct shift users) - only Non General shifts
  if (isDevTeamDirect) {
    return shift.category_id === 3 && shift.shift_name !== "ADMIN";
  }

  // Office Admins (direct shift users) - only the ADMIN shift
  if (isOfficeAdminDirect) {
    return shift.shift_name === "ADMIN";
  }

  // QA Team - No change
  if (QA_TEAM_IDS.includes(empId)) {
    return shift.category_id === 2;
  }

  // Office Admins - No change
  if (OFFICE_ADMIN_IDS.includes(empId)) {
    return shift.shift_name === "ADMIN";
  }

  // General Users
  // Always show General Shifts (Category 1)
  if (shift.category_id === 1 && shift.shift_name !== "ADMIN") {
    return true;
  }

  // Only show Non-General Shifts (Category 3) if user has access
  if (shift.category_id === 3 && shift.shift_name !== "ADMIN") {
    return hasNonGeneralAccess;
  }

  return false;
});
  const generalShifts = availableShifts.filter((shift) => shift.category_id === 1);
  const nonGeneralShifts = availableShifts.filter((shift) => shift.category_id === 3);

  const displayedShifts = isGeneralUser
    ? shiftTab === "General"
      ? generalShifts
      : nonGeneralShifts
    : availableShifts;

  const handleFaceMatched = async (employeeId) => {
    wakeupSpeechEngine();
    setLoading(true);
    setMessage("");
    setAccountNo(employeeId);

    try {
      const res = await fetch(
        `${API_BASE_URL}/clockin/employee/by-unique-id?account_no=${encodeURIComponent(employeeId)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage("Employee not found. Please try entering your ID manually.");
        setStep("id");
        return;
      }

      const empData = data.data;

      setPendingEmployee(empData);
      setStep("confirm_identity");
    } catch (err) {
      setMessage("Network error. Please try again.");
      setStep("id");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmIdentity = () => {
    setEmployee(pendingEmployee);
    setIsNewFaceUser(false);

    if (
      pendingEmployee.current_attendance &&
      pendingEmployee.current_attendance.clock_in &&
      !pendingEmployee.current_attendance.clock_out &&
      pendingEmployee.current_shift
    ) {
      setSelectedShift(pendingEmployee.current_shift);
      setClockInTime(pendingEmployee.current_attendance.clock_in);
      setIsClockedIn(true);
      setPhotoType("clock_out");
      setMessage(`Currently clocked in. Ready to clock out.`);
      setStep("action");
    } else {
      if (pendingEmployee.frequent_shift) {
        setFrequentShift(pendingEmployee.frequent_shift);
        setStep("frequent_shift_prompt");
      } else {
        setStep("shift");
      }
    }
  };

  const handleCancelIdentity = () => {
    setPendingEmployee(null);
    setAccountNo("");
    setStep("face_scan");
  };

  const handleFaceNoMatch = () => {
    setIsNewFaceUser(true);
    setStep("id");
  };

  const handleFaceScanError = (error) => {
    console.error("Face scan error:", error);
    setStep("id");
  };

  const handleIdSubmit = async (e, forceRegister = false) => {
    e.preventDefault();
    wakeupSpeechEngine();
    if (!accountNo.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/clockin/employee/by-unique-id?account_no=${encodeURIComponent(accountNo)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage(data.message || "Employee not found");
        return;
      }

      const empData = data.data;
      setEmployee(empData);

      if (isNewFaceUser || forceRegister) {
        setShowFaceRegister(true);
        setStep("face_register");
      } else if (
        empData.current_attendance &&
        empData.current_attendance.clock_in &&
        !empData.current_attendance.clock_out &&
        empData.current_shift
      ) {
        setSelectedShift(empData.current_shift);
        setClockInTime(empData.current_attendance.clock_in);
        setIsClockedIn(true);
        setPhotoType("clock_out");
        setMessage(`Currently clocked in. Ready to clock out.`);
        setStep("action");
      } else {
        if (empData.frequent_shift) {
          setFrequentShift(empData.frequent_shift);
          setStep("frequent_shift_prompt");
        } else {
          setStep("shift");
        }
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceRegistered = () => {
    setShowFaceRegister(false);
    if (
      employee?.current_attendance &&
      employee.current_attendance.clock_in &&
      !employee.current_attendance.clock_out &&
      employee?.current_shift
    ) {
      setSelectedShift(employee.current_shift);
      setClockInTime(employee.current_attendance.clock_in);
      setIsClockedIn(true);
      setPhotoType("clock_out");
      setMessage(`Currently clocked in. Ready to clock out.`);
      setStep("action");
    } else {
      if (employee?.frequent_shift) {
        setFrequentShift(employee.frequent_shift);
        setStep("frequent_shift_prompt");
      } else {
        setStep("shift");
      }
    }
  };

  const handleFaceRegisterSkip = () => {
    setShowFaceRegister(false);
    if (
      employee?.current_attendance &&
      employee.current_attendance.clock_in &&
      !employee.current_attendance.clock_out &&
      employee?.current_shift
    ) {
      setSelectedShift(employee.current_shift);
      setClockInTime(employee.current_attendance.clock_in);
      setIsClockedIn(true);
      setPhotoType("clock_out");
      setMessage(`Currently clocked in. Ready to clock out.`);
      setStep("action");
    } else {
      if (employee?.frequent_shift) {
        setFrequentShift(employee.frequent_shift);
        setStep("frequent_shift_prompt");
      } else {
        setStep("shift");
      }
    }
  };

  const handleShiftSelection = (shift) => {
    setSelectedShift(shift);
  };

  const handlePhotoCapture = (dataUrl) => {
    setPhotoData(dataUrl);
    handleSubmitPhoto(dataUrl);
  };

  const handlePhotoRetake = () => {
    setPhotoData(null);
  };

  const formatTime = (value) => {
    if (!value) return "—";
    try {
      let timeStr = null;
      if (typeof value === "string" && value.includes("T")) {
        timeStr = value.split("T")[1].replace("Z", "").split(".")[0];
      } else if (typeof value === "string" && value.includes(" ") && value.includes(":")) {
        timeStr = value.split(" ")[1];
      } else if (typeof value === "string" && value.includes(":")) {
        timeStr = value;
      }
      if (timeStr) {
        const parts = timeStr.split(":");
        let hours = parseInt(parts[0], 10);
        const mins = (parts[1] || "00").padStart(2, "0");
        if (isNaN(hours)) return "—";
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours}:${mins} ${ampm}`;
      }
    } catch (e) {
      console.error("formatTime error:", e);
    }
    return "—";
  };

  const handleConfirmShift = async (overrideShift = null) => {
    wakeupSpeechEngine();

    const targetShift = overrideShift || selectedShift;

    if (!targetShift || !accountNo) {
      setMessage("Please select a shift and ensure your ID is entered.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const resStatus = await fetch(
        `${API_BASE_URL}/clockin/attendance/status?account_no=${encodeURIComponent(
          accountNo
        )}&date=${currentDate}&shift_id=${targetShift.id}`
      );
      const dataStatus = await resStatus.json();

      const extractTime = (datetime) => {
        if (!datetime) return null;
        if (typeof datetime === "string" && datetime.length <= 8 && !datetime.includes("T")) {
          return datetime;
        }
        if (typeof datetime === "string" && datetime.includes("T")) {
          return datetime.split("T")[1].replace("Z", "").split(".")[0];
        }
        if (typeof datetime === "string" && datetime.includes(" ")) {
          return datetime.split(" ")[1];
        }
        return datetime;
      };

      if (!resStatus.ok || !dataStatus.success) {
        setIsClockedIn(false);
        setClockInTime(null);
        setClockOutTime(null);
        setPhotoType("clock_in");
        setMessage(`Ready to clock in for ${targetShift.shift_name}`);
        setStep("action");
        return;
      }

      const status = dataStatus.data.status;
      const clockIn = dataStatus.data.clock_in;
      const clockOut = dataStatus.data.clock_out;

      let currentStatus = status;

      if (targetShift.shift_name !== "ADMIN") {
        const now = new Date();
        const [startH, startM] = targetShift.start_time.split(":").map(Number);
        const [endH, endM] = targetShift.end_time.split(":").map(Number);

        let closestStartDiff = Infinity;
        let closestEndDiff = Infinity;

        [-1, 0, 1].forEach((offset) => {
          const tempStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, startH, startM, 0);
          const tempEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, endH, endM, 0);

          if (endH < startH || targetShift.is_cross_midnight === 1) {
            tempEnd.setDate(tempEnd.getDate() + 1);
          }

          const sDiff = (now - tempStart) / (1000 * 60 * 60);
          if (Math.abs(sDiff) < Math.abs(closestStartDiff)) {
            closestStartDiff = sDiff;
          }

          const eDiff = (now - tempEnd) / (1000 * 60 * 60);
          if (Math.abs(eDiff) < Math.abs(closestEndDiff)) {
            closestEndDiff = eDiff;
          }
        });

        if (currentStatus === "clocked_in" && closestEndDiff > 6) {
          currentStatus = "not_clocked_in";
        }

        if (currentStatus === "not_clocked_in" || currentStatus === "clocked_out") {
          if (closestStartDiff < -2) {
            setMessage(
              `🚫 Cannot clock in yet. Clock-in opens 2 hours before your shift starts (${formatTime(
                targetShift.start_time
              )}). Please Contact Admin!`
            );
            setLoading(false);
            return;
          }
          if (closestStartDiff > 2) {
            setMessage(
              `🚫 Clock-in closed. You are more than 2 hours late for your shift (${formatTime(
                targetShift.start_time
              )}). Please Contact Admin!`
            );
            setLoading(false);
            return;
          }
        }
      }

      if (currentStatus === "clocked_in") {
        // ✅ 15-minute restriction (UI) using IST parsing
        if (clockIn) {
          const inStr = String(clockIn).replace(" ", "T"); // "YYYY-MM-DDTHH:mm:ss"
          const inIST = new Date(inStr + "+05:30"); // treat DB datetime as IST

          const diffMins = (Date.now() - inIST.getTime()) / 60000;

          if (diffMins >= 0 && diffMins < 15) {
            const remaining = Math.ceil(15 - diffMins);
            setMessage(`🚫 Cannot clock out yet. Please wait ${remaining} more minute(s).`);
            setLoading(false);
            return;
          }
        }

        setIsClockedIn(true);
        setClockInTime(extractTime(clockIn));
        setClockOutTime(null);
        setPhotoType("clock_out");
        setMessage("Currently clocked in. Ready to clock out.");
        setStep("action");
      } else if (currentStatus === "clocked_out") {
        setIsClockedIn(false);
        setClockInTime(extractTime(clockIn));
        setClockOutTime(extractTime(clockOut));
        setPhotoType("clock_in");
        setMessage("Already clocked out. Ready to clock in again.");
        setStep("action");
      } else {
        setIsClockedIn(false);
        setClockInTime(null);
        setClockOutTime(null);
        setPhotoType("clock_in");

        if (targetShift.shift_name === "ADMIN") {
          setMessage(`Please select the attendance date for this shift.`);
          setStep("admin_date_prompt");
          return;
        }

        if (status === "clocked_in" && currentStatus === "not_clocked_in") {
          setMessage(`Previous clock-out missed. Ready to clock in for ${targetShift.shift_name}`);
        } else {
          setMessage(`Ready to clock in for ${targetShift.shift_name}`);
        }

        setStep("action");
      }
    } catch (err) {
      setMessage("Failed to check attendance status. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    if (isDirectShiftUser) {
      setStep("shift");
      setSelectedShift(null);
      setFrequentShift(null);
      setMessage("");
      setPhotoCaptured(false);
      setAdminSelectedDate(null);
      setPhotoData(null);
      setIsClockedIn(false);
      setClockInTime(null);
      setClockOutTime(null);
      setPhotoType("clock_in");
      setShiftTab("General");
    } else {
      setStep("face_scan");
      setAccountNo("");
      setEmployee(null);
      setPendingEmployee(null);
      setSelectedShift(null);
      setFrequentShift(null);
      setMessage("");
      setPhotoCaptured(false);
      setPhotoData(null);
      setIsClockedIn(false);
      setClockInTime(null);
      setClockOutTime(null);
      setPhotoType("clock_in");
      setIsNewFaceUser(false);
      setShowFaceRegister(false);
      setShiftTab("General");
    }
  };

  const speakMessage = (text) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmitPhoto = async (directImgData) => {
    const dataToSubmit = typeof directImgData === "string" ? directImgData : photoData;
    if (!dataToSubmit || !selectedShift) return;

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(dataToSubmit);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("photo", blob, "photo.jpg");
      formData.append("account_no", accountNo);
      formData.append("photo_type", photoType);
      formData.append("selected_shift_id", selectedShift.id);

      if (adminSelectedDate && photoType === "clock_in") {
        formData.append("admin_attendance_date", adminSelectedDate);
      }

      const res = await fetch(
        `${API_BASE_URL}/clockin/attendance/clock?account_no=${encodeURIComponent(
          accountNo
        )}&photo_type=${photoType}`,
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage(data.message || "Action failed");
        return;
      }

      const extractTime = (datetime) => {
        if (!datetime) return null;
        if (typeof datetime === "string" && datetime.length <= 8 && !datetime.includes("T")) {
          return datetime;
        }
        if (typeof datetime === "string" && datetime.includes("T")) {
          return datetime.split("T")[1].replace("Z", "").split(".")[0];
        }
        if (typeof datetime === "string" && datetime.includes(" ")) {
          return datetime.split(" ")[1];
        }
        return datetime;
      };

      const safeClockIn = extractTime(data.data?.clock_in);
      const safeClockOut = extractTime(data.data?.clock_out);

      if (safeClockOut) {
        setClockInTime(safeClockIn);
        setClockOutTime(safeClockOut);
        setIsClockedIn(false);
        setPhotoType("clock_in");
        setMessage("✅ Clocked out successfully! Redirecting...");
        setPhotoCaptured(true);
        speakMessage("Good bye");
        setTimeout(() => {
          resetSession();
        }, 2500);
      } else {
        setClockInTime(safeClockIn);
        setClockOutTime(null);
        setIsClockedIn(true);
        setPhotoType("clock_out");
        setMessage("✅ Clocked in successfully! Redirecting...");
        setPhotoCaptured(true);
        speakMessage("Hi, looking good.");
        setTimeout(() => {
          resetSession();
        }, 2500);
      }
    } catch (err) {
      setMessage("Failed to process. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

    // ═══════════════════════════════════════════════════════════
  // STEP: Face Scan
  // ═══════════════════════════════════════════════════════════
  if (step === "face_scan" && !isDirectShiftUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        {/* 🚨 CONDITIONALLY RENDER MOBILE OR DESKTOP, NEVER BOTH 🚨 */}
        {isMobile ? (
          /* Mobile Layout (Removed lg:hidden) */
          <div className="relative z-10 w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200/50 flex flex-col h-[85vh]">
              
              <div className="mb-4 flex justify-center shrink-0">
                <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-10 w-auto object-contain" />
              </div>

              <div className="text-center mb-6 shrink-0">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-lg mb-4">
                  <FaClock className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Clock In / Out
                </h2>
                <p className="text-gray-600 text-sm">
                  Position your face to continue
                </p>
              </div>

              <div className="flex-1 min-h-0 flex items-center justify-center">
                <FaceScan
                  onEmployeeMatched={handleFaceMatched}
                  onNoMatch={handleFaceNoMatch}
                  onError={handleFaceScanError}
                />
              </div>

              <div className="mt-6 flex flex-col items-center shrink-0">
                <button
                  onClick={() => {
                    setIsNewFaceUser(false);
                    setStep("id");
                  }}
                  className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-blue-300 font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <FaIdCard className="text-blue-600 text-lg" />
                  Manual ID Entry
                </button>
                <p className="text-xs font-medium text-gray-500 mt-4 text-center">
                  New user or face not scanning? <br/> Click above to enter ID.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout (Removed hidden lg:block) */
          <div className="relative z-10 w-full max-w-6xl">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden h-[90vh] flex">
              <div className="grid lg:grid-cols-2 gap-0 w-full h-full min-h-0">
                
                {/* Left Panel */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-8 lg:p-12 flex flex-col relative overflow-hidden h-full">
                  <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"></div>
                  
                  {/* Center Content */}
                  <div className="relative z-10 text-center w-full flex-1 flex flex-col justify-center pb-10">
                    <div className="mb-10 bg-blue-100/95 backdrop-blur-md px-8 py-4 rounded-3xl shadow-xl inline-block mx-auto border border-blue-200/50">
                      <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-12 lg:h-16 w-auto object-contain" />
                    </div>

                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl mb-6 mx-auto">
                      <FaClock className="text-6xl text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-white">Attendance System</h2>
                    <p className="text-lg text-blue-100 max-w-md mx-auto">
                      Scan your face for instant clock in/out
                    </p>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="p-8 lg:p-12 flex flex-col justify-center overflow-y-auto min-h-0 h-full">
                  <div className="max-w-md mx-auto w-full">
                    <div className="mb-6 text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
                      <p className="text-gray-600">
                        Position your face in the camera to continue
                      </p>
                    </div>

                    <div className="mb-8">
                      <FaceScan
                        onEmployeeMatched={handleFaceMatched}
                        onNoMatch={handleFaceNoMatch}
                        onError={handleFaceScanError}
                      />
                    </div>

                    <div className="flex flex-col items-center border-t border-gray-100 pt-6">
                      <button
                        onClick={() => {
                          setIsNewFaceUser(false);
                          setStep("id");
                        }}
                        className="w-full max-w-[300px] px-4 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-blue-300 font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <FaIdCard className="text-blue-600 text-lg" />
                        Manual ID Entry
                      </button>
                      <p className="text-xs font-medium text-gray-500 mt-4 text-center">
                        New employee or face not scanning? <br/> Use manual entry to proceed or register.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
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

  // ═══════════════════════════════════════════════════════════
  // STEP: Confirm Identity
  // ═══════════════════════════════════════════════════════════
  if (step === "confirm_identity") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        {/* Mobile Layout */}
        <div className="relative z-10 w-full max-w-md lg:hidden">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200/50 text-center">
            <div className="mb-6 flex justify-center">
              <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-10 w-auto object-contain" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Face Recognized!</h2>
            <p className="text-gray-600 mb-6">Please confirm your identity</p>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 shadow-inner">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full shadow-lg mb-4">
                <span className="text-white text-4xl font-bold">
                  {pendingEmployee?.name?.charAt(0) || "?"}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{pendingEmployee?.name}</h3>
              <p className="text-blue-600 font-semibold flex items-center justify-center gap-2">
                <FaIdCard /> ID: {pendingEmployee?.unique_id}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConfirmIdentity}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <FaCheckCircle className="text-xl" />
                Yes, that is me
              </button>
              <button
                onClick={handleCancelIdentity}
                className="w-full bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <FaCamera className="text-gray-500" />
                No, scan again
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="relative z-10 w-full max-w-4xl hidden lg:block">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden flex">
            
            {/* Left Panel */}
            <div className="w-2/5 bg-gradient-to-br from-blue-600 to-blue-500 p-12 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"></div>
              
              <div className="relative z-10 text-center">
                <div className="bg-blue-100/95 backdrop-blur-md px-8 py-4 rounded-3xl shadow-xl inline-block mb-8">
                  <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-12 w-auto object-contain" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Identity Match</h2>
                <p className="text-blue-100">Please verify to continue</p>
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-3/5 p-12 flex flex-col items-center justify-center text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Is this you?</h2>
              
              <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 mb-10 w-full max-w-md shadow-sm">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full shadow-lg mb-6 transform hover:scale-105 transition-transform">
                  <span className="text-white text-5xl font-bold">
                    {pendingEmployee?.name?.charAt(0) || "?"}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{pendingEmployee?.name}</h3>
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-blue-200 text-blue-700 font-bold shadow-sm">
                  <FaIdCard /> ID: {pendingEmployee?.unique_id}
                </div>
              </div>

              <div className="flex gap-4 w-full max-w-md">
                <button
                  onClick={handleCancelIdentity}
                  className="flex-1 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <FaCamera />
                  Scan Again
                </button>
                <button
                  onClick={handleConfirmIdentity}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <FaCheckCircle />
                  Yes, Continue
                </button>
              </div>
            </div>

          </div>
        </div>

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

  // ═══════════════════════════════════════════════════════════
  // STEP: ID Entry
  // ═══════════════════════════════════════════════════════════
  if (step === "id" && !isDirectShiftUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        {/* Mobile */}
        <div className="relative z-10 w-full max-w-md lg:hidden">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200/50">
            
            <div className="mb-6 flex justify-center">
              <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-10 w-auto object-contain" />
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-lg mb-4">
                <FaClock className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Manual ID Entry
              </h2>
              <p className="text-gray-600">
                Enter your Employee ID to continue
              </p>
            </div>

            <form onSubmit={handleIdSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="account_no"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
                >
                  <FaIdCard className="text-blue-600" />
                  Employee ID
                </label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="Enter Employee ID"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  inputMode="text"
                  enterKeyHint="done"
                  name="field_empl_attendance_x9f2"
                  id="field_empl_attendance_x9f2"
                  aria-autocomplete="none"
                  data-form-type="other"
                  onPaste={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onKeyDown={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      const blocked = ["v", "c", "x"];
                      if (blocked.includes(e.key.toLowerCase())) {
                        e.preventDefault();
                      }
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-lg"
                />
              </div>

              {message && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
                  <span className="text-red-500">⚠</span>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Continue
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
              
              {/* Optional Registration Route */}
              <button
                type="button"
                disabled={loading}
                onClick={(e) => handleIdSubmit(e, true)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <FaCamera />
                    Register / Update My Face
                  </>
                )}
              </button>
            </form>

            <button
              onClick={() => {
                setStep("face_scan");
                setMessage("");
                setIsNewFaceUser(false);
              }}
              className="w-full mt-4 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all flex items-center justify-center gap-2"
            >
              <FaCamera className="text-blue-600" />
              Back to Face Scan
            </button>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                <span className="font-bold text-blue-600">KIOTEL</span> Clock in / Clock out module
              </p>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="relative z-10 w-full max-w-6xl hidden lg:block">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden h-[90vh] flex">
            <div className="grid lg:grid-cols-2 gap-0 w-full h-full min-h-0">
              
              {/* Left Panel */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-8 lg:p-12 flex flex-col relative overflow-hidden h-full">
                <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"></div>
                
                {/* Center Content */}
                <div className="relative z-10 text-center w-full flex-1 flex flex-col justify-center pb-10">
                  {/* Logo Centered Above Clock */}
                  <div className="mb-10 bg-blue-100/95 backdrop-blur-md px-8 py-4 rounded-3xl shadow-xl inline-block mx-auto border border-blue-200/50">
                    <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-12 lg:h-16 w-auto object-contain" />
                  </div>

                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl mb-6 mx-auto">
                    <FaClock className="text-6xl text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-white">Attendance System</h2>
                  <p className="text-lg text-blue-100 max-w-md mx-auto">
                    Manual ID Verification
                  </p>
                </div>
              </div>

              {/* Right Panel */}
              <div className="p-8 lg:p-12 flex flex-col justify-center overflow-y-auto min-h-0 h-full">
                <div className="max-w-md mx-auto w-full">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Manual ID Entry
                    </h2>
                    <p className="text-gray-600">
                      Enter your Employee ID to continue
                    </p>
                  </div>

                  <form onSubmit={handleIdSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="account_no_desktop"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
                      >
                        <FaIdCard className="text-blue-600" />
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={accountNo}
                        onChange={(e) => setAccountNo(e.target.value)}
                        placeholder="Enter Employee ID"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        inputMode="text"
                        enterKeyHint="done"
                        name="field_empl_attendance_x9f2_d"
                        id="field_empl_attendance_x9f2_d"
                        aria-autocomplete="none"
                        data-form-type="other"
                        onPaste={(e) => e.preventDefault()}
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        onKeyDown={(e) => {
                          if (e.ctrlKey || e.metaKey) {
                            const blocked = ["v", "c", "x"];
                            if (blocked.includes(e.key.toLowerCase())) {
                              e.preventDefault();
                            }
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-lg"
                      />
                    </div>

                    {message && (
                      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
                        <span className="text-red-500">⚠</span>
                        {message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          Continue
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={(e) => handleIdSubmit(e, true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <FaCamera />
                          Register / Update My Face
                        </>
                      )}
                    </button>
                  </form>

                  <button
                    onClick={() => {
                      setStep("face_scan");
                      setMessage("");
                      setIsNewFaceUser(false);
                    }}
                    className="w-full mt-4 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <FaCamera className="text-blue-600" />
                    Back to Face Scan
                  </button>

                  <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">
                      <span className="font-bold text-blue-600">KIOTEL</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

    // ═══════════════════════════════════════════════════════════
  // STEP: Face Registration
  // ═══════════════════════════════════════════════════════════
  if (step === "face_register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>
      
        {/* 🚨 CONDITIONALLY RENDER MOBILE OR DESKTOP, NEVER BOTH 🚨 */}
        {isMobile ? (
          /* Mobile Layout (Removed lg:hidden) */
          <div className="relative z-10 w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200/50">
              <div className="text-center mb-6 flex justify-center">
                <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-10 w-auto object-contain" />
              </div>

              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {employee?.name?.charAt(0) || "?"}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{employee?.name || "Employee"}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <FaIdCard className="text-blue-600" />
                    ID: {employee?.unique_id || "N/A"}
                  </p>
                </div>
              </div>

              <FaceRegister
                employeeId={accountNo}
                employeeName={employee?.name || "Employee"}
                onRegistered={handleFaceRegistered}
                onSkip={handleFaceRegisterSkip}
              />

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-blue-600">KIOTEL</span> Clock in / Clock out module
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout (Removed hidden lg:block) */
          <div className="relative z-10 w-full max-w-6xl">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden h-[90vh] flex">
              <div className="grid lg:grid-cols-5 gap-0 w-full h-full min-h-0">
                
                {/* Left Panel */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-500 p-8 flex flex-col relative overflow-hidden h-full">
                  <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"></div>
                  
                  {/* Center Content */}
                  <div className="relative z-10 text-center w-full flex-1 flex flex-col justify-center pb-10">
                    <div className="mb-10 bg-blue-100/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl inline-block mx-auto border border-blue-200/50">
                      <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-10 lg:h-12 w-auto object-contain" />
                    </div>

                    <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl mb-6 mx-auto">
                      <span className="text-6xl font-bold text-white">
                        {employee?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-white">
                      {employee?.name || "Employee"}
                    </h2>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm mx-auto text-white">
                      <FaIdCard />
                      <span className="font-semibold">
                        ID: {employee?.unique_id || "N/A"}
                      </span>
                    </div>
                    <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-xl p-5 text-white max-w-sm mx-auto">
                      <p className="text-blue-100 text-sm mb-2">One-time Setup</p>
                      <p className="font-semibold">
                        Register your face so you can clock in instantly next time — no ID needed!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center overflow-y-auto min-h-0 h-full">
                  <div className="max-w-lg mx-auto w-full">
                    <FaceRegister
                      employeeId={accountNo}
                      employeeName={employee?.name || "Employee"}
                      onRegistered={handleFaceRegistered}
                      onSkip={handleFaceRegisterSkip}
                    />
                  </div>

                  <div className="mt-6 text-center shrink-0">
                    <p className="text-xs text-gray-500">
                      <span className="font-bold text-blue-600">KIOTEL</span> Clock in / Clock out module
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

  // ═══════════════════════════════════════════════════════════
  // STEP: Frequent Shift Prompt (Last 10 Days)
  // ═══════════════════════════════════════════════════════════
  if (step === "frequent_shift_prompt") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        {/* 🚨 CONDITIONALLY RENDER MOBILE OR DESKTOP, NEVER BOTH 🚨 */}
        {isMobile ? (
          /* Mobile Layout */
          <div className="relative z-10 w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200/50 text-center">
              <div className="mb-6 flex justify-center">
                <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-10 w-auto object-contain" />
              </div>

              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <FaClock className="text-blue-600 text-4xl" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequent Shift Detected</h2>
              
              <p className="text-gray-600 mb-6 text-base">
                You have clocked in to the <strong className="text-blue-600">{frequentShift?.shift_name}</strong> shift for the past 10 working days.
                <br/><br/>
                Would you like to continue with this same shift today?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedShift(frequentShift);
                    handleConfirmShift(frequentShift);
                  }}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? "Checking..." : "Yes, continue with this shift"}
                </button>
                
                <button
                  onClick={() => setStep("shift")}
                  disabled={loading}
                  className="w-full bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-xl transition-all flex items-center justify-center"
                >
                  No, I want to choose a different shift
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="relative z-10 w-full max-w-4xl hidden lg:block">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden flex">
              
              {/* Left Panel */}
              <div className="w-2/5 bg-gradient-to-br from-blue-600 to-blue-500 p-12 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"></div>
                
                <div className="relative z-10 text-center">
                  <div className="bg-blue-100/95 backdrop-blur-md px-8 py-4 rounded-3xl shadow-xl inline-block mb-8">
                    <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-12 w-auto object-contain" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Frequent Shift</h2>
                  <p className="text-blue-100">Quick selection detected</p>
                </div>
              </div>

              {/* Right Panel */}
              <div className="w-3/5 p-12 flex flex-col items-center justify-center text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
                  <FaClock className="text-blue-600 text-5xl" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Continue with the same shift?</h2>
                
                <p className="text-gray-600 mb-8 text-lg px-4">
                  You have clocked in to the <strong className="text-blue-600">{frequentShift?.shift_name}</strong> shift for the past 10 working days. Would you like to use this shift today?
                </p>

                <div className="flex gap-4 w-full max-w-md">
                  <button
                    onClick={() => setStep("shift")}
                    disabled={loading}
                    className="flex-1 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-xl transition-all flex items-center justify-center"
                  >
                    No, choose another
                  </button>
                  <button
                    onClick={() => {
                      setSelectedShift(frequentShift);
                      handleConfirmShift(frequentShift);
                    }}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {loading ? "Checking..." : "Yes, continue"}
                  </button>
                </div>
              </div>

            </div>
          </div>
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

  // ═══════════════════════════════════════════════════════════
  // STEP: Shift
  // ═══════════════════════════════════════════════════════════
  if (step === "shift") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        {/* Mobile Layout */}
        <div className="relative z-10 w-full max-w-md lg:hidden">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200/50 flex flex-col h-[85vh]">
            
            <div className="text-center mb-6 shrink-0 flex justify-center">
              <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-10 w-auto object-contain" />
            </div>

            <div className="text-center mb-4 shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Select Your Shift
              </h2>
              <p className="text-gray-600 text-sm">
                Choose the shift you are working today
              </p>
            </div>

            {/* Toggle Button Group for General Users */}
            {isGeneralUser && (
              <div className="flex justify-center mb-6 shrink-0">
                <div className="inline-flex rounded-lg shadow-sm border border-gray-200">
                  <button
                    onClick={() => setShiftTab("General")}
                    className={`px-5 py-2 text-sm font-semibold rounded-l-lg transition-colors ${
                      shiftTab === "General"
                        ? "bg-[#3b82f6] text-white border-[#3b82f6]"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    General Shifts
                  </button>
                  <button
                    onClick={() => setShiftTab("Non General")}
                    className={`px-5 py-2 text-sm font-semibold rounded-r-lg border-l border-gray-200 transition-colors ${
                      shiftTab === "Non General"
                        ? "bg-[#3b82f6] text-white border-[#3b82f6]"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Non General
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Scrollable Area */}
            <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar min-h-0">
              {displayedShifts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl h-full flex flex-col items-center justify-center">
                  <FaCalendarAlt className="text-gray-400 text-4xl mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    No shifts available
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedShifts.map((shift) => (
                    <div
                      key={shift.id}
                      onClick={() => handleShiftSelection(shift)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border flex flex-col gap-3 ${
                        selectedShift?.id === shift.id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
                      }`}
                    >
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-base mb-1">
                          {shift.shift_name}
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <FaClock className="text-blue-600" />
                          {shift.shift_name === 'ADMIN' ? 'Flexible 8-Hour' : `${shift.start_time} - ${shift.end_time}`}
                        </p>
                      </div>
                      
                      {selectedShift?.id === shift.id && (
                        <div className="flex-shrink-0 border-t border-blue-200 pt-3 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmShift(shift);
                            }}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow flex items-center justify-center gap-2 text-sm"
                          >
                            {loading ? "Checking..." : "Confirm & Continue"}
                            <FaCheckCircle />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {message && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2 shrink-0">
                <span className="text-red-500 text-lg">🚫</span> {message.replace('🚫', '')}
              </div>
            )}

            <div className="shrink-0">
              <button
                type="button"
                onClick={resetSession}
                className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all text-sm"
              >
                {isDirectShiftUser ? "Reset" : "Change ID"}
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 text-center shrink-0">
              <p className="text-xs text-gray-500">
                <span className="font-bold text-blue-600">KIOTEL</span> Clock in/out module
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="relative z-10 w-full max-w-6xl hidden lg:block h-[90vh]">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden flex h-full">
            <div className="grid lg:grid-cols-5 gap-0 w-full h-full min-h-0">
              
              {/* Left Panel */}
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-500 p-8 flex flex-col relative overflow-hidden h-full">
                <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"></div>
                
                {/* Center Content */}
                <div className="relative z-10 text-center w-full flex-1 flex flex-col justify-center pb-10">
                  {/* Logo Centered Above Clock */}
                  <div className="mb-10 bg-blue-100/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl inline-block mx-auto border border-blue-200/50">
                    <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-10 lg:h-12 w-auto object-contain" />
                  </div>

                  <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl mb-6 mx-auto">
                    <span className="text-6xl font-bold text-white">
                      {employee?.name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2 text-white">
                    {employee?.name || "Employee"}
                  </h2>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm mx-auto text-white">
                    <FaIdCard />
                    <span className="font-semibold">
                      ID: {employee?.unique_id || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col h-full min-h-0">
                <div className="mb-6 shrink-0">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Select Your Shift
                  </h2>
                  <p className="text-gray-600 text-base">
                    Choose the shift you are working today
                  </p>
                </div>

                {/* Toggle Button Group for General Users */}
                {isGeneralUser && (
                  <div className="flex justify-start mb-6 shrink-0">
                    <div className="inline-flex rounded-lg shadow-sm border border-gray-200">
                      <button
                        onClick={() => setShiftTab("General")}
                        className={`px-6 py-2.5 text-sm font-semibold rounded-l-lg transition-colors ${
                          shiftTab === "General"
                            ? "bg-[#3b82f6] text-white border-[#3b82f6]"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        General Shifts
                      </button>
                      <button
                        onClick={() => setShiftTab("Non General")}
                        className={`px-6 py-2.5 text-sm font-semibold rounded-r-lg border-l border-gray-200 transition-colors ${
                          shiftTab === "Non General"
                            ? "bg-[#3b82f6] text-white border-[#3b82f6]"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Non General
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar min-h-0">
                  {displayedShifts.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl h-full flex flex-col items-center justify-center">
                      <FaCalendarAlt className="text-gray-400 text-5xl mx-auto mb-4" />
                      <p className="text-gray-500 font-medium text-lg">
                        No shifts available
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayedShifts.map((shift) => (
                        <div
                          key={shift.id}
                          onClick={() => handleShiftSelection(shift)}
                          className={`p-4 px-5 rounded-xl cursor-pointer transition-all duration-200 border flex items-center justify-between ${
                            selectedShift?.id === shift.id
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
                          }`}
                        >
                          <div className="flex-1 pr-4">
                            <h4 className="font-bold text-gray-900 text-lg mb-1">
                              {shift.shift_name}
                            </h4>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <FaClock className="text-blue-600" />
                              {shift.shift_name === 'ADMIN' ? 'Flexible 8-Hour' : `${shift.start_time} - ${shift.end_time}`}
                            </p>
                          </div>

                          <div className="flex-shrink-0 flex items-center">
                            {selectedShift?.id === shift.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmShift(shift);
                                }}
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow flex items-center gap-2 text-sm"
                              >
                                {loading ? "Checking..." : "Confirm & Continue"}
                                <FaCheckCircle />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {message && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium shrink-0 flex items-center gap-2">
                    <span className="text-red-500 text-xl">🚫</span> {message.replace('🚫', '')}
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200 shrink-0">
                  <button
                    type="button"
                    onClick={resetSession}
                    className="w-full px-5 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all text-base"
                  >
                    {isDirectShiftUser ? "Reset" : "Change ID"}
                  </button>
                </div>

                <div className="mt-4 text-center shrink-0">
                  <p className="text-xs text-gray-500">
                    <span className="font-bold text-blue-600">KIOTEL</span>{" "}
                    Clock in / Clock out module
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    );
  }

    // ═══════════════════════════════════════════════════════════
  // STEP: Admin Date Prompt
  // ═══════════════════════════════════════════════════════════
  if (step === "admin_date_prompt") {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const handleDateSelect = (dateStr) => {
      setAdminSelectedDate(dateStr);
      setMessage(`Ready to clock in for ADMIN shift on ${dateStr}`);
      setStep("action");
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200/50 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Attendance Date</h2>
          <p className="text-gray-600 mb-6">For which date are you clocking in?</p>
          
          <div className="space-y-4">
            <button
              onClick={() => handleDateSelect(yesterdayStr)}
              className="w-full bg-white border-2 border-blue-200 hover:bg-blue-50 text-blue-700 font-bold py-4 rounded-xl transition-all shadow-sm"
            >
              Previous Date ({yesterdayStr})
            </button>
            <button
              onClick={() => handleDateSelect(todayStr)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md"
            >
              Current Date ({todayStr})
            </button>
          </div>
          
          <button
            onClick={() => setStep("shift")}
            className="mt-6 w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }



    // ═══════════════════════════════════════════════════════════
  // STEP: Action (Photo capture step)
  // ═══════════════════════════════════════════════════════════
  if (step === "action") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        {/* 🚨 CONDITIONALLY RENDER MOBILE OR DESKTOP, NEVER BOTH 🚨 */}
        {isMobile ? (
          /* Mobile Layout (Removed lg:hidden) */
          <div className="relative z-10 w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200/50">
              <div className="text-center mb-4 flex justify-center">
                <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-10 w-auto object-contain" />
              </div>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-lg mb-4">
                  <span className="text-white text-3xl font-bold">
                    {employee?.name?.charAt(0) || "?"}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {employee?.name || "Employee"}
                </h2>
                <p className="text-gray-600 flex items-center justify-center gap-2 mb-2">
                  <FaIdCard className="text-blue-600" />
                  ID: {employee?.unique_id || "N/A"}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <FaClock className="text-blue-600" />
                  <span className="font-semibold text-gray-900">
                    {selectedShift?.shift_name || "No Shift"}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="text-sm text-gray-600">
                    {selectedShift?.shift_name === 'ADMIN' ? 'Flexible 8-Hour' : `${selectedShift?.start_time} - ${selectedShift?.end_time}`}
                  </span>
                </div>
              </div>

              {message && !photoCaptured && (
                <div
                  className={`text-center mb-6 p-4 rounded-xl border-2 font-semibold ${
                    message.includes("Clocked out")
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : message.includes("Clocked in")
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-blue-50 border-blue-200 text-blue-800"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="mb-6">
                {photoCaptured ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-full border-4 border-green-500 mb-4 animate-bounce">
                      <FaCheckCircle className="text-green-600 text-5xl" />
                    </div>
                    <p className="text-gray-900 font-bold text-2xl mb-1">
                      {isClockedIn ? "Clock-in Successful!" : "Clock-out Successful!"}
                    </p>
                    <p className="text-gray-500">Redirecting to home...</p>
                  </div>
                ) : (
                  <PhotoCapture
                    onCapture={handlePhotoCapture}
                    onRetake={handlePhotoRetake}
                    isCaptured={photoCaptured}
                    isLoading={loading}
                    photoType={photoType}
                  />
                )}
              </div>

              {(clockInTime || clockOutTime) && (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 mb-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaSignInAlt className="text-green-600" />
                      <span className="font-medium">Clock In:</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formatTime(clockInTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaSignOutAlt className="text-red-600" />
                      <span className="font-medium">Clock Out:</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formatTime(clockOutTime)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetSession}
                  className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                >
                  {isDirectShiftUser ? "Reset" : "Change ID"}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-blue-600">KIOTEL</span> Clock in
                  / Clock out module
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout (Removed hidden lg:block) */
          <div className="relative z-10 w-full max-w-6xl h-[90vh]">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden flex h-full">
              <div className="grid lg:grid-cols-5 gap-0 w-full h-full min-h-0">
                
                {/* Left Panel */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-500 p-8 flex flex-col relative overflow-hidden h-full">
                  <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                  <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"></div>

                  {/* Center Content */}
                  <div className="relative z-10 flex-1 flex flex-col justify-center pb-10">
                    
                    {/* Logo Centered Above Clock */}
                    <div className="mb-10 bg-blue-100/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl inline-block mx-auto border border-blue-200/50">
                      <img src="/Kiotel_Logo_bg.PNG" alt="KIOTEL" className="h-10 lg:h-12 w-auto object-contain" />
                    </div>

                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl mb-4">
                        <span className="text-6xl font-bold text-white">
                          {employee?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold mb-2 text-white">
                        {employee?.name || "Employee"}
                      </h2>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm mb-4 text-white mx-auto">
                        <FaIdCard />
                        <span className="font-semibold">
                          ID: {employee?.unique_id || "N/A"}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm text-white mx-auto">
                        <FaClock />
                        <span className="font-semibold text-sm">
                          {selectedShift?.shift_name || "No Shift"}
                        </span>
                      </div>
                      <p className="text-sm text-blue-100 mt-2 text-center">
                        {selectedShift?.shift_name === 'ADMIN' ? 'Flexible 8-Hour' : `${selectedShift?.start_time} - ${selectedShift?.end_time}`}
                      </p>
                    </div>

                    {message && !photoCaptured && (
                      <div
                        className={`p-4 rounded-xl font-semibold text-center mb-6 text-white ${
                          message.includes("Clocked out")
                            ? "bg-white/20 backdrop-blur-sm"
                            : message.includes("Clocked in")
                              ? "bg-green-500/30 backdrop-blur-sm border border-green-400/50"
                              : "bg-white/20 backdrop-blur-sm"
                        }`}
                      >
                        {message}
                      </div>
                    )}

                    {(clockInTime || clockOutTime) && (
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 mt-auto text-white border border-white/10">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/20">
                          <div className="flex items-center gap-2">
                            <FaSignInAlt />
                            <span className="font-medium">Clock In:</span>
                          </div>
                          <span className="font-bold text-lg">
                            {formatTime(clockInTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FaSignOutAlt />
                            <span className="font-medium">Clock Out:</span>
                          </div>
                          <span className="font-bold text-lg">
                            {formatTime(clockOutTime)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col overflow-y-auto min-h-0 h-full">
                  <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                    <div className="w-full max-w-lg">
                      <div className="mb-6 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {photoCaptured ? (isClockedIn ? "Clock In" : "Clock Out") : (photoType === "clock_in" ? "Clock In" : "Clock Out")}
                        </h2>
                        <p className="text-gray-600">
                          {photoCaptured
                            ? "Photo captured successfully"
                            : "Take your photo to continue"}
                        </p>
                      </div>

                      <div className="mb-6">
                        {photoCaptured ? (
                          <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-32 h-32 bg-green-50 rounded-full border-4 border-green-500 mb-6 animate-bounce">
                              <FaCheckCircle className="text-green-600 text-6xl" />
                            </div>
                            <p className="text-gray-900 font-bold text-3xl mb-2">
                              {isClockedIn ? "Clock-in Successful!" : "Clock-out Successful!"}
                            </p>
                            <p className="text-gray-500 text-lg">Redirecting to home...</p>
                          </div>
                        ) : (
                          <PhotoCapture
                            onCapture={handlePhotoCapture}
                            onRetake={handlePhotoRetake}
                            isCaptured={photoCaptured}
                            isLoading={loading}
                            photoType={photoType}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-200 shrink-0">
                    <button
                      type="button"
                      onClick={resetSession}
                      className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all text-lg"
                    >
                      {isDirectShiftUser ? "Reset" : "Change ID"}
                    </button>
                  </div>

                  <div className="mt-6 text-center shrink-0">
                    <p className="text-xs text-gray-500">
                      <span className="font-bold text-blue-600">KIOTEL</span>{" "}
                      Clock in / Clock out module
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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


  return null;
}