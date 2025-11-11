/**
 * Scripts de Teste para Banco de Dados
 *
 * Este arquivo contém funções de teste para validar
 * a conexão e operações com o banco de dados Turso
 */

import { db } from './db.js';

/**
 * Suite completa de testes
 */
export class TestSuite {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    /**
     * Adiciona um resultado de teste
     */
    addResult(name, success, message, data = null) {
        this.results.push({
            name,
            success,
            message,
            data,
            timestamp: new Date().toISOString()
        });

        if (success) {
            this.passed++;
            console.log(`✅ ${name}: ${message}`);
        } else {
            this.failed++;
            console.error(`❌ ${name}: ${message}`);
        }
    }

    /**
     * Teste 1: Conexão básica
     */
    async testConnection() {
        try {
            await db.connect();
            this.addResult(
                'Conexão ao Banco',
                true,
                'Conectado com sucesso ao Turso'
            );
            return true;
        } catch (error) {
            this.addResult(
                'Conexão ao Banco',
                false,
                `Erro: ${error.message}`
            );
            return false;
        }
    }

    /**
     * Teste 2: Query simples
     */
    async testSimpleQuery() {
        try {
            const result = await db.execute('SELECT 1 as num, "Hello" as msg');
            this.addResult(
                'Query Simples',
                true,
                'Query executada com sucesso',
                result.rows
            );
            return true;
        } catch (error) {
            this.addResult(
                'Query Simples',
                false,
                `Erro: ${error.message}`
            );
            return false;
        }
    }

    /**
     * Teste 3: Listar tabelas
     */
    async testListTables() {
        try {
            const tables = await db.listTables();
            this.addResult(
                'Listar Tabelas',
                true,
                `${tables.length} tabela(s) encontrada(s)`,
                tables
            );
            return true;
        } catch (error) {
            this.addResult(
                'Listar Tabelas',
                false,
                `Erro: ${error.message}`
            );
            return false;
        }
    }

    /**
     * Teste 4: Criar tabela de exemplo
     */
    async testCreateTable() {
        try {
            await db.createTable('test_produtos', {
                id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
                nome: 'TEXT NOT NULL',
                preco: 'REAL NOT NULL',
                estoque: 'INTEGER DEFAULT 0',
                criado_em: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
            });
            this.addResult(
                'Criar Tabela',
                true,
                'Tabela "test_produtos" criada com sucesso'
            );
            return true;
        } catch (error) {
            this.addResult(
                'Criar Tabela',
                false,
                `Erro: ${error.message}`
            );
            return false;
        }
    }

    /**
     * Teste 5: Inserir dados
     */
    async testInsert() {
        try {
            await db.insert('test_produtos', {
                nome: 'Produto Teste',
                preco: 99.90,
                estoque: 10
            });
            this.addResult(
                'Inserir Dados',
                true,
                'Registro inserido com sucesso'
            );
            return true;
        } catch (error) {
            this.addResult(
                'Inserir Dados',
                false,
                `Erro: ${error.message}`
            );
            return false;
        }
    }

    /**
     * Teste 6: Selecionar dados
     */
    async testSelect() {
        try {
            const produtos = await db.select('test_produtos', {
                orderBy: 'id DESC',
                limit: 10
            });
            this.addResult(
                'Selecionar Dados',
                true,
                `${produtos.length} registro(s) encontrado(s)`,
                produtos
            );
            return true;
        } catch (error) {
            this.addResult(
                'Selecionar Dados',
                false,
                `Erro: ${error.message}`
            );
            return false;
        }
    }

    /**
     * Teste 7: Atualizar dados
     */
    async testUpdate() {
        try {
            await db.update(
                'test_produtos',
                { preco: 89.90 },
                { nome: 'Produto Teste' }
            );
            this.addResult(
                'Atualizar Dados',
                true,
                'Registro atualizado com sucesso'
            );
            return true;
        } catch (error) {
            this.addResult(
                'Atualizar Dados',
                false,
                `Erro: ${error.message}`
            );
            return false;
        }
    }

    /**
     * Teste 8: Executar batch (múltiplas queries)
     */
    async testBatch() {
        try {
            const statements = [
                { sql: 'SELECT COUNT(*) as total FROM test_produtos' },
                { sql: 'SELECT SUM(preco) as soma_total FROM test_produtos' },
                { sql: 'SELECT AVG(estoque) as media_estoque FROM test_produtos' }
            ];
            const results = await db.batch(statements);
            this.addResult(
                'Batch Query',
                true,
                'Múltiplas queries executadas com sucesso',
                results.map(r => r.rows)
            );
            return true;
        } catch (error) {
            this.addResult(
                'Batch Query',
                false,
                `Erro: ${error.message}`
            );
            return false;
        }
    }

    /**
     * Teste 9: Verificar estrutura da tabela
     */
    async testTableStructure() {
        try {
            const structure = await db.getTableStructure('test_produtos');
            this.addResult(
                'Estrutura da Tabela',
                true,
                `${structure.length} coluna(s) na tabela`,
                structure
            );
            return true;
        } catch (error) {
            this.addResult(
                'Estrutura da Tabela',
                false,
                `Erro: ${error.message}`
            );
            return false;
        }
    }

    /**
     * Teste 10: Limpar tabela de teste
     */
    async testCleanup() {
        try {
            await db.execute('DROP TABLE IF EXISTS test_produtos');
            this.addResult(
                'Limpeza',
                true,
                'Tabela de teste removida'
            );
            return true;
        } catch (error) {
            this.addResult(
                'Limpeza',
                false,
                `Erro: ${error.message}`
            );
            return false;
        }
    }

    /**
     * Executa todos os testes
     */
    async runAll() {
        console.log('🧪 Iniciando suite de testes...\n');

        // Testes sequenciais
        await this.testConnection();

        if (!db.isConnected()) {
            console.error('\n❌ Não foi possível conectar. Testes cancelados.');
            return this.getSummary();
        }

        await this.testSimpleQuery();
        await this.testListTables();
        await this.testCreateTable();
        await this.testInsert();
        await this.testSelect();
        await this.testUpdate();
        await this.testBatch();
        await this.testTableStructure();
        await this.testCleanup();

        return this.getSummary();
    }

    /**
     * Retorna resumo dos testes
     */
    getSummary() {
        const total = this.passed + this.failed;
        const percentage = total > 0 ? (this.passed / total * 100).toFixed(1) : 0;

        const summary = {
            total,
            passed: this.passed,
            failed: this.failed,
            percentage: `${percentage}%`,
            results: this.results
        };

        console.log('\n📊 Resumo dos Testes:');
        console.log(`Total: ${total}`);
        console.log(`✅ Passou: ${this.passed}`);
        console.log(`❌ Falhou: ${this.failed}`);
        console.log(`📈 Taxa de Sucesso: ${percentage}%`);

        return summary;
    }
}

/**
 * Função auxiliar para executar testes rapidamente
 */
export async function runQuickTest() {
    const suite = new TestSuite();
    return await suite.runAll();
}
