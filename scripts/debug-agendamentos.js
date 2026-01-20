#!/usr/bin/env node

/**
 * Script de DEBUG para Agendamentos
 * Mostra tudo o que está acontecendo no processamento
 */

import { createClient } from '@libsql/client';

const db = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN
});

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 SCRIPT DE DEBUG - AGENDAMENTOS');
console.log('═══════════════════════════════════════════════════════\n');

// 1. HORA E DIA ATUAL
const agora = new Date();
const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
const diaAtual = dias[agora.getDay()];
const horaAtual = String(agora.getHours()).padStart(2, '0') + ':00';
const isDiaUtil = agora.getDay() >= 1 && agora.getDay() <= 5;

console.log('📅 DATA E HORA ATUAL:');
console.log(`   Data completa: ${agora.toISOString()}`);
console.log(`   Dia da semana: ${diaAtual} (${agora.getDay()})`);
console.log(`   Hora arredondada: ${horaAtual}`);
console.log(`   É dia útil? ${isDiaUtil ? 'SIM' : 'NÃO'}\n`);

// 2. TODOS OS AGENDAMENTOS NO BANCO
console.log('📊 TODOS OS AGENDAMENTOS NO BANCO:');
console.log('─────────────────────────────────────────────────────');
const todosResult = await db.execute('SELECT * FROM agendamentos_relatorios ORDER BY id');
console.log(`Total de agendamentos no banco: ${todosResult.rows.length}\n`);

if (todosResult.rows.length === 0) {
    console.log('❌ PROBLEMA ENCONTRADO: Nenhum agendamento no banco!');
    console.log('   Solução: Crie agendamentos na interface web.\n');
} else {
    todosResult.rows.forEach((agend, index) => {
        console.log(`Agendamento ${index + 1}:`);
        console.log(`   ID: ${agend.id}`);
        console.log(`   Nome: ${agend.nome_agendamento}`);
        console.log(`   Ativo: ${agend.ativo} ${agend.ativo === 1 ? '✅' : '❌ INATIVO'}`);
        console.log(`   Dashboard: ${agend.dashboard}`);
        console.log(`   Dia: ${agend.dia_semana}`);
        console.log(`   Hora: ${agend.hora}`);
        console.log(`   Emails: ${agend.emails_destinatarios}`);
        console.log(`   Criado em: ${agend.criado_em}`);
        console.log(`   Última execução: ${agend.ultima_execucao || 'Nunca'}`);
        console.log('');
    });
}

// 3. AGENDAMENTOS ATIVOS
console.log('✅ AGENDAMENTOS ATIVOS (ativo = 1):');
console.log('─────────────────────────────────────────────────────');
const ativosResult = await db.execute('SELECT * FROM agendamentos_relatorios WHERE ativo = 1');
console.log(`Total de agendamentos ativos: ${ativosResult.rows.length}\n`);

if (ativosResult.rows.length === 0) {
    console.log('❌ PROBLEMA ENCONTRADO: Nenhum agendamento ativo!');
    console.log('   Solução: Ative os agendamentos na interface (botão ▶️ Ativar).\n');
}

// 4. QUERY EXATA QUE O SCRIPT USA
console.log('🔍 TESTANDO QUERY EXATA DO SCRIPT:');
console.log('─────────────────────────────────────────────────────');
console.log('Procurando agendamentos com:');
console.log(`   Dia: "${diaAtual}" OU "todos-dias" ${isDiaUtil ? 'OU "dia-util"' : ''}`);
console.log(`   Hora: "${horaAtual}"`);
console.log('');

const whereConditions = [];
const params = [];

// Dia da semana
whereConditions.push('(dia_semana = ? OR dia_semana = ?)');
params.push(diaAtual);
params.push('todos-dias');

// Dia útil
if (isDiaUtil) {
    whereConditions.push('dia_semana = ?');
    params.push('dia-util');
}

const sql = `
    SELECT * FROM agendamentos_relatorios
    WHERE ativo = 1
    AND (${whereConditions.join(' OR ')})
    AND hora = ?
`;
params.push(horaAtual);

console.log('SQL gerado:');
console.log(sql);
console.log('\nParâmetros:');
console.log(params);
console.log('');

const result = await db.execute(sql, params);

console.log(`📋 Resultado: ${result.rows.length} agendamento(s) encontrado(s)\n`);

if (result.rows.length === 0) {
    console.log('❌ PROBLEMA ENCONTRADO: Nenhum agendamento encontrado!\n');
    console.log('🔍 POSSÍVEIS CAUSAS:');
    console.log('');

    // Verificar se existe algum agendamento para a hora atual (ignorando dia)
    const porHoraResult = await db.execute(
        'SELECT * FROM agendamentos_relatorios WHERE ativo = 1 AND hora = ?',
        [horaAtual]
    );

    if (porHoraResult.rows.length > 0) {
        console.log(`   ⚠️ Existem ${porHoraResult.rows.length} agendamento(s) para ${horaAtual}, mas não para hoje (${diaAtual})`);
        console.log('');
        porHoraResult.rows.forEach(a => {
            console.log(`      - "${a.nome_agendamento}": dia_semana = "${a.dia_semana}"`);
        });
        console.log('');
        console.log('   💡 SOLUÇÃO: Edite os agendamentos e ajuste o "Dia da Semana"');
        console.log('');
    } else {
        // Verificar se existe algum para este dia (ignorando hora)
        const porDiaResult = await db.execute(
            'SELECT * FROM agendamentos_relatorios WHERE ativo = 1 AND (dia_semana = ? OR dia_semana = ?)',
            [diaAtual, 'todos-dias']
        );

        if (porDiaResult.rows.length > 0) {
            console.log(`   ⚠️ Existem ${porDiaResult.rows.length} agendamento(s) para ${diaAtual}, mas não para ${horaAtual}`);
            console.log('');
            porDiaResult.rows.forEach(a => {
                console.log(`      - "${a.nome_agendamento}": hora = "${a.hora}"`);
            });
            console.log('');
            console.log('   💡 SOLUÇÃO: Edite os agendamentos e ajuste a "Hora"');
            console.log('   ⚠️ LEMBRE-SE: A hora deve estar em UTC!');
            console.log(`   ⚠️ Hora atual UTC: ${horaAtual}`);
            console.log(`   ⚠️ No Brasil: ${horaAtual} UTC = ${String((parseInt(horaAtual) - 3 + 24) % 24).padStart(2, '0')}:00 BRT`);
            console.log('');
        } else {
            console.log('   ❌ Não existem agendamentos ativos para hoje nem para esta hora');
            console.log('   💡 SOLUÇÃO: Verifique se os agendamentos foram criados corretamente');
            console.log('');
        }
    }
} else {
    console.log('✅ SUCESSO: Agendamentos encontrados!\n');
    result.rows.forEach((agend, index) => {
        console.log(`${index + 1}. ${agend.nome_agendamento}`);
        console.log(`   Dashboard: ${agend.dashboard}`);
        console.log(`   Emails: ${agend.emails_destinatarios}`);
        console.log('');
    });
}

console.log('═══════════════════════════════════════════════════════');
console.log('🎯 FIM DO DEBUG');
console.log('═══════════════════════════════════════════════════════');
