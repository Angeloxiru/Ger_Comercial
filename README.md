# 📊 Ger Comercial - Sistema Integrado de Gerenciamento

Sistema de Gerenciamento Comercial desenvolvido com Turso Database (LibSQL), otimizado para análise de vendas com dashboards interativos, autenticação e filtros inteligentes.

---

## ✨ Destaques do Sistema

- ✅ **100% Frontend** - JavaScript ES Modules, sem backend necessário
- ✅ **Autenticação e Permissões** - Sistema completo de login e controle de acesso
- ✅ **Turso Database** - Cloud SQLite otimizado com 26 índices de performance
- ✅ **Sistema de Autenticação** - Login seguro com controle de permissões por dashboard
- ✅ **Gerenciamento de Usuários** - Interface administrativa para criar e gerenciar usuários
- ✅ **PWA (Progressive Web App)** - Funciona offline e pode ser instalado no dispositivo
- ✅ **6 Dashboards Completos** - Vendas, equipe, produtos, clientes, cobrança e produtos parados
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
│   └── dashboard-produtos-parados.html
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
- Menu de dashboards com cards
- Controle de acesso por permissões
- Cards bloqueados ficam esmaecidos + ícone 🔒
- Informações do usuário no header
- Botão de logout

### 3. 📍 Vendas por Região
**Filtros:** Período, Rota, Sub-Rota, Cidade, Supervisor, Representante
**KPIs:** Valor Total, Quantidade, Peso, Registros
**Gráficos:** Top 10 Produtos, Distribuição

### 4. 👥 Vendas por Equipe
**Filtros:** Período, Supervisor (cascata), Representante, Cidade
**KPIs:** Performance individual e equipe
**Recursos:** Exportação Excel/PDF

### 5. 📈 Análise de Produtos
**Filtros:** Período (atalhos), Origem, Família, Produto
**Recursos:** Busca em tempo real, Limpar filtros
**Análise:** Por origem, família e SKU

### 6. 💰 Performance de Clientes
**Filtros:** Período, Grupo de Clientes, Cliente, Cidade
**Visualizações:** Top 10 Clientes, Vendas por cidade
**Análise:** Performance detalhada

### 7. 🎯 Cobrança Semanal
**Filtros:** Semana
**KPIs:** Performance vs Potencial
**Análise:** Penetração de mercado, eficiência por rota
**Ranking:** Por faturamento, peso, clientes

### 8. 🛑 Produtos Parados
**Filtros:** Supervisor, Representante, Categoria, Risco
**KPIs:** Total de produtos parados, Valor em risco, Semanas paradas
**Classificação:** Crítico (8+ sem), Alto (6-7), Médio (4-5), Baixo (4)
**Documentação:** `docs/PRODUTOS_PARADOS.md`

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
  "produtos-parados"
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

- **[docs/README.md](docs/README.md)** - Índice da documentação
- **[docs/GUIA_RAPIDO.md](docs/GUIA_RAPIDO.md)** - Guia rápido de uso
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Solução de problemas
- **[docs/AUTENTICACAO.md](docs/AUTENTICACAO.md)** - Sistema de autenticação
- **[docs/PRODUTOS_PARADOS.md](docs/PRODUTOS_PARADOS.md)** - Dashboard produtos parados
- **[docs/INDICES-EXPLICACAO.md](docs/INDICES-EXPLICACAO.md)** - Como funcionam os índices
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
- ✅ 26 índices de performance
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
  <strong>🚀 100% Web | 🔐 Autenticação Segura | 📊 Dashboards Inteligentes</strong>
</p>

<p align="center">
  Feito com ❤️ por Germani Alimentos
</p>
