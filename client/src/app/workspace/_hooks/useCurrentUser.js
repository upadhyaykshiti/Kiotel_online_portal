"use client";

import { useEffect, useState } from "react";
import axios from "axios";

/**
 * Fetches the currently logged-in user from the existing portal auth API.
 * Uses NEXT_PUBLIC_API_BASE_URL (not NEXT_PUBLIC_BACKEND_URL).
 *
 * Returns:
 *   user.accountNo  → unique_id from the portal (used as x-user-id header)
 *   user.fname      → first name
 *   user.email      → email
 *   user.role       → role number
 *   user.profilePic → profile picture
 */
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );

        setUser({
          accountNo:  res.data.unique_id,   // used as x-user-id in all workspace calls
          fname:      res.data.fname,
          email:      res.data.email,
          role:       res.data.role,
          profilePic: res.data.profile_pic,
        });
      } catch (err) {
        console.error("useCurrentUser: failed to fetch user", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading, error };
}