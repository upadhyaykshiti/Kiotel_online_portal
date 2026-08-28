// "use client";
// import "../inventory.css";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import InventoryLayout from "../_components/InventoryLayout";
// import { useInventoryUser } from "../_hooks/useInventoryUser";
// import axios from "axios";

// export default function AddProperty() {
//   const router = useRouter();
//   const { user, userRole, loading: userLoading } = useInventoryUser();
//   const [code, setCode] = useState("");
//   const [name, setName] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [codeError, setCodeError] = useState("");
//   const [nameError, setNameError] = useState("");

//   // Redirect non-managers
//   if (!userLoading && userRole && userRole !== "admin" && userRole !== "manager") {
//     return (
//       <InventoryLayout title="Add Property" subtitle="Create a new property">
//         <div className="ci-denied">
//           <div className="ci-denied-icon">🔒</div>
//           <div className="ci-denied-title">Access Restricted</div>
//           <div className="ci-denied-sub">
//             Only managers and admins can add properties.
//           </div>
//         </div>
//       </InventoryLayout>
//     );
//   }

//   const validate = () => {
//     let valid = true;
//     if (!code.trim()) {
//       setCodeError("Property code is required.");
//       valid = false;
//     } else if (code.trim().length > 50) {
//       setCodeError("Max 50 characters.");
//       valid = false;
//     } else setCodeError("");

//     if (!name.trim()) {
//       setNameError("Property name is required.");
//       valid = false;
//     } else if (name.trim().length > 255) {
//       setNameError("Max 255 characters.");
//       valid = false;
//     } else setNameError("");

//     return valid;
//   };

//   const handleSubmit = async () => {
//     if (!validate()) return;
//     setSubmitting(true);
//     setError(null);
//     setSuccess(null);
//     try {
//       const res = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/properties`,
//         {
//           code: code.trim(),
//           name: name.trim(),
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
//         setSuccess("Property created successfully!");
//         setTimeout(() => router.push("/inventory/locations?view=properties"), 1200);
//       } else {
//         setError(res.data?.message || "Failed to create property.");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <InventoryLayout title="Add Property" subtitle="Create a new property location">
//       <div className="ci-wrap">
//         {error && <div className="ci-alert error">⚠ {error}</div>}
//         {success && <div className="ci-alert success">✓ {success}</div>}

//         {/* Property Code */}
//         <div className="ci-form-group">
//           <label className="ci-label">
//             Property Code <span>*</span>
//           </label>
//           <input
//             className={`ci-input${codeError ? " error" : ""}`}
//             placeholder="e.g. PROP-001, HQ-BUILDING-A..."
//             value={code}
//             maxLength={50}
//             onChange={(e) => {
//               setCode(e.target.value);
//               if (codeError) setCodeError("");
//             }}
//             onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
//           />
//           {codeError && <div className="ci-field-error">{codeError}</div>}
//           <div className="ci-char-count">{code.length} / 50</div>
//         </div>

//         {/* Property Name */}
//         <div className="ci-form-group">
//           <label className="ci-label">
//             Property Name <span>*</span>
//           </label>
//           <input
//             className={`ci-input${nameError ? " error" : ""}`}
//             placeholder="e.g. Downtown Office, Warehouse B..."
//             value={name}
//             maxLength={255}
//             onChange={(e) => {
//               setName(e.target.value);
//               if (nameError) setNameError("");
//             }}
//             onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
//           />
//           {nameError && <div className="ci-field-error">{nameError}</div>}
//           <div className="ci-char-count">{name.length} / 255</div>
//         </div>

//         {/* Actions */}
//         <div className="ci-actions">
//           <button
//             className="ci-btn-secondary"
//             onClick={() => router.push("/inventory/locations?view=properties")}
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
//                   <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
//                   <polyline points="9 22 9 12 15 12 15 22" />
//                 </svg>
//                 Create Property
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

