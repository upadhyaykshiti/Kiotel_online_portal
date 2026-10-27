"use client";

/**
 * Converts our DB storage format ↔ Univer IWorkbookData snapshot format.
 *
 * DB storage shape:
 * {
 *   version: 1,
 *   workbook: <IWorkbookData>   ← full Univer snapshot stored here
 * }
 *
 * On first load (empty sheet), we generate a valid Univer workbook snapshot.
 */

export function makeEmptyWorkbook(sheetId = "sheet1") {
  return {
    id: "workbook-1",
    sheetOrder: [sheetId],
    name: "",
    appVersion: "0.2.0",
    locale: "en-US",
    styles: {},
    sheets: {
      [sheetId]: {
        id: sheetId,
        name: "Sheet1",
        cellData: {},
        rowCount: 100,
        columnCount: 26,
      },
    },
  };
}

/**
 * DB → Univer: extract the IWorkbookData snapshot to pass to univerAPI.createWorkbook()
 */
export function toUniverSnapshot(dbJson) {
  if (!dbJson) return makeEmptyWorkbook();
  // New format: { version, workbook }
  if (dbJson.workbook) return dbJson.workbook;
  // Old format fallback (plain cells from previous custom grid)
  return makeEmptyWorkbook();
}

/**
 * Univer → DB: wrap the IWorkbookData snapshot for storage
 */
export function fromUniverSnapshot(workbookData) {
  if (!workbookData) return { version: 2, workbook: makeEmptyWorkbook() };
  return { version: 2, workbook: workbookData };
}