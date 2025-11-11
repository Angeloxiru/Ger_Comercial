/**
 * Configuração do Banco de Dados Turso
 *
 * IMPORTANTE: Para obter seu token de autenticação:
 * 1. Acesse: https://turso.tech/app
 * 2. Selecione seu database "comercial"
 * 3. Clique em "Generate Token" ou "Create Token"
 * 4. Copie o token e cole abaixo
 *
 * SEGURANÇA:
 * - NÃO compartilhe este arquivo com o token preenchido
 * - Para produção, use variáveis de ambiente
 * - Adicione este arquivo ao .gitignore após configurar
 */

export const config = {
    // Nome do seu database no Turso
    dbName: 'comercial',

    // URL do banco de dados (já fornecida)
    url: 'libsql://comercial-angeloxiru.aws-us-east-1.turso.io',

    // Token de autenticação - SUBSTITUIR PELO SEU TOKEN
    // Para obter: https://turso.tech/app -> seu database -> "Generate Token"
    authToken: 'SEU_TOKEN_AQUI',

    // Configurações opcionais
    options: {
        // Timeout para queries (em milissegundos)
        timeout: 10000,

        // Nome da aplicação (aparece nos logs do Turso)
        appName: 'Ger_Comercial'
    }
};

// Validação básica
export function validateConfig() {
    const errors = [];

    if (!config.url) {
        errors.push('URL do banco de dados não configurada');
    }

    if (!config.authToken || config.authToken === 'SEU_TOKEN_AQUI') {
        errors.push('Token de autenticação não configurado');
    }

    if (errors.length > 0) {
        console.error('❌ Erros de configuração:', errors);
        return false;
    }

    console.log('✅ Configuração válida');
    return true;
}

// Informações sobre o banco
export const dbInfo = {
    provider: 'Turso',
    dialect: 'libSQL/SQLite',
    region: 'aws-us-east-1',
    version: 'gratuita'
};
