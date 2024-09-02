// "use client";

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';

// export default function TicketDetails({ params }) {
//   const ticketId = params.ticketId;
//   const [ticketDetails, setTicketDetails] = useState(null);
//   const [replies, setReplies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     if (ticketId) {
//       const fetchTicketDetails = async () => {
//         try {
//           const [ticketResponse, repliesResponse] = await Promise.all([
//             axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tickets/${ticketId}`, {
//               withCredentials: true,
//             }),
//             axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ticket/${ticketId}/replies`, {
//               withCredentials: true,
//             }),
//           ]);

//           if (ticketResponse.data.error) {
//             setError(ticketResponse.data.error);
//           } else {
//             setTicketDetails(ticketResponse.data);
//             setReplies(repliesResponse.data);
//           }
//         } catch (err) {
//           console.error("Error fetching ticket details:", err);
//           const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
//           setError(errorMessage);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchTicketDetails();
//     }
//   }, [ticketId]);

//   if (loading) return <p className="text-center text-gray-700">Loading...</p>;
//   if (error) return <p className="text-center text-red-600">Error loading ticket details: {error}</p>;

//   if (!ticketDetails) {
//     return <p className="text-center text-gray-700">No ticket details available.</p>;
//   }

//   const attachments = Array.isArray(ticketDetails.attachments) ? ticketDetails.attachments : [];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6">
//       <header className="bg-white shadow-lg rounded-lg mb-6">
//         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//           <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide">Ticket Details</h1>
//           <button
//             onClick={() => router.push(`/Helpdesk/ticket/${ticketId}/replyTicket?title=${encodeURIComponent(ticketDetails.title)}`)}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
//           >
//             Reply to Ticket
//           </button>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg mb-6 p-6">
//         <div className="border-b border-gray-200 pb-4 mb-4">
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Ticket #{ticketDetails.id}</h2>
//           <p><strong className="font-medium text-gray-700">Title:</strong> {ticketDetails.title}</p>
//           <p><strong className="font-medium text-gray-700">Created At:</strong> {new Date(ticketDetails.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
//           <p><strong className="font-medium text-gray-700">Status:</strong> {ticketDetails.status_name}</p>
//           <p><strong className="font-medium text-gray-700">Created_by:</strong> {ticketDetails.fname}</p>
//         </div>
//         <label htmlFor="">Descriptions</label>
//         <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
//           <p className="text-gray-700 whitespace-pre-line">{ticketDetails.description}</p>
//         </div>


// {replies.length > 0 && (
//   <div className="mt-8">
//     <h3 className="text-2xl font-bold text-gray-900 mb-6">Replies:</h3>
//     <div className="space-y-6">
//       {replies.map((reply, index) => (
//         <div
//           key={index}
//           className="bg-white border border-gray-300 shadow-sm rounded-lg p-5 transition-transform transform hover:-translate-y-1"
//         >
//           <div className="flex items-center justify-between mb-2">
//             <p className="text-lg font-semibold text-blue-600">
//               {reply.fname}
//             </p>
//             <span className="text-sm text-gray-400">
//               {new Date(reply.created_at).toLocaleString("en-US", {
//                 timeZone: "America/Chicago",
//                 weekday: "short",
//                 year: "numeric",
//                 month: "short",
//                 day: "numeric",
//                 hour: "2-digit",
//                 minute: "2-digit",
//               })}
//             </span>
//           </div>
//           <p className="text-gray-700 mt-4 leading-relaxed whitespace-pre-line">
//             {reply.reply_text}
//           </p>
//         </div>
//       ))}
//     </div>
//   </div>
// )}


//         {attachments.length > 0 && (
//           <div className="mt-6">
//             <h3 className="text-xl font-semibold text-gray-800 mb-4">Attachments:</h3>
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//               {attachments.map((attachment, index) => (
//                 <div key={index} className="relative group overflow-hidden rounded-lg shadow-md">
//                   <a
//                     href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${attachment}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="block"
//                   >
//                     <img
//                       src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${attachment}`}
//                       alt={`Attachment ${index + 1}`}
//                       className="w-full h-32 object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-105"
//                     />
//                   </a>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';

