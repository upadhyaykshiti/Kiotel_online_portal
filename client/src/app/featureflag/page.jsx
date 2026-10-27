
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link"; 

export default function FeatureFlagPage() {
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  // Two separate lists for our two states
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [excludedUsers, setExcludedUsers] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

  // 1. Fetch all features on load
  const fetchFeatures = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/features/admin/all`, { withCredentials: true });
      setFeatures(res.data);
    } catch (err) { 
      toast.error("Failed to load features"); 
    }
  };

  useEffect(() => { 
    fetchFeatures(); 
  }, []);

  // 2. Load specific users when a feature is clicked (SMART: Loads Allowlist OR Blocklist)
  const handleSelectFeature = async (feature) => {
    setSelectedFeature(feature);
    
    try {
      if (feature.is_global) {
        // If Global, fetch the EXCLUSIONS
        const res = await axios.get(`${API_BASE_URL}/api/features/admin/excluded-users/${feature.feature_key}`, { withCredentials: true });
        setExcludedUsers(res.data);
      } else {
        // If Beta, fetch the ALLOWED users
        const res = await axios.get(`${API_BASE_URL}/api/features/admin/users/${feature.feature_key}`, { withCredentials: true });
        setAllowedUsers(res.data);
      }
    } catch (err) {
      toast.error("Failed to load user list for this feature");
    }
  };

  // 3. Toggle Global Rollout
  const handleToggleGlobal = async (featureKey, currentStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/features/admin/toggle-global`, { featureKey, isGlobal: !currentStatus }, { withCredentials: true });
      toast.success(!currentStatus ? "Feature rolled out globally!" : "Feature disabled globally!");
      fetchFeatures(); 
      
      // If we are looking at the feature we just toggled, immediately flip the right panel!
      if (selectedFeature && selectedFeature.feature_key === featureKey) {
          const updatedFeature = { ...selectedFeature, is_global: !currentStatus };
          handleSelectFeature(updatedFeature); 
      }
    } catch (err) { 
      toast.error("Failed to update rollout status"); 
    }
  };

  // 4. Update Target Audience 
  const handleUpdateAudience = async (featureKey, newAudience) => {
    try {
      await axios.put(`${API_BASE_URL}/api/features/admin/update-audience`, 
        { featureKey, targetAudience: newAudience }, 
        { withCredentials: true }
      );
      toast.success(`Audience updated successfully!`);
      fetchFeatures(); 
      
      if (selectedFeature && selectedFeature.feature_key === featureKey) {
          setSelectedFeature({ ...selectedFeature, target_audience: newAudience });
      }
    } catch (err) { 
      toast.error("Failed to update audience"); 
    }
  };

  // 5. Search for employees
  useEffect(() => {
    if (!searchQuery.trim()) { 
      setSearchResults([]); 
      return; 
    }
    
    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/chat-users/search?q=${searchQuery}`, { withCredentials: true });
        setSearchResults(res.data);
      } catch (err) {
      } finally { 
        setIsSearching(false); 
      }
    }, 500);
    
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // 6. Add User (SMART: Adds to Beta OR Exclusions)
  const handleAddUser = async (userId) => {
    try {
      if (selectedFeature.is_global) {
        await axios.post(`${API_BASE_URL}/api/features/admin/add-exclusion`, { featureKey: selectedFeature.feature_key, userId }, { withCredentials: true });
        toast.success("User excluded from feature!");
      } else {
        await axios.post(`${API_BASE_URL}/api/features/admin/add-user`, { featureKey: selectedFeature.feature_key, userId }, { withCredentials: true });
        toast.success("User granted beta access!");
      }
      setSearchQuery("");
      handleSelectFeature(selectedFeature); 
    } catch (err) { 
      toast.error("Failed to add user"); 
    }
  };

  // 7. Remove User (SMART: Removes from Beta OR Exclusions)
  const handleRemoveUser = async (userId) => {
    try {
      if (selectedFeature.is_global) {
        await axios.delete(`${API_BASE_URL}/api/features/admin/remove-exclusion`, { data: { featureKey: selectedFeature.feature_key, userId }, withCredentials: true });
        toast.success("User exclusion removed!");
      } else {
        await axios.delete(`${API_BASE_URL}/api/features/admin/remove-user`, { data: { featureKey: selectedFeature.feature_key, userId }, withCredentials: true });
        toast.success("User access revoked!");
      }
      handleSelectFeature(selectedFeature); 
    } catch (err) { 
      toast.error("Failed to remove user"); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feature Flags Control Panel</h1>
            <p className="text-gray-500 mt-1">Manage global rollouts, target audiences, and beta testing.</p>
          </div>
          <Link href="/Dashboard" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            ← Back to Portal
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 min-h-[600px]">
            
            {/* LEFT COLUMN: Feature List */}
            <div className="lg:col-span-5 p-6 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Features</h3>
              <div className="space-y-3">
                {features.map(f => (
                  <div 
                    key={f.feature_key} 
                    onClick={() => handleSelectFeature(f)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedFeature?.feature_key === f.feature_key ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900">{f.feature_name}</h4>
                        <code className="text-xs text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded font-mono mt-1 inline-block">{f.feature_key}</code>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleGlobal(f.feature_key, f.is_global); }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${f.is_global ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${f.is_global ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    
                    <div className="text-sm mb-3">
                      {f.is_global ? (
                        <span className="flex items-center text-green-600 font-semibold text-xs"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>100% Global Rollout</span>
                      ) : (
                        <span className="flex items-center text-orange-500 font-semibold text-xs"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></span>Manual Targeting</span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Audience:</span>
                      <select 
                        value={f.target_audience || 'ALL'} 
                        onChange={(e) => { e.stopPropagation(); handleUpdateAudience(f.feature_key, e.target.value); }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs bg-white border border-gray-300 rounded-md px-2 py-1 text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
                      >
                        <option value="ALL">Everyone (Staff & Clients)</option>
                        <option value="INTERNAL">Internal Staff Only</option>
                        <option value="CLIENTS">Clients Only</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Specific User Management */}
            <div className="lg:col-span-7 p-6 bg-white">
              {!selectedFeature ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </div>
                  <p className="text-lg font-medium text-gray-700">Select a feature</p>
                  <p className="text-sm mt-1">Click a feature on the left to manage its rollout targeting.</p>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  
                  {/* Dynamic Header: Beta vs Exclusion */}
                  <div className="mb-6">
                    {selectedFeature.is_global ? (
                      <>
                        <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                          Excluded Users (Blocklist)
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          This feature is <b>Global</b>. Add users here to explicitly <span className="text-red-500 font-semibold">BLOCK</span> them from seeing <b>{selectedFeature.feature_name}</b>.
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-gray-900">Beta Testers (Allowlist)</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          This feature is <b>Hidden</b>. Add users here to grant them beta access to <b>{selectedFeature.feature_name}</b>.
                        </p>
                      </>
                    )}
                  </div>
                  
                  {/* Search Input */}
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input 
                      type="text" 
                      placeholder={selectedFeature.is_global ? "Search users to exclude..." : "Search users to add to beta..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-colors ${selectedFeature.is_global ? 'border-red-200 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}`}
                    />
                    
                    {/* Search Dropdown */}
                    {searchQuery.trim() && (
                      <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span> Searching...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-4 text-sm text-gray-500 text-center">No users found.</div>
                        ) : (
                          searchResults.map(u => {
                            // Check if already in the current active list
                            const currentList = selectedFeature.is_global ? excludedUsers : allowedUsers;
                            const isAlreadyAdded = currentList.some(item => String(item.userId) === String(u.userId));
                            
                            return (
                              <div key={u.userId} className="p-3 hover:bg-gray-50 border-b last:border-b-0 flex justify-between items-center">
                                <span className="font-medium text-sm text-gray-800">{u.name}</span>
                                {isAlreadyAdded ? (
                                  <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 
                                    {selectedFeature.is_global ? "Excluded" : "Added"}
                                  </span>
                                ) : (
                                  <button 
                                    onClick={() => handleAddUser(u.userId)} 
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                      selectedFeature.is_global 
                                      ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white" 
                                      : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                                    }`}
                                  >
                                    {selectedFeature.is_global ? "+ Exclude User" : "+ Add Beta Tester"}
                                  </button>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* List of Users */}
                  <div className={`flex-1 border rounded-xl overflow-hidden flex flex-col ${selectedFeature.is_global ? 'border-red-100 bg-red-50/20' : 'border-gray-200 bg-gray-50/30'}`}>
                    <div className="bg-gray-100/50 px-4 py-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {selectedFeature.is_global 
                        ? `Currently Blocked Users (${excludedUsers.length})` 
                        : `Currently Allowed Users (${allowedUsers.length})`
                      }
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                      {(selectedFeature.is_global ? excludedUsers : allowedUsers).length === 0 ? (
                        <div className="p-8 text-sm text-gray-400 text-center flex flex-col items-center">
                           <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                           {selectedFeature.is_global 
                             ? "No users excluded. Everyone in the audience has access."
                             : "No manual testers assigned."
                           }
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {(selectedFeature.is_global ? excludedUsers : allowedUsers).map(u => (
                            <div key={u.userId} className="p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedFeature.is_global ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {u.fname.charAt(0)}{u.lname.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-sm text-gray-900">{u.fname} {u.lname}</div>
                                  <div className="text-xs text-gray-500">ID: {u.userId}</div>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleRemoveUser(u.userId)} 
                                className="text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200 font-medium px-3 py-1.5 rounded-lg transition-all"
                              >
                                {selectedFeature.is_global ? "Remove Exclusion" : "Revoke Access"}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}