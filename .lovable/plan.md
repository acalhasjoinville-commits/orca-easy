

## Plano: Redesign Profissional do PDF + Correção de Exportação

### Problemas Identificados

1. **Layout pouco profissional**: Fontes pequenas, espaçamentos apertados, falta de hierarquia visual clara, blocos sem respiro.
2. **Exportação não funciona**: O método atual usa `window.open()` + Data URI em iframe. Isso é bloqueado por pop-up blockers na maioria dos navegadores modernos e não permite download direto nem impressão.

---

### O Que Será Feito

#### 1. Redesign Completo do PDF

- **Header**: Barra primária mais alta (42mm), logo maior, nome da empresa em fonte 18pt, dados da empresa com mais espaçamento.
- **Faixa de Título**: "PROPOSTA COMERCIAL Nº XXX" centralizada com data à direita, mais destaque.
- **Bloco Cliente**: Card com fundo cinza claro (#F8F9FA), ícone visual, dados organizados em grid (Nome/Documento à esquerda, WhatsApp/Endereço à direita).
- **Escopo do Serviço**: Box com borda lateral colorida (corPrimaria) em vez de fundo chapado, texto com fonte 9pt.
- **Tabela de Serviços**: Theme `striped` em vez de `grid` para visual mais limpo, padding maior, cabeçalho com cantos arredondados.
- **Valor Final**: Box maior com padding generoso, fonte 16pt, cor de destaque (#F57C00).
- **Condições e Garantia**: Layout em colunas com ícones/bullets, separadores sutis.
- **Assinaturas**: Espaço maior, linhas pontilhadas em vez de sólidas, labels em itálico.
- **Footer**: Mais discreto, com linha fina separadora.

#### 2. Correção da Exportação (Download + Impressão)

Substituir o método `window.open()` + iframe por **`doc.save()`** como método primário, que faz download direto do arquivo PDF. Adicionalmente, oferecer um botão separado ou fallback com `doc.output('blob')` + `URL.createObjectURL()` para pré-visualização quando suportado.

**Abordagem**: Usar `doc.save('proposta-XXX.pdf')` que funciona universalmente em todos os navegadores e dispositivos (incluindo iOS Safari). O usuário recebe o PDF como download e pode abrir/imprimir pelo app de PDF nativo do dispositivo.

#### 3. Paginação

- Manter e melhorar a função `checkPage` existente com margem inferior de 25mm.
- Garantir que o footer de branding apareça em **todas** as páginas.

---

### Arquivos Alterados

- **`src/lib/generatePdf.ts`**: Reescrita completa do layout e método de output.

