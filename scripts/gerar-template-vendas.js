#!/usr/bin/env node

/**
 * Gerador de Template Excel para Importação de Vendas
 *
 * Cria um arquivo Excel (.xlsx) com os cabeçalhos corretos e exemplos
 * para facilitar a importação de dados de vendas.
 *
 * USO:
 *   node scripts/gerar-template-vendas.js [nome-arquivo.xlsx]
 *
 * EXEMPLO:
 *   node scripts/gerar-template-vendas.js template_vendas.xlsx
 */

import XLSX from 'xlsx';
import { writeFileSync } from 'fs';

// Cabeçalhos exatos da planilha
const HEADERS = [
    'Série',
    'Nota Fiscal',
    'Emissão',
    'Produto',
    'Qtde.Faturada',
    'Nat.Oper.',
    'Família',
    'Complemento',
    'Cliente',
    'Nome',
    'Fantasia',
    'Representante',
    'UF',
    'Cidade',
    'Peso Líq.',
    'Preço.Unitário',
    '% Desc.',
    'Valor Bruto',
    'Valor Desconto',
    'Valor Líquido',
    'Valor Financeiro',
    'Grupo Empresa',
    'Preço Unit. Liq.',
    'Preço Bruto'
];

// Dados de exemplo
const EXAMPLE_ROWS = [
    [
        'EP',           // Série
        '123456',       // Nota Fiscal
        '2024-01-15',   // Emissão
        'PROD001',      // Produto
        10,             // Qtde.Faturada
        '5.102',        // Nat.Oper.
        'ALIMENTOS',    // Família
        'Cx com 12 unidades', // Complemento
        'CLI001',       // Cliente
        'João Silva',   // Nome
        'Silva & Cia',  // Fantasia
        'REP001',       // Representante
        'SP',           // UF
        'São Paulo',    // Cidade
        5.5,            // Peso Líq.
        25.00,          // Preço.Unitário
        10,             // % Desc.
        250.00,         // Valor Bruto
        25.00,          // Valor Desconto
        225.00,         // Valor Líquido
        225.00,         // Valor Financeiro
        'GERMANI',      // Grupo Empresa
        22.50,          // Preço Unit. Liq.
        250.00          // Preço Bruto
    ],
    [
        'EP',           // Série
        '123457',       // Nota Fiscal
        '2024-01-16',   // Emissão
        'PROD002',      // Produto
        20,             // Qtde.Faturada
        '5.102',        // Nat.Oper.
        'BEBIDAS',      // Família
        'Fardo com 24 unidades', // Complemento
        'CLI002',       // Cliente
        'Maria Santos', // Nome
        'Santos Ltda',  // Fantasia
        'REP002',       // Representante
        'RJ',           // UF
        'Rio de Janeiro', // Cidade
        10.0,           // Peso Líq.
        15.00,          // Preço.Unitário
        5,              // % Desc.
        300.00,         // Valor Bruto
        15.00,          // Valor Desconto
        285.00,         // Valor Líquido
        285.00,         // Valor Financeiro
        'GERMANI',      // Grupo Empresa
        14.25,          // Preço Unit. Liq.
        300.00          // Preço Bruto
    ],
    [
        'EP',           // Série
        '123458',       // Nota Fiscal
        '2024-01-17',   // Emissão
        'PROD003',      // Produto
        15,             // Qtde.Faturada
        '5.102',        // Nat.Oper.
        'LATICINIOS',   // Família
        'Pacote com 6 unidades', // Complemento
        'CLI003',       // Cliente
        'Pedro Oliveira', // Nome
        'Oliveira Distribuidora', // Fantasia
        'REP001',       // Representante
        'MG',           // UF
        'Belo Horizonte', // Cidade
        7.2,            // Peso Líq.
        18.50,          // Preço.Unitário
        8,              // % Desc.
        277.50,         // Valor Bruto
        22.20,          // Valor Desconto
        255.30,         // Valor Líquido
        255.30,         // Valor Financeiro
        'GERMANI',      // Grupo Empresa
        17.02,          // Preço Unit. Liq.
        277.50          // Preço Bruto
    ]
];

