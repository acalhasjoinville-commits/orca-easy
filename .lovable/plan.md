

# Correção de Layout Mobile e Visibilidade de Valores — Detalhes do Orçamento

## Diagnóstico

### Problema 1: Valores quase invisíveis
A classe `text-accent` é usada para os valores monetários, mas `--accent` no tema claro é `HSL(220, 16%, 94%)` — praticamente branco. Isso torna todos os preços ilegíveis. Afeta:
- Número do orçamento (`#1010`) — linha 443
- Preço no header — linha 461
- Preço de cada item — linha 582
- Valor Final no resumo — linha 630

### Problema 2: Header card apertado no mobile
No mobile (375px), o header tenta colocar na mesma linha: `#1010` + badge de status + badge de motor + preço. Tudo fica espremido e sobreposto (visível no IMG_0355).

## Alterações Planejadas

### `src/components/OrcamentoDetails.tsx`

**A. Trocar `text-accent` por cor legível nos valores monetários**

Substituir todas as ocorrências de `text-accent` usadas em valores/preços por `text-primary` (que é `HSL(231, 65%, 55%)` — azul/indigo legível). Pontos:
- Linha 443: `text-accent` → `text-primary` (número do orçamento)
- Linha 461: `text-accent` → `text-primary` (preço header)
- Linha 582: `text-accent` → `text-primary` (preço de cada item)
- Linha 630: `text-accent` → `text-primary` (valor final)

**B. Reorganizar header card para mobile**

Hoje (linha 440-461):
```
[#1010] [Pendente] [Motor 1]     R$ 1.365,24
Condomínio Residencial Vista Verde
```

Proposta — empilhar no mobile:
```
[#1010] [Pendente] [Motor 1]
Condomínio Residencial Vista Verde
                        R$ 1.365,24
```

Mudanças:
- Linha 440: trocar `flex items-start justify-between` por layout empilhado no mobile — badges na primeira linha, nome do cliente abaixo, valor na terceira linha alinhado à direita
- O preço sai do canto superior direito e vai para baixo do nome do cliente, com tamanho maior e cor legível
- Em desktop (sm+), pode manter lado a lado

**C. Botões de ação (IMG_0357)**

Os botões "Enviar Orçamento", "Cancelar", "Editar", "Duplicar" já estão com `flex-wrap`, funcionando adequadamente. Sem mudança necessária.

## O que NÃO muda
- Nenhuma lógica de cálculo
- Nenhuma alteração de banco
- Nenhuma alteração em outros componentes
- Pipeline bar e timeline mantidos como estão

## Arquivos afetados
- `src/components/OrcamentoDetails.tsx` — ~6 pontos de ajuste de classe CSS

