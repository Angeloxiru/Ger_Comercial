# 🛑 Dashboard de Produtos Parados

## 📋 Descrição

Dashboard analítico que identifica produtos que os representantes vendiam regularmente há 4+ semanas, mas pararam de vender recentemente. Ferramenta essencial para gestão comercial e prevenção de perda de clientes.

---

## 🎯 Objetivos

- **Detectar perda de clientes**: Identificar quando um produto para de ser vendido pode indicar perda de cliente
- **Produtos descontinuados**: Descobrir produtos que os representantes pararam de oferecer
- **Análise de risco**: Quantificar o valor potencial perdido com produtos parados
- **Ação proativa**: Permitir que supervisores ajam antes de perder clientes definitivamente

---

## 📊 Funcionalidades

### KPIs Principais

1. **Total de Produtos Parados**: Quantidade de SKUs que pararam de ser vendidos
2. **Valor Total em Risco**: Soma do valor médio perdido de todos os produtos
3. **Representantes Afetados**: Número de vendedores com produtos parados
4. **Média de Semanas Parado**: Tempo médio sem venda dos produtos

### Filtros Disponíveis

- ✅ **Supervisor**: Filtrar por supervisor de vendas
- ✅ **Representante**: Filtrar por vendedor específico
- ✅ **Categoria de Produto**: Filtrar por família/categoria
- ✅ **Nível de Risco**: Crítico / Alto / Médio / Baixo

### Classificação de Risco

| Nível | Semanas Parado | Ação Recomendada |
|-------|----------------|------------------|
| 🔴 **CRÍTICO** | 8+ semanas | Ação imediata! Cliente pode estar perdido |
| 🟠 **ALTO** | 6-7 semanas | Urgente - Contatar representante e cliente |
| 🟡 **MÉDIO** | 4-5 semanas | Monitorar - Verificar motivo |
| 🟢 **BAIXO** | 4 semanas | Observar tendência |

### Visualizações

1. **Tabela Detalhada**: Lista completa de produtos parados com todas as informações
2. **Top 10 Produtos Mais Paralisados**: Gráfico dos produtos que mais representantes pararam de vender
3. **Distribuição por Risco**: Gráfico pizza com a divisão dos níveis de risco

---

## 🗄️ Estrutura do Banco de Dados

### View: `vw_produtos_parados`

```sql
CREATE VIEW vw_produtos_parados AS
-- Identifica produtos vendidos há 4-6 semanas
-- mas que NÃO foram vendidos nas últimas 4 semanas
```

**Colunas retornadas:**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `rep_supervisor` | TEXT | Nome do supervisor |
| `desc_representante` | TEXT | Nome do representante |
| `cod_representante` | TEXT | Código do representante |
| `sku_produto` | TEXT | SKU do produto |
| `desc_produto` | TEXT | Descrição do produto |
| `categoria_produto` | TEXT | Categoria/família do produto |
| `ultima_venda` | DATE | Data da última venda |
| `qtd_semanas_parado` | INTEGER | Semanas desde a última venda |
| `valor_medio_perdido` | DECIMAL | Valor médio das vendas anteriores |
| `qtd_vendas_anteriores` | INTEGER | Quantidade de vendas no período de referência |
| `nivel_risco` | TEXT | CRÍTICO / ALTO / MÉDIO / BAIXO |

---

## 🚀 Como Usar

### 1. Criar a View no Turso

```bash
# Conectar ao banco
turso db shell comercial

# Executar o script
# Copie o conteúdo de: sql/create_view_produtos_parados.sql
```

### 2. Liberar Acesso para Usuários

```sql
-- Exemplo: Liberar para gerente
UPDATE users
SET permissions = '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes","produtos-parados"]'
WHERE username = 'gerente';
```

### 3. Acessar o Dashboard

- Faça login na aplicação
- Clique no card "Produtos Parados 🛑"
- Use os filtros para análise específica

---

## 💡 Casos de Uso

### Caso 1: Identificar Perda de Cliente

**Situação**: Representante parou de vender vários produtos para o mesmo cliente

**Como identificar**:
1. Filtrar por representante específico
2. Observar produtos da mesma categoria
3. Verificar nível de risco CRÍTICO ou ALTO

**Ação**:
- Contatar o representante imediatamente
- Ligar para o cliente para verificar satisfação
- Oferecer soluções ou renegociar condições

### Caso 2: Produto Descontinuado Sem Comunicação

**Situação**: Múltiplos representantes pararam de vender o mesmo produto

**Como identificar**:
1. Verificar gráfico "Top 10 Produtos Mais Paralisados"
2. Produtos com muitos representantes afetados

**Ação**:
- Verificar se produto foi descontinuado
- Comunicar equipe de vendas
- Oferecer produtos substitutos aos clientes

