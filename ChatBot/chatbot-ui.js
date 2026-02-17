/**
 * Interface do ChatBot - Widget Flutuante
 *
 * Cria um botao flutuante no canto inferior direito
 * que abre um painel de chat completo.
 * Todo o CSS e injetado via JS para ser autocontido.
 */

import { ChatbotAI } from './chatbot-ai.js';

export class ChatbotUI {
    constructor() {
        this.ai = new ChatbotAI();
        this.isOpen = false;
        this.isLoading = false;
        this.elements = {};
    }

    /**
     * Inicializa o chatbot: injeta CSS, cria DOM, configura eventos
     */
    init() {
        this.injectStyles();
        this.createDOM();
        this.bindEvents();
        console.log('ChatBot UI inicializado');
    }

    /**
     * Injeta os estilos CSS no documento
     */
    injectStyles() {
        const style = document.createElement('style');
        style.id = 'chatbot-styles';
        style.textContent = `
            /* Botao flutuante */
            .chatbot-fab {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: #fc0303;
                color: white;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(252, 3, 3, 0.4);
                z-index: 9998;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                font-size: 24px;
            }

            .chatbot-fab:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(252, 3, 3, 0.5);
            }

            .chatbot-fab.active {
                background: #495057;
                transform: rotate(90deg);
            }

            /* Painel do chat */
            .chatbot-panel {
                position: fixed;
                bottom: 92px;
                right: 24px;
                width: 400px;
                max-height: 600px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                z-index: 9999;
                display: none;
                flex-direction: column;
                overflow: hidden;
                font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            }

            .chatbot-panel.open {
                display: flex;
                animation: chatbot-slide-up 0.3s ease-out;
            }

            @keyframes chatbot-slide-up {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Header do chat */
            .chatbot-header {
                background: #fc0303;
                color: white;
                padding: 16px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-shrink: 0;
            }

            .chatbot-header-info {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .chatbot-header-icon {
                width: 32px;
                height: 32px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }

            .chatbot-header-text h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
            }

            .chatbot-header-text span {
                font-size: 11px;
                opacity: 0.85;
            }

            .chatbot-header-actions {
                display: flex;
                gap: 8px;
            }

            .chatbot-header-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }

            .chatbot-header-btn:hover {
                background: rgba(255, 255, 255, 0.35);
            }

            /* Area de mensagens */
            .chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                min-height: 300px;
                max-height: 400px;
                background: #f8f9fa;
            }

            .chatbot-messages::-webkit-scrollbar {
                width: 4px;
            }

            .chatbot-messages::-webkit-scrollbar-thumb {
                background: #ced4da;
                border-radius: 2px;
            }

            /* Mensagens */
            .chatbot-msg {
                max-width: 85%;
                padding: 10px 14px;
                border-radius: 12px;
                font-size: 13px;
                line-height: 1.5;
                word-wrap: break-word;
            }

            .chatbot-msg.user {
                align-self: flex-end;
                background: #fc0303;
                color: white;
                border-bottom-right-radius: 4px;
            }

            .chatbot-msg.bot {
                align-self: flex-start;
                background: white;
                color: #212529;
                border-bottom-left-radius: 4px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
            }

            .chatbot-msg.bot p {
                margin: 0 0 8px 0;
            }

            .chatbot-msg.bot p:last-child {
                margin-bottom: 0;
            }

            .chatbot-msg.bot ul, .chatbot-msg.bot ol {
                margin: 4px 0;
                padding-left: 20px;
            }

            .chatbot-msg.bot li {
                margin-bottom: 4px;
            }

            .chatbot-msg.bot strong, .chatbot-msg.bot b {
                color: #fc0303;
            }

            .chatbot-msg.error {
                align-self: flex-start;
                background: #f8d7da;
                color: #842029;
                border: 1px solid #f5c2c7;
                border-bottom-left-radius: 4px;
            }

            /* Indicador de digitacao */
            .chatbot-typing {
                align-self: flex-start;
                display: none;
                align-items: center;
                gap: 4px;
                padding: 12px 16px;
                background: white;
                border-radius: 12px;
                border-bottom-left-radius: 4px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
            }

            .chatbot-typing.visible {
                display: flex;
            }

            .chatbot-typing-dot {
                width: 6px;
                height: 6px;
                background: #adb5bd;
                border-radius: 50%;
                animation: chatbot-bounce 1.4s ease-in-out infinite both;
            }

            .chatbot-typing-dot:nth-child(1) { animation-delay: 0s; }
            .chatbot-typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .chatbot-typing-dot:nth-child(3) { animation-delay: 0.4s; }

            @keyframes chatbot-bounce {
                0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                40% { transform: scale(1); opacity: 1; }
            }

            /* Sugestoes */
            .chatbot-suggestions {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                padding: 0 16px 12px;
                background: #f8f9fa;
            }

            .chatbot-suggestion-chip {
                background: white;
                border: 1px solid #dee2e6;
                color: #495057;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }

            .chatbot-suggestion-chip:hover {
                background: #fc0303;
                color: white;
                border-color: #fc0303;
            }

            /* Input area */
            .chatbot-input-area {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                border-top: 1px solid #e9ecef;
                background: white;
                flex-shrink: 0;
            }

            .chatbot-input {
                flex: 1;
                border: 1px solid #dee2e6;
                border-radius: 20px;
                padding: 8px 16px;
                font-size: 13px;
                font-family: inherit;
                outline: none;
                transition: border-color 0.2s;
                resize: none;
                max-height: 80px;
                line-height: 1.4;
            }

            .chatbot-input:focus {
                border-color: #fc0303;
            }

            .chatbot-input::placeholder {
                color: #adb5bd;
            }

            .chatbot-send-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: #fc0303;
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                flex-shrink: 0;
                font-size: 16px;
            }

            .chatbot-send-btn:hover {
                background: #b50909;
            }

            .chatbot-send-btn:disabled {
                background: #ced4da;
                cursor: not-allowed;
            }

            /* Intents badge */
            .chatbot-intents {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
                margin-top: 6px;
            }

            .chatbot-intent-badge {
                background: #e9ecef;
                color: #6c757d;
                font-size: 10px;
                padding: 2px 8px;
                border-radius: 10px;
            }

            /* Responsivo */
            @media (max-width: 768px) {
                .chatbot-panel {
                    width: calc(100vw - 16px);
                    right: 8px;
                    bottom: 8px;
                    max-height: calc(100vh - 80px);
                    border-radius: 16px;
                }

                .chatbot-fab {
                    bottom: 16px;
                    right: 16px;
                }

                .chatbot-panel.open + .chatbot-fab {
                    display: none;
                }

                .chatbot-messages {
                    max-height: calc(100vh - 250px);
                }
            }

            @media (max-width: 480px) {
                .chatbot-panel {
                    width: 100vw;
                    right: 0;
                    bottom: 0;
                    max-height: 100vh;
                    border-radius: 16px 16px 0 0;
                }

                .chatbot-msg {
                    font-size: 12px;
                }

                .chatbot-suggestion-chip {
                    font-size: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Cria todos os elementos DOM do chatbot
     */
    createDOM() {
        // Botao flutuante (FAB)
        const fab = document.createElement('button');
        fab.className = 'chatbot-fab';
        fab.innerHTML = '\u{1F4AC}';
        fab.title = 'Assistente Comercial';
        fab.setAttribute('aria-label', 'Abrir assistente comercial');

        // Painel do chat
        const panel = document.createElement('div');
        panel.className = 'chatbot-panel';
        panel.innerHTML = `
            <div class="chatbot-header">
                <div class="chatbot-header-info">
                    <div class="chatbot-header-icon">\u{1F4CA}</div>
                    <div class="chatbot-header-text">
                        <h3>Assistente Comercial</h3>
                        <span>Germani Alimentos - Gemini AI</span>
                    </div>
                </div>
                <div class="chatbot-header-actions">
                    <button class="chatbot-header-btn chatbot-clear-btn" title="Limpar conversa">\u{1F5D1}</button>
                    <button class="chatbot-header-btn chatbot-close-btn" title="Fechar">\u2715</button>
                </div>
            </div>
            <div class="chatbot-messages" id="chatbotMessages"></div>
            <div class="chatbot-suggestions" id="chatbotSuggestions"></div>
            <div class="chatbot-input-area">
                <textarea class="chatbot-input" id="chatbotInput"
                    placeholder="Pergunte sobre vendas, clientes, metas..."
                    rows="1"></textarea>
                <button class="chatbot-send-btn" id="chatbotSendBtn" title="Enviar">\u27A4</button>
            </div>
        `;

        document.body.appendChild(panel);
        document.body.appendChild(fab);

        // Salva referencias
        this.elements = {
            fab,
            panel,
            messages: panel.querySelector('#chatbotMessages'),
            suggestions: panel.querySelector('#chatbotSuggestions'),
            input: panel.querySelector('#chatbotInput'),
            sendBtn: panel.querySelector('#chatbotSendBtn'),
            closeBtn: panel.querySelector('.chatbot-close-btn'),
            clearBtn: panel.querySelector('.chatbot-clear-btn')
        };
    }

    /**
     * Configura os event listeners
     */
    bindEvents() {
        const { fab, input, sendBtn, closeBtn, clearBtn } = this.elements;

        // Abre/fecha o chat
        fab.addEventListener('click', () => this.toggle());
        closeBtn.addEventListener('click', () => this.close());

        // Enviar mensagem
        sendBtn.addEventListener('click', () => this.handleSend());
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        // Auto-resize do textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 80) + 'px';
        });

        // Limpar conversa
        clearBtn.addEventListener('click', () => {
            if (confirm('Limpar toda a conversa?')) {
                this.clearChat();
            }
        });
    }

    /**
     * Abre/fecha o painel de chat
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Abre o chat
     */
    open() {
        this.isOpen = true;
        this.elements.panel.classList.add('open');
        this.elements.fab.classList.add('active');
        this.elements.fab.innerHTML = '\u2715';
        this.elements.input.focus();

        // Mensagem de boas-vindas se for a primeira vez
        if (this.elements.messages.children.length === 0) {
            this.addBotMessage(
                'Ola! Sou o assistente comercial da Germani Alimentos.\n\n' +
                'Posso ajudar voce a analisar dados de vendas, clientes, representantes, ' +
                'produtos e metas. Pergunte o que precisar!'
            );
            this.showSuggestions();
        }
    }

    /**
     * Fecha o chat
     */
    close() {
        this.isOpen = false;
        this.elements.panel.classList.remove('open');
        this.elements.fab.classList.remove('active');
        this.elements.fab.innerHTML = '\u{1F4AC}';
    }

    /**
     * Processa o envio de uma mensagem
     */
    async handleSend() {
        const message = this.elements.input.value.trim();
        if (!message || this.isLoading) return;

        // Limpa input
        this.elements.input.value = '';
        this.elements.input.style.height = 'auto';

        // Esconde sugestoes
        this.hideSuggestions();

        // Adiciona mensagem do usuario
        this.addUserMessage(message);

        // Mostra indicador de carregamento
        this.showTyping();
        this.setLoading(true);

        try {
            // Envia para o AI
            const response = await this.ai.sendMessage(message);

            this.hideTyping();

            if (response.error && response.error !== 'RATE_LIMIT') {
                this.addErrorMessage(response.reply);
            } else {
                this.addBotMessage(response.reply, response.intents);
            }

        } catch (error) {
            console.error('Erro no chatbot:', error);
            this.hideTyping();
            this.addErrorMessage('Ocorreu um erro inesperado. Tente novamente.');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Adiciona uma mensagem do usuario na area de chat
     */
    addUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'chatbot-msg user';
        msg.textContent = text;
        this.elements.messages.appendChild(msg);
        this.scrollToBottom();
    }

    /**
     * Adiciona uma mensagem do bot na area de chat
     */
    addBotMessage(text, intents = []) {
        const msg = document.createElement('div');
        msg.className = 'chatbot-msg bot';
        msg.innerHTML = this.formatMarkdown(text);

        // Adiciona badges de intencoes detectadas
        if (intents.length > 0) {
            const intentsDiv = document.createElement('div');
            intentsDiv.className = 'chatbot-intents';
            intents.forEach(intent => {
                const badge = document.createElement('span');
                badge.className = 'chatbot-intent-badge';
                badge.textContent = intent;
                intentsDiv.appendChild(badge);
            });
            msg.appendChild(intentsDiv);
        }

        this.elements.messages.appendChild(msg);
        this.scrollToBottom();
    }

    /**
     * Adiciona uma mensagem de erro
     */
    addErrorMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'chatbot-msg error';
        msg.textContent = text;
        this.elements.messages.appendChild(msg);
        this.scrollToBottom();
    }

    /**
     * Formata texto simples em HTML basico (negrito, listas, paragrafos)
     */
    formatMarkdown(text) {
        return text
            // Escapa HTML perigoso
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // Negrito: **texto** ou __texto__
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // Italico: *texto* ou _texto_
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Listas com marcador
            .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
            // Listas numeradas
            .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
            // Quebras de linha em paragrafos
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            // Envolve em paragrafo
            .replace(/^(.+)/, '<p>$1')
            .replace(/(.+)$/, '$1</p>');
    }

    /**
     * Mostra as sugestoes de perguntas
     */
    showSuggestions() {
        const suggestions = this.ai.getSuggestions();
        this.elements.suggestions.innerHTML = '';

        suggestions.forEach(text => {
            const chip = document.createElement('button');
            chip.className = 'chatbot-suggestion-chip';
            chip.textContent = text;
            chip.addEventListener('click', () => {
                this.elements.input.value = text;
                this.handleSend();
            });
            this.elements.suggestions.appendChild(chip);
        });

        this.elements.suggestions.style.display = 'flex';
    }

    /**
     * Esconde as sugestoes
     */
    hideSuggestions() {
        this.elements.suggestions.style.display = 'none';
    }

    /**
     * Mostra o indicador de digitacao
     */
    showTyping() {
        let typing = this.elements.messages.querySelector('.chatbot-typing');
        if (!typing) {
            typing = document.createElement('div');
            typing.className = 'chatbot-typing';
            typing.innerHTML = `
                <div class="chatbot-typing-dot"></div>
                <div class="chatbot-typing-dot"></div>
                <div class="chatbot-typing-dot"></div>
            `;
            this.elements.messages.appendChild(typing);
        }
        typing.classList.add('visible');
        this.scrollToBottom();
    }

    /**
     * Esconde o indicador de digitacao
     */
    hideTyping() {
        const typing = this.elements.messages.querySelector('.chatbot-typing');
        if (typing) {
            typing.remove();
        }
    }

    /**
     * Ativa/desativa estado de carregamento
     */
    setLoading(loading) {
        this.isLoading = loading;
        this.elements.sendBtn.disabled = loading;
        this.elements.input.disabled = loading;
    }

    /**
     * Scrolla para o final das mensagens
     */
    scrollToBottom() {
        requestAnimationFrame(() => {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        });
    }

    /**
     * Limpa todo o chat e reseta o historico
     */
    clearChat() {
        this.elements.messages.innerHTML = '';
        this.ai.clearHistory();
        this.addBotMessage(
            'Conversa limpa! Como posso ajudar?'
        );
        this.showSuggestions();
    }
}
