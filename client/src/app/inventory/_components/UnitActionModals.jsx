"use client";
// Retreat / Re-assign modals, shared by the property and cabin detail pages so
// the two never drift apart.
//
// The property/cabin link is honoured here the same way the bulk upload honours
// it: choose one side and the other is filled in. What that resolves to is shown
// before you confirm, so nothing about the outcome is a surprise.

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

const API = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory`;

// Mirrors expandAssignment() on the server, for the preview line only. The
// server re-derives it for real when the action is submitted.
function resolveTarget({ propertyId, cabinId }, options) {
  if (!options) return { cabin: null, properties: [], note: null, invalid: false };
  const cabin = cabinId ? options.cabins.find((c) => c.id === Number(cabinId)) || null : null;
  const picked = propertyId ? options.properties.find((p) => p.id === Number(propertyId)) || null : null;

  if (cabin && !picked) {
    const ids = options.links.filter((l) => l.cabin_id === cabin.id).map((l) => l.property_id);
    const props = options.properties.filter((p) => ids.includes(p.id));
    return {
      cabin, properties: props, invalid: false,
      note: props.length
        ? `${props.length > 1 ? "Properties" : "Property"} filled in from the cabin link.`
        : "This cabin has no linked property, so the unit will be recorded against the cabin only.",
    };
  }
  if (picked && !cabin) {
    const ids = options.links.filter((l) => l.property_id === picked.id).map((l) => l.cabin_id);
    if (ids.length === 1) {
      const c = options.cabins.find((x) => x.id === ids[0]) || null;
      return { cabin: c, properties: [picked], invalid: false, note: "Cabin filled in from the property link." };
    }
    return {
      cabin: null, properties: [picked], invalid: false,
      note: ids.length > 1
        ? `This property has ${ids.length} linked cabins — pick the cabin instead if it matters which one.`
        : "This property has no linked cabin, so the unit will be recorded against the property only.",
    };
  }
  if (cabin && picked) {
    const linked = options.links.some((l) => l.cabin_id === cabin.id && l.property_id === picked.id);
    return {
      cabin, properties: [picked], invalid: !linked,
      note: linked ? null : "These two are not linked to each other, so this move will be refused.",
    };
  }
  return { cabin: null, properties: [], note: null, invalid: false };
}

const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, padding: 20,
};
const sheet = {
  background: "#fff", borderRadius: 12, padding: 24,
  maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto",
};
const label = { display: "block", fontSize: 12, fontWeight: 600, color: "#9898b0", marginBottom: 6 };
const field = {
  width: "100%", padding: "9px 10px", border: "1px solid #e8eaf0",
  borderRadius: 8, fontSize: 13.5, color: "#2a2a3e", background: "#fff",
};

/**
 * @param {object}   unit      the row being acted on ({ unit_id|id, unit_code, item_name })
 * @param {'retreat'|'reassign'} mode
 * @param {object}   authHeaders
 * @param {Function} onClose
 * @param {Function} onDone    called after a successful action so the page can refetch
 */
export default function UnitActionModal({ unit, mode, authHeaders, onClose, onDone }) {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [cabinId, setCabinId] = useState("");

  const unitId = unit?.unit_id ?? unit?.id;

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${API}/units/action-options`, {
        withCredentials: true, headers: authHeaders,
      });
      if (!res.data?.success) throw new Error(res.data?.message || "Failed to load options.");
      setOptions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load options.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { load(); }, [load]);

  const chosenReason = useMemo(
    () => options?.retreat_reasons?.find((r) => r.key === reason) || null,
    [options, reason]
  );

  const target = useMemo(
    () => resolveTarget({ propertyId, cabinId }, options),
    [propertyId, cabinId, options]
  );

  const targetLabel = [
    target.cabin ? `Cabin ${target.cabin.cabin_number}` : null,
    target.properties.length ? target.properties.map((p) => `${p.name} (${p.code})`).join(" + ") : null,
  ].filter(Boolean).join(" · ");

  const submit = async () => {
    setBusy(true); setError(null);
    try {
      const url = mode === "retreat"
        ? `${API}/units/${unitId}/retreat`
        : `${API}/units/${unitId}/reassign`;
      const body = mode === "retreat"
        ? { reason, notes: notes.trim() || undefined }
        : {
            property_id: propertyId ? Number(propertyId) : undefined,
            cabin_id: cabinId ? Number(cabinId) : undefined,
            notes: notes.trim() || undefined,
          };

      const res = await axios.post(url, body, { withCredentials: true, headers: authHeaders });
      if (!res.data?.success) throw new Error(res.data?.message || "Action failed.");
      onDone?.(res.data);
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = mode === "retreat"
    ? Boolean(reason)
    : Boolean((propertyId || cabinId) && !target.invalid);

  const isRetreat = mode === "retreat";
  const retiring = isRetreat && chosenReason?.outcome === "retire";

  return (
    <div style={overlay} role="dialog" aria-modal="true">
      <div style={sheet}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 19, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
            {isRetreat ? "Return to stock" : "Move this unit"}
          </h2>
          <button
            onClick={onClose}
            type="button"
            style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#9898b0", lineHeight: 1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p style={{ margin: "0 0 18px", fontSize: 13, color: "#6b6b8a" }}>
          <strong style={{ color: "#6366f1" }}>{unit?.unit_code}</strong>
          {unit?.item_name ? ` · ${unit.item_name}` : null}
          {isRetreat
            ? " — it leaves its current location and rejoins the stock IT holds."
            : " — it leaves its current location and is assigned to the new one."}
        </p>

        {error && (
          <div style={{
            padding: "10px 12px", marginBottom: 14, borderRadius: 8,
            background: "#fef2f2", border: "1px solid #fecaca",
            color: "#b91c1c", fontSize: 13, lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: "18px 0", fontSize: 13, color: "#9898b0" }}>Loading options…</div>
        ) : isRetreat ? (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={label} htmlFor="retreat-reason">Why is it coming back?</label>
              <select
                id="retreat-reason"
                style={field}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">— Select a reason —</option>
                {options?.retreat_reasons?.map((r) => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
            </div>

            {chosenReason && (
              <div style={{
                padding: "10px 12px", marginBottom: 14, borderRadius: 8, fontSize: 12.5, lineHeight: 1.55,
                background: retiring ? "#fffbeb" : "#f0fdf4",
                border: `1px solid ${retiring ? "#fde68a" : "#bbf7d0"}`,
                color: retiring ? "#92400e" : "#166534",
              }}>
                {retiring ? (
                  <>
                    <strong>This unit will be retired, not returned to stock.</strong> A unit nobody can
                    find should not sit in the available count waiting to be assigned. Its asset code stays
                    reserved for good, so it is never reissued.
                  </>
                ) : chosenReason.condition === "it_custody_damaged" ? (
                  <>
                    Goes back into stock, <strong>flagged as damaged</strong> so reports show its real state.
                    It will not be offered by a bulk upload. If it should never be assigned again, use
                    <strong> Destroy</strong> instead.
                  </>
                ) : (
                  <>Goes back into stock as <strong>working</strong> and can be assigned again straight away.</>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#6b6b8a", lineHeight: 1.55 }}>
              Pick <strong>one</strong> — a cabin or a property. The other is filled in from the link
              between them, so both end up recorded.
            </p>

            <div style={{ marginBottom: 12 }}>
              <label style={label} htmlFor="ra-cabin">Cabin</label>
              <select id="ra-cabin" style={field} value={cabinId} onChange={(e) => setCabinId(e.target.value)}>
                <option value="">— none —</option>
                {options?.cabins?.map((c) => (
                  <option key={c.id} value={c.id}>Cabin {c.cabin_number}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={label} htmlFor="ra-prop">Property</label>
              <select id="ra-prop" style={field} value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
                <option value="">— none —</option>
                {options?.properties?.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                ))}
              </select>
            </div>

            {(propertyId || cabinId) && (
              <div style={{
                padding: "10px 12px", marginBottom: 14, borderRadius: 8, fontSize: 12.5, lineHeight: 1.55,
                background: target.invalid ? "#fef2f2" : "#f5f6ff",
                border: `1px solid ${target.invalid ? "#fecaca" : "#dfe2fb"}`,
                color: target.invalid ? "#b91c1c" : "#3730a3",
              }}>
                <div><strong>Will be assigned to:</strong> {targetLabel || "—"}</div>
                {target.note && <div style={{ marginTop: 4 }}>{target.note}</div>}
              </div>
            )}
          </>
        )}

        <div style={{ marginBottom: 18 }}>
          <label style={label} htmlFor="ua-notes">Note <span style={{ fontWeight: 400 }}>(optional)</span></label>
          <input
            id="ua-notes"
            style={field}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isRetreat ? "e.g. screen flickers under load" : "e.g. swapped with the front desk unit"}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            type="button"
            disabled={busy}
            style={{
              flex: 1, padding: 11, background: "#fff", border: "1px solid #e8eaf0",
              borderRadius: 8, color: "#6b6b8a", fontSize: 14, cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            type="button"
            disabled={!canSubmit || busy || loading}
            style={{
              flex: 1, padding: 11, border: "none", borderRadius: 8,
              background: !canSubmit || busy || loading ? "#c7c7d8" : retiring ? "#d97706" : "#6366f1",
              color: "#fff", fontSize: 14, fontWeight: 500,
              cursor: !canSubmit || busy || loading ? "not-allowed" : "pointer",
            }}
          >
            {busy
              ? "Working…"
              : isRetreat
                ? (retiring ? "Retire unit" : "Return to stock")
                : "Move unit"}
          </button>
        </div>
      </div>
    </div>
  );
}
