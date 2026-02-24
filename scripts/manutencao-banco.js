/**
 * manutencao-banco.js
 *
 * Executa manutenção e diagnóstico no banco Turso via @libsql/client.
 * - Verifica integridade do banco
 * - Lista índices existentes
 * - Mostra estatísticas de tamanho e contagem de registros
 *
 * NOTA: O Turso/libSQL NÃO suporta o comando ANALYZE.
 * Os índices funcionam automaticamente sem necessidade de ANALYZE.
 *
 * Variáveis de ambiente necessárias:
 *   TURSO_URL   – URL do banco Turso
 *   TURSO_TOKEN – Token de autenticação Turso
 */

import { createClient } from '@libsql/client';

const db = createClient({
    url:       process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN
});

async function main() {
    const inicio = new Date();
    console.log('=========================================================');
    console.log(' Manutenção do Banco de Dados');
    console.log(` Início: ${inicio.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    console.log('=========================================================\n');

    // 1. Integrity check
    console.log('[...] Verificando integridade do banco...');
    const integrity = await db.execute('PRAGMA integrity_check');
    const resultado = integrity.rows[0]?.integrity_check ?? integrity.rows[0]?.[0] ?? 'desconhecido';
    if (resultado === 'ok') {
        console.log('[OK]  Integridade verificada — banco íntegro\n');
    } else {
        console.log(`[WARN] Resultado do integrity_check: ${resultado}\n`);
    }

    // 2. Listar índices existentes
    console.log('[...] Verificando índices...');
    const indexes = await db.execute(`
        SELECT name, tbl_name
        FROM sqlite_master
        WHERE type = 'index' AND name LIKE 'idx_%'
        ORDER BY tbl_name, name
    `);
    console.log(`[OK]  ${indexes.rows.length} índices encontrados:`);
    let tabelaAtual = '';
    for (const row of indexes.rows) {
        const tabela = row.tbl_name ?? row[1];
        const nome   = row.name ?? row[0];
        if (tabela !== tabelaAtual) {
            tabelaAtual = tabela;
            console.log(`\n       ${tabela}:`);
        }
        console.log(`         - ${nome}`);
    }
    console.log('');

    // 3. Verificar lookup tables
    console.log('[...] Verificando lookup tables...');
    const lookups = await db.execute(`
        SELECT 'lkp_localidades' as tabela, COUNT(*) as total FROM lkp_localidades
        UNION ALL SELECT 'lkp_representantes', COUNT(*) FROM lkp_representantes
        UNION ALL SELECT 'lkp_cidades_regiao', COUNT(*) FROM lkp_cidades_regiao
        UNION ALL SELECT 'lkp_cidades_equipe', COUNT(*) FROM lkp_cidades_equipe
        UNION ALL SELECT 'lkp_clientes', COUNT(*) FROM lkp_clientes
        UNION ALL SELECT 'lkp_produtos', COUNT(*) FROM lkp_produtos
        UNION ALL SELECT 'lkp_produtos_parados', COUNT(*) FROM lkp_produtos_parados
    `);
    console.log('[OK]  Lookup tables:');
    for (const row of lookups.rows) {
        const tabela = row.tabela ?? row[0];
        const total  = row.total ?? row[1];
        const status = Number(total) > 0 ? 'OK' : 'VAZIA';
        console.log(`       [${status.padEnd(5)}] ${String(tabela).padEnd(24)} ${String(total).padStart(6)} registros`);
    }
    console.log('');

    // 4. Estatísticas de tamanho
    const pageCount = await db.execute('PRAGMA page_count');
    const pageSize  = await db.execute('PRAGMA page_size');
    const pages = Number(pageCount.rows[0]?.page_count ?? pageCount.rows[0]?.[0] ?? 0);
    const size  = Number(pageSize.rows[0]?.page_size ?? pageSize.rows[0]?.[0] ?? 0);
    const totalMB = ((pages * size) / (1024 * 1024)).toFixed(2);
    console.log(`[INFO] Tamanho do banco: ${totalMB} MB (${pages} páginas × ${size} bytes)\n`);

    // 5. Contagem de registros nas tabelas principais
    const stats = await db.execute(`
        SELECT 'vendas' as tabela, COUNT(*) as total FROM vendas
        UNION ALL SELECT 'tab_cliente', COUNT(*) FROM tab_cliente
        UNION ALL SELECT 'tab_produto', COUNT(*) FROM tab_produto
        UNION ALL SELECT 'tab_representante', COUNT(*) FROM tab_representante
    `);
    console.log('[INFO] Tabelas principais:');
    for (const row of stats.rows) {
        const tabela = row.tabela ?? row[0];
        const total  = row.total ?? row[1];
        console.log(`       ${String(tabela).padEnd(20)} ${String(total).padStart(8)} registros`);
    }

    const fim = new Date();
    console.log('\n=========================================================');
    console.log(` Concluído em ${fim - inicio}ms`);
    console.log(` Fim: ${fim.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    console.log('=========================================================');
}

main().catch(err => {
    console.error('\nErro fatal:', err.message);
    process.exit(1);
});
