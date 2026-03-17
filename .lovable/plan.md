

## Correction: Move pre-population logic to useEffect

**File**: `src/components/AddServicoModal.tsx`

**Current** (lines 48-59): setState calls in render body with `lastEditId` tracking.

**Replace with**: A single `useEffect` reacting to `editingItem` and `open`. Remove the `lastEditId` state entirely.

```ts
useEffect(() => {
  if (open && editingItem) {
    setServicoId(editingItem.servicoTemplateId);
    setMetragem(String(editingItem.metragem));
    setDificuldade(editingItem.dificuldade);
    setEditQtds(editingItem.insumosOverrides ?? {});
  }
}, [open, editingItem]);
```

No other files or logic affected.

