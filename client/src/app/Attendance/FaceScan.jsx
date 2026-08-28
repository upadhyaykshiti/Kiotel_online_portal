// "use client";
// import { useState, useRef, useEffect } from "react";
// import { FaCamera, FaSpinner, FaUserCheck, FaIdCard, FaMagic } from "react-icons/fa";

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

// export default function FaceScan({ onEmployeeMatched, onNoMatch, onError }) {
//   const videoRef  = useRef(null);
//   const streamRef = useRef(null);
//   const [status, setStatus]   = useState("starting");
//   const [scanning, setScanning] = useState(false);
//   const [isAutoScanActive, setIsAutoScanActive] = useState(false);

//   // Helper function to check if the current time in IST is within the auto-scan windows
//   const checkIsAutoScanTime = () => {
//     const now = new Date();
//     // Get the current time in Asia/Kolkata (IST)
//     const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
//     const istDate = new Date(istString);
    
//     const hours = istDate.getHours();
//     const mins = istDate.getMinutes();
//     const totalMins = hours * 60 + mins;

//     // Window 1: 6:30 AM to 7:30 AM (390 to 450 minutes)
//     if (totalMins >= 390 && totalMins <= 450) return true;

//     // // 🌟 NEW WINDOW: 10:30 AM to 11:30 AM (630 to 690 minutes)
//     // if (totalMins >= 630 && totalMins <= 690) return true;
    
//     // Window 2: 2:30 PM to 3:30 PM (870 to 930 minutes)
//     if (totalMins >= 870 && totalMins <= 930) return true;
    
//     // Window 3: 10:30 PM to 11:30 PM (1350 to 1410 minutes)
//     if (totalMins >= 1350 && totalMins <= 1410) return true;

//     // 🌟 NEW WINDOW: 8:00 PM to 9:00 PM (1200 to 1260 minutes)
//     // if (totalMins >= 1200 && totalMins <= 1260) return true;

//     return false;
//   };

//   useEffect(() => {
//     startCamera();

//     // Check if we are in an auto-scan window on load, and check again every 10 seconds
//     setIsAutoScanActive(checkIsAutoScanTime());
//     const timeInterval = setInterval(() => {
//       setIsAutoScanActive(checkIsAutoScanTime());
//     }, 10000);

//     return () => {
//       stopCamera();
//       clearInterval(timeInterval);
//     };
//   }, []);

//   // Effect to handle the actual Automatic Scanning
//   useEffect(() => {
//     let timer;
//     // If auto-scan is active, camera is ready, and we aren't already scanning
//     if (isAutoScanActive && status === "ready" && !scanning) {
//       // Wait 3 seconds to let them position their face, then auto capture
//       timer = setTimeout(() => {
//         captureAndIdentify();
//       }, 3000);
//     }
//     return () => clearTimeout(timer);
//   }, [isAutoScanActive, status, scanning]); 

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480, facingMode: "user" },
//       });
//       streamRef.current = stream;
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.onloadedmetadata = () => setStatus("ready");
//       }
//     } catch (err) {
//       setStatus("error");
//       onError?.("Camera access denied");
//     }
//   };

//   const stopCamera = () => {
//     streamRef.current?.getTracks().forEach((t) => t.stop());
//   };

//   const captureAndIdentify = async () => {
//     // Prevent multiple simultaneous scans
//     if (status !== "ready" || scanning) return;
    
//     setScanning(true);
//     setStatus("scanning");

//     const canvas  = document.createElement("canvas");
//     canvas.width  = videoRef.current.videoWidth;
//     canvas.height = videoRef.current.videoHeight;
//     canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

//     canvas.toBlob(async (blob) => {
//       const form = new FormData();
//       form.append("photo", blob, "face.jpg");

//       try {
//         const res  = await fetch(`${API_BASE_URL}/clockin/identify-face`, {
//           method: "POST",
//           body  : form,
//         });
//         const data = await res.json();

//         if (data.success) {
//           stopCamera();
//           setStatus("matched");
//           onEmployeeMatched(data.employee_id);
//         } else {
//           setStatus("no_match");
//           onNoMatch?.();
//         }
//       } catch {
//         setStatus("error");
//         onError?.("Network error");
//       } finally {
//         setScanning(false);
//       }
//     }, "image/jpeg", 0.92);
//   };

