

## Diagnóstico

Os orçamentos salvos antes da correção de UUIDs contêm referências aos IDs antigos (`"1"`, `"2"`, `"3"`) nos campos `servicoTemplateId` e `insumosCalculados[].insumoId`. Após a migração para UUIDs, o `find()` não encontra correspondência e o recalculo retorna `null` silenciosamente — por isso os custos de insumos não aparecem.

**Existem dois cenários afetados:**
1. **Edição de orçamentos antigos** — `servicoTemplateId: "1"` não encontra nenhum serviço no catálogo atual (que agora tem UUID).
2. **Criação de novos orçamentos** — Funciona normalmente porque os novos `servicoTemplateId` já são UUIDs válidos.

## Plano de Correção

### 1. Migração de dados no banco (SQL)

Atualizar o campo JSONB `itens_servico` de todos os orçamentos existentes, substituindo os IDs antigos pelos novos UUIDs:

- `servicoTemplateId: "1"` → `"50000000-0000-0000-0000-000000000001"`
- `servicoTemplateId: "2"` → `"50000000-0000-0000-0000-000000000002"`
- `servicoTemplateId: "3"` → `"50000000-0000-0000-0000-000000000003"`
- `servicoTemplateId: "4"` → `"50000000-0000-0000-0000-000000000004"`

E dentro de `insumosCalculados`:
- `insumoId: "1"` → `"30000000-0000-0000-0000-000000000001"`
- `insumoId: "2"` → `"30000000-0000-0000-0000-000000000002"`
- `insumoId: "3"` → `"30000000-0000-0000-0000-000000000003"`

Isso será feito via uma migration SQL com múltiplos `UPDATE ... SET itens_servico = ...` usando funções JSONB do PostgreSQL.

### 2. Nenhuma alteração nos componentes

O código do `AddServicoModal`, `OrcamentoWizard` e `calcEngine` está correto — o problema é exclusivamente de dados legados no banco.

## Resultado

Após a migração, os orçamentos antigos voltarão a exibir os custos de insumos corretamente durante edição, e novos orçamentos continuarão funcionando normalmente.

