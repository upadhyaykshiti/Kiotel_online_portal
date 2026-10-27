'use client'; // Mark this as a Client Component

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// The legacy employee login (unique_id only, no password) has been retired for
// security. This page now sends people to the real sign-in.
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/sign-in');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <p className="text-gray-600">Redirecting to sign in…</p>
    </div>
  );
}
