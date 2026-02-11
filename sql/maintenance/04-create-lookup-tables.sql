-- =============================================================================
-- 04-create-lookup-tables.sql
-- Tabelas de lookup para filtros dos dashboards
--
-- OBJETIVO:
--   Eliminar leituras excessivas no Turso ao carregar os dropdowns dos
--   dashboards. Em vez de varrer tab_cliente, tab_representante, tab_produto
--   e a tabela "vendas" inteira a cada abertura de tela, os dashboards
--   consultam estas tabelas minúsculas que são atualizadas uma vez por semana
--   pelo GitHub Actions (atualizar-lookup-filtros.yml).
--
-- EXECUÇÃO:
--   Execute este script UMA VEZ para criar as estruturas.
--   O preenchimento inicial é feito pelo script:
--     node scripts/atualizar-filtros-lookup.js
-- =============================================================================

-- -----------------------------------------------------------------------------
-- lkp_localidades
-- Combinações distintas de rota / sub_rota / cidade vindas de tab_cliente.
-- Substitui as queries DISTINCT em tab_cliente para os dashboards de região,
-- ranking de clientes e outros que precisam montar hierarquia geográfica.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lkp_localidades (
    rota     TEXT,
    sub_rota TEXT,
    cidade   TEXT
);

-- -----------------------------------------------------------------------------
-- lkp_representantes
-- Representantes, seus nomes e supervisores vindos de tab_representante.
-- Substitui as queries DISTINCT em tab_representante para os dashboards de
-- equipe, cobrança semanal e ranking.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lkp_representantes (
    representante      TEXT,
    desc_representante TEXT,
    rep_supervisor     TEXT
);

-- -----------------------------------------------------------------------------
-- lkp_cidades_regiao
-- Combinações cidade / rota / sub_rota extraídas do JOIN entre vendas e
-- tab_cliente. É a maior economia: antes era necessário varrer 100 mil+
-- linhas de vendas; agora são ~200 linhas desta tabela.
-- Usado pelo dashboard Vendas por Região.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lkp_cidades_regiao (
    cidade   TEXT,
    rota     TEXT,
    sub_rota TEXT
);

-- -----------------------------------------------------------------------------
-- lkp_cidades_equipe
-- Combinações cidade / representante / supervisor extraídas do JOIN entre
-- vendas e tab_representante. Mesma economia do lkp_cidades_regiao.
-- Usado pelo dashboard Vendas por Equipe.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lkp_cidades_equipe (
    cidade         TEXT,
    representante  TEXT,
    rep_supervisor TEXT
);

-- -----------------------------------------------------------------------------
-- lkp_clientes
-- Clientes com nome, grupo e cidade (colunas usadas como filtros).
-- Substitui as queries DISTINCT em tab_cliente para o dashboard
-- Performance de Clientes.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lkp_clientes (
    cliente    TEXT,
    nome       TEXT,
    grupo_desc TEXT,
    cidade     TEXT
);

-- -----------------------------------------------------------------------------
-- lkp_produtos
-- Produtos com família e origem (colunas usadas como filtros).
-- Substitui as queries em tab_produto para o dashboard Análise de Produtos.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lkp_produtos (
    produto      TEXT,
    desc_produto TEXT,
    desc_familia TEXT,
    desc_origem  TEXT
);
