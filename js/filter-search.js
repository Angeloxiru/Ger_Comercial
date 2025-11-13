/**
 * Sistema de Busca em Filtros (Select)
 *
 * Adiciona busca/autocomplete em elementos select múltiplos
 */

export class FilterSearch {
    constructor(selectId, options = {}) {
        this.selectId = selectId;
        this.select = document.getElementById(selectId);
        this.options = options;
        this.searchInput = null;
        this.allOptions = [];
        this.placeholder = options.placeholder || 'Digite para buscar...';

        if (this.select) {
            this.init();
        }
    }

    /**
     * Inicializa o sistema de busca
     */
    init() {
        // Salva todas as opções originais
        this.saveOriginalOptions();

        // Cria input de busca
        this.createSearchInput();

        // Adiciona eventos
        this.attachEvents();
    }

    /**
     * Salva as opções originais do select
     */
    saveOriginalOptions() {
        this.allOptions = Array.from(this.select.options).map(opt => ({
            value: opt.value,
            text: opt.textContent,
            selected: opt.selected
        }));
    }

    /**
     * Cria campo de busca acima do select
     */
    createSearchInput() {
        const wrapper = document.createElement('div');
        wrapper.className = 'filter-search-wrapper';
        wrapper.style.cssText = 'position: relative; margin-bottom: 6px;';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'filter-search-input';
        input.placeholder = this.placeholder;
        input.style.cssText = `
            width: 100%;
            padding: 8px 32px 8px 10px;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            font-size: 0.9em;
            transition: all 0.2s;
        `;

        const clearBtn = document.createElement('button');
        clearBtn.innerHTML = '✕';
        clearBtn.className = 'filter-search-clear';
        clearBtn.type = 'button';
        clearBtn.style.cssText = `
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: transparent;
            color: #6c757d;
            cursor: pointer;
            padding: 4px 8px;
            font-size: 1em;
            display: none;
        `;

        wrapper.appendChild(input);
        wrapper.appendChild(clearBtn);

        // Insere antes do select
        this.select.parentNode.insertBefore(wrapper, this.select);

        this.searchInput = input;
        this.clearBtn = clearBtn;
    }

    /**
     * Adiciona eventos ao input de busca
     */
    attachEvents() {
        // Evento de digitação
        this.searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            this.filterOptions(searchTerm);

            // Mostra/oculta botão de limpar
            this.clearBtn.style.display = searchTerm ? 'block' : 'none';
        });

        // Evento de foco
        this.searchInput.addEventListener('focus', () => {
            this.searchInput.style.borderColor = '#fc0303';
            this.searchInput.style.boxShadow = '0 0 0 3px rgba(252, 3, 3, 0.1)';
        });

        // Evento de blur
        this.searchInput.addEventListener('blur', () => {
            this.searchInput.style.borderColor = '#dee2e6';
            this.searchInput.style.boxShadow = 'none';
        });

        // Botão de limpar
        this.clearBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.filterOptions('');
            this.clearBtn.style.display = 'none';
            this.searchInput.focus();
        });

        // Atalho: ESC limpa a busca
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.searchInput.value = '';
                this.filterOptions('');
                this.clearBtn.style.display = 'none';
            }
        });
    }

    /**
     * Filtra as opções do select baseado no termo de busca
     * @param {string} searchTerm - Termo de busca
     */
    filterOptions(searchTerm) {
        // Remove todas as opções
        this.select.innerHTML = '';

        let matchCount = 0;

        // Adiciona apenas as opções que correspondem à busca
        this.allOptions.forEach(opt => {
            if (!searchTerm || opt.text.toLowerCase().includes(searchTerm)) {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.text;
                option.selected = opt.selected;
                this.select.appendChild(option);
                matchCount++;
            }
        });

        // Se não encontrou nada, mostra mensagem
        if (matchCount === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Nenhum resultado encontrado';
            option.disabled = true;
            this.select.appendChild(option);
        }
    }

    /**
     * Atualiza as opções do select
     * @param {Array} newOptions - Array com {value, text}
     */
    updateOptions(newOptions) {
        this.allOptions = newOptions.map(opt => ({
            value: opt.value || opt,
            text: opt.text || opt,
            selected: false
        }));

        // Reaplica o filtro atual
        const currentSearch = this.searchInput.value.toLowerCase().trim();
        this.filterOptions(currentSearch);
    }

    /**
     * Limpa a busca e restaura todas as opções
     */
    clear() {
        this.searchInput.value = '';
        this.filterOptions('');
        this.clearBtn.style.display = 'none';
    }

    /**
     * Obtém valores selecionados
     * @returns {Array} Array de valores selecionados
     */
    getSelected() {
        return Array.from(this.select.selectedOptions).map(opt => opt.value);
    }

    /**
     * Define valores selecionados
     * @param {Array} values - Array de valores para selecionar
     */
    setSelected(values) {
        Array.from(this.select.options).forEach(opt => {
            opt.selected = values.includes(opt.value);
        });

        // Atualiza allOptions
        this.allOptions.forEach(opt => {
            opt.selected = values.includes(opt.value);
        });
    }

    /**
     * Remove o sistema de busca
     */
    destroy() {
        if (this.searchInput && this.searchInput.parentNode) {
            this.searchInput.parentNode.remove();
        }
    }
}

/**
 * Inicializa busca em múltiplos selects
 * @param {Array} selectIds - Array de IDs dos selects
 * @param {Object} options - Opções globais
 * @returns {Object} Objeto com instâncias de FilterSearch
 */
export function initFilterSearches(selectIds, options = {}) {
    const instances = {};

    selectIds.forEach(id => {
        const selectOptions = options[id] || options.default || {};
        instances[id] = new FilterSearch(id, selectOptions);
    });

    return instances;
}

/**
 * Adiciona estilos CSS personalizados
 */
export function injectFilterSearchStyles() {
    if (document.getElementById('filter-search-styles')) return;

    const style = document.createElement('style');
    style.id = 'filter-search-styles';
    style.textContent = `
        .filter-search-wrapper {
            position: relative;
        }

        .filter-search-input:hover {
            border-color: #b50909 !important;
        }

        .filter-search-clear:hover {
            color: #fc0303;
            background: rgba(252, 3, 3, 0.1);
            border-radius: 3px;
        }

        /* Destaca opções selecionadas */
        .filter-group select option:checked {
            background: #03ff1c !important;
            color: #000 !important;
            font-weight: 600;
        }

        /* Firefox fix */
        @-moz-document url-prefix() {
            .filter-group select option:checked {
                background: linear-gradient(#03ff1c, #03ff1c) !important;
            }
        }
    `;
    document.head.appendChild(style);
}
