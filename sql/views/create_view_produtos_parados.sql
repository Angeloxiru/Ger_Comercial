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
todas_vendas_agregadas AS (
    -- Agregar todas as vendas para calcular médias e totais
    SELECT
        v.representante,
        v.produto,
        AVG(v.valor_bruto) as valor_medio_venda,
        COUNT(*) as total_vendas_historico
    FROM vendas v
    WHERE v.emissao != ''
        AND v.representante != ''
    GROUP BY v.representante, v.produto
),
vendas_ranqueadas AS (
    -- Ranquear vendas por data para pegar a última venda com o cliente
    SELECT
        tr.rep_supervisor,
        tr.desc_representante,
        v.representante,
        v.produto,
        tp.desc_produto,
        v.familia,
        tp.desc_familia,
        v.emissao,
        v.cliente,
        tc.nome as nome_cliente,
        ROW_NUMBER() OVER (
            PARTITION BY v.representante, v.produto
            ORDER BY v.emissao DESC
        ) as rn
    FROM vendas v
    INNER JOIN tab_representante tr ON v.representante = tr.representante
    LEFT JOIN tab_produto tp ON v.produto = tp.produto
    LEFT JOIN tab_cliente tc ON v.cliente = tc.cliente
    WHERE v.emissao != ''
        AND v.representante != ''
),
ultima_venda_com_cliente AS (
    -- Filtrar apenas a última venda (rn = 1)
    SELECT
        rep_supervisor,
        desc_representante,
        representante,
        produto,
        desc_produto,
        familia,
        desc_familia,
        emissao as ultima_venda,
        cliente as ultimo_cliente_cod,
        nome_cliente as ultimo_cliente_nome
    FROM vendas_ranqueadas
    WHERE rn = 1
)
SELECT
    uvc.rep_supervisor,
    uvc.desc_representante,
    uvc.representante as cod_representante,
    uvc.produto as sku_produto,
    uvc.desc_produto,
    COALESCE(uvc.desc_familia, uvc.familia) as categoria_produto,
    uvc.ultima_venda,
    uvc.ultimo_cliente_cod,
    uvc.ultimo_cliente_nome,
    CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(uvc.ultima_venda)) / 7 AS INTEGER) as qtd_semanas_parado,
    ROUND(tva.valor_medio_venda, 2) as valor_medio_perdido,
    tva.total_vendas_historico as qtd_vendas_anteriores,
    CASE
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(uvc.ultima_venda)) / 7 AS INTEGER) >= 6 THEN 'EXTREMO'
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(uvc.ultima_venda)) / 7 AS INTEGER) >= 5 THEN 'MUITO ALTO'
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(uvc.ultima_venda)) / 7 AS INTEGER) >= 4 THEN 'ALTO'
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(uvc.ultima_venda)) / 7 AS INTEGER) >= 3 THEN 'MODERADO'
        WHEN CAST((julianday((SELECT data_maxima FROM data_referencia)) - julianday(uvc.ultima_venda)) / 7 AS INTEGER) >= 2 THEN 'BAIXO'
        ELSE 'MÍNIMO'
    END as nivel_risco
FROM ultima_venda_com_cliente uvc
INNER JOIN todas_vendas_agregadas tva
    ON uvc.representante = tva.representante
    AND uvc.produto = tva.produto
CROSS JOIN data_referencia dr
WHERE CAST((julianday(dr.data_maxima) - julianday(uvc.ultima_venda)) / 7 AS INTEGER) >= 1
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
-- v3.4: Adicionado último cliente que comprou (ultimo_cliente_cod, ultimo_cliente_nome)
