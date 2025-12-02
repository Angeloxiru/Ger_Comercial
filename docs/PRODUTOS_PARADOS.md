# 🛑 Dashboard de Produtos Parados

**Versão 2.0** - Atualizado em Dezembro 2024

## 📋 Descrição

Dashboard analítico que identifica produtos que os representantes vendiam regularmente (2-4 semanas atrás), mas pararam de vender nas últimas 2 semanas. Ferramenta essencial para gestão comercial e prevenção de perda de clientes.

---

## 🎯 Objetivos

- **Detectar perda de clientes**: Identificar quando um produto para de ser vendido pode indicar perda de cliente
- **Produtos descontinuados**: Descobrir produtos que os representantes pararam de oferecer
- **Análise de risco**: Quantificar o valor potencial perdido com produtos parados
- **Ação proativa**: Permitir que supervisores ajam antes de perder clientes definitivamente
- **Detecção precoce**: Sistema refinado com 6 níveis de risco para ação mais rápida

---

## 📊 Funcionalidades

### KPIs Principais

1. **Total de Produtos Parados**: Quantidade de SKUs que pararam de ser vendidos
2. **Valor Total em Risco**: Soma do valor médio perdido de todos os produtos
3. **Representantes Afetados**: Número de vendedores com produtos parados
4. **Média de Semanas Parado**: Tempo médio sem venda dos produtos

### Filtros Disponíveis

- ✅ **Supervisor**: Filtrar por supervisor de vendas (com busca digitável)
- ✅ **Representante**: Filtrar por vendedor específico (com busca digitável)
- ✅ **Categoria de Produto**: Filtrar por família/categoria (com busca digitável)
- ✅ **Nível de Risco**: Extremo / Muito Alto / Alto / Moderado / Baixo / Mínimo

### Classificação de Risco (Nova Escala)

| Nível | Semanas Parado | Cor | Ação Recomendada |
|-------|----------------|-----|------------------|
| ⚫ **EXTREMO** | 6+ semanas | Bordô Escuro | **CRÍTICO!** Cliente provavelmente perdido - Ação emergencial |
| 🔴 **MUITO ALTO** | 5 semanas | Vermelho | **URGENTE** - Contato imediato com representante e cliente |
| 🟠 **ALTO** | 4 semanas | Laranja | **IMPORTANTE** - Investigar motivo e tomar ação |
| 🟡 **MODERADO** | 3 semanas | Amarelo | **ATENÇÃO** - Monitorar de perto e verificar situação |
| 🟢 **BAIXO** | 2 semanas | Verde | **OBSERVAR** - Acompanhar evolução na próxima semana |
| 🔵 **MÍNIMO** | 1 semana | Azul Claro | **NORMAL** - Pode ser variação sazonal ou estoque |

### Visualizações

1. **Tabela Detalhada**: Lista completa de produtos parados com todas as informações
2. **Top 10 Produtos Mais Paralisados**: Gráfico dos produtos que mais representantes pararam de vender
3. **Distribuição por Risco**: Gráfico pizza com a divisão dos níveis de risco

---

## 🗄️ Estrutura do Banco de Dados

### View: `vw_produtos_parados` (Versão 2.0)

```sql
CREATE VIEW vw_produtos_parados AS
-- Identifica produtos vendidos entre 2-4 semanas atrás (período de referência)
-- mas que NÃO foram vendidos nas últimas 2 semanas
-- Requer mínimo de 2 vendas no período de referência
```

**Lógica de Detecção:**
1. **Período de Referência**: 2-4 semanas atrás
2. **Período Recente**: Últimas 2 semanas
3. **Critério**: Produto com 2+ vendas no período de referência, mas 0 vendas no período recente
4. **Cálculo**: Semanas desde a última venda até hoje

