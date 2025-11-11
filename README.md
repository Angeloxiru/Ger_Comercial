# 🗄️ Ger_Comercial

Sistema de Gerenciamento Comercial integrado com Turso Database (LibSQL)

## 📋 Sobre o Projeto

O **Ger_Comercial** é um sistema de gerenciamento comercial desenvolvido para funcionar 100% no navegador (GitHub Pages), integrado com o banco de dados Turso (LibSQL/SQLite). Este projeto foi criado para facilitar o gerenciamento de dados comerciais sem a necessidade de servidor backend.

### ✨ Características

- ✅ 100% Frontend (JavaScript ES Modules)
- ✅ Banco de dados na nuvem (Turso)
- ✅ Interface visual para testes
- ✅ Módulo completo de operações CRUD
- ✅ Testes automatizados
- ✅ Deploy via GitHub Pages
- ✅ Sem necessidade de terminal

---

## 🚀 Configuração Rápida

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

### 3️⃣ Testar a Conexão

Abra um dos arquivos HTML no navegador:

- **`index.html`** - Teste básico de conexão
- **`teste-completo.html`** - Suite completa de testes
- **`exemplo.html`** - Exemplo prático com CRUD

---

## 📁 Estrutura do Projeto

```
Ger_Comercial/
│
├── index.html              # Página de teste de conexão visual
├── teste-completo.html     # Suite completa de testes
├── exemplo.html            # Exemplo prático de CRUD
│
├── js/
│   ├── config.js           # Configurações do banco (TOKEN AQUI!)
│   ├── config.example.js   # Exemplo de configuração
│   ├── db.js               # Módulo de conexão e operações
│   └── test.js             # Scripts de teste automatizados
│
├── .gitignore              # Arquivos ignorados pelo Git
└── README.md               # Este arquivo
```

---

## 🔧 Módulos Disponíveis

### 📦 `db.js` - Gerenciador de Banco de Dados

Módulo principal para operações com o banco de dados.

#### Métodos Disponíveis:

```javascript
import { db } from './js/db.js';

// Conectar ao banco
await db.connect();

// Executar query SQL
const result = await db.execute('SELECT * FROM produtos');

// Criar tabela
await db.createTable('produtos', {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    nome: 'TEXT NOT NULL',
    preco: 'REAL NOT NULL'
});

// Inserir dados
await db.insert('produtos', {
    nome: 'Notebook',
    preco: 2500.00
});

// Selecionar dados
const produtos = await db.select('produtos', {
    where: { preco: 2500 },
    orderBy: 'nome ASC',
    limit: 10
});

// Atualizar dados
await db.update('produtos',
    { preco: 2300.00 },  // novos valores
    { nome: 'Notebook' }  // condição
);

// Deletar dados
await db.delete('produtos', { id: 1 });

// Listar todas as tabelas
const tables = await db.listTables();

// Obter estrutura de uma tabela
const structure = await db.getTableStructure('produtos');

// Executar múltiplas queries (batch)
const results = await db.batch([
    { sql: 'SELECT COUNT(*) FROM produtos' },
    { sql: 'SELECT SUM(preco) FROM produtos' }
]);
```

### 🧪 `test.js` - Suite de Testes

Módulo para executar testes automatizados.

```javascript
import { TestSuite, runQuickTest } from './js/test.js';

// Executar todos os testes
const summary = await runQuickTest();

// Ou usar a classe TestSuite diretamente
const suite = new TestSuite();
await suite.runAll();
```

---

## 🎯 Páginas de Teste

### 1. `index.html` - Teste Visual Simples

Interface visual para testar rapidamente a conexão com o banco.

**Recursos:**
- ✅ Teste de conexão
- ✅ Query de exemplo
- ✅ Listagem de tabelas
- ✅ Verificação de versão SQLite

**Como usar:**
1. Abra `index.html` no navegador
2. Clique em "🚀 Testar Conexão com Turso"
3. Veja os resultados visuais

---

### 2. `teste-completo.html` - Suite Completa

Executa todos os testes automatizados com feedback visual.

**Testes executados:**
1. ✅ Conexão ao banco
2. ✅ Query simples
3. ✅ Listar tabelas
4. ✅ Criar tabela de teste
5. ✅ Inserir dados
6. ✅ Selecionar dados
7. ✅ Atualizar dados
8. ✅ Batch queries
9. ✅ Estrutura da tabela
10. ✅ Limpeza (remove tabela de teste)

**Como usar:**
1. Abra `teste-completo.html` no navegador
2. Clique em "🚀 Executar Todos os Testes"
3. Acompanhe o progresso em tempo real
4. Veja estatísticas e resultados

