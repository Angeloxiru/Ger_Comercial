/**
 * Sistema de KPI Cards
 *
 * Exibe indicadores-chave de performance no topo dos dashboards
 */

export class KPICards {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.kpis = [];
    }

    /**
     * Define os KPIs a serem exibidos
     * @param {Array} kpis - Array de objetos KPI
     */
    setKPIs(kpis) {
        this.kpis = kpis;
        this.render();
    }

    /**
     * Adiciona um KPI
     * @param {Object} kpi - Objeto KPI {icon, label, value, format, trend}
     */
    addKPI(kpi) {
        this.kpis.push(kpi);
        this.render();
    }

    /**
     * Limpa todos os KPIs
     */
    clear() {
        this.kpis = [];
        this.render();
    }

    /**
     * Formata valor baseado no tipo
     * @param {any} value - Valor a ser formatado
     * @param {string} format - Tipo de formato (currency, number, percentage)
     * @returns {string} Valor formatado
     */
    formatValue(value, format = 'number') {
        if (value === null || value === undefined) return '-';

        switch (format) {
            case 'currency':
                return 'R$ ' + parseFloat(value).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            case 'number':
                return parseFloat(value).toLocaleString('pt-BR');
            case 'percentage':
                return parseFloat(value).toFixed(1) + '%';
            case 'weight':
                return parseFloat(value).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                }) + ' kg';
            default:
                return value.toString();
        }
    }

    /**
     * Renderiza os KPI cards
     */
    render() {
        if (!this.container) return;

        if (this.kpis.length === 0) {
            this.container.innerHTML = '';
            this.container.style.display = 'none';
            return;
        }

        this.container.style.display = 'block';

        const cardsHTML = this.kpis.map(kpi => this.createKPICard(kpi)).join('');

        this.container.innerHTML = `
            <div class="kpi-cards-grid">
                ${cardsHTML}
            </div>
        `;
    }

    /**
     * Cria um card de KPI
     * @param {Object} kpi - Dados do KPI
     * @returns {string} HTML do card
     */
    createKPICard(kpi) {
        const value = this.formatValue(kpi.value, kpi.format);
        const trendHTML = kpi.trend ? this.createTrendIndicator(kpi.trend) : '';
        const subtextHTML = kpi.subtext ? `<div class="kpi-subtext">${kpi.subtext}</div>` : '';

        return `
            <div class="kpi-card ${kpi.highlight ? 'highlight' : ''}">
                <div class="kpi-icon">${kpi.icon || '📊'}</div>
                <div class="kpi-content">
                    <div class="kpi-label">${kpi.label}</div>
                    <div class="kpi-value">${value}</div>
                    ${trendHTML}
                    ${subtextHTML}
                </div>
            </div>
        `;
    }

    /**
     * Cria indicador de tendência
     * @param {Object} trend - {value, direction: 'up'|'down'|'neutral'}
     * @returns {string} HTML do indicador
     */
    createTrendIndicator(trend) {
        let icon, colorClass;

        switch (trend.direction) {
            case 'up':
                icon = '📈';
                colorClass = 'trend-up';
                break;
            case 'down':
                icon = '📉';
                colorClass = 'trend-down';
                break;
            default:
                icon = '➡️';
                colorClass = 'trend-neutral';
        }

        return `
            <div class="kpi-trend ${colorClass}">
                ${icon} ${trend.value}
            </div>
        `;
    }

    /**
     * Atualiza um KPI específico
     * @param {number} index - Índice do KPI
     * @param {Object} newData - Novos dados
     */
    updateKPI(index, newData) {
        if (index >= 0 && index < this.kpis.length) {
            this.kpis[index] = { ...this.kpis[index], ...newData };
            this.render();
        }
    }

    /**
     * Calcula KPIs a partir dos dados
     * @param {Array} data - Array de dados
     * @param {Object} config - Configuração dos cálculos
     * @returns {Array} Array de KPIs calculados
     */
    static calculateFromData(data, config) {
        const kpis = [];

        if (config.totalValue) {
            const total = data.reduce((sum, item) =>
                sum + parseFloat(item[config.totalValue] || 0), 0);
            kpis.push({
                icon: '💰',
                label: 'Valor Total',
                value: total,
                format: 'currency'
            });
        }

        if (config.totalQuantity) {
            const total = data.reduce((sum, item) =>
                sum + parseFloat(item[config.totalQuantity] || 0), 0);
            kpis.push({
                icon: '📦',
                label: 'Quantidade Total',
                value: total,
                format: 'number'
            });
        }

        if (config.totalWeight) {
            const total = data.reduce((sum, item) =>
                sum + parseFloat(item[config.totalWeight] || 0), 0);
            kpis.push({
                icon: '⚖️',
                label: 'Peso Total',
                value: total,
                format: 'weight'
            });
        }

        if (config.count) {
            kpis.push({
                icon: '📊',
                label: 'Total de Registros',
                value: data.length,
                format: 'number'
            });
        }

        if (config.average && config.totalValue) {
            const total = data.reduce((sum, item) =>
                sum + parseFloat(item[config.totalValue] || 0), 0);
            const avg = data.length > 0 ? total / data.length : 0;
            kpis.push({
                icon: '📊',
                label: 'Ticket Médio',
                value: avg,
                format: 'currency'
            });
        }

        return kpis;
    }
}

