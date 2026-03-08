

## Plan: Improve PDF/Print Template - PF/PJ Labels, Client Block, Table Columns, Signatures

All changes are confined to **`src/lib/printTemplate.ts`** (the `buildProposalHtml` function). No other files need editing since `generatePdf.ts`, `OrcamentoWizard.tsx`, and `printViaIframe.ts` already consume this template.

---

### 1. PF/PJ Dynamic Labels (lines 43-47, ~283-290)

In the data-prep section, derive labels from `cliente?.tipo`:

- `tipo === 'PF'` → name label = "Nome", doc label = "CPF"
- `tipo === 'PJ'` → name label = "Razão Social", doc label = "CNPJ"
- `cliente` undefined → name label = "Nome/Razão Social", hide doc if empty

Replace the client HTML block with per-line layout (each field on its own row, only rendered if value is truthy):

```
<b>{nameLabel}:</b> value
<b>{docLabel}:</b> value        (only if clienteDoc)
<b>Telefone:</b> value           (only if clienteTel)
<b>Endereço:</b> full address    (only if clienteEnd or clienteCep)
```

### 2. Service Table - Add "Unidade" Column (lines 62-71, ~323-336)

Add a "Unidade" column between "Descrição" and "Quantidade". Since `ItemServico` doesn't have a unit field, default to `"m"` (metragem-based). The columns become:

| # | Serviço | Unid. | Qtd. | Valor Unit. | Total |

Update `serviceRows` mapping to include the unit cell. Adjust column widths accordingly.

### 3. Totals - Show Subtotal Row When Discount Exists (lines 338-347)

Currently correct (shows subtotal + discount only when `desconto > 0`, then total). No cost/margin is shown. Will keep as-is but ensure the subtotal line is clearer with separate lines instead of pipe-separated.

```
Subtotal: R$ X.XXX,XX
Desconto: -R$ XXX,XX
───────────────────
TOTAL: R$ X.XXX,XX
```

### 4. Improved Signatures (lines 366-374)

Replace generic "Assinatura do Cliente" / "Assinatura do Técnico" with:

- Client block: line + "Nome / CPF (or CNPJ) / Data"
- Company block: line + "Nome / Data"

### 5. CSS Tweaks

Minor adjustments to existing styles:
- `.client-row` changed to stacked layout (block instead of flex row)
- Remove `.client-name-val` max-width/ellipsis constraint (allow full name)
- Signature sub-labels in smaller gray text

---

### Files Changed
- `src/lib/printTemplate.ts` — sole file edited

### Not Changed
- `generatePdf.ts`, `OrcamentoWizard.tsx`, `printViaIframe.ts` — no changes needed (they call `buildProposalHtml` which we're updating)
- No calculation logic touched

