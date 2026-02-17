/**
 * Motor RAG (Retrieval-Augmented Generation) do ChatBot
 *
 * Detecta a intencao do usuario e consulta o banco de dados Turso
 * para fornecer contexto real ao Gemini.
 */

import { db } from '../js/db.js';

/**
 * Categorias de intencao com palavras-chave e queries SQL associadas
 */
const INTENT_CATALOG = {
    vendas_resumo: {
        keywords: ['vendas', 'faturamento', 'receita', 'faturado', 'vendido', 'venda', 'vendeu'],
        label: 'Resumo de Vendas',
        queries: [
            {
                name: 'resumo_vendas_mes',
                description: 'Resumo geral de vendas do mes atual',
                sql: `SELECT
                    COUNT(DISTINCT nota_fiscal) as total_notas,
                    COUNT(DISTINCT cliente) as total_clientes_ativos,
                    COUNT(DISTINCT representante) as total_representantes,
                    COUNT(DISTINCT produto) as total_produtos,
                    ROUND(SUM(valor_liquido), 2) as total_faturamento,
                    ROUND(SUM(peso_liq), 2) as total_peso_kg,
                    ROUND(AVG(perc_desc), 2) as media_desconto_perc,
                    ROUND(SUM(valor_bruto), 2) as total_bruto,
                    ROUND(SUM(valor_desconto), 2) as total_descontos
                FROM vendas
                WHERE emissao >= date('now', 'start of month')`
            },
            {
                name: 'vendas_por_uf',
                description: 'Vendas por estado (UF) no mes',
                sql: `SELECT uf,
                    COUNT(DISTINCT cliente) as clientes,
                    ROUND(SUM(valor_liquido), 2) as faturamento,
                    ROUND(SUM(peso_liq), 2) as peso_kg
                FROM vendas
                WHERE emissao >= date('now', 'start of month')
                GROUP BY uf
                ORDER BY faturamento DESC
                LIMIT 10`
            }
        ]
    },

    clientes: {
        keywords: ['cliente', 'clientes', 'comprador', 'compradores', 'consumidor', 'carteira'],
        label: 'Analise de Clientes',
        queries: [
            {
                name: 'top_clientes',
                description: 'Top 10 clientes por faturamento no mes',
                sql: `SELECT v.cliente, v.nome, v.cidade, v.uf,
                    COUNT(DISTINCT v.nota_fiscal) as qtd_pedidos,
                    ROUND(SUM(v.valor_liquido), 2) as faturamento,
                    ROUND(SUM(v.peso_liq), 2) as peso_kg,
                    ROUND(AVG(v.perc_desc), 2) as media_desconto
                FROM vendas v
                WHERE v.emissao >= date('now', 'start of month')
                GROUP BY v.cliente
                ORDER BY faturamento DESC
                LIMIT 10`
            },
            {
                name: 'total_clientes_cadastrados',
                description: 'Total de clientes na base',
                sql: `SELECT
                    COUNT(*) as total_cadastrados,
                    COUNT(CASE WHEN sit_cliente = 'ATIVO' THEN 1 END) as ativos,
                    COUNT(CASE WHEN sit_cliente != 'ATIVO' OR sit_cliente IS NULL THEN 1 END) as inativos,
                    COUNT(DISTINCT rota) as total_rotas,
                    COUNT(DISTINCT estado) as total_estados
                FROM tab_cliente`
            }
        ]
    },

    representantes: {
        keywords: ['representante', 'representantes', 'vendedor', 'vendedores', 'equipe', 'time', 'supervisor'],
        label: 'Performance de Representantes',
        queries: [
            {
                name: 'ranking_representantes',
                description: 'Ranking de representantes por faturamento no mes',
                sql: `SELECT v.representante,
                    MAX(r.desc_representante) as nome_representante,
                    MAX(r.rep_tipo) as tipo,
                    MAX(r.rep_supervisor) as supervisor,
                    COUNT(DISTINCT v.cliente) as clientes_atendidos,
                    COUNT(DISTINCT v.nota_fiscal) as qtd_pedidos,
                    ROUND(SUM(v.valor_liquido), 2) as faturamento,
                    ROUND(SUM(v.peso_liq), 2) as peso_kg
                FROM vendas v
                LEFT JOIN tab_representante r ON v.representante = r.representante
                WHERE v.emissao >= date('now', 'start of month')
                GROUP BY v.representante
                ORDER BY faturamento DESC
                LIMIT 15`
            }
        ]
    },

    produtos: {
        keywords: ['produto', 'produtos', 'item', 'itens', 'familia', 'familias', 'sku', 'skus', 'mix'],
        label: 'Analise de Produtos',
        queries: [
            {
                name: 'top_produtos',
                description: 'Top 15 produtos mais vendidos no mes',
                sql: `SELECT v.produto,
                    MAX(p.desc_produto) as descricao,
                    MAX(p.desc_familia) as familia,
                    MAX(p.desc_origem) as origem,
                    ROUND(SUM(v.qtde_faturada), 2) as qtde_vendida,
                    ROUND(SUM(v.valor_liquido), 2) as faturamento,
                    ROUND(SUM(v.peso_liq), 2) as peso_kg,
                    COUNT(DISTINCT v.cliente) as clientes_compraram
                FROM vendas v
                LEFT JOIN tab_produto p ON v.produto = p.produto
                WHERE v.emissao >= date('now', 'start of month')
                GROUP BY v.produto
                ORDER BY faturamento DESC
                LIMIT 15`
            },
            {
                name: 'vendas_por_familia',
                description: 'Vendas agrupadas por familia de produto',
                sql: `SELECT v.familia,
                    MAX(p.desc_familia) as desc_familia,
                    COUNT(DISTINCT v.produto) as qtd_produtos,
                    ROUND(SUM(v.valor_liquido), 2) as faturamento,
                    ROUND(SUM(v.peso_liq), 2) as peso_kg,
                    COUNT(DISTINCT v.cliente) as clientes
                FROM vendas v
                LEFT JOIN tab_produto p ON v.produto = p.produto
                WHERE v.emissao >= date('now', 'start of month')
                GROUP BY v.familia
                ORDER BY faturamento DESC
                LIMIT 10`
            }
        ]
    },

    metas: {
        keywords: ['meta', 'metas', 'objetivo', 'objetivos', 'target', 'atingimento', 'potencial'],
        label: 'Metas e Potencial',
        queries: [
            {
                name: 'metas_representantes',
                description: 'Metas vs realizado dos representantes',
                sql: `SELECT
                    pr.representante,
                    pr.desc_representante,
                    ROUND(pr.meta_peso, 2) as meta_peso,
                    pr.meta_clientes_positivados,
                    pr.meta_skus,
                    ROUND(COALESCE(v.realizado_peso, 0), 2) as realizado_peso,
                    COALESCE(v.clientes_positivados, 0) as realizado_clientes,
                    CASE WHEN pr.meta_peso > 0
                        THEN ROUND((COALESCE(v.realizado_peso, 0) / pr.meta_peso) * 100, 1)
                        ELSE 0
                    END as perc_atingimento_peso
                FROM potencial_representante pr
                LEFT JOIN (
                    SELECT representante,
                        SUM(peso_liq) as realizado_peso,
                        COUNT(DISTINCT cliente) as clientes_positivados
                    FROM vendas
                    WHERE emissao >= date('now', 'start of month')
                    GROUP BY representante
                ) v ON pr.representante = v.representante
                ORDER BY perc_atingimento_peso DESC
                LIMIT 15`
            }
        ]
    },

    produtos_parados: {
        keywords: ['parado', 'parados', 'sem venda', 'estagnado', 'estagnados', 'encalhado', 'encalhados'],
        label: 'Produtos Parados',
        queries: [
            {
                name: 'produtos_parados_resumo',
                description: 'Resumo de produtos sem venda recente',
                sql: `SELECT
                    COUNT(*) as total_parados,
                    COUNT(DISTINCT produto) as produtos_distintos,
                    COUNT(DISTINCT cliente) as clientes_afetados,
                    COUNT(DISTINCT representante) as representantes_afetados
                FROM vw_produtos_parados`
            }
        ]
    },

    clientes_inativos: {
        keywords: ['sem compra', 'sem compras', 'inativo', 'inativos', 'nao compra', 'nao compraram', 'perdido', 'perdidos'],
        label: 'Clientes Inativos',
        queries: [
            {
                name: 'clientes_sem_compras',
                description: 'Clientes ativos que nao compraram no mes atual',
                sql: `SELECT COUNT(*) as clientes_sem_compra
                FROM tab_cliente c
                WHERE c.sit_cliente = 'ATIVO'
                AND c.cliente NOT IN (
                    SELECT DISTINCT cliente
                    FROM vendas
                    WHERE emissao >= date('now', 'start of month')
                )`
            },
            {
                name: 'distribuicao_inativos_por_rota',
                description: 'Clientes inativos distribuidos por rota',
                sql: `SELECT c.rota,
                    COUNT(*) as clientes_sem_compra
                FROM tab_cliente c
                WHERE c.sit_cliente = 'ATIVO'
                AND c.cliente NOT IN (
                    SELECT DISTINCT cliente
                    FROM vendas
                    WHERE emissao >= date('now', 'start of month')
                )
                GROUP BY c.rota
                ORDER BY clientes_sem_compra DESC
                LIMIT 10`
            }
        ]
    },

    precos: {
        keywords: ['preco', 'precos', 'precificacao', 'desconto', 'descontos', 'margem', 'ticket'],
        label: 'Precos e Descontos',
        queries: [
            {
                name: 'analise_precos',
                description: 'Analise de precos e descontos do mes',
                sql: `SELECT
                    ROUND(AVG(preco_unitario), 2) as preco_medio,
                    ROUND(AVG(perc_desc), 2) as desconto_medio_perc,
                    ROUND(SUM(valor_desconto), 2) as total_descontos,
                    ROUND(SUM(valor_bruto), 2) as total_bruto,
                    ROUND(SUM(valor_liquido), 2) as total_liquido,
                    ROUND((SUM(valor_desconto) / NULLIF(SUM(valor_bruto), 0)) * 100, 2) as perc_desconto_global,
                    ROUND(SUM(valor_liquido) / NULLIF(COUNT(DISTINCT nota_fiscal), 0), 2) as ticket_medio
                FROM vendas
                WHERE emissao >= date('now', 'start of month')`
            }
        ]
    },

    regional: {
        keywords: ['regiao', 'regioes', 'rota', 'rotas', 'cidade', 'cidades', 'estado', 'estados', 'sub_rota', 'geografia'],
        label: 'Analise Regional',
        queries: [
            {
                name: 'vendas_por_rota',
                description: 'Vendas por rota no mes',
                sql: `SELECT c.rota,
                    COUNT(DISTINCT v.cliente) as clientes,
                    COUNT(DISTINCT v.representante) as representantes,
                    ROUND(SUM(v.valor_liquido), 2) as faturamento,
                    ROUND(SUM(v.peso_liq), 2) as peso_kg
                FROM vendas v
                LEFT JOIN tab_cliente c ON v.cliente = c.cliente
                WHERE v.emissao >= date('now', 'start of month')
                GROUP BY c.rota
                ORDER BY faturamento DESC
                LIMIT 10`
            }
        ]
    }
};

