/**
 * Ger Comercial — Utilitarios Mobile
 *
 * Comportamentos interativos exclusivos do mobile:
 *   1. Toggle da secao de filtros (collapse / expand)
 *   2. Hint de scroll horizontal nas tabelas
 *   3. Scroll-to-top button
 *   4. Table scroll-end detection
 *   5. Viewport height fix for mobile browsers
 *
 * Como funcionar:
 *   Inclui-se via  <script src="js/mobile.js"></script>
 *   O script verifica se os elementos relevantes existem
 *   na pagina antes de atuar — sem erros em paginas sem filtros.
 */

(function () {
    'use strict';

    var BREAKPOINT = 768;

    var filterToggleBtn  = null;
    var filtersSection   = null;
    var scrollToTopBtn   = null;

    /* --------------------------------------------------------
       Inicializacao apos DOM pronto
       -------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', function () {
        filtersSection = document.querySelector('.filters-section');

        if (filtersSection) {
            initFilterToggle();
        }

        initScrollHints();
        initTableScrollDetection();
        initScrollToTop();
        fixMobileViewportHeight();

        window.addEventListener('resize', onResize);
    });


    /* --------------------------------------------------------
       1. TOGGLE DE FILTROS
       Injeta um botao antes da .filters-section e gerencia
       o estado aberto/fechado via classe .mobile-filters-collapsed
       -------------------------------------------------------- */

    function initFilterToggle() {
        filterToggleBtn = document.createElement('button');
        filterToggleBtn.className  = 'mobile-filter-toggle';
        filterToggleBtn.setAttribute('aria-expanded', 'false');
        filterToggleBtn.setAttribute('aria-label', 'Mostrar ou ocultar filtros');
        filterToggleBtn.innerHTML  =
            '<span>\uD83D\uDD0D Filtros</span>' +
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
            // Scroll to filters so they are visible
            setTimeout(function () {
                filtersSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 50);
        } else {
            filtersSection.classList.add('mobile-filters-collapsed');
            filterToggleBtn.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * Sincroniza o estado visual com a largura da tela.
     * Desktop  -> botao oculto, filtros visiveis.
     * Mobile   -> botao visivel, filtros fechados por padrao.
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
       transborda horizontalmente. Re-verifica quando o
       tbody e alterado (dados carregados assincronamente).
       -------------------------------------------------------- */

    function initScrollHints() {
        var wrappers = document.querySelectorAll('.table-wrapper, .table-container');
        wrappers.forEach(checkAndAddHint);

        /* Observa mudancas no tbody para re-verificar apos dados carregarem */
        var tbodies = document.querySelectorAll('tbody');
        tbodies.forEach(function (tbody) {
            var observer = new MutationObserver(function () {
                document.querySelectorAll('.table-wrapper, .table-container')
                    .forEach(checkAndAddHint);
            });
            observer.observe(tbody, { childList: true });
        });
    }

    function checkAndAddHint(wrapper) {
        if (window.innerWidth > BREAKPOINT) return;
        if (wrapper.dataset.hintAdded)        return;

        /* Pequeno delay para garantir que a tabela ja foi renderizada */
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
       3. TABLE SCROLL-END DETECTION
       Adds/removes .scrolled-end class when table is scrolled
       all the way to the right, to hide the fade gradient.
       -------------------------------------------------------- */

    function initTableScrollDetection() {
        var wrappers = document.querySelectorAll('.table-wrapper, .table-container');
        wrappers.forEach(function (wrapper) {
            wrapper.addEventListener('scroll', function () {
                var atEnd = wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 2;
                wrapper.classList.toggle('scrolled-end', atEnd);
            }, { passive: true });
        });

        /* Also observe for dynamically added wrappers */
        var mainContent = document.querySelector('.main-content') || document.body;
        var mo = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                m.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;
                    var newWrappers = node.querySelectorAll
                        ? node.querySelectorAll('.table-wrapper, .table-container')
                        : [];
                    newWrappers.forEach(function (w) {
                        w.addEventListener('scroll', function () {
                            var atEnd = w.scrollLeft + w.clientWidth >= w.scrollWidth - 2;
                            w.classList.toggle('scrolled-end', atEnd);
                        }, { passive: true });
                    });
                });
            });
        });
        mo.observe(mainContent, { childList: true, subtree: true });
    }


    /* --------------------------------------------------------
       4. SCROLL TO TOP BUTTON
       Shows a floating button when scrolled down more than
       400px. Only on mobile.
       -------------------------------------------------------- */

    function initScrollToTop() {
        if (window.innerWidth > BREAKPOINT) return;

        scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.className = 'scroll-to-top';
        scrollToTopBtn.setAttribute('aria-label', 'Voltar ao topo');
        scrollToTopBtn.innerHTML = '\u2191';
        document.body.appendChild(scrollToTopBtn);

        scrollToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(function () {
                    if (scrollToTopBtn) {
                        var show = window.scrollY > 400;
                        scrollToTopBtn.classList.toggle('visible', show);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }


    /* --------------------------------------------------------
       5. MOBILE VIEWPORT HEIGHT FIX
       Sets a CSS custom property --vh for use in layouts that
       need 100vh without the mobile browser bar issue.
       -------------------------------------------------------- */

    function fixMobileViewportHeight() {
        var setVh = function () {
            var vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', vh + 'px');
        };
        setVh();
        window.addEventListener('resize', setVh);
    }


    /* --------------------------------------------------------
       6. RESIZE — sincroniza ao rotacionar dispositivo
       -------------------------------------------------------- */

    function onResize() {
        syncToggleState();

        // Show/hide scroll to top based on breakpoint
        if (scrollToTopBtn) {
            if (window.innerWidth > BREAKPOINT) {
                scrollToTopBtn.style.display = 'none';
            } else {
                scrollToTopBtn.style.display = '';
            }
        }
    }

})();
