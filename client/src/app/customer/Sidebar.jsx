
"use client";

import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";

const statusTone = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "APPROVED") return "green";
  if (s === "UNDER REVIEW" || s === "SUBMITTED") return "blue";
  if (s === "CHANGES REQUESTED") return "amber";
  if (s === "DRAFT") return "slate";
  return "red"; // NOT STARTED / unknown
};

const Badge = ({ status }) => {
  const tone = statusTone(status);

  const cls = {
    green: "bg-green-50 text-green-700 border-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold tracking-wide ${cls}`}>
      {status || "NOT STARTED"}
    </span>
  );
};

const NavButton = ({ onClick, disabled, active, icon, label, right, subtle }) => {
  const base =
    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left";
  const activeCls = "bg-blue-600 text-white shadow-md shadow-blue-500/20";
  const normalCls = "text-gray-600 hover:bg-blue-50 hover:text-blue-700";
  const disabledCls = "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-600";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        base,
        active ? activeCls : normalCls,
        disabled ? disabledCls : "",
        subtle ? "hover:bg-gray-50 hover:text-gray-900" : "",
      ].join(" ")}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {right}
    </button>
  );
};

export default function Sidebar({
  customerProperties,
  selectedProperty,
  handlePropertyChange,
  propertyLinks,
  forms,
  formsLoading,
  gating,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleOpenReports = () => {
    if (!selectedProperty?.property_id) return;
    const params = new URLSearchParams({
      device_id: String(selectedProperty.property_id),
      property_name: selectedProperty.property_name || "",
    });
    router.push(`/customer/transaction-reports?${params.toString()}`);
  };

  const safeFindProperty = (value) => {
    const v = String(value);
    return (customerProperties || []).find((p) => String(p.property_id) === v) || null;
  };

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-72 bg-white border-r border-gray-200 flex flex-col z-40 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
          Context: Active Property
        </label>

        {customerProperties?.length > 0 ? (
          <div className="relative">
            <select
              value={selectedProperty?.property_id ?? ""}
              onChange={(e) => {
                const property = safeFindProperty(e.target.value);
                handlePropertyChange(property);
              }}
              className="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 pr-10 cursor-pointer transition-shadow shadow-sm hover:border-blue-400"
            >
              {customerProperties.map((property) => (
                <option key={property.property_id} value={property.property_id}>
                  {property.property_name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
            No properties found
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-4 space-y-8">
        <div>
          <div className="px-3 flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Forms</h3>
            {formsLoading ? (
              <span className="text-[11px] font-bold text-gray-400">Loading…</span>
            ) : (
              <span className="text-[11px] font-bold text-green-700">UNLOCKED</span>
            )}
          </div>

          <div className="px-3 mb-4">
            <div
              className={`rounded-xl border p-3 text-xs font-medium ${
                gating?.bothFormsFilled
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              {gating?.bothFormsFilled
                ? "Onboarding complete — full portal unlocked."
                : "Complete both forms to unlock dashboard and property modules."}
            </div>
          </div>

          <ul className="space-y-1.5">
            <li>
              <NavButton
                onClick={() => router.push("/customer/forms/property")}
                disabled={false}
                active={pathname.includes("/customer/forms/property")}
                label="Property Onboarding"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
                right={<Badge status={forms?.property?.status} />}
              />
            </li>

            <li>
              <NavButton
                onClick={() => router.push("/customer/forms/equipment")}
                disabled={false}
                active={pathname.includes("/customer/forms/equipment")}
                label="Third Party Equipment"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                }
                right={<Badge status={forms?.equipment?.status} />}
              />
            </li>
          </ul>
        </div>

        <div>
          <h3 className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Global Modules</h3>
          <ul className="space-y-1.5">
            <li>
              <NavButton
                onClick={() => router.push("/tasks")}
                disabled={false}
                active={pathname === "/tasks"}
                label="Task Manager"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                }
              />
            </li>
          </ul>
        </div>

        <div>
          <h3 className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Property Specific
          </h3>

          <ul className="space-y-1.5">
            <li>
              <NavButton
                onClick={() => router.push("/customer")}
                disabled={false}
                active={pathname.includes("/customer")}
                label="Dashboard"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                }
              />
            </li>

            <li>
              <NavButton
                onClick={handleOpenReports}
                disabled={!selectedProperty}
                active={pathname.includes("/customer/transaction-reports")}
                label="Transaction Reports"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              />
            </li>

            <li>
              <NavButton
                onClick={() => {
                  if (propertyLinks?.shared_folder_url) {
                    window.open(propertyLinks.shared_folder_url, "_blank", "noopener,noreferrer");
                  }
                }}
                disabled={!propertyLinks?.shared_folder_url}
                active={false}
                label="Shared Docs"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                }
                right={
                  propertyLinks?.shared_folder_url ? (
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  ) : null
                }
                subtle
              />
            </li>

            <li>
              <NavButton
                onClick={() => {
                  if (propertyLinks?.invoice_portal_url) {
                    window.open(propertyLinks.invoice_portal_url, "_blank", "noopener,noreferrer");
                  }
                }}
                disabled={!propertyLinks?.invoice_portal_url}
                active={false}
                label="Billing Portal"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                }
                right={
                  propertyLinks?.invoice_portal_url ? (
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  ) : null
                }
                subtle
              />
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}