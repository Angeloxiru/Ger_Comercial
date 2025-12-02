-- =====================================================
-- VIEW: PRODUTOS PARADOS - Ger Comercial (VERSÃO 2.0)
-- =====================================================
-- Identifica produtos que os representantes vendiam regularmente
-- mas pararam de vender nas últimas semanas
--
-- Classificação de Risco (nova escala):
--   1 semana  = MÍNIMO
--   2 semanas = BAIXO
--   3 semanas = MODERADO
--   4 semanas = ALTO
--   5 semanas = MUITO ALTO
--   6+ semanas = EXTREMO
-- =====================================================

CREATE VIEW IF NOT EXISTS vw_produtos_parados AS
WITH vendas_periodo_anterior AS (
    -- Produtos vendidos entre 2-4 semanas atrás (período de referência)
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
        MAX(v.emissao) as ultima_venda_periodo
    FROM vendas v
    INNER JOIN tab_representante tr ON v.representante = tr.representante
    LEFT JOIN tab_produto tp ON v.produto = tp.produto
    WHERE v.emissao BETWEEN date('now', '-4 weeks') AND date('now', '-2 weeks')
        AND v.emissao != ''  -- Filtrar registros sem data
        AND v.representante != ''  -- Filtrar registros sem representante
    GROUP BY tr.rep_supervisor, tr.desc_representante, v.representante,
             v.produto, tp.desc_produto, v.familia, tp.desc_familia
    HAVING COUNT(*) >= 2  -- Pelo menos 2 vendas no período de referência
),
vendas_recentes AS (
    -- Produtos vendidos nas últimas 2 semanas
    SELECT DISTINCT
        representante,
        produto
    FROM vendas
    WHERE emissao >= date('now', '-2 weeks')
        AND emissao != ''
        AND representante != ''
)
SELECT
    vp.rep_supervisor,
    vp.desc_representante,
    vp.representante as cod_representante,
    vp.produto as sku_produto,
    vp.desc_produto,
    COALESCE(vp.desc_familia, vp.familia) as categoria_produto,
    vp.ultima_venda_periodo as ultima_venda,
    CAST((julianday('now') - julianday(vp.ultima_venda_periodo)) / 7 AS INTEGER) as qtd_semanas_parado,
    ROUND(vp.valor_medio_venda, 2) as valor_medio_perdido,
    vp.qtd_vendas_anteriores,
    CASE
        WHEN CAST((julianday('now') - julianday(vp.ultima_venda_periodo)) / 7 AS INTEGER) >= 6 THEN 'EXTREMO'
        WHEN CAST((julianday('now') - julianday(vp.ultima_venda_periodo)) / 7 AS INTEGER) >= 5 THEN 'MUITO ALTO'
        WHEN CAST((julianday('now') - julianday(vp.ultima_venda_periodo)) / 7 AS INTEGER) >= 4 THEN 'ALTO'
        WHEN CAST((julianday('now') - julianday(vp.ultima_venda_periodo)) / 7 AS INTEGER) >= 3 THEN 'MODERADO'
        WHEN CAST((julianday('now') - julianday(vp.ultima_venda_periodo)) / 7 AS INTEGER) >= 2 THEN 'BAIXO'
        ELSE 'MÍNIMO'
    END as nivel_risco
FROM vendas_periodo_anterior vp
LEFT JOIN vendas_recentes vr
    ON vp.representante = vr.representante
    AND vp.produto = vr.produto
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
-- OBSERVAÇÕES E CHANGELOG
-- =====================================================

-- VERSÃO 2.0 - Alterações principais:
-- 1. ✅ Removido filtro nat_oper (todas as linhas já são vendas)
-- 2. ✅ Ajustado período de análise: 2-4 semanas atrás → últimas 2 semanas
-- 3. ✅ Nova classificação de risco com 6 níveis (MÍNIMO a EXTREMO)
-- 4. ✅ Corrigido bug de precedência de operadores OR
-- 5. ✅ Renomeado CTE para melhor clareza (vendas_periodo_anterior)

-- Filtros aplicados:
--   - emissao != '' (ignora registros sem data)
--   - representante != '' (ignora registros sem representante)
--   - Mínimo de 2 vendas no período de referência (2-4 semanas atrás)

-- Lógica de detecção:
--   - Produto foi vendido 2+ vezes entre 2-4 semanas atrás
--   - Produto NÃO foi vendido nas últimas 2 semanas
--   - Calcula semanas desde última venda
--   - Classifica risco baseado em semanas parado

-- Ajustes possíveis:
--   - Período de referência: Alterar date('now', '-4 weeks') / date('now', '-2 weeks')
--   - Mínimo de vendas: Alterar HAVING COUNT(*) >= 2
--   - Classificação de risco: Ajustar valores no CASE WHEN
