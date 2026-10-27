// "use client";
// import "../inventory.css";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import InventoryLayout from "../_components/InventoryLayout";
// import { useInventoryUser } from "../_hooks/useInventoryUser";
// import axios from "axios";

// export default function AddCabin() {
//   const router = useRouter();
//   const { user, userRole, loading: userLoading } = useInventoryUser();
  
//   const [cabinNumber, setCabinNumber] = useState("");
//   const [description, setDescription] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [cabinError, setCabinError] = useState("");

//   if (!userLoading && userRole && userRole !== "admin" && userRole !== "manager") {
//     return (
//       <InventoryLayout title="Add Cabin" subtitle="Create a new cabin">
//         <div className="ci-denied">
//           <div className="ci-denied-icon">🔒</div>
//           <div className="ci-denied-title">Access Restricted</div>
//           <div className="ci-denied-sub">Only managers and admins can add cabins.</div>
//         </div>
//       </InventoryLayout>
//     );
//   }

//   const validate = () => {
//     let valid = true;
//     if (!cabinNumber.trim()) {
//       setCabinError("Cabin number is required.");
//       valid = false;
//     } else if (cabinNumber.trim().length > 50) {
//       setCabinError("Max 50 characters.");
//       valid = false;
//     } else setCabinError("");
//     return valid;
//   };

//   const handleSubmit = async () => {
//     if (!validate()) return;
//     setSubmitting(true);
//     setError(null);
//     setSuccess(null);
//     try {
//       const res = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/cabins`,
//         {
//           cabin_number: cabinNumber.trim(),
//           description: description.trim() || null,
//         },
//         {
//           withCredentials: true,
//           headers: {
//             "Content-Type": "application/json",
//             "x-user-id": user.id,
//             "x-user-role": user.roleId,
//             "x-user-email": user.email,
//             "x-user-fname": user.fname,
//             "x-user-unique-id": user.unique_id,
//           },
//         }
//       );
//       if (res.data?.success) {
//         setSuccess("Cabin created successfully!");
//         setTimeout(() => router.push("/inventory/locations?view=cabins"), 1200);
//       } else {
//         setError(res.data?.message || "Failed to create cabin.");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <InventoryLayout title="Add Cabin" subtitle="Create a new cabin location">
//       <div className="ci-wrap">
//         {error && <div className="ci-alert error">⚠ {error}</div>}
//         {success && <div className="ci-alert success">✓ {success}</div>}

//         {/* Cabin Number */}
//         <div className="ci-form-group">
//           <label className="ci-label">
//             Cabin Number <span>*</span>
//           </label>
//           <input
//             className={`ci-input${cabinError ? " error" : ""}`}
//             placeholder="e.g. 101, A-205, Main Hall..."
//             value={cabinNumber}
//             maxLength={50}
//             onChange={(e) => {
//               setCabinNumber(e.target.value);
//               if (cabinError) setCabinError("");
//             }}
//             onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
//           />
//           {cabinError && <div className="ci-field-error">{cabinError}</div>}
//           <div className="ci-char-count">{cabinNumber.length} / 50</div>
//         </div>

//         {/* Description */}
//         <div className="ci-form-group">
//           <label className="ci-label">
//             Description <span style={{ color: "#3a3a55", marginLeft: 4, fontSize: 11 }}>(Optional)</span>
//           </label>
//           <textarea
//             className="ri-textarea"
//             placeholder="e.g. First floor corner room, Warehouse B office..."
//             value={description}
//             maxLength={255}
//             onChange={(e) => setDescription(e.target.value)}
//             rows={3}
//           />
//         </div>

//         {/* Actions */}
//         <div className="ci-actions">
//           <button
//             className="ci-btn-secondary"
//             onClick={() => router.push("/inventory/locations?view=cabins")}
//             type="button"
//           >
//             Cancel
//           </button>
//           <button
//             className="ci-btn-primary"
//             onClick={handleSubmit}
//             disabled={submitting}
//             type="button"
//           >
//             {submitting ? (
//               <>
//                 <div className="ci-spinner" /> Creating...
//               </>
//             ) : (
//               <>
//                 <svg
//                   width="15"
//                   height="15"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2.5"
//                 >
//                   <line x1="12" y1="5" x2="12" y2="19" />
//                   <line x1="5" y1="12" x2="19" y2="12" />
//                 </svg>
//                 Create Cabin
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </InventoryLayout>
//   );
// }


"use client";
import "../inventory.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InventoryLayout from "../_components/InventoryLayout";
import { useInventoryUser } from "../_hooks/useInventoryUser";
import axios from "axios";

