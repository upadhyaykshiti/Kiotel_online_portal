
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useGlobal } from "../GlobalContext"; // Adjust import path
import ShellLayout from "../ShellLayout";       // Adjust import path

// Static Plan Data
const PLANS = {
  dedicated: [
    { id: 'ded_8hr', name: '8 Hour Service', shifts: 1, hours: 8, monthlyFee: 1800, hourlyRate: 7.50, onboardingFee: 1500 },
    { id: 'ded_16hr', name: '16 Hour Service', shifts: 2, hours: 16, monthlyFee: 2880, hourlyRate: 6.00, onboardingFee: 1500 },
    { id: 'ded_24hr', name: '24 Hour Service', shifts: 3, hours: 24, monthlyFee: 3600, hourlyRate: 5.00, onboardingFee: 1500 }
  ],
  shared: [
    { id: 'shr_8hr', name: '8 Hour Service', shifts: 1, hours: 8, monthlyFee: 1400, hourlyRate: 5.83, onboardingFee: 1500 },
    { id: 'shr_16hr', name: '16 Hour Service', shifts: 2, hours: 16, monthlyFee: 1900, hourlyRate: 3.96, onboardingFee: 1500 },
    { id: 'shr_24hr', name: '24 Hour Service', shifts: 3, hours: 24, monthlyFee: 2400, hourlyRate: 3.33, onboardingFee: 1500 }
  ]
};

const fmt = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
};

