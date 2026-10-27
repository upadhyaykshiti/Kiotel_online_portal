// "use client";
// import "../../inventory.css";
// import { useState, useEffect, useCallback } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import InventoryLayout from "../../_components/InventoryLayout";
// import { useInventoryUser } from "../../_hooks/useInventoryUser";
// import axios from "axios";

// export default function PropertyInventory() {
//   const { id } = useParams();
//   const router = useRouter();
//   const { user, userRole, loading: userLoading } = useInventoryUser();

//   const [property, setProperty] = useState(null);
//   const [inventory, setInventory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchPropertyData = useCallback(async () => {
//     if (!user) return;

//     try {
//       // Fetch property details
//       const propRes = await axios.get(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/properties/${id}`,
//         {
//           withCredentials: true,
//           headers: {
//             "x-user-id": user.id,
//             "x-user-role": user.roleId,
//             "x-user-email": user.email,
//             "x-user-fname": user.fname,
//             "x-user-unique-id": user.unique_id,
//           },
//         }
//       );
//       setProperty(propRes.data?.property || null);

//       // Fetch property inventory
//       const invRes = await axios.get(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/properties/${id}/inventory`,
//         {
//           withCredentials: true,
//           headers: {
//             "x-user-id": user.id,
//             "x-user-role": user.roleId,
//             "x-user-email": user.email,
//             "x-user-fname": user.fname,
//             "x-user-unique-id": user.unique_id,
//           },
//         }
//       );
//       setInventory(invRes.data?.data || []);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load property data.");
//     } finally {
//       setLoading(false);
//     }
//   }, [id, user]);

//   useEffect(() => {
//     if (userLoading) return;
//     if (!user) {
//       setLoading(false);
//       return;
//     }
//     fetchPropertyData();
//   }, [user, userLoading, fetchPropertyData]);

//   if (error && !property) {
//     return (
//       <InventoryLayout title="Property Inventory" subtitle="View assigned inventory">
//         <div style={{ padding: "60px 20px", textAlign: "center", color: "#f87171" }}>{error}</div>
//       </InventoryLayout>
//     );
//   }

//   return (
//     <InventoryLayout
//       title={loading ? "Loading..." : property?.name || "Property Details"}
//       subtitle="Assigned inventory and equipment"
//     >
//       {/* Breadcrumb */}
//       <div className="ih-breadcrumb">
//         <Link href="/inventory">Dashboard</Link>
//         <span className="ih-breadcrumb-sep">›</span>
//         <Link href="/inventory/properties">Properties</Link>
//         <span className="ih-breadcrumb-sep">›</span>
//         <span style={{ color: "#8080a8" }}>{loading ? "..." : property?.name || `Property #${id}`}</span>
//       </div>

//       {/* Property Header */}
//       <div className="ih-item-header">
//         <div className="ih-item-meta" style={{ flex: 1 }}>
//           {loading ? (
//             <>
//               <div className="inv-skeleton" style={{ height: 28, width: 200, marginBottom: 10 }} />
//               <div className="inv-skeleton" style={{ height: 22, width: 120 }} />
//             </>
//           ) : (
//             <>
//               <div className="ih-item-name">{property?.name}</div>
//               <div className="ih-item-tags">
//                 <span className="ih-tag ih-tag-qty">
//                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                     <rect x="2" y="7" width="20" height="14" rx="2" />
//                     <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
//                   </svg>
//                   {inventory.length} units assigned
//                 </span>
//                 <span className="ih-tag ih-tag-status-active">{property?.code}</span>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Summary Stats */}
//       <div className="ih-summary">
//         <div className="ih-sum-card">
//           <div className="ih-sum-val current">{loading ? "—" : inventory.length}</div>
//           <div className="ih-sum-label">Total Units</div>
//         </div>
//         <div className="ih-sum-card">
//           <div className="ih-sum-val added">
//             {loading ? "—" : new Set(inventory.map(i => i.item_id)).size}
//           </div>
//           <div className="ih-sum-label">Unique Items</div>
//         </div>
//         <div className="ih-sum-card">
//           <div className="ih-sum-val removed">
//             {loading ? "—" : new Set(inventory.map(i => i.cabin_no)).size}
//           </div>
//           <div className="ih-sum-label">Cabins</div>
//         </div>
//       </div>

