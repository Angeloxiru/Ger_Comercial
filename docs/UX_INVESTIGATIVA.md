# UX Investigativa — Ger Comercial

> Esta é a **carta de UX** do produto. Toda mudança visual ou de fluxo
> deve respeitar os princípios aqui antes de virar tela.

---

## 1. O que o usuário sente quando o sistema funciona

> "Eu pensei numa pergunta, cliquei duas vezes e tive a resposta com
> contexto."

Não é "tive um gráfico". É **tive uma resposta**.

| Sensação alvo | Sensação a evitar |
|---|---|
| Rápido | Lento |
| Investigativo | Decorativo |
| Operacional | Burocrático |
| Contextual | Genérico |
| Inteligente | Cru |
| Fluido | Travado |

Quando o investigador termina uma sessão, ele deve sentir que:
- **gastou menos cliques** do que esperava,
- **chegou na causa**, não só no número,
- **levou uma ação** (ligar para o cliente, cobrar o representante,
  retomar a rota) — não só uma observação.

---

## 2. Princípios

### P1. Toda tela existe para responder a uma pergunta operacional
Se você não consegue descrever a pergunta em uma frase, a tela não
deveria existir. Antes de adicionar widget, escreva a pergunta no topo
do PR.

### P2. Cada clique deve aproximar de uma resposta
KPI clicável vai para a investigação que ele resume. Linha de tabela
clicável abre o detalhe daquela entidade. Nada é decorativo.

### P3. Contexto viaja com o usuário
Sair de "Vendas por Equipe" filtrado num supervisor e abrir "Produtos
Parados" deve preservar o supervisor selecionado. Filtros vivem na URL
(querystring).

### P4. Tempo é cidadão de primeira classe
Toda análise tem janela explícita (período) e tem comparativo
disponível (vs período anterior). Nunca mostre número absoluto sem
oferecer comparativo. Ver `docs/MODELO_TEMPORAL.md`.

### P5. Sempre mostre a idade do dado
Badge fixo "**Atualizado há 4 min**" / "**há 2 h**" no topo de cada
dashboard. Sem isso, o investigador desconfia silenciosamente do
sistema e o cockpit perde valor.

### P6. Drill-down explícito em vez de filtros desconectados
"Ver este cliente em Performance" é mais valioso do que "abrir
Performance e re-selecionar o cliente". A primeira é investigação;
a segunda é re-trabalho.

### P7. Menos é mais
Se uma seção da tela não responde uma pergunta diferente das outras,
ela é redundante. Removível.

---

## 3. Padrões de tela (a estabelecer no shell)

```
┌────────────────────────────────────────────────────────────┐
│ [← voltar] DASHBOARD X       [Atualizado há 4 min]  [👤]    │  ← header
├────────────────────────────────────────────────────────────┤
│ Período: [Mês atual ▾]  [vs mês anterior ☑]   [+ filtros]  │  ← faixa temporal
├────────────────────────────────────────────────────────────┤
│ Filtros: Supervisor [▾] Representante [▾] Cidade [▾]       │
│         [Aplicar]  [Limpar]                                 │  ← filtros
├────────────────────────────────────────────────────────────┤
│ ALERTAS DESTA VISÃO (se houver)                             │
│  • Rep. João caiu 28% vs mês anterior  →                    │
│  • 3 clientes do grupo XYZ pararam de comprar  →            │  ← inteligência
├────────────────────────────────────────────────────────────┤
│ KPIs ─────────────  TABELA OPERACIONAL ──────────────────  │
│ [valor] [Δ%]        Lista clicável (drill-down)             │
│ [valor] [Δ%]                                                │
│ [valor] [Δ%]                                                │  ← corpo
├────────────────────────────────────────────────────────────┤
│ Exportar [Excel] [PDF]   Compartilhar [link com filtros]    │
└────────────────────────────────────────────────────────────┘
```

### O que **não** entra nesse layout
- Gráficos só porque "ficou bonito". Gráfico só entra se responde a
  uma pergunta que a tabela não responde.
- Cores enfeitando — vermelho/amarelo só com semântica (queda /
  atenção).
- Widgets meta ("últimas atualizações do sistema", "boas-vindas").

---

## 4. Atalhos de investigação cruzada (FASE 2)

| De onde | Para onde | Comportamento |
|---|---|---|
| Cliente em Ranking | Performance de Clientes | abre filtrado naquele cliente + mesmo período |
| Representante em Vendas/Equipe | Produtos Parados | abre filtrado naquele rep |
| Representante em Vendas/Equipe | Performance Mensal | abre filtrado naquele rep |
| Produto em Produtos Parados | Análise de Produtos | abre filtrado naquele produto, histórico de 90 dias |
| Cliente em Clientes sem Compras | Performance de Clientes | abre histórico daquele cliente |
| Cidade / rota em qualquer lugar | Vendas por Região | abre filtrado |

**Implementação:** cada tabela do shell aceita `onRowClick(row)` que
retorna a URL contextual. O shell já injeta `?periodo=...` e demais
filtros vigentes.

---

## 5. Saved views (FASE 2 / 3)

Cada usuário deve poder gravar visões que importam para ele:
- "Minha rota – semana atual"
- "Top 10 clientes que mais caíram – mês"
- "Produtos parados ≥ 4 semanas no supervisor X"

Persistidas em `user_views(user_id, name, dashboard, params_json,
created_at)`. Apenas o **owner** vê suas views (não há
compartilhamento global na v1 — investigação é pessoal).

---

## 6. Alertas contextuais (FASE 4)

Topo da home e topo de cada dashboard relevante mostram **3 a 5
alertas vivos**, baseados em deltas temporais:

- "Representante X caiu 32% vs semana passada"
- "5 clientes do grupo Y pararam de comprar este mês"
- "Produto Z saiu de 4 rotas nas últimas 3 semanas"

Cada alerta é clicável e abre o dashboard de investigação
correspondente já filtrado. Sem isso, alerta é apenas notificação —
com isso, alerta é o ponto de partida da investigação.

---

## 7. Anti-padrões — vetar em review

- "Vamos adicionar um carrossel de notícias na home."
- "Que tal um wallpaper / fundo decorativo no dashboard?"
- "Vamos botar um chat aqui."
- "Vamos criar uma tela de configurações avançadas com 30 opções."
- "Vamos espelhar o que o Power BI faz."
- "Vamos criar uma feature flag para isso."

Todos: **não.** Volte ao princípio P1.
