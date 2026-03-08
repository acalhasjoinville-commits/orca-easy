

## Diagnóstico

Na linha 450, a barra fixa de valores usa `fixed bottom-16 left-0 right-0`, o que faz ela ocupar toda a largura da tela — indo por baixo da Sidebar no desktop.

O `max-w-lg` interno (linha 451) limita o conteúdo a ~512px, mas o fundo cinza/branco da div se estica de ponta a ponta.

## Correção

Alterar a barra fixa para respeitar o espaço da Sidebar no desktop. Em vez de `left-0`, usar uma classe responsiva que compense a largura da sidebar (ex: `lg:left-[var(--sidebar-width)]` ou `lg:left-64`). Também remover o `max-w-lg` do container interno, substituindo por um layout mais adequado ao desktop (ex: `max-w-4xl`).

### Edição em `OrcamentoWizard.tsx`:

**Linha 450** — Mudar de:
```
<div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-card shadow-lg">
```
Para:
```
<div className="fixed bottom-0 lg:bottom-0 left-0 lg:left-64 right-0 z-40 border-t bg-card shadow-lg">
```

**Linha 451** — Mudar de:
```
<div className="mx-auto max-w-lg px-4 py-3">
```
Para:
```
<div className="mx-auto max-w-4xl px-4 py-3">
```

> Nota: O `bottom-16` original era para compensar o BottomNav mobile. No desktop a sidebar é lateral, então `bottom-0` é correto. Ajustaremos para `bottom-16 lg:bottom-0` para manter compatibilidade mobile.

