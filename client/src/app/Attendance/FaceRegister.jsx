

// /Attendance/FaceRegister
"use client";
import { useState, useRef, useEffect } from "react";
import { FaCamera, FaSpinner, FaCheckCircle, FaRedo } from "react-icons/fa";

const API_BASE_URL    = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";
const REQUIRED_CAPTURES = 4;

export default function FaceRegister({ employeeId, employeeName, onRegistered, onSkip }) {
  const videoRef      = useRef(null);
  const streamRef     = useRef(null);
  const [cameraReady, setCameraReady]   = useState(false);
  const [capturing, setCapturing]       = useState(false);
  const [registering, setRegistering]   = useState(false);
  const [message, setMessage]           = useState("");
  const [blobs, setBlobs]               = useState([]);  // captured photo blobs

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current      = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => setCameraReady(true);
    } catch {
      setMessage("Camera access denied.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const capturePhoto = () => {
    if (!cameraReady || capturing) return;
    setCapturing(true);

    const canvas  = document.createElement("canvas");
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const newBlobs = [...blobs, blob];
      setBlobs(newBlobs);
      setMessage(
        newBlobs.length < REQUIRED_CAPTURES
          ? `${newBlobs.length}/${REQUIRED_CAPTURES} captured. Move head slightly and capture again.`
          : `All ${REQUIRED_CAPTURES} captures done! Click Register.`
      );
      setCapturing(false);
    }, "image/jpeg", 0.92);
  };

  const handleRegister = async () => {
    if (blobs.length < REQUIRED_CAPTURES) return;
    setRegistering(true);
    setMessage("Registering your face...");

    const form = new FormData();
    form.append("employee_id", employeeId);
    blobs.forEach((blob, i) => {
      form.append("photo", blob, `face_${i}.jpg`);
    });

    try {
      const res  = await fetch(`${API_BASE_URL}/clockin/register-face`, {
        method: "POST",
        body  : form,
      });
      const data = await res.json();

      if (data.success) {
        stopCamera();
        setMessage(`✅ Registered with ${data.captures_saved} captures!`);
        setTimeout(() => onRegistered?.(), 1500);
      } else {
        setMessage(data.message || "Registration failed. Try again.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  const handleReset = () => {
    setBlobs([]);
    setMessage("Reset. Start capturing again.");
  };

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Register Your Face</h3>
        <p className="text-sm text-gray-600">
          Hi <span className="font-semibold">{employeeName}</span>, capture
          {REQUIRED_CAPTURES} photos from slightly different angles.
        </p>
      </div>

      <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay playsInline muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        {/* Progress dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {Array.from({ length: REQUIRED_CAPTURES }).map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${
              i < blobs.length
                ? "bg-green-500 border-green-500 scale-110"
                : "bg-transparent border-white/60"
            }`} />
          ))}
        </div>
      </div>

      {message && (
        <div className={`text-center p-3 rounded-xl mb-4 text-sm font-medium ${
          message.includes("✅") ? "bg-green-50 text-green-800 border border-green-200" :
          message.includes("failed") ? "bg-red-50 text-red-800 border border-red-200" :
          "bg-blue-50 text-blue-800 border border-blue-200"
        }`}>
          {message}
        </div>
      )}

      <div className="flex gap-3">
        {blobs.length < REQUIRED_CAPTURES ? (
          <>
            <button
              onClick={capturePhoto}
              disabled={!cameraReady || capturing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
            >
              {capturing
                ? <><FaSpinner className="animate-spin" /> Capturing...</>
                : <><FaCamera /> Capture ({blobs.length}/{REQUIRED_CAPTURES})</>
              }
            </button>
            {blobs.length > 0 && (
              <button onClick={handleReset}
                className="px-4 py-3 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50">
                <FaRedo />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleRegister}
            disabled={registering}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
          >
            {registering
              ? <><FaSpinner className="animate-spin" /> Registering...</>
              : <><FaCheckCircle /> Register Face</>
            }
          </button>
        )}
      </div>

      <button
        onClick={() => { stopCamera(); onSkip?.(); }}
        className="w-full mt-3 px-4 py-2 text-gray-500 text-sm hover:text-gray-700 font-medium"
      >
        Skip face registration →
      </button>
    </div>
  );
}