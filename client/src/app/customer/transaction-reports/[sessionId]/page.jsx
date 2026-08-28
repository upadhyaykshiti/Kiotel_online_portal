"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import ShellLayout from "../../../ShellLayout";

const PAGE_LIMIT = 25;
const COLLECTED_TYPES = ["STACKED", "STORED"];
const OUTFLOW_TYPES = ["DISPENSED", "RETURNED", "STACKED_FRAUD_ATTEMPT", "STORED_FRAUD_ATTEMPT"];
const HIDDEN_EXTRACTED_FIELDS = new Set(["extraction_method", "warnings", "ocr_text", "age_warning"]);

function statusPillClass(status) {
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "ongoing") return "bg-amber-100 text-amber-700";
  if (status === "timed-out") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

function eventBadgeClass(eventType) {
  if (COLLECTED_TYPES.includes(eventType)) return "bg-emerald-100 text-emerald-700";
  if (OUTFLOW_TYPES.includes(eventType)) return "bg-rose-100 text-rose-700";
  if (eventType === "ESCROW") return "bg-amber-100 text-amber-700";
  if (eventType === "DISPENSING") return "bg-orange-100 text-orange-700";
  return "bg-slate-100 text-slate-700";
}

function scanStatusClass(s) {
  if (s === "completed_with_ocr_data" || s === "completed_without_ocr_data" || s === "processed") return "bg-emerald-100 text-emerald-700";
  if (s === "error_occurred" || s === "failed") return "bg-rose-100 text-rose-700";
  if (s === "cancelled") return "bg-slate-100 text-slate-500";
  return "bg-slate-100 text-slate-700";
}

function formatUTC(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function formatUTCWithFlag(value) {
  const ts = formatUTC(value);
  if (ts === "-") return "-";
  return `${ts} UTC`;
}

function calcDuration(start, end) {
  if (!start || !end) return "-";
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e < s) return "-";
  const totalSec = Math.floor((e - s) / 1000);
  const m = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${m} min ${sec} sec`;
}

function formatDollars(n) {
  const v = Number(n);
  if (!isFinite(v)) return "$0.00";
  return `$${v.toFixed(2)}`;
}

function formatCents(n) {
  const v = Number(n);
  if (!isFinite(v)) return "$0.00";
  return `$${(v / 100).toFixed(2)}`;
}

function formatKey(key) {
  return key
    .replace(/^VIZ_/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");
}

function parseExtracted(value) {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className="text-sm font-semibold text-slate-900 mt-1 break-words">{value}</div>
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StarRating({ rating }) {
  if (rating == null) return <p className="text-sm text-slate-500">No rating</p>;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    const filled = i < rating;
    stars.push(
      <svg
        key={i}
        className={`w-4 h-4 ${filled ? "text-amber-400" : "text-slate-200"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.158c.969 0 1.371 1.24.588 1.81l-3.364 2.444a1 1 0 00-.364 1.118l1.286 3.955c.3.922-.755 1.688-1.539 1.118L10 14.347l-3.362 2.443c-.784.57-1.838-.196-1.539-1.118l1.286-3.955a1 1 0 00-.364-1.118L2.657 8.155c-.783-.57-.38-1.81.588-1.81h4.158a1 1 0 00.95-.69l1.286-3.955z" />
      </svg>
    );
  }
  return (
    <div className="flex items-center gap-1">
      {stars}
      <span className="ml-2 text-sm font-semibold text-slate-700">{rating}/5</span>
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusPillClass(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {status || "-"}
    </span>
  );
}

function RecordNav({ onPrev, onNext, hasPrev, hasNext, position, total }) {
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t) {
        const tag = t.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable) return;
      }
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key === "ArrowLeft" && hasPrev) { e.preventDefault(); onPrev(); }
      else if (e.key === "ArrowRight" && hasNext) { e.preventDefault(); onNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasPrev, hasNext, onPrev, onNext]);

  const counter = position != null && total != null ? `Session ${position} of ${total}` : "—";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        title="Previous (←)"
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Prev
      </button>
      <span className="text-sm text-slate-500 tabular-nums min-w-[130px] text-center">{counter}</span>
      <button
        onClick={onNext}
        disabled={!hasNext}
        title="Next (→)"
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

