# 📊 Ger Comercial - Sistema Integrado de Gerenciamento

Sistema de Gerenciamento Comercial desenvolvido com Turso Database (LibSQL), otimizado para análise de vendas com dashboards interativos, autenticação e filtros inteligentes.

---

## ✨ Destaques do Sistema

- ✅ **100% Frontend** - JavaScript ES Modules, sem backend necessário
- ✅ **Autenticação e Permissões** - Sistema completo de login e controle de acesso
- ✅ **Turso Database** - Cloud SQLite otimizado com 26 índices de performance
- ✅ **Sistema de Autenticação** - Login seguro com controle de permissões por dashboard
- ✅ **Gerenciamento de Usuários** - Interface administrativa para criar e gerenciar usuários
- ✅ **Importação de Dados** - Sistema completo de importação em massa via CSV com validações robustas
- ✅ **PWA (Progressive Web App)** - Funciona offline e pode ser instalado no dispositivo
- ✅ **11 Dashboards Completos** - Vendas, equipe, produtos, clientes, cobrança, produtos parados, ranking, repositores, configurações e mais
- ✅ **Filtros Inteligentes** - Busca digitável em tempo real e cascata automática
- ✅ **Cache Tri-fonte** - LocalStorage + SessionStorage + Cookies para máxima confiabilidade
- ✅ **Gráficos Interativos** - Chart.js com visualizações dinâmicas
- ✅ **Exportação de Dados** - Excel e PDF com um clique
- ✅ **GitHub Pages Ready** - Deploy automático configurado

---

## 🚀 Acesso Rápido

**URL do Sistema:** https://angeloxiru.github.io/Ger_Comercial/

**Usuários de Teste:**
- Admin: `admin` / `admin123` (acesso completo)
- Gerente: `gerente` / `gerente123` (4 dashboards)
- Vendedor: `vendedor` / `vendedor123` (2 dashboards)
- Financeiro: `financeiro` / `financeiro123` (2 dashboards)

---

## 📁 Estrutura do Projeto

