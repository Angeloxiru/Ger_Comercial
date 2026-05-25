/**
 * Ger Comercial — Saved Views (Visões Salvas)
 *
 * Permite ao usuário salvar combinações de filtros com um nome ("Minha rota",
 * "Top 10 que mais caíram") e reaplicá-las com um clique.
 *
 * Usa a tabela `user_views` no Turso (auto-criada no primeiro uso).
 *
 *   import { mountSavedViews } from '../js/saved-views.js';
 *   mountSavedViews({
 *     dashboard: 'vendas-equipe',
 *     container: '#savedViewsSlot',
 *     snapshotFn: snapshotFilters,
 *     applyFn: (params) => { hydrate + fetch },
 *   });
 */

import { db } from './db.js';

// =========================================================================
// DB — CRUD na tabela user_views
// =========================================================================

let tableReady = false;

async function ensureTable() {
    if (tableReady) return;
    if (!db.isConnected()) await db.connect();
    await db.execute(`
        CREATE TABLE IF NOT EXISTS user_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            dashboard TEXT NOT NULL,
            params_json TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);
    tableReady = true;
}

function getUsername() {
    try {
        const session = JSON.parse(localStorage.getItem('ger_comercial_session') || sessionStorage.getItem('ger_comercial_session') || 'null');
        return session?.username || null;
    } catch { return null; }
}

export async function saveView(name, dashboard, params) {
    await ensureTable();
    const user = getUsername();
    if (!user) throw new Error('Usuário não autenticado');
    await db.execute(
        'INSERT INTO user_views (user_id, name, dashboard, params_json) VALUES (?, ?, ?, ?)',
        [user, name.trim(), dashboard, JSON.stringify(params)]
    );
}

export async function listViews(dashboard) {
    await ensureTable();
    const user = getUsername();
    if (!user) return [];
    const result = await db.execute(
        'SELECT id, name, params_json, created_at FROM user_views WHERE user_id = ? AND dashboard = ? ORDER BY created_at DESC',
        [user, dashboard]
    );
    return result.rows || [];
}

export async function deleteView(id) {
    await ensureTable();
    const user = getUsername();
    if (!user) return;
    await db.execute(
        'DELETE FROM user_views WHERE id = ? AND user_id = ?',
        [id, user]
    );
}

// =========================================================================
// UI — Componente montável nos dashboards
// =========================================================================

/**
 * Monta a barra de visões salvas dentro do container indicado.
 *
 * @param {Object} opts
 * @param {string}   opts.dashboard   ID do dashboard (ex: 'vendas-equipe')
 * @param {string|HTMLElement} opts.container  Seletor ou elemento onde montar
 * @param {() => Object} opts.snapshotFn  Função que retorna o estado atual dos filtros
 * @param {(params: Object) => void} opts.applyFn  Função que aplica filtros salvos e busca dados
 */
export async function mountSavedViews({ dashboard, container, snapshotFn, applyFn }) {
    const host = typeof container === 'string' ? document.querySelector(container) : container;
    if (!host) return;

    host.classList.add('gc-saved-views');
    host.innerHTML = `
        <select class="gc-saved-views__select" title="Visões salvas">
            <option value="">⭐ Visões salvas…</option>
        </select>
        <button type="button" class="gc-btn gc-btn--ghost gc-saved-views__save" title="Salvar visão atual">💾</button>
        <button type="button" class="gc-btn gc-btn--ghost gc-saved-views__delete" title="Excluir visão selecionada" style="display:none">🗑️</button>
    `;

    const select = host.querySelector('.gc-saved-views__select');
    const btnSave = host.querySelector('.gc-saved-views__save');
    const btnDelete = host.querySelector('.gc-saved-views__delete');

    async function refresh() {
        try {
            const views = await listViews(dashboard);
            select.innerHTML = '<option value="">⭐ Visões salvas…</option>';
            views.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.id;
                opt.textContent = v.name;
                opt.dataset.params = v.params_json;
                select.appendChild(opt);
            });
        } catch (e) {
            console.warn('Saved views: erro ao carregar', e);
        }
    }

    select.addEventListener('change', () => {
        const opt = select.selectedOptions[0];
        btnDelete.style.display = opt?.value ? '' : 'none';
        if (!opt?.value || !opt.dataset.params) return;
        try {
            const params = JSON.parse(opt.dataset.params);
            applyFn(params);
        } catch (e) {
            console.error('Saved views: erro ao aplicar', e);
        }
    });

    btnSave.addEventListener('click', async () => {
        const name = prompt('Nome da visão (ex: "Minha rota", "Top 10 que caíram"):');
        if (!name?.trim()) return;
        try {
            const params = snapshotFn();
            await saveView(name, dashboard, params);
            await refresh();
            select.value = '';
            btnDelete.style.display = 'none';
        } catch (e) {
            alert('Erro ao salvar visão: ' + e.message);
        }
    });

    btnDelete.addEventListener('click', async () => {
        const id = select.value;
        if (!id) return;
        const name = select.selectedOptions[0]?.textContent;
        if (!confirm(`Excluir a visão "${name}"?`)) return;
        try {
            await deleteView(id);
            await refresh();
            select.value = '';
            btnDelete.style.display = 'none';
        } catch (e) {
            alert('Erro ao excluir: ' + e.message);
        }
    });

    await refresh();
}
