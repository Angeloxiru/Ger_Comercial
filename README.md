# Ger Comercial - Sistema de Gestao Comercial

Sistema web PWA (Progressive Web App) para gestao e analise de dados comerciais, construido em vanilla JavaScript com banco de dados Turso (LibSQL).

## Funcionalidades Principais

### Dashboards Analiticos

| Dashboard | Descricao |
|-----------|-----------|
| **Vendas por Regiao** | Analise de vendas por rota, sub-rota e cidade com filtros em cascata |
| **Vendas por Equipe** | Performance de representantes e supervisores |
| **Ranking de Clientes** | Top clientes por valor, quantidade, ticket medio e frequencia (Curva ABC) |
| **Performance de Clientes** | Analise detalhada por grupo de clientes |
| **Performance Mensal** | Cobranca da equipe por meta e potencial de rota |
| **Produtos Parados** | Produtos sem vendas ha 1+ semanas com classificacao por risco |
| **Analise de Produtos** | Vendas por produto, familia e origem |
| **Clientes sem Compras** | Mapa interativo de clientes inativos por grau de risco |

> **Limite de periodo:** Todos os dashboards com filtro de data aceitam no maximo **100 dias** por consulta para proteger o limite de leituras do Turso.

### Agendamento de Relatorios por Email

Sistema completo de agendamento automatico de relatorios:
- Periodicidade flexivel (diario, dias uteis, dias especificos)
- Periodos dinamicos (mes atual, mes anterior, ultimos 30/7 dias, ano, trimestre)
- Filtros inteligentes com dados reais do banco
- Multiplos destinatarios
- Execucao automatica via GitHub Actions (de hora em hora)
- Historico completo de execucoes
- Suporte Gmail com senha de app

### Mobile (PWA)

- Instalavel como aplicativo nativo em celulares
- Layout responsivo com breakpoints em 1024px, 768px e 480px
- Filtros colapsaveis com toggle touch-friendly
- Headers sticky nos dashboards
- Botao scroll-to-top em paginas longas
- Scroll horizontal com indicadores visuais nas tabelas
- Suporte a safe-area (celulares com notch)
- Cards em layout horizontal compacto em telas < 480px
- Suporte a orientacao landscape
- Alvos de toque minimos de 44px (padrao Apple/Google)

---

## Tecnologias

- **Frontend**: Vanilla JavaScript (ES6 Modules), HTML5, CSS3
- **Backend**: Turso Database (LibSQL - Cloud SQLite)
- **PWA**: Service Worker para funcionamento offline
- **Automacao**: GitHub Actions para agendamentos e atualizacao de lookups
- **Email**: Nodemailer (suporte Gmail e SendGrid)
- **Graficos**: Chart.js 4.4.0 + datalabels plugin
- **Mapas**: Leaflet 1.9.4 + MarkerCluster
- **PDF**: jsPDF 2.5.1 + autotable plugin
- **Deployment**: GitHub Pages

---

## Estrutura do Projeto

```
Ger_Comercial/
├── index.html                          # Pagina inicial (dashboard home)
├── login.html                          # Tela de login
├── manual.html                         # Manual do usuario interativo
├── manifest.json                       # Configuracao PWA
├── sw.js                               # Service Worker
├── icon-192.png / icon-512.png         # Icones PWA
│
├── css/
│   └── mobile.css                      # Estilos responsivos mobile
│
├── js/
│   ├── config.js                       # Configuracao do banco (credenciais)
│   ├── config.example.js               # Template de configuracao
│   ├── auth.js                         # Autenticacao e sessao
│   ├── db.js                           # Conexao LibSQL/Turso
│   ├── db-utils.js                     # Utilitarios de banco
│   ├── cache.js                        # Cache client-side
│   ├── pagination.js                   # Paginacao de dados
│   ├── filter-search.js               # Filtros com busca
│   ├── debug-filters.js               # Debug de filtros
│   ├── dashboard-isolation.js          # Isolamento de contexto
│   ├── mobile.js                       # Interacoes mobile (toggle, scroll-to-top)
│   └── periodo-validator.js            # Validacao de periodo (max 100 dias)
│
├── dashboards/                         # 9 dashboards analiticos
│   ├── dashboard-vendas-regiao.html
│   ├── dashboard-vendas-equipe.html
│   ├── dashboard-ranking-clientes.html
│   ├── dashboard-performance-clientes.html
│   ├── dashboard-analise-produtos.html
│   ├── dashboard-produtos-parados.html
│   ├── dashboard-clientes-semcompras.html
│   ├── dashboard-gerenciar-usuarios.html
│   └── cobranca-semanal.html
│
├── scripts/                            # Scripts Node.js de automacao
│   ├── processar-agendamentos.js       # Processador de emails agendados
│   ├── atualizar-filtros-lookup.js     # Atualiza tabelas de lookup
│   ├── gerar-template-vendas.js        # Gera template Excel de vendas
│   └── importar-vendas-excel.js        # Importa vendas de Excel
│
├── sql/                                # Scripts SQL
│   ├── auth/                           # Tabela de usuarios
│   ├── views/                          # Views do banco
│   ├── maintenance/                    # Indices, manutencao, lookups
│   ├── criar_tabela_metas_sem_fk.sql   # Tabela de metas mensais
│   └── migration-add-periodo.sql       # Migration coluna periodo
│
├── templates/                          # Templates de importacao Excel
├── tools/                              # Ferramentas de diagnostico
├── docs/                               # Documentacao tecnica
│
└── .github/workflows/                  # GitHub Actions
    ├── alertas-emails.yml              # Processa agendamentos (horario)
    ├── atualizar-lookup-filtros.yml    # Atualiza lookups (semanal)
    └── test-manual.yml                 # Testes manuais
```

