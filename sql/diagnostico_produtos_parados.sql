-- =====================================================
-- DIAGNÓSTICO: PRODUTOS PARADOS - Por que está vazio?
-- =====================================================
-- Execute estas queries NO TURSO para investigar o problema
-- =====================================================

-- =====================================================
-- 1. VERIFICAR SE HÁ DADOS NA TABELA VENDAS
-- =====================================================
SELECT
    COUNT(*) as total_vendas,
    MIN(emissao) as primeira_venda,
    MAX(emissao) as ultima_venda,
    COUNT(DISTINCT representante) as total_representantes,
    COUNT(DISTINCT produto) as total_produtos
FROM vendas
WHERE emissao != ''
    AND representante != '';

-- ⚠️ RESULTADO ESPERADO:
-- - total_vendas: Deve ter milhares de registros
-- - primeira_venda e ultima_venda: Verificar o intervalo de datas
-- - Se ultima_venda for antiga (ex: 2023), não há dados recentes!

-- =====================================================
-- 2. VERIFICAR FORMATO DAS DATAS
-- =====================================================
SELECT
    emissao as data_original,
    typeof(emissao) as tipo_dado,
    date(emissao) as data_convertida,
    date('now') as data_hoje,
    date('now', '-2 weeks') as data_2_semanas_atras,
    date('now', '-4 weeks') as data_4_semanas_atras
FROM vendas
WHERE emissao != ''
LIMIT 5;

-- ⚠️ VERIFICAR:
-- - Se data_hoje está correto
-- - Se data_2_semanas_atras e data_4_semanas_atras fazem sentido
-- - Se o formato de emissao é compatível com date()

-- =====================================================
-- 3. VENDAS NAS ÚLTIMAS 8 SEMANAS (resumo)
-- =====================================================
SELECT
    CASE
        WHEN emissao >= date('now', '-1 weeks') THEN '1. Última semana'
        WHEN emissao >= date('now', '-2 weeks') THEN '2. Últimas 2 semanas'
        WHEN emissao >= date('now', '-3 weeks') THEN '3. Última 3 semanas'
        WHEN emissao >= date('now', '-4 weeks') THEN '4. Últimas 4 semanas'
        WHEN emissao >= date('now', '-5 weeks') THEN '5. Últimas 5 semanas'
        WHEN emissao >= date('now', '-6 weeks') THEN '6. Últimas 6 semanas'
        WHEN emissao >= date('now', '-7 weeks') THEN '7. Últimas 7 semanas'
        WHEN emissao >= date('now', '-8 weeks') THEN '8. Últimas 8 semanas'
        ELSE '9. Mais de 8 semanas'
    END as periodo,
    COUNT(*) as qtd_vendas,
    COUNT(DISTINCT produto) as qtd_produtos,
    COUNT(DISTINCT representante) as qtd_representantes
FROM vendas
WHERE emissao != ''
    AND representante != ''
GROUP BY periodo
ORDER BY periodo;

-- ⚠️ ANALISAR:
-- - Se há vendas em TODOS os períodos
-- - Se há um gap (ex: vendas na semana 1, mas nada entre 2-4 semanas)
-- - Isso explicaria por que não há produtos "parados"

-- =====================================================
-- 4. TESTAR LÓGICA: Produtos vendidos 2-4 semanas atrás
-- =====================================================
SELECT
    COUNT(DISTINCT produto, representante) as total_combinacoes,
    COUNT(*) as total_vendas
FROM (
    SELECT
        v.representante,
        v.produto,
        COUNT(*) as qtd_vendas_periodo
    FROM vendas v
    WHERE v.emissao BETWEEN date('now', '-4 weeks') AND date('now', '-2 weeks')
        AND v.emissao != ''
        AND v.representante != ''
    GROUP BY v.representante, v.produto
    HAVING COUNT(*) >= 2  -- Pelo menos 2 vendas
);

