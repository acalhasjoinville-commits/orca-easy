

# Auditoria Técnica Completa - OrçaCalhas

---

## 1. Arquitetura e Stack

| Biblioteca | Versao |
|---|---|
| React | ^18.3.1 |
| Vite | ^5.4.19 |
| TypeScript | ^5.8.3 |
| @supabase/supabase-js | ^2.98.0 |
| @react-pdf/renderer | ^4.3.2 |
| @tanstack/react-query | ^5.83.0 |
| react-router-dom | ^6.30.1 |
| Tailwind CSS | ^3.4.17 |
| Shadcn/UI (Radix) | Diversos ^1.x/^2.x |
| recharts | ^2.15.4 |
| zod | ^3.25.76 |
| react-hook-form | ^7.61.1 |

**Padrão de arquitetura:** SPA (Single Page Application) com roteamento client-side. Uma única rota `/` controla tudo via estado de abas (tab state). Sem autenticação implementada.

---

## 2. Estrutura de Pastas e Mapa de Componentes

```text
src/
├── App.tsx                    # Provider wrapper (QueryClient, Router, Toasters)
├── pages/
│   ├── Index.tsx              # Controlador principal de abas (dashboard|orcamento|clientes|config)
│   └── NotFound.tsx           # 404
├── components/
│   ├── BottomNav.tsx          # Navegação inferior mobile (4 abas)
│   ├── NavLink.tsx            # Wrapper do react-router NavLink (NÃO USADO atualmente)
│   ├── Dashboard.tsx          # Lista de orçamentos, busca, duplicar, deletar
│   ├── OrcamentoWizard.tsx    # Wizard 2 fases: seleção cliente → carrinho de serviços
│   ├── AddServicoModal.tsx    # Modal para adicionar item ao orçamento (cálculo em tempo real)
│   ├── Clientes.tsx           # CRUD de clientes com busca
│   ├── ClienteFormModal.tsx   # Formulário PF/PJ com busca CNPJ (BrasilAPI) e CEP (ViaCEP)
│   ├── Configuracoes.tsx      # Tabs: Empresa, Motor1, Motor2, Insumos, Regras, Catálogo, Políticas
│   ├── OrcamentoPDF.tsx       # Template PDF via @react-pdf/renderer
│   └── PDFDownloadButton.tsx  # Botão com Web Share API (mobile) + fallback window.open (desktop)
├── hooks/
│   ├── useSupabaseData.ts     # Hooks CRUD: useClientes, useEmpresa, useOrcamentos, usePoliticas
│   ├── use-mobile.tsx         # Hook de breakpoint mobile
│   └── use-toast.ts           # Hook do Shadcn toast
├── lib/
│   ├── types.ts               # Todas as interfaces e tipos do domínio
│   ├── calcEngine.ts          # Motor de cálculo (Motor1, Motor2, Insumos dinâmicos, Dificuldade)
│   ├── storage.ts             # Wrapper localStorage com seed automático
│   ├── seedData.ts            # Dados iniciais (Motor1, Motor2, Insumos, Regras, Catálogo, Políticas)
│   ├── fetchLogoBase64.ts     # Fetch da logo → base64 para embutir no PDF
│   └── utils.ts               # cn() (clsx + tailwind-merge)
└── integrations/supabase/
    ├── client.ts              # Cliente Supabase (auto-gerado)
    └── types.ts               # Tipos do DB (auto-gerado)
```

---

## 3. Schema do Banco de Dados (Supabase / Lovable Cloud)

### Tabelas no Supabase:

**`clientes`** — Cadastro de clientes
| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | No | gen_random_uuid() |
| tipo | text | No | 'PF' |
| nome_razao_social | text | No | — |
| documento | text | Yes | '' |
| whatsapp | text | Yes | '' |
| cep | text | Yes | '' |
| endereco | text | Yes | '' |
| numero | text | Yes | '' |
| bairro | text | Yes | '' |
| cidade | text | Yes | '' |
| created_at | timestamptz | No | now() |
| updated_at | timestamptz | No | now() |

**`empresa`** — Dados da empresa (singleton, 1 linha)
| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | No | gen_random_uuid() |
| nome_fantasia | text | No | '' |
| razao_social | text | Yes | '' |
| cnpj_cpf | text | Yes | '' |
| telefone_whatsapp | text | Yes | '' |
| email_contato | text | Yes | '' |
| endereco, numero, bairro, cidade, estado | text | Yes | '' |
| cor_primaria | text | No | '#0B1B32' |
| cor_destaque | text | No | '#F57C00' |
| logo_url | text | Yes | '' |
| slogan | text | Yes | '' |
| created_at, updated_at | timestamptz | No | now() |