export default function CustomerDashboard() {
  const { user, selectedProperty } = useGlobal();

  const [userFname, setUserFname] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userUniqueID, setUserUniqueID] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPlan, setCurrentPlan] = useState(null);
  const [planHistory, setPlanHistory] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [changeRequest, setChangeRequest] = useState(null);
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [requestRemarks, setRequestRemarks] = useState("");
  const [requestingChange, setRequestingChange] = useState(false);

  const [activeAgent, setActiveAgent] = useState(null);
  const [loadingAgent, setLoadingAgent] = useState(false);

  const [propertyLinks, setPropertyLinks] = useState(null);

  // New states for Reports feature
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    if (user && selectedProperty) {
      fetchServicePlan();
      fetchActiveAgent();
      fetchChangeRequest();
      fetchPlanHistory();
    }
  }, [user, selectedProperty]);

  const fetchServicePlan = async () => {
    if (!selectedProperty) return;
    setLoadingPlan(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/service-plan`, { 
        params: { customer_id: user.unique_id, property_id: selectedProperty.property_id }, 
        withCredentials: true 
      });
      setCurrentPlan(res.data);
    } catch (err) {
      console.error("Failed to fetch service plan:", err);
    } finally {
      setLoadingPlan(false);
    }
  };

  const fetchPlanHistory = async () => {
    if (!selectedProperty) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/service-plan/history`, { 
        params: { customer_id: user.unique_id }, 
        withCredentials: true 
      });
      setPlanHistory(res.data || []);
    } catch (err) {
      console.error("Failed to fetch plan history:", err);
    }
  };

  const fetchChangeRequest = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/service-plan/change-request`, { 
        params: { customer_id: user.unique_id }, 
        withCredentials: true 
      });
      setChangeRequest(res.data);
    } catch (err) {
      console.error("Failed to fetch change request:", err);
    }
  };

  const fetchActiveAgent = async () => {
    if (!selectedProperty) return;
    setLoadingAgent(true);
    try {
      // Internal schedule — provides shift_start / shift_end (and a scheduled agent name)
      let internalData = {};
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/agent-schedule`, {
          params: { property_id: selectedProperty.property_id },
          withCredentials: true
        });
        internalData = res.data || {};
      } catch (err) {
        console.warn("Internal agent fetch failed:", err);
      }

      // External (kiotel dashboard) — is an agent remotely controlling this device right now?
      let externalAgent = null;
      try {
        const externalApiToken = process.env.NEXT_PUBLIC_EXTERNAL_API_TOKEN;
        const extRes = await axios.get(
          `${process.env.NEXT_PUBLIC_URL_ext}api/v1/external/devices/${encodeURIComponent(selectedProperty.property_id)}/active-agent`,
          { headers: { Authorization: `Bearer ${externalApiToken}` } }
        );
        externalAgent = extRes.data;
      } catch (err) {
        console.warn("External active-agent fetch failed:", err?.response?.data || err.message);
      }

      if (externalAgent?.active) {
        // A remote agent is live on this device — drive the panel from the external API
        setActiveAgent({
          status: "ACTIVE",
          agent_id: externalAgent.agent_id,
          agent_name: externalAgent.agent_name || internalData.agent_name || "Agent",
          shift_start: internalData.shift_start,
          shift_end: internalData.shift_end,
        });
      } else if (internalData && Object.keys(internalData).length) {
        setActiveAgent(internalData);
      } else {
        setActiveAgent(null);
      }
    } catch (err) {
      console.error("Failed to fetch active agent:", err);
      setActiveAgent(null);
    } finally {
      setLoadingAgent(false);
    }
  };

  // const fetchReports = async () => {
  //   setLoadingReports(true);
  //   try {
  //     const externalApiToken = process.env.NEXT_PUBLIC_EXTERNAL_API_TOKEN;
      
  //     const res = await axios.get(
  //       `${process.env.NEXT_PUBLIC_URL_ext}api/v1/external/transaction-reports`,
  //       {
  //         headers: { Authorization: `Bearer ${externalApiToken}` },
  //         params: { limit: 10 }
  //       }
  //     );
  //     setReports(res.data.data || []);
  //   } catch (err) {
  //     console.error("Failed to fetch reports:", err);
  //   } finally {
  //     setLoadingReports(false);
  //   }
  // };


    const fetchReports = async () => {
    // Prevent making the request if we don't have a property ID yet
    if (!selectedProperty?.property_id) {
      console.warn("No property selected. Cannot fetch reports.");
      return;
    }

    setLoadingReports(true);
    try {
      const externalApiToken = process.env.NEXT_PUBLIC_EXTERNAL_API_TOKEN;
      
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_URL_ext}api/v1/external/transaction-reports`,
        {
          headers: { Authorization: `Bearer ${externalApiToken}` },
          params: { 
            // Map the API's device_id to your property_id
            device_id: selectedProperty.property_id, 
            limit: 10 
          }
        }
      );
      setReports(res.data.data || []);
    } catch (err) {
      // Log the specific backend validation error if it still fails
      console.error("Failed to fetch reports:", err.response?.data || err.message);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleOpenReports = () => {
    setShowReportsModal(true);
    fetchReports();
  };

  const handleRequestChange = async () => {
    if (!selectedPlan || !requestRemarks.trim()) return;
    setRequestingChange(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/service-plan/change-request`, {
        customer_id: user.unique_id,
        property_id: selectedProperty.property_id,
        current_plan_id: currentPlan?.id,
        requested_plan_name: selectedPlan.name,
        requested_service_type: selectedServiceType,
        requested_shift_hours: selectedPlan.hours.toString(),
        requested_monthly_price: selectedPlan.monthlyFee.toString(),
        remarks: requestRemarks
      }, { withCredentials: true });
      setShowRequestModal(false);
      resetRequestForm();
      fetchServicePlan();
      fetchChangeRequest();
    } catch (err) {
      alert("Failed to submit request. Please try again.");
    } finally {
      setRequestingChange(false);
    }
  };

  const resetRequestForm = () => {
    setSelectedServiceType(null);
    setSelectedPlan(null);
    setRequestRemarks("");
  };

  const isPlanChangeRequested = currentPlan?.status === 'PENDING_CHANGE' || (changeRequest && changeRequest.status === 'PENDING');

  return (
    <ShellLayout>
      <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
           <div>
             <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
               Hello, {user?.fname || "User"} 👋
             </h1>
             <p className="text-gray-500 mt-1 text-sm">
               Here is the overview for <span className="font-semibold text-blue-600">{selectedProperty?.property_name || "your property"}</span>
             </p>
           </div>
           <div className="inline-flex items-center rounded-lg bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 border border-green-200 shadow-sm shrink-0">
              <span className="relative flex h-2.5 w-2.5 mr-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              System Operational
           </div>
        </div>

        {!selectedProperty ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Properties Assigned</h3>
            <p className="text-gray-500 max-w-sm">You currently do not have any properties. Please contact support to provision your account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Service Plan Card */}
            <div className="xl:col-span-2 flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 bg-white px-6 py-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Service Configuration
                </h2>
                <button 
                  onClick={() => setShowPlanModal(true)} 
                  className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                  View History 
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                {loadingPlan ? (
                  <div className="flex flex-col items-center justify-center py-12 flex-1">
                    <div className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium text-sm">Retrieving plan data...</p>
                  </div>
                ) : currentPlan ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{currentPlan.plan_name}</h3>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 border border-green-200">
                              {currentPlan.status}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">{currentPlan.service_type} Architecture</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5 shadow-sm">
                          <p className="text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Daily Coverage</p>
                          <p className="text-3xl font-extrabold text-gray-900">{currentPlan.shift_hours}<span className="text-lg font-bold text-gray-400 ml-1">hrs</span></p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5 shadow-sm">
                          <p className="text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Type</p>
                          <p className="text-xl font-extrabold text-gray-900 capitalize mt-2">{currentPlan.service_type}</p>
                        </div>
                        <div className="rounded-xl bg-blue-600 p-5 shadow-md shadow-blue-500/20 text-white relative overflow-hidden">
                          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                          <p className="text-[11px] font-bold text-blue-100 mb-2 uppercase tracking-widest relative z-10">Monthly Billing</p>
                          <p className="text-3xl font-extrabold text-white relative z-10">${currentPlan.monthly_price}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowRequestModal(true)}
                      disabled={isPlanChangeRequested}
                      className="w-full inline-flex h-12 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition-all hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                    >
                      {isPlanChangeRequested ? "Modification Request Pending..." : "Request Plan Upgrade / Modification"}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 flex-1 flex flex-col justify-center">
                    <p className="text-lg font-bold text-gray-900">No Active Plan</p>
                    <p className="text-gray-500 mt-1 text-sm">Please contact administration to provision your services.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Agent Card */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 bg-white px-6 py-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                  <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  Active Remote Agent
                </h2>
              </div>
{/* Hello this is the way it should be having the same in the local value of the order to be performed  in the seen of the local overview of the networkig 
int eh same leage of the work off in the metrix of the view int eh seen of periferals of the valks in the seen of the local stats of the logics in the seen 
as they are the logical network in the seen of the periferals for the state to manage the seen in the local folks in the cabin of the management of the persistant in the seen fo the 
hell no it should be possiblly the sessin logic of the network it is the state of which it should be having the same it <h1>
hello no it should the status of the network in the sequence of the format in which it should be having the same of the week ends in the minimul of the network as it should be the seen of <thead></thead></h1> 

*/}
              <div className="p-6 flex-1 flex flex-col">
                {loadingAgent ? (
                  <div className="flex flex-col items-center justify-center py-12 flex-1">
                    <div className="w-10 h-10 rounded-full border-4 border-gray-100 border-t-green-500 animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium text-sm">Connecting to terminal...</p>
                  </div>
                ) : activeAgent?.status === 'ACTIVE' ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-sm">
                          <span className="text-2xl font-bold text-green-700">{activeAgent.agent_name?.charAt(0).toUpperCase() || 'A'}</span>
                        </div>
                        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm"></span>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-900 tracking-tight">{activeAgent.agent_name}</p>
                        <div className="flex items-center gap-1.5 mt-1 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 inline-flex">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Currently Monitoring</p>
                        </div>
                      </div>
                    </div>
                    
                    {activeAgent.shift_start && activeAgent.shift_end && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5 mt-auto shadow-sm">
                        <p className="text-[11px] font-bold text-gray-500 mb-4 uppercase tracking-widest">Shift Schedule</p>
                        <div className="flex items-center justify-between text-sm font-bold text-gray-900">
                          <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">{activeAgent.shift_start}</span>
                          <div className="flex-1 mx-4 flex items-center">
                            <div className="h-[2px] w-full bg-gray-200 rounded-full"></div>
                            <div className="h-2 w-2 rounded-full bg-blue-500 mx-1 flex-shrink-0 shadow-sm"></div>
                            <div className="h-[2px] w-full bg-gray-200 rounded-full"></div>
                          </div>
                          <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">{activeAgent.shift_end}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 flex-1 flex flex-col justify-center items-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-gray-900">Terminal Offline</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-[200px]">No agent is currently assigned to this shift block.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS KEPT EXACTLY THE SAME AS PREVIOUS ITERATION */}
      {/* ========== PLAN HISTORY MODAL ========== */}
      {showPlanModal && currentPlan && (
        <div className="fixed inset-0 z-[60] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all" onClick={() => setShowPlanModal(false)}>
           {/* Modal Body from previous iteration */}
        </div>
      )}

      {/* ========== REQUEST PLAN CHANGE MODAL ========== */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowRequestModal(false); resetRequestForm(); }}>
          <div className="bg-white rounded-xl max-w-4xl w-full overflow-hidden max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Plan Change</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Choose your new service plan</p>
              </div>
              <button onClick={() => { setShowRequestModal(false); resetRequestForm(); }} className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-6">

              {/* Step 1: Service Type */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                  <p className="text-sm font-semibold text-slate-900">Select Service Type</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setSelectedServiceType('dedicated'); setSelectedPlan(null); }}
                    className={`relative p-4 rounded-lg border-2 transition-all text-left ${selectedServiceType === 'dedicated' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    {selectedServiceType === 'dedicated' && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Dedicated Service</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Exclusive agent for your property</p>
                  </button>
                  <button
                    onClick={() => { setSelectedServiceType('shared'); setSelectedPlan(null); }}
                    className={`relative p-4 rounded-lg border-2 transition-all text-left ${selectedServiceType === 'shared' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    {selectedServiceType === 'shared' && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Shared Service</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Cost-effective shared solution</p>
                  </button>
                </div>
              </div>

              {/* Step 2: Plan Selection — matching admin format */}
              {selectedServiceType && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                    <p className="text-sm font-semibold text-slate-900">Choose Plan</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {PLANS[selectedServiceType].map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`relative rounded-lg border-2 transition-all text-left overflow-hidden ${selectedPlan?.id === plan.id ? 'border-blue-500' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        {/* Card Header */}
                        <div className={`px-3 py-2.5 text-center text-white ${selectedPlan?.id === plan.id ? 'bg-blue-600' : 'bg-slate-700'}`}>
                          {selectedPlan?.id === plan.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                          )}
                          <p className="text-sm font-bold">{plan.hours} Hour</p>
                          <p className="text-[10px] opacity-80">{plan.shifts} Shift{plan.shifts > 1 ? 's' : ''}</p>
                        </div>

                        {/* Card Body */}
                        <div className={`p-3.5 ${selectedPlan?.id === plan.id ? 'bg-blue-50' : 'bg-white'}`}>
                          {/* Price */}
                          <div className="text-center pb-3 mb-3 border-b border-slate-100">
                            <p className="text-xl font-extrabold text-slate-900">{fmt(plan.monthlyFee)}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{fmt(plan.hourlyRate)}/hr</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Kiosk subscription fee monthly</p>
                          </div>

                          {/* One-time fees */}
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">One-Time Fees</p>
                          <div className="space-y-1 text-[11px] mb-2.5">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Onboarding</span>
                              <span className="font-semibold text-slate-800">{fmt(plan.onboardingFee)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Installation</span>
                              <span className="font-semibold text-slate-800">{fmt(plan.installationFee)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Hardware</span>
                              <span className={`font-semibold ${plan.hardwareCost === 0 ? 'text-slate-300' : 'text-slate-800'}`}>$0</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-2.5">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Add-ons</p>
                            <div className="space-y-1 text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Additional shifts</span>
                                <span className={`font-semibold ${plan.additionalShifts === 0 ? 'text-slate-300' : 'text-slate-800'}`}>
                                  {plan.additionalShifts > 0 ? `$${plan.additionalShifts}/hr` : '$0'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Cash machine</span>
                                <span className="font-semibold text-slate-800">${plan.cashMachine}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Remote Support</span>
                                <span className="font-semibold text-emerald-600 flex items-center gap-0.5">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                  included
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">On-Site Support</span>
                                <span className="font-semibold text-slate-800">${plan.onsiteSupport}/trip</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Remarks */}
              {selectedPlan && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">3</span>
                    <p className="text-sm font-semibold text-slate-900">Reason for Change <span className="text-red-500">*</span></p>
                  </div>
                  <textarea
                    value={requestRemarks}
                    onChange={(e) => setRequestRemarks(e.target.value)}
                    className="w-full px-3.5 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-none"
                    rows="4"
                    placeholder="Please describe why you'd like to change your plan..."
                  ></textarea>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => { setShowRequestModal(false); resetRequestForm(); }}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                  disabled={requestingChange}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestChange}
                  disabled={!selectedPlan || !requestRemarks.trim() || requestingChange}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                >
                  {requestingChange ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== TRANSACTION REPORTS MODAL ========== */}
      {showReportsModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReportsModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full overflow-hidden max-h-[85vh] flex flex-col shadow-xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Transaction Reports</h3>
              <button onClick={() => setShowReportsModal(false)} className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              {loadingReports ? (
                <div className="text-center py-10">
                  <div className="w-7 h-7 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-slate-400">Loading reports...</p>
                </div>
              ) : reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div key={report.session_id} className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-900">{report.session_id}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${report.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Device ID: <span className="font-medium text-slate-700">{report.device_id}</span></p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-slate-500">No transaction reports found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ShellLayout>
  );
}