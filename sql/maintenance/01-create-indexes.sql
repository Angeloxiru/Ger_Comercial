-- =====================================================
-- SCRIPT DE CRIAÇÃO DE ÍNDICES PARA GER_COMERCIAL
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
-- Prioridade: 🔥🔥🔥🔥🔥 CRÍTICO
CREATE INDEX IF NOT EXISTS idx_vendas_emissao
ON vendas(emissao);

-- Cliente (usado em joins e filtros)
-- Prioridade: 🔥🔥🔥🔥 MUITO ALTO
CREATE INDEX IF NOT EXISTS idx_vendas_cliente
ON vendas(cliente);

-- Produto (usado em filtros de produtos)
-- Prioridade: 🔥🔥🔥🔥 MUITO ALTO
CREATE INDEX IF NOT EXISTS idx_vendas_produto
ON vendas(produto);

-- Representante (Dashboard Vendas por Equipe)
-- Prioridade: 🔥🔥🔥 ALTO
CREATE INDEX IF NOT EXISTS idx_vendas_representante
ON vendas(representante);

-- Cidade (usado em vários dashboards)
-- Prioridade: 🔥🔥🔥 ALTO
CREATE INDEX IF NOT EXISTS idx_vendas_cidade
ON vendas(cidade);

-- =====================================================
-- 2. ÍNDICES COMPOSTOS (Múltiplas Colunas)
-- =====================================================
-- Estes são ainda MAIS rápidos pois combinam filtros comuns

-- Emissão + Cliente (query comum em Performance de Clientes)
-- Prioridade: 🔥🔥🔥🔥 MUITO ALTO
CREATE INDEX IF NOT EXISTS idx_vendas_emissao_cliente
ON vendas(emissao, cliente);

-- Emissão + Produto (query comum em Análise de Produtos)
-- Prioridade: 🔥🔥🔥🔥 MUITO ALTO
CREATE INDEX IF NOT EXISTS idx_vendas_emissao_produto
ON vendas(emissao, produto);

-- Emissão + Representante (query comum em Vendas por Equipe)
-- Prioridade: 🔥🔥🔥 ALTO
CREATE INDEX IF NOT EXISTS idx_vendas_emissao_representante
ON vendas(emissao, representante);

-- Emissão + Cidade (queries com filtro de cidade)
-- Prioridade: 🔥🔥 MÉDIO
CREATE INDEX IF NOT EXISTS idx_vendas_emissao_cidade
ON vendas(emissao, cidade);

-- =====================================================
-- 3. ÍNDICES NA TABELA TAB_CLIENTE
-- =====================================================

-- Rota (Dashboard Vendas por Região)
-- Prioridade: 🔥🔥🔥🔥 MUITO ALTO
CREATE INDEX IF NOT EXISTS idx_cliente_rota
ON tab_cliente(rota);

-- Sub-Rota (Dashboard Vendas por Região)
-- Prioridade: 🔥🔥🔥 ALTO
CREATE INDEX IF NOT EXISTS idx_cliente_subrota
ON tab_cliente(sub_rota);

-- Cidade (usado em filtros)
-- Prioridade: 🔥🔥🔥 ALTO
CREATE INDEX IF NOT EXISTS idx_cliente_cidade
ON tab_cliente(cidade);

-- Grupo de Cliente (Dashboard Performance de Clientes)
-- Prioridade: 🔥🔥🔥🔥 MUITO ALTO
CREATE INDEX IF NOT EXISTS idx_cliente_grupo
ON tab_cliente(grupo_desc);

-- Nome (filtro de cliente)
-- Prioridade: 🔥🔥 MÉDIO
CREATE INDEX IF NOT EXISTS idx_cliente_nome
ON tab_cliente(nome);

-- Cliente (chave primária - geralmente já tem índice automático)
-- Se não existir, criar:
CREATE INDEX IF NOT EXISTS idx_cliente_codigo
ON tab_cliente(cliente);

-- =====================================================
-- 4. ÍNDICES NA TABELA TAB_PRODUTO
-- =====================================================

-- Origem (Dashboard Análise de Produtos)
-- Prioridade: 🔥🔥🔥🔥 MUITO ALTO
CREATE INDEX IF NOT EXISTS idx_produto_origem
ON tab_produto(desc_origem);

-- Família (Dashboard Análise de Produtos)
-- Prioridade: 🔥🔥🔥🔥 MUITO ALTO
CREATE INDEX IF NOT EXISTS idx_produto_familia
ON tab_produto(desc_familia);

-- Descrição do Produto (usado em filtros)
-- Prioridade: 🔥🔥🔥 ALTO
CREATE INDEX IF NOT EXISTS idx_produto_descricao
ON tab_produto(desc_produto);

-- Código do Produto (chave primária - geralmente já tem índice)
CREATE INDEX IF NOT EXISTS idx_produto_codigo
ON tab_produto(produto);

-- =====================================================
-- 5. ÍNDICES NA TABELA TAB_REPRESENTANTE
-- =====================================================

-- Supervisor (Dashboard Vendas por Equipe)
-- Prioridade: 🔥🔥🔥🔥 MUITO ALTO
CREATE INDEX IF NOT EXISTS idx_representante_supervisor
ON tab_representante(rep_supervisor);

-- Descrição do Representante (filtros)
-- Prioridade: 🔥🔥🔥 ALTO
CREATE INDEX IF NOT EXISTS idx_representante_descricao
ON tab_representante(desc_representante);

-- Código do Representante (chave primária - geralmente já tem índice)
CREATE INDEX IF NOT EXISTS idx_representante_codigo
ON tab_representante(representante);

-- =====================================================
-- 6. ÍNDICES ADICIONAIS PARA REDUÇÃO DE READS
-- =====================================================

-- sit_cliente: usado em dashboard-clientes-semcompras (5 queries filtram por sit_cliente = 'Ativo')
CREATE INDEX IF NOT EXISTS idx_cliente_sit_cliente
ON tab_cliente(sit_cliente);

-- nat_oper: usado em vendas-equipe e categorias-produtos (NOT IN ('5910','6910'))
CREATE INDEX IF NOT EXISTS idx_vendas_nat_oper
ON vendas(nat_oper);

-- Composto para vw_produtos_parados: PARTITION BY(representante, produto) ORDER BY emissao DESC
CREATE INDEX IF NOT EXISTS idx_vendas_rep_produto_emissao
ON vendas(representante, produto, emissao DESC);

-- =====================================================
-- 7. ATUALIZAR ESTATÍSTICAS DO BANCO
-- =====================================================
-- O comando ANALYZE atualiza estatísticas que o SQLite
-- usa para escolher o melhor índice em cada query

ANALYZE;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- 📊 VERIFICAR ÍNDICES CRIADOS:
-- Para ver todos os índices criados, rode:
--
-- SELECT name, tbl_name, sql
-- FROM sqlite_master
-- WHERE type = 'index'
-- AND name LIKE 'idx_%'
-- ORDER BY tbl_name, name;

-- 🗑️ REMOVER TODOS OS ÍNDICES (se necessário):
-- DROP INDEX IF EXISTS idx_vendas_emissao;
-- DROP INDEX IF EXISTS idx_vendas_cliente;
-- ... (copie todos os nomes acima)

-- ✅ PRÓXIMOS PASSOS:
-- 1. Execute este script no Turso CLI ou Dashboard
-- 2. Teste os dashboards - devem estar MUITO mais rápidos
-- 3. Execute scripts/02-maintenance.sql mensalmente