**Colunas retornadas:**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `rep_supervisor` | TEXT | Nome do supervisor |
| `desc_representante` | TEXT | Nome do representante |
| `cod_representante` | TEXT | Código do representante |
| `sku_produto` | TEXT | SKU do produto |
| `desc_produto` | TEXT | Descrição do produto |
| `categoria_produto` | TEXT | Categoria/família do produto |
| `ultima_venda` | DATE | Data da última venda (no período de referência) |
| `qtd_semanas_parado` | INTEGER | Semanas desde a última venda |
| `valor_medio_perdido` | DECIMAL | Valor médio das vendas anteriores |
| `qtd_vendas_anteriores` | INTEGER | Quantidade de vendas no período de referência |
| `nivel_risco` | TEXT | EXTREMO / MUITO ALTO / ALTO / MODERADO / BAIXO / MÍNIMO |

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

## 📝 CHANGELOG - Versão 2.0 (Dezembro 2024)

### ✨ Novidades

#### 1. Nova Classificação de Risco (6 Níveis)
- ⚫ **EXTREMO** (6+ semanas) - Bordô escuro
- 🔴 **MUITO ALTO** (5 semanas) - Vermelho
- 🟠 **ALTO** (4 semanas) - Laranja
- 🟡 **MODERADO** (3 semanas) - Amarelo
- 🟢 **BAIXO** (2 semanas) - Verde
- 🔵 **MÍNIMO** (1 semana) - Azul claro

**Benefício**: Classificação mais granular permite ações mais específicas e rápidas

#### 2. Período de Análise Otimizado
- **Antes**: 4-6 semanas atrás → últimas 4 semanas
- **Agora**: 2-4 semanas atrás → últimas 2 semanas

**Benefício**: Detecção mais precoce de produtos parados, permitindo ação preventiva

#### 3. Filtros com Busca Digitável
- ✅ Campo de busca em Supervisor
- ✅ Campo de busca em Representante
- ✅ Campo de busca em Categoria
- ✅ Botão "✕" para limpar busca rapidamente
- ✅ Atalho ESC para limpar busca

**Benefício**: Encontrar informações específicas em listas grandes é muito mais rápido

### 🐛 Correções de Bugs

#### 1. Bug Crítico: Precedência de Operadores SQL ❌→✅
**Problema**: Filtro `nat_oper LIKE '5%' OR v.nat_oper LIKE '6%'` sem parênteses causava inclusão incorreta de vendas fora do período

**Solução**: Removido filtro `nat_oper` (todas as linhas da tabela vendas já são vendas)

**Impacto**: Dados agora refletem corretamente produtos parados

#### 2. Simplificação da Query
- Removido filtro redundante de `nat_oper`
- Renomeado CTE para `vendas_periodo_anterior` (mais claro)
- Comentários SQL melhorados

### 🎨 Melhorias de Interface

- Badges coloridos para cada nível de risco
- Layout consistente com outros dashboards do sistema
- Filtros mais compactos e organizados
- Texto informativo atualizado com nova lógica

### 🗄️ Alterações no Banco de Dados

**Arquivo**: `sql/views/create_view_produtos_parados.sql`

**CTEs atualizados**:
- `vendas_4_semanas_atras` → `vendas_periodo_anterior`
- `vendas_recentes`: Ajustado para últimas 2 semanas

**Classificação CASE WHEN**: Atualizada para 6 níveis

---

## 📞 Suporte

Para dúvidas sobre:
- **SQL e View**: Verifique `sql/views/create_view_produtos_parados.sql`
- **Permissões**: Consulte `docs/AUTENTICACAO.md`
- **Interface**: Arquivo `dashboards/dashboard-produtos-parados.html`
- **Filtros Digitáveis**: Módulo `js/filter-search.js`

---

## 🔄 Atualizações Futuras

Melhorias planejadas:

- [ ] Exportar lista de produtos parados para Excel
- [ ] Alertas automáticos por email
- [ ] Histórico de reativações
- [ ] Comparação período a período
- [ ] Sugestões automáticas de ação
- [ ] Gráfico de evolução temporal (linha do tempo)
- [ ] Integração com WhatsApp para notificações

---

**Desenvolvido para Germani Alimentos** 🏭
**Sistema:** Ger Comercial
**Dashboard:** Produtos Parados 🛑
**Versão:** 2.0.0 (Dezembro 2024)