-- ⚠️ ESPERADO:
-- - Se retornar 0: NÃO há produtos com 2+ vendas entre 2-4 semanas atrás
-- - Solução: Aumentar o período ou reduzir mínimo de vendas

-- =====================================================
-- 5. TESTAR LÓGICA: Produtos vendidos nas últimas 2 semanas
-- =====================================================
SELECT
    COUNT(DISTINCT produto, representante) as total_combinacoes,
    COUNT(*) as total_vendas
FROM vendas
WHERE emissao >= date('now', '-2 weeks')
    AND emissao != ''
    AND representante != '';

-- ⚠️ ANALISAR:
-- - Quantos produtos foram vendidos recentemente

-- =====================================================
-- 6. TESTAR LÓGICA COMPLETA: Candidatos a "Parados"
-- =====================================================
-- Produtos vendidos 2-4 semanas atrás, mas NÃO nas últimas 2 semanas

WITH vendas_periodo_anterior AS (
    SELECT DISTINCT
        v.representante,
        v.produto,
        COUNT(*) as qtd_vendas
    FROM vendas v
    WHERE v.emissao BETWEEN date('now', '-4 weeks') AND date('now', '-2 weeks')
        AND v.emissao != ''
        AND v.representante != ''
    GROUP BY v.representante, v.produto
    HAVING COUNT(*) >= 2
),
vendas_recentes AS (
    SELECT DISTINCT
        representante,
        produto
    FROM vendas
    WHERE emissao >= date('now', '-2 weeks')
        AND emissao != ''
        AND representante != ''
)
SELECT
    COUNT(*) as produtos_parados_encontrados,
    SUM(vp.qtd_vendas) as total_vendas_anteriores
FROM vendas_periodo_anterior vp
LEFT JOIN vendas_recentes vr
    ON vp.representante = vr.representante
    AND vp.produto = vr.produto
WHERE vr.produto IS NULL;

-- ⚠️ SE RETORNAR 0:
-- Problema 1: Período muito curto (2-4 semanas pode ser insuficiente)
-- Problema 2: Todos os produtos continuam sendo vendidos (improvável)
-- Problema 3: Dados não estão sendo atualizados regularmente

-- =====================================================
-- 7. ALTERNATIVA: Testar com período MAIOR (4-8 semanas)
-- =====================================================
WITH vendas_periodo_anterior AS (
    SELECT DISTINCT
        v.representante,
        v.produto,
        tr.desc_representante,
        tp.desc_produto,
        COUNT(*) as qtd_vendas,
        MAX(v.emissao) as ultima_venda
    FROM vendas v
    INNER JOIN tab_representante tr ON v.representante = tr.representante
    LEFT JOIN tab_produto tp ON v.produto = tp.produto
    WHERE v.emissao BETWEEN date('now', '-8 weeks') AND date('now', '-4 weeks')
        AND v.emissao != ''
        AND v.representante != ''
    GROUP BY v.representante, v.produto, tr.desc_representante, tp.desc_produto
    HAVING COUNT(*) >= 2
),
vendas_recentes AS (
    SELECT DISTINCT
        representante,
        produto
    FROM vendas
    WHERE emissao >= date('now', '-4 weeks')
        AND emissao != ''
        AND representante != ''
)
SELECT
    vp.desc_representante,
    vp.desc_produto,
    vp.ultima_venda,
    CAST((julianday('now') - julianday(vp.ultima_venda)) / 7 AS INTEGER) as semanas_parado,
    vp.qtd_vendas as vendas_periodo_anterior
FROM vendas_periodo_anterior vp
LEFT JOIN vendas_recentes vr
    ON vp.representante = vr.representante
    AND vp.produto = vr.produto
WHERE vr.produto IS NULL
ORDER BY semanas_parado DESC
LIMIT 20;

-- ⚠️ SE RETORNAR DADOS AQUI:
-- Significa que o período 2-4 semanas é MUITO CURTO!
-- Solução: Voltar para 4-8 semanas (versão antiga)

