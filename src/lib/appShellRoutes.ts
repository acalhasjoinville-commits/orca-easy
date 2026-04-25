import { matchPath } from "react-router-dom";

import type { Tab } from "@/components/AppSidebar";

export interface ResolvedAppShellRoute {
  tab: Tab;
  orcamentoId: string | null;
  isEditingOrcamento: boolean;
}

const PRIMARY_TAB_PATHS: Record<Exclude<Tab, "orcamento-detalhes" | "orcamento-novo">, string> = {
  dashboard: "/dashboard",
  agenda: "/agenda",
  orcamentos: "/orcamentos",
  clientes: "/clientes",
  financeiro: "/financeiro",
  relatorios: "/relatorios",
  usuarios: "/usuarios",
  ajuda: "/ajuda",
  config: "/configuracoes",
};

export function getPrimaryPathForTab(tab: Exclude<Tab, "orcamento-detalhes" | "orcamento-novo">) {
  return PRIMARY_TAB_PATHS[tab];
}

export function getOrcamentoNewPath() {
  return "/orcamentos/novo";
}

export function getOrcamentoDetailsPath(orcamentoId: string) {
  return `/orcamentos/${orcamentoId}`;
}

export function getOrcamentoEditPath(orcamentoId: string) {
  return `/orcamentos/${orcamentoId}/editar`;
}

export function getClienteHistoricoPath(clienteId: string) {
  return `/clientes/${clienteId}`;
}

export function getClienteAvulsoHistoricoPath(nomeCliente: string) {
  return `/clientes/avulso/${encodeURIComponent(nomeCliente)}`;
}

export function getPathForTab(tab: Tab) {
  if (tab === "orcamento-detalhes") {
    return PRIMARY_TAB_PATHS.orcamentos;
  }

  if (tab === "orcamento-novo") {
    return getOrcamentoNewPath();
  }

  if (tab === "cliente-historico") {
    return PRIMARY_TAB_PATHS.clientes;
  }

  return getPrimaryPathForTab(tab);
}

export function resolveAppShellRoute(pathname: string): ResolvedAppShellRoute {
  if (pathname === "/" || pathname === "/dashboard") {
    return { tab: "dashboard", orcamentoId: null, isEditingOrcamento: false };
  }

  if (pathname === "/agenda") {
    return { tab: "agenda", orcamentoId: null, isEditingOrcamento: false };
  }

  if (pathname === "/orcamentos") {
    return { tab: "orcamentos", orcamentoId: null, isEditingOrcamento: false };
  }

  if (pathname === "/orcamentos/novo") {
    return { tab: "orcamento-novo", orcamentoId: null, isEditingOrcamento: false };
  }

  const editMatch = matchPath("/orcamentos/:orcamentoId/editar", pathname);
  if (editMatch?.params.orcamentoId) {
    return {
      tab: "orcamento-novo",
      orcamentoId: editMatch.params.orcamentoId,
      isEditingOrcamento: true,
    };
  }

  const detailMatch = matchPath("/orcamentos/:orcamentoId", pathname);
  if (detailMatch?.params.orcamentoId) {
    return {
      tab: "orcamento-detalhes",
      orcamentoId: detailMatch.params.orcamentoId,
      isEditingOrcamento: false,
    };
  }

  if (pathname === "/clientes") {
    return { tab: "clientes", orcamentoId: null, isEditingOrcamento: false };
  }

  // /clientes/avulso/:nome  OR  /clientes/:clienteId
  const clienteAvulsoMatch = matchPath("/clientes/avulso/:nome", pathname);
  if (clienteAvulsoMatch?.params.nome) {
    return { tab: "cliente-historico", orcamentoId: null, isEditingOrcamento: false };
  }
  const clienteDetailMatch = matchPath("/clientes/:clienteId", pathname);
  if (clienteDetailMatch?.params.clienteId) {
    return { tab: "cliente-historico", orcamentoId: null, isEditingOrcamento: false };
  }

  if (pathname === "/financeiro") {
    return { tab: "financeiro", orcamentoId: null, isEditingOrcamento: false };
  }

  if (pathname === "/relatorios") {
    return { tab: "relatorios", orcamentoId: null, isEditingOrcamento: false };
  }

  if (pathname === "/usuarios") {
    return { tab: "usuarios", orcamentoId: null, isEditingOrcamento: false };
  }

  if (pathname === "/ajuda") {
    return { tab: "ajuda", orcamentoId: null, isEditingOrcamento: false };
  }

  if (pathname === "/config" || pathname === "/configuracoes") {
    return { tab: "config", orcamentoId: null, isEditingOrcamento: false };
  }

  return { tab: "dashboard", orcamentoId: null, isEditingOrcamento: false };
}
