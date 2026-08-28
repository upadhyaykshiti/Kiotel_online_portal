"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export function useInventoryUser() {
  const [user, setUser]       = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        console.log("USER API RESPONSE:", res.data);
        // const { role, fname, email, unique_id, profile_pic } = res.data;

        // setUser({ fname, email, unique_id, profile_pic, roleId: role });

        const {
  id,
  role,
  fname,
  email,
  unique_id,
  profile_pic
} = res.data;

setUser({
  id,
  fname,
  email,
  unique_id,
  profile_pic,
  roleId: role
});

        if (role === 1)      setUserRole("admin");
        else if (role === 6) setUserRole("manager");
        else                 setUserRole("employee");
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const can = (action) => {
    if (userRole === "admin") return true;
    if (userRole === "manager") {
      return ["add", "remove", "view_history", "view_list", "create"].includes(action);
    }
    return ["view_list", "view_history"].includes(action);
  };

  return { user, userRole, loading, error, can };
}