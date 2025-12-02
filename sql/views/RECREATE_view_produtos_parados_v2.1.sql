-- =====================================================
-- RECRIAR VIEW PRODUTOS PARADOS - VERSÃO 2.1 (FIX)
-- =====================================================
-- FIX: Usa MAX(emissao) ao invés de date('now')
-- Problema: date('now') retorna data incorreta no Turso
-- Solução: Usar a data mais recente das vendas como referência
-- =====================================================

-- PASSO 1: Remover view antiga
DROP VIEW IF EXISTS vw_produtos_parados;

-- PASSO 2: Criar view nova (Versão 2.1 - FIX)
CREATE VIEW vw_produtos_parados AS
WITH data_referencia AS (
    -- Pega a data mais recente de vendas como referência
    SELECT MAX(emissao) as data_maxima
    FROM vendas
    WHERE emissao != ''
),
vendas_periodo_anterior AS (
    -- Produtos vendidos entre 2-4 semanas antes da data mais recente
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
    CROSS JOIN data_referencia dr
    INNER JOIN tab_representante tr ON v.representante = tr.representante
    LEFT JOIN tab_produto tp ON v.produto = tp.produto
    WHERE v.emissao BETWEEN date(dr.data_maxima, '-4 weeks') AND date(dr.data_maxima, '-2 weeks')
        AND v.emissao != ''
        AND v.representante != ''
    GROUP BY tr.rep_supervisor, tr.desc_representante, v.representante,
             v.produto, tp.desc_produto, v.familia, tp.desc_familia
    HAVING COUNT(*) >= 2
),
vendas_recentes AS (
    -- Produtos vendidos nas últimas 2 semanas (baseado na data máxima)
    SELECT DISTINCT
        v.representante,
        v.produto
    FROM vendas v
    CROSS JOIN data_referencia dr
    WHERE v.emissao >= date(dr.data_maxima, '-2 weeks')
        AND v.emissao != ''
        AND v.representante != ''
)
SELECT
    vp.rep_supervisor,
    vp.desc_representante,
    vp.representante as cod_representante,
    vp.produto as sku_produto,
    vp.desc_produto,
    COALESCE(vp.desc_familia, vp.familia) as categoria_produto,
    vp.ultima_venda_periodo as ultima_venda,
    CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(vp.ultima_venda_periodo)) / 7 AS INTEGER) as qtd_semanas_parado,
    ROUND(vp.valor_medio_venda, 2) as valor_medio_perdido,
    vp.qtd_vendas_anteriores,
    CASE
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(vp.ultima_venda_periodo)) / 7 AS INTEGER) >= 6 THEN 'EXTREMO'
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(vp.ultima_venda_periodo)) / 7 AS INTEGER) >= 5 THEN 'MUITO ALTO'
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(vp.ultima_venda_periodo)) / 7 AS INTEGER) >= 4 THEN 'ALTO'
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(vp.ultima_venda_periodo)) / 7 AS INTEGER) >= 3 THEN 'MODERADO'
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(vp.ultima_venda_periodo)) / 7 AS INTEGER) >= 2 THEN 'BAIXO'
        ELSE 'MÍNIMO'
    END as nivel_risco
FROM vendas_periodo_anterior vp
LEFT JOIN vendas_recentes vr
    ON vp.representante = vr.representante
    AND vp.produto = vr.produto
WHERE vr.produto IS NULL
ORDER BY qtd_semanas_parado DESC, valor_medio_perdido DESC;

-- =====================================================
-- TESTE 1: Ver data de referência usada
-- =====================================================
SELECT MAX(emissao) as data_referencia_usada
FROM vendas
WHERE emissao != '';

-- Resultado esperado: 2025-11-29

-- =====================================================
-- TESTE 2: Ver distribuição por nível de risco
-- =====================================================
SELECT
    nivel_risco,
    COUNT(*) as quantidade,
    SUM(valor_medio_perdido) as valor_total
FROM vw_produtos_parados
GROUP BY nivel_risco
ORDER BY
    CASE nivel_risco
        WHEN 'EXTREMO' THEN 1
        WHEN 'MUITO ALTO' THEN 2
        WHEN 'ALTO' THEN 3
        WHEN 'MODERADO' THEN 4
        WHEN 'BAIXO' THEN 5
        WHEN 'MÍNIMO' THEN 6
    END;

-- =====================================================
-- TESTE 3: Ver alguns exemplos
-- =====================================================
SELECT
    desc_representante,
    desc_produto,
    ultima_venda,
    qtd_semanas_parado,
    nivel_risco,
    valor_medio_perdido
FROM vw_produtos_parados
ORDER BY qtd_semanas_parado DESC, valor_medio_perdido DESC
LIMIT 20;

-- =====================================================
-- EXPLICAÇÃO DA MUDANÇA
-- =====================================================
--
-- PROBLEMA:
-- - date('now') estava retornando data incorreta no Turso
-- - Todas as vendas apareciam como "Mais de 8 semanas"
-- - Mesmo com última venda em 29/11/2025
--
-- SOLUÇÃO:
-- - Usa MAX(emissao) da tabela vendas como data de referência
-- - Calcula períodos baseado na data mais recente de vendas
-- - Elimina dependência de date('now')
-- - Mais confiável e preciso
--
-- VANTAGENS:
-- - Funciona mesmo se date('now') estiver incorreto
-- - Usa dados reais da tabela
-- - Mais preciso para análise histórica
-- - Independente do timezone do servidor
--
-- =====================================================