-- =====================================================
-- 8. VERIFICAR: Produtos com vendas esporádicas
-- =====================================================
-- Quantos produtos têm vendas regulares vs esporádicas?

SELECT
    CASE
        WHEN qtd_semanas_com_venda >= 6 THEN '1. Muito Regular (6+ semanas)'
        WHEN qtd_semanas_com_venda >= 4 THEN '2. Regular (4-5 semanas)'
        WHEN qtd_semanas_com_venda >= 2 THEN '3. Esporádico (2-3 semanas)'
        ELSE '4. Raro (1 semana)'
    END as padrão_venda,
    COUNT(DISTINCT produto, representante) as qtd_produtos
FROM (
    SELECT
        representante,
        produto,
        COUNT(DISTINCT strftime('%Y-%W', emissao)) as qtd_semanas_com_venda
    FROM vendas
    WHERE emissao >= date('now', '-8 weeks')
        AND emissao != ''
        AND representante != ''
    GROUP BY representante, produto
)
GROUP BY padrão_venda
ORDER BY padrão_venda;

-- ⚠️ ANALISAR:
-- - Se a maioria é "Raro" ou "Esporádico", a lógica precisa ser ajustada
-- - Produtos vendidos irregularmente não se enquadram no critério "2+ vendas"

-- =====================================================
-- 9. RESUMO: Qual é o problema?
-- =====================================================
SELECT
    '1. Dados Básicos' as diagnostico,
    (SELECT COUNT(*) FROM vendas WHERE emissao >= date('now', '-8 weeks')) as vendas_8_semanas,
    (SELECT COUNT(*) FROM vendas WHERE emissao >= date('now', '-4 weeks')) as vendas_4_semanas,
    (SELECT COUNT(*) FROM vendas WHERE emissao >= date('now', '-2 weeks')) as vendas_2_semanas

UNION ALL

SELECT
    '2. Período Anterior (2-4 sem atrás, 2+ vendas)',
    (SELECT COUNT(DISTINCT representante, produto) FROM (
        SELECT representante, produto, COUNT(*) as cnt
        FROM vendas
        WHERE emissao BETWEEN date('now', '-4 weeks') AND date('now', '-2 weeks')
            AND emissao != '' AND representante != ''
        GROUP BY representante, produto
        HAVING COUNT(*) >= 2
    )),
    NULL,
    NULL

UNION ALL

SELECT
    '3. Vendas Recentes (últimas 2 sem)',
    (SELECT COUNT(DISTINCT representante, produto)
     FROM vendas
     WHERE emissao >= date('now', '-2 weeks')
        AND emissao != '' AND representante != ''),
    NULL,
    NULL

UNION ALL

SELECT
    '4. Período Alternativo (4-8 sem atrás, 2+ vendas)',
    (SELECT COUNT(DISTINCT representante, produto) FROM (
        SELECT representante, produto, COUNT(*) as cnt
        FROM vendas
        WHERE emissao BETWEEN date('now', '-8 weeks') AND date('now', '-4 weeks')
            AND emissao != '' AND representante != ''
        GROUP BY representante, produto
        HAVING COUNT(*) >= 2
    )),
    NULL,
    NULL;

-- =====================================================
-- INTERPRETAÇÃO DOS RESULTADOS:
-- =====================================================
--
-- CENÁRIO 1: Linha "2. Período Anterior" = 0
-- → Não há produtos com 2+ vendas entre 2-4 semanas atrás
-- → SOLUÇÃO: Aumentar período (voltar para 4-8 semanas)
--
-- CENÁRIO 2: Linha "2. Período Anterior" > 0 mas "4" = 0
-- → Todos os produtos continuam sendo vendidos
-- → SOLUÇÃO: Aumentar período ou ajustar critério
--
-- CENÁRIO 3: Linha "4. Período Alternativo" > 0
-- → O período 2-4 semanas é muito curto
-- → SOLUÇÃO: Usar período 4-8 semanas
--
-- =====================================================
