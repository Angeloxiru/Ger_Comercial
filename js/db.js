/**
 * Módulo de Conexão com Banco de Dados Turso
 *
 * Este módulo gerencia a conexão com o banco de dados LibSQL no Turso
 */

import { createClient } from 'https://esm.sh/@libsql/client@0.4.0/web';
import { config, validateConfig } from './config.js';

class DatabaseManager {
    constructor() {
        this.client = null;
        this.connected = false;
    }

    /**
     * Inicializa a conexão com o banco de dados
     * @returns {Promise<boolean>} true se conectado com sucesso
     */
    async connect() {
        try {
            // Valida configuração
            if (!validateConfig()) {
                throw new Error('Configuração inválida. Verifique o arquivo config.js');
            }

            // Cria o cliente
            this.client = createClient({
                url: config.url,
                authToken: config.authToken
            });

            this.connected = true;
            console.log('✅ Conectado ao banco de dados Turso');
            return true;

        } catch (error) {
            this.connected = false;
            console.error('❌ Erro ao conectar ao banco:', error.message);
            throw error;
        }
    }

    /**
     * Executa uma query SQL
     * @param {string} sql - Query SQL a ser executada
     * @param {Array} params - Parâmetros para a query (opcional)
     * @returns {Promise<Object>} Resultado da query
     */
    async execute(sql, params = []) {
        if (!this.connected || !this.client) {
            throw new Error('Banco de dados não conectado. Execute connect() primeiro.');
        }

        try {
            const result = await this.client.execute({
                sql: sql,
                args: params
            });
            return result;
        } catch (error) {
            console.error('❌ Erro ao executar query:', error.message);
            throw error;
        }
    }

    /**
     * Executa múltiplas queries em uma transação
     * @param {Array} statements - Array de objetos {sql, args}
     * @returns {Promise<Array>} Array de resultados
     */
    async batch(statements) {
        if (!this.connected || !this.client) {
            throw new Error('Banco de dados não conectado. Execute connect() primeiro.');
        }

        try {
            const results = await this.client.batch(statements);
            return results;
        } catch (error) {
            console.error('❌ Erro ao executar batch:', error.message);
            throw error;
        }
    }

    /**
     * Lista todas as tabelas do banco
     * @returns {Promise<Array>} Array com nomes das tabelas
     */
    async listTables() {
        const result = await this.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        );
        return result.rows.map(row => row.name);
    }

    /**
     * Obtém a estrutura de uma tabela
     * @param {string} tableName - Nome da tabela
     * @returns {Promise<Array>} Array com informações das colunas
     */
    async getTableStructure(tableName) {
        const result = await this.execute(`PRAGMA table_info(${tableName})`);
        return result.rows;
    }

    /**
     * Cria uma tabela se não existir
     * @param {string} tableName - Nome da tabela
     * @param {Object} columns - Objeto com definição das colunas
     * @returns {Promise<Object>} Resultado da operação
     */
    async createTable(tableName, columns) {
        const columnDefinitions = Object.entries(columns)
            .map(([name, definition]) => `${name} ${definition}`)
            .join(', ');

        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions})`;
        return await this.execute(sql);
    }

    /**
     * Insere um registro na tabela
     * @param {string} tableName - Nome da tabela
     * @param {Object} data - Dados a serem inseridos
     * @returns {Promise<Object>} Resultado da operação
     */
    async insert(tableName, data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
        return await this.execute(sql, values);
    }

    /**
     * Seleciona registros da tabela
     * @param {string} tableName - Nome da tabela
     * @param {Object} options - Opções de busca (where, limit, orderBy)
     * @returns {Promise<Array>} Array de registros
     */
    async select(tableName, options = {}) {
        let sql = `SELECT * FROM ${tableName}`;
        const params = [];

        if (options.where) {
            const conditions = Object.entries(options.where)
                .map(([key]) => `${key} = ?`)
                .join(' AND ');
            sql += ` WHERE ${conditions}`;
            params.push(...Object.values(options.where));
        }

        if (options.orderBy) {
            sql += ` ORDER BY ${options.orderBy}`;
        }

        if (options.limit) {
            sql += ` LIMIT ${options.limit}`;
        }

        const result = await this.execute(sql, params);
        return result.rows;
    }

    /**
     * Atualiza registros na tabela
     * @param {string} tableName - Nome da tabela
     * @param {Object} data - Dados a serem atualizados
     * @param {Object} where - Condições para atualização
     * @returns {Promise<Object>} Resultado da operação
     */
    async update(tableName, data, where) {
        const setClause = Object.keys(data)
            .map(key => `${key} = ?`)
            .join(', ');

        const whereClause = Object.keys(where)
            .map(key => `${key} = ?`)
            .join(' AND ');

        const params = [...Object.values(data), ...Object.values(where)];

        const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
        return await this.execute(sql, params);
    }

    /**
     * Deleta registros da tabela
     * @param {string} tableName - Nome da tabela
     * @param {Object} where - Condições para deleção
     * @returns {Promise<Object>} Resultado da operação
     */
    async delete(tableName, where) {
        const whereClause = Object.keys(where)
            .map(key => `${key} = ?`)
            .join(' AND ');

        const params = Object.values(where);

        const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;
        return await this.execute(sql, params);
    }

    /**
     * Fecha a conexão com o banco
     */
    close() {
        if (this.client) {
            this.client.close();
            this.connected = false;
            console.log('🔌 Conexão com banco de dados fechada');
        }
    }

    /**
     * Verifica se está conectado
     * @returns {boolean}
     */
    isConnected() {
        return this.connected;
    }
}

// Exporta uma instância única (Singleton)
export const db = new DatabaseManager();

// Exporta a classe para casos especiais
export { DatabaseManager };