//       {/* Inventory List */}
//       <div style={{ marginBottom: 12 }}>
//         <div style={{ fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, color: "#5a5a78", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
//           Assigned Inventory
//         </div>

//         {/* Table */}
//         <div className="ih-table-wrap">
//           {loading ? (
//             <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
//               {[1, 2, 3, 4].map(i => <div key={i} className="inv-skeleton" style={{ height: 44, borderRadius: 6 }} />)}
//             </div>
//           ) : inventory.length === 0 ? (
//             <div className="ih-empty">No inventory assigned to this property.</div>
//           ) : (
//             <table className="ih-table">
//               <thead>
//                 <tr>
//                   <th>Unit Code</th>
//                   <th>Item Name</th>
//                   <th>Cabin</th>
//                   <th>Assigned Date</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {inventory.map((item) => (
//                   <tr key={item.unit_id}>
//                     <td style={{ fontWeight: 600, color: "#6366f1" }}>{item.unit_code}</td>
//                     <td>
//                       <div style={{ color: "#2a2a3e", fontWeight: 500 }}>{item.item_name}</div>
//                       {item.prefix && <div style={{ fontSize: 11, color: "#9898b0" }}>Prefix: {item.prefix}</div>}
//                     </td>
//                     <td style={{ color: "#4a4a6a" }}>{item.cabin_no}</td>
//                     <td style={{ whiteSpace: "nowrap", color: "#606080", fontSize: "12.5px" }}>
//                       {item.assigned_at
//                         ? new Date(item.assigned_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })
//                         : "—"}
//                     </td>
//                     <td>
//                       <span className={`ih-tag ih-tag-status-${item.status}`}>
//                         {item.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </InventoryLayout>
//   );
// }






"use client";
import "../../inventory.css";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import InventoryLayout from "../../_components/InventoryLayout";
import { useInventoryUser } from "../../_hooks/useInventoryUser";
import RenameUnitModal from "../../_components/RenameUnitModal";
import UnitActionModal from "../../_components/UnitActionModals";
import axios from "axios";

