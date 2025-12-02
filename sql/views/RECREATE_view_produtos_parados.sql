-- =====================================================
-- RECRIAR VIEW PRODUTOS PARADOS - VERSÃO 2.0
-- =====================================================
-- IMPORTANTE: Este script APAGA a view antiga e cria a nova
-- Execute este script no Turso SQL Editor
-- =====================================================

-- PASSO 1: Remover view antiga
DROP VIEW IF EXISTS vw_produtos_parados;

-- PASSO 2: Criar view nova (Versão 2.0)
CREATE VIEW vw_produtos_parados AS
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
-- VERIFICAR SE FOI CRIADA CORRETAMENTE
-- =====================================================

-- Deve retornar: vw_produtos_parados | view
SELECT name, type FROM sqlite_master WHERE name = 'vw_produtos_parados';

-- =====================================================
-- TESTE: Ver alguns produtos parados
-- =====================================================

-- Deve mostrar produtos com novos níveis de risco
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
-- TESTE: Verificar caso específico (A C CAUDURO)
-- =====================================================

SELECT
    desc_representante,
    desc_produto,
    ultima_venda,
    qtd_semanas_parado,
    nivel_risco,
    valor_medio_perdido
FROM vw_produtos_parados
WHERE desc_representante LIKE '%CAUDURO%'
    AND desc_produto LIKE '%COROA BISCOITO%'
ORDER BY qtd_semanas_parado DESC;
