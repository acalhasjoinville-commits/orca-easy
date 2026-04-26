# RufoLab — Plano aprovado e roteiro de execução

> **Status**: Aprovado como blueprint do destino final.
> Persistência em banco, isolamento por empresa, JSONB para segmentos, PDF client-side, debounce fora dos hooks.

---

## 0. Contexto da aprovação

Este plano define **dois alvos distintos**:

- **Alvo A — Módulo isolado atual** (repo `bendy-maker` ou similar): mantém-se vivo como etapa intermediária e laboratório de UX/geometria. Não deve sofrer troca brusca de stack.
- **Alvo B — Sistema principal (este repo: OrçaCalhas)**: destino final. Aqui o RufoLab vira módulo nativo, com Supabase como fonte da verdade, RLS por empresa, integrado ao shell (`AppSidebar`, `MobileBottomNav`, `Index.tsx`, `useAuth`).

A regra de ouro: **não reescrever o editor à toa**. O "miolo" geométrico e o canvas do módulo isolado são portados como estão; o que muda é a **camada de dados** (localStorage → Supabase) e a **camada de shell** (router próprio → integração com Index/AppSidebar).

---

## 1. Princípios não-negociáveis

1. **Banco como fonte da verdade** na integração final. localStorage só como cache de UX (rascunho do editor), nunca como persistência primária.
2. **Isolamento por `empresa_id`** em todas as tabelas, com RLS espelhando o padrão atual (`empresa_id = get_user_empresa_id(auth.uid())`).
3. **JSONB para segmentos e snapshot de cálculo**. Sem tabela separada de segmento nesta fase.
4. **Debounce mora na tela/editor**, não no hook de mutation. O hook expõe `save(data)` síncrono do ponto de vista do React Query; quem decide quando chamar é o componente.
5. **PDF é client-side**: SVG da peça → PNG via canvas → `@react-pdf/renderer`. Sem edge function.
6. **Zero acoplamento com o fluxo comercial nesta fase**: nada de orçamento, catálogo, motor 1/2, serviços avulsos, PDF comercial.
7. **Permissões**: `admin` e `vendedor` acessam; `financeiro` não. Encaixa no `useAuth` atual via novo flag `canUseRufoLab`.

---

## 2. Integridade tenant entre projeto e peça (decisão final)

**Não basta confiar em RLS** para garantir que uma peça pertença ao mesmo tenant do projeto pai. Sem reforço explícito, um bug de aplicação ou um insert via service role poderia criar uma peça com `empresa_id = A` apontando para um `project_id` cujo `empresa_id = B`.

**Decisão**: usar **FK composta** `(project_id, empresa_id) REFERENCES rufolab_projects(id, empresa_id) ON DELETE CASCADE`. Isso exige uma `UNIQUE (id, empresa_id)` em `rufolab_projects` (o `id` já é PK e único; a unique composta é redundante para o banco mas necessária para servir de alvo da FK composta).

Vantagens sobre trigger:
- Garantia declarativa, sem custo de função PL/pgSQL.
- Falha imediata e clara em violação.
- Sem risco de o trigger ser desabilitado/esquecido em manutenção.

Templates continuam soltos (sem FK para projeto/peça): são biblioteca da empresa, isoladas só por `empresa_id` + RLS.

---

## 3. Modelagem de banco (alvo B)

