/**
 * Sistema de Cache com LocalStorage
 *
 * Gerencia cache de dados com expiração automática
 * Reduz requisições ao banco de dados
 */

class CacheManager {
    constructor(defaultTTL = 3600000) { // 1 hora padrão
        this.defaultTTL = defaultTTL;
        this.prefix = 'ger_comercial_';
    }

    /**
     * Gera chave única para o cache
     * @param {string} key - Chave base
     * @returns {string} Chave com prefixo
     */
    _getKey(key) {
        return this.prefix + key;
    }

    /**
     * Salva dados no cache
     * @param {string} key - Chave do cache
     * @param {any} data - Dados a serem salvos
     * @param {number} ttl - Tempo de vida em ms (opcional)
     */
    set(key, data, ttl = null) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now(),
                ttl: ttl || this.defaultTTL
            };
            localStorage.setItem(this._getKey(key), JSON.stringify(cacheData));
            console.log(`✅ Cache salvo: ${key} (TTL: ${(ttl || this.defaultTTL) / 1000}s)`);
        } catch (error) {
            console.error('❌ Erro ao salvar cache:', error);
            // Se LocalStorage estiver cheio, limpa caches antigos
            this.cleanup();
        }
    }

    /**
     * Recupera dados do cache
     * @param {string} key - Chave do cache
     * @returns {any|null} Dados ou null se expirado/não existir
     */
    get(key) {
        try {
            const cached = localStorage.getItem(this._getKey(key));
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            const age = Date.now() - cacheData.timestamp;

            // Verifica se expirou
            if (age > cacheData.ttl) {
                console.log(`⏰ Cache expirado: ${key} (idade: ${age / 1000}s)`);
                this.delete(key);
                return null;
            }

            console.log(`✅ Cache hit: ${key} (idade: ${age / 1000}s)`);
            return cacheData.data;
        } catch (error) {
            console.error('❌ Erro ao ler cache:', error);
            return null;
        }
    }

    /**
     * Verifica se existe cache válido
     * @param {string} key - Chave do cache
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Remove um item do cache
     * @param {string} key - Chave do cache
     */
    delete(key) {
        localStorage.removeItem(this._getKey(key));
        console.log(`🗑️ Cache removido: ${key}`);
    }

    /**
     * Limpa todos os caches do sistema
     */
    clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
        console.log('🧹 Todos os caches limpos');
    }

    /**
     * Remove caches expirados
     */
    cleanup() {
        const keys = Object.keys(localStorage);
        let removed = 0;

        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                try {
                    const cached = JSON.parse(localStorage.getItem(key));
                    const age = Date.now() - cached.timestamp;
                    if (age > cached.ttl) {
                        localStorage.removeItem(key);
                        removed++;
                    }
                } catch (error) {
                    // Remove se estiver corrompido
                    localStorage.removeItem(key);
                    removed++;
                }
            }
        });

        console.log(`🧹 Cleanup: ${removed} cache(s) expirado(s) removido(s)`);
    }

    /**
     * Obtém informações sobre o cache
     * @returns {Object} Estatísticas do cache
     */
    getStats() {
        const keys = Object.keys(localStorage);
        let totalSize = 0;
        let count = 0;

        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                totalSize += localStorage.getItem(key).length;
                count++;
            }
        });

        return {
            count: count,
            size: totalSize,
            sizeKB: (totalSize / 1024).toFixed(2),
            maxSize: 5120, // ~5MB limite do LocalStorage
            usage: ((totalSize / (5120 * 1024)) * 100).toFixed(2) + '%'
        };
    }

    /**
     * Wrapper para buscar dados com cache automático
     * @param {string} key - Chave do cache
     * @param {Function} fetchFunction - Função que busca os dados
     * @param {number} ttl - Tempo de vida em ms (opcional)
     * @returns {Promise<any>} Dados (do cache ou fetch)
     */
    async getOrFetch(key, fetchFunction, ttl = null) {
        // Tenta buscar do cache
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }

        // Se não tem cache, busca os dados
        console.log(`🔄 Cache miss: ${key} - Buscando dados...`);
        const data = await fetchFunction();

        // Salva no cache
        this.set(key, data, ttl);

        return data;
    }

    /**
     * Invalida cache baseado em padrão
     * @param {string} pattern - Padrão da chave (ex: "filtro_*")
     */
    invalidatePattern(pattern) {
        const keys = Object.keys(localStorage);
        let removed = 0;

        const regex = new RegExp('^' + this.prefix + pattern.replace('*', '.*') + '$');

        keys.forEach(key => {
            if (regex.test(key)) {
                localStorage.removeItem(key);
                removed++;
            }
        });

        console.log(`🗑️ Invalidados ${removed} cache(s) com padrão: ${pattern}`);
    }
}

// Configurações de TTL por tipo de dado
export const CACHE_TTL = {
    FILTERS: 21600000,     // 6 horas - Filtros mudam pouco
    DASHBOARDS: 21600000,  // 6 horas - Dados de vendas
    KPIS: 600000,          // 10 minutos - KPIs
    CHARTS: 900000,        // 15 minutos - Gráficos
    REPORTS: 1800000       // 30 minutos - Relatórios
};

// Exporta instância singleton
export const cache = new CacheManager();

// Limpa caches expirados ao carregar
cache.cleanup();
