import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/session`, {
          withCredentials: true
        });

        if (response.data.authenticated) {
          setLoading(false);  // Allow the page to load if authenticated
        } else {
          router.push('/sign-in');  // Redirect to sign-in if not authenticated
        }
      } catch (error) {
        router.push('/sign-in');  // Redirect to sign-in on error or unauthorized
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;  // Optional: show a loading indicator while checking auth
  }

  return children;
};

export default ProtectedRoute;