export default function AddProperty() {
  const router = useRouter();
  const { user, userRole, loading: userLoading } = useInventoryUser();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [cabins, setCabins] = useState([]);
  const [selectedCabinIds, setSelectedCabinIds] = useState([]);
  const [loadingCabins, setLoadingCabins] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [codeError, setCodeError] = useState("");
  const [nameError, setNameError] = useState("");
  const [performedByName, setPerformedByName] = useState("");
// const [nameError, setNameError] = useState("");



  useEffect(() => {
    if (!user) return;
    const fetchCabins = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/cabins`, {
          withCredentials: true,
          headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
        });
        setCabins(res.data?.data || []);
      } catch (err) { console.error(err); } finally { setLoadingCabins(false); }
    };
    fetchCabins();
  }, [user]);

  const validate = () => {
    let valid = true;
    if (!performedByName.trim()) {
  
  setNameError("Please enter your name.");  // Use the setter function
  valid = false;
}
    if (!code.trim()) { setCodeError("Property code is required."); valid = false; }
    else if (code.trim().length > 50) { setCodeError("Max 50 characters."); valid = false; }
    else setCodeError("");

    if (!name.trim()) { setNameError("Property name is required."); valid = false; }
    else if (name.trim().length > 255) { setNameError("Max 255 characters."); valid = false; }
    else setNameError("");

    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/properties`, {
        code: code.trim(),
        name: name.trim(),
        performed_by_name: performedByName.trim(),
      }, {
        withCredentials: true,
        headers: { "Content-Type": "application/json", "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
      });

      if (res.data?.success && selectedCabinIds.length > 0) {
        // Link property to selected cabins
        const propertyId = res.data.property.id;
        const linkPromises = selectedCabinIds.map(cabinId =>
          axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/property-cabins`, {
            property_id: propertyId,
            cabin_id: cabinId,
          }, {
            withCredentials: true,
            headers: { "x-user-id": user.id, "x-user-role": user.roleId, "x-user-email": user.email, "x-user-fname": user.fname, "x-user-unique-id": user.unique_id },
          })
        );
        await Promise.all(linkPromises);
      }

      if (res.data?.success) {
        setSuccess("Property created successfully!");
        setTimeout(() => router.push("/inventory/locations?view=properties"), 1200);
      } else {
        setError(res.data?.message || "Failed to create property.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!userLoading && userRole && userRole !== "admin" && userRole !== "manager") {
    return (
      <InventoryLayout title="Add Property" subtitle="Create a new property">
        <div className="ci-denied">
          <div className="ci-denied-icon">🔒</div>
          <div className="ci-denied-title">Access Restricted</div>
          <div className="ci-denied-sub">Only managers and admins can add properties.</div>
        </div>
      </InventoryLayout>
    );
  }

  return (
    <InventoryLayout title="Add Property" subtitle="Create a new property location">
      <div className="ci-wrap">
        {error && <div className="ci-alert error">⚠ {error}</div>}
        {success && <div className="ci-alert success">✓ {success}</div>}

        <div className="ci-form-group">
          <label className="ci-label">Property Code <span>*</span></label>
          <input className={`ci-input${codeError ? " error" : ""}`} placeholder="e.g. PROP-001, HQ-BUILDING-A..." value={code} maxLength={50} onChange={(e) => { setCode(e.target.value); if (codeError) setCodeError(""); }} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          {codeError && <div className="ci-field-error">{codeError}</div>}
          <div className="ci-char-count">{code.length} / 50</div>
        </div>

        <div className="ci-form-group">
          <label className="ci-label">Property Name <span>*</span></label>
          <input className={`ci-input${nameError ? " error" : ""}`} placeholder="e.g. Downtown Office, Warehouse B..." value={name} maxLength={255} onChange={(e) => { setName(e.target.value); if (nameError) setNameError(""); }} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          {nameError && <div className="ci-field-error">{nameError}</div>}
          <div className="ci-char-count">{name.length} / 255</div>
        </div>

        <div className="ci-form-group">
          <label className="ci-label">Link Cabins <span style={{ color: "#3a3a55", marginLeft: 4, fontSize: 11 }}>(Optional)</span></label>
          {loadingCabins ? (
            <div className="inv-skeleton" style={{ height: 44, borderRadius: 8 }} />
          ) : (
            <select className="ri-select" value={selectedCabinIds} onChange={(e) => {
              const options = e.target.options;
              const selected = [];
              for (let i = 0; i < options.length; i++) { if (options[i].selected) selected.push(options[i].value); }
              setSelectedCabinIds(selected);
            }} multiple style={{ minHeight: 100 }}>
              {cabins.map((c) => (
                <option key={c.id} value={c.id}>Cabin {c.cabin_number} ({c.code}) {c.description ? `- ${c.description}` : ''}</option>
              ))}
            </select>
          )}
          <div style={{ fontSize: 11, color: "#9898b0", marginTop: 4 }}>Hold Ctrl/Cmd to select multiple cabins</div>
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
          <button className="ci-btn-secondary" onClick={() => router.push("/inventory/locations?view=properties")} type="button">Cancel</button>
          <button className="ci-btn-primary" onClick={handleSubmit} disabled={submitting} type="button">
            {submitting ? <><div className="ci-spinner" /> Creating...</> : <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Create Property
            </>}
          </button>
        </div>
      </div>
    </InventoryLayout>
  );
}