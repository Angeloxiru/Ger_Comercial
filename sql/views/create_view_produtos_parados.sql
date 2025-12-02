-- =====================================================
-- VIEW: PRODUTOS PARADOS - Ger Comercial (VERSÃO 2.1 FINAL)
-- =====================================================
-- Identifica produtos que os representantes vendiam regularmente
-- mas pararam de vender nas últimas semanas
--
-- CORREÇÃO v2.1: Usa MAX(emissao) ao invés de date('now')
-- Motivo: date('now') apresenta inconsistências nas comparações WHERE
--
-- Classificação de Risco:
--   1 semana  = MÍNIMO
--   2 semanas = BAIXO
--   3 semanas = MODERADO
--   4 semanas = ALTO
--   5 semanas = MUITO ALTO
--   6+ semanas = EXTREMO
-- =====================================================

DROP VIEW IF EXISTS vw_produtos_parados;

CREATE VIEW vw_produtos_parados AS
WITH data_referencia AS (
    -- Usa a data mais recente de vendas como referência
    SELECT MAX(emissao) as data_maxima
    FROM vendas
    WHERE emissao != ''
),
vendas_periodo_anterior AS (
    -- Produtos vendidos entre 4-8 semanas antes da data mais recente
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
    WHERE v.emissao BETWEEN date(dr.data_maxima, '-8 weeks') AND date(dr.data_maxima, '-4 weeks')
        AND v.emissao != ''
        AND v.representante != ''
    GROUP BY tr.rep_supervisor, tr.desc_representante, v.representante,
             v.produto, tp.desc_produto, v.familia, tp.desc_familia
    HAVING COUNT(*) >= 2
),
vendas_recentes AS (
    -- Produtos vendidos nas últimas 4 semanas (baseado na data máxima)
    SELECT DISTINCT
        v.representante,
        v.produto
    FROM vendas v
    CROSS JOIN data_referencia dr
    WHERE v.emissao >= date(dr.data_maxima, '-4 weeks')
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
-- VALIDAÇÃO: Testar se está funcionando
-- =====================================================

-- TESTE 1: Ver data de referência usada
SELECT MAX(emissao) as data_referencia_usada
FROM vendas
WHERE emissao != '';

-- TESTE 2: Ver se retorna produtos
SELECT COUNT(*) as total_produtos_parados
FROM vw_produtos_parados;

-- TESTE 3: Distribuição por risco
SELECT
    nivel_risco,
    COUNT(*) as quantidade,
    ROUND(SUM(valor_medio_perdido), 2) as valor_total
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

-- TESTE 4: Ver top 10 produtos parados
SELECT
    rep_supervisor,
    desc_representante,
    desc_produto,
    ultima_venda,
    qtd_semanas_parado,
    nivel_risco,
    ROUND(valor_medio_perdido, 2) as valor
FROM vw_produtos_parados
ORDER BY qtd_semanas_parado DESC, valor_medio_perdido DESC
LIMIT 10;

-- =====================================================
-- OBSERVAÇÕES E CHANGELOG
-- =====================================================

-- VERSÃO 2.1 - Correção DEFINITIVA:
-- Problema: date('now', '-2 weeks') no WHERE retornava 0 resultados
-- Causa: Inconsistência do date('now') nas comparações do Turso
-- Solução: Usar MAX(emissao) da tabela como referência temporal

-- MUDANÇAS v2.1:
-- 1. ✅ Adicionada CTE data_referencia com MAX(emissao)
-- 2. ✅ Linha 47: date(dr.data_maxima, '-4 weeks') (antes: date('now', '-4 weeks'))
-- 3. ✅ Linha 60: date(dr.data_maxima, '-2 weeks') (antes: date('now', '-2 weeks'))
-- 4. ✅ Linha 72: julianday(data_maxima) (antes: julianday('now'))
-- 5. ✅ Adicionado DROP VIEW IF EXISTS (garante atualização)

-- VANTAGENS:
-- - Funciona independente de date('now')
-- - Usa dados reais da tabela
-- - Mais confiável e previsível
-- - Elimina bugs de timezone/configuração

-- LÓGICA:
-- - Data referência: MAX(emissao) da tabela vendas
-- - Período anterior: 4-8 semanas antes da data referência (28 dias)
-- - Período recente: Últimas 4 semanas da data referência (28 dias)
-- - Produtos parados: Vendidos 2+ vezes no período anterior mas NÃO no recente

-- AJUSTE v2.1.1:
-- - Mudado de 2-4 semanas para 4-8 semanas (período anterior)
-- - Mudado de 2 semanas para 4 semanas (período recente)
-- - Motivo: Período de 14 dias era muito curto para detectar produtos parados
-- - Benefício: Mais tempo para produtos terem vendas regulares e depois pararem
