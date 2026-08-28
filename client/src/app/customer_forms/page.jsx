"use client";

import React, { useEffect, useState } from "react";
import PropertyForm from "../customer/components/PropertyForm";
import EquipmentForm from "../customer/components/EquipmentForm";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

export default function CustomerDashboard() {
  const [activeView, setActiveView] = useState("dashboard"); // 'dashboard', 'property', or 'equipment'
  const [formStatuses, setFormStatuses] = useState({
    property: "NOT STARTED",
    equipment: "NOT STARTED",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeView === "dashboard") {
      const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
          // Fetch both statuses concurrently for better performance
          const [propertyRes, equipmentRes] = await Promise.all([
            fetch(`${API_BASE_URL}/form/property/me`),
            fetch(`${API_BASE_URL}/form/equipment/me`),
          ]);

          const propertyData = propertyRes.ok
            ? await propertyRes.json()
            : { status: "NOT STARTED" };
          const equipmentData = equipmentRes.ok
            ? await equipmentRes.json()
            : { status: "NOT STARTED" };

          setFormStatuses({
            property: propertyData.status || "NOT STARTED",
            equipment: equipmentData.status || "NOT STARTED",
          });
        } catch (err) {
          console.error("Failed to load dashboard data", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDashboardData();
    }
  }, [activeView]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
            APPROVED
          </span>
        );
      case "UNDER REVIEW":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
            UNDER REVIEW
          </span>
        );
      case "DRAFT":
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
            DRAFT
          </span>
        );
      case "CHANGES REQUESTED":
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
            CHANGES REQUESTED
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
            SUBMITTED
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
            NOT STARTED
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="font-black text-xl tracking-tight text-blue-700">
            KIOTEL
          </div>
          <div className="text-gray-400">|</div>
          <div className="font-semibold text-gray-700 tracking-wide hidden sm:block">
            CLIENT ONBOARDING WEB APP
          </div>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <span className="text-gray-500 hidden sm:block">
            Session ID: #12345
          </span>
          <button className="text-red-600 font-medium hover:text-red-800">
            Logout
          </button>
        </div>
      </nav>

      <main className="p-4 md:p-8">
        {activeView === "dashboard" && (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Your Onboarding Dashboard
            </h1>

            {isLoading ? (
              <div className="text-center text-gray-500 py-10">
                Loading your statuses...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Form Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Property Details
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        General hotel info, amenities, and policies.
                      </p>
                    </div>
                    {getStatusBadge(formStatuses.property)}
                  </div>
                  <div className="mt-auto pt-6 border-t border-gray-100">
                    <button
                      onClick={() => setActiveView("property")}
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors shadow-sm"
                    >
                      {formStatuses.property === "NOT STARTED"
                        ? "Start Property Form"
                        : formStatuses.property === "DRAFT"
                          ? "Continue Draft"
                          : "View / Edit Form"}
                    </button>
                  </div>
                </div>

                {/* Equipment Form Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Equipment Form
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Hardware specs and network requirements.
                      </p>
                    </div>
                    {getStatusBadge(formStatuses.equipment)}
                  </div>
                  <div className="mt-auto pt-6 border-t border-gray-100">
                    <button
                      onClick={() => setActiveView("equipment")}
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors shadow-sm"
                    >
                      {formStatuses.equipment === "NOT STARTED"
                        ? "Start Equipment Form"
                        : formStatuses.equipment === "DRAFT"
                          ? "Continue Draft"
                          : "View / Edit Form"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Routing */}
        {activeView === "property" && (
          <PropertyForm onBack={() => setActiveView("dashboard")} />
        )}

        {activeView === "equipment" && (
          <EquipmentForm onBack={() => setActiveView("dashboard")} />
        )}
      </main>
    </div>
  );
}