/**
 * Injeta estilos CSS para os KPI cards
 */
export function injectKPIStyles() {
    if (document.getElementById('kpi-styles')) return;

    const style = document.createElement('style');
    style.id = 'kpi-styles';
    style.textContent = `
        .kpi-cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
            margin: 20px;
        }

        .kpi-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            display: flex;
            gap: 16px;
            align-items: center;
            transition: all 0.2s;
            border: 2px solid transparent;
        }

        .kpi-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-color: #fc0303;
        }

        .kpi-card.highlight {
            border-color: #fc0303;
            background: linear-gradient(135deg, #fff 0%, #fff8f8 100%);
        }

        .kpi-icon {
            font-size: 2.5em;
            line-height: 1;
            flex-shrink: 0;
        }

        .kpi-content {
            flex: 1;
            min-width: 0;
        }

        .kpi-label {
            color: #6c757d;
            font-size: 0.85em;
            font-weight: 500;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .kpi-value {
            color: #212529;
            font-size: 1.8em;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 4px;
        }

        .kpi-trend {
            font-size: 0.85em;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .kpi-trend.trend-up {
            color: #03ff1c;
        }

        .kpi-trend.trend-down {
            color: #fc0303;
        }

        .kpi-trend.trend-neutral {
            color: #6c757d;
        }

        .kpi-subtext {
            color: #6c757d;
            font-size: 0.8em;
            margin-top: 4px;
        }

        /* Variações de cores por tipo */
        .kpi-card[data-type="value"] .kpi-icon {
            color: #fc0303;
        }

        .kpi-card[data-type="quantity"] .kpi-icon {
            color: #0d6efd;
        }

        .kpi-card[data-type="weight"] .kpi-icon {
            color: #6f42c1;
        }

        .kpi-card[data-type="count"] .kpi-icon {
            color: #fd7e14;
        }

        @media (max-width: 768px) {
            .kpi-cards-grid {
                grid-template-columns: 1fr;
            }

            .kpi-value {
                font-size: 1.5em;
            }

            .kpi-icon {
                font-size: 2em;
            }
        }

        /* Animação de loading */
        .kpi-card.loading {
            opacity: 0.6;
            pointer-events: none;
        }

        .kpi-card.loading .kpi-value::after {
            content: '...';
            animation: kpi-loading 1.5s infinite;
        }

        @keyframes kpi-loading {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60%, 100% { content: '...'; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Helper: Cria container para KPIs
 * @param {string} containerId - ID do container
 * @returns {HTMLElement} Elemento criado
 */
export function createKPIContainer(containerId = 'kpiContainer') {
    const container = document.createElement('div');
    container.id = containerId;
    container.className = 'kpi-section';
    return container;
}
