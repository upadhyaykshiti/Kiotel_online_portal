// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";

// export default function TicketReplyForm() {
//   const router = useRouter();
//   const { ticketId, title: titleFromQuery } = router.query;

//   const [title, setTitle] = useState(titleFromQuery || "");
//   const [description, setDescription] = useState("");
//   const [attachments, setAttachments] = useState(null);
//   const [status, setStatus] = useState("1"); // Default status ID (corresponds to 'Open')
//   const [statusOptions, setStatusOptions] = useState([]); // Dropdown options

//   useEffect(() => {
//     if (!title && ticketId) {
//       const fetchTicketTitle = async () => {
//         try {
//           const response = await axios.get(`http://localhost:8080/api/tickets/${ticketId}`, {
//             withCredentials: true,
//           });
//           setTitle(response.data.title); // Set the title fetched from the API
//         } catch (err) {
//           console.error("Error fetching ticket title:", err);
//         }
//       };

//       fetchTicketTitle();
//     }

//     const fetchStatusOptions = async () => {
//       try {
//         const response = await axios.get(`http://localhost:8080/api/status`, {
//           withCredentials: true,
//         });
//         setStatusOptions(response.data); // Set dropdown options
//       } catch (err) {
//         console.error("Error fetching status options:", err);
//       }
//     };

//     fetchStatusOptions();
//   }, [ticketId, title]);

//   const handleDescriptionChange = (e) => {
//     setDescription(e.target.value);
//   };

//   const handleAttachmentsChange = (e) => {
//     setAttachments(e.target.files);
//   };

//   const handleStatusChange = (e) => {
//     setStatus(e.target.value); // Set the status ID based on dropdown selection
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Debugging output
//     console.log("Submitting form...");
//     console.log("Ticket ID:", ticketId);
//     console.log("Description:", description);
//     console.log("Status ID:", status);

//     if (!ticketId) {
//       console.error("No ticket ID provided");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("description", description);
//     formData.append("status_id", status); // Include status ID in the form data

//     if (attachments) {
//       for (let i = 0; i < attachments.length; i++) {
//         formData.append("attachments", attachments[i]);
//       }
//     }

//     try {
//       const response = await axios.post(`http://localhost:8080/api/tickets/${ticketId}/reply`, formData, {
//         withCredentials: true, // Important for sending/receiving cookies
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       console.log("Reply submitted successfully", response.data);
//       router.push("/thank-you");
//     } catch (error) {
//       console.error("There was an error submitting the reply!", error);
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
//         <h2 className="text-2xl font-bold mb-6 text-center">Reply to Ticket</h2>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
//           <input
//             type="text"
//             value={title}
//             className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700"
//             readOnly
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
//           <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
//           <select
//             value={status}
//             onChange={handleStatusChange}
//             className="w-full px-3 py-2 border rounded-lg"
//           >
//             {statusOptions.map((option) => (
//               <option key={option.id} value={option.id}>
//                 {option.name}
//               </option>
//             ))}
//           </select>
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
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";

// export default function TicketReplyForm() {
//   const router = useRouter();
//   const { query } = router;
  
//   // Debug: Print the query object
//   console.log("Router query:", query);

//   const [ticketId, setTicketId] = useState(null); // Initialize as null
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [attachments, setAttachments] = useState(null);
//   const [status, setStatus] = useState("1"); // Default status ID (corresponds to 'Open')
//   const [statusOptions, setStatusOptions] = useState([]); // Dropdown options

//   useEffect(() => {
//     // Check if query and ticketId are defined
//     if (query && query.ticketId) {
//       setTicketId(query.ticketId);
//     }

//     if (ticketId) {
//       const fetchTicketTitle = async () => {
//         try {
//           const response = await axios.get(`http://localhost:8080/api/tickets/${ticketId}`, {
//             withCredentials: true,
//           });
//           setTitle(response.data.title); // Set the title fetched from the API
//         } catch (err) {
//           console.error("Error fetching ticket title:", err);
//         }
//       };

//       fetchTicketTitle();
//     }

//     const fetchStatusOptions = async () => {
//       try {
//         const response = await axios.get(`http://localhost:8080/api/status`, {
//           withCredentials: true,
//         });
//         setStatusOptions(response.data); // Set dropdown options
//       } catch (err) {
//         console.error("Error fetching status options:", err);
//       }
//     };

//     fetchStatusOptions();
//   }, [query, ticketId]); // Dependencies for effect

//   const handleDescriptionChange = (e) => {
//     setDescription(e.target.value);
//   };

//   const handleAttachmentsChange = (e) => {
//     setAttachments(e.target.files);
//   };

//   const handleStatusChange = (e) => {
//     setStatus(e.target.value); // Set the status ID based on dropdown selection
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Debugging output
//     console.log("Submitting form...");
//     console.log("Ticket ID:", ticketId);
//     console.log("Description:", description);
//     console.log("Status ID:", status);

//     if (!ticketId) {
//       console.error("No ticket ID provided");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("description", description);
//     formData.append("status_id", status); // Include status ID in the form data

//     if (attachments) {
//       for (let i = 0; i < attachments.length; i++) {
//         formData.append("attachments", attachments[i]);
//       }
//     }

