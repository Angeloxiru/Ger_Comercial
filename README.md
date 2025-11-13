# 🗄️ Ger_Comercial

Sistema de Gerenciamento Comercial integrado com Turso Database (LibSQL)

## 📋 Sobre o Projeto

O **Ger_Comercial** é um sistema de gerenciamento comercial desenvolvido para funcionar 100% no navegador (GitHub Pages), integrado com o banco de dados Turso (LibSQL/SQLite). Este projeto oferece dashboards visuais, relatórios detalhados e exportação de dados sem necessidade de servidor backend.

### ✨ Características

- ✅ 100% Frontend (JavaScript ES Modules)
- ✅ Banco de dados na nuvem (Turso/LibSQL)
- ✅ Dashboard gerencial com múltiplos relatórios
- ✅ **Layout 70/30** - Tabela principal (70%) + Dashboard lateral (30%) 🆕
- ✅ **25 linhas visíveis** com scroll e paginação 🆕
- ✅ Filtros avançados com seleção múltipla e busca
- ✅ Sistema de cache inteligente (LocalStorage)
- ✅ Paginação de 25 registros por página 🆕
- ✅ Cards de KPIs em grid 2x2 🆕
- ✅ Gráficos interativos com Chart.js
- ✅ Exportação para Excel e PDF
- ✅ Deploy via GitHub Pages
- ✅ Interface moderna desktop-focused 🆕
- ✅ Sem necessidade de terminal ou backend

---

## 📐 Layout 70/30 (NOVO! 🆕)

Todos os dashboards agora seguem um layout otimizado para análise de dados:

### 📊 Estrutura do Layout:

```
┌─────────────────────────────────────────────────────────────┐
│                        FILTROS                               │
├───────────────────────────────┬─────────────────────────────┤
│        TABELA (70%)            │    DASHBOARD (30%)          │
│                                │                             │
│  ┌─ Header Amarelo ─────────┐ │  ┌─ KPI 1 ─┐ ┌─ KPI 2 ─┐  │
│  │ 📊 Resultados │ X registros│ │  │ 💰      │ │ 📦      │  │
│  └────────────────────────────┘ │  │ Valor   │ │ Qtde    │  │
│  ┌────────────────────────────┐ │  └─────────┘ └─────────┘  │
│  │ Cliente │ Razão │ Valor... │ │  ┌─ KPI 3 ─┐ ┌─ KPI 4 ─┐  │
│  │ ─────────────────────────  │ │  │ ⚖️      │ │ 📊      │  │
│  │ Linha 1                    │ │  │ Peso    │ │ Total   │  │
│  │ Linha 2                    │ │  └─────────┘ └─────────┘  │
│  │ ...                        │ │                             │
│  │ Linha 25 (scroll)          │ │  ┌──────────────────────┐  │
│  └────────────────────────────┘ │  │  Gráfico 1           │  │
│  ┌─ Paginação ────────────────┐ │  │  📊 Top 10           │  │
│  │ ◀ 1 2 3 4 5 ▶              │ │  └──────────────────────┘  │
│  └────────────────────────────┘ │  ┌──────────────────────┐  │
│  ┌─ Footer ───────────────────┐ │  │  Gráfico 2           │  │
│  │ Total: R$ | 📊 Excel 📄 PDF│ │  │  🗺️ Distribuição    │  │
│  └────────────────────────────┘ │  └──────────────────────┘  │
└───────────────────────────────┴─────────────────────────────┘
```

### ✨ Características do Layout:

**Seção Tabela (70% - Esquerda):**
- 📋 **Header Amarelo**: Título e contador de registros
- 📊 **25 linhas visíveis**: Viewport fixo com scroll suave
- 📄 **Paginação**: 25 registros por página
- 💾 **Footer**: Total de valores + botões de exportação (Excel/PDF)

**Seção Dashboard (30% - Direita):**
- 📊 **4 KPIs em Grid 2x2**: Valor Total, Quantidade, Peso, Total Registros
- 📈 **2 Gráficos Empilhados**: Chart.js interativos
  - Gráfico 1: Top 10 (barras)
  - Gráfico 2: Distribuição (scatter/pie)
