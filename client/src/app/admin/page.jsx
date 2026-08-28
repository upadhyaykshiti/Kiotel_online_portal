"use client"; // Mark this as a Client Component

import AdminLoginForm from "../../components/AdminLoginForm"; // Import the reusable admin login form

export default function AdminPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6"></h1>
        <AdminLoginForm />
      </div>
    </div>
  );
}