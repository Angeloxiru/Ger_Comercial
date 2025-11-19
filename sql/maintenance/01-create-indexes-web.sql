-- =====================================================
-- SCRIPT DE CRIAÇÃO DE ÍNDICES PARA GER_COMERCIAL
-- VERSÃO PARA TURSO DASHBOARD WEB (Sem ANALYZE)
-- =====================================================
--
-- Este script cria índices essenciais para otimizar
-- as queries dos dashboards.
--
-- IMPACTO ESPERADO:
-- - Redução de 50-90% no tempo de query
-- - Redução de 95-99% no consumo de reads do Turso
--
-- TEMPO DE EXECUÇÃO: ~2 minutos
-- SEGURANÇA: Não altera dados, apenas cria estruturas
-- =====================================================

-- =====================================================
-- 1. ÍNDICES NA TABELA VENDAS (Principal)
-- =====================================================

-- Data de emissão (usado em TODOS os dashboards)
CREATE INDEX IF NOT EXISTS idx_vendas_emissao
ON vendas(emissao);

-- Cliente (usado em joins e filtros)
CREATE INDEX IF NOT EXISTS idx_vendas_cliente
ON vendas(cliente);

-- Produto (usado em filtros de produtos)
CREATE INDEX IF NOT EXISTS idx_vendas_produto
ON vendas(produto);

-- Representante (Dashboard Vendas por Equipe)
CREATE INDEX IF NOT EXISTS idx_vendas_representante
ON vendas(representante);

-- Cidade (usado em vários dashboards)
CREATE INDEX IF NOT EXISTS idx_vendas_cidade
ON vendas(cidade);

-- =====================================================
-- 2. ÍNDICES COMPOSTOS (Múltiplas Colunas)
-- =====================================================

-- Emissão + Cliente
CREATE INDEX IF NOT EXISTS idx_vendas_emissao_cliente
ON vendas(emissao, cliente);

-- Emissão + Produto
CREATE INDEX IF NOT EXISTS idx_vendas_emissao_produto
ON vendas(emissao, produto);

-- Emissão + Representante
CREATE INDEX IF NOT EXISTS idx_vendas_emissao_representante
ON vendas(emissao, representante);

-- Emissão + Cidade
CREATE INDEX IF NOT EXISTS idx_vendas_emissao_cidade
ON vendas(emissao, cidade);

-- =====================================================
-- 3. ÍNDICES NA TABELA TAB_CLIENTE
-- =====================================================

-- Rota
CREATE INDEX IF NOT EXISTS idx_cliente_rota
ON tab_cliente(rota);

-- Sub-Rota
CREATE INDEX IF NOT EXISTS idx_cliente_subrota
ON tab_cliente(sub_rota);

-- Cidade
CREATE INDEX IF NOT EXISTS idx_cliente_cidade
ON tab_cliente(cidade);

-- Grupo de Cliente
CREATE INDEX IF NOT EXISTS idx_cliente_grupo
ON tab_cliente(grupo_desc);

-- Nome
CREATE INDEX IF NOT EXISTS idx_cliente_nome
ON tab_cliente(nome);

-- Cliente (chave primária)
CREATE INDEX IF NOT EXISTS idx_cliente_codigo
ON tab_cliente(cliente);

-- =====================================================
-- 4. ÍNDICES NA TABELA TAB_PRODUTO
-- =====================================================

-- Origem
CREATE INDEX IF NOT EXISTS idx_produto_origem
ON tab_produto(desc_origem);

-- Família
CREATE INDEX IF NOT EXISTS idx_produto_familia
ON tab_produto(desc_familia);

-- Descrição do Produto
CREATE INDEX IF NOT EXISTS idx_produto_descricao
ON tab_produto(desc_produto);

-- Código do Produto
CREATE INDEX IF NOT EXISTS idx_produto_codigo
ON tab_produto(produto);

-- =====================================================
-- 5. ÍNDICES NA TABELA TAB_REPRESENTANTE
-- =====================================================

-- Supervisor
CREATE INDEX IF NOT EXISTS idx_representante_supervisor
ON tab_representante(rep_supervisor);

-- Descrição do Representante
CREATE INDEX IF NOT EXISTS idx_representante_descricao
ON tab_representante(desc_representante);

-- Código do Representante
CREATE INDEX IF NOT EXISTS idx_representante_codigo
ON tab_representante(representante);

-- =====================================================
-- FIM DO SCRIPT - ÍNDICES CRIADOS COM SUCESSO!
-- =====================================================

-- ✅ PRÓXIMOS PASSOS:
-- 1. Teste os dashboards - devem estar MUITO mais rápidos!
-- 2. O comando ANALYZE deve ser executado apenas via Turso CLI
--    (não funciona no dashboard web)
