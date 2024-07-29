

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import axios from "axios";

// export default function TicketReplyForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const ticketId = searchParams.get("ticketId"); // Extract ticketId from query parameters
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [attachments, setAttachments] = useState(null);

//   useEffect(() => {
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
//   }, [ticketId]);

//   const handleDescriptionChange = (e) => {
//     setDescription(e.target.value);
//   };

//   const handleAttachmentsChange = (e) => {
//     setAttachments(e.target.files);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("title", title); // Title is set from the fetched data
//     formData.append("description", description);

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


"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function TicketReplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("ticketId"); // Extract ticketId from query parameters
  const titleFromQuery = searchParams.get("title"); // Extract title from query parameters
  const [title, setTitle] = useState(titleFromQuery || "");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState(null);

  useEffect(() => {
    if (!title && ticketId) {
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
  }, [ticketId, title]);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleAttachmentsChange = (e) => {
    setAttachments(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title); // Title is set from the fetched data
    formData.append("description", description);

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
