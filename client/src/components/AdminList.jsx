

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminList() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingAdminId, setEditingAdminId] = useState(null); // Track which admin is being edited
  const [formData, setFormData] = useState({}); // Store form data for editing

  // Fetch admin list from backend
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/employee/adminslist`
        );
        if (response.data.success) {
          setAdmins(response.data.data); // Set admin data
        } else {
          setError("Failed to load admin list.");
        }
      } catch (err) {
        setError("An error occurred while fetching the admin list.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchAdmins();
  }, []);

  // Handle Edit Button Click
  const handleEdit = (admin) => {
    setEditingAdminId(admin.unique_id); // Set the admin being edited
    setFormData({
      first_name: admin.first_name,
      last_name: admin.last_name,
    }); // Prefill form with current data
  };

  // Handle Form Input Changes
  const handleChange = (e, adminId) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle Save (Update) Button Click
  const handleSave = async (uniqueId) => {
    const confirmUpdate = window.confirm(
      "Are you sure you want to update this admin?"
    );
    if (!confirmUpdate) return; // Exit if user cancels

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/update/${uniqueId}`,
        formData
      );
      if (response.data.success) {
        // Update the admin list with the new data
        setAdmins((prevAdmins) =>
          prevAdmins.map((admin) =>
            admin.unique_id === uniqueId
              ? { ...admin, first_name: formData.first_name, last_name: formData.last_name }
              : admin
          )
        );
        setEditingAdminId(null); // Exit edit mode
        alert("Admin updated successfully!"); // Success alert
      } else {
        alert("Failed to update admin.");
      }
    } catch (err) {
      alert("An error occurred while updating the admin.");
      console.error(err);
    }
  };

  // Handle Cancel Button Click
  const handleCancel = () => {
    setEditingAdminId(null); // Exit edit mode
    setFormData({}); // Reset form data
  };

  // Handle Delete Button Click
  const handleDelete = async (uniqueId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this admin user?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/admindelete/${uniqueId}`
      );
      setAdmins((prevAdmins) =>
        prevAdmins.filter((admin) => admin.unique_id !== uniqueId)
      ); // Remove deleted admin from the list
      alert("Admin deleted successfully!");
    } catch (err) {
      alert("Failed to delete admin.");
      console.error(err);
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading admin list...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Admin List</h2>

      {/* Display Admin List */}
      {admins.length === 0 ? (
        <p className="text-gray-600">No admins found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-100 text-left text-sm font-medium text-gray-800">
              <th className="px-4 py-3">Unique ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr
                key={admin.unique_id}
                className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-4 py-3 text-sm text-gray-800">
                  {admin.unique_id}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800">
                  {editingAdminId === admin.unique_id ? (
                    <>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name || ""}
                        onChange={(e) => handleChange(e, admin.unique_id)}
                        className="px-2 py-1 border border-gray-300 rounded-md w-24 mr-2"
                      />
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name || ""}
                        onChange={(e) => handleChange(e, admin.unique_id)}
                        className="px-2 py-1 border border-gray-300 rounded-md w-24"
                      />
                    </>
                  ) : (
                    `${admin.first_name} ${admin.last_name}`
                  )}
                </td>
                <td className="px-4 py-3 space-x-2">
                  {editingAdminId === admin.unique_id ? (
                    <>
                      <button
                        onClick={() => handleSave(admin.unique_id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Exit edit mode
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(admin)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(admin.unique_id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}