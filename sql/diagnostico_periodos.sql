-- =====================================================
-- DIAGNÓSTICO: Por que retornou 0 produtos parados?
-- =====================================================
-- Execute estas queries UMA POR VEZ no Turso
-- =====================================================

-- QUERY 1: Quantos produtos têm 2+ vendas entre 2-4 semanas atrás?
SELECT COUNT(DISTINCT representante, produto) as produtos_com_2_vendas_2a4_semanas
FROM (
    SELECT
        representante,
        produto,
        COUNT(*) as qtd_vendas
    FROM vendas
    WHERE date(emissao) BETWEEN date('now', '-4 weeks') AND date('now', '-2 weeks')
        AND emissao != ''
        AND representante != ''
    GROUP BY representante, produto
    HAVING COUNT(*) >= 2
);

-- QUERY 2: Quantos produtos foram vendidos nas últimas 2 semanas?
SELECT COUNT(DISTINCT representante, produto) as produtos_vendidos_ultimas_2_semanas
FROM vendas
WHERE date(emissao) >= date('now', '-2 weeks')
    AND emissao != ''
    AND representante != '';

-- QUERY 3: Ver distribuição de vendas por semana
SELECT
    CASE
        WHEN date(emissao) >= date('now', '-1 weeks') THEN '1. Última semana'
        WHEN date(emissao) >= date('now', '-2 weeks') THEN '2. Semana passada'
        WHEN date(emissao) >= date('now', '-3 weeks') THEN '3. Há 3 semanas'
        WHEN date(emissao) >= date('now', '-4 weeks') THEN '4. Há 4 semanas'
        WHEN date(emissao) >= date('now', '-5 weeks') THEN '5. Há 5 semanas'
        WHEN date(emissao) >= date('now', '-6 weeks') THEN '6. Há 6 semanas'
        WHEN date(emissao) >= date('now', '-7 weeks') THEN '7. Há 7 semanas'
        WHEN date(emissao) >= date('now', '-8 weeks') THEN '8. Há 8 semanas'
        ELSE '9. Mais de 8 semanas'
    END as periodo,
    COUNT(*) as qtd_vendas,
    COUNT(DISTINCT produto) as qtd_produtos,
    COUNT(DISTINCT representante) as qtd_representantes
FROM vendas
WHERE emissao != ''
    AND representante != ''
GROUP BY
    CASE
        WHEN date(emissao) >= date('now', '-1 weeks') THEN '1. Última semana'
        WHEN date(emissao) >= date('now', '-2 weeks') THEN '2. Semana passada'
        WHEN date(emissao) >= date('now', '-3 weeks') THEN '3. Há 3 semanas'
        WHEN date(emissao) >= date('now', '-4 weeks') THEN '4. Há 4 semanas'
        WHEN date(emissao) >= date('now', '-5 weeks') THEN '5. Há 5 semanas'
        WHEN date(emissao) >= date('now', '-6 weeks') THEN '6. Há 6 semanas'
        WHEN date(emissao) >= date('now', '-7 weeks') THEN '7. Há 7 semanas'
        WHEN date(emissao) >= date('now', '-8 weeks') THEN '8. Há 8 semanas'
        ELSE '9. Mais de 8 semanas'
    END
ORDER BY periodo;

-- QUERY 4: TESTAR COM PERÍODO MAIOR (4-8 semanas)
-- Se ESTA query retornar produtos, significa que 2-4 semanas é muito curto!
WITH vendas_periodo_anterior AS (
    SELECT DISTINCT
        representante,
        produto,
        COUNT(*) as qtd_vendas
    FROM vendas
    WHERE date(emissao) BETWEEN date('now', '-8 weeks') AND date('now', '-4 weeks')
        AND emissao != ''
        AND representante != ''
    GROUP BY representante, produto
    HAVING COUNT(*) >= 2
),
vendas_recentes AS (
    SELECT DISTINCT
        representante,
        produto
    FROM vendas
    WHERE date(emissao) >= date('now', '-4 weeks')
        AND emissao != ''
        AND representante != ''
)
SELECT COUNT(*) as produtos_parados_com_periodo_4a8_semanas
FROM vendas_periodo_anterior vp
LEFT JOIN vendas_recentes vr
    ON vp.representante = vr.representante
    AND vp.produto = vr.produto
WHERE vr.produto IS NULL;

-- QUERY 5: TESTAR COM APENAS 1 VENDA (ao invés de 2+)
-- Se ESTA query retornar produtos, significa que exigir 2+ vendas é muito restritivo!
WITH vendas_periodo_anterior AS (
    SELECT DISTINCT
        representante,
        produto,
        COUNT(*) as qtd_vendas
    FROM vendas
    WHERE date(emissao) BETWEEN date('now', '-4 weeks') AND date('now', '-2 weeks')
        AND emissao != ''
        AND representante != ''
    GROUP BY representante, produto
    HAVING COUNT(*) >= 1  -- Mudou de 2 para 1
),
vendas_recentes AS (
    SELECT DISTINCT
        representante,
        produto
    FROM vendas
    WHERE date(emissao) >= date('now', '-2 weeks')
        AND emissao != ''
        AND representante != ''
)
SELECT COUNT(*) as produtos_parados_com_apenas_1_venda
FROM vendas_periodo_anterior vp
LEFT JOIN vendas_recentes vr
    ON vp.representante = vr.representante
    AND vp.produto = vr.produto
WHERE vr.produto IS NULL;

-- =====================================================
-- INTERPRETAÇÃO DOS RESULTADOS:
-- =====================================================
--
-- Se QUERY 1 = 0:
--   → Não há produtos com 2+ vendas entre 2-4 semanas atrás
--   → Período muito curto ou vendas muito esporádicas
--   → SOLUÇÃO: Aumentar período OU reduzir para 1+ venda
--
-- Se QUERY 1 > 0 mas TESTE 1 da view = 0:
--   → Todos os produtos continuam sendo vendidos
--   → SOLUÇÃO: Aumentar período de análise
--
-- Se QUERY 4 > 0:
--   → Período 2-4 semanas é muito curto
--   → SOLUÇÃO: Usar período 4-8 semanas
--
-- Se QUERY 5 > 0:
--   → Exigir 2+ vendas é muito restritivo
--   → SOLUÇÃO: Aceitar 1+ venda
--
-- =====================================================