//     try {
//       const response = await axios.post(`http://localhost:8080/api/tickets/${ticketId}/reply`, formData, {
//         withCredentials: true, // Important for sending/receiving cookies
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       console.log("Reply submitted successfully", response.data);
//       router.push("/thank-you");
//     } catch (error) {
//       console.error("There was an error submitting the reply!", error);
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
//         <h2 className="text-2xl font-bold mb-6 text-center">Reply to Ticket</h2>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
//           <input
//             type="text"
//             value={title}
//             className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700"
//             readOnly
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
//           <textarea
//             value={description}
//             onChange={handleDescriptionChange}
//             className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700"
//             rows="4"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Attachments</label>
//           <input
//             type="file"
//             multiple
//             onChange={handleAttachmentsChange}
//             className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
//           <select
//             value={status}
//             onChange={handleStatusChange}
//             className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700"
//             required
//           >
//             {statusOptions.map(option => (
//               <option key={option.id} value={option.id}>
//                 {option.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button
//           type="submit"
//           className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//         >
//           Submit Reply
//         </button>
//       </form>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function TicketReplyForm({ params }) {
  const router = useRouter();
  const { ticketId } = params; // Extract ticketId from route parameters
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState(null);
  const [status, setStatus] = useState(1); // Default status ID
  const [statusOptions, setStatusOptions] = useState([]); // Dropdown options

  // To handle window-specific code
  const [titleFromQuery, setTitleFromQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Only run this code on the client side
      const queryTitle = new URLSearchParams(window.location.search).get("title");
      setTitleFromQuery(queryTitle || "");
    }
  }, []);

  useEffect(() => {
    setTitle(titleFromQuery);

    if (ticketId) {
      const fetchTicketTitle = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/tickets/${ticketId}`, {
            withCredentials: true,
          });
          setTitle(response.data.title); // Set the title fetched from the API
        } catch (err) {
          console.error("Error fetching ticket title:", err);
        }
      };

      fetchTicketTitle();
    }

    const fetchStatusOptions = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/status`, {
          withCredentials: true,
        });
        setStatusOptions(response.data); // Set dropdown options
      } catch (err) {
        console.error("Error fetching status options:", err);
      }
    };

    fetchStatusOptions();
  }, [ticketId, titleFromQuery]);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleAttachmentsChange = (e) => {
    setAttachments(e.target.files);
  };

  const handleStatusChange = (e) => {
    setStatus(Number(e.target.value)); // Convert to number
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticketId) {
      console.error("Ticket ID is missing");
      return;
    }

    const formData = new FormData();
    formData.append("title", title); // Title is set from the fetched data
    formData.append("description", description);
    formData.append("status", status); // Add status to the form data

    if (attachments) {
      for (let i = 0; i < attachments.length; i++) {
        formData.append("attachments", attachments[i]);
      }
    }

    try {
      const response = await axios.post(`http://localhost:8080/api/tickets/${ticketId}/reply`, formData, {
        withCredentials: true, // Important for sending/receiving cookies
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Reply submitted successfully", response.data);
      router.push("/thank-you");
    } catch (error) {
      console.error("There was an error submitting the reply!", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Reply to Ticket</h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
          <input
            type="text"
            value={title}
            className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700"
            readOnly
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
          <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
          <select
            value={status}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {statusOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
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
    </div>
  );
}





// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";

// export default function TicketReplyForm({ params }) {
//   const router = useRouter();
//   const { ticketId } = params; // Extract ticketId from route parameters
//   const titleFromQuery = new URLSearchParams(window.location.search).get("title"); // Extract title from query parameters

//   // Log the ticketId to debug
//   useEffect(() => {
//     console.log("Ticket ID:", ticketId);
//   }, [ticketId]);

//   const [title, setTitle] = useState(titleFromQuery || "");
//   const [description, setDescription] = useState("");
//   const [attachments, setAttachments] = useState(null);
//   const [status, setStatus] = useState(1); // Default status ID
//   const [statusOptions, setStatusOptions] = useState([]); // Dropdown options

//   useEffect(() => {
//     if (!title && ticketId) {
//       const fetchTicketTitle = async () => {
//         try {
//           const response = await axios.get(`http://localhost:8080/api/tickets/${ticketId}`, {
//             withCredentials: true,
//           });
//           setTitle(response.data.title); // Set the title fetched from the API
//         } catch (err) {
//           console.error("Error fetching ticket title:", err);
//         }
//       };

//       fetchTicketTitle();
//     }

//     const fetchStatusOptions = async () => {
//       try {
//         const response = await axios.get(`http://localhost:8080/api/status`, {
//           withCredentials: true,
//         });
//         setStatusOptions(response.data); // Set dropdown options
//       } catch (err) {
//         console.error("Error fetching status options:", err);
//       }
//     };

//     fetchStatusOptions();
//   }, [ticketId, title]);

//   const handleDescriptionChange = (e) => {
//     setDescription(e.target.value);
//   };

//   const handleAttachmentsChange = (e) => {
//     setAttachments(e.target.files);
//   };

//   const handleStatusChange = (e) => {
//     setStatus(Number(e.target.value)); // Convert to number
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!ticketId) {
//       console.error("Ticket ID is missing");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("title", title); // Title is set from the fetched data
//     formData.append("description", description);
//     formData.append("status", status); // Add status to the form data

//     if (attachments) {
//       for (let i = 0; i < attachments.length; i++) {
//         formData.append("attachments", attachments[i]);
//       }
//     }

//     try {
//       const response = await axios.post(`http://localhost:8080/api/tickets/${ticketId}/reply`, formData, {
//         withCredentials: true, // Important for sending/receiving cookies
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       console.log("Reply submitted successfully", response.data);
//       router.push("/thank-you");
//     } catch (error) {
//       console.error("There was an error submitting the reply!", error);
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
//         <h2 className="text-2xl font-bold mb-6 text-center">Reply to Ticket</h2>

//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
//           <input
//             type="text"
//             value={title}
//             className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700"
//             readOnly
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
//           <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
//           <select
//             value={status}
//             onChange={handleStatusChange}
//             className="w-full px-3 py-2 border rounded-lg"
//           >
//             {statusOptions.map((option) => (
//               <option key={option.id} value={option.id}>
//                 {option.name}
//               </option>
//             ))}
//           </select>
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
