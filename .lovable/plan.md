

## Plano: Reestruturar Navegação de Orçamentos

### Resumo
Transformar o fluxo de clique em orçamento: em vez de abrir direto o Wizard, abrir uma **View de Detalhes read-only**. Criar novo componente `OrcamentoDetails.tsx` e ajustar a navegação.

### Alterações

#### 1. Novo tipo de Tab e estado em `Index.tsx`
- Adicionar nova tab `'orcamento-detalhes'` ao tipo `Tab` (em `AppSidebar.tsx`).
- Adicionar estado `selectedOrcamento` para a view de detalhes (separado de `editingOrcamento`).
- Renomear menu "Orçamento" para "Orçamentos" (plural) — apontar para `dashboard` ou criar tab dedicada de listagem. **Melhor:** manter o tab `'orcamento'` como a listagem e usar `'orcamento-novo'` e `'orcamento-detalhes'` como sub-views.

Fluxo de tabs:
```text
dashboard  →  (mantém como está)
orcamentos →  Dashboard.tsx (listagem)
orcamento-detalhes → OrcamentoDetails.tsx (read-only)
orcamento-novo → OrcamentoWizard (criar/editar)
clientes, financeiro, config → (mantêm)
```

#### 2. Ajustar `AppSidebar.tsx` e `MobileBottomNav.tsx`
- Renomear tab de "Orçamento" para "Orçamentos" com ícone `FileText`.
- O botão flutuante "+" no mobile pode ser mantido para criar novo.
- Tabs `orcamento-detalhes` e `orcamento-novo` devem destacar "Orçamentos" como ativo no menu.

#### 3. Ajustar `Dashboard.tsx` (Listagem)
- Remover `onEditOrcamento` prop — clique no card agora abre detalhes.
- Trocar `onEditOrcamento` por `onViewOrcamento: (orc: Orcamento) => void`.
- Manter botão "+ Novo Orçamento" no topo.
- Remover botões de ação inline (editar, excluir, PDF) dos cards — ficam na view de detalhes.
- Cards ficam mais limpos: status, número, cliente, valor, data.

#### 4. Criar `OrcamentoDetails.tsx` (NOVO)
Componente read-only com:

**Topo:**
- Botão voltar (← Voltar para lista)
- Nome do cliente, número do orçamento, status badge, data

**Centro:**
- Card com lista dos itens/serviços: nome, material, espessura, metragem, dificuldade
- Resumo financeiro: custo total, valor de venda, desconto, valor final

**Barra de ações (rodapé fixo ou seção destacada):**
- `PDFDownloadButton` — "Gerar Proposta" (laranja #F57C00)
- `OSDownloadButton` — "Gerar OS" (visível se aprovado/executado)
- Botão "Editar" (ícone lápis) → navega para OrcamentoWizard em modo edição
- Botão "Excluir" (ícone lixo) → confirma e exclui, volta para listagem

Props: `orcamento`, `onBack`, `onEdit`, `onDelete`

#### 5. Ajustar `Index.tsx` — Orquestração
```tsx
type Tab = 'dashboard' | 'orcamentos' | 'orcamento-detalhes' | 'orcamento-novo' | 'clientes' | 'financeiro' | 'config';

// States
const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);

// Handlers
const goToList = () => setTab('orcamentos');
const goToDetails = (orc) => { setSelectedOrcamento(orc); setTab('orcamento-detalhes'); };
const goToNew = () => { setEditingOrcamento(null); setWizardKey(k+1); setTab('orcamento-novo'); };
const goToEdit = (orc) => { setEditingOrcamento(orc); setWizardKey(k+1); setTab('orcamento-novo'); };

// Render
{tab === 'orcamentos' && <Dashboard onNewOrcamento={goToNew} onViewOrcamento={goToDetails} />}
{tab === 'orcamento-detalhes' && selectedOrcamento && <OrcamentoDetails ... />}
{tab === 'orcamento-novo' && <OrcamentoWizard ... />}
```

#### 6. Header dinâmico
Atualizar os labels no header:
- `orcamentos` → "Orçamentos"
- `orcamento-detalhes` → "Detalhes do Orçamento"  
- `orcamento-novo` → editingOrcamento ? "Editar Orçamento" : "Novo Orçamento"

### Arquivos afetados
1. `src/components/AppSidebar.tsx` — renomear tab e tipo
2. `src/components/MobileBottomNav.tsx` — renomear tab
3. `src/pages/Index.tsx` — nova lógica de navegação
4. `src/components/Dashboard.tsx` — simplificar cards, trocar handler
5. **NOVO** `src/components/OrcamentoDetails.tsx` — view read-only

