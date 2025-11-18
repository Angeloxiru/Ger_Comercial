-- =====================================================
-- VIEW: PRODUTOS PARADOS - Ger Comercial (VERSÃO CORRIGIDA)
-- =====================================================
-- Identifica produtos que os representantes vendiam há 4 semanas
-- mas pararam de vender nas últimas semanas

-- =====================================================
-- CRIAR VIEW
-- =====================================================

CREATE VIEW IF NOT EXISTS vw_produtos_parados AS
WITH vendas_4_semanas_atras AS (
    -- Produtos vendidos entre 4-6 semanas atrás
    SELECT DISTINCT
        tr.rep_supervisor,
        tr.desc_representante,
        v.representante,
        v.produto,
        tp.desc_produto,
        v.familia,
        tp.desc_familia,
        AVG(v.valor_bruto) as valor_medio_venda,
        COUNT(*) as qtd_vendas_anteriores,
        MAX(v.emissao) as ultima_venda_periodo_anterior
    FROM vendas v
    INNER JOIN tab_representante tr ON v.representante = tr.representante
    LEFT JOIN tab_produto tp ON v.produto = tp.produto
    WHERE v.emissao BETWEEN date('now', '-6 weeks') AND date('now', '-4 weeks')
        AND v.emissao != ''  -- Filtrar registros sem data
        AND v.representante != ''  -- Filtrar registros sem representante
        AND v.nat_oper LIKE '5%' OR v.nat_oper LIKE '6%'  -- Apenas vendas (não devoluções)
    GROUP BY tr.rep_supervisor, tr.desc_representante, v.representante,
             v.produto, tp.desc_produto, v.familia, tp.desc_familia
    HAVING COUNT(*) >= 2  -- Pelo menos 2 vendas no período
),
vendas_recentes AS (
    -- Produtos vendidos nas últimas 4 semanas
    SELECT DISTINCT
        representante,
        produto
    FROM vendas
    WHERE emissao >= date('now', '-4 weeks')
        AND emissao != ''
        AND representante != ''
)
SELECT
    v4.rep_supervisor,
    v4.desc_representante,
    v4.representante as cod_representante,
    v4.produto as sku_produto,
    v4.desc_produto,
    COALESCE(v4.desc_familia, v4.familia) as categoria_produto,
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
    ON v4.representante = vr.representante
    AND v4.produto = vr.produto
WHERE vr.produto IS NULL  -- Produto NÃO foi vendido recentemente
ORDER BY qtd_semanas_parado DESC, valor_medio_perdido DESC;

-- =====================================================
-- QUERIES DE TESTE
-- =====================================================

-- 1. Ver todos os produtos parados
-- SELECT * FROM vw_produtos_parados LIMIT 20;

-- 2. Produtos parados por supervisor
-- SELECT
--     rep_supervisor,
--     COUNT(*) as total_produtos_parados,
--     SUM(valor_medio_perdido) as valor_total_risco,
--     COUNT(DISTINCT desc_representante) as qtd_representantes
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

-- 5. Produtos parados por representante específico
-- SELECT * FROM vw_produtos_parados
-- WHERE desc_representante = 'GERMANI ALIMENTOS LTDA'
-- ORDER BY qtd_semanas_parado DESC;

-- =====================================================
-- ÍNDICES RECOMENDADOS PARA PERFORMANCE
-- =====================================================

-- CREATE INDEX IF NOT EXISTS idx_vendas_emissao ON vendas(emissao);
-- CREATE INDEX IF NOT EXISTS idx_vendas_rep_produto ON vendas(representante, produto);
-- CREATE INDEX IF NOT EXISTS idx_vendas_familia ON vendas(familia);
-- CREATE INDEX IF NOT EXISTS idx_vendas_nat_oper ON vendas(nat_oper);

-- =====================================================
-- OBSERVAÇÕES
-- =====================================================

-- 1. Filtros aplicados:
--    - emissao != '' (ignora registros sem data)
--    - representante != '' (ignora registros sem representante)
--    - nat_oper LIKE '5%' OR '6%' (apenas vendas, não devoluções)

-- 2. O campo 'familia' vem direto da tabela vendas (mais eficiente)
--    Se preferir usar desc_familia da tab_produto, já está no JOIN

-- 3. Caso queira filtrar apenas tipos específicos de operação:
--    Ajuste a linha: AND v.nat_oper IN ('5101', '6101', ...)

-- 4. Se quiser ajustar o período de análise (atualmente 4 semanas):
--    Modifique: date('now', '-4 weeks') e date('now', '-6 weeks')
