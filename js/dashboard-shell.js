/**
 * Ger Comercial — Dashboard Shell
 *
 * Pequena biblioteca de "mount" para o chrome compartilhado dos 10
 * dashboards: header, badge de frescor ("atualizado há X min"),
 * loading, alertas, exportação e leitura/escrita de filtros na URL.
 *
 * Adoção é incremental — dashboards podem migrar um a um. Importar
 * apenas o que precisar:
 *
 *   import { mountHeader, mountFreshness, mountLoading,
 *            urlFilters } from '../js/dashboard-shell.js';
 *
 * Estilos vivem em `css/dashboard-shell.css` (classes `gc-*`).
 *
 * NÃO duplique aqui regras específicas de um dashboard. Se um padrão
 * surge em 3+ dashboards, ele vira shell. Antes disso, fica local.
 *
 * Ver decisões em: docs/ARQUITETURA.md (ADR-006) e docs/UX_INVESTIGATIVA.md.
 */

const GERMANI_LOGO_URL =
  'https://static.wixstatic.com/media/ce3165_c01db19c0ef64e2abb8c894c7ecc6f95~mv2.png/v1/fill/w_161,h_69,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logomarca-Germani-2023-Branca-borda-dour.png';

/* =========================================================================
 * HEADER
 * =======================================================================*/

/**
 * Renderiza o header padrão de dashboard dentro do elemento informado.
 *
 * @param {Object}  options
 * @param {HTMLElement|string} options.target  elemento (ou seletor) onde injetar
 * @param {string}  options.title              título do dashboard
 * @param {string} [options.subtitle]          subtítulo opcional
 * @param {string} [options.backHref='../index.html']  destino do botão voltar
 * @param {boolean} [options.showFreshness=true] renderiza o slot de "atualizado há…"
 * @returns {{ freshnessEl: HTMLElement|null }}
 */
export function mountHeader({
  target,
  title,
  subtitle,
  backHref = '../index.html',
  showFreshness = true,
} = {}) {
  const host = resolveTarget(target);
  if (!host) throw new Error('mountHeader: target inválido');

  host.classList.add('gc-header');
  host.innerHTML = `
    <div class="gc-header__left">
      <div class="gc-header__logo">
        <img src="${GERMANI_LOGO_URL}" alt="Germani Alimentos">
      </div>
      <div>
        <h1 class="gc-header__title">${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="gc-header__subtitle">${escapeHtml(subtitle)}</p>` : ''}
      </div>
    </div>
    <div class="gc-header__right">
      ${showFreshness ? '<span class="gc-freshness" data-gc-freshness hidden></span>' : ''}
      <a class="gc-btn-back" href="${backHref}">← Voltar</a>
    </div>
  `;

  return {
    freshnessEl: showFreshness ? host.querySelector('[data-gc-freshness]') : null,
  };
}

/* =========================================================================
 * FRESHNESS BADGE — "atualizado há X min"
 *
 * Ver MODELO_TEMPORAL.md §2. Sem isso o investigador desconfia em silêncio.
 * =======================================================================*/

/**
 * Atualiza o badge de frescor. Idempotente; pode ser chamado depois de
 * cada refresh dos dados do dashboard.
 *
 * @param {HTMLElement} el
 * @param {Date|number} updatedAt  Date ou timestamp em ms
 * @param {Object} [opts]
 * @param {number} [opts.staleMinutes=15]  acima disso vira "amarelo"
 */
export function setFreshness(el, updatedAt, { staleMinutes = 15 } = {}) {
  if (!el) return;
  const ts = updatedAt instanceof Date ? updatedAt.getTime() : Number(updatedAt);
  if (!Number.isFinite(ts)) {
    el.hidden = true;
    return;
  }
  el.hidden = false;

  const render = () => {
    const ageMs = Date.now() - ts;
    el.textContent = '🕒 atualizado ' + formatAge(ageMs);
    el.dataset.stale = String(ageMs > staleMinutes * 60_000);
    el.title = new Date(ts).toLocaleString('pt-BR');
  };

  render();
  // Re-render leve a cada 30 s mantém a percepção temporal viva
  clearInterval(el.__gcTimer);
  el.__gcTimer = setInterval(render, 30_000);
}

function formatAge(ageMs) {
  if (ageMs < 30_000)        return 'agora';
  const min = Math.floor(ageMs / 60_000);
  if (min < 60)              return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24)                return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} d`;
}

