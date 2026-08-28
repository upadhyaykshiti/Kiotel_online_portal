"use client";
import "../inventory.css";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import InventoryLayout from "../_components/InventoryLayout";
import { useInventoryUser } from "../_hooks/useInventoryUser";
import axios from "axios";

export default function DestroyInventory() {
  const router = useRouter();
  const { user, userRole, loading: userLoading } = useInventoryUser();
  
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [allUnits, setAllUnits] = useState([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState([]);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [performedByName, setPerformedByName] = useState("");
  const [nameError, setNameError] = useState("");
  const fileRef = useRef(null);

  // useEffect(() => {
  //   if (!user) return;
  //   const fetchItems = async () => {
  //     try {
  //       const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/items`, {
  //         withCredentials: true,
  //         headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
  //       });
  //       const active = (res.data?.data || []).filter((i) => i.status !== "inactive");
  //       setItems(active);
  //     } catch (err) {
  //       setError("Failed to load items.");
  //     } finally {
  //       setLoadingItems(false);
  //     }
  //   };
  //   fetchItems();
  // }, [user]);




  useEffect(() => {
  if (!user) return;
  const fetchItems = async () => {
    try {
      const itemsRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/items`, {
        withCredentials: true,
        headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
      });
      
      const activeItems = (itemsRes.data?.data || []).filter((i) => i.status !== "inactive");
      
      // Fetch unit counts for all items
      const itemsWithCounts = await Promise.all(
        activeItems.map(async (item) => {
          try {
            const [availableRes, assignedRes] = await Promise.all([
              axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/items/${item.id}/available-units?count=1000`, {
                withCredentials: true,
                headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
              }),
              axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/items/${item.id}/assigned-units`, {
                withCredentials: true,
                headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
              })
            ]);
            
            const totalUnits = (availableRes.data?.data?.length || 0) + (assignedRes.data?.data?.length || 0);
            return { ...item, totalUnits };
          } catch (err) {
            console.error(`Failed to fetch units for item ${item.id}:`, err);
            return { ...item, totalUnits: 0 };
          }
        })
      );
      
      setItems(itemsWithCounts);
    } catch (err) {
      setError("Failed to load items.");
    } finally {
      setLoadingItems(false);
    }
  };
  fetchItems();
}, [user]);



  const handleItemChange = async (id) => {
    setSelectedItem(id);
    setSelectedUnitIds([]);
    setAllUnits([]);
    setErrors((e) => ({ ...e, item: "" }));

    if (id) {
      setLoadingUnits(true);
      try {
        const [unitsRes, assignedRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/items/${id}/available-units?count=1000`, {
            withCredentials: true,
            headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/items/${id}/assigned-units`, {
            withCredentials: true,
            headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
          })
        ]);

        // Combine available and assigned units
        const availableUnits = (unitsRes.data?.data || []).map(u => ({ ...u, status: 'available' }));
        const assignedUnits = (assignedRes.data?.data || []).map(u => ({ ...u, status: 'assigned' }));
        
        setAllUnits([...availableUnits, ...assignedUnits]);
      } catch (err) {
        console.error(err);
        setError("Failed to load units.");
      } finally {
        setLoadingUnits(false);
      }
    }
  };

  const toggleUnit = (unitId) => {
    setSelectedUnitIds(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
    setErrors((e) => ({ ...e, units: "" }));
  };

  const selectAllAvailable = () => {
    const availableIds = allUnits.filter(u => u.status === 'available').map(u => u.id);
    setSelectedUnitIds(availableIds);
  };

  const clearSelection = () => {
    setSelectedUnitIds([]);
  };

  const handleImage = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) { setError("Only JPG, PNG, WebP, or PDF allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("File must be under 5 MB."); return; }
    setError(null);
    setImage(file);
    if (file.type !== "application/pdf") {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else { setImagePreview(null); }
  };

  const validate = () => {
    const e = {};
      let valid = true;  // ← This line was missing
      if (!performedByName.trim()) {
  
  setNameError("Please enter your name.");  // Use the setter function
  valid = false;
}
    if (!selectedItem) e.item = "Please select an item.";
    if (selectedUnitIds.length === 0) e.units = "Please select at least one unit to destroy.";
    if (!reason) e.reason = "Please select a reason.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // const handleSubmit = async () => {
  //   if (!validate()) return;
  //   setSubmitting(true);
  //   setError(null);
  //   setSuccess(null);
  //   try {
  //     const formData = new FormData();
  //     formData.append("item_id", selectedItem);
  //     formData.append("unit_ids", JSON.stringify(selectedUnitIds));
  //     formData.append("reason", reason);
  //     if (notes.trim()) formData.append("notes", notes.trim());
  //     if (image) formData.append("image", image);

  //     const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/destroy`, formData, {
  //       withCredentials: true,
  //       headers: { "Content-Type": "multipart/form-data", "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
  //     });
  //     if (res.data?.success) {
  //       setSuccess(`Successfully destroyed ${selectedUnitIds.length} unit(s)!`);
  //       setTimeout(() => router.push("/inventory/list"), 1400);
  //     } else {
  //       setError(res.data?.message || "Failed to destroy inventory.");
  //     }
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Something went wrong.");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleSubmit = async () => {
  if (!validate()) return;
  setSubmitting(true);
  setError(null);
  setSuccess(null);
  try {
    const formData = new FormData();
    formData.append("item_id", selectedItem);
    // FIX: Send unit_ids as a proper JSON string
    formData.append("unit_ids", JSON.stringify(selectedUnitIds));
    formData.append("reason", reason);
    formData.append("performed_by_name", performedByName.trim());
    if (notes.trim()) formData.append("notes", notes.trim());
    if (image) formData.append("image", image);

    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/destroy`, formData, {
      withCredentials: true,
      headers: { 
        "Content-Type": "multipart/form-data", 
        "x-user-id": user.id, 
        "x-user-role": user.roleId, 
        "x-user-email": user.email, 
        "x-user-fname": user.fname, 
        "x-user-unique-id": user.unique_id 
      },
    });
    if (res.data?.success) {
      setSuccess(`Successfully destroyed ${selectedUnitIds.length} unit(s)!`);
      setTimeout(() => router.push("/inventory/destroy"), 1400);
    } else {
      setError(res.data?.message || "Failed to destroy inventory.");
    }
  } catch (err) {
    console.error("Destroy error:", err);
    setError(err.response?.data?.message || "Something went wrong.");
  } finally {
    setSubmitting(false);
  }
};


  if (!userLoading && userRole === "employee") {
    return (
      <InventoryLayout title="Destroy Inventory" subtitle="Remove damaged or replaced items">
        <div className="ri-denied">
          <div className="ri-denied-icon">🔒</div>
          <div className="ri-denied-title">Access Restricted</div>
          <div className="ri-denied-sub">Only admins and managers can destroy inventory.</div>
        </div>
      </InventoryLayout>
    );
  }

  return (
    <InventoryLayout title="Destroy Inventory" subtitle="Permanently remove damaged or replaced stock">
      <div className="ri-wrap">
        {error && <div className="ri-alert error">⚠ {error}</div>}
        {success && <div className="ri-alert success">✓ {success}</div>}

        {/* Select Item */}
        <div className="ri-form-group">
          <label className="ri-label">Select Item <span className="ri-req">*</span></label>
          {loadingItems ? (
            <div className="inv-skeleton" style={{ height: 44, borderRadius: 8 }} />
          ) : (
            // <select className={`ri-select${errors.item ? " error" : ""}`} value={selectedItem} onChange={(e) => handleItemChange(e.target.value)}>
            //   <option value="">— Choose an item —</option>
            //   {items.map((i) => (
            //     <option key={i.id} value={i.id}>{i.name} ({allUnits.length} total units)</option>
            //   ))}
            // </select>
            <select className={`ri-select${errors.item ? " error" : ""}`} value={selectedItem} onChange={(e) => handleItemChange(e.target.value)}>
  <option value="">— Choose an item —</option>
  {items.map((i) => (
    <option key={i.id} value={i.id}>
      {i.name} ({i.totalUnits || 0} total units)
    </option>
  ))}
</select>
          )}
          {errors.item && <div className="ri-field-error">{errors.item}</div>}
        </div>

        {/* Available Units */}
        {selectedItem && (
          <div className="ri-form-group">
            <label className="ri-label">
              Select Units to Destroy <span className="ri-req">*</span>
              <span className="ri-opt">({selectedUnitIds.length} selected)</span>
            </label>
            {loadingUnits ? (
              <div className="inv-skeleton" style={{ height: 200, borderRadius: 8 }} />
            ) : allUnits.length === 0 ? (
              <div style={{ padding: 20, background: "#f9fafb", borderRadius: 8, color: "#9898b0", fontSize: 13, textAlign: "center" }}>
                No units found for this item.
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button type="button" onClick={selectAllAvailable} style={{ padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                    Select All Available
                  </button>
                  <button type="button" onClick={clearSelection} style={{ padding: "6px 12px", background: "#f5f6fa", color: "#6b6b8a", border: "1px solid #e8eaf0", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                    Clear Selection
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto", padding: 8, border: "1px solid #e8eaf0", borderRadius: 8 }}>
                  {allUnits.map(unit => {
                    const isSelected = selectedUnitIds.includes(unit.id);
                    const isAssigned = unit.status === 'assigned';
                    return (
                      <label key={unit.id} style={{
                        display: "flex", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 8,
                        cursor: "pointer", background: isSelected ? "#fef2f2" : "#fff",
                        border: isSelected ? "2px solid #ef4444" : "1px solid #e8eaf0",
                        transition: "all 0.15s"
                      }}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleUnit(unit.id)}
                          style={{ accentColor: "#ef4444", width: 16, height: 16, marginTop: 2, cursor: "pointer" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, color: "#2a2a3e", fontSize: 14 }}>{unit.unit_code}</span>
                            <span style={{
                              padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500,
                              background: isAssigned ? "#fee2e2" : "#dcfce7",
                              color: isAssigned ? "#dc2626" : "#16a34a"
                            }}>
                              {isAssigned ? "Assigned" : "Available"}
                            </span>
                          </div>
                          {isAssigned && (
                            <div style={{ fontSize: 12, color: "#6b6b8a", marginTop: 4 }}>
                              <div>Property: {unit.property_name || "N/A"}</div>
                              <div>Cabin: {unit.cabin_no || "N/A"}</div>
                              {unit.assigned_at && <div>Assigned: {new Date(unit.assigned_at).toLocaleDateString()}</div>}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                {errors.units && <div className="ri-field-error">{errors.units}</div>}
                <div style={{ fontSize: 11, color: "#9898b0", marginTop: 8 }}>
                  Note: Destroyed units cannot be recovered. Their codes will not be reassigned.
                </div>
              </>
            )}
          </div>
        )}

        {/* Reason for Destruction */}
        <div className="ri-form-group">
          <label className="ri-label">Reason for Destruction <span className="ri-req">*</span></label>
          <select className={`ri-select${errors.reason ? " error" : ""}`} value={reason} onChange={(e) => { setReason(e.target.value); setErrors((er) => ({ ...er, reason: "" })); }}>
            <option value="">— Select reason —</option>
            <option value="Damaged">Damaged / Broken</option>
            <option value="Replaced">Replaced with newer model</option>
            <option value="Lost">Lost / Missing</option>
            <option value="Obsolete">Obsolete / Outdated</option>
            <option value="Defective">Manufacturing Defect</option>
            <option value="Other">Other</option>
          </select>
          {errors.reason && <div className="ri-field-error">{errors.reason}</div>}
        </div>

        {/* Notes */}
        <div className="ri-form-group">
          <label className="ri-label">Notes <span className="ri-opt">(Optional)</span></label>
          <textarea className="ri-textarea" placeholder="Additional details about the destruction..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>

        {/* Evidence Upload */}
        <div className="ri-form-group">
          <label className="ri-label">Evidence / Photo <span className="ri-opt">(Optional)</span></label>
          {image ? (
            <div className="ri-file-preview">
              {imagePreview ? <img src={imagePreview} alt="Evidence" className="ri-file-img" /> : <div className="ri-file-name">{image.name}</div>}
              <button className="ri-file-remove" onClick={() => { setImage(null); setImagePreview(null); }}>× Remove</button>
            </div>
          ) : (
            <div className="ri-upload-zone" onClick={() => fileRef.current?.click()}>
              <div className="ri-upload-text"><strong>Click to upload</strong> or drag & drop</div>
              <div className="ri-upload-sub">JPG, PNG, WebP, PDF · max 5 MB</div>
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" style={{ display: "none" }} onChange={(e) => handleImage(e.target.files[0])} />
            </div>
          )}
        </div>
{/* // Add to form JSX (place it near the top, after item/property selection) */}
<div className="ri-form-group">
  <label className="ri-label">Your Name <span className="ri-req">*</span></label>
  <input
    className={`ri-input${nameError ? " error" : ""}`}
    placeholder="Enter your full name..."
    value={performedByName}
    onChange={(e) => { setPerformedByName(e.target.value); if (nameError) setNameError(""); }}
  />
  {nameError && <div className="ri-field-error">{nameError}</div>}
  <div className="ri-hint">This name will be recorded in the audit log</div>
</div>
        {/* Actions */}
        <div className="ri-actions">
          <button className="ri-btn-secondary" onClick={() => router.push("/inventory/list")} type="button">Cancel</button>
          <button className="ri-btn-primary" onClick={handleSubmit} disabled={submitting} type="button" style={{ background: "#ef4444" }}>
            {submitting ? <><div className="ri-spinner" /> Destroying...</> : <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              Destroy {selectedUnitIds.length > 0 ? `(${selectedUnitIds.length})` : ''} Units
            </>}
          </button>
        </div>
      </div>
    </InventoryLayout>
  );
}