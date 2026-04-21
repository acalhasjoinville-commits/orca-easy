/**
 * CSV exporter — UTF-8 with BOM, semicolon separator, CRLF line breaks.
 * Designed for Excel BR (which expects ";" and decimal ",").
 * Numeric/date formatting is done by the caller via Intl.
 */

export interface CsvData {
  headers: string[];
  rows: (string | number)[][];
}

function escapeCell(value: string | number): string {
  const str = typeof value === "number" ? String(value) : value ?? "";
  // Quote if contains separator, quote, or newline
  if (/[";\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsvBlob({ headers, rows }: CsvData): Blob {
  const lines: string[] = [];
  lines.push(headers.map(escapeCell).join(";"));
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(";"));
  }
  // BOM so Excel BR detects UTF-8
  const content = "\uFEFF" + lines.join("\r\n");
  return new Blob([content], { type: "text/csv;charset=utf-8" });
}

export function downloadCsv(filename: string, data: CsvData): void {
  const blob = buildCsvBlob(data);
  triggerBlobDownload(filename, blob);
}

export function triggerBlobDownload(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
