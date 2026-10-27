"use client";
import "../inventory.css";
import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import InventoryLayout from "../_components/InventoryLayout";
import { useInventoryUser } from "../_hooks/useInventoryUser";
import axios from "axios";

const API = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory`;

const VIEWS = {
  properties: {
    label: "Properties",
    icon: "🏢",
    searchPlaceholder: "Search properties...",
    emptyText: "No properties found",
    emptySub: "Try adjusting your search or add a new property",
    addHref: "/inventory/add-property",
    addLabel: "Add Property",
    templateFile: "properties_template.xlsx",
    importTitle: "Import Properties",
    importInstructions: [
      "Download the template file below",
      "Fill in property details (Code and Name are required)",
      "Do not modify the header row",
      "Save the file and upload it here",
      "Duplicate codes will be skipped automatically",
    ],
  },
  cabins: {
    label: "Cabins",
    icon: "🚪",
    searchPlaceholder: "Search cabins...",
    emptyText: "No cabins found",
    emptySub: "Try adjusting your search or import a new file",
    addHref: "/inventory/add-cabin",
    addLabel: "Add Cabin",
    templateFile: "cabins_template.xlsx",
    importTitle: "Import Cabins",
    importInstructions: [
      "Download the template file below",
      "Fill in cabin details (Cabin Number is required)",
      "Do not modify the header row",
      "Save the file and upload it here",
      "Duplicate cabin numbers will be skipped automatically",
    ],
  },
};

function LocationsInner() {
  const searchParams = useSearchParams();
  const { user, can } = useInventoryUser();

  const initialView = searchParams.get("view") === "cabins" ? "cabins" : "properties";
  const [view, setView] = useState(initialView);

  const [properties, setProperties] = useState([]);
  const [cabins, setCabins] = useState([]);
  const [loaded, setLoaded] = useState({ properties: false, cabins: false });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  // import modal — shared, driven by whichever view is showing
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  // link-property modal (cabins view only)
  const [linkModal, setLinkModal] = useState({ open: false, cabin: null });
  const [linkPropertyId, setLinkPropertyId] = useState("");

  const cfg = VIEWS[view];

  const headers = useCallback(() => ({
    "x-user-id": user?.id,
    "x-user-role": user?.roleId,
    "x-user-email": user?.email,
    "x-user-fname": user?.fname,
    "x-user-unique-id": user?.unique_id,
  }), [user]);

  const fetchProperties = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/properties`, { withCredentials: true, headers: headers() });
      setProperties(res.data?.data || []);
      setLoaded((l) => ({ ...l, properties: true }));
    } catch (err) {
      console.error("Properties fetch error:", err);
      setError("Failed to load properties.");
    }
  }, [user, headers]);

  const fetchCabins = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/cabins`, { withCredentials: true, headers: headers() });
      setCabins(res.data?.data || []);
      setLoaded((l) => ({ ...l, cabins: true }));
    } catch (err) {
      console.error("Cabins fetch error:", err);
      setError("Failed to load cabins.");
    }
  }, [user, headers]);

  // Properties are needed by the cabins view too, for the link dropdown, so
  // they are always fetched. Cabins load when that view is first opened.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchProperties();
      if (!cancelled && view === "cabins") await fetchCabins();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, view, fetchProperties, fetchCabins]);

  const switchView = (next) => {
    setView(next);
    setSearch("");
    setError(null);
    setShowImportModal(false);
    setImportResults(null);
    setImportFile(null);
  };

  const refreshCurrent = () => (view === "cabins" ? fetchCabins() : fetchProperties());

  // ── filtering ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (view === "properties") {
      if (!q) return properties;
      return properties.filter((p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q)
      );
    }
    if (!q) return cabins;
    return cabins.filter((c) =>
      (c.cabin_number || "").toLowerCase().includes(q) ||
      (c.code || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q)
    );
  }, [view, properties, cabins, search]);

  // ── template / import ───────────────────────────────────────
  const handleDownloadTemplate = async () => {
    try {
      const res = await axios.get(`${API}/${view}/template`, {
        withCredentials: true, headers: headers(), responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", cfg.templateFile);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download template.");
    }
  };

  const handleImport = async () => {
    if (!importFile) { setError("Please select a file to import."); return; }
    setImporting(true); setError(null); setImportResults(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await axios.post(`${API}/${view}/import`, formData, {
        withCredentials: true,
        headers: { ...headers(), "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        setImportResults(res.data.results);
        refreshCurrent();
      } else {
        setError(res.data?.message || "Import failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to import ${view}.`);
    } finally {
      setImporting(false);
    }
  };

  // ── link a property to a cabin ──────────────────────────────
  const handleLinkProperty = async () => {
    if (!linkPropertyId) return;
    try {
      await axios.post(
        `${API}/cabins/${linkModal.cabin.id}/link-property`,
        { property_id: linkPropertyId },
        { withCredentials: true, headers: headers() }
      );
      setLinkModal({ open: false, cabin: null });
      setLinkPropertyId("");
      fetchCabins();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to link.");
    }
  };

  const showSkeleton = loading && !loaded[view];

  return (
    <>
      <div className="list-toolbar">
        {/* the switch */}
        <div className="loc-switch">
          <label className="loc-switch-lbl" htmlFor="loc-view">Showing</label>
          <select
            id="loc-view"
            className="loc-switch-select"
            value={view}
            onChange={(e) => switchView(e.target.value)}
          >
            <option value="properties">Properties</option>
            <option value="cabins">Cabins</option>
          </select>
          <span className="loc-switch-count">
            {showSkeleton ? "…" : `${filtered.length} ${view === "properties" ? "propert" : "cabin"}${
              view === "properties" ? (filtered.length === 1 ? "y" : "ies") : (filtered.length === 1 ? "" : "s")
            }`}
          </span>
        </div>

        <div className="list-search-wrap">
          <span className="list-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            className="list-search"
            placeholder={cfg.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {can("create") && (
          <>
            <button
              onClick={() => setShowImportModal(true)}
              className="list-btn-primary"
              style={{ background: "#10b981", marginRight: 8 }}
              type="button"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import
            </button>
            <Link href={cfg.addHref} className="list-btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {cfg.addLabel}
            </Link>
          </>
        )}
      </div>

      {error && <div className="list-error">{error}</div>}

      {showSkeleton ? (
        <div className="list-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="inv-skeleton" style={{ height: 180, borderRadius: 12 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="list-empty">
          <div className="list-empty-icon">{cfg.icon}</div>
          <div className="list-empty-text">{cfg.emptyText}</div>
          <div className="list-empty-sub">{cfg.emptySub}</div>
        </div>
      ) : view === "properties" ? (
        /* ── PROPERTIES ─────────────────────────────────── */
        <div className="list-grid">
          {filtered.map((property) => (
            <div key={property.id} className="list-item-card">
              <Link href={`/inventory/property/${property.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <div className="list-item-body">
                  <div className="list-item-name">{property.name}</div>
                  <div style={{ fontSize: 13, color: "#9898b0", marginBottom: 8 }}>{property.code}</div>
                  <div className="list-item-footer">
                    <div>
                      <div className="list-item-qty">{property.assigned_units_count || 0}</div>
                      <div className="list-item-qty-label">units assigned</div>
                    </div>
                  </div>
                  <div className="list-item-updated">
                    Created {property.created_at
                      ? new Date(property.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })
                      : "—"}
                  </div>
                </div>
              </Link>
              <div className="list-item-actions">
                <Link href={`/inventory/property/${property.id}`} className="list-act-btn">
                  View Inventory
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── CABINS ─────────────────────────────────────── */
        <div className="list-grid">
          {filtered.map((cabin) => (
            <div key={cabin.id} className="list-item-card">
              <Link href={`/inventory/cabins/${cabin.cabin_number}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <div className="list-item-body">
                  <div className="list-item-name">Cabin {cabin.cabin_number}</div>
                  <div style={{ fontSize: 13, color: "#9898b0", marginBottom: 8 }}>{cabin.code}</div>
                  {cabin.description && (
                    <div style={{ fontSize: 12, color: "#6b6b8a", marginBottom: 8, fontStyle: "italic" }}>
                      {cabin.description}
                    </div>
                  )}

                  <div style={{ marginBottom: 8 }}>
                    {cabin.linked_properties_count > 0 ? (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "3px 8px", background: "#dcfce7", borderRadius: 4,
                        fontSize: 11, color: "#16a34a", fontWeight: 500,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                        </svg>
                        {cabin.linked_properties}
                      </div>
                    ) : (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "3px 8px", background: "#fee2e2", borderRadius: 4,
                        fontSize: 11, color: "#dc2626", fontWeight: 500,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        No Property Linked
                      </div>
                    )}
                  </div>

                  <div className="list-item-footer">
                    <div>
                      <div className="list-item-qty">{cabin.assigned_units_count || 0}</div>
                      <div className="list-item-qty-label">units assigned</div>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="list-item-actions">
                <Link href={`/inventory/cabins/${cabin.cabin_number}`} className="list-act-btn">View Inventory</Link>
                {can("create") && (
                  <button
                    onClick={() => { setLinkModal({ open: true, cabin }); setLinkPropertyId(""); }}
                    type="button"
                    style={{
                      padding: "4px 10px", background: "#6366f1", color: "#fff",
                      border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer",
                    }}
                  >
                    {cabin.linked_properties_count > 0 ? "Manage Links" : "Link Property"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── import modal ─────────────────────────────────── */}
      {showImportModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 24,
            maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                {cfg.importTitle}
              </h2>
              <button
                onClick={() => { setShowImportModal(false); setImportResults(null); setImportFile(null); }}
                type="button"
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#9898b0" }}
              >
                ×
              </button>
            </div>

            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: 600, color: "#0369a1" }}>📥 Instructions:</h3>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#0c4a6e", lineHeight: 1.6 }}>
                {cfg.importInstructions.map((t) => <li key={t}>{t}</li>)}
              </ol>
            </div>

            <button
              onClick={handleDownloadTemplate}
              type="button"
              style={{
                width: "100%", padding: 12, marginBottom: 16,
                background: "#6366f1", color: "#fff", border: "none",
                borderRadius: 8, fontSize: 14, fontWeight: 500,
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Template ({cfg.templateFile})
            </button>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#9898b0", marginBottom: 6 }}>
                Select Excel File
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files[0])}
                style={{
                  width: "100%", padding: 10, border: "2px dashed #e8eaf0",
                  borderRadius: 8, fontSize: 13, cursor: "pointer",
                }}
              />
              {importFile && (
                <div style={{ marginTop: 8, fontSize: 13, color: "#6366f1" }}>
                  Selected: {importFile.name}
                </div>
              )}
            </div>

            <button
              onClick={handleImport}
              disabled={!importFile || importing}
              type="button"
              style={{
                width: "100%", padding: 12,
                background: importing ? "#9898b0" : "#10b981",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 500, cursor: importing ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {importing ? (
                <>
                  <div className="inv-spinner" style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff" }} />
                  Importing...
                </>
              ) : cfg.importTitle}
            </button>

            {importResults && (
              <div style={{ marginTop: 20 }}>
                <div style={{ padding: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, marginBottom: 12 }}>
                  <strong style={{ color: "#16a34a" }}>✓ Import Completed!</strong>
                  <div style={{ fontSize: 13, color: "#166534", marginTop: 4 }}>
                    Success: {importResults.success.length} | Failed: {importResults.failed.length} | Duplicates: {importResults.duplicates.length}
                  </div>
                </div>

                {importResults.failed.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#dc2626", marginBottom: 4 }}>Failed Rows:</div>
                    <div style={{ maxHeight: 100, overflowY: "auto", fontSize: 12, color: "#7f1d1d", background: "#fef2f2", padding: 8, borderRadius: 6 }}>
                      {importResults.failed.map((f, i) => (
                        <div key={i}>Row {f.row}: {f.reason}</div>
                      ))}
                    </div>
                  </div>
                )}

                {importResults.duplicates.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#d97706", marginBottom: 4 }}>Skipped (Duplicates):</div>
                    <div style={{ maxHeight: 100, overflowY: "auto", fontSize: 12, color: "#92400e", background: "#fffbeb", padding: 8, borderRadius: 6 }}>
                      {importResults.duplicates.map((d, i) => (
                        <div key={i}>Row {d.row}: {d.code || d.cabin_number} - {d.reason}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── link-property modal ──────────────────────────── */}
      {/* Kept a sibling of the import modal on purpose: previously this sat
          nested inside it, so the button only worked while importing. */}
      {linkModal.open && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1001, padding: 20,
        }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 400, width: "100%" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700 }}>
              Link Property to Cabin {linkModal.cabin?.cabin_number}
            </h2>
            {linkModal.cabin?.linked_properties_count > 0 && (
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6b6b8a" }}>
                Already linked to <strong>{linkModal.cabin.linked_properties}</strong>.
              </p>
            )}
            <select
              value={linkPropertyId}
              onChange={(e) => setLinkPropertyId(e.target.value)}
              className="ri-select"
              style={{ width: "100%", marginBottom: 16 }}
            >
              <option value="">— Select Property —</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#9898b0" }}>
              Linking matters for bulk uploads: naming this cabin in a sheet assigns the
              linked property too, and vice versa.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => { setLinkModal({ open: false, cabin: null }); setLinkPropertyId(""); }}
                className="ri-btn-secondary"
                style={{ flex: 1 }}
                type="button"
              >
                Cancel
              </button>
              {/* ri-btn-primary is the red destroy-page button; linking is not
                  destructive, so it is recoloured rather than reused as-is. */}
              <button
                onClick={handleLinkProperty}
                disabled={!linkPropertyId}
                className="ri-btn-primary"
                style={{ flex: 1, background: linkPropertyId ? "#6366f1" : "#9898b0" }}
                type="button"
              >
                Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function LocationsPage() {
  return (
    <InventoryLayout
      title="Properties & Cabins"
      subtitle="Switch between properties and cabins, and manage how they are linked"
    >
      <Suspense fallback={
        <div className="list-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="inv-skeleton" style={{ height: 180, borderRadius: 12 }} />
          ))}
        </div>
      }>
        <LocationsInner />
      </Suspense>
    </InventoryLayout>
  );
}
