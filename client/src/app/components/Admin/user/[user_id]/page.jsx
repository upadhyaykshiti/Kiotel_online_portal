
// "use client";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import moment from 'moment';

// export default function UserProfile({ params }) {
//     const { user_id } = params;
//     const router = useRouter();
//     const [formData, setFormData] = useState({
//         emailid: "",
//         password: "",
//         fname: "",
//         lname: "",
//         dob: null,
//         last_training: null,
//         address: "",
//         account_no: "",
//         mobileno: "",
//         role_id: "",
//     });
    
//     const [initialRoleId, setInitialRoleId] = useState(null); // <-- Added to track original role
//     const [roles, setRoles] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [errors, setErrors] = useState({});
//     const [showPassword, setShowPassword] = useState(false);

//     const AGENT_TRAINEE_ROLE_ID = 7;

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${user_id}`);
//                 const userData = userResponse.data;
                
//                 const currentRoleId = userData.role_id || userData.role || "";
                
//                 setFormData({
//                     emailid: userData.emailid || "",
//                     password: userData.password || "",
//                     fname: userData.fname || "",
//                     lname: userData.lname || "",
//                     dob: userData.dob ? new Date(userData.dob) : null,
//                     last_training: userData.last_training ? new Date(userData.last_training) : null,
//                     address: userData.address || "",
//                     account_no: userData.account_no || "",
//                     mobileno: userData.mobileno || "",
//                     role_id: currentRoleId,
//                 });
                
//                 setInitialRoleId(currentRoleId); // <-- Store the initial role ID

//                 const rolesResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles`);
//                 setRoles(rolesResponse.data);
//             } catch (error) {
//                 console.error("Error fetching user data or roles:", error);
//                 setErrors({ form: "Error fetching data. Please try again." });
//             }
//         };
//         fetchData();
//     }, [user_id]);

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//     };

//     // <-- Condition: Originally Agent Trainee AND currently changing to something else
//     const isChangingFromAgentTrainee = 
//         parseInt(initialRoleId) === AGENT_TRAINEE_ROLE_ID && 
//         parseInt(formData.role_id) !== AGENT_TRAINEE_ROLE_ID;

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const formattedDob = formData.dob ? moment(formData.dob).format('YYYY-MM-DD') : null;
//         const formattedLastTraining = formData.last_training ? moment(formData.last_training).format('YYYY-MM-DD') : null;

//         const validationErrors = {};
//         if (!formData.emailid) {
//             validationErrors.emailid = "Email is required.";
//         } else if (!/\S+@\S+\.\S+/.test(formData.emailid)) {
//             validationErrors.emailid = "Email is invalid.";
//         }
//         if (!formData.fname) validationErrors.fname = "First name is required.";
//         if (!formData.lname) validationErrors.lname = "Last name is required.";
//         if (!formData.mobileno) validationErrors.mobileno = "Contact number is required.";

//         // Validate last_training only if changing from Agent Trainee
//         if (isChangingFromAgentTrainee && !formData.last_training) {
//             validationErrors.last_training = "Last training date is required when changing role from Agent Trainee.";
//         }

//         if (Object.keys(validationErrors).length) {
//             setErrors(validationErrors);
//             return;
//         }

//         const updatedData = {
//             ...formData,
//             dob: formattedDob,
//             last_training: isChangingFromAgentTrainee ? formattedLastTraining : null,  // <-- only send if condition is met
//             role_id: formData.role_id
//         };

//         setLoading(true);
//         try {
//             await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/update_new/${user_id}`, updatedData);
//             setLoading(false);
//             router.push("/Dashboard");
//         } catch (error) {
//             console.error("Error saving user data:", error);
//             const errorMsg = error.response?.data?.message || "Error saving user data";
//             setErrors({ form: errorMsg });
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6">
//             <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6 sm:p-8 border border-gray-200">
//                 <div className="text-center mb-8">
//                     <h1 className="text-3xl font-bold text-gray-900">Update User Profile</h1>
//                     <p className="mt-2 text-gray-600">Edit the details below and save changes.</p>
//                 </div>