function AgeWarningBanner({ age_warning }) {
  if (!age_warning) return null;
  const config = age_warning === "below_18"
    ? { border: "border-rose-300", bg: "bg-rose-50", text: "text-rose-700", msg: "Guest is under 18 years old" }
    : age_warning === "below_21"
      ? { border: "border-amber-300", bg: "bg-amber-50", text: "text-amber-700", msg: "Guest is under 21 years old" }
      : null;
  if (!config) return null;
  return (
    <div className={`mb-5 flex items-center gap-3 p-4 rounded-xl border ${config.border} ${config.bg}`}>
      <svg className={`w-5 h-5 ${config.text} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.732 0 2.814-1.875 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <span className={`font-semibold ${config.text}`}>{config.msg}</span>
    </div>
  );
}

function ExtractedDataGrid({ entries }) {
  const visibleEntries = entries.filter(
    ([key, value]) => !HIDDEN_EXTRACTED_FIELDS.has(key) && value !== "" && value != null
  );
  const ocrTextEntry = entries.find(([key, value]) => key === "ocr_text" && value !== "" && value != null);
  if (visibleEntries.length === 0 && !ocrTextEntry) return null;

  return (
    <>
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-base font-bold text-slate-900">Extracted Data</h3>
        <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
          {visibleEntries.length} fields
        </span>
      </div>
      {visibleEntries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {visibleEntries.map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate" title={formatKey(key)}>
                {formatKey(key)}
              </span>
              <span className="text-sm font-semibold text-slate-900 break-words">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
      {ocrTextEntry && (
        <div className="mt-3 flex flex-col gap-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{formatKey("ocr_text")}</span>
          <span className="text-sm text-slate-700 whitespace-pre-wrap break-words">{String(ocrTextEntry[1])}</span>
        </div>
      )}
    </>
  );
}

function ScanDetailsModal({ doc, onClose }) {
  const hasSecondary = Boolean(doc.secondary_image_url);
  const isPassport = doc.scan_type === "passport";
  const showSideToggle = hasSecondary && !isPassport;

  const [activeSide, setActiveSide] = useState("primary");
  const [rotations, setRotations] = useState({ primary: 0, secondary: 0 });
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [activeSide]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const activeUrl = activeSide === "primary" ? doc.primary_image_url : doc.secondary_image_url;
  const rotation = rotations[activeSide];
  const rotateBy = (delta) => setRotations((r) => ({ ...r, [activeSide]: r[activeSide] + delta }));

  const parsed = parseExtracted(doc.extracted_info);
  const isNewFormat = parsed && typeof parsed === "object" && !!parsed.ocr_type;
  const extractedData = isNewFormat ? (parsed?.extracted_data || {}) : (parsed || {});
  const entries = parsed && typeof parsed === "object" ? Object.entries(extractedData) : [];
  const alerts = isNewFormat && Array.isArray(parsed.alerts) ? parsed.alerts : [];
  const ageWarning = extractedData?.age_warning || null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-base font-bold text-slate-900">Scan Details</h3>
            <span className="font-mono text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md truncate">
              {doc.scan_job_id}
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row min-h-0 flex-1 overflow-hidden">
          <div className="w-full md:w-[45%] flex flex-col bg-slate-50 border-r border-slate-100">
            {showSideToggle && (
              <div className="flex gap-2 p-3 border-b border-slate-100 justify-center bg-white">
                {[{ key: "primary", label: "Primary" }, { key: "secondary", label: "Secondary" }].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActiveSide(s.key)}
                    className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full transition-colors ${
                      activeSide === s.key
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1 p-4 flex items-center justify-center overflow-hidden min-h-[280px]">
              {activeUrl && !imgError ? (
                <img
                  src={activeUrl}
                  alt={`${activeSide} scan`}
                  style={{ transform: `rotate(${rotation}deg)`, transition: "transform 250ms ease" }}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-sm">Image not available</p>
                </div>
              )}
            </div>
            {activeUrl && !imgError && (
              <div className="flex gap-2 p-3 border-t border-slate-100 justify-center bg-white">
                <button
                  onClick={() => rotateBy(-90)}
                  title="Rotate left"
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                  Rotate Left
                </button>
                <button
                  onClick={() => rotateBy(90)}
                  title="Rotate right"
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                  </svg>
                  Rotate Right
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-5 overflow-y-auto">
            <AgeWarningBanner age_warning={ageWarning} />
            {entries.length > 0 ? (
              <ExtractedDataGrid entries={entries} />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 py-12">
                <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
                <p className="text-sm font-medium">No extracted data</p>
              </div>
            )}

            {alerts.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.732 0 2.814-1.875 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <h3 className="text-base font-bold text-rose-700">Alerts</h3>
                </div>
                <div className="space-y-2">
                  {alerts.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-rose-200 bg-rose-50">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 shrink-0">
                        {a.Type}
                      </span>
                      <p className="text-sm text-slate-700">{a.Message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CaptureImageModal({ capture, onClose }) {
  const [rotation, setRotation] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const rotateBy = (delta) => setRotation((r) => r + delta);

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-base font-bold text-slate-900">Photo Capture</h3>
            <span className="font-mono text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md truncate">
              {capture.capture_job_id}
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative flex-1 bg-slate-50 p-4 flex items-center justify-center overflow-hidden min-h-[320px]">
          {capture.image_url && !imgError ? (
            <img
              src={capture.image_url}
              alt="Captured photo"
              style={{ transform: `rotate(${rotation}deg)`, transition: "transform 250ms ease" }}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
              </svg>
              <p className="text-sm">Image not available</p>
            </div>
          )}
        </div>

        {capture.image_url && !imgError && (
          <div className="flex gap-2 p-3 border-t border-slate-100 justify-center bg-white">
            <button
              onClick={() => rotateBy(-90)}
              title="Rotate left"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              Rotate Left
            </button>
            <button
              onClick={() => rotateBy(90)}
              title="Rotate right"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
              </svg>
              Rotate Right
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversation Intelligence (audio recording + AI audit report)
// ---------------------------------------------------------------------------

function externalBase() {
  const raw = process.env.NEXT_PUBLIC_URL_ext || "";
  return raw.replace(/\/+$/, "");
}

function buildAudioHref(audioUrl) {
  if (!audioUrl) return null;
  if (audioUrl.startsWith("http")) return audioUrl;
  return `${externalBase()}${audioUrl}`;
}

function auditStatusInfo(audit, rec) {
  if (audit?.status === "analysis_completed") return { label: "Analysis completed", cls: "bg-emerald-100 text-emerald-700" };
  if (audit?.status?.includes("error")) return { label: "Analysis error", cls: "bg-rose-100 text-rose-700" };
  if (audit) return { label: "Analysis pending", cls: "bg-amber-100 text-amber-700" };
  if (rec?.status === "failed") return { label: "Recording failed", cls: "bg-rose-100 text-rose-700" };
  if (rec?.has_audio) return { label: "Audio available", cls: "bg-emerald-100 text-emerald-700" };
  return { label: rec?.status || "-", cls: "bg-slate-100 text-slate-600" };
}

function FloatStars({ rating }) {
  const rounded = Math.round(rating);
  return (
    <div className="mt-1 flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} className={`w-4 h-4 ${i < rounded ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.158c.969 0 1.371 1.24.588 1.81l-3.364 2.444a1 1 0 00-.364 1.118l1.286 3.955c.3.922-.755 1.688-1.539 1.118L10 14.347l-3.362 2.443c-.784.57-1.838-.196-1.539-1.118l1.286-3.955a1 1 0 00-.364-1.118L2.657 8.155c-.783-.57-.38-1.81.588-1.81h4.158a1 1 0 00.95-.69l1.286-3.955z" />
        </svg>
      ))}
    </div>
  );
}

