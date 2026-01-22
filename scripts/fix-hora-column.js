#!/usr/bin/env node

/**
 * Script para investigar e corrigir o campo hora
 * na tabela agendamentos_relatorios
 */

import { createClient } from '@libsql/client';

const db = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN
});

async function investigarHora() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 INVESTIGANDO CAMPO HORA');
    console.log('═══════════════════════════════════════════════════════\n');

    // 1. Ver o schema da tabela
    console.log('📋 SCHEMA DA TABELA:');
    const schema = await db.execute(`
        SELECT sql FROM sqlite_master
        WHERE type='table' AND name='agendamentos_relatorios'
    `);
    console.log(schema.rows[0]?.sql || 'Schema não encontrado');
    console.log('');

    // 2. Ver todos os valores de hora com detalhes
    console.log('🔍 VALORES DE HORA NO BANCO:');
    const result = await db.execute(`
        SELECT
            id,
            nome_agendamento,
            hora,
            typeof(hora) as tipo_hora,
            length(hora) as tamanho_hora,
            quote(hora) as hora_quoted
        FROM agendamentos_relatorios
    `);

    result.rows.forEach(row => {
        console.log(`\nID ${row.id}: ${row.nome_agendamento}`);
        console.log(`   hora = ${row.hora}`);
        console.log(`   tipo = ${row.tipo_hora}`);
        console.log(`   tamanho = ${row.tamanho_hora}`);
        console.log(`   quoted = ${row.hora_quoted}`);

        // Verificar se tem espaços
        if (row.hora) {
            const horaStr = String(row.hora);
            console.log(`   tem espaços no início? ${horaStr !== horaStr.trimStart() ? 'SIM ❌' : 'NÃO ✅'}`);
            console.log(`   tem espaços no fim? ${horaStr !== horaStr.trimEnd() ? 'SIM ❌' : 'NÃO ✅'}`);
            console.log(`   bytes: [${Array.from(horaStr).map(c => c.charCodeAt(0)).join(', ')}]`);
        }
    });

    console.log('\n');

    // 3. Testar query com TRIM
    console.log('🧪 TESTANDO QUERY COM TRIM:');
    const testTrim = await db.execute(`
        SELECT id, nome_agendamento, hora, trim(hora) as hora_trimmed
        FROM agendamentos_relatorios
        WHERE trim(hora) = '18:00'
    `);
    console.log(`   Resultados com trim(hora) = '18:00': ${testTrim.rows.length}`);
    testTrim.rows.forEach(row => {
        console.log(`      - ID ${row.id}: "${row.hora}" → "${row.hora_trimmed}"`);
    });

    console.log('\n');

    // 4. Testar query com CAST
    console.log('🧪 TESTANDO QUERY COM CAST:');
    const testCast = await db.execute(`
        SELECT id, nome_agendamento, hora, CAST(hora AS TEXT) as hora_text
        FROM agendamentos_relatorios
        WHERE CAST(hora AS TEXT) = '18:00'
    `);
    console.log(`   Resultados com CAST(hora AS TEXT) = '18:00': ${testCast.rows.length}`);

    console.log('\n');

    // 5. Propor solução
    console.log('💡 SOLUÇÃO PROPOSTA:');
    console.log('   Se o problema for espaços: UPDATE agendamentos_relatorios SET hora = trim(hora)');
    console.log('   Se o problema for tipo: Recriar coluna como TEXT');
    console.log('');

    db.close();
}

investigarHora().catch(console.error);
