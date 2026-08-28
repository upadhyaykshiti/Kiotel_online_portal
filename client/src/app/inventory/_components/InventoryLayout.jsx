"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useInventoryUser } from "../_hooks/useInventoryUser";
import "../inventory.css";

// const NAV_ITEMS = [
//   {
//     href: "/inventory", label: "Dashboard", exact: true,
//     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
//     roles: ["admin", "manager", "employee"],
//   },
//   {
//     href: "/inventory/list", label: "Inventory List",
//     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
//     roles: ["admin", "manager", "employee"],
//   },
//   {
//     href: "/inventory/create-item", label: "Create Item",
//     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
//     roles: ["admin", "manager"],
//   },
//   {
//     href: "/inventory/add", label: "Add Inventory",
//     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
//     roles: ["admin", "manager"],
//   },
//   {
//     href: "/inventory/remove", label: "Remove Inventory",
//     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
//     roles: ["admin", "manager"],
//   },
// ];

// Add this to the NAV_ITEMS array in InventoryLayout.jsx

const NAV_ITEMS = [
  {
    href: "/inventory", label: "Dashboard", exact: true,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
    roles: ["admin", "manager", "employee"],
  },
  {
    href: "/inventory/list", label: "Inventory List",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    roles: ["admin", "manager", "employee"],
  },
  // {
  //   href: "/inventory/properties", label: "Properties",
  //   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  //   roles: ["admin", "manager", "employee"],
  // },
  // {
  //   href: "/inventory/create-item", label: "Create Item",
  //   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
  //   roles: ["admin", "manager"],
  // },
  // {
  //   href: "/inventory/add", label: "Add Inventory",
  //   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  //   roles: ["admin", "manager"],
  // },
  // {
  //   href: "/inventory/remove", label: "Remove Inventory",
  //   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  //   roles: ["admin", "manager"],
  // },
  // Properties and Cabins are one page now — the two lists are swapped with a
  // dropdown, because they are two views of the same thing and are linked to
  // each other. /inventory/properties and /inventory/cabins still resolve, so
  // old links and bookmarks keep working.
  {
    href: "/inventory/locations", label: "Properties & Cabins",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    roles: ["admin", "manager", "employee"],
  },
  {
    href: "/inventory/create-item", label: "Create Item",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
    roles: ["admin", "manager"],
  },
  {
    href: "/inventory/add", label: "Add Inventory",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    roles: ["admin", "manager"],
  },
  {
    href: "/inventory/import", label: "Bulk Upload",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><polyline points="9 15 12 12 15 15" /><line x1="12" y1="12" x2="12" y2="19" /></svg>,
    roles: ["admin", "manager"],
  },
  {
    href: "/inventory/remove", label: "Assign",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    roles: ["admin", "manager"],
  },
  {
    href: "/inventory/reassign", label: "Reassign",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>,
    roles: ["admin", "manager"],
  },
  {
    href: "/inventory/destroy", label: "Destroy",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>,
    roles: ["admin", "manager"],
  },
  {
  href: "/inventory/reports", label: "Reports",
  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  roles: ["admin", "manager", "employee"],
},
{
  href: "/inventory/logs", label: "Logs",
  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  roles: ["admin", "manager"],
},
];


export default function InventoryLayout({ children, title, subtitle }) {
  const pathname = usePathname();
  const { user, userRole, loading } = useInventoryUser();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const visibleNav = NAV_ITEMS.filter(
    (item) => !userRole || item.roles.includes(userRole)
  );

  return (
    <div className="inv-shell">
      <aside className="inv-sidebar">
        <div className="inv-logo">
          <div className="inv-logo-mark">
            <div className="inv-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <div className="inv-logo-text">Inventory</div>
              <div className="inv-logo-sub">Management</div>
            </div>
          </div>
        </div>

        <nav className="inv-nav">
          <div className="inv-nav-section">Navigation</div>
          {visibleNav.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`inv-nav-link${isActive ? " active" : ""}`}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="inv-user">
          <div className="inv-user-avatar">
            {mounted && (
              user?.profile_pic
                ? <img src={user.profile_pic} alt={user?.fname || "User"} />
                : <span>{user?.fname?.[0]?.toUpperCase() || "U"}</span>
            )}
          </div>
          <div className="inv-user-info">
            <div className="inv-user-name">{mounted ? (loading ? "Loading..." : user?.fname || "User") : ""}</div>
            <div className="inv-user-role">{mounted ? (userRole || "—") : ""}</div>
          </div>
        </div>
      </aside>

      <main className="inv-main">
        <div className="inv-topbar">
          <h1 className="inv-page-title">{title}</h1>
          {subtitle && <p className="inv-page-subtitle">{subtitle}</p>}
        </div>
        <div className="inv-content">{children}</div>
      </main>
    </div>
  );
}