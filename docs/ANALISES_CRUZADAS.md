# 🔗 Análises Cruzadas de Dados - Ger Comercial

## 📊 Oportunidades de Cruzamento de Dados

### 1. **Produtos Parados × Margem de Rentabilidade** ⭐⭐⭐

**Cruzamento:**
- Produtos que pararam de vender × Margem de lucro desses produtos

**Insights:**
- Produtos parados com ALTA margem = CRÍTICO reativar
- Produtos parados com BAIXA margem = Talvez deixar descontinuar
- Priorizar ações de reativação por rentabilidade

**Query SQL:**
```sql
SELECT
    pp.desc_produto,
    pp.desc_representante,
    pp.qtd_semanas_parado,
    pp.valor_medio_perdido,
    pp.nivel_risco,
    -- Cruzar com margem
    (v.valor_liquido - v.custo) / v.valor_bruto * 100 as margem_percentual,
    -- Classificação
    CASE
        WHEN margem_percentual > 30 AND pp.nivel_risco = 'CRÍTICO' THEN 'URGENTE REATIVAR'
        WHEN margem_percentual < 10 AND pp.nivel_risco IN ('MÉDIO', 'BAIXO') THEN 'DEIXAR DESCONTINUAR'
        ELSE 'AVALIAR'
    END as acao_recomendada
FROM vw_produtos_parados pp
LEFT JOIN vendas v ON pp.sku_produto = v.produto
GROUP BY pp.sku_produto, pp.desc_representante
```

**Dashboard Proposto:**
- Nome: "Análise Produto Parado × Rentabilidade"
- Gráfico: Matriz (eixo X = semanas parado, eixo Y = margem %)
- Cores: Verde = alta margem/pouco parado, Vermelho = alta margem/muito parado

---

### 2. **Cliente × Produtos Parados** ⭐⭐⭐

**Cruzamento:**
- Clientes que pararam de comprar certos produtos × Histórico de compras

**Insights:**
- Identificar se cliente está migrando para concorrente
- Detectar perda de cliente antes que pare completamente
- Oportunidade de recuperação

**Query SQL:**
```sql
WITH clientes_produtos_parados AS (
    SELECT
        v.cliente,
        c.desc_cliente,
        pp.sku_produto,
        pp.desc_produto,
        pp.ultima_venda,
        pp.qtd_semanas_parado,
        pp.valor_medio_perdido
    FROM vw_produtos_parados pp
    INNER JOIN vendas v ON pp.sku_produto = v.produto
                        AND pp.cod_representante = v.representante
    LEFT JOIN tab_cliente c ON v.cliente = c.cliente
    WHERE pp.qtd_semanas_parado >= 4
),
total_clientes_afetados AS (
    SELECT
        cliente,
        desc_cliente,
        COUNT(DISTINCT sku_produto) as qtd_produtos_parados,
        SUM(valor_medio_perdido) as valor_total_risco,
        MAX(qtd_semanas_parado) as maior_tempo_parado
    FROM clientes_produtos_parados
    GROUP BY cliente, desc_cliente
)
SELECT * FROM total_clientes_afetados
WHERE qtd_produtos_parados >= 3  -- Cliente parou de comprar 3+ produtos
ORDER BY valor_total_risco DESC;
```

**Dashboard Proposto:**
- Nome: "Clientes em Risco de Perda"
- KPI: Total de clientes com 3+ produtos parados
- Tabela: Cliente, Qtd produtos parados, Valor em risco, Última compra
- Ação: Botão "Alertar Representante"

---

### 3. **Região × Performance × Potencial** ⭐⭐⭐

**Cruzamento:**
- Vendas por região × Potencial da cidade × Taxa de penetração

**Insights:**
- Regiões com alto potencial mas baixa penetração = OPORTUNIDADE
- Regiões saturadas (alta penetração) = Expandir portfólio
- Alocar recursos para regiões com melhor ROI

**Query SQL:**
```sql
SELECT
    v.cidade,
    pc.populacao,
    pc.potencial_estimado,
    SUM(v.valor_liquido) as vendas_realizadas,
    -- Cálculo de penetração
    (SUM(v.valor_liquido) / pc.potencial_estimado) * 100 as taxa_penetracao,
    -- Classificação
    CASE
        WHEN taxa_penetracao < 30 AND pc.potencial_estimado > 50000 THEN 'ALTA OPORTUNIDADE'
        WHEN taxa_penetracao >= 70 THEN 'SATURADO - EXPANDIR PORTFOLIO'
        WHEN taxa_penetracao BETWEEN 30 AND 70 THEN 'EM DESENVOLVIMENTO'
        ELSE 'BAIXO POTENCIAL'
    END as classificacao
FROM vendas v
LEFT JOIN potencial_cidade pc ON v.cidade = pc.cidade
WHERE v.emissao >= date('now', '-6 months')
GROUP BY v.cidade
ORDER BY (pc.potencial_estimado - SUM(v.valor_liquido)) DESC;
```

