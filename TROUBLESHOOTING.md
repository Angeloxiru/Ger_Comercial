# 🔧 Guia de Solução de Problemas

## ❌ Problema: Filtros não mostram dados

Se você está vendo os campos de filtro mas nenhuma opção aparece ou os resultados estão vazios, siga este guia:

### 🎯 Passo 1: Verificar Diagnóstico

Abra a página de diagnóstico para identificar o problema:

```
https://angeloxiru.github.io/Ger_Comercial/diagnostico.html
```

Ou localmente:
```
file:///home/user/Ger_Comercial/diagnostico.html
```

**O que verificar:**
- ✅ Conexão com banco está OK?
- ✅ Tabelas têm registros?
- ✅ JOINs estão funcionando?
- ✅ Existem dados nas datas selecionadas?

---

### 🎯 Passo 2: Limpar Cache

Se o diagnóstico mostra que há dados mas os filtros estão vazios, **limpe o cache**:

```
https://angeloxiru.github.io/Ger_Comercial/limpar-cache.html
```

Ou localmente:
```
file:///home/user/Ger_Comercial/limpar-cache.html
```

**Clique em "Limpar Todo o Cache"** e depois **atualize os dashboards**.

---

### 🎯 Passo 3: Verificar Período de Datas

**IMPORTANTE:** Todos os dashboards **exigem** que você selecione:
- ✅ Data Início
- ✅ Data Fim

**Sem o período selecionado, a busca não será executada!**

---

### 🎯 Passo 4: Verificar Console do Navegador

Abra o Console do navegador (F12) e procure por erros:

#### **Chrome/Edge:**
1. Pressione `F12`
2. Clique na aba `Console`
3. Procure por mensagens em vermelho

#### **Firefox:**
1. Pressione `F12`
2. Clique na aba `Console`
3. Procure por erros

#### **Erros Comuns:**

**1. CORS Error:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Solução:** Use HTTPS ou localhost, não `file://`

**2. Module not found:**
```
Failed to load module script: Expected a JavaScript module
```
**Solução:** Certifique-se de estar usando um servidor web (GitHub Pages, Live Server, etc.)

**3. Auth Token:**
```
Token de autenticação não configurado
```
**Solução:** Configure o token em `js/config.js`

---

## 🔍 Verificações Específicas por Dashboard

### 📍 Vendas por Região

**Verificar:**
1. A tabela `tab_cliente` tem a coluna `rota`?
2. Existem vendas vinculadas a clientes com rota?
3. O JOIN `v.cliente = c.cliente` está correto?

**Query de teste no diagnóstico:**
```sql
SELECT COUNT(*) FROM vendas v
LEFT JOIN tab_cliente c ON v.cliente = c.cliente
WHERE c.rota IS NOT NULL
```

---

### 👥 Vendas por Equipe Comercial

**Verificar:**
1. A tabela `tab_representante` tem `rep_supervisor`?
2. Existem vendas vinculadas a representantes?
3. O JOIN `v.representante = r.representante` está correto?

**Query de teste no diagnóstico:**
```sql
SELECT COUNT(*) FROM vendas v
LEFT JOIN tab_representante r ON v.representante = r.representante
WHERE r.rep_supervisor IS NOT NULL
```

---

### 📦 Análise de Produtos

**Verificar:**
1. A tabela `tab_produto` tem `desc_origem` e `desc_familia`?
2. Existem vendas vinculadas a produtos?
3. O JOIN `v.produto = p.produto` está correto?

**Query de teste no diagnóstico:**
```sql
SELECT COUNT(*) FROM vendas v
INNER JOIN tab_produto p ON v.produto = p.produto
WHERE p.desc_origem IS NOT NULL
```

---

## 🗄️ Estrutura do Banco Esperada

### Tabela: `vendas`

**Colunas obrigatórias:**
- `emissao` (data da venda) - formato: 'YYYY-MM-DD'
- `cliente` (FK para tab_cliente)
- `representante` (FK para tab_representante)
- `produto` (FK para tab_produto)
- `qtde_faturada` (quantidade)
- `valor_liquido` (valor em R$)
- `peso_liq` (peso em kg)
- `cidade` (nome da cidade)

