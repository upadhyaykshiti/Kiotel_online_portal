
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { InputField, TextArea } from "../../components/FormControls"; // Adjust path as needed
import SignatureModal from "../../components/SignatureModal"; // Adjust path as needed
import ShellLayout from "../../../ShellLayout"; // Adjust path to ShellLayout
import { useGlobal } from "../../../GlobalContext"; // Adjust path to GlobalContext

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

const normalizeStatus = (raw) => {
  if (!raw) return "NOT STARTED";
  return String(raw).trim().toUpperCase();
};

const isLockedStatus = (status) => {
  const s = normalizeStatus(status);
  return s === "APPROVED" || s === "SUBMITTED" || s === "UNDER REVIEW";
};

const StatusBanner = ({ status, adminComments, onRequestChanges, busy }) => {
  const s = normalizeStatus(status);

  const tone = (() => {
    if (s === "APPROVED") return "green";
    if (s === "UNDER REVIEW" || s === "SUBMITTED") return "blue";
    if (s === "CHANGES REQUESTED") return "amber";
    if (s === "DRAFT") return "slate";
    return "red";
  })();

  const cls = {
    green: "bg-green-50 border-green-200 text-green-900",
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    amber: "bg-amber-50 border-amber-200 text-amber-950",
    slate: "bg-slate-50 border-slate-200 text-slate-900",
    red: "bg-red-50 border-red-200 text-red-900",
  }[tone];

  const description = (() => {
    if (s === "APPROVED") return "Your equipment data is live. You can request changes anytime.";
    if (s === "SUBMITTED") return "Your form has been submitted and is awaiting review.";
    if (s === "UNDER REVIEW") return "Our team is currently reviewing your submission.";
    if (s === "CHANGES REQUESTED") return "Changes are required before approval. Please update and resubmit.";
    if (s === "DRAFT") return "You have a saved draft. Submit when ready.";
    return "Not started. Please complete this form to support kiosk installation and unlock the portal.";
  })();

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${cls}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">
            Third Party Equipment
          </p>
          <div className="flex items-center gap-2 mt-1">
            <h2 className="text-lg font-extrabold">Status: {s}</h2>
            <span className="inline-flex items-center rounded-full border border-black/10 bg-white/60 px-2 py-0.5 text-[11px] font-bold">
              Live Tracking
            </span>
          </div>
          <p className="text-sm mt-2 opacity-90">{description}</p>
        </div>

        {s === "APPROVED" && (
          <button
            onClick={onRequestChanges}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-green-800 border border-green-300 hover:bg-green-100 transition-colors disabled:opacity-60"
          >
            {busy ? "Unlocking…" : "Request Changes"}
          </button>
        )}
      </div>

      {s === "CHANGES REQUESTED" && adminComments ? (
        <div className="mt-4 rounded-xl border border-black/10 bg-white/70 p-4 text-sm">
          <p className="font-extrabold mb-1">Admin requested changes</p>
          <p className="opacity-90">{adminComments}</p>
        </div>
      ) : null}
    </div>
  );
};

const InfoCallout = ({ title, children }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
      <p className="font-extrabold text-gray-900">{title}</p>
      <div className="mt-2 leading-relaxed text-gray-700">{children}</div>
    </div>
  );
};

