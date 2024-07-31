


// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";

// const TicketReplyForm = ({ params }) => {
//   const router = useRouter();
//   const { ticketId } = params; // Use router.query to get the ticketId from the URL
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [attachments, setAttachments] = useState(null);
//   const [status, setStatus] = useState(1); // Default status ID
//   const [statusOptions, setStatusOptions] = useState([]); // Dropdown options

//   // To handle window-specific code
//   const [titleFromQuery, setTitleFromQuery] = useState("");

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       // Only run this code on the client side
//       const queryTitle = new URLSearchParams(window.location.search).get("title");
//       setTitleFromQuery(queryTitle || "");
//     }
//   }, []);

//   useEffect(() => {
//     setTitle(titleFromQuery);

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
//   }, [ticketId, titleFromQuery]);

//   const handleDescriptionChange = (e) => {
//     setDescription(e.target.value);
//   };

//   const handleAttachmentsChange = (e) => {
//     setAttachments(e.target.files);
//   };

//   const handleStatusChange = (e) => {
//     const selectedStatus = Number(e.target.value); // Convert to number
//     setStatus(selectedStatus);
//     console.log("Selected Status ID:", selectedStatus); // Log the selected status ID
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
//     formData.append("status_id", status); // Use "status_id" as the field name
  
//     if (attachments) {
//       for (let i = 0; i < attachments.length; i++) {
//         formData.append("attachments", attachments[i]);
//       }
//     }
  
//     // Log form data
//     for (let pair of formData.entries()) {
//       console.log(`${pair[0]}: ${pair[1]}`);
//     }
  
//     try {
//       const response = await axios.post(`http://localhost:8080/api/tickets/${ticketId}/reply`, formData, {
//         withCredentials: true, // Important for sending/receiving cookies
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
  
//       console.log("Reply submitted successfully", response.data);
//       // router.push("/thank-you");
//       router.push(`/Helpdesk/ticket/${ticket.id}`);
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
// };

// Export the component as default
// export default TicketReplyForm;


"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const TicketReplyForm = ({ params }) => {
  const router = useRouter();
  const { ticketId } = params; // Use router.query to get the ticketId from the URL
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
    const selectedStatus = Number(e.target.value); // Convert to number
    setStatus(selectedStatus);
    console.log("Selected Status ID:", selectedStatus); // Log the selected status ID
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
    formData.append("status_id", status); // Use "status_id" as the field name
  
    if (attachments) {
      for (let i = 0; i < attachments.length; i++) {
        formData.append("attachments", attachments[i]);
      }
    }
  
    // Log form data
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  
    try {
      const response = await axios.post(`http://localhost:8080/api/tickets/${ticketId}/reply`, formData, {
        withCredentials: true, // Important for sending/receiving cookies
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Reply submitted successfully", response.data);
      router.push(`/Helpdesk/ticket/${ticketId}`);
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
};

// Export the component as default
export default TicketReplyForm;

