

"use client";

import { useRouter } from "next/navigation";

export default function SheetPage() {
  const router = useRouter();

  const googleSheetUrl =
    "https://docs.google.com/spreadsheets/d/1TdSRit7gFHKTRwJtgEeKNCZQXwZH2-bfKis3O6Adcvs";

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-blue-700 text-white py-4 px-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Shared Google Sheet</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-white text-blue-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition"
        >
          Back to Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="w-full h-[80vh] relative">
            <iframe
              src={googleSheetUrl}
              title="Shared Google Sheet"
              className="absolute inset-0 w-full h-full border-none"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </main>
    </div>
  );
}





// "use client"




// import { useState } from "react";

// export default function GoogleSheetPage() {
//   const [selectedSheet, setSelectedSheet] = useState("Sheet1"); // Default sheet

//   // Helper function to map sheet names to their respective published URLs
//   function getSheetUrl(sheetName) {
//     const sheetUrls = {
//       Sheet1:
//         "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVgX1Oi_T7lGmHuTfh-m6DkuX-vCsBz-V8YvtgWibUGPN3nwRdi8EgsYU8vpx0lbXwaJmVeoCy0J_r/pubhtml?gid=0&single=true&widget=true&headers=false",
//       Sheet2:
//         "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVgX1Oi_T7lGmHuTfh-m6DkuX-vCsBz-V8YvtgWibUGPN3nwRdi8EgsYU8vpx0lbXwaJmVeoCy0J_r/pubhtml?gid=235692391&single=true&widget=true&headers=false",
//       Sheet3:
//         "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVgX1Oi_T7lGmHuTfh-m6DkuX-vCsBz-V8YvtgWibUGPN3nwRdi8EgsYU8vpx0lbXwaJmVeoCy0J_r/pubhtml?gid=380806974&single=true&widget=true&headers=false",
//       Sheet4:
//         "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVgX1Oi_T7lGmHuTfh-m6DkuX-vCsBz-V8YvtgWibUGPN3nwRdi8EgsYU8vpx0lbXwaJmVeoCy0J_r/pubhtml?gid=1787068043&single=true&widget=true&headers=false",
//     };
//     return sheetUrls[sheetName];
//   }

//   // Function to handle sheet selection
//   const handleSheetChange = (sheetName) => {
//     setSelectedSheet(sheetName); // Update the selected sheet
//   };

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <header className="mb-8 text-center">
//         <h1 className="text-3xl font-bold text-blue-700">Embedded Google Sheet</h1>
//         <p className="mt-2 text-sm text-gray-600">
//           Below is the live Google Sheet embedded dynamically.
//         </p>
//       </header>

//       {/* Custom Tab Bar */}
//       <nav className="flex justify-between items-center mb-4">
//         <ul className="flex space-x-4">
//           {["Sheet1", "Sheet2", "Sheet3", "Sheet4"].map((sheet) => (
//             <li key={sheet}>
//               <button
//                 onClick={() => handleSheetChange(sheet)}
//                 className={`px-4 py-2 rounded-md ${
//                   selectedSheet === sheet ? "bg-blue-500 text-white" : "text-blue-500 hover:bg-blue-100"
//                 }`}
//               >
//                 {sheet}
//               </button>
//             </li>
//           ))}
//         </ul>
//       </nav>

//       {/* Google Sheet Container */}
//       <div className="relative overflow-hidden rounded-lg shadow-xl border border-gray-200">
//         <iframe
//           key={selectedSheet} // Force re-render of iframe when selectedSheet changes
//           src={getSheetUrl(selectedSheet)} // Use the correct published URL
//           width="100%"
//           height="800"
//           frameBorder="0"
//           className="w-full h-full"
//           title="Embedded Google Sheet"
//         ></iframe>
//       </div>

//       {/* Footer */}
//       <footer className="mt-8 text-center text-gray-600">
//         <p>
//           This Google Sheet is embedded dynamically and updates in real-time.
//         </p>
//       </footer>
//     </div>
//   );
// }