export default function EquipmentFormPage() {
  const { selectedProperty } = useGlobal();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState("NOT STARTED");
  const [adminComments, setAdminComments] = useState("");
  const [initialData, setInitialData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const formRef = useRef(null);

  const locked = useMemo(() => isLockedStatus(formStatus), [formStatus]);

  useEffect(() => {
    if (!selectedProperty?.property_id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/form/equipment/me?property_id=${selectedProperty.property_id}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setFormStatus(data.status || "NOT STARTED");
        setAdminComments(data.admin_comments || "");
        setInitialData(
          data.status === "APPROVED" ? data.approved_data || {} : data.form_data || {}
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedProperty?.property_id]);

  const handleUnlockForm = async () => {
    if (!selectedProperty?.property_id) return;

    if (
      !confirm(
        "This will unlock your equipment form for editing. Your live portal data will remain the same until an admin approves your new changes. Continue?"
      )
    )
      return;

    setIsLoading(true);
    try {
      // IMPORTANT: confirm endpoint exists
      const res = await fetch(`${API_BASE_URL}/form/equipment/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ property_id: selectedProperty.property_id }),
      });

      const result = await res.json();
      if (result?.success) {
        setFormStatus(result.status || "DRAFT");
      } else {
        alert("Unable to unlock form. Please contact support.");
      }
    } catch (e) {
      alert("Error unlocking form.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitToServer = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/form/equipment`, {
        method: "POST",
        credentials: "include",
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
    if (!formRef.current) return;
    if (!selectedProperty?.property_id) return;

    // For submit: require full HTML validity
    if (type === "SUBMIT" && !formRef.current.reportValidity()) return;

    const formData = new FormData(formRef.current);
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

  return (
    <ShellLayout>
      <div className="p-6 lg:p-10 max-w-5xl mx-auto pb-10 space-y-6">
        <SignatureModal
          isOpen={isSignatureOpen}
          onClose={() => setIsSignatureOpen(false)}
          onConfirm={handleSignatureConfirm}
        />

        {!selectedProperty ? (
          <div className="p-10 text-center text-gray-600 bg-white rounded-xl shadow-sm border border-gray-200">
            Please select a property from the sidebar first.
          </div>
        ) : (
          <>
            <StatusBanner
              status={formStatus}
              adminComments={adminComments}
              onRequestChanges={handleUnlockForm}
              busy={isLoading}
            />

            {isLoading ? (
              <div className="p-10 text-center text-gray-600 bg-white rounded-2xl shadow-sm border border-gray-200">
                Loading form data for {selectedProperty.property_name}...
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                <div className="bg-gray-900 px-8 py-6 text-white">
                  <h1 className="text-2xl font-extrabold">Third-Party Equipment</h1>
                  <p className="text-sm mt-2 opacity-90">
                    {locked
                      ? "Review your submitted responses below."
                      : `Provide accurate equipment details for ${selectedProperty.property_name}.`}
                  </p>
                </div>

                <form ref={formRef} className="p-8 space-y-10">
                  <fieldset disabled={locked} className="space-y-10">
                    {/* SECTION: General Information (matches screenshot) */}
                    <div className="border border-gray-200 p-6 rounded-2xl bg-gray-50/50">
                      <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-extrabold text-gray-900">General Information</h2>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                          Required
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <InputField label="Name" name="name" defaultValue={initialData.name} required />
                        <InputField
                          label="Property Name"
                          name="propertyName"
                          defaultValue={initialData.propertyName || selectedProperty.property_name}
                          required
                        />
                      </div>

                      <div className="mt-4">
                        <TextArea label="Address" name="address" defaultValue={initialData.address} required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <InputField label="Phone" name="phone" defaultValue={initialData.phone} required />
                        <InputField label="Email" name="email" type="email" defaultValue={initialData.email} required />
                      </div>
                    </div>

                    {/* SECTION: Key Lock Provider (matches screenshot fields) */}
                    <div className="border border-gray-200 p-6 rounded-2xl bg-gray-50/50">
                      <h2 className="text-lg font-extrabold text-gray-900">Key Lock Provider</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <InputField
                          label="Key Lock Provider"
                          name="keyLockProvider"
                          defaultValue={initialData.keyLockProvider}
                          required
                        />
                        <InputField
                          label="Lock Type"
                          name="lockType"
                          defaultValue={initialData.lockType}
                          required
                        />
                        <InputField
                          label="Provider Support Number"
                          name="keyLockSupportNumber"
                          defaultValue={initialData.keyLockSupportNumber}
                          required
                        />
                        <InputField
                          label="PIN Pad Model"
                          name="pinPadModel"
                          defaultValue={initialData.pinPadModel}
                        />
                      </div>

                      <p className="text-xs text-gray-600 mt-4">
                        Tip: Use the provider’s official name (e.g., Onity, Assa Abloy, Dormakaba) so our installers can
                        confirm compatibility.
                      </p>
                    </div>

                    {/* NEW SECTION: Lock Hardware (3 images + model + sticker image) */}
                    <div className="border border-gray-200 p-6 rounded-2xl bg-gray-50/50">
                      <h2 className="text-lg font-extrabold text-gray-900">Lock Hardware (Required)</h2>

                      <InfoCallout title="Photo Requirements">
                        <ul className="list-disc ml-5 space-y-1">
                          <li>
                            Upload <span className="font-semibold">3 clear lock photos</span> (front, side, back or mounted view).
                          </li>
                          <li>
                            Upload a <span className="font-semibold">model number sticker photo</span>. The sticker text must be{" "}
                            <span className="font-semibold">clearly visible and readable</span>.
                          </li>
                        </ul>
                      </InfoCallout>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <InputField
                          label="Lock Model Number"
                          name="lockModelNumber"
                          defaultValue={initialData.lockModelNumber}
                          required
                        />
                        <InputField
                          label="Lock Model Sticker Photo (text must be clearly visible)"
                          name="lockModelStickerPhoto"
                          type="file"
                          accept="image/*"
                          required={!initialData.lockModelStickerPhoto}
                        />
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField
                          label="Lock Photo 1"
                          name="lockPhoto1"
                          type="file"
                          accept="image/*"
                          required={!initialData.lockPhoto1}
                        />
                        <InputField
                          label="Lock Photo 2"
                          name="lockPhoto2"
                          type="file"
                          accept="image/*"
                          required={!initialData.lockPhoto2}
                        />
                        <InputField
                          label="Lock Photo 3"
                          name="lockPhoto3"
                          type="file"
                          accept="image/*"
                          required={!initialData.lockPhoto3}
                        />
                      </div>
                    </div>

                    {/* SECTION: Key Encoder (matches screenshot + enhanced requirements) */}
                    <div className="border border-gray-200 p-6 rounded-2xl bg-gray-50/50">
                      <h2 className="text-lg font-extrabold text-gray-900">Key Encoder (Required)</h2>

                      <InfoCallout title="Photo Requirements">
                        <ul className="list-disc ml-5 space-y-1">
                          <li>
                            Upload <span className="font-semibold">3 clear photos of the key encoder</span>.
                          </li>
                          <li>
                            Upload a <span className="font-semibold">model number sticker photo</span>. The sticker text must be{" "}
                            <span className="font-semibold">clearly visible</span>.
                          </li>
                        </ul>
                      </InfoCallout>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <InputField
                          label="Key Encoder Model/Serial #"
                          name="keyEncoderModel"
                          defaultValue={initialData.keyEncoderModel}
                          required
                        />
                        <InputField
                          label="Key Encoder Model Sticker Photo (text must be clearly visible)"
                          name="keyEncoderModelStickerPhoto"
                          type="file"
                          accept="image/*"
                          required={!initialData.keyEncoderModelStickerPhoto}
                        />
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField
                          label="Key Encoder Photo 1"
                          name="keyEncoderPhoto1"
                          type="file"
                          accept="image/*"
                          required={!initialData.keyEncoderPhoto1}
                        />
                        <InputField
                          label="Key Encoder Photo 2"
                          name="keyEncoderPhoto2"
                          type="file"
                          accept="image/*"
                          required={!initialData.keyEncoderPhoto2}
                        />
                        <InputField
                          label="Key Encoder Photo 3"
                          name="keyEncoderPhoto3"
                          type="file"
                          accept="image/*"
                          required={!initialData.keyEncoderPhoto3}
                        />
                      </div>

                      <p className="text-xs text-red-500 mt-4 font-semibold">
                        Do not submit passwords through this form.
                      </p>
                    </div>

                    {/* SECTION: PBX (matches screenshot) */}
                    <div className="border border-gray-200 p-6 rounded-2xl bg-gray-50/50">
                      <h2 className="text-lg font-extrabold text-gray-900">PBX System</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

                      <p className="text-xs text-red-500 mt-4 font-semibold">
                        * Please do not submit passwords through this form.
                      </p>
                    </div>

                    {/* NEW SECTION: Credit Card Terminal (Kiosk) */}
                    <div className="border border-gray-200 p-6 rounded-2xl bg-gray-50/50">
                      <h2 className="text-lg font-extrabold text-gray-900">
                        Credit Card Terminal (Kiosk Setup)
                      </h2>

                      <InfoCallout title="Why we need this">
                        For kiosk installation, we need the terminal’s exact make/model and clear photos to verify mounting,
                        connectivity, and power requirements before the technician arrives.
                      </InfoCallout>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <InputField
                          label="Terminal Provider / Brand"
                          name="ccTerminalBrand"
                          defaultValue={initialData.ccTerminalBrand}
                          required
                        />
                        <InputField
                          label="Terminal Model Number"
                          name="ccTerminalModelNumber"
                          defaultValue={initialData.ccTerminalModelNumber}
                          required
                        />
                        <InputField
                          label="Terminal Serial Number"
                          name="ccTerminalSerialNumber"
                          defaultValue={initialData.ccTerminalSerialNumber}
                          required
                        />
                        <div className="flex flex-col">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Connection Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="ccTerminalConnectionType"
                            defaultValue={initialData.ccTerminalConnectionType || ""}
                            required
                            className="block w-full rounded-md border-gray-300 p-2 border bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">Select</option>
                            <option value="USB">USB</option>
                            <option value="Ethernet">Ethernet</option>
                            <option value="Wi-Fi">Wi‑Fi</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField
                          label="Terminal Photo 1"
                          name="ccTerminalPhoto1"
                          type="file"
                          accept="image/*"
                          required={!initialData.ccTerminalPhoto1}
                        />
                        <InputField
                          label="Terminal Photo 2"
                          name="ccTerminalPhoto2"
                          type="file"
                          accept="image/*"
                          required={!initialData.ccTerminalPhoto2}
                        />
                        <InputField
                          label="Terminal Photo 3"
                          name="ccTerminalPhoto3"
                          type="file"
                          accept="image/*"
                          required={!initialData.ccTerminalPhoto3}
                        />
                      </div>

                      <div className="mt-6">
                        <TextArea
                          label="Any special notes for terminal setup (optional)"
                          name="ccTerminalNotes"
                          defaultValue={initialData.ccTerminalNotes}
                        />
                      </div>

                      <p className="text-xs text-red-500 mt-4 font-semibold">
                        * Do not submit passwords, admin credentials, or sensitive payment data through this form.
                      </p>
                    </div>

                    {/* NEW SECTION: Kiosk installation requirements */}
                    <div className="border border-gray-200 p-6 rounded-2xl bg-gray-50/50">
                      <h2 className="text-lg font-extrabold text-gray-900">Kiosk Installation & Setup Requirements</h2>

                      <InfoCallout title="Required information for successful installation">
                        <ul className="list-disc ml-5 space-y-1">
                          <li>Internet connection details (wired preferred) and physical location of network drop.</li>
                          <li>Wi‑Fi SSID (if applicable) and whether signal is strong at kiosk location.</li>
                          <li>Static IP requirement (Yes/No) + VLAN details if your network uses VLANs.</li>
                          <li>Firewall/port restrictions (if any) and who can approve temporary access if needed.</li>
                          <li>Power outlet availability and distance from the kiosk location.</li>
                          <li>Mounting / placement details (countertop / wall / stand) and any site constraints.</li>
                        </ul>
                      </InfoCallout>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <TextArea
                          label="Kiosk Installation Location (describe exact spot)"
                          name="kioskInstallLocation"
                          defaultValue={initialData.kioskInstallLocation}
                          required
                        />
                        <TextArea
                          label="Network & Internet Setup Notes (no passwords)"
                          name="kioskNetworkNotes"
                          defaultValue={initialData.kioskNetworkNotes}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <InputField
                          label="On-site contact for installation (name)"
                          name="installContactName"
                          defaultValue={initialData.installContactName}
                          required
                        />
                        <InputField
                          label="On-site contact phone"
                          name="installContactPhone"
                          defaultValue={initialData.installContactPhone}
                          required
                        />
                      </div>

                      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="installAck"
                            defaultChecked={Boolean(initialData.installAck)}
                            required
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            I confirm that all uploaded sticker photos have the model/serial text{" "}
                            <span className="font-bold">clearly visible</span>, and the installation/network requirements above are accurate.
                          </span>
                        </label>
                      </div>
                    </div>
                  </fieldset>

                  {/* Action Buttons */}
                  {!locked ? (
                    <div className="flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={(e) => handleAction(e, "DRAFT")}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60"
                      >
                        Save Draft
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleAction(e, "SUBMIT")}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
                      >
                        {isSubmitting ? "Processing..." : "Submit Form"}
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 border-t border-gray-200 bg-gray-50/60">
                      <p className="text-sm text-gray-700">
                        This form is currently in{" "}
                        <span className="font-bold">{normalizeStatus(formStatus)}</span> state and is locked for editing.
                      </p>
                      {normalizeStatus(formStatus) === "APPROVED" ? (
                        <p className="text-xs text-gray-500 mt-2">
                          Use <span className="font-semibold">Request Changes</span> above to unlock editing.
                        </p>
                      ) : null}
                    </div>
                  )}
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </ShellLayout>
  );
}