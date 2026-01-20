#!/usr/bin/env node

/**
 * Debug Completo de Agendamento
 * Simula o processamento completo de um agendamento para identificar problemas
 */

import { createClient } from '@libsql/client';

const db = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN
});

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 DEBUG COMPLETO DE AGENDAMENTO');
console.log('═══════════════════════════════════════════════════════\n');

// =====================================================
// FUNÇÕES DE PERÍODO
// =====================================================

function getPeriodCondition(period) {
    switch(period) {
        case 'mes-atual':
            return "emissao >= date('now', 'start of month') AND emissao <= date('now', 'start of month', '+1 month', '-1 day')";
        case 'mes-anterior':
            return "emissao >= date('now', 'start of month', '-1 month') AND emissao < date('now', 'start of month')";
        case 'ultimos-30-dias':
            return "emissao >= date('now', '-30 days')";
        case 'ultimos-7-dias':
            return "emissao >= date('now', '-7 days')";
        case 'ano-atual':
            return "strftime('%Y', emissao) = strftime('%Y', 'now')";
        case 'trimestre-atual':
            return "emissao >= date('now', 'start of month', '-' || ((CAST(strftime('%m', 'now') AS INTEGER) - 1) % 3) || ' months') AND emissao < date('now', 'start of month', '+' || (3 - ((CAST(strftime('%m', 'now') AS INTEGER) - 1) % 3)) || ' months')";
        default:
            return "emissao >= date('now', 'start of month') AND emissao <= date('now', 'start of month', '+1 month', '-1 day')";
    }
}

// =====================================================
// FUNÇÕES DE BUSCA (CÓPIA DO SCRIPT ORIGINAL)
// =====================================================

