# 📊 Guia da Tabela de Metas Mensais

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura da Tabela](#estrutura-da-tabela)
3. [Como Executar no Turso](#como-executar-no-turso)
4. [Inserir Metas](#inserir-metas)
5. [Consultar Dados](#consultar-dados)
6. [Atualizar Metas](#atualizar-metas)

---

## 🎯 Visão Geral

A tabela **metas_mensais** armazena as metas mensais de cada representante para:
- **Faturamento** (R$)
- **Peso** (Kg)
- **Clientes Ativos** (quantidade)

---

## 📊 Estrutura da Tabela

| Coluna | Tipo | Descrição | Obrigatório |
|--------|------|-----------|-------------|
| `id` | INTEGER | Identificador único (auto-incremento) | ✅ |
| `representante` | TEXT | Código do representante | ✅ |
| `ano_mes` | TEXT | Período no formato "YYYY-MM" (ex: "2026-01") | ✅ |
| `meta_faturamento` | REAL | Meta de faturamento em R$ | ❌ |
| `meta_peso` | REAL | Meta de peso em Kg | ❌ |
| `meta_clientes` | INTEGER | Meta de clientes ativos | ❌ |
| `created_at` | TIMESTAMP | Data de criação (automático) | ❌ |
| `updated_at` | TIMESTAMP | Data de atualização (automático) | ❌ |
| `created_by` | TEXT | Usuário que criou | ❌ |
| `observacao` | TEXT | Observações/notas | ❌ |

**Constraint:**
- Um representante só pode ter UMA meta por mês (UNIQUE)

---

## 🚀 Como Executar no Turso

### Opção 1: Via CLI do Turso

```bash
# 1. Fazer login no Turso
turso auth login

# 2. Conectar ao seu banco de dados
turso db shell [NOME_DO_SEU_BANCO]

# 3. Copiar e colar o conteúdo do arquivo criar_tabela_metas.sql
# (abra o arquivo, copie o conteúdo e cole no shell do Turso)
```

### Opção 2: Via Arquivo SQL Direto

```bash
# Executar o arquivo SQL diretamente
turso db shell [NOME_DO_SEU_BANCO] < sql/criar_tabela_metas.sql
```

### Opção 3: Via Interface Web do Turso

1. Acesse https://turso.tech/app
2. Selecione seu banco de dados
3. Vá em "Query Editor"
4. Cole o conteúdo de `criar_tabela_metas.sql`
5. Execute

---

## ➕ Inserir Metas

### Sintaxe Básica

```sql
INSERT INTO metas_mensais (representante, ano_mes, meta_faturamento, meta_peso, meta_clientes, created_by, observacao)
VALUES ('CODIGO_REP', 'YYYY-MM', VALOR_FATURAMENTO, VALOR_PESO, QTD_CLIENTES, 'USUARIO', 'OBSERVACAO');
```

### Exemplos Práticos

#### 1. Inserir meta para Janeiro de 2026

```sql
INSERT INTO metas_mensais (representante, ano_mes, meta_faturamento, meta_peso, meta_clientes, created_by, observacao)
VALUES ('001', '2026-01', 150000.00, 50000.00, 120, 'admin', 'Meta baseada no histórico de 2025');
```

#### 2. Inserir múltiplas metas de uma vez

```sql
INSERT INTO metas_mensais (representante, ano_mes, meta_faturamento, meta_peso, meta_clientes, created_by) VALUES
('001', '2026-01', 150000.00, 50000.00, 120, 'admin'),
('001', '2026-02', 160000.00, 52000.00, 125, 'admin'),
('001', '2026-03', 165000.00, 53000.00, 130, 'admin'),
('002', '2026-01', 180000.00, 60000.00, 150, 'admin'),
('002', '2026-02', 185000.00, 62000.00, 155, 'admin'),
('003', '2026-01', 120000.00, 40000.00, 100, 'admin');
```

#### 3. Inserir meta com base no código do representante da tab_representante

```sql
-- Primeiro, veja quais representantes existem
SELECT representante, desc_representante FROM tab_representante;

-- Depois, insira a meta usando o código correto
INSERT INTO metas_mensais (representante, ano_mes, meta_faturamento, meta_peso, meta_clientes)
VALUES ('CODIGO_ENCONTRADO', '2026-01', 150000.00, 50000.00, 120);
```

---

## 🔍 Consultar Dados

### 1. Ver todas as metas de um representante

```sql
SELECT * FROM metas_mensais
WHERE representante = '001'
ORDER BY ano_mes DESC;
```

### 2. Ver metas de um mês específico

```sql
SELECT * FROM metas_mensais
WHERE ano_mes = '2026-01'
ORDER BY representante;
```

### 3. Ver metas com dados do representante (JOIN)

```sql
SELECT
    m.id,
    m.representante,
    r.desc_representante AS nome_representante,
    r.rep_supervisor AS supervisor,
    m.ano_mes,
    m.meta_faturamento,
    m.meta_peso,
    m.meta_clientes,
    m.observacao
FROM metas_mensais m
LEFT JOIN tab_representante r ON m.representante = r.representante
WHERE m.ano_mes = '2026-01'
ORDER BY r.rep_supervisor, r.desc_representante;
```

### 4. Ver representantes que NÃO têm meta para determinado mês

```sql
SELECT
    r.representante,
    r.desc_representante,
    r.rep_supervisor
FROM tab_representante r
LEFT JOIN metas_mensais m ON r.representante = m.representante AND m.ano_mes = '2026-01'
WHERE m.id IS NULL
ORDER BY r.rep_supervisor, r.desc_representante;
```

### 5. Ver metas por supervisor

```sql
SELECT
    r.rep_supervisor,
    COUNT(DISTINCT m.representante) AS qtd_representantes,
    SUM(m.meta_faturamento) AS meta_faturamento_total,
    SUM(m.meta_peso) AS meta_peso_total,
    SUM(m.meta_clientes) AS meta_clientes_total
FROM metas_mensais m
LEFT JOIN tab_representante r ON m.representante = r.representante
WHERE m.ano_mes = '2026-01'
GROUP BY r.rep_supervisor
ORDER BY meta_faturamento_total DESC;
```

---

## ✏️ Atualizar Metas

### 1. Atualizar uma meta específica

```sql
UPDATE metas_mensais
SET
    meta_faturamento = 180000.00,
    meta_peso = 55000.00,
    meta_clientes = 130,
    updated_at = CURRENT_TIMESTAMP
WHERE representante = '001' AND ano_mes = '2026-01';
```

### 2. Adicionar observação

```sql
UPDATE metas_mensais
SET
    observacao = 'Meta revisada após reunião comercial',
    updated_at = CURRENT_TIMESTAMP
WHERE representante = '001' AND ano_mes = '2026-01';
```

### 3. Aumentar todas as metas de um mês em 10%

```sql
UPDATE metas_mensais
SET
    meta_faturamento = meta_faturamento * 1.10,
    meta_peso = meta_peso * 1.10,
    meta_clientes = CAST(meta_clientes * 1.10 AS INTEGER),
    updated_at = CURRENT_TIMESTAMP
WHERE ano_mes = '2026-02';
```

---

## 🗑️ Deletar Metas

### 1. Deletar meta específica

```sql
DELETE FROM metas_mensais
WHERE representante = '001' AND ano_mes = '2026-01';
```

### 2. Deletar todas as metas de um mês

```sql
DELETE FROM metas_mensais WHERE ano_mes = '2026-01';
```

---

## 📝 Template para Inserção em Massa

Copie este template e preencha com seus dados:

```sql
-- ============================================================
-- INSERÇÃO DE METAS - [MÊS/ANO]
-- Data de criação: [DATA]
-- Responsável: [NOME]
-- ============================================================

INSERT INTO metas_mensais (representante, ano_mes, meta_faturamento, meta_peso, meta_clientes, created_by) VALUES
('REP1', 'YYYY-MM', 0.00, 0.00, 0, 'admin'),
('REP2', 'YYYY-MM', 0.00, 0.00, 0, 'admin'),
('REP3', 'YYYY-MM', 0.00, 0.00, 0, 'admin');
-- Adicione mais linhas conforme necessário
```

---

## ⚠️ Importante

1. **Formato do ano_mes:** Sempre use "YYYY-MM" (ex: "2026-01", "2026-12")
2. **Valores decimais:** Use ponto (.) e não vírgula (,) - Ex: 150000.00
3. **Códigos de representante:** Devem corresponder aos códigos na tabela `tab_representante`
4. **Constraint UNIQUE:** Não é possível ter duas metas para o mesmo representante no mesmo mês

---

## 🆘 Troubleshooting

### Erro: "UNIQUE constraint failed"
- **Causa:** Tentou inserir uma meta duplicada (mesmo representante + mesmo mês)
- **Solução:** Use UPDATE em vez de INSERT, ou DELETE a meta anterior primeiro

### Erro: "FOREIGN KEY constraint failed"
- **Causa:** O código do representante não existe na tabela `tab_representante`
- **Solução:** Verifique os códigos válidos com:
  ```sql
  SELECT representante, desc_representante FROM tab_representante;
  ```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte este guia
2. Verifique o arquivo `criar_tabela_metas.sql`
3. Entre em contato com o time de TI
