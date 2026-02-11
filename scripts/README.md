# Scripts - Ger Comercial

Esta pasta contém scripts Node.js para automacao e importacao de dados.

## Scripts Disponiveis

| Script | Descricao |
|--------|-----------|
| `processar-agendamentos.js` | Processa agendamentos de relatorios por email (executado via GitHub Actions) |
| `atualizar-filtros-lookup.js` | Atualiza tabelas de lookup dos filtros dos dashboards |
| `gerar-template-vendas.js` | Gera template Excel para importacao de vendas |
| `importar-vendas-excel.js` | Importa vendas a partir de arquivo Excel |

## Como Executar

```bash
# Instalar dependencias
cd scripts && npm install

# Processar agendamentos de email
npm run processar

# Atualizar tabelas de lookup
npm run atualizar-lookup

# Gerar template de vendas
node gerar-template-vendas.js

# Importar vendas de Excel
node importar-vendas-excel.js caminho/do/arquivo.xlsx
```

## Scripts SQL

Os scripts SQL de manutencao e otimizacao do banco estao em `sql/maintenance/`:

| Script | Descricao | Frequencia |
|--------|-----------|------------|
| `sql/maintenance/01-create-indexes.sql` | Cria indices para otimizacao de queries | Setup inicial |
| `sql/maintenance/01-create-indexes-web.sql` | Indices para execucao via web | Setup inicial |
| `sql/maintenance/02-maintenance.sql` | Manutencao mensal (ANALYZE, integridade) | Mensal |
| `sql/maintenance/03-test-performance.sql` | Testes de performance antes/depois de indices | Quando necessario |
| `sql/maintenance/04-create-lookup-tables.sql` | Cria tabelas de lookup para filtros | Setup inicial |

## Automacao (GitHub Actions)

- **`alertas-emails.yml`**: Executa `processar-agendamentos.js` de hora em hora
- **`atualizar-lookup-filtros.yml`**: Executa `atualizar-filtros-lookup.js` toda segunda-feira as 12h BRT
