/**
 * Integracao com Google Gemini API
 *
 * Gerencia a comunicacao com o modelo Gemini 2.5 Flash,
 * incluindo o system prompt de Gerente Comercial Senior
 * e o historico de conversa.
 */

import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';
import { chatbotConfig } from './chatbot-config.js';
import { ChatbotRAG } from './chatbot-rag.js';

/**
 * System prompt que instrui o Gemini a agir como Gerente Comercial Senior
 */
const SYSTEM_PROMPT = `Voce e um Gerente Comercial Senior da Germani Alimentos com 20 anos de experiencia no setor alimenticio.
Seu papel e analisar dados comerciais e fornecer insights estrategicos acionaveis para a equipe de vendas.

CONTEXTO DA EMPRESA:
- Germani Alimentos: industria de alimentos com equipe de representantes comerciais em campo
- Metricas-chave do negocio: faturamento liquido (valor_liquido), peso vendido (peso_liq), clientes ativos, ticket medio
- Hierarquia comercial: Supervisores > Representantes > Clientes
- Estrutura geografica: Rotas > Sub-rotas > Cidades > Estados (UF)
- Produtos organizados por: Familia e Origem
- Voce recebe dados historicos de ate 12 meses. Use comparativos temporais (mes atual vs anterior, trimestral, semestral)
- Sempre que possivel, compare periodos para identificar tendencias de crescimento ou queda

REGRAS DE COMPORTAMENTO:
1. Responda SEMPRE em portugues brasileiro
2. Use os dados fornecidos na secao "DADOS DO BANCO" para fundamentar suas respostas com numeros reais
3. Quando nao houver dados suficientes, diga claramente e sugira o que mais poderia ser consultado
4. Forneca insights ACIONAVEIS, nao apenas repita numeros - explique O QUE os numeros significam
5. Sugira acoes praticas quando identificar problemas ou oportunidades
6. Formate valores monetarios como R$ X.XXX,XX
7. Formate pesos em Kg com 2 casas decimais
8. Seja conciso mas completo - ideal 3-5 paragrafos
9. Use conceitos de estrategia comercial como: Curva ABC, cobertura de carteira, mix de produtos, ticket medio, positivacao
10. Quando relevante, sugira comparacoes temporais (mes anterior, mesmo mes ano anterior)
11. Identifique riscos e oportunidades nos dados apresentados
12. Se o usuario perguntar algo fora do escopo comercial, redirecione educadamente para temas de gestao comercial

FORMATO DE RESPOSTA:
- Use paragrafos curtos e objetivos
- Destaque numeros importantes
- Quando listar itens, use marcadores
- Finalize com 1-2 sugestoes de acao ou proximos passos`;

/**
 * Classe de integracao com o Gemini
 */
