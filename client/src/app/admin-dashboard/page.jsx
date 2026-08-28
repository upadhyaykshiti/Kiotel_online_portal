

// "use client"; // Mark this as a Client Component

// import { useState } from "react";
// import Sidebar from "../../components/Sidebar";
// import EmployeesList from "../../components/EmployeesList";
// import NewEmployees from "../../components/NewEmployees";
// import LeaveBalances from "../../components/LeaveBalances";
// import LeaveRequestsList from "../../components/LeaveRequestsList";
// import NewAdmin from "../../components/NewAdmin"; // Import the new component

// export default function AdminDashboard() {
//   const [activeComponent, setActiveComponent] = useState("employees"); // Default to "Employees"

//   return (
//     <div className="flex min-h-screen bg-blue-50">
//       {/* Sidebar */}
//       <Sidebar setActiveComponent={setActiveComponent} />

//       {/* Main Content */}
//       <div className="flex-1 p-8">
//         <h1 className="text-2xl font-bold text-blue-700 mb-6">
//           {activeComponent === "employees"
//             ? "Employees"
//             : activeComponent === "new-employees"
//             ? "New Employees"
//             : activeComponent === "leave-balances"
//             ? "Leave Balances"
//             : activeComponent === "leave-requests"
//             ? "Leave Requests"
//             : "New Admin"}
//         </h1>

//         {/* Dynamically Render Components */}
//         {activeComponent === "employees" && <EmployeesList />}
//         {activeComponent === "new-employees" && <NewEmployees />}
//         {activeComponent === "leave-balances" && <LeaveBalances />}
//         {activeComponent === "leave-requests" && <LeaveRequestsList />}
//         {activeComponent === "new-admin" && <NewAdmin />} {/* Render NewAdmin component */}
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import Sidebar from "../../components/Sidebar";
// import EmployeesList from "../../components/EmployeesList";
// import NewEmployees from "../../components/NewEmployees";
// import LeaveBalances from "../../components/LeaveBalances";
// import LeaveRequestsList from "../../components/LeaveRequestsList";
// import NewAdmin from "../../components/NewAdmin";

// export default function AdminDashboard() {
//   const [activeComponent, setActiveComponent] = useState("employees");

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen bg-blue-50">
//       {/* Sidebar - Bottom on mobile, left on desktop */}
//       <Sidebar setActiveComponent={setActiveComponent} />

//       {/* Main Content */}
//       <div className="flex-1 p-4 md:p-8">
//         <h1 className="text-xl md:text-2xl font-bold text-blue-700 mb-4 md:mb-6">
//           {activeComponent === "employees"
//             ? "Employees"
//             : activeComponent === "new-employees"
//             ? "New Employees"
//             : activeComponent === "leave-balances"
//             ? "Leave Balances"
//             : activeComponent === "leave-requests"
//             ? "Leave Requests"
//             : "New Admin"}
//         </h1>

//         {/* Render Active Component */}
//         {activeComponent === "employees" && <EmployeesList />}
//         {activeComponent === "new-employees" && <NewEmployees />}
//         {activeComponent === "leave-balances" && <LeaveBalances />}
//         {activeComponent === "leave-requests" && <LeaveRequestsList />}
//         {activeComponent === "new-admin" && <NewAdmin />}
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation"; // Import useRouter for navigation
// import Sidebar from "../../components/Sidebar";
// import EmployeesList from "../../components/EmployeesList";
// import NewEmployees from "../../components/NewEmployees";
// import LeaveBalances from "../../components/LeaveBalances";
// import LeaveRequestsList from "../../components/LeaveRequestsList";
// import NewAdmin from "../../components/NewAdmin";
// import AdminList from "../../components/AdminList";

// export default function AdminDashboard() {
//   const [activeComponent, setActiveComponent] = useState("employees");
//   const router = useRouter(); // Initialize useRouter
//   const [loading, setLoading] = useState(true); // State to handle loading
//   const [error, setError] = useState(""); // State to handle errors

//   useEffect(() => {
//     // Retrieve the logged-in employee's unique_id from localStorage
//     const uniqueId = localStorage.getItem("uniqueId");

//     if (!uniqueId) {
//       setError("No employee ID found. Please log in again.");
//       setLoading(false);
//       router.push("/login"); // Redirect to the login page if no uniqueId is found
//     } else {
//       setLoading(false); // Allow the dashboard to load if uniqueId is present
//     }
//   }, [router]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-blue-50">
//         <p className="text-blue-700 font-medium">Loading...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-blue-50">
//         <p className="text-red-500 font-medium">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen bg-blue-50">
//       {/* Sidebar - Bottom on mobile, left on desktop */}
//       <Sidebar setActiveComponent={setActiveComponent} />

