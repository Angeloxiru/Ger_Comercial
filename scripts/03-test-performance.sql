-- =====================================================
-- SCRIPT DE TESTE DE PERFORMANCE
-- =====================================================
--
-- Use este script para verificar o impacto dos índices
-- e comparar a performance antes/depois.
--
-- COMO USAR:
-- 1. Execute este script ANTES de criar índices
-- 2. Anote os tempos
-- 3. Execute scripts/01-create-indexes.sql
-- 4. Execute este script DEPOIS
-- 5. Compare os resultados!
-- =====================================================

-- =====================================================
-- ATIVAR MEDIÇÃO DE TEMPO
-- =====================================================
-- No Turso CLI, use: .timer on
-- No código, use: console.time() / console.timeEnd()

-- =====================================================
-- TESTE 1: Query de Dashboard Vendas por Região
-- =====================================================
SELECT
    v.produto,
    v.complemento,
    SUM(v.qtde_faturada) as qtde,
    SUM(v.valor_liquido) as valor
FROM vendas v
LEFT JOIN tab_cliente c ON v.cliente = c.cliente
WHERE v.emissao >= '2024-01-01'
  AND v.emissao <= '2024-12-31'
  AND c.rota IN ('ROTA A', 'ROTA B')
GROUP BY v.produto, v.complemento
ORDER BY qtde DESC
LIMIT 100;

-- 📊 RESULTADO ESPERADO:
-- Sem índice: 2-5 segundos
-- Com índice: 0.1-0.3 segundos
-- Melhoria: 90-95%

-- =====================================================
-- TESTE 2: Query de Dashboard Vendas por Equipe
-- =====================================================
SELECT
    v.produto,
    v.complemento,
    SUM(v.qtde_faturada) as qtde,
    SUM(v.valor_liquido) as valor
FROM vendas v
LEFT JOIN tab_representante r ON v.representante = r.representante
WHERE v.emissao >= '2024-01-01'
  AND v.emissao <= '2024-12-31'
  AND r.rep_supervisor = 'SUPERVISOR X'
GROUP BY v.produto, v.complemento
ORDER BY qtde DESC
LIMIT 100;

-- 📊 RESULTADO ESPERADO:
-- Sem índice: 2-4 segundos
-- Com índice: 0.1-0.2 segundos
-- Melhoria: 90-95%

-- =====================================================
-- TESTE 3: Query de Dashboard Análise de Produtos
-- =====================================================
SELECT
    v.cliente,
    v.nome,
    v.cidade,
    SUM(v.qtde_faturada) as qtde,
    SUM(v.valor_liquido) as valor
FROM vendas v
INNER JOIN tab_produto p ON v.produto = p.produto
WHERE v.emissao >= '2024-01-01'
  AND v.emissao <= '2024-12-31'
  AND p.desc_origem = 'NACIONAL'
  AND p.desc_familia = 'BEBIDAS'
GROUP BY v.cliente, v.nome, v.cidade
ORDER BY qtde DESC
LIMIT 100;

-- 📊 RESULTADO ESPERADO:
-- Sem índice: 3-6 segundos
-- Com índice: 0.2-0.4 segundos
-- Melhoria: 90-95%

-- =====================================================
-- TESTE 4: Query de Performance de Clientes
-- =====================================================
SELECT
    v.produto,
    v.complemento,
    c.nome as cliente_nome,
    SUM(v.qtde_faturada) as qtde,
    SUM(v.valor_liquido) as valor
FROM vendas v
INNER JOIN tab_cliente c ON v.cliente = c.cliente
WHERE v.emissao >= '2024-01-01'
  AND v.emissao <= '2024-12-31'
  AND c.grupo_desc = 'GRUPO A'
GROUP BY v.produto, v.complemento, c.nome
ORDER BY qtde DESC
LIMIT 100;

-- 📊 RESULTADO ESPERADO:
-- Sem índice: 2-5 segundos
-- Com índice: 0.1-0.3 segundos
-- Melhoria: 90-95%

-- =====================================================
-- TESTE 5: Carregar Filtros (Dropdown)
-- =====================================================
-- Teste de queries usadas para preencher filtros

-- Rotas
SELECT DISTINCT rota
FROM tab_cliente
WHERE rota IS NOT NULL
ORDER BY rota;

-- Supervisores
SELECT DISTINCT rep_supervisor
FROM tab_representante
WHERE rep_supervisor IS NOT NULL
ORDER BY rep_supervisor;

-- Origens de Produto
SELECT DISTINCT desc_origem
FROM tab_produto
WHERE desc_origem IS NOT NULL
ORDER BY desc_origem;

-- Grupos de Cliente
SELECT DISTINCT grupo_desc
FROM tab_cliente
WHERE grupo_desc IS NOT NULL
ORDER BY grupo_desc;

-- 📊 RESULTADO ESPERADO:
-- Sem índice: 0.5-2 segundos (cada)
-- Com índice: 0.01-0.05 segundos (cada)
-- Melhoria: 95-98%

-- =====================================================
-- TESTE 6: Count Total de Registros
-- =====================================================
SELECT COUNT(*) as total FROM vendas;
SELECT COUNT(*) as total FROM tab_cliente;
SELECT COUNT(*) as total FROM tab_produto;
SELECT COUNT(*) as total FROM tab_representante;

-- 📊 RESULTADO ESPERADO:
-- Sem índice: 0.5-1 segundo
-- Com índice: 0.01-0.1 segundo
-- Melhoria: 90%

-- =====================================================
-- VERIFICAR SE ÍNDICES ESTÃO SENDO USADOS
-- =====================================================
-- Use EXPLAIN QUERY PLAN para ver se o SQLite está
-- usando os índices nas queries

EXPLAIN QUERY PLAN
SELECT * FROM vendas
WHERE emissao >= '2024-01-01'
  AND emissao <= '2024-12-31';

-- ✅ Se aparecer "USING INDEX idx_vendas_emissao" = Índice está funcionando!
-- ❌ Se aparecer "SCAN TABLE vendas" = Índice NÃO está sendo usado

-- =====================================================
-- ESTATÍSTICAS DE ÍNDICES
-- =====================================================
-- Ver informações sobre os índices criados

SELECT
    name as indice,
    tbl_name as tabela,
    sql as comando_criacao
FROM sqlite_master
WHERE type = 'index'
  AND name LIKE 'idx_%'
ORDER BY tbl_name, name;

-- =====================================================
-- COMPARAÇÃO VISUAL
-- =====================================================

-- Copie e cole os resultados abaixo após cada execução:

/*
RESULTADOS ANTES DOS ÍNDICES:
============================
Teste 1: ___ segundos
Teste 2: ___ segundos
Teste 3: ___ segundos
Teste 4: ___ segundos
Teste 5: ___ segundos
Teste 6: ___ segundos
TOTAL: ___ segundos


RESULTADOS DEPOIS DOS ÍNDICES:
==============================
Teste 1: ___ segundos
Teste 2: ___ segundos
Teste 3: ___ segundos
Teste 4: ___ segundos
Teste 5: ___ segundos
Teste 6: ___ segundos
TOTAL: ___ segundos


MELHORIA:
=========
Tempo total reduzido em: ____%
Queries mais rápidas em média: ____%
*/

-- =====================================================
-- FIM DO SCRIPT DE TESTE
-- =====================================================

-- 🎯 OBJETIVO:
-- Demonstrar que índices fazem uma diferença MASSIVA
-- na performance do sistema, especialmente com 45k+ registros.
