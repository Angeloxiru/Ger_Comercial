/**
 * Exemplo de Configuração do Banco de Dados Turso
 *
 * Este é um arquivo de exemplo. Para usar:
 * 1. Copie este arquivo e renomeie para config.js
 * 2. Preencha com suas credenciais reais do Turso
 * 3. Mantenha o config.js fora do controle de versão para segurança
 */

export const config = {
    // Nome do seu database no Turso
    dbName: 'comercial',

    // URL do banco de dados
    // Formato: libsql://[database-name]-[username].turso.io
    url: 'libsql://comercial-angeloxiru.aws-us-east-1.turso.io',

    // Token de autenticação do Turso
    // IMPORTANTE: Substitua pelo seu token real
    // Para obter o token:
    // 1. Acesse: https://turso.tech/app
    // 2. Selecione seu database
    // 3. Clique em "Generate Token" ou "Create Token"
    // 4. Copie e cole aqui
    authToken: 'SEU_TOKEN_AQUI',

    // Configurações opcionais
    options: {
        timeout: 10000,
        appName: 'Ger_Comercial'
    }
};

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

export const dbInfo = {
    provider: 'Turso',
    dialect: 'libSQL/SQLite',
    region: 'aws-us-east-1',
    version: 'gratuita'
};
