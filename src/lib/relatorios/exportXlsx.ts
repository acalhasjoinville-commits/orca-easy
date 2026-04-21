/**
 * XLSX exporter — thin wrapper around SheetJS.
 * Library is loaded via dynamic import so it never enters the home bundle.
 */

export interface XlsxSheet {
  name: string;
  /** Row 0 is treated as the header row. */
  data: (string | number)[][];
}

export async function downloadXlsx(filename: string, sheets: XlsxSheet[]): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(sheet.data);
    // Reasonable default column widths based on header length
    if (sheet.data[0]) {
      ws["!cols"] = sheet.data[0].map((h) => ({
        wch: Math.max(12, Math.min(40, String(h).length + 4)),
      }));
    }
    const safeName = sheet.name.slice(0, 31).replace(/[\\/?*[\]:]/g, "_");
    XLSX.utils.book_append_sheet(wb, ws, safeName);
  }
  XLSX.writeFile(wb, filename);
}
