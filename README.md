# 📊 Ger Comercial - Sistema Integrado de Gerenciamento

Sistema de Gerenciamento Comercial desenvolvido com Turso Database (LibSQL), otimizado para análise de vendas com dashboards interativos e filtros inteligentes.

---

## ✨ Destaques do Sistema

- ✅ **100% Frontend** - JavaScript ES Modules, sem backend necessário
- ✅ **Turso Database** - Cloud SQLite otimizado com 26 índices de performance
- ✅ **Sistema de Autenticação** - Login seguro com controle de permissões por dashboard
- ✅ **Gerenciamento de Usuários** - Interface administrativa para criar e gerenciar usuários
- ✅ **PWA (Progressive Web App)** - Funciona offline e pode ser instalado no dispositivo
- ✅ **Layout 70/30** - Tabela principal (70%) + Dashboard lateral (30%)
- ✅ **7 Dashboards Completos** - Região, Equipe, Produtos, Clientes, Performance Semanal, Produtos Parados, Gerenciar Usuários
- ✅ **Filtros Inteligentes** - Busca digitável em tempo real e cascata automática
- ✅ **Cache Otimizado** - LocalStorage com TTL + Service Worker para performance máxima
- ✅ **Paginação Eficiente** - 25 registros por página com navegação rápida
- ✅ **Gráficos Interativos** - Chart.js com visualizações dinâmicas
- ✅ **Exportação de Dados** - Excel e PDF com um clique
- ✅ **GitHub Pages Ready** - Deploy automático configurado

---

## 🚀 Acesso Rápido

**URL do Sistema:** https://angeloxiru.github.io/Ger_Comercial/

---

## 📁 Estrutura do Projeto

```
Ger_Comercial/
│
├── index.html                     # 🏠 Página inicial com menu de dashboards
├── manifest.json                  # 📱 Manifest PWA (metadados da aplicação)
├── sw.js                          # 🔄 Service Worker (cache e modo offline)
├── icon-192.png                   # 📱 Ícone PWA 192x192
├── icon-512.png                   # 📱 Ícone PWA 512x512
│
├── dashboards/                    # 📊 Dashboards de análise
│   ├── dashboard-vendas-regiao.html        # Vendas por região
│   ├── dashboard-vendas-equipe.html        # Vendas por equipe comercial
│   ├── dashboard-analise-produtos.html     # Análise de produtos
│   ├── dashboard-performance-clientes.html # Performance de clientes
│   ├── cobranca-semanal.html               # Performance semanal
│   ├── dashboard-produtos-parados.html     # Produtos parados
│   └── dashboard-gerenciar-usuarios.html   # Gerenciamento de usuários (Admin)
│
├── tools/                         # 🔧 Ferramentas de diagnóstico
│   ├── diagnostico.html           # Diagnóstico de conexão e dados
│   └── limpar-cache.html          # Limpeza de cache do sistema
│
├── js/                            # 📦 Módulos JavaScript
│   ├── config.js                  # ⚙️ Configurações do banco (TOKEN AQUI!)
│   ├── config.example.js          # Exemplo de configuração
│   ├── db.js                      # Gerenciador de conexão e queries
│   ├── auth.js                    # Sistema de autenticação e permissões
│   ├── cache.js                   # Sistema de cache com TTL
│   ├── pagination.js              # Paginação de tabelas
│   ├── filter-search.js           # Busca em tempo real em filtros
│   └── dashboard-isolation.js     # Isolamento de dashboards
│
├── scripts/                       # 🗄️ Scripts SQL
│   ├── README.md                  # Documentação dos scripts
│   ├── 01-create-indexes.sql      # Criação de índices (CLI)
│   ├── 01-create-indexes-web.sql  # Criação de índices (Web Dashboard)
│   ├── 02-maintenance.sql         # Manutenção mensal
│   └── 03-test-performance.sql    # Testes de performance
│
└── docs/                          # 📚 Documentação
    ├── INDICES-EXPLICACAO.md      # Explicação sobre índices
    ├── GUIA_RAPIDO.md             # Guia rápido de uso
    └── TROUBLESHOOTING.md         # Solução de problemas
```

---

## ⚙️ Configuração Inicial

### 1️⃣ Configurar Credenciais do Turso

