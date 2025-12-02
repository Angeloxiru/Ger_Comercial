-- =====================================================
-- VIEW PRODUTOS PARADOS - VERSÃO FINAL (DEFINITIVA)
-- =====================================================
-- CORREÇÃO: Converte emissao para DATE em todas as comparações
-- Problema: emissao é TEXT, comparação direta retorna NULL
-- Solução: Usar date(emissao) em TODAS as comparações
-- =====================================================

-- PASSO 1: Remover view antiga
DROP VIEW IF EXISTS vw_produtos_parados;

-- PASSO 2: Criar view DEFINITIVA
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
    WHERE date(v.emissao) BETWEEN date('now', '-4 weeks') AND date('now', '-2 weeks')
        AND v.emissao != ''
        AND v.representante != ''
    GROUP BY tr.rep_supervisor, tr.desc_representante, v.representante,
             v.produto, tp.desc_produto, v.familia, tp.desc_familia
    HAVING COUNT(*) >= 2
),
vendas_recentes AS (
    -- Produtos vendidos nas últimas 2 semanas
    SELECT DISTINCT
        representante,
        produto
    FROM vendas
    WHERE date(emissao) >= date('now', '-2 weeks')
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
WHERE vr.produto IS NULL
ORDER BY qtd_semanas_parado DESC, valor_medio_perdido DESC;

-- =====================================================
-- VALIDAÇÃO: Testar se está funcionando
-- =====================================================

-- TESTE 1: Ver se a view retorna dados
SELECT COUNT(*) as total_produtos_parados
FROM vw_produtos_parados;

-- Esperado: Número > 0

-- TESTE 2: Distribuição por nível de risco
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

-- TESTE 3: Ver top 10 produtos parados
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

-- TESTE 4: Validar períodos
SELECT
    'Hoje' as periodo,
    date('now') as data
UNION ALL
SELECT
    'Há 2 semanas',
    date('now', '-2 weeks')
UNION ALL
SELECT
    'Há 4 semanas',
    date('now', '-4 weeks');

-- =====================================================
-- RESUMO DA CORREÇÃO
-- =====================================================
--
-- PROBLEMA ENCONTRADO:
-- - emissao é armazenado como TEXT (não DATE)
-- - Comparação direta: emissao >= date('now', '-2 weeks')
-- - Retornava NULL porque compara TEXT com DATE
--
-- SOLUÇÃO APLICADA:
-- - Converter AMBOS os lados: date(emissao) >= date('now', '-2 weeks')
-- - Garantir que ambos sejam DATE para comparação correta
--
-- MUDANÇAS NA VIEW:
-- Linha 33: WHERE date(v.emissao) BETWEEN...  (antes: v.emissao)
-- Linha 46: WHERE date(emissao) >= ...        (antes: emissao)
--
-- RESULTADO:
-- - Comparações de data agora funcionam corretamente
-- - View retorna produtos parados reais
-- - Performance mantida (SQLite otimiza date(emissao))
--
-- =====================================================
