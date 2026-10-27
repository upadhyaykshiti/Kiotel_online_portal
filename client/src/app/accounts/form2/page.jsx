
"use client";
import ProtectedRoute from "@/context/ProtectedRoute";
import React, { useState, useEffect } from "react";
import axios from "axios";

const PropertyOnboardingForm = () => {
  const [formData, setFormData] = useState({
    hotelName: "",
    hotelPhone: "",
    hotelEmail: "",
    hotelAddressLine1: "",
    hotelAddressLine2: "",
    hotelCity: "",
    hotelState: 1,
    hotelZipCode: "",
    hotelWebsite: "",
    hotelLogo: null,
    propertyType: 1,
    totalRooms: '',
    lobbyHours: "",
    nonSmoking: "",
    propertyManagementSystemInformation: "",
    hotelWifiNameAndPassword: "",
    ownerNameTitle: "",
    ownerNameFirst: "",
    ownerNameMiddle: "",
    ownerNameLast: "",
    ownerNameSuffix: "",
    ownerCellPhone: "",
    ownerEmail: "",
    contactDailyOps: "",
    emergencyContact: "",
    ownerOnSite: "",
    roleInOperations: "",
    petsAllowed: "",
    semiTruckParking: "",
    boxTruckParking: "",
    parkingPassRequired: "",
    breakfastIncluded: "",
    fitnessCenter: "",
    businessCenter: "",
    guestLaundry: "",
    poolAvailable: 1,
    meetingRoomAvailable: "",
    bBQareaAvailable: "",
    generalManagerAvailable: "",
    assistantManagerAvailable: "",
    maintanancePersonAvailable: "",
    HeadHouseKeeperAvailable: "",
    HousemanAvailable: "",
    securityPersonAvailable: "",
    sunDryShopAvailable: "",
    onSiteATMAvailable: "",
    ElevatorAvailable: "",
    ElevatorDirection: "",
    numberofSign: "",
    guestVehicleData: "",
    luggageCartAvailable: "",
    generalManagerPhone: "",
    assistantManagerPhone: "",
    maintanancePersonPhone: "",
    houseKeepingHeadPhone: "",
    housemanPhone: "",
    securityPersonPhone: "",
    roomCatagory: "",
    roomAmmunities: "",
    maxRoomOccupants: "",
    floorMap: null,
    minAge: "",
    inOutTime: "",
    vendingLocation: "",
    securityDeposit: "",
    depCashCart: "",
    smokingVoilationfee: "",
    babyCribs: "",
    rollawayBeds: "",
    distressedTravelItem: "",
    localGuestPolicy: "",
    hotelroomAllotment: "",
    earlyCheckIn: "",
    earlyCheckInPolicy: "",
    latecheckout: "",
    peakSeason: "",
    cancellationPolicy: "",
    cancellationPenalty: "",
    earlyCheckoutPolicy: "",
    baserate: "",
    extraPeopleCharge: "",
    kidsStayfee: "",
    anyMandatoryfee: "",
    inRoomSafe: "",
    weeklyRates: "",
    montlyRates: "",
    codesType: "",
    craditcardAuthform: "",
    petPolicy: "",
    nightAuditTime: "",
    speceficRepots: "",
    instructionNightAudit: "",
    noShowBeforeNightAudit: "",
    dailyHousekeepingList: "",
    roomServiceFrequencyforWeekly: "",
    roomServiceFrequencyforDaily: "",
    inspectionRequired: "",
    housekeepingReport: "",
    itemsHotelSupplyinRoom: "",
    itemsHotelSupplyinBathRoom: "",
    volumeOfOnlineReservationinwalkIn: "",
    walkoutrate: "",
    discountFor: "",
    specialRoom: "",
    roomFlooring: "",
    parkandFlyFacilities: "",
    utensilsRequired: "",
    extrahouseKeepingCharge: "",
    montlyordailyReconcilination: "",
    extentinProcedures: "",
    housekeepingworkHours: "",
    maintananceworkHours: "",
    timeforNostaff: "",
    thirdpartycc: "",
    preauthorizeArrival: "",
    acceptclc: "",
    roomswithBalcony: "",
    DNRlist: "",
    regularCompany: "",
    recomendationtoGuest: "",
    onSiterecomendationtoGuest: "",
    lostandfound: "",
    internetProvider: "",
    pbxProvider: "",
    KeyLockProvider: "",
    taxRate: "",
    kioskTimming: "",
    giftCardd: "",
    secondryPhoneLine: "",
    additionalInformation: "",
  });

  const [currentDate, setCurrentDate] = useState('');
  const [errors, setErrors] = useState({});

  // const validateForm = () => {
  //   let formErrors = {};

  //   if (!formData.hotelName) {
  //     formErrors.hotelName = 'Hotel Name is required.';
  //   }

  //   if (!formData.hotelPhone) {
  //     formErrors.hotelPhone = 'Hotel Phone No. is required.';
  //   }

  //   if (!formData.hotelEmail) {
  //     formErrors.hotelEmail = 'Hotel Email is required.';
  //   }

  //   if (!formData.hotelAddressLine1) {
  //     formErrors.hotelAddressLine1 = 'Hotel Address is required.';
  //   }
  //   if (!formData.hotelCity) {
  //     formErrors.hotelCity = 'Hotel City is required.';
  //   }
  //   if (!formData.hotelState) {
  //     formErrors.hotelState = 'Hotel State is required.';
  //   }
  //   if (!formData.hotelZipCode) {
  //     formErrors.hotelZipCode = 'Hotel Zip Code is required.';
  //   }
  //   if (!formData.totalRooms) {
  //     formErrors.totalRooms = 'Total No. of rooms are required.';
  //   }
  //   if (!formData.lobbyHours) {
  //     formErrors.lobbyHours = 'Lobby Hours are required.';
  //   }
  //   if (!formData.pmsName) {
  //     formErrors.pmsName = 'Property Management System (PMS) is required.';
  //   }
  //   if (!formData.wifiInfo) {
  //     formErrors.wifiInfo = 'Hotel Wifi Name and Password is required.';
  //   }
  //   if (!formData.ownerNameFirst) {
  //     formErrors.ownerNameFirst = 'First Name is required.';
  //   }
  //   if (!formData.ownerNameLast) {
  //     formErrors.ownerNameLast = 'Last Name is required.';
  //   }
  //   if (!formData.ownerCellPhone) {
  //     formErrors.ownerCellPhone = 'Cell Phone is required.';
  //   }
  //   if (!formData.ownerEmail) {
  //     formErrors.ownerEmail = 'Owner Email is required.';
  //   }
  //   if (!formData.ownerRole) {
  //     formErrors.ownerRole = 'Owner Role is required.';
  //   }
  //   if (!formData.roomCatagory) {
  //     formErrors.roomCatagory = 'Room categories are required.';
  //   }
  //   if (!formData.roomAmmunities) {
  //     formErrors.roomAmmunities = 'Room amenities are required.';
  //   }
  //   if (!formData.maxRoomOccupants) {
  //     formErrors.maxRoomOccupants = 'Maximum room occupants are required.';
  //   }
  //   if (!formData.floorMap) {
  //     formErrors.floorMap = 'Floor Map is required.';
  //   }

  //   setErrors(formErrors);
  //   return Object.keys(formErrors).length === 0;
  // };

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString();
    setCurrentDate(formattedDate);
  }, []);

  // const handleChange = (e) => {
  //   const { name, value, type, files } = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: type === "file" ? files[0] : value,
  //   });
  // };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : (type === "radio" ? (value === "true") : value),
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // if (validateForm()) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/submit`,
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          body: JSON.stringify(formData),
        });
  
        if (!response.ok) {
          // Capture more information from the response object
          // const errorText = await response.text();  // Capture any error message returned by the server
          throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
          // throw new Error(`Request failed with status ${response.status}: ${response.statusText}. Details: ${errorText}`);
        }
  
        const result = await response.json();
        console.log("Success:", result);
      } catch (error) {
        // Log the actual error details for debugging
        console.error("Error submitting form:", error.message || error);
      }
    // } else {
    //   console.log('Validation failed:', errors);
    // }
  };
