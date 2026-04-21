

# Portal do Cliente — Aprovação online de orçamento

## Princípio fundamental

Módulo **isolado e somente-leitura** sobre o orçamento. Não toca em `calcEngine`, snapshots, RLS de tenant, fluxo financeiro nem ciclo de vida operacional. A única ação que modifica banco é a transição `pendente → aprovado/rejeitado`, que já é uma transição válida e idêntica à feita hoje internamente.

## Visão geral do fluxo

```text
Vendedor                     Cliente                       Sistema
────────                     ───────                       ───────
Detalhes do orçamento
  ↓
[Compartilhar com cliente]
  ↓ gera token único
[Copiar link] [WhatsApp]
                             abre link público
                             ─────────────────►
                                                          /p/o/:token
                                                          • valida token
                                                          • valida validade
                                                          • valida status ∈ {pendente, aprovado}
                                                          • renderiza orçamento
                             vê orçamento (igual PDF)
                             [Aprovar] [Rejeitar] [Comentar]
                                                  ─────►
                                                          • RPC SECURITY DEFINER
                                                          • muda status
                                                          • cria log no follow-up
Notificação no Acompanhamento
Comercial (refetch automático)
```

## Modelo de dados (1 nova tabela)

Tabela `orcamento_share_links` — token público que dá acesso a UM orçamento.

| coluna | tipo | descrição |
|---|---|---|
| `id` | uuid PK | |
| `orcamento_id` | uuid | FK lógica (não FK física, padrão do projeto) |
| `empresa_id` | uuid | tenant — copiado do orçamento |
| `token` | text UNIQUE | 32 bytes random base64url, ~43 chars |
| `expires_at` | timestamptz | copiado de `validade` no momento da criação |
| `created_by` | uuid | quem gerou |
| `created_at` | timestamptz | |
| `revoked_at` | timestamptz NULL | preenchido se vendedor revogar |

RLS:
- `SELECT/INSERT/UPDATE` para `authenticated` se `empresa_id = get_user_empresa_id(auth.uid())` (padrão do projeto).
- Anon **não acessa direto** — só via RPC.

Tabela `orcamento_followup_logs` ganha 2 valores opcionais no `tipo` (já existem como string livre na trigger? Não — a trigger valida enum). Por isso, vou adicionar `'cliente_aprovou'` e `'cliente_rejeitou'` e `'cliente_comentou'` à validação `validate_followup_log_tipo`. **Nada além disso.**

## RPCs públicas (3 funções, todas SECURITY DEFINER, sem JWT)

Todas com input validation rígido, sem nenhuma SQL dinâmica.

### `public_get_orcamento_by_token(_token text) → jsonb`
- Busca o link pelo token. Retorna erro genérico se inválido/expirado/revogado/status terminal.
- Retorna JSON com: empresa (nome, logo_url, cores, slogan, contato), cliente (nome, documento, cidade — sem CEP completo nem endereço pra reduzir exposição), orçamento (nº, datas, status, validade, descricaoGeral, itensServico **filtrados** — só campos visíveis no PDF, sem custoConhecido/insumosCalculados/custoTotalObra/motorType/regraId), totais (valorVenda, desconto, valorFinal), snapshots comerciais.
- Filtragem dos itens é feita **dentro da função SQL** — frontend nunca recebe campos sensíveis, mesmo com DevTools.

### `public_respond_orcamento(_token text, _action text, _comment text) → jsonb`
- `_action ∈ {'aprovar', 'rejeitar'}`.
- Valida token + valida que orçamento está `pendente`.
- Atualiza status do orçamento.
- Insere log em `orcamento_followup_logs` com `tipo = 'cliente_aprovou'` ou `'cliente_rejeitou'`, `user_id = NULL` (vai precisar permitir nullable nessa coluna — alteração mínima), `user_name = 'Cliente (' || nome_cliente || ')'`, `descricao = _comment`.
- Atualiza `ultima_interacao_em` em `orcamento_followups` (via trigger existente).
- Retorna `{ success: true, status: 'aprovado'|'rejeitado' }`.

### `public_comment_orcamento(_token text, _comment text) → jsonb`
- Permite comentário sem mudar status (cliente quer pedir alteração).
- Insere log com `tipo = 'cliente_comentou'`.
- Validação: comentário 1–2000 chars trimmed.

## Frontend — rotas e componentes

### Rota pública nova
- `/p/o/:token` em `App.tsx`, **fora** do shell autenticado, **fora** do Index. Tem seu próprio layout minimalista.

### Componentes novos
- `src/pages/PortalOrcamento.tsx` — página pública, usa `useQuery` com `queryFn` chamando o RPC. Sem `useAuth`. Render:
  - Header: logo + nome empresa (cores da empresa).
  - Bloco hero: "Orçamento Nº XXXX" + valor final em destaque.
  - Detalhes do cliente (nome).
  - Lista de itens (mesmo formato do PDF).
  - Condições comerciais (validade, pagamento, garantia — usando snapshots).
  - Bloco de ação (só se status = `pendente`):
    - Botão "Aprovar orçamento" → AlertDialog confirmação → chama RPC.
    - Botão "Rejeitar" → AlertDialog com textarea opcional.
    - Botão "Enviar dúvida/comentário" → Dialog com textarea obrigatório.
  - Se já aprovado/rejeitado/expirado: mensagem clara de estado.
  - Footer: "Documento gerado por OrcaEasy" (badge discreto).

