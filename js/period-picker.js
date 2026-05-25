/**
 * Ger Comercial — Period Picker
 *
 * Componente padronizado de seleção de período para todos os dashboards.
 * Substitui as funções setQuickDate() inline por presets canônicos com
 * validação centralizada e preparação para toggle comparativo (FASE 3).
 *
 *   import { mountPeriodPicker } from '../js/period-picker.js';
 *   const picker = mountPeriodPicker({
 *     inputStart: '#dataInicio',
 *     inputEnd:   '#dataFim',
 *     presetsContainer: '.gc-quick-dates',
 *   });
 */

import { validarPeriodo, MAX_DIAS_PERIODO, MAX_DIAS_PERIODO_ESTENDIDO } from './periodo-validator.js';

// =========================================================================
// PRESETS CANÔNICOS
// =========================================================================

const PRESETS = {
    hoje:        { label: 'Hoje',           fn: () => { const h = today(); return { inicio: h, fim: h }; } },
    '7d':        { label: '7 dias',         fn: () => { const h = today(); return { inicio: addDays(h, -7), fim: h }; } },
    '30d':       { label: '30 dias',        fn: () => { const h = today(); return { inicio: addDays(h, -30), fim: h }; } },
    semana:      { label: 'Semana atual',   fn: () => { const h = today(); const d = h.getDay(); const seg = addDays(h, -(d === 0 ? 6 : d - 1)); return { inicio: seg, fim: h }; } },
    mes:         { label: 'Mês atual',      fn: () => { const h = today(); return { inicio: new Date(h.getFullYear(), h.getMonth(), 1), fim: h }; } },
    mesAnterior: { label: 'Mês anterior',   fn: () => { const h = today(); return { inicio: new Date(h.getFullYear(), h.getMonth() - 1, 1), fim: new Date(h.getFullYear(), h.getMonth(), 0) }; } },
    trimestre:   { label: 'Trimestre',      fn: () => { const h = today(); const q = Math.floor(h.getMonth() / 3) * 3; return { inicio: new Date(h.getFullYear(), q, 1), fim: h }; } },
    ano:         { label: 'Ano atual',      fn: () => { const h = today(); return { inicio: new Date(h.getFullYear(), 0, 1), fim: h }; } },
};

const DEFAULT_PRESETS = ['30d', 'mes', 'mesAnterior', 'trimestre', 'ano'];

function today() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function toISO(d) { return d.toISOString().split('T')[0]; }

/**
 * Calcula o período comparativo (mesmo tamanho, imediatamente anterior).
 * Ex: 01/mai–31/mai → 01/abr–30/abr
 */
export function periodoAnterior(inicio, fim) {
    const d0 = new Date(inicio), d1 = new Date(fim);
    const dias = Math.round((d1 - d0) / 86400000);
    const fimAnt = addDays(d0, -1);
    const inicioAnt = addDays(fimAnt, -dias);
    return { inicio: toISO(inicioAnt), fim: toISO(fimAnt) };
}

/**
 * Calcula o período do mesmo intervalo no ano anterior.
 * Ex: 01/mai/2026–31/mai/2026 → 01/mai/2025–31/mai/2025
 */
export function periodoAnoAnterior(inicio, fim) {
    const d0 = new Date(inicio), d1 = new Date(fim);
    d0.setFullYear(d0.getFullYear() - 1);
    d1.setFullYear(d1.getFullYear() - 1);
    return { inicio: toISO(d0), fim: toISO(d1) };
}

// =========================================================================
// MOUNT
// =========================================================================

/**
 * Monta o period-picker nos inputs existentes. Substitui os botões de preset
 * dentro de `presetsContainer` por versões padronizadas.
 *
 * @param {Object} opts
 * @param {string|HTMLElement} opts.inputStart       Seletor do input de data início
 * @param {string|HTMLElement} opts.inputEnd         Seletor do input de data fim
 * @param {string|HTMLElement} opts.presetsContainer Seletor do container de botões preset
 * @param {string[]} [opts.presets]                  IDs dos presets a mostrar (default: DEFAULT_PRESETS)
 * @param {string}   [opts.defaultPreset]            Preset a aplicar na montagem (se inputs vazios)
 * @param {boolean}  [opts.extendedLimit=false]      Permite 366 dias (default: 100)
 * @returns {{ getStart, getEnd, setPreset, getPresetList }}
 */
export function mountPeriodPicker({
    inputStart,
    inputEnd,
    presetsContainer,
    presets = DEFAULT_PRESETS,
    defaultPreset = null,
    extendedLimit = false,
} = {}) {
    const elStart = resolve(inputStart);
    const elEnd = resolve(inputEnd);
    const elPresets = resolve(presetsContainer);

    if (!elStart || !elEnd) {
        console.warn('PeriodPicker: inputs de data não encontrados');
        return null;
    }

    // Renderiza botões de preset (substitui conteúdo do container)
    if (elPresets) {
        elPresets.classList.add('gc-quick-dates');
        elPresets.innerHTML = '';
        presets.forEach(id => {
            const preset = PRESETS[id];
            if (!preset) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'gc-btn gc-btn--ghost';
            btn.textContent = preset.label;
            btn.addEventListener('click', () => applyPreset(id));
            elPresets.appendChild(btn);
        });
    }

    function applyPreset(id) {
        const preset = PRESETS[id];
        if (!preset) return;
        const { inicio, fim } = preset.fn();
        elStart.value = toISO(inicio);
        elEnd.value = toISO(fim);
    }

    // Aplica preset default se inputs estiverem vazios
    if (defaultPreset && !elStart.value && !elEnd.value) {
        applyPreset(defaultPreset);
    }

    return {
        getStart: () => elStart.value,
        getEnd: () => elEnd.value,
        setPreset: applyPreset,
        getPresetList: () => presets.map(id => ({ id, ...PRESETS[id] })),
        validate: () => {
            if (!elStart.value || !elEnd.value) return false;
            return validarPeriodo(elStart.value, elEnd.value, extendedLimit);
        },
    };
}

function resolve(target) {
    if (!target) return null;
    return typeof target === 'string' ? document.querySelector(target) : target;
}

export { PRESETS, DEFAULT_PRESETS };