**`orcamentos`** — Orçamentos
| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | No | gen_random_uuid() |
| numero_orcamento | integer | No | — |
| cliente_id | uuid | Yes | — |
| nome_cliente | text | No | — |
| itens_servico | jsonb | No | '[]' |
| custo_total_obra | numeric | No | 0 |
| valor_venda | numeric | No | 0 |
| desconto | numeric | No | 0 |
| valor_final | numeric | No | 0 |
| data_criacao | timestamptz | No | now() |
| status | text | No | 'pendente' |
| validade, descricao_geral, formas_pagamento, garantia, tempo_garantia | text | Yes | '' |
| created_at, updated_at | timestamptz | No | now() |

**`politicas_comerciais`** — Modelos de condições comerciais
| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| id | uuid | No | gen_random_uuid() |
| nome_politica | text | No | — |
| validade_dias | integer | No | 15 |
| formas_pagamento, garantia, tempo_garantia | text | Yes | '' |
| created_at, updated_at | timestamptz | No | now() |

**Chaves Estrangeiras:** Nenhuma FK formal entre tabelas. `orcamentos.cliente_id` referencia `clientes.id` apenas por convenção no código, sem constraint no DB.

**RLS:** Todas as 4 tabelas têm RLS ativo com política `true` (acesso público total, sem autenticação).

**Storage:** Bucket `logos` (público) para upload de logomarcas.

### Dados no localStorage (NÃO migrados):

| Chave | Conteúdo | Tipo |
|---|---|---|
| `orcacalhas_motor1` | Tabela de materiais (densidade, preço/kg) | Motor1Entry[] |
| `orcacalhas_motor2` | Preço metro linear por material/espessura/corte | Motor2Entry[] |
| `orcacalhas_insumos` | Catálogo de insumos (PU, rebites, suportes) | InsumoEntry[] |
| `orcacalhas_regras` | Regras de cálculo de insumos por tipo de serviço | RegraCalculo[] |
| `orcacalhas_servicos` | Catálogo de serviços (templates) | ServicoTemplate[] |

Esses 5 conjuntos de dados técnicos são carregados via `storage.ts` com seed automático do `seedData.ts` na primeira utilização.

---

## 4. Lógica de Negócio (Motor de Cálculo)

Arquivo: `src/lib/calcEngine.ts`

### Motor 1 — Fabricação Própria (peso)
```text
pesoMetro = (espessura × corte × 100 × densidade) / 100.000
custoMetro = pesoMetro × preçoQuilo
```
Usa a tabela `Motor1Entry` que mapeia material → densidade + preço/kg.

### Motor 2 — Compra Dobrada (preço direto)
Busca direta na tabela `Motor2Entry` por combinação exata de (material, espessura, corte) → preço metro linear.

### Insumos Dinâmicos
Para cada item da regra associada ao serviço:
- **Multiplicar:** `quantidade = ceil(metragem × fator)`
- **Dividir:** `quantidade = ceil(metragem / fator)`
- `custoTotal = quantidade × (preçoEmbalagem / qtdEmbalagem)`

O operador pode ajustar quantidades manualmente no modal `AddServicoModal`.

### Dificuldade (Markup)
Cada serviço tem 3 multiplicadores: fácil, médio, difícil.
```text
valorVenda = custoTotalObra × fatorDificuldade
```
Onde `custoTotalObra = custoMaterial + custoInsumos`.

### Fluxo completo de um item:
```text
ServicoTemplate → (motor1 ou motor2) → custoMetroLinear
custoMetroLinear × metragem → custoTotalMaterial
regra.itensRegra → calcInsumosDinamicos → custoTotalInsumos
custoTotalObra = custoTotalMaterial + custoTotalInsumos
valorVenda = custoTotalObra × fatorDificuldade
```

---

## 5. Módulo de PDF e Compartilhamento

