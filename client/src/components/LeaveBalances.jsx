

"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import EditLeaveForm from "./EditLeaveForm";
import AddLeavesModal from "./AddLeavesModal"; // Reusable modal for both Add and Deduct
import DeductLeaveModel from "./DeductLeavesModal"; // Reusable modal for both Add and Deduct

export default function LeaveBalances() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showAddLeavesModal, setShowAddLeavesModal] = useState(false); // State for Add Leaves modal
  const [showDeductLeavesModal, setShowDeductLeavesModal] = useState(false); // State for Deduct Leaves modal
  const [userRole, setUserRole] = useState(""); // State for user role

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Number of items per page

  // Fetch user role
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        setUserRole(res.data.role);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/leave-balances`
        );
        setEmployees(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leave balances:", error);
        setError("Failed to fetch leave balances. Please try again.");
        setLoading(false);
      }
    };

    fetchLeaveBalances();
  }, []);

  if (loading)
    return (
      <p className="text-center text-blue-700 font-medium">Loading...</p>
    );
  if (error)
    return (
      <p className="text-center text-red-500 font-medium">{error}</p>
    );

  // Calculate Paginated Data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);

  // Total Pages Calculation
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  return (
    <div className="w-full">
      {/* Header with Add Leaves and Deduct Leaves Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-700">Employee Leave Balances</h2>
        {/* Only show buttons if user role is admin */}
        {userRole === 1 && (
          <div className="space-x-2">
            <button
              onClick={() => setShowAddLeavesModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 text-sm"
            >
              Add Leaves for All
            </button>
            <button
              onClick={() => setShowDeductLeavesModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-sm"
            >
              Deduct Leaves for All
            </button>
          </div>
        )}
      </div>

      {/* Responsive Scroll Wrapper */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border-collapse border border-blue-300">
          <thead>
            <tr className="bg-blue-100 text-blue-800 text-sm">
              <th className="border border-blue-300 px-4 py-2 text-left">
                Unique ID
              </th>
              <th className="border border-blue-300 px-4 py-2 text-left">
                Name
              </th>
              <th className="border border-blue-300 px-4 py-2 text-left">
                Paid Leave
              </th>
              
              {/* Only show Actions column for admin */}
              {userRole === 1 && (
                <th className="border border-blue-300 px-4 py-2 text-left">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((employee) => (
              <tr
                key={employee.unique_id}
                className="hover:bg-blue-50 transition duration-200 text-sm"
              >
                <td className="border border-blue-300 px-4 py-2 text-gray-800 whitespace-nowrap">
                  {employee.unique_id}
                </td>
                <td className="border border-blue-300 px-4 py-2 text-gray-800 whitespace-nowrap">
                  {employee.first_name} {employee.last_name}
                </td>
                <td className="border border-blue-300 px-4 py-2 text-gray-800 text-center">
                  {employee.annual_leave}
                </td>
                
                {/* Only show Actions cell for admin */}
                {userRole === 1 && (
                  <td className="border border-blue-300 px-4 py-2 text-center">
                    <button
                      onClick={() => setEditingEmployee(employee)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 text-sm"
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingEmployee && (
        <EditLeaveForm
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onUpdate={(updatedData) => {
            setEmployees((prev) =>
              prev.map((emp) =>
                emp.unique_id === updatedData.unique_id
                  ? { ...emp, ...updatedData }
                  : emp
              )
            );
            setEditingEmployee(null);
          }}
        />
      )}

      {/* Add Leaves Modal */}
      {showAddLeavesModal && (
        <AddLeavesModal
          title="Add Leaves for All"
          onClose={() => setShowAddLeavesModal(false)}
          onAddLeaves={async (leaveType, leaveCount) => {
            try {
              await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/add-leaves-for-all`,
                { leave_type: leaveType, leave_count: leaveCount }
              );
              // Refresh the employee list after updating leaves
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/leave-balances`
              );
              setEmployees(response.data.data);
              setShowAddLeavesModal(false); // Close the modal after successful update
            } catch (error) {
              console.error("Error adding leaves:", error);
              setError("Failed to add leaves. Please try again.");
            }
          }}
        />
      )}

      {/* Deduct Leaves Modal */}
      {showDeductLeavesModal && (
        <DeductLeaveModel
          title="Deduct Leaves for All"
          onClose={() => setShowDeductLeavesModal(false)}
          onAddLeaves={async (leaveType, leaveCount) => {
            try {
              await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/deduct-leaves-for-all`,
                { leave_type: leaveType, leave_count: leaveCount }
              );
              // Refresh the employee list after updating leaves
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/leave-balances`
              );
              setEmployees(response.data.data);
              setShowDeductLeavesModal(false); // Close the modal after successful update
            } catch (error) {
              console.error("Error deducting leaves:", error);
              setError("Failed to deduct leaves. Please try again.");
            }
          }}
        />
      )}
    </div>
  );
}