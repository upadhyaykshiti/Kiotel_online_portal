
// "use client";

// import React, { useEffect, useState } from "react";

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

// export default function AdminDashboard() {
//   const [activeTab, setActiveTab] = useState("property"); // 'property' or 'equipment'
//   const [submissions, setSubmissions] = useState([]);
//   const [selectedForm, setSelectedForm] = useState(null);
//   const [adminComments, setAdminComments] = useState("");
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchForms = async () => {
//     setIsLoading(true);
//     setSelectedForm(null); // Close panel when switching tabs
//     try {
//       // Assuming your backend supports a query param like ?type=property
//       const res = await fetch(`${API_BASE_URL}/admin/forms?type=${activeTab}`);
//       if(res.ok) {
//         const data = await res.json();
//         setSubmissions(data);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchForms();
//   }, [activeTab]);

//   const handleReviewAction = async (statusAction) => {
//     if (!selectedForm) return;
    
//     if ((statusAction === 'REJECTED' || statusAction === 'CHANGES REQUESTED') && !adminComments.trim()) {
//       alert("Please provide a reason/comment for this action.");
//       return;
//     }

//     try {
//       const res = await fetch(`${API_BASE_URL}/admin/forms/${selectedForm.id}/review?type=${activeTab}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: statusAction, adminComments })
//       });
      
//       const result = await res.json();
//       if (result.success) {
//         alert(result.message);
//         setSelectedForm(null);
//         setAdminComments("");
//         fetchForms(); 
//       }
//     } catch (error) {
//       alert("Error processing review.");
//     }
//   };

//   // Utility to safely render signatures and S3 file uploads as Images instead of text
//   const renderValue = (key, value) => {
//     if (!value) return 'N/A';
//     const valStr = value.toString();
    
//     const isBase64Img = valStr.startsWith('data:image/');
//     const isHttpImg = valStr.match(/^https?:\/\/.*\.(jpeg|jpg|gif|png)$/i) != null;
//     const isSignature = key === 'authorizedSignature';

//     if (isBase64Img || isHttpImg || isSignature) {
//       return (
//         <div className="mt-2 p-2 bg-white border border-gray-200 rounded inline-block">
//           <img src={valStr} alt={key} className="max-w-full h-auto max-h-32 object-contain" />
//         </div>
//       );
//     }

//     return <span className="text-gray-800 mt-1 block">{valStr}</span>;
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col">
//       <nav className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
//         <div className="font-bold text-xl tracking-wider">KIOTEL <span className="font-light text-gray-400">| ADMIN</span></div>
//         <button className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded">Logout</button>
//       </nav>

//       {/* Tabs */}
//       <div className="bg-white border-b border-gray-200 px-8 flex space-x-6 pt-4 shadow-sm">
//         <button 
//           onClick={() => setActiveTab('property')} 
//           className={`pb-3 px-2 font-bold ${activeTab === 'property' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//         >
//           Property Forms
//         </button>
//         <button 
//           onClick={() => setActiveTab('equipment')} 
//           className={`pb-3 px-2 font-bold ${activeTab === 'equipment' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
//         >
//           Equipment Forms
//         </button>
//       </div>

//       <main className="flex-grow p-4 md:p-8 flex gap-8">
        
//         {/* LEFT PANEL: Table */}
//         <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-grow ${selectedForm ? 'w-1/2 hidden md:block' : 'w-full'}`}>
//           <div className="p-6 bg-gray-50 border-b border-gray-200">
//             <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab} Submissions</h2>
//           </div>
          
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
//                   <th className="p-4 border-b">ID / Client</th>
//                   <th className="p-4 border-b">Identifier</th>
//                   <th className="p-4 border-b">Status</th>
//                   <th className="p-4 border-b">Last Updated</th>
//                   <th className="p-4 border-b">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="text-sm">
//                 {isLoading ? (
//                   <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
//                 ) : submissions.length === 0 ? (
//                   <tr><td colSpan="5" className="p-8 text-center text-gray-500">No submissions found.</td></tr>
//                 ) : submissions.map((sub) => {
//                   const data = sub.form_data || {};
//                   const identifier = data.hotelName || data.ispName || 'Unknown';
//                   return (
//                     <tr key={sub.id} className="hover:bg-gray-50 border-b border-gray-100">
//                       <td className="p-4 font-medium text-gray-900">#{sub.id} (C-{sub.client_id})</td>
//                       <td className="p-4">{identifier}</td>
//                       <td className="p-4">
//                         <span className={`px-2 py-1 rounded text-xs font-bold ${
//                           sub.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
//                           sub.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
//                           sub.status === 'UNDER REVIEW' ? 'bg-yellow-100 text-yellow-800' :
//                           'bg-gray-100 text-gray-600'
//                         }`}>
//                           {sub.status}
//                         </span>
//                       </td>
//                       <td className="p-4 text-gray-500">{new Date(sub.updated_at).toLocaleDateString()}</td>
//                       <td className="p-4">
//                         <button onClick={() => setSelectedForm(sub)} className="text-blue-600 font-medium hover:underline">
//                           Review →
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* RIGHT PANEL: Review */}
//         {selectedForm && (
//           <div className="w-full md:w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-[80vh] sticky top-8">
//             <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
//               <h2 className="text-xl font-bold text-gray-800">Review Form #{selectedForm.id}</h2>
//               <button onClick={() => setSelectedForm(null)} className="text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
//             </div>