async function buscarProdutosParados(filtros) {
    console.log('   🔍 Função: buscarProdutosParados');
    console.log('   📋 Filtros recebidos:', JSON.stringify(filtros));

    let sql = `
        SELECT
            sku_produto as produto,
            desc_produto,
            categoria_produto as desc_familia,
            rep_supervisor,
            qtd_semanas_parado,
            nivel_risco,
            ultima_venda,
            valor_medio_perdido
        FROM vw_produtos_parados
        WHERE 1=1
    `;
    const params = [];

    if (filtros.supervisor) {
        sql += ' AND rep_supervisor = ?';
        params.push(filtros.supervisor);
        console.log(`   ✓ Filtro: supervisor = "${filtros.supervisor}"`);
    }

    if (filtros.nivel_risco) {
        sql += ' AND nivel_risco = ?';
        params.push(filtros.nivel_risco);
        console.log(`   ✓ Filtro: nivel_risco = "${filtros.nivel_risco}"`);
    }

    if (filtros.familia) {
        sql += ' AND categoria_produto = ?';
        params.push(filtros.familia);
        console.log(`   ✓ Filtro: familia = "${filtros.familia}"`);
    }

    sql += ' ORDER BY qtd_semanas_parado DESC LIMIT 100';

    console.log('   📝 SQL:', sql.replace(/\s+/g, ' ').trim());
    console.log('   📝 Params:', params);

    const result = await db.execute(sql, params);
    console.log(`   ✅ Registros encontrados: ${result.rows.length}`);

    if (result.rows.length > 0) {
        console.log('   📊 Exemplo de registro:');
        console.log('      ', JSON.stringify(result.rows[0], null, 2).replace(/\n/g, '\n       '));
    }

    return {
        colunas: ['Produto', 'Descrição', 'Família', 'Supervisor', 'Semanas Parado', 'Nível Risco', 'Última Venda', 'Valor Médio'],
        dados: result.rows.map(row => [
            row.produto,
            row.desc_produto,
            row.desc_familia,
            row.rep_supervisor,
            row.qtd_semanas_parado,
            row.nivel_risco,
            row.ultima_venda ? new Date(row.ultima_venda).toLocaleDateString('pt-BR') : 'N/A',
            `R$ ${Number(row.valor_medio_perdido).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
        ])
    };
}

async function buscarVendasRegiao(filtros, periodo = 'mes-atual') {
    console.log('   🔍 Função: buscarVendasRegiao');
    console.log('   📋 Filtros recebidos:', JSON.stringify(filtros));
    console.log('   📅 Período:', periodo);

    const periodCondition = getPeriodCondition(periodo);
    console.log('   📅 Condição de período:', periodCondition);

    let sql;
    const params = [];

    if (filtros.rota) {
        sql = `
            SELECT
                c.rota,
                COUNT(DISTINCT v.cliente) as total_clientes,
                SUM(v.valor_liquido) as total_vendas,
                COUNT(DISTINCT v.representante) as total_reps
            FROM vendas v
            LEFT JOIN tab_cliente c ON v.cliente = c.cliente
            WHERE ${periodCondition.replace(/emissao/g, 'v.emissao')}
              AND c.rota = ?
        `;
        params.push(filtros.rota);
        console.log(`   ✓ Filtro: rota = "${filtros.rota}"`);

        if (filtros.estado) {
            sql += ' AND c.estado = ?';
            params.push(filtros.estado);
            console.log(`   ✓ Filtro: estado = "${filtros.estado}"`);
        }

        sql += ' GROUP BY c.rota ORDER BY total_vendas DESC';
    } else {
        sql = `
            SELECT
                v.uf as rota,
                COUNT(DISTINCT v.cliente) as total_clientes,
                SUM(v.valor_liquido) as total_vendas,
                COUNT(DISTINCT v.representante) as total_reps
            FROM vendas v
            WHERE ${periodCondition.replace(/emissao/g, 'v.emissao')}
        `;

        if (filtros.estado) {
            sql += ' AND v.uf = ?';
            params.push(filtros.estado);
            console.log(`   ✓ Filtro: estado (uf) = "${filtros.estado}"`);
        }

        sql += ' GROUP BY v.uf ORDER BY total_vendas DESC';
    }

    console.log('   📝 SQL:', sql.replace(/\s+/g, ' ').trim());
    console.log('   📝 Params:', params);

    const result = await db.execute(sql, params);
    console.log(`   ✅ Registros encontrados: ${result.rows.length}`);

    if (result.rows.length > 0) {
        console.log('   📊 Exemplo de registro:');
        console.log('      ', JSON.stringify(result.rows[0], null, 2).replace(/\n/g, '\n       '));
    }

    return {
        colunas: ['Região/Rota', 'Total Clientes', 'Total Vendas', 'Representantes'],
        dados: result.rows.map(row => [
            row.rota,
            row.total_clientes,
            `R$ ${Number(row.total_vendas).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
            row.total_reps
        ])
    };
}

// =====================================================
// ANÁLISE DE AGENDAMENTO
// =====================================================

async function analisarAgendamento(agendamentoId) {
    console.log('\n┌─────────────────────────────────────────────────────┐');
    console.log('│ 📧 ANÁLISE DE AGENDAMENTO');
    console.log('└─────────────────────────────────────────────────────┘\n');

    try {
        // 1. Buscar agendamento
        console.log('1️⃣  Buscando agendamento no banco...');
        const result = await db.execute(
            'SELECT * FROM agendamentos_relatorios WHERE id = ?',
            [agendamentoId]
        );

        if (result.rows.length === 0) {
            console.log(`   ❌ Agendamento ID ${agendamentoId} não encontrado`);
            return;
        }

        const agend = result.rows[0];
        console.log('   ✅ Agendamento encontrado:');
        console.log('      Nome:', agend.nome_agendamento);
        console.log('      Dashboard:', agend.dashboard);
        console.log('      Período:', agend.periodo || '(não definido)');
        console.log('      Filtros JSON:', agend.filtros_json || '(vazio)');
        console.log('      Emails:', agend.emails_destinatarios);

        // 2. Parsear filtros
        console.log('\n2️⃣  Parseando filtros...');
        let filtros = {};
        try {
            if (agend.filtros_json && agend.filtros_json !== '') {
                filtros = JSON.parse(agend.filtros_json);
                console.log('   ✅ Filtros parseados:', JSON.stringify(filtros, null, 2));
            } else {
                console.log('   ⚠️  Nenhum filtro configurado');
            }
        } catch (e) {
            console.log('   ❌ Erro ao parsear filtros:', e.message);
            console.log('      Conteúdo:', agend.filtros_json);
        }

        // 3. Executar busca
        console.log('\n3️⃣  Executando busca de dados...\n');
        let dados;

        switch(agend.dashboard) {
            case 'produtos-parados':
                dados = await buscarProdutosParados(filtros);
                break;
            case 'vendas-regiao':
                dados = await buscarVendasRegiao(filtros, agend.periodo);
                break;
            default:
                console.log(`   ⚠️  Dashboard "${agend.dashboard}" não implementado neste debug`);
                return;
        }

        // 4. Resultado
        console.log('\n4️⃣  Resultado da busca:');
        console.log('   Colunas:', dados.colunas.join(', '));
        console.log('   Total de linhas:', dados.dados.length);

        if (dados.dados.length === 0) {
            console.log('\n   ⚠️  NENHUM DADO ENCONTRADO!');
            console.log('   ');
            console.log('   Possíveis causas:');
            console.log('   1. Filtros muito restritivos');
            console.log('   2. Período sem dados');
            console.log('   3. Dados não existem no banco para essa combinação');
            console.log('   ');
            console.log('   💡 Sugestão: Execute o workflow "Debug Dados Vendas" para ver períodos disponíveis');
        } else {
            console.log('\n   ✅ DADOS ENCONTRADOS!');
            console.log('   ');
            console.log('   Primeiras 3 linhas:');
            dados.dados.slice(0, 3).forEach((linha, i) => {
                console.log(`   ${i + 1}. ${linha.join(' | ')}`);
            });
        }

    } catch (error) {
        console.log('\n❌ ERRO:', error.message);
        console.log('Stack:', error.stack);
    } finally {
        await db.close();
    }
}

// =====================================================
// MAIN
// =====================================================

async function main() {
    // Listar todos os agendamentos
    console.log('📋 Agendamentos disponíveis:\n');
    const agendamentos = await db.execute('SELECT id, nome_agendamento, dashboard, ativo FROM agendamentos_relatorios ORDER BY id');

    if (agendamentos.rows.length === 0) {
        console.log('   ⚠️  Nenhum agendamento encontrado');
        await db.close();
        return;
    }

    agendamentos.rows.forEach(ag => {
        const status = ag.ativo ? '✅' : '❌';
        console.log(`   ${status} ID ${ag.id}: ${ag.nome_agendamento} (${ag.dashboard})`);
    });

    // Analisar primeiro agendamento ativo
    const primeiroAtivo = agendamentos.rows.find(ag => ag.ativo === 1);
    if (primeiroAtivo) {
        await analisarAgendamento(primeiroAtivo.id);
    } else {
        console.log('\n⚠️  Nenhum agendamento ativo encontrado');
        await db.close();
    }
}

main();
