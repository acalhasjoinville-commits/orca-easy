

# Plano — Fase 2: Operacional ✅

## Features implementadas
- Status "Cancelado"
- Convite de Usuários
- Edição de Perfil
- Busca Global de Orçamentos

---

# Refinamento Global UX/UI ✅

## Mudanças aplicadas

### Design Tokens
- `--radius`: 0.75rem → 0.5rem (mais sóbrio)
- `.card-hover`: removido `-translate-y-0.5`, mantido apenas `hover:shadow`

### Dashboard
- Consolidou blocos 2 (Status) + 3 (Resumo Comercial) em grid único com contagem + valor
- Fundiu blocos Desempenho + Faturamento/Recebimento em grid 2x3
- Últimos Orçamentos: de cards individuais para lista compacta com divide-y
- Atalhos Rápidos: de cards h-20 para botões inline compactos (não removidos)
- Títulos: text-foreground em vez de text-primary

### Orçamentos
- Desktop: tabela com colunas #/Cliente/Status/Valor/Data/Motor/Ações
- Mobile: cards compactos preservados
- Status badges: rounded-md em vez de rounded-full
- Filter chips: rounded-md
- Todas funcionalidades preservadas: clique detalhes, menu 3 pontos, troca status inline

### Clientes
- Desktop: tabela com colunas Tipo/Nome/Documento/WhatsApp/Cidade/Ações
- Mobile: cards com border-l-4 preservados
- Ações agrupadas em menu 3 pontos (MoreVertical)
- Contagem no subtitle do header

### OrcamentoDetails
- Pipeline circles h-7 w-7 (de h-6 w-6)
- Status badge rounded-md
- max-w-4xl (de max-w-3xl)
- Todas seções preservadas: pipeline, action bar, resumo financeiro, itens, insumos

### Configurações
- Título text-foreground em vez de text-primary
- Dialog max-w-md (de max-w-sm)
- Tab triggers text-[11px] com truncate
- Adicionado lg:px-6

### Financeiro
- Título text-xl (de text-2xl)
- Consistência de header com demais telas

### Usuarios
- Header padronizado com title + description
- Padding lg:px-6

### Shell
- Sidebar active: bg-primary/10 text-primary (de bg-accent, evita conflito com cor configurável)
- Header desktop: text-foreground no label, separador visual antes de perfil/logout
- Login: shadow-sm no card

### Integridade
- Zero alterações em: calcEngine, PDFs, hooks, types, queries, mutations, auth, permissões
- Todas funcionalidades preservadas
- Cores primária/destaque configuráveis intactas
