

## Problema

1. **PDF não abre no iOS**: `window.open(url, '_blank')` com blob URL é bloqueado pelo Safari/iOS como popup. Precisa usar abordagem diferente — salvar o PDF como blob/DataURL no estado e renderizar via `<a download>` ou usar `doc.save()` que força download direto.

2. **Dados inconsistentes no PDF**: O botão PDF usa `editingOrcamento!` (dados antigos do orçamento antes de editar), não os dados atuais da tela. Se o usuário alterar desconto, status, ou detalhes comerciais e clicar PDF sem salvar, o PDF sai com dados desatualizados.

## Plano

### 1. Corrigir geração do PDF para iOS
**Arquivo:** `src/lib/generatePdf.ts`
- Substituir `window.open(blob, '_blank')` por `doc.save('proposta-XXXX.pdf')` que força download direto e funciona no iOS Safari.
- Alternativa: detectar iOS e usar `doc.save()`, senão `window.open`. Recomendo usar `doc.save()` sempre por ser mais confiável cross-platform.

### 2. Gerar PDF com dados atuais da tela
**Arquivo:** `src/components/OrcamentoWizard.tsx`
- Ao clicar em "PDF", montar o objeto `Orcamento` a partir do estado atual (mesma lógica do `handleSave`) em vez de usar `editingOrcamento!`.
- Isso garante que desconto, status, validade, garantia e itens editados apareçam corretamente no PDF.
- Salvar automaticamente o orçamento antes de gerar o PDF (para manter consistência banco ↔ PDF).

### 3. Permitir gerar PDF também em orçamentos novos
- Remover a restrição `isEditing &&` do botão PDF. Após salvar pela primeira vez, o botão já aparece. Opcionalmente, ao clicar PDF num orçamento novo, salvar primeiro e depois gerar.

