/**
 * atualizar-filtros-lookup.js
 *
 * Recarrega as tabelas de lookup de filtros no Turso.
 * Executa DELETE + INSERT atômico para cada tabela, garantindo que os
 * dashboards sempre encontrem dados consistentes.
 *
 * Executado pelo GitHub Actions toda segunda-feira às 12h (BRT).
 * Pode ser acionado manualmente com: node scripts/atualizar-filtros-lookup.js
 *
 * Variáveis de ambiente necessárias:
 *   TURSO_URL   – URL do banco Turso
 *   TURSO_TOKEN – Token de autenticação Turso
 */

import { createClient } from '@libsql/client';

// ---------------------------------------------------------------------------
// Conexão com o banco
// ---------------------------------------------------------------------------
const db = createClient({
    url:       process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN
});

// ---------------------------------------------------------------------------
// Definição das tabelas e seus respectivos SELECTs de origem
// ---------------------------------------------------------------------------
const TABELAS = [
    {
        nome:      'lkp_localidades',
        descricao: 'Rotas / sub-rotas / cidades (tab_cliente)',
        colunas:   'rota, sub_rota, cidade',
        select:    `SELECT DISTINCT rota, sub_rota, cidade
                    FROM tab_cliente
                    WHERE rota IS NOT NULL`
    },
    {
        nome:      'lkp_representantes',
        descricao: 'Representantes e supervisores (tab_representante)',
        colunas:   'representante, desc_representante, rep_supervisor',
        select:    `SELECT DISTINCT representante, desc_representante, rep_supervisor
                    FROM tab_representante
                    WHERE representante IS NOT NULL`
    },
    {
        nome:      'lkp_cidades_regiao',
        descricao: 'Cidades por região – JOIN vendas × tab_cliente',
        colunas:   'cidade, rota, sub_rota',
        select:    `SELECT DISTINCT v.cidade, c.rota, c.sub_rota
                    FROM vendas v
                    LEFT JOIN tab_cliente c ON v.cliente = c.cliente
                    WHERE v.cidade IS NOT NULL`
    },
    {
        nome:      'lkp_cidades_equipe',
        descricao: 'Cidades por equipe – JOIN vendas × tab_representante',
        colunas:   'cidade, representante, rep_supervisor',
        select:    `SELECT DISTINCT v.cidade, r.representante, r.rep_supervisor
                    FROM vendas v
                    LEFT JOIN tab_representante r ON v.representante = r.representante
                    WHERE v.cidade IS NOT NULL`
    },
    {
        nome:      'lkp_clientes',
        descricao: 'Clientes com grupo e cidade (tab_cliente)',
        colunas:   'cliente, nome, grupo_desc, cidade',
        select:    `SELECT DISTINCT cliente, nome, grupo_desc, cidade
                    FROM tab_cliente
                    WHERE cliente IS NOT NULL`
    },
    {
        nome:      'lkp_produtos',
        descricao: 'Produtos com família e origem (tab_produto)',
        colunas:   'produto, desc_produto, desc_familia, desc_origem',
        select:    `SELECT DISTINCT produto, desc_produto, desc_familia, desc_origem
                    FROM tab_produto
                    WHERE produto IS NOT NULL`
    }
];

// ---------------------------------------------------------------------------
// Função de atualização de uma tabela (DELETE + INSERT sequencial)
// ---------------------------------------------------------------------------
async function atualizarTabela(tabela) {
    await db.execute(`DELETE FROM ${tabela.nome}`);
    await db.execute(`INSERT INTO ${tabela.nome} (${tabela.colunas}) ${tabela.select}`);

    const result = await db.execute(`SELECT COUNT(*) AS total FROM ${tabela.nome}`);
    return Number(result.rows[0].total);
}

// ---------------------------------------------------------------------------
// Entrada principal
// ---------------------------------------------------------------------------
async function main() {
    const inicio = new Date();
    console.log('=========================================================');
    console.log(' Atualização das Tabelas de Lookup de Filtros');
    console.log(`  Início: ${inicio.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    console.log('=========================================================\n');

    let erros = 0;

    for (const tabela of TABELAS) {
        try {
            process.stdout.write(`[ ? ] ${tabela.nome.padEnd(22)} ${tabela.descricao}\r`);
            const total = await atualizarTabela(tabela);
            console.log(`[OK]  ${tabela.nome.padEnd(22)} ${total.toString().padStart(6)} registros`);
        } catch (err) {
            console.log(`[ERR] ${tabela.nome.padEnd(22)} ${err.message}`);
            erros++;
        }
    }

    const fim = new Date();
    const duracaoMs = fim - inicio;

    console.log('\n---------------------------------------------------------');
    if (erros === 0) {
        console.log(` Concluido com sucesso em ${duracaoMs}ms`);
    } else {
        console.log(` Concluido com ${erros} erro(s) em ${duracaoMs}ms`);
    }
    console.log(`  Fim: ${fim.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    console.log('=========================================================');

    if (erros > 0) process.exit(1);
}

main().catch(err => {
    console.error('\nErro fatal:', err.message);
    process.exit(1);
});