//             <div className="p-6 overflow-y-auto flex-grow bg-gray-50">
//               <h3 className="font-bold text-gray-700 mb-4 uppercase text-xs tracking-widest">Submitted Data:</h3>
//               <div className="space-y-3">
//                 {Object.entries(selectedForm.form_data || {}).map(([key, value]) => {
//                   if(['actionType', 'userBrowserDate', 'existingHotelLogo', 'existingPropertyMapFile'].includes(key)) return null;
//                   return (
//                     <div key={key} className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col">
//                       <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
//                         {key.replace(/([A-Z])/g, ' $1').trim()}
//                       </span>
//                       {renderValue(key, value)}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             <div className="p-6 border-t border-gray-200 bg-white rounded-b-xl shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
//               <label className="block text-sm font-bold text-gray-700 mb-2">Admin Comments / Reason</label>
//               <textarea 
//                 className="w-full border border-gray-300 p-3 rounded-md mb-4 focus:ring-blue-500 focus:border-blue-500" 
//                 rows="2" 
//                 placeholder="Required if requesting changes or rejecting..."
//                 value={adminComments}
//                 onChange={(e) => setAdminComments(e.target.value)}
//               ></textarea>
//               <div className="flex gap-3">
//                 <button onClick={() => handleReviewAction('APPROVED')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md transition">✓ Approve</button>
//                 <button onClick={() => handleReviewAction('CHANGES REQUESTED')} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-md transition">⚠ Changes</button>
//                 <button onClick={() => handleReviewAction('REJECTED')} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-md transition">✕ Reject</button>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }



"use client";

import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

const formatKeyLabel = (key) =>
  String(key)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

const isProbablyUrl = (val) => typeof val === "string" && /^https?:\/\/\S+$/i.test(val.trim());
const isBase64Image = (val) => typeof val === "string" && val.startsWith("data:image/");
const isProbablyImageUrl = (val) => {
  if (typeof val !== "string") return false;
  const s = val.trim();
  const base = s.split("?")[0];
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(base)) return true;
  // treat most S3 links as images for your use-case
  if (/amazonaws\.com/i.test(s)) return true;
  return false;
};

const META_KEYS = new Set([
  "actionType",
  "userBrowserDate",
  "existingHotelLogo",
  "existingPropertyMapFile",
]);

const getIdentifier = (type, formData) => {
  const d = formData || {};
  if (type === "property") return d.hotelName || d.hotelEmail || "Property Form";
  return d.propertyName || d.name || d.email || "Equipment Form";
};

const StatusPill = ({ status }) => {
  const s = String(status || "").toUpperCase();
  const cls =
    s === "APPROVED"
      ? "bg-green-50 text-green-800 border-green-200"
      : s === "SUBMITTED"
      ? "bg-blue-50 text-blue-800 border-blue-200"
      : s === "UNDER REVIEW"
      ? "bg-yellow-50 text-yellow-900 border-yellow-200"
      : s === "CHANGES REQUESTED"
      ? "bg-amber-50 text-amber-900 border-amber-200"
      : s === "REJECTED"
      ? "bg-red-50 text-red-800 border-red-200"
      : s === "DRAFT"
      ? "bg-slate-50 text-slate-800 border-slate-200"
      : "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold ${cls}`}>
      {status || "UNKNOWN"}
    </span>
  );
};

const ToolbarButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={[
      "px-3 py-2 text-sm font-bold rounded-xl transition border",
      active
        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
    ].join(" ")}
  >
    {children}
  </button>
);

