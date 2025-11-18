-- =====================================================
-- GERENCIAMENTO DE USUÁRIOS - Ger Comercial
-- =====================================================
-- Scripts úteis para gerenciar usuários do sistema

-- =====================================================
-- CONSULTAS
-- =====================================================

-- Listar todos os usuários ativos
SELECT
    id,
    username,
    full_name,
    permissions,
    created_at
FROM users
WHERE active = 1
ORDER BY full_name;

-- Listar usuários inativos
SELECT
    id,
    username,
    full_name,
    active,
    updated_at
FROM users
WHERE active = 0;

-- Ver permissões de um usuário específico
SELECT
    username,
    full_name,
    permissions
FROM users
WHERE username = 'gerente';

-- Contar usuários por status
SELECT
    active,
    COUNT(*) as total,
    CASE active
        WHEN 1 THEN 'Ativos'
        WHEN 0 THEN 'Inativos'
    END as status
FROM users
GROUP BY active;

-- =====================================================
-- ADICIONAR USUÁRIOS
-- =====================================================

-- Adicionar novo usuário com acesso completo
INSERT INTO users (username, password, full_name, permissions, active)
VALUES (
    'supervisor',
    'supervisor123',
    'Supervisor de Vendas',
    '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes","cobranca-semanal","produtos-parados"]',
    1
);

-- Adicionar usuário apenas com visualização
INSERT INTO users (username, password, full_name, permissions, active)
VALUES (
    'visualizador',
    'visualiza123',
    'Usuário Visualização',
    '["vendas-regiao"]',
    1
);

-- Adicionar usuário financeiro
INSERT INTO users (username, password, full_name, permissions, active)
VALUES (
    'financeiro2',
    'financeiro123',
    'Analista Financeiro',
    '["cobranca-semanal","performance-clientes"]',
    1
);

-- =====================================================
-- ATUALIZAR PERMISSÕES
-- =====================================================

-- Dar acesso total ao gerente
UPDATE users
SET permissions = '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes","cobranca-semanal","produtos-parados"]',
    updated_at = datetime('now')
WHERE username = 'gerente';

-- Adicionar apenas o dashboard de produtos parados
UPDATE users
SET permissions = json_insert(permissions, '$[' || json_array_length(permissions) || ']', 'produtos-parados'),
    updated_at = datetime('now')
WHERE username = 'vendedor';

-- Remover acesso a um dashboard específico (exemplo: cobranca-semanal)
UPDATE users
SET permissions = '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes"]',
    updated_at = datetime('now')
WHERE username = 'gerente';

-- Dar acesso a vendedor para mais dashboards
UPDATE users
SET permissions = '["vendas-regiao","vendas-equipe","performance-clientes","produtos-parados"]',
    updated_at = datetime('now')
WHERE username = 'vendedor';

-- =====================================================
-- ALTERAR SENHA
-- =====================================================

-- Alterar senha de um usuário
UPDATE users
SET password = 'nova_senha_segura',
    updated_at = datetime('now')
WHERE username = 'vendedor';

-- Resetar senha para padrão
UPDATE users
SET password = username || '123',
    updated_at = datetime('now')
WHERE username = 'gerente';

-- =====================================================
-- ATIVAR/DESATIVAR USUÁRIOS
-- =====================================================

-- Desativar usuário (mantém no banco mas não pode logar)
UPDATE users
SET active = 0,
    updated_at = datetime('now')
WHERE username = 'vendedor';

-- Reativar usuário
UPDATE users
SET active = 1,
    updated_at = datetime('now')
WHERE username = 'vendedor';

-- Desativar múltiplos usuários
UPDATE users
SET active = 0,
    updated_at = datetime('now')
WHERE username IN ('vendedor', 'financeiro');

-- =====================================================
-- EXCLUIR USUÁRIOS
-- =====================================================

-- ⚠️ CUIDADO: Exclusão é permanente!
-- Prefira desativar (active = 0) ao invés de excluir

-- Excluir usuário específico
DELETE FROM users
WHERE username = 'usuario_temporario';

-- Excluir todos os usuários inativos (cuidado!)
-- DELETE FROM users WHERE active = 0;

-- =====================================================
-- DASHBOARDS DISPONÍVEIS
-- =====================================================

-- Lista de IDs de dashboards para usar em permissions:
--
-- "vendas-regiao"           → Vendas por Região
-- "vendas-equipe"           → Vendas por Equipe
-- "analise-produtos"        → Análise de Produtos
-- "performance-clientes"    → Performance de Clientes
-- "cobranca-semanal"        → Cobrança Semanal
-- "produtos-parados"        → Produtos Parados
--
-- Exemplo de JSON completo:
-- '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes","cobranca-semanal","produtos-parados"]'

-- =====================================================
-- PERFIS RECOMENDADOS
-- =====================================================

-- Admin: Acesso total
-- '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes","cobranca-semanal","produtos-parados"]'

-- Gerente Comercial: Sem acesso financeiro
-- '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes","produtos-parados"]'

-- Supervisor de Vendas: Foco em equipe e produtos
-- '["vendas-equipe","analise-produtos","produtos-parados"]'

-- Vendedor: Apenas visualização
-- '["vendas-regiao","performance-clientes"]'

-- Financeiro: Apenas dashboards financeiros
-- '["cobranca-semanal","performance-clientes"]'

-- Analista: Performance e produtos
-- '["analise-produtos","performance-clientes"]'

-- =====================================================
-- AUDITORIA
-- =====================================================

-- Ver últimas alterações de usuários
SELECT
    username,
    full_name,
    active,
    created_at,
    updated_at,
    julianday('now') - julianday(updated_at) as dias_desde_alteracao
FROM users
ORDER BY updated_at DESC
LIMIT 10;

-- Verificar usuários sem atividade recente (nunca atualizados)
SELECT
    username,
    full_name,
    created_at,
    updated_at
FROM users
WHERE created_at = updated_at
ORDER BY created_at DESC;

-- =====================================================
-- SEGURANÇA
-- =====================================================

-- ⚠️ IMPORTANTE: Em produção, você deve:
-- 1. Usar senhas criptografadas (bcrypt, argon2)
-- 2. Implementar política de senha forte
-- 3. Adicionar tentativas de login
-- 4. Implementar expiração de senha
-- 5. Usar tokens JWT ao invés de localStorage

-- =====================================================
