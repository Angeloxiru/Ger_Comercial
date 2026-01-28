# 🌐 Guia de Importação Web de Vendas

## ✅ Solução 100% Web - Sem Instalação!

Você agora pode importar vendas **direto no navegador**, sem precisar instalar Node.js, npm ou qualquer dependência!

---

## 🚀 Como Usar (Passo a Passo)

### **Passo 1: Acessar a Dashboard**

1. Abra seu navegador
2. Acesse: `dashboards/dashboard-gerenciar-usuarios.html`
3. Clique na aba **"Importação de Dados"**

### **Passo 2: Selecionar Tabela**

1. No dropdown **"Selecione a tabela para importar"**
2. Escolha: **💰 Vendas (vendas) - Apenas Série EP**

Você verá as informações:
- ⚠️ **FILTRO**: Apenas registros com Série = "EP" serão importados
- **Chave Primária**: Gerada automaticamente (Nota Fiscal + Produto)
- **Cabeçalhos do Excel**: Lista com os 24 cabeçalhos necessários

### **Passo 3: Baixar Template**

1. Clique no botão **"📥 Baixar Template CSV"**
2. Um arquivo `template_vendas.csv` será baixado

O template contém:
- Instruções importantes no início (linhas com #)
- Cabeçalhos corretos na primeira linha de dados
- Uma linha de exemplo

### **Passo 4: Preparar seus Dados**

Você tem **2 opções**:

#### **Opção A: Usar o Template**
1. Abra o `template_vendas.csv` no Excel
2. **Apague a linha de exemplo** (linha 2)
3. Cole seus dados começando na linha 2
4. **Mantenha os cabeçalhos** da linha 1
5. Salve como **"CSV (separado por vírgulas)"** ou **"Texto Unicode"**

#### **Opção B: Converter sua Planilha**
1. Abra sua planilha de vendas no Excel
2. **Renomeie os cabeçalhos** da primeira linha para:
   ```
   Série;Nota Fiscal;Emissão;Produto;Qtde.Faturada;Nat.Oper.;Família;Complemento;Cliente;Nome;Fantasia;Representante;UF;Cidade;Peso Líq.;Preço.Unitário;% Desc.;Valor Bruto;Valor Desconto;Valor Líquido;Valor Financeiro;Grupo Empresa;Preço Unit. Liq.;Preço Bruto
   ```
3. Salve como **CSV** ou **TXT**

### **Passo 5: Importar**

1. Na dashboard, você verá uma área de upload com:
   - **"🎯 Arraste seu arquivo aqui"**
   - Ou clique para selecionar

2. **Arraste** seu arquivo CSV/TXT ou **clique** para selecionar

3. O sistema mostrará:
   - ✅ Nome do arquivo
   - ✅ Tamanho do arquivo

4. Clique no botão **"🚀 Iniciar Importação"**

### **Passo 6: Acompanhar Progresso**

Você verá em tempo real:
```
🔄 Iniciando importação...
📖 Lendo arquivo CSV...
🔍 Analisando dados...
✔️ Validando colunas e dados...
✅ 1500 registros válidos
🔌 Conectando ao banco Turso...
💾 Importando para o banco de dados...
✅ Importação concluída!
📊 Registros importados: 1200
```

---

## 📋 Estrutura dos Cabeçalhos

Sua planilha **DEVE** ter exatamente estes cabeçalhos:

| # | Cabeçalho | Obrigatório | Observação |
|---|-----------|-------------|------------|
| 1 | Série | ✅ Sim | Deve ser "EP" |
| 2 | Nota Fiscal | ✅ Sim | Parte da chave primária |
| 3 | Emissão | Não | Data de emissão |
| 4 | Produto | ✅ Sim | Parte da chave primária |
| 5 | Qtde.Faturada | Não | Quantidade |
| 6 | Nat.Oper. | Não | Natureza operação |
| 7 | Família | Não | Família do produto |
| 8 | Complemento | Não | - |
| 9 | Cliente | Não | Código do cliente |
| 10 | Nome | Não | Nome do cliente |
| 11 | Fantasia | Não | Razão social |
| 12 | Representante | Não | Código representante |
| 13 | UF | Não | Estado |
| 14 | Cidade | Não | Cidade |
| 15 | Peso Líq. | Não | Peso líquido |
| 16 | Preço.Unitário | Não | Preço unitário |
| 17 | % Desc. | Não | % desconto |
| 18 | Valor Bruto | Não | Valor bruto |
| 19 | Valor Desconto | Não | Valor desconto |
| 20 | Valor Líquido | Não | Valor líquido |
| 21 | Valor Financeiro | Não | Valor financeiro |
| 22 | Grupo Empresa | Não | Grupo empresa |
| 23 | Preço Unit. Liq. | Não | Preço unit. líquido |
| 24 | Preço Bruto | Não | Preço bruto |

---

## ⚠️ IMPORTANTE

### 1. **Filtro Automático**
- ✅ Apenas registros com **Série = "EP"** serão importados
- ✅ Outros registros são ignorados automaticamente

### 2. **Chave Primária**
- ✅ Gerada automaticamente: **Nota Fiscal + Produto**
- ✅ Exemplo: NF "123456" + Produto "PROD001" = `123456PROD001`

### 3. **Campos Obrigatórios**
- ✅ **Série** (deve ser "EP")
- ✅ **Nota Fiscal** (não pode estar vazia)
- ✅ **Produto** (não pode estar vazio)

### 4. **Duplicados**
- ✅ São **ignorados automaticamente** (INSERT OR IGNORE)
- ✅ Você pode reimportar sem problemas

### 5. **Tamanho do Arquivo**
- ✅ Máximo: **50 MB**
- ✅ Formatos: **CSV, TXT, TSV, TAB**

---

## 🎯 Exemplo Prático

### Conteúdo do CSV:

```csv
Série;Nota Fiscal;Emissão;Produto;Qtde.Faturada;Nat.Oper.;Família;Complemento;Cliente;Nome;Fantasia;Representante;UF;Cidade;Peso Líq.;Preço.Unitário;% Desc.;Valor Bruto;Valor Desconto;Valor Líquido;Valor Financeiro;Grupo Empresa;Preço Unit. Liq.;Preço Bruto
EP;123456;2024-01-15;PROD001;10;5.102;ALIMENTOS;Cx 12un;CLI001;João Silva;Silva & Cia;REP001;SP;São Paulo;5.5;25.00;10;250.00;25.00;225.00;225.00;GERMANI;22.50;250.00
EP;123457;2024-01-16;PROD002;20;5.102;BEBIDAS;Fardo 24un;CLI002;Maria Santos;Santos Ltda;REP002;RJ;Rio de Janeiro;10.0;15.00;5;300.00;15.00;285.00;285.00;GERMANI;14.25;300.00
```

### O que acontece:
1. ✅ Ambos registros têm Série = "EP" → serão importados
2. ✅ Chaves primárias geradas:
   - `123456PROD001`
   - `123457PROD002`
3. ✅ Colunas mapeadas automaticamente para o banco
4. ✅ Inseridos na tabela `vendas`

---

## 🛠️ Troubleshooting

### ❌ Erro: "Cabeçalhos obrigatórios ausentes"

**Causa**: Faltam cabeçalhos obrigatórios (Série, Nota Fiscal, Produto)

**Solução**:
1. Baixe o template novamente
2. Certifique-se que tem todos os 24 cabeçalhos
3. Não altere os nomes dos cabeçalhos

### ❌ Erro: "Nota Fiscal não pode estar vazia"

**Causa**: Há linhas com Nota Fiscal vazia

**Solução**:
1. Verifique sua planilha
2. Preencha todas as células da coluna "Nota Fiscal"
3. Remova linhas vazias

### ❌ Nenhum registro importado

**Causa**: Não há registros com Série = "EP"

**Solução**:
1. Verifique a coluna "Série"
2. Certifique-se que tem o valor exato "EP" (case-sensitive)
3. Remova espaços antes/depois

### ❌ Arquivo muito grande

**Causa**: Arquivo maior que 50 MB

**Solução**:
1. Divida o arquivo em partes menores
2. Importe cada parte separadamente

---

## 💡 Dicas

### 📝 Preparando os Dados

1. ✅ **Teste primeiro** com 10-20 registros
2. ✅ **Use o template** fornecido como base
3. ✅ **Salve como UTF-8** para preservar acentos
4. ✅ **Remova linhas vazias** entre os dados

### 🚀 Durante a Importação

1. ✅ **Não feche** o navegador durante a importação
2. ✅ **Aguarde** a mensagem de conclusão
3. ✅ **Leia** as estatísticas ao final

### ✅ Depois da Importação

1. ✅ **Confira** alguns registros no dashboard
2. ✅ **Verifique** se os valores estão corretos
3. ✅ **Guarde** o arquivo original como backup

---

## 📊 Recursos da Importação Web

| Recurso | Descrição |
|---------|-----------|
| **Drag & Drop** | Arraste arquivos direto para a área de upload |
| **Validação** | Valida cabeçalhos e campos obrigatórios |
| **Filtro automático** | Apenas Série = "EP" |
| **Chave primária** | Gerada automaticamente |
| **Mapeamento** | Converte Excel → Banco automaticamente |
| **Progress bar** | Acompanhe o progresso em tempo real |
| **Log detalhado** | Veja cada etapa da importação |
| **Encoding** | Detecta e corrige automaticamente UTF-8/Windows-1252 |
| **Separador** | Detecta vírgula, ponto-e-vírgula ou TAB |
| **Duplicados** | Ignora automaticamente (INSERT OR IGNORE) |

---

## 🔄 Importar Múltiplos Arquivos

Se você tem vários arquivos para importar:

1. Importe o primeiro arquivo
2. Aguarde a conclusão
3. Repita o processo para o próximo arquivo
4. Os duplicados serão ignorados automaticamente

---

## 🎯 Resumo Rápido

```
1. Acesse: dashboards/dashboard-gerenciar-usuarios.html
2. Clique: aba "Importação de Dados"
3. Selecione: "💰 Vendas (vendas) - Apenas Série EP"
4. Baixe: template CSV
5. Prepare: seus dados com os cabeçalhos corretos
6. Arraste: arquivo para a área de upload
7. Clique: "🚀 Iniciar Importação"
8. Aguarde: conclusão (acompanhe o progresso)
9. Pronto! ✅
```

---

## 📞 Suporte

Em caso de dúvidas:
1. Verifique se seguiu todos os passos deste guia
2. Confirme que os cabeçalhos estão corretos
3. Teste com um arquivo pequeno primeiro
4. Verifique os logs de erro na tela

---

**Última atualização**: Janeiro 2026
**Versão**: 1.0.0 (Interface Web)
