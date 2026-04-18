

## Plano: Carrossel de Calendário Diário no Topo da Agenda

### Decisões aprovadas
- **Interação**: Scroll suave até o dia selecionado (preserva visão de pipeline)
- **Alcance**: Infinito com setas semana a semana (~7 dias visíveis por vez)

### Implementação

**Arquivo único afetado**: `src/components/Agenda.tsx`

**1. Novo componente inline `WeekStrip` no topo da Agenda**

Strip horizontal com 7 dias por vez, navegação por setas:
```text
┌──────────────────────────────────────────────────────┐
│  ←   Seg  Ter  QUA  Qui  Sex  Sáb  Dom    [Hoje]  → │
│      18   19  [20]  21   22   23   24               │
│       •         •    •              •                │
└──────────────────────────────────────────────────────┘
       ↑ ponto = tem evento naquele dia
```

- **Estado novo**: `weekStart` (segunda-feira da semana visível) e `selectedDate` (default = hoje)
- **Setas ←/→**: avançam/voltam 7 dias (`weekStart ± 7`)
- **Botão "Hoje"**: reseta para semana atual e seleciona hoje
- **Indicador de eventos**: ponto sob o dia, calculado via `Set<string>` com todas as datas que têm eventos (derivado de `sections`/`eventos` já existentes)
- **Dia "hoje"**: anel/borda diferenciado (`ring-1 ring-primary`)
- **Dia selecionado**: `bg-primary text-primary-foreground`
- **Visual**: card `bg-card border rounded-lg p-2`, cada dia ~52px, `rounded-md`, mobile-first

**2. Scroll-to-date**

- Adicionar `data-agenda-date={section.key}` no `<div>` de cada seção (linha 498)
- Ao clicar num dia do strip:
  - Atualiza `selectedDate`
  - `document.querySelector('[data-agenda-date="YYYY-MM-DD"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })`
  - Se não existir seção exata, encontra a próxima seção mais próxima (≥ data selecionada) como fallback
- Considerar offset de header sticky se houver (usar `scroll-margin-top` na seção)

**3. Posicionamento**

Strip fica logo abaixo do header da página e acima das `Tabs` (Timeline/Visitas), visível em ambas as views. Pode ser sticky no topo em mobile (`sticky top-0 z-10`) — confirmar se o layout permite.

### O que NÃO muda
- Hooks de dados (`useFilaComercial`, `useVisitas`, `useAllRetornos`)
- Agrupamento e ordenação atual de `sections` e `eventos`
- Tabs, filtros e modais existentes
- Banco, tipos, outros componentes

