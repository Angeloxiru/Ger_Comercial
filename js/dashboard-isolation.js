/**
 * Sistema de isolamento de dados entre dashboards
 * Garante que cada dashboard tenha seus próprios dados sem interferência
 */

// Identificador único do dashboard
const DASHBOARD_ID = window.location.pathname;

/**
 * Inicializa o dashboard com namespace isolado
 */
export function initDashboard(dashboardName) {
    console.log(`🚀 Inicializando dashboard: ${dashboardName}`);

    // Evita inicializar mais de uma vez o mesmo dashboard
    if (window._currentDashboard === dashboardName) {
        console.log(`⏭️ Dashboard ${dashboardName} já inicializado, pulando...`);
        return;
    }

    window._currentDashboard = dashboardName;

    // Limpa apenas dados de RESULTADOS (não filtros!)
    const keysToClean = [
        'dadosCompletos',
        'dadosAtuais'
    ];

    keysToClean.forEach(key => {
        if (window[key]) {
            delete window[key];
        }
    });

    // Destrói gráficos Chart.js existentes
    if (window.chartTopProdutos && typeof window.chartTopProdutos.destroy === 'function') {
        window.chartTopProdutos.destroy();
        window.chartTopProdutos = null;
    }
    if (window.chartCidades && typeof window.chartCidades.destroy === 'function') {
        window.chartCidades.destroy();
        window.chartCidades = null;
    }
    if (window.chartTopClientes && typeof window.chartTopClientes.destroy === 'function') {
        window.chartTopClientes.destroy();
        window.chartTopClientes = null;
    }
    if (window.chartDistribuicao && typeof window.chartDistribuicao.destroy === 'function') {
        window.chartDistribuicao.destroy();
        window.chartDistribuicao = null;
    }
    if (window.chartTop10 && typeof window.chartTop10.destroy === 'function') {
        window.chartTop10.destroy();
        window.chartTop10 = null;
    }

    console.log(`✅ Dashboard ${dashboardName} isolado e pronto`);
}

/**
 * Limpa dados ao sair do dashboard
 */
export function cleanupDashboard() {
    console.log('🧹 Limpando dados do dashboard atual...');

    // Limpa gráficos
    if (window.chartTopProdutos && typeof window.chartTopProdutos.destroy === 'function') {
        window.chartTopProdutos.destroy();
    }
    if (window.chartCidades && typeof window.chartCidades.destroy === 'function') {
        window.chartCidades.destroy();
    }
    if (window.chartTopClientes && typeof window.chartTopClientes.destroy === 'function') {
        window.chartTopClientes.destroy();
    }
    if (window.chartDistribuicao && typeof window.chartDistribuicao.destroy === 'function') {
        window.chartDistribuicao.destroy();
    }
    if (window.chartTop10 && typeof window.chartTop10.destroy === 'function') {
        window.chartTop10.destroy();
    }

    // Limpa paginação
    if (window.pagination) {
        window.pagination = null;
    }
}

/**
 * Registra cleanup automático ao sair da página
 */
export function registerCleanup() {
    window.addEventListener('beforeunload', cleanupDashboard);
    window.addEventListener('pagehide', cleanupDashboard);
}

/**
 * Previne cache de dados stale
 * Remove cache de dashboards antigos que podem estar desatualizados
 */
export function preventStaleCache(maxAge = 3600000) { // 1 hora por padrão
    const prefix = 'ger_comercial_';
    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data.expiresAt && now > data.expiresAt) {
                    localStorage.removeItem(key);
                    console.log(`🗑️ Removido cache expirado: ${key}`);
                }
            } catch (e) {
                // Cache inválido, remove
                localStorage.removeItem(key);
                console.log(`🗑️ Removido cache inválido: ${key}`);
            }
        }
    }
}
