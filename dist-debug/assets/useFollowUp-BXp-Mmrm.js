import { c as createLucideIcon, u as useAuth, s as supabase } from "./index-BN5a_yey.js";
import { u as useQueryClient, a as useQuery, b as useMutation } from "./query-vendor-BLvK6anV.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const MessageCircle = createLucideIcon("MessageCircle", [
  ["path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z", key: "vv11sd" }]
]);
function dbToFollowUp(row) {
  return {
    id: row.id,
    orcamentoId: row.orcamento_id,
    empresaId: row.empresa_id,
    statusFollowUp: row.status_followup,
    proximaAcao: row.proxima_acao || "",
    dataRetorno: row.data_retorno ?? null,
    responsavelId: row.responsavel_id ?? null,
    responsavelNome: row.responsavel_nome || "",
    ultimaInteracaoEm: row.ultima_interacao_em ?? null,
    observacoes: row.observacoes || ""
  };
}
function dbToLog(row) {
  return {
    id: row.id,
    orcamentoId: row.orcamento_id,
    empresaId: row.empresa_id,
    userId: row.user_id,
    userName: row.user_name || "",
    tipo: row.tipo,
    descricao: row.descricao || "",
    createdAt: row.created_at
  };
}
function defaultFollowUp(orcamentoId, empresaId) {
  return {
    id: "",
    orcamentoId,
    empresaId,
    statusFollowUp: "sem_retorno",
    proximaAcao: "",
    dataRetorno: null,
    responsavelId: null,
    responsavelNome: "",
    ultimaInteracaoEm: null,
    observacoes: ""
  };
}
function useFollowUp(orcamentoId) {
  const qc = useQueryClient();
  const { empresaId, user } = useAuth();
  const query = useQuery({
    queryKey: ["followup", orcamentoId],
    queryFn: async () => {
      const { data, error } = await supabase.from("orcamento_followups").select("*").eq("orcamento_id", orcamentoId).maybeSingle();
      if (error) throw error;
      if (data) return dbToFollowUp(data);
      return defaultFollowUp(orcamentoId, empresaId || "");
    },
    enabled: !!orcamentoId
  });
  const upsertFollowUp = useMutation({
    mutationFn: async (updates) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const payload = {
        orcamento_id: orcamentoId,
        empresa_id: empresaId,
        status_followup: updates.statusFollowUp ?? "sem_retorno",
        proxima_acao: updates.proximaAcao ?? "",
        data_retorno: updates.dataRetorno ?? null,
        responsavel_id: updates.responsavelId ?? null,
        observacoes: updates.observacoes ?? ""
      };
      const { error } = await supabase.from("orcamento_followups").upsert(payload, { onConflict: "orcamento_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["followup", orcamentoId] });
      qc.invalidateQueries({ queryKey: ["fila-comercial"] });
    }
  });
  const logsQuery = useQuery({
    queryKey: ["followup-logs", orcamentoId],
    queryFn: async () => {
      const { data, error } = await supabase.from("orcamento_followup_logs").select("*").eq("orcamento_id", orcamentoId).order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToLog);
    },
    enabled: !!orcamentoId
  });
  const addLog = useMutation({
    mutationFn: async (input) => {
      var _a;
      if (!empresaId || !user) throw new Error("Empresa/usuário não vinculado");
      const { error } = await supabase.from("orcamento_followup_logs").insert({
        orcamento_id: orcamentoId,
        empresa_id: empresaId,
        user_id: user.id,
        user_name: ((_a = user.user_metadata) == null ? void 0 : _a.full_name) || user.email || "",
        tipo: input.tipo,
        descricao: input.descricao
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["followup-logs", orcamentoId] });
      qc.invalidateQueries({ queryKey: ["followup", orcamentoId] });
      qc.invalidateQueries({ queryKey: ["fila-comercial"] });
    }
  });
  return {
    followUp: query.data ?? defaultFollowUp(orcamentoId, empresaId || ""),
    isLoading: query.isLoading,
    upsertFollowUp,
    logs: logsQuery.data ?? [],
    logsLoading: logsQuery.isLoading,
    addLog
  };
}
function useTeamMembers() {
  const { empresaId } = useAuth();
  return useQuery({
    queryKey: ["team-members", empresaId],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name, email").eq("empresa_id", empresaId);
      if (error) throw error;
      return (data || []).map((p) => ({
        id: p.id,
        name: p.full_name || p.email || "Sem nome"
      }));
    },
    enabled: !!empresaId
  });
}
function useFilaComercial() {
  const { empresaId } = useAuth();
  return useQuery({
    queryKey: ["fila-comercial"],
    queryFn: async () => {
      const { data: orcs, error: orcErr } = await supabase.from("orcamentos").select("id, numero_orcamento, nome_cliente, valor_final, desconto, valor_venda, status, data_criacao").order("created_at", { ascending: false });
      if (orcErr) throw orcErr;
      const { data: followups, error: fErr } = await supabase.from("orcamento_followups").select("*");
      if (fErr) throw fErr;
      const fMap = /* @__PURE__ */ new Map();
      for (const f of followups || []) {
        fMap.set(f.orcamento_id, f);
      }
      const items = (orcs || []).map((o) => {
        const f = fMap.get(o.id);
        const displayValue = (o.desconto ?? 0) > 0 ? o.valor_final ?? o.valor_venda : o.valor_venda;
        return {
          orcamentoId: o.id,
          numeroOrcamento: o.numero_orcamento,
          nomeCliente: o.nome_cliente,
          valorFinal: Number(displayValue),
          statusOrcamento: o.status,
          dataCriacao: o.data_criacao,
          statusFollowUp: (f == null ? void 0 : f.status_followup) ?? "sem_retorno",
          proximaAcao: (f == null ? void 0 : f.proxima_acao) || "",
          dataRetorno: (f == null ? void 0 : f.data_retorno) ?? null,
          responsavelNome: (f == null ? void 0 : f.responsavel_nome) || "",
          ultimaInteracaoEm: (f == null ? void 0 : f.ultima_interacao_em) ?? null
        };
      });
      return items;
    },
    enabled: !!empresaId
  });
}
export {
  MessageCircle as M,
  useFollowUp as a,
  useTeamMembers as b,
  useFilaComercial as u
};
