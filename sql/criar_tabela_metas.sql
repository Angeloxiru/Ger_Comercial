-- ============================================================
-- SCRIPT: Criar Tabela de Metas Mensais de Vendas
-- Projeto: Ger Comercial
-- Data: 2026-01-26
-- Descrição: Tabela para armazenar metas mensais por representante
--            (faturamento, peso, clientes ativos)
-- ============================================================

-- DROP TABLE IF EXISTS metas_mensais;

CREATE TABLE IF NOT EXISTS metas_mensais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Identificação do representante
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
    UNIQUE(representante, ano_mes),

    -- Foreign key para tab_representante
    FOREIGN KEY (representante) REFERENCES tab_representante(representante)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_metas_representante ON metas_mensais(representante);
CREATE INDEX IF NOT EXISTS idx_metas_anomes ON metas_mensais(ano_mes);
CREATE INDEX IF NOT EXISTS idx_metas_rep_anomes ON metas_mensais(representante, ano_mes);

-- ============================================================
-- EXEMPLOS DE INSERÇÃO (ajustar valores conforme necessário)
-- ============================================================

-- Exemplo 1: Meta para Janeiro de 2026
-- INSERT INTO metas_mensais (representante, ano_mes, meta_faturamento, meta_peso, meta_clientes, created_by, observacao)
-- VALUES ('001', '2026-01', 150000.00, 50000.00, 120, 'admin', 'Meta baseada no histórico de 2025');

-- Exemplo 2: Meta para Fevereiro de 2026
-- INSERT INTO metas_mensais (representante, ano_mes, meta_faturamento, meta_peso, meta_clientes, created_by, observacao)
-- VALUES ('001', '2026-02', 160000.00, 52000.00, 125, 'admin', 'Meta com aumento de 5% sobre janeiro');

-- ============================================================
-- QUERIES ÚTEIS
-- ============================================================

-- 1. Consultar todas as metas de um representante
-- SELECT * FROM metas_mensais WHERE representante = '001' ORDER BY ano_mes DESC;

-- 2. Consultar metas de um período específico
-- SELECT * FROM metas_mensais WHERE ano_mes = '2026-01' ORDER BY representante;

-- 3. Atualizar uma meta existente
-- UPDATE metas_mensais
-- SET meta_faturamento = 180000.00,
--     meta_peso = 55000.00,
--     updated_at = CURRENT_TIMESTAMP
-- WHERE representante = '001' AND ano_mes = '2026-01';

-- 4. Deletar meta
-- DELETE FROM metas_mensais WHERE representante = '001' AND ano_mes = '2026-01';

-- 5. Consultar metas com informações do representante
-- SELECT
--     m.representante,
--     r.desc_representante,
--     r.rep_supervisor,
--     m.ano_mes,
--     m.meta_faturamento,
--     m.meta_peso,
--     m.meta_clientes,
--     m.observacao
-- FROM metas_mensais m
-- LEFT JOIN tab_representante r ON m.representante = r.representante
-- WHERE m.ano_mes = '2026-01'
-- ORDER BY r.rep_supervisor, r.desc_representante;