---

## Configuracao Inicial

### 1. Banco de Dados Turso

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Criar banco de dados
turso db create ger-comercial

# Obter URL e Token
turso db show ger-comercial --url
turso db tokens create ger-comercial
```

### 2. Criar View de Produtos Parados

Execute o arquivo `sql/views/create_view_produtos_parados.sql` no seu banco Turso.

### 3. Criar Tabelas de Lookup de Filtros

Execute o arquivo `sql/maintenance/04-create-lookup-tables.sql` no seu banco Turso.

Isso cria 6 tabelas que armazenam valores pre-computados dos filtros:

| Tabela | Conteudo |
|--------|----------|
| `lkp_localidades` | Combinacoes de rota / sub-rota / cidade |
| `lkp_representantes` | Representantes, nomes e supervisores |
| `lkp_cidades_regiao` | Cidades por regiao |
| `lkp_cidades_equipe` | Cidades por equipe |
| `lkp_clientes` | Clientes com grupo e cidade |
| `lkp_produtos` | Produtos com familia e origem |

Apos criar as tabelas, execute o preenchimento inicial:
```bash
npm run atualizar-lookup
```

> As tabelas sao atualizadas automaticamente toda **segunda-feira as 12h (BRT)** pelo GitHub Actions.

### 4. Criar Indices de Performance

Execute `sql/maintenance/01-create-indexes.sql` para otimizacao de queries. Impacto: reducao de 90-95% no tempo de consulta.

### 5. Adicionar Coluna de Periodo

```sql
ALTER TABLE agendamentos_relatorios ADD COLUMN periodo TEXT DEFAULT 'mes-atual';
UPDATE agendamentos_relatorios SET periodo = 'mes-atual' WHERE periodo IS NULL;
```

### 6. Configurar GitHub Secrets

Acesse `Settings > Secrets and variables > Actions` e adicione:

**Obrigatorio:**
- `TURSO_URL`: URL do banco Turso
- `TURSO_TOKEN`: Token de autenticacao

**Para Gmail (Recomendado):**
- `GMAIL_USER`: seu-email@gmail.com
- `GMAIL_APP_PASSWORD`: senha de app (veja CONFIGURAR-GMAIL.md)

### 7. Habilitar GitHub Actions

1. `Settings > Actions > General`
2. Selecione **"Allow all actions"**
3. Salvar

---

## Como Usar os Agendamentos

### Criar um Agendamento

1. Dashboard **"Configuracoes"** > Aba **"Agendamentos"**
2. Clique **"+ Novo Agendamento"**
3. Preencha os campos
4. **"Testar Filtros"** para validar
5. **"Salvar"**

### Conversao de Horarios

| Brasil (BRT) | UTC |
|--------------|-----|
| 08:00 | 11:00 |
| 12:00 | 15:00 |
| 18:00 | 21:00 |

**Formula**: UTC = Brasil + 3 horas

---

## Troubleshooting

### Email Vazio?

1. Execute **"Debug Agendamento Completo"**
2. Execute **"Debug Dados Vendas"**
3. Leia **TROUBLESHOOTING-AGENDAMENTOS.md**

**Causas Comuns:**
- Periodo sem dados (dados de 2024, configurado para 2026)
- Filtros muito restritivos
- View nao existe

---

## Documentacao

| Documento | Conteudo |
|-----------|----------|
| `manual.html` | Manual completo do usuario (interativo) |
| `docs/GUIA_RAPIDO.md` | Guia rapido de inicio |
| `docs/AUTENTICACAO.md` | Sistema de autenticacao |
| `docs/ANALISE_GRAFICOS.md` | Guia de graficos |
| `docs/PRODUTOS_PARADOS.md` | Dashboard produtos parados |
| `docs/TROUBLESHOOTING.md` | Solucao de problemas |
| `CONFIGURAR-GMAIL.md` | Setup do Gmail para emails |
| `TROUBLESHOOTING-AGENDAMENTOS.md` | Diagnostico de agendamentos |
| `AGENDAMENTOS-SETUP.md` | Setup de agendamentos |
| `IMPORTAR-VENDAS.md` | Importacao de vendas |

---

## Seguranca

- Autenticacao de usuarios com controle de permissoes
- Prepared statements contra SQL Injection
- GitHub Secrets para credenciais
- HTTPS obrigatorio
- App Password do Gmail (sem acesso a conta principal)

---

## Changelog

### v4.0.0 - Mobile UX + Reorganizacao (2026-02-11)
- Melhorias visuais e de usabilidade mobile (CSS e JS)
- Suporte a safe-area para celulares com notch
- Headers sticky em dashboards no mobile
- Botao scroll-to-top em paginas longas
- Indicadores visuais de scroll horizontal nas tabelas
- Layout de cards compacto em telas < 480px
- Breakpoint tablet (1024px) para grid de cards
- Suporte a landscape mobile
- Alvos de toque minimos de 44px
- Primeira coluna sticky em tabelas mobile
- Reorganizacao: removidos arquivos SQL duplicados de scripts/
- Removido criar_tabela_metas.sql (substituido por versao sem FK)
- Service Worker atualizado com novos assets
- README e manual do usuario atualizados

### v2.0.0 - Sistema de Agendamentos (2026-01-20)
- Sistema completo de agendamentos de relatorios por email
- Periodos dinamicos
- Filtros inteligentes corrigidos
- Validacao de dados
- Suporte Gmail

---

**Desenvolvido para otimizar a gestao comercial da Germani Alimentos**
