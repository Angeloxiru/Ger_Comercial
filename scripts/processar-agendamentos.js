#!/usr/bin/env node

/**
 * Processador de Agendamentos de Relatórios
 *
 * Este script é executado pelo GitHub Actions a cada hora
 * para processar e enviar relatórios agendados por e-mail
 */

import { createClient } from '@libsql/client';
import nodemailer from 'nodemailer';

// =====================================================
// CONFIGURAÇÃO
// =====================================================

const db = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN
});

// Configurar transporter baseado no serviço disponível
let transporter;
let emailFrom;

if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    // Opção 1: Gmail (RECOMENDADO - Gratuito e Simples)
    console.log('📧 Usando Gmail para envio de e-mails');
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
    emailFrom = process.env.GMAIL_USER;
} else if (process.env.SENDGRID_API_KEY) {
    // Opção 2: SendGrid
    console.log('📧 Usando SendGrid para envio de e-mails');
    transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
        }
    });
    emailFrom = process.env.EMAIL_FROM || 'sistema@germani.com';
} else {
    console.error('❌ ERRO: Nenhum serviço de e-mail configurado!');
    console.error('   Configure GMAIL_USER + GMAIL_APP_PASSWORD ou SENDGRID_API_KEY');
    process.exit(1);
}

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function getDiaAtual() {
    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    return dias[new Date().getDay()];
}

function getHoraAtual() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    // Sempre retorna hora cheia (:00) porque o workflow roda de hora em hora
    return `${hours}:00`;
}

function isDiaUtil() {
    const day = new Date().getDay();
    return day >= 1 && day <= 5; // Segunda a Sexta
}

function formatarData(date) {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// =====================================================
// BUSCAR DADOS DOS DASHBOARDS
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
            // Fallback para mês atual
            return "emissao >= date('now', 'start of month') AND emissao <= date('now', 'start of month', '+1 month', '-1 day')";
    }
}

async function buscarDadosDashboard(dashboard, filtros, periodo) {
    console.log(`    📊 Buscando dados do dashboard: ${dashboard}`);
    console.log(`    📅 Período: ${periodo || 'mes-atual'}`);

    switch(dashboard) {
        case 'produtos-parados':
            return await buscarProdutosParados(filtros);
        case 'vendas-regiao':
            return await buscarVendasRegiao(filtros, periodo);
        case 'vendas-equipe':
            return await buscarVendasEquipe(filtros, periodo);
        case 'performance-clientes':
            return await buscarPerformanceClientes(filtros, periodo);
        case 'ranking-clientes':
            return await buscarRankingClientes(filtros, periodo);
        case 'analise-produtos':
            return await buscarAnaliseProdutos(filtros, periodo);
        case 'clientes-semcompras':
            return await buscarClientesSemCompras(filtros);
        default:
            throw new Error(`Dashboard não suportado: ${dashboard}`);
    }
}

async function buscarProdutosParados(filtros) {
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
    }

    if (filtros.nivel_risco) {
        sql += ' AND nivel_risco = ?';
        params.push(filtros.nivel_risco);
    }

    if (filtros.familia) {
        sql += ' AND categoria_produto = ?';
        params.push(filtros.familia);
    }

    sql += ' ORDER BY qtd_semanas_parado DESC LIMIT 100';

    const result = await db.execute(sql, params);
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
    const periodCondition = getPeriodCondition(periodo);

    // Se filtrar por rota, precisa fazer JOIN com tab_cliente
    // Senão, pode usar os dados direto da tabela vendas
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

        if (filtros.estado) {
            sql += ' AND c.estado = ?';
            params.push(filtros.estado);
        }

        sql += ' GROUP BY c.rota ORDER BY total_vendas DESC';
    } else {
        // Agrupar por UF quando não tem filtro de rota
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
        }

        sql += ' GROUP BY v.uf ORDER BY total_vendas DESC';
    }

    const result = await db.execute(sql, params);
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

