/**
 * periodo-validator.js
 * Validação centralizada de período máximo para todos os dashboards.
 *
 * O banco de dados Turso possui limite de leituras; para evitar consultas
 * excessivas, o período máximo permitido em qualquer filtro de data é
 * definido por MAX_DIAS_PERIODO (padrão: 100 dias).
 *
 * Usuários com a flag periodo_estendido podem consultar até 366 dias.
 */

export const MAX_DIAS_PERIODO = 100;
export const MAX_DIAS_PERIODO_ESTENDIDO = 366;

/**
 * Retorna o limite de dias do usuário logado.
 * Lê a sessão do localStorage/sessionStorage para verificar a flag periodoEstendido.
 */
function getMaxDiasUsuario() {
    try {
        const sessionJSON = sessionStorage.getItem('ger_comercial_auth')
            || localStorage.getItem('ger_comercial_auth');
        if (sessionJSON) {
            const session = JSON.parse(sessionJSON);
            if (session.periodoEstendido) {
                return MAX_DIAS_PERIODO_ESTENDIDO;
            }
        }
    } catch (e) {
        // Em caso de erro, usar limite padrão
    }
    return MAX_DIAS_PERIODO;
}

/**
 * Valida se o intervalo entre dataInicio e dataFim não excede o limite do usuário.
 *
 * @param {string} dataInicio - Data inicial no formato YYYY-MM-DD
 * @param {string} dataFim    - Data final no formato YYYY-MM-DD
 * @returns {boolean} true se o período é válido; false e exibe alerta caso contrário
 */
export function validarPeriodo(dataInicio, dataFim) {
    const inicio = new Date(dataInicio + 'T00:00:00');
    const fim    = new Date(dataFim    + 'T00:00:00');

    const diffDias = Math.round((fim - inicio) / (1000 * 60 * 60 * 24));
    const maxDias = getMaxDiasUsuario();

    if (diffDias > maxDias) {
        alert(
            `O período máximo que pode ser filtrado são ${maxDias} dias!\n\n` +
            `Período selecionado: ${diffDias} dias.\n` +
            `Ajuste as datas para um intervalo de até ${maxDias} dias e tente novamente.`
        );
        return false;
    }

    return true;
}