// Instruções na aba separada
const INSTRUCTIONS = [
    ['INSTRUÇÕES PARA IMPORTAÇÃO DE VENDAS'],
    [''],
    ['IMPORTANTE: Apenas registros com Série = "EP" serão importados!'],
    [''],
    ['1. ESTRUTURA DO ARQUIVO'],
    ['   - Use a aba "Vendas" como referência'],
    ['   - Mantenha EXATAMENTE os mesmos cabeçalhos'],
    ['   - Preencha seus dados a partir da linha 2'],
    [''],
    ['2. CAMPOS OBRIGATÓRIOS'],
    ['   - Série (deve ser "EP")'],
    ['   - Nota Fiscal'],
    ['   - Produto'],
    [''],
    ['3. CHAVE PRIMÁRIA'],
    ['   - É gerada automaticamente concatenando: Nota Fiscal + Produto'],
    ['   - Exemplo: Nota "123456" + Produto "PROD001" = Chave "123456PROD001"'],
    [''],
    ['4. FORMATOS DE DADOS'],
    ['   - Datas: Use formato Excel padrão (ex: 15/01/2024)'],
    ['   - Números: Use ponto ou vírgula como decimal'],
    ['   - Textos: Máximo 255 caracteres por campo'],
    [''],
    ['5. COMO IMPORTAR'],
    ['   Execute no terminal:'],
    ['   npm run importar-vendas caminho/para/seu-arquivo.xlsx'],
    [''],
    ['   OU'],
    [''],
    ['   node scripts/importar-vendas-excel.js caminho/para/seu-arquivo.xlsx'],
    [''],
    ['6. PROCESSO DE IMPORTAÇÃO'],
    ['   ✓ Filtra apenas Série = "EP"'],
    ['   ✓ Valida campos obrigatórios'],
    ['   ✓ Gera chave primária automaticamente'],
    ['   ✓ Converte números automaticamente'],
    ['   ✓ Ignora duplicados'],
    ['   ✓ Insere em lotes de 500 registros'],
    ['   ✓ Exibe progresso em tempo real'],
    [''],
    ['7. DICAS'],
    ['   • Teste com poucos registros primeiro'],
    ['   • Mantenha backup do arquivo original'],
    ['   • O script ignora registros duplicados automaticamente'],
    ['   • Campos vazios são permitidos (exceto os obrigatórios)'],
    [''],
    ['8. TROUBLESHOOTING'],
    ['   • "Nenhum registro importado" → Verifique se Série = "EP"'],
    ['   • "Nota Fiscal ou Produto ausente" → Preencha os campos obrigatórios'],
    ['   • "Erro ao ler arquivo" → Certifique-se que o arquivo é .xlsx válido'],
    [''],
    ['Para mais informações, consulte: templates/template_importacao_vendas.md']
];

/**
 * Gera o template Excel
 */
function generateTemplate(outputFile) {
    console.log('📝 Gerando template Excel para importação de vendas...\n');

    // Cria workbook
    const workbook = XLSX.utils.book_new();

    // Aba 1: Instruções
    const wsInstructions = XLSX.utils.aoa_to_sheet(INSTRUCTIONS);

    // Ajusta largura das colunas na aba de instruções
    wsInstructions['!cols'] = [{ wch: 80 }];

    XLSX.utils.book_append_sheet(workbook, wsInstructions, 'Instruções');

    // Aba 2: Template com exemplos
    const data = [HEADERS, ...EXAMPLE_ROWS];
    const wsTemplate = XLSX.utils.aoa_to_sheet(data);

    // Ajusta largura das colunas
    wsTemplate['!cols'] = HEADERS.map(h => ({ wch: Math.max(h.length + 2, 12) }));

    // Adiciona formatação (congelar primeira linha)
    wsTemplate['!freeze'] = { xSplit: 0, ySplit: 1 };

    XLSX.utils.book_append_sheet(workbook, wsTemplate, 'Vendas');

    // Salva arquivo
    XLSX.writeFile(workbook, outputFile);

    console.log(`✅ Template criado: ${outputFile}`);
    console.log('');
    console.log('📋 Estrutura do arquivo:');
    console.log('   • Aba "Instruções": Como usar o template');
    console.log('   • Aba "Vendas": Template com 3 exemplos de dados');
    console.log('');
    console.log('🎯 Próximos passos:');
    console.log('   1. Abra o arquivo Excel gerado');
    console.log('   2. Leia as instruções na primeira aba');
    console.log('   3. Preencha seus dados na aba "Vendas"');
    console.log('   4. Execute: npm run importar-vendas seu-arquivo.xlsx');
    console.log('');
    console.log('⚠️  IMPORTANTE: Apenas registros com Série = "EP" serão importados!');
}

/**
 * Main
 */
function main() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   GERADOR DE TEMPLATE - IMPORTAÇÃO DE VENDAS         ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('');

    const outputFile = process.argv[2] || 'template_vendas.xlsx';

    try {
        generateTemplate(outputFile);
    } catch (error) {
        console.error('❌ Erro ao gerar template:', error.message);
        process.exit(1);
    }
}

main();
