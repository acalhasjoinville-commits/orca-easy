

# Relatórios & Exportações — Módulo robusto e isolado

## Princípio fundamental

Este módulo é **somente leitura**. Nada de tocar em `calcEngine`, `calcServicoAvulso`, snapshots, RLS, schema do banco ou marcos de data. Apenas reaproveita os dados que já vêm dos hooks existentes (`useOrcamentos`, `useLancamentos`, `useClientes`) e gera artefatos (tela visual, PDF, CSV, XLSX).

Toda regra de "o que conta como receita/lucro" segue **exatamente** as mesmas regras do módulo Financeiro:
- Faturamento/lucro/margem só consideram orçamentos `aprovado` ou `executado`.
- Custo usa `custoConhecido ?? custoTotalObra`, **ignorando** itens `custoIncompleto`.
- Quando há item incompleto no recorte, lucro/margem aparecem como "parcial" (igual ao Financeiro hoje).
- Datas via `toLocalDateStr` para não quebrar com fuso.

## Arquitetura

```text
src/
├── components/
│   └── Relatorios.tsx                    ← tela principal (tabs)
├── lib/
│   └── relatorios/
│       ├── aggregations.ts               ← funções puras de agregação (testáveis)
│       ├── exportCsv.ts                  ← serializador CSV (sem lib externa)
│       ├── exportXlsx.ts                 ← wrapper sobre lib XLSX
│       └── pdf/
│           ├── RelatorioVendasPDF.tsx    ← @react-pdf/renderer
│           ├── RelatorioFinanceiroPDF.tsx
│           └── shared.ts                 ← estilos/cores reutilizadas do OrcamentoPDF
└── hooks/
    └── useRelatorios.ts                  ← seleção de período + memos centralizados
```

## Acesso e navegação

- Nova rota `/relatorios` (registrada em `src/lib/appShellRoutes.ts` e novo case em `Index.tsx`).
- Novo `Tab` `"relatorios"` em `AppSidebar` (seção Operação, abaixo de Financeiro).
- Permissão: **mesma do Financeiro** (`canViewFinanceiro` → admin + financeiro). Sem permissão → `AccessDenied`.
- No mobile, entra na sheet "Mais" do `MobileBottomNav`.
- Ícone: `BarChart3` ou `FileBarChart` (lucide).

## Telas / Tabs

A página `Relatorios.tsx` tem barra de filtros global (período + intervalo customizado + escopo) e 4 abas:

### Aba 1 — Vendas
- KPIs: Faturamento (aprovado+executado), Custo conhecido, Lucro bruto, Margem média, Ticket médio, Conversão (aprovados ÷ aprovados+rejeitados).
- Gráfico mensal Receita vs Custo (12 meses).
- Tabela: orçamentos do período com colunas Nº · Data · Cliente · Status · Valor · Custo · Lucro · Margem.
- Quando algum item é `custoIncompleto`, badge "parcial" e KPIs marcados.

### Aba 2 — Clientes (Curva ABC)
- Lista de clientes ordenada por faturamento no período (somente aprovado+executado).
- Colunas: Cliente · Nº orçamentos · Faturamento · % do total · Classe (A ≥80% acumulado, B 80–95%, C >95%) · Ticket médio.
- Top 10 em destaque visual.

### Aba 3 — Serviços
- Agregação por `nomeServico` somando `valorVenda` e `custoConhecido` dos `itensServico` (do mesmo recorte de aprovado+executado).
- Colunas: Serviço · Quantidade vendida · Receita · Custo · Lucro · Margem média.
- Gráfico de barras top 10 serviços por receita.

### Aba 4 — Financeiro (DRE simplificado)
- Receita executada (orçamentos `executado` no período via `dataExecucao`) + receitas manuais (`lancamentos_financeiros` tipo `receita`).
- Despesas: somente `lancamentos_financeiros` tipo `despesa`, agrupadas por categoria.
- Resultado mensal: Receita − Despesas (lança a barra positivo/negativo).
- Tabela DRE: linhas por categoria, colunas por mês (últimos 6 meses), totalizadores.
- Faturado vs Recebido no mês (via `dataFaturamento` e `dataPagamento`).

## Filtros globais (topo)

- **Período**: Mês atual · Últimos 3 meses · Ano atual · Personalizado (date range).
- **Intervalo personalizado**: dois inputs `type="date"` (start/end), só aparecem com "Personalizado".
- **Cliente** (combobox opcional, filtra abas Vendas/Serviços).
- Estado dos filtros persistido em `sessionStorage` por usuário, igual ao padrão do Financeiro.

## Exportações

Cada aba terá um botão **"Exportar"** com dropdown:
- **PDF** — relatório formatado, A4 paisagem, com header da empresa (logo, nome, cor primária, igual ao OrcamentoPDF). Inclui período do recorte, tabela e KPIs.
- **CSV** — UTF-8 com BOM (Excel BR abre certo), separador `;`, decimal `,`, datas `dd/mm/aaaa`.
- **XLSX** — uma planilha por seção (Resumo, Detalhe), com formatação numérica e cabeçalho fixo.

Nome do arquivo padrão: `relatorio-{aba}-{empresa-slug}-{aaaa-mm-dd}.{ext}`.

## Dependências novas

Apenas **uma**, leve e estável:
- `xlsx` (`xlsx@0.18.5`, ~600 KB) — gera XLSX e também CSV. Sem `file-saver` (uso nativo `URL.createObjectURL` + `<a download>`).

