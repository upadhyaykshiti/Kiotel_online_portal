"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AgentDashboard() {
  const [userFname, setUserFname] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userUniqueID, setUserUniqueID] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Agent sessions data
  const [activeSessions, setActiveSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [propertyId, setPropertyId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
          { withCredentials: true }
        );

        setUserFname(res.data.fname);
        setUserRole(res.data.role);
        setUserEmail(res.data.email);
        setUserUniqueID(res.data.unique_id);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Fetch agent sessions when user is loaded
  useEffect(() => {
    if (userUniqueID && userRole === 2) {
      fetchAgentSessions();
      // Refresh sessions every 30 seconds
      const interval = setInterval(fetchAgentSessions, 30000);
      return () => clearInterval(interval);
    }
  }, [userUniqueID, userRole]);

  const fetchAgentSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cust/agent/sessions`,
        { 
          params: { agent_id: userUniqueID },
          withCredentials: true 
        }
      );
      setActiveSessions(res.data || []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleEnterProperty = async (e) => {
    e.preventDefault();

    if (!propertyId.trim()) {
      alert("Please enter a property ID");
      return;
    }

    // Check if already active in this property
    const alreadyActive = activeSessions.some(
      session => session.property_id === propertyId && session.status === 'ACTIVE'
    );

    if (alreadyActive) {
      alert("You are already active in this property");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cust/agent/enter-property`,
        {
          agent_id: userUniqueID,
          agent_name: userFname,
          property_id: propertyId,
        },
        { withCredentials: true }
      );

      alert("Successfully entered property!");
      setPropertyId("");
      fetchAgentSessions();
    } catch (err) {
      console.error("Failed to enter property:", err);
      alert(err.response?.data?.error || "Failed to enter property. Please check the Property ID and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExitProperty = async (propertyId) => {
    if (!confirm(`Are you sure you want to exit from this property?`)) {
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cust/agent/exit-property`,
        {
          agent_id: userUniqueID,
          property_id: propertyId,
        },
        { withCredentials: true }
      );

      alert("Successfully exited from property!");
      fetchAgentSessions();
    } catch (err) {
      console.error("Failed to exit property:", err);
      alert("Failed to exit from property. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-300 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-red-600 text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (userRole !== 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Access Denied</h2>
          <p className="text-yellow-600">This page is only accessible to agents.</p>
        </div>
      </div>
    );
  }

  const activePropertyCount = activeSessions.filter(s => s.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Agent Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, {userFname}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Enter Property Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Enter Property</h2>
              </div>

              <div className="p-6">
                <form onSubmit={handleEnterProperty} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      Property ID
                    </label>
                    <input
                      type="text"
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-mono text-lg"
                      placeholder="e.g., PROP-001"
                      disabled={submitting}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-slate-400 font-medium shadow-md hover:shadow-lg"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Entering...
                      </span>
                    ) : (
                      "Enter Property"
                    )}
                  </button>
                </form>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Multiple Properties</p>
                      <p className="text-sm text-blue-700 mt-1">
                        You can be active on multiple properties at the same time. Enter each Property ID to start new sessions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-700 font-semibold">Active Sessions</p>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                      {activePropertyCount}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    You are currently active on {activePropertyCount} {activePropertyCount === 1 ? 'property' : 'properties'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Sessions List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Active Properties</h2>
                  <p className="text-slate-300 text-sm mt-1">Your current property sessions</p>
                </div>
                <button
                  onClick={fetchAgentSessions}
                  disabled={loadingSessions}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <svg className={`w-5 h-5 ${loadingSessions ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {loadingSessions && activeSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-slate-300 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading sessions...</p>
                  </div>
                ) : activeSessions.filter(s => s.status === 'ACTIVE').length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-24 h-24 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-slate-600 text-lg font-medium mb-2">No Active Sessions</p>
                    <p className="text-slate-500 text-sm">Enter a Property ID to start a new session</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeSessions
                      .filter(session => session.status === 'ACTIVE')
                      .map((session, index) => (
                        <div 
                          key={index} 
                          className="border-2 border-slate-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start flex-1">
                              <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center text-xs text-slate-500 mb-2">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  <span className="font-mono font-semibold">{session.property_id}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">
                                  Property Session
                                </h3>
                              </div>
                            </div>

                            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold flex items-center whitespace-nowrap ml-4">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                              Active
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                            <div className="flex items-center text-sm text-slate-600">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Started at {new Date(session.started_at).toLocaleString()}</span>
                            </div>

                            <button
                              onClick={() => handleExitProperty(session.property_id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              Exit Property
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Session History */}
                {activeSessions.filter(s => s.status === 'INACTIVE').length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Sessions</h3>
                    <div className="space-y-3">
                      {activeSessions
                        .filter(session => session.status === 'INACTIVE')
                        .slice(0, 5)
                        .map((session, index) => (
                          <div 
                            key={index} 
                            className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 font-mono text-sm">{session.property_id}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(session.started_at).toLocaleString()} - {new Date(session.ended_at).toLocaleString()}
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-bold">
                                Ended
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Cards */}
            {activePropertyCount > 0 && (
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-900 mb-2">Multi-Property Support</h3>
                      <p className="text-sm text-emerald-800">
                        You can work on multiple properties simultaneously. Your status will show as active on all entered properties.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-2">Session Management</h3>
                      <p className="text-sm text-blue-800">
                        Remember to exit from a property when your shift ends. This helps customers see accurate agent availability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}