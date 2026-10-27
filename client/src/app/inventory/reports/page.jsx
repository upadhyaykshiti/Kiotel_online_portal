"use client";
import "../inventory.css";
import { useState, useEffect } from "react";
import InventoryLayout from "../_components/InventoryLayout";
import { useInventoryUser } from "../_hooks/useInventoryUser";
import axios from "axios";

const UNIT_CONDITIONS = {
  occupied: "Occupied",
  it_custody_working: "IT Custody — Working",
  it_custody_damaged: "IT Custody — Damaged",
  thrown: "Thrown",
  unknown: "Unknown",
};

export default function Reports() {
  const { user, userRole, loading: userLoading } = useInventoryUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  // Model / serial / condition only exist once the unit-import migration is applied.
  const [hasUnitDetails, setHasUnitDetails] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchReport = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/reports/items`,
          {
            withCredentials: true,
            headers: {
              "x-user-id": user.id, "x-user-role": user.roleId,
              "x-user-email": user.email, "x-user-fname": user.fname,
              "x-user-unique-id": user.unique_id,
            },
          }
        );
        setItems(res.data?.data || []);
        setHasUnitDetails(Boolean(res.data?.has_unit_details));
      } catch (err) {
        setError("Failed to load report.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [user]);

  const handleDownload = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/reports/items/download`,
        {
          withCredentials: true,
          headers: {
            "x-user-id": user.id, "x-user-role": user.roleId,
            "x-user-email": user.email, "x-user-fname": user.fname,
            "x-user-unique-id": user.unique_id,
          },
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download report.");
    }
  };

  return (
    <InventoryLayout title="Inventory Report" subtitle="Complete inventory overview">
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 14, color: "#6b6b8a" }}>
          {items.length} items · {items.reduce((sum, i) => sum + i.total_units, 0)} total units
        </div>
        <button
          onClick={handleDownload}
          style={{
            padding: "8px 16px", background: "#10b981", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download Excel
        </button>
      </div>

      {error && <div className="list-error">{error}</div>}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="inv-skeleton" style={{ height: 60, borderRadius: 8 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="list-empty">
          <div className="list-empty-icon">📊</div>
          <div className="list-empty-text">No inventory data found</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => (
            <div key={item.item_id} style={{
              background: "#fff", border: "1px solid #e8eaf0",
              borderRadius: 10, overflow: "hidden"
            }}>
              <div
                onClick={() => setExpandedItem(expandedItem === item.item_id ? null : item.item_id)}
                style={{
                  padding: "16px 20px", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: expandedItem === item.item_id ? "#f9fafb" : "#fff"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: expandedItem === item.item_id ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <div>
                    <div style={{ fontWeight: 600, color: "#2a2a3e", fontSize: 15 }}>{item.item_name}</div>
                    <div style={{ fontSize: 12, color: "#9898b0", marginTop: 2 }}>
                      Prefix: {item.prefix} · {item.is_movable ? "🔄 Movable" : "🔒 Fixed"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, textAlign: "center" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#6366f1" }}>{item.total_units}</div>
                    <div style={{ fontSize: 11, color: "#9898b0" }}>Total</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#16a34a" }}>{item.available_units}</div>
                    <div style={{ fontSize: 11, color: "#9898b0" }}>Available</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#dc2626" }}>{item.assigned_units}</div>
                    <div style={{ fontSize: 11, color: "#9898b0" }}>Assigned</div>
                  </div>
                </div>
              </div>

              {expandedItem === item.item_id && (
                <div style={{ borderTop: "1px solid #e8eaf0" }}>
                  {item.units.length === 0 ? (
                    <div style={{ padding: 20, textAlign: "center", color: "#9898b0", fontSize: 13 }}>
                      No units recorded for this item.
                    </div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b6b8a", fontWeight: 600, borderBottom: "1px solid #e8eaf0" }}>Unit Code</th>
                          <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b6b8a", fontWeight: 600, borderBottom: "1px solid #e8eaf0" }}>Status</th>
                          {hasUnitDetails && <>
                            <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b6b8a", fontWeight: 600, borderBottom: "1px solid #e8eaf0" }}>Model</th>
                            <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b6b8a", fontWeight: 600, borderBottom: "1px solid #e8eaf0" }}>Serial / IMEI</th>
                            <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b6b8a", fontWeight: 600, borderBottom: "1px solid #e8eaf0" }}>Condition</th>
                          </>}
                          <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b6b8a", fontWeight: 600, borderBottom: "1px solid #e8eaf0" }}>Property</th>
                          <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b6b8a", fontWeight: 600, borderBottom: "1px solid #e8eaf0" }}>Cabin</th>
                          <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b6b8a", fontWeight: 600, borderBottom: "1px solid #e8eaf0" }}>Assigned Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.units.map((unit) => (
                          <tr key={unit.unit_id} style={{ borderBottom: "1px solid #f0f1f8" }}>
                            <td style={{ padding: "10px 16px", fontWeight: 600, color: "#6366f1" }}>{unit.unit_code}</td>
                            <td style={{ padding: "10px 16px" }}>
                              <span style={{
                                padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500,
                                background: unit.status === 'available' ? "#dcfce7" : "#fee2e2",
                                color: unit.status === 'available' ? "#16a34a" : "#dc2626"
                              }}>
                                {unit.status.toUpperCase()}
                              </span>
                            </td>
                            {hasUnitDetails && <>
                              <td style={{ padding: "10px 16px", color: "#4a4a6a" }}>{unit.model || '—'}</td>
                              <td style={{ padding: "10px 16px", color: "#4a4a6a" }}>{unit.serial_no || '—'}</td>
                              <td style={{ padding: "10px 16px", color: "#4a4a6a", fontSize: 12 }} title={unit.remark || ""}>
                                {UNIT_CONDITIONS[unit.condition_status] || '—'}
                              </td>
                            </>}
                            <td style={{ padding: "10px 16px", color: "#4a4a6a" }}>{unit.property_name}</td>
                            <td style={{ padding: "10px 16px", color: "#4a4a6a" }}>{unit.cabin_number || unit.cabin_no || '—'}</td>
                            <td style={{ padding: "10px 16px", color: "#6b6b8a", fontSize: 12 }}>
                              {unit.assigned_at ? new Date(unit.assigned_at).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </InventoryLayout>
  );
}