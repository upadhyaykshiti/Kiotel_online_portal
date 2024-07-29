"use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { useAuth } from "../../context/AuthContext";

// const SignIn = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errors, setErrors] = useState({});
//   const router = useRouter();
//   const { setUser } = useAuth(); // Access setUser from AuthContext

//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     setIsVisible(true);
//   }, []);

//   const validate = () => {
//     const errors = {};
//     if (!email) {
//       errors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       errors.email = "Email address is invalid";
//     }

//     const passwordRegex =
//       /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//     if (!password) {
//       errors.password = "Password is required";
//     } else if (!passwordRegex.test(password)) {
//       errors.password =
//         "Password must be at least 8 characters long, contain at least one capital letter, one number, and one special character";
//     }
//     return errors;
//   };

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     if (name === "email") {
//       setEmail(value);
//       setErrors((prevErrors) => ({ ...prevErrors, email: "" })); // Clear email error on input change
//     } else if (name === "password") {
//       setPassword(value);
//       setErrors((prevErrors) => ({ ...prevErrors, password: "" })); // Clear password error on input change
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const response = await axios.post("http://localhost:8080/api/signin", {
//         email,
//         password,
//       });
//       return response.data;
//     } catch (error) {
//       if (error.response) {
//         if (error.response.status === 404) {
//           throw new Error("User not found");
//         } else {
//           throw new Error(
//             "There was an error signing in: " + error.response.data.error
//           );
//         }
//       } else if (error.request) {
//         throw new Error("Network error: " + error.message);
//       } else {
//         throw new Error("Error: " + error.message);
//       }
//     }
//   };

//   // const handleSubmit = async (event) => {
//   //   event.preventDefault();
//   //   const validationErrors = validate();
//   //   setErrors(validationErrors);

//   //   if (Object.keys(validationErrors).length === 0) {
//   //     try {
//   //       const response = await axios.post("http://localhost:8080/api/signin", {
//   //         email,
//   //         password,
//   //       });
//   //       if (response.data) {
//   //         // Save user details to context
//   //         setUser(response.data.user);
//   //         // Redirect to the dashboard
//   //         router.push("/Dashboard");
//   //       }
//   //     } catch (error) {
//   //       if (error.response) {
//   //         if (error.response.status === 404) {
//   //           alert("User not found");
//   //         } else {
//   //           alert(
//   //             "There was an error signing in: " + error.response.data.error
//   //           );
//   //         }
//   //       } else if (error.request) {
//   //         alert("Network error: " + error.message);
//   //       } else {
//   //         alert("Error: " + error.message);
//   //       }
//   //       console.error("There was an error signing in!", error);
//   //     }
//   //   }
//   // };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const validationErrors = validate();
//     setErrors(validationErrors);

//     if (Object.keys(validationErrors).length === 0) {
//       try {
//         const userData = await login(email, password);
//         if (userData) {
//           // Save user details to context
//           setUser(userData.user);
//           // Redirect to the dashboard
//           router.push("/Dashboard");
//         }
//       } catch (error) {
//         if (error.response) {
//           if (error.response.status === 404) {
//             alert("User not found");
//           } else {
//             alert(
//               "There was an error signing in: " + error.response.data.error
//             );
//           }
//         } else if (error.request) {
//           alert("Network error: " + error.message);
//         } else {
//           alert("Error: " + error.message);
//         }
//         console.error("There was an error signing in!", error);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-200 overflow-hidden">
//       <div className="max-w-6xl w-full h-[90vh] bg-white border border-gray-300 rounded-lg shadow-2xl flex overflow-hidden">
//         <div className="w-1/2 p-8 flex flex-col justify-center">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div
//               className={`transition-opacity duration-500 ease-out ${
//                 isVisible ? "opacity-100" : "opacity-0"
//               }`}
//             >
//               <h2 className="text-3xl font-extrabold text-center text-blue-700 animate-slideIn">
//                 Sign In
//               </h2>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-gray-700 font-medium">Email</label>
//                 <input
//                   type="text"
//                   name="email"
//                   value={email}
//                   onChange={handleChange}
//                   className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-200 ${
//                     errors.email ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-gray-700 font-medium">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={password}
//                   onChange={handleChange}
//                   className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-200 ${
//                     errors.password ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.password && (
//                   <p className="text-red-500 text-sm mt-1">{errors.password}</p>
//                 )}
//               </div>
//             </div>
//             <button
//               type="submit"
//               className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
//             >
//               Sign In
//             </button>
//             <div className="flex justify-between py-4">
//               <a
//                 href="/forgotpassword"
//                 className="text-blue-500 hover:underline"
//               >
//                 Forgot Password?
//               </a>
//             </div>
//           </form>
//         </div>
//         <div
//           className="w-1/2 bg-cover bg-center transition-transform duration-300 hover:scale-105 object-cover h-48  "
//           style={{
//             backgroundImage: "url('/Kiotel logo.jpg')",
//             paddingTop: "80vh",
//           }}
//         ></div>
//       </div>
//     </div>
//   );
// };

// export default SignIn;

// "use client";

// import React, { useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";

// const SignIn = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errors, setErrors] = useState({});
//   const router = useRouter();

//   const validate = () => {
//     const errors = {};
//     if (!email) {
//       errors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       errors.email = "Email address is invalid";
//     }

//     const passwordRegex =
//       /^(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%*?&]{8,}$/;
//     if (!password) {
//       errors.password = "Password is required";
//     } else if (!passwordRegex.test(password)) {
//       errors.password =
//         "Password must be at least 8 characters long, contain at least one capital letter, one number, and one special character";
//     }
//     return errors;
//   };

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     if (name === "email") {
//       setEmail(value);
//       setErrors((prevErrors) => ({ ...prevErrors, email: "" })); // Clear email error on input change
//     } else if (name === "password") {
//       setPassword(value);
//       setErrors((prevErrors) => ({ ...prevErrors, password: "" })); // Clear password error on input change
//     }
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const validationErrors = validate();
//     setErrors(validationErrors);

//     if (Object.keys(validationErrors).length === 0) {
//       try {
//         const response = await axios.post("http://localhost:8080/api/signin", {
//           email,
//           password,
//         });
//         if (response.data) {
//           // Redirect to the welcome page with the email as a query parameter
//           router.push("/welcome");
//         }
//       } catch (error) {
//         if (error.response) {
//           if (error.response.status === 404) {
//             alert("User not found");
//           } else {
//             alert(
//               "There was an error signing in: " + error.response.data.error
//             );
//           }
//         } else if (error.request) {
//           alert("Network error: " + error.message);
//         } else {
//           alert("Error: " + error.message);
//         }
//         console.error("There was an error signing in!", error);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-200 overflow-hidden">
//       <div className="max-w-6xl w-full h-[90vh] bg-white border border-gray-300 rounded-lg shadow-2xl flex overflow-hidden">
//         <div className="w-1/2 p-8 flex flex-col justify-center">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <h2 className="text-3xl font-extrabold text-center text-blue-700">
//               Sign In
//             </h2>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-gray-700 font-medium">Email</label>
//                 <input
//                   type="text"
//                   name="email"
//                   value={email}
//                   onChange={handleChange}
//                   className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-200 ${
//                     errors.email ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-gray-700 font-medium">Password</label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={password}
//                   onChange={handleChange}
//                   className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-200 ${
//                     errors.password ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.password && (
//                   <p className="text-red-500 text-sm mt-1">{errors.password}</p>
//                 )}
//               </div>
//             </div>
//             <button
//               type="submit"
//               className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
//             >
//               Sign In
//             </button>
//             <div className="flex justify-between py-4">
//               <a
//                 href="/forgotpassword"
//                 className="text-blue-500 hover:underline"
//               >
//                 Forgot Password?
//               </a>
//             </div>
//           </form>
//         </div>
//         <div
//           className="w-1/2 bg-cover bg-center transition-transform duration-300 hover:scale-105"
//           style={{ backgroundImage: "url('/assets/koitel.jpeg')" }}
//         ></div>
//       </div>
//     </div>
//   );
// };

// export default SignIn;



// "use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";

// const SignIn = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errors, setErrors] = useState({});
//   const router = useRouter();

//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     setIsVisible(true);
//   }, []);

//   const validate = () => {
//     const errors = {};
//     if (!email) {
//       errors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       errors.email = "Email address is invalid";
//     }

//     const passwordRegex =
//       /^(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%*?&]{8,}$/;
//     if (!password) {
//       errors.password = "Password is required";
//     } else if (!passwordRegex.test(password)) {
//       errors.password =
//         "Password must be at least 8 characters long, contain at least one capital letter, one number, and one special character";
//     }
//     return errors;
//   };

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     if (name === "email") {
//       setEmail(value);
//       setErrors((prevErrors) => ({ ...prevErrors, email: "" })); // Clear email error on input change
//     } else if (name === "password") {
//       setPassword(value);
//       setErrors((prevErrors) => ({ ...prevErrors, password: "" })); // Clear password error on input change
//     }
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const validationErrors = validate();
//     setErrors(validationErrors);

//     if (Object.keys(validationErrors).length === 0) {
//       try {
//         const response = await axios.post("http://localhost:8080/api/signin", {
//           email,
//           password,
//         });
//         if (response.data) {
//           // Redirect to the welcome page with the email as a query parameter
//           // router.push("/helpdesk");
//           router.push("/dashboard");
//         }
//       } catch (error) {
//         if (error.response) {
//           if (error.response.status === 404) {
//             alert("User not found");
//           } else {
//             alert(
//               "There was an error signing in: " + error.response.data.error
//             );
//           }
//         } else if (error.request) {
//           alert("Network error: " + error.message);
//         } else {
//           alert("Error: " + error.message);
//         }
//         console.error("There was an error signing in!", error);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-200 overflow-hidden">
//       <div className="max-w-6xl w-full h-[90vh] bg-white border border-gray-300 rounded-lg shadow-2xl flex overflow-hidden">
//         <div className="w-1/2 p-8 flex flex-col justify-center">
//           <form onSubmit={handleSubmit} className="space-y-6" style={{ paddingTop: '50px' }}>
//             <div className={`transition-opacity duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
//               <h2 className="text-3xl font-extrabold text-center text-blue-700 animate-slideIn">
//                 Sign In
//               </h2>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-gray-700 font-medium">Email</label>
//                 <input
//                   type="text"
//                   name="email"
//                   value={email}
//                   onChange={handleChange}
//                   className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-200 ${
//                     errors.email ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-gray-700 font-medium">Password</label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={password}
//                   onChange={handleChange}
//                   className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-200 ${
//                     errors.password ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.password && (
//                   <p className="text-red-500 text-sm mt-1">{errors.password}</p>
//                 )}
//               </div>
//             </div>
//             <button
//               type="submit"
//               className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
//             >
//               Sign In
//             </button>
//             <div className="flex justify-between py-4">
//               <a
//                 href="/forgotpassword"
//                 className="text-blue-500 hover:underline"
//               >
//                 Forgot Password?
//               </a>
//             </div>
//           </form>
//         </div>
//         {/* <div
//           className="w-1/2 bg-cover bg-center transition-transform duration-300 hover:scale-105 object-cover"
//           style={{ backgroundImage: "url('/assets/koitel.jpeg')" }}
//         ></div> */}
//       </div>
//     </div>
//   );
// };

// export default SignIn;


// pages/signin.js or components/SignIn.jsx
import React, { useState } from 'react';
import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const router = useRouter();
  // const { setUser } = useAuth(); // Access setUser from AuthContext

  const validate = () => {
    const errors = {};
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email address is invalid';
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) {
      errors.password = 'Password is required';
    } else if (!passwordRegex.test(password)) {
      errors.password =
        'Password must be at least 8 characters long, contain at least one capital letter, one number, and one special character';
    }
    return errors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'email') {
      setEmail(value);
      setErrors((prevErrors) => ({ ...prevErrors, email: '' })); // Clear email error on input change
    } else if (name === 'password') {
      setPassword(value);
      setErrors((prevErrors) => ({ ...prevErrors, password: '' })); // Clear password error on input change
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8080/api/signin', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error('User not found');
        } else {
          throw new Error(
            'There was an error signing in: ' + error.response.data.error
          );
        }
      } else if (error.request) {
        throw new Error('Network error: ' + error.message);
      } else {
        throw new Error('Error: ' + error.message);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
  
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post("http://localhost:8080/api/signin", {
          email,
          password,
        }, {
          withCredentials: true // Important for sending/receiving cookies
        });
        
        if (response.data) {
          // Redirect to the Dashboard page
          router.push("/Dashboard");
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            alert("Unauthorized: Invalid email or password");
          } else {
            alert("There was an error signing in: " + error.response.data.error);
          }
        } else if (error.request) {
          alert("Network error: " + error.message);
        } else {
          alert("Error: " + error.message);
        }
        console.error("There was an error signing in!", error);
      }
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-200">
      <div className="max-w-6xl w-full h-[90vh] bg-white border border-gray-300 rounded-lg shadow-2xl flex overflow-hidden">
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="transition-opacity duration-500 ease-out opacity-100">
              <h2 className="text-3xl font-extrabold text-center text-blue-700 animate-slideIn">
                Sign In
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium">Email</label>
                <input
                  type="text"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
            >
              Sign In
            </button>
            <div className="flex justify-between py-4">
              <a href="/forgotpassword" className="text-blue-500 hover:underline">
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
        <div
          className="w-1/2 bg-cover bg-center transition-transform duration-300 hover:scale-105 object-cover h-48"
          style={{
            backgroundImage: "url('/Kiotel logo.jpg')",
            paddingTop: "80vh",
          }}
        ></div>
      </div>
    </div>
  );
};

export default SignIn;


