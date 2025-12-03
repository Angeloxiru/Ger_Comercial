-- =====================================================
-- VIEW: PRODUTOS PARADOS - Ger Comercial (VERSÃO 3.0 FINAL)
-- =====================================================
-- Identifica produtos que os representantes não vendem há 1+ semanas
--
-- CORREÇÃO v3.0: Lógica completamente reformulada
-- Motivo: Versão anterior só detectava produtos parados há 4+ semanas
-- Nova lógica: Detecta última venda de cada produto e calcula semanas paradas
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
ultima_venda_por_produto AS (
    -- Para cada representante+produto, pega a última venda
    SELECT
        tr.rep_supervisor,
        tr.desc_representante,
        v.representante,
        v.produto,
        tp.desc_produto,
        v.familia,
        tp.desc_familia,
        MAX(v.emissao) as ultima_venda,
        AVG(v.valor_bruto) as valor_medio_venda,
        COUNT(*) as total_vendas_historico
    FROM vendas v
    INNER JOIN tab_representante tr ON v.representante = tr.representante
    LEFT JOIN tab_produto tp ON v.produto = tp.produto
    WHERE v.emissao != ''
        AND v.representante != ''
    GROUP BY tr.rep_supervisor, tr.desc_representante, v.representante,
             v.produto, tp.desc_produto, v.familia, tp.desc_familia
)
SELECT
    uvp.rep_supervisor,
    uvp.desc_representante,
    uvp.representante as cod_representante,
    uvp.produto as sku_produto,
    uvp.desc_produto,
    COALESCE(uvp.desc_familia, uvp.familia) as categoria_produto,
    uvp.ultima_venda,
    CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(uvp.ultima_venda)) / 7 AS INTEGER) as qtd_semanas_parado,
    ROUND(uvp.valor_medio_venda, 2) as valor_medio_perdido,
    uvp.total_vendas_historico as qtd_vendas_anteriores,
    CASE
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(uvp.ultima_venda)) / 7 AS INTEGER) >= 6 THEN 'EXTREMO'
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(uvp.ultima_venda)) / 7 AS INTEGER) >= 5 THEN 'MUITO ALTO'
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(uvp.ultima_venda)) / 7 AS INTEGER) >= 4 THEN 'ALTO'
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(uvp.ultima_venda)) / 7 AS INTEGER) >= 3 THEN 'MODERADO'
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(uvp.ultima_venda)) / 7 AS INTEGER) >= 2 THEN 'BAIXO'
        ELSE 'MÍNIMO'
    END as nivel_risco
FROM ultima_venda_por_produto uvp
CROSS JOIN data_referencia dr
WHERE CAST((julianday(dr.data_maxima) - julianday(uvp.ultima_venda)) / 7 AS INTEGER) >= 1
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

-- TESTE 5: Verificar produtos com diferentes períodos parados
SELECT
    'Parados 1 semana (MÍNIMO)' as categoria,
    COUNT(*) as quantidade
FROM vw_produtos_parados
WHERE nivel_risco = 'MÍNIMO'
UNION ALL
SELECT
    'Parados 2 semanas (BAIXO)' as categoria,
    COUNT(*) as quantidade
FROM vw_produtos_parados
WHERE nivel_risco = 'BAIXO'
UNION ALL
SELECT
    'Parados 3 semanas (MODERADO)' as categoria,
    COUNT(*) as quantidade
FROM vw_produtos_parados
WHERE nivel_risco = 'MODERADO'
UNION ALL
SELECT
    'Parados 4 semanas (ALTO)' as categoria,
    COUNT(*) as quantidade
FROM vw_produtos_parados
WHERE nivel_risco = 'ALTO'
UNION ALL
SELECT
    'Parados 5 semanas (MUITO ALTO)' as categoria,
    COUNT(*) as quantidade
FROM vw_produtos_parados
WHERE nivel_risco = 'MUITO ALTO'
UNION ALL
SELECT
    'Parados 6+ semanas (EXTREMO)' as categoria,
    COUNT(*) as quantidade
FROM vw_produtos_parados
WHERE nivel_risco = 'EXTREMO';

-- =====================================================
-- OBSERVAÇÕES E CHANGELOG
-- =====================================================

-- VERSÃO 3.0 - REFORMULAÇÃO COMPLETA DA LÓGICA:

-- PROBLEMA nas versões anteriores (2.x):
-- A query comparava "período anterior (4-8 semanas)" vs "período recente (últimas 4 semanas)"
-- Isso só detectava produtos parados há 4+ semanas!
-- Produtos parados há 1, 2 ou 3 semanas ainda apareciam no "período recente" e eram ignorados

-- NOVA LÓGICA v3.0:
-- 1. Pega a última venda de cada representante+produto (MAX(emissao))
-- 2. Calcula quantas semanas se passaram desde a última venda
-- 3. Se passou 1+ semana = produto parado
-- 4. Classifica por nível de risco conforme semanas paradas

-- VANTAGENS v3.0:
-- ✅ Detecta produtos parados há 1, 2, 3, 4, 5, 6+ semanas (todas as faixas)
-- ✅ Lógica mais simples e direta
-- ✅ Mais fácil de entender e manter
-- ✅ Usa MAX(emissao) como referência (sem problemas de date('now'))
-- ✅ Elimina necessidade de comparar dois períodos diferentes

-- MUDANÇAS ESTRUTURAIS:
-- - Removida CTE "vendas_periodo_anterior" (não mais necessária)
-- - Removida CTE "vendas_recentes" (não mais necessária)
-- - Adicionada CTE "ultima_venda_por_produto" (simples e direta)
-- - WHERE final: >= 1 semana parada (ao invés de comparação entre períodos)

-- HISTÓRICO:
-- v2.0: Introduzida lógica de períodos, níveis de risco 6 categorias
-- v2.1: Mudança de date('now') para MAX(emissao)
-- v2.1.1: Período ajustado de 2-4 para 4-8 semanas
-- v2.1.2: Critério mudado de 2+ para 1+ vendas
-- v3.0: Reformulação completa - última venda ao invés de comparação de períodos
