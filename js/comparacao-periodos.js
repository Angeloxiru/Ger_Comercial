/**
 * Módulo de Comparação de Períodos
 * Permite comparar dados entre dois períodos diferentes
 * @version 1.0
 * @date 2025-01-16
 */

export class ComparacaoPeriodos {
    constructor() {
        this.comparacaoAtiva = false;
        this.periodo1 = { inicio: null, fim: null };
        this.periodo2 = { inicio: null, fim: null };
    }

    /**
     * Renderiza a UI de comparação de períodos
     * @param {HTMLElement} containerElement - Elemento onde será inserida a UI
     */
    renderUI(containerElement) {
        const html = `
            <div class="comparacao-container" style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0066cc;">
                <label style="display: flex; align-items: center; gap: 12px; font-size: 1.1em; font-weight: 600; cursor: pointer; color: #0066cc;">
                    <input type="checkbox" id="ativar-comparacao" style="width: 20px; height: 20px; cursor: pointer;">
                    <span>📊 Comparar com outro período</span>
                </label>

                <div id="campos-comparacao" style="display: none; margin-top: 20px; padding: 20px; background: white; border-radius: 8px; border: 1px solid #0066cc;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 20px;">
                        <div>
                            <h4 style="color: #0066cc; margin-bottom: 10px;">📊 PERÍODO PRINCIPAL</h4>
                            <p style="font-size: 0.95em; color: #495057;">
                                De: <strong id="periodo1-inicio">-</strong>
                                até <strong id="periodo1-fim">-</strong>
                            </p>
                        </div>

                        <div>
                            <h4 style="color: #0066cc; margin-bottom: 10px;">📊 PERÍODO DE COMPARAÇÃO</h4>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="radio" name="tipo-comparacao" value="mes-anterior" checked>
                                    <span>Mês anterior</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="radio" name="tipo-comparacao" value="personalizado">
                                    <span>Período personalizado</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div id="periodo-personalizado" style="display: none; padding: 15px; background: #f8f9fa; border-radius: 6px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.9em;">De:</label>
                                <input type="date" id="comp-inicio" style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 6px;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.9em;">Até:</label>
                                <input type="date" id="comp-fim" style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 6px;">
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 15px; padding: 12px; background: #fff3cd; border-radius: 6px; border-left: 3px solid #ffc107;">
                        <p style="margin: 0; font-size: 0.9em; color: #856404;">
                            <strong>💡 Dica:</strong> Os mesmos filtros (rota, cidade, representante, etc.) serão aplicados em ambos os períodos para uma comparação justa.
                        </p>
                    </div>
                </div>
            </div>
        `;

        containerElement.insertAdjacentHTML('afterbegin', html);
        this.setupEventListeners();
    }

    /**
     * Configura os event listeners da UI
     */
    setupEventListeners() {
        const checkbox = document.getElementById('ativar-comparacao');
        const camposComparacao = document.getElementById('campos-comparacao');
        const tipoComparacao = document.getElementsByName('tipo-comparacao');
        const periodoPersonalizado = document.getElementById('periodo-personalizado');

        // Toggle visibility dos campos
        checkbox.addEventListener('change', (e) => {
            this.comparacaoAtiva = e.target.checked;
            camposComparacao.style.display = e.target.checked ? 'block' : 'none';
        });

        // Toggle periodo personalizado
        tipoComparacao.forEach(radio => {
            radio.addEventListener('change', (e) => {
                periodoPersonalizado.style.display =
                    e.target.value === 'personalizado' ? 'block' : 'none';
            });
        });
    }

    /**
     * Atualiza os labels do período principal
     * @param {string} dataInicio
     * @param {string} dataFim
     */
    atualizarPeriodoPrincipal(dataInicio, dataFim) {
        this.periodo1 = { inicio: dataInicio, fim: dataFim };

        const p1Inicio = document.getElementById('periodo1-inicio');
        const p1Fim = document.getElementById('periodo1-fim');

        if (p1Inicio && p1Fim) {
            p1Inicio.textContent = this.formatarData(dataInicio);
            p1Fim.textContent = this.formatarData(dataFim);
        }
    }

