
Objetivo: aplicar de forma verificável a preservação de override manual de insumos no fluxo de orçamento, sem migração e sem alteração em lote.

1) Exploração do estado atual (confirmado no código)
- `src/lib/types.ts`: `ItemServico` já contém `insumosOverrides?: Record<string, number>`.
- `src/components/AddServicoModal.tsx`: já existe cálculo de `realOverrides`, persistência de `insumosOverrides`, input com `min="0"`, `step="1"`, `inputMode="numeric"`, `parseInt(raw, 10)`, e remoção de override quando `raw === ''`.
- `src/components/OrcamentoWizard.tsx` (`saveEditItem`): já recalcula base, limpa órfãos e não-reais, reaplica overrides restantes, recalcula totais e salva `insumosOverrides` como `undefined` quando vazio.

2) Plano de implementação (para deixar inequívoco no repositório principal)
- Reforçar/garantir exatamente estes pontos nos 3 arquivos, mantendo comportamento idêntico ao especificado:
  a) `src/lib/types.ts`
  - `insumosOverrides?: Record<string, number>;` permanece opcional (compatibilidade com itens antigos).
  b) `src/components/AddServicoModal.tsx`
  - `realOverrides` baseado em diferença entre `editQtds` e base calculada.
  - `handleSave` salva:
    - `insumosOverrides: Object.keys(realOverrides).length > 0 ? realOverrides : undefined`
  - Input manual:
    - sem `parseInt(...) || 0`
    - `raw === ''` remove override
    - `parseInt(raw, 10)` explícito
    - rejeita inválido/negativo
    - não converte vazio para zero.
  c) `src/components/OrcamentoWizard.tsx` (`saveEditItem`)
  - recalcular `insumosBase`
  - ler `item.insumosOverrides` (opcional)
  - limpar:
    - órfãos (id não existe mais em `insumosBase`)
    - não-reais (`overrideQty === baseQty`)
  - reaplicar `cleanedOverrides` sobre `insumosBase`
  - recalcular `custoTotalInsumos`, `custoTotalObra`, `valorVenda`
  - persistir:
    - `insumosCalculados` finais
    - `insumosOverrides: cleanedOverrides` e `undefined` quando vazio.

3) Garantias obrigatórias (serão preservadas)
- Nenhuma migration.
- Nenhuma atualização em lote de orçamentos antigos.
- Mudança só no fluxo normal de salvar item.
- Editar metragem/dificuldade não apaga override manual válido.
- Itens antigos sem `insumosOverrides` seguem funcionando.

4) Critério de aceite (checagem final objetiva)
- `ItemServico` exibe `insumosOverrides?: Record<string, number>`.
- `AddServicoModal` persiste `insumosOverrides` (apenas reais).
- Input não usa `parseInt(...) || 0`.
- Campo vazio remove override.
- `saveEditItem()` reaplica overrides salvos.
- `saveEditItem()` remove órfãos.
- `saveEditItem()` remove overrides que ficaram iguais ao novo base.

5) Entrega após implementação
- Resumo técnico curto por arquivo.
- Lista de arquivos alterados.
- Confirmação explícita: sem alteração em lote de orçamentos antigos.
- Confirmação explícita: editar metragem/dificuldade não apaga override manual.
