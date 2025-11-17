-- =====================================================
-- TABELA DE USUÁRIOS E PERMISSÕES - Ger Comercial
-- =====================================================
-- Execute este comando no terminal do Turso para criar a tabela

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT,
    permissions TEXT NOT NULL, -- JSON com array de dashboards permitidos
    active INTEGER DEFAULT 1, -- 1 = ativo, 0 = inativo
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Criar índice para melhorar performance nas consultas de login
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_active ON users(active);

-- =====================================================
-- INSERIR USUÁRIOS DE EXEMPLO
-- =====================================================

-- Usuário Administrador (acesso total)
INSERT INTO users (username, password, full_name, permissions, active)
VALUES (
    'admin',
    'admin123',
    'Administrador',
    '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes","cobranca-semanal"]',
    1
);

-- Usuário Gerente Comercial (acesso a vendas e análises)
INSERT INTO users (username, password, full_name, permissions, active)
VALUES (
    'gerente',
    'gerente123',
    'Gerente Comercial',
    '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes"]',
    1
);

-- Usuário Vendedor (acesso limitado)
INSERT INTO users (username, password, full_name, permissions, active)
VALUES (
    'vendedor',
    'vendedor123',
    'Vendedor',
    '["vendas-regiao","performance-clientes"]',
    1
);

-- Usuário Financeiro (acesso a cobrança)
INSERT INTO users (username, password, full_name, permissions, active)
VALUES (
    'financeiro',
    'financeiro123',
    'Financeiro',
    '["cobranca-semanal","performance-clientes"]',
    1
);

-- =====================================================
-- DASHBOARDS DISPONÍVEIS (para referência)
-- =====================================================
-- "vendas-regiao"           → Vendas por Região
-- "vendas-equipe"           → Vendas por Equipe Comercial
-- "analise-produtos"        → Análise de Produtos
-- "performance-clientes"    → Performance de Clientes
-- "cobranca-semanal"        → Performance Semanal (Cobrança)

-- =====================================================
-- COMANDOS ÚTEIS
-- =====================================================

-- Ver todos os usuários:
-- SELECT id, username, full_name, permissions, active FROM users;

-- Adicionar novo usuário:
-- INSERT INTO users (username, password, full_name, permissions, active)
-- VALUES ('nome_usuario', 'senha', 'Nome Completo', '["dashboard1","dashboard2"]', 1);

-- Atualizar permissões de um usuário:
-- UPDATE users SET permissions = '["dashboard1","dashboard2","dashboard3"]' WHERE username = 'nome_usuario';

-- Desativar usuário:
-- UPDATE users SET active = 0 WHERE username = 'nome_usuario';

-- Alterar senha:
-- UPDATE users SET password = 'nova_senha', updated_at = datetime('now') WHERE username = 'nome_usuario';