- 🎨 **Visual Compacto**: Informações-chave sempre visíveis

### 🎯 Vantagens:

- ✅ **Foco nos Dados**: Tabela como elemento principal
- ✅ **Métricas à Vista**: KPIs sempre visíveis no sidebar
- ✅ **Performance**: Renderiza apenas 25 linhas por vez
- ✅ **Navegação Rápida**: Paginação eficiente
- ✅ **Desktop Optimized**: Layout pensado para telas grandes

---

## 🚀 Acesso Rápido

**URL do Sistema:** https://angeloxiru.github.io/Ger_Comercial/

---

## ⚙️ Configuração

### 1️⃣ Obter Token do Turso

1. Acesse [Turso Dashboard](https://turso.tech/app)
2. Faça login com sua conta GitHub
3. Selecione seu database: **comercial**
4. Clique em **"Generate Token"** ou **"Create Token"**
5. Copie o token gerado

### 2️⃣ Configurar o Projeto

1. Abra o arquivo `js/config.js`
2. Substitua `'SEU_TOKEN_AQUI'` pelo token copiado:

```javascript
export const config = {
    dbName: 'comercial',
    url: 'libsql://comercial-angeloxiru.aws-us-east-1.turso.io',
    authToken: 'seu-token-aqui', // ← Cole seu token aqui
};
```

3. Salve o arquivo

### 3️⃣ Acessar o Sistema

Abra no navegador: https://angeloxiru.github.io/Ger_Comercial/

---

## 📁 Estrutura do Projeto

```
Ger_Comercial/
│
├── index.html                      # Dashboard principal
├── dashboard-vendas-regiao.html    # Relatório de vendas por região
├── dashboard-vendas-equipe.html    # Relatório de vendas por equipe
├── dashboard-analise-produtos.html # Análise de produtos (NOVO! 🆕)
├── teste-conexao.html              # Teste de conexão (utilitário)
├── exemplo.html                    # Exemplo de CRUD
│
├── js/
│   ├── config.js                   # Configurações do banco (TOKEN AQUI!)
│   ├── config.example.js           # Exemplo de configuração
│   ├── db.js                       # Módulo de conexão e operações
│   ├── cache.js                    # Sistema de cache (NOVO! 🆕)
│   ├── pagination.js               # Paginação de tabelas (NOVO! 🆕)
│   ├── filter-search.js            # Busca em filtros (NOVO! 🆕)
│   ├── kpi-cards.js                # Cards de KPIs (NOVO! 🆕)
│   └── test.js                     # Scripts auxiliares
│
├── .gitignore                      # Arquivos ignorados pelo Git
└── README.md                       # Este arquivo
```

---

## 📊 Dashboards Disponíveis

### 🎯 Dashboard Principal
**Arquivo:** `index.html`

Página inicial com cards de acesso aos relatórios:
- ✅ **Vendas por Região** - Disponível
- ✅ **Vendas por Equipe Comercial** - Disponível
- ✅ **Análise de Produtos** - Disponível (NOVO! 🆕)
- 👥 Performance de Clientes - Em breve
- 💰 Análise Financeira - Em breve
- 📦 Gestão de Estoque - Em breve

---

### 📍 Vendas por Região
**Arquivo:** `dashboard-vendas-regiao.html`

Dashboard completo com **layout 70/30**, filtros avançados em cascata e visualização otimizada.

#### 🎨 Layout:
- **70% Tabela**: 25 linhas visíveis, paginação de 25 registros
- **30% Dashboard**: 4 KPIs + 2 gráficos (Top 10 Produtos, Distribuição Qtde x Valor)
- **Header Amarelo**: Destaque visual para resultados
- **Cache**: Filtros salvos por 1 hora no LocalStorage

#### 🔍 Filtros Disponíveis (com busca em tempo real):

| Filtro | Descrição | Tipo |
|--------|-----------|------|
| **Período** | Data inicial e final | Seleção de datas |
| **Rota** | Rotas comerciais | Múltipla seleção |
| **SubRota** | Sub-rotas | Múltipla seleção |
| **Cidade** | Cidades | Múltipla seleção |
| **Supervisor** | Supervisores | Múltipla seleção |
| **Representante** | Representantes | Múltipla seleção |

#### 📊 Dados Exibidos:

- **Código:** Código do produto
- **Descrição:** Descrição completa do produto
- **Quantidade:** Soma total de unidades vendidas
- **Valor:** Soma total do valor líquido (R$)
- **Peso:** Soma total do peso líquido (kg)

**Ordenação:** Do maior para o menor por quantidade

#### 📊 KPIs em Tempo Real (Grid 2x2):
- 💰 **Valor Total**: Soma de todas as vendas filtradas
- 📦 **Quantidade Total**: Total de unidades vendidas
- ⚖️ **Peso Total**: Peso total em kg
- 📊 **Total de Registros**: Número de produtos

#### 📈 Gráficos (Chart.js):
1. **Top 10 Produtos por Valor**: Gráfico de barras horizontais
2. **Distribuição Quantidade vs Valor**: Scatter plot com top 30

#### 📤 Exportações:

- **Excel (.xlsx)** - Planilha formatada pronta para análise
- **PDF** - Relatório visual com tabela formatada

#### 🔗 Tabelas Relacionadas:

O sistema faz consultas em múltiplas tabelas:
- `vendas` - Dados das vendas
- `tab_cliente` - Informações de clientes (rotas)
- `tab_representante` - Informações de representantes e supervisores

---

### 👥 Vendas por Equipe Comercial
**Arquivo:** `dashboard-vendas-equipe.html`

Dashboard com **layout 70/30** focado em análise de desempenho por equipe comercial.

#### 🎨 Layout:
- **70% Tabela**: 25 linhas visíveis, paginação de 25 registros
- **30% Dashboard**: 4 KPIs + 2 gráficos (Top 10 Produtos, Distribuição)
- **Filtros em Cascata**: Supervisor → Representante → Cidade
- **Cache**: Performance otimizada com LocalStorage

#### 🔍 Filtros Disponíveis (com busca em tempo real):

| Filtro | Descrição | Cascata |
|--------|-----------|---------|
| **Período** | Data inicial e final | - |
| **Supervisor** | Supervisores comerciais | Nível 1 |
| **Representante** | Representantes por supervisor | Nível 2 |
| **Cidade** | Cidades por representante | Nível 3 |

#### 📊 Dados Exibidos:
- **Código:** Código do produto
- **Descrição:** Descrição completa
- **Quantidade:** Soma de unidades vendidas
- **Valor:** Soma do valor líquido (R$)
- **Peso:** Soma do peso líquido (kg)

**Ordenação:** Do maior para o menor por quantidade

#### 📊 KPIs em Tempo Real (Grid 2x2):
- 💰 **Valor Total**: Soma de todas as vendas da equipe
- 📦 **Quantidade Total**: Total de unidades vendidas
- ⚖️ **Peso Total**: Peso total em kg
- 📊 **Total de Registros**: Número de produtos

#### 📈 Gráficos (Chart.js):
1. **Top 10 Produtos por Valor**: Gráfico de barras
2. **Distribuição Quantidade vs Valor**: Scatter plot

#### 📤 Exportações:
- **Excel (.xlsx)** - Dados completos da equipe
- **PDF** - Relatório formatado

#### 🔗 Tabelas Relacionadas:
- `vendas` - Dados das vendas
- `tab_representante` - Informações de representantes e supervisores

---

### 📦 Análise de Produtos (NOVO! 🆕)
**Arquivo:** `dashboard-analise-produtos.html`

Dashboard completo com **layout 70/30** e recursos avançados de análise de produtos por origem/família.

#### 🎨 Layout:
- **70% Tabela**: 25 linhas visíveis, paginação de 25 registros
- **30% Dashboard**: 4 KPIs + 2 gráficos (Top 10 Clientes, Vendas por Cidade)
- **Filtros em Cascata**: Origem → Família → Produto
- **Botões de Data Rápida**: Mês, Trimestre, Ano
- **Botão Limpar Filtros**: Reset completo com um clique

#### 🔍 Filtros Disponíveis (com busca em tempo real):

| Filtro | Descrição | Recurso |
|--------|-----------|---------|
| **Período** | Data inicial e final | Datas rápidas (Mês, Trimestre, Ano) |
| **Origem** | Origem dos produtos | Busca em tempo real ✨ |
| **Família** | Família de produtos | Busca em tempo real ✨ |
| **Produto** | Produtos específicos | Busca em tempo real ✨ |

**🆕 Novidades:**
- ✨ **Busca em tempo real**: Digite parte do nome para filtrar opções
- 🧹 **Botão "Limpar Filtros"**: Reseta todos os filtros com um clique
- ⚡ **Datas rápidas**: Botões para Mês Atual, Trimestre e Ano

#### 📊 Dados Exibidos:

- **Cliente:** Código do cliente
- **Razão Social:** Nome completo
- **Cidade:** Localização
- **Quantidade:** Soma de unidades vendidas
- **Valor:** Soma do valor líquido (R$)
- **Peso:** Soma do peso líquido (kg)

**Ordenação:** Do maior para o menor por quantidade

#### 📈 KPIs em Tempo Real:

Cards no topo do dashboard com indicadores-chave:
- 💰 **Valor Total:** Soma de todas as vendas filtradas
- 📦 **Quantidade Total:** Total de unidades vendidas
- ⚖️ **Peso Total:** Peso total em kg
- 📊 **Total de Registros:** Número de clientes/registros

#### 📊 Gráficos Interativos (Chart.js):

1. **Top 10 Clientes** - Gráfico de barras com maiores compradores
2. **Vendas por Cidade** - Gráfico de pizza com top 5 cidades

#### ⚡ Performance:

- **Cache Inteligente:** Filtros salvos no LocalStorage (1 hora)
- **Paginação:** 25 registros por página (otimizado para visualização)
- **Carregamento Rápido:** Reutiliza dados em cache
- **25 Linhas Visíveis:** Viewport fixo para melhor UX

#### 📤 Exportações:

- **Excel (.xlsx)** - Nome automático com período (ex: `analise_produtos_2025-01-01_2025-01-31.xlsx`)

#### 🔗 Tabelas Relacionadas:

- `vendas` - Dados das vendas
- `tab_produto` - Informações de produtos (origem, família, descrição)

---

## 🔧 Módulos JavaScript

### 📦 `db.js` - Gerenciador de Banco de Dados

Módulo principal para operações com o banco de dados.

#### Métodos Principais:

```javascript
import { db } from './js/db.js';

// Conectar ao banco
await db.connect();

// Executar query SQL personalizada
const result = await db.execute('SELECT * FROM vendas');

// Executar query com parâmetros
const result = await db.execute({
    sql: 'SELECT * FROM vendas WHERE emissao >= ? AND emissao <= ?',
    args: ['2025-01-01', '2025-01-31']
});

// Executar múltiplas queries (batch)
const results = await db.batch([
    { sql: 'SELECT COUNT(*) FROM vendas' },
    { sql: 'SELECT SUM(valor_liquido) FROM vendas' }
]);

// Listar tabelas
const tables = await db.listTables();

// Ver estrutura de uma tabela
const structure = await db.getTableStructure('vendas');
```

---

### 💾 `cache.js` - Sistema de Cache (NOVO! 🆕)

Gerencia cache de dados no LocalStorage para melhorar performance.

#### Características:
- ⏰ **TTL Configurável:** Define tempo de expiração por tipo de dado
- 🧹 **Limpeza Automática:** Remove caches expirados
- 📊 **Estatísticas:** Monitora uso de espaço
- 🔄 **getOrFetch:** Busca do cache ou executa função automaticamente

#### Exemplo de Uso:

```javascript
import { cache, CACHE_TTL } from './js/cache.js';

// Salvar no cache (1 hora)
cache.set('filtros_produtos', dados, CACHE_TTL.FILTERS);

// Buscar do cache
const cached = cache.get('filtros_produtos');

// Buscar com fallback automático
const dados = await cache.getOrFetch(
    'chave',
    async () => await db.execute('SELECT * FROM vendas'),
    CACHE_TTL.DASHBOARDS
);

// Ver estatísticas
console.log(cache.getStats()); // { count, size, usage }

// Limpar cache expirado
cache.cleanup();

// Limpar tudo
cache.clear();
```

#### TTL Padrões:
- `FILTERS`: 1 hora - Filtros mudam pouco
- `DASHBOARDS`: 5 minutos - Dados de vendas
- `KPIS`: 10 minutos - Indicadores
- `CHARTS`: 15 minutos - Gráficos
- `REPORTS`: 30 minutos - Relatórios

---

### 📄 `pagination.js` - Paginação de Tabelas (NOVO! 🆕)

Sistema completo de paginação para grandes volumes de dados.

#### Recursos:
- 📄 **Padrão 25 Registros:** Otimizado para visualização de 25 linhas
- 🔢 **Navegação Inteligente:** Primeira, Anterior, Próxima, Última
- 📊 **Estatísticas:** Exibe "X-Y de Z registros"
- ⚡ **Performance:** Renderiza apenas página atual
- 🎯 **Configurável:** Tamanhos personalizáveis (25, 50, 100, etc.)

#### Exemplo de Uso:

```javascript
import { Pagination } from './js/pagination.js';

// Criar paginação com 25 registros (padrão do layout 70/30)
const pagination = new Pagination('#paginationContainer', {
    pageSize: 25,
    renderCallback: (pageData) => {
        // Função que renderiza os dados da página atual
        renderTable(pageData);
    }
});

// Definir dados
pagination.setData(arrayDeDados);

// Navegação
pagination.nextPage();
pagination.previousPage();
pagination.goToPage(5);
pagination.changePageSize(50); // Opcional: alterar tamanho
```

---

### 🔍 `filter-search.js` - Busca em Filtros (NOVO! 🆕)

Adiciona busca em tempo real nos elementos select múltiplos.

#### Recursos:
- ⚡ **Busca Instantânea:** Filtra enquanto digita
- 🎯 **Case Insensitive:** Busca sem distinção de maiúsculas
- ✕ **Botão Limpar:** Remove busca rapidamente
- ⌨️ **Atalho ESC:** Limpa a busca

#### Exemplo de Uso:

```javascript
import { FilterSearch } from './js/filter-search.js';

// Adicionar busca em um select
const search = new FilterSearch('meuSelect', {
    placeholder: 'Digite para buscar...'
});

// Atualizar opções
search.updateOptions(['Opção 1', 'Opção 2', 'Opção 3']);

// Limpar busca
search.clear();
```

---

### 📊 `kpi-cards.js` - Cards de KPIs (NOVO! 🆕)

Sistema de exibição de indicadores-chave de performance.

#### Recursos:
- 💳 **Cards Visuais:** Interface moderna e responsiva
- 📈 **Tendências:** Indicadores de alta/baixa
- 🎨 **Personalização:** Ícones, cores e formatos
- 🔢 **Cálculos Automáticos:** A partir dos dados

#### Exemplo de Uso:

```javascript
import { KPICards } from './js/kpi-cards.js';

// Criar KPIs
const kpiCards = new KPICards('#kpiContainer');

// Calcular KPIs automaticamente
const kpis = KPICards.calculateFromData(dados, {
    totalValue: 'valor',      // Campo de valor
    totalQuantity: 'qtde',    // Campo de quantidade
    totalWeight: 'peso',      // Campo de peso
    count: true              // Conta registros
});

// Exibir KPIs
kpiCards.setKPIs(kpis);

// Ou criar manualmente
kpiCards.setKPIs([
    {
        icon: '💰',
        label: 'Valor Total',
        value: 125450.50,
        format: 'currency',
        trend: { direction: 'up', value: '+12%' }
    },
    {
        icon: '📦',
        label: 'Produtos Vendidos',
        value: 12500,
        format: 'number'
    }
]);
```

---

## 🎨 Design e Cores

O sistema utiliza um esquema de cores moderno e vibrante:

- **Vermelho Principal:** `#FC0303` (cor primária - botões, headers) 🆕
- **Vermelho Contraste:** `#B50909` (hover, gradientes) 🆕
- **Verde Seleção:** `#03FF1C` (itens selecionados em filtros) 🆕
- **Amarelo Header:** `#FFD700` (header das tabelas) 🆕
- **Fundo:** Branco `#FFFFFF` e cinza claro `#F8F9FA`

### Características Visuais:
- **Gradientes suaves**: Headers com degradê vermelho
- **Sombras elegantes**: Cards com elevação sutil
- **Animações de hover**: Feedback visual em botões e KPIs
- **Layout 70/30**: Grid otimizado para análise de dados
- **Desktop-focused**: Interface otimizada para telas grandes
- **25 linhas visíveis**: Viewport fixo para melhor UX

---

## 📐 Estrutura do Banco de Dados

### Tabela: `vendas`

Tabela principal com dados de vendas:

```sql
CREATE TABLE vendas (
  chave_primaria INTEGER PRIMARY KEY AUTOINCREMENT,
  serie TEXT,
  nota_fiscal TEXT,
  emissao TEXT,
  produto TEXT,
  qtde_faturada NUMERIC,
  nat_oper TEXT,
  familia TEXT,
  complemento TEXT,
  cliente TEXT,                  -- FK para tab_cliente
  nome TEXT,
  fantasia TEXT,
  representante TEXT,            -- FK para tab_representante
  uf TEXT,
  cidade TEXT,
  peso_liq NUMERIC,
  preco_unitario NUMERIC,
  perc_desc NUMERIC,
  valor_bruto NUMERIC,
  valor_desconto NUMERIC,
  valor_liquido NUMERIC,
  valor_financeiro NUMERIC,
  grupo_empresa TEXT,
  preco_unit_liq NUMERIC
);
```

### Tabela: `tab_cliente`

Informações dos clientes e rotas:

```sql
-- Estrutura básica
-- Chave primária: cliente
-- Contém: rota, sub_rota, endereço, etc.
```

### Tabela: `tab_representante`

Informações dos representantes:

```sql
-- Estrutura básica
-- Chave primária: representante
-- Contém: desc_representante, rep_supervisor, etc.
```

### Relacionamentos:

```
vendas.cliente → tab_cliente.cliente
vendas.representante → tab_representante.representante
```

---

## 🌐 Deploy no GitHub Pages

O sistema já está configurado para GitHub Pages!

### Como Atualizar:

1. Faça suas alterações localmente
2. Edite `js/config.js` com seu token
3. Teste localmente
4. Faça commit e push
5. GitHub Pages atualiza automaticamente

### URL do Sistema:
```
https://angeloxiru.github.io/Ger_Comercial/
```

---

## 🔒 Segurança

### ⚠️ Avisos Importantes:

1. **Nunca** compartilhe seu token de autenticação
2. **Não** faça commit do `config.js` com token preenchido
3. O token tem acesso total ao seu banco de dados
4. Para produção, considere usar um backend proxy

### Protegendo o Token:

O arquivo `.gitignore` está configurado para proteger suas credenciais. Se você já fez commit do token por engano:

1. **Regenere o token** no Turso Dashboard
2. Remova o arquivo do histórico do Git
3. Confirme que `js/config.js` está no `.gitignore`

---

## 📚 Exemplos de Uso

### Exemplo 1: Consultar Vendas por Período

```javascript
import { db } from './js/db.js';

await db.connect();

const vendas = await db.execute({
    sql: `
        SELECT produto, complemento,
               SUM(qtde_faturada) as qtde_total,
               SUM(valor_liquido) as valor_total
        FROM vendas
        WHERE emissao >= ? AND emissao <= ?
        GROUP BY produto, complemento
        ORDER BY qtde_total DESC
    `,
    args: ['2025-01-01', '2025-01-31']
});

console.table(vendas.rows);
```

### Exemplo 2: Consultar com JOINs

```javascript
const resultado = await db.execute(`
    SELECT
        v.produto,
        v.valor_liquido,
        c.rota,
        c.sub_rota,
        r.desc_representante,
        r.rep_supervisor
    FROM vendas v
    LEFT JOIN tab_cliente c ON v.cliente = c.cliente
    LEFT JOIN tab_representante r ON v.representante = r.representante
    WHERE v.emissao >= '2025-01-01'
    ORDER BY v.valor_liquido DESC
    LIMIT 100
`);

console.table(resultado.rows);
```

---

## 🐛 Solução de Problemas

### Erro: "Token de autenticação não configurado"

**Solução:** Edite `js/config.js` e adicione seu token do Turso.

---

### Erro: "Failed to fetch"

**Possíveis causas:**
1. Sem conexão com internet
2. Token inválido ou expirado
3. Database não existe no Turso

**Solução:**
- Verifique sua conexão
- Gere um novo token no Turso
- Confirme que o database "comercial" existe

---

### Filtros não carregam dados

**Solução:**
- Verifique se as tabelas `tab_cliente` e `tab_representante` têm dados
- Confirme os relacionamentos entre as tabelas

---

### Exportação não funciona

**Solução:**
- Certifique-se de que está acessando via HTTPS ou localhost
- Não use protocolo `file://`
- Verifique se há dados para exportar

---

## 📖 Recursos Adicionais

### Documentação Turso:
- [Turso Docs](https://docs.turso.tech/)
- [LibSQL Client](https://github.com/libsql/libsql-client-ts)

### Bibliotecas Utilizadas:
- [SheetJS (XLSX)](https://sheetjs.com/) - Exportação Excel
- [jsPDF](https://github.com/parallax/jsPDF) - Exportação PDF
- [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) - Tabelas em PDF

### Tutoriais:
- [Como usar Turso](https://turso.tech/tutorials)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

- Reportar bugs
- Sugerir melhorias
- Enviar pull requests
- Melhorar a documentação
- Criar novos dashboards

---

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

---

## 👨‍💻 Autor

**Angeloxiru**
- GitHub: [@Angeloxiru](https://github.com/Angeloxiru)

---

## 🎉 Roadmap

### ✅ Implementado:
- ✅ Dashboard principal
- ✅ **Layout 70/30 em todos os dashboards (NOVO! 🆕)**
- ✅ **25 linhas visíveis + paginação (NOVO! 🆕)**
- ✅ Vendas por Região
- ✅ Vendas por Equipe Comercial
- ✅ **Análise de Produtos (NOVO! 🆕)**
- ✅ Filtros múltiplos com busca em tempo real
- ✅ **Sistema de Cache LocalStorage (NOVO! 🆕)**
- ✅ **Paginação de 25 registros (NOVO! 🆕)**
- ✅ **KPIs em Grid 2x2 (NOVO! 🆕)**
- ✅ **Gráficos Interativos Chart.js (NOVO! 🆕)**
- ✅ Exportação Excel/PDF
- ✅ GitHub Pages
- ✅ **Interface desktop-focused (NOVO! 🆕)**

### 🚧 Em Desenvolvimento:
- Performance de Clientes
- Análise Financeira
- Gestão de Estoque

### 💡 Futuras Melhorias:
- Sistema de Login e Permissões
- Dashboard Executivo com IA
- Comparativo de períodos
- Drill-down detalhado
- Filtros salvos e favoritos
- Análise Preditiva
- Dashboard personalizável
- Modo escuro
- Relatórios agendados
- Detecção de clientes inativos

---

<p align="center">
  <strong>🚀 Sistema 100% Web | 📊 Dashboards Inteligentes | 🔒 Seguro e Rápido</strong>
</p>

<p align="center">
  Feito com ❤️ e ☕
</p>