async function buscarVendasEquipe(filtros, periodo = 'mes-atual') {
    const periodCondition = getPeriodCondition(periodo);
    let sql = `
        SELECT
            v.representante,
            r.desc_representante,
            r.rep_supervisor,
            COUNT(DISTINCT v.cliente) as total_clientes,
            SUM(v.valor_liquido) as total_vendas
        FROM vendas v
        LEFT JOIN tab_representante r ON v.representante = r.representante
        WHERE ${periodCondition.replace(/emissao/g, 'v.emissao')}
    `;
    const params = [];

    if (filtros.supervisor) {
        sql += ' AND rep_supervisor = ?';
        params.push(filtros.supervisor);
    }

    if (filtros.representante) {
        sql += ' AND v.representante = ?';
        params.push(filtros.representante);
    }

    sql += ' GROUP BY v.representante ORDER BY total_vendas DESC';

    const result = await db.execute(sql, params);
    return {
        colunas: ['Representante', 'Nome', 'Supervisor', 'Clientes', 'Total Vendas'],
        dados: result.rows.map(row => [
            row.representante,
            row.desc_representante,
            row.rep_supervisor,
            row.total_clientes,
            `R$ ${Number(row.total_vendas).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
        ])
    };
}

async function buscarPerformanceClientes(filtros, periodo = 'mes-atual') {
    const periodCondition = getPeriodCondition(periodo);
    let sql = `
        SELECT
            c.cliente,
            c.nome,
            c.rota,
            COUNT(*) as total_pedidos,
            SUM(v.valor_liquido) as total_vendas
        FROM vendas v
        LEFT JOIN tab_cliente c ON v.cliente = c.cliente
        WHERE ${periodCondition.replace(/emissao/g, 'v.emissao')}
    `;
    const params = [];

    if (filtros.rota) {
        sql += ' AND c.rota = ?';
        params.push(filtros.rota);
    }

    if (filtros.grupo) {
        sql += ' AND c.grupo = ?';
        params.push(filtros.grupo);
    }

    sql += ' GROUP BY v.cliente ORDER BY total_vendas DESC LIMIT 50';

    const result = await db.execute(sql, params);
    return {
        colunas: ['Cliente', 'Nome', 'Rota', 'Pedidos', 'Total Vendas'],
        dados: result.rows.map(row => [
            row.cliente,
            row.nome,
            row.rota,
            row.total_pedidos,
            `R$ ${Number(row.total_vendas).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
        ])
    };
}

async function buscarRankingClientes(filtros, periodo = 'mes-atual') {
    const periodCondition = getPeriodCondition(periodo);
    let sql = `
        SELECT
            c.cliente,
            c.nome,
            c.rota,
            SUM(v.valor_liquido) as total_vendas,
            COUNT(*) as total_pedidos,
            AVG(v.valor_liquido) as ticket_medio
        FROM vendas v
        LEFT JOIN tab_cliente c ON v.cliente = c.cliente
        WHERE ${periodCondition.replace(/emissao/g, 'v.emissao')}
    `;
    const params = [];

    if (filtros.rota) {
        sql += ' AND c.rota = ?';
        params.push(filtros.rota);
    }

    sql += ' GROUP BY v.cliente ORDER BY total_vendas DESC LIMIT 30';

    const result = await db.execute(sql, params);
    return {
        colunas: ['Ranking', 'Cliente', 'Nome', 'Rota', 'Total Vendas', 'Pedidos', 'Ticket Médio'],
        dados: result.rows.map((row, index) => [
            index + 1,
            row.cliente,
            row.nome,
            row.rota,
            `R$ ${Number(row.total_vendas).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
            row.total_pedidos,
            `R$ ${Number(row.ticket_medio).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
        ])
    };
}

async function buscarAnaliseProdutos(filtros, periodo = 'mes-atual') {
    const periodCondition = getPeriodCondition(periodo);
    let sql = `
        SELECT
            p.produto,
            p.desc_produto,
            p.familia,
            p.desc_familia,
            COUNT(*) as total_vendas,
            SUM(v.qtde_faturada) as qtd_vendida,
            SUM(v.valor_liquido) as valor_total
        FROM vendas v
        LEFT JOIN tab_produto p ON v.produto = p.produto
        WHERE ${periodCondition.replace(/emissao/g, 'v.emissao')}
    `;
    const params = [];

    if (filtros.familia) {
        sql += ' AND p.familia = ?';
        params.push(filtros.familia);
    }

    if (filtros.origem) {
        sql += ' AND p.origem = ?';
        params.push(filtros.origem);
    }

    sql += ' GROUP BY v.produto ORDER BY valor_total DESC LIMIT 50';

    const result = await db.execute(sql, params);
    return {
        colunas: ['Produto', 'Descrição', 'Família', 'Vendas', 'Qtd Vendida', 'Valor Total'],
        dados: result.rows.map(row => [
            row.produto,
            row.desc_produto,
            row.desc_familia,
            row.total_vendas,
            row.qtd_vendida,
            `R$ ${Number(row.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
        ])
    };
}

async function buscarClientesSemCompras(filtros) {
    let sql = `
        SELECT
            c.cliente,
            c.nome,
            c.rota,
            MAX(v.emissao) as ultima_compra,
            julianday('now') - julianday(MAX(v.emissao)) as dias_sem_compra
        FROM tab_cliente c
        LEFT JOIN vendas v ON c.cliente = v.cliente
        WHERE c.sit_cliente = 'ATIVO'
    `;
    const params = [];

    if (filtros.rota) {
        sql += ' AND c.rota = ?';
        params.push(filtros.rota);
    }

    sql += `
        GROUP BY c.cliente
        HAVING dias_sem_compra > ${filtros.dias_sem_compra || 90}
        ORDER BY dias_sem_compra DESC
        LIMIT 50
    `;

    const result = await db.execute(sql, params);
    return {
        colunas: ['Cliente', 'Nome', 'Rota', 'Última Compra', 'Dias sem Compra'],
        dados: result.rows.map(row => [
            row.cliente,
            row.nome,
            row.rota,
            row.ultima_compra ? new Date(row.ultima_compra).toLocaleDateString('pt-BR') : 'Nunca',
            Math.round(row.dias_sem_compra)
        ])
    };
}

// =====================================================
// GERAÇÃO DO HTML DO EMAIL
// =====================================================

function gerarHTMLRelatorio(agendamento, dados) {
    const dashboardNames = {
        'produtos-parados': 'Produtos Parados',
        'vendas-regiao': 'Vendas por Região',
        'vendas-equipe': 'Vendas por Equipe',
        'performance-clientes': 'Performance de Clientes',
        'ranking-clientes': 'Ranking de Clientes',
        'analise-produtos': 'Análise de Produtos',
        'clientes-semcompras': 'Clientes sem Compras'
    };

    const dashboardName = dashboardNames[agendamento.dashboard] || agendamento.dashboard;

    // Gerar linhas da tabela
    let linhasHTML = '';
    if (dados.dados && dados.dados.length > 0) {
        dados.dados.forEach((linha, index) => {
            const bgColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
            linhasHTML += `
                <tr style="background-color: ${bgColor};">
                    ${linha.map(cell => `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${cell || '-'}</td>`).join('')}
                </tr>
            `;
        });
    } else {
        linhasHTML = `
            <tr>
                <td colspan="10" style="padding: 20px; text-align: center; color: #6c757d;">
                    Nenhum dado encontrado para os filtros aplicados
                </td>
            </tr>
        `;
    }

    // Gerar cabeçalho da tabela
    const cabecalhoHTML = dados.colunas && dados.colunas.length > 0
        ? dados.colunas.map(col => `<th style="background: #fc0303; color: white; padding: 12px; text-align: left;">${col}</th>`).join('')
        : '<th style="background: #fc0303; color: white; padding: 12px;">Dados</th>';

    // Filtros aplicados
    let filtrosHTML = '';
    if (agendamento.filtros_json) {
        try {
            const filtros = JSON.parse(agendamento.filtros_json);
            const filtrosArray = Object.entries(filtros).map(([key, value]) => `${key}: <strong>${value}</strong>`);
            if (filtrosArray.length > 0) {
                filtrosHTML = `
                    <div style="background: #e7f3ff; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <strong>🔍 Filtros Aplicados:</strong><br>
                        ${filtrosArray.join(', ')}
                    </div>
                `;
            }
        } catch (e) {
            console.error('Erro ao parsear filtros:', e);
        }
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${agendamento.nome_agendamento}</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
            <div style="max-width: 1200px; margin: 0 auto; background-color: white;">
                <!-- Cabeçalho -->
                <div style="background: #fc0303; color: white; padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">📊 ${agendamento.nome_agendamento}</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Dashboard: ${dashboardName}</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Gerado em: ${formatarData(new Date())}</p>
                </div>

                <!-- Conteúdo -->
                <div style="padding: 30px 20px;">
                    ${filtrosHTML}

                    <h2 style="color: #212529; font-size: 18px; margin-bottom: 15px;">
                        📋 Resumo
                    </h2>
                    <p style="color: #495057; margin-bottom: 20px;">
                        Total de registros: <strong>${dados.dados ? dados.dados.length : 0}</strong>
                    </p>

                    <!-- Tabela de Dados -->
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <thead>
                                <tr>
                                    ${cabecalhoHTML}
                                </tr>
                            </thead>
                            <tbody>
                                ${linhasHTML}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Rodapé -->
                <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 2px solid #e9ecef;">
                    <p style="margin: 0; color: #6c757d; font-size: 14px;">
                        © Germani Alimentos - Sistema Ger Comercial
                    </p>
                    <p style="margin: 10px 0 0 0;">
                        <a href="https://angeloxiru.github.io/Ger_Comercial/" style="color: #fc0303; text-decoration: none;">
                            🔗 Acessar sistema completo
                        </a>
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #868e96;">
                        Este é um e-mail automático. Não responda esta mensagem.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// =====================================================
// PROCESSAMENTO PRINCIPAL
// =====================================================

async function processarAgendamentos() {
    const agora = new Date();
    const diaAtual = getDiaAtual();
    const horaAtual = getHoraAtual();

    console.log('═══════════════════════════════════════════════════════');
    console.log(`🕐 Processador de Agendamentos de Relatórios`);
    console.log(`   Data/Hora: ${formatarData(agora)}`);
    console.log(`   Dia: ${diaAtual} | Hora: ${horaAtual}`);
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // Buscar agendamentos que devem rodar agora
        // NOVA ABORDAGEM: usar IN ao invés de múltiplos OR
        let diasBusca;

        if (isDiaUtil()) {
            // Dia útil: procura por dia específico, "todos-dias" OU "dia-util"
            diasBusca = [diaAtual, 'todos-dias', 'dia-util'];
        } else {
            // Fim de semana: procura por dia específico OU "todos-dias"
            diasBusca = [diaAtual, 'todos-dias'];
        }

        // Usar UNION para combinar resultados (mais confiável que OR com prepared statements)
        const queries = diasBusca.map(dia => ({
            sql: 'SELECT * FROM agendamentos_relatorios WHERE ativo = 1 AND dia_semana = ? AND hora = ?',
            args: [dia, horaAtual]
        }));

        // Executar todas as queries e combinar resultados
        const results = await db.batch(queries);

        // Combinar e remover duplicatas baseado no ID
        const agendamentosMap = new Map();
        results.forEach(result => {
            result.rows.forEach(agend => {
                if (!agendamentosMap.has(agend.id)) {
                    agendamentosMap.set(agend.id, agend);
                }
            });
        });

        const agendamentos = Array.from(agendamentosMap.values());

        console.log(`📋 Encontrados ${agendamentos.length} agendamento(s) para processar\n`);

        if (agendamentos.length === 0) {
            console.log('✅ Nenhum agendamento para processar neste horário\n');
            return;
        }

        for (const agend of agendamentos) {
            try {
                console.log(`┌─────────────────────────────────────────────────────┐`);
                console.log(`│ 📧 ${agend.nome_agendamento}`);
                console.log(`└─────────────────────────────────────────────────────┘`);

                // 1. Buscar dados do dashboard com filtros
                const filtros = agend.filtros_json ? JSON.parse(agend.filtros_json) : {};
                const periodo = agend.periodo || 'mes-atual';
                const dados = await buscarDadosDashboard(agend.dashboard, filtros, periodo);
                console.log(`    ✅ Dados carregados: ${dados.dados ? dados.dados.length : 0} registros`);

                // 2. Gerar HTML do relatório
                const htmlRelatorio = gerarHTMLRelatorio(agend, dados);
                console.log(`    ✅ Relatório HTML gerado`);

                // 3. Enviar email para cada destinatário
                const emails = JSON.parse(agend.emails_destinatarios);
                console.log(`    📨 Enviando para ${emails.length} destinatário(s)...`);

                for (const email of emails) {
                    await transporter.sendMail({
                        from: emailFrom,
                        to: email,
                        subject: `📊 ${agend.nome_agendamento} - ${formatarData(agora)}`,
                        html: htmlRelatorio
                    });
                    console.log(`       ✅ ${email}`);
                }

                // 4. Atualizar última execução
                await db.execute(`
                    UPDATE agendamentos_relatorios
                    SET ultima_execucao = datetime('now'),
                        total_execucoes = total_execucoes + 1,
                        ultima_execucao_sucesso = 1
                    WHERE id = ?
                `, [agend.id]);

                console.log(`    ✅ Agendamento processado com sucesso!\n`);

            } catch (erro) {
                console.error(`    ❌ Erro ao processar ${agend.nome_agendamento}:`);
                console.error(`       ${erro.message}\n`);

                // Marcar como falha
                await db.execute(`
                    UPDATE agendamentos_relatorios
                    SET ultima_execucao = datetime('now'),
                        ultima_execucao_sucesso = 0
                    WHERE id = ?
                `, [agend.id]);
            }
        }

        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ Processamento concluído!');
        console.log('═══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ ERRO CRÍTICO:', error);
        process.exit(1);
    }
}

// =====================================================
// EXECUÇÃO
// =====================================================

processarAgendamentos()
    .then(() => {
        console.log('Script finalizado com sucesso');
        process.exit(0);
    })
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });
