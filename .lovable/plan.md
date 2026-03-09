

## Plan: Visual & UX Reorganization of OrçaCalhas

This is a pure layout/UX pass across 4 screens + global consistency. No business logic, database, or hook changes.

### 1. OrcamentoWizard.tsx — Wizard Redesign

**Step indicator**: Add a 3-step progress bar at the top (Cliente → Motor → Carrinho) showing current phase with numbered circles and connecting lines.

**Client phase**: Add section header with description. Better spacing on client list items.

**Motor phase**: Same step indicator. Add description text under title.

**Cart phase (major changes)**:
- **Items section**: Add section header "Serviços" with item count. Better card spacing (py-4 gap-4).
- **Financial summary card**: Separate dedicated card below items with clear hierarchy -- Custo, Venda, Desconto as smaller rows, Valor Final as large accent-colored number. Currently this is only in the sticky footer; add a visible inline summary card too.
- **Commercial details**: Rename card header to "Condições Comerciais" with description. Group fields better: validade+desconto on one row, pagamento+escopo stacked, garantia fields grouped in their own sub-block. Remove the overly highlighted guarantee border (border-2 border-accent/30) -- make it consistent with other fields.
- **Sticky footer**: Simplify to show only Valor Final + Save button (remove duplicated cost/venda breakdown since it's now in the inline card). This reduces footer height significantly on mobile.

### 2. OrcamentoDetails.tsx — Details Redesign

**Header**: Wrap in a card-like container with better visual grouping. Add motor type indicator (Motor 1/Motor 2 badge).

**Items card**: Add alternating subtle backgrounds or better dividers between items. Show item index more prominently.

**Financial summary**: Convert to a more structured layout with left-aligned labels and right-aligned values. Add a subtle background highlight on the final value row. Show margem with a colored badge (green if >30%, yellow otherwise).

**Conditions card**: Add icons next to each condition (calendar for validade, credit-card for payment, shield for garantia).

**Action bar**: Group primary actions (PDF, OS) separately from secondary (Edit, Delete). Add visual separator.

### 3. Clientes.tsx — Clients Redesign

**Header**: Add inline "Novo Cliente" button next to title (desktop) in addition to the FAB (mobile). Consistent page header pattern.

**Search**: Slightly larger search area with subtle background card wrapper.

**Client cards**: Add subtle left-border color indicator for PF vs PJ. Better info layout: name larger, document + phone on same line, city on second line. Action buttons in a dropdown or cleaner icon group.

**Empty state**: Add illustration-style icon, larger text, more prominent CTA button.

### 4. Financeiro.tsx — Financial Redesign

**Header**: Responsive -- stack filters below title on mobile (currently side-by-side, breaks on small screens). Wrap in consistent page header pattern.

**KPI cards**: Add subtle icon background circle. Slightly larger values.

**Chart section**: Better card padding. On mobile, stack chart and summary vertically (currently xl breakpoint only).

**Top 5 table**: On mobile, convert to card list instead of table (tables are hard to read on mobile). Use horizontal scroll as fallback.

### 5. Global Consistency (across all files)

**Page header pattern** -- standardize across all screens:
```
<div className="mb-6">
  <h1 className="text-2xl font-bold text-foreground">Title</h1>
  <p className="text-sm text-muted-foreground mt-1">Subtitle</p>
</div>
```
Note: switch from `text-primary` to `text-foreground` for page titles (consistent, works in both themes).

**Loading states**: All use centered `Loader2` with consistent `py-20` spacing (already mostly consistent).

**Empty states**: Consistent icon size (h-12 w-12), text hierarchy, and CTA button style.

**Spacing**: Standardize page padding to `px-4 lg:px-6 pt-4 pb-24 lg:pb-8` across screens.

### Files Changed

1. `src/components/OrcamentoWizard.tsx` — Step indicator, cart reorganization, commercial fields grouping, simplified footer
2. `src/components/OrcamentoDetails.tsx` — Header card, financial summary, conditions with icons, action grouping
3. `src/components/Clientes.tsx` — Header with inline button, card improvements, better empty state
4. `src/components/Financeiro.tsx` — Responsive header/filters, mobile-friendly table, KPI polish
5. `src/components/Orcamentos.tsx` — Consistent page header pattern, minor spacing

No new files. No migrations. No hook changes. No business logic changes.

