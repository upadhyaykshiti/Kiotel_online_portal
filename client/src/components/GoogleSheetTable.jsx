

"use client"; // Mark this as a Client Component

import axios from "axios";
import { useEffect, useState } from "react";

export default function GoogleSheetTable({ sheetName, range }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sheet/google-sheet-formatted/${sheetName}/${range}`);
        setData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data from Google Sheets.");
        setLoading(false);
      }
    };

    fetchData();
  }, [sheetName, range]);

  if (loading) return <p className="text-center text-blue-700 font-medium">Loading...</p>;
  if (error) return <p className="text-center text-red-500 font-medium">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Dynamic Data from Google Sheets</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {data[0]?.values?.map((headerCell, index) => (
              <th
                key={index}
                className={`px-4 py-3 font-semibold text-left`}
                style={{
                  backgroundColor: headerCell.effectiveFormat?.backgroundColor?.red
                    ? `rgba(${headerCell.effectiveFormat.backgroundColor.red * 255}, ${headerCell.effectiveFormat.backgroundColor.green * 255}, ${headerCell.effectiveFormat.backgroundColor.blue * 255})`
                    : "transparent",
                  color: headerCell.effectiveFormat?.textFormat?.foregroundColor?.red
                    ? `rgba(${headerCell.effectiveFormat.textFormat.foregroundColor.red * 255}, ${headerCell.effectiveFormat.textFormat.foregroundColor.green * 255}, ${headerCell.effectiveFormat.textFormat.foregroundColor.blue * 255})`
                    : "black",
                }}
              >
                {headerCell.formattedValue || ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-blue-50 transition duration-200">
              {row.values?.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-3"
                  style={{
                    backgroundColor: cell.effectiveFormat?.backgroundColor?.red
                      ? `rgba(${cell.effectiveFormat.backgroundColor.red * 255}, ${cell.effectiveFormat.backgroundColor.green * 255}, ${cell.effectiveFormat.backgroundColor.blue * 255})`
                      : "transparent",
                    color: cell.effectiveFormat?.textFormat?.foregroundColor?.red
                      ? `rgba(${cell.effectiveFormat.textFormat.foregroundColor.red * 255}, ${cell.effectiveFormat.textFormat.foregroundColor.green * 255}, ${cell.effectiveFormat.textFormat.foregroundColor.blue * 255})`
                      : "black",
                    fontWeight: cell.effectiveFormat?.textFormat?.bold ? "bold" : "normal",
                    fontStyle: cell.effectiveFormat?.textFormat?.italic ? "italic" : "normal",
                  }}
                >
                  {cell.formattedValue || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}