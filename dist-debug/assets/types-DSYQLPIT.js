function getCustoUnitario(insumo) {
  return insumo.qtdEmbalagem > 0 ? insumo.precoEmbalagem / insumo.qtdEmbalagem : 0;
}
const CATEGORIAS_DESPESA = [
  "Material",
  "Combustível",
  "Folha / Salário",
  "Aluguel",
  "Ferramentas",
  "Impostos",
  "Serviços de Terceiros",
  "Administrativo",
  "Transporte",
  "Outros"
];
const CATEGORIAS_RECEITA = [
  "Receita Avulsa",
  "Entrada Manual",
  "Ajuste Positivo",
  "Outros"
];
const STATUS_FOLLOWUP_CONFIG = {
  sem_retorno: { label: "Sem retorno", color: "bg-gray-500/15 text-gray-600 border-gray-500/30" },
  agendado: { label: "Agendado", color: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  em_negociacao: { label: "Em negociação", color: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  aguardando_cliente: { label: "Aguardando cliente", color: "bg-purple-500/15 text-purple-700 border-purple-500/30" },
  concluido: { label: "Concluído", color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" }
};
const TIPO_INTERACAO_CONFIG = {
  contato: { label: "Contato realizado" },
  retorno_agendado: { label: "Retorno agendado" },
  negociacao: { label: "Negociação" },
  cliente_sem_resposta: { label: "Cliente sem resposta" },
  aprovado: { label: "Aprovado" },
  encerrado: { label: "Encerrado" },
  observacao: { label: "Observação" }
};
export {
  CATEGORIAS_RECEITA as C,
  STATUS_FOLLOWUP_CONFIG as S,
  TIPO_INTERACAO_CONFIG as T,
  CATEGORIAS_DESPESA as a,
  getCustoUnitario as g
};