**Dashboard Proposto:**
- Nome: "Mapa de Oportunidades Regionais"
- Gráfico: Bubble chart (X = potencial, Y = vendas, tamanho = população)
- Mapa: Brasil com cores por taxa de penetração

---

### 4. **Representante × Mix de Produtos × Margem** ⭐⭐

**Cruzamento:**
- Performance do representante × Diversidade de produtos × Margem média

**Insights:**
- Representantes que vendem só produtos de baixa margem
- Representantes com portfólio limitado (não diversificam)
- Oportunidade de treinamento e incentivo

**Query SQL:**
```sql
SELECT
    tr.desc_representante,
    tr.rep_supervisor,
    -- Métricas de vendas
    COUNT(DISTINCT v.produto) as qtd_produtos_vendidos,
    COUNT(DISTINCT v.familia) as qtd_familias_vendidas,
    SUM(v.valor_liquido) as total_vendas,
    -- Margem média
    AVG((v.valor_liquido - v.valor_bruto) / v.valor_bruto * 100) as margem_media,
    -- Índice de diversificação (Shannon)
    -SUM((cnt / total) * LOG(cnt / total)) as indice_diversificacao,
    -- Classificação
    CASE
        WHEN margem_media < 15 THEN 'MARGEM BAIXA - TREINAR'
        WHEN qtd_produtos_vendidos < 20 THEN 'PORTFOLIO LIMITADO - EXPANDIR'
        WHEN margem_media > 25 AND qtd_produtos_vendidos > 50 THEN 'EXCELENTE'
        ELSE 'BOM'
    END as classificacao
FROM vendas v
INNER JOIN tab_representante tr ON v.representante = tr.representante
WHERE v.emissao >= date('now', '-3 months')
GROUP BY tr.desc_representante
ORDER BY margem_media ASC;
```

**Dashboard Proposto:**
- Nome: "Análise de Portfolio por Representante"
- Gráfico: Scatter (X = diversificação, Y = margem média)
- Tabela: Ações recomendadas por representante

---

### 5. **Sazonalidade × Categoria de Produto** ⭐⭐

**Cruzamento:**
- Vendas mensais × Família de produtos × Região

**Insights:**
- Produtos sazonais (ex: panetone em dezembro)
- Planejar estoque e promoções
- Antecipar demanda

**Query SQL:**
```sql
SELECT
    strftime('%m', v.emissao) as mes,
    v.familia,
    v.cidade,
    SUM(v.qtde_faturada) as quantidade_total,
    SUM(v.valor_liquido) as valor_total,
    -- Índice de sazonalidade (média do mês / média geral)
    SUM(v.valor_liquido) / AVG(SUM(v.valor_liquido)) OVER (PARTITION BY v.familia) as indice_sazonalidade
FROM vendas v
WHERE v.emissao >= date('now', '-12 months')
GROUP BY mes, v.familia, v.cidade
HAVING indice_sazonalidade > 1.5 OR indice_sazonalidade < 0.5
ORDER BY familia, mes;
```

**Dashboard Proposto:**
- Nome: "Análise de Sazonalidade"
- Gráfico: Heatmap (mês × categoria)
- Cores: Vermelho = alta demanda, Azul = baixa demanda

---

### 6. **Frequência de Compra × Valor do Ticket** ⭐⭐

**Cruzamento:**
- Clientes por frequência de compra × Ticket médio × Tempo desde última compra

**Insights:**
- Clientes VIP (alta frequência + alto ticket)
- Clientes em risco (alta frequência mas não compra há tempo)
- Oportunidade de upsell (alta frequência + baixo ticket)

**Query SQL:**
```sql
WITH metricas_cliente AS (
    SELECT
        c.cliente,
        c.desc_cliente,
        COUNT(DISTINCT v.serie || v.nota_fiscal) as frequencia_compra,
        AVG(v.valor_liquido) as ticket_medio,
        MAX(v.emissao) as ultima_compra,
        julianday('now') - julianday(MAX(v.emissao)) as dias_sem_comprar
    FROM tab_cliente c
    LEFT JOIN vendas v ON c.cliente = v.cliente
    WHERE v.emissao >= date('now', '-6 months')
    GROUP BY c.cliente
)
SELECT
    *,
    -- Segmentação RFM (Recency, Frequency, Monetary)
    CASE
        WHEN dias_sem_comprar <= 30 AND frequencia_compra >= 10 AND ticket_medio >= 5000 THEN 'VIP'
        WHEN dias_sem_comprar <= 30 AND frequencia_compra >= 10 AND ticket_medio < 5000 THEN 'FREQUENTE - UPSELL'
        WHEN dias_sem_comprar > 60 AND frequencia_compra >= 5 THEN 'EM RISCO - REATIVAR'
        WHEN dias_sem_comprar > 90 THEN 'PERDIDO'
        ELSE 'REGULAR'
    END as segmento
FROM metricas_cliente
ORDER BY
    CASE segmento
        WHEN 'EM RISCO - REATIVAR' THEN 1
        WHEN 'VIP' THEN 2
        WHEN 'FREQUENTE - UPSELL' THEN 3
        ELSE 4
    END;
```

