# Arquitetura — Ger Comercial

> Esta é a **carta de princípios técnicos** do projeto. Toda decisão de
> implementação deve passar pelo filtro descrito aqui antes de virar código.

---

## 1. O que o produto é (e o que não é)

**O Ger Comercial é um cockpit investigativo sobre dados ERP/SAP.**
A função do sistema é responder rápido à pergunta operacional do dia:

> "Onde a equipe está agora e o que precisa de atenção para vender mais?"

| O produto **é** | O produto **não é** |
|---|---|
| Camada analítica sobre dados de vendas | ERP genérico |
| Ferramenta operacional do supervisor / gerente | CRUD administrativo |
| Investigação rápida com contexto temporal | Power BI / dashboard decorativo |
| Motor de potencialização da área comercial | Plataforma de gráficos bonitos |

**Filtro absoluto para qualquer decisão:**

> *"Isso ajuda a descobrir problemas da equipe e aumentar vendas mais rápido?"*
> Se a resposta for **não**, a feature não entra. Se for **talvez**,
> simplifique até virar **sim** ou descarte.

---

## 2. Stack — escolhas deliberadas

| Camada | Escolha | Por quê |
|---|---|---|
| Front-end | Vanilla JS (ES modules) + HTML + CSS | Zero build, zero fricção. Investigador abre o navegador e usa. |
| Distribuição | PWA via GitHub Pages | Custo zero, instalável no celular do supervisor em rota. |
| Banco | Turso (libSQL / SQLite na nuvem) | SQL puro, low-latency, sem servidor próprio para manter. |
| Automação | GitHub Actions | Agendamentos de e-mail e atualização de lookups sem worker dedicado. |
| Gráficos / mapas / PDF | Chart.js / Leaflet / jsPDF via CDN | Suficientes, sem build. |

### O que **NÃO** entra na stack

- **Frameworks SPA** (React, Vue, Svelte, Angular).
  Não há complexidade de estado que justifique. Toda página é
  carregamento direto + filtros + tabela. Build pipeline custaria mais
  fricção do que entrega valor investigativo.
- **Microserviços / containers / Kubernetes.**
  Não há serviço próprio rodando — não há o que orquestrar.
- **ORM ou camada de abstração de SQL.**
  As queries são o coração analítico. Esconder atrás de ORM ofusca
  exatamente o que precisa estar visível.
- **GraphQL / BFF complexo.**
  Quando precisarmos de um servidor (ver §4), será um proxy fino — não
  uma camada de domínio.

---

## 3. Camadas do sistema