export default function PropertyInventory() {
  const { id } = useParams();
  const router = useRouter();
  const { user, userRole, loading: userLoading, can } = useInventoryUser();

  const [propertyData, setPropertyData] = useState(null);
  const [linkedCabins, setLinkedCabins] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [cabins, setCabins] = useState([]);
  const [selectedCabinId, setSelectedCabinId] = useState("");
  const [renameModal, setRenameModal] = useState({ open: false, unit: null });
  // Retreat / Re-assign, both driven by the shared modal.
  const [unitAction, setUnitAction] = useState({ open: false, unit: null, mode: null });
  const [notice, setNotice] = useState(null);

  const fetchProperty = useCallback(async () => {
    if (!user) return;
    try {
      const [propertyRes, propertyCabinRes, cabinsRes, invRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/properties/${id}`,
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
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/property-cabins?property_id=${id}`,
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
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/cabins`,
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
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/properties/${id}/inventory`,
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
        )
      ]);

      setPropertyData(propertyRes.data?.property || null);
      setLinkedCabins(propertyCabinRes.data?.data || []);
      setCabins(cabinsRes.data?.data || []);
      
      const allInventory = invRes.data?.data || [];
      setInventory(allInventory);
    } catch (err) {
      console.error(err);
      setError("Failed to load property inventory.");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (userLoading) return;
    if (!user) { setLoading(false); return; }
    fetchProperty();
  }, [user, userLoading, fetchProperty]);

  const handleLinkCabin = async () => {
    if (!selectedCabinId) return;
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/cabins/${selectedCabinId}/link-property`,
        { property_id: id },
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
      setShowLinkModal(false);
      setSelectedCabinId("");
      fetchProperty();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to link cabin.");
    }
  };

  const handleUnlinkCabin = async (cabinId) => {
    if (!confirm("Unlink this cabin from the property?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/cabins/${cabinId}/unlink-property/${id}`,
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
      fetchProperty();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to unlink cabin.");
    }
  };

  if (error && !propertyData) {
    return (
      <InventoryLayout title="Property Inventory" subtitle="View assigned inventory">
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#f87171" }}>{error}</div>
      </InventoryLayout>
    );
  }

  return (
    <InventoryLayout
      title={loading ? "Loading..." : propertyData?.name}
      subtitle="Property Inventory Details"
    >
      {/* Breadcrumb */}
      <div className="ih-breadcrumb">
        <Link href="/inventory">Dashboard</Link>
        <span className="ih-breadcrumb-sep">›</span>
        <Link href="/inventory/locations?view=properties">Properties</Link>
        <span className="ih-breadcrumb-sep">›</span>
        <span style={{ color: "#8080a8" }}>
          {loading ? "..." : propertyData?.name}
        </span>
      </div>

      {notice && (
        <div
          style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "11px 14px", marginBottom: 16, borderRadius: 8,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            color: "#166534", fontSize: 13, lineHeight: 1.55,
          }}
        >
          <span>✓</span>
          <span style={{ flex: 1 }}>{notice}</span>
          <button
            onClick={() => setNotice(null)}
            type="button"
            aria-label="Dismiss"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#166534", fontSize: 16, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Property Header */}
      <div className="ih-item-header">
        <div className="ih-item-meta" style={{ flex: 1 }}>
          {loading ? (
            <>
              <div className="inv-skeleton" style={{ height: 28, width: 200, marginBottom: 10 }} />
              <div className="inv-skeleton" style={{ height: 22, width: 120 }} />
            </>
          ) : (
            <>
              <div className="ih-item-name">{propertyData?.name}</div>
              <div className="ih-item-tags">
                <span className="ih-tag ih-tag-qty">{propertyData?.code}</span>
                {propertyData?.description && (
                  <span className="ih-tag ih-tag-status-active">{propertyData.description}</span>
                )}
              </div>
            </>
          )}
        </div>
        {can("create") && (
          <button
            onClick={() => setShowLinkModal(true)}
            style={{
              padding: "8px 16px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {linkedCabins.length > 0 ? "Manage Links" : "Link Cabin"}
          </button>
        )}
      </div>

      {/* Linked Cabins */}
      {!loading && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, color: "#5a5a78", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Linked Cabins {linkedCabins.length > 0 && `(${linkedCabins.length})`}
          </div>
          {linkedCabins.length === 0 ? (
            <div style={{
              padding: 16,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              color: "#dc2626",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              No cabins linked to this property
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {linkedCabins.map((link) => (
                <div
                  key={link.id}
                  style={{
                    padding: "8px 16px",
                    background: "#eef0fd",
                    border: "1px solid #c7caff",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <Link
                    href={`/inventory/cabins/${link.cabin_number}`}
                    style={{
                      textDecoration: "none",
                      color: "#6366f1",
                      fontSize: 13,
                      fontWeight: 500
                    }}
                  >
                    Cabin {link.cabin_number} ({link.cabin_code})
                  </Link>
                  {can("create") && (
                    <button
                      onClick={() => handleUnlinkCabin(link.cabin_id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#dc2626",
                        cursor: "pointer",
                        padding: 0,
                        marginLeft: 4
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="ih-summary">
        <div className="ih-sum-card">
          <div className="ih-sum-val current">{loading ? "—" : inventory.length}</div>
          <div className="ih-sum-label">Total Units</div>
        </div>
        <div className="ih-sum-card">
          <div className="ih-sum-val added">
            {loading ? "—" : new Set(inventory.map(i => i.item_id)).size}
          </div>
          <div className="ih-sum-label">Unique Items</div>
        </div>
        <div className="ih-sum-card">
          <div className="ih-sum-val removed">
            {loading ? "—" : linkedCabins.length}
          </div>
          <div className="ih-sum-label">Linked Cabins</div>
        </div>
      </div>

      {/* Inventory List */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, color: "#5a5a78", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Assigned Inventory
        </div>

        <div className="ih-table-wrap">
          {loading ? (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="inv-skeleton" style={{ height: 44, borderRadius: 6 }} />
              ))}
            </div>
          ) : inventory.length === 0 ? (
            <div className="ih-empty">No inventory assigned to this property.</div>
          ) : (
            <table className="ih-table">
              <thead>
                <tr>
                  <th>Unit Code</th>
                  <th>Item Name</th>
                  <th>Cabins</th>
                  <th>Assigned Date</th>
                  {can("create") && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.unit_id}>
                    <td style={{ fontWeight: 600, color: "#6366f1" }}>{item.unit_code}</td>
                    <td>
                      <div style={{ color: "#2a2a3e", fontWeight: 500 }}>{item.item_name}</div>
                      {item.prefix && <div style={{ fontSize: 11, color: "#9898b0" }}>Prefix: {item.prefix}</div>}
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: "#6b6b8a" }}>
                        {linkedCabins.map(lc => `Cabin ${lc.cabin_number}`).join(", ") || "—"}
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap", color: "#606080", fontSize: "12.5px" }}>
                      {item.assigned_at
                        ? new Date(item.assigned_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })
                        : "—"}
                    </td>
                    {can("create") && (
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button
                            onClick={() => setUnitAction({ open: true, unit: item, mode: "retreat" })}
                            title="Take this unit back into IT stock so it can be assigned again"
                            style={{
                              padding: "4px 12px", background: "#0f766e", color: "#fff",
                              border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
                            }}
                          >
                            ↩ Retreat
                          </button>
                          <button
                            onClick={() => setUnitAction({ open: true, unit: item, mode: "reassign" })}
                            title="Move this unit to another cabin or property"
                            style={{
                              padding: "4px 12px", background: "#7c3aed", color: "#fff",
                              border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
                            }}
                          >
                            ⇄ Re-assign
                          </button>
                          <button
                            onClick={() => setRenameModal({ open: true, unit: item })}
                            style={{
                              padding: "4px 12px", background: "#6366f1", color: "#fff",
                              border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
                            }}
                          >
                            ✏️ Rename
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Link Cabin Modal */}
      {showLinkModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 20
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 24,
            maxWidth: 400, width: "100%"
          }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700 }}>
              Link Cabin to {propertyData?.name}
            </h2>
            <select
              value={selectedCabinId}
              onChange={(e) => setSelectedCabinId(e.target.value)}
              className="ri-select"
              style={{ width: "100%", marginBottom: 16 }}
            >
              <option value="">— Select Cabin —</option>
              {cabins.map(c => (
                <option key={c.id} value={c.id}>Cabin {c.cabin_number} ({c.code})</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => { setShowLinkModal(false); setSelectedCabinId(""); }}
                className="ri-btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleLinkCabin}
                disabled={!selectedCabinId}
                className="ri-btn-primary"
                style={{ flex: 1 }}
              >
                Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Unit Modal */}
      {renameModal.open && (
        <RenameUnitModal
          unit={renameModal.unit}
          user={user}
          onClose={() => setRenameModal({ open: false, unit: null })}
          onSuccess={() => {
            setRenameModal({ open: false, unit: null });
            fetchProperty();
          }}
        />
      )}

      {/* Retreat / Re-assign */}
      {unitAction.open && (
        <UnitActionModal
          unit={unitAction.unit}
          mode={unitAction.mode}
          authHeaders={{
            "x-user-id": user?.id,
            "x-user-role": user?.roleId,
            "x-user-email": user?.email,
            "x-user-fname": user?.fname,
            "x-user-unique-id": user?.unique_id,
          }}
          onClose={() => setUnitAction({ open: false, unit: null, mode: null })}
          onDone={(res) => {
            // The unit has left this property, so the list it was in is stale.
            setNotice(res?.message || "Done.");
            fetchProperty();
          }}
        />
      )}
    </InventoryLayout>
  );
}