// export default function TicketDetails({ params }) {
//   const ticketId = params.ticketId;
//   const [ticketDetails, setTicketDetails] = useState(null);
//   const [replies, setReplies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     if (ticketId) {
//       const fetchTicketDetails = async () => {
//         try {
//           const [ticketResponse, repliesResponse] = await Promise.all([
//             axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tickets/${ticketId}`, {
//               withCredentials: true,
//             }),
//             axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ticket/${ticketId}/replies`, {
//               withCredentials: true,
//             }),
//           ]);

//           if (ticketResponse.data.error) {
//             setError(ticketResponse.data.error);
//           } else {
//             setTicketDetails(ticketResponse.data);
//             setReplies(repliesResponse.data);
//             console.log(repliesResponse.attachments)
//             console.log(ticketResponse.attachments)
//           }
//         } catch (err) {
//           console.error("Error fetching ticket details:", err);
//           const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
//           setError(errorMessage);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchTicketDetails();
//     }
//   }, [ticketId]);

//   if (loading) return <p className="text-center text-gray-700">Loading...</p>;
//   if (error) return <p className="text-center text-red-600">Error loading ticket details: {error}</p>;

//   if (!ticketDetails) {
//     return <p className="text-center text-gray-700">No ticket details available.</p>;
//   }

//   const attachments = Array.isArray(ticketDetails.attachments) ? ticketDetails.attachments : [];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6">
//       <header className="bg-white shadow-lg rounded-lg mb-6">
//         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//           <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide">Ticket Details</h1>
//           <button
//             onClick={() => router.push(`/Helpdesk/ticket/${ticketId}/replyTicket?title=${encodeURIComponent(ticketDetails.title)}`)}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
//           >
//             Reply to Ticket
//           </button>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg mb-6 p-6">
//         <div className="border-b border-gray-200 pb-4 mb-4">
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Ticket #{ticketDetails.id}</h2>
//           <p><strong className="font-medium text-gray-700">Title:</strong> {ticketDetails.title}</p>
//           <p><strong className="font-medium text-gray-700">Created At:</strong> {new Date(ticketDetails.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
//           <p><strong className="font-medium text-gray-700">Status:</strong> {ticketDetails.status_name}</p>
//           <p><strong className="font-medium text-gray-700">Created_by:</strong> {ticketDetails.fname}</p>
//         </div>
//         <label htmlFor="">Descriptions</label>
//         <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
//           <p className="text-gray-700 whitespace-pre-line">{ticketDetails.description}</p>
//         </div>

//         {replies.length > 0 && (
//           <div className="mt-8">
//             <h3 className="text-2xl font-bold text-gray-900 mb-6">Replies:</h3>
//             <div className="space-y-6">
//               {replies.map((reply, index) => (
//                 <div
//                   key={index}
//                   className="bg-white border border-gray-300 shadow-sm rounded-lg p-5 transition-transform transform hover:-translate-y-1"
//                 >
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-lg font-semibold text-blue-600">
//                       {reply.fname}
//                     </p>
//                     <span className="text-sm text-gray-400">
//                       {new Date(reply.created_at).toLocaleString("en-US", {
//                         timeZone: "America/Chicago",
//                         weekday: "short",
//                         year: "numeric",
//                         month: "short",
//                         day: "numeric",
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </span>
//                   </div>
//                   <p className="text-gray-700 mt-4 leading-relaxed whitespace-pre-line">
//                     {reply.reply_text}
//                   </p>

