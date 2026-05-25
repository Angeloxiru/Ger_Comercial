# Changelog — Ger Comercial

Versionamento: [Semver](https://semver.org/lang/pt-BR/)
- **MAJOR** (1.x.x) — redesign grande ou mudança que quebra compatibilidade
- **MINOR** (x.Y.x) — funcionalidade nova
- **PATCH** (x.x.Z) — correção de bug ou ajuste pequeno

---

## [1.12.1] — 2026-05-25

### Adicionado
- **FASE 2 — Investigação cruzada (passos 1-3)**
  - Filtros na URL em todos os 9 dashboards de dados (`?inicio=...&supervisor=...&modo=...`). Link compartilhável, botão Voltar preserva contexto, abrir em nova aba funciona.
  - Links contextuais de drill-down: Ranking→Performance de Clientes, Vendas/Equipe→Produtos Parados, Produtos Parados→Análise de Produtos.
  - "Voltar com contexto" automático via URL state.
- Sistema de versionamento semver com indicador visual na tela.

### Corrigido
- Tags Chart.js restauradas em Vendas por Região (removidas acidentalmente na migração).
- Redeploy forçado dos 4 dashboards que retornavam 5xx no CF Pages.

## [1.12.0] — 2026-05-22

### Adicionado
- **FASE 1 — Shell compartilhado**
  - `css/dashboard-shell.css` — design tokens + componentes `gc-*` (header, filtros, KPI, tabela, loading, botões).
  - `js/dashboard-shell.js` — `setFreshness()`, `urlFilters`, `mountHeader()`, helpers de export.
  - Migração dos 10 dashboards para o shell compartilhado (redução média de ~20% por arquivo).
  - Service Worker v9 com cache dos novos assets do shell.
- Ambiente de homologação via Cloudflare Pages (`ger-comercial.pages.dev`).
