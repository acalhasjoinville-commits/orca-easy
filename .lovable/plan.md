

# Plano — Fase 2: Operacional

## Resumo

4 features: status cancelado, convite de usuários, edição de perfil, busca global de orçamentos.

---

## Feature 1 — Status "Cancelado"

**Migration:**
```sql
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS data_cancelamento timestamptz;
```

**types.ts:** Adicionar `'cancelado'` ao `StatusOrcamento`. Adicionar `dataCancelamento?: string | null` ao `Orcamento`.

**useSupabaseData.ts:** Mapear `data_cancelamento` no mapper bidirecional.

**Orcamentos.tsx:** Adicionar `cancelado` ao `statusConfig`, `allStatuses`, `filterChips`, `statusPriority` (prioridade 4, após rejeitado).

**OrcamentoDetails.tsx:** Adicionar `cancelado` ao `statusConfig` e `pipelineSteps`. Botão "Cancelar Orçamento" visível quando status é `pendente` ou `aprovado`. AlertDialog de confirmação. Seta `status = 'cancelado'` e `dataCancelamento = now()`. Pipeline não renderiza para `cancelado` (igual `rejeitado`).

**Index.tsx:** Adicionar handler `handleCancelOrcamento`, passar como prop.

---

## Feature 2 — Convite de Usuários

**Abordagem:** Admin insere email + role → sistema cria um registro de convite → quando o convidado faz signup com aquele email, o trigger associa automaticamente à empresa e role.

**Migration:**
```sql
CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  email text NOT NULL,
  role app_role NOT NULL,
  invited_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz,
  UNIQUE(empresa_id, email)
);
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
-- RLS: admin da empresa pode CRUD
CREATE POLICY "Admin manages invites" ON public.invites
  FOR ALL TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));
```

**Trigger no signup:** Alterar `handle_new_user()` para, ao criar profile, verificar se existe invite para aquele email. Se sim: setar `empresa_id` no profile, criar `user_role`, marcar invite como `used_at = now()`.

**Usuarios.tsx:** Adicionar seção "Convidar usuário" com campo email + select de role + botão enviar. Listar convites pendentes abaixo. Botão para revogar convite.

---

## Feature 3 — Edição de Perfil

**Nova tab/modal:** Adicionar componente `EditarPerfil.tsx`.

- Campo nome (editável, salva no `profiles.full_name`)
- Campo email (read-only)
- Seção alterar senha (senha atual não é necessária via `updateUser`)

**Onde colocar:** Botão no header (ícone de usuário) ou item no sidebar. Recomendo modal/sheet acessível do header, sem nova tab no sidebar.

**Index.tsx:** Estado para abrir/fechar o modal de perfil.

---

## Feature 4 — Busca Global de Orçamentos

**Orcamentos.tsx:** Já existe um campo `<Input>` de busca. Verificar se já filtra por número e cliente. Se não, implementar:

- Filtrar por `numeroOrcamento` (contém dígitos digitados)
- Filtrar por `nomeCliente` (case-insensitive contains)
- Filtrar por `valorFinal` (match exato ou prefixo)

Busca acontece client-side sobre os dados já carregados. Sem backend adicional.

---

## Arquivos alterados

| Arquivo | Mudanças |
|---------|----------|
| Migration | `data_cancelamento` + tabela `invites` + trigger atualizado |
| `src/lib/types.ts` | `cancelado` no status, `dataCancelamento` no Orcamento |
| `src/hooks/useSupabaseData.ts` | Mapper para `data_cancelamento` |
| `src/components/Orcamentos.tsx` | Status cancelado na UI, busca global |
| `src/components/OrcamentoDetails.tsx` | Botão cancelar, pipeline com cancelado |
| `src/pages/Index.tsx` | Handler cancelar, modal perfil |
| `src/components/Usuarios.tsx` | Seção convites (criar/listar/revogar) |
| `src/components/EditarPerfil.tsx` | Novo componente (nome + senha) |

## Integridade

- Sem alterações em calcEngine, snapshots, motor, catálogo, financeiro
- Sem alteração em regras de negócio existentes
- Trigger `handle_new_user` é estendido (não substituído)

