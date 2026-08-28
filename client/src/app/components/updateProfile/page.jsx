
"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaIdCard, FaCalendar, FaMapMarkerAlt, FaUserShield, FaSave, FaArrowLeft, FaEye, FaEyeSlash, FaCamera } from 'react-icons/fa';

const UpdateProfile = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailid: '',
    password: '',
    currentPassword: '',
    fname: '',
    lname: '',
    dob: null,
    address: '',
    account_no: '',
    mobileno: '',
    role_id: '',
    profile_pic: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, { withCredentials: true });
        const role = response.data.role;
        setUserRole(role);
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        setErrors(prev => ({ ...prev, role: 'Failed to fetch user role' }));
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles`, { withCredentials: true });
        setRoles(response.data);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        setErrors(prev => ({ ...prev, roles: 'Failed to fetch roles' }));
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (userRole) {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile`, { withCredentials: true });
          const { data } = response;
          setFormData({
            emailid: data.emailid || '',
            password: data.password || '',
            currentPassword: data.password || '',
            fname: data.fname || '',
            lname: data.lname || '',
            dob: data.dob ? new Date(data.dob) : null,
            address: data.address || '',
            account_no: data.account_no || '',
            mobileno: data.mobileno || '',
            role_id: userRole,
            profile_pic: data.profile_pic || ''
          });
          setProfilePreview(data.profile_pic || '');
        } catch (error) {
          console.error('Error fetching profile data:', error);
          setErrors(prev => ({ ...prev, profile: 'Error fetching profile data' }));
        }
      }
    };

    fetchProfileData();
  }, [userRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSaveSuccess(false);

    const formattedDob = formData.dob ? moment(formData.dob).format('YYYY-MM-DD') : null;

    const validationErrors = {};

    if (passwordChanged && formData.password !== confirmPassword) {
      validationErrors.password = "Passwords do not match.";
      setPasswordMatch(false);
    }

    if (!formData.mobileno) {
      validationErrors.mobileno = "Contact number is required.";
    }

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      let uploadedProfileUrl = formData.profile_pic;

      if (profileImageFile) {
        const uploadData = new FormData();
        uploadData.append('file', profileImageFile);
        const uploadRes = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload/profile`,
          uploadData,
          { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
        );
        uploadedProfileUrl = uploadRes.data?.url || uploadedProfileUrl;
      }

      const updatedData = {
        ...formData,
        dob: formattedDob,
        profile_pic: uploadedProfileUrl
      };

      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/update`, updatedData, { withCredentials: true });

      setSaveSuccess(true);
      setTimeout(() => {
        router.push("/Dashboard");
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors(prev => ({ ...prev, form: 'Error updating profile. Please try again.' }));
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData(prevState => ({ ...prevState, password: newPassword }));
    
    if (newPassword !== formData.currentPassword) {
      setPasswordChanged(true);
    } else {
      setPasswordChanged(false);
      setConfirmPassword('');
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  if (loading && !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <button
            onClick={() => router.push('/Dashboard')}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
                  <FaUser className="text-white text-xl sm:text-2xl" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Update Profile</h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">Manage your personal information</p>
                </div>
              </div>
              {formData.account_no && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl px-4 sm:px-6 py-3 shadow-lg">
                  <div className="flex items-center gap-2 text-white">
                    <FaIdCard className="text-lg sm:text-xl flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-blue-100">Employee ID</p>
                      <p className="text-lg sm:text-xl font-bold tracking-wide truncate">{formData.account_no}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 animate-slideDown">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                <FaSave className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Profile Updated Successfully!</p>
                <p className="text-sm text-green-600">Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaUser />
                Personal Information
              </h2>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <FaUser className="text-gray-400 text-2xl" />
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                    <FaCamera />
                    Upload
                    <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              {(formData.fname || formData.lname) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {formData.fname && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="fname"
                          value={formData.fname}
                          readOnly
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none cursor-not-allowed text-gray-600"
                        />
                      </div>
                    </div>
                  )}

                  {formData.lname && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="lname"
                          value={formData.lname}
                          readOnly
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none cursor-not-allowed text-gray-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formData.emailid && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="emailid"
                      value={formData.emailid}
                      readOnly
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none cursor-not-allowed text-gray-600"
                    />
                  </div>
                </div>
              )}

              {formData.dob && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Joining</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <FaCalendar className="text-gray-400" />
                    </div>
                    <DatePicker
                      selected={formData.dob}
                      dateFormat="MMMM dd, yyyy"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none cursor-not-allowed text-gray-600"
                      readOnly
                      disabled
                    />
                  </div>
                </div>
              )}

              {formData.address && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <textarea
                      name="address"
                      value={formData.address}
                      readOnly
                      rows="3"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none cursor-not-allowed text-gray-600 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaUserShield />
                Security & Contact
              </h2>
              <p className="text-blue-100 text-sm mt-1">You can edit these fields</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number <span className="text-blue-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaPhone className="text-blue-600" />
                  </div>
                  <input
                    type="text"
                    name="mobileno"
                    value={formData.mobileno}
                    onChange={handleChange}
                    placeholder="Enter your contact number"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                {errors.mobileno && <p className="text-red-600 text-sm mt-2 flex items-center gap-1">⚠ {errors.mobileno}</p>}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-blue-600" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordChanged && (
                    <p className="text-blue-600 text-xs mt-2 flex items-center gap-1">
                      ℹ️ You are changing your password
                    </p>
                  )}
                </div>

                {passwordChanged && (
                  <div className="animate-slideDown">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="text-blue-600" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordMatch(e.target.value === formData.password);
                        }}
                        placeholder="Confirm your new password"
                        className="w-full pl-11 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {!passwordMatch && confirmPassword && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">⚠ Passwords do not match</p>
                    )}
                    {passwordMatch && confirmPassword && (
                      <p className="text-green-600 text-sm mt-2 flex items-center gap-1">✓ Passwords match</p>
                    )}
                  </div>
                )}
              </div>

              {errors.password && <p className="text-red-600 text-sm flex items-center gap-1">⚠ {errors.password}</p>}
            </div>
          </div>

          {errors.form && (
            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4">
              <p className="text-red-800 font-medium flex items-center gap-2">
                ⚠ {errors.form}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/Dashboard')}
              className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default UpdateProfile;