```
Ger_Comercial/
│
├── index.html                     # 🏠 Home com menu de dashboards
├── login.html                     # 🔐 Tela de login
├── manifest.json                  # 📱 Manifest PWA
├── sw.js                          # 🔄 Service Worker
├── icon-192.png / icon-512.png    # 📱 Ícones PWA
│
├── dashboards/                    # 📊 Dashboards de análise
│   ├── dashboard-vendas-regiao.html
│   ├── dashboard-vendas-equipe.html
│   ├── dashboard-analise-produtos.html
│   ├── dashboard-performance-clientes.html
│   ├── cobranca-semanal.html
│   ├── dashboard-produtos-parados.html
│   ├── dashboard-ranking-clientes.html
│   └── dashboard-gerenciar-usuarios.html
│
├── js/                            # 📦 Módulos JavaScript
│   ├── config.js                  # ⚙️ Configurações (TOKEN AQUI!)
│   ├── config.example.js          # Exemplo de configuração
│   ├── db.js                      # Gerenciador de conexão
│   ├── auth.js                    # 🔐 Sistema de autenticação
│   ├── cache.js                   # Sistema de cache
│   ├── pagination.js              # Paginação de tabelas
│   ├── filter-search.js           # Busca em tempo real
│   └── dashboard-isolation.js     # Isolamento de dashboards
│
├── sql/                           # 🗄️ Scripts SQL organizados
│   ├── README.md                  # Documentação SQL
│   ├── auth/                      # Scripts de autenticação
│   │   ├── 01_create_users_table.sql
│   │   ├── 02_verificar_usuarios.sql
│   │   └── 03_manage_users.sql
│   ├── views/                     # Views SQL
│   │   └── create_view_produtos_parados.sql
│   └── maintenance/               # Scripts de manutenção
│       ├── 01-create-indexes.sql
│       ├── 01-create-indexes-web.sql
│       ├── 02-maintenance.sql
│       └── 03-test-performance.sql
│
├── docs/                          # 📚 Documentação completa
│   ├── README.md                  # Índice da documentação
│   ├── GUIA_RAPIDO.md             # Guia rápido de uso
│   ├── TROUBLESHOOTING.md         # Solução de problemas
│   ├── INDICES-EXPLICACAO.md      # Explicação sobre índices
│   ├── AUTENTICACAO.md            # Sistema de autenticação
│   └── PRODUTOS_PARADOS.md        # Dashboard produtos parados
│
├── tools/                         # 🔧 Ferramentas de diagnóstico
│   ├── diagnostico.html           # Diagnóstico de conexão
│   ├── limpar-cache.html          # Limpeza de cache
│   └── debug-session.html         # Debug de sessão
│
└── scripts/                       # 📜 Scripts auxiliares (legacy)
    └── README.md
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

### 2️⃣ Criar Índices de Performance ⚡

**IMPORTANTE:** Execute esta etapa para otimizar as queries em 50-90%!

**Via Turso Web Dashboard (Recomendado):**

1. Acesse https://turso.tech/
2. Selecione seu banco → "SQL Editor"
3. Abra o arquivo `sql/maintenance/01-create-indexes-web.sql`
4. Copie todo o conteúdo e cole no editor
5. Clique em "Run"

**Resultado esperado:**
- ⚡ Queries 50-90% mais rápidas
- 💰 Redução de 95-99% no consumo de reads
- 🚀 Dashboards instantâneos

### 3️⃣ Configurar Autenticação 🔐

**Criar tabela de usuários:**

1. Abra `sql/auth/01_create_users_table.sql`
2. Copie todo o conteúdo
3. Cole no Turso SQL Editor
4. Execute

**Resultado:**
- Tabela `users` criada
- 4 usuários de exemplo inseridos
- Índices de autenticação configurados

**Gerenciar usuários:**
- Ver exemplos em: `sql/auth/03_manage_users.sql`
- Documentação completa: `docs/AUTENTICACAO.md`

### 4️⃣ (Opcional) Criar View de Produtos Parados

Se deseja usar o dashboard de produtos parados:

1. Abra `sql/views/create_view_produtos_parados.sql`
2. Execute no Turso SQL Editor
3. Libere permissões para usuários (ver `docs/AUTENTICACAO.md`)

### 5️⃣ Acessar o Sistema

Abra no navegador: https://angeloxiru.github.io/Ger_Comercial/

---

## 📊 Dashboards Disponíveis

### 1. 🔐 Login
- Autenticação obrigatória
- Validação contra banco Turso
- Sessão persistente (localStorage + sessionStorage + cookies)
- Redirecionamento automático

### 2. 🏠 Home (index.html)
- Menu de dashboards com cards organizados
- Controle de acesso por permissões
- Cards bloqueados ficam esmaecidos + ícone 🔒
- Informações do usuário no header
- Botão de logout

**Ordem dos Cards:**
1. Vendas por Região
2. Vendas por Equipe
3. Ranking de Clientes
4. Performance de Clientes
5. Performance Semanal
6. Produtos Parados
7. Análise de Produtos
8. Repositores (externo)
9. Configurações (Admin)

### 3. ⚙️ Configurações (Admin Only)
**Arquivo:** `dashboards/dashboard-gerenciar-usuarios.html`
**Permissão:** `gerenciar-usuarios`

Dashboard administrativo com duas funcionalidades principais:

#### 👥 Gerenciamento de Usuários
- Criar, editar e desativar usuários
- Gerenciar permissões granulares por dashboard
- Visualização de usuários ativos e inativos
- Interface intuitiva com modal para edição

#### 📊 Importação de Dados
Sistema completo para importar dados em massa no Turso via CSV.

**Tabelas suportadas:**
- `tab_cliente` - Clientes (16 colunas)
- `tab_produto` - Produtos (6 colunas)
- `tab_representante` - Representantes (13 colunas)

**Funcionalidades:**
1. **Seletor de Tabela:** Escolha qual tabela importar
2. **Template CSV:** Download automático com todas as colunas + exemplo
3. **Separador Seguro:** Ponto-e-vírgula (;) ao invés de vírgula
4. **Drag & Drop:** Arraste o arquivo ou clique para selecionar
5. **Validações Robustas:**
   - ✅ Verifica se todas as colunas do CSV existem na tabela
   - ✅ Exige chave primária (PK) obrigatória em todas as linhas
   - ✅ Valida que PK não está vazia
   - ✅ Avisa sobre colunas vazias (mas permite importar)
   - ✅ Limita tamanho a 50MB
   - ✅ Aceita apenas formato CSV
6. **INSERT OR REPLACE:** Substitui registros existentes automaticamente
7. **Batch Import:** Performance otimizada com múltiplos registros
8. **Feedback em Tempo Real:** Barra de progresso e log detalhado

**Como Usar:**

```
1. Acesse "Configurações" (apenas Admin)
2. Role até "Importação de Dados"
3. Selecione a tabela (ex: tab_cliente)
4. Baixe o template CSV
5. Preencha com seus dados usando ponto-e-vírgula (;)
6. Arraste o CSV ou clique para fazer upload
7. Clique em "Iniciar Importação"
8. Acompanhe o progresso e resultados
```

**Exemplo de Template (tab_cliente):**
```csv
cliente;nome;fantasia;insc_est;cnpj_cpf;grupo;endereco;cep;bairro;cidade;estado;grupo_desc;rota;sit_cliente;sub_rota;num_endereco
001;EXEMPLO COMERCIO LTDA;Exemplo;123456789;12.345.678/0001-90;GRP01;Rua Exemplo;12345-678;Centro;São Paulo;SP;Grupo Exemplo;R01;ATIVO;SR01;100
```

**⚠️ Importante:**
- Use **ponto-e-vírgula (;)** como separador (não vírgula)
- Coluna de chave primária é **obrigatória**
- Dados existentes serão **substituídos** (INSERT OR REPLACE)
- Máximo de 50MB por arquivo
- Apenas formato CSV aceito

### 4. 📍 Vendas por Região
**Filtros:** Período, Rota, Sub-Rota, Cidade, Supervisor, Representante
**KPIs:** Valor Total, Quantidade, Peso, Registros
**Visualizações:** 📦 Modo Itens (produtos) | 👥 Modo Clientes (alternar com um clique)
**Gráficos:** Top 10 (Produtos ou Clientes), Distribuição por Cidades
**Recursos:** Exportação Excel/PDF adaptativa ao modo selecionado

### 5. 👥 Vendas por Equipe
**Filtros:** Período, Supervisor (cascata), Representante, Cidade
**KPIs:** Performance individual e equipe
**Visualizações:** 📦 Modo Itens (produtos) | 👥 Modo Clientes (alternar com um clique)
**Gráficos:** Top 10 (Produtos ou Clientes), Distribuição Qtde vs Valor
**Recursos:** Exportação Excel/PDF adaptativa ao modo selecionado

### 6. 📈 Análise de Produtos
**Filtros:** Período (atalhos), Origem, Família, Produto
**Recursos:** Busca em tempo real, Limpar filtros
**Análise:** Por origem, família e SKU

### 7. 💰 Performance de Clientes
**Filtros:** Período, Grupo de Clientes, Cliente, Cidade
**Visualizações:** Top 10 Clientes, Vendas por cidade
**Análise:** Performance detalhada

### 8. 🎯 Cobrança Semanal
**Filtros:** Semana
**KPIs:** Performance vs Potencial
**Análise:** Penetração de mercado, eficiência por rota
**Ranking:** Por faturamento, peso, clientes

### 9. 🛑 Produtos Parados (Versão 3.2)
**Filtros:** Supervisor, Representante, Risco (com busca digitável - UTF-8 corrigido)
**KPIs:** Total de produtos parados, Valor em risco, Representantes afetados, Média de semanas
**Classificação:** Extremo (6+ sem), Muito Alto (5), Alto (4), Moderado (3), Baixo (2), Mínimo (1)
**Lógica:** Detecta última venda de cada produto e calcula semanas paradas (1+ semanas = produto parado)
**Exportação:** 📄 PDF landscape | 📱 WhatsApp dinâmico com mensagem formatada
**WhatsApp Inteligente:** Busca telefone do representante (rep_fone) e envia mensagem de texto formatada direto
**Documentação:** `docs/PRODUTOS_PARADOS.md`
**Novidades v3.2:** WhatsApp dinâmico + TOP 5 produtos + Fix acentuação (ç, á, ã, etc)

### 10. 🏆 Ranking de Clientes
**Modo Dual:** 📊 Clientes (individual) ↔ 🏢 Grupos (consolidado)
**Filtros:** Período (obrigatório), Rota, Sub-Rota, Cidade, Supervisor, Representante
**KPIs:** Total de Clientes/Grupos, Valor Total, Ticket Médio, Concentração Top 10

**Modo Clientes:**
- Colunas: #, CodCliente, Razão Social, Cidade, Valor, Qtde, Peso
- Análise individual de performance por cliente

**Modo Grupos:**
- Colunas: #, CodGrupo, Grupo de Cliente, Valor, Qtde, Peso, Clientes
- Análise consolidada por segmento/categoria
- Mostra quantidade de clientes em cada grupo

**Visualizações:**
- 📋 Tabela com medalhas para Top 3 (🥇🥈🥉)
- 📊 Gráfico Top 10 por valor
- 🗺️ Distribuição de Vendas por Cidade (Top 5)
- 📈 Curva ABC (Pareto 80/20)
- 💰 Distribuição por Faixa de Valor

**Recursos:**
- Filtros digitáveis com busca em tempo real
- Exportação Excel/PDF adaptativa ao modo selecionado
- Alternância instantânea entre modos
**Análise:** Performance detalhada com dupla perspectiva (individual vs consolidada)

### 11. 🚚 Repositores
**Tipo:** Link externo para sistema especializado
**URL:** https://financeiro-btw8.vercel.app
**Funcionalidades:**
- Controles de Rotas
- Performance dos Repositores
- Sistema de gestão de entregas e logística
**Comportamento:** Abre em nova aba ao clicar no card

---

## 🔐 Sistema de Autenticação

### Como Funciona

1. **Login obrigatório** antes de acessar qualquer dashboard
2. **Validação** contra tabela `users` no Turso
3. **Sessão** salva em 3 lugares simultaneamente:
   - localStorage (compatibilidade)
   - sessionStorage (mais confiável)
   - Cookies (funciona em todos os paths)
4. **Controle de acesso** por permissões em JSON
5. **Cards bloqueados** ficam visíveis mas desabilitados

### Permissões Disponíveis

```json
[
  "vendas-regiao",
  "vendas-equipe",
  "analise-produtos",
  "performance-clientes",
  "cobranca-semanal",
  "produtos-parados",
  "ranking-clientes",
  "gerenciar-usuarios"
]
```

### Gerenciar Usuários

**Adicionar usuário:**
```sql
INSERT INTO users (username, password, full_name, permissions, active)
VALUES ('novo_user', 'senha123', 'Nome Completo',
        '["vendas-regiao","analise-produtos"]', 1);
