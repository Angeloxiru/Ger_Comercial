-- ============================================================
-- SCRIPT: Criar Tabela de Metas Mensais de Vendas (SEM FOREIGN KEY)
-- Projeto: Ger Comercial
-- Data: 2026-01-30
-- Descrição: Tabela para armazenar metas mensais por representante
--            (faturamento, peso, clientes ativos)
--            VERSÃO SEM FOREIGN KEY para permitir importação flexível
-- ============================================================

-- ATENÇÃO: Se a tabela já existe, você precisa fazer backup dos dados primeiro!
-- Comandos para backup e recriação:
--
-- 1. Fazer backup dos dados existentes:
-- CREATE TABLE metas_mensais_backup AS SELECT * FROM metas_mensais;
--
-- 2. Dropar a tabela antiga:
-- DROP TABLE metas_mensais;
--
-- 3. Executar este script para criar a nova versão
--
-- 4. Restaurar dados (se necessário):
-- INSERT INTO metas_mensais SELECT * FROM metas_mensais_backup;
-- DROP TABLE metas_mensais_backup;

CREATE TABLE IF NOT EXISTS metas_mensais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Identificação do representante (SEM FOREIGN KEY)
    representante TEXT NOT NULL,

    -- Período da meta (formato YYYY-MM: "2026-01")
    ano_mes TEXT NOT NULL,

    -- Metas numéricas
    meta_faturamento REAL DEFAULT 0,  -- Meta de valor faturado (R$)
    meta_peso REAL DEFAULT 0,         -- Meta de peso/volume (Kg)
    meta_clientes INTEGER DEFAULT 0,   -- Meta de clientes ativos/positivados

    -- Metadados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,                   -- Usuário que criou

    -- Observações
    observacao TEXT,                   -- Observações sobre a meta

    -- Constraint: Uma meta por representante por mês
    UNIQUE(representante, ano_mes)

    -- FOREIGN KEY REMOVIDA para permitir importação flexível
    -- Permite inserir metas mesmo para representantes que ainda não foram cadastrados
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_metas_representante ON metas_mensais(representante);
CREATE INDEX IF NOT EXISTS idx_metas_anomes ON metas_mensais(ano_mes);
CREATE INDEX IF NOT EXISTS idx_metas_rep_anomes ON metas_mensais(representante, ano_mes);

-- ============================================================
-- VANTAGENS desta versão:
-- ============================================================
-- 1. Permite importar metas para qualquer código de representante
-- 2. Mais flexível para testes e desenvolvimento
-- 3. Não gera erros de FOREIGN KEY constraint
-- 4. Ainda mantém a integridade via UNIQUE(representante, ano_mes)
-- 5. Queries com LEFT JOIN funcionam normalmente
-- ============================================================