//       {/* Main Content */}
//       <div className="flex-1 p-4 md:p-8">
//         <h1 className="text-xl md:text-2xl font-bold text-blue-700 mb-4 md:mb-6">
//           {activeComponent === "employees"
//             ? "Employees"
//             : activeComponent === "new-employees"
//             ? "New Employees"
//             : activeComponent === "leave-balances"
//             ? "Leave Balances"
//             : activeComponent === "leave-requests"
//             ? "Leave Requests"
//             : activeComponent === "admin-list"
//             ? "Admin List"
//             : "New Admin"}
//         </h1>

//         {/* Render Active Component */}
//         {activeComponent === "employees" && <EmployeesList />}
//         {activeComponent === "new-employees" && <NewEmployees />}
//         {activeComponent === "leave-balances" && <LeaveBalances />}
//         {activeComponent === "leave-requests" && <LeaveRequestsList />}
//         {activeComponent === "new-admin" && <NewAdmin />}
//         {activeComponent === "admin-list" && <AdminList />}
//       </div>
//     </div>
//   );
// }



// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation"; // Import useRouter for navigation
// import Sidebar from "../../components/Sidebar";
// import EmployeesList from "../../components/EmployeesList";
// import NewEmployees from "../../components/NewEmployees";
// import LeaveBalances from "../../components/LeaveBalances";
// import LeaveRequestsList from "../../components/LeaveRequestsList";
// import NewAdmin from "../../components/NewAdmin";
// import AdminList from "../../components/AdminList";
// // You can create this component later
// import BroadcastMessage from "../../components/BroadcastMessage"; // Optional: Create this component

// export default function AdminDashboard() {
//   const [activeComponent, setActiveComponent] = useState("employees");
//   const router = useRouter(); // Initialize useRouter
//   const [loading, setLoading] = useState(true); // State to handle loading
//   const [error, setError] = useState(""); // State to handle errors

//   useEffect(() => {
//     // Retrieve the logged-in employee's unique_id from localStorage
//     const uniqueId = localStorage.getItem("uniqueId");

//     if (!uniqueId) {
//       setError("No employee ID found. Please log in again.");
//       setLoading(false);
//       router.push("/login"); // Redirect to the login page if no uniqueId is found
//     } else {
//       setLoading(false); // Allow the dashboard to load if uniqueId is present
//     }
//   }, [router]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-blue-50">
//         <p className="text-blue-700 font-medium">Loading...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-blue-50">
//         <p className="text-red-500 font-medium">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen bg-blue-50">
//       {/* Sidebar - Bottom on mobile, left on desktop */}
//       <Sidebar setActiveComponent={setActiveComponent} />

//       {/* Main Content */}
//       <div className="flex-1 p-4 md:p-8">
//         <h1 className="text-xl md:text-2xl font-bold text-blue-700 mb-4 md:mb-6">
//           {activeComponent === "employees"
//             ? "Employees"
//             : activeComponent === "new-employees"
//             ? "New Employees"
//             : activeComponent === "leave-balances"
//             ? "Leave Balances"
//             : activeComponent === "leave-requests"
//             ? "Leave Requests"
//             : activeComponent === "admin-list"
//             ? "Admin List"
//             : activeComponent === "broadcast-message"
//             ? "Broadcast Message"
//             : "New Admin"}
//         </h1>

//         {/* Render Active Component */}
//         {activeComponent === "employees" && <EmployeesList />}
//         {activeComponent === "new-employees" && <NewEmployees />}
//         {activeComponent === "leave-balances" && <LeaveBalances />}
//         {activeComponent === "leave-requests" && <LeaveRequestsList />}
//         {activeComponent === "new-admin" && <NewAdmin />}
//         {activeComponent === "admin-list" && <AdminList />}
//         {activeComponent === "broadcast-message" && <BroadcastMessage />} {/* Render Broadcast Section */}
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Sidebar from "../../components/Sidebar";
// import EmployeesList from "../../components/EmployeesList";
// import NewEmployees from "../../components/NewEmployees";
// import LeaveBalances from "../../components/LeaveBalances";
// import LeaveRequestsList from "../../components/LeaveRequestsList";
// import NewAdmin from "../../components/NewAdmin";
// import AdminList from "../../components/AdminList";
// import BroadcastMessage from "../../components/BroadcastMessage";
// import Shiftallotment from "../../components/Shiftallotment";

