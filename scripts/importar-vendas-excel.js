#!/usr/bin/env node

/**
 * Script de Importação de Vendas do Excel para Turso
 *
 * Importa dados de vendas de planilhas Excel para a tabela vendas no banco Turso.
 *
 * FILTROS APLICADOS:
 * - Apenas registros onde Série = "EP"
 *
 * MAPEAMENTO:
 * - chave_primaria: Concatenação de "Nota Fiscal" + "Produto"
 * - Demais colunas: mapeamento direto conforme cabeçalhos do Excel
 *
 * USO:
 *   node scripts/importar-vendas-excel.js <caminho-para-arquivo.xlsx>
 *   npm run importar-vendas <caminho-para-arquivo.xlsx>
 *
 * EXEMPLOS:
 *   node scripts/importar-vendas-excel.js vendas_2024.xlsx
 *   npm run importar-vendas ./dados/vendas_janeiro.xlsx
 */

import XLSX from 'xlsx';
import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Configuração do banco de dados
const DB_CONFIG = {
    url: 'libsql://comercial-angeloxiru.aws-us-east-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjI4ODQ2ODMsImlkIjoiMmI3NTFkOTQtNGI1ZS00ZjZhLWExMDktNTY0OTg3MzgyOGZhIiwicmlkIjoiOGZiZGQ3ZmMtOThmOC00MmMxLWExNzYtZmJiOTZhYmEwN2I0In0.ZjNIt9GEI01v_Ot9GnzsbS_FJIHjTVjCL9X8TdUJmi0LUfoMXX6xMJlRqNCRZiS6U3iNwkP709K_H8ybU9e3DQ'
};

// Configurações de importação
const CONFIG = {
    BATCH_SIZE: 500,        // Quantidade de registros por lote
    SERIE_FILTRO: 'EP',     // Apenas registros com Série = "EP"
    TABELA: 'vendas'
};

// Mapeamento de colunas: Excel -> Banco
const COLUMN_MAPPING = {
    'Série': 'serie',
    'Nota Fiscal': 'nota_fiscal',
    'Emissão': 'emissao',
    'Produto': 'produto',
    'Qtde.Faturada': 'qtde_faturada',
    'Nat.Oper.': 'nat_oper',
    'Família': 'familia',
    'Complemento': 'complemento',
    'Cliente': 'cliente',
    'Nome': 'nome',
    'Fantasia': 'fantasia',
    'Representante': 'representante',
    'UF': 'uf',
    'Cidade': 'cidade',
    'Peso Líq.': 'peso_liq',
    'Preço.Unitário': 'preco_unitario',
    '% Desc.': 'perc_desc',
    'Valor Bruto': 'valor_bruto',
    'Valor Desconto': 'valor_desconto',
    'Valor Líquido': 'valor_liquido',
    'Valor Financeiro': 'valor_financeiro',
    'Grupo Empresa': 'grupo_empresa',
    'Preço Unit. Liq.': 'preco_unit_liq',
    'Preço Bruto': 'preco_bruto'
};

// Colunas que devem ser numéricas
const NUMERIC_COLUMNS = [
    'qtde_faturada',
    'peso_liq',
    'preco_unitario',
    'perc_desc',
    'valor_bruto',
    'valor_desconto',
    'valor_liquido',
    'valor_financeiro',
    'preco_unit_liq',
    'preco_bruto'
];

/**
 * Classe principal de importação
 */
class VendasImporter {
    constructor() {
        this.client = null;
        this.stats = {
            total: 0,
            filtrados: 0,
            inseridos: 0,
            erros: 0,
            duplicados: 0
        };
    }

    /**
     * Conecta ao banco de dados Turso
     */
    async connect() {
        console.log('🔌 Conectando ao Turso...');
        this.client = createClient(DB_CONFIG);

        // Testa a conexão
        await this.client.execute('SELECT 1');
        console.log('✅ Conectado ao banco de dados\n');
    }

