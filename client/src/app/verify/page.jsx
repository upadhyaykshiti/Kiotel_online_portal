'use client'; // Mark this as a Client Component

import LoginForm from '../../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">Verify</h1>
        <LoginForm />
      </div>
    </div>
  );
}