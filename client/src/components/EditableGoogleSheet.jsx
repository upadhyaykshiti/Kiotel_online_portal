"use client"; // Mark this as a Client Component

import axios from "axios";
import { useEffect, useState } from "react";

export default function EditableGoogleSheet() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sheet/google-sheet-data/Sheet1/A1:D100`);
        setData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data from Google Sheets.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/google-sheet-update/Sheet1/A1:D100`, {
        values: data,
      });
      alert("Data saved successfully!");
    } catch (err) {
      setError("Failed to save data to Google Sheets.");
    }
  };

  const handleChange = (rowIndex, colIndex, value) => {
    const updatedData = [...data];
    updatedData[rowIndex][colIndex] = value;
    setData(updatedData);
  };

  if (loading) return <p className="text-center text-blue-700 font-medium">Loading...</p>;
  if (error) return <p className="text-center text-red-500 font-medium">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Editable Employee Data from Google Sheets</h2>
      <table className="w-full border-collapse border border-blue-300">
        <thead>
          <tr className="bg-blue-100 text-blue-800">
            <th className="border border-blue-300 px-4 py-3 font-semibold text-left">Unique ID</th>
            <th className="border border-blue-300 px-4 py-3 font-semibold text-left">First Name</th>
            <th className="border border-blue-300 px-4 py-3 font-semibold text-left">Last Name</th>
            <th className="border border-blue-300 px-4 py-3 font-semibold text-left">Date of Joining</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-blue-50 transition duration-200">
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="border border-blue-300 px-4 py-3">
                  <input
                    type="text"
                    value={cell || ""}
                    onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleSave}
        className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Save Changes
      </button>
    </div>
  );
}