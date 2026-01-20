# 🔍 Troubleshooting - Agendamentos de Relatórios

Este guia ajuda a diagnosticar problemas quando os emails estão sendo enviados mas sem dados.

## 📊 Ferramentas de Debug Disponíveis

### 1. Debug Agendamento Completo ⭐ PRINCIPAL
**Quando usar**: Quando receber emails vazios ("Nenhum dado encontrado")

**Como executar**:
1. Acesse: https://github.com/Angeloxiru/Ger_Comercial/actions
2. Clique em **"🔍 Debug Agendamento Completo"**
3. Clique em **"Run workflow"**
4. Aguarde alguns segundos
5. Clique na execução que apareceu
6. Clique em **"debug" → "🔍 Executar debug completo"**

**O que ele mostra**:
- ✅ Lista todos os agendamentos ativos
- ✅ Analisa o primeiro agendamento ativo
- ✅ Mostra exatamente qual SQL está sendo executado
- ✅ Mostra os parâmetros (filtros) usados
- ✅ Mostra quantos registros foram encontrados
- ✅ Se encontrou dados, mostra exemplos
- ✅ Se não encontrou, sugere possíveis causas

**Exemplo de saída**:
```
📋 Agendamentos disponíveis:
   ✅ ID 1: teste para debug (produtos-parados)

┌─────────────────────────────────────────────────────┐
│ 📧 ANÁLISE DE AGENDAMENTO
└─────────────────────────────────────────────────────┘

1️⃣  Buscando agendamento no banco...
   ✅ Agendamento encontrado:
      Nome: teste para debug
      Dashboard: produtos-parados
      Período: mes-atual
      Filtros JSON: {"supervisor":"CLERIO"}

2️⃣  Parseando filtros...
   ✅ Filtros parseados: {
         "supervisor": "CLERIO"
       }

3️⃣  Executando busca de dados...
   🔍 Função: buscarProdutosParados
   📋 Filtros recebidos: {"supervisor":"CLERIO"}
   ✓ Filtro: supervisor = "CLERIO"
   📝 SQL: SELECT sku_produto as produto, desc_produto...
   📝 Params: ["CLERIO"]
   ✅ Registros encontrados: 1055

4️⃣  Resultado da busca:
   ✅ DADOS ENCONTRADOS!

   Primeiras 3 linhas:
   1. P123 | Produto Exemplo | Família A | CLERIO | 5 | ALTO | 15/01/2025 | R$ 150,00
```

---

### 2. Debug Dados Vendas
**Quando usar**: Para entender quais períodos têm dados

**Como executar**:
1. Actions → **"🔍 Debug Dados Vendas"** → Run workflow

**O que ele mostra**:
- Formato do campo `emissao` na tabela vendas
- Data mais recente e mais antiga
- Quantos registros existem no mês atual
- Distribuição de vendas por mês
- Testes de períodos dinâmicos

---

### 3. Logs do Workflow Principal
**Quando usar**: Para ver o que aconteceu durante o envio real

**Como executar**:
1. Actions → **"Enviar Relatórios Agendados"**
2. Clique na última execução
3. Veja os logs detalhados

**O que os novos logs mostram**:
```
┌─────────────────────────────────────────────────────┐
│ 📧 teste para debug
└─────────────────────────────────────────────────────┘
    📋 Dashboard: produtos-parados
    📅 Período: mes-atual
    🔍 Filtros JSON: {"supervisor":"CLERIO"}
    🔍 Filtros parseados: {"supervisor":"CLERIO"}
       🔍 Filtro aplicado: supervisor = "CLERIO"
       📝 SQL: SELECT sku_produto as produto, desc_produto...
       📝 Params: ["CLERIO"]
       ✅ Query executada: 1055 registros
    ✅ Dados carregados: 1055 registros
    📊 Primeiras 2 linhas: [...]
```

---

## 🔧 Possíveis Causas e Soluções

### Causa 1: Filtros muito restritivos
**Sintoma**: Debug mostra "0 registros encontrados"

**Solução**:
1. Execute o debug completo
2. Veja quais filtros estão sendo aplicados
3. No dashboard, use o botão "🔍 Testar Filtros" ANTES de salvar
4. Ajuste os filtros até encontrar dados

