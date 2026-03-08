

## Diagnóstico

Os dados **NOS** foram perdidos. O problema é que as tabelas do banco (motor1, motor2, insumos, regras_calculo, servicos_catalogo) usam colunas `id` do tipo **UUID**, mas os dados seed em `seedData.ts` usam IDs simples como `"1"`, `"2"`, `"3"`.

Nos network requests, vemos erros 400:
```
"invalid input syntax for type uuid: \"1\""
```

A função `seedIfEmpty` detecta que as tabelas estão vazias, tenta inserir os dados seed, mas falha porque `"1"` não é um UUID válido. Resultado: as tabelas ficam permanentemente vazias.

## Plano de Correção

### 1. Corrigir IDs no `seedData.ts`

Substituir todos os IDs simples por UUIDs determinísticos (para manter referências cruzadas entre regras/insumos/serviços):

- Motor1: `"1"` → UUID fixo, `"2"` → UUID fixo, `"3"` → UUID fixo
- Motor2: IDs `"1"`-`"5"` → UUIDs fixos
- Insumos: IDs `"1"`-`"3"` → UUIDs fixos
- Regras: IDs `"1"`-`"4"` → UUIDs fixos (e os `insumoId` internos devem referenciar os novos UUIDs dos insumos)
- Serviços: IDs `"1"`-`"4"` → UUIDs fixos (e `regraId` deve referenciar os novos UUIDs das regras)

Exemplo de mapeamento:
```
Insumo "1" → "00000000-0000-0000-0000-000000000001"
Insumo "2" → "00000000-0000-0000-0000-000000000002"
Insumo "3" → "00000000-0000-0000-0000-000000000003"
Regra "1"  → "00000000-0000-0000-0001-000000000001"
...etc
```

### 2. Atualizar referências cruzadas

- Em `seedRegras`, cada `itensRegra[].insumoId` deve apontar para o novo UUID do insumo correspondente.
- Em `seedServicos`, cada `regraId` deve apontar para o novo UUID da regra correspondente.

### 3. Nenhuma alteração no banco de dados

As tabelas já existem e estão corretas. O problema é apenas nos dados seed do front-end.

### Resultado

Após a correção, ao carregar a aplicação, o `seedIfEmpty` vai detectar as tabelas vazias, inserir os dados seed com UUIDs válidos, e os catálogos voltarão a funcionar normalmente.