```sql
-- Obras/projetos
CREATE TABLE public.rufolab_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresa(id) ON DELETE CASCADE,
  nome text NOT NULL,
  observacoes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Peças (filhas de uma obra) — FK composta garante integridade tenant
CREATE TABLE public.rufolab_pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresa(id) ON DELETE CASCADE,
  project_id uuid NOT NULL,
  nome text NOT NULL,
  tipo_peca text NOT NULL DEFAULT 'reta',         -- 'reta' | 'conica'
  comprimento numeric NOT NULL DEFAULT 0,         -- metros lineares
  quantidade integer NOT NULL DEFAULT 1,
  observacoes text NOT NULL DEFAULT '',
  segmentos jsonb NOT NULL DEFAULT '[]'::jsonb,   -- desenho da peça
  calc_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb, -- desenvolvimento, área, dobras...
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- FK composta: peça só pode apontar para projeto da MESMA empresa
  CONSTRAINT rufolab_pieces_project_tenant_fk
    FOREIGN KEY (project_id, empresa_id)
    REFERENCES public.rufolab_projects (id, empresa_id)
    ON DELETE CASCADE
);

-- Necessário para servir de alvo da FK composta acima
ALTER TABLE public.rufolab_projects
  ADD CONSTRAINT rufolab_projects_id_empresa_unique UNIQUE (id, empresa_id);

-- Templates por empresa
CREATE TABLE public.rufolab_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresa(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo_peca text NOT NULL DEFAULT 'reta',
  segmentos jsonb NOT NULL DEFAULT '[]'::jsonb,
  observacoes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: padrão tenant isolation
ALTER TABLE public.rufolab_projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rufolab_pieces    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rufolab_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.rufolab_projects
  FOR ALL USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Tenant isolation" ON public.rufolab_pieces
  FOR ALL USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Tenant isolation" ON public.rufolab_templates
  FOR ALL USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- Triggers de updated_at (reusa update_updated_at_column existente)
CREATE TRIGGER trg_rufolab_projects_updated  BEFORE UPDATE ON public.rufolab_projects  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rufolab_pieces_updated    BEFORE UPDATE ON public.rufolab_pieces    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rufolab_templates_updated BEFORE UPDATE ON public.rufolab_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices úteis
CREATE INDEX idx_rufolab_pieces_project    ON public.rufolab_pieces(project_id);
CREATE INDEX idx_rufolab_projects_empresa  ON public.rufolab_projects(empresa_id);
CREATE INDEX idx_rufolab_templates_empresa ON public.rufolab_templates(empresa_id);
```

**Forma do `segmentos` (JSONB)**:
```ts
type Segmento = {
  id: string;
  tipo: 'reto' | 'diagonal';
  medida: number;            // mm ou cm — definido na const SHARED
  anguloDeg?: number;        // para diagonais
  // medidaInicial/medidaFinal ficam em fields da peça quando cônica
};
```

**Forma do `calc_snapshot` (JSONB)**:
```ts
type CalcSnapshot = {
  desenvolvimentoInicial: number;
  desenvolvimentoFinal?: number;   // só cônica
  area: number;
  numeroDobras: number;
  numeroSegmentos: number;
  comprimento: number;
  quantidade: number;
  calculadoEm: string;             // ISO
};
```

---

## 4. Camadas de código (alvo B)

```
src/
├── lib/rufolab/
│   ├── types.ts            # Project, Piece, Template, Segmento, CalcSnapshot
│   ├── geometry.ts         # PORT do bendy-maker (cálculos puros)
│   └── pdf/
│       ├── shared.tsx      # estilos reusáveis (cores empresa, header)
│       └── PecaTecnicaPDF.tsx
├── hooks/
│   ├── useRufoLabProjects.ts   # CRUD via React Query
│   ├── useRufoLabPieces.ts
│   └── useRufoLabTemplates.ts
└── components/rufolab/
    ├── RufoLab.tsx              # shell com 3 colunas / tabs mobile
    ├── ProjectsList.tsx
    ├── PiecesList.tsx
    ├── PieceEditor.tsx          # PORT do canvas/editor
    ├── PieceCanvas.tsx          # PORT
    ├── SegmentList.tsx
    ├── CalcPanel.tsx
    ├── TemplatesLibrary.tsx
    └── PdfDownloadButton.tsx
```

**Hooks — contrato simples (sem debounce escondido)**:
```ts
// useRufoLabPieces.ts
export function usePieces(projectId: string | null) { /* useQuery */ }
export function useCreatePiece() { /* useMutation */ }
export function useUpdatePiece() { /* useMutation — chamada explícita */ }
export function useDeletePiece() { /* useMutation */ }
```

**Debounce na camada do editor**:
```ts
// PieceEditor.tsx
const updatePiece = useUpdatePiece();
const debouncedSave = useMemo(
  () => debounce((data) => updatePiece.mutate(data), 600),
  [updatePiece]
);
// chamado a cada mudança de segmento
```

---

## 5. Permissões

Adicionar em `useAuth.tsx`:
```ts
canUseRufoLab: roles.includes('admin') || roles.includes('vendedor')
```
Bloqueio de rota e item de menu condicionados a esse flag. `financeiro` não vê.

---

## 6. Integração com o shell

- **`AppSidebar`**: novo `Tab = 'rufolab'`, item na seção Operação com ícone `Ruler` ou `Square`, `permission: 'canUseRufoLab'`.
- **`MobileBottomNav`**: entra no sheet "Mais".
- **`appShellRoutes.ts`**: rota `/rufolab` (e `/rufolab/:projectId/:pieceId?` para deep link opcional).
- **`Index.tsx`**: lazy import + case `'rufolab'` no switch + `getHeaderMeta`.

---

## 7. PDF técnico — fluxo client-side

