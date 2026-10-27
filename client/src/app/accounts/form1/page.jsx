"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const MyFormComponent = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [keyLockProvider, setKeyLockProvider] = useState("");
  const [lockType, setLockType] = useState("");
  const [provideSupportNumber, setProvideSupportNumber] = useState("");
  const [keyEncoderModel, setKeyEncoderModel] = useState("");
  const [keyEncoderPhotos, setKeyEncoderPhotos] = useState(null);
  const [PINpadModel, setPINpadModel] = useState("");
  const [PBXSystem, setPBXSystem] = useState("");
  const [PBXProvider, setPBXProvider] = useState("");
  const [providerSupportNumber2, setProviderSupportNumber2] = useState("");
  const [statesList, setStatesList] = useState([]);
  const [lockTypesList, setLockTypesList] = useState([]);

  useEffect(() => {
    // Fetch states and lock types from backend API
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/states`)
      .then((response) => response.json())
      .then((data) => setStatesList(data));

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lock-types`)
      .then((response) => response.json())
      .then((data) => setLockTypesList(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("firstName", firstName);
    formDataToSend.append("lastName", lastName);
    formDataToSend.append("propertyName", propertyName);
    formDataToSend.append("addressLine1", addressLine1);
    formDataToSend.append("addressLine2", addressLine2);
    formDataToSend.append("city", city);
    formDataToSend.append("state", state);
    formDataToSend.append("zipCode", zipCode);
    formDataToSend.append("phone", phone);
    formDataToSend.append("email", email);
    formDataToSend.append("keyLockProvider", keyLockProvider);
    formDataToSend.append("lockType", lockType);
    formDataToSend.append("provideSupportNumber", provideSupportNumber);
    formDataToSend.append("keyEncoderModel", keyEncoderModel);
    formDataToSend.append("keyEncoderPhotos", keyEncoderPhotos); // Assuming it's a file
    formDataToSend.append("PINpadModel", PINpadModel);
    formDataToSend.append("PBXSystem", PBXSystem);
    formDataToSend.append("PBXProvider", PBXProvider);
    formDataToSend.append("providerSupportNumber2", providerSupportNumber2);

    try {
      // const response = await axios.post(
      //   `${process.env.NEXT_PUBLIC_API_BASE_URL}/submit_equipment_form`,
      //   {
          
      //     method: "POST",
      //     body: formDataToSend,
      //   }
      // );
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/submit_equipment_form`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // const response = await axios.post(
      //   `${process.env.NEXT_PUBLIC_API_BASE_URL}/submit_equipment_form`,
        
      //   {
      //     withCredentials: true,
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   body: formDataToSend,
      // });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Form submission failed: ", error);
      alert("Form submission failed. Please try again later.");
    }
  };

  const handleFileChange = (e) => {
    setKeyEncoderPhotos(e.target.files[0]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto mt-10"
    >
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Third-Party Equipment Form
      </h2>

      {/* First Name & Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
            placeholder="First Name"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
            placeholder="Last Name"
            required
          />
        </div>
      </div>

      {/* Property Name */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Property Name *
        </label>
        <input
          type="text"
          value={propertyName}
          onChange={(e) => setPropertyName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3"
          placeholder="Property Name"
          required
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Address
        </label>
        <input
          type="text"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 mb-3"
          placeholder="Address Line 1"
        />
        <input
          type="text"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3"
          placeholder="Address Line 2"
        />
      </div>

      {/* City, State & Zip Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">State</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
          >
            <option value="">Select State</option>
            {statesList.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Zip Code
          </label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
            placeholder="Zip Code"
          />
        </div>
      </div>

      {/* Phone & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
            placeholder="Phone Number"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
            placeholder="Email Address"
          />
        </div>
      </div>

      {/* Key Lock Provider */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Key Lock Provider
        </label>
        <input
          type="text"
          value={keyLockProvider}
          onChange={(e) => setKeyLockProvider(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3"
          placeholder="Key Lock Provider"
        />
      </div>

      {/* Lock Type */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Lock Type</label>
        <select
          value={lockType}
          onChange={(e) => setLockType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3"
        >
          <option value="">Select Lock Type</option>
          {lockTypesList.map((lock) => (
            <option key={lock.id} value={lock.id}>
              {lock.name}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600"
      >
        Submit
      </button>
    </form>
  );
};

export default MyFormComponent;