//                   {/* Displaying attachments for each reply */}
//                   {reply.attachments && reply.attachments.length > 0 && (
//                     <div className="mt-4">
//                       <h4 className="text-lg font-semibold text-gray-800 mb-2">Attachments:</h4>
//                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//                         {reply.attachments.map((attachment, idx) => (
//                           <div key={idx} className="relative group overflow-hidden rounded-lg shadow-md">
//                             <a
//                               href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/replies/${attachment}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="block"
//                             >
//                               <img
//                                 src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/replies/${attachment}`}
//                                 alt={`Reply Attachment ${idx + 1}`}
//                                 className="w-full h-32 object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-105"
//                               />
//                             </a>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {attachments.length > 0 && (
//           <div className="mt-6">
//             <h3 className="text-xl font-semibold text-gray-800 mb-4">Attachments:</h3>
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//               {attachments.map((attachment, index) => (
//                 <div key={index} className="relative group overflow-hidden rounded-lg shadow-md">
//                   <a
//                     href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${attachment}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="block"
//                   >
//                     <img
//                       src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${attachment}`}
//                       alt={`Attachment ${index + 1}`}
//                       className="w-full h-32 object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-105"
//                     />
//                   </a>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function TicketDetails({ params }) {
  const ticketId = params.ticketId;
  const [ticketDetails, setTicketDetails] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (ticketId) {
      const fetchTicketDetails = async () => {
        try {
          const [ticketResponse, repliesResponse] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tickets/${ticketId}`, {
              withCredentials: true,
            }),
            axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ticket/${ticketId}/replies`, {
              withCredentials: true,
            }),
          ]);

          console.log("Ticket Response:", ticketResponse.data);
          console.log("Replies Response:", repliesResponse.data);

          if (ticketResponse.data.error) {
            setError(ticketResponse.data.error);
          } else {
            setTicketDetails(ticketResponse.data);

            // Parsing attachments and ensuring they're arrays
            const repliesWithAttachments = repliesResponse.data.map(reply => ({
              ...reply,
              attachments: typeof reply.attachment === 'string' ? JSON.parse(reply.attachment) : [],
            }));

            setReplies(repliesWithAttachments);
          }
        } catch (err) {
          console.error("Error fetching ticket details:", err);
          const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      fetchTicketDetails();
    }
  }, [ticketId]);

  if (loading) return <p className="text-center text-gray-700">Loading...</p>;
  if (error) return <p className="text-center text-red-600">Error loading ticket details: {error}</p>;

  if (!ticketDetails) {
    return <p className="text-center text-gray-700">No ticket details available.</p>;
  }

  const attachments = Array.isArray(ticketDetails.attachments) ? ticketDetails.attachments : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6">
      <header className="bg-white shadow-lg rounded-lg mb-6">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide">Ticket Details</h1>
          <button
            onClick={() => router.push(`/Helpdesk/ticket/${ticketId}/replyTicket?title=${encodeURIComponent(ticketDetails.title)}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            Reply to Ticket
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg mb-6 p-6">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ticket #{ticketDetails.id}</h2>
          <p><strong className="font-medium text-gray-700">Title:</strong> {ticketDetails.title}</p>
          <p><strong className="font-medium text-gray-700">Created At:</strong> {new Date(ticketDetails.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
          <p><strong className="font-medium text-gray-700">Status:</strong> {ticketDetails.status_name}</p>
          <p><strong className="font-medium text-gray-700">Created_by:</strong> {ticketDetails.fname}</p>
        </div>
        <label htmlFor="">Descriptions</label>
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
          <p className="text-gray-700 whitespace-pre-line">{ticketDetails.description}</p>
        </div>

        {replies.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Replies:</h3>
            <div className="space-y-6">
              {replies.map((reply, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-300 shadow-sm rounded-lg p-5 transition-transform transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-lg font-semibold text-blue-600">
                      {reply.fname}
                    </p>
                    <span className="text-sm text-gray-400">
                      {new Date(reply.created_at).toLocaleString("en-US", {
                        timeZone: "America/Chicago",
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-4 leading-relaxed whitespace-pre-line">
                    {reply.reply_text}
                  </p>

                  {/* Displaying attachments for each reply */}
                  {reply.attachments && reply.attachments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Attachments:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {reply.attachments.map((attachment, idx) => (
                          <div key={idx} className="relative group overflow-hidden rounded-lg shadow-md">
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/replies/${attachment}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/replies/${attachment}`}
                                alt={`Reply Attachment ${idx + 1}`}
                                className="w-full h-32 object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-105"
                              />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Attachments:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative group overflow-hidden rounded-lg shadow-md">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${attachment}`}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-32 object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
