-- =====================================================
-- VIEW: PRODUTOS PARADOS - Ger Comercial
-- =====================================================
-- Identifica produtos que os representantes vendiam há 4 semanas
-- mas pararam de vender nas últimas semanas

-- Descrição:
-- Esta view analisa o histórico de vendas e identifica SKUs que
-- apresentavam vendas regulares mas foram descontinuados recentemente
-- pelos representantes.

-- =====================================================
-- CRIAR VIEW
-- =====================================================

CREATE VIEW IF NOT EXISTS vw_produtos_parados AS
WITH vendas_4_semanas_atras AS (
    -- Produtos vendidos entre 4-6 semanas atrás
    SELECT DISTINCT
        rep_supervisor,
        desc_representante,
        cod_representante,
        sku_produto,
        desc_produto,
        categoria_produto,
        AVG(valor_total) as valor_medio_venda,
        COUNT(*) as qtd_vendas_anteriores,
        MAX(data_venda) as ultima_venda_periodo_anterior
    FROM vendas
    WHERE data_venda BETWEEN date('now', '-6 weeks') AND date('now', '-4 weeks')
    GROUP BY rep_supervisor, desc_representante, cod_representante,
             sku_produto, desc_produto, categoria_produto
    HAVING COUNT(*) >= 2  -- Pelo menos 2 vendas no período
),
vendas_recentes AS (
    -- Produtos vendidos nas últimas 4 semanas
    SELECT DISTINCT
        cod_representante,
        sku_produto
    FROM vendas
    WHERE data_venda >= date('now', '-4 weeks')
)
SELECT
    v4.rep_supervisor,
    v4.desc_representante,
    v4.cod_representante,
    v4.sku_produto,
    v4.desc_produto,
    v4.categoria_produto,
    v4.ultima_venda_periodo_anterior as ultima_venda,
    CAST((julianday('now') - julianday(v4.ultima_venda_periodo_anterior)) / 7 AS INTEGER) as qtd_semanas_parado,
    ROUND(v4.valor_medio_venda, 2) as valor_medio_perdido,
    v4.qtd_vendas_anteriores,
    CASE
        WHEN CAST((julianday('now') - julianday(v4.ultima_venda_periodo_anterior)) / 7 AS INTEGER) >= 8 THEN 'CRÍTICO'
        WHEN CAST((julianday('now') - julianday(v4.ultima_venda_periodo_anterior)) / 7 AS INTEGER) >= 6 THEN 'ALTO'
        WHEN CAST((julianday('now') - julianday(v4.ultima_venda_periodo_anterior)) / 7 AS INTEGER) >= 4 THEN 'MÉDIO'
        ELSE 'BAIXO'
    END as nivel_risco
FROM vendas_4_semanas_atras v4
LEFT JOIN vendas_recentes vr
    ON v4.cod_representante = vr.cod_representante
    AND v4.sku_produto = vr.sku_produto
WHERE vr.sku_produto IS NULL  -- Produto NÃO foi vendido recentemente
ORDER BY qtd_semanas_parado DESC, valor_medio_perdido DESC;

-- =====================================================
-- QUERIES DE EXEMPLO PARA TESTE
-- =====================================================

-- 1. Ver todos os produtos parados
-- SELECT * FROM vw_produtos_parados;

-- 2. Produtos parados por supervisor
-- SELECT
--     rep_supervisor,
--     COUNT(*) as total_produtos_parados,
--     SUM(valor_medio_perdido) as valor_total_risco
-- FROM vw_produtos_parados
-- GROUP BY rep_supervisor
-- ORDER BY valor_total_risco DESC;

-- 3. Top 10 produtos mais paralisados
-- SELECT
--     desc_produto,
--     COUNT(DISTINCT desc_representante) as qtd_representantes,
--     AVG(valor_medio_perdido) as valor_medio,
--     MAX(qtd_semanas_parado) as max_semanas_parado
-- FROM vw_produtos_parados
-- GROUP BY sku_produto, desc_produto
-- ORDER BY qtd_representantes DESC
-- LIMIT 10;

-- 4. Produtos parados por nível de risco
-- SELECT
--     nivel_risco,
--     COUNT(*) as qtd_produtos,
--     SUM(valor_medio_perdido) as valor_total_risco
-- FROM vw_produtos_parados
-- GROUP BY nivel_risco
-- ORDER BY
--     CASE nivel_risco
--         WHEN 'CRÍTICO' THEN 1
--         WHEN 'ALTO' THEN 2
--         WHEN 'MÉDIO' THEN 3
--         ELSE 4
--     END;

-- =====================================================
-- OBSERVAÇÕES IMPORTANTES
-- =====================================================

-- Esta view assume que sua tabela de vendas tem os seguintes campos:
-- - rep_supervisor (texto)
-- - desc_representante (texto)
-- - cod_representante (texto/número)
-- - sku_produto (texto/número)
-- - desc_produto (texto)
-- - categoria_produto (texto)
-- - valor_total (número)
-- - data_venda (data)

-- Se os nomes dos campos forem diferentes, ajuste a query conforme necessário.

-- Para melhor performance, considere criar índices:
-- CREATE INDEX idx_vendas_data ON vendas(data_venda);
-- CREATE INDEX idx_vendas_rep_produto ON vendas(cod_representante, sku_produto);