1. Editor expõe ref do SVG da peça.
2. Botão "Baixar PDF técnico" chama helper `svgToPng(svgEl, scale=2)` que:
   - serializa o SVG (`XMLSerializer`)
   - desenha em `<canvas>` via `Image` + `drawImage`
   - retorna `dataURL` PNG
3. Render `<PecaTecnicaPDF empresa={...} project={...} piece={...} pngDataUrl={...} />` com `@react-pdf/renderer`.
4. `pdf().toBlob()` → `URL.createObjectURL` → `<a download>`.

Conteúdo: empresa (logo+cor), obra, peça, tipo, medidas dos segmentos, comprimento, quantidade, observações, desenvolvimento (inicial e final se cônica), área, dobras, data emissão.

---

## 8. Roteiro de execução em fases

### Fase 0 — Preparação (este repo, sem código ainda)
- ✅ Plano aprovado e versionado em `.lovable/plan.md`.
- Validar com você se o alvo da próxima sessão é **A** (continuar isolado) ou **B** (port para sistema principal).

### Fase 1 — Banco (alvo B, sistema principal)
- Migration única: 3 tabelas + RLS + triggers + índices.
- **Não mexe em código ainda.** Aguarda aprovação da migration.

### Fase 2 — Tipos e geometria portados (alvo B)
- `src/lib/rufolab/types.ts`
- `src/lib/rufolab/geometry.ts` (port direto do bendy-maker, sem dependências de UI)
- Testes unitários da geometria em `src/test/rufolab.test.ts`.

### Fase 3 — Hooks de dados (alvo B)
- `useRufoLabProjects`, `useRufoLabPieces`, `useRufoLabTemplates`.
- Padrão React Query igual ao resto do projeto. Sem debounce embutido.

### Fase 4 — Shell e navegação (alvo B)
- `canUseRufoLab` em `useAuth`.
- Item no `AppSidebar` + `MobileBottomNav` + rota + case no `Index`.
- Tela `RufoLab.tsx` com layout vazio (3 colunas desktop / tabs mobile).

### Fase 5 — Editor portado (alvo B)
- `PieceCanvas`, `SegmentList`, `CalcPanel` portados do bendy-maker, ajustados para tokens de design do sistema.
- Debounce de save **na tela**, não no hook.
- Cache local opcional (sessionStorage via `useDraft` existente) só para rascunho não-salvo.

### Fase 6 — Templates (alvo B)
- `TemplatesLibrary`: listar, criar a partir de peça, instanciar nova peça a partir de template.

### Fase 7 — PDF técnico (alvo B)
- Helper `svgToPng`.
- `PecaTecnicaPDF` com header da empresa (reusa `fetchLogoBase64`).
- Botão de download na tela do editor.

### Fase 8 — Refinamentos (alvo B)
- Mobile polish.
- Empty states.
- Loading skeletons.
- Atalhos de teclado no editor (opcional).

---

## 9. Divisão clara: alvo A vs alvo B

| Item | Alvo A (módulo isolado) | Alvo B (sistema principal) |
|---|---|---|
| Editor de canvas | mantém | porta tal como está |
| Geometria | fonte da verdade do código a portar | recebe port |
| Persistência | localStorage segue ok | **Supabase obrigatório** |
| Roteamento | router próprio | integrado em `Index.tsx` |
| Auth | sem auth ou mock | `useAuth` real + `empresa_id` |
| PDF | pode ser jsPDF | `@react-pdf/renderer` (padrão do projeto) |
| Templates | localStorage | tabela `rufolab_templates` por empresa |

**Não fazer no alvo A**: trocar persistência para Supabase, importar `useAuth`, importar `AppSidebar`. Isso é trabalho do alvo B.

**Não fazer no alvo B**: copiar router, copiar shell, copiar persistência localStorage do bendy-maker. Importar só o miolo (geometria + canvas + editor visual).

---

## 10. Fora de escopo (reafirmado)

- Integração com orçamento.
- Integração com catálogo.
- Cálculo comercial / preço.
- Alteração em motor 1/motor 2.
- Alteração em serviços avulsos.
- Edge functions.
- PDF comercial do orçamento.
- Tabela separada de segmentos.
- Importar bendy-maker como iframe ou mini-app.

---

## 11. Próxima decisão sua

Antes de eu começar a Fase 1, preciso que você confirme:

**A próxima sessão atua em qual alvo?**
1. **Alvo B agora** → começo pela migration das 3 tabelas neste repo.
2. **Alvo A primeiro** → você indica o repo isolado e o que deve evoluir lá antes do port.
3. **Os dois em paralelo** → defino com você qual peça vai em cada lado.
