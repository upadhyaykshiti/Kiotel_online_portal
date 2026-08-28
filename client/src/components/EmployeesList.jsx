
"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(100);

  // Edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/employee/employees`
      );
      const data = response.data.data;
      const totalPagesCount = Math.ceil(data.length / itemsPerPage);
      setTotalPages(totalPagesCount);

      const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

      setEmployees(paginatedData);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch employees.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage]);

  const handleDelete = async (uniqueId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/delete/${uniqueId}`
      );
      alert("Employee deleted successfully!");
      fetchEmployees(); // Refresh the list
    } catch (err) {
      alert("Failed to delete employee.");
      console.error(err);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee({ ...employee });
    setIsEditing(true);
  };



const handleSave = async () => {
  if (!editingEmployee || !editingEmployee.unique_id) {
    alert("⚠️ Invalid employee data.");
    return;
  }

  const { unique_id, first_name, last_name, email, date_of_joining } = editingEmployee;

  if (!first_name || !last_name || !email || !date_of_joining) {
    alert("⚠️ Please fill all fields.");
    return;
  }

  // // Optional: Validate date format
  // const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  // if (!date_of_joining.match(dateRegex)) {
  //   alert("⚠️ Date must be in YYYY-MM-DD format.");
  //   return;
  // }

  try {
    console.log("Sending PUT request to:", `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/update/${unique_id}`);
    console.log("With data:", editingEmployee);

    const { unique_id: _, ...employeeData } = editingEmployee;

    await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/update/${unique_id}`,
      employeeData
    );

    alert("✅ Employee updated successfully!");
    setIsEditing(false);
    fetchEmployees();
  } catch (err) {
    console.error("Error updating employee:", err);

    if (err.response) {
      alert(`❌ ${err.response.data.message || "Server error."}`);
    } else if (err.request) {
      alert("❌ No response from server. Is the backend running?");
    } else {
      alert(`❌ ${err.message}`);
    }
  }
};

  if (loading)
    return <p className="text-center text-blue-700 font-medium">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500 font-medium">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Employee List</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-blue-300 md:table-fixed">
          <thead>
            <tr className="bg-blue-100 text-blue-800">
              <th className="border border-blue-300 px-4 py-3 font-semibold text-left">Unique ID</th>
              <th className="border border-blue-300 px-4 py-3 font-semibold text-left">First Name</th>
              <th className="border border-blue-300 px-4 py-3 font-semibold text-left">Last Name</th>
              <th className="border border-blue-300 px-4 py-3 font-semibold text-left">Email ID</th>
              <th className="border border-blue-300 px-4 py-3 font-semibold text-left">Date of Joining</th>
              {/* <th className="border border-blue-300 px-4 py-3 font-semibold text-left">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-blue-50 transition duration-200">
                <td className="border border-blue-300 px-4 py-3 text-gray-800">{employee.unique_id}</td>
                <td className="border border-blue-300 px-4 py-3 text-gray-800">{employee.first_name}</td>
                <td className="border border-blue-300 px-4 py-3 text-gray-800">{employee.last_name}</td>
                <td className="border border-blue-300 px-4 py-3 text-gray-800">{employee.email}</td>
                <td className="border border-blue-300 px-4 py-3 text-gray-800">
                  {new Date(employee.date_of_joining).toLocaleDateString()}
                </td>
                {/* <td className="border border-blue-300 px-4 py-2">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(employee.unique_id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Delete
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <p className="text-center text-gray-700 mt-4">No employees found.</p>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2 flex-wrap gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>

          <span className="text-blue-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-blue-700 mb-4">Edit Employee</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    value={editingEmployee.first_name || ""}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        first_name: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editingEmployee.last_name || ""}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        last_name: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Email ID</label>
                  <input
                    type="email"
                    value={editingEmployee.email || ""}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        email: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Date of Joining</label>
                  <input
                    type="date"
                    value={editingEmployee.date_of_joining?.split("T")[0] || ""}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        date_of_joining: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}