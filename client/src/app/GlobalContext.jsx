




"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const GlobalContext = createContext();

const FORM_STATUS = {
  NOT_STARTED: "NOT STARTED",
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER REVIEW",
  APPROVED: "APPROVED",
  CHANGES_REQUESTED: "CHANGES REQUESTED",
};

const normalizeStatus = (raw) => {
  if (!raw) return FORM_STATUS.NOT_STARTED;
  // Ensure consistent formatting (backend might vary)
  const s = String(raw).trim().toUpperCase();
  if (s === "NOT STARTED") return FORM_STATUS.NOT_STARTED;
  if (s === "DRAFT") return FORM_STATUS.DRAFT;
  if (s === "SUBMITTED") return FORM_STATUS.SUBMITTED;
  if (s === "UNDER REVIEW") return FORM_STATUS.UNDER_REVIEW;
  if (s === "APPROVED") return FORM_STATUS.APPROVED;
  if (s === "CHANGES REQUESTED") return FORM_STATUS.CHANGES_REQUESTED;
  return raw; // fallback: show whatever backend returns
};

// “Filled” (gate unlock) rule for BOTH forms.
// You can tighten this later to APPROVED-only if desired.
const isFilledStatus = (status) => {
  return (
    status === FORM_STATUS.SUBMITTED ||
    status === FORM_STATUS.UNDER_REVIEW ||
    status === FORM_STATUS.APPROVED
  );
};

export function GlobalProvider({ children }) {
  const [user, setUser] = useState(null);
  const [customerProperties, setCustomerProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [loading, setLoading] = useState(true);

  // Forms overview state (for sidebar gating + status display)
  const [formsLoading, setFormsLoading] = useState(false);
  const [forms, setForms] = useState({
    property: { status: FORM_STATUS.NOT_STARTED, admin_comments: "" },
    equipment: { status: FORM_STATUS.NOT_STARTED, admin_comments: "" },
  });

  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch User
        const userRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );
        const userData = userRes.data;

        setUser({
          fname: userData.fname,
          role: parseInt(userData.role, 10),
          email: userData.email,
          unique_id: userData.unique_id,
        });

        // Fetch Properties based on role
        const roleNum = parseInt(userData.role, 10);
        const url =
          roleNum === 1 || roleNum === 3
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/properties`
            : `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/properties?customer_id=${userData.unique_id}`;

        const propRes = await axios.get(url, { withCredentials: true });
        const props = propRes.data.properties || propRes.data || [];
        setCustomerProperties(props);

        if (props.length > 0) {
          setSelectedProperty(props[0]);
        }
      } catch (err) {
        console.error("Global Initialization Error:", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Fetch form statuses whenever selectedProperty changes
  useEffect(() => {
    const fetchFormsOverview = async () => {
      if (!selectedProperty?.property_id) return;

      setFormsLoading(true);
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

        const [propertyRes, equipmentRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/form/property/me?property_id=${selectedProperty.property_id}`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/form/equipment/me?property_id=${selectedProperty.property_id}`, { credentials: "include" }),
        ]);

        const readJson = async (res) => {
          if (!res || !res.ok) return null;
          try {
            return await res.json();
          } catch {
            return null;
          }
        };

        const propertyData =
          propertyRes.status === "fulfilled" ? await readJson(propertyRes.value) : null;
        const equipmentData =
          equipmentRes.status === "fulfilled" ? await readJson(equipmentRes.value) : null;

        setForms({
          property: {
            status: normalizeStatus(propertyData?.status),
            admin_comments: propertyData?.admin_comments || "",
          },
          equipment: {
            status: normalizeStatus(equipmentData?.status),
            admin_comments: equipmentData?.admin_comments || "",
          },
        });
      } catch (e) {
        // Don't block UI; just fall back to defaults.
        console.warn("Forms overview fetch failed:", e);
      } finally {
        setFormsLoading(false);
      }
    };

    fetchFormsOverview();
  }, [selectedProperty?.property_id]);

  const gating = useMemo(() => {
    const propertyFilled = isFilledStatus(forms.property.status);
    const equipmentFilled = isFilledStatus(forms.equipment.status);
    const bothFormsFilled = propertyFilled && equipmentFilled;

    return {
      propertyFilled,
      equipmentFilled,
      bothFormsFilled,
    };
  }, [forms.property.status, forms.equipment.status]);

  const value = useMemo(
    () => ({
      user,
      customerProperties,
      selectedProperty,
      setSelectedProperty,
      loading,

      forms,
      formsLoading,
      gating,
    }),
    [user, customerProperties, selectedProperty, loading, forms, formsLoading, gating]
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export const useGlobal = () => useContext(GlobalContext);