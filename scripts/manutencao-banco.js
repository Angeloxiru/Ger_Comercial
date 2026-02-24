/**
 * manutencao-banco.js
 *
 * Executa manutenção no banco Turso via @libsql/client.
 * - ANALYZE: atualiza estatísticas para o otimizador de queries
 * - PRAGMA integrity_check: verifica integridade do banco
 *
 * O dashboard web do Turso NÃO suporta ANALYZE — este script
 * permite executá-lo via GitHub Actions (workflow_dispatch).
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

    // 1. ANALYZE — atualiza estatísticas dos índices
    console.log('[...] Executando ANALYZE...');
    await db.execute('ANALYZE');
    console.log('[OK]  ANALYZE concluído — estatísticas atualizadas\n');

    // 2. Integrity check
    console.log('[...] Verificando integridade do banco...');
    const integrity = await db.execute('PRAGMA integrity_check');
    const resultado = integrity.rows[0]?.integrity_check ?? integrity.rows[0]?.[0] ?? 'desconhecido';
    if (resultado === 'ok') {
        console.log('[OK]  Integridade verificada — banco íntegro\n');
    } else {
        console.log(`[WARN] Resultado do integrity_check: ${resultado}\n`);
    }

    // 3. Estatísticas de tamanho
    const pageCount = await db.execute('PRAGMA page_count');
    const pageSize  = await db.execute('PRAGMA page_size');
    const pages = Number(pageCount.rows[0]?.page_count ?? pageCount.rows[0]?.[0] ?? 0);
    const size  = Number(pageSize.rows[0]?.page_size ?? pageSize.rows[0]?.[0] ?? 0);
    const totalMB = ((pages * size) / (1024 * 1024)).toFixed(2);
    console.log(`[INFO] Tamanho do banco: ${totalMB} MB (${pages} páginas × ${size} bytes)\n`);

    // 4. Contagem de registros
    const stats = await db.execute(`
        SELECT 'vendas' as tabela, COUNT(*) as total FROM vendas
        UNION ALL SELECT 'tab_cliente', COUNT(*) FROM tab_cliente
        UNION ALL SELECT 'tab_produto', COUNT(*) FROM tab_produto
        UNION ALL SELECT 'tab_representante', COUNT(*) FROM tab_representante
    `);
    console.log('[INFO] Registros por tabela:');
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
