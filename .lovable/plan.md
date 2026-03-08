

## Diagnóstico

Em `Index.tsx`, tanto "Novo Orçamento" quanto "Editar Orçamento" usam `setTab('orcamento')`. Na sidebar e no bottom nav, o tab `orcamento` está mapeado para "Novo Orçamento", então ele fica destacado como ativo ao editar.

## Correção

Alterar o header para mostrar "Editar Orçamento" quando `editingOrcamento` não for null, e manter "Novo Orçamento" quando for criação. Isso afeta:

1. **`Index.tsx`** — No header (mobile e desktop), trocar a condição:
   - De: `{tab === 'orcamento' && 'Novo Orçamento'}`
   - Para: `{tab === 'orcamento' && (editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento')}`

2. **`AppSidebar.tsx`** e **`MobileBottomNav.tsx`** — Opcionalmente, receber `editingOrcamento` como prop para mudar o label do item quando estiver editando. Ou simplesmente manter o label fixo como "Orçamento" (sem "Novo") para ser neutro nos dois casos.

A abordagem mais simples: renomear o item do menu de "Novo Orçamento" para apenas "Orçamento" na sidebar e bottom nav, e usar o header para indicar se é novo ou edição.