//                 {errors.form && (
//                     <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
//                         <div className="flex items-center">
//                             <svg className="flex-shrink-0 h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
//                             </svg>
//                             <span>{errors.form}</span>
//                         </div>
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     {/* Email & Password */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                             <label htmlFor="emailid" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                             <input
//                                 id="emailid" type="email" name="emailid"
//                                 value={formData.emailid} onChange={handleChange}
//                                 className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 ${errors.emailid ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
//                                 required
//                             />
//                             {errors.emailid && <p className="mt-1 text-sm text-red-600 flex items-center">{errors.emailid}</p>}
//                         </div>
//                         <div>
//                             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//                             <div className="relative">
//                                 <input
//                                     id="password" type={showPassword ? "text" : "password"} name="password"
//                                     value={formData.password} onChange={handleChange}
//                                     placeholder="Leave blank to keep current password"
//                                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10 hover:border-gray-400"
//                                 />
//                                 <button type="button" onClick={() => setShowPassword(!showPassword)}
//                                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
//                                     {showPassword
//                                         ? <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
//                                         : <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 0010 3a9.958 9.958 0 00-4.72 1.196L3.28 2.22z" clipRule="evenodd" /></svg>
//                                     }
//                                 </button>
//                             </div>
//                             <p className="mt-1 text-xs text-gray-500">Enter a new password to change it.</p>
//                         </div>
//                     </div>

//                     {/* First Name & Last Name */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                             <label htmlFor="fname" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
//                             <input id="fname" type="text" name="fname" value={formData.fname} onChange={handleChange}
//                                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-gray-400" required />
//                             {errors.fname && <p className="mt-1 text-sm text-red-600">{errors.fname}</p>}
//                         </div>
//                         <div>
//                             <label htmlFor="lname" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
//                             <input id="lname" type="text" name="lname" value={formData.lname} onChange={handleChange}
//                                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-gray-400" required />
//                             {errors.lname && <p className="mt-1 text-sm text-red-600">{errors.lname}</p>}
//                         </div>
//                     </div>

//                     {/* DOB & Address */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                             <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
//                             <div className="relative">
//                                 <DatePicker id="dob" selected={formData.dob}
//                                     onChange={(date) => setFormData({ ...formData, dob: date })}
//                                     className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-gray-400"
//                                     dateFormat="yyyy/MM/dd" placeholderText="Select Date" />
//                             </div>
//                         </div>
//                         <div>
//                             <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//                             <input id="address" type="text" name="address" value={formData.address} onChange={handleChange}
//                                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-gray-400" />
//                         </div>
//                     </div>

//                     {/* EID Number */}
//                     <div>
//                         <label htmlFor="account_no" className="block text-sm font-medium text-gray-700 mb-1">EID Number</label>
//                         <input id="account_no" type="text" name="account_no" value={formData.account_no} readOnly
//                             className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed shadow-sm" />
//                         <p className="mt-1 text-xs text-gray-500">This field cannot be edited.</p>
//                     </div>

//                     {/* Mobile Number */}
//                     <div>
//                         <label htmlFor="mobileno" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
//                         <input id="mobileno" type="text" name="mobileno" value={formData.mobileno} onChange={handleChange}
//                             className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.mobileno ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}`} />
//                         {errors.mobileno && <p className="mt-1 text-sm text-red-600">{errors.mobileno}</p>}
//                     </div>

//                     {/* Role Dropdown */}
//                     <div>
//                         <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
//                         <select id="role_id" name="role_id" value={formData.role_id} onChange={handleChange}
//                             className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-gray-400" required>
//                             <option value="">Select Role</option>
//                             {roles.map((role) => (
//                                 <option key={role.id} value={role.id}>{role.name}</option>
//                             ))}
//                         </select>
//                     </div>

//                     {/* ── Last Training Date (Visible only when changing from Agent Trainee) ── */}
//                     {isChangingFromAgentTrainee && (
//                         <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                             <label htmlFor="last_training" className="block text-sm font-medium text-blue-800 mb-1">
//                                 Last Training Date <span className="text-red-500">*</span>
//                             </label>
//                             <div className="relative">
//                                 <DatePicker
//                                     id="last_training"
//                                     selected={formData.last_training}
//                                     onChange={(date) => setFormData({ ...formData, last_training: date })}
//                                     className={`w-full px-4 py-2.5 pl-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.last_training ? "border-red-500 bg-red-50" : "border-blue-300 hover:border-blue-400"}`}
//                                     dateFormat="yyyy/MM/dd"
//                                     placeholderText="Select Last Training Date"
//                                     maxDate={new Date()}
//                                 />
//                             </div>
//                             {errors.last_training && <p className="mt-1 text-sm text-red-600">{errors.last_training}</p>}
//                             <p className="mt-1 text-xs text-blue-600">Required when promoting/changing role from Agent Trainee.</p>
//                         </div>
//                     )}

//                     {/* Submit Button */}
//                     <div className="pt-6">
//                         <button type="submit" disabled={loading}
//                             className={`w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? "cursor-not-allowed opacity-70" : "transform hover:-translate-y-0.5"}`}>
//                             {loading ? (
//                                 <>
//                                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                     Updating...
//                                 </>
//                             ) : (
//                                 "Update Profile"
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }


"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { FaCamera, FaDownload, FaTrash, FaUser, FaExpand, FaTimes } from "react-icons/fa";

export default function UserProfile({ params }) {
    const { user_id } = params;
    const router = useRouter();
    const [formData, setFormData] = useState({
        emailid: "",
        password: "",
        fname: "",
        lname: "",
        dob: null,
        last_training: null,
        address: "",
        account_no: "",
        agent_id: "", // <-- Added agent_id
        mobileno: "",
        role_id: "",
        profile_pic: "", // <-- Added profile picture URL
    });

    const [initialRoleId, setInitialRoleId] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Profile picture UI state
    const [uploadingPic, setUploadingPic] = useState(false);
    const [isImageOpen, setIsImageOpen] = useState(false); // lightbox / enlarge

    const handleProfilePicUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({ ...prev, profile_pic: "Please select an image file." }));
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, profile_pic: "Image must be 10MB or smaller." }));
            return;
        }
        setErrors((prev) => { const n = { ...prev }; delete n.profile_pic; return n; });
        setUploadingPic(true);
        try {
            const picForm = new FormData();
            picForm.append("file", file);
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload/profile`,
                picForm,
                { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
            );
            setFormData((prev) => ({ ...prev, profile_pic: res.data?.url || "" }));
        } catch (err) {
            console.error("Profile picture upload failed:", err);
            setErrors((prev) => ({ ...prev, profile_pic: "Upload failed. Please try again." }));
        } finally {
            setUploadingPic(false);
        }
    };

    const handleRemoveProfilePic = () => {
        setFormData((prev) => ({ ...prev, profile_pic: "" }));
    };

    const AGENT_TRAINEE_ROLE_ID = 7;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${user_id}`);
                const userData = userResponse.data;
                
                const currentRoleId = userData.role_id || userData.role || "";
                
                setFormData({
                    emailid: userData.emailid || "",
                    password: userData.password || "",
                    fname: userData.fname || "",
                    lname: userData.lname || "",
                    dob: userData.dob ? new Date(userData.dob) : null,
                    last_training: userData.last_training ? new Date(userData.last_training) : null,
                    address: userData.address || "",
                    account_no: userData.account_no || "",
                    agent_id: userData.agent_id || "", // <-- Populate agent_id
                    mobileno: userData.mobileno || "",
                    role_id: currentRoleId,
                    profile_pic: userData.profile_pic || "", // <-- Populate profile picture
                });
                
                setInitialRoleId(currentRoleId); 

                const rolesResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles`);
                setRoles(rolesResponse.data);
            } catch (error) {
                console.error("Error fetching user data or roles:", error);
                setErrors({ form: "Error fetching data. Please try again." });
            }
        };
        fetchData();
    }, [user_id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const isChangingFromAgentTrainee = 
        parseInt(initialRoleId) === AGENT_TRAINEE_ROLE_ID && 
        parseInt(formData.role_id) !== AGENT_TRAINEE_ROLE_ID;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedDob = formData.dob ? moment(formData.dob).format('YYYY-MM-DD') : null;
        const formattedLastTraining = formData.last_training ? moment(formData.last_training).format('YYYY-MM-DD') : null;

        const validationErrors = {};
        if (!formData.emailid) {
            validationErrors.emailid = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.emailid)) {
            validationErrors.emailid = "Email is invalid.";
        }
        if (!formData.fname) validationErrors.fname = "First name is required.";
        if (!formData.lname) validationErrors.lname = "Last name is required.";
        if (!formData.mobileno) validationErrors.mobileno = "Contact number is required.";

        if (isChangingFromAgentTrainee && !formData.last_training) {
            validationErrors.last_training = "Last training date is required when changing role from Agent Trainee.";
        }

        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }

        const updatedData = {
            ...formData,
            dob: formattedDob,
            last_training: isChangingFromAgentTrainee ? formattedLastTraining : null,  
            role_id: formData.role_id
        };

        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/update_new/${user_id}`, updatedData);
            setLoading(false);
            router.push("/Dashboard");
        } catch (error) {
            console.error("Error saving user data:", error);
            const errorMsg = error.response?.data?.message || "Error saving user data";
            setErrors({ form: errorMsg });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6 sm:p-8 border border-gray-200">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Update User Profile</h1>
                    <p className="mt-2 text-gray-600">Edit the details below and save changes.</p>
                </div>

                {/* --- Profile Picture --- */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="relative group">
                        {formData.profile_pic ? (
                            <>
                                <img
                                    src={formData.profile_pic}
                                    alt={`${formData.fname} ${formData.lname}`}
                                    onClick={() => setIsImageOpen(true)}
                                    className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg cursor-zoom-in ring-1 ring-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsImageOpen(true)}
                                    title="Enlarge"
                                    className="absolute bottom-1 right-1 bg-gray-900/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                                >
                                    <FaExpand className="h-3.5 w-3.5" />
                                </button>
                            </>
                        ) : (
                            <div className="h-28 w-28 rounded-full bg-blue-100 flex items-center justify-center text-blue-400 border-4 border-white shadow-lg">
                                <FaUser className="h-12 w-12" />
                            </div>
                        )}
                        {uploadingPic && (
                            <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
                                <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <label className="cursor-pointer inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition">
                            <FaCamera className="mr-2" />
                            {formData.profile_pic ? "Change Photo" : "Upload Photo"}
                            <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" disabled={uploadingPic} />
                        </label>
                        {formData.profile_pic && (
                            <>
                                <a
                                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${user_id}/profile-picture/download`}
                                    className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg shadow-sm transition"
                                >
                                    <FaDownload className="mr-2" /> Download
                                </a>
                                <button
                                    type="button"
                                    onClick={handleRemoveProfilePic}
                                    className="inline-flex items-center px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg shadow-sm transition"
                                >
                                    <FaTrash className="mr-2" /> Remove
                                </button>
                            </>
                        )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">JPG, PNG, WEBP or GIF · Max 10MB · optional</p>
                    {errors.profile_pic && <p className="mt-1 text-sm text-red-600">{errors.profile_pic}</p>}
                    <p className="mt-1 text-[11px] text-gray-400">Remember to click “Update Profile” to save changes.</p>
                </div>

                {errors.form && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                        <div className="flex items-center">
                            <svg className="flex-shrink-0 h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                            <span>{errors.form}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email & Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="emailid" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                id="emailid" type="email" name="emailid"
                                value={formData.emailid} onChange={handleChange}
                                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 ${errors.emailid ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                                required
                            />
                            {errors.emailid && <p className="mt-1 text-sm text-red-600 flex items-center">{errors.emailid}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    id="password" type={showPassword ? "text" : "password"} name="password"
                                    value={formData.password} onChange={handleChange}
                                    placeholder="Leave blank to keep current password"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10 hover:border-gray-400"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                                    {showPassword
                                        ? <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                        : <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 0010 3a9.958 9.958 0 00-4.72 1.196L3.28 2.22z" clipRule="evenodd" /></svg>
                                    }
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Enter a new password to change it.</p>
                        </div>
                    </div>

                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="fname" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input id="fname" type="text" name="fname" value={formData.fname} onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-gray-400" required />
                            {errors.fname && <p className="mt-1 text-sm text-red-600">{errors.fname}</p>}
                        </div>
                        <div>
                            <label htmlFor="lname" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input id="lname" type="text" name="lname" value={formData.lname} onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-gray-400" required />
                            {errors.lname && <p className="mt-1 text-sm text-red-600">{errors.lname}</p>}
                        </div>
                    </div>

                    {/* DOB & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
                            <div className="relative">
                                <DatePicker id="dob" selected={formData.dob}
                                    onChange={(date) => setFormData({ ...formData, dob: date })}
                                    className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-gray-400"
                                    dateFormat="yyyy/MM/dd" placeholderText="Select Date" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input id="address" type="text" name="address" value={formData.address} onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-gray-400" />
                        </div>
                    </div>

                    {/* EID Number & Agent ID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="account_no" className="block text-sm font-medium text-gray-700 mb-1">EID Number</label>
                            <input id="account_no" type="text" name="account_no" value={formData.account_no} readOnly
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed shadow-sm" />
                            <p className="mt-1 text-xs text-gray-500">This field cannot be edited.</p>
                        </div>
                        <div>
                            <label htmlFor="agent_id" className="block text-sm font-medium text-gray-700 mb-1">Agent ID</label>
                            <input id="agent_id" type="text" name="agent_id" value={formData.agent_id} onChange={handleChange}
                                placeholder="Enter Agent ID"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-gray-400" />
                        </div>
                    </div>

                    {/* Mobile Number & Role Dropdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="mobileno" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                            <input id="mobileno" type="text" name="mobileno" value={formData.mobileno} onChange={handleChange}
                                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.mobileno ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}`} />
                            {errors.mobileno && <p className="mt-1 text-sm text-red-600">{errors.mobileno}</p>}
                        </div>
                        <div>
                            <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select id="role_id" name="role_id" value={formData.role_id} onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-gray-400" required>
                                <option value="">Select Role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ── Last Training Date (Visible only when changing from Agent Trainee) ── */}
                    {isChangingFromAgentTrainee && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <label htmlFor="last_training" className="block text-sm font-medium text-blue-800 mb-1">
                                Last Training Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <DatePicker
                                    id="last_training"
                                    selected={formData.last_training}
                                    onChange={(date) => setFormData({ ...formData, last_training: date })}
                                    className={`w-full px-4 py-2.5 pl-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.last_training ? "border-red-500 bg-red-50" : "border-blue-300 hover:border-blue-400"}`}
                                    dateFormat="yyyy/MM/dd"
                                    placeholderText="Select Last Training Date"
                                    maxDate={new Date()}
                                />
                            </div>
                            {errors.last_training && <p className="mt-1 text-sm text-red-600">{errors.last_training}</p>}
                            <p className="mt-1 text-xs text-blue-600">Required when promoting/changing role from Agent Trainee.</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button type="submit" disabled={loading}
                            className={`w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? "cursor-not-allowed opacity-70" : "transform hover:-translate-y-0.5"}`}>
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                "Update Profile"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Enlarge / lightbox */}
            {isImageOpen && formData.profile_pic && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setIsImageOpen(false)}
                >
                    <button
                        type="button"
                        onClick={() => setIsImageOpen(false)}
                        className="absolute top-4 right-4 text-white/80 hover:text-white"
                        title="Close"
                    >
                        <FaTimes className="h-7 w-7" />
                    </button>
                    <img
                        src={formData.profile_pic}
                        alt="Profile"
                        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}