```
┌─────────────────────────────────────────────────────────────┐
│  SHELL (1)   header / filtros / loading / "última atualização"
├─────────────────────────────────────────────────────────────┤
│  DASHBOARDS (10)   cada um com sua lógica investigativa
├─────────────────────────────────────────────────────────────┤
│  DADOS (2)
│   ├── Lookups materializadas (lkp_*) — filtros pré-computados
│   └── Vendas / metas / clientes — base operacional
├─────────────────────────────────────────────────────────────┤
│  AUTOMAÇÃO (3)   GitHub Actions — emails + refresh de lookups
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Shell

`css/dashboard-shell.css` + `js/dashboard-shell.js` definem o
**chrome compartilhado** dos 10 dashboards: header, painel de filtros,
loading, badge "última atualização HH:MM", layout de KPIs e tabela.

> Regra: estilo do shell **nunca** mora dentro de um `<style>` de
> dashboard. Se um dashboard precisa de algo que o shell não tem,
> a primeira pergunta é "isso vale virar shell?".

### 3.2 Dashboards

Cada dashboard é uma página HTML auto-contida, focada em **um eixo de
investigação**:

| Dashboard | Pergunta operacional que responde |
|---|---|
| Vendas por Região | Como está a venda por rota / cidade? |
| Vendas por Equipe | Que supervisor / representante está performando como? |
| Ranking de Clientes | Quem são meus melhores e meus piores este mês? |
| Performance de Clientes | Por que este grupo de cliente caiu? |
| Performance Mensal | Estou cumprindo a meta da rota? |
| Produtos Parados | Que produto saiu da carteira do representante? |
| Análise de Produtos | Por origem / família / SKU, o que mudou? |
| Clientes sem Compras | Quem deixou de comprar e onde estão? |
| Categorias de Produtos | Como está o mix por categoria? |
| Configurações | Quem acessa o quê / metas / importações |

### 3.3 Dados

- Tabela transacional principal: `vendas` (eventos).
- Lookups materializadas (`lkp_localidades`, `lkp_representantes`,
  `lkp_cidades_regiao`, `lkp_cidades_equipe`, `lkp_clientes`,
  `lkp_produtos`, `lkp_produtos_parados`). Atualizadas
  semanalmente pelo GitHub Action.
- Estados derivados (produto parado, cliente inativo) são **snapshots**
  computados sobre eventos. Ver `docs/MODELO_TEMPORAL.md`.

### 3.4 Automação

`.github/workflows/`:
- `alertas-emails.yml` — processa agendamentos a cada hora.
- `atualizar-lookup-filtros.yml` — recomputa `lkp_*` semanalmente.
- `manutencao-banco.yml` — manutenção pontual.

---

## 4. Decisões arquiteturais (ADRs vivos)

### ADR-001 — Manter vanilla JS (sem framework SPA)
**Contexto:** o custo de adicionar React/Vue é build pipeline + dependências
+ aprendizagem. **Decisão:** manter vanilla. **Consequência:** duplicação de
chrome entre páginas — mitigada pelo shell compartilhado (§3.1).

### ADR-002 — Lookups materializadas em vez de queries on-the-fly
**Contexto:** Turso cobra por leituras. Filtros em cascata acionavam
queries pesadas em cada navegação. **Decisão:** materializar valores
distintos de filtros em `lkp_*` recomputadas semanalmente.
**Consequência:** filtros podem ficar até 7 dias "atrasados" em relação
a novos cadastros — aceito para esse caso, pois cadastro novo é raro.

### ADR-003 — Cache client-side por classe de dado
**Contexto:** investigador navega entre dashboards várias vezes seguidas.
**Decisão:** cache em `localStorage` com TTL diferenciado por classe
(ver `docs/MODELO_TEMPORAL.md`). **Consequência:** primeira carga é
"normal", subsequentes são instantâneas. Risco de dado velho mitigado
pelo badge "última atualização" sempre visível.

### ADR-004 — Proxy de leitura entre browser e Turso (a fazer — FASE 0)
**Contexto:** hoje o token Turso (read-write) está exposto no
`config.js` publicado em GitHub Pages. Qualquer usuário do site tem
acesso total ao banco. **Decisão:** introduzir um proxy fino
(Cloudflare Worker ou Pages Function) que valida sessão JWT e injeta
token Turso (escopo read-only) na chamada. **Consequência:** a stack
do front continua vanilla; apenas `db.execute` vira `apiClient.execute`.
Token de escrita continua apenas em GitHub Actions e em rotas admin
autenticadas no proxy.

### ADR-005 — Hash de senha (a fazer — FASE 0)
**Contexto:** `users.password` está em texto plano e a comparação é
feita no SQL (`WHERE password = ?`). **Decisão:** migrar para bcrypt
e comparar no proxy. **Consequência:** script Node de migração único
durante a janela de manutenção.

### ADR-006 — Shell compartilhado para os 10 dashboards (FASE 1 — em curso)
**Contexto:** cada dashboard tem ~500 linhas de CSS inline + ~50 linhas
de header repetidas. **Decisão:** extrair para `css/dashboard-shell.css`
e `js/dashboard-shell.js`. Adoção é **incremental**, dashboard por
dashboard, sem big-bang.

### ADR-007 — Estado de filtros na URL (FASE 2)
**Contexto:** investigador remonta filtros a cada navegação entre
dashboards. **Decisão:** serializar filtros em querystring; toda
navegação entre dashboards preserva o contexto. **Consequência:**
linkear / compartilhar uma visão filtrada passa a ser nativo.

### ADR-008 — Modelo temporal canônico (FASE 3)
**Contexto:** cada dashboard reinventa "período" e "comparativo".
**Decisão:** um `period-picker` único + presets canônicos + comparativo
"vs período anterior" sempre disponível. Ver `docs/MODELO_TEMPORAL.md`.

---

## 5. Como sugerir mudanças

Antes de abrir PR de feature nova, escreva em 1 frase a pergunta
operacional que ela responde. Se não couber numa frase, simplifique.
Se a frase começa com "seria legal ter…", recuse — não é prioridade
de cockpit investigativo.
