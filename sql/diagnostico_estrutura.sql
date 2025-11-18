-- =====================================================
-- SCRIPT DE DIAGNÓSTICO - Estrutura do Banco
-- =====================================================
-- Execute este script no Turso e me envie TODO o resultado

-- 1. ESTRUTURA DA TABELA vendas
SELECT '=== ESTRUTURA: vendas ===' as info;
PRAGMA table_info(vendas);

-- 2. ESTRUTURA DA TABELA tab_representante
SELECT '=== ESTRUTURA: tab_representante ===' as info;
PRAGMA table_info(tab_representante);

-- 3. ESTRUTURA DA TABELA tab_produto
SELECT '=== ESTRUTURA: tab_produto ===' as info;
PRAGMA table_info(tab_produto);

-- 4. EXEMPLO DE DADOS DA TABELA vendas (5 registros)
SELECT '=== EXEMPLO: vendas ===' as info;
SELECT * FROM vendas LIMIT 5;

-- 5. EXEMPLO DE DADOS DA TABELA tab_representante (5 registros)
SELECT '=== EXEMPLO: tab_representante ===' as info;
SELECT * FROM tab_representante LIMIT 5;

-- 6. EXEMPLO DE DADOS DA TABELA tab_produto (5 registros)
SELECT '=== EXEMPLO: tab_produto ===' as info;
SELECT * FROM tab_produto LIMIT 5;

-- 7. TIPO DE DADOS DO CAMPO emissao
SELECT '=== TIPO DE DATA: emissao ===' as info;
SELECT
    emissao,
    typeof(emissao) as tipo_dado,
    date(emissao) as data_convertida
FROM vendas
LIMIT 3;

-- 8. TIPO DE DADOS DOS CAMPOS representante e produto
SELECT '=== TIPOS: representante e produto ===' as info;
SELECT
    representante,
    typeof(representante) as tipo_representante,
    produto,
    typeof(produto) as tipo_produto
FROM vendas
LIMIT 3;

-- 9. VERIFICAR SE HÁ CAMPOS DE FILTRO (status, tipo, etc)
SELECT '=== COLUNAS COMPLETAS: vendas ===' as info;
SELECT sql FROM sqlite_master WHERE type='table' AND name='vendas';

-- =====================================================
-- INSTRUÇÕES:
-- 1. Conecte ao Turso: turso db shell comercial
-- 2. Copie TODO este script e cole no terminal
-- 3. Copie TODO o resultado e me envie
-- =====================================================