//   return (
//     <div className="w-full">
//       <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden mb-4 shadow-inner">
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="w-full h-full object-cover"
//           style={{ transform: "scaleX(-1)" }}
//         />

//         {status === "matched" && (
//           <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center rounded-2xl backdrop-blur-sm">
//             <div className="bg-white/90 px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl scale-110 transition-transform">
//               <FaUserCheck className="text-green-600 text-3xl" />
//               <span className="text-green-800 font-bold text-lg">Face Recognized!</span>
//             </div>
//           </div>
//         )}

//         {status === "starting" && (
//           <div className="absolute inset-0 bg-gray-900 flex items-center justify-center rounded-2xl">
//             <FaSpinner className="text-white text-4xl animate-spin" />
//           </div>
//         )}
//       </div>

//       {/* Status message */}
//       <div className={`text-center p-3 rounded-xl mb-4 text-sm font-medium ${
//         status === "matched"  ? "bg-green-50 text-green-800 border border-green-200" :
//         status === "no_match" ? "bg-amber-50 text-amber-800 border border-amber-200" :
//         status === "error"    ? "bg-red-50 text-red-800 border border-red-200"       :
//                                 "bg-blue-50 text-blue-800 border border-blue-200"
//       }`}>
//         {status === "starting"  && "Starting camera..."}
//         {status === "ready"     && (isAutoScanActive ? "Camera ready. Auto-scanning in a few seconds..." : "Camera ready. Click Scan to identify.")}
//         {status === "scanning"  && "Scanning... please hold still."}
//         {status === "matched"   && "Face recognized! Loading your profile..."}
//         {status === "no_match"  && "Face not recognized. Please try again or enter ID."}
//         {status === "error"     && "Camera error. Please enter your ID manually."}
//       </div>

//       <div className="flex gap-3">
//         {(status === "ready" || status === "scanning") && (
//           <button
//             onClick={captureAndIdentify}
//             disabled={scanning || status !== "ready"}
//             className="flex-1 py-3 px-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold disabled:opacity-60 flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95"
//           >
//             {scanning ? (
//               <div className="flex items-center gap-2">
//                 <FaSpinner className="animate-spin text-lg" />
//                 <span>Scanning...</span>
//               </div>
//             ) : isAutoScanActive ? (
//               <>
//                 <div className="flex items-center gap-2 text-base">
//                   <FaMagic className="text-blue-200" />
//                   Auto-Scan Active
//                 </div>
//                 <div className="text-[10px] text-blue-100 font-normal mt-0.5">
//                   (Or click to force scan manually)
//                 </div>
//               </>
//             ) : (
//               <div className="flex items-center gap-2 text-base">
//                 <FaCamera className="text-blue-200" />
//                 Scan My Face
//               </div>
//             )}
//           </button>
//         )}

//         {(status === "no_match" || status === "error") && (
//           <button
//             onClick={() => { setStatus("ready"); }}
//             className="flex-1 px-4 py-3 border-2 border-blue-500 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
//           >
//             Try Again
//           </button>
//         )}

//         <button
//           onClick={() => { stopCamera(); onNoMatch?.(); }}
//           className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
//         >
//           <FaIdCard className="text-gray-500" /> Enter ID
//         </button>
//       </div>
//     </div>
//   );
// }


"use client";
import { useState, useRef, useEffect } from "react";
import { FaCamera, FaSpinner, FaUserCheck, FaIdCard } from "react-icons/fa";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

