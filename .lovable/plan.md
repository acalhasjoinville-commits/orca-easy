

## Plan: Reorganize Configuracoes UX

### Current State
- 630-line monolith with 7 flat tabs in a `grid-cols-7` layout (10px text, unreadable on mobile)
- All CRUD shares one generic dialog, one `renderItem`, one `form` state -- functional but visually flat
- No section descriptions, no grouping, no visual hierarchy

### Approach

**Replace the 7 flat tabs with 5 grouped sections using a vertical sidebar-style navigation on desktop and a scrollable tab bar on mobile.** Each section gets a title, subtitle description, and clear visual card.

The core CRUD logic (handleSave, handleDelete, openAdd, openEdit, form state, dialog) stays 100% untouched. Only the layout wrapper and tab structure changes.

### New Structure

**Tab reorganization** (5 tabs instead of 7):

| Tab | Label | Contents | Description |
|-----|-------|----------|-------------|
| empresa | Empresa | MinhaEmpresaForm (unchanged) | Dados institucionais e identidade visual |
| materiais | Custos e Materiais | Motor 1 + Motor 2 + Insumos (as sub-sections within one tab) | Materiais, chapas e insumos de base |
| regras | Regras de Cálculo | Regras list/CRUD (unchanged) | Como os insumos entram no cálculo |
| catalogo | Catálogo | Serviços list/CRUD (unchanged) | Serviços disponíveis para orçamento |
| politicas | Políticas | Políticas list/CRUD (unchanged) | Condições comerciais do orçamento e OS |

**Key UI improvements:**

1. **TabsList**: `grid-cols-5` with readable text, icons per tab
2. **Section headers**: Each tab content starts with a title + muted description (e.g. "Motor 1 — Materiais comprados em bobina/chapa, com cálculo por peso")
3. **Materiais tab**: Three collapsible or stacked sub-sections (Motor 1, Motor 2, Insumos) each with its own "Adicionar" button and list, separated by clear headings
4. **Consistent item cards**: Same `renderItem` but with slightly more breathing room (py-3 → py-4, better spacing)
5. **Dialog**: Unchanged functionally; title now includes section name (e.g. "Adicionar Motor 1" instead of just "Adicionar")
6. **Empty states**: Each list section shows a friendly message when empty
7. **Spacing**: More `space-y-6` between sections, less card-in-card nesting

### Files Changed

1. **`src/components/Configuracoes.tsx`** -- Full rewrite of layout/tabs structure:
   - 5 tabs instead of 7
   - "materiais" tab combines Motor1 + Motor2 + Insumos as sub-sections with individual headers and add buttons
   - Internal `activeSection` state tracks which sub-entity is being edited (motor1/motor2/insumos) for the shared dialog
   - Section descriptions added to each tab content
   - Dialog title enriched with context
   - All CRUD handlers, form state, hooks, and data flow remain identical

No new files needed. No migrations. No hook changes. No data shape changes.

### What Does NOT Change
- All mutation handlers (handleSave, handleDelete)
- All hook calls (useMotor1, useMotor2, useInsumos, useRegras, useServicos, usePoliticas, useEmpresa)
- Form state management (form, setField, regraItens)
- Dialog content (renderFormContent, renderRegraForm, renderCatalogoForm, renderPoliticaForm)
- MinhaEmpresaForm component (untouched)
- No database, no migrations, no RLS, no auth changes