---

### 3. `exemplo.html` - CRUD Prático

Exemplo completo de gerenciamento de produtos.

**Funcionalidades:**
- 🔌 Conectar ao banco
- 🏗️ Criar tabela de produtos
- ➕ Inserir novos produtos
- 📋 Listar todos os produtos
- 📈 Ver estatísticas do estoque

**Como usar:**
1. Abra `exemplo.html` no navegador
2. Clique em "🔌 Conectar ao Banco"
3. Crie a tabela clicando em "🏗️ Criar Tabela"
4. Adicione produtos preenchendo o formulário
5. Veja a lista e estatísticas

---

## 🌐 Deploy no GitHub Pages

### Configurar GitHub Pages:

1. Vá em **Settings** do repositório
2. Clique em **Pages** no menu lateral
3. Em **Source**, selecione a branch `main` (ou `master`)
4. Clique em **Save**
5. Aguarde alguns minutos

Seu site estará disponível em:
```
https://angeloxiru.github.io/Ger_Comercial/
```

### ⚠️ Importante sobre Segurança:

**NÃO faça commit do arquivo `js/config.js` com o token!**

Opções de segurança:

1. **Para desenvolvimento:** Use o token no `config.js` localmente
2. **Para produção:** Implemente autenticação via backend
3. **Alternativa:** Use GitHub Actions para injetar variáveis de ambiente

---

## 🔒 Segurança

### ⚠️ Avisos Importantes:

1. **Nunca** compartilhe seu token de autenticação
2. **Não** faça commit do `config.js` com token preenchido
3. Para produção, considere usar um backend proxy
4. O token tem acesso total ao seu banco de dados

### Protegendo o Token:

Se você já fez commit do token por engano:

1. **Regenere o token** no Turso Dashboard
2. Remova o arquivo do histórico:
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch js/config.js" \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. Adicione `js/config.js` ao `.gitignore`

---

## 📚 Exemplos de Código

### Exemplo 1: Criar Sistema de Produtos

```javascript
import { db } from './js/db.js';

// Conectar
await db.connect();

// Criar tabela
await db.createTable('produtos', {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    nome: 'TEXT NOT NULL',
    descricao: 'TEXT',
    preco: 'REAL NOT NULL',
    estoque: 'INTEGER DEFAULT 0',
    criado_em: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
});

// Inserir produtos
await db.insert('produtos', {
    nome: 'Mouse Gamer',
    descricao: 'RGB, 16000 DPI',
    preco: 199.90,
    estoque: 50
});

// Buscar produtos em estoque
const produtosEmEstoque = await db.select('produtos', {
    where: { estoque: 0 },
    orderBy: 'nome ASC'
});

console.log('Produtos:', produtosEmEstoque);
```

### Exemplo 2: Sistema de Vendas

```javascript
// Criar tabela de vendas
await db.createTable('vendas', {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    produto_id: 'INTEGER NOT NULL',
    quantidade: 'INTEGER NOT NULL',
    valor_total: 'REAL NOT NULL',
    data_venda: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
});

// Registrar venda (com atualização de estoque)
await db.batch([
    {
        sql: 'INSERT INTO vendas (produto_id, quantidade, valor_total) VALUES (?, ?, ?)',
        args: [1, 2, 399.80]
    },
    {
        sql: 'UPDATE produtos SET estoque = estoque - ? WHERE id = ?',
        args: [2, 1]
    }
]);
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

### Erro: "CORS policy"

**Solução:** Abra os arquivos através de um servidor web local ou GitHub Pages, não diretamente pelo sistema de arquivos.

---

### Tabela não encontrada

**Solução:** Execute a criação da tabela primeiro usando `db.createTable()` ou a página de exemplo.

---

## 📖 Recursos Adicionais

### Documentação Turso:
- [Turso Docs](https://docs.turso.tech/)
- [LibSQL Client](https://github.com/libsql/libsql-client-ts)

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

---

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

---

## 👨‍💻 Autor

**Angeloxiru**
- GitHub: [@Angeloxiru](https://github.com/Angeloxiru)

---

## 🎉 Próximos Passos

Agora que você configurou o projeto:

1. ✅ Configure seu token no `js/config.js`
2. ✅ Teste a conexão em `index.html`
3. ✅ Execute os testes em `teste-completo.html`
4. ✅ Experimente o CRUD em `exemplo.html`
5. ✅ Crie suas próprias tabelas e funcionalidades!

**Dúvidas?** Abra uma issue no GitHub!

---

<p align="center">
  Feito com ❤️ e ☕
</p>