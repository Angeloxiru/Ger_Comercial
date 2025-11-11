# ⚡ Guia Rápido - Ger_Comercial

## 🎯 Configuração em 3 Passos

### 1️⃣ Obter Token do Turso

```
1. Acesse: https://turso.tech/app
2. Login com GitHub
3. Selecione database "comercial"
4. Clique em "Generate Token"
5. Copie o token
```

### 2️⃣ Configurar

Abra `js/config.js` e cole seu token:

```javascript
authToken: 'SEU_TOKEN_AQUI', // ← Cole aqui
```

### 3️⃣ Testar

Abra no navegador:
- `index.html` - Teste básico
- `teste-completo.html` - Todos os testes
- `exemplo.html` - CRUD completo

---

## 🚀 Uso Básico

```javascript
import { db } from './js/db.js';

// Conectar
await db.connect();

// Criar tabela
await db.createTable('produtos', {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    nome: 'TEXT NOT NULL',
    preco: 'REAL NOT NULL'
});

// Inserir
await db.insert('produtos', {
    nome: 'Mouse',
    preco: 99.90
});

// Consultar
const produtos = await db.select('produtos');
console.log(produtos);
```

---

## 📋 Checklist

- [ ] Obtive meu token do Turso
- [ ] Configurei o `js/config.js`
- [ ] Testei a conexão em `index.html`
- [ ] Executei os testes em `teste-completo.html`
- [ ] Explorei o exemplo em `exemplo.html`
- [ ] Li o README completo

---

## ⚠️ IMPORTANTE

**NÃO faça commit do `js/config.js` com seu token!**

O token dá acesso total ao seu banco de dados.

---

## 🆘 Problemas?

### Erro: "Token não configurado"
→ Edite `js/config.js` e adicione seu token

### Erro: "Failed to fetch"
→ Verifique internet e se o token é válido

### Erro: "CORS policy"
→ Use um servidor web (GitHub Pages ou local)

---

## 📚 Documentação Completa

Leia o `README.md` para documentação detalhada.

---

**Pronto para começar? Abra `index.html` e teste!** 🚀
