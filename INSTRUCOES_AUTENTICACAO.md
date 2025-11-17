# 🔐 Sistema de Autenticação e Permissões - Ger Comercial

Sistema completo de autenticação e controle de acesso implementado para a aplicação Ger Comercial da Germani Alimentos.

---

## 📋 O que foi implementado

### ✅ 1. Tela de Login (`login.html`)
- Interface moderna e responsiva
- Campos de usuário e senha
- Validação de credenciais no banco Turso
- Mensagens de erro e sucesso
- Redirecionamento automático após login
- Credenciais de teste visíveis (remover em produção)

### ✅ 2. Módulo de Autenticação (`js/auth.js`)
- Classe `AuthManager` completa
- Login e logout
- Verificação de autenticação
- Gerenciamento de sessão (localStorage)
- Controle de permissões por dashboard
- Aplicação automática de controle de acesso nos cards

### ✅ 3. Banco de Dados Turso
- Tabela `users` com estrutura completa
- Permissões em formato JSON
- 4 usuários de exemplo pré-configurados
- Índices para otimização de performance

### ✅ 4. Controle de Acesso na Home
- Verificação de autenticação obrigatória
- Cards desabilitados visualmente (esmaecidos + ícone de cadeado)
- Cards permitidos permanecem totalmente funcionais
- Informações do usuário no header
- Botão de logout funcional

### ✅ 5. Service Worker Atualizado
- Cache dos novos arquivos de autenticação
- Versão atualizada para v2

---

## 🚀 Como Configurar

### Passo 1: Criar a Tabela no Turso

Execute o comando SQL no terminal do Turso. O arquivo completo está em:
```
sql/create_users_table.sql
```

**Comandos para executar:**

```bash
# Conectar ao banco Turso
turso db shell comercial

# Copiar e colar TODO o conteúdo do arquivo sql/create_users_table.sql
# O arquivo já contém:
# - Criação da tabela users
# - Criação de índices
# - Inserção de 4 usuários de exemplo
```

**Ou executar diretamente:**

```sql
-- Criar tabela
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT,
    permissions TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_active ON users(active);

-- Inserir usuários de exemplo
INSERT INTO users (username, password, full_name, permissions, active)
VALUES
    ('admin', 'admin123', 'Administrador',
     '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes","cobranca-semanal"]', 1),
    ('gerente', 'gerente123', 'Gerente Comercial',
     '["vendas-regiao","vendas-equipe","analise-produtos","performance-clientes"]', 1),
    ('vendedor', 'vendedor123', 'Vendedor',
     '["vendas-regiao","performance-clientes"]', 1),
    ('financeiro', 'financeiro123', 'Financeiro',
     '["cobranca-semanal","performance-clientes"]', 1);
```

### Passo 2: Verificar os Arquivos

Certifique-se de que os seguintes arquivos existem:

```
✅ /login.html                    → Tela de login
✅ /js/auth.js                    → Módulo de autenticação
✅ /sql/create_users_table.sql    → Script SQL
✅ /index.html (modificado)       → Home com autenticação
✅ /sw.js (atualizado)            → Service Worker v2
```

### Passo 3: Fazer Deploy

Após criar a tabela, faça o commit e push das alterações:

```bash
git add .
git commit -m "feat: Implementar sistema de autenticação e permissões"
git push origin claude/add-auth-permissions-01XMwwDF2QRr3fNrcCNuvs6R
```

---

## 👥 Usuários de Teste

| Usuário | Senha | Permissões | Descrição |
|---------|-------|------------|-----------|
| `admin` | `admin123` | Todos os dashboards | Acesso completo |
| `gerente` | `gerente123` | 4 dashboards | Sem acesso à Cobrança |
| `vendedor` | `vendedor123` | 2 dashboards | Vendas e Clientes apenas |
| `financeiro` | `financeiro123` | 2 dashboards | Cobrança e Clientes |

### Dashboards Disponíveis

- `vendas-regiao` → Vendas por Região 📍
- `vendas-equipe` → Vendas por Equipe Comercial 👥
- `analise-produtos` → Análise de Produtos 📈
- `performance-clientes` → Performance de Clientes 💰
- `cobranca-semanal` → Performance Semanal (Cobrança) 🎯

---

## 🔒 Como Funciona

### 1. Fluxo de Login

```
Usuário acessa a aplicação
    ↓
Redireciona para /login.html (se não autenticado)
    ↓
Usuário digita credenciais
    ↓
Sistema valida no banco Turso
    ↓
Se válido: salva sessão no localStorage
    ↓
Redireciona para /index.html (Home)
```

