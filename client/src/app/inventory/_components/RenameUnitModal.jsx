"use client";
import { useState } from "react";
import axios from "axios";

export default function RenameUnitModal({ unit, user, onClose, onSuccess }) {
  const [newNumber, setNewNumber] = useState(unit.unit_code.replace(/^\D+/, ''));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!/^\d+$/.test(newNumber.trim())) {
      setError("Only numbers allowed.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/units/${unit.unit_id}/code`,
        { new_number: newNumber.trim() },
        {
          withCredentials: true,
          headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
        }
      );
      if (res.data?.success) {
        onSuccess(res.data.new_code);
      } else {
        setError(res.data?.message || "Failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 400, width: "100%" }}>
        <h2 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 700 }}>Rename Unit</h2>
        <div style={{ fontSize: 13, color: "#6b6b8a", marginBottom: 16 }}>
          Current: <strong style={{ color: "#6366f1" }}>{unit.unit_code}</strong>
        </div>

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#9898b0", marginBottom: 6 }}>
          New Number (prefix stays same)
        </label>
        <input
          type="text"
          value={newNumber}
          onChange={(e) => { setNewNumber(e.target.value.replace(/\D/g, '')); setError(""); }}
          className="ri-input"
          style={{ marginBottom: 8 }}
          placeholder="e.g. 005"
        />
        {error && <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 8 }}>{error}</div>}

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} className="ri-btn-secondary" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="ri-btn-primary" style={{ flex: 1 }}>
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}