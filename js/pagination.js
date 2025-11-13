/**
 * Sistema de Paginação para Tabelas
 *
 * Gerencia paginação de grandes volumes de dados
 */

export class Pagination {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        this.currentPage = 1;
        this.pageSize = options.pageSize || 50;
        this.pageSizeOptions = options.pageSizeOptions || [50, 100, 500, 1000];
        this.data = [];
        this.filteredData = [];
        this.renderCallback = options.renderCallback || null;
        this.onPageChange = options.onPageChange || null;
    }

    /**
     * Define os dados a serem paginados
     * @param {Array} data - Array de dados
     */
    setData(data) {
        this.data = data;
        this.filteredData = data;
        this.currentPage = 1;
        this.render();
    }

    /**
     * Filtra os dados (sem resetar paginação)
     * @param {Function} filterFn - Função de filtro
     */
    filter(filterFn) {
        this.filteredData = this.data.filter(filterFn);
        this.currentPage = 1;
        this.render();
    }

    /**
     * Obtém dados da página atual
     * @returns {Array} Dados da página
     */
    getCurrentPageData() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.filteredData.slice(start, end);
    }

    /**
     * Calcula total de páginas
     * @returns {number} Total de páginas
     */
    getTotalPages() {
        return Math.ceil(this.filteredData.length / this.pageSize);
    }

    /**
     * Vai para uma página específica
     * @param {number} page - Número da página
     */
    goToPage(page) {
        const totalPages = this.getTotalPages();
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        this.currentPage = page;
        this.render();
    }

    /**
     * Página anterior
     */
    previousPage() {
        this.goToPage(this.currentPage - 1);
    }

    /**
     * Próxima página
     */
    nextPage() {
        this.goToPage(this.currentPage + 1);
    }

    /**
     * Primeira página
     */
    firstPage() {
        this.goToPage(1);
    }

    /**
     * Última página
     */
    lastPage() {
        this.goToPage(this.getTotalPages());
    }

    /**
     * Muda o tamanho da página
     * @param {number} size - Novo tamanho
     */
    changePageSize(size) {
        this.pageSize = parseInt(size);
        this.currentPage = 1;
        this.render();
    }

    /**
     * Renderiza a tabela e controles de paginação
     */
    render() {
        if (this.renderCallback) {
            const pageData = this.getCurrentPageData();
            this.renderCallback(pageData);
        }

        if (this.onPageChange) {
            this.onPageChange({
                currentPage: this.currentPage,
                totalPages: this.getTotalPages(),
                pageSize: this.pageSize,
                totalRecords: this.filteredData.length,
                start: (this.currentPage - 1) * this.pageSize + 1,
                end: Math.min(this.currentPage * this.pageSize, this.filteredData.length)
            });
        }

        this.renderControls();
    }

    /**
     * Renderiza os controles de paginação
     */
    renderControls() {
        if (!this.container) return;

        const totalPages = this.getTotalPages();
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, this.filteredData.length);
        const total = this.filteredData.length;

        // Gera botões de página (máximo 7 botões)
        const pageButtons = this.generatePageButtons();

        this.container.innerHTML = `
            <div class="pagination-container">
                <div class="pagination-info">
                    Exibindo <strong>${start}-${end}</strong> de <strong>${total}</strong> registros
                </div>

                <div class="pagination-controls">
                    <button class="pagination-btn" onclick="window.pagination.firstPage()" ${this.currentPage === 1 ? 'disabled' : ''}>
                        ⏮️ Primeira
                    </button>
                    <button class="pagination-btn" onclick="window.pagination.previousPage()" ${this.currentPage === 1 ? 'disabled' : ''}>
                        ◀️ Anterior
                    </button>

                    <div class="pagination-pages">
                        ${pageButtons}
                    </div>

                    <button class="pagination-btn" onclick="window.pagination.nextPage()" ${this.currentPage === totalPages ? 'disabled' : ''}>
                        Próxima ▶️
                    </button>
                    <button class="pagination-btn" onclick="window.pagination.lastPage()" ${this.currentPage === totalPages ? 'disabled' : ''}>
                        Última ⏭️
                    </button>
                </div>

                <div class="pagination-size">
                    <label>Por página:</label>
                    <select class="pagination-select" onchange="window.pagination.changePageSize(this.value)">
                        ${this.pageSizeOptions.map(size =>
                            `<option value="${size}" ${size === this.pageSize ? 'selected' : ''}>${size}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        `;
    }

    /**
     * Gera botões de navegação entre páginas
     * @returns {string} HTML dos botões
     */
    generatePageButtons() {
        const totalPages = this.getTotalPages();
        const current = this.currentPage;
        const buttons = [];

        if (totalPages <= 7) {
            // Mostra todas as páginas
            for (let i = 1; i <= totalPages; i++) {
                buttons.push(this.createPageButton(i));
            }
        } else {
            // Mostra páginas com elipse
            buttons.push(this.createPageButton(1));

            if (current > 3) {
                buttons.push('<span class="pagination-ellipsis">...</span>');
            }

            const start = Math.max(2, current - 1);
            const end = Math.min(totalPages - 1, current + 1);

            for (let i = start; i <= end; i++) {
                buttons.push(this.createPageButton(i));
            }

            if (current < totalPages - 2) {
                buttons.push('<span class="pagination-ellipsis">...</span>');
            }

            buttons.push(this.createPageButton(totalPages));
        }

        return buttons.join('');
    }

    /**
     * Cria HTML de um botão de página
     * @param {number} page - Número da página
     * @returns {string} HTML do botão
     */
    createPageButton(page) {
        const isActive = page === this.currentPage;
        return `
            <button
                class="pagination-page ${isActive ? 'active' : ''}"
                onclick="window.pagination.goToPage(${page})"
                ${isActive ? 'disabled' : ''}
            >
                ${page}
            </button>
        `;
    }

    /**
     * Obtém estatísticas da paginação
     * @returns {Object} Estatísticas
     */
    getStats() {
        return {
            currentPage: this.currentPage,
            totalPages: this.getTotalPages(),
            pageSize: this.pageSize,
            totalRecords: this.filteredData.length,
            totalData: this.data.length
        };
    }
}

/**
 * Injeta CSS para paginação
 */
export function injectPaginationStyles() {
    if (document.getElementById('pagination-styles')) return;

    const style = document.createElement('style');
    style.id = 'pagination-styles';
    style.textContent = `
        .pagination-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            background: #f8f9fa;
            border-top: 1px solid #dee2e6;
            gap: 20px;
            flex-wrap: wrap;
        }

        .pagination-info {
            color: #495057;
            font-size: 0.9em;
        }

        .pagination-controls {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .pagination-pages {
            display: flex;
            gap: 4px;
        }

        .pagination-btn,
        .pagination-page {
            padding: 6px 12px;
            border: 1px solid #dee2e6;
            background: white;
            color: #495057;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85em;
            transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled),
        .pagination-page:hover:not(:disabled) {
            background: #fc0303;
            color: white;
            border-color: #fc0303;
        }

        .pagination-btn:disabled,
        .pagination-page:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .pagination-page.active {
            background: #fc0303;
            color: white;
            border-color: #fc0303;
            font-weight: 600;
        }

        .pagination-ellipsis {
            padding: 6px 8px;
            color: #6c757d;
        }

        .pagination-size {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #495057;
            font-size: 0.9em;
        }

        .pagination-select {
            padding: 6px 10px;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            background: white;
            cursor: pointer;
        }

        .pagination-select:focus {
            outline: none;
            border-color: #fc0303;
            box-shadow: 0 0 0 3px rgba(252, 3, 3, 0.1);
        }

        @media (max-width: 768px) {
            .pagination-container {
                flex-direction: column;
                gap: 12px;
            }

            .pagination-controls {
                width: 100%;
                justify-content: center;
            }

            .pagination-btn {
                padding: 8px 12px;
                font-size: 0.8em;
            }
        }
    `;
    document.head.appendChild(style);
}