/**
 * Query generica executada sempre para dar contexto basico ao Gemini
 */
const BASE_CONTEXT_QUERY = {
    name: 'contexto_base',
    description: 'Visao geral da base de dados',
    sql: `SELECT
        (SELECT COUNT(*) FROM tab_cliente WHERE sit_cliente = 'ATIVO') as clientes_ativos,
        (SELECT COUNT(*) FROM tab_representante) as total_representantes,
        (SELECT COUNT(*) FROM tab_produto) as total_produtos,
        (SELECT MIN(emissao) FROM vendas) as primeira_venda,
        (SELECT MAX(emissao) FROM vendas) as ultima_venda,
        (SELECT COUNT(*) FROM vendas WHERE emissao >= date('now', 'start of month')) as vendas_mes_atual`
};

/**
 * Classe principal do motor RAG
 */
export class ChatbotRAG {

    /**
     * Detecta as intencoes do usuario a partir da mensagem
     * @param {string} message - Mensagem do usuario
     * @returns {Array} Array de intencoes detectadas, ordenadas por relevancia
     */
    detectIntents(message) {
        const normalizedMessage = message.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        const matches = [];

        for (const [intentKey, intentData] of Object.entries(INTENT_CATALOG)) {
            let score = 0;
            const matchedKeywords = [];

            for (const keyword of intentData.keywords) {
                const normalizedKeyword = keyword
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

                if (normalizedMessage.includes(normalizedKeyword)) {
                    score += normalizedKeyword.length;
                    matchedKeywords.push(keyword);
                }
            }

            if (score > 0) {
                matches.push({
                    intent: intentKey,
                    label: intentData.label,
                    score,
                    matchedKeywords,
                    queries: intentData.queries
                });
            }
        }

        // Ordena por score (maior relevancia primeiro)
        matches.sort((a, b) => b.score - a.score);

        // Se nenhuma intencao detectada, retorna vendas_resumo como default
        if (matches.length === 0) {
            return [{
                intent: 'vendas_resumo',
                label: INTENT_CATALOG.vendas_resumo.label,
                score: 0,
                matchedKeywords: [],
                queries: INTENT_CATALOG.vendas_resumo.queries
            }];
        }

        // Retorna no maximo 2 intencoes mais relevantes
        return matches.slice(0, 2);
    }