1. Acesse [Turso Dashboard](https://turso.tech/app)
2. Faça login com sua conta GitHub
3. Selecione seu banco de dados
4. Clique em **"Generate Token"** e copie o token

5. Edite o arquivo `js/config.js`:

```javascript
export const config = {
    dbName: 'comercial',
    url: 'libsql://seu-banco.turso.io',
    authToken: 'seu-token-aqui', // ← Cole seu token aqui
};
```

### 2️⃣ Criar Índices de Performance

**IMPORTANTE:** Execute esta etapa para otimizar as queries em 50-90%!

#### Opção A: Via Turso Web Dashboard (Recomendado)

1. Acesse https://turso.tech/
2. Selecione seu banco de dados
3. Vá em "SQL Editor"
4. Abra o arquivo `scripts/01-create-indexes-web.sql`
5. Copie todo o conteúdo e cole no editor
6. Clique em "Run"
7. Aguarde ~2 minutos (para ~45k registros)

#### Opção B: Via Turso CLI

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Conectar ao banco
turso db shell seu-banco-aqui

# Executar script
.read scripts/01-create-indexes.sql
```

**Resultado esperado:**
- ⚡ Queries 50-90% mais rápidas
- 💰 Redução de 95-99% no consumo de reads do Turso
- 🚀 Dashboards carregam instantaneamente

Ver mais detalhes em: `scripts/README.md`

### 3️⃣ Configurar Sistema de Autenticação

O sistema possui autenticação completa com controle de permissões por usuário.

#### Criar tabela de usuários

Execute o SQL abaixo no Turso Dashboard para criar a tabela de usuários:

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT,
    permissions TEXT,  -- JSON array com IDs dos dashboards permitidos
    active INTEGER DEFAULT 1,  -- 1=ativo, 0=inativo
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_active ON users(active);
```

#### Criar usuário administrador inicial

```sql
INSERT INTO users (username, password, full_name, permissions, active)
VALUES (
    'admin',
    'admin123',
    'Administrador',
    '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes","cobranca-semanal","produtos-parados","gerenciar-usuarios"]',
    1
);
```

**IMPORTANTE:** Altere a senha do admin após primeiro login!

#### IDs dos Dashboards

- `vendas-regiao` - Vendas por Região
- `vendas-equipe` - Vendas por Equipe Comercial
- `analise-produtos` - Análise de Produtos
- `performance-clientes` - Performance de Clientes
- `cobranca-semanal` - Performance Semanal
- `produtos-parados` - Produtos Parados
- `gerenciar-usuarios` - Gerenciar Usuários (somente admins)

### 4️⃣ Acessar o Sistema

**URL:** https://angeloxiru.github.io/Ger_Comercial/

**Login padrão:**
- Usuário: `admin`
- Senha: `admin123`

### 5️⃣ Instalar como PWA (Opcional)

O sistema agora funciona como PWA (Progressive Web App) e pode ser instalado em qualquer dispositivo!

**No Desktop (Chrome/Edge):**
1. Acesse o sistema no navegador
2. Clique no ícone de instalação (➕) na barra de endereço
3. Clique em "Instalar"
4. O app abrirá em janela própria

**No Mobile (Android/iOS):**
1. Acesse o sistema no navegador
2. Toque no menu (⋮) ou compartilhar (📤)
3. Selecione "Adicionar à tela inicial"
4. O ícone aparecerá na sua tela inicial

**Benefícios do PWA:**
- 🚀 Acesso mais rápido (ícone na tela inicial)
- 📱 Funciona offline após primeira visita
- 💾 Cache inteligente de recursos
- 🔔 Visual de aplicativo nativo
- 🌐 Sincroniza automaticamente quando online

---

## 📊 Dashboards Disponíveis

### 1. 📍 Vendas por Região

**Arquivo:** `dashboards/dashboard-vendas-regiao.html`

Análise completa de vendas por localização geográfica.

**Filtros:**
- Período (data inicial/final)
- Rota (múltipla seleção)
- Sub-Rota (cascata automática)
- Cidade (busca em tempo real)
- Supervisor
- Representante

**Visualizações:**
- 4 KPIs: Valor Total, Quantidade, Peso, Total de Registros
- Gráfico Top 10 Produtos por Valor
- Gráfico Distribuição Quantidade vs Valor
- Tabela paginada (25 registros/página)

---

### 2. 👥 Vendas por Equipe Comercial

**Arquivo:** `dashboards/dashboard-vendas-equipe.html`

Desempenho individual e por equipe comercial.

**Filtros:**
- Período
- Supervisor (cascata nível 1)
- Representante (cascata nível 2)
- Cidade (cascata nível 3)

**Visualizações:**
- 4 KPIs em grid 2x2
- Top 10 Produtos
- Distribuição de vendas
- Exportação para Excel/PDF

---

### 3. 📈 Análise de Produtos

**Arquivo:** `dashboards/dashboard-analise-produtos.html`

Análise detalhada por origem, família e produto.

**Filtros:**
- Período com atalhos (Mês, Trimestre, Ano)
- Origem (busca em tempo real)
- Família (cascata)
- Produto (busca avançada)

**Recursos especiais:**
- Botão "Limpar Filtros"
- Busca em tempo real em todos os selects
- Exportação com nome automático por período

---

### 4. 💰 Performance de Clientes

**Arquivo:** `dashboards/dashboard-performance-clientes.html`

Análise de performance por grupo e cliente individual.

**Filtros:**
- Período
- Grupo de Clientes
- Cliente (com busca)
- Cidade

**Visualizações:**
- Top 10 Clientes por valor
- Gráfico de vendas por cidade
- Tabela de performance detalhada

---

### 5. 🎯 Performance Semanal

**Arquivo:** `dashboards/cobranca-semanal.html`

Controle semanal de performance da equipe comercial.

**Filtros:**
- Seleção de semana

**Visualizações:**
- Performance vs Meta semanal
- Penetração de clientes por cidade
- Ranking de representantes
- Alertas para representantes abaixo da meta

---

### 6. 🛑 Produtos Parados

**Arquivo:** `dashboards/dashboard-produtos-parados.html`

Identifica produtos que pararam de ser vendidos.

**Análise:**
- Produtos vendidos há 4-6 semanas atrás
- Produtos não vendidos nas últimas 4 semanas
- Classificação de risco (CRÍTICO, ALTO, MÉDIO, BAIXO)
- Alertas de perda de clientes

---

### 7. 👥 Gerenciar Usuários (Admin)

**Arquivo:** `dashboards/dashboard-gerenciar-usuarios.html`

**🔐 Acesso restrito a administradores**

Interface completa de gerenciamento de usuários e permissões.

**Funcionalidades:**
- ➕ **Criar novos usuários** com validação de dados
- ✏️ **Editar usuários** existentes (nome, senha, permissões)
- 🔒 **Ativar/Desativar** usuários
- 🎛️ **Gerenciar permissões** por dashboard (checkboxes)
- 📊 **Visualizar status** e quantidade de permissões
- 💾 **Salvar alterações** diretamente no banco Turso

**Como usar:**
1. Acesse com usuário que possui permissão `gerenciar-usuarios`
2. Clique em "Adicionar Usuário" para criar novos usuários
3. Use "Editar" para modificar permissões ou dados
4. Use "Ativar/Desativar" para controlar acesso ao sistema

**Estrutura de permissões:**
- Cada usuário possui um array JSON de IDs de dashboards
- Permissões aplicadas automaticamente no login
- Cards sem permissão ficam bloqueados visualmente
- Mudanças refletem no próximo login do usuário

**Segurança:**
- Username único (não pode ser alterado)
- Validação de senha (mínimo 6 caracteres)
- Confirmação antes de desativar usuários
- Apenas usuários com permissão administrativa podem acessar

---

## 🔐 Sistema de Autenticação

### Como funciona

**1. Login (`login.html`):**
- Usuário insere credenciais (username + password)
- Sistema consulta tabela `users` no Turso
- Valida senha e status ativo
- Cria sessão no localStorage
- Redireciona para página inicial

**2. Controle de Acesso:**
- Cada página verifica autenticação ao carregar
- Sistema carrega permissões do usuário
- Cards sem permissão ficam bloqueados visualmente
- Ao clicar em card bloqueado, exibe mensagem de acesso negado

**3. Sessão:**
- Armazenada em localStorage (client-side)
- Contém: id, username, fullName, permissions, loginTime
- Botão de logout disponível em todas as páginas
- Logout limpa sessão e redireciona para login

**4. Permissões:**
- Formato: array JSON de IDs de dashboards
- Exemplo: `["vendas-regiao", "vendas-equipe", "gerenciar-usuarios"]`
- Gerenciadas via dashboard administrativo
- Aplicadas em tempo real após novo login

### Módulo de Autenticação (`js/auth.js`)

```javascript
import { authManager } from './js/auth.js';

// Verificar se está autenticado
const isAuth = authManager.isAuthenticated();

// Obter usuário atual
const user = authManager.getCurrentUser();

// Verificar permissão específica
const hasAccess = authManager.hasPermission('vendas-regiao');

// Fazer logout
authManager.logout();

// Requerer autenticação (redireciona se não autenticado)
authManager.requireAuth();
```

---

## 🔧 Ferramentas de Diagnóstico

### Diagnóstico de Sistema

**Arquivo:** `tools/diagnostico.html`

Ferramenta completa para verificar:
- ✅ Conexão com Turso
- ✅ Estrutura do banco de dados
- ✅ Quantidade de registros
- ✅ Integridade dos dados
- ✅ Performance das queries

### Limpeza de Cache

**Arquivo:** `tools/limpar-cache.html`

Remove cache do LocalStorage para forçar atualização de dados.

---

## 📦 Módulos JavaScript

### `db.js` - Gerenciador de Banco

```javascript
import { db } from './js/db.js';

// Conectar
await db.connect();

// Executar query
const result = await db.execute('SELECT * FROM vendas LIMIT 10');

// Query com parâmetros
const result = await db.execute({
    sql: 'SELECT * FROM vendas WHERE emissao >= ? AND emissao <= ?',
    args: ['2025-01-01', '2025-01-31']
});

// Batch queries
const results = await db.batch([
    { sql: 'SELECT COUNT(*) FROM vendas' },
    { sql: 'SELECT SUM(valor_liquido) FROM vendas' }
]);
```

---

### `cache.js` - Sistema de Cache

```javascript
import { cache, CACHE_TTL } from './js/cache.js';

// Salvar no cache
cache.set('chave', dados, CACHE_TTL.FILTERS); // 1 hora

// Buscar do cache
const cached = cache.get('chave');

// Buscar com fallback automático
const dados = await cache.getOrFetch(
    'chave',
    async () => await fetchData(),
    CACHE_TTL.DASHBOARDS // 5 minutos
);

// Limpar cache expirado
cache.cleanup();
```

**TTL Padrões:**
- FILTERS: 1 hora
- DASHBOARDS: 5 minutos
- KPIS: 10 minutos
- CHARTS: 15 minutos
- REPORTS: 30 minutos

---

### `pagination.js` - Paginação

```javascript
import { Pagination } from './js/pagination.js';

// Criar paginação
const pagination = new Pagination('#paginationContainer', {
    pageSize: 25,
    renderCallback: (pageData) => {
        renderTable(pageData);
    }
});

// Definir dados
pagination.setData(arrayDeDados);

// Navegação
pagination.nextPage();
pagination.previousPage();
pagination.goToPage(5);
```

---

### `filter-search.js` - Busca em Filtros

```javascript
import { FilterSearch } from './js/filter-search.js';

// Adicionar busca em select
const search = new FilterSearch('meuSelect', {
    placeholder: 'Digite para buscar...'
});

// Atualizar opções
search.updateOptions(['Opção 1', 'Opção 2', 'Opção 3']);

// Limpar
search.clear();
```

**Funcionalidade de busca digitável:**
- ✅ Todos os filtros com múltipla seleção possuem busca em tempo real
- ✅ Digite para filtrar as opções instantaneamente
- ✅ Suporta acentos e busca parcial
- ✅ Interface intuitiva com campo de busca acima do select

---

## 📱 PWA - Progressive Web App

O sistema foi convertido em PWA, oferecendo experiência de aplicativo nativo.

### Arquivos PWA

**`manifest.json`** - Metadados da aplicação:
- Nome, ícones, cores do tema
- Modo standalone (sem barra do navegador)
- Atalhos para dashboards principais
- Suporte a múltiplas orientações

**`sw.js`** - Service Worker:
- Cache de arquivos essenciais na instalação
- Estratégia Network First para dados atualizados
- Fallback para cache quando offline
- Cache automático de CDNs (Chart.js, XLSX, etc.)
- Limpeza automática de cache antigo

**Ícones:**
- `icon-192.png` - Ícone 192x192 (tela inicial mobile)
- `icon-512.png` - Ícone 512x512 (splash screen)

### Como funciona

1. **Primeira visita:** Service Worker registrado e arquivos cacheados
2. **Visitas seguintes:** Carrega do cache + atualiza em background
3. **Offline:** Serve conteúdo do cache automaticamente
4. **Online:** Sincroniza e atualiza cache com novos dados

### Recursos offline

**Funcionam offline após primeira visita:**
- Interface completa de todos os dashboards
- Módulos JavaScript (db.js, cache.js, etc.)
- Bibliotecas (Chart.js, XLSX)
- Ícones e assets estáticos

**Requerem conexão:**
- Consultas ao banco Turso
- Exportação de dados
- Atualização de filtros

---

## 🗄️ Banco de Dados

### Tabelas Principais

**`users`** - Usuários e autenticação
- Campos: id, username, password, full_name, permissions (JSON), active, created_at, updated_at
- Controla autenticação e permissões de acesso aos dashboards

**`vendas`** - Dados de vendas (45.453 registros)
- Campos: serie, nota_fiscal, emissao, produto, qtde_faturada, valor_liquido, etc.

**`tab_cliente`** - Informações de clientes
- Campos: cliente, rota, sub_rota, cidade, etc.

**`tab_representante`** - Representantes e supervisores
- Campos: representante, desc_representante, rep_supervisor, etc.

**`tab_produto`** - Produtos e famílias
- Campos: produto, complemento, origem, familia, etc.

**`potencial_cidade`** - Potencial por cidade
- Campos: cidade, populacao, coordenadas, rota (para Performance Semanal)

**`potencial_representante`** - Metas semanais
- Campos: representante, semana, meta_peso, meta_clientes, meta_skus

**`representante_cidades`** - Relacionamento representante ↔ cidades

**`vw_produtos_parados`** - View de análise de produtos parados

### Índices Criados (26 total)

Ver detalhes completos em: `docs/INDICES-EXPLICACAO.md`

**Principais índices:**
- `idx_vendas_emissao` - Filtros por data
- `idx_vendas_cliente` - Consultas por cliente
- `idx_vendas_produto` - Análise de produtos
- `idx_vendas_representante` - Performance de equipe
- `idx_vendas_composite_*` - Queries compostas otimizadas

---

## 🎨 Layout 70/30

Todos os dashboards seguem o padrão otimizado:

```
┌─────────────────────────────────────────────────┐
│                   FILTROS                        │
├─────────────────────────┬───────────────────────┤
│   TABELA (70%)          │  DASHBOARD (30%)      │
│                         │                       │
│ 📊 25 linhas visíveis   │  📊 4 KPIs (2x2)     │
│ ⬆️⬇️ Scroll suave        │  📈 Gráfico 1        │
│ ◀️ 1 2 3 4 5 ▶️ Paginação│  📊 Gráfico 2        │
│ 💾 Exportar Excel/PDF   │                       │
└─────────────────────────┴───────────────────────┘
```

**Características:**
- 📋 25 linhas sempre visíveis
- 📊 4 KPIs em grid 2x2
- 📈 2 gráficos Chart.js
- 📄 Paginação de 25 registros
- 💾 Exportação integrada

---

## 🚀 Deploy e Desenvolvimento

### Deploy no GitHub Pages

O sistema está configurado para deploy automático:

1. Faça suas alterações localmente
2. Configure `js/config.js` com seu token
3. Commit e push para o repositório
4. GitHub Pages atualiza automaticamente em ~1 minuto

**URL:** https://angeloxiru.github.io/Ger_Comercial/

### Desenvolvimento Local

```bash
# Clonar repositório
git clone https://github.com/Angeloxiru/Ger_Comercial.git
cd Ger_Comercial

# Configurar credenciais
cp js/config.example.js js/config.js
# Edite js/config.js com seu token

# Iniciar servidor local (necessário para ES modules)
python -m http.server 8000
# ou
npx serve

# Acessar
http://localhost:8000
```

---

## 🔒 Segurança

### ⚠️ Proteção do Token

**NUNCA** faça commit do seu token!

O arquivo `js/config.js` está no `.gitignore` para proteção.

**Se você commitou o token por acidente:**
1. Regenere o token no Turso Dashboard
2. Atualize `js/config.js`
3. Remova o arquivo do histórico do Git:
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch js/config.js" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 📚 Documentação Completa

- **`docs/GUIA_RAPIDO.md`** - Guia rápido de uso do sistema
- **`docs/TROUBLESHOOTING.md`** - Solução de problemas comuns
- **`docs/INDICES-EXPLICACAO.md`** - Como funcionam os índices
- **`scripts/README.md`** - Documentação dos scripts SQL

---

## 🐛 Solução de Problemas Comuns

### ❌ "Token de autenticação não configurado"
**Solução:** Edite `js/config.js` e adicione seu token do Turso.

### ❌ "Failed to fetch"
**Causas possíveis:**
- Sem conexão com internet
- Token inválido ou expirado
- Database não existe

**Solução:**
1. Verifique sua conexão
2. Regenere o token no Turso
3. Confirme que o database existe

### ❌ Dashboards lentos
**Solução:**
1. Execute os scripts de criação de índices em `scripts/`
2. Execute `scripts/02-maintenance.sql` mensalmente
3. Limpe o cache usando `tools/limpar-cache.html`

### ❌ Filtros não carregam
**Solução:**
1. Execute `tools/diagnostico.html` para verificar dados
2. Limpe o cache do navegador
3. Verifique se as tabelas auxiliares têm dados

**Mais problemas?** Consulte `docs/TROUBLESHOOTING.md`

---

## 🎯 Roadmap

### ✅ Implementado
- ✅ 7 Dashboards completos (Região, Equipe, Produtos, Clientes, Performance Semanal, Produtos Parados, Gerenciar Usuários)
- ✅ Sistema de Login e Autenticação completo
- ✅ Gerenciamento de Usuários com controle de permissões
- ✅ Controle de acesso por dashboard (permissões granulares)
- ✅ PWA completo (funciona offline e pode ser instalado)
- ✅ Busca digitável em todos os filtros
- ✅ Layout 70/30 otimizado
- ✅ 26 índices de performance
- ✅ Sistema de cache inteligente (LocalStorage + Service Worker)
- ✅ Filtros com busca em tempo real e cascata automática
- ✅ Paginação de 25 registros
- ✅ Gráficos interativos Chart.js
- ✅ Exportação Excel/PDF
- ✅ Logo Germani Alimentos em todos os dashboards
- ✅ Dashboard de Performance Semanal com metas
- ✅ Dashboard de Produtos Parados com análise de risco

____________
att: 
📊 Atualizações - Dashboard de Cobrança Semanal
Novo Módulo: Performance vs Potencial
Adicionado controle semanal de performance da equipe comercial com métricas de penetração de mercado e eficiência por rota.
🆕 Tabelas do Banco
potencial_cidade: Potencial por cidade (população, coordenadas, rota)
potencial_representante: Metas semanais (peso, clientes, SKUs)
representante_cidades: Relacionamento representante ↔ cidades atendidas
📈 O que Faz
Compara vendas reais da semana vs. meta estabelecida
Calcula % de penetração de clientes (ativos / potencial da cidade)
Identifica representantes abaixo da meta para ação imediata
Ranking automático por faturamento, peso e quantidade de clientes
🚀 Como Usar
Segunda-feira: Atualize os dados de vendas no Turso
Acesse cobranca-semanal.html via GitPages
Selecione a semana desejada no dropdown
Representantes em vermelho requerem ação imediata (< 70% da meta)
⚙️ Próximos Passos
Análise de produtos "parados" (revenda semanal)
Dashboard de margem e descontos
Mapa de calor de performance geográfica


### 🚧 Em Desenvolvimento
- Análise Financeira
- Gestão de Estoque
- Comparativo de períodos

### 💡 Futuras Melhorias
- Criptografia de senhas (bcrypt/hash)
- Sessão com expiração automática
- Log de atividades dos usuários
- Dashboard Executivo com IA
- Drill-down detalhado
- Filtros salvos e favoritos
- Análise Preditiva
- Modo escuro
- Relatórios agendados
- Autenticação Two-Factor (2FA)

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

- Reportar bugs via GitHub Issues
- Sugerir melhorias
- Enviar pull requests
- Melhorar documentação

---

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

---

## 👨‍💻 Autor

**Angeloxiru**
- GitHub: [@Angeloxiru](https://github.com/Angeloxiru)
- Projeto: [Ger_Comercial](https://github.com/Angeloxiru/Ger_Comercial)

---

## 📞 Recursos e Links

- **Sistema:** https://angeloxiru.github.io/Ger_Comercial/
- **Turso Docs:** https://docs.turso.tech/
- **LibSQL Client:** https://github.com/libsql/libsql-client-ts
- **Chart.js:** https://www.chartjs.org/
- **SheetJS (XLSX):** https://sheetjs.com/

---

<p align="center">
  <strong>🚀 100% Web | 📊 Dashboards Inteligentes | 🔒 Seguro e Rápido</strong>
</p>

<p align="center">
  Feito com ❤️ por Germani Alimentos
</p>
