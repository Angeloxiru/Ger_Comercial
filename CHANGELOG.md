# Changelog — Ger Comercial

Versionamento: [Semver](https://semver.org/lang/pt-BR/)
- **MAJOR** (1.x.x) — redesign grande ou mudança que quebra compatibilidade
- **MINOR** (x.Y.x) — funcionalidade nova
- **PATCH** (x.x.Z) — correção de bug ou ajuste pequeno

---

## [1.16.2] — 2026-09-02

### Corrigido
- **Login não funcionava no Firefox (e vazava a senha na URL)**
  - O handler de `keypress` do `login.html` disparava
    `loginForm.dispatchEvent(new Event('submit'))`. Esse evento não é
    cancelável (`cancelable` é `false` por padrão), então o `preventDefault()`
    do handler virava no-op e o Firefox executava o **envio nativo** do
    formulário. O `<form>` não tinha `method`, ou seja, GET para a própria URL:
    a página navegava para `login.html?username=...&password=...`, a consulta
    em andamento ao Turso era abortada pelo unload e o erro aparecia como
    `NetworkError when attempting to fetch resource`.
  - O Chrome não reproduzia porque já removeu o envio nativo disparado por
    evento não confiável: lá só o handler JavaScript rodava.
  - Removido o dispatch manual. O Enter continua funcionando pelo
    `<button type="submit">`, que dispara um evento confiável e cancelável.
  - `<form>` recebeu `method="post"`, `action="#"` e `onsubmit="return false;"`
    como barreira extra contra envio nativo.
  - Credenciais que já estejam na query string são removidas do histórico no
    carregamento da página, via `history.replaceState`.
- `login.html` apontava para `logo-germani.png`, arquivo inexistente no
  repositório (404). Passa a usar o mesmo logo hospedado dos dashboards.

### Segurança
- Usuários que logaram pelo Firefox tiveram a senha gravada em texto puro no
  histórico do navegador. Recomenda-se trocar essas senhas e limpar o
  histórico das máquinas afetadas.

## [1.16.1] — 2026-09-02

### Alterado
- **Manual de utilização (`manual.html`) revisado e alinhado ao sistema atual**
  - Novo capítulo "Categorias de Produtos" (dashboard existia desde a v4.1 do
    esquema antigo e nunca havia sido documentado).
  - "Cobrança Semanal" renomeado para "Performance Mensal", com filtros, KPIs
    (Faturamento, Peso, Positivados, % Média Meta) e colunas de meta / ano
    anterior corrigidos.
  - Novo capítulo de recursos compartilhados: Period Picker com presets,
    comparativo "vs Anterior" / "vs Ano", Visões Salvas, filtros na URL,
    drill-down entre dashboards, indicador "🕒 atualizado há…" e TTL de cache
    inteligente (24h fechado / 10min em curso).
  - Configurações: importação de `vendas` (Excel, série EP) e `metas_mensais`,
    template Excel com macro para `tab_cliente`, flag de período estendido e a
    seção de Agendamentos de Relatórios por e-mail.
  - Login: tabela de permissões com os 10 ids reais, limite de período
    (100 dias / 366 dias) e passo a passo de "Alterar Senha".
  - Navegação: cards atuais da home, Último Faturamento, etiqueta de versão e
    limpeza de cache no logout.
  - Correções de conteúdo em Vendas por Região (modo Roteiros), Vendas por
    Equipe (bonificação), Análise de Produtos (saída por cliente), Performance
    de Clientes, Ranking de Clientes (Curva ABC) e Clientes Sem Compras
    (não usa filtro de período).
  - Rodapé passa a exibir a versão semver do sistema.
- Service Worker v11 → v12 para renovar a cópia offline do manual.

## [1.16.0] — 2026-05-26

### Adicionado
- **FASE 3 — Modelo temporal (passo 3): Cache TTL inteligente**
  - `getSmartTTL(dataFim)` em `cache.js`: período fechado (passado) → 24h;
    período em curso (hoje/futuro) → 10 min.
  - `CACHE_TTL.DASHBOARDS_CLOSED` (24h) e `CACHE_TTL.DASHBOARDS_CURRENT` (10min).
  - Aplicado nos 7 dashboards com período. Clientes Sem Compras e Produtos
    Parados mantêm TTL fixo (sem período).

## [1.15.0] — 2026-05-25

### Adicionado
- **FASE 3 — Modelo temporal (passo 2): Toggle comparativo (piloto)**
  - `mountComparison()` em `period-picker.js` — toggle universal "📊 vs Anterior" /
    "📊 vs Ano" que compara KPIs com período anterior ou mesmo período do ano passado.
  - Piloto implementado em Vendas/Equipe: busca totais do período comparativo e
    mostra deltas (▲ +15.2% vs anterior / ▼ -3.1% vs ano ant.) abaixo de cada KPI.
  - CSS `.gc-comparison` + `.gc-comparison__btn.active` no shell.

## [1.14.0] — 2026-05-25

### Adicionado
- **FASE 3 — Modelo temporal canônico (passo 1): Period Picker**
  - `js/period-picker.js` — componente compartilhado com presets canônicos
    (Hoje, 7d, 30d, Semana, Mês, Mês anterior, Trimestre, Ano).
  - Funções `periodoAnterior()` e `periodoAnoAnterior()` exportadas (base
    para o toggle comparativo do passo 2).
  - Substituídas as funções `setQuickDate()` inline de 7 dashboards pelo
    componente padronizado. Ranking de Clientes ganhou presets (não tinha).

## [1.13.0] — 2026-05-25

### Adicionado
- **FASE 2 — Investigação cruzada (passo 4): Saved Views**
  - `js/saved-views.js` — módulo com CRUD na tabela `user_views` (Turso, auto-criada) + componente UI montável.
  - Barra "⭐ Visões salvas" em todos os 9 dashboards de dados: salvar combinação de filtros com nome, carregar com 1 clique, excluir.
  - CSS `.gc-saved-views` no shell compartilhado.
  - SW v10 cacheando o novo módulo.

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
