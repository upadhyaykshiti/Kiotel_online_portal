"use client";

import React, { useState, useEffect, useRef } from "react";
import { InputField, TextArea, RadioGroup } from "./form_elements"; // adjust import
import SignatureModal from "./SignatureModal"; 
import { useGlobal } from "../../GlobalContext"; // Import Global Context

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

export default function PropertyForm() {
  const { selectedProperty } = useGlobal(); // Get property from context
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localDate, setLocalDate] = useState("");
  
  const [formStatus, setFormStatus] = useState("NOT STARTED"); 
  const [initialData, setInitialData] = useState({});
  const [adminComments, setAdminComments] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    setLocalDate(new Date().toLocaleDateString());
    
    const fetchData = async () => {
      if (!selectedProperty) return;
      
      setIsLoading(true);
      try {
        // Fetch specific to the selected property
        const res = await fetch(`${API_BASE_URL}/form/property?property_id=${selectedProperty.property_id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        setFormStatus(data.status || "NOT STARTED");
        setAdminComments(data.admin_comments || "");
        setInitialData(data.status === 'APPROVED' ? (data.approved_data || {}) : (data.form_data || {}));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedProperty]); // Re-fetch if property changes

  const handleUnlockForm = async () => {
    if (!confirm("This will unlock your form for editing. Continue?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/form/property/unlock`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: selectedProperty.property_id }) // Pass property_id
      });
      const result = await res.json();
      if (result.success) setFormStatus(result.status);
    } catch (error) {
      alert("Error unlocking form.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitToServer = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/form/property`, {
        method: 'POST',
        body: formData, 
      });
      const result = await res.json();
      if(result.success) {
        alert(result.message);
        setFormStatus(result.status);
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      alert("An error occurred while saving.");
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
    formData.append("property_id", selectedProperty.property_id); // ATTACH PROPERTY ID
    
    if (type === "SUBMIT") {
      setPendingFormData(formData);
      setIsSignatureOpen(true);
    } else {
      formData.append("actionType", "DRAFT");
      formData.append("userBrowserDate", localDate);
      submitToServer(formData);
    }
  };

  const handleSignatureConfirm = (signatureDataUrl) => {
    if (!pendingFormData) return;
    pendingFormData.append("actionType", "SUBMIT");
    pendingFormData.append("userBrowserDate", localDate);
    pendingFormData.append("authorizedSignature", signatureDataUrl); 
    submitToServer(pendingFormData);
  };

  if (!selectedProperty) return <div className="p-10 text-center text-gray-500">Please select a property from the sidebar.</div>;
  if (isLoading) return <div className="p-10 text-center text-gray-600">Loading form data...</div>;

  // --- READ-ONLY STATES ---
  if (formStatus === "APPROVED") {
    return (
      <div className="p-8 max-w-4xl mx-auto mt-10 bg-green-50 rounded-lg border border-green-200">
        <h2 className="text-2xl font-bold text-green-800 mb-4">Property Approved!</h2>
        <p className="text-green-700 mb-6">Your onboarding data for {selectedProperty.property_name} is live.</p>
        <button onClick={handleUnlockForm} className="px-6 py-2.5 bg-white border-2 border-green-600 text-green-700 font-bold rounded-md hover:bg-green-100 transition-colors shadow-sm">
          Request Changes to Data
        </button>
      </div>
    );
  }

  if (formStatus === "SUBMITTED" || formStatus === "UNDER REVIEW") {
    return (
      <div className="p-8 max-w-4xl mx-auto mt-10 bg-yellow-50 rounded-lg border border-yellow-200">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">Form {formStatus}</h2>
        <p className="text-yellow-700">Your form is currently locked while admins review your submission.</p>
      </div>
    );
  }

  // --- EDITABLE FORM STATE ---
  return (
    <div className="max-w-6xl mx-auto pb-10 px-4 sm:px-6 lg:px-8 animate-fade-in py-8">
      <SignatureModal isOpen={isSignatureOpen} onClose={() => setIsSignatureOpen(false)} onConfirm={handleSignatureConfirm} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 px-8 py-6 text-white">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold">Property Onboarding Form</h1>
              <p className="text-sm mt-2 opacity-90">Filling details for: <span className="font-bold text-yellow-300">{selectedProperty.property_name}</span></p>
            </div>
            {localDate && (
              <div className="text-sm font-medium bg-blue-700/50 px-3 py-1 rounded-md border border-blue-500/50 whitespace-nowrap">
                Date: {localDate}
              </div>
            )}
          </div>
          {formStatus === "CHANGES REQUESTED" && (
            <div className="mt-4 bg-red-500/20 p-4 border border-red-400 rounded-md text-sm text-white">
              <strong className="block mb-1 text-red-100">⚠ Admin requested changes:</strong> {adminComments}
            </div>
          )}
        </div>

        <form ref={formRef} className="p-8 space-y-10">
          
          {/* Include all your fieldsets from previous code here exactly as they were */}
          <fieldset className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
            <legend className="text-lg font-semibold text-gray-800 px-3 bg-white border border-gray-200 rounded-md py-1 shadow-sm">Hotel Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <InputField label="Hotel Name" name="hotelName" defaultValue={initialData.hotelName || selectedProperty.property_name} required />
              <InputField label="Hotel Phone No." name="hotelPhone" defaultValue={initialData.hotelPhone} required />
              <InputField label="Hotel's Email" name="hotelEmail" type="email" defaultValue={initialData.hotelEmail} required />
            </div>
            {/* ... Rest of your fields ... */}
          </fieldset>

          {/* Form Actions / Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 sticky bottom-0 bg-white py-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-10 px-4 rounded-b-xl">
            <span className="text-xs text-gray-500 mr-auto hidden md:block">
              All fields marked with <span className="text-red-500">*</span> are required to submit for review.
            </span>
            <button type="button" onClick={(e) => handleAction(e, "DRAFT")} disabled={isSubmitting} className="px-6 py-2.5 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Save Draft
            </button>
            <button type="button" onClick={(e) => handleAction(e, "SUBMIT")} disabled={isSubmitting} className="px-8 py-2.5 bg-[#cc4a24] text-white rounded-md text-sm font-semibold hover:bg-[#a83d1e]">
              {isSubmitting ? 'Processing...' : 'Submit to Admin Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}