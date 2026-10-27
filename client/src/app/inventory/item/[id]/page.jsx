"use client";
import "../../inventory.css";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import inventoryApi from "../../_lib/inventoryApi";
import InventoryLayout from "../../_components/InventoryLayout";
import { useInventoryUser } from "../../_hooks/useInventoryUser";
import axios from "axios";

const TX_PER_PAGE = 10;

function exportCSV(rows, itemName) {
  const headers = ["Date", "Type", "Qty", "Before", "After", "Used For", "Notes", "Performed By"];
  const csvRows = [
    headers.join(","),
    ...rows.map((r) => [
      new Date(r.created_at).toLocaleDateString("en-IN"),
      r.transaction_type,
      r.transaction_type === "add" ? `+${r.quantity}` : `-${r.quantity}`,
      r.before_quantity ?? "",
      r.after_quantity ?? "",
      `"${(r.used_for || "").replace(/"/g, '""')}"`,
      `"${(r.notes || "").replace(/"/g, '""')}"`,
      `"${(r.performed_by || r.created_by_name || "").replace(/"/g, '""')}"`,
    ].join(","))
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${itemName || "inventory"}-history.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ItemHistory() {
  const { id } = useParams();
  const router = useRouter();
//   const { can } = useInventoryUser();
const {
  user,
  can,
  loading: userLoading
} = useInventoryUser();

  const [item, setItem] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loadingItem, setLoadingItem] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [error, setError] = useState(null);

  const [txFilter, setTxFilter] = useState("all"); // all | add | remove
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

const fetchItem = useCallback(async () => {
  if (!user) return;

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/items/${id}`,
      {
        withCredentials: true,
        headers: {
          "x-user-id": user.id,
          "x-user-role": user.roleId,
          "x-user-email": user.email,
          "x-user-fname": user.fname,
          "x-user-unique-id": user.unique_id,
        },
      }
    );

    setItem(res.data?.item || res.data?.data || null);
  } catch (err) {
    console.error(err);
    setError("Failed to load item details.");
  } finally {
    setLoadingItem(false);
  }
}, [id, user]);

const fetchHistory = useCallback(async () => {
  if (!user) return;

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/items/${id}/history`,
      {
        withCredentials: true,
        headers: {
          "x-user-id": user.id,
          "x-user-role": user.roleId,
          "x-user-email": user.email,
          "x-user-fname": user.fname,
          "x-user-unique-id": user.unique_id,
        },
      }
    );

    setTransactions(res.data?.data || []);
  } catch (err) {
    console.error(err);
    setError("Failed to load transaction history.");
  } finally {
    setLoadingTx(false);
  }
}, [id, user]);

