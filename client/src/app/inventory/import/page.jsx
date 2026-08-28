"use client";
import "../inventory.css";
import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import InventoryLayout from "../_components/InventoryLayout";
import { useInventoryUser } from "../_hooks/useInventoryUser";
import axios from "axios";

const API = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory`;
const PAGE_SIZE = 40;

const CONDITION_LABELS = {
  occupied: "Occupied",
  it_custody_working: "IT Custody — Working",
  it_custody_damaged: "IT Custody — Damaged",
  thrown: "Thrown",
  unknown: "Unknown",
};

const SKIP_LABELS = {
  duplicate_in_file: "Same unit filled in twice",
  unreadable_code: "Asset code could not be read",
  no_code: "Details filled in but no asset code",
  placeholder: "Placeholder row",
};

const ACTION_LABELS = {
  assign: "Assign",
  retire: "Retire",
  details: "Details only",
  none: "No change",
  blocked: "Needs fixing",
};

// Mirrors expandAssignment() on the server so a picked location shows what it
// resolves to straight away. The server re-derives it for real on commit.
function expandForDisplay(sel, options) {
  if (!options) return { cabin: null, properties: [], note: null };
  const cabin = sel.cabin_id
    ? options.cabins.find((c) => c.id === Number(sel.cabin_id)) || null
    : null;
  const picked = sel.property_id
    ? options.properties.find((p) => p.id === Number(sel.property_id)) || null
    : null;

  if (cabin && !picked) {
    const ids = options.links.filter((l) => l.cabin_id === cabin.id).map((l) => l.property_id);
    const props = options.properties.filter((p) => ids.includes(p.id));
    return {
      cabin,
      properties: props,
      note: props.length
        ? `property ${props.length > 1 ? "codes" : "code"} ${props.map((p) => p.code).join(", ")} from the cabin link`
        : "this cabin has no linked property — it will be assigned to the cabin only",
    };
  }
  if (picked && !cabin) {
    const ids = options.links.filter((l) => l.property_id === picked.id).map((l) => l.cabin_id);
    if (ids.length === 1) {
      const c = options.cabins.find((x) => x.id === ids[0]) || null;
      return { cabin: c, properties: [picked], note: c ? `cabin ${c.cabin_number} from the property link` : null };
    }
    return {
      cabin: null,
      properties: [picked],
      note: ids.length > 1
        ? `this property has ${ids.length} cabins — pick one too, or it is assigned to the property only`
        : "this property has no linked cabin — it will be assigned to the property only",
    };
  }
  if (cabin && picked) {
    const linked = options.links.some((l) => l.cabin_id === cabin.id && l.property_id === picked.id);
    return {
      cabin,
      properties: [picked],
      note: linked ? null : "these two are not linked to each other — this row will be skipped",
      invalid: !linked,
    };
  }
  return { cabin: null, properties: [], note: null };
}

function locationOf(row) {
  if (row?.property_name) return row.property_name;
  if (row?.cabin_number) return `Cabin ${row.cabin_number}`;
  return "—";
}

// Pull a useful message out of an axios error. On the template request the
// response type is "blob", so a JSON error body arrives as a Blob and
// err.response.data.message is undefined until it is read back as text.
async function errorMessage(err, fallback) {
  const res = err?.response;
  const data = res?.data;

  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (parsed?.message) return parsed.message;
    } catch { /* not JSON — fall through to the status-based message */ }
  }
  if (data?.message) return data.message;

  if (err?.code === "ERR_NETWORK" || (!res && err?.request)) {
    return "Cannot reach the server. Check that the backend is running and NEXT_PUBLIC_BACKEND_URL is correct.";
  }
  if (res?.status === 404) return `${fallback} — endpoint not found (404). The backend may need restarting to pick up the new routes.`;
  if (res?.status === 401) return "Your session is not being recognised. Sign in again and retry.";
  if (res?.status === 403) return "You need manager or admin access to do this.";
  if (res?.status) return `${fallback} (HTTP ${res.status})`;
  return err?.message ? `${fallback} — ${err.message}` : fallback;
}

function BulkImportPage() {
  const router = useRouter();
  const { user, userRole, loading: userLoading } = useInventoryUser();

  const [step, setStep] = useState(1);            // 1 upload · 2 review · 3 done
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  // review filters
  const [rowPage, setRowPage] = useState(1);
  const [rowSearch, setRowSearch] = useState("");
  const [rowItem, setRowItem] = useState("all");
  const [rowAction, setRowAction] = useState("all");

  const [showWarnings, setShowWarnings] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);
  const [showRefused, setShowRefused] = useState(true);

  // Corrections made on this screen, keyed by asset code:
  //   { [unit_code]: { cabin_id: string, property_id: string } }
  const [fixes, setFixes] = useState({});

  const fileRef = useRef(null);

  const authHeaders = () => ({
    "x-user-id": user?.id,
    "x-user-role": user?.roleId,
    "x-user-email": user?.email,
    "x-user-fname": user?.fname,
    "x-user-unique-id": user?.unique_id,
  });

  // ── file selection ──────────────────────────────────────────
  const pickFile = (f) => {
    if (!f) return;
    if (!/\.xlsx?$/i.test(f.name)) {
      setError("Only .xlsx or .xls files are supported.");
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setError("File must be under 25 MB.");
      return;
    }
    setError(null);
    setFile(f);
  };

  const downloadTemplate = async () => {
    if (!user) { setError("Still signing you in — try again in a second."); return; }
    setError(null);
    try {
      const res = await axios.get(`${API}/units/import/template`, {
        withCredentials: true, responseType: "blob", headers: authHeaders(),
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", "inventory_units_template.xlsx");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(await errorMessage(err, "Failed to download the template."));
    }
  };

  // ── step 1 → 2 ──────────────────────────────────────────────
  const analyse = async () => {
    if (!file) { setError("Please choose a file first."); return; }
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post(`${API}/units/import/preview`, fd, {
        withCredentials: true,
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      if (!res.data?.success) { setError(res.data?.message || "Could not read the file."); return; }
      setPreview(res.data);
      setRowPage(1); setRowSearch(""); setRowItem("all"); setRowAction("all");
      setStep(2);
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.migration_sql
          ? `${data.message} Run backend/docs/inventory-unit-import.sql, then try again.`
          : await errorMessage(err, "Failed to analyse the file.")
      );
    } finally {
      setBusy(false);
    }
  };

  // ── step 2 → 3 ──────────────────────────────────────────────
  const runImport = async () => {
    setBusy(true); setError(null);
    try {
      // Apply this screen's corrections, then send only rows that do something.
      // The server re-validates and re-derives every location regardless.
      const payload = preview.rows
        .map((r) => {
          const fix = fixes[r.unit_code];
          if (!fix) return r;
          return {
            ...r,
            cabin_id: fix.cabin_id ? Number(fix.cabin_id) : null,
            property_id: fix.property_id ? Number(fix.property_id) : null,
            property_ids: fix.property_id ? [Number(fix.property_id)] : [],
            // A corrected row is no longer blocked by what the sheet said.
            location_error: null,
            location_unresolved: null,
          };
        })
        .filter((r) => {
          const fixed = fixes[r.unit_code];
          if (fixed) return Boolean(fixed.cabin_id || fixed.property_id);
          return r.action !== "none" && r.action !== "blocked";
        });

      if (payload.length === 0) {
        setError("Nothing to apply — every row is either unchanged or still needs fixing.");
        return;
      }

      const res = await axios.post(
        `${API}/units/import/commit`,
        {
          rows: payload,
          file_name: preview.file_name,
          file_hash: preview.file_hash,
        },
        { withCredentials: true, headers: authHeaders() }
      );
      if (!res.data?.success) { setError(res.data?.message || "Upload failed."); return; }
      setResult(res.data);
      setStep(3);
    } catch (err) {
      setError(await errorMessage(err, "Upload failed."));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setStep(1); setFile(null); setPreview(null); setResult(null); setError(null);
    setRowSearch(""); setRowItem("all"); setRowAction("all"); setRowPage(1);
    setFixes({});
  };

  // ── inline corrections ──────────────────────────────────────
  const setFix = (code, field, value) =>
    setFixes((f) => {
      const next = { ...(f[code] || { cabin_id: "", property_id: "" }), [field]: value };
      // Both blank means "no correction" — drop the entry so the row falls back
      // to whatever the sheet said.
      if (!next.cabin_id && !next.property_id) {
        const copy = { ...f };
        delete copy[code];
        return copy;
      }
      return { ...f, [code]: next };
    });

  const clearFix = (code) =>
    setFixes((f) => {
      const copy = { ...f };
      delete copy[code];
      return copy;
    });

  const fixCount = Object.keys(fixes).length;

  // ── review helpers ──────────────────────────────────────────
  const rows = useMemo(() => preview?.rows || [], [preview]);

  const rowItems = useMemo(() => {
    const names = new Set(rows.map((r) => r.item_name));
    return ["all", ...[...names].sort()];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = rowSearch.trim().toLowerCase();
    return rows.filter((r) => {
      if (rowItem !== "all" && r.item_name !== rowItem) return false;
      if (rowAction === "needs-fixing") {
        if (!(r.action === "blocked" || r.location_unresolved)) return false;
      } else if (rowAction !== "all" && r.action !== rowAction) return false;
      if (!q) return true;
      return (
        (r.unit_code || "").toLowerCase().includes(q) ||
        (r.serial_no || "").toLowerCase().includes(q) ||
        (r.model || "").toLowerCase().includes(q) ||
        locationOf(r).toLowerCase().includes(q)
      );
    });
  }, [rows, rowSearch, rowItem, rowAction]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const page = Math.min(rowPage, pageCount);
  const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // A correction turns a blocked or stuck row into something worth applying, so
  // the button count has to include them.
  const actionable = useMemo(() => {
    const base = preview?.summary?.actionable ?? 0;
    const addedByFixes = rows.filter((r) => {
      const f = fixes[r.unit_code];
      if (!f || !(f.cabin_id || f.property_id)) return false;
      return r.action === "blocked" || r.action === "none" || r.location_unresolved;
    }).length;
    return base + addedByFixes;
  }, [preview, rows, fixes]);

  // ── access gate ─────────────────────────────────────────────
  if (!userLoading && userRole === "employee") {
    return (
      <div className="ai-denied">
        <div className="ai-denied-icon">🔒</div>
        <div className="ai-denied-title">Access Restricted</div>
        <div className="ai-denied-sub">Only admins and managers can bulk-upload inventory.</div>
      </div>
    );
  }

  return (
    <div className="imp-wrap">
      {/* stepper */}
      <div className="imp-steps">
        {["Upload file", "Review", "Done"].map((label, i) => {
          const n = i + 1;
          return (
            <div key={label} className={`imp-step${step === n ? " active" : ""}${step > n ? " done" : ""}`}>
              <span className="imp-step-num">{step > n ? "✓" : n}</span>
              {label}
            </div>
          );
        })}
      </div>

      {error && <div className="ai-alert error">⚠ {error}</div>}

      {/* ── STEP 1 ─────────────────────────────────────────── */}
      {step === 1 && (
        <>
          <div className="imp-card">
            <div className="imp-card-title">How it works</div>
            <ul className="imp-help">
              <li><strong>Add stock first.</strong> Use <strong>Add Inventory</strong> to create units — it issues the asset codes. This sheet never creates anything.</li>
              <li>The template then lists <strong>the units sitting in stock with IT</strong>, one tab per item, with their asset codes already filled in. Anything already assigned, damaged or thrown is left out — there is nothing to do with those here.</li>
              <li><strong>Leave the Asset Code column exactly as it is.</strong> It says which unit each row is about.</li>
              <li>A row is only acted on <strong>if you put something in it</strong>. Leave a row untouched and that unit is not changed.</li>
              <li>To <strong>assign</strong>, fill in <strong>either Cabin No or Assigned Property Code</strong> — just one. The other is filled in for you from the property/cabin link. Copy the values from the template&apos;s <strong>Reference</strong> tab.</li>
              <li>Properties are identified by <strong>code</strong> (e.g. <code>1001</code>), never by name — a misspelt name is how a device ends up in the wrong place. If you do fill in both a cabin and a property, they must be linked to each other, or that row is reported and skipped.</li>
              <li>To <strong>record details only</strong>, fill in Model / Serial / Remark and leave the location blank. The unit stays in stock.</li>
              <li>To <strong>take a unit out of service</strong>, put <code>IT Custody - Damage</code> or <code>Thrown</code> in Status. It comes out of stock.</li>
              <li>Model, Serial/IMEI and Remark come pre-filled with whatever the portal already holds — edit to correct them, or leave them alone.</li>
              <li>Nothing is written until you review the next screen and press Apply.</li>
            </ul>
            <button className="imp-btn-ghost" onClick={downloadTemplate} type="button">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download template (units currently in stock)
            </button>
          </div>

          <div className="imp-card">
            <div className="imp-card-title">Choose your workbook</div>
            {file ? (
              <div className="imp-file">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                <div className="imp-file-meta">
                  <div className="imp-file-name">{file.name}</div>
                  <div className="imp-file-size">{(file.size / 1024).toFixed(0)} KB</div>
                </div>
                <button className="imp-file-remove" onClick={() => setFile(null)} type="button">× Remove</button>
              </div>
            ) : (
              <div
                className="ai-upload-zone"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("dragover"); }}
                onDragLeave={(e) => e.currentTarget.classList.remove("dragover")}
                onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("dragover"); pickFile(e.dataTransfer.files[0]); }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "#3a3a55" }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <div className="ai-upload-text"><strong>Click to upload</strong> or drag &amp; drop</div>
                <div className="ai-upload-sub">Excel workbook — .xlsx or .xls · max 25 MB</div>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={(e) => pickFile(e.target.files[0])} />
              </div>
            )}

            <div className="ai-actions">
              <button className="ai-btn-secondary" onClick={() => router.push("/inventory/list")} type="button">Cancel</button>
              <button className="ai-btn-primary" onClick={analyse} disabled={!file || busy} type="button">
                {busy ? <><div className="inv-spinner" /> Reading workbook…</> : "Analyse file"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── STEP 2 ─────────────────────────────────────────── */}
      {step === 2 && preview && (
        <>
          {preview.already_imported && (
            <div className="ai-alert">
              You uploaded this same workbook on{" "}
              <strong>{new Date(preview.already_imported.created_at).toLocaleString()}</strong>
              {preview.already_imported.imported_by_name ? <> ({preview.already_imported.imported_by_name})</> : null}.
              {" "}Units it already assigned are no longer in stock, so they show below as needing attention rather than being assigned twice.
            </div>
          )}

          <div className="imp-summary">
            <div className="imp-stat"><div className="imp-stat-val">{preview.summary.total_rows}</div><div className="imp-stat-lbl">Rows filled in</div></div>
            <div className="imp-stat ok"><div className="imp-stat-val">{preview.summary.will_assign}</div><div className="imp-stat-lbl">To assign</div></div>
            <div className="imp-stat"><div className="imp-stat-val">{preview.summary.details_only}</div><div className="imp-stat-lbl">Details only</div></div>
            <div className="imp-stat"><div className="imp-stat-val">{preview.summary.will_retire}</div><div className="imp-stat-lbl">To retire</div></div>
            <div className={`imp-stat${Math.max(0, (preview.summary.needs_fixing || 0) - fixCount) ? " warn" : ""}`}>
              <div className="imp-stat-val">{Math.max(0, (preview.summary.needs_fixing || 0) - fixCount)}</div>
              <div className="imp-stat-lbl">Need fixing</div>
            </div>
            <div className="imp-stat warn"><div className="imp-stat-val">{preview.summary.refused}</div><div className="imp-stat-lbl">Cannot apply</div></div>
            <div className="imp-stat"><div className="imp-stat-val">{preview.summary.in_stock_total}</div><div className="imp-stat-lbl">In stock now</div></div>
          </div>

          {fixCount > 0 && (
            <div className="ai-alert success">
              ✓ {fixCount} location{fixCount === 1 ? "" : "s"} corrected on this screen.
              {" "}These are applied on Apply — the spreadsheet itself is not changed.
            </div>
          )}

          {/* refused rows — the most important thing on this screen */}
          {preview.refused.length > 0 && (
            <div className="imp-card imp-card-danger">
              <button className="imp-collapse" type="button" onClick={() => setShowRefused((v) => !v)}>
                {showRefused ? "▾" : "▸"} {preview.refused.length} row{preview.refused.length === 1 ? "" : "s"} cannot be applied
                <span className="imp-dim"> — these will be skipped</span>
              </button>
              {showRefused && (
                <div className="imp-table-wrap imp-scroll">
                  <table className="imp-table">
                    <thead><tr><th>Asset code</th><th>Tab · row</th><th>Why</th></tr></thead>
                    <tbody>
                      {preview.refused.slice(0, 300).map((r, i) => (
                        <tr key={i}>
                          <td><code>{r.unit_code}</code></td>
                          <td className="imp-dim">{r.sheet} · {r.excel_row}</td>
                          <td>{r.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.refused.length > 300 && (
                    <p className="imp-dim">Showing the first 300 of {preview.refused.length}.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* per-sheet breakdown */}
          <div className="imp-card">
            <div className="imp-card-title">Tabs found in {preview.file_name}</div>
            <div className="imp-table-wrap">
              <table className="imp-table">
                <thead>
                  <tr>
                    <th>Tab</th><th>Mapped to item</th><th>Matched by</th>
                    <th className="num">Filled in</th><th className="num">Refused</th>
                    <th className="num">Skipped</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.sheets.map((s) => (
                    <tr key={s.sheet} className={s.status !== "ok" ? "muted" : ""}>
                      <td><strong>{s.sheet}</strong></td>
                      <td>{s.item_name || <span className="imp-dim">—</span>}</td>
                      <td className="imp-dim">{s.matched_via || "—"}</td>
                      <td className="num">{s.action_count || 0}</td>
                      <td className="num">{s.refused_count || 0}</td>
                      <td className="num">{s.skipped || 0}</td>
                      <td>
                        {s.status === "ok"
                          ? <span className="imp-pill ok">Ready</span>
                          : <span className="imp-pill" title={s.message || ""}>{s.status === "ignored" ? "Ignored" : "Empty"}</span>}
                        {s.message && <div className="imp-dim imp-sheet-msg">{s.message}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* what will change */}
          {rows.length > 0 && (
            <div className="imp-card">
              <div className="imp-card-title">What will change</div>
              <p className="imp-card-sub">
                Every row you filled in, and exactly what it does to that unit. Rows showing
                &ldquo;No change&rdquo; are left alone.
              </p>

              <div className="imp-filters">
                <input
                  className="imp-search"
                  placeholder="Search code, serial, model or location…"
                  value={rowSearch}
                  onChange={(e) => { setRowSearch(e.target.value); setRowPage(1); }}
                />
                <select className="imp-select" value={rowItem} onChange={(e) => { setRowItem(e.target.value); setRowPage(1); }}>
                  {rowItems.map((n) => <option key={n} value={n}>{n === "all" ? "All items" : n}</option>)}
                </select>
                <select className="imp-select" value={rowAction} onChange={(e) => { setRowAction(e.target.value); setRowPage(1); }}>
                  <option value="all">All actions</option>
                  <option value="needs-fixing">Needs fixing</option>
                  <option value="assign">Assign</option>
                  <option value="details">Details only</option>
                  <option value="retire">Retire</option>
                  <option value="none">No change</option>
                </select>
                <div className="imp-filter-actions">
                  <span className="imp-dim">{filteredRows.length} shown</span>
                </div>
              </div>

              <div className="imp-table-wrap">
                <table className="imp-table imp-dup-table">
                  <thead>
                    <tr><th>Unit</th><th>Item</th><th>Action</th><th>What changes</th><th style={{ minWidth: 250 }}>Set location</th></tr>
                  </thead>
                  <tbody>
                    {pagedRows.map((r) => {
                      const fix = fixes[r.unit_code];
                      const resolved = fix ? expandForDisplay(fix, preview.options) : null;
                      const problem = r.action === "blocked" || r.location_unresolved;
                      return (
                        <tr key={`${r.sheet}-${r.excel_row}-${r.unit_code}`}
                            className={r.action === "blocked" && !fix ? "imp-row-blocked" : r.action === "retire" ? "imp-row-update" : ""}>
                          <td><code>{r.unit_code}</code>
                            <div className="imp-dim">{r.sheet} · row {r.excel_row}</div>
                          </td>
                          <td>{r.item_name}</td>
                          <td>
                            <span className={`imp-pill${
                              fix ? " ok"
                                : r.action === "assign" ? " ok"
                                : r.action === "retire" || r.action === "blocked" ? " danger" : ""
                            }`}>
                              {fix ? "Assign (fixed)" : ACTION_LABELS[r.action] || r.action}
                            </span>
                          </td>
                          <td className="imp-diff-cell">
                            {r.action === "blocked" && !fix ? (
                              <span className="imp-warn-hard">{r.blocked_reason}</span>
                            ) : r.location_unresolved && !fix ? (
                              <span className="imp-warn-hard">{r.location_unresolved}</span>
                            ) : r.changes.length === 0 && !fix ? (
                              <span className="imp-dim">Nothing — the sheet matches what the portal already has.</span>
                            ) : (
                              <table className="imp-diff">
                                <tbody>
                                  {r.changes.filter((c) => !(fix && c.field === "Assign to")).map((c, i) => (
                                    <tr key={i}>
                                      <td className="imp-diff-lbl">{c.field}</td>
                                      <td className="imp-diff-was">{c.from || "—"}</td>
                                      <td className="imp-diff-arrow">→</td>
                                      <td className="imp-diff-now">
                                        {c.to || "—"}
                                        {c.note && <div className="imp-dim">{c.note}</div>}
                                      </td>
                                    </tr>
                                  ))}
                                  {fix && (
                                    <tr>
                                      <td className="imp-diff-lbl">Assign to</td>
                                      <td className="imp-diff-was">In stock</td>
                                      <td className="imp-diff-arrow">→</td>
                                      <td className="imp-diff-now">
                                        {[
                                          resolved.cabin ? `Cabin ${resolved.cabin.cabin_number}` : null,
                                          resolved.properties.length ? resolved.properties.map((p) => `${p.name} (${p.code})`).join(" + ") : null,
                                        ].filter(Boolean).join(" · ") || "—"}
                                        {resolved.note && (
                                          <div className={resolved.invalid ? "imp-warn-hard" : "imp-dim"}>{resolved.note}</div>
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            )}
                          </td>
                          <td>
                            {r.action === "retire" ? (
                              <span className="imp-dim">n/a — being retired</span>
                            ) : (
                              <div className="imp-fix">
                                <select
                                  className="imp-select imp-fix-sel"
                                  value={fix?.cabin_id || ""}
                                  onChange={(e) => setFix(r.unit_code, "cabin_id", e.target.value)}
                                  aria-label={`Cabin for ${r.unit_code}`}
                                >
                                  <option value="">Cabin…</option>
                                  {preview.options.cabins.map((c) => (
                                    <option key={c.id} value={c.id}>Cabin {c.cabin_number}</option>
                                  ))}
                                </select>
                                <select
                                  className="imp-select imp-fix-sel"
                                  value={fix?.property_id || ""}
                                  onChange={(e) => setFix(r.unit_code, "property_id", e.target.value)}
                                  aria-label={`Property for ${r.unit_code}`}
                                >
                                  <option value="">Property…</option>
                                  {preview.options.properties.map((p) => (
                                    <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                                  ))}
                                </select>
                                {fix && (
                                  <button type="button" className="imp-link" onClick={() => clearFix(r.unit_code)}>
                                    undo
                                  </button>
                                )}
                                {problem && !fix && (
                                  <div className="imp-dim">Pick one — the other is filled in.</div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pageCount > 1 && (
                <div className="imp-pagination">
                  <button type="button" disabled={page === 1} onClick={() => setRowPage(page - 1)}>← Prev</button>
                  <span>Page {page} of {pageCount}</span>
                  <button type="button" disabled={page === pageCount} onClick={() => setRowPage(page + 1)}>Next →</button>
                </div>
              )}
            </div>
          )}

          {/* warnings */}
          {preview.warnings.length > 0 && (
            <div className="imp-card">
              <button className="imp-collapse" type="button" onClick={() => setShowWarnings((v) => !v)}>
                {showWarnings ? "▾" : "▸"} {preview.warnings.length} row{preview.warnings.length === 1 ? "" : "s"} need a look
                <span className="imp-dim"> — fuzzy property matches and locations that could not be resolved</span>
              </button>
              {showWarnings && (
                <div className="imp-table-wrap">
                  <table className="imp-table">
                    <thead><tr><th>Unit</th><th>Tab · row</th><th>Value in sheet</th><th>What happens</th></tr></thead>
                    <tbody>
                      {preview.warnings.map((w, i) => (
                        <tr key={`${w.sheet}-${w.excel_row}-${i}`}>
                          <td><code>{w.unit_code}</code></td>
                          <td className="imp-dim">{w.sheet} · {w.excel_row}</td>
                          <td>{w.raw_location || <span className="imp-dim">—</span>}</td>
                          <td>
                            {w.warnings.map((msg, j) => (
                              <div key={j} className={w.match === "fuzzy" ? "imp-warn-fuzzy" : "imp-warn-hard"}>{msg}</div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* skipped */}
          {preview.skipped.length > 0 && (
            <div className="imp-card">
              <button className="imp-collapse" type="button" onClick={() => setShowSkipped((v) => !v)}>
                {showSkipped ? "▾" : "▸"} {preview.skipped.length} row{preview.skipped.length === 1 ? "" : "s"} skipped
                <span className="imp-dim"> — unreadable codes and units filled in twice</span>
              </button>
              {showSkipped && (
                <>
                  <div className="imp-skip-groups">
                    {Object.entries(
                      preview.skipped.reduce((acc, s) => {
                        const k = s.category || "other";
                        acc[k] = (acc[k] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([cat, n]) => (
                      <span key={cat} className="imp-pill">{SKIP_LABELS[cat] || cat}: {n}</span>
                    ))}
                  </div>
                  <div className="imp-table-wrap imp-scroll">
                    <table className="imp-table">
                      <thead><tr><th>Tab · row</th><th>In sheet</th><th>Reason</th></tr></thead>
                      <tbody>
                        {preview.skipped.slice(0, 300).map((s, i) => (
                          <tr key={i}>
                            <td className="imp-dim">{s.sheet} · {s.excel_row}</td>
                            <td>{s.unit_code || s.raw_code || <span className="imp-dim">(blank)</span>}</td>
                            <td>{s.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {preview.skipped.length > 300 && (
                    <p className="imp-dim">Showing the first 300 of {preview.skipped.length} skipped rows.</p>
                  )}
                </>
              )}
            </div>
          )}

          <div className="ai-actions imp-sticky-actions">
            <button className="ai-btn-secondary" onClick={reset} type="button" disabled={busy}>← Choose another file</button>
            <button
              className="ai-btn-primary"
              onClick={runImport}
              disabled={busy || actionable === 0}
              title={actionable === 0 ? "Nothing in this sheet would change anything" : undefined}
              type="button"
            >
              {busy ? <><div className="inv-spinner" /> Applying…</> : (
                actionable === 0 ? "Nothing to apply" : (
                  <>
                    Apply {actionable} change{actionable === 1 ? "" : "s"}
                    {preview.summary.will_assign > 0 ? ` · assign ${preview.summary.will_assign}` : ""}
                  </>
                )
              )}
            </button>
          </div>
        </>
      )}

      {/* ── STEP 3 ─────────────────────────────────────────── */}
      {step === 3 && result && (
        <>
          <div className="ai-alert success">✓ {result.message}</div>

          <div className="imp-summary">
            <div className="imp-stat ok"><div className="imp-stat-val">{result.results.assigned}</div><div className="imp-stat-lbl">Assigned</div></div>
            <div className="imp-stat"><div className="imp-stat-val">{result.results.details_updated}</div><div className="imp-stat-lbl">Details updated</div></div>
            <div className="imp-stat"><div className="imp-stat-val">{result.results.retired}</div><div className="imp-stat-lbl">Retired</div></div>
            <div className="imp-stat warn"><div className="imp-stat-val">{result.results.rejected.length}</div><div className="imp-stat-lbl">Needed attention</div></div>
          </div>

          {result.results.per_item.length > 0 && (
            <div className="imp-card">
              <div className="imp-card-title">Per item</div>
              <div className="imp-table-wrap">
                <table className="imp-table">
                  <thead>
                    <tr>
                      <th>Item</th><th className="num">Assigned</th><th className="num">Retired</th>
                      <th className="num">Details only</th>
                      <th className="num">Stock before</th><th className="num">Stock after</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.per_item.map((p) => (
                      <tr key={p.item_id}>
                        <td><strong>{p.item_name}</strong></td>
                        <td className="num">{p.assigned}</td>
                        <td className="num">{p.retired}</td>
                        <td className="num">{p.details_only}</td>
                        <td className="num imp-dim">{p.before_quantity}</td>
                        <td className="num">{p.after_quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="imp-dim">
                Assigning and retiring both take a unit out of stock, which is why the after figure drops.
                Each is recorded in the item&apos;s history as its own entry.
              </p>
            </div>
          )}

          {result.results.assigned_codes?.length > 0 && (
            <div className="imp-card">
              <div className="imp-card-title">Units assigned</div>
              <div className="imp-skip-groups">
                {result.results.assigned_codes.map((c) => (
                  <span key={c} className="imp-pill ok">{c}</span>
                ))}
              </div>
              {result.results.assigned > result.results.assigned_codes.length && (
                <p className="imp-dim">
                  Showing the first {result.results.assigned_codes.length} of {result.results.assigned}.
                </p>
              )}
            </div>
          )}

          {result.results.retired_codes?.length > 0 && (
            <div className="imp-card">
              <div className="imp-card-title">Units retired</div>
              <div className="imp-skip-groups">
                {result.results.retired_codes.map((c) => (
                  <span key={c} className="imp-pill danger">{c}</span>
                ))}
              </div>
            </div>
          )}

          {result.results.rejected.length > 0 && (
            <div className="imp-card">
              <div className="imp-card-title">Rows that needed attention</div>
              <div className="imp-table-wrap imp-scroll">
                <table className="imp-table">
                  <thead><tr><th>Unit</th><th>What happened</th></tr></thead>
                  <tbody>
                    {result.results.rejected.map((r, i) => (
                      <tr key={i}><td><code>{r.unit_code}</code></td><td>{r.reason}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="ai-actions">
            <button className="ai-btn-secondary" onClick={reset} type="button">Upload another file</button>
            <button className="ai-btn-primary" onClick={() => router.push("/inventory/list")} type="button">Go to inventory list</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function BulkImport() {
  return (
    <InventoryLayout
      title="Bulk Upload"
      subtitle="Record details and assign the units already in stock"
    >
      <BulkImportPage />
    </InventoryLayout>
  );
}
