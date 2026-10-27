// // workspace/_lib/workspaceApi.js

// "use client";

// export async function workspaceFetch(path, { method = "GET", body, userId } = {}) {
//   if (!userId) {
//     throw new Error("workspaceFetch: userId (unique_id/account_no) is required");
//   }

//   const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;

//   const res = await fetch(url, {
//     method,
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//       "x-user-id": userId, // <-- send UniqueID/account_no to backend
//     },
//     body: body ? JSON.stringify(body) : undefined,
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(text || `Request failed: ${res.status}`);
//   }

//   return res.json();
// }


"use client";

export async function workspaceFetch(path, { method = "GET", body, userId } = {}) {
  if (!userId) {
    throw new Error("workspaceFetch: userId (unique_id/account_no) is required");
  }

  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // Change 11: safe error surfacing — never expose raw stack traces
    let message = `Request failed: ${res.status}`;
    try {
      const text = await res.text();
      const json = JSON.parse(text);
      message = json.error || message;
    } catch {
      // Response wasn't JSON — keep the generic message
    }
    throw new Error(message);
  }

  return res.json();
}