### Geração do PDF
- **Biblioteca:** `@react-pdf/renderer` (renderização React → PDF nativo)
- **Template:** `OrcamentoPDF.tsx` — componente React-PDF com:
  - Header (logo base64 + dados empresa)
  - Barra de título (PROPOSTA COMERCIAL + número + datas)
  - Bloco cliente (PF/PJ com labels corretos)
  - Escopo do serviço (texto livre)
  - Tabela de serviços: # | Descrição | Medida | V. Unitário | Total
  - Totais: Subtotal, Desconto (se > 0), TOTAL
  - Condições comerciais (validade, pagamento, garantia)
  - Assinaturas (cliente + prestador)
  - Footer fixo com logo + paginação

### Compartilhamento (`PDFDownloadButton.tsx`)
1. Gera Blob via `pdf(<OrcamentoPDF />).toBlob()`
2. Converte em `File` com nome dinâmico: `Orcamento_[NomeCliente]_[Numero].pdf`
   - Nome sanitizado: `.trim().replace(/\s+/g, '_')`
   - Fallback: `Cliente_Nao_Identificado`
3. **Mobile:** `navigator.share({ files: [file] })` — abre sheet nativo (WhatsApp, email, etc.)
4. **Desktop (fallback):** `window.open(URL.createObjectURL(blob), '_blank')`
5. **Resiliência:** Se a renderização com logo falhar, tenta sem logo automaticamente

### Logo no PDF
`fetchLogoBase64.ts` faz fetch da URL pública do bucket → converte para data URI base64 via FileReader, com timeout de 8 segundos.

---

## 6. Fluxo de Dados Completo

```text
1. CATÁLOGO (localStorage)
   ServicoTemplate → define motor, material, espessura, corte, regra, multiplicadores

2. SELEÇÃO DO SERVIÇO (AddServicoModal)
   Usuário escolhe serviço + metragem + dificuldade
   → calcEngine processa Motor1/Motor2 + Insumos + Dificuldade
   → Gera ItemServico completo com todos os custos

3. CARRINHO (OrcamentoWizard)
   Itens acumulados + detalhes comerciais (política, desconto, garantia)
   → Totais calculados em tempo real (totalCusto, totalVenda, valorFinal)

4. SALVAMENTO (useOrcamentos → Supabase)
   handleSave() → addOrcamento.mutateAsync() ou updateOrcamento.mutateAsync()
   → Insere/atualiza na tabela `orcamentos` do Supabase
   → itensServico serializado como JSONB

5. PDF (PDFDownloadButton → OrcamentoPDF)
   Dados do orçamento + cliente + empresa → @react-pdf/renderer → Blob
   → Web Share API (mobile) ou window.open (desktop)
```

---

## 7. Dívida Técnica

### Segurança
- **RLS permissivo:** Todas as tabelas têm `true` como política — qualquer pessoa com a URL da API pode ler/escrever todos os dados
- **Sem autenticação:** Não há login, signup ou proteção de rotas. Dados são globais
- **Sem FK no DB:** `orcamentos.cliente_id` não tem constraint foreign key para `clientes.id`

### Persistência Parcial
- **5 tabelas no localStorage:** Motor1, Motor2, Insumos, Regras e Catálogo de Serviços ainda não foram migrados para o Supabase. Se o usuário limpar o navegador, perde toda a configuração técnica
- **Seed data como dados de produção:** Os dados de `seedData.ts` (3 materiais, 5 chapas, 3 insumos, 4 regras, 4 serviços, 2 políticas) são carregados automaticamente e servem tanto como exemplo quanto como dados reais

### Layout
- **Somente mobile:** O layout é fixo em `max-w-lg` (512px). Não há sidebar ou layout responsivo para desktop
- **NavLink.tsx não utilizado:** Componente criado mas nunca importado

### PDF
- **Tabela sem coluna "Unidade":** A coluna "Medida" mistura quantidade e unidade (ex: "15m"). Falta separação em Unidade | Qtd
- **CEP do cliente não aparece no PDF:** O endereço no PDF não inclui o CEP mesmo que esteja cadastrado
- **Assinaturas simples:** Faltam campos "Documento" e "Data" abaixo da linha de assinatura

### Funcionalidades Ausentes
- Relatórios de lucro/margem
- Ordem de serviço
- Histórico de alterações em orçamentos
- Exportação de dados (CSV/Excel)
- Backup/restore dos dados localStorage
- Numeração automática de versões de orçamento (revisões)

### Código
- `Configuracoes.tsx` usa `any` para `editItem` e `form` (sem tipagem forte nos formulários de configuração)
- Duplicação de lógica de cálculo entre `AddServicoModal` e `saveEditItem` no `OrcamentoWizard`
- `recharts` instalado mas não utilizado em nenhum componente

