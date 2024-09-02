


// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { subDays, addDays } from 'date-fns';

// function SignUpForm() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [dob, setDob] = useState(null);
//   const [address, setAddress] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [contactNumber, setContactNumber] = useState("");
//   const [role, setRole] = useState("");
//   const [roles, setRoles] = useState([]);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     axios.get("http://localhost:8080/api/roles")
//       .then(response => setRoles(response.data))
//       .catch(error => {
//         console.error("Failed to fetch roles:", error);
//         setError("Failed to fetch roles");
//       });
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await axios.post("http://localhost:8080/api/register", {
//         email,
//         password,
//         fname: firstName,
//         lname: lastName,
//         dob,
//         address,
//         account_no: accountNumber,
//         mobileno: contactNumber,
//         role_id: role
//       });

//       if (response.status === 200) {
//         setSuccess(true);
//       }
//     } catch (error) {
//       console.error("Failed to register user:", error);
//       setError("Failed to register user");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-white">
//     {/* <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"> */}
//       <div className="bg-white shadow-lg rounded-lg p-10 w-full max-w-4xl flex flex-col">
//         <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
//         {success && <p className="text-green-500 text-center mb-4">User registered successfully!</p>}
//         {error && <p className="text-red-500 text-center mb-4">{error}</p>}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div className="col-span-2 sm:col-span-1">
//               <label className="block text-gray-700 font-bold mb-2">Email ID</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div> 
//             <div className="col-span-2 sm:col-span-1">
//               <label className="block text-gray-700 font-bold mb-2">Password </label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="col-span-2 sm:col-span-1">
//               <label className="block text-gray-700 font-bold mb-2">First Name</label>
//               <input
//                 type="text"
//                 value={firstName}
//                 onChange={(e) => setFirstName(e.target.value)}
//                 required
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//             <div className="col-span-2 sm:col-span-1">
//               <label className="block text-gray-700 font-bold mb-2">Last Name</label>
//               <input
//                 type="text"
//                 value={lastName}
//                 onChange={(e) => setLastName(e.target.value)}
//                 required
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="col-span-2 sm:col-span-1">
//               <label className="block text-gray-700 font-bold mb-2">Date of Birth</label>
//               {/* <DatePicker
//                 selected={dob}
//                 onChange={(date) => setDob(date)}
//                 dateFormat="dd/MM/yyyy"
//                 placeholderText="Select a date"
//                 required
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//               /> */}

// <DatePicker
//   selected={dob}
//   onChange={(date) => setDob(date)}
//   dateFormat="dd/MM/yyyy"
//   placeholderText="Select a date"
//   required
//   className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//   showYearDropdown
//   showMonthDropdown
//   dropdownMode="select"
//   minDate={new Date(1900, 0, 1)} // Set the minimum date to January 1, 1900
//   maxDate={new Date()} // Set the maximum date to the current date
//   yearDropdownItemNumber={new Date().getFullYear() - 1900 + 1} // Dynamically set the number of years to show
//   scrollableYearDropdown // Enable scrolling in the year dropdown
// />


// {/* <DatePicker
//   selected={dob}
//   onChange={(date) => setDob(date)}
//   dateFormat="dd/MM/yyyy"
//   placeholderText="Select a date"
//   required
//   className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//   showYearDropdown
//   showMonthDropdown
//   dropdownMode="select"
//   minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)} // Start of current month
//   maxDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)} // End of current month
// /> */}
//             </div>
//             <div className="col-span-2 sm:col-span-1">
//               <label className="block text-gray-700 font-bold mb-2">Role</label>
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 required
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//               >
//                 <option value="">Select Role</option>
//                 {roles.map((role) => (
//                   <option key={role.id} value={role.id}>{role.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="col-span-2 sm:col-span-1">
//               <label className="block text-gray-700 font-bold mb-2">Address</label>
//               <input
//                 type="text"
//                 value={address}
//                 onChange={(e) => setAddress(e.target.value)}
//                 required
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//             <div className="col-span-2 sm:col-span-1">
//               <label className="block text-gray-700 font-bold mb-2">Account Number</label>
//               <input
//                 type="text"
//                 value={accountNumber}
//                 onChange={(e) => setAccountNumber(e.target.value)}
//                 required
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="col-span-2 sm:col-span-1">
//               <label className="block text-gray-700 font-bold mb-2">Contact Number</label>
//               <input
//                 type="text"
//                 value={contactNumber}
//                 onChange={(e) => setContactNumber(e.target.value)}
//                 required
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//           </div>

//           <div className="text-center">
//             <button
//               type="submit"
//               className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
//             >
//               Sign Up
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default SignUpForm;
// // 


// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// function SignUpForm() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [dob, setDob] = useState(null);
//   const [address, setAddress] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [contactNumber, setContactNumber] = useState("");
//   const [role, setRole] = useState("");
//   const [roles, setRoles] = useState([]);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/roles`)
//       .then(response => setRoles(response.data))
//       .catch(error => {
//         console.error("Failed to fetch roles:", error);
//         setError("Failed to fetch roles");
//       });
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`, {
//         email,
//         password,
//         fname: firstName,
//         lname: lastName,
//         dob,
//         address,
//         account_no: accountNumber,
//         mobileno: contactNumber,
//         role_id: role
//       });

//       if (response.status === 200) {
//         setSuccess(true);
//       }
//     } catch (error) {
//       console.error("Failed to register user:", error);
//       setError("Failed to register user");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50">
//       <div className="bg-white shadow-2xl rounded-lg p-10 w-full max-w-3xl flex flex-col">
//         <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900">Sign Up</h2>
//         {success && <p className="text-green-600 text-center mb-6 font-semibold">User registered successfully!</p>}
//         {error && <p className="text-red-600 text-center mb-6 font-semibold">{error}</p>}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Email ID</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div> 
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Password</label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">First Name</label>
//               <input
//                 type="text"
//                 value={firstName}
//                 onChange={(e) => setFirstName(e.target.value)}
//                 required
//                 className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Last Name</label>
//               <input
//                 type="text"
//                 value={lastName}
//                 onChange={(e) => setLastName(e.target.value)}
//                 required
//                 className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
//               <DatePicker
//                 selected={dob}
//                 onChange={(date) => setDob(date)}
//                 dateFormat="dd/MM/yyyy"
//                 placeholderText="Select a date"
//                 showMonthDropdown
//                 showYearDropdown
//                 dropdownMode="select"
//                 required
//                 className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Role</label>
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 required
//                 className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select Role</option>
//                 {roles.map((role) => (
//                   <option key={role.id} value={role.id}>{role.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Address</label>
//               <input
//                 type="text"
//                 value={address}
//                 onChange={(e) => setAddress(e.target.value)}
//                 required
//                 className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Account Number</label>
//               <input
//                 type="text"
//                 value={accountNumber}
//                 onChange={(e) => setAccountNumber(e.target.value)}
//                 required
//                 className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Contact Number</label>
//               <input
//                 type="text"
//                 value={contactNumber}
//                 onChange={(e) => setContactNumber(e.target.value)}
//                 required
//                 className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>

//           <div className="text-center">
//             <button
//               type="submit"
//               className="bg-blue-600 text-white py-3 px-8 rounded-md shadow-md hover:bg-blue-700 transition duration-300"
//             >
//               Sign Up
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default SignUpForm;


"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function SignUpForm({ existingUser = null }) {  // Accept an existing user object for updates
  const [id, setId] = useState(existingUser?.id || 0);
  const [email, setEmail] = useState(existingUser?.email || "");
  const [password, setPassword] = useState(""); // Keep password field empty for security
  const [firstName, setFirstName] = useState(existingUser?.fname || "");
  const [lastName, setLastName] = useState(existingUser?.lname || "");
  const [dob, setDob] = useState(existingUser?.dob ? new Date(existingUser.dob) : null);
  const [address, setAddress] = useState(existingUser?.address || "");
  const [accountNumber, setAccountNumber] = useState(existingUser?.account_no || "");
  const [contactNumber, setContactNumber] = useState(existingUser?.mobileno || "");
  const [role, setRole] = useState(existingUser?.role_id || "");
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch available roles from the API
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/roles`)
      .then(response => setRoles(response.data))
      .catch(error => {
        console.error("Failed to fetch roles:", error);
        setError("Failed to fetch roles");
      });
  }, []);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`, {
  //       id,
  //       email,
  //       password,
  //       fname: firstName,
  //       lname: lastName,
  //       dob,
  //       address,
  //       account_no: accountNumber,
  //       mobileno: contactNumber,
  //       role_id: role
  //     });

  //     if (response.status === 200) {
  //       setSuccess(true);
  //     }
  //   } catch (error) {
  //     console.error("Failed to register/update user:", error);
  //     setError("Failed to register/update user");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format the date to YYYY-MM-DD
    const formattedDob = dob ? dob.toISOString().split("T")[0] : null;

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`, {
        id,
        email,
        password,
        fname: firstName,
        lname: lastName,
        dob: formattedDob,
        address,
        account_no: accountNumber,
        mobileno: contactNumber,
        role_id: role
      });

      if (response.status === 200) {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Failed to register/update user:", error);
      setError("Failed to register/update user");
    }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-2xl rounded-lg p-10 w-full max-w-3xl flex flex-col">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900">
          {existingUser ? "Update User" : "Sign Up"}
        </h2>
        {success && (
          <p className="text-green-600 text-center mb-6 font-semibold">
            User {existingUser ? "updated" : "registered"} successfully!
          </p>
        )}
        {error && (
          <p className="text-red-600 text-center mb-6 font-semibold">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={existingUser ? "Leave blank to keep current password" : ""}
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <DatePicker
                selected={dob}
                onChange={(date) => setDob(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select a date"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-8 rounded-md shadow-md hover:bg-blue-700 transition duration-300"
            >
              {existingUser ? "Update User" : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUpForm;
