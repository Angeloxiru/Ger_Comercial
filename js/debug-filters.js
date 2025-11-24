/**
 * Sistema de Debug para Filtros de Dashboards
 * Monitora event listeners, estado do FilterSearch e interações
 */

export class FilterDebugger {
    constructor(dashboardName) {
        this.dashboardName = dashboardName;
        this.logs = [];
        this.listenerCounts = new Map();
        this.eventHistory = [];
        this.maxHistory = 100;

        // Cria painel de debug
        this.createDebugPanel();

        this.log('info', `🔍 FilterDebugger inicializado para: ${dashboardName}`);
    }

    /**
     * Cria painel visual de debug
     */
    createDebugPanel() {
        // Remove painel anterior se existir
        const existing = document.getElementById('filter-debugger');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'filter-debugger';
        panel.innerHTML = `
            <div style="position: fixed; bottom: 0; right: 0; width: 400px; max-height: 500px;
                        background: rgba(0,0,0,0.95); color: #0f0; font-family: monospace;
                        font-size: 11px; z-index: 999999; border: 2px solid #0f0;
                        display: flex; flex-direction: column;">
                <div style="padding: 8px; background: #000; border-bottom: 1px solid #0f0;
                            display: flex; justify-content: space-between; align-items: center;">
                    <strong>🐛 Filter Debugger - ${this.dashboardName}</strong>
                    <div>
                        <button id="debug-clear" style="background: #f00; color: #fff; border: none;
                                padding: 2px 6px; cursor: pointer; margin-right: 4px;">Clear</button>
                        <button id="debug-toggle" style="background: #0f0; color: #000; border: none;
                                padding: 2px 6px; cursor: pointer;">▼</button>
                    </div>
                </div>
                <div id="debug-stats" style="padding: 8px; background: #111; border-bottom: 1px solid #0f0; font-size: 10px;"></div>
                <div id="debug-logs" style="flex: 1; overflow-y: auto; padding: 8px;"></div>
            </div>
        `;

        document.body.appendChild(panel);

        // Event listeners do painel
        document.getElementById('debug-clear').addEventListener('click', () => {
            this.logs = [];
            this.eventHistory = [];
            this.updateDisplay();
        });

        let collapsed = false;
        document.getElementById('debug-toggle').addEventListener('click', (e) => {
            collapsed = !collapsed;
            const logsDiv = document.getElementById('debug-logs');
            const statsDiv = document.getElementById('debug-stats');
            logsDiv.style.display = collapsed ? 'none' : 'block';
            statsDiv.style.display = collapsed ? 'none' : 'block';
            e.target.textContent = collapsed ? '▲' : '▼';
        });
    }

    /**
     * Log de mensagens
     */
    log(type, message, data = null) {
        const timestamp = new Date().toLocaleTimeString('pt-BR', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });

        const logEntry = {
            timestamp,
            type, // 'info', 'warn', 'error', 'event', 'listener'
            message,
            data
        };

        this.logs.push(logEntry);
        if (this.logs.length > this.maxHistory) {
            this.logs.shift();
        }

        // Console também
        const emoji = {
            'info': 'ℹ️',
            'warn': '⚠️',
            'error': '❌',
            'event': '🎯',
            'listener': '📡'
        }[type] || '📝';

        console.log(`${emoji} [${timestamp}] ${message}`, data || '');

