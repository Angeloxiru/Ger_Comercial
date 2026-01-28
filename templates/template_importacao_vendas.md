# Template de Importação de Vendas

## 📋 Cabeçalhos Obrigatórios da Planilha Excel

Sua planilha Excel **DEVE** conter exatamente estes cabeçalhos na primeira linha:

```
Série | Nota Fiscal | Emissão | Produto | Qtde.Faturada | Nat.Oper. | Família | Complemento | Cliente | Nome | Fantasia | Representante | UF | Cidade | Peso Líq. | Preço.Unitário | % Desc. | Valor Bruto | Valor Desconto | Valor Líquido | Valor Financeiro | Grupo Empresa | Preço Unit. Liq. | Preço Bruto
```

## ⚠️ IMPORTANTE

1. **Filtro Automático**: Apenas registros com `Série = "EP"` serão importados
2. **Chave Primária**: Gerada automaticamente concatenando `Nota Fiscal + Produto`
3. **Colunas Obrigatórias**:
   - `Série` (deve ser "EP")
   - `Nota Fiscal`
   - `Produto`

## 📝 Exemplo de Dados

| Série | Nota Fiscal | Emissão | Produto | Qtde.Faturada | Nat.Oper. | Família | Complemento | Cliente | Nome | Fantasia | Representante | UF | Cidade | Peso Líq. | Preço.Unitário | % Desc. | Valor Bruto | Valor Desconto | Valor Líquido | Valor Financeiro | Grupo Empresa | Preço Unit. Liq. | Preço Bruto |
|-------|-------------|---------|---------|---------------|-----------|---------|-------------|---------|------|----------|---------------|----|---------| ----------|----------------|---------|-------------|----------------|---------------|------------------|---------------|------------------|-------------|
| EP | 123456 | 2024-01-15 | PROD001 | 10 | 5.102 | ALIMENTOS | Cx com 12 unidades | CLI001 | João Silva | Silva & Cia | REP001 | SP | São Paulo | 5.5 | 25.00 | 10 | 250.00 | 25.00 | 225.00 | 225.00 | GERMANI | 22.50 | 250.00 |
| EP | 123457 | 2024-01-16 | PROD002 | 20 | 5.102 | BEBIDAS | Fardo com 24 unidades | CLI002 | Maria Santos | Santos Ltda | REP002 | RJ | Rio de Janeiro | 10.0 | 15.00 | 5 | 300.00 | 15.00 | 285.00 | 285.00 | GERMANI | 14.25 | 300.00 |

## 🎯 Formatos Aceitos

- **Arquivo**: `.xlsx`, `.xlsm`, `.xls`
- **Datas**: Qualquer formato reconhecido pelo Excel (ex: `2024-01-15`, `15/01/2024`)
- **Números**: Use ponto `.` ou vírgula `,` como decimal
- **Campos vazios**: Serão importados como `NULL`

## 🚀 Como Importar

### Opção 1: Via NPM Script
```bash
npm run importar-vendas caminho/para/vendas.xlsx
```

### Opção 2: Via Node.js direto
```bash
node scripts/importar-vendas-excel.js caminho/para/vendas.xlsx
```

## 📊 O que o Script Faz

1. ✅ Lê o arquivo Excel
2. ✅ Filtra apenas registros com `Série = "EP"`
3. ✅ Valida todas as colunas obrigatórias
4. ✅ Gera chave primária (`Nota Fiscal + Produto`)
5. ✅ Converte valores numéricos automaticamente
6. ✅ Insere em lotes de 500 registros (performance otimizada)
7. ✅ Ignora duplicados (INSERT OR IGNORE)
8. ✅ Exibe progresso em tempo real
9. ✅ Gera relatório de estatísticas

## 🔍 Validações Realizadas

- **Campos obrigatórios**: Nota Fiscal e Produto não podem estar vazios
- **Série**: Deve ser exatamente "EP" (case-sensitive)
- **Números**: Valores numéricos são validados e convertidos
- **Duplicados**: Registros duplicados são ignorados automaticamente

## 📈 Exemplo de Saída do Script

```
╔═══════════════════════════════════════════════════════╗
║   IMPORTADOR DE VENDAS - EXCEL → TURSO               ║
║   Filtro: Apenas Série = "EP"                        ║
╚═══════════════════════════════════════════════════════╝

🔌 Conectando ao Turso...
✅ Conectado ao banco de dados

📖 Lendo arquivo: vendas_2024.xlsx
✅ Arquivo lido: 5000 registros encontrados
📊 Planilha: "Vendas"

🔄 Processando registros...
✅ Processamento concluído:
   - Total lidos: 5000
   - Série != "EP": 1200
   - Válidos para importar: 3800

💾 Inserindo 3800 registros em lotes de 500...
   [██████████████████████████████████████████████████] 100% - Lote 8/8
✅ Inserção concluída

📊 ESTATÍSTICAS FINAIS:
══════════════════════════════════════════════════════
   Total de registros lidos:      5000
   Filtrados (Série != "EP"):     1200
   Inseridos com sucesso:         3800
   Duplicados (ignorados):        0
   Erros:                         0
══════════════════════════════════════════════════════

✅ Importação concluída com sucesso!

⏱️  Tempo total: 12.45s
```

## 🛠️ Troubleshooting

### Erro: "Nota Fiscal ou Produto ausente"
- Verifique se todas as linhas possuem Nota Fiscal e Produto preenchidos

### Nenhum registro importado
- Confirme que há registros com `Série = "EP"`
- Verifique se os cabeçalhos estão exatamente como especificado

### Valores numéricos incorretos
- Use ponto `.` ou vírgula `,` como separador decimal
- Não use símbolos de moeda (R$, $, etc)

### Duplicados ignorados
- Isso é normal! O script usa `INSERT OR IGNORE` para evitar erros
- A chave primária é `Nota Fiscal + Produto`, então combinações repetidas são ignoradas

## 💡 Dicas

1. **Grandes volumes**: O script suporta arquivos grandes (testado com 100k+ registros)
2. **Múltiplos arquivos**: Execute o script várias vezes para importar múltiplos arquivos
3. **Backup**: Sempre mantenha backup dos arquivos originais
4. **Teste primeiro**: Teste com um arquivo pequeno antes de importar tudo

## 📞 Suporte

Em caso de dúvidas ou problemas, verifique:
1. Se o arquivo Excel está no formato correto
2. Se os cabeçalhos estão exatamente como especificado
3. Se há registros com Série = "EP"
4. Os logs de erro do script