### Tabela: `tab_cliente`

**Colunas obrigatórias:**
- `cliente` (PK)
- `rota` (nome da rota)
- `sub_rota` (nome da sub-rota)

### Tabela: `tab_representante`

**Colunas obrigatórias:**
- `representante` (PK)
- `desc_representante` (nome do representante)
- `rep_supervisor` (nome do supervisor)

### Tabela: `tab_produto`

**Colunas obrigatórias:**
- `produto` (PK)
- `desc_produto` (descrição do produto)
- `desc_origem` (origem do produto)
- `desc_familia` (família do produto)

---

## ⚡ Soluções Rápidas

### Problema: "Nenhum resultado encontrado"

**Causas comuns:**
1. ❌ Período de datas não selecionado
2. ❌ Filtros muito restritivos (muitas opções selecionadas)
3. ❌ Não existem vendas no período selecionado
4. ❌ Cache desatualizado

**Soluções:**
1. ✅ Selecione apenas Data Início e Fim (sem outros filtros)
2. ✅ Teste com período mais amplo (ex: todo o ano de 2024)
3. ✅ Limpe o cache e tente novamente
4. ✅ Verifique o diagnóstico

---

### Problema: "Carregando..." infinito

**Causas comuns:**
1. ❌ Token do Turso inválido ou expirado
2. ❌ Conexão com internet instável
3. ❌ Banco de dados offline

**Soluções:**
1. ✅ Verifique `js/config.js` - token está correto?
2. ✅ Regenere o token no Turso Dashboard
3. ✅ Teste a conexão em `teste-conexao.html`
4. ✅ Verifique o console do navegador (F12)

---

### Problema: Filtros carregam mas dados não aparecem

**Causas comuns:**
1. ❌ JOINs entre tabelas não estão funcionando
2. ❌ Dados não existem no período selecionado
3. ❌ Campos NULL nas tabelas relacionadas

**Soluções:**
1. ✅ Execute o diagnóstico completo
2. ✅ Verifique se os relacionamentos (FK) estão corretos
3. ✅ Teste com período mais amplo
4. ✅ Verifique queries de JOIN no diagnóstico

---

## 🛠️ Ferramentas de Diagnóstico

### 1. diagnostico.html
**O que faz:**
- Testa conexão com banco
- Lista todas as tabelas
- Conta registros em cada tabela
- Testa queries de cada dashboard
- Verifica JOINs
- Mostra período de datas disponível

**Quando usar:**
- Quando filtros não carregam
- Quando não aparecem resultados
- Para verificar estrutura do banco

---

### 2. limpar-cache.html
**O que faz:**
- Mostra estatísticas do cache
- Lista itens em cache
- Limpa cache expirado
- Limpa todo o cache

**Quando usar:**
- Quando filtros mostram dados antigos
- Quando mudou dados no banco
- Quando filtros não atualizam

---

### 3. teste-conexao.html
**O que faz:**
- Testa conexão básica com Turso
- Lista tabelas disponíveis
- Executa query simples

**Quando usar:**
- Primeira vez configurando
- Quando trocar token
- Para verificar se banco está acessível

---

## 📞 Ainda com Problemas?

### Checklist Final:

- [ ] Token do Turso está configurado em `js/config.js`?
- [ ] Usando HTTPS ou localhost (não `file://`)?
- [ ] Período de datas está selecionado?
- [ ] Cache foi limpo?
- [ ] Diagnóstico mostra dados existem?
- [ ] Console não mostra erros?
- [ ] Estrutura do banco está correta?

### Informações para Debug:

Ao reportar um problema, inclua:
1. **Qual dashboard** está com problema
2. **Mensagem de erro** do console (F12)
3. **Resultado do diagnóstico** (print ou texto)
4. **Período selecionado** nas datas
5. **Filtros selecionados**

---

## 📚 Recursos Adicionais

- [Documentação Turso](https://docs.turso.tech/)
- [LibSQL Client](https://github.com/libsql/libsql-client-ts)
- [README.md](README.md) - Documentação completa do projeto
