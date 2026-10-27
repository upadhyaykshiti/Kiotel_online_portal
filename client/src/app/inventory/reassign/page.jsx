"use client";
import "../inventory.css";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import InventoryLayout from "../_components/InventoryLayout";
import { useInventoryUser } from "../_hooks/useInventoryUser";
import axios from "axios";

export default function ReassignInventory() {
  const router = useRouter();
  const { user, userRole, loading: userLoading } = useInventoryUser();
  
  const [items, setItems] = useState([]);
  const [properties, setProperties] = useState([]);
  const [cabins, setCabins] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [assignedUnits, setAssignedUnits] = useState([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedCabin, setSelectedCabin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);  
  const [loadingCabins, setLoadingCabins] = useState(true);    
  const [performedByName, setPerformedByName] = useState("");
const [nameError, setNameError] = useState("");



//   useEffect(() => {
//     if (!user) return;
//     const fetchData = async () => {
//       try {
//         const [itemsRes, propsRes, cabinsRes] = await Promise.all([
//           axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/items`, { withCredentials: true, headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id } }),
//           axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/properties`, { withCredentials: true, headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id } }),
//           axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/cabins`, { withCredentials: true, headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id } }),
//         ]);
//         setItems((itemsRes.data?.data || []).filter(i => i.status !== "inactive"));
//         setProperties(propsRes.data?.data || []);
//         setCabins(cabinsRes.data?.data || []);
//       } catch (err) {
//         setError("Failed to load data.");
//       } finally {
//         setLoadingItems(false);
//       }
//     };
//     fetchData();
//   }, [user]);

useEffect(() => {
  if (!user) return;
  const fetchData = async () => {
    try {
      setLoadingProperties(true);  // ← Set loading true
      setLoadingCabins(true);      // ← Set loading true
      
      const [itemsRes, propsRes, cabinsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/items`, { 
          withCredentials: true, 
          headers: { 
            "x-user-id": user.id, 
            "x-user-role": user.roleId, 
            "x-user-email": user.email, 
            "x-user-fname": user.fname, 
            "x-user-unique-id": user.unique_id 
          } 
        }),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/properties`, { 
          withCredentials: true, 
          headers: { 
            "x-user-id": user.id, 
            "x-user-role": user.roleId, 
            "x-user-email": user.email, 
            "x-user-fname": user.fname, 
            "x-user-unique-id": user.unique_id 
          } 
        }),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/cabins`, { 
          withCredentials: true, 
          headers: { 
            "x-user-id": user.id, 
            "x-user-role": user.roleId, 
            "x-user-email": user.email, 
            "x-user-fname": user.fname, 
            "x-user-unique-id": user.unique_id 
          } 
        }),
      ]);
      
      setItems((itemsRes.data?.data || []).filter(i => i.status !== "inactive"));
      setProperties(propsRes.data?.data || []);
      setCabins(cabinsRes.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoadingItems(false);
      setLoadingProperties(false);  // ← Set loading false
      setLoadingCabins(false);      // ← Set loading false
    }
  };
  fetchData();
}, [user]);


  const handleItemChange = async (id) => {
    setSelectedItem(id);
    setSelectedUnitIds([]);
    setAssignedUnits([]);
    setErrors((e) => ({ ...e, item: "" }));

    if (id) {
      setLoadingUnits(true);
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/items/${id}/assigned-units`, {
          withCredentials: true,
          headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
        });
        setAssignedUnits(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUnits(false);
      }
    }
  };

  const toggleUnit = (unitId) => {
    setSelectedUnitIds(prev => prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]);
    setErrors((e) => ({ ...e, units: "" }));
  };

//   const validate = () => {
//     const e = {};
//     if (!selectedItem) e.item = "Please select an item.";
//     if (selectedUnitIds.length === 0) e.units = "Please select at least one unit to reassign.";
//     if (!selectedProperty) e.property = "Please select a new property.";
//     if (!selectedCabin) e.cabin = "Please select a new cabin.";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validate()) return;
//     setSubmitting(true);
//     setError(null);
//     setSuccess(null);
//     try {
//       const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/reassign`, {
//         unit_ids: selectedUnitIds,
//         property_id: selectedProperty,
//         cabin_id: selectedCabin,
//       }, {
//         withCredentials: true,
//         headers: { "Content-Type": "application/json", "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
//       });
//       if (res.data?.success) {
//         setSuccess(`Successfully reassigned ${selectedUnitIds.length} unit(s)!`);
//         setTimeout(() => router.push("/inventory/list"), 1400);
//       } else {
//         setError(res.data?.message || "Failed to reassign.");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

// Update the validate function
const validate = () => {
  const e = {};
    let valid = true;  // ← This line was missing
  if (!performedByName.trim()) {
  
  setNameError("Please enter your name.");  // Use the setter function
  valid = false;
}
  if (!selectedItem) e.item = "Please select an item.";
  if (selectedUnitIds.length === 0) e.units = "Please select at least one unit to reassign.";
  // Make both optional - at least one must be filled
  if (!selectedProperty && !selectedCabin) {
    e.property = "Please select at least a property OR cabin.";
  }
  setErrors(e);
  return Object.keys(e).length === 0;
};

// Update the handleSubmit function
const handleSubmit = async () => {
  if (!validate()) return;
  setSubmitting(true);
  setError(null);
  setSuccess(null);
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/reassign`,
      {
        unit_ids: selectedUnitIds,
        property_id: selectedProperty || null,
        cabin_id: selectedCabin || null,
        performed_by_name: performedByName,
      },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-role": user.roleId,
          "x-user-email": user.email,
          "x-user-fname": user.fname,
          "x-user-unique-id": user.unique_id,
        },
      }
    );
    if (res.data?.success) {
      setSuccess(`Successfully reassigned ${selectedUnitIds.length} unit(s)!`);
      setTimeout(() => router.push("/inventory/list"), 1400);
    } else {
      setError(res.data?.message || "Failed to reassign.");
    }
  } catch (err) {
    setError(err.response?.data?.message || "Something went wrong.");
  } finally {
    setSubmitting(false);
  }
};


  if (!userLoading && userRole === "employee") {
    return (
      <InventoryLayout title="Reassign Inventory" subtitle="Move items between properties/cabins">
        <div className="ri-denied">
          <div className="ri-denied-icon">🔒</div>
          <div className="ri-denied-title">Access Restricted</div>
          <div className="ri-denied-sub">Only admins and managers can reassign inventory.</div>
        </div>
      </InventoryLayout>
    );
  }

  return (
    <InventoryLayout title="Reassign Inventory" subtitle="Move assigned items to a new property or cabin">
      <div className="ri-wrap">
        {error && <div className="ri-alert error">⚠ {error}</div>}
        {success && <div className="ri-alert success">✓ {success}</div>}

        <div className="ri-form-group">
          <label className="ri-label">Select Item <span className="ri-req">*</span></label>
          {loadingItems ? <div className="inv-skeleton" style={{ height: 44, borderRadius: 8 }} /> : (
            <select className={`ri-select${errors.item ? " error" : ""}`} value={selectedItem} onChange={(e) => handleItemChange(e.target.value)}>
              <option value="">— Choose an item —</option>
              {items.map((i) => (<option key={i.id} value={i.id}>{i.name}</option>))}
            </select>
          )}
          {errors.item && <div className="ri-field-error">{errors.item}</div>}
        </div>

        {selectedItem && (
          <div className="ri-form-group">
            <label className="ri-label">Select Assigned Units <span className="ri-req">*</span></label>
            {loadingUnits ? <div className="inv-skeleton" style={{ height: 100, borderRadius: 8 }} /> : (
              assignedUnits.length === 0 ? (
                <div style={{ padding: 16, background: "#fafbff", borderRadius: 8, color: "#9898b0", fontSize: 13, textAlign: "center" }}>No units are currently assigned for this item.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto", padding: 8, border: "1px solid #e8eaf0", borderRadius: 8 }}>
                  {assignedUnits.map(unit => (
                    <label key={unit.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 6, cursor: "pointer", background: selectedUnitIds.includes(unit.id) ? "#eef0fd" : "transparent" }}>
                      <input type="checkbox" checked={selectedUnitIds.includes(unit.id)} onChange={() => toggleUnit(unit.id)} style={{ accentColor: "#6366f1" }} />
                      <span style={{ fontWeight: 600, color: "#6366f1", width: 60 }}>{unit.unit_code}</span>
                      <span style={{ color: "#4a4a6a", fontSize: 13 }}>
                        Currently at: {unit.property_name || "Unknown Property"} - {unit.cabin_no}
                      </span>
                    </label>
                  ))}
                </div>
              )
            )}
            {errors.units && <div className="ri-field-error">{errors.units}</div>}
          </div>
        )}
{/* 
        <div className="ri-form-group">
          <label className="ri-label">New Property <span className="ri-req">*</span></label>
          <select className={`ri-select${errors.property ? " error" : ""}`} value={selectedProperty} onChange={(e) => { setSelectedProperty(e.target.value); setErrors((er) => ({ ...er, property: "" })); }}>
            <option value="">— Select new property —</option>
            {properties.map((p) => (<option key={p.id} value={p.id}>{p.name} ({p.code})</option>))}
          </select>
          {errors.property && <div className="ri-field-error">{errors.property}</div>}
        </div> */}


{/* New Property */}
<div className="ri-form-group">
  <label className="ri-label">
    New Property <span style={{ color: "#3a3a55", marginLeft: 4, fontSize: 11 }}>(Optional)</span>
  </label>
  {loadingProperties ? (
    <div className="inv-skeleton" style={{ height: 44, borderRadius: 8 }} />
  ) : (
    <select
      className={`ri-select${errors.property ? " error" : ""}`}
      value={selectedProperty}
      onChange={(e) => { setSelectedProperty(e.target.value); setErrors((er) => ({ ...er, property: "" })); }}
    >
      <option value="">— Keep Current Property —</option>
      {properties.map((p) => (
        <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
      ))}
    </select>
  )}
  {errors.property && <div className="ri-field-error">{errors.property}</div>}
</div>


        {/* <div className="ri-form-group">
          <label className="ri-label">New Cabin <span className="ri-req">*</span></label>
          <select className={`ri-select${errors.cabin ? " error" : ""}`} value={selectedCabin} onChange={(e) => { setSelectedCabin(e.target.value); setErrors((er) => ({ ...er, cabin: "" })); }}>
            <option value="">— Select new cabin —</option>
            {cabins.map((c) => (<option key={c.id} value={c.id}>Cabin {c.cabin_number} {c.property_name ? `(${c.property_name})` : ""}</option>))}
          </select>
          {errors.cabin && <div className="ri-field-error">{errors.cabin}</div>}
        </div> */}

{/* New Cabin */}
<div className="ri-form-group">
  <label className="ri-label">
    New Cabin <span style={{ color: "#3a3a55", marginLeft: 4, fontSize: 11 }}>(Optional)</span>
  </label>
  {loadingCabins ? (
    <div className="inv-skeleton" style={{ height: 44, borderRadius: 8 }} />
  ) : (
    <select
      className={`ri-select${errors.cabin ? " error" : ""}`}
      value={selectedCabin}
      onChange={(e) => { setSelectedCabin(e.target.value); setErrors((er) => ({ ...er, cabin: "" })); }}
    >
      <option value="">— Keep Current Cabin —</option>
      {cabins.map((c) => (
        <option key={c.id} value={c.id}>Cabin {c.cabin_number} {c.description ? `(${c.description})` : ""}</option>
      ))}
    </select>
  )}
  {errors.cabin && <div className="ri-field-error">{errors.cabin}</div>}
  <div className="ri-hint">Select at least one: Property OR Cabin</div>
</div>


        <div className="ri-actions">
          <button className="ri-btn-secondary" onClick={() => router.push("/inventory/list")} type="button">Cancel</button>
          <button className="ri-btn-primary" onClick={handleSubmit} disabled={submitting} type="button" style={{ background: "#f59e0b" }}>
            {submitting ? <><div className="ri-spinner" /> Reassigning...</> : <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>
              Reassign Inventory
            </>}
          </button>
        </div>
      </div>
    </InventoryLayout>
  );
}