**Dashboard Proposto:**
- Nome: "Segmentação RFM de Clientes"
- Gráfico: Matriz 3×3 (Recency × Frequency × Monetary)
- Ações automáticas por segmento

---

### 7. **Supervisor × Performance da Equipe × Meta** ⭐⭐⭐

**Cruzamento:**
- Performance por supervisor × Meta individual × Produtos parados na equipe

**Insights:**
- Supervisores com equipe abaixo da meta consistentemente
- Correlação entre produtos parados e baixa performance
- Necessidade de coaching/treinamento

**Query SQL:**
```sql
SELECT
    tr.rep_supervisor,
    COUNT(DISTINCT tr.representante) as qtd_representantes,
    -- Performance
    SUM(v.valor_liquido) as total_vendas,
    AVG(pr.meta_semanal_peso) as meta_media,
    (SUM(v.valor_liquido) / AVG(pr.meta_semanal_peso)) * 100 as percentual_meta,
    -- Produtos parados
    COUNT(DISTINCT pp.sku_produto) as produtos_parados_equipe,
    SUM(pp.valor_medio_perdido) as valor_risco_produtos_parados,
    -- Classificação
    CASE
        WHEN percentual_meta < 70 AND produtos_parados_equipe > 20 THEN 'EQUIPE PRECISA SUPORTE URGENTE'
        WHEN percentual_meta >= 100 THEN 'EQUIPE EXCELENTE'
        WHEN percentual_meta BETWEEN 80 AND 99 THEN 'EQUIPE BOA - PRÓXIMA DA META'
        ELSE 'EQUIPE REGULAR'
    END as status_equipe
FROM tab_representante tr
LEFT JOIN vendas v ON tr.representante = v.representante
LEFT JOIN potencial_representante pr ON tr.representante = pr.representante
LEFT JOIN vw_produtos_parados pp ON tr.representante = pp.cod_representante
WHERE v.emissao >= date('now', '-4 weeks')
GROUP BY tr.rep_supervisor
ORDER BY percentual_meta ASC;
```

**Dashboard Proposto:**
- Nome: "Performance de Supervisores e Equipes"
- Gráfico: Barras empilhadas (meta atingida vs faltante por supervisor)
- Tabela: Produtos parados por equipe com valor em risco

---

### 8. **Dia da Semana × Representante × Volume** ⭐

**Cruzamento:**
- Volume de vendas por dia da semana × Representante × Região

**Insights:**
- Representantes que não visitam certos dias
- Otimizar agenda de visitas
- Identificar padrões de compra por dia

**Query SQL:**
```sql
SELECT
    CASE CAST(strftime('%w', v.emissao) AS INTEGER)
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda'
        WHEN 2 THEN 'Terça'
        WHEN 3 THEN 'Quarta'
        WHEN 4 THEN 'Quinta'
        WHEN 5 THEN 'Sexta'
        WHEN 6 THEN 'Sábado'
    END as dia_semana,
    tr.desc_representante,
    v.cidade,
    COUNT(*) as qtd_vendas,
    SUM(v.valor_liquido) as total_vendas
FROM vendas v
INNER JOIN tab_representante tr ON v.representante = tr.representante
WHERE v.emissao >= date('now', '-8 weeks')
GROUP BY dia_semana, tr.desc_representante, v.cidade
ORDER BY tr.desc_representante, dia_semana;
```

**Dashboard Proposto:**
- Nome: "Análise de Agenda de Visitas"
- Gráfico: Heatmap (dia da semana × representante)
- Sugestão: Dias com baixo volume = oportunidade de visita

---

### 9. **Cluster de Clientes Similares** ⭐⭐⭐

**Cruzamento:**
- Clientes com perfil de compra similar × Produtos que um compra e outro não

**Insights:**
- Recomendar produtos (cliente A compra X, cliente B similar não compra X = oportunidade)
- Cross-sell inteligente
- Aumentar ticket médio