const FieldRenderer = ({ label, value, fieldKey }) => {
  if (value === null || value === undefined || value === "") {
    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
        <div className="mt-2 text-sm text-gray-500 italic">N/A</div>
      </div>
    );
  }

  const isSignature = fieldKey === "authorizedSignature";
  const valStr = typeof value === "string" ? value : null;

  const showAsImage =
    isSignature ||
    (valStr && isBase64Image(valStr)) ||
    (valStr && isProbablyUrl(valStr) && isProbablyImageUrl(valStr));

  if (typeof value === "object" && value !== null) {
    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
        <pre className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto text-gray-800">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    );
  }

  if (showAsImage) {
    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={valStr} alt={label} className="w-full max-h-80 object-contain rounded-lg bg-white" />
          {valStr && isProbablyUrl(valStr) ? (
            <a
              href={valStr}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-xs font-bold text-blue-700 hover:underline break-all"
            >
              Open in new tab
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  if (valStr && isProbablyUrl(valStr)) {
    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
        <a
          href={valStr}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-sm font-semibold text-blue-700 hover:underline break-all"
        >
          {valStr}
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
      <div className="mt-2 text-sm text-gray-900 font-medium break-words">{String(value)}</div>
    </div>
  );
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("property");
  const [submissions, setSubmissions] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [adminComments, setAdminComments] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingReview, setIsSavingReview] = useState(false);

  const fetchForms = async () => {
    setIsLoading(true);
    setSelectedForm(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/forms?type=${activeTab}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load submissions");
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const selectedEntries = useMemo(() => {
    const data = selectedForm?.form_data || {};
    return Object.entries(data).filter(([k]) => !META_KEYS.has(k));
  }, [selectedForm]);

  const handleReviewAction = async (statusAction) => {
    if (!selectedForm) return;

    const needsComment = statusAction === "REJECTED" || statusAction === "CHANGES REQUESTED";
    if (needsComment && !adminComments.trim()) {
      alert("Please provide a comment for this action.");
      return;
    }

    setIsSavingReview(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/forms/${selectedForm.id}/review?type=${activeTab}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: statusAction, adminComments }),
      });
      const result = await res.json();
      if (!res.ok || !result?.success) throw new Error(result?.message || "Failed to review form");

      alert(result.message);
      setSelectedForm(null);
      setAdminComments("");
      await fetchForms();
    } catch (e) {
      console.error(e);
      alert("Error processing review.");
    } finally {
      setIsSavingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">Kiotel Admin</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review and approve customer onboarding submissions</p>
          </div>

          <div className="flex items-center gap-2">
            <ToolbarButton active={activeTab === "property"} onClick={() => setActiveTab("property")}>
              Property Forms
            </ToolbarButton>
            <ToolbarButton active={activeTab === "equipment"} onClick={() => setActiveTab("equipment")}>
              Equipment Forms
            </ToolbarButton>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT list: fixed spans, no dynamic Tailwind */}
        <section className={selectedForm ? "lg:col-span-7" : "lg:col-span-12"}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  {activeTab === "property" ? "Property" : "Equipment"} Submissions
                </h2>
                <p className="text-xs text-gray-500 mt-1">Sorted by last updated</p>
              </div>
              <button
                onClick={fetchForms}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                    <th className="p-4">ID / Client</th>
                    <th className="p-4">Identifier</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Updated</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-500">
                        Loading submissions…
                      </td>
                    </tr>
                  ) : submissions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-500">
                        No submissions found.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => {
                      const identifier = getIdentifier(activeTab, sub.form_data);
                      const updated = sub.updated_at ? new Date(sub.updated_at) : null;

                      return (
                        <tr
                          key={sub.id}
                          className={[
                            "border-b border-gray-100 hover:bg-gray-50 transition",
                            selectedForm?.id === sub.id ? "bg-blue-50/50" : "",
                          ].join(" ")}
                        >
                          <td className="p-4">
                            <div className="font-extrabold text-gray-900">#{sub.id}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Client: C-{sub.client_id}</div>
                          </td>

                          <td className="p-4">
                            <div className="font-semibold text-gray-900">{identifier}</div>
                          </td>

                          <td className="p-4">
                            <StatusPill status={sub.status} />
                          </td>

                          <td className="p-4 text-gray-600">{updated ? updated.toLocaleString() : "—"}</td>

                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedForm(sub);
                                setAdminComments("");
                              }}
                              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-blue-700 transition"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* RIGHT review panel */}
        {selectedForm && (
          <aside className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden lg:sticky lg:top-24">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-extrabold text-gray-900">Review Form #{selectedForm.id}</h3>
                    <StatusPill status={selectedForm.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeTab === "property" ? "Property Onboarding" : "Third‑Party Equipment"} — Client C-
                    {selectedForm.client_id}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedForm(null)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>

              <div className="p-5">
                <h4 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">
                  Submitted Data
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {selectedEntries.map(([key, value]) => (
                    <FieldRenderer key={key} fieldKey={key} label={formatKeyLabel(key)} value={value} />
                  ))}
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 bg-white">
                <label className="block text-sm font-extrabold text-gray-900 mb-2">Admin Comments</label>
                <textarea
                  className="w-full border border-gray-200 p-3 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  rows={3}
                  placeholder="Required if requesting changes or rejecting…"
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    disabled={isSavingReview}
                    onClick={() => handleReviewAction("APPROVED")}
                    className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    disabled={isSavingReview}
                    onClick={() => handleReviewAction("CHANGES REQUESTED")}
                    className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-amber-600 disabled:opacity-60"
                  >
                    Changes
                  </button>
                  <button
                    disabled={isSavingReview}
                    onClick={() => handleReviewAction("REJECTED")}
                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Approving copies <span className="font-semibold">form_data</span> into{" "}
                  <span className="font-semibold">approved_data</span> per your API.
                </p>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}