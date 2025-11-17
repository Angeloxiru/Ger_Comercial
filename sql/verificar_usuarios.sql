-- ================================================
-- SCRIPT DE VERIFICAÇÃO - Tabela de Usuários
-- ================================================
-- Execute estes comandos no Turso para verificar se está tudo OK

-- 1. Verificar se a tabela existe
SELECT name FROM sqlite_master WHERE type='table' AND name='users';

-- 2. Ver estrutura da tabela
PRAGMA table_info(users);

-- 3. Listar TODOS os usuários cadastrados
SELECT id, username, password, full_name, active, permissions
FROM users;

-- 4. Contar quantos usuários existem
SELECT COUNT(*) as total_usuarios FROM users;

-- 5. Ver apenas usuários ativos
SELECT username, full_name, active
FROM users
WHERE active = 1;

-- 6. Testar query de login manualmente (exemplo com admin)
SELECT id, username, full_name, permissions, active
FROM users
WHERE username = 'admin' AND password = 'admin123' AND active = 1;

-- ================================================
-- SE NÃO HOUVER USUÁRIOS, INSIRA NOVAMENTE:
-- ================================================

-- DELETE FROM users; -- Limpar tabela se necessário

-- INSERT INTO users (username, password, full_name, permissions, active)
-- VALUES
--     ('admin', 'admin123', 'Administrador',
--      '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes","cobranca-semanal"]', 1),
--     ('gerente', 'gerente123', 'Gerente Comercial',
--      '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes"]', 1),
--     ('vendedor', 'vendedor123', 'Vendedor',
--      '["vendas-regiao","performance-clientes"]', 1),
--     ('financeiro', 'financeiro123', 'Financeiro',
--      '["cobranca-semanal","performance-clientes"]', 1);