// export default function AdminDashboard() {
//   const [activeComponent, setActiveComponent] = useState("employees");
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const uniqueId = localStorage.getItem("uniqueId");

//     if (!uniqueId) {
//       setError("No employee ID found. Please log in again.");
//       setLoading(false);
//       router.push("/login");
//     } else {
//       setLoading(false);
//     }
//   }, [router]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-blue-50">
//         <p className="text-blue-700 font-medium">Loading...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-blue-50">
//         <p className="text-red-500 font-medium">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen overflow-hidden bg-blue-50">
//       {/* Sidebar fixed size, no scroll */}
//       <div className="w-64 shrink-0 bg-blue-700 text-white">
//         <Sidebar setActiveComponent={setActiveComponent} />
//       </div>

//       {/* Scrollable main content */}
//       <div className="flex-1 overflow-y-auto p-4 md:p-8">
//         <h1 className="text-xl md:text-2xl font-bold text-blue-700 mb-4 md:mb-6">
//           {activeComponent === "employees"
//             ? "Employees"
//             : activeComponent === "new-employees"
//             ? "New Employees"
//             : activeComponent === "leave-balances"
//             ? "Leave Balances"
//             : activeComponent === "leave-requests"
//             ? "Leave Requests"
//             : activeComponent === "admin-list"
//             ? "Admin List"
//             : activeComponent === "broadcast-message"
//             ? "Broadcast Message"
//             : "New Admin"}
//         </h1>

//         {activeComponent === "employees" && <EmployeesList />}
//         {activeComponent === "new-employees" && <NewEmployees />}
//         {activeComponent === "leave-balances" && <LeaveBalances />}
//         {activeComponent === "leave-requests" && <LeaveRequestsList />}
//         {activeComponent === "new-admin" && <NewAdmin />}
//         {activeComponent === "admin-list" && <AdminList />}
//         {activeComponent === "broadcast-message" && <BroadcastMessage />}
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import EmployeesList from "../../components/EmployeesList";
import NewEmployees from "../../components/NewEmployees";
import LeaveBalances from "../../components/LeaveBalances";
import LeaveRequestsList from "../../components/LeaveRequestsList";
import NewAdmin from "../../components/NewAdmin";
import AdminList from "../../components/AdminList";
import BroadcastMessage from "../../components/BroadcastMessage";
import Shiftallotment from "../../components/Shiftallotment"; // Already imported ✅
// import Shiftassignment from "../../components/ShiftAssignmentForm"; // Already imported ✅
import ShiftAssignmentForm from "../../components/ShiftAssignmentForm";

export default function AdminDashboard() {
  const [activeComponent, setActiveComponent] = useState("employees");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const uniqueId = localStorage.getItem("uniqueId");

    if (!uniqueId) {
      setError("No employee ID found. Please log in again.");
      setLoading(false);
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-50">
        <p className="text-blue-700 font-medium">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-50">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-blue-50">
      {/* Sidebar fixed size */}
      <div className="w-64 shrink-0 bg-blue-700 text-white">
        <Sidebar setActiveComponent={setActiveComponent} />
      </div>

      {/* Scrollable main content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold text-blue-700 mb-4 md:mb-6">
          {activeComponent === "employees"
            ? "Employees"
            : activeComponent === "new-employees"
            ? "New Employees"
            : activeComponent === "leave-balances"
            ? "Leave Balances"
            : activeComponent === "leave-requests"
            ? "Leave Requests"
            : activeComponent === "admin-list"
            ? "Admin List"
            : activeComponent === "broadcast-message"
            ? "Broadcast Message"
            : activeComponent === "shift-allotment" // ✅ New case added
            ? "Shift Allotment"
            : activeComponent === "assignment" // ✅ New case added
            ? "Assignment"
            : "New"}
        </h1>

        {/* Conditional Rendering of Components */}
        {activeComponent === "employees" && <EmployeesList />}
        {activeComponent === "new-employees" && <NewEmployees />}
        {activeComponent === "leave-balances" && <LeaveBalances />}
        {activeComponent === "leave-requests" && <LeaveRequestsList />}
        {activeComponent === "new-admin" && <NewAdmin />}
        {activeComponent === "admin-list" && <AdminList />}
        {activeComponent === "broadcast-message" && <BroadcastMessage />}
        {activeComponent === "shift-allotment" && <Shiftallotment />} {/* ✅ Render Shift Allotment Component */}
        {activeComponent === "assignment" && <ShiftAssignmentForm />} {/* ✅ Render Shift Allotment Component */}
      </div>
    </div>
  );
}
