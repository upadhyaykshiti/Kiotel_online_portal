"use client";
import "../inventory.css";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import inventoryApi from "../_lib/inventoryApi";
import InventoryLayout from "../_components/InventoryLayout";
import { useInventoryUser } from "../_hooks/useInventoryUser";
import axios from "axios";

const ITEMS_PER_PAGE = 12;

export default function InventoryList() {
//   const { userRole, can } = useInventoryUser();
const { user, userRole, can } = useInventoryUser();
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | in_stock | out_of_stock | low_stock
  const [sort, setSort] = useState("name_asc");
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

const fetchItems = useCallback(async () => {
  if (!user) return;

  setLoading(true);

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/items`,
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

    setItems(res.data?.data || []);
  } catch (err) {
    console.error("Inventory fetch error:", err);
    setError("Failed to load inventory items.");
  } finally {
    setLoading(false);
  }
}, [user]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    let list = [...items];

    // Search
    if (search.trim()) {
      list = list.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    }

    // Filter
    if (filter === "in_stock") list = list.filter((i) => i.available_quantity > 4);
    else if (filter === "out_of_stock") list = list.filter((i) => i.available_quantity === 0);
    else if (filter === "low_stock") list = list.filter((i) => i.available_quantity > 0 && i.available_quantity < 5);

    // Sort
    if (sort === "name_asc") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "name_desc") list.sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === "qty_asc") list.sort((a, b) => a.available_quantity - b.available_quantity);
    else if (sort === "qty_desc") list.sort((a, b) => b.available_quantity - a.available_quantity);
    else if (sort === "recent") list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    setFiltered(list);
    setPage(1);
  }, [items, search, filter, sort]);

  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const stockBadge = (qty) => {
    if (qty === 0) return <span className="list-badge out">Out of Stock</span>;
    if (qty < 5) return <span className="list-badge low">Low Stock</span>;
    return <span className="list-badge in">In Stock</span>;
  };

  return (
    <InventoryLayout title="Inventory List" subtitle={`${filtered.length} items found`}>
      

      {/* Toolbar */}
      <div className="list-toolbar">
        <div className="list-search-wrap">
          <span className="list-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            className="list-search"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="list-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Items</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        <select className="list-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name_asc">Name A→Z</option>
          <option value="name_desc">Name Z→A</option>
          <option value="qty_asc">Qty Low→High</option>
          <option value="qty_desc">Qty High→Low</option>
          <option value="recent">Recently Updated</option>
        </select>

        {can("create") && (
          <Link href="/inventory/create-item" className="list-btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Item
          </Link>
        )}
      </div>

      {error && <div className="list-error">{error}</div>}

      {/* Grid */}
      {loading ? (
        <div className="list-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="inv-skeleton" style={{ height: 220, borderRadius: 12 }} />
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="list-empty">
          <div className="list-empty-icon">📦</div>
          <div className="list-empty-text">No items found</div>
          <div className="list-empty-sub">Try adjusting your search or filters</div>
        </div>
      ) : (
        <div className="list-grid">
          {paged.map((item) => (
            <div key={item.id} className="list-item-card">
              <Link href={`/inventory/item/${item.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <div className="list-item-img">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                  )}
                </div>
                <div className="list-item-body">
                  <div className="list-item-name">{item.name}</div>
                  {stockBadge(item.available_quantity)}
                  <div className="list-item-footer">
                    <div>
                      <div className="list-item-qty">{item.available_quantity}</div>
                      <div className="list-item-qty-label">units</div>
                    </div>
                  </div>
                  <div className="list-item-updated">
                    Updated {item.updated_at ? new Date(item.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}
                  </div>
                </div>
              </Link>
              {(can("add") || can("remove")) && (
                <div className="list-item-actions">
                  {can("add") && (
                    <Link href={`/inventory/add?item_id=${item.id}`} className="list-act-btn add">
                      + Add
                    </Link>
                  )}
                  {can("remove") && (
                    <Link href={`/inventory/remove?item_id=${item.id}`} className="list-act-btn remove">
                      − Remove
                    </Link>
                  )}
                  <Link href={`/inventory/item/${item.id}`} className="list-act-btn">
                    History
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="list-pagination">
          <button className="list-page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
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
                <span key={`ellipsis-${i}`} style={{ color: "#3a3a55", fontSize: 13 }}>…</span>
              ) : (
                <button key={p} className={`list-page-btn${page === p ? " active" : ""}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              )
            )}
          <button className="list-page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      )}
    </InventoryLayout>
  );
}