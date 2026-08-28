"use client";

import { useEffect, useRef } from "react";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import UniverPresetSheetsCoreEnUS from "@univerjs/preset-sheets-core/locales/en-US";
import "@univerjs/preset-sheets-core/lib/index.css";

/**
 * UniverSheet component
 *
 * Props:
 *   initialSnapshot  — IWorkbookData from toUniverSnapshot()
 *   onSave(snapshot) — called with latest IWorkbookData whenever content changes (debounced by parent)
 *   readOnly         — disables editing
 *   onApiReady(api)  — exposes univerAPI to parent if needed
 */
export default function UniverSheet({ initialSnapshot, onSave, readOnly, onApiReady }) {
  const containerRef = useRef(null);
  const univerAPIRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(UniverPresetSheetsCoreEnUS),
      },
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
        }),
      ],
    });

    univerAPIRef.current = univerAPI;

    // Load existing or empty workbook
    const workbook = univerAPI.createWorkbook(initialSnapshot || {});

    if (onApiReady) onApiReady(univerAPI);

    // Listen for any change and call onSave
    if (!readOnly && onSave) {
      const disposable = univerAPI.addEvent(
        univerAPI.Event.WorkbookDisposed,
        () => {}
      );

      // Poll save via command hook — most reliable approach for autosave
      const handler = univerAPI.onCommandExecuted(() => {
        const snapshot = workbook.save();
        onSave(snapshot);
      });

      return () => {
        handler?.dispose?.();
        disposable?.dispose?.();
        univerAPI.dispose();
      };
    }

    return () => {
      univerAPI.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only mount once

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}