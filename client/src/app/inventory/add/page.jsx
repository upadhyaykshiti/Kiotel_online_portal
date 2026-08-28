"use client";
import "../inventory.css";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import inventoryApi from "../_lib/inventoryApi";
import InventoryLayout from "../_components/InventoryLayout";
import { useInventoryUser } from "../_hooks/useInventoryUser";
import axios from "axios";

function AddInventoryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user,userRole, loading: userLoading } = useInventoryUser();

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(searchParams.get("item_id") || "");
  const [currentStock, setCurrentStock] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [loadingItems, setLoadingItems] = useState(true);
  const [performedByName, setPerformedByName] = useState("");
const [nameError, setNameError] = useState("");
  const fileRef = useRef(null);




useEffect(() => {
  if (!user) return;

  const fetchItems = async () => {
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

      const active = (res.data?.data || []).filter(
        (i) => i.status !== "inactive"
      );

      setItems(active);

      const preId = searchParams.get("item_id");

      if (preId) {
        const found = active.find(
          (i) => String(i.id) === String(preId)
        );

        if (found) {
          setCurrentStock(found.available_quantity);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory items.");
    } finally {
      setLoadingItems(false);
    }
  };

  fetchItems();
}, [user, searchParams]);

  const handleItemChange = (id) => {
    setSelectedItem(id);
    const found = items.find((i) => String(i.id) === String(id));
    setCurrentStock(found ? found.available_quantity : null);
    setErrors((e) => ({ ...e, item: "" }));
  };

  const handleImage = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) { setError("Only JPG, PNG, WebP, or PDF files are allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("File must be under 5 MB."); return; }
    setError(null);
    setImage(file);
    if (file.type !== "application/pdf") {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const validate = () => {
    const e = {};
      let valid = true;  // ← This line was missing
    if (!performedByName.trim()) {
  
  setNameError("Please enter your name.");  // Use the setter function
  valid = false;
}
    if (!selectedItem) e.item = "Please select an item.";
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) e.quantity = "Enter a valid quantity greater than 0.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const newStock = selectedItem && quantity && !isNaN(quantity) && Number(quantity) > 0
    ? (currentStock ?? 0) + Number(quantity)
    : null;

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("item_id", selectedItem);
      formData.append("quantity", quantity);
      formData.append("performed_by_name", performedByName.trim());
      if (notes.trim()) formData.append("notes", notes.trim());
      if (image) formData.append("image", image);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/add`,
        formData,
        { withCredentials: true,  headers: {
      "Content-Type": "multipart/form-data",
      "x-user-id": user.id,
      "x-user-role": user.roleId,
      "x-user-email": user.email,
      "x-user-fname": user.fname,
      "x-user-unique-id": user.unique_id,
    }, }
      );
      if (res.data?.success) {
        setSuccess(`Inventory added! New stock: ${newStock} units.`);
        setTimeout(() => router.push("/inventory/add"), 1400);
      } else {
        setError(res.data?.message || "Failed to add inventory.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!userLoading && userRole === "employee") {
    return (
      <div className="ai-denied">
        <div className="ai-denied-icon">🔒</div>
        <div className="ai-denied-title">Access Restricted</div>
        <div className="ai-denied-sub">Only admins and managers can add inventory.</div>
      </div>
    );
  }

  return (
    <>
      <div className="ai-wrap">
        {error && <div className="ai-alert error">⚠ {error}</div>}
        {success && <div className="ai-alert success">✓ {success}</div>}

        {/* Item Select */}
        <div className="ai-form-group">
          <label className="ai-label">Select Item <span className="ai-req">*</span></label>
          {loadingItems ? (
            <div className="inv-skeleton" style={{ height: 44, borderRadius: 8 }} />
          ) : (
            <select
              className={`ai-select${errors.item ? " error" : ""}`}
              value={selectedItem}
              onChange={(e) => handleItemChange(e.target.value)}
            >
              <option value="">— Choose an item —</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          )}
          {errors.item && <div className="ai-field-error">{errors.item}</div>}
        </div>

        {/* Stock Preview */}
        {selectedItem && currentStock !== null && (
          <div className="ai-stock-preview">
            <div className="ai-stock-col">
              <div className="ai-stock-label">Current Stock</div>
              <div className="ai-stock-val">{currentStock}</div>
            </div>
            <div className="ai-stock-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a4a66" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </div>
            <div className="ai-stock-col">
              <div className="ai-stock-label">Adding</div>
              <div className="ai-stock-val add">{quantity && Number(quantity) > 0 ? `+${quantity}` : "—"}</div>
            </div>
            <div className="ai-stock-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a4a66" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </div>
            <div className="ai-stock-col">
              <div className="ai-stock-label">New Stock</div>
              <div className="ai-stock-val new">{newStock ?? "—"}</div>
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="ai-form-group">
          <label className="ai-label">Quantity <span className="ai-req">*</span></label>
          <input
            type="number"
            min="1"
            className={`ai-input${errors.quantity ? " error" : ""}`}
            placeholder="Enter quantity to add..."
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setErrors((er) => ({ ...er, quantity: "" })); }}
          />
          {errors.quantity && <div className="ai-field-error">{errors.quantity}</div>}
        </div>

        {/* Notes */}
        <div className="ai-form-group">
          <label className="ai-label">Notes <span className="ai-opt">(Optional)</span></label>
          <textarea
            className="ai-textarea"
            placeholder="e.g. Purchased from Amazon, Invoice #1234..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Image / Receipt Upload */}
        <div className="ai-form-group">
          <label className="ai-label">Purchase Proof <span className="ai-opt">(Optional)</span></label>
          {image ? (
            <div className="ai-file-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Proof" className="ai-file-img" />
              ) : (
                <div className="ai-file-name">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  {image.name}
                </div>
              )}
              <button className="ai-file-remove" onClick={() => { setImage(null); setImagePreview(null); }}>
                × Remove
              </button>
            </div>
          ) : (
            <div
              className="ai-upload-zone"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("dragover"); }}
              onDragLeave={(e) => e.currentTarget.classList.remove("dragover")}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("dragover"); handleImage(e.dataTransfer.files[0]); }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "#3a3a55" }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div className="ai-upload-text"><strong>Click to upload</strong> or drag & drop</div>
              <div className="ai-upload-sub">Receipt, invoice — JPG, PNG, WebP, PDF · max 5 MB</div>
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
        <div className="ai-actions">
          <button className="ai-btn-secondary" onClick={() => router.push("/inventory/list")} type="button">Cancel</button>
          <button className="ai-btn-primary" onClick={handleSubmit} disabled={submitting} type="button">
            {submitting ? <><div className="ai-spinner" /> Adding...</> : <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Add to Inventory
            </>}
          </button>
        </div>
      </div>
    </>
  );
}

export default function AddInventory() {
  return (
    <InventoryLayout title="Add Inventory" subtitle="Increase stock quantity for an item">

      <Suspense fallback={<div className="inv-skeleton" style={{ height: 400, borderRadius: 12 }} />}>
        <AddInventoryForm />
      </Suspense>
    </InventoryLayout>
  );
}