### 2. Controle de Acesso

```
Usuário acessa /index.html
    ↓
Sistema verifica autenticação (authManager.requireAuth())
    ↓
Se não autenticado: redireciona para login
    ↓
Se autenticado: carrega permissões do usuário
    ↓
Aplica controle de acesso nos cards
    ↓
Cards permitidos: clicáveis e coloridos
Cards bloqueados: esmaecidos + ícone 🔒
```

### 3. Armazenamento de Sessão

```javascript
// localStorage keys:
ger_comercial_auth     → Dados do usuário (id, username, fullName, permissions)
ger_comercial_session  → Status da sessão ("active")
```

---

## 🛠️ Gerenciamento de Usuários

### Adicionar Novo Usuário

```sql
INSERT INTO users (username, password, full_name, permissions, active)
VALUES (
    'novo_usuario',
    'senha123',
    'Nome Completo',
    '["vendas-regiao","analise-produtos"]',
    1
);
```

### Atualizar Permissões

```sql
UPDATE users
SET permissions = '["vendas-regiao","vendas-equipe","analise-produtos"]',
    updated_at = datetime('now')
WHERE username = 'vendedor';
```

### Desativar Usuário

```sql
UPDATE users
SET active = 0,
    updated_at = datetime('now')
WHERE username = 'vendedor';
```

### Alterar Senha

```sql
UPDATE users
SET password = 'nova_senha',
    updated_at = datetime('now')
WHERE username = 'vendedor';
```

### Listar Todos os Usuários

```sql
SELECT id, username, full_name, permissions, active, created_at
FROM users
ORDER BY id;
```

---

## 🎨 Personalização

### Adicionar Novo Dashboard

1. Adicionar o ID na lista de dashboards em `js/auth.js`:

```javascript
getAvailableDashboards() {
    return [
        // ... dashboards existentes
        {
            id: 'novo-dashboard',
            name: 'Novo Dashboard',
            icon: '🆕',
            url: 'dashboards/novo-dashboard.html'
        }
    ];
}
```

2. Adicionar o card no `index.html`

3. Atualizar permissões dos usuários no banco

---

## 🔐 Segurança

### ⚠️ IMPORTANTE - Melhorias Recomendadas para Produção

1. **Criptografia de Senhas**
   - Atualmente as senhas estão em texto puro
   - Recomenda-se usar bcrypt ou similar no backend

2. **Tokens JWT**
   - Implementar tokens JWT ao invés de localStorage simples
   - Adicionar expiração de sessão

3. **HTTPS Obrigatório**
   - Garantir que a aplicação rode apenas em HTTPS

4. **Remover Credenciais da Tela de Login**
   - Remover o bloco "Credenciais de Teste" do `login.html`

5. **Proteção CSRF**
   - Implementar tokens CSRF para maior segurança

6. **Rate Limiting**
   - Limitar tentativas de login

---

## 📱 Compatibilidade

- ✅ Desktop (Chrome, Firefox, Edge, Safari)
- ✅ Mobile (iOS Safari, Chrome Android)
- ✅ PWA (funciona offline após primeiro acesso)
- ✅ Tablets

---

## 🐛 Troubleshooting

### Problema: "Usuário ou senha inválidos" mesmo com credenciais corretas

**Solução:**
1. Verificar se a tabela foi criada no Turso
2. Verificar se os usuários foram inseridos
3. Abrir o Console do navegador (F12) e verificar erros

### Problema: Redirecionamento infinito entre login e home

**Solução:**
1. Limpar localStorage do navegador
2. Verificar se `js/auth.js` está sendo carregado corretamente

### Problema: Cards não aparecem esmaecidos

**Solução:**
1. Verificar se `authManager.applyAccessControl()` está sendo chamado
2. Verificar permissões do usuário no Console

### Verificar Sessão Atual

Abra o Console (F12) e execute:

```javascript
// Ver dados do usuário logado
console.log(authManager.getCurrentUser());

// Ver permissões
console.log(authManager.getPermissions());

// Verificar autenticação
console.log(authManager.isAuthenticated());
```

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Console do navegador (F12 → Console)
2. Network tab para erros de rede
3. Verificar se o Turso está acessível

---

**Desenvolvido para Germani Alimentos** 🏭
**Sistema:** Ger Comercial
**Versão:** 1.1.0
