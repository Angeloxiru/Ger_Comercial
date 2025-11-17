/**
 * =====================================================
 * MÓDULO DE AUTENTICAÇÃO - Ger Comercial
 * =====================================================
 * Gerencia autenticação de usuários e controle de permissões
 */

import { DatabaseManager } from './db.js';

class AuthManager {
    constructor() {
        this.storageKey = 'ger_comercial_auth';
        this.sessionKey = 'ger_comercial_session';
    }

    /**
     * Realiza o login do usuário
     * @param {string} username - Nome de usuário
     * @param {string} password - Senha
     * @returns {Promise<Object>} Resultado do login
     */
    async login(username, password) {
        try {
            // Validação básica
            if (!username || !password) {
                return {
                    success: false,
                    message: 'Usuário e senha são obrigatórios'
                };
            }

            console.log('🔐 Tentando login:', username);

            // Conectar ao banco
            const db = new DatabaseManager();
            await db.connect();
            console.log('✅ Conectado ao banco');

            // Consultar usuário no banco
            const sql = `
                SELECT id, username, full_name, permissions, active
                FROM users
                WHERE username = ? AND password = ? AND active = 1
            `;

            console.log('🔍 Executando query com parâmetros:', [username.trim(), password]);
            const result = await db.execute(sql, [username.trim(), password]);
            console.log('📊 Resultado da query:', result);

            // Verificar se encontrou o usuário
            if (!result.rows || result.rows.length === 0) {
                console.log('❌ Nenhum usuário encontrado');
                return {
                    success: false,
                    message: 'Usuário ou senha inválidos'
                };
            }

            const user = result.rows[0];
            console.log('👤 Usuário encontrado:', user);

            // Parsear permissões (JSON)
            let permissions = [];
            try {
                permissions = JSON.parse(user.permissions || '[]');
            } catch (e) {
                console.error('Erro ao parsear permissões:', e);
                permissions = [];
            }

            // Criar objeto de sessão
            const session = {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                permissions: permissions,
                loginTime: new Date().toISOString()
            };

            // Salvar sessão no localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(session));
            localStorage.setItem(this.sessionKey, 'active');

            // Log de sucesso
            console.log('✅ Login realizado com sucesso:', user.username);

            return {
                success: true,
                message: 'Login realizado com sucesso',
                user: session
            };

        } catch (error) {
            console.error('❌ Erro no login:', error);
            return {
                success: false,
                message: 'Erro ao realizar login. Tente novamente.'
            };
        }
    }

    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean}
     */
    isAuthenticated() {
        const session = localStorage.getItem(this.sessionKey);
        const userData = localStorage.getItem(this.storageKey);
        return session === 'active' && userData !== null;
    }

    /**
     * Obtém os dados do usuário logado
     * @returns {Object|null}
     */
    getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }

        try {
            const userData = localStorage.getItem(this.storageKey);
            return JSON.parse(userData);
        } catch (e) {
            console.error('Erro ao obter dados do usuário:', e);
            return null;
        }
    }

    /**
     * Obtém as permissões do usuário logado
     * @returns {Array}
     */
    getPermissions() {
        const user = this.getCurrentUser();
        return user ? user.permissions || [] : [];
    }

    /**
     * Verifica se o usuário tem permissão para acessar um dashboard
     * @param {string} dashboardId - ID do dashboard
     * @returns {boolean}
     */
    hasPermission(dashboardId) {
        const permissions = this.getPermissions();
        return permissions.includes(dashboardId);
    }

    /**
     * Realiza o logout do usuário
     */
    logout() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.sessionKey);
        console.log('✅ Logout realizado');

        // Redirecionar para login (replace para não adicionar ao histórico)
        window.location.replace('/Ger_Comercial/login.html');
    }

    /**
     * Redireciona para login se não estiver autenticado
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            console.log('⚠️ Acesso negado. Redirecionando para login...');
            // Usa replace() para substituir a página atual no histórico
            window.location.replace('/Ger_Comercial/login.html');
            return false;
        }
        return true;
    }

    /**
     * Redireciona para home se já estiver autenticado
     * (usado na página de login)
     */
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            console.log('ℹ️ Usuário já autenticado. Redirecionando para home...');
            // Usa replace() para substituir a página de login no histórico
            window.location.replace('/Ger_Comercial/index.html');
            return true;
        }
        return false;
    }

    /**
     * Retorna informações do usuário logado para exibição
     * @returns {string}
     */
    getUserDisplayName() {
        const user = this.getCurrentUser();
        if (!user) return 'Usuário';
        return user.fullName || user.username || 'Usuário';
    }

    /**
     * Lista todos os dashboards disponíveis no sistema
     * @returns {Array}
     */
    getAvailableDashboards() {
        return [
            {
                id: 'vendas-regiao',
                name: 'Vendas por Região',
                icon: '📍',
                url: 'dashboards/dashboard-vendas-regiao.html'
            },
            {
                id: 'vendas-equipe',
                name: 'Vendas por Equipe Comercial',
                icon: '👥',
                url: 'dashboards/dashboard-vendas-equipe.html'
            },
            {
                id: 'analise-produtos',
                name: 'Análise de Produtos',
                icon: '📈',
                url: 'dashboards/dashboard-analise-produtos.html'
            },
            {
                id: 'performance-clientes',
                name: 'Performance de Clientes',
                icon: '💰',
                url: 'dashboards/dashboard-performance-clientes.html'
            },
            {
                id: 'cobranca-semanal',
                name: 'Performance Semanal',
                icon: '🎯',
                url: 'dashboards/cobranca-semanal.html'
            },
            {
                id: 'produtos-parados',
                name: 'Produtos Parados',
                icon: '🛑',
                url: 'dashboards/dashboard-produtos-parados.html'
            }
        ];
    }

    /**
     * Aplica controle de acesso aos cards da home
     * Desabilita visualmente os cards sem permissão
     */
    applyAccessControl() {
        const permissions = this.getPermissions();
        const dashboards = this.getAvailableDashboards();

        console.log('🔐 Aplicando controle de acesso...');
        console.log('Permissões do usuário:', permissions);

        // Para cada dashboard, verificar permissão
        dashboards.forEach(dashboard => {
            const hasAccess = permissions.includes(dashboard.id);

            // Encontrar o card no DOM (busca por múltiplos atributos)
            const card = this.findCardByDashboard(dashboard.id);

            if (card) {
                if (!hasAccess) {
                    // Sem permissão: desabilitar visualmente
                    card.classList.add('card-disabled');
                    card.style.opacity = '0.4';
                    card.style.cursor = 'not-allowed';
                    card.style.filter = 'grayscale(80%)';

                    // Remover evento de clique
                    card.onclick = (e) => {
                        e.preventDefault();
                        alert('⚠️ Você não tem permissão para acessar este dashboard.');
                        return false;
                    };

                    // Adicionar indicador visual
                    if (!card.querySelector('.permission-lock')) {
                        const lockIcon = document.createElement('div');
                        lockIcon.className = 'permission-lock';
                        lockIcon.innerHTML = '🔒';
                        lockIcon.style.cssText = `
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            font-size: 24px;
                            z-index: 10;
                        `;
                        card.style.position = 'relative';
                        card.appendChild(lockIcon);
                    }

                    console.log('🔒 Dashboard bloqueado:', dashboard.name);
                } else {
                    // Com permissão: garantir que está habilitado
                    card.classList.remove('card-disabled');
                    card.style.opacity = '1';
                    card.style.cursor = 'pointer';
                    card.style.filter = 'none';
                    console.log('✅ Dashboard permitido:', dashboard.name);
                }
            }
        });
    }

    /**
     * Encontra o card no DOM pelo ID do dashboard
     * @param {string} dashboardId
     * @returns {HTMLElement|null}
     */
    findCardByDashboard(dashboardId) {
        // Mapear IDs para nomes de arquivo
        const dashboardFiles = {
            'vendas-regiao': 'dashboard-vendas-regiao.html',
            'vendas-equipe': 'dashboard-vendas-equipe.html',
            'analise-produtos': 'dashboard-analise-produtos.html',
            'performance-clientes': 'dashboard-performance-clientes.html',
            'cobranca-semanal': 'cobranca-semanal.html',
            'produtos-parados': 'dashboard-produtos-parados.html'
        };

        const fileName = dashboardFiles[dashboardId];
        if (!fileName) return null;

        // Tentar encontrar por onclick que contém o nome do arquivo
        const cards = document.querySelectorAll('.dashboard-card, .card');
        for (let card of cards) {
            const onclick = card.getAttribute('onclick');
            if (onclick && onclick.includes(fileName)) {
                return card;
            }
        }

        return null;
    }
}

// Exportar instância global (Singleton)
export const authManager = new AuthManager();

// Exportar a classe para casos especiais
export { AuthManager };
