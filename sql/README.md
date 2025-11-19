# 🗄️ Scripts SQL - Ger Comercial

Todos os scripts SQL organizados por categoria.

---

## 📁 Estrutura de Pastas

```
sql/
├── README.md                          # Este arquivo
├── auth/                              # Scripts de autenticação
│   ├── 01_create_users_table.sql      # Criar tabela de usuários
│   └── 02_verificar_usuarios.sql      # Verificar/gerenciar usuários
├── views/                             # Views SQL
│   └── create_view_produtos_parados.sql
└── maintenance/                       # Scripts de manutenção
    ├── 01-create-indexes.sql          # Criar índices (CLI)
    ├── 01-create-indexes-web.sql      # Criar índices (Web)
    ├── 02-maintenance.sql             # Manutenção mensal
    └── 03-test-performance.sql        # Testes de performance
```

---

## 🔐 Scripts de Autenticação (`auth/`)

### 01_create_users_table.sql
Cria a tabela de usuários e insere usuários de teste.

**Como executar:**
```bash
turso db shell comercial
# Cole o conteúdo do arquivo
```

**O que faz:**
- Cria tabela `users` com campos: id, username, password, full_name, permissions, active
- Cria índices de performance
- Insere 4 usuários de exemplo (admin, gerente, vendedor, financeiro)

### 02_verificar_usuarios.sql
Scripts de verificação e gerenciamento de usuários.

**Como usar:**
```bash
turso db shell comercial
# Execute queries específicas deste arquivo
```

**Inclui:**
- Verificar se tabela existe
- Listar todos os usuários
- Testar login
- Exemplos de INSERT/UPDATE

---

## 📊 Views SQL (`views/`)

### create_view_produtos_parados.sql
View que identifica produtos que representantes pararam de vender.

**Como executar:**
```bash
turso db shell comercial
# Cole o conteúdo do arquivo
```

**O que faz:**
- Analisa produtos vendidos há 4-6 semanas
- Identifica produtos NÃO vendidos nas últimas 4 semanas
- Calcula nível de risco (CRÍTICO, ALTO, MÉDIO, BAIXO)
- Retorna valor médio perdido

**Documentação completa:**
- Ver: [../docs/PRODUTOS_PARADOS.md](../docs/PRODUTOS_PARADOS.md)

---

## ⚙️ Scripts de Manutenção (`maintenance/`)

### 01-create-indexes.sql (Turso CLI)
Cria 26 índices otimizados para o banco de dados.

**Como executar:**
```bash
turso db shell comercial
.read sql/maintenance/01-create-indexes.sql
```

**Benefícios:**
- Queries 50-90% mais rápidas
- Redução de 95-99% no consumo de reads
- Dashboards instantâneos

### 01-create-indexes-web.sql (Turso Web Dashboard)
Mesmo conteúdo que acima, mas formatado para o Web Dashboard.

**Como executar:**
1. Acesse https://turso.tech/
2. Selecione o banco
3. Vá em "SQL Editor"
4. Cole o conteúdo completo
5. Clique em "Run"

### 02-maintenance.sql
Scripts de manutenção mensal.

**Quando executar:**
- Uma vez por mês
- Após importação de dados grande
- Quando dashboards ficarem lentos

**O que faz:**
- Análise de índices
- Reindex de tabelas
- Vacuum do banco
- Análise de estatísticas

### 03-test-performance.sql
Testes de performance das queries.

**Como usar:**
```bash
turso db shell comercial
.read sql/maintenance/03-test-performance.sql
```

**O que testa:**
- Performance de queries com/sem índices
- Tempo de resposta de filtros
- Eficiência de JOINs

---

## 🚀 Ordem Recomendada de Execução

### Primeira Configuração

1. **Autenticação** (se usar login)
   ```bash
   # Execute sql/auth/01_create_users_table.sql
   ```

2. **Índices de Performance** (OBRIGATÓRIO!)
   ```bash
   # Execute sql/maintenance/01-create-indexes.sql
   # OU sql/maintenance/01-create-indexes-web.sql
   ```

3. **Views** (opcional, conforme dashboards)
   ```bash
   # Execute sql/views/create_view_produtos_parados.sql
   ```

### Manutenção Mensal

```bash
# Execute sql/maintenance/02-maintenance.sql
```

### Troubleshooting

```bash
# Execute sql/auth/02_verificar_usuarios.sql (se problema de login)
# Execute sql/maintenance/03-test-performance.sql (se lento)
```

---

## 📝 Notas Importantes

1. **Backup antes de executar**
   - Sempre faça backup do banco antes de executar scripts de manutenção
   - Turso: `turso db shell comercial .dump > backup.sql`

2. **Testar em ambiente de desenvolvimento**
   - Se possível, teste os scripts primeiro em um banco de desenvolvimento

3. **Scripts são idempotentes**
   - Todos usam `IF NOT EXISTS` ou `IF EXISTS`
   - Podem ser executados múltiplas vezes com segurança

4. **Ordem importa**
   - Siga a ordem recomendada para evitar erros de dependência

---

## 🆘 Suporte

**Problemas com autenticação?**
- Ver: [../docs/AUTENTICACAO.md](../docs/AUTENTICACAO.md)

**Problemas de performance?**
- Executar: `sql/maintenance/02-maintenance.sql`
- Ver: [../docs/INDICES-EXPLICACAO.md](../docs/INDICES-EXPLICACAO.md)

**Problemas gerais?**
- Ver: [../docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)

---

**Ger Comercial** | Germani Alimentos 🏭