**Query SQL (Simplificado):**
```sql
WITH perfil_cliente AS (
    SELECT
        v.cliente,
        GROUP_CONCAT(DISTINCT v.familia) as familias_compradas,
        AVG(v.valor_liquido) as ticket_medio,
        COUNT(DISTINCT v.emissao) as frequencia
    FROM vendas v
    WHERE v.emissao >= date('now', '-6 months')
    GROUP BY v.cliente
)
SELECT
    pc1.cliente as cliente_base,
    pc2.cliente as cliente_similar,
    pc1.familias_compradas as compra_base,
    pc2.familias_compradas as compra_similar,
    -- Produtos que cliente similar compra mas base não
    -- (Requer análise mais complexa - usar Python/JS)
    'Ver produtos recomendados' as acao
FROM perfil_cliente pc1
CROSS JOIN perfil_cliente pc2
WHERE pc1.cliente != pc2.cliente
  AND ABS(pc1.ticket_medio - pc2.ticket_medio) < 500
  AND ABS(pc1.frequencia - pc2.frequencia) <= 2
LIMIT 100;
```

**Dashboard Proposto:**
- Nome: "Recomendações Inteligentes"
- Para cada cliente: "Clientes similares compram também: [lista de produtos]"
- Botão: "Enviar recomendação ao representante"

---

### 10. **Evolução Temporal de Métricas** ⭐⭐

**Cruzamento:**
- Comparar períodos: Mês atual vs mês anterior vs mesmo mês ano passado
- Todas as métricas (vendas, margem, produtos, clientes)

**Query SQL:**
```sql
WITH metricas_periodo AS (
    SELECT
        CASE
            WHEN emissao >= date('now', 'start of month') THEN 'Mês Atual'
            WHEN emissao >= date('now', 'start of month', '-1 month')
                 AND emissao < date('now', 'start of month') THEN 'Mês Anterior'
            WHEN strftime('%m', emissao) = strftime('%m', 'now')
                 AND strftime('%Y', emissao) = strftime('%Y', date('now', '-1 year')) THEN 'Mesmo Mês Ano Passado'
            ELSE 'Outro'
        END as periodo,
        SUM(valor_liquido) as total_vendas,
        COUNT(DISTINCT cliente) as qtd_clientes,
        COUNT(DISTINCT produto) as qtd_produtos,
        AVG(valor_liquido) as ticket_medio
    FROM vendas
    WHERE emissao >= date('now', '-13 months')
    GROUP BY periodo
)
SELECT
    *,
    -- Variações
    LAG(total_vendas) OVER (ORDER BY periodo) as vendas_periodo_anterior,
    (total_vendas - LAG(total_vendas) OVER (ORDER BY periodo)) / LAG(total_vendas) OVER (ORDER BY periodo) * 100 as variacao_percentual
FROM metricas_periodo
WHERE periodo != 'Outro';
```

**Dashboard Proposto:**
- Nome: "Análise Temporal Comparativa"
- KPIs com setas: ↑ +15% vs mês anterior
- Gráfico de linha: Últimos 12 meses
- Destaque: Melhor/pior mês

---

## 🚀 Dashboard Cruzado Proposto: "Central de Inteligência Comercial"

### Layout:
```
┌─────────────────────────────────────────────────┐
│  🎯 ALERTAS URGENTES (Top 3)                    │
│  • 5 clientes VIP em risco de perda            │
│  • 12 produtos alta margem parados há 8+ sem   │
│  • Região X com 45% potencial não explorado    │
└─────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬────────────┐
│ Produtos Parados │ Clientes em      │ Oportuni-  │
│ × Margem         │ Risco            │ dades      │
│ [Scatter Chart]  │ [Tabela]         │ Regionais  │
│                  │                  │ [Bubble]   │
└──────────────────┴──────────────────┴────────────┘

┌──────────────────────────────────────────────────┐
│ 📊 Análise de Portfolio por Representante       │
│ [Scatter: Diversificação × Margem]              │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ 📈 Tendências e Comparativos                     │
│ [Linha: Últimos 12 meses + Comparação YoY]      │
└──────────────────────────────────────────────────┘
```

---

## 🔧 Implementação Técnica

### SQL Views Necessárias:
1. `vw_analise_cruzada_produtos_margem`
2. `vw_clientes_risco_perda`
3. `vw_oportunidades_regionais`
4. `vw_portfolio_representantes`
5. `vw_rfm_clientes`

### JavaScript:
```javascript
// Função para cruzar dados
async function analisarCruzamento(tipo) {
    const view = VIEWS_CRUZAMENTO[tipo];
    const dados = await db.execute(`SELECT * FROM ${view}`);

    // Processar e renderizar
    renderizarAnalise(tipo, dados);
}

// Mapa de views
const VIEWS_CRUZAMENTO = {
    'produtos-margem': 'vw_analise_cruzada_produtos_margem',
    'clientes-risco': 'vw_clientes_risco_perda',
    // ...
};
```

---

**Próximos Passos:** Ver `PROXIMOS_PASSOS.md`

**Ger Comercial** | Germani Alimentos 🏭
