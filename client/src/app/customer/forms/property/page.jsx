"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { InputField, TextArea, RadioGroup } from "../../components/FormControls"; // Adjust path as needed
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

const StatusBanner = ({ title, status, adminComments, onRequestChanges, busy }) => {
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
    if (s === "APPROVED") return "Your onboarding data is live. You can request changes anytime.";
    if (s === "SUBMITTED") return "Your form has been submitted and is awaiting review.";
    if (s === "UNDER REVIEW") return "Our team is currently reviewing your submission.";
    if (s === "CHANGES REQUESTED") return "Changes are required before approval. Please update and resubmit.";
    if (s === "DRAFT") return "You have a saved draft. Submit when ready.";
    return "Not started. Please complete the form to unlock the portal.";
  })();

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${cls}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">{title}</p>
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

export default function PropertyFormPage() {
  const { selectedProperty } = useGlobal();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localDate, setLocalDate] = useState("");
  const [formStatus, setFormStatus] = useState("NOT STARTED");
  const [initialData, setInitialData] = useState({});
  const [adminComments, setAdminComments] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const formRef = useRef(null);

  const locked = useMemo(() => isLockedStatus(formStatus), [formStatus]);

  useEffect(() => {
    setLocalDate(new Date().toLocaleDateString());

    if (!selectedProperty?.property_id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/form/property/me?property_id=${selectedProperty.property_id}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        setFormStatus(data.status || "NOT STARTED");
        setAdminComments(data.admin_comments || "");
        setInitialData(
          data.status === "APPROVED" ? data.approved_data || {} : data.form_data || {}
        );
      } catch (err) {
        console.error(err);
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
        "This will unlock your form for editing. Your live portal data will remain the same until an admin approves your new changes. Continue?"
      )
    )
      return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/form/property/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ property_id: selectedProperty.property_id }),
      });
      const result = await res.json();
      if (result.success) setFormStatus(result.status);
      else alert("Error unlocking form.");
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
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        alert(result.message);
        setFormStatus(result.status);
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
      setIsSignatureOpen(false);
    }
  };

  const handleAction = (e, type) => {
    e.preventDefault();
    if (!formRef.current) return;
    if (!selectedProperty?.property_id) return;
    if (type === "SUBMIT" && !formRef.current.reportValidity()) return;

    const formData = new FormData(formRef.current);
    formData.append("property_id", selectedProperty.property_id);

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

  return (
    <ShellLayout>
      <div className="p-6 lg:p-10 max-w-6xl mx-auto pb-10 space-y-6">
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
              title="Property Onboarding"
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
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-6 text-white">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div>
                      <h1 className="text-2xl font-extrabold">Property Onboarding Information</h1>
                      <p className="text-sm mt-2 opacity-90">
                        {locked
                          ? "Review your submitted responses below."
                          : `Please fill out the details for ${selectedProperty.property_name}.`}
                      </p>
                    </div>
                    {localDate && (
                      <div className="text-sm font-semibold bg-white/10 px-3 py-1 rounded-md border border-white/15 whitespace-nowrap">
                        Date: {localDate}
                      </div>
                    )}
                  </div>

                  {normalizeStatus(formStatus) === "CHANGES REQUESTED" && adminComments ? (
                    <div className="mt-4 bg-white/10 p-4 border border-white/15 rounded-xl text-sm">
                      <strong className="block mb-1">Admin requested changes:</strong>
                      <span className="opacity-90">{adminComments}</span>
                    </div>
                  ) : null}
                </div>

                <form ref={formRef} className="p-8 space-y-10">
                  <fieldset disabled={locked} className="space-y-10">
                    {/* SECTION 1: Hotel Information */}
                    <fieldset className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
                      <legend className="text-lg font-semibold text-gray-800 px-3 bg-white border border-gray-200 rounded-md py-1 shadow-sm">
                        Hotel Information
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        <InputField label="Hotel Name" name="hotelName" defaultValue={initialData.hotelName} required />
                        <InputField label="Hotel Phone No." name="hotelPhone" defaultValue={initialData.hotelPhone} required />
                        <InputField label="Hotel's Email" name="hotelEmail" type="email" defaultValue={initialData.hotelEmail} required />
                      </div>

                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hotel Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="addressLine1"
                          placeholder="Address Line 1"
                          defaultValue={initialData.addressLine1}
                          required
                          className="block w-full rounded-md border-gray-300 p-2 border mb-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          name="addressLine2"
                          placeholder="Address Line 2"
                          defaultValue={initialData.addressLine2}
                          className="block w-full rounded-md border-gray-300 p-2 border mb-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            name="city"
                            placeholder="City"
                            defaultValue={initialData.city}
                            required
                            className="block w-full rounded-md border-gray-300 p-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <select
                            name="state"
                            defaultValue={initialData.state}
                            required
                            className="block w-full rounded-md border-gray-300 p-2 border bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">State</option>
                            <option value="TX">TX</option>
                            <option value="CA">CA</option>
                            <option value="NY">NY</option>
                            <option value="FL">FL</option>
                          </select>
                          <input
                            type="text"
                            name="zipCode"
                            placeholder="Zip Code"
                            defaultValue={initialData.zipCode}
                            required
                            className="block w-full rounded-md border-gray-300 p-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <InputField label="Hotel Website" name="hotelWebsite" type="url" defaultValue={initialData.hotelWebsite} />
                        <InputField label="Hotel Logo (Upload)" name="hotelLogo" type="file" />
                        <InputField label="Property Type" name="propertyType" defaultValue={initialData.propertyType} required />
                        <InputField label="Total No. of Rooms" name="totalRooms" type="number" defaultValue={initialData.totalRooms} required />
                        <InputField label="Lobby Hours" name="lobbyHours" defaultValue={initialData.lobbyHours} required />
                        <RadioGroup label="Property 100% Non-Smoking" name="nonSmoking" defaultChecked={initialData.nonSmoking} required />
                        <InputField label="Property Management System Information" name="pmsInfo" defaultValue={initialData.pmsInfo} required />
                        <InputField label="Hotel WiFi Name and Password" name="wifiInfo" defaultValue={initialData.wifiInfo} required />
                      </div>
                    </fieldset>

                    {/* SECTION 2: Owner's Information */}
                    <fieldset className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
                      <legend className="text-lg font-semibold text-gray-800 px-3 bg-white border border-gray-200 rounded-md py-1 shadow-sm">
                        Owner Information
                      </legend>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Owners Name <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          <input type="text" name="ownerTitle" placeholder="Title" defaultValue={initialData.ownerTitle} required className="block w-full rounded-md border-gray-300 p-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                          <input type="text" name="ownerFirst" placeholder="First" defaultValue={initialData.ownerFirst} required className="block w-full rounded-md border-gray-300 p-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                          <input type="text" name="ownerMI" placeholder="MI" defaultValue={initialData.ownerMI} className="block w-full rounded-md border-gray-300 p-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                          <input type="text" name="ownerLast" placeholder="Last" defaultValue={initialData.ownerLast} required className="block w-full rounded-md border-gray-300 p-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                          <input type="text" name="ownerSuffix" placeholder="Suffix" defaultValue={initialData.ownerSuffix} className="block w-full rounded-md border-gray-300 p-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <InputField label="Owner's Cellphone" name="ownerCellphone" defaultValue={initialData.ownerCellphone} required />
                        <InputField label="Owner's Email" name="ownerEmail" type="email" defaultValue={initialData.ownerEmail} required />
                        <RadioGroup label="Main Point Of Contact For Daily Operations" name="mainContactDailyOps" options={["Yes", "No", "Other"]} defaultChecked={initialData.mainContactDailyOps} required />
                        <RadioGroup label="First Point Of Contact In Emergency" name="firstContactEmergency" options={["Yes", "No", "Other"]} defaultChecked={initialData.firstContactEmergency} required />
                        <RadioGroup label="Does Owner Live On-Site" name="ownerLivesOnSite" options={["Yes", "No", "Other"]} defaultChecked={initialData.ownerLivesOnSite} required />
                        <InputField label="What Role Does The Owner Play In The Day To Day Operations?" name="ownerRole" defaultValue={initialData.ownerRole} required />
                      </div>
                    </fieldset>

                    {/* SECTION 3: Amenities & Staffing */}
                    <fieldset className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
                      <legend className="text-lg font-semibold text-gray-800 px-3 bg-white border border-gray-200 rounded-md py-1 shadow-sm">
                        Amenities & Staffing
                      </legend>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                        <RadioGroup label="Pets Allowed" name="petsAllowed" defaultChecked={initialData.petsAllowed} required />
                        <RadioGroup label="Semi Truck Parking" name="semiTruckParking" defaultChecked={initialData.semiTruckParking} required />
                        <RadioGroup label="Box Truck Parking" name="boxTruckParking" defaultChecked={initialData.boxTruckParking} required />
                        <RadioGroup label="Parking Pass Required" name="parkingPassRequired" defaultChecked={initialData.parkingPassRequired} required />
                        <RadioGroup label="Breakfast" name="breakfast" defaultChecked={initialData.breakfast} required />
                        <RadioGroup label="Fitness Center" name="fitnessCenter" defaultChecked={initialData.fitnessCenter} required />
                        <RadioGroup label="Business Center" name="businessCenter" defaultChecked={initialData.businessCenter} required />
                        <RadioGroup label="Guest Laundry" name="guestLaundry" defaultChecked={initialData.guestLaundry} required />
                        <div className="flex flex-col">
                          <label className="block text-sm font-medium text-gray-700">
                            Pool <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="pool"
                            defaultValue={initialData.pool}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 p-2 border bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">Select</option>
                            <option value="Indoor">Indoor</option>
                            <option value="Outdoor">Outdoor</option>
                            <option value="None">None</option>
                          </select>
                        </div>
                        <RadioGroup label="Meeting Room" name="meetingRoom" defaultChecked={initialData.meetingRoom} required />
                        <RadioGroup label="BBQ Area" name="bbqArea" defaultChecked={initialData.bbqArea} required />
                        <RadioGroup label="General Manager" name="hasGeneralManager" defaultChecked={initialData.hasGeneralManager} required />
                        <RadioGroup label="Assistant Manager" name="hasAssistantManager" defaultChecked={initialData.hasAssistantManager} required />
                        <RadioGroup label="Maintenance Person" name="hasMaintenancePerson" defaultChecked={initialData.hasMaintenancePerson} required />
                        <RadioGroup label="Head Housekeeper" name="hasHeadHousekeeper" defaultChecked={initialData.hasHeadHousekeeper} required />
                        <RadioGroup label="Houseman" name="hasHouseman" defaultChecked={initialData.hasHouseman} required />
                        <RadioGroup label="Security Person" name="hasSecurityPerson" defaultChecked={initialData.hasSecurityPerson} required />
                        <RadioGroup label="Sundry Shop" name="sundryShop" defaultChecked={initialData.sundryShop} required />
                        <RadioGroup label="On-Site ATM" name="onSiteATM" defaultChecked={initialData.onSiteATM} required />
                        <RadioGroup label="Elevator" name="elevator" defaultChecked={initialData.elevator} required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-gray-200 pt-4">
                        <InputField label="How many initials and Signature required on Registration card?" name="registrationSignatures" defaultValue={initialData.registrationSignatures} />
                        <InputField label="Required to collect guest vehicle details at check in?" name="collectVehicleDetails" defaultValue={initialData.collectVehicleDetails} />
                        <InputField label="Where are luggage carts available?" name="luggageCartsLocation" defaultValue={initialData.luggageCartsLocation} />
                      </div>
                    </fieldset>

                    {/* SECTION 4: Contact Details & Room Specifics */}
                    <fieldset className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
                      <legend className="text-lg font-semibold text-gray-800 px-3 bg-white border border-gray-200 rounded-md py-1 shadow-sm">
                        Staff Contact & Room Specifics
                      </legend>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mb-6">
                        <InputField label="General Manager's Phone & Email" name="gmContact" defaultValue={initialData.gmContact} />
                        <InputField label="Assistant Manager's Phone & Email" name="amContact" defaultValue={initialData.amContact} />
                        <InputField label="Maintenance person/s Phone #" name="maintenanceContact" defaultValue={initialData.maintenanceContact} />
                        <InputField label="Housekeeping Head Phone #" name="hkHeadContact" defaultValue={initialData.hkHeadContact} />
                        <InputField label="Houseman Phone #" name="housemanContact" defaultValue={initialData.housemanContact} />
                        <InputField label="Security Person Phone #" name="securityContact" defaultValue={initialData.securityContact} />
                      </div>

                      <div className="space-y-6 border-t border-gray-200 pt-4">
                        <TextArea
                          label="Please list the different room type categories at the hotel along with the PMS room code."
                          name="roomTypes"
                          defaultValue={initialData.roomTypes}
                          required
                        />
                        <TextArea
                          label="List all in-room amenities. (Mention if they differ in different room types)"
                          name="inRoomAmenities"
                          defaultValue={initialData.inRoomAmenities}
                          required
                        />
                        <TextArea
                          label="Maximum occupants allowed in different room types?"
                          name="maxOccupants"
                          defaultValue={initialData.maxOccupants}
                          required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <InputField label="Please provide a Floor & Property Map" name="propertyMapFile" type="file" required={!initialData.propertyMapFile} />
                          <InputField label="Minimum age for check-in" name="minAgeCheckIn" defaultValue={initialData.minAgeCheckIn} required />
                          <InputField label="Check-in and out time?" name="checkInOutTime" defaultValue={initialData.checkInOutTime} required />
                        </div>
                      </div>
                    </fieldset>

                    {/* SECTION 5: Policies, Fees & Extras */}
                    <fieldset className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
                      <legend className="text-lg font-semibold text-gray-800 px-3 bg-white border border-gray-200 rounded-md py-1 shadow-sm">
                        Policies, Fees & Options
                      </legend>

                      <div className="space-y-6 mt-4">
                        <TextArea
                          label="How many Ice/Snack/Soda Vending Machine are at the property and where are they located?"
                          name="vendingMachines"
                          defaultValue={initialData.vendingMachines}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField label="Does the hotel hold any security deposit? If yes, how much?" name="securityDeposit" defaultValue={initialData.securityDeposit} required />
                          <InputField label="Deposit can be paid by both cash or card?" name="depositPaymentType" defaultValue={initialData.depositPaymentType} />
                          <InputField label="Smoking violation fee?" name="smokingFee" defaultValue={initialData.smokingFee} />
                          <RadioGroup label="Baby Cribs" name="babyCribs" defaultChecked={initialData.babyCribs} />
                          <RadioGroup label="Rollaway beds (mention charges if any)" name="rollawayBeds" options={["Yes", "No", "Other"]} defaultChecked={initialData.rollawayBeds} />
                          <InputField label="What Distressed traveler items are available" name="distressedTravelerItems" defaultValue={initialData.distressedTravelerItems} />
                          <InputField label="Local Guest Policy" name="localGuestPolicy" defaultValue={initialData.localGuestPolicy} />
                        </div>
                        <TextArea label="Does the Hotel follow any room allotment" name="roomAllotment" defaultValue={initialData.roomAllotment} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <InputField label="Early check-in Fee" name="earlyCheckInFee" defaultValue={initialData.earlyCheckInFee} />
                          <InputField label="Late check-out Fee" name="lateCheckOutFee" defaultValue={initialData.lateCheckOutFee} />
                          <InputField label="Hotel Peak Season" name="peakSeason" defaultValue={initialData.peakSeason} />
                          <InputField label="Cancellation policy?" name="cancellationPolicy" defaultValue={initialData.cancellationPolicy} />
                          <InputField label="Cancellation penalty?" name="cancellationPenalty" defaultValue={initialData.cancellationPenalty} />
                        </div>
                        <TextArea label="What is the Early check-out policy?" name="earlyCheckOutPolicy" defaultValue={initialData.earlyCheckOutPolicy} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField label="Base rate is for how many people?" name="baseRatePeople" defaultValue={initialData.baseRatePeople} />
                          <InputField label="Extra people charge?" name="extraPeopleCharge" defaultValue={initialData.extraPeopleCharge} />
                        </div>
                      </div>
                    </fieldset>

                    {/* SECTION 6: Rates, Audit & Daily Operations */}
                    <fieldset className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
                      <legend className="text-lg font-semibold text-gray-800 px-3 bg-white border border-gray-200 rounded-md py-1 shadow-sm">
                        Rates, Audits & Daily Operations
                      </legend>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        <InputField label="Kids stay free?" name="kidsStayFree" defaultValue={initialData.kidsStayFree} />
                        <InputField label="Any mandatory fees?" name="mandatoryFees" defaultValue={initialData.mandatoryFees} />
                        <RadioGroup label="In room safe" name="inRoomSafe" defaultChecked={initialData.inRoomSafe} />
                        <RadioGroup label="Does property offer weekly rates?" name="weeklyRates" defaultChecked={initialData.weeklyRates} />
                        <RadioGroup label="Does property offer monthly rates?" name="monthlyRates" defaultChecked={initialData.monthlyRates} />
                      </div>

                      <div className="space-y-6 mt-6">
                        <TextArea label="List the different rate codes followed at the property" name="rateCodes" defaultValue={initialData.rateCodes} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <RadioGroup label="Does the hotel have a credit card authorization form?" name="ccAuthForm" defaultChecked={initialData.ccAuthForm} required />
                          <RadioGroup label="Does the hotel have a pet policy form?" name="petPolicyForm" defaultChecked={initialData.petPolicyForm} required />
                          <InputField label="What time is the night audit run usually?" name="nightAuditTime" defaultValue={initialData.nightAuditTime} required />
                          <InputField label="Do you require specific reports to be emailed?" name="emailedReports" defaultValue={initialData.emailedReports} />
                          <InputField label="Any special instructions for night audit?" name="nightAuditInstructions" defaultValue={initialData.nightAuditInstructions} />
                          <InputField label="What to do for No show before running Audit's?" name="noShowAction" defaultValue={initialData.noShowAction} />
                          <InputField label="Who prepares the daily housekeeping list?" name="dailyHkListPreparer" defaultValue={initialData.dailyHkListPreparer} />
                          <InputField label="What is the room service frequency for a weekly guest?" name="roomServiceFreqWeekly" defaultValue={initialData.roomServiceFreqWeekly} />
                          <InputField label="What is the room service frequency for a daily guest?" name="roomServiceFreqDaily" defaultValue={initialData.roomServiceFreqDaily} />
                          <InputField label="Is the room required to be inspected after cleaning by a head housekeeper before renting?" name="roomInspectionRequired" defaultValue={initialData.roomInspectionRequired} />
                          <InputField label="How does the housekeeping report clean rooms to the front desk currently?" name="hkReportingMethod" defaultValue={initialData.hkReportingMethod} />
                        </div>
                        <TextArea label="Which items does the hotel supply in the room?" name="roomSupplies" defaultValue={initialData.roomSupplies} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField label="Which items does the hotel supply in the bathroom?" name="bathroomSupplies" defaultValue={initialData.bathroomSupplies} />
                          <InputField label="What is the volume of online reservations to walk-ins?" name="reservationVolume" defaultValue={initialData.reservationVolume} />
                          <InputField label="If the guest is walking out after we have offered them a walkout rate, should we ask you for any better rates?" name="walkoutRatesPolicy" defaultValue={initialData.walkoutRatesPolicy} />
                          <InputField label="Do we provide a Discounted rate for AAA, AARP, Military or any other? Any specific rate code?" name="discountRates" defaultValue={initialData.discountRates} />
                          <InputField label="Any specific rooms that are rented to the weekly clientele?" name="weeklyRooms" defaultValue={initialData.weeklyRooms} />
                          <InputField label="What is the flooring in rooms?" name="roomFlooring" defaultValue={initialData.roomFlooring} />
                          <InputField label="Does the hotel have a park and fly facility?" name="parkAndFly" defaultValue={initialData.parkAndFly} />
                          <InputField label="If guest requests for any utensils do we provide them?" name="utensilsProvided" defaultValue={initialData.utensilsProvided} />
                          <InputField label="If a guest requests for an extra housekeeping service in room do we provide and if we what are the charges for it?" name="extraHkCharges" defaultValue={initialData.extraHkCharges} />
                          <InputField label="Reconciliation is done on a monthly or daily basis at the hotel?" name="reconciliationFreq" defaultValue={initialData.reconciliationFreq} />
                        </div>
                      </div>
                    </fieldset>

                    {/* SECTION 7: Guest Experience & Third Party */}
                    <fieldset className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
                      <legend className="text-lg font-semibold text-gray-800 px-3 bg-white border border-gray-200 rounded-md py-1 shadow-sm">
                        Guest Experience & Workflow
                      </legend>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <InputField label="What is the extension procedure? (For third parties)" name="extensionProcedure" defaultValue={initialData.extensionProcedure} />
                        <InputField label="What are the Housekeeping Working Hours?" name="hkWorkingHours" defaultValue={initialData.hkWorkingHours} />
                        <InputField label="What are the maintenance working hours?" name="maintenanceWorkingHours" defaultValue={initialData.maintenanceWorkingHours} />
                        <InputField label="Is there a time of the day when there is no other hotel staff available apart from front desk?" name="staffAvailability" defaultValue={initialData.staffAvailability} />
                        <InputField label="Does the hotel accept third party credit card authorisation forms?" name="acceptThirdPartyCC" defaultValue={initialData.acceptThirdPartyCC} />
                        <InputField label="Does the hotel pre-authorize the arrivals?" name="preAuthArrivals" defaultValue={initialData.preAuthArrivals} />
                        <InputField label="Does the hotel accept CLC?" name="acceptCLC" defaultValue={initialData.acceptCLC} />
                        <InputField label="Does the hotel have rooms with a balcony?" name="roomsWithBalcony" defaultValue={initialData.roomsWithBalcony} />
                        <InputField label="Any DNR list that you follow? Please share with us." name="dnrList" defaultValue={initialData.dnrList} />
                        <InputField label="What companies book regularly at the hotel?" name="regularCompanies" defaultValue={initialData.regularCompanies} />
                      </div>

                      <div className="space-y-6 mt-6">
                        <InputField
                          label="Are there any local attractions, restaurants, or activities you would like to recommend to guests?"
                          name="localAttractions"
                          defaultValue={initialData.localAttractions}
                        />
                        <InputField
                          label="If the hotel has on-site dining, provide details about the restaurant(s), their hours, and cuisine."
                          name="onSiteDining"
                          defaultValue={initialData.onSiteDining}
                        />
                        <InputField
                          label="How does the hotel handle lost and found items, and how can guests inquire about lost belongings?"
                          name="lostAndFound"
                          defaultValue={initialData.lostAndFound}
                        />
                      </div>
                    </fieldset>

                    {/* SECTION 8: Final Tech Providers & Wrap-up */}
                    <fieldset className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
                      <legend className="text-lg font-semibold text-gray-800 px-3 bg-white border border-gray-200 rounded-md py-1 shadow-sm">
                        Tech Providers & Final Details
                      </legend>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <InputField label="Internet Provider and their Tech Support Number" name="internetProviderInfo" defaultValue={initialData.internetProviderInfo} required />
                        <InputField label="PBX Provider" name="pbxProvider" defaultValue={initialData.pbxProvider} required />
                        <InputField label="Key Lock Provider (Do they provide computer software)" name="keyLockProvider" defaultValue={initialData.keyLockProvider} required />
                        <InputField label="What is the tax rate at the hotel location?" name="taxRate" defaultValue={initialData.taxRate} required />
                      </div>

                      <div className="space-y-6 mt-6">
                        <InputField label="Preferred Kiosk Service Hours: Please specify shift timings." name="kioskServiceHours" defaultValue={initialData.kioskServiceHours} required />
                        <InputField label="Do you accept cash app, gift cards, google pay or any other payment form?" name="alternativePayments" defaultValue={initialData.alternativePayments} required />
                        <RadioGroup label="Do you have a secondary phone line at the front desk?" name="secondaryPhoneLine" defaultChecked={initialData.secondaryPhoneLine} required />
                        <TextArea label="PLEASE LIST ANY ADDITIONAL INFORMATION WE MIGHT HAVE MISSED" name="additionalInformation" defaultValue={initialData.additionalInformation} rows="4" />
                      </div>
                    </fieldset>
                  </fieldset>

                  {/* Form Actions / Buttons */}
                  {!locked ? (
                    <div className="flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 sticky bottom-0 bg-white py-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-10 px-4 rounded-b-2xl">
                      <span className="text-xs text-gray-500 mr-auto hidden md:block">
                        All fields marked with <span className="text-red-500">*</span> are required to submit for review.
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleAction(e, "DRAFT")}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-60"
                      >
                        Save Draft
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleAction(e, "SUBMIT")}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#cc4a24] hover:bg-[#a83d1e] transition-colors disabled:opacity-60"
                      >
                        {isSubmitting ? "Processing..." : "Submit to Admin Review"}
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