export default function AddCabin() {
  const router = useRouter();
  const { user, userRole, loading: userLoading } = useInventoryUser();
  
  const [cabinNumber, setCabinNumber] = useState("");
  const [description, setDescription] = useState("");
  const [properties, setProperties] = useState([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [cabinError, setCabinError] = useState("");
  const [performedByName, setPerformedByName] = useState("");
const [nameError, setNameError] = useState("");




    useEffect(() => {
    if (!user) return;
    const fetchProperties = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/properties`,
          {
            withCredentials: true,
            headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
          }
        );
        setProperties(res.data?.data || []);
      } catch (err) { console.error(err); } finally { setLoadingProperties(false); }
    };
    fetchProperties();
  }, [user]);

  if (!userLoading && userRole && userRole !== "admin" && userRole !== "manager") {
    return (
      <InventoryLayout title="Add Cabin" subtitle="Create a new cabin">
        <div className="ci-denied">
          <div className="ci-denied-icon">🔒</div>
          <div className="ci-denied-title">Access Restricted</div>
          <div className="ci-denied-sub">Only managers and admins can add cabins.</div>
        </div>
      </InventoryLayout>
    );
  }



  const validate = () => {
    let valid = true;
    if (!performedByName.trim()) {
  
  setNameError("Please enter your name.");  // Use the setter function
  valid = false;
}
    if (!cabinNumber.trim()) { setCabinError("Cabin number is required."); valid = false; } 
    else if (cabinNumber.trim().length > 50) { setCabinError("Max 50 characters."); valid = false; } 
    else setCabinError("");
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/cabins`,
        {
          cabin_number: cabinNumber.trim(),
          description: description.trim() || null,
          performed_by_name: performedByName.trim(),
          property_ids: selectedPropertyIds.length > 0 ? selectedPropertyIds : null,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json", "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
        }
      );
      if (res.data?.success) {
        setSuccess("Cabin created successfully!");
        setTimeout(() => router.push("/inventory/locations?view=cabins"), 1200);
      } else { setError(res.data?.message || "Failed to create cabin."); }
    } catch (err) { setError(err.response?.data?.message || "Something went wrong."); } finally { setSubmitting(false); }
  };

  return (
    <InventoryLayout title="Add Cabin" subtitle="Create a new cabin location">
      <div className="ci-wrap">
        {error && <div className="ci-alert error">⚠ {error}</div>}
        {success && <div className="ci-alert success">✓ {success}</div>}

        <div className="ci-form-group">
          <label className="ci-label">Cabin Number <span>*</span></label>
          <input className={`ci-input${cabinError ? " error" : ""}`} placeholder="e.g. 101, A-205..." value={cabinNumber} maxLength={50} onChange={(e) => { setCabinNumber(e.target.value); if (cabinError) setCabinError(""); }} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          {cabinError && <div className="ci-field-error">{cabinError}</div>}
          <div className="ci-char-count">{cabinNumber.length} / 50</div>
        </div>

        <div className="ci-form-group">
          <label className="ci-label">Link Properties <span style={{ color: "#3a3a55", marginLeft: 4, fontSize: 11 }}>(Optional)</span></label>
          {loadingProperties ? (
            <div className="inv-skeleton" style={{ height: 44, borderRadius: 8 }} />
          ) : (
            <select
              className="ri-select"
              value={selectedPropertyIds}
              onChange={(e) => {
                const options = e.target.options;
                const selected = [];
                for (let i = 0; i < options.length; i++) { if (options[i].selected) selected.push(options[i].value); }
                setSelectedPropertyIds(selected);
              }}
              multiple
              style={{ minHeight: 100 }}
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          )}
          <div style={{ fontSize: 11, color: "#9898b0", marginTop: 4 }}>Hold Ctrl/Cmd to select multiple properties</div>
        </div>

        <div className="ci-form-group">
          <label className="ci-label">Description <span style={{ color: "#3a3a55", marginLeft: 4, fontSize: 11 }}>(Optional)</span></label>
          <textarea className="ri-textarea" placeholder="e.g. First floor corner room..." value={description} maxLength={255} onChange={(e) => setDescription(e.target.value)} rows={3} />
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

        <div className="ci-actions">
          <button className="ci-btn-secondary" onClick={() => router.push("/inventory/locations?view=cabins")} type="button">Cancel</button>
          <button className="ci-btn-primary" onClick={handleSubmit} disabled={submitting} type="button">
            {submitting ? <><div className="ci-spinner" /> Creating...</> : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Create Cabin</>}
          </button>
        </div>
      </div>
    </InventoryLayout>
  );
}