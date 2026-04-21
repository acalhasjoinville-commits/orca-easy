import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useOrcamentos } from "@/hooks/useSupabaseData";
import { useLancamentos } from "@/hooks/useLancamentos";
import {
  aggregateClientesABC,
  aggregateDRE,
  aggregateServicos,
  aggregateVendas,
  type DateRange,
} from "@/lib/relatorios/aggregations";
import { fmtDateBR } from "@/lib/relatorios/format";

export type PeriodPreset = "month" | "3months" | "year" | "custom";

export interface RelatoriosFilters {
  preset: PeriodPreset;
  customStart: string; // YYYY-MM-DD
  customEnd: string; // YYYY-MM-DD
  clienteId: string; // "" = all
}

const STORAGE_KEY = "orcacalhas:relatorios-filters:v1";

const todayLocalStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function defaultFilters(): RelatoriosFilters {
  return {
    preset: "month",
    customStart: todayLocalStr(),
    customEnd: todayLocalStr(),
    clienteId: "",
  };
}

function readStoredFilters(userId: string | undefined): RelatoriosFilters {
  if (!userId) return defaultFilters();
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY}:${userId}`);
    if (!raw) return defaultFilters();
    const parsed = JSON.parse(raw) as Partial<RelatoriosFilters>;
    return {
      preset:
        parsed.preset === "month" ||
        parsed.preset === "3months" ||
        parsed.preset === "year" ||
        parsed.preset === "custom"
          ? parsed.preset
          : "month",
      customStart: typeof parsed.customStart === "string" ? parsed.customStart : todayLocalStr(),
      customEnd: typeof parsed.customEnd === "string" ? parsed.customEnd : todayLocalStr(),
      clienteId: typeof parsed.clienteId === "string" ? parsed.clienteId : "",
    };
  } catch {
    return defaultFilters();
  }
}

function rangeFromFilters(f: RelatoriosFilters): DateRange {
  const now = new Date();
  if (f.preset === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  }
  if (f.preset === "3months") {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  }
  if (f.preset === "year") {
    return {
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
    };
  }
  // custom
  const [sy, sm, sd] = f.customStart.split("-").map(Number);
  const [ey, em, ed] = f.customEnd.split("-").map(Number);
  const start = sy && sm && sd ? new Date(sy, sm - 1, sd) : new Date(now.getFullYear(), now.getMonth(), 1);
  const end = ey && em && ed ? new Date(ey, em - 1, ed, 23, 59, 59) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
  // Guard: if start > end, swap
  if (start > end) return { start: end, end: start };
  return { start, end };
}

function periodoLabelFromRange(range: DateRange): string {
  const toStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `${fmtDateBR(toStr(range.start))} a ${fmtDateBR(toStr(range.end))}`;
}

export function useRelatorios() {
  const { user } = useAuth();
  const { orcamentos, isLoading: orcLoading } = useOrcamentos();
  const { lancamentos, isLoading: lancLoading } = useLancamentos();

  const [filters, setFilters] = useState<RelatoriosFilters>(() => readStoredFilters(user?.id));

  // Re-hydrate when user changes (initial render may happen before auth resolves)
  useEffect(() => {
    if (!user?.id) return;
    setFilters(readStoredFilters(user.id));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    try {
      sessionStorage.setItem(`${STORAGE_KEY}:${user.id}`, JSON.stringify(filters));
    } catch {
      // ignore storage errors
    }
  }, [filters, user?.id]);

  const range = useMemo(() => rangeFromFilters(filters), [filters]);
  const periodoLabel = useMemo(() => periodoLabelFromRange(range), [range]);

  const filteredOrcamentos = useMemo(() => {
    if (!filters.clienteId) return orcamentos;
    return orcamentos.filter((o) => o.clienteId === filters.clienteId);
  }, [orcamentos, filters.clienteId]);

  const vendas = useMemo(() => aggregateVendas(filteredOrcamentos, range), [filteredOrcamentos, range]);
  const clientes = useMemo(() => aggregateClientesABC(orcamentos, range), [orcamentos, range]);
  const servicos = useMemo(() => aggregateServicos(filteredOrcamentos, range), [filteredOrcamentos, range]);
  const dre = useMemo(() => aggregateDRE(orcamentos, lancamentos, range), [orcamentos, lancamentos, range]);

  return {
    filters,
    setFilters,
    range,
    periodoLabel,
    isLoading: orcLoading || lancLoading,
    vendas,
    clientes,
    servicos,
    dre,
  };
}
