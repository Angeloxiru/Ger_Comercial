# 🐛 Guia de Debug do Sistema de Filtros

## 📋 **Visão Geral**

Foi implementado um sistema completo de debug para diagnosticar problemas com os filtros das dashboards. Este sistema monitora:

- ✅ Registro de event listeners (detecta duplicações)
- ✅ Eventos disparados nos filtros
- ✅ Estado do FilterSearch
- ✅ Sequência de execução das funções
- ✅ Restauração de estado do cache

---

## 🚀 **Como Usar**

### **1. Acesse a Dashboard com Debug**

Atualmente, o debug está ativo em:
- ✅ `dashboard-vendas-regiao.html`

### **2. Visualize o Painel de Debug**

Ao carregar a dashboard, você verá um **painel preto no canto inferior direito** da tela com:

```
┌─────────────────────────────────────┐
│ 🐛 Filter Debugger - Vendas por... │
│ [Clear] [▼]                         │
├─────────────────────────────────────┤
│ 📊 Estatísticas:                    │
│ Total Listeners: 2                  │
│ Duplicados: Nenhum ✅               │
│ Eventos (5s): 0                     │
│ Histórico: 15 logs                  │
├─────────────────────────────────────┤
│ [Logs em tempo real aqui]          │
└─────────────────────────────────────┘
```

### **3. Interprete os Logs**

#### **Cores e Ícones:**

| Cor | Ícone | Tipo | Significado |
|-----|-------|------|-------------|
| 🔵 Ciano | ℹ️ | info | Informação geral |
| 🟡 Amarelo | ⚠️ | warn | Aviso (possível problema) |
| 🔴 Vermelho | ❌ | error | Erro |
| 🟢 Verde | 🎯 | event | Evento disparado |
| 🟣 Magenta | 📡 | listener | Listener registrado |

#### **Exemplo de Log Normal:**
```
[14:23:45.123] 🚀 Dashboard iniciando...
[14:23:45.234] 📂 carregarFiltros() iniciado
[14:23:45.456] 📝 Inicializando FilterSearch pela primeira vez...
[14:23:45.678] 🔌 registrarEventListeners() chamado - listenersRegistrados = false
[14:23:45.789] 📡 ✅ Listener registrado: filtroRota -> handleFiltroRotaChange
[14:23:45.890] 📡 ✅ Listener registrado: filtroSubRota -> handleFiltroSubRotaChange
```

#### **Exemplo de Log com PROBLEMA (Duplicação):**
```
[14:23:45.123] 🚀 Dashboard iniciando...
[14:23:45.234] 📂 carregarFiltros() iniciado
[14:23:45.456] ♻️ Reutilizando FilterSearch existente (possível cache)
[14:23:45.678] 🔌 registrarEventListeners() chamado - listenersRegistrados = false
[14:23:45.789] 📡 ⚠️ DUPLICADO! Listener registrado: filtroRota (Total: 2)
[14:23:45.890] 📡 ⚠️ DUPLICADO! Listener registrado: filtroSubRota (Total: 2)
```

**🚨 Se você ver "DUPLICADO!", o problema foi identificado!**

---

## 🔍 **Teste do Problema**

### **Procedimento de Teste:**

1. **Acesse a dashboard:**
   ```
   http://localhost/dashboards/dashboard-vendas-regiao.html
   ```

2. **Observe o painel de debug** (canto inferior direito)

3. **Verifique o log inicial:**
   - Deve mostrar: `🆕 Primeira carga ou reload`
   - Total Listeners deve ser **2** (filtroRota + filtroSubRota)
   - **Duplicados: Nenhum ✅**

4. **Teste os filtros:**
   - Selecione uma rota
   - Observe o log: `🎯 Evento: filtroRota.change`
   - Verifique se SubRota é atualizado corretamente

5. **Navegue para outra página:**
   - Clique em "Voltar" (botão no header)
   - Vá para a página principal

6. **CRÍTICO: Volte para a dashboard usando o botão VOLTAR do navegador:**
   ```
   [Botão ← do navegador]
   ```

7. **Observe o painel de debug novamente:**

   **✅ CENÁRIO BOM (sem duplicação):**
   ```
   📄 Página restaurada do bfcache
   ♻️ Reutilizando FilterSearch existente
   ⚠️ Listeners JÁ REGISTRADOS! Pulando registro
   Total Listeners: 2
   Duplicados: Nenhum ✅
   ```

   **❌ CENÁRIO RUIM (com duplicação):**
   ```
   📄 Página restaurada do bfcache
   ♻️ Reutilizando FilterSearch existente
   🔌 registrarEventListeners() chamado - listenersRegistrados = false  ← PROBLEMA!
   📡 ⚠️ DUPLICADO! Listener registrado: filtroRota (Total: 2)
   Total Listeners: 4
   Duplicados: filtroRota:change (2x), filtroSubRota:change (2x)  ← PROBLEMA!
   ```

