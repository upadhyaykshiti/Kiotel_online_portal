"use client";
import "../inventory.css";
import { useState, useEffect } from "react";
import InventoryLayout from "../_components/InventoryLayout";
import { useInventoryUser } from "../_hooks/useInventoryUser";
import axios from "axios";

export default function Logs() {
  const { user, userRole, loading: userLoading } = useInventoryUser();
  const [logs, setLogs] = useState([]);
  const [items, setItems] = useState({}); // Map of item_id -> item_name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/logs?page=${page}&action=${filterAction}`,
          {
            withCredentials: true,
            headers: {
              "x-user-id": user.id, "x-user-role": user.roleId,
              "x-user-email": user.email, "x-user-fname": user.fname,
              "x-user-unique-id": user.unique_id,
            },
          }
        );
        setLogs(res.data?.data || []);
        setTotalPages(res.data?.pagination?.totalPages || 1);
        setTotal(res.data?.pagination?.total || 0);
      } catch (err) {
        setError("Failed to load logs.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user, page, filterAction]);

  // Fetch items list to map IDs to names
  useEffect(() => {
    if (!user) return;
    const fetchItems = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/items?limit=1000`,
          {
            withCredentials: true,
            headers: {
              "x-user-id": user.id, "x-user-role": user.roleId,
              "x-user-email": user.email, "x-user-fname": user.fname,
              "x-user-unique-id": user.unique_id,
            },
          }
        );
        const itemsMap = {};
        (res.data?.data || []).forEach(item => {
          itemsMap[item.id] = item.name;
        });
        setItems(itemsMap);
      } catch (err) {
        console.error("Failed to fetch items:", err);
      }
    };
    fetchItems();
  }, [user]);

  const getActionLabel = (action) => {
    const labels = {
      'inventory.transaction.add': '📥 Added Inventory',
      'inventory.transaction.remove': '📤 Removed Inventory',
      'inventory.transaction.destroy': '🗑️ Destroyed Inventory',
      'inventory.reassign': '🔄 Reassigned Inventory',
      'property.create': '🏢 Created Property',
      'properties.import': '📥 Imported Properties',
      'cabin.create': '🚪 Created Cabin',
      'cabins.import': '📥 Imported Cabins',
      'property_cabin.link': '🔗 Linked Property-Cabin',
      'property_cabin.unlink': '🔓 Unlinked Property-Cabin',
      'item.create': '📦 Created Item',
      'inventory.units.import': '📊 Bulk Imported Units',
      'unit.rename': '🏷️ Renamed Unit Code',
    };
    return labels[action] || action;
  };

  const formatMeta = (meta) => {
    if (!meta) return '—';
    try {
      const parsed = typeof meta === 'string' ? JSON.parse(meta) : meta;
      const parts = [];
      
      // ✅ Show item name instead of item_id
      if (parsed.item_id) {
        const itemName = items[parsed.item_id] || `Item #${parsed.item_id}`;
        parts.push(`Item: ${itemName}`);
      }
      
      if (parsed.qty || parsed.quantity) parts.push(`Qty: ${parsed.qty || parsed.quantity}`);
      if (parsed.reason) parts.push(`Reason: ${parsed.reason}`);
      if (parsed.before !== undefined && parsed.after !== undefined) parts.push(`${parsed.before} → ${parsed.after}`);
      if (parsed.unit_codes) {
        const shown = parsed.unit_codes.join(', ');
        const total = parsed.unit_codes_total ?? parsed.unit_codes.length;
        parts.push(
          parsed.unit_codes_truncated
            ? `Units: ${shown} … +${total - parsed.unit_codes.length} more (${total} total)`
            : `Units: ${shown}`
        );
      }
      // Bulk import writes one audit entry covering all three phases.
      if (parsed.inserted !== undefined) {
        const phases = [`${parsed.inserted} added`];
        if (parsed.assigned) phases.push(`${parsed.assigned} assigned`);
        if (parsed.retired) phases.push(`${parsed.retired} retired`);
        if (parsed.updated) phases.push(`${parsed.updated} updated`);
        if (parsed.kept) phases.push(`${parsed.kept} unchanged`);
        parts.push(phases.join(', '));
      }
      if (parsed.file) parts.push(`File: ${parsed.file}`);
      if (parsed.imported) parts.push(`Imported: ${parsed.imported}`);
      if (parsed.property_id) parts.push(`Property: ${parsed.property_id}`);
      if (parsed.cabin_id) parts.push(`Cabin: ${parsed.cabin_id}`);
      
      return parts.join(' · ') || JSON.stringify(parsed).substring(0, 100);
    } catch {
      return '—';
    }
  };

  return (
    <InventoryLayout title="Activity Logs" subtitle={`${total} total entries`}>
      <div style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Filter by action (e.g., inventory, property)..."
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
          style={{
            flex: 1, padding: "10px 14px", border: "1px solid #e8eaf0",
            borderRadius: 8, fontSize: 13, outline: "none"
          }}
        />
      </div>

      {error && <div className="list-error">{error}</div>}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="inv-skeleton" style={{ height: 60, borderRadius: 8 }} />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="list-empty">
          <div className="list-empty-icon">📋</div>
          <div className="list-empty-text">No logs found</div>
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b6b8a", fontWeight: 600, borderBottom: "1px solid #e8eaf0" }}>Date & Time</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b6b8a", fontWeight: 600, borderBottom: "1px solid #e8eaf0" }}>Action</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b6b8a", fontWeight: 600, borderBottom: "1px solid #e8eaf0" }}>User</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b6b8a", fontWeight: 600, borderBottom: "1px solid #e8eaf0" }}>Details</th>
                  {/* <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b6b8a", fontWeight: 600, borderBottom: "1px solid #e8eaf0" }}>IP Address</th> */}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f0f1f8" }}>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap", color: "#6b6b8a", fontSize: 12 }}>
                      {new Date(log.created_at).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 500, color: "#2a2a3e" }}>
                      {getActionLabel(log.action)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ color: "#2a2a3e", fontWeight: 500 }}>{log.fname || 'System'}</div>
                      <div style={{ fontSize: 11, color: "#9898b0" }}>{log.email || '—'}</div>
                      
                      {/* Display Performed By Name */}
                      {(() => {
                        try {
                          const metaObj = typeof log.meta === 'string' ? JSON.parse(log.meta || '{}') : (log.meta || {});
                          const performedBy = metaObj.performed_by;
                          if (performedBy) {
                            return (
                              <div style={{ 
                                fontSize: 11, 
                                color: "#6366f1", 
                                marginTop: 6, 
                                fontWeight: 600,
                                background: "#eef0fd",
                                padding: "2px 6px",
                                borderRadius: 4,
                                display: "inline-block"
                              }}>
                                Performed by: {performedBy}
                              </div>
                            );
                          }
                        } catch (e) {}
                        return null;
                      })()}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6b6b8a", fontSize: 12, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {formatMeta(log.meta)}
                    </td>
                    {/* <td style={{ padding: "12px 16px", color: "#9898b0", fontSize: 11, fontFamily: "monospace" }}>
                      {log.ip_address || '—'}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, padding: "12px 16px", background: "#fff", border: "1px solid #e8eaf0", borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: "#6b6b8a" }}>
              Page {page} of {totalPages} · {total} total entries
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "6px 14px", border: "1px solid #e8eaf0", borderRadius: 6,
                  background: page === 1 ? "#f9fafb" : "#fff", color: page === 1 ? "#c0c0d8" : "#4a4a6a",
                  cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500
                }}
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: "6px 14px", border: "1px solid #e8eaf0", borderRadius: 6,
                  background: page === totalPages ? "#f9fafb" : "#fff", color: page === totalPages ? "#c0c0d8" : "#4a4a6a",
                  cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </InventoryLayout>
  );
}