// inventoryApi.js
// Axios instance for all inventory API calls.
// Automatically reads user info from /api/user-email once and
// injects it as headers on every request so the backend knows who's calling.

import axios from "axios";

const inventoryApi = axios.create({
  baseURL:         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory`,
  withCredentials: true,
});

// Before every request — attach user info as headers
inventoryApi.interceptors.request.use(async (config) => {
  try {
    // Read from sessionStorage cache to avoid calling /api/user-email on every request
    let userInfo = null;
    const cached = sessionStorage.getItem("inv_user");
    if (cached) {
      userInfo = JSON.parse(cached);
    } else {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
        { withCredentials: true }
      );
      userInfo = {
        id:        res.data.id || res.data.unique_id,
        role:      res.data.role,
        email:     res.data.email,
        fname:     res.data.fname,
        unique_id: res.data.unique_id,
      };
      sessionStorage.setItem("inv_user", JSON.stringify(userInfo));
    }

    if (userInfo) {
      config.headers["x-user-id"]        = userInfo.id        || "";
      config.headers["x-user-role"]      = userInfo.role      || "";
      config.headers["x-user-email"]     = userInfo.email     || "";
      config.headers["x-user-fname"]     = userInfo.fname     || "";
      config.headers["x-user-unique-id"] = userInfo.unique_id || "";
    }
  } catch (err) {
    console.error("inventoryApi: failed to attach user headers", err.message);
  }

  return config;
});

export default inventoryApi;