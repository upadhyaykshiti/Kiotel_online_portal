
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";

// export default function TicketCreateForm() {
//   const router = useRouter();
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [attachments, setAttachments] = useState(null);

//   const handleTitleChange = (e) => {
//     setTitle(e.target.value);
//   };

//   const handleDescriptionChange = (e) => {
//     setDescription(e.target.value);
//   };

//   const handleAttachmentsChange = (e) => {
//     setAttachments(e.target.files);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("description", description);

//     if (attachments) {
//       for (let i = 0; i < attachments.length; i++) {
//         formData.append("attachments", attachments[i]);
//       }
//     }

//     try {
//       const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ticket`, formData, {
//         withCredentials: true,  // Important for sending/receiving cookies
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       console.log("Ticket created successfully", response.data);
//       router.push("/Helpdesk");
//     } catch (error) {
//       console.error("There was an error creating the ticket!", error);
//       if (error.response) {
//         console.error("Error response data:", error.response.data);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
//       >
//         <h2 className="text-2xl font-bold mb-6 text-center">Create New Ticket</h2>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
//           <input
//             type="text"
//             value={title}
//             onChange={handleTitleChange}
//             className="w-full px-3 py-2 border rounded-lg text-gray-700"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
//           <textarea
//             value={description}
//             onChange={handleDescriptionChange}
//             className="w-full px-3 py-2 border rounded-lg"
//             rows="4"
//             required
//           ></textarea>
//         </div>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Attachments</label>
//           <input
//             type="file"
//             multiple
//             onChange={handleAttachmentsChange}
//             className="w-full px-3 py-2 border rounded-lg"
//           />
//         </div>

//         <div className="flex justify-center">
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded-lg"
//           >
//             Submit
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }


// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function TicketCreateForm() {
//   const router = useRouter();
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [attachments, setAttachments] = useState(null);

//   const handleTitleChange = (e) => {
//     setTitle(e.target.value);
//   };

//   const handleDescriptionChange = (e) => {
//     setDescription(e.target.value);
//   };

//   const handleAttachmentsChange = (e) => {
//     setAttachments(e.target.files);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("description", description);

//     if (attachments) {
//       for (let i = 0; i < attachments.length; i++) {
//         formData.append("attachments", attachments[i]);
//       }
//     }

//     try {
//       const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ticket`, formData, {
//         withCredentials: true,  // Important for sending/receiving cookies
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       // Show success toast
//       toast.success("Ticket created successfully!", {
//         position: "top-center", // Use string instead of constant
//         autoClose: 3000, // Automatically close after 3 seconds
//         theme: "colored",
//       });

//       // After a delay, redirect to Helpdesk
//       setTimeout(() => {
//         router.push("/Helpdesk");
//       }, 3000); // 3-second delay before redirection
//     } catch (error) {
//       console.error("There was an error creating the ticket!", error);
//       if (error.response) {
//         console.error("Error response data:", error.response.data);
//       }

//       // Show error toast
//       toast.error("Failed to create the ticket!", {
//         position: "top-center", // Use string instead of constant
//         autoClose: 5000, // Automatically close after 5 seconds
//         theme: "colored",
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
//       >
//         <h2 className="text-2xl font-bold mb-6 text-center">Create New Ticket</h2>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
//           <input
//             type="text"
//             value={title}
//             onChange={handleTitleChange}
//             className="w-full px-3 py-2 border rounded-lg text-gray-700"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
//           <textarea
//             value={description}
//             onChange={handleDescriptionChange}
//             className="w-full px-3 py-2 border rounded-lg"
//             rows="4"
//             required
//           ></textarea>
//         </div>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Attachments</label>
//           <input
//             type="file"
//             multiple
//             onChange={handleAttachmentsChange}
//             className="w-full px-3 py-2 border rounded-lg"
//           />
//         </div>

//         <div className="flex justify-center">
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded-lg"
//           >
//             Submit
//           </button>
//         </div>
//       </form>

//       {/* Toast Container for showing notifications */}
//       <ToastContainer />
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TicketCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState(null);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleAttachmentsChange = (e) => {
    setAttachments(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    if (attachments) {
      for (let i = 0; i < attachments.length; i++) {
        formData.append("attachments", attachments[i]);
      }
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ticket`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Show different messages based on response
      const message = response.data.message;
      if (message.includes("but email failed")) {
        toast.warn(message, {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      } else {
        toast.success(message, {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      }

      setTimeout(() => {
        router.push("/Helpdesk");
      }, 3000);
    } catch (error) {
      console.error("Error creating the ticket!", error);
      const errorMessage =
        error.response && error.response.data
          ? error.response.data.error || "Failed to create the ticket!"
          : "An error occurred. Please try again.";

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Create New Ticket</h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="w-full px-3 py-2 border rounded-lg text-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            className="w-full px-3 py-2 border rounded-lg"
            rows="4"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Attachments</label>
          <input
            type="file"
            multiple
            onChange={handleAttachmentsChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Toast Container for showing notifications */}
      <ToastContainer />
    </div>
  );
}



// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function TicketCreateForm() {
//   const router = useRouter();
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [attachments, setAttachments] = useState(null);

//   const handleTitleChange = (e) => {
//     setTitle(e.target.value);
//   };

//   const handleDescriptionChange = (e) => {
//     setDescription(e.target.value);
//   };

//   const handleAttachmentsChange = (e) => {
//     setAttachments(e.target.files);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("description", description);

//     if (attachments) {
//       for (let i = 0; i < attachments.length; i++) {
//         formData.append("attachments", attachments[i]);
//       }
//     }

//     try {
//       // Sending ticket data to the backend
//       const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ticket`, formData, {
//         withCredentials: true,
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       // Automatically sending email notification after successful ticket creation
//       await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/send-email`, {
//         title: title,
//         description: description,
//       });

//       // Show success toast
//       toast.success("Ticket created and email sent successfully!", {
//         position: "top-center",
//         autoClose: 3000,
//         theme: "colored",
//       });

//       // Redirect to Helpdesk after a delay
//       setTimeout(() => {
//         router.push("/Helpdesk");
//       }, 3000);
//     } catch (error) {
//       console.error("There was an error creating the ticket or sending email!", error);

//       toast.error("Failed to create the ticket or send email!", {
//         position: "top-center",
//         autoClose: 5000,
//         theme: "colored",
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
//       >
//         <h2 className="text-2xl font-bold mb-6 text-center">Create New Ticket</h2>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
//           <input
//             type="text"
//             value={title}
//             onChange={handleTitleChange}
//             className="w-full px-3 py-2 border rounded-lg text-gray-700"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
//           <textarea
//             value={description}
//             onChange={handleDescriptionChange}
//             className="w-full px-3 py-2 border rounded-lg"
//             rows="4"
//             required
//           ></textarea>
//         </div>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Attachments</label>
//           <input
//             type="file"
//             multiple
//             onChange={handleAttachmentsChange}
//             className="w-full px-3 py-2 border rounded-lg"
//           />
//         </div>

//         <div className="flex justify-center">
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded-lg"
//           >
//             Submit
//           </button>
//         </div>
//       </form>

//       {/* Toast Container for showing notifications */}
//       <ToastContainer />
//     </div>
//   );
// }
