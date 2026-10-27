"use client";

import React, { useState, useEffect, useRef } from "react";
import { InputField, TextArea } from "./FormControls";
import SignatureModal from "./SignatureModal"; 

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

export default function EquipmentForm({ onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState("NOT STARTED"); 
  const [adminComments, setAdminComments] = useState("");
  const [initialData, setInitialData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Signature States
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const formRef = useRef(null);

  // Determine if form should be locked for viewing only
  const isReadOnly = ["APPROVED", "SUBMITTED", "UNDER REVIEW"].includes(formStatus);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/form/equipment/me`);
        const data = await res.json();
        setFormStatus(data.status || "NOT STARTED");
        setAdminComments(data.admin_comments || "");
        setInitialData(data.status === 'APPROVED' ? (data.approved_data || {}) : (data.form_data || {}));
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchData();
  }, []);

  const submitToServer = async (formData) => {
    setIsSubmitting(true);
    try {
      // Sending as FormData to support the File Upload (Key Encoder Photos)
      const res = await fetch(`${API_BASE_URL}/form/equipment`, {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if(result.success) {
        setFormStatus(result.status);
        alert(result.message);
      } else {
        alert("Error: " + result.error);
      }
    } finally { 
      setIsSubmitting(false); 
      setIsSignatureOpen(false);
    }
  };

  const handleAction = (e, type) => {
    e.preventDefault();
    if (!formRef.current) return;

    if (type === "SUBMIT" && !formRef.current.reportValidity()) return;

    const formData = new FormData(formRef.current);
    
    if (type === "SUBMIT") {
      setPendingFormData(formData);
      setIsSignatureOpen(true);
    } else {
      formData.append("actionType", "DRAFT");
      submitToServer(formData);
    }
  };

  const handleSignatureConfirm = (signatureDataUrl) => {
    if (!pendingFormData) return;
    pendingFormData.append("actionType", "SUBMIT");
    pendingFormData.append("authorizedSignature", signatureDataUrl); 
    submitToServer(pendingFormData);
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      <SignatureModal 
        isOpen={isSignatureOpen} 
        onClose={() => setIsSignatureOpen(false)} 
        onConfirm={handleSignatureConfirm} 
      />

      <button onClick={onBack} className="text-blue-600 hover:text-blue-800 font-medium flex items-center mb-4">
        <span className="mr-1">←</span> Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gray-800 px-8 py-6 text-white">
          <h1 className="text-2xl font-bold">Third-Party Equipment</h1>
          <p className="text-sm mt-2 opacity-90">All Entries</p>
          
          {/* Display Admin Comments if changes are requested */}
          {formStatus === "CHANGES REQUESTED" && (
            <div className="mt-4 bg-red-500/20 p-4 border border-red-400 rounded-md text-sm text-white">
              <strong className="block mb-1 text-red-100">⚠ Admin requested changes:</strong> 
              {adminComments}
            </div>
          )}

          {isReadOnly && (
            <div className="mt-4 bg-blue-500/20 p-3 border border-blue-400 rounded-md text-sm">
              <strong>Status: {formStatus}</strong> - This form is currently locked and in read-only mode.
            </div>
          )}
        </div>
        
        <form ref={formRef} className="p-8 space-y-8">
          
          {/* Disables all inputs inside if isReadOnly is true */}
          <fieldset disabled={isReadOnly} className="space-y-8">

            {/* General Info */}
            <div className="border border-gray-200 p-6 rounded-lg bg-gray-50/50">
              <legend className="font-bold text-gray-800 px-3 bg-white border rounded-md shadow-sm">General Information</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <InputField label="Name" name="name" defaultValue={initialData.name} required />
                <InputField label="Property Name" name="propertyName" defaultValue={initialData.propertyName} required />
              </div>
              <div className="mt-4">
                <TextArea label="Address" name="address" defaultValue={initialData.address} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <InputField label="Phone" name="phone" defaultValue={initialData.phone} required />
                <InputField label="Email" name="email" type="email" defaultValue={initialData.email} required />
              </div>
            </div>

            {/* Key Lock Provider */}
            <div className="border border-gray-200 p-6 rounded-lg bg-gray-50/50">
              <legend className="font-bold text-gray-800 px-3 bg-white border rounded-md shadow-sm">Key Lock Settings</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <InputField label="Key Lock Provider" name="keyLockProvider" defaultValue={initialData.keyLockProvider} />
                <InputField label="Lock Type" name="lockType" defaultValue={initialData.lockType} />
                <InputField label="Provider Support Number" name="keyLockSupportNumber" defaultValue={initialData.keyLockSupportNumber} />
                <InputField label="Key Encoder Model/Serial #" name="keyEncoderModel" defaultValue={initialData.keyEncoderModel} />
                
                {/* File Upload for Photos */}
                <InputField label="Key Encoder Photos (Upload)" name="keyEncoderPhotos" type="file" accept="image/*" />
                
                <InputField label="PIN pad Model" name="pinPadModel" defaultValue={initialData.pinPadModel} />
              </div>
            </div>

            {/* PBX System */}
            <div className="border border-gray-200 p-6 rounded-lg bg-gray-50/50">
              <legend className="font-bold text-gray-800 px-3 bg-white border rounded-md shadow-sm">PBX Settings</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <InputField label="PBX System" name="pbxSystem" defaultValue={initialData.pbxSystem} />
                <InputField label="PBX Provider" name="pbxProvider" defaultValue={initialData.pbxProvider} />
                <InputField label="Provider Support Number" name="pbxSupportNumber" defaultValue={initialData.pbxSupportNumber} />
              </div>
              <p className="text-xs text-red-500 mt-4 font-medium">* Please do not submit passwords through this form.</p>
            </div>

          </fieldset>

          {/* Action Buttons (Hidden if Read-Only) */}
          {!isReadOnly && (
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={(e) => handleAction(e, "DRAFT")} 
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
              >
                Save Draft
              </button>
              <button 
                type="button" 
                onClick={(e) => handleAction(e, "SUBMIT")}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white font-bold rounded-md shadow-sm hover:bg-blue-700 transition"
              >
                {isSubmitting ? 'Processing...' : 'Submit Form'}
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}