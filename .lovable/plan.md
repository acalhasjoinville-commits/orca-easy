

# Combobox com busca para seleção de insumos nas Regras

## Problema
Na tela de Configurações, ao cadastrar uma Regra de Cálculo e adicionar insumos, o seletor é um `<Select>` nativo (dropdown). Com muitos insumos cadastrados, a lista fica enorme e difícil de navegar — não há como digitar para filtrar.

## Solução
Substituir o `<Select>` de insumos (linhas ~751-761 de `Configuracoes.tsx`) por um **Combobox com busca** usando os componentes `Popover` + `Command` já existentes no projeto (`src/components/ui/popover.tsx` e `src/components/ui/command.tsx`).

O usuário poderá digitar parte do nome do insumo para filtrar a lista em tempo real.

## Implementação

### Arquivo: `src/components/Configuracoes.tsx`

1. **Adicionar imports** de `Popover`, `PopoverTrigger`, `PopoverContent`, `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem` e o ícone `ChevronsUpDown` / `Check`.

2. **Substituir o bloco `<Select>` de insumo** (linhas 751-761) por um Combobox:
   - `PopoverTrigger` exibe o nome do insumo selecionado ou placeholder "Buscar insumo..."
   - `CommandInput` permite digitar para filtrar
   - `CommandList` renderiza os insumos filtrados
   - Ao selecionar, chama `updateRegraItem(idx, "insumoId", insId)` e fecha o popover

3. **Corrigir o bug TS2345 na linha 1102**: cast `regraMap.get(e.regraId)` para `string` — `normalize((regraMap.get(e.regraId) ?? "") as string)`.

### Nenhuma mudança em lógica de negócio
- Mesmo `updateRegraItem` e `addRegraItem`
- Mesma estrutura de dados `ItemRegra`
- Apenas troca de componente visual