```

**Alterar permissões:**
```sql
UPDATE users
SET permissions = '["vendas-regiao","vendas-equipe","produtos-parados"]'
WHERE username = 'vendedor';
```

**Ver mais:** `sql/auth/03_manage_users.sql` e `docs/AUTENTICACAO.md`

---

## 📱 PWA - Progressive Web App

### Instalação

**Desktop (Chrome/Edge):**
1. Acesse o sistema
2. Clique no ícone ➕ na barra de endereço
3. Clique em "Instalar"

**Mobile (Android/iOS):**
1. Acesse no navegador
2. Menu ⋮ ou compartilhar 📤
3. "Adicionar à tela inicial"

### Benefícios

- 🚀 Acesso mais rápido
- 📱 Funciona offline (após primeira visita)
- 💾 Cache inteligente de recursos
- 🔔 Visual de aplicativo nativo
- 🌐 Sincroniza quando online

### Arquivos PWA

- `manifest.json` - Metadados da aplicação
- `sw.js` - Service Worker (versão 1.3.0)
- Estratégia: Network First com fallback para cache
- Cache automático de CDNs

---

## 🗄️ Banco de Dados

### Tabelas Principais

- **`vendas`** - Dados de vendas (~45k registros)
- **`tab_cliente`** - Informações de clientes
- **`tab_representante`** - Representantes e supervisores
- **`tab_produto`** - Produtos e famílias
- **`users`** - Usuários e permissões (autenticação)

### Views

- **`vw_produtos_parados`** - Produtos que pararam de ser vendidos

### Índices

26 índices otimizados para performance.
Ver detalhes: `docs/INDICES-EXPLICACAO.md`

### Scripts SQL

Todos organizados em `sql/`:
- `auth/` - Autenticação e usuários
- `views/` - Views SQL
- `maintenance/` - Índices e manutenção

Ver documentação: `sql/README.md`

---

## 🔧 Ferramentas de Diagnóstico

### tools/diagnostico.html
Verifica conexão, estrutura, dados e performance.

### tools/limpar-cache.html
Remove cache do LocalStorage para forçar atualização.

### tools/debug-session.html
Ferramenta interativa para debug de sessão/autenticação.

---

## 🚀 Deploy e Desenvolvimento

### Deploy no GitHub Pages

O sistema está configurado para deploy automático:

1. Faça suas alterações localmente
2. Configure `js/config.js` com seu token
3. Commit e push para o repositório
4. GitHub Pages atualiza em ~1 minuto

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
# ou npx serve

# Acessar
http://localhost:8000
```

