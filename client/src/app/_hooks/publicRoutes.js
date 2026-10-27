// Pages that are reachable without a session. App-wide providers skip the
// /api/auth/me session check here — it can only return 401 on these pages.
const PUBLIC_PATHS = ["/", "/sign-in", "/forgotpassword", "/verify"];

export function isPublicPath(pathname) {
  if (!pathname) return false;
  const path = pathname.replace(/\/+$/, "") || "/";
  return PUBLIC_PATHS.some((p) => path === p || (p !== "/" && path.startsWith(`${p}/`)));
}
