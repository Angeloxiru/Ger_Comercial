# 📁 Guia de Arquivos SQL - Produtos Parados

## ✅ ARQUIVO A USAR NO TURSO:

### **`sql/views/create_view_produtos_parados.sql`**

Este é o **único arquivo** que você precisa executar no Turso para criar/atualizar a view de produtos parados.

**Como usar:**
1. Abra: https://turso.tech/
2. Selecione seu banco → SQL Editor
3. Abra o arquivo: `sql/views/create_view_produtos_parados.sql`
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Execute

**O que ele faz:**
- Cria a view `vw_produtos_parados` (versão 2.0 - corrigida)
- Detecta produtos vendidos 2-4 semanas atrás que pararam nas últimas 2 semanas
- Usa `date(emissao)` em todas as comparações (correção do bug TEXT vs DATE)
- 6 níveis de risco: MÍNIMO, BAIXO, MODERADO, ALTO, MUITO ALTO, EXTREMO

---

## 📂 ESTRUTURA SQL COMPLETA:

```
sql/
├── auth/                           # Autenticação
│   ├── 01_create_users_table.sql  # Criar tabela users
│   ├── 02_verificar_usuarios.sql  # Verificar usuários
│   └── 03_manage_users.sql        # Gerenciar usuários
│
├── maintenance/                    # Manutenção
│   ├── 01-create-indexes.sql      # Índices (CLI)
│   ├── 01-create-indexes-web.sql  # Índices (Web)
│   ├── 02-maintenance.sql         # Manutenção
│   └── 03-test-performance.sql    # Testes
│
└── views/                          # Views
    └── create_view_produtos_parados.sql  ✅ USE ESTE!
```

---

## 🧹 LIMPEZA REALIZADA

**Removidos (5 arquivos temporários de diagnóstico):**
- ❌ `diagnostico_periodos.sql`
- ❌ `diagnostico_produtos_parados.sql`
- ❌ `views/FINAL_view_produtos_parados.sql`
- ❌ `views/RECREATE_view_produtos_parados.sql`
- ❌ `views/RECREATE_view_produtos_parados_v2.1.sql`

**Por que foram removidos:**
- Eram arquivos de troubleshooting temporários
- Redundantes com a versão final
- Causavam confusão sobre qual usar

---

## ❓ SE A VIEW RETORNAR 0 PRODUTOS:

Execute as queries de diagnóstico abaixo **diretamente no Turso SQL Editor:**

### **Query 1: Vendas nas últimas 4 semanas**
```sql
SELECT
    COUNT(*) as total_vendas,
    MIN(date(emissao)) as primeira_venda,
    MAX(date(emissao)) as ultima_venda
FROM vendas
WHERE date(emissao) >= date('now', '-4 weeks')
    AND emissao != ''
    AND representante != '';
```

### **Query 2: Produtos com 2+ vendas entre 2-4 semanas atrás**
```sql
SELECT COUNT(DISTINCT representante, produto) as qtd_produtos
FROM (
    SELECT representante, produto, COUNT(*) as vendas
    FROM vendas
    WHERE date(emissao) BETWEEN date('now', '-4 weeks') AND date('now', '-2 weeks')
        AND emissao != '' AND representante != ''
    GROUP BY representante, produto
    HAVING COUNT(*) >= 2
);
```

**Se retornar 0:** O período 2-4 semanas é muito curto para seus dados.

**Solução:** Na view, ajuste para período maior (ex: 4-8 semanas):
```sql
-- Linha 33: Mudar de
WHERE date(v.emissao) BETWEEN date('now', '-4 weeks') AND date('now', '-2 weeks')
-- Para:
WHERE date(v.emissao) BETWEEN date('now', '-8 weeks') AND date('now', '-4 weeks')

-- Linha 46: Mudar de
WHERE date(emissao) >= date('now', '-2 weeks')
-- Para:
WHERE date(emissao) >= date('now', '-4 weeks')
```

---

## 🔗 DOCUMENTAÇÃO

- **Documentação completa:** `docs/PRODUTOS_PARADOS.md`
- **Limpar cache:** `tools/limpar-cache-produtos-parados.html`
- **Dashboard:** `dashboards/dashboard-produtos-parados.html`

---

**Última atualização:** Dezembro 2024
**Versão da View:** 2.0 (com correção date())
