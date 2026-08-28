
// components/TicketReplyForm.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaPaperclip,
  FaTasks,
  FaPaperPlane,
  FaChevronLeft,
  FaInfoCircle
} from "react-icons/fa";

export default function TicketReplyForm({ params }) {
  const router = useRouter();
  const { taskId } = params;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState(null);
  const [status, setStatus] = useState(1);
  const [statusOptions, setStatusOptions] = useState([]);
  const [roleId, setRoleId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialTitle, setInitialTitle] = useState("");

  useEffect(() => {
    const initializeForm = async () => {
      try {
        // Fetch ticket details
        const ticketResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/${taskId}/v2`,
          { withCredentials: true }
        );
        setInitialTitle(ticketResponse.data.title);
        setTitle(ticketResponse.data.title);

        // Fetch status options
        const statusResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/status`,
          { withCredentials: true }
        );
        setStatusOptions(statusResponse.data);

        // Fetch user role
        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        setRoleId(userResponse.data.role);
        setCurrentUserId(userResponse.data.id);
      } catch (error) {
        console.error("Error initializing form:", error);
        toast.error("Failed to load form data");
      }
    };

    if (taskId) initializeForm();
  }, [taskId]);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleAttachmentsChange = (e) => {
    setAttachments(e.target.files);
  };

  const handleStatusChange = (e) => {
    setStatus(Number(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", initialTitle); // Use original title
    formData.append("description", description);
    formData.append("status_id", status); // Include status

    if (attachments) {
      for (let i = 0; i < attachments.length; i++) {
        formData.append("attachments", attachments[i]);
      }
    }

    if (!currentUserId) {
      toast.error("Could not identify the current user. Please refresh and try again.");
      setLoading(false);
      return;
    }

    try {
      // Reply now goes through the Node v2 API (attachments -> DigitalOcean Spaces).
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/${taskId}/reply/v2`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
            "x-user-id": currentUserId,
          },
        }
      );

      toast.success("Reply submitted successfully!");
      setTimeout(() => {
        router.push(`/TaskManager/task/${taskId}`);
      }, 1500);
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("Failed to submit reply");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
                <FaTasks className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Reply to Task</h1>
                <p className="text-indigo-100 mt-1">Add your response to task #{taskId}</p>
              </div>
            </div>
          </div>
{/*
  Working on resolving the ongoing issues regarding Task Manager and schduling module. Resolved the issues with the
  Task Manager, which was regarding the mails not been transmisted were resolved earler as well as the other 
  requirents of the search bar as well as the proper display is also done and updated, For the schedule module
  the requirement with the auto reduction is paid leave is been added and updated the server with othe requiremnts.
 */}
          <form onSubmit={handleSubmit} className="px-6 py-8">
            <div className="space-y-6">
              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={title}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 cursor-not-allowed"
                />
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Reply
                </label>
                <textarea
                  id="description"
                  rows={6}
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Write your response here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-white"
                  required
                ></textarea>
              </div>

              {/* Status Dropdown (Conditional) */}
              {/* {(roleId === 1 || roleId === 3) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                  <select
                    value={status}
                    onChange={handleStatusChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 hover:border-gray-400"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              )} */}

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaPaperclip className="mr-2 text-indigo-500" />
                  Attachments
                </label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, DOC, JPG, PNG (Max 10MB)</p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleAttachmentsChange}
                    />
                  </label>
                </div>
                {attachments && attachments.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p className="font-medium">Selected files:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {Array.from(attachments).map((file, index) => (
                        <li key={index} className="truncate">{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <FaChevronLeft className="mr-2" />
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transform hover:-translate-y-0.5 shadow-indigo-200/50"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Submit Reply
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}