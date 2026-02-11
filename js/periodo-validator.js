/**
 * periodo-validator.js
 * Validação centralizada de período máximo para todos os dashboards.
 *
 * O banco de dados Turso possui limite de leituras; para evitar consultas
 * excessivas, o período máximo permitido em qualquer filtro de data é
 * definido por MAX_DIAS_PERIODO.
 */

export const MAX_DIAS_PERIODO = 100;

/**
 * Valida se o intervalo entre dataInicio e dataFim não excede MAX_DIAS_PERIODO.
 *
 * @param {string} dataInicio - Data inicial no formato YYYY-MM-DD
 * @param {string} dataFim    - Data final no formato YYYY-MM-DD
 * @returns {boolean} true se o período é válido; false e exibe alerta caso contrário
 */
export function validarPeriodo(dataInicio, dataFim) {
    const inicio = new Date(dataInicio + 'T00:00:00');
    const fim    = new Date(dataFim    + 'T00:00:00');

    const diffDias = Math.round((fim - inicio) / (1000 * 60 * 60 * 24));

    if (diffDias > MAX_DIAS_PERIODO) {
        alert(
            `O período máximo que pode ser filtrado são ${MAX_DIAS_PERIODO} dias!\n\n` +
            `Período selecionado: ${diffDias} dias.\n` +
            `Ajuste as datas para um intervalo de até ${MAX_DIAS_PERIODO} dias e tente novamente.`
        );
        return false;
    }

    return true;
}
