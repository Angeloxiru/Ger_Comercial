-- =====================================================
-- Migration: Adicionar coluna 'periodo' à tabela agendamentos_relatorios
-- Data: 2026-01-20
-- =====================================================

-- Adicionar coluna periodo
ALTER TABLE agendamentos_relatorios ADD COLUMN periodo TEXT DEFAULT 'mes-atual';

-- Atualizar registros existentes para usar o período padrão
UPDATE agendamentos_relatorios SET periodo = 'mes-atual' WHERE periodo IS NULL;

-- Verificação
SELECT
    id,
    nome_agendamento,
    dashboard,
    periodo,
    dia_semana,
    hora
FROM agendamentos_relatorios;