### Causa 2: Período sem dados
**Sintoma**: Email vazio em dashboards de vendas

**Solução**:
1. Execute **"Debug Dados Vendas"**
2. Veja a seção "Distribuição de vendas por mês"
3. Escolha um período que tenha dados
4. Edite o agendamento e mude o período

**Exemplo**:
```
Distribuição de vendas por mês:
   2024-12: 15000 vendas (R$ 500000.00)  ← Use este!
   2024-11: 14500 vendas (R$ 480000.00)
   2026-01: 0 vendas (R$ 0.00)           ← Mês atual vazio!
```

Se os dados são de 2024, configure o agendamento com:
- **Período**: Mês Anterior OU Últimos 30 dias
- **NÃO use** "Mês Atual" se estamos em 2026

### Causa 3: View não existe
**Sintoma**: Erro no dashboard "Produtos Parados"

**Solução**:
1. Verifique se a view existe:
   ```sql
   SELECT name FROM sqlite_master WHERE type='view' AND name='vw_produtos_parados';
   ```
2. Se não existir, execute o arquivo `/sql/views/create_view_produtos_parados.sql` no Turso

### Causa 4: Coluna "periodo" não existe
**Sintoma**: Erro ao salvar/editar agendamento

**Solução**:
```sql
ALTER TABLE agendamentos_relatorios ADD COLUMN periodo TEXT DEFAULT 'mes-atual';
UPDATE agendamentos_relatorios SET periodo = 'mes-atual' WHERE periodo IS NULL;
```

---

## 📋 Checklist de Diagnóstico

Siga estes passos em ordem:

- [ ] 1. Execute **"Debug Agendamento Completo"**
  - [ ] Identifique qual agendamento está falhando
  - [ ] Veja a SQL e os parâmetros
  - [ ] Anote quantos registros foram encontrados

- [ ] 2. Se encontrou 0 registros:
  - [ ] Execute **"Debug Dados Vendas"**
  - [ ] Identifique qual período tem dados
  - [ ] Edite o agendamento para usar esse período
  - [ ] Use o botão **"🔍 Testar Filtros"** no formulário

- [ ] 3. Se ainda não funcionar:
  - [ ] Copie todo o log do "Debug Agendamento Completo"
  - [ ] Copie todo o log do "Debug Dados Vendas"
  - [ ] Envie para análise

---

## 🎯 Exemplo Prático de Diagnóstico

**Problema**: Email de "Vendas por Região" está vazio

**Passo 1**: Debug Agendamento Completo
```
Dashboard: vendas-regiao
Período: mes-atual
Filtros: {"rota":"Santa Cruz"}
SQL: ... WHERE v.emissao >= date('now', 'start of month') ...
Params: ["Santa Cruz"]
✅ 0 registros encontrados  ← PROBLEMA!
```

**Passo 2**: Debug Dados Vendas
```
Data mais recente: 2024-12-31
Mês atual (2026-01): 0 vendas  ← Sem dados!
Últimos 30 dias: 0 vendas
Mês Anterior (2024-12): 15000 vendas  ← AQUI TEM DADOS!
```

**Passo 3**: Solução
1. Editar agendamento
2. Mudar Período de "Mês Atual" para "Mês Anterior"
3. Testar filtros novamente
4. Salvar
5. Executar workflow

---

## 💡 Dicas

1. **Sempre teste antes de salvar**: Use o botão "🔍 Testar Filtros"

2. **Entenda seus dados**: Execute o "Debug Dados Vendas" uma vez para conhecer seu banco

3. **Verifique os logs**: Os novos logs mostram exatamente o que está acontecendo

4. **Comece simples**: Teste sem filtros primeiro, depois adicione filtros aos poucos

5. **Período correto**: Se seus dados são antigos, não use "Mês Atual"

---

## 🆘 Precisa de Ajuda?

Se seguiu todos os passos e ainda não funciona:

1. Execute **"Debug Agendamento Completo"**
2. Execute **"Debug Dados Vendas"**
3. Copie TODOS os logs
4. Descreva o problema
5. Envie para análise
