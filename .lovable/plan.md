

## Problema

Na screenshot (desktop com sidebar), os botões de ação aparecem como barra fixa sobrepondo o conteúdo. O card "Condições" aparece abaixo dos botões em vez de acima. O layout está inconsistente.

## Correção em `OrcamentoDetails.tsx`

### 1. Reordenar: Condições ANTES dos botões
Mover o card "Condições" para antes da barra de ações desktop, para que os botões fiquem sempre no final do conteúdo.

### 2. Desktop: botões inline (não fixos)
Os botões desktop já usam `hidden lg:flex` inline — confirmar que estão funcionando. Adicionar `mb-4` para espaçamento final.

### 3. Mobile: garantir `lg:hidden` na barra fixa
A barra mobile fixa já tem `lg:hidden`, então não deve aparecer no desktop. Verificar se não há CSS conflitante.

### 4. Padding do container
- Mobile: `pb-44` (espaço para barra fixa + bottom nav)
- Desktop: `lg:pb-8` (só precisa de padding normal)

### Resultado esperado
```text
Desktop:                          Mobile:
┌─────────────────────┐          ┌──────────────────┐
│ Header / Back       │          │ Header / Back    │
│ Itens do Orçamento  │          │ Itens            │
│ Resumo Financeiro   │          │ Resumo           │
│ Condições           │          │ Condições        │
│                     │          │                  │
│ [Enviar] [OS] [Edit]│          │ (scroll content) │
│ [🗑]                │          ├──────────────────┤
│                     │          │ [Enviar]    [🗑] │
└─────────────────────┘          │ [OS]    [Editar] │
                                 ├──────────────────┤
                                 │ Bottom Nav       │
                                 └──────────────────┘
```

### Arquivo: `src/components/OrcamentoDetails.tsx`
- Mover bloco "Condições" (linhas 173-199) para ANTES do bloco "Desktop Action Bar" (linha 202)
- Isso já é o caso no código atual — o problema pode ser que o card Condições tem `mb-4 lg:mb-6` mas os botões desktop estão com `mt-6`, criando espaço adequado

Olhando novamente a screenshot: os botões aparecem como barra fixa **no desktop**. Isso indica que a classe `lg:hidden` na barra mobile pode não estar funcionando, OU o viewport do usuário está abaixo do breakpoint `lg` (1024px).

**Solução real:** Reduzir o breakpoint para `md` (768px) para que a separação mobile/desktop aconteça mais cedo, ou tornar AMBAS as barras inline (não fixas) e usar layout responsivo.

**Abordagem mais robusta:** Remover a barra fixa mobile e usar apenas botões inline com layout responsivo:
- Em telas grandes: botões em linha horizontal
- Em telas pequenas: botões em grid compacto, com scroll natural (não fixo)

Isso elimina todos os conflitos de z-index e sobreposição.