/* =========================================================================
 * LOADING
 * =======================================================================*/

/**
 * Renderiza estrutura de loading dentro do elemento alvo e devolve helpers.
 *
 * @param {HTMLElement|string} target
 * @returns {{ show: () => void, hide: () => void, el: HTMLElement }}
 */
export function mountLoading(target) {
  const host = resolveTarget(target);
  if (!host) throw new Error('mountLoading: target inválido');

  host.classList.add('gc-loading');
  host.innerHTML = `
    <div class="gc-spinner"></div>
    <div data-gc-loading-text>Carregando…</div>
  `;

  return {
    el: host,
    show: (msg) => {
      if (msg) host.querySelector('[data-gc-loading-text]').textContent = msg;
      host.classList.add('is-active');
    },
    hide: () => host.classList.remove('is-active'),
  };
}

/* =========================================================================
 * ALERTAS
 * =======================================================================*/

/**
 * @param {HTMLElement|string} target
 * @param {string} message
 * @param {'info'|'warning'|'danger'} [variant='info']
 */
export function mountAlert(target, message, variant = 'info') {
  const host = resolveTarget(target);
  if (!host) return;
  host.classList.add('gc-alert', `gc-alert--${variant}`);
  host.textContent = message;
}

/* =========================================================================
 * FILTROS NA URL
 *
 * Princípio P3 (UX_INVESTIGATIVA.md): contexto viaja com o usuário.
 * Filtros vivem em querystring; navegação entre dashboards preserva
 * supervisor/representante/cidade/período etc.
 * =======================================================================*/

export const urlFilters = {
  /** Lê todos os filtros da querystring vigente. Valores múltiplos viram array. */
  read() {
    const params = new URLSearchParams(window.location.search);
    const out = {};
    for (const key of new Set(params.keys())) {
      const values = params.getAll(key);
      out[key] = values.length > 1 ? values : values[0];
    }
    return out;
  },

  /**
   * Atualiza a URL com os filtros informados, sem reload.
   * Valores `null`, `undefined` ou `''` removem o parâmetro.
   *
   * @param {Object<string, string|string[]|null>} patch
   */
  write(patch) {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(patch)) {
      params.delete(key);
      if (value == null || value === '') continue;
      if (Array.isArray(value)) {
        for (const v of value) if (v != null && v !== '') params.append(key, String(v));
      } else {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    const url = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
    window.history.replaceState(null, '', url);
  },

  /**
   * Monta uma URL contextual para outro dashboard, propagando os filtros
   * compatíveis. Use para drill-down (princípio P6 da UX_INVESTIGATIVA).
   *
   * @param {string} href
   * @param {Object<string, string|string[]>} extra  filtros adicionais
   * @param {string[]} [carry]  whitelist de chaves a propagar (default: todas)
   */
  link(href, extra = {}, carry = null) {
    const current = this.read();
    const merged = {};
    const keys = carry ?? Object.keys(current);
    for (const k of keys) if (current[k] != null) merged[k] = current[k];
    Object.assign(merged, extra);
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v == null || v === '') continue;
      if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
      else params.set(k, String(v));
    }
    const qs = params.toString();
    return href + (qs ? `?${qs}` : '');
  },
};

/* =========================================================================
 * BOTÃO EXPORT (helper de geração)
 * =======================================================================*/

/**
 * @param {Object} cfg
 * @param {string} cfg.label
 * @param {string} [cfg.icon='⬇']
 * @param {'accent'|'primary'|'secondary'|'ghost'} [cfg.variant='accent']
 * @param {() => void} cfg.onClick
 * @returns {HTMLButtonElement}
 */
export function createExportButton({ label, icon = '⬇', variant = 'accent', onClick }) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `gc-btn gc-btn--${variant}`;
  btn.innerHTML = `<span aria-hidden="true">${icon}</span> ${escapeHtml(label)}`;
  btn.addEventListener('click', onClick);
  return btn;
}

/* =========================================================================
 * UTILITÁRIOS
 * =======================================================================*/

function resolveTarget(target) {
  if (!target) return null;
  return typeof target === 'string' ? document.querySelector(target) : target;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Re-export agrupado para conveniência */
export default {
  mountHeader,
  setFreshness,
  mountLoading,
  mountAlert,
  urlFilters,
  createExportButton,
};
