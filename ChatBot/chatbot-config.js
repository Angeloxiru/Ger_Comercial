/**
 * Configuracao do ChatBot - Gemini API
 *
 * IMPORTANTE: Este arquivo contem a chave da API do Gemini.
 * - NAO compartilhe este arquivo publicamente com a chave preenchida
 * - Para producao, considere restringir a chave no Google AI Studio
 */

export const chatbotConfig = {
    // Chave da API do Google Gemini
    geminiApiKey: 'gen-lang-client-0629320584',

    // Modelo a ser utilizado
    model: 'gemini-2.5-flash',

    // Configuracoes de geracao
    generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.9
    },

    // Limite de historico de conversa (pares de mensagens)
    maxHistoryLength: 10,

    // Rate limit: maximo de mensagens por minuto
    rateLimitPerMinute: 10
};
