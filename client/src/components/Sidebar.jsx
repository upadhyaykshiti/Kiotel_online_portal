



// "use client";

// import React, { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faUser,
//   faUserPlus,
//   faBalanceScaleRight,
//   faFileContract,
//   faShieldAlt,
//   faSignOutAlt,
//   faUsersCog,
//   faBullhorn, // New icon for Broadcast Message
// } from "@fortawesome/free-solid-svg-icons";
// import { useRouter } from "next/navigation"; // Import useRouter for navigation

// // Reusable Sidebar Section Component
// const SidebarSection = ({ title, items, activeTab, setActiveComponent, setActiveTab }) => {
//   return (
//     <div className="flex flex-col gap-3">
//       {/* Section Title */}
//       <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wide hidden md:block">
//         {title}
//       </h3>
//       {/* Buttons */}
//       <div className="flex flex-row md:flex-col gap-2 md:gap-3">
//         {items.map(({ id, icon, label }) => (
//           <button
//             key={id}
//             onClick={() => {
//               setActiveComponent(id);
//               setActiveTab(id);
//             }}
//             className={`flex md:justify-start justify-center items-center gap-3 w-full px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all duration-300 ${
//               activeTab === id
//                 ? "bg-white text-blue-700 font-semibold"
//                 : "bg-blue-600 hover:bg-blue-500 text-white"
//             } focus:outline-none focus:ring-2 focus:ring-blue-300`}
//           >
//             <FontAwesomeIcon icon={icon} className="text-lg" />
//             <span className="hidden md:inline truncate text-sm md:text-base">{label}</span>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default function Sidebar({ setActiveComponent }) {
//   const [activeTab, setActiveTab] = useState("employees");
//   const router = useRouter(); // Initialize useRouter

//   // Main Items
//   const mainItems = [
//     { id: "employees", icon: faUser, label: "Employees" },
//     { id: "leave-balances", icon: faBalanceScaleRight, label: "Leave Balances" },
//     { id: "leave-requests", icon: faFileContract, label: "Leave Requests" },
//   ];

//   // // Create Items
//   // const createItems = [
//   //   { id: "new-employees", icon: faUserPlus, label: "New Employees" },
//   //   { id: "new-admin", icon: faShieldAlt, label: "New Admin" },
//   // ];

//   // Broadcast Message Item
//   const broadcastItems = [
//     { id: "broadcast-message", icon: faBullhorn, label: "Broadcast Message" },
//   ];

//   // Admin List Item (Separate Section)
//   const adminListItems = [
//     { id: "admin-list", icon: faUsersCog, label: "Admin List" },
//   ];

//   // Handle Logout
//   const handleLogout = () => {
//     localStorage.removeItem("uniqueId"); // Clear user session
//     localStorage.removeItem("userRole"); // Clear user session
//     router.push("/login"); // Redirect to the login page
//   };

//   return (
//     <div className="w-full md:w-64 bg-blue-700 text-white p-2 md:p-4 overflow-x-auto fixed bottom-0 md:static flex md:flex-col justify-between md:justify-start gap-2 md:gap-4 z-50 shadow-inner">
//       {/* Main Items Section */}
//       <SidebarSection
//         title="Main Menu"
//         items={mainItems}
//         activeTab={activeTab}
//         setActiveComponent={setActiveComponent}
//         setActiveTab={setActiveTab}
//       />

//       {/* Create Items Section */}
//       {/* <SidebarSection
//         title="Create New"
//         items={createItems}
//         activeTab={activeTab}
//         setActiveComponent={setActiveComponent}
//         setActiveTab={setActiveTab}
//       /> */}

//       {/* Broadcast Message Section */}
//       <SidebarSection
//         title="Utilities"
//         items={broadcastItems}
//         activeTab={activeTab}
//         setActiveComponent={setActiveComponent}
//         setActiveTab={setActiveTab}
//       />

//       {/* Admin List Section */}
//       {/* <SidebarSection
//         title="Administration"
//         items={adminListItems}
//         activeTab={activeTab}
//         setActiveComponent={setActiveComponent}
//         setActiveTab={setActiveTab}
//       /> */}

//       {/* Logout Button */}
//       <button
//         onClick={handleLogout}
//         className="flex md:justify-start justify-center items-center gap-3 w-full px-4 py-2 rounded-xl text-sm font-medium shadow-sm bg-red-600 hover:bg-red-500 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-300"
//       >
//         <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
//         <span className="hidden md:inline truncate text-sm md:text-base">Logout</span>
//       </button>