//   useEffect(() => { fetchItem(); fetchHistory(); }, [fetchItem, fetchHistory]);
useEffect(() => {
  if (userLoading) return;

  if (!user) {
    setLoadingItem(false);
    setLoadingTx(false);
    return;
  }

  fetchItem();
  fetchHistory();
}, [user, userLoading, fetchItem, fetchHistory]);

  useEffect(() => {
    let list = [...transactions];
    if (txFilter !== "all") list = list.filter((t) => t.transaction_type === txFilter);
    if (dateFrom) list = list.filter((t) => new Date(t.created_at) >= new Date(dateFrom));
    if (dateTo) list = list.filter((t) => new Date(t.created_at) <= new Date(dateTo + "T23:59:59"));
    setFiltered(list);
    setPage(1);
  }, [transactions, txFilter, dateFrom, dateTo]);

  const paged = filtered.slice((page - 1) * TX_PER_PAGE, page * TX_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / TX_PER_PAGE);

  const totalAdded = transactions.filter((t) => t.transaction_type === "add").reduce((s, t) => s + t.quantity, 0);
  const totalRemoved = transactions.filter((t) => t.transaction_type === "remove").reduce((s, t) => s + t.quantity, 0);

  if (error && !item) {
    return (
      <InventoryLayout title="Item History" subtitle="Audit trail">
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#f87171" }}>{error}</div>
      </InventoryLayout>
    );
  }

  return (
    <InventoryLayout
      title={loadingItem ? "Loading..." : item?.name || "Item Details"}
      subtitle="Full transaction history and audit trail"
    >
      

      {/* Breadcrumb */}
      <div className="ih-breadcrumb">
        <Link href="/inventory">Dashboard</Link>
        <span className="ih-breadcrumb-sep">›</span>
        <Link href="/inventory/list">Inventory</Link>
        <span className="ih-breadcrumb-sep">›</span>
        <span style={{ color: "#8080a8" }}>{loadingItem ? "..." : item?.name || `Item #${id}`}</span>
      </div>

      {/* Item Header */}
      <div className="ih-item-header">
        <div className="ih-item-img">
          {item?.image_url ? (
            <img src={item.image_url} alt={item.name} />
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          )}
        </div>
        <div className="ih-item-meta">
          {loadingItem ? (
            <>
              <div className="inv-skeleton" style={{ height: 28, width: 200, marginBottom: 10 }} />
              <div className="inv-skeleton" style={{ height: 22, width: 120 }} />
            </>
          ) : (
            <>
              <div className="ih-item-name">{item?.name}</div>
              <div className="ih-item-tags">
                <span className="ih-tag ih-tag-qty">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>
                  {item?.available_quantity ?? 0} units
                </span>
                <span className={`ih-tag ih-tag-status-${item?.status || "active"}`}>
                  {item?.status || "active"}
                </span>
              </div>
            </>
          )}
        </div>
        {(can("add") || can("remove")) && (
          <div className="ih-item-actions">
            {can("add") && (
              <Link href={`/inventory/add?item_id=${id}`} className="ih-act-btn add">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Stock
              </Link>
            )}
            {can("remove") && (
              <Link href={`/inventory/remove?item_id=${id}`} className="ih-act-btn remove">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Remove Stock
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="ih-summary">
        <div className="ih-sum-card">
          <div className={`ih-sum-val current`}>{loadingItem ? "—" : item?.available_quantity ?? 0}</div>
          <div className="ih-sum-label">Current Stock</div>
        </div>
        <div className="ih-sum-card">
          <div className="ih-sum-val added">+{loadingTx ? "—" : totalAdded}</div>
          <div className="ih-sum-label">Total Added</div>
        </div>
        <div className="ih-sum-card">
          <div className="ih-sum-val removed">−{loadingTx ? "—" : totalRemoved}</div>
          <div className="ih-sum-label">Total Removed</div>
        </div>
      </div>

      {/* History Section */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, color: "#5a5a78", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Transaction History
        </div>

        {/* Toolbar */}
        <div className="ih-toolbar">
          {["all", "add", "remove"].map((f) => (
            <button
              key={f}
              className={`ih-filter-btn${txFilter === f ? " active" : ""}`}
              onClick={() => setTxFilter(f)}
            >
              {f === "all" ? "All" : f === "add" ? "✦ Added" : "✦ Removed"}
            </button>
          ))}
          <input type="date" className="ih-date-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title="From date" />
          <input type="date" className="ih-date-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} title="To date" />
          {(dateFrom || dateTo) && (
            <button className="ih-filter-btn" onClick={() => { setDateFrom(""); setDateTo(""); }}>Clear dates</button>
          )}
          <button className="ih-export-btn" onClick={() => exportCSV(filtered, item?.name)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="ih-table-wrap">
        {loadingTx ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3,4].map(i => <div key={i} className="inv-skeleton" style={{ height: 44, borderRadius: 6 }} />)}
          </div>
        ) : paged.length === 0 ? (
          <div className="ih-empty">No transactions found for the selected filters.</div>
        ) : (
          <>
            <table className="ih-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Before → After</th>
                  <th>Used For / Notes</th>
                  <th>By</th>
                  <th>Proof</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ whiteSpace: "nowrap", color: "#6060800", color: "#606080", fontSize: "12.5px" }}>
                      {tx.created_at
                        ? new Date(tx.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })
                        : "—"}
                      <div style={{ fontSize: 11, color: "#3a3a55", marginTop: 1 }}>
                        {tx.created_at ? new Date(tx.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </div>
                    </td>
                    <td>
                      {/* <span className={`ih-type-badge ${tx.transaction_type}`}>
                        {tx.transaction_type === "add" ? "↑ Added" : "↓ Removed"}
                      </span> */}
                      <span className={`ih-type-badge ${tx.transaction_type}`}>
  {tx.transaction_type === "add" ? "↑ Added" : tx.transaction_type === "destroy" ? " Destroyed" : "↓ Removed"}
</span>
                    </td>
                    <td className={tx.transaction_type === "add" ? "ih-qty-add" : "ih-qty-remove"}>
                      {tx.transaction_type === "add" ? "+" : "−"}{tx.quantity}
                    </td>
                    <td>
                      <div className="ih-before-after">
                        <span>{tx.before_quantity ?? "—"}</span>
                        <span className="arrow">→</span>
                        <span className="after">{tx.after_quantity ?? "—"}</span>
                      </div>
                    </td>
                    <td>
                      {tx.used_for && <div style={{ color: "#9090b0", fontSize: 13 }}>{tx.used_for}</div>}
                      {tx.notes && <div style={{ color: "#5a5a78", fontSize: 12, marginTop: 2 }}>{tx.notes}</div>}
                      {!tx.used_for && !tx.notes && <span style={{ color: "#2e2e45" }}>—</span>}
                    </td>
                    <td style={{ fontSize: 12.5, color: "#7070900", color: "#707090" }}>
                      {tx.performed_by || tx.created_by_name || `#${tx.created_by}` || "—"}
                    </td>
                    <td>
                      {tx.image_url ? (
                        <a href={tx.image_url} target="_blank" rel="noopener noreferrer" className="ih-attachment">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                          View
                        </a>
                      ) : (
                        <span style={{ color: "#2e2e45", fontSize: 12 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="ih-pagination">
                <button className="ih-page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`e-${i}`} style={{ color: "#3a3a55", fontSize: 13 }}>…</span>
                    ) : (
                      <button key={p} className={`ih-page-btn${page === p ? " active" : ""}`} onClick={() => setPage(p)}>
                        {p}
                      </button>
                    )
                  )}
                <button className="ih-page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </InventoryLayout>
  );
}