"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export function useCurrentUser() {
  const [user, setUser] = useState(null); // { accountNo, email, fname, roleId, profilePic }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );

        const accountNo = res.data.unique_id; // UniqueID -> account_no (VARCHAR)
        if (!accountNo) throw new Error("unique_id missing from /api/user-email");

        if (mounted) {
          setUser({
            accountNo,
            email: res.data.email,
            fname: res.data.fname,
            roleId: res.data.role,
            profilePic: res.data.profile_pic,
          });
        }
      } catch (e) {
        console.error("Failed to fetch user:", e);
        if (mounted) setError("Failed to fetch user details");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading, error };
}