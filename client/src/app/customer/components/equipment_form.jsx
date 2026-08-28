"use client";

import React, { useState, useEffect, useRef } from "react";
import { InputField, TextArea } from "./FormControls";
import SignatureModal from "./SignatureModal";
import { useGlobal } from "../../GlobalContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

export default function EquipmentForm() {
  const { selectedProperty } = useGlobal();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState("NOT STARTED");
  const [adminComments, setAdminComments] = useState("");
  const [initialData, setInitialData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const formRef = useRef(null);

  const isReadOnly = ["APPROVED", "SUBMITTED", "UNDER REVIEW"].includes(
    formStatus,
  );

  useEffect(() => {
    if (!selectedProperty) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // API CHANGE: Pass property_id
        const res = await fetch(
          `${API_BASE_URL}/form/equipment/me?property_id=${selectedProperty.property_id}`,
        );
        const data = await res.json();
        setFormStatus(data.status || "NOT STARTED");
        setAdminComments(data.admin_comments || "");
        setInitialData(
          data.status === "APPROVED"
            ? data.approved_data || {}
            : data.form_data || {},
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedProperty]);

  const submitToServer = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/form/equipment`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
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
    if (!formRef.current || !selectedProperty) return;
    if (type === "SUBMIT" && !formRef.current.reportValidity()) return;

    const formData = new FormData(formRef.current);

    // API CHANGE: Append property_id
    formData.append("property_id", selectedProperty.property_id);

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

  if (!selectedProperty) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-slate-500 h-full">
        <svg
          className="w-12 h-12 mb-4 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
        <p className="text-lg font-medium">
          Please select a property from the sidebar to view the equipment form.
        </p>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="p-10 text-center text-slate-500 flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>{" "}
        Loading equipment data...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10 pb-20">
      <SignatureModal
        isOpen={isSignatureOpen}
        onClose={() => setIsSignatureOpen(false)}
        onConfirm={handleSignatureConfirm}
      />

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-200">
        <div className="bg-slate-800 px-8 py-6 text-white">
          <h1 className="text-2xl font-bold tracking-tight">
            Third-Party Equipment
          </h1>
          <p className="text-sm mt-1.5 text-slate-300 font-medium">
            Configuring setup for:{" "}
            <span className="text-white font-bold">
              {selectedProperty.property_name}
            </span>
          </p>

          {formStatus === "CHANGES REQUESTED" && (
            <div className="mt-5 bg-red-500/20 p-4 border border-red-400/50 rounded-xl text-sm text-white">
              <strong className="flex items-center gap-2 mb-1 text-red-100">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>{" "}
                Admin requested changes:
              </strong>
              {adminComments}
            </div>
          )}

          {isReadOnly && (
            <div className="mt-5 bg-blue-500/20 p-4 border border-blue-400/50 rounded-xl text-sm text-blue-50">
              <strong className="text-white">Status: {formStatus}</strong> -
              This form is currently locked and in read-only mode.
            </div>
          )}
        </div>

        <form ref={formRef} className="p-8 space-y-10">
          <fieldset disabled={isReadOnly} className="space-y-10">
            {/* General Info */}
            <div className="border border-slate-200 p-6 rounded-xl bg-slate-50/50 relative pt-8">
              <legend className="absolute -top-3 left-6 text-sm font-bold text-slate-700 px-3 bg-white border border-slate-200 rounded-lg py-1 shadow-sm uppercase tracking-wider">
                General Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Name"
                  name="name"
                  defaultValue={initialData.name}
                  required
                />
                <InputField
                  label="Property Name"
                  name="propertyName"
                  defaultValue={initialData.propertyName}
                  required
                />
              </div>
              <div className="mt-4">
                <TextArea
                  label="Address"
                  name="address"
                  defaultValue={initialData.address}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <InputField
                  label="Phone"
                  name="phone"
                  defaultValue={initialData.phone}
                  required
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={initialData.email}
                  required
                />
              </div>
            </div>

            {/* Key Lock Provider */}
            <div className="border border-slate-200 p-6 rounded-xl bg-slate-50/50 relative pt-8">
              <legend className="absolute -top-3 left-6 text-sm font-bold text-slate-700 px-3 bg-white border border-slate-200 rounded-lg py-1 shadow-sm uppercase tracking-wider">
                Key Lock Settings
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Key Lock Provider"
                  name="keyLockProvider"
                  defaultValue={initialData.keyLockProvider}
                />
                <InputField
                  label="Lock Type"
                  name="lockType"
                  defaultValue={initialData.lockType}
                />
                <InputField
                  label="Provider Support Number"
                  name="keyLockSupportNumber"
                  defaultValue={initialData.keyLockSupportNumber}
                />
                <InputField
                  label="Key Encoder Model/Serial #"
                  name="keyEncoderModel"
                  defaultValue={initialData.keyEncoderModel}
                />
                <InputField
                  label="Key Encoder Photos (Upload)"
                  name="keyEncoderPhotos"
                  type="file"
                  accept="image/*"
                />
                <InputField
                  label="PIN pad Model"
                  name="pinPadModel"
                  defaultValue={initialData.pinPadModel}
                />
              </div>
            </div>

            {/* PBX System */}
            <div className="border border-slate-200 p-6 rounded-xl bg-slate-50/50 relative pt-8">
              <legend className="absolute -top-3 left-6 text-sm font-bold text-slate-700 px-3 bg-white border border-slate-200 rounded-lg py-1 shadow-sm uppercase tracking-wider">
                PBX Settings
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="PBX System"
                  name="pbxSystem"
                  defaultValue={initialData.pbxSystem}
                />
                <InputField
                  label="PBX Provider"
                  name="pbxProvider"
                  defaultValue={initialData.pbxProvider}
                />
                <InputField
                  label="Provider Support Number"
                  name="pbxSupportNumber"
                  defaultValue={initialData.pbxSupportNumber}
                />
              </div>
              <p className="text-xs text-red-500 mt-5 font-bold tracking-wide">
                * PLEASE DO NOT SUBMIT PASSWORDS THROUGH THIS FORM.
              </p>
            </div>
          </fieldset>

          {!isReadOnly && (
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={(e) => handleAction(e, "DRAFT")}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={(e) => handleAction(e, "SUBMIT")}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-colors"
              >
                {isSubmitting ? "Processing..." : "Submit Form"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
