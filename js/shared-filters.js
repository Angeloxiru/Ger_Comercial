/**
 * Cache unificado de lookups compartilhados entre dashboards.
 *
 * Cada função busca dados de uma lookup table com cache key compartilhada,
 * evitando queries duplicadas quando o usuário navega entre dashboards.
 */

import { db } from './db.js';
import { cache, CACHE_TTL } from './cache.js';
import { serializeDbResult } from './db-utils.js';

/**
 * Busca representantes (supervisores + desc_representante) com cache compartilhado.
 * Usado por: vendas-equipe, categorias-produtos, ranking-clientes, cobranca-semanal, produtos-parados.
 *
 * @returns {Promise<{rows: Array}>} Resultado serializado com rows
 */
export async function getRepresentantes() {
    return cache.getOrFetch('shared_lkp_representantes', async () => {
        if (!db.isConnected()) await db.connect();

        let result = await db.execute(
            'SELECT representante, desc_representante, rep_supervisor FROM lkp_representantes WHERE desc_representante IS NOT NULL ORDER BY desc_representante'
        );
        if (!result?.rows?.length) {
            result = await db.execute(
                'SELECT DISTINCT representante, desc_representante, rep_supervisor FROM tab_representante WHERE desc_representante IS NOT NULL ORDER BY desc_representante'
            );
        }
        return serializeDbResult(result);
    }, CACHE_TTL.FILTERS);
}

/**
 * Busca localidades (rotas, sub_rotas, cidades) com cache compartilhado.
 * Usado por: vendas-regiao, ranking-clientes.
 *
 * @returns {Promise<{rows: Array}>} Resultado serializado
 */
export async function getLocalidades() {
    return cache.getOrFetch('shared_lkp_localidades', async () => {
        if (!db.isConnected()) await db.connect();

        let result = await db.execute(
            'SELECT DISTINCT rota, sub_rota, cidade FROM lkp_localidades WHERE rota IS NOT NULL'
        );
        if (!result?.rows?.length) {
            result = await db.execute(
                'SELECT rota, sub_rota, cidade FROM tab_cliente WHERE rota IS NOT NULL'
            );
        }
        return serializeDbResult(result);
    }, CACHE_TTL.FILTERS);
}

/**
 * Busca cidades por região com cache compartilhado.
 * Usado por: vendas-regiao.
 *
 * @returns {Promise<{rows: Array}>} Resultado serializado
 */
export async function getCidadesRegiao() {
    return cache.getOrFetch('shared_lkp_cidades_regiao', async () => {
        if (!db.isConnected()) await db.connect();

        let result = await db.execute(
            'SELECT cidade, rota, sub_rota FROM lkp_cidades_regiao ORDER BY cidade'
        );
        if (!result?.rows?.length) {
            result = await db.execute(
                'SELECT DISTINCT v.cidade, c.rota, c.sub_rota FROM vendas v LEFT JOIN tab_cliente c ON v.cliente = c.cliente WHERE v.cidade IS NOT NULL ORDER BY v.cidade'
            );
        }
        return serializeDbResult(result);
    }, CACHE_TTL.FILTERS);
}

/**
 * Busca cidades por equipe com cache compartilhado.
 * Usado por: vendas-equipe.
 *
 * @returns {Promise<{rows: Array}>} Resultado serializado
 */
export async function getCidadesEquipe() {
    return cache.getOrFetch('shared_lkp_cidades_equipe', async () => {
        if (!db.isConnected()) await db.connect();

        let result = await db.execute(
            'SELECT cidade, representante, rep_supervisor FROM lkp_cidades_equipe ORDER BY cidade'
        );
        if (!result?.rows?.length) {
            result = await db.execute(
                'SELECT DISTINCT v.cidade, r.representante, r.rep_supervisor FROM vendas v LEFT JOIN tab_representante r ON v.representante = r.representante WHERE v.cidade IS NOT NULL ORDER BY v.cidade'
            );
        }
        return serializeDbResult(result);
    }, CACHE_TTL.FILTERS);
}

/**
 * Busca produtos com cache compartilhado.
 * Usado por: analise-produtos.
 *
 * @returns {Promise<{rows: Array}>} Resultado serializado
 */
export async function getProdutos() {
    return cache.getOrFetch('shared_lkp_produtos', async () => {
        if (!db.isConnected()) await db.connect();

        let result = await db.execute(
            'SELECT produto, desc_produto, desc_familia, desc_origem FROM lkp_produtos WHERE desc_produto IS NOT NULL ORDER BY desc_produto'
        );
        if (!result?.rows?.length) {
            result = await db.execute(
                'SELECT produto, desc_produto, desc_familia, desc_origem FROM tab_produto WHERE desc_produto IS NOT NULL ORDER BY desc_produto'
            );
        }
        return serializeDbResult(result);
    }, CACHE_TTL.FILTERS);
}

/**
 * Busca clientes com cache compartilhado.
 * Usado por: performance-clientes.
 *
 * @returns {Promise<{rows: Array}>} Resultado serializado
 */
export async function getClientes() {
    return cache.getOrFetch('shared_lkp_clientes', async () => {
        if (!db.isConnected()) await db.connect();

        let result;
        try {
            result = await db.execute(
                'SELECT cliente, nome, fantasia, grupo_desc FROM lkp_clientes WHERE nome IS NOT NULL ORDER BY nome'
            );
        } catch (e) {
            result = { rows: [] };
        }
        if (!result?.rows?.length) {
            result = await db.execute(
                'SELECT DISTINCT cliente, nome, fantasia, grupo_desc FROM tab_cliente WHERE nome IS NOT NULL ORDER BY nome'
            );
        }
        return serializeDbResult(result);
    }, CACHE_TTL.FILTERS);
}
