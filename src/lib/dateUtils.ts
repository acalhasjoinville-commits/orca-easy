/**
 * Shared date utilities for safe local-timezone comparisons.
 * Used by usePendencias, Agenda, and other modules that classify dates
 * relative to "today".
 */

/** Convert a date string to YYYY-MM-DD in the user's local timezone. */
export function toLocalDateStr(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;

  // Already a plain date string — use as-is (no UTC shift risk)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Today as YYYY-MM-DD in local timezone. */
export function getTodayLocal(): string {
  return toLocalDateStr(new Date().toISOString()) as string;
}

/** Add N days to today and return YYYY-MM-DD local. */
export function addDaysLocal(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toLocalDateStr(d.toISOString()) as string;
}

/** Format YYYY-MM-DD to a human-friendly label relative to today. */
export function formatDateLabel(dateStr: string, hoje: string, amanha: string): string {
  if (dateStr === hoje) return "Hoje";
  if (dateStr === amanha) return "Amanhã";

  // Parse the date string as local
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "short" });
  const dayMonth = date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dayMonth}`;
}
