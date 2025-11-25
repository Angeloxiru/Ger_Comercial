/**
 * Utilitários para trabalhar com resultados de banco de dados LibSQL
 *
 * Este módulo fornece funções auxiliares para serializar e validar
 * resultados de queries do LibSQL antes de armazenar em cache.
 */

/**
 * Serializa o resultado de uma query LibSQL para formato simples
 *
 * O LibSQL retorna objetos especiais que não são serializáveis corretamente.
 * Esta função converte para objetos JavaScript simples que podem ser
 * armazenados em cache de forma segura.
 *
 * @param {Object} result - Resultado da query LibSQL
 * @returns {Object} Objeto serializado com rows, columns e rowsAffected
 *
 * @example
 * const result = await db.execute('SELECT * FROM users');
 * const serialized = serializeDbResult(result);
 * cache.set('users', serialized, CACHE_TTL.DATA);
 */
export function serializeDbResult(result) {
    if (!result || !Array.isArray(result.rows)) {
        // Retorna uma estrutura vazia e válida para evitar erros em cascata
        return {
            rows: [],
            columns: result?.columns || [],
            rowsAffected: result?.rowsAffected || 0
        };
    }
    return {
        rows: result.rows.map(row => ({ ...row })),
        columns: result.columns,
        rowsAffected: result.rowsAffected
    };
}

/**
 * Valida se um resultado de cache tem a estrutura esperada
 *
 * Verifica se o cache contém dados válidos e não corrompidos.
 * Útil para detectar problemas de serialização ou cache inválido.
 *
 * @param {Object|null} cached - Dados recuperados do cache
 * @param {string} propertyName - Nome da propriedade que deve existir nas rows
 * @returns {boolean} true se o cache é válido, false caso contrário
 *
 * @example
 * const cached = cache.get('origens');
 * if (validateCacheStructure(cached, 'desc_origem')) {
 *     // Cache válido, use os dados
 * } else {
 *     // Cache inválido ou corrompido, busque do banco
 * }
 */
export function validateCacheStructure(cached, propertyName) {
    if (!cached || !cached.rows || !Array.isArray(cached.rows) || cached.rows.length === 0) {
        return false;
    }

    const firstItem = cached.rows[0];
    return firstItem && typeof firstItem === 'object' && propertyName in firstItem;
}

/**
 * Serializa múltiplos resultados de queries para cache
 *
 * Útil quando você precisa cachear vários resultados de uma vez,
 * como filtros de dashboard que buscam múltiplas tabelas.
 *
 * @param {Object} results - Objeto com múltiplos resultados de queries
 * @returns {Object} Objeto com todos os resultados serializados
 *
 * @example
 * const results = {
 *     origens: await db.execute('SELECT * FROM origens'),
 *     rotas: await db.execute('SELECT * FROM rotas')
 * };
 * const serialized = serializeMultipleResults(results);
 * cache.set('filtros', serialized, CACHE_TTL.FILTERS);
 */
export function serializeMultipleResults(results) {
    if (!results) {
        return {};
    }
    const serialized = {};
    for (const [key, result] of Object.entries(results)) {
        serialized[key] = serializeDbResult(result);
    }
    return serialized;
}