        this.updateDisplay();
    }

    /**
     * Monitora event listener
     */
    monitorListener(elementId, eventType, handlerName) {
        const key = `${elementId}:${eventType}`;
        const count = (this.listenerCounts.get(key) || 0) + 1;
        this.listenerCounts.set(key, count);

        const status = count > 1 ? '⚠️ DUPLICADO!' : '✅ OK';
        this.log('listener', `${status} Listener registrado: ${elementId} -> ${eventType} (${handlerName}) [Total: ${count}]`);

        return count;
    }

    /**
     * Monitora evento disparado
     */
    monitorEvent(elementId, eventType, selectedValues) {
        const timestamp = Date.now();

        this.eventHistory.push({
            timestamp,
            elementId,
            eventType,
            selectedValues
        });

        if (this.eventHistory.length > this.maxHistory) {
            this.eventHistory.shift();
        }

        // Detecta eventos em rápida sucessão (possível duplicação)
        const recentEvents = this.eventHistory.filter(e =>
            timestamp - e.timestamp < 100 &&
            e.elementId === elementId &&
            e.eventType === eventType
        );

        if (recentEvents.length > 1) {
            this.log('warn', `⚠️ ${recentEvents.length} eventos ${eventType} em ${elementId} nos últimos 100ms!`, {
                events: recentEvents,
                possibleDuplication: true
            });
        } else {
            this.log('event', `Evento: ${elementId}.${eventType}`, { selectedValues });
        }
    }

    /**
     * Monitora estado do FilterSearch
     */
    monitorFilterSearch(filterId, action, optionsCount) {
        this.log('info', `FilterSearch [${filterId}]: ${action} (${optionsCount} opções)`);
    }

    /**
     * Verifica quantos listeners estão registrados em um elemento
     */
    checkListenerCount(elementId, eventType) {
        const key = `${elementId}:${eventType}`;
        return this.listenerCounts.get(key) || 0;
    }

    /**
     * Atualiza display visual
     */
    updateDisplay() {
        const logsDiv = document.getElementById('debug-logs');
        const statsDiv = document.getElementById('debug-stats');

        if (!logsDiv || !statsDiv) return;

        // Stats
        const totalListeners = Array.from(this.listenerCounts.values()).reduce((sum, count) => sum + count, 0);
        const duplicatedListeners = Array.from(this.listenerCounts.entries())
            .filter(([_, count]) => count > 1)
            .map(([key, count]) => `${key} (${count}x)`);

        const recentEvents = this.eventHistory.filter(e => Date.now() - e.timestamp < 5000).length;

        statsDiv.innerHTML = `
            <div><strong>📊 Estatísticas:</strong></div>
            <div>Total Listeners: <span style="color: ${totalListeners > 10 ? '#f00' : '#0f0'}">${totalListeners}</span></div>
            <div>Duplicados: <span style="color: ${duplicatedListeners.length > 0 ? '#f00' : '#0f0'}">
                ${duplicatedListeners.length > 0 ? duplicatedListeners.join(', ') : 'Nenhum ✅'}
            </span></div>
            <div>Eventos (5s): ${recentEvents}</div>
            <div>Histórico: ${this.logs.length} logs</div>
        `;

        // Logs (últimos 50)
        const recentLogs = this.logs.slice(-50).reverse();
        logsDiv.innerHTML = recentLogs.map(log => {
            const color = {
                'info': '#0ff',
                'warn': '#ff0',
                'error': '#f00',
                'event': '#0f0',
                'listener': '#f0f'
            }[log.type] || '#0f0';

            const emoji = {
                'info': 'ℹ️',
                'warn': '⚠️',
                'error': '❌',
                'event': '🎯',
                'listener': '📡'
            }[log.type] || '📝';

            return `<div style="margin-bottom: 4px; color: ${color}; word-break: break-word;">
                [${log.timestamp}] ${emoji} ${log.message}
            </div>`;
        }).join('');

        // Auto-scroll para o topo (logs mais recentes)
        logsDiv.scrollTop = 0;
    }

    /**
     * Intercepta addEventListener para monitoramento automático
     */
    interceptAddEventListener() {
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        const debugger = this;

        EventTarget.prototype.addEventListener = function(type, listener, options) {
            // Identifica o elemento
            const elementId = this.id || this.tagName || 'unknown';

            // Só monitora elementos de filtro
            if (elementId.includes('filtro') || elementId.includes('data')) {
                const handlerName = listener.name || 'anonymous';
                debugger.monitorListener(elementId, type, handlerName);
            }

            // Chama o original
            return originalAddEventListener.call(this, type, listener, options);
        };

        this.log('info', '🔌 addEventListener interceptado para monitoramento automático');
    }

    /**
     * Wrapper para monitorar evento change
     */
    wrapChangeHandler(element, originalHandler, handlerName) {
        const debugger = this;

        return function(event) {
            const selectedValues = Array.from(this.selectedOptions || []).map(o => o.value);
            debugger.monitorEvent(this.id, 'change', selectedValues);

            // Chama handler original
            return originalHandler.call(this, event);
        };
    }

    /**
     * Gera relatório completo
     */
    generateReport() {
        const report = {
            dashboard: this.dashboardName,
            timestamp: new Date().toISOString(),
            listeners: Object.fromEntries(this.listenerCounts),
            totalListeners: Array.from(this.listenerCounts.values()).reduce((sum, count) => sum + count, 0),
            duplicatedListeners: Array.from(this.listenerCounts.entries()).filter(([_, count]) => count > 1),
            recentEvents: this.eventHistory.slice(-20),
            logs: this.logs.slice(-50)
        };

        console.log('📋 RELATÓRIO COMPLETO:', report);
        this.log('info', '📋 Relatório gerado (veja console)');

        return report;
    }
}

// Atalho global para debug
window.debugFilters = () => {
    if (window.filterDebugger) {
        return window.filterDebugger.generateReport();
    } else {
        console.error('FilterDebugger não inicializado');
    }
};

console.log('✅ debug-filters.js carregado. Use window.debugFilters() para gerar relatório.');
