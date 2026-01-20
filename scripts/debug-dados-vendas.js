#!/usr/bin/env node

/**
 * Debug: Analisar formato dos dados de vendas
 */

import { createClient } from '@libsql/client';

const db = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN
});

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 DEBUG: Análise de Dados de Vendas');
console.log('═══════════════════════════════════════════════════════\n');

async function debugar() {
    try {
        // 1. Verificar formato do campo emissao
        console.log('1️⃣  Formato do campo "emissao":');
        const amostra = await db.execute(`
            SELECT emissao
            FROM vendas
            WHERE emissao != ''
            LIMIT 5
        `);
        amostra.rows.forEach((row, i) => {
            console.log(`   ${i + 1}. "${row.emissao}" (tipo: ${typeof row.emissao})`);
        });

        // 2. Data mais recente
        console.log('\n2️⃣  Data mais recente:');
        const maxData = await db.execute(`
            SELECT MAX(emissao) as max_emissao
            FROM vendas
            WHERE emissao != ''
        `);
        console.log(`   ${maxData.rows[0].max_emissao}`);

        // 3. Data mais antiga
        console.log('\n3️⃣  Data mais antiga:');
        const minData = await db.execute(`
            SELECT MIN(emissao) as min_emissao
            FROM vendas
            WHERE emissao != ''
        `);
        console.log(`   ${minData.rows[0].min_emissao}`);

        // 4. Testar strftime com 'now'
        console.log('\n4️⃣  Teste strftime com NOW:');
        const testeNow = await db.execute(`
            SELECT
                strftime('%Y-%m', 'now') as mes_now,
                strftime('%Y-%m-%d', 'now') as data_now
        `);
        console.log(`   Mês NOW: ${testeNow.rows[0].mes_now}`);
        console.log(`   Data NOW: ${testeNow.rows[0].data_now}`);

        // 5. Testar query do mês atual
        console.log('\n5️⃣  Query do mês atual (com NOW):');
        const mesAtual = await db.execute(`
            SELECT COUNT(*) as total
            FROM vendas
            WHERE strftime('%Y-%m', emissao) = strftime('%Y-%m', 'now')
        `);
        console.log(`   Registros encontrados: ${mesAtual.rows[0].total}`);

        // 6. Testar query do último mês disponível
        console.log('\n6️⃣  Query do último mês disponível:');
        const ultimoMes = await db.execute(`
            SELECT
                strftime('%Y-%m', MAX(emissao)) as ultimo_mes_disponivel,
                COUNT(*) as total
            FROM vendas
            WHERE emissao != ''
        `);
        console.log(`   Último mês: ${ultimoMes.rows[0].ultimo_mes_disponivel}`);

        const registrosUltimoMes = await db.execute(`
            SELECT COUNT(*) as total
            FROM vendas
            WHERE strftime('%Y-%m', emissao) = ?
        `, [ultimoMes.rows[0].ultimo_mes_disponivel]);
        console.log(`   Registros: ${registrosUltimoMes.rows[0].total}`);

        // 7. Distribuição por mês
        console.log('\n7️⃣  Distribuição de vendas por mês (últimos 6 meses):');
        const distribuicao = await db.execute(`
            SELECT
                strftime('%Y-%m', emissao) as mes,
                COUNT(*) as total,
                SUM(valor_liquido) as valor_total
            FROM vendas
            WHERE emissao != ''
            GROUP BY mes
            ORDER BY mes DESC
            LIMIT 6
        `);
        distribuicao.rows.forEach(row => {
            console.log(`   ${row.mes}: ${row.total} vendas (R$ ${Number(row.valor_total).toFixed(2)})`);
        });

        // 8. Testar query com período dinâmico
        console.log('\n8️⃣  Teste de período dinâmico (primeiro ao último dia do mês):');
        const periodoTest = await db.execute(`
            SELECT
                date('now', 'start of month') as primeiro_dia,
                date('now', 'start of month', '+1 month', '-1 day') as ultimo_dia
        `);
        console.log(`   Primeiro dia: ${periodoTest.rows[0].primeiro_dia}`);
        console.log(`   Último dia: ${periodoTest.rows[0].ultimo_dia}`);

        const testePeriodo = await db.execute(`
            SELECT COUNT(*) as total
            FROM vendas
            WHERE emissao >= date('now', 'start of month')
              AND emissao <= date('now', 'start of month', '+1 month', '-1 day')
        `);
        console.log(`   Registros no período: ${testePeriodo.rows[0].total}`);

    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error(error);
    } finally {
        await db.close();
    }
}

debugar();
