"use client";

import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function SignatureModal({ isOpen, onClose, onConfirm }) {
  const sigCanvas = useRef({});

  if (!isOpen) return null;

  const handleClear = () => sigCanvas.current.clear();

  const handleConfirm = () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Please provide a signature before confirming.");
      return;
    }
    
    // Changed getTrimmedCanvas() to getCanvas() to bypass the Webpack error
    const signatureDataUrl = sigCanvas.current.getCanvas().toDataURL("image/png");
    
    onConfirm(signatureDataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="bg-blue-600 px-6 py-4 text-white">
          <h2 className="text-xl font-bold">Signature Required</h2>
          <p className="text-sm opacity-90">Please sign below to confirm your submission.</p>
        </div>
        
        <div className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mb-4">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                className: "w-full h-48 cursor-crosshair rounded-lg"
              }}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <button 
              onClick={handleClear} 
              className="text-sm text-gray-500 hover:text-gray-800 underline"
            >
              Clear Signature
            </button>
            <div className="flex space-x-3">
              <button 
                onClick={onClose} 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm} 
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold shadow-sm"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}