// --- AI report rendering (ported from admin ConversationReport) ---

const REPORT_HEADER_RE = /^([A-Z0-9][A-Z0-9 ,/&()'’.\-]{2,}?):\s*(.*)$/;
const REPORT_KEYWORD_RE = /(✓|✗|CRITICAL MISS|NOT COMPLETED|NOT APPLICABLE|PARTIALLY MISSED|PARTIALLY MISS|MISSED|CRITICAL|PARTIALLY)/g;
const REPORT_BADGE_RE = /^(CRITICAL MISS|NOT COMPLETED|NOT APPLICABLE|PARTIALLY MISSED|PARTIALLY MISS|MISSED|CRITICAL|PARTIALLY)$/;

function isMajorHeader(head) {
  const letters = head.replace(/[^A-Za-z]/g, "");
  return letters.length >= 3 && head === head.toUpperCase();
}

function parseReport(report) {
  const lines = report.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = { title: null, body: [] };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const match = line.match(REPORT_HEADER_RE);
    if (match && isMajorHeader(match[1])) {
      if (current.title !== null || current.body.length) sections.push(current);
      current = { title: match[1].trim(), body: [] };
      if (match[2] && match[2].trim()) current.body.push(match[2].trim());
      continue;
    }
    current.body.push(line);
  }
  if (current.title !== null || current.body.length) sections.push(current);
  return sections;
}

function renderReportInline(text, keyBase) {
  return text.split(REPORT_KEYWORD_RE).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part === "✓") return <span key={key} className="text-emerald-600 font-semibold">✓</span>;
    if (part === "✗") return <span key={key} className="text-rose-600 font-semibold">✗</span>;
    if (REPORT_BADGE_RE.test(part)) {
      const soft = part.includes("PARTIALLY") || part === "NOT APPLICABLE";
      const tone = soft ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-700";
      return (
        <span key={key} className={`mx-0.5 rounded px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tone}`}>
          {part}
        </span>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

function ReportLine({ line, keyBase }) {
  const trimmed = line.trim();
  if (!trimmed) return <div className="h-1.5" />;

  const isSubHeader = /^[A-Za-z][^:]*:$/.test(trimmed) && !/^\d/.test(trimmed) && trimmed.length < 80;
  if (isSubHeader) return <p className="mt-2 font-semibold text-slate-900">{trimmed}</p>;

  const numbered = trimmed.match(/^(\d+)\.\s+(.*)$/);
  if (numbered) {
    return (
      <div className="flex gap-2 pl-1">
        <span className="text-slate-400 tabular-nums">{numbered[1]}.</span>
        <span className="flex-1">{renderReportInline(numbered[2], keyBase)}</span>
      </div>
    );
  }

  const bullet = trimmed.match(/^[-•]\s+(.*)$/);
  if (bullet) {
    return (
      <div className="flex gap-2 pl-1">
        <span className="text-slate-400">•</span>
        <span className="flex-1">{renderReportInline(bullet[1], keyBase)}</span>
      </div>
    );
  }

  return <p className="leading-relaxed">{renderReportInline(trimmed, keyBase)}</p>;
}

function ConversationReport({ report }) {
  const sections = useMemo(() => parseReport(report), [report]);
  if (!sections.length) {
    return <p className="whitespace-pre-wrap text-sm text-slate-700">{report}</p>;
  }
  return (
    <div className="space-y-5">
      {sections.map((section, si) => (
        <div key={si}>
          {section.title && (
            <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-900">{section.title}</h4>
          )}
          <div className="space-y-1.5 text-sm text-slate-700">
            {section.body.map((line, li) => (
              <ReportLine key={li} line={line} keyBase={`${si}-${li}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function extractTranscript(raw) {
  if (!raw) return null;
  const collect = (arr) =>
    arr
      .map((x) => {
        const o = x || {};
        return {
          speaker: o.speaker ?? o.speaker_role ?? o.diarization_speaker ?? o.role,
          text: o.transcript ?? o.text ?? "",
        };
      })
      .filter((s) => s.text);

  if (Array.isArray(raw)) {
    const segs = collect(raw);
    return segs.length ? segs : null;
  }
  if (typeof raw === "object") {
    const alt = raw?.results?.channels?.[0]?.alternatives?.[0];
    if (alt?.transcript) return [{ text: alt.transcript }];
    if (Array.isArray(raw.segments)) {
      const segs = collect(raw.segments);
      return segs.length ? segs : null;
    }
  }
  return null;
}

function AuditEmpty({ text }) {
  return <p className="py-10 text-center text-sm text-slate-400">{text}</p>;
}

function JsonBlock({ data, emptyText }) {
  const isEmpty = data == null || (typeof data === "object" && Object.keys(data).length === 0);
  if (isEmpty) return <AuditEmpty text={emptyText} />;
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-slate-100 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function AuditInfoRow({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function RecordingInfo({ rec, audit }) {
  if (!rec) return <AuditEmpty text="No recording info available" />;
  const rows = [
    ["Session ID", <span key="sid" className="font-mono text-xs">{rec.session_id}</span>],
    ["Device ID", <span key="did" className="font-mono text-xs">{rec.device_id}</span>],
    ["Recording status", rec.status],
    ["Audio available", rec.has_audio ? "Yes" : "No"],
    ["Bytes received", Number(rec.bytes_received || 0).toLocaleString()],
    ["Source IP", rec.source_ip ?? "—"],
    ["Failure reason", rec.failure_reason ?? "—"],
    ["Started", formatUTCWithFlag(rec.started_at)],
    ["Ended", formatUTCWithFlag(rec.ended_at)],
    ["Recording created", formatUTCWithFlag(rec.created_at)],
  ];
  if (audit) {
    rows.push(
      ["Audit status", audit.status],
      ["Audit attempts", String(audit.attempt_count ?? "-")],
      ["Audit error", audit.error_message ?? "—"],
      ["Audit updated", formatUTCWithFlag(audit.updated_at)],
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(([label, value], i) => (
        <AuditInfoRow key={i} label={label} value={value} />
      ))}
    </div>
  );
}

const AUDIT_TABS = [
  { key: "report", label: "Report" },
  { key: "transcript", label: "Transcript" },
  { key: "acoustics", label: "Acoustics" },
  { key: "recording", label: "Recording info" },
  { key: "raw", label: "Raw JSON" },
];

function AuditDetailModal({ sessionId, audit, onClose }) {
  const [activeTab, setActiveTab] = useState("report");
  const [full, setFull] = useState(null);
  const [loadingFull, setLoadingFull] = useState(true);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    const fetchFull = async () => {
      setLoadingFull(true);
      try {
        const token = process.env.NEXT_PUBLIC_EXTERNAL_API_TOKEN;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_URL_ext}api/v1/external/transaction-reports/${encodeURIComponent(sessionId)}/audit`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!cancelled) setFull(res.data);
      } catch {
        if (!cancelled) setFull(null);
      } finally {
        if (!cancelled) setLoadingFull(false);
      }
    };
    fetchFull();
    return () => { cancelled = true; };
  }, [sessionId]);

  const rec = full?.recording ?? audit.recording;
  const a = full?.audit ?? audit.audit;
  const transcript = extractTranscript(a?.transcription);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-4xl h-[88vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-base font-bold text-slate-900">Conversation Audit</h3>
            <span className="font-mono text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md truncate">
              {sessionId}
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 px-5 py-3 border-b border-slate-100 overflow-x-auto">
          {AUDIT_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap transition-colors ${
                activeTab === t.key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {activeTab === "report" && (
            a?.report ? <ConversationReport report={a.report} /> : <AuditEmpty text="No report available" />
          )}
          {activeTab === "transcript" && (
            loadingFull ? <AuditEmpty text="Loading…" /> : transcript ? (
              <div className="space-y-2">
                {transcript.map((s, i) => (
                  <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-sm text-slate-700">
                    {s.speaker && <span className="mr-2 font-semibold text-slate-900">{s.speaker}:</span>}
                    <span>{s.text}</span>
                  </div>
                ))}
              </div>
            ) : <JsonBlock data={a?.transcription} emptyText="No transcript available" />
          )}
          {activeTab === "acoustics" && (
            loadingFull ? <AuditEmpty text="Loading…" /> : <JsonBlock data={a?.acoustic_features} emptyText="No acoustic features available" />
          )}
          {activeTab === "recording" && <RecordingInfo rec={rec} audit={a} />}
          {activeTab === "raw" && (
            loadingFull ? <AuditEmpty text="Loading…" /> : <JsonBlock data={a?.llm_raw} emptyText="No raw analysis available" />
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationAuditSection({ audit, audioUrl, sessionId }) {
  const [open, setOpen] = useState(false);

  if (!audit) return null;
  const rec = audit.recording;
  const a = audit.audit;
  const hasData = rec?.has_audio || !!a?.report || a?.agent_rating != null || !!a?.remark_for_agent;
  if (!hasData) return null;

  const href = buildAudioHref(audioUrl);
  const status = auditStatusInfo(a, rec);
  const linkClass =
    "inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50";

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">Conversation Intelligence</h2>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View full audit
        </button>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Recording</p>
            {href ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in new tab
                </a>
                <a href={href} download={`recording-${sessionId}.webm`} className={linkClass}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No recording available</p>
            )}
            {href && (
              <audio controls preload="none" src={href} className="mt-3 w-full">
                Your browser does not support audio playback.
              </audio>
            )}
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Agent Rating</p>
            {a?.agent_rating != null ? (
              <>
                <div className="text-lg font-bold text-slate-900">
                  {a.agent_rating.toFixed(1)}
                  <span className="ml-1 text-sm font-normal text-slate-400">/ 5</span>
                </div>
                <FloatStars rating={a.agent_rating} />
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Not rated</p>
            )}
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${status.cls}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {a?.remark_for_agent && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Remark for Agent</p>
            <div className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
              {a.remark_for_agent}
            </div>
          </div>
        )}

        {a?.report && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Report</p>
              <button onClick={() => setOpen(true)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View full report
              </button>
            </div>
            <div className="relative max-h-72 overflow-hidden rounded-lg border border-slate-100 p-4">
              <ConversationReport report={a.report} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
            </div>
          </div>
        )}
      </div>

      {open && (
        <AuditDetailModal sessionId={sessionId} audit={audit} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Session Command Events (events log)
// ---------------------------------------------------------------------------

const SESSION_EVENT_CONFIG = {
  receipt: { label: "Print Receipt", cls: "bg-blue-100 text-blue-700" },
  key_dispenser: { label: "Key Dispenser", cls: "bg-purple-100 text-purple-700" },
  show_message: { label: "Show Message", cls: "bg-cyan-100 text-cyan-700" },
  voice_over: { label: "Voice Over", cls: "bg-pink-100 text-pink-700" },
};

const SESSION_EVENT_ACTION_LABELS = {
  printed: "Printed",
  dispense_front: "Dispense to front",
  capture: "Capture",
  recycle: "Recycle",
  displayed: "Displayed",
  played: "Played",
};

function SessionEventDetails({ category, metadata }) {
  const m = metadata && typeof metadata === "object" ? metadata : {};
  if (category === "receipt") {
    const printer = typeof m.printer_name === "string" ? m.printer_name : "";
    const paper = typeof m.paper_type === "string" ? m.paper_type : "";
    const variables = m.variables && typeof m.variables === "object" ? m.variables : null;
    const hasVariables = !!variables && Object.keys(variables).length > 0;
    return (
      <div className="space-y-1">
        {(printer || paper) && (
          <div className="text-xs text-slate-400">
            {[printer && `Printer: ${printer}`, paper && `Paper: ${paper}`].filter(Boolean).join(" · ")}
          </div>
        )}
        {hasVariables && (
          <div className="flex flex-wrap gap-1">
            {Object.entries(variables).map(([k, v]) => (
              <span key={k} className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
                <span className="font-medium mr-1">{k}</span>{String(v)}
              </span>
            ))}
          </div>
        )}
        {!printer && !paper && !hasVariables && <span className="text-slate-400">Receipt printed</span>}
      </div>
    );
  }
  if (category === "show_message" || category === "voice_over") {
    const msg = typeof m.message === "string" ? m.message : typeof m.text === "string" ? m.text : "";
    const lang = typeof m.language === "string" ? m.language : "";
    return (
      <div className="text-sm text-slate-700">
        {msg ? <span className="whitespace-pre-wrap">{msg}</span> : <span className="text-slate-400">—</span>}
        {lang && <span className="ml-2 text-xs text-slate-400">({lang})</span>}
      </div>
    );
  }
  return <span className="text-slate-400">—</span>;
}

function useSessionNeighbors({ deviceId, sessionId, page, status, start, end, enabled }) {
  const [state, setState] = useState({
    prevSessionId: null, prevPage: null,
    nextSessionId: null, nextPage: null,
    position: null, total: null, limit: PAGE_LIMIT,
  });

  useEffect(() => {
    if (!enabled || !deviceId || !sessionId) return;
    let cancelled = false;
    const compute = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_EXTERNAL_API_TOKEN;
        const baseParams = { device_id: deviceId, page, limit: PAGE_LIMIT };
        if (status) baseParams.status = status;
        if (start) baseParams.start = start;
        if (end) baseParams.end = end;
        const url = `${process.env.NEXT_PUBLIC_URL_ext}api/v1/external/transaction-reports`;
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(url, { headers, params: baseParams });
        if (cancelled) return;
        const list = res.data.data || [];
        const total = res.data.total || 0;
        const limit = res.data.limit || PAGE_LIMIT;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const idx = list.findIndex((s) => s.session_id === sessionId);

        let prevSessionId = null, prevPage = null, nextSessionId = null, nextPage = null;

        if (idx >= 0) {
          if (idx > 0) {
            prevSessionId = list[idx - 1].session_id;
            prevPage = page;
          } else if (page > 1) {
            try {
              const r = await axios.get(url, { headers, params: { ...baseParams, page: page - 1 } });
              const arr = r.data.data || [];
              if (!cancelled && arr.length > 0) {
                prevSessionId = arr[arr.length - 1].session_id;
                prevPage = page - 1;
              }
            } catch { /* ignore */ }
          }

          if (idx < list.length - 1) {
            nextSessionId = list[idx + 1].session_id;
            nextPage = page;
          } else if (page < totalPages) {
            try {
              const r = await axios.get(url, { headers, params: { ...baseParams, page: page + 1 } });
              const arr = r.data.data || [];
              if (!cancelled && arr.length > 0) {
                nextSessionId = arr[0].session_id;
                nextPage = page + 1;
              }
            } catch { /* ignore */ }
          }
        }

        if (cancelled) return;
        const position = idx >= 0 ? (page - 1) * limit + idx + 1 : null;
        setState({ prevSessionId, prevPage, nextSessionId, nextPage, position, total, limit });
      } catch {
        if (!cancelled) {
          setState({ prevSessionId: null, prevPage: null, nextSessionId: null, nextPage: null, position: null, total: null, limit: PAGE_LIMIT });
        }
      }
    };
    compute();
    return () => { cancelled = true; };
  }, [enabled, deviceId, sessionId, page, status, start, end]);

  return state;
}

function SessionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params?.sessionId ? decodeURIComponent(params.sessionId) : "";

  const deviceId = searchParams.get("device_id") || "";
  const propertyName = searchParams.get("property_name") || "";
  const filterPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const filterStatus = searchParams.get("status") || "";
  const filterStart = searchParams.get("start") || "";
  const filterEnd = searchParams.get("end") || "";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedScanDoc, setSelectedScanDoc] = useState(null);
  const [selectedCapture, setSelectedCapture] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    const fetchDetail = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const externalApiToken = process.env.NEXT_PUBLIC_EXTERNAL_API_TOKEN;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_URL_ext}api/v1/external/transaction-reports/${encodeURIComponent(sessionId)}`,
          { headers: { Authorization: `Bearer ${externalApiToken}` } }
        );
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) {
          const msg = err.response?.data?.error || err.message || "Failed to load session";
          setErrorMsg(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetail();
    return () => { cancelled = true; };
  }, [sessionId]);

  const neighbors = useSessionNeighbors({
    deviceId,
    sessionId,
    page: filterPage,
    status: filterStatus,
    start: filterStart,
    end: filterEnd,
    enabled: Boolean(sessionId && deviceId),
  });

  const buildDetailHref = useCallback((id, p) => {
    const qs = new URLSearchParams();
    if (deviceId) qs.set("device_id", deviceId);
    if (propertyName) qs.set("property_name", propertyName);
    if (filterStatus) qs.set("status", filterStatus);
    if (filterStart) qs.set("start", filterStart);
    if (filterEnd) qs.set("end", filterEnd);
    qs.set("page", String(p));
    return `/customer/transaction-reports/${encodeURIComponent(id)}?${qs.toString()}`;
  }, [deviceId, propertyName, filterStatus, filterStart, filterEnd]);

  const goPrev = useCallback(() => {
    if (neighbors.prevSessionId && neighbors.prevPage != null) {
      router.replace(buildDetailHref(neighbors.prevSessionId, neighbors.prevPage));
    }
  }, [neighbors.prevSessionId, neighbors.prevPage, router, buildDetailHref]);

  const goNext = useCallback(() => {
    if (neighbors.nextSessionId && neighbors.nextPage != null) {
      router.replace(buildDetailHref(neighbors.nextSessionId, neighbors.nextPage));
    }
  }, [neighbors.nextSessionId, neighbors.nextPage, router, buildDetailHref]);

  const backHref = useMemo(() => {
    const qs = new URLSearchParams();
    if (deviceId) qs.set("device_id", deviceId);
    if (propertyName) qs.set("property_name", propertyName);
    if (filterStatus) qs.set("status", filterStatus);
    if (filterStart) qs.set("start", filterStart);
    if (filterEnd) qs.set("end", filterEnd);
    qs.set("page", String(filterPage));
    return `/customer/transaction-reports?${qs.toString()}`;
  }, [deviceId, propertyName, filterStatus, filterStart, filterEnd, filterPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <button
            onClick={() => router.push(backHref)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Transaction Reports
          </button>
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <p className="text-sm text-rose-600">{errorMsg || "Session not found."}</p>
          </div>
        </main>
      </div>
    );
  }

  const { session = {}, guest = {}, rating, cashEvents = [], legalDocSubmissions = [], cameraCaptures = [], guestMessageInputs = [], sessionEvents = [], scannedDocuments = [], audioAudit = null, audio_url = null } = data;
  const hasGuest = Boolean(
    guest && (guest.guest_name || guest.room_no || guest.account_no || guest.currency || Number(guest.deposit_amount) || Number(guest.room_amount))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <button
              onClick={() => router.push(backHref)}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Transaction Reports
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Session Details</h1>
            {propertyName && (
              <p className="text-sm text-slate-500">
                Property: <span className="font-medium text-slate-700">{propertyName}</span>
              </p>
            )}
          </div>
          <RecordNav
            onPrev={goPrev}
            onNext={goNext}
            hasPrev={!!neighbors.prevSessionId}
            hasNext={!!neighbors.nextSessionId}
            position={neighbors.position}
            total={neighbors.total}
          />
        </div>

        <SectionCard title="Session">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <InfoBox label="Session ID" value={<span className="font-mono text-xs">{session.session_id || "-"}</span>} />
            <InfoBox label="Device ID" value={<span className="font-mono text-xs">{session.device_id || "-"}</span>} />
            <InfoBox label="Status" value={<StatusPill status={session.status} />} />
            <InfoBox label="Start Time (UTC)" value={<span className="font-mono text-xs">{formatUTCWithFlag(session.start_time)}</span>} />
            <InfoBox label="End Time (UTC)" value={<span className="font-mono text-xs">{formatUTCWithFlag(session.end_time)}</span>} />
            <InfoBox label="Duration" value={calcDuration(session.start_time, session.end_time)} />
          </div>
        </SectionCard>

        {hasGuest && (
          <SectionCard title="Guest Info">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <InfoBox label="Guest Name" value={guest.guest_name?.trim() || "-"} />
              <InfoBox label="Room No" value={guest.room_no || "-"} />
              <InfoBox label="Account No" value={guest.account_no || "-"} />
              <InfoBox label="Currency" value={guest.currency || "-"} />
              <InfoBox label="Deposit Amount" value={formatDollars(guest.deposit_amount)} />
              <InfoBox label="Room Amount" value={formatDollars(guest.room_amount)} />
            </div>
          </SectionCard>
        )}

        <SectionCard title="Rating">
          <StarRating rating={rating} />
        </SectionCard>

        <ConversationAuditSection audit={audioAudit} audioUrl={audio_url} sessionId={session.session_id || sessionId} />

        <SectionCard title="Cash Events" subtitle="Order: Latest to oldest">
          {cashEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Time <span className="ml-1 text-[10px] font-medium text-slate-400 normal-case">(UTC)</span>
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Event Type</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Denomination</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Currency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cashEvents.map((e) => (
                    <tr key={e.id}>
                      <td className="px-4 py-2.5 text-xs text-slate-700 font-mono">{formatUTC(e.created_at)}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{e.event_source || "-"}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${eventBadgeClass(e.event_type)}`}>
                          {e.event_type || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-slate-700 font-mono">{e.denomination != null ? formatCents(e.denomination) : "-"}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{e.currency || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No cash events for this session</p>
          )}
        </SectionCard>

        {sessionEvents && sessionEvents.length > 0 && (
          <SectionCard title="Session Command Events" subtitle="Order: Latest to oldest">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Time <span className="ml-1 text-[10px] font-medium text-slate-400 normal-case">(UTC)</span>
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Event</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessionEvents.map((e) => (
                    <tr key={e.id}>
                      <td className="px-4 py-2.5 text-xs text-slate-700 font-mono align-top whitespace-nowrap">{formatUTC(e.created_at)}</td>
                      <td className="px-4 py-2.5 align-top">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${SESSION_EVENT_CONFIG[e.event_category]?.cls ?? "bg-slate-100 text-slate-700"}`}>
                          {SESSION_EVENT_CONFIG[e.event_category]?.label ?? e.event_category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-slate-700 align-top">{SESSION_EVENT_ACTION_LABELS[e.event_action] ?? e.event_action}</td>
                      <td className="px-4 py-2.5 align-top">
                        <SessionEventDetails category={e.event_category} metadata={e.metadata} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {guestMessageInputs && guestMessageInputs.length > 0 && (
          <SectionCard title="Guest Messages">
            <div className="space-y-2">
              {guestMessageInputs.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex-1 whitespace-pre-wrap text-sm text-slate-700">{msg.message_string}</div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">{formatUTCWithFlag(msg.created_at)}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {legalDocSubmissions && legalDocSubmissions.length > 0 && (
          <SectionCard title="Legal Documents">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Template</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Submitted <span className="ml-1 text-[10px] font-medium text-slate-400 normal-case">(UTC)</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {legalDocSubmissions.map((d) => (
                    <tr key={d.id}>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{d.template_name || "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          d.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                          d.status === "failed" ? "bg-rose-100 text-rose-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {d.status || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-700 font-mono">{formatUTCWithFlag(d.submitted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {cameraCaptures && cameraCaptures.length > 0 && (
          <SectionCard title="Photo Captures">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Capture Job ID</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Created <span className="ml-1 text-[10px] font-medium text-slate-400 normal-case">(UTC)</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cameraCaptures.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-2.5 text-xs text-slate-700 font-mono">{c.capture_job_id || "-"}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          c.capture_status === "captured" ? "bg-emerald-100 text-emerald-700" :
                          c.capture_status === "error_occurred" ? "bg-rose-100 text-rose-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {c.capture_status || "-"}
                        </span>
                        {c.capture_status === "error_occurred" && c.error_message && (
                          <span className="ml-2 text-[11px] text-rose-600">{c.error_message}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {c.image_url ? (
                          <button
                            onClick={() => setSelectedCapture(c)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-700 font-mono">{formatUTCWithFlag(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {scannedDocuments && scannedDocuments.length > 0 && (
          <SectionCard title="Scanned Documents">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Scan Job ID</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Created <span className="ml-1 text-[10px] font-medium text-slate-400 normal-case">(UTC)</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scannedDocuments.map((doc) => (
                    <tr key={doc.scan_job_id}>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-700">{doc.scan_job_id || "-"}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {doc.scan_type || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${scanStatusClass(doc.scan_status)}`}>
                          {doc.scan_status || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedScanDoc(doc)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-700 font-mono">{formatUTCWithFlag(doc.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </main>

      {selectedScanDoc && (
        <ScanDetailsModal doc={selectedScanDoc} onClose={() => setSelectedScanDoc(null)} />
      )}
      {selectedCapture && (
        <CaptureImageModal capture={selectedCapture} onClose={() => setSelectedCapture(null)} />
      )}
    </div>
  );
}

// export default function SessionDetailPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="w-8 h-8 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
//       </div>
//     }>
//       <SessionDetailContent />
//     </Suspense>
//   );
// }


export default function SessionDetailPage() {
  return (
    <ShellLayout>
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      }>
        <SessionDetailContent />
      </Suspense>
    </ShellLayout>
  );
}