    /**
     * Lê arquivo Excel e converte para JSON
     */
    readExcel(filePath) {
        console.log(`📖 Lendo arquivo: ${filePath}`);

        const absolutePath = resolve(filePath);
        const workbook = XLSX.readFile(absolutePath);

        // Pega a primeira planilha
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Converte para JSON
        const data = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,  // Mantém valores como strings
            defval: null // Células vazias ficam como null
        });

        console.log(`✅ Arquivo lido: ${data.length} registros encontrados`);
        console.log(`📊 Planilha: "${sheetName}"\n`);

        return data;
    }

    /**
     * Valida e transforma um registro do Excel para o formato do banco
     */
    transformRecord(excelRow, lineNumber) {
        try {
            // Filtro: apenas Série = "EP"
            const serie = excelRow['Série']?.trim();
            if (serie !== CONFIG.SERIE_FILTRO) {
                return null; // Registro filtrado
            }

            // Gera chave primária: concatena Nota Fiscal + Produto
            const notaFiscal = excelRow['Nota Fiscal']?.toString().trim() || '';
            const produto = excelRow['Produto']?.toString().trim() || '';

            if (!notaFiscal || !produto) {
                throw new Error(`Linha ${lineNumber}: Nota Fiscal ou Produto ausente`);
            }

            const chave_primaria = notaFiscal + produto;

            // Cria objeto do registro com mapeamento
            const record = {
                chave_primaria
            };

            // Mapeia cada coluna do Excel para o banco
            for (const [excelCol, dbCol] of Object.entries(COLUMN_MAPPING)) {
                let value = excelRow[excelCol];

                // Converte valores
                if (value === null || value === undefined || value === '') {
                    value = null;
                } else if (NUMERIC_COLUMNS.includes(dbCol)) {
                    // Converte para número
                    value = this.parseNumber(value);
                } else {
                    // Converte para string e remove espaços extras
                    value = value.toString().trim();
                }

                record[dbCol] = value;
            }

            return record;

        } catch (error) {
            throw new Error(`Linha ${lineNumber}: ${error.message}`);
        }
    }

    /**
     * Converte string para número (aceita vírgula e ponto)
     */
    parseNumber(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        // Remove espaços e converte vírgula para ponto
        let strValue = value.toString().trim().replace(',', '.');

        // Remove separadores de milhar (pontos antes do decimal)
        strValue = strValue.replace(/\.(?=.*\.)/g, '');

        const num = parseFloat(strValue);
        return isNaN(num) ? null : num;
    }

    /**
     * Processa todos os registros do Excel
     */
    processRecords(excelData) {
        console.log('🔄 Processando registros...');

        const records = [];
        const errors = [];

        excelData.forEach((row, index) => {
            this.stats.total++;
            const lineNumber = index + 2; // +2 porque Excel começa em 1 e tem linha de cabeçalho

            try {
                const record = this.transformRecord(row, lineNumber);

                if (record === null) {
                    this.stats.filtrados++;
                } else {
                    records.push(record);
                }

            } catch (error) {
                this.stats.erros++;
                errors.push(error.message);
            }
        });

        console.log(`✅ Processamento concluído:`);
        console.log(`   - Total lidos: ${this.stats.total}`);
        console.log(`   - Série != "EP": ${this.stats.filtrados}`);
        console.log(`   - Válidos para importar: ${records.length}`);

        if (errors.length > 0) {
            console.log(`   ⚠️  Erros: ${errors.length}`);
            errors.slice(0, 10).forEach(err => console.log(`      - ${err}`));
            if (errors.length > 10) {
                console.log(`      ... e mais ${errors.length - 10} erros`);
            }
        }

        console.log('');
        return records;
    }

    /**
     * Gera SQL INSERT com prepared statements
     */
    generateInsertSQL() {
        const columns = [
            'chave_primaria',
            ...Object.values(COLUMN_MAPPING)
        ];

        const placeholders = columns.map(() => '?').join(', ');
        const columnList = columns.join(', ');

        return `INSERT OR IGNORE INTO ${CONFIG.TABELA} (${columnList}) VALUES (${placeholders})`;
    }

    /**
     * Insere registros em lotes (batch)
     */
    async insertBatch(records) {
        console.log(`💾 Inserindo ${records.length} registros em lotes de ${CONFIG.BATCH_SIZE}...`);

        const sql = this.generateInsertSQL();
        const totalBatches = Math.ceil(records.length / CONFIG.BATCH_SIZE);
        let currentBatch = 0;

        for (let i = 0; i < records.length; i += CONFIG.BATCH_SIZE) {
            currentBatch++;
            const batch = records.slice(i, i + CONFIG.BATCH_SIZE);

            // Prepara statements para o batch
            const statements = batch.map(record => {
                const values = [
                    record.chave_primaria,
                    record.serie,
                    record.nota_fiscal,
                    record.emissao,
                    record.produto,
                    record.qtde_faturada,
                    record.nat_oper,
                    record.familia,
                    record.complemento,
                    record.cliente,
                    record.nome,
                    record.fantasia,
                    record.representante,
                    record.uf,
                    record.cidade,
                    record.peso_liq,
                    record.preco_unitario,
                    record.perc_desc,
                    record.valor_bruto,
                    record.valor_desconto,
                    record.valor_liquido,
                    record.valor_financeiro,
                    record.grupo_empresa,
                    record.preco_unit_liq,
                    record.preco_bruto
                ];

                return { sql, args: values };
            });

            try {
                // Executa batch
                const results = await this.client.batch(statements, 'write');

                // Conta inserções bem-sucedidas
                const inserted = results.filter(r => r.rowsAffected > 0).length;
                const duplicated = batch.length - inserted;

                this.stats.inseridos += inserted;
                this.stats.duplicados += duplicated;

                // Progress bar
                const progress = Math.round((currentBatch / totalBatches) * 100);
                const bar = '█'.repeat(Math.floor(progress / 2)) + '░'.repeat(50 - Math.floor(progress / 2));
                process.stdout.write(`\r   [${bar}] ${progress}% - Lote ${currentBatch}/${totalBatches}`);

            } catch (error) {
                console.error(`\n   ❌ Erro no lote ${currentBatch}:`, error.message);
                this.stats.erros += batch.length;
            }
        }

        console.log('\n✅ Inserção concluída\n');
    }

    /**
     * Exibe estatísticas finais
     */
    showStats() {
        console.log('📊 ESTATÍSTICAS FINAIS:');
        console.log('═'.repeat(50));
        console.log(`   Total de registros lidos:      ${this.stats.total}`);
        console.log(`   Filtrados (Série != "EP"):     ${this.stats.filtrados}`);
        console.log(`   Inseridos com sucesso:         ${this.stats.inseridos}`);
        console.log(`   Duplicados (ignorados):        ${this.stats.duplicados}`);
        console.log(`   Erros:                         ${this.stats.erros}`);
        console.log('═'.repeat(50));

        if (this.stats.inseridos > 0) {
            console.log('\n✅ Importação concluída com sucesso!');
        } else {
            console.log('\n⚠️  Nenhum registro foi inserido. Verifique os filtros e dados.');
        }
    }

    /**
     * Executa a importação completa
     */
    async import(filePath) {
        const startTime = Date.now();

        try {
            // 1. Conecta ao banco
            await this.connect();

            // 2. Lê arquivo Excel
            const excelData = this.readExcel(filePath);

            if (excelData.length === 0) {
                throw new Error('Arquivo Excel vazio ou sem dados');
            }

            // 3. Processa e valida registros
            const records = this.processRecords(excelData);

            if (records.length === 0) {
                console.log('⚠️  Nenhum registro válido para importar após filtros');
                return;
            }

            // 4. Insere no banco
            await this.insertBatch(records);

            // 5. Exibe estatísticas
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            this.showStats();
            console.log(`\n⏱️  Tempo total: ${duration}s`);

        } catch (error) {
            console.error('\n❌ ERRO:', error.message);
            process.exit(1);
        }
    }
}

/**
 * Função principal
 */
async function main() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   IMPORTADOR DE VENDAS - EXCEL → TURSO               ║');
    console.log('║   Filtro: Apenas Série = "EP"                        ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('');

    // Valida argumentos
    const filePath = process.argv[2];

    if (!filePath) {
        console.error('❌ Erro: Arquivo não especificado\n');
        console.log('USO:');
        console.log('  node scripts/importar-vendas-excel.js <arquivo.xlsx>');
        console.log('  npm run importar-vendas <arquivo.xlsx>');
        console.log('');
        console.log('EXEMPLOS:');
        console.log('  node scripts/importar-vendas-excel.js vendas_2024.xlsx');
        console.log('  npm run importar-vendas ./dados/vendas_janeiro.xlsx');
        process.exit(1);
    }

    // Executa importação
    const importer = new VendasImporter();
    await importer.import(filePath);
}

// Executa
main();
