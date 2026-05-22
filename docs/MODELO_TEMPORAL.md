# Modelo Temporal — Ger Comercial

> Tempo não é um filtro qualquer. **É o eixo principal da
> investigação.** Toda métrica do sistema vive numa janela e tem um
> comparativo. Este documento canoniza o vocabulário.

---

## 1. Vocabulário canônico

### 1.1 Eventos × estados derivados

| Tipo | Exemplo | Característica |
|---|---|---|
| **Evento** | venda (uma linha de `vendas`) | imutável, datado, fato bruto |
| **Estado derivado** | "produto parado há 4 semanas", "cliente inativo há 30 dias" | snapshot computado em cima de eventos |

**Regra:** estado derivado **nunca** entra na tabela `vendas`. Ele é
calculado em view (`vw_produtos_parados`) ou em lookup materializada
(`lkp_produtos_parados`).

### 1.2 Períodos canônicos

| Preset | Janela | Quando usar |
|---|---|---|
| **Hoje** | 00:00 → agora | acompanhamento intra-dia |
| **Semana atual** | segunda 00:00 → agora | cobrança semanal da equipe |
| **Mês atual** | dia 1 → agora | meta mensal, padrão da home |
| **Últimos 7 dias** | hoje − 6 → hoje | tendência curta |
| **Últimos 30 dias** | hoje − 29 → hoje | tendência média |
| **Mês anterior** | mês fechado anterior | comparativo / cobrança fechada |
| **Trimestre atual** | trimestre vigente | visão executiva |
| **Ano atual** | 1 jan → hoje | acumulado anual |
| **Customizado** | qualquer | até 100 dias (366 com `periodo_estendido`) |

> Limite de 100 dias protege o orçamento de leituras do Turso. Usuários
> com `users.periodo_estendido = 1` chegam a 366 dias.

### 1.3 Comparativos canônicos

Toda métrica do sistema deve poder ser comparada a uma das duas
janelas equivalentes:

| Comparativo | Definição |
|---|---|
| **vs período anterior** | mesma duração imediatamente antes (mês atual → mês anterior; 30d → os 30d anteriores) |
| **vs mesmo período do ano anterior** | mesma janela, 12 meses atrás (sazonalidade) |

UI mostra: `R$ 1,2M  ▲ 14% (mês ant.)  ▼ 3% (ano ant.)`.

**Importante:** quando a janela vigente ainda está em curso (ex: mês
atual no dia 12), o comparativo deve respeitar o mesmo **número de
dias decorridos** — comparar mês atual (12 dias) com mês anterior
completo (30 dias) é mentira estatística.

---

## 2. Frescor do dado (cache TTL)

Tabela mestre que orienta o `cache.js`:

| Classe de dado | TTL | Justificativa |
|---|---|---|
| Lookups (rotas, reps, clientes, produtos) | 6 h | Cadastros mudam pouco; refresh semanal via Action |
| Estado derivado fechado (mês passado) | 24 h | Janela imutável; cache agressivo é seguro |
| Dashboard de período **em curso** (semana / mês atual) | **10 min** | Operação do dia; dado velho induz erro |
| KPIs do dia | 5 min | Acompanhamento intra-dia |
| Sessão / auth | até logout | — |

Toda página exibe **badge "atualizado há X"** próximo ao header. Sem
o badge, o investigador desconfia silenciosamente — e o cockpit perde
valor.

---

## 3. Drill temporal (FASE 3 / 4)

Investigador precisa poder navegar no tempo sem mudar de tela:

- **Setas `< >`** ao lado do seletor de período: empurram a janela
  para trás/para frente preservando duração.
  Ex: "Mês atual" → seta esquerda → "Mês anterior" → seta esquerda →
  mês anterior ao anterior.
- **Comparativo destacável**: clicar em "▲ 14%" expande mini-tabela
  com os 2 períodos lado a lado.
- **Linha do tempo semanal** sempre presente nos dashboards principais
  (Vendas/Equipe, Performance, Categorias): 13 semanas para trás, eixo
  X consistente em todos os dashboards.

---

## 4. Eventos relevantes para investigação temporal

Marcações que o sistema reconhece como "algo aconteceu":

| Evento | Detecção | Onde aparece |
|---|---|---|
| Produto parado | sem venda há ≥ 1 semana | Produtos Parados |
| Cliente inativo | sem compra na janela | Clientes sem Compras |
| Queda de representante | venda atual / venda comparada < 0.7 | Alerta na home (FASE 4) |
| Cliente que saiu | tinha venda comparativo, não tem atual | Alerta + Clientes sem Compras |
| Família/origem caindo | mesmo critério aplicado a `desc_familia` / `desc_origem` | Análise de Produtos |

Esses são **estados derivados** — vivem em view/lookup, não em
`vendas`. Recomputados a cada execução do Action de manutenção (ou,
quando o custo for baixo, sob demanda no proxy).

---

## 5. Anti-padrões temporais

- **"R$ 1,2M" sem janela explícita.** Sempre dizer "este mês" / "últimos
  30 dias" no card.
- **Comparar janela em curso com janela fechada equivalente** (mês 12d
  vs mês 30d). Truncar comparativo.
- **Cache de 6h em dado de operação do dia.** Operação exige minutos,
  não horas.
- **Esconder "última atualização".** Sem isso, o usuário não sabe se
  está olhando dados de 2 minutos ou 2 horas atrás.
- **Janela customizada sem limite.** O orçamento de leituras do Turso
  é finito; 100 dias é o teto operacional.

---

## 6. Implementação esperada (FASE 3)

- `js/period-picker.js`: componente único de seleção de período +
  comparativo. Emite evento `period-change` com
  `{ start, end, prevStart, prevEnd, ytdStart, ytdEnd }`.
- `js/dashboard-shell.js` injeta esse picker no header de cada
  dashboard que opte por usá-lo. Adoção é incremental.
- Toda query de dashboard que lê `vendas` passa a aceitar dois ranges
  (atual + comparativo) e calcular o delta no client.