    /**
     * Garante que o banco de dados esta conectado
     */
    async ensureConnection() {
        if (!db.isConnected()) {
            await db.connect();
        }
    }

    /**
     * Executa uma query SQL e retorna os resultados
     * @param {Object} queryDef - Definicao da query {name, description, sql}
     * @returns {Object} Resultado formatado
     */
    async executeQuery(queryDef) {
        try {
            const result = await db.execute(queryDef.sql);
            return {
                name: queryDef.name,
                description: queryDef.description,
                success: true,
                rows: result.rows,
                rowCount: result.rows.length
            };
        } catch (error) {
            console.error(`Erro na query ${queryDef.name}:`, error);
            return {
                name: queryDef.name,
                description: queryDef.description,
                success: false,
                error: error.message,
                rows: [],
                rowCount: 0
            };
        }
    }

    /**
     * Formata valor monetario para padrao brasileiro
     */
    formatCurrency(value) {
        if (value == null || isNaN(value)) return 'R$ 0,00';
        return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    /**
     * Formata os resultados das queries em texto legivel para o prompt
     * @param {Array} queryResults - Array de resultados das queries
     * @returns {string} Texto formatado com os dados
     */
    formatContext(queryResults) {
        let context = '';

        for (const result of queryResults) {
            context += `\n--- ${result.description.toUpperCase()} ---\n`;

            if (!result.success) {
                context += `[Erro ao consultar: ${result.error}]\n`;
                continue;
            }

            if (result.rowCount === 0) {
                context += '[Nenhum dado encontrado para o periodo]\n';
                continue;
            }

            // Formata cada linha de resultado
            for (const row of result.rows) {
                const values = Object.entries(row)
                    .map(([key, val]) => {
                        // Formata valores monetarios
                        if (['faturamento', 'total_faturamento', 'total_bruto', 'total_liquido',
                             'total_descontos', 'valor_bruto', 'valor_liquido', 'ticket_medio',
                             'preco_medio', 'meta_faturamento', 'realizado_faturamento'].includes(key)) {
                            return `${key}: ${this.formatCurrency(val)}`;
                        }
                        // Formata pesos
                        if (['peso_kg', 'total_peso_kg', 'meta_peso', 'realizado_peso'].includes(key)) {
                            return `${key}: ${Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kg`;
                        }
                        // Formata percentuais
                        if (['perc_desc', 'media_desconto', 'desconto_medio_perc', 'media_desconto_perc',
                             'perc_desconto_global', 'perc_atingimento_peso'].includes(key)) {
                            return `${key}: ${Number(val || 0).toFixed(1)}%`;
                        }
                        return `${key}: ${val ?? 'N/A'}`;
                    })
                    .join(' | ');
                context += `  ${values}\n`;
            }
        }

        return context;
    }

    /**
     * Metodo principal: busca contexto do banco de dados baseado na mensagem do usuario
     * @param {string} message - Mensagem do usuario
     * @returns {Object} Contexto formatado para o Gemini
     */
    async getContext(message) {
        const result = {
            context: '',
            intents: [],
            queriesExecuted: 0,
            hasData: false,
            error: null
        };

        try {
            await this.ensureConnection();

            // Detecta intencoes
            const intents = this.detectIntents(message);
            result.intents = intents.map(i => i.label);

            // Coleta todas as queries a executar (contexto base + intencoes detectadas)
            const allQueries = [BASE_CONTEXT_QUERY];
            for (const intent of intents) {
                allQueries.push(...intent.queries);
            }

            // Executa todas as queries em paralelo
            const queryResults = await Promise.all(
                allQueries.map(q => this.executeQuery(q))
            );

            result.queriesExecuted = queryResults.length;
            result.hasData = queryResults.some(r => r.success && r.rowCount > 0);

            // Formata o contexto
            const dateInfo = `Data da consulta: ${new Date().toLocaleDateString('pt-BR')}`;
            const intentInfo = `Assuntos detectados: ${result.intents.join(', ')}`;

            result.context = `${dateInfo}\n${intentInfo}\n${this.formatContext(queryResults)}`;

        } catch (error) {
            console.error('Erro no RAG:', error);
            result.error = error.message;
            result.context = `[AVISO: Nao foi possivel consultar o banco de dados. Erro: ${error.message}. Responda com base no seu conhecimento geral sobre gestao comercial.]`;
        }

        return result;
    }
}
