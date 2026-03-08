

## Problema

A barra de ações do `OrcamentoDetails.tsx` (PDF, OS, Editar, Excluir) usa `fixed bottom-0 z-40`, mas o `MobileBottomNav` também usa `fixed bottom-0 z-50`. O nav sobrepõe completamente os botões de ação.

## Correção

No `OrcamentoDetails.tsx`, ajustar a barra de ações para ficar **acima** do bottom nav no mobile:

1. Trocar `bottom-0` por `bottom-16` no mobile (altura do nav é `h-16`)
2. Aumentar o `pb-28` do container para `pb-36` para garantir espaço suficiente para scroll

Alteração em apenas 2 linhas no `OrcamentoDetails.tsx`:
- Linha do container: `pb-28` → `pb-36`
- Linha da action bar: `fixed bottom-0` → `fixed bottom-16 lg:bottom-0`

