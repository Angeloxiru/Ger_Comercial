# 📊 Ger Comercial - Sistema de Gestão Comercial

Sistema web PWA (Progressive Web App) para gestão e análise de dados comerciais, construído em vanilla JavaScript com banco de dados Turso (LibSQL).

## 🌟 Funcionalidades Principais

### 📈 Dashboards Analíticos
- **Produtos Parados**: Identifica produtos sem vendas há 1+ semanas com classificação por nível de risco
- **Vendas por Região**: Análise de vendas por rota, sub-rota e cidade
- **Vendas por Equipe**: Performance de representantes e supervisores
- **Performance de Clientes**: Análise detalhada de clientes por grupo
- **Ranking de Clientes**: Top clientes por volume de vendas
- **Análise de Produtos**: Vendas por produto, família e origem
- **Clientes sem Compras**: Identificação de clientes inativos por grau de risco

### 📧 **Agendamento de Relatórios** ⭐ NOVO!
Sistema completo de agendamento automático de relatórios por email.

#### Características:
- ✅ **Periodicidade Flexível**: Diário, dias úteis, dias específicos da semana
- ✅ **Períodos Dinâmicos**: Mês atual, mês anterior, últimos 30/7 dias, ano, trimestre
- ✅ **Filtros Inteligentes**: Dropdowns com dados reais do banco
- ✅ **Múltiplos Destinatários**: Envio para vários emails simultaneamente
- ✅ **Execução Automática**: GitHub Actions rodando de hora em hora
- ✅ **Histórico de Execuções**: Rastreamento completo
- ✅ **Suporte Gmail**: Configuração fácil sem necessidade de domínio próprio
- ✅ **Validação de Dados**: Botão "Testar Filtros" antes de salvar

#### Filtros por Dashboard:
| Dashboard | Filtros Disponíveis |
|-----------|-------------------|
| Produtos Parados | Supervisor, Representante, Nível de Risco |
| Vendas por Região | Rota, Sub-Rota, Cidade |
| Vendas por Equipe | Supervisor, Representante, Cidade |
| Performance de Clientes | Grupo, Cliente, Cidade |
| Ranking de Clientes | Rota, Sub-Rota, Cidade, Supervisor, Representante |
| Análise de Produtos | Origem, Família, Produto |
| Clientes sem Compras | Grau de Risco, Rota, Sub-Rota, Cidade |

---

## 🚀 Tecnologias

- **Frontend**: Vanilla JavaScript (ES6 Modules), HTML5, CSS3
- **Backend**: Turso Database (LibSQL - Cloud SQLite)
- **PWA**: Service Worker para funcionamento offline
- **Automação**: GitHub Actions para execução de agendamentos
- **Email**: Nodemailer (suporte Gmail e SendGrid)
- **Deployment**: GitHub Pages

---

## ⚙️ Configuração Inicial

### 1. Banco de Dados Turso

\`\`\`bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Criar banco de dados
turso db create ger-comercial

# Obter URL e Token
turso db show ger-comercial --url
turso db tokens create ger-comercial
\`\`\`

### 2. Criar View de Produtos Parados

Execute o arquivo \`/sql/views/create_view_produtos_parados.sql\` no seu banco Turso.

### 3. Adicionar Coluna de Período

\`\`\`sql
ALTER TABLE agendamentos_relatorios ADD COLUMN periodo TEXT DEFAULT 'mes-atual';
UPDATE agendamentos_relatorios SET periodo = 'mes-atual' WHERE periodo IS NULL;
\`\`\`

### 4. Configurar GitHub Secrets

Acesse \`Settings → Secrets and variables → Actions\` e adicione:

**Obrigatório:**
- \`TURSO_URL\`: URL do banco Turso
- \`TURSO_TOKEN\`: Token de autenticação

**Para Gmail (Recomendado):**
- \`GMAIL_USER\`: seu-email@gmail.com
- \`GMAIL_APP_PASSWORD\`: senha de app (veja CONFIGURAR-GMAIL.md)

### 5. Habilitar GitHub Actions

1. \`Settings → Actions → General\`
2. Selecione **"Allow all actions"**
3. Salvar

---

## 📧 Como Usar os Agendamentos

### Criar um Agendamento

1. Dashboard **"Gerenciar Usuários"** → Aba **"Agendamentos"**
2. Clique **"+ Novo Agendamento"**
3. Preencha os campos
4. **"🔍 Testar Filtros"** para validar
5. **"💾 Salvar"**

### Conversão de Horários

| Brasil (BRT) | UTC |
|--------------|-----|
| 08:00 | 11:00 |
| 12:00 | 15:00 |
| 18:00 | 21:00 |

**Fórmula**: UTC = Brasil + 3 horas

---

## 🐛 Troubleshooting

### Email Vazio?

1. Execute **"🔍 Debug Agendamento Completo"**
2. Execute **"🔍 Debug Dados Vendas"**
3. Leia **TROUBLESHOOTING-AGENDAMENTOS.md**

**Causas Comuns:**
- Período sem dados (dados de 2024, configurado para 2026)
- Filtros muito restritivos
- View não existe

---

## 📚 Documentação

- **CONFIGURAR-GMAIL.md**: Setup do Gmail
- **TROUBLESHOOTING-AGENDAMENTOS.md**: Guia completo de diagnóstico
- **AGENDAMENTOS-SETUP.md**: Setup inicial

---

## 🔐 Segurança

- ✅ Autenticação de usuários
- ✅ Prepared statements (SQL Injection)
- ✅ GitHub Secrets para credenciais
- ✅ HTTPS obrigatório
- ✅ App Password do Gmail

---

## 📝 Changelog

### v2.0.0 - Sistema de Agendamentos (2026-01-20)
- ✨ Sistema completo de agendamentos
- ✨ Períodos dinâmicos
- ✨ Filtros inteligentes corrigidos
- ✨ Validação de dados
- ✨ Suporte Gmail
- 🐛 Todos os filtros corrigidos
- 📚 Documentação completa

---

**Desenvolvido com ❤️ para otimizar a gestão comercial**
