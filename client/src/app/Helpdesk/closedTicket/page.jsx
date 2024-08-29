"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function ClosedTickets() {
  const router = useRouter();
  const [closedTickets, setClosedTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClosedTickets = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/closed_tickets`, {
          withCredentials: true,
        });
        setClosedTickets(response.data);
      } catch (error) {
        console.error("Error fetching closed tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClosedTickets();
  }, []);

  if (loading) return <p className="text-center text-gray-700">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6">
      <header className="bg-white shadow-lg rounded-lg mb-6">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide">Closed Tickets</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Closed By
                </th> */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Closed At
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {closedTickets.map((ticket) => (
                <tr key={ticket.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.title}</td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.created_by}</td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ticket.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/Helpdesk/ticket/${ticket.id}`} className="text-blue-600 hover:text-blue-900">
                    View
                  </Link>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
