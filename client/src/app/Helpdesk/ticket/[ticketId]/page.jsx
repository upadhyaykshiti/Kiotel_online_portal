"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function TicketDetails({ params }) {
  const ticketId = params.ticketId;
  const [ticketDetails, setTicketDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (ticketId) {
      const fetchTicketDetails = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/tickets/${ticketId}`, {
            withCredentials: true,
          });
          if (response.data.error) {
            setError(response.data.error);
          } else {
            setTicketDetails(response.data);
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
          <p><strong className="font-medium text-gray-700">Created At:</strong> {new Date(ticketDetails.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
          <p><strong className="font-medium text-gray-700">Status:</strong> {ticketDetails.status}</p>
        </div>
        <label htmlFor="">Descriptions</label>
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
          <p className="text-gray-700 whitespace-pre-line">{ticketDetails.description}</p>
        </div>

        {attachments.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Attachments:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative group overflow-hidden rounded-lg shadow-md">
                  <a
                    href={`http://localhost:8080/uploads/${attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={`http://localhost:8080/uploads/${attachment}`}
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




// "use client";

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';

// export default function TicketDetails({ params }) {
//   const ticketId = params.ticketId;
//   const [ticketDetails, setTicketDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     if (ticketId) {
//       const fetchTicketDetails = async () => {
//         try {
//           const response = await axios.get(`http://localhost:8080/api/tickets/${ticketId}`, {
//             withCredentials: true,
//           });
//           if (response.data.error) {
//             setError(response.data.error);
//           } else {
//             setTicketDetails(response.data);
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
//             onClick={() => router.push(`/Helpdesk/ticket/${ticketId}/replyTicket`)}
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
//           <p><strong className="font-medium text-gray-700">Status:</strong> {ticketDetails.status}</p>
//         </div>
//         <label htmlFor="">Descriptions</label>
//         <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
//           <p className="text-gray-700 whitespace-pre-line">{ticketDetails.description}</p>
//         </div>

//         {attachments.length > 0 && (
//           <div>
//             <h3 className="text-xl font-semibold text-gray-800 mb-4">Attachments:</h3>
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//               {attachments.map((attachment, index) => (
//                 <div key={index} className="relative group overflow-hidden rounded-lg shadow-md">
//                   <a
//                     href={`http://localhost:8080/uploads/${attachment}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="block"
//                   >
//                     <img
//                       src={`http://localhost:8080/uploads/${attachment}`}
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

