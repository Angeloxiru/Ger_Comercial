# 🗄️ Ger_Comercial

Sistema de Gerenciamento Comercial integrado com Turso Database (LibSQL)

## 📋 Sobre o Projeto

O **Ger_Comercial** é um sistema de gerenciamento comercial desenvolvido para funcionar 100% no navegador (GitHub Pages), integrado com o banco de dados Turso (LibSQL/SQLite). Este projeto oferece dashboards visuais, relatórios detalhados e exportação de dados sem necessidade de servidor backend.

### ✨ Características

- ✅ 100% Frontend (JavaScript ES Modules)
- ✅ Banco de dados na nuvem (Turso/LibSQL)
- ✅ Dashboard gerencial com múltiplos relatórios
- ✅ Filtros avançados com seleção múltipla
- ✅ Exportação para Excel e PDF
- ✅ Deploy via GitHub Pages
- ✅ Interface moderna e responsiva
- ✅ Sem necessidade de terminal ou backend

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
├── index.html                    # Dashboard principal
├── dashboard-vendas-regiao.html  # Relatório de vendas por região
├── teste-conexao.html            # Teste de conexão (utilitário)
├── exemplo.html                  # Exemplo de CRUD
│
├── js/
│   ├── config.js                 # Configurações do banco (TOKEN AQUI!)
│   ├── config.example.js         # Exemplo de configuração
│   ├── db.js                     # Módulo de conexão e operações
│   └── test.js                   # Scripts auxiliares
│
├── .gitignore                    # Arquivos ignorados pelo Git
└── README.md                     # Este arquivo
```

---

## 📊 Dashboards Disponíveis

### 🎯 Dashboard Principal
**Arquivo:** `index.html`

Página inicial com cards de acesso aos relatórios:
- ✅ **Vendas por Região** - Disponível
- 📈 Análise de Produtos - Em breve
- 👥 Performance de Clientes - Em breve
- 💰 Análise Financeira - Em breve
- 📦 Gestão de Estoque - Em breve
- 🎯 Metas e KPIs - Em breve

---

### 📍 Vendas por Região
**Arquivo:** `dashboard-vendas-regiao.html`

Dashboard completo com filtros avançados e exportação de dados.

#### 🔍 Filtros Disponíveis:

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

#### 📤 Exportações:

- **Excel (.xlsx)** - Planilha formatada pronta para análise
- **PDF** - Relatório visual com tabela formatada

#### 🔗 Tabelas Relacionadas:

O sistema faz consultas em múltiplas tabelas:
- `vendas` - Dados das vendas
- `tab_cliente` - Informações de clientes (rotas)
- `tab_representante` - Informações de representantes e supervisores

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

## 🎨 Design e Cores

O sistema utiliza um esquema de cores moderno e profissional:

- **Vermelho Vivo:** `#DC143C` (cor principal)
- **Vermelho Escuro:** `#8B0000` (secundária)
- **Dourado:** `#FFD700` (destaques)
- **Dourado Escuro:** `#FFA500` (acentos)
- **Fundo:** Branco `#FFFFFF`

### Características Visuais:
- Gradientes suaves
- Sombras elegantes
- Animações de hover
- Cards com efeito de elevação
- Layout responsivo (desktop, tablet, mobile)

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
- Dashboard principal
- Vendas por Região
- Filtros múltiplos
- Exportação Excel/PDF
- GitHub Pages

### 🚧 Em Desenvolvimento:
- Análise de Produtos
- Performance de Clientes
- Análise Financeira
- Gestão de Estoque
- Metas e KPIs

### 💡 Futuras Melhorias:
- Gráficos interativos (Chart.js)
- Comparativo de períodos
- Drill-down detalhado
- Filtros salvos
- Dashboard personalizável
- Modo escuro
- Relatórios agendados

---

<p align="center">
  <strong>🚀 Sistema 100% Web | 📊 Dashboards Inteligentes | 🔒 Seguro e Rápido</strong>
</p>

<p align="center">
  Feito com ❤️ e ☕
</p>