8. **Teste os filtros novamente:**
   - Se houver duplicação, você pode ver:
     - ⚠️ **2+ eventos change em filtroRota nos últimos 100ms!**
     - Filtros não respondem ou comportamento errático

---

## 📊 **Comandos Úteis**

### **No Console do Navegador:**

```javascript
// Gerar relatório completo
window.debugFilters()

// Ver estado atual
window.filterDebugger.generateReport()

// Ver flag de listeners
console.log('listenersRegistrados:', listenersRegistrados)  // Não funciona (escopo privado)

// Ver FilterSearches
console.log('FilterSearches:', window.filterSearches)

// Ver quantos listeners em um elemento (necessita acesso ao debugger)
window.filterDebugger.listenerCounts
```

### **Atalhos do Painel:**

- **[Clear]**: Limpa histórico de logs
- **[▼/▲]**: Colapsa/expande o painel

---

## 🔧 **Análise de Problemas Comuns**

### **Problema 1: Listeners Duplicados**

**Sintomas:**
- Painel mostra: `Duplicados: filtroRota:change (2x)`
- Eventos múltiplos detectados

**Causa:**
- Flag `listenersRegistrados` não está funcionando
- Event listeners sendo registrados novamente no bfcache

**Investigar:**
```javascript
// No initFiltros quando event.persisted = true:
listenersRegistrados: false  ← Deveria ser true!
```

**Possíveis causas:**
1. Variável `listenersRegistrados` sendo resetada
2. Escopo da variável não está correto
3. Múltiplos módulos sendo instanciados

---

### **Problema 2: FilterSearch Não Encontrado**

**Sintomas:**
- Log: `⚠️ FilterSearch não encontrado para filtroRota`

**Causa:**
- `window.filterSearches` foi destruído ou não inicializado
- Mapeamento de IDs incorreto

**Investigar:**
```javascript
console.log(window.filterSearches)  // null ou undefined?
```

---

### **Problema 3: preencherSelect chamado múltiplas vezes**

**Sintomas:**
- Logs mostram múltiplas chamadas de `preencherSelect` em sequência rápida
- Options sendo recriadas constantemente

**Causa:**
- Handlers de evento disparando em cascata
- Race condition entre múltiplos handlers

**Identificar:**
```
[14:23:45.100] 🔄 preencherSelect(filtroSubRota) com 10 opções
[14:23:45.102] 🔄 preencherSelect(filtroSubRota) com 10 opções  ← Duplicado!
[14:23:45.105] 🔄 preencherSelect(filtroSubRota) com 10 opções  ← Duplicado!
```

---

## 📈 **Métricas para Monitorar**

### **Estado Saudável:**
```
Total Listeners: 2-4
Duplicados: Nenhum ✅
Eventos (5s): < 10
```

### **Estado Problemático:**
```
Total Listeners: > 10  ← PROBLEMA
Duplicados: filtroRota:change (3x)  ← PROBLEMA
Eventos (5s): > 50  ← PROBLEMA (event storm)
```

---

## 🎯 **Próximos Passos**

1. **Execute o teste acima**
2. **Capture screenshots do painel de debug:**
   - Na primeira carga
   - Após voltar do bfcache
3. **Gere relatório completo:**
   ```javascript
   window.debugFilters()
   ```
4. **Copie o relatório do console**
5. **Compartilhe os resultados para análise**

---

## 📝 **Notas Técnicas**

### **Back-Forward Cache (bfcache)**

O navegador mantém páginas em cache quando você navega. Ao voltar:
- `pageshow` event dispara com `event.persisted = true`
- JavaScript e estado permanecem na memória
- Variáveis de módulo **mantêm seus valores**
- Event listeners **permanecem registrados**

**Problema comum:**
Se o código assume que está em "primeira carga" quando `pageshow` dispara, pode registrar listeners duplicados.

### **Escopo de Variáveis**

```javascript
// Escopo de módulo (privado)
let listenersRegistrados = false;  // ← Mantém valor entre navigações!

// Escopo global (acessível)
window.filterSearches = {};  // ← Acessível via window
```

**CRÍTICO:** A flag `listenersRegistrados` está em escopo de módulo. Se o módulo for reexecutado (improvável no bfcache, mas possível), a flag é resetada para `false`.

---

## 🆘 **Solicitando Ajuda**

Se encontrar problemas, forneça:

1. ✅ Screenshot do painel de debug
2. ✅ Relatório completo (`window.debugFilters()`)
3. ✅ Passos para reproduzir
4. ✅ Navegador e versão
5. ✅ Se o problema ocorre sempre ou só às vezes

---

**Criado em:** 2025-11-24
**Versão:** 1.0.0
**Dashboard:** dashboard-vendas-regiao.html