### Caso 3: Monitoramento de Supervisor

**Situação**: Supervisor quer monitorar sua equipe

**Como identificar**:
1. Filtrar por supervisor
2. Verificar valor total em risco
3. Analisar distribuição por nível de risco

**Ação**:
- Reunião com representantes sobre produtos parados
- Definir metas de reativação de vendas
- Acompanhar evolução semanal

---

## 📈 Métricas e Análises

### Análise Recomendada Semanal

```sql
-- Total de produtos parados por semana
SELECT
    COUNT(*) as total_produtos,
    SUM(valor_medio_perdido) as valor_risco,
    AVG(qtd_semanas_parado) as media_semanas
FROM vw_produtos_parados;

-- Supervisores com mais produtos em risco
SELECT
    rep_supervisor,
    COUNT(*) as qtd_produtos,
    SUM(valor_medio_perdido) as valor_total,
    COUNT(DISTINCT desc_representante) as qtd_representantes
FROM vw_produtos_parados
WHERE nivel_risco IN ('CRÍTICO', 'ALTO')
GROUP BY rep_supervisor
ORDER BY valor_total DESC;
```

### KPIs Sugeridos

- **Taxa de Reativação**: % de produtos parados que voltaram a ser vendidos
- **Tempo Médio de Resolução**: Dias entre identificação e resolução
- **Valor Recuperado**: R$ de produtos que voltaram a ser vendidos

---

## ⚙️ Configuração Técnica

### Requisitos da Tabela `vendas`

A view espera que a tabela de vendas tenha estas colunas:

```sql
-- Estrutura esperada
CREATE TABLE vendas (
    rep_supervisor TEXT,
    desc_representante TEXT,
    cod_representante TEXT,
    sku_produto TEXT,
    desc_produto TEXT,
    categoria_produto TEXT,
    valor_total DECIMAL,
    data_venda DATE
);
```

**⚠️ IMPORTANTE**: Se sua tabela tem nomes diferentes, edite o arquivo `sql/create_view_produtos_parados.sql` conforme indicado nos comentários.

### Performance

Para melhor performance, crie estes índices:

```sql
CREATE INDEX idx_vendas_data ON vendas(data_venda);
CREATE INDEX idx_vendas_rep_produto ON vendas(cod_representante, sku_produto);
CREATE INDEX idx_vendas_categoria ON vendas(categoria_produto);
```

---

## 🎨 Personalização

### Alterar Período de Análise

Edite a view para mudar o período de 4 semanas:

```sql
-- Trocar 4 weeks por 6 weeks, por exemplo
WHERE data_venda BETWEEN date('now', '-8 weeks') AND date('now', '-6 weeks')
...
WHERE data_venda >= date('now', '-6 weeks')
```

### Adicionar Mais Níveis de Risco

```sql
CASE
    WHEN semanas >= 12 THEN 'EMERGÊNCIA'
    WHEN semanas >= 8 THEN 'CRÍTICO'
    WHEN semanas >= 6 THEN 'ALTO'
    -- ...
END as nivel_risco
```

---

## 🐛 Troubleshooting

### Problema: View retorna vazia

**Possíveis causas**:
1. Não há dados suficientes (precisa de pelo menos 6 semanas de histórico)
2. Todos os produtos continuam sendo vendidos (ótimo!)
3. Nomes de colunas diferentes na tabela `vendas`

**Solução**:
```sql
-- Verificar dados disponíveis
SELECT
    MIN(data_venda) as primeira_venda,
    MAX(data_venda) as ultima_venda,
    COUNT(*) as total_registros
FROM vendas;

-- Verificar estrutura da tabela
PRAGMA table_info(vendas);
```

### Problema: Produtos aparecem duplicados

**Causa**: Mesmo produto vendido por diferentes representantes

**Solução**: Isso é esperado! Cada linha representa um par (representante + produto)

### Problema: Valores de risco parecem errados

**Causa**: Outliers ou vendas excepcionais no período de referência

**Solução**: A view usa valor MÉDIO. Ajuste conforme necessário.

---

## 📞 Suporte

Para dúvidas sobre:
- **SQL e View**: Verifique `sql/create_view_produtos_parados.sql`
- **Permissões**: Consulte `INSTRUCOES_AUTENTICACAO.md`
- **Interface**: Arquivo `dashboards/dashboard-produtos-parados.html`

---

## 🔄 Atualizações Futuras

Melhorias planejadas:

- [ ] Exportar lista de produtos parados para Excel
- [ ] Alertas automáticos por email
- [ ] Histórico de reativações
- [ ] Comparação período a período
- [ ] Sugestões automáticas de ação

---

**Desenvolvido para Germani Alimentos** 🏭
**Sistema:** Ger Comercial
**Dashboard:** Produtos Parados 🛑
**Versão:** 1.0.0