export default function FaceScan({ onEmployeeMatched, onNoMatch, onError }) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus]   = useState("starting");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setStatus("ready");
      }
    } catch (err) {
      setStatus("error");
      onError?.("Camera access denied");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  // const captureAndIdentify = async () => {
  //   // Prevent multiple simultaneous scans
  //   if (status !== "ready" || scanning) return;
    
  //   setScanning(true);
  //   setStatus("scanning");

  //   const canvas  = document.createElement("canvas");
  //   canvas.width  = videoRef.current.videoWidth;
  //   canvas.height = videoRef.current.videoHeight;
  //   canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

  //   canvas.toBlob(async (blob) => {
  //     const form = new FormData();
  //     form.append("photo", blob, "face.jpg");

  //     try {
  //       const res  = await fetch(`${API_BASE_URL}/clockin/identify-face`, {
  //         method: "POST",
  //         body  : form,
  //       });
  //       const data = await res.json();

  //       if (data.success) {
  //         stopCamera();
  //         setStatus("matched");
  //         onEmployeeMatched(data.employee_id);
  //       } else {
  //         setStatus("no_match");
  //         onNoMatch?.();
  //       }
  //     } catch {
  //       setStatus("error");
  //       onError?.("Network error");
  //     } finally {
  //       setScanning(false);
  //     }
  //   }, "image/jpeg", 0.92);
  // };

  const captureAndIdentify = async () => {
  // Prevent multiple simultaneous scans
  if (status !== "ready" || scanning) return;

  setScanning(true);
  setStatus("scanning");

  const canvas = document.createElement("canvas");
  canvas.width = videoRef.current.videoWidth;
  canvas.height = videoRef.current.videoHeight;

  canvas
    .getContext("2d")
    .drawImage(videoRef.current, 0, 0);

  canvas.toBlob(async (blob) => {
    const form = new FormData();

    form.append("photo", blob, "face.jpg");

    // Fetch device ID from localStorage
    const browserDeviceId = localStorage.getItem("browser_device_id");

    if (browserDeviceId) {
      form.append("browser_device_id", browserDeviceId);
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/clockin/identify-face`,
        {
          method: "POST",
          body: form,
        }
      );

      const data = await res.json();

      if (data.success) {
        stopCamera();
        setStatus("matched");
        onEmployeeMatched(data.employee_id);
      } else {
        setStatus("no_match");
        onNoMatch?.();
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      onError?.("Network error");
    } finally {
      setScanning(false);
    }
  }, "image/jpeg", 0.92);
};


  return (
    <div className="w-full">
      <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden mb-4 shadow-inner">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />

        {status === "matched" && (
          <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center rounded-2xl backdrop-blur-sm">
            <div className="bg-white/90 px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl scale-110 transition-transform">
              <FaUserCheck className="text-green-600 text-3xl" />
              <span className="text-green-800 font-bold text-lg">Face Recognized!</span>
            </div>
          </div>
        )}

        {status === "starting" && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center rounded-2xl">
            <FaSpinner className="text-white text-4xl animate-spin" />
          </div>
        )}
      </div>

      {/* Status message */}
      <div className={`text-center p-3 rounded-xl mb-4 text-sm font-medium ${
        status === "matched"  ? "bg-green-50 text-green-800 border border-green-200" :
        status === "no_match" ? "bg-amber-50 text-amber-800 border border-amber-200" :
        status === "error"    ? "bg-red-50 text-red-800 border border-red-200"       :
                                "bg-blue-50 text-blue-800 border border-blue-200"
      }`}>
        {status === "starting"  && "Starting camera..."}
        {status === "ready"     && "Camera ready. Click Scan to identify."}
        {status === "scanning"  && "Scanning... please hold still."}
        {status === "matched"   && "Face recognized! Loading your profile..."}
        {status === "no_match"  && "Face not recognized. Please try again or enter ID."}
        {status === "error"     && "Camera error. Please enter your ID manually."}
      </div>

      <div className="flex gap-3">
        {(status === "ready" || status === "scanning") && (
          <button
            onClick={captureAndIdentify}
            disabled={scanning || status !== "ready"}
            className="flex-1 py-3 px-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold disabled:opacity-60 flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95"
          >
            {scanning ? (
              <div className="flex items-center gap-2">
                <FaSpinner className="animate-spin text-lg" />
                <span>Scanning...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-base">
                <FaCamera className="text-blue-200" />
                Scan My Face
              </div>
            )}
          </button>
        )}

        {(status === "no_match" || status === "error") && (
          <button
            onClick={() => { setStatus("ready"); }}
            className="flex-1 px-4 py-3 border-2 border-blue-500 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Try Again
          </button>
        )}

        <button
          onClick={() => { stopCamera(); onNoMatch?.(); }}
          className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
        >
          <FaIdCard className="text-gray-500" /> Enter ID
        </button>
      </div>
    </div>
  );
}