    /**
     * Calcula o período de comparação baseado no tipo selecionado
     * @returns {Object} {inicio, fim}
     */
    calcularPeriodoComparacao() {
        const tipoSelecionado = document.querySelector('input[name="tipo-comparacao"]:checked').value;

        if (tipoSelecionado === 'personalizado') {
            const inicio = document.getElementById('comp-inicio').value;
            const fim = document.getElementById('comp-fim').value;

            if (!inicio || !fim) {
                throw new Error('Por favor, selecione as datas de início e fim do período de comparação');
            }

            return { inicio, fim };
        }

        // Mês anterior
        const p1Inicio = new Date(this.periodo1.inicio);
        const p1Fim = new Date(this.periodo1.fim);

        // Calcular diferença de dias
        const diffTime = Math.abs(p1Fim - p1Inicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Subtrair o mesmo número de dias
        const p2Fim = new Date(p1Inicio);
        p2Fim.setDate(p2Fim.getDate() - 1);

        const p2Inicio = new Date(p2Fim);
        p2Inicio.setDate(p2Inicio.getDate() - diffDays);

        return {
            inicio: p2Inicio.toISOString().split('T')[0],
            fim: p2Fim.toISOString().split('T')[0]
        };
    }

    /**
     * Calcula a variação entre dois valores
     * @param {number} valorAtual
     * @param {number} valorAnterior
     * @returns {Object} {diferenca, percentual, direcao}
     */
    calcularVariacao(valorAtual, valorAnterior) {
        if (valorAnterior === 0 || valorAnterior === null || valorAnterior === undefined) {
            return {
                diferenca: valorAtual,
                percentual: 100,
                direcao: valorAtual > 0 ? 'up' : 'neutral'
            };
        }

        const diferenca = valorAtual - valorAnterior;
        const percentual = ((diferenca / valorAnterior) * 100);
        const direcao = diferenca > 0 ? 'up' : diferenca < 0 ? 'down' : 'neutral';

        return {
            diferenca,
            percentual: Math.abs(percentual),
            direcao
        };
    }

    /**
     * Renderiza um indicador de variação
     * @param {Object} variacao - Objeto retornado por calcularVariacao()
     * @param {string} tipo - 'valor', 'quantidade' ou 'peso'
     * @returns {string} HTML do indicador
     */
    renderIndicador(variacao, tipo = 'valor') {
        const { diferenca, percentual, direcao } = variacao;

        let corClasse = '';
        let icone = '';

        if (direcao === 'up') {
            corClasse = 'color: #28a745; font-weight: bold;';
            icone = '↑';
        } else if (direcao === 'down') {
            corClasse = 'color: #dc3545; font-weight: bold;';
            icone = '↓';
        } else {
            corClasse = 'color: #6c757d; font-weight: bold;';
            icone = '→';
        }

        let simbolo = '';
        if (tipo === 'valor') simbolo = 'R$';
        if (tipo === 'quantidade') simbolo = 'un';
        if (tipo === 'peso') simbolo = 'kg';

        const diferencaFormatada = tipo === 'valor'
            ? this.formatarMoeda(Math.abs(diferenca))
            : Math.abs(diferenca).toLocaleString('pt-BR');

        const sinal = diferenca >= 0 ? '+' : '-';

        return `
            <div style="${corClasse} font-size: 0.95em; margin-top: 8px; display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 1.2em;">${icone}</span>
                <span>${sinal}${percentual.toFixed(1)}% vs período anterior</span>
                <span style="opacity: 0.8;">(${sinal}${diferencaFormatada} ${simbolo})</span>
            </div>
        `;
    }

    /**
     * Cria um gráfico de comparação entre dois períodos
     * @param {HTMLCanvasElement} canvas
     * @param {Object} dados1 - Dados do período 1
     * @param {Object} dados2 - Dados do período 2
     * @param {Array} labels - Labels para o eixo X
     */
    criarGraficoComparacao(canvas, dados1, dados2, labels) {
        const ctx = canvas.getContext('2d');

        // Destruir gráfico existente se houver
        if (canvas.chart) {
            canvas.chart.destroy();
        }

        canvas.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Período Principal',
                        data: dados1,
                        backgroundColor: 'rgba(252, 3, 3, 0.7)',
                        borderColor: 'rgba(252, 3, 3, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Período Comparação',
                        data: dados2,
                        backgroundColor: 'rgba(108, 117, 125, 0.5)',
                        borderColor: 'rgba(108, 117, 125, 1)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.parsed.y.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                });
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0
                                });
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Formata uma data no padrão brasileiro
     * @param {string} data - Data no formato YYYY-MM-DD
     * @returns {string} Data formatada
     */
    formatarData(data) {
        if (!data) return '-';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    /**
     * Formata um valor monetário
     * @param {number} valor
     * @returns {string}
     */
    formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    /**
     * Verifica se a comparação está ativa
     * @returns {boolean}
     */
    isAtiva() {
        return this.comparacaoAtiva;
    }
}

// Exportar instância singleton
export const comparacaoPeriodos = new ComparacaoPeriodos();
