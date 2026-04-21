/**
 * Formatting helpers used both on screen and in exported artifacts.
 * Keeping them centralized prevents the screen and the export from diverging.
 */

export const fmtMoney = (v: number): string =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtNumber = (v: number, digits = 2): string =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtPct = (v: number, digits = 1): string => `${v.toFixed(digits)}%`;

export const fmtDateBR = (yyyymmdd: string): string => {
  if (!yyyymmdd || !/^\d{4}-\d{2}-\d{2}$/.test(yyyymmdd)) return yyyymmdd;
  const [y, m, d] = yyyymmdd.split("-");
  return `${d}/${m}/${y}`;
};

export const slugify = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "empresa";

export const todayStamp = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const statusLabel: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  executado: "Executado",
  cancelado: "Cancelado",
};