// 
  return(
    <form className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-8">Property Onboarding Information For Kiotel Kiosk</h2>
      {/* Logo */}
      <div className="text-center mb-6">
        <img src="/kiotel logo.jpg" alt="Kiotel Logo" className="mx-auto" style={{ width: '150px' }} />
      </div>

{/* Date */}
<div className="text-left text-sm text-gray-500 mb-4">Date Submitted: {currentDate}</div>

      {/* Hotel Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700">Hotel Name<span className="text-red-500">*</span></label>
      <input
        type="text"
        name="hotelName"
        value={formData.hotelName}
        onChange={handleChange}
        className={`mt-1 block w-full p-2 border  ${errors.hotelName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-indigo-500 focus:border-indigo-500`}
        // className="mt-2 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Hotel Name"

        
      />
       {errors.hotelName && <div className="text-red-500">{errors.hotelName}</div>}
    </div>
    
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700">Hotel Phone No.<span className="text-red-500">*</span></label>
      <input
        type="text"
        name="hotelPhone"
        value={formData.hotelPhone}
        onChange={handleChange}
        className={`mt-1 block w-full p-2 border  ${errors.hotelPhone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-indigo-500 focus:border-indigo-500`}

        // className={`mt-1 block w-full p-2 border${errors.hotelName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500`}
        placeholder="Hotel Phone"
      />
       {errors.hotelPhone && <div className="text-red-500">{errors.hotelPhone}</div>}

    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700">Hotels Email<span className="text-red-500">*</span></label>
      <input
        type="email"
        name="hotelEmail"
        value={formData.hotelEmail}
        onChange={handleChange}
        className={`mt-2 p-3 border border-gray-300 ${errors.hotelEmail ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500`}
        placeholder="Hotel Email"
      />
       {errors.hotelEmail && <div className="text-red-500">{errors.hotelEmail}</div>}

    </div>

    <div className="flex flex-col md:col-span-2">
      <label className="text-sm font-medium text-gray-700">Hotel Address Line 1<span className="text-red-500">*</span></label>
      <input
        type="text"
        name="hotelAddressLine1"
        value={formData.hotelAddressLine1}
        onChange={handleChange}
        className={`mt-2 p-3 border border-gray-300 ${errors.hotelAddressLine1 ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500`}
        // className="mt-2 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Hotel Address Line 1"
      />
       {errors.hotelAddressLine1 && <div className="text-red-500">{errors.hotelAddressLine1}</div>}

    </div>

    <div className="flex flex-col md:col-span-2">
      <label className="text-sm font-medium text-gray-700">Hotel Address Line 2</label>
      <input
        type="text"
        name="hotelAddressLine2"
        value={formData.hotelAddressLine2}
        onChange={handleChange}
        className="mt-2 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Hotel Address Line 2"
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700">Hotel City<span className="text-red-500">*</span></label>
      <input
        type="text"
        name="hotelCity"
        value={formData.hotelCity}
        onChange={handleChange}
        className={`mt-2 p-3 border border-gray-300 ${errors.hotelCity ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500`}

        // className="mt-2 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Hotel City"
      />
             {errors.hotelCity && <div className="text-red-500">{errors.hotelCity}</div>}
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700">Hotel State<span className="text-red-500">*</span></label>
      <input
        type="text"
        name="hotelState"
        value={formData.hotelState}
        onChange={handleChange}
        className={`mt-2 p-3 border border-gray-300 ${errors.hotelState ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500`}
        // className="mt-2 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Hotel State"
      />
             {errors.hotelState && <div className="text-red-500">{errors.hotelState}</div>}
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700">Hotel Zip Code<span className="text-red-500">*</span></label>
      <input
        type="text"
        name="hotelZipCode"
        value={formData.hotelZipCode}
        onChange={handleChange}
        className={`mt-2 p-3 border border-gray-300 ${errors.hotelZipCode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500`}
        // className="mt-2 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Hotel Zip Code"
      />
             {errors.hotelZipCode && <div className="text-red-500">{errors.hotelZipCode}</div>}
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700">Hotel Website<span className="text-red-500"></span></label>
      <input
        type="text"
        name="hotelWebsite"
        value={formData.hotelWebsite}
        onChange={handleChange}
        className="mt-2 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Hotel Website"
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700">Hotel Logo<span className="text-red-500"></span></label>
      <input
        type="file"
        name="hotelLogo"
        onChange={handleChange}
        className="mt-2 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700">Property Type<span className="text-red-500">*</span></label>
    <input
      type="text"
      name="propertyType"
      value={formData.propertyType}
      onChange={handleChange}
      className="mt-2 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500"
      placeholder="Property Type"
    />
  </div>

  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700">Total No. of Rooms<span className="text-red-500">*</span></label>
    <input
      type="text"
      name="totalRooms"
      value={formData.totalRooms}
      onChange={handleChange}
      className={`mt-2 p-3 border border-gray-300 ${errors.totalRooms ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500`}
      // className="mt-2 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500"
      placeholder="Total Rooms"
    />
             {errors.totalRooms && <div className="text-red-500">{errors.totalRooms}</div>}
  </div>

  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700">Lobby Hours<span className="text-red-500">*</span></label>
    <input
      type="text"
      name="lobbyHours"
      value={formData.lobbyHours}
      onChange={handleChange}
      className={`mt-2 p-3 border border-gray-300 ${errors.lobbyHours ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500`}
      placeholder="Lobby Hours"
    />             {errors.lobbyHours && <div className="text-red-500">{errors.lobbyHours}</div>}
  </div>

  <div>
  <label className="block mb-2 font-medium">
    Property 100% Non-Smoking<span className="text-red-500">*</span>
  </label>
  
  <div className="flex space-x-4">
  <label>
    <input
      type="radio"
      name="nonSmoking"
      value={true} // Directly set to boolean
      checked={formData.nonSmoking === true} // Check against boolean
      onChange={handleChange}
      className="mr-2"
    />
    Yes
  </label>
  <label>
    <input
      type="radio"
      name="nonSmoking"
      value={false} // Directly set to boolean
      checked={formData.nonSmoking === false} // Check against boolean
      onChange={handleChange}
      className="mr-2"
    />
    No
  </label>
</div>
</div>

  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700">
      Property Management System (PMS)<span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      name="pmsName"
      value={formData.pmsName}
      onChange={handleChange}
      className={`mt-2 p-3 border border-gray-300 ${errors.pmsName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500`}
      placeholder="PMS Name"
    />
    {errors.pmsName && <div className="text-red-500">{errors.pmsName}</div>}
  </div>

  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700">
      Hotel Wifi Name and Password<span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      name="wifiInfo"
      value={formData.wifiInfo}
      onChange={handleChange}
      className={`mt-2 p-3 border border-gray-300 ${errors.wifiInfo ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring focus:ring-indigo-500 focus:border-indigo-500`}
      placeholder="Wifi Name and Password"
    />
        {errors.wifiInfo && <div className="text-red-500">{errors.wifiInfo}</div>}
  </div>
</div>


      {/* Owner Information */}
      <h3 className="text-xl font-bold mb-4">Owner Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

<div>
<label className="block mb-2 text-sm font-medium">Owner Name<span className="text-red-500">*</span></label>
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div>
      <input
        type="text"
        name="Title"
        value={formData.ownerTitle}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Title"
      />
    </div>
    <div>
      <input
        type="text"
        name="ownerNameFirst"
        value={formData.ownerNameFirst}
        onChange={handleChange}
        className={`w-full p-2 border rounded ${errors.ownerNameFirst ? 'border-red-500' : 'border-gray-300'}`}
        placeholder="First"
      />
          {errors.ownerNameFirst && <div className="text-red-500">{errors.ownerNameFirst}</div>}

    </div>
    <div>
      <input
        type="text"
        name="MI"
        value={formData.ownerMiddleInitial}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="MI"
      />
    </div>
    <div>
      <input
        type="text"
        name="ownerNameLast"
        value={formData.ownerNameLast}
        onChange={handleChange}
        className={`w-full p-2 border rounded ${errors.ownerNameLast ? 'border-red-500' : 'border-gray-300'}`}
        placeholder="Last"
      />
      {errors.ownerNameLast && <div className="text-red-500">{errors.ownerNameLast}</div>}
    </div>
    <div>
      <input
        type="text"
        name="Suffix"
        value={formData.ownerSuffix}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Suffix"
      />
    </div>
  </div>
  </div>
        {/* </div> */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"> */}
  <div>
    <label className="block mb-2 text-sm font-medium">Owner Cellphone<span className="text-red-500">*</span></label>
    <input
      type="text"
      name="ownerCellPhone"
      value={formData.ownerCellPhone}
      onChange={handleChange}
      className={`w-full p-2 border rounded ${errors.ownerCellPhone ? 'border-red-500' : 'border-gray-300'}`}
      placeholder="Owner Cell Phone"
    />
    {errors.ownerCellPhone && <div className="text-red-500">{errors.ownerCellPhone}</div>}
  </div>

  <div>
    <label className="block mb-2 text-sm font-medium">Owner Email<span className="text-red-500">*</span></label>
    <input
      type="text"
      name="ownerEmail"
      value={formData.ownerEmail}
      onChange={handleChange}
      className={`w-full p-2 border rounded ${errors.ownerEmail ? 'border-red-500' : 'border-gray-300'}`}
      placeholder="Owner Email"
    />
    {errors.ownerEmail && <div className="text-red-500">{errors.ownerEmail}</div>}
  </div>



<div>
    <label className="block mb-2 text-sm font-medium">
      Main Point of Contact for Daily Operation<span className="text-red-500">*</span>
    </label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="contactDailyOps"
          value={true}
          checked={formData.contactDailyOps === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="contactDailyOps"
          value={false}
          checked={formData.contactDailyOps === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>


    <div>
    <label className="block mb-2 text-sm font-medium">
      Main Point of Contact for Daily Operation<span className="text-red-500">*</span>
    </label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="emergencyContact"
          value={true}
          checked={formData.emergencyContact === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="emergencyContact"
          value={false}
          checked={formData.emergencyContact === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 text-sm font-medium">
    Does Owner Live On-Site?<span className="text-red-500">*</span>
    </label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="ownerOnSite"
          value={true}
          checked={formData.ownerOnSite === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="ownerOnSite"
          value={false}
          checked={formData.ownerOnSite === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 text-sm font-medium">
      What Role Does The Owner Play In Day-to-Day Operations?<span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      name="ownerRole"
      value={formData.ownerRole} // updated to match the correct field name
      onChange={handleChange}
      className={`w-full p-2 border rounded ${errors.ownerRole ? 'border-red-500' : 'border-gray-300'} `}
      placeholder=""
    />
    {errors.ownerRole && <div className="text-red-500">{errors.ownerRole}</div>}
  </div>
{/* </div> */}

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div>
    <label className="block mb-2 font-semibold">Pets Allowed<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="petsAllowed"
          value={true}
          checked={formData.petsAllowed === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="petsAllowed"
          value={false}
          checked={formData.petsAllowed === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Semi Truck Parking<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="semiTruckParking"
          value={true}
          checked={formData.semiTruckParking === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="semiTruckParking"
          value={false}
          checked={formData.semiTruckParking === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Box Truck Parking<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="boxTruckParking"
          value={true}
          checked={formData.boxTruckParking === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="boxTruckParking"
          value={false}
          checked={formData.boxTruckParking === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Parking Pass Required<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="parkingPassRequired"
          value={true}
          checked={formData.parkingPassRequired === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="parkingPassRequired"
          value={false}
          checked={formData.parkingPassRequired === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Breakfast Included<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="breakfastIncluded"
          value={true}
          checked={formData.breakfastIncluded === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="breakfastIncluded"
          value={false}
          checked={formData.breakfastIncluded === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Fitness Center<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="fitnessCenter"
          value={true}
          checked={formData.fitnessCenter === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="fitnessCenter"
          value={false}
          checked={formData.fitnessCenter === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Business Center<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="businessCenter"
          value={true}
          checked={formData.businessCenter === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="businessCenter"
          value={false}
          checked={formData.businessCenter === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Guest Laundry<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="guestLaundry"
          value={true}
          checked={formData.guestLaundry === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="guestLaundry"
          value={false}
          checked={formData.guestLaundry === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Pool<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="poolAvailable"
          value={true}
          checked={formData.poolAvailable === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="poolAvailable"
          value={false}
          checked={formData.poolAvailable === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Meeting Room Available<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="meetingRoomAvailable"
          value={true}
          checked={formData.meetingRoomAvailable === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="meetingRoomAvailable"
          value={false}
          checked={formData.meetingRoomAvailable === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">BBQ Area Available<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="bBQareaAvailable"
          value={true}
          checked={formData.bBQareaAvailable === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="bBQareaAvailable"
          value={false}
          checked={formData.bBQareaAvailable === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">General Manager Available<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="generalManagerAvailable"
          value={true}
          checked={formData.generalManagerAvailable === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="generalManagerAvailable"
          value={false}
          checked={formData.generalManagerAvailable === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Assistant Manager Available<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="assistantManagerAvailable"
          value={true}
          checked={formData.assistantManagerAvailable === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="assistantManagerAvailable"
          value={false}
          checked={formData.assistantManagerAvailable === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Maintenance Person<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="maintanancePersonAvailable"
          value={true}
          checked={formData.maintanancePersonAvailable === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="maintanancePersonAvailable"
          value={false}
          checked={formData.maintanancePersonAvailable === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Head Housekeeper<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="HeadHouseKeeperAvailable"
          value={true}
          checked={formData.HeadHouseKeeperAvailable === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="HeadHouseKeeperAvailable"
          value={false}
          checked={formData.HeadHouseKeeperAvailable === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Houseman Available<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="HousemanAvailable"
          value={true}
          checked={formData.HousemanAvailable === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="HousemanAvailable"
          value={false}
          checked={formData.HousemanAvailable === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Security Person Available<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="securityPersonAvailable"
          value={true}
          checked={formData.securityPersonAvailable === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="securityPersonAvailable"
          value={false}
          checked={formData.securityPersonAvailable === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">SunDry Shop Available<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="sunDryShopAvailable"
          value={true}
          checked={formData.sunDryShopAvailable === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="sunDryShopAvailable"
          value={false}
          checked={formData.sunDryShopAvailable === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">On-Site ATM Available<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="onSiteATMAvailable"
          value={true}
          checked={formData.onSiteATMAvailable === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="onSiteATMAvailable"
          value={false}
          checked={formData.onSiteATMAvailable === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>

  <div>
    <label className="block mb-2 font-semibold">Elevator Available<span className="text-red-500">*</span></label>
    <div className="flex space-x-4">
      <label>
        <input
          type="radio"
          name="ElevatorAvailable"
          value={true}
          checked={formData.ElevatorAvailable === true}
          onChange={handleChange}
          className="mr-2"
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name="ElevatorAvailable"
          value={false}
          checked={formData.ElevatorAvailable === false}
          onChange={handleChange}
          className="mr-2"
        />
        No
      </label>
    </div>
  </div>
</div>


      {/* </div> */}

      {/* Additional Fields */}
      {/* <h3 className="text-xl font-bold mb-4">Additional Information</h3> */}

      {/* Room and Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-2 font-semibold">
            How many initials and Signature required on Registration card?<span className="text-red-500"></span>
          </label>
          <input
            type="number"
            name="numberofSign"
            value={formData.numberofSign}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.numberofSign ? 'border-red-500' : 'border-gray-300'}`}
            placeholder=""
          />
          {errors.numberofSign && <div className="text-red-500">{errors.numberofSign}</div>}
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Required to collect guest vehicle details at check in?<span className="text-red-500"></span>
          </label>
          <input
            type="text"
            name="guestVehicleData"
            value={formData.guestVehicleData}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.guestVehicleData ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Guest Vehicle Data"
          />
          {errors.guestVehicleData && <div className="text-red-500">{errors.guestVehicleData}</div>}
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Where are luggage carts available?<span className="text-red-500"></span>
          </label>
          <input
            type="text"
            name="luggageCartAvailable"
            value={formData.luggageCartAvailable}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Luggage Cart Availability"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            General Manager Phone & Email<span className="text-red-500"></span>
          </label>
          <input
            type="text"
            name="generalManagerPhone"
            value={formData.generalManagerPhone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Assistant Manager Phone & Email<span className="text-red-500"></span>
          </label>
          <input
            type="text"
            name="assistantManagerPhone"
            value={formData.assistantManagerPhone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Maintenance person/​s Phone #<span className="text-red-500"></span>
          </label>
          <input
            type="text"
            name="maintanancePersonPhone"
            value={formData.maintanancePersonPhone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Maintenance Person Phone"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Housekeeping Head Phone #<span className="text-red-500"></span>
          </label>
          <input
            type="text"
            name="houseKeepingHeadPhone"
            value={formData.houseKeepingHeadPhone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Housekeeping Head Phone"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Houseman Phone #<span className="text-red-500"></span></label>
          <input
            type="text"
            name="housemanPhone"
            value={formData.housemanPhone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Houseman Phone"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Security Person Phone #<span className="text-red-500"></span>
          </label>
          <input
            type="text"
            name="securityPersonPhone"
            value={formData.securityPersonPhone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Security Person Phone"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2 font-semibold">
          Please list the different room type categories at the hotel along with
          the PMS room code.
        </label>
        <textarea
          type="text"
          name="roomCatagory"
          value={formData.roomCatagory}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.roomCatagory ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Room Category"
        />
        {errors.roomCatagory && <div className="text-red-500">{errors.roomCatagory}</div>}
      </div>

      <div>
        <label className="block mb-2 font-semibold">
          List all in-room amenities. (Mention if they differ in different room
          types)
        </label>
        <textarea
          type="text"
          name="roomAmmunities"
          value={formData.roomAmmunities}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.roomAmmunities ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Room Amenities"
        />
        {errors.roomAmmunities && <div className="text-red-500">{errors.roomAmmunities}</div>}
      </div>

      <div>
        <label className="block mb-2 font-semibold">
          Maximum occupants allowed in different room types?
        </label>
        <input
          type="number"
          name="maxRoomOccupants"
          value={formData.maxRoomOccupants}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.maxRoomOccupants ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Max Room Occupants"
        />
        {errors.maxRoomOccupants && <div className="text-red-500">{errors.maxRoomOccupants}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-2 font-semibold">
            Please provide a Floor & Property Map.
          </label>
          <input
            type="file"
            name="floorMap"
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.floorMap ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.floorMap && <div className="text-red-500">{errors.floorMap}</div>}
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Minimum age for check-in
          </label>
          <input
            type="number"
            name="minAge"
            value={formData.minAge}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Check-In/Check-Out Time
          </label>
          <input
            type="text"
            name="inOutTime"
            value={formData.inOutTime}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Check-In/Check-Out Time"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2 font-semibold">
          How many Ice/​Snack/​Soda Vending Machine are at the property and
          where are they located?
        </label>
        <input
          type="text"
          name="vendingLocation"
          value={formData.vendingLocation}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Vending Machine Location"
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold">
          Does the hotel hold any security deposit? If yes, how much?
        </label>
        <input
          type="text"
          name="securityDeposit"
          value={formData.securityDeposit}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Security Deposit Amount"
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold">
          Deposit for Cash or Credit
        </label>
        <input
          type="text"
          name="depCashCart"
          value={formData.depCashCart}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Deposit (Cash/Card)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-2 font-semibold">
            Smoking Violation Fee
          </label>
          <input
            type="text"
            name="smokingVoilationfee"
            value={formData.smokingVoilationfee}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Smoking Violation Fee"
          />
        </div>

        <div>
  <label className="block mb-2 font-semibold">Baby Cribs</label>
  <div className="flex space-x-4">
    <label>
      <input
        type="radio"
        name="babyCribs"
        value={true}
        checked={formData.babyCribs === true}
        onChange={handleChange}
        className="mr-2"
      />
      Yes
    </label>
    <label>
      <input
        type="radio"
        name="babyCribs"
        value={false}
        checked={formData.babyCribs === false}
        onChange={handleChange}
        className="mr-2"
      />
      No
    </label>
  </div>
</div>

<div>
  <label className="block mb-2 font-semibold">Rollaway Beds</label>
  <div className="flex space-x-4">
    <label>
      <input
        type="radio"
        name="rollawayBeds"
        value={true}
        checked={formData.rollawayBeds === true}
        onChange={handleChange}
        className="mr-2"
      />
      Yes
    </label>
    <label>
      <input
        type="radio"
        name="rollawayBeds"
        value={false}
        checked={formData.rollawayBeds === false}
        onChange={handleChange}
        className="mr-2"
      />
      No
    </label>
  </div>
</div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-2 font-semibold">
            What Distressed traveler items are available
          </label>
          <input
            type="text"
            name="distressedTravelItem"
            value={formData.distressedTravelItem}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Local Guest Policy</label>
          <input
            type="text"
            name="localGuestPolicy"
            value={formData.localGuestPolicy}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Does the Hotel follow any room allotment
          </label>
          <input
            type="text"
            name="hotelroomAllotment"
            value={formData.hotelroomAllotment}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Early check-in Fee</label>
          <input
            type="text"
            name="earlyCheckIn"
            value={formData.earlyCheckIn}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Late check-out Fee</label>
          <input
            type="text"
            name="latecheckout"
            value={formData.latecheckout}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Hotel Peak Season</label>
          <input
            type="text"
            name="peakSeason"
            value={formData.peakSeason}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Peak Season Dates"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Cancellation policy?
          </label>
          <textarea
            name="cancellationPolicy"
            value={formData.cancellationPolicy}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Cancellation Policy"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Cancellation Penalty?
          </label>
          <input
            type="text"
            name="cancellationPenalty"
            value={formData.cancellationPenalty}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Cancellation Penalty"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            What is the Early check-out policy?
          </label>
          <input
            type="text"
            name="earlyCheckInPolicy"
            value={formData.earlyCheckInPolicy}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Base rate is for how many people?
          </label>
          <input
            type="text"
            name="baserate"
            value={formData.baserate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Base Rate"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Extra people charge?
          </label>
          <input
            type="text"
            name="extraPeopleCharge"
            value={formData.extraPeopleCharge}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Extra Charge for Additional Guests"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Kids stay free?</label>
          <input
            type="text"
            name="kidsStayfee"
            value={formData.kidsStayfee}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Any mandatory fees?
          </label>
          <input
            type="text"
            name="anyMandatoryfee"
            value={formData.anyMandatoryfee}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Any Mandatory Fees"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">In room safe</label>
          <select
            name="inRoomSafe"
            value={formData.inRoomSafe}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Does property offer weekly rates?
          </label>
          <select
            name="weeklyRates"
            value={formData.weeklyRates}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Does property offer monthly rates?{" "}
          </label>
          <select
            name="montlyRates"
            value={formData.montlyRates}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block mb-2 font-semibold">
          Does property offer monthly rates?
        </label>
        <input
          type="text"
          name="codesType"
          value={formData.codesType}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder=""
        />
      </div>

      <div>
        <div>
          <label className="block mb-2 font-semibold">
            Does the hotel have a credit card authorization form?
          </label>
          <select
            name="craditcardAuthform"
            value={formData.craditcardAuthform}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Does the hotel have a pet policy form?
          </label>
          <input
            type="text"
            name="petPolicy"
            value={formData.petPolicy}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Pet Policy"
          />
        </div>
      </div>

      {/* More Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-2 font-semibold">
            What time is the night audit run usually?
          </label>
          <input
            type="text"
            name="nightAuditTime"
            value={formData.nightAuditTime}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Night Audit Time"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Do you require specific reports to be emailed?
          </label>
          <textarea
            name="speceficRepots"
            value={formData.speceficRepots}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Specific Reports Required"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Any special instructions for night audit?
          </label>
          <textarea
            name="instructionNightAudit"
            value={formData.instructionNightAudit}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            What to do for No show before running Audit?{" "}
          </label>
          <textarea
            name="noShowBeforeNightAudit"
            value={formData.noShowBeforeNightAudit}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Who prepares the daily housekeeping list?{" "}
          </label>
          <textarea
            name="dailyHousekeepingList"
            value={formData.dailyHousekeepingList}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            What is the room service frequency for a weekly guest?{" "}
          </label>
          <textarea
            name="roomServiceFrequencyforWeekly"
            value={formData.roomServiceFrequencyforWeekly}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            What is the room service frequency for a daily guest?{" "}
          </label>
          <textarea
            name="roomServiceFrequencyforDaily"
            value={formData.roomServiceFrequencyforDaily}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Is the room required to be inspected after cleaning by a head
            housekeeper before renting?
          </label>
          <textarea
            name="inspectionRequired"
            value={formData.inspectionRequired}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            How does the housekeeping report clean rooms to the front desk
            currently?
          </label>
          <textarea
            name="housekeepingReport"
            value={formData.housekeepingReport}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Which items does the hotel supply in the room?
          </label>
          <textarea
            name="itemsHotelSupplyinRoom"
            value={formData.itemsHotelSupplyinRoom}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Which items does the hotel supply in the bathroom?
          </label>
          <textarea
            name="itemsHotelSupplyinBathRoom"
            value={formData.itemsHotelSupplyinBathRoom}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            What is the volume of online reservations to walk-ins?
          </label>
          <textarea
            name="volumeOfOnlineReservationinwalkIn"
            value={formData.volumeOfOnlineReservationinwalkIn}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            If the guest is walking out after we have offered them a walkout
            rate, should we ask you for any better rates?
          </label>
          <textarea
            name="walkoutrate"
            value={formData.walkoutrate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Do we provide a Discounted rate for AAA, AARP, Military or any
            other? Any specific rate code in PMS for these discounts?
          </label>
          <textarea
            name="discountFor"
            value={formData.discountFor}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Any specific rooms that are rented to the weekly clientele?
          </label>
          <textarea
            name="specialRoom"
            value={formData.specialRoom}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            What is the flooring in rooms?
          </label>
          <input
            type="text"
            name="roomFlooring"
            value={formData.roomFlooring}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Room Flooring Types"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Does the hotel have a park and fly facility?
          </label>
          <textarea
            name="parkandFlyFacilities"
            value={formData.parkandFlyFacilities}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            If guest requests for any utensils do we provide them?
          </label>
          <textarea
            name="utensilsRequired"
            value={formData.utensilsRequired}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            If a guest requests for an extra housekeeping service in room do we
            provide and if we what are the charges for it?
          </label>
          <input
            type="text"
            name="extrahouseKeepingCharge"
            value={formData.extrahouseKeepingCharge}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Extra Housekeeping Charge"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Reconciliation is done on a monthly or daily basis at the hotel?
          </label>
          <select
            name="montlyordailyReconcilination"
            value={formData.montlyordailyReconcilination}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Monthly">Monthly</option>
            <option value="Daily">Daily</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            What is the extension procedure? (For third parties)
          </label>
          <textarea
            name="extentinProcedures"
            value={formData.extentinProcedures}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Extension Procedures"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            What are the Housekeeping Working Hours?
          </label>
          <input
            type="text"
            name="housekeepingworkHours"
            value={formData.housekeepingworkHours}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            What are the maintenance working hours?
          </label>
          <input
            type="text"
            name="maintananceworkHours"
            value={formData.maintananceworkHours}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Is there a time of the day when there is no other hotel staff
            available at the property apart from the front desk?
          </label>
          <input
            type="text"
            name="timeforNostaff"
            value={formData.timeforNostaff}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Does the hotel accept third party credit card authorisation forms?
          </label>
          <input
            type="text"
            name="thirdpartycc"
            value={formData.thirdpartycc}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Does the hotel pre-authorize the arrivals?
          </label>
          <input
            type="text"
            name="preauthorizeArrival"
            value={formData.preauthorizeArrival}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Does the hotel accept CLC?
          </label>
          <input
            type="text"
            name="acceptclc"
            value={formData.acceptclc}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Does the hotel have rooms with a balcony?
          </label>
          <input
            type="text"
            name="roomswithBalcony"
            value={formData.roomswithBalcony}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder=""
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            Any DNR list that you follow? Please share with us.
          </label>
          <textarea
            name="DNRlist"
            value={formData.DNRlist}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="DNR List"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            What companies book regularly at the hotel?
          </label>
          <input
            type="text"
            name="regularCompany"
            value={formData.regularCompany}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Regular Company"
          />
        </div>
      </div>

      <div>
        <div>
          <label className="block mb-2 font-semibold">
            Are there any local attractions, restaurants, or activities you
            would like to recommend to guests?
          </label>
          <textarea
            name="recomendationtoGuest"
            value={formData.recomendationtoGuest}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Recommendations to Guest"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            If the hotel has on-site dining, provide details about the
            restaurant(s), their hours, and cuisine.
          </label>
          <textarea
            name="onSiterecomendationtoGuest"
            value={formData.onSiterecomendationtoGuest}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="On-Site Recommendations to Guest"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            How does the hotel handle lost and found items, and how can guests
            inquire about lost belongings?
          </label>
          <input
            type="text"
            name="lostandfound"
            value={formData.lostandfound}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Lost and Found Policy"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-2 font-semibold">
            Internet Provider and their Tech Support Number
          </label>
          <input
            type="text"
            name="internetProvider"
            value={formData.internetProvider}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Internet Provider"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">PBX Provider</label>
          <input
            type="text"
            name="pbxProvider"
            value={formData.pbxProvider}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="PBX Provider"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Key Lock Provider (Do they provide computer software)
          </label>
          <input
            type="text"
            name="KeyLockProvider"
            value={formData.KeyLockProvider}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Key Lock Provider"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            What is the tax rate at the hotel location?
          </label>
          <input
            type="text"
            name="taxRate"
            value={formData.taxRate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Tax Rate"
          />
        </div>
      </div>

      <div>
        <div>
          <label className="block mb-2 font-semibold">
            Preferred Kiosk Service Hours (for non-24/​7 operation):Please
            specify the shift timings you like for the kiosk service at your
            property.
          </label>
          <input
            type="text"
            name="kioskTimming"
            value={formData.kioskTimming}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Kiosk Timing"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Do you accept cash app, gift cards, google pay or any other payment
            form? (please mention)
          </label>
          <input
            type="text"
            name="giftCardd"
            value={formData.giftCardd}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Gift Card Details"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Do you have a secondary phone line at the front desk?
          </label>
          <select
            name="secondryPhoneLine"
            value={formData.secondryPhoneLine}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            PLEASE LIST ANY ADDITIONAL INFORMATION WE MIGHT HAVE MISSED TO ASK
          </label>
          <textarea
            name="additionalInformation"
            value={formData.additionalInformation}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Any Additional Information"
          />
        </div>
      </div>

      {/* Add more form fields as per requirements */}

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Submit
      </button>
    </form>
  );
};

// export default PropertyOnboardingForm

export default function PropertyOnboardingFormWrapper() {
  return (
    <ProtectedRoute>
      <PropertyOnboardingForm />
    </ProtectedRoute>
  );
}