//       {/* Logo - Hidden on small screens */}
//       <div className="hidden md:block mt-auto pt-4 border-t border-blue-600">
//         {/* <img
//           src="/Kiotel Logo.png"
//           alt="Company Logo"
//           className="w-5/6 mx-auto max-h-30 object-contain"
//         /> */}
//       </div>
//     </div>
//   );
// }



"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUserPlus,
  faBalanceScaleRight,
  faFileContract,
  faShieldAlt,
  faSignOutAlt,
  faUsersCog,
  faBullhorn,
  faClock, // New icon for Shift Allotment
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

// Reusable Sidebar Section Component
const SidebarSection = ({ title, items, activeTab, setActiveComponent, setActiveTab }) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Section Title */}
      <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wide hidden md:block">
        {title}
      </h3>
      {/* Buttons */}
      <div className="flex flex-row md:flex-col gap-2 md:gap-3">
        {items.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => {
              setActiveComponent(id);
              setActiveTab(id);
            }}
            className={`flex md:justify-start justify-center items-center gap-3 w-full px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all duration-300 ${
              activeTab === id
                ? "bg-white text-blue-700 font-semibold"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            } focus:outline-none focus:ring-2 focus:ring-blue-300`}
          >
            <FontAwesomeIcon icon={icon} className="text-lg" />
            <span className="hidden md:inline truncate text-sm md:text-base">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function Sidebar({ setActiveComponent }) {
  const [activeTab, setActiveTab] = useState("employees");
  const router = useRouter(); // Initialize useRouter

  // Main Items
  const mainItems = [
    { id: "employees", icon: faUser, label: "Employees" },
    { id: "leave-balances", icon: faBalanceScaleRight, label: "Leave Balances" },
    { id: "leave-requests", icon: faFileContract, label: "Leave Requests" },
  ];

  // Shift Management Section
  const shiftManagementItems = [
    { id: "shift-allotment", icon: faClock, label: "Shift Allotment" },
    { id: "assignment", icon: faClock, label: "assignment" },
  ];

  // Broadcast Message Item
  const broadcastItems = [
    { id: "broadcast-message", icon: faBullhorn, label: "Broadcast Message" },
  ];

  // Admin List Item (Separate Section)
  const adminListItems = [
    { id: "admin-list", icon: faUsersCog, label: "Admin List" },
  ];

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("uniqueId"); // Clear user session
    localStorage.removeItem("userRole"); // Clear user session
    router.push("/sign-in"); // Redirect to the login page
  };

  return (
    <div className="w-full md:w-64 bg-blue-700 text-white p-2 md:p-4 overflow-x-auto fixed bottom-0 md:static flex md:flex-col justify-between md:justify-start gap-2 md:gap-4 z-50 shadow-inner">
      {/* Main Items Section */}
      <SidebarSection
        title="Main Menu"
        items={mainItems}
        activeTab={activeTab}
        setActiveComponent={setActiveComponent}
        setActiveTab={setActiveTab}
      />

      {/* Shift Management Section */}
      {/* <SidebarSection
        title="Shift Management"
        items={shiftManagementItems}
        activeTab={activeTab}
        setActiveComponent={setActiveComponent}
        setActiveTab={setActiveTab}
      /> */}

      {/* Broadcast Message Section */}
      <SidebarSection
        title="Utilities"
        items={broadcastItems}
        activeTab={activeTab}
        setActiveComponent={setActiveComponent}
        setActiveTab={setActiveTab}
      />

      {/* Admin List Section
      <SidebarSection
        title="Administration"
        items={adminListItems}
        activeTab={activeTab}
        setActiveComponent={setActiveComponent}
        setActiveTab={setActiveTab}
      /> */}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex md:justify-start justify-center items-center gap-3 w-full px-4 py-2 rounded-xl text-sm font-medium shadow-sm bg-red-600 hover:bg-red-500 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-300"
      >
        <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
        <span className="hidden md:inline truncate text-sm md:text-base">Logout</span>
      </button>

      {/* Logo - Hidden on small screens */}
      <div className="hidden md:block mt-auto pt-4 border-t border-blue-600">
        {/* <img
          src="/Kiotel Logo.png"
          alt="Company Logo"
          className="w-5/6 mx-auto max-h-30 object-contain"
        /> */}
      </div>
    </div>
  );
}