- `src/components/CompartilharOrcamentoModal.tsx` — invocado pelo botão "Compartilhar com cliente" em `OrcamentoDetails.tsx`:
  - Chama mutation `criarShareLink(orcamentoId)`.
  - Mostra a URL pronta.
  - Botão "Copiar link" (com toast).
  - Botão "Abrir WhatsApp" — monta `https://wa.me/{telefone limpo}?text={mensagem encoded}`. Usa `cliente.whatsapp` quando existir; valida via zod (apenas dígitos, 10–15 chars).
  - Mostra status do link: ativo/expirado/revogado + botão "Revogar link".
  - Mostra histórico: já existe link? Mostra qual e permite gerar novo (que invalida o anterior).

### Componente alterado (mínimo)
- `OrcamentoDetails.tsx`: adicionar UM botão "Compartilhar com cliente" no bloco de ações, visível apenas quando `orcamento.status ∈ {pendente, aprovado}` e usuário tem permissão de editar orçamento. Abre o modal acima.

### Hook novo
- `src/hooks/useShareLink.ts`:
  - `useShareLink(orcamentoId)` — query do link ativo.
  - `useCreateShareLink()` — mutation.
  - `useRevokeShareLink()` — mutation.
  - `usePublicOrcamento(token)` — query pública (sem auth).

### Refetch reativo
- Quando RPC público é chamado, o vendedor não percebe na hora. Para atualizar, `OrcamentoDetails.tsx` e `useFilaComercial` já são revalidados via React Query no foco/manual. Adicionalmente, **uma subscription Realtime** em `orcamentos` filtrada por `id = orcamentoId` (apenas na tela de detalhes) — invalida o cache quando o status muda. Sem polling.

## Segurança — análise rigorosa

| Risco | Mitigação |
|---|---|
| Token vazado | 256 bits de entropia (`gen_random_bytes(32)`) — inviável adivinhar. Revogável a qualquer momento. |
| Cliente vê custo/margem | Filtragem **server-side** dentro da RPC. Frontend nunca recebe esses campos. |
| Cliente aprova orçamento já executado | RPC checa `status = 'pendente'` antes de aceitar. |
| Bypass de RLS via RPC | RPCs são `SECURITY DEFINER` mas **não usam input do cliente em SQL** — só parâmetros tipados. Token é SELECT por igualdade. |
| Cross-tenant via token | Cada link tem `empresa_id`, mas a RPC nunca expõe ID de outras empresas. Token é unique global. |
| Replay/spam de comentários | Rate limit aplicativo: 1 comentário a cada 30s por token (controle simples no frontend + checagem no servidor por `created_at` do último log). |
| Injeção HTML em comentário | Render como texto puro (React escapa por padrão). |
| WhatsApp URL injection | `encodeURIComponent` + zod validando telefone. |
| Link permanente após aprovação | RPC bloqueia ações; mas leitura continua válida (cliente quer ver o que aprovou). Exibe status "Aprovado em DD/MM". |

## Mudanças no banco (mínimas)

Migration única:
1. `CREATE TABLE orcamento_share_links` + RLS + índice em `token`.
2. `ALTER TABLE orcamento_followup_logs ALTER COLUMN user_id DROP NOT NULL` (atualmente é NOT NULL — para aceitar ações do cliente).
3. `ALTER FUNCTION validate_followup_log_tipo` para incluir `'cliente_aprovou'`, `'cliente_rejeitou'`, `'cliente_comentou'`.
4. `CREATE FUNCTION public_get_orcamento_by_token`.
5. `CREATE FUNCTION public_respond_orcamento`.
6. `CREATE FUNCTION public_comment_orcamento`.
7. `GRANT EXECUTE` nas 3 funções para `anon` (são as únicas que `anon` pode chamar).

Tipos do `TipoInteracao` em `src/lib/types.ts` ganham os 3 novos valores e `TIPO_INTERACAO_CONFIG` ganha os labels. `FollowUpBlock.tsx` exibe naturalmente.

## Arquitetura final

```text
src/
├── pages/
│   └── PortalOrcamento.tsx           ← nova rota /p/o/:token (pública)
├── components/
│   ├── CompartilharOrcamentoModal.tsx ← novo
│   ├── OrcamentoDetails.tsx           ← + botão "Compartilhar"
│   └── portal/
│       ├── PortalHeader.tsx
│       ├── PortalOrcamentoView.tsx    ← layout do orçamento
│       └── PortalActionBar.tsx        ← aprovar/rejeitar/comentar
├── hooks/
│   └── useShareLink.ts               ← novo
└── lib/
    └── shareLink.ts                  ← helpers (URL, WhatsApp text)

supabase/migrations/
└── XXXX_portal_cliente.sql           ← migration única
```

## O que NÃO muda

- `calcEngine.ts`, `calcServicoAvulso.ts` — não tocados.
- Snapshots comerciais — só lidos.
- RLS multi-tenant — preservado integralmente.
- `App.tsx` autenticação, `Index.tsx`, sidebar, navegação — apenas adiciona rota pública nova.
- Hooks existentes (`useOrcamentos`, `useFollowUp`, `useFilaComercial`) — sem alteração.

## Entregáveis

1. Tabela `orcamento_share_links` com RLS de tenant.
2. 3 RPCs públicas com filtragem de dados sensíveis no servidor.
3. Página pública `/p/o/:token` com 3 estados (ativo, encerrado, expirado).
4. Modal "Compartilhar com cliente" com gerar/copiar/WhatsApp/revogar.
5. Logs automáticos no Acompanhamento Comercial quando cliente age.
6. Atualização em tempo real do status no painel do vendedor (Realtime).

## Fora de escopo (intencional, futuro)

- Envio por e-mail (requer config de remetente).
- Anexos (cliente subir foto/PDF).
- Múltiplas versões do orçamento no mesmo link.
- Notificação push/e-mail para o vendedor quando cliente age (hoje aparece via Realtime + Acompanhamento Comercial).

