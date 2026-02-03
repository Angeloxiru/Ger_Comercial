/**
 * Ger Comercial — Utilitários Mobile
 *
 * Comportamentos interativos exclusivos do mobile:
 *   1. Toggle da seção de filtros (collapse / expand)
 *   2. Hint de scroll horizontal nas tabelas
 *
 * Como funcionar:
 *   Inclui-se via  <script src="js/mobile.js"></script>
 *   O script verifica se os elementos relevantes existem
 *   na página antes de atuar — sem erros em páginas sem filtros.
 */

(function () {
    'use strict';

    var BREAKPOINT = 768;

    var filterToggleBtn  = null;
    var filtersSection   = null;

    /* --------------------------------------------------------
       Inicialização após DOM pronto
       -------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', function () {
        filtersSection = document.querySelector('.filters-section');

        if (filtersSection) {
            initFilterToggle();
        }

        initScrollHints();

        window.addEventListener('resize', onResize);
    });


    /* --------------------------------------------------------
       1. TOGGLE DE FILTROS
       Injeta um botão antes da .filters-section e gerencia
       o estado aberto/fechado via classe .mobile-filters-collapsed
       -------------------------------------------------------- */

    function initFilterToggle() {
        filterToggleBtn = document.createElement('button');
        filterToggleBtn.className  = 'mobile-filter-toggle';
        filterToggleBtn.setAttribute('aria-expanded', 'false');
        filterToggleBtn.innerHTML  =
            '<span>\u{1F50D} Filtros</span>' +
            '<span class="mobile-filter-arrow">\u25BC</span>';

        filterToggleBtn.addEventListener('click', toggleFilters);

        filtersSection.parentNode.insertBefore(filterToggleBtn, filtersSection);

        syncToggleState();
    }

    function toggleFilters() {
        if (!filtersSection) return;

        var collapsed = filtersSection.classList.contains('mobile-filters-collapsed');

        if (collapsed) {
            filtersSection.classList.remove('mobile-filters-collapsed');
            filterToggleBtn.setAttribute('aria-expanded', 'true');
        } else {
            filtersSection.classList.add('mobile-filters-collapsed');
            filterToggleBtn.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * Sincrona o estado visual com a largura da tela.
     * Desktop  → botão oculto, filtros visíveis.
     * Mobile   → botão visível, filtros fechados por padrão.
     */
    function syncToggleState() {
        if (!filtersSection || !filterToggleBtn) return;

        if (window.innerWidth <= BREAKPOINT) {
            filterToggleBtn.style.display = '';
            if (!filtersSection.classList.contains('mobile-filters-collapsed')) {
                filtersSection.classList.add('mobile-filters-collapsed');
                filterToggleBtn.setAttribute('aria-expanded', 'false');
            }
        } else {
            filterToggleBtn.style.display = 'none';
            filtersSection.classList.remove('mobile-filters-collapsed');
        }
    }


    /* --------------------------------------------------------
       2. HINT DE SCROLL HORIZONTAL
       Adiciona um texto indicador acima de cada tabela que
       transborda horizontalmente.  Re-verifica quando o
       tbody é alterado (dados carregados assincronamente).
       -------------------------------------------------------- */

    function initScrollHints() {
        var wrappers = document.querySelectorAll('.table-wrapper, .table-container');
        wrappers.forEach(checkAndAddHint);

        /* Observa mudanças no tbody para re-verificar após dados carregarem */
        var tbody = document.querySelector('tbody');
        if (tbody) {
            var observer = new MutationObserver(function () {
                document.querySelectorAll('.table-wrapper, .table-container')
                    .forEach(checkAndAddHint);
            });
            observer.observe(tbody, { childList: true });
        }
    }

    function checkAndAddHint(wrapper) {
        if (window.innerWidth > BREAKPOINT) return;
        if (wrapper.dataset.hintAdded)        return;

        /* Pequeno delay para garantir que a tabela já foi renderizada */
        setTimeout(function () {
            if (wrapper.scrollWidth > wrapper.clientWidth + 4) {
                var hint = document.createElement('div');
                hint.className  = 'mobile-scroll-hint';
                hint.textContent = '\u2190 Deslize para ver mais \u2192';
                wrapper.parentNode.insertBefore(hint, wrapper);
                wrapper.dataset.hintAdded = 'true';
            }
        }, 350);
    }


    /* --------------------------------------------------------
       3. RESIZE — sincroniza ao rotacionar dispositivo
       -------------------------------------------------------- */

    function onResize() {
        syncToggleState();
    }

})();
