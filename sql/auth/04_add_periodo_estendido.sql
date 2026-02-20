-- =====================================================
-- MIGRAÇÃO: Adicionar coluna periodo_estendido
-- =====================================================
-- Permite que usuários específicos filtrem até 366 dias
-- ao invés do limite padrão de 100 dias.
--
-- Execute no terminal do Turso:

ALTER TABLE users ADD COLUMN periodo_estendido INTEGER DEFAULT 0;
-- 0 = limite padrão (100 dias)
-- 1 = período estendido (366 dias)

-- Exemplo: liberar período estendido para o admin
-- UPDATE users SET periodo_estendido = 1 WHERE username = 'admin';
