
// "use client";

// import React from "react";
// import Navbar from "../app/customer/Navbar";     // Adjust path to your Navbar
// import Sidebar from "../app/customer/Sidebar";   // Adjust path to your Sidebar
// import { useGlobal } from "./GlobalContext";

// export default function ShellLayout({ children }) {
//   const { user, customerProperties, selectedProperty, setSelectedProperty, loading } = useGlobal();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="w-10 h-10 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   // Fallback for non-logged in state or failed fetch
//   const fname = user?.fname || "User";

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 flex flex-col overflow-hidden">
//       <Navbar userFname={fname} />
//       <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
//         <Sidebar 
//           customerProperties={customerProperties}
//           selectedProperty={selectedProperty}
//           handlePropertyChange={setSelectedProperty}
//           propertyLinks={{}} // Pass logic to fetch links if needed globally, or omit if not strict
//         />
//         <main className="flex-1 overflow-y-auto relative">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }


// "use client";

// import React from "react";
// import Navbar from "../app/customer/Navbar";     // Adjust path to your Navbar
// import Sidebar from "../app/customer/Sidebar";   // Adjust path to your Sidebar
// import { useGlobal } from "./GlobalContext";

// export default function ShellLayout({ children }) {
//   const { user, customerProperties, selectedProperty, setSelectedProperty, loading } = useGlobal();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="w-10 h-10 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   // Fallback for non-logged in state or failed fetch
//   const fname = user?.fname || "User";

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900">
      
//       {/* Navbar is fully fixed to the top */}
//       <Navbar userFname={fname} />

//       {/* Sidebar is fully fixed to the left */}
//       <Sidebar 
//         customerProperties={customerProperties}
//         selectedProperty={selectedProperty}
//         handlePropertyChange={setSelectedProperty}
//         propertyLinks={{}} 
//       />

//       {/* 
//         Main content area 
//         pt-16 offsets the fixed Navbar (h-16)
//         pl-72 offsets the fixed Sidebar (w-72)
//       */}
//       <main className="pt-16 pl-72 min-h-screen relative">
//         {children}
//       </main>
      
//     </div>
//   );
// }



"use client";

import React from "react";
import Navbar from "../app/customer/Navbar"; // Adjust path to your Navbar
import Sidebar from "../app/customer/Sidebar"; // Adjust path to your Sidebar
import { useGlobal } from "./GlobalContext";

export default function ShellLayout({ children }) {
  const {
    user,
    customerProperties,
    selectedProperty,
    setSelectedProperty,
    loading,
    forms,
    formsLoading,
    gating,
  } = useGlobal();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const fname = user?.fname || "User";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900">
      <Navbar userFname={fname} />

      <Sidebar
        customerProperties={customerProperties}
        selectedProperty={selectedProperty}
        handlePropertyChange={setSelectedProperty}
        propertyLinks={{}} // still empty until you wire it
        forms={forms}
        formsLoading={formsLoading}
        gating={gating}
      />

      <main className="pt-16 pl-72 min-h-screen relative">{children}</main>
    </div>
  );
}