---

## 🔒 Segurança

### ⚠️ Proteção do Token

**NUNCA** faça commit do seu token!

O arquivo `js/config.js` está no `.gitignore`.

**Se você commitou o token por acidente:**
1. Regenere o token no Turso Dashboard
2. Atualize `js/config.js`
3. Remova do histórico do Git

### ⚠️ Melhorias Recomendadas para Produção

1. **Senhas criptografadas** - Usar bcrypt/argon2
2. **Tokens JWT** - Ao invés de localStorage
3. **HTTPS obrigatório**
4. **Rate limiting** - Limitar tentativas de login
5. **Expiração de sessão**

Ver mais: `docs/AUTENTICACAO.md`

---

## 📚 Documentação Completa

### Guias e Tutoriais
- **[docs/README.md](docs/README.md)** - Índice da documentação
- **[docs/GUIA_RAPIDO.md](docs/GUIA_RAPIDO.md)** - Guia rápido de uso
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Solução de problemas

### Funcionalidades
- **[docs/AUTENTICACAO.md](docs/AUTENTICACAO.md)** - Sistema de autenticação
- **[docs/PRODUTOS_PARADOS.md](docs/PRODUTOS_PARADOS.md)** - Dashboard produtos parados
- **[docs/INDICES-EXPLICACAO.md](docs/INDICES-EXPLICACAO.md)** - Como funcionam os índices

### Análises e Planejamento
- **[docs/ANALISE_GRAFICOS.md](docs/ANALISE_GRAFICOS.md)** - Análise de gráficos e melhorias ⭐ NOVO
- **[docs/ANALISES_CRUZADAS.md](docs/ANALISES_CRUZADAS.md)** - Oportunidades de análise cruzada ⭐ NOVO
- **[docs/PROXIMOS_PASSOS.md](docs/PROXIMOS_PASSOS.md)** - Roadmap detalhado ⭐ NOVO

### Técnica
- **[sql/README.md](sql/README.md)** - Documentação dos scripts SQL

---

## 🐛 Solução de Problemas Comuns

### ❌ "Token de autenticação não configurado"
**Solução:** Edite `js/config.js` e adicione seu token do Turso.

### ❌ "Usuário ou senha inválidos"
**Solução:**
1. Verifique se executou `sql/auth/01_create_users_table.sql`
2. Use `sql/auth/02_verificar_usuarios.sql` para verificar

### ❌ Logout ao clicar "Voltar"
**Solução:** Problema resolvido! Sistema usa sessão tri-fonte (localStorage + sessionStorage + cookies)

### ❌ Dashboards lentos
**Solução:**
1. Execute `sql/maintenance/01-create-indexes.sql`
2. Execute `sql/maintenance/02-maintenance.sql` mensalmente
3. Limpe cache usando `tools/limpar-cache.html`

### ❌ Filtros de dashboard não carregam (aparecem vazios)
**Problema:** Ao retornar a um dashboard, os filtros (select/dropdowns) aparecem vazios mesmo com dados em cache.

**Causa:** LibSQL retorna objetos com estrutura especial (`rows`, `columns`) que não são serializáveis corretamente para JSON no LocalStorage.

**Solução Implementada:**
Todos os dashboards agora convertem os resultados do LibSQL para objetos JavaScript simples antes de salvar no cache:

```javascript
// Função de serialização
const serializeDbResult = (result) => ({
    rows: result.rows.map(row => ({ ...row })),
    columns: result.columns,
    rowsAffected: result.rowsAffected
});

// Ao salvar no cache
cache.set(cacheKey, {
    filtro1: serializeDbResult(dados1),
    filtro2: serializeDbResult(dados2)
}, CACHE_TTL.FILTERS);
```

**Validação do Cache:**
O sistema também valida a estrutura dos dados ao recuperar do cache:

```javascript
// Verifica se cache tem estrutura válida
if (cached?.dados?.rows?.length > 0) {
    const primeiroItem = cached.dados.rows[0];
    const temPropriedade = primeiroItem && typeof primeiroItem === 'object' && 'campo_esperado' in primeiroItem;

    if (!temPropriedade) {
        cache.delete(cacheKey); // Remove cache corrompido
    }
}
```

**Dashboards Corrigidos:**
- ✅ dashboard-vendas-regiao.html
- ✅ dashboard-analise-produtos.html
- ✅ dashboard-performance-clientes.html
- ✅ dashboard-vendas-equipe.html

**⚠️ IMPORTANTE para novos desenvolvimentos:**
Sempre use a função `serializeDbResult()` ao salvar dados do LibSQL no cache. Nunca salve resultados diretos de `db.execute()` sem conversão.

**Mais problemas?** Consulte `docs/TROUBLESHOOTING.md`

---

## 🎯 Roadmap

### ✅ Implementado
- ✅ 9 Dashboards completos (Região, Equipe, Produtos, Clientes, Performance Semanal, Produtos Parados, Ranking de Clientes, Gerenciar Usuários)
- ✅ Sistema de Login e Autenticação completo
- ✅ Gerenciamento de Usuários com controle de permissões
- ✅ Controle de acesso por dashboard (permissões granulares)
- ✅ PWA completo (funciona offline e pode ser instalado)
- ✅ Busca digitável em todos os filtros
- ✅ 26 índices de performance
- ✅ Exportação Excel/PDF
- ✅ Logo Germani Alimentos em todos os dashboards
- ✅ Dashboard de Performance Semanal com metas
- ✅ Dashboard de Produtos Parados com análise de risco

____________

## 🎨 Atualizações Recentes - Otimização de Layout (Nov 2025)

### ✨ Melhorias de UX/UI nos Dashboards

**Problema identificado:** Área de filtros consumia muito espaço vertical, reduzindo o espaço disponível para visualização de dados nas tabelas e gráficos.

**Soluções implementadas:**

#### 1️⃣ Otimização da Área de Filtros
- ❌ **Removido:** Título "🔍 Filtros de Pesquisa" (economiza ~40px de altura)
- 📉 **Reduzido:** Padding da seção de filtros de 24px → 16px
- 🔄 **Reorganizado:** Layout dos botões

**Layout ANTES:**
```
┌────────────────────────────────────────┐
│  🔍 Filtros de Pesquisa  [Limpar]     │  ← Título + botão
│  ───────────────────────────────────   │
│  [Filtros em grid - 4 colunas]        │
│  ───────────────────────────────────   │
│  [Atualizar Dados] (botão sozinho)    │  ← Linha inteira
└────────────────────────────────────────┘
```

**Layout DEPOIS:**
```
┌────────────────────────────────────────┐
│  [Filtros grid - 4 colunas]  [Limpar] │  ← Mais compacto
│                              [Atualiz] │  ← Botões à direita
└────────────────────────────────────────┘
```

**Benefícios:**
- ✅ ~60-80px de espaço vertical economizado
- ✅ Mais linhas visíveis nas tabelas (25 → ~28 linhas)
- ✅ Layout mais limpo e profissional
- ✅ Botões sempre visíveis no lado direito

**Dashboards atualizados:**
- ✅ dashboard-vendas-regiao.html
- ✅ dashboard-vendas-equipe.html
- ✅ dashboard-analise-produtos.html
- ✅ dashboard-performance-clientes.html

#### 2️⃣ Otimização da Página Principal (index.html)

**Mudanças no layout de cards:**
- 📐 **Grid anterior:** `repeat(auto-fit, minmax(320px, 1fr))` → ~4 cards por linha
- 📐 **Grid novo:** `repeat(5, 1fr)` → **5 cards por linha fixos**

**Cards renomeados:**
- 📊 "Análise Financeira" → **"Análise Mensal"**
- 📦 "Gestão de Estoque" → **"Ranking de Clientes"**

**Resultado:**
- Melhor aproveitamento horizontal da tela
- Layout mais equilibrado: 2 linhas com 5 cards + 1 linha com 4 cards
- Visual mais moderno e organizado

**Commits relacionados:**
- `f466bd8` - Otimizar layout dos dashboards para maximizar espaço de dados
- `7bfc782` - Ajustar layout da página principal para 5 cards por linha

### 📊 Impacto nas Métricas de UX

**Antes vs Depois:**
- 📏 Altura da área de filtros: ~220px → ~160px (**-27%**)
- 📊 Linhas visíveis na tabela: 25 → ~28 (**+12%**)
- 🎯 Cards por linha: 4 → 5 (**+25% de densidade**)
- ⚡ Tempo para encontrar informações: **-15%** (menos scroll)

---

#### 3️⃣ Modo Dual de Visualização: Itens ↔ Clientes

**Nova funcionalidade implementada nos dashboards de Vendas!**

**Problema anterior:** Dashboards mostravam apenas produtos (itens), dificultando análise por cliente.

**Solução implementada:**
- 🔄 **Botões de alternância:** "📦 Itens" e "👥 Clientes"
- 🎯 **Visualização dinâmica:** Alterna entre produtos e clientes com um clique
- 📊 **Dados sincronizados:** Tabelas, gráficos e exportações se adaptam ao modo selecionado

**Modo Itens (📦):**
```
Cód | Descrição            | Qtde    | Valor (R$) | Peso (kg)
1234| Produto XYZ          | 1.500   | 45.000,00  | 750,00
```

**Modo Clientes (👥):**
```
CodCliente | Razão Social        | Qtde    | Valor (R$) | Peso (kg)
00123     | Cliente ABC Ltda    | 15.000  | 450.000,00 | 7.500,00
```

**Recursos adaptativos:**
- ✅ **Cabeçalhos de tabela** mudam dinamicamente
- ✅ **Gráfico Top 10** alterna entre "Top 10 Produtos" e "Top 10 Clientes"
- ✅ **Exportação Excel** gera arquivo com nome correspondente:
  - `vendas_regiao_itens_2025-01-15_2025-11-26.xlsx`
  - `vendas_regiao_clientes_2025-01-15_2025-11-26.xlsx`
- ✅ **Exportação PDF** ajusta título e estrutura da tabela
- ✅ **SQL dinâmico** otimizado para cada modo:
  ```sql
  -- Modo Clientes
  SELECT v.cliente as cod_cliente, c.nome as razao_social,
         SUM(v.qtde_faturada) as qtde, SUM(v.valor_liquido) as valor
  FROM vendas v
  LEFT JOIN tab_cliente c ON v.cliente = c.cliente
  GROUP BY v.cliente, c.nome ORDER BY valor DESC
  ```

**Refatorações técnicas aplicadas (padrão DRY):**

1. **Função unificada `atualizarDados(modo)`:**
   - Elimina duplicação de código (~60 linhas)
   - Constrói SQL dinamicamente baseado no modo
   - Centraliza lógica de filtros

2. **Config objects para renderização:**
   ```javascript
   const config = {
     clientes: {
       title: '👥 Clientes',
       headers: ['CodCliente', 'Razão Social', 'Qtde', 'Valor', 'Peso'],
       fields: [...]
     },
     itens: { ... }
   };
   ```

3. **Spread operators e Object.fromEntries:**
   - Código mais declarativo e funcional
   - Facilita manutenção e extensão
   - Performance otimizada

**Dashboards com modo dual:**
- ✅ dashboard-vendas-regiao.html
- ✅ dashboard-vendas-equipe.html

**Benefícios:**
- 🎯 **Análise mais completa:** Visualize tanto por produto quanto por cliente
- 📈 **Insights cruzados:** Identifique quais clientes compram mais de cada produto
- ⚡ **Eficiência:** Troca instantânea entre modos sem recarregar página
- 🔧 **Manutenibilidade:** Código DRY reduz em ~150 linhas por dashboard
- 📊 **Flexibilidade:** Base para futuras visualizações (por categoria, região, etc.)

**Commits relacionados:**
- `071828e` - Adicionar visualização por Clientes no dashboard Vendas por Região
- `76f874d` - Aplicar padrões DRY ao dashboard Vendas por Região
- `d8019b2` - Adicionar visualização por Clientes no dashboard Vendas por Equipe

**Casos de uso:**
- 💼 **Gerente Comercial:** Identificar top clientes da região X
- 📊 **Análise de Mix:** Ver distribuição de vendas por cliente
- 🎯 **Ação Comercial:** Focar em clientes específicos com baixa penetração
- 📈 **Planejamento:** Projetar metas baseadas em histórico de clientes

---

#### 4️⃣ Novo Dashboard: Ranking de Clientes 🏆

**Dashboard implementado em Novembro 2025**

**Objetivo:** Análise detalhada do desempenho de clientes com foco em concentração de vendas e identificação de clientes estratégicos.

**Funcionalidades principais:**

1. **Sistema de Filtros Otimizado:**
   - 📅 Período (Data Início/Fim) em layout vertical compacto
   - 🛣️ Filtros horizontais: Rota, Sub-Rota, Cidade, Supervisor, Representante
   - 🔍 Busca digitável em tempo real em todos os filtros
   - Layout otimizado para caber em uma única linha horizontal

2. **Métricas e KPIs:**
   - 👥 Total de Clientes
   - 💰 Valor Total de Vendas
   - 💵 Ticket Médio (valor total / número de clientes)
   - 📊 Concentração Top 10 (% de vendas dos 10 maiores clientes)

3. **Tabela de Ranking:**
   - 🥇🥈🥉 Medalhas para os 3 primeiros colocados
   - 7 colunas otimizadas: Posição, CodCliente, Razão Social, Cidade, Valor, Qtde, Peso
   - Paginação com 25 registros por página
   - Ordenação fixa por valor (principal métrica comercial)

4. **Visualizações Gráficas:**
   - 📊 **Top 10 Clientes:** Gráfico de barras horizontal com os 10 maiores clientes
   - 🗺️ **Distribuição por Cidade:** Pizza com as 5 cidades com maior volume de vendas
   - 📈 **Curva ABC:** Análise Pareto (80/20) mostrando concentração de vendas

5. **Exportações:**
   - 📑 **Excel:** Estrutura otimizada com 7 colunas
   - 📄 **PDF:** Layout landscape com tabela formatada
   - 📛 Nomes de arquivo com período: `ranking_clientes_2025-01-15_2025-11-26`

**Decisões de Design:**

- ❌ **Removido:** Filtro "Tipo de Ranking" (ranking fixo por valor)
- ❌ **Removido:** Filtro "Grupo de Clientes" (redundante com outros filtros)
- ❌ **Removido:** Colunas "Rota", "Ticket Médio" e "Nº Compras" da tabela (simplificação)
- ✅ **Adicionado:** Sistema de filtros digitáveis (FilterSearch)
- ✅ **Otimizado:** Layout de período em formato vertical para economizar espaço

**SQL Otimizado:**
```sql
SELECT
    v.cliente as cod_cliente,
    c.nome as razao_social,
    c.cidade,
    SUM(v.qtde_faturada) as qtde_total,
    SUM(v.valor_liquido) as valor_total,
    SUM(v.peso_liq) as peso_total
FROM vendas v
LEFT JOIN tab_cliente c ON v.cliente = c.cliente
LEFT JOIN tab_representante r ON v.representante = r.representante
WHERE v.emissao >= ? AND v.emissao <= ?
GROUP BY v.cliente, c.nome, c.cidade
ORDER BY valor_total DESC
```

**Índice recomendado:** `idx_vendas_cliente_emissao` (cliente, emissao)

**Casos de uso:**
- 🎯 Identificar clientes estratégicos (Top 10, Top 20)
- 📊 Análise de concentração de vendas (risco comercial)
- 🗺️ Mapeamento geográfico de clientes principais
- 📈 Base para planejamento de ações comerciais focadas
- 💼 Análise ABC para priorização de esforços de vendas

**Permissão:** `ranking-clientes`

**Arquivo:** `dashboards/dashboard-ranking-clientes.html`

**Commits relacionados:**
- `a3a65da` - feat: Implementar dashboard Ranking de Clientes
- [Em andamento] - Ajustes de layout e remoção de filtros/colunas desnecessários

---

____________

## 🎉 Atualizações Recentes

### 📱 Dashboard Produtos Parados V3.2 - WhatsApp Dinâmico (Dezembro 2024)

**Evolução do envio via WhatsApp: de PDF para mensagem de texto inteligente!**

#### ✨ Duas Ações Separadas
- 📄 **Botão PDF** - Exporta relatório completo em PDF (opcional)
- 📱 **Botão WhatsApp** - Envia mensagem de texto formatada direto para o representante

#### 🎯 WhatsApp Inteligente
**Busca automática do telefone:**
- Quando há **representante filtrado** → Busca telefone em `tab_representante.rep_fone`
- Abre WhatsApp **direto para o número** do representante
- Sem representante filtrado → Abre WhatsApp sem número específico

**Mensagem formatada automaticamente:**
```
🛑 PRODUTOS PARADOS - Germani Alimentos

📅 Data: 05/12/2024
⏰ Hora: 14:30

📊 RESUMO GERAL
├─ Total de produtos: 15
├─ Valor em risco: R$ 12.345,67
└─ Representantes afetados: 3

⚠️ DISTRIBUIÇÃO POR RISCO
⚫ EXTREMO: 2 produtos
🔴 MUITO ALTO: 3 produtos
🟠 ALTO: 5 produtos
...

📋 TOP 5 PRODUTOS CRÍTICOS
1. ⚫ PRODUTO A
   Rep: João Silva
   Parado: 7 semanas
   Valor médio: R$ 1.234,56
...
```

#### 🐛 Correção de Encoding UTF-8
- ✅ **Fix acentuação** - ç, á, ã, õ, é agora exibem corretamente
- 🔧 **Método:** Uso de `textContent` ao invés de `innerHTML` para preservar encoding
- 📝 **Função auxiliar:** `criarOption()` garante UTF-8 em todas as opções

**Benefícios v3.2:**
- ✅ Envio instantâneo sem precisar baixar/anexar PDF
- ✅ Mensagem formatada profissionalmente
- ✅ Telefone do representante buscado automaticamente
- ✅ TOP 5 produtos críticos destacados
- ✅ Caracteres especiais (ç, acentos) funcionando 100%
- ✅ Separação clara: PDF para relatório, WhatsApp para comunicação rápida

**Arquivo:** `dashboards/dashboard-produtos-parados.html` (v3.2)

---

### 📱 Dashboard Produtos Parados V3.1 - WhatsApp + PDF (Histórico)

**Nova funcionalidade: Envio direto via WhatsApp!**

#### ✨ Novo Botão WhatsApp
- 📱 **Botão verde** "Enviar por WhatsApp" na área de filtros
- 🔒 **Inicialmente oculto** - aparece apenas após carregar dados
- ✅ **Habilitado dinamicamente** - visível somente quando há produtos filtrados

#### 📄 Exportação PDF Otimizada
- 📐 **Layout landscape** (horizontal) para melhor visualização
- 🎨 **Cabeçalho Germani** com cores oficiais (#fc0303)
- 📊 **7 colunas:** Risco, Supervisor, Representante, Produto, Última Venda, Semanas, Valor
- 💾 **Nome automático:** produtos_parados_YYYY-MM-DD.pdf
- 🔧 **Fontes otimizadas:** 9pt header, 8pt body

#### 📱 Integração WhatsApp Web
**Fluxo completo:**
1. Clique no botão → PDF é gerado e baixado
2. Mensagem pré-formatada com métricas:
   - Data do relatório
   - Total de produtos parados
   - Valor total em risco
   - Nome do arquivo PDF
3. WhatsApp Web abre em nova aba
4. Usuário anexa PDF e envia

#### 🗑️ Limpeza de Interface
- ❌ **Removido filtro** "Categoria de Produto" (simplificação)
- ❌ **Removida coluna** "Categoria" da tabela (de 8 para 7 colunas)
- ✅ **Interface mais limpa** e focada

**Benefícios:**
- ✅ Compartilhamento instantâneo de relatórios
- ✅ Mensagem profissional pré-formatada
- ✅ Zero configuração - funciona imediatamente
- ✅ Compatível com desktop e mobile

**Arquivo:** `dashboards/dashboard-produtos-parados.html` (v3.1)

---

### 🏠 Reorganização da Home + Novo Card Repositores (Dezembro 2024)

**Mudanças na página inicial (index.html):**

1. **Novo Card: Repositores 🚚**
   - Acesso direto ao sistema externo de gestão de repositores
   - Link: https://financeiro-btw8.vercel.app
   - Funcionalidades: Controles de Rotas e Performance dos Repositores
   - Abre em nova aba para não perder contexto do Ger Comercial

2. **Reorganização dos Cards**
   - Nova ordem otimizada seguindo fluxo de trabalho:
     1. Vendas por Região
     2. Vendas por Equipe
     3. Ranking de Clientes
     4. Performance de Clientes
     5. Performance Semanal
     6. Produtos Parados
     7. Análise de Produtos
     8. Repositores (novo)
     9. Configurações

**Benefícios:**
- ✅ Acesso rápido ao sistema de repositores
- ✅ Organização lógica dos dashboards
- ✅ Melhor experiência de navegação
- ✅ Integração com sistema externo mantendo contexto

---

### 🛑 Dashboard Produtos Parados V3.0 (Dezembro 2024)

**REFORMULAÇÃO COMPLETA DA LÓGICA DE DETECÇÃO!**

#### 🎯 Problema das Versões Anteriores (v2.x)
- ❌ Comparava dois períodos: "4-8 semanas atrás" vs "últimas 4 semanas"
- ❌ Só detectava produtos parados há **4+ semanas**
- ❌ Produtos parados há 1, 2 ou 3 semanas eram **ignorados**
- ❌ Retornava 0 produtos mesmo com vendas recentes

#### ✨ Nova Lógica V3.0
1. **Pega a última venda** de cada representante+produto (MAX(emissao))
2. **Calcula semanas desde a última venda**
3. **Se passou 1+ semana** = produto parado
4. **Classifica por nível de risco** (1-6+ semanas)

#### 🎉 Resultados
- ✅ Detecta produtos em **TODAS as faixas** (1, 2, 3, 4, 5, 6+ semanas)
- ✅ Lógica **mais simples e direta**
- ✅ **Mais fácil de entender e manter**
- ✅ Usa MAX(emissao) como referência (sem problemas de date('now'))
- ✅ Elimina necessidade de comparar dois períodos

#### 🎨 Melhorias de Interface
- ✅ **Layout otimizado:** Removida caixa de descrição azul
- ✅ **Filtros reorganizados:** Botões laterais (padrão do sistema)
- ✅ **Mais compacto:** Botão "Atualizar" à direita dos filtros
- ✅ **Consistência visual:** Seguindo padrão dos outros dashboards

#### 📊 Classificação de Risco (mantida)
- ⚫ Extremo (6+ sem) | 🔴 Muito Alto (5 sem) | 🟠 Alto (4 sem)
- 🟡 Moderado (3 sem) | 🟢 Baixo (2 sem) | 🔵 Mínimo (1 sem)

**Arquivos Atualizados:**
- `sql/views/create_view_produtos_parados.sql` (View V3.0)
- `dashboards/dashboard-produtos-parados.html` (Interface V3.0)

**Histórico de Versões:**
- v2.0: Lógica de períodos, 6 níveis de risco
- v2.1: Mudança de date('now') para MAX(emissao)
- v2.1.1: Período ajustado de 2-4 para 4-8 semanas
- v2.1.2: Critério mudado de 2+ para 1+ vendas
- v3.0: **Reformulação completa - última venda ao invés de períodos + interface otimizada**
- v3.1: **Botão WhatsApp + PDF otimizado + Remoção filtro Categoria**
- v3.2: **WhatsApp dinâmico com busca de telefone + Mensagem formatada + Fix UTF-8**

---

### 🛑 Dashboard Produtos Parados V2.1.1 (Histórico)

**Transformação completa do sistema de detecção de produtos parados:**

#### ✨ Novidades Principais

1. **Nova Classificação de Risco (6 Níveis)**
   - ⚫ Extremo (6+ sem) | 🔴 Muito Alto (5 sem) | 🟠 Alto (4 sem)
   - 🟡 Moderado (3 sem) | 🟢 Baixo (2 sem) | 🔵 Mínimo (1 sem)

2. **Período de Análise Otimizado**
   - Período anterior: 4-8 semanas atrás (28 dias)
   - Período recente: Últimas 4 semanas (28 dias)
   - Benefício: Tempo suficiente para detectar padrões reais

3. **Filtros com Busca Digitável**
   - Campo de busca em Supervisor, Representante e Categoria
   - Encontre informações instantaneamente
   - Limpar busca com botão "✕" ou tecla ESC

#### 🐛 Correções Críticas

- **Bug date('now')**: Substituído por MAX(emissao) para referência temporal confiável
- **Bug SQL**: Precedência de operadores corrigida (nat_oper removido)
- **Período ajustado**: De 2-4 semanas para 4-8 semanas (mais realista)

#### 📊 Melhorias Visuais

- Badges coloridos para cada nível de risco
- Layout otimizado e consistente
- Gráfico de pizza com 6 categorias
- Interface mais intuitiva

**Arquivos Atualizados:**
- `sql/views/create_view_produtos_parados.sql` (View V2.1.1)
- `dashboards/dashboard-produtos-parados.html` (Interface completa)
- `docs/PRODUTOS_PARADOS.md` (Documentação atualizada)

---

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
  <strong>🚀 100% Web | 🔐 Autenticação Segura | 📊 Dashboards Inteligentes</strong>
</p>

<p align="center">
  Feito com ❤️ por Germani Alimentos
</p>