PDF e gráficos reutilizam `@react-pdf/renderer` e `recharts` que já estão no projeto. Zero risco de conflito de versões.

## Detalhamento técnico (para a implementação)

### `lib/relatorios/aggregations.ts` — funções puras

Contrato — todas recebem `Orcamento[]` (ou `LancamentoFinanceiro[]`) e `{ start: Date; end: Date }`, retornam objetos imutáveis. Toda lógica de "custo conhecido" centralizada em **um helper** privado:

```ts
// helper único, espelha exatamente Financeiro.tsx hoje
function knownCost(orc: Orcamento): { value: number; partial: boolean } {
  const partial = orc.itensServico.some(i => i.custoIncompleto === true);
  const value = orc.itensServico.reduce((s, i) => 
    i.custoIncompleto ? s : s + (i.custoConhecido ?? i.custoTotalObra), 0);
  return { value, partial };
}

const VALID_FOR_PROFIT = ["aprovado", "executado"] as const;
```

Funções expostas:
- `aggregateVendas(orcs, range)` → KPIs + série mensal.
- `aggregateClientesABC(orcs, range)` → lista classificada A/B/C.
- `aggregateServicos(orcs, range)` → agregação por nome de serviço.
- `aggregateDRE(orcs, lancamentos, range)` → receita executada + receitas manuais − despesas por categoria/mês.

Todas essas funções terão **testes unitários** em `src/test/relatorios.test.ts` cobrindo:
- Recorte de período correto.
- Item `custoIncompleto` não inflando lucro.
- Status fora de `aprovado/executado` ignorado.
- Clientes sem orçamento no período não aparecem.
- Soma por categoria conferindo com soma total.

### `lib/relatorios/exportCsv.ts`

Sem lib externa. Recebe `{ headers: string[]; rows: (string|number)[][] }`. Escapa aspas, usa `;` separador, `\r\n` quebra, BOM `\uFEFF` no início. Datas e moedas formatadas no caller via `Intl`.

### `lib/relatorios/exportXlsx.ts`

Wrapper fino sobre `xlsx`:
```ts
export function downloadXlsx(filename: string, sheets: { name: string; data: any[][] }[]) {
  // SheetJS aoa_to_sheet por aba + book_new + writeFile
}
```

### `lib/relatorios/pdf/shared.ts`

Reusa as cores e tipografia do `OrcamentoPDF`:
- Header com logo+nome (chama `fetchLogoBase64` igual hoje).
- `corPrimaria`/`corDestaque` da `useEmpresa()`.
- Título "Relatório de Vendas — Período: dd/mm/aaaa a dd/mm/aaaa".
- Rodapé com data de emissão.

### `useRelatorios.ts`

Hook único que centraliza:
- Estado do filtro (período, range custom, cliente).
- Memos de cada agregação (recalcula só quando `orcamentos`/`lancamentos`/filtros mudam).
- Persistência em `sessionStorage`.

Isso garante que os 4 export buttons usem **exatamente** o mesmo recorte mostrado na tela. Sem chance de "PDF mostrar número diferente da tela".

### Mudanças nos arquivos existentes (mínimas)

- `src/components/AppSidebar.tsx`: adicionar `Tab` `"relatorios"` no tipo, item no `operationItems` com `permission: "canViewFinanceiro"`.
- `src/lib/appShellRoutes.ts`: registrar rota `/relatorios`.
- `src/pages/Index.tsx`: lazy import + case no `content` + entrada em `getHeaderMeta`.
- `src/components/MobileBottomNav.tsx`: adicionar em `secondaryItems` quando `canViewFinanceiro`.

Nenhum outro arquivo é tocado. **Calcs intactos.**

## Riscos endereçados

| Risco | Mitigação |
|---|---|
| Quebrar lógica de cálculo | Módulo só lê. Não importa nada de `calcEngine` nem altera tipos. |
| Divergência tela vs export | Todos consomem o mesmo `useRelatorios`. |
| Off-by-one de timezone | Uso obrigatório de `toLocalDateStr` para qualquer data exibida/exportada. |
| Custo zero "fantasma" inflando margem | Helper `knownCost` único, espelha Financeiro, marca "parcial". |
| Vazamento entre empresas | Hooks já filtram por RLS + `.eq("empresa_id", ...)` implícito. |
| Performance com muitos orçamentos | Agregações `useMemo`. PDF/Excel só montados sob demanda no clique do botão. |
| Lib XLSX pesada na home | `xlsx` carregado via `import()` dinâmico só quando o usuário clica em "Exportar XLSX". |

## Entregáveis

1. Página `Relatorios` acessível por sidebar + mobile (apenas `admin`/`financeiro`).
2. 4 abas funcionais com KPIs, gráficos e tabelas.
3. Filtros (período pré-definido, custom, cliente) persistidos.
4. Export PDF/CSV/XLSX em cada aba, com mesmo recorte da tela.
5. Suite de testes em `aggregations.ts`.
6. Zero alteração em código de cálculo, schema, snapshots ou lógica financeira existente.

## Fora de escopo (intencional)

- Agendamento de envio por e-mail (sugestão futura).
- Comparações YoY/MoM (sugestão futura).
- Relatórios cruzando retornos de garantia ou visitas (pode entrar em uma v2).
- Qualquer alteração em RLS, edge functions ou tabelas.