export class ChatbotAI {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.chatHistory = [];
        this.rag = new ChatbotRAG();
        this.messageTimestamps = [];
        this.initialized = false;
    }

    /**
     * Inicializa o cliente do Gemini
     */
    init() {
        try {
            this.genAI = new GoogleGenerativeAI(chatbotConfig.geminiApiKey);
            this.model = this.genAI.getGenerativeModel({
                model: chatbotConfig.model,
                generationConfig: chatbotConfig.generationConfig,
                systemInstruction: SYSTEM_PROMPT
            });
            this.initialized = true;
            console.log('ChatBot AI inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar Gemini:', error);
            throw new Error('Falha ao inicializar o assistente. Verifique a chave da API.');
        }
    }

    /**
     * Verifica rate limit (max mensagens por minuto)
     * @returns {boolean} true se pode enviar, false se excedeu o limite
     */
    checkRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        // Remove timestamps antigos
        this.messageTimestamps = this.messageTimestamps.filter(t => t > oneMinuteAgo);

        if (this.messageTimestamps.length >= chatbotConfig.rateLimitPerMinute) {
            return false;
        }

        this.messageTimestamps.push(now);
        return true;
    }

    /**
     * Monta o prompt do usuario incluindo o contexto RAG
     * @param {string} userMessage - Mensagem do usuario
     * @param {Object} ragResult - Resultado do motor RAG
     * @returns {string} Prompt completo com contexto
     */
    buildPrompt(userMessage, ragResult) {
        let prompt = '';

        if (ragResult && ragResult.context) {
            prompt += `=== DADOS DO BANCO (consultados agora) ===\n`;
            prompt += ragResult.context;
            prompt += `\n=== FIM DOS DADOS ===\n\n`;
        }

        prompt += `PERGUNTA DO USUARIO: ${userMessage}`;

        return prompt;
    }

    /**
     * Envia uma mensagem ao Gemini com contexto RAG
     * @param {string} userMessage - Mensagem do usuario
     * @returns {Object} { reply: string, intents: Array, error: string|null }
     */
    async sendMessage(userMessage) {
        // Verifica inicializacao
        if (!this.initialized) {
            this.init();
        }

        // Verifica rate limit
        if (!this.checkRateLimit()) {
            return {
                reply: 'Voce atingiu o limite de mensagens por minuto. Aguarde alguns segundos e tente novamente.',
                intents: [],
                error: 'RATE_LIMIT'
            };
        }

        try {
            // ETAPA 1: RAG - Busca contexto no banco de dados
            const ragResult = await this.rag.getContext(userMessage);

            // ETAPA 2: Monta o prompt com contexto
            const promptWithContext = this.buildPrompt(userMessage, ragResult);

            // ETAPA 3: Prepara o historico para o chat
            const chatHistoryFormatted = this.chatHistory.map(entry => ({
                role: entry.role,
                parts: [{ text: entry.text }]
            }));

            // ETAPA 4: Inicia chat com historico e envia mensagem
            const chat = this.model.startChat({
                history: chatHistoryFormatted
            });

            const result = await chat.sendMessage(promptWithContext);
            const response = result.response;
            const replyText = response.text();

            // ETAPA 5: Atualiza historico
            this.chatHistory.push(
                { role: 'user', text: promptWithContext },
                { role: 'model', text: replyText }
            );

            // Limita tamanho do historico
            while (this.chatHistory.length > chatbotConfig.maxHistoryLength * 2) {
                this.chatHistory.shift();
                this.chatHistory.shift();
            }

            return {
                reply: replyText,
                intents: ragResult.intents || [],
                error: null
            };

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            console.error('Detalhes do erro:', { status: error.status, statusText: error.statusText, message: error.message });

            let userFriendlyMessage;

            if (error.message?.includes('429') || error.message?.includes('Resource has been exhausted')) {
                userFriendlyMessage = 'O limite de requisicoes da API foi atingido. Aguarde alguns minutos e tente novamente.';
            } else if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('API_KEY')) {
                userFriendlyMessage = 'Chave da API invalida ou sem permissao. Verifique a configuracao em chatbot-config.js.';
            } else if (error.message?.includes('404')) {
                userFriendlyMessage = 'Modelo nao encontrado. Verifique se "gemini-2.5-flash" esta disponivel na sua conta.';
            } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
                userFriendlyMessage = 'Erro de conexao com a API do Gemini. Verifique sua conexao com a internet.';
            } else {
                userFriendlyMessage = `Erro ao processar sua pergunta: ${error.message}. Tente novamente.`;
            }

            return {
                reply: userFriendlyMessage,
                intents: [],
                error: error.message
            };
        }
    }

    /**
     * Limpa o historico de conversa
     */
    clearHistory() {
        this.chatHistory = [];
    }

    /**
     * Retorna sugestoes de perguntas para o usuario
     */
    getSuggestions() {
        return [
            'Como estao as vendas do mes?',
            'Quais os top 10 clientes?',
            'Como esta a performance dos representantes?',
            'Quais produtos estao parados?',
            'Como estao as metas vs realizado?',
            'Analise os descontos concedidos',
            'Quais clientes pararam de comprar?',
            'Vendas por regiao'
        ];
    }
}
