# 📧 Sistema de Agendamentos de Relatórios

Este sistema permite agendar o envio automático de relatórios por e-mail usando GitHub Actions.

## 🚀 Como Funciona

1. **Interface Web**: Gerenciar agendamentos através da página de configurações (`dashboard-gerenciar-usuarios.html`)
2. **Banco de Dados**: Agendamentos salvos no Turso (tabela `agendamentos_relatorios`)
3. **GitHub Actions**: Executa automaticamente a cada hora para processar e enviar relatórios
4. **E-mail**: Envia relatórios formatados em HTML via SendGrid

## ⚙️ Configuração

### 1. Configurar Secrets no GitHub

Vá em `Settings > Secrets and variables > Actions > New repository secret` e adicione:

| Secret Name | Descrição | Exemplo |
|-------------|-----------|---------|
| `TURSO_URL` | URL da conexão Turso | `libsql://seu-db.turso.io` |
| `TURSO_TOKEN` | Token de autenticação Turso | `eyJhbGc...` |
| `SENDGRID_API_KEY` | API Key do SendGrid | `SG.xxxxxxxxxxxxx` |
| `EMAIL_FROM` | E-mail remetente | `sistema@germani.com` |

### 2. Criar Conta no SendGrid

1. Acesse [SendGrid](https://sendgrid.com/)
2. Crie uma conta gratuita (100 emails/dia)
3. Verifique seu domínio de e-mail
4. Gere uma API Key em `Settings > API Keys`

### 3. Ativar GitHub Actions

1. Vá em `Actions` no repositório
2. Ative os workflows se estiverem desabilitados
3. O workflow `Enviar Relatórios Agendados` será executado automaticamente a cada hora

## 📝 Como Usar

### Criar um Agendamento

1. Acesse a página de Configurações no sistema
2. Vá na aba "📧 Agendamentos de Relatórios"
3. Clique em "➕ Novo Agendamento"
4. Preencha os campos:
   - **Nome**: Identificação do agendamento
   - **Dashboard**: Qual relatório enviar
   - **Filtros**: Filtros a aplicar (opcional)
   - **Destinatários**: E-mails separados por vírgula
   - **Dia da Semana**: Quando enviar
   - **Hora**: Horário do envio (formato 24h)
5. Clique em "💾 Salvar Agendamento"

### Editar/Excluir

- **✏️ Editar**: Modifica as configurações do agendamento
- **⏸️ Desativar/▶️ Ativar**: Pausa ou retoma o envio
- **🗑️ Excluir**: Remove permanentemente

## 🎯 Dashboards Disponíveis

1. **📦 Produtos Parados**: Produtos sem venda há várias semanas
2. **🗺️ Vendas por Região**: Análise de vendas por rota/região
3. **👥 Vendas por Equipe**: Performance de representantes
4. **📊 Performance de Clientes**: Clientes com mais pedidos/vendas
5. **🏆 Ranking de Clientes**: Top clientes do ano
6. **📈 Análise de Produtos**: Produtos mais vendidos
7. **⚠️ Clientes sem Compras**: Clientes inativos

## 🔧 Testando Localmente

```bash
cd scripts

# Instalar dependências
npm install

# Configurar variáveis de ambiente
export TURSO_URL="libsql://seu-db.turso.io"
export TURSO_TOKEN="seu_token_aqui"
export SENDGRID_API_KEY="sua_api_key_aqui"
export EMAIL_FROM="sistema@germani.com"

# Executar
npm start
```

## 📊 Estrutura da Tabela

```sql
CREATE TABLE agendamentos_relatorios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_agendamento TEXT NOT NULL,
    ativo INTEGER DEFAULT 1,
    dashboard TEXT NOT NULL,
    filtros_json TEXT,
    emails_destinatarios TEXT NOT NULL,
    dia_semana TEXT,
    hora TEXT NOT NULL,
    criado_por TEXT,
    criado_em TEXT DEFAULT (datetime('now')),
    ultima_execucao TEXT,
    proxima_execucao TEXT,
    total_execucoes INTEGER DEFAULT 0,
    ultima_execucao_sucesso INTEGER DEFAULT 1
);
```

## 🐛 Troubleshooting

### Relatórios não estão sendo enviados

1. Verifique os logs do GitHub Actions (`Actions > Enviar Relatórios Agendados`)
2. Confirme que os secrets estão configurados corretamente
3. Verifique se o agendamento está ativo (`ativo = 1`)
4. Confirme que o horário está correto (usa UTC no GitHub Actions)

### Erro de autenticação no SendGrid

- Verifique se a API Key está correta
- Confirme se o domínio do remetente está verificado

### Erro de conexão com Turso

- Verifique a URL e o token do Turso
- Confirme que o banco de dados está acessível

## 📅 Horários

**IMPORTANTE**: O GitHub Actions usa horário UTC. Para converter:
- **8h BRT** = **11h UTC**
- **17h BRT** = **20h UTC**

Ajuste os horários dos agendamentos considerando o fuso horário.

## 🔒 Segurança

- ✅ Secrets armazenados no GitHub (nunca no código)
- ✅ Validação de e-mails antes de enviar
- ✅ Proteção contra SQL injection (prepared statements)
- ✅ Escape de HTML nos relatórios

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do GitHub Actions
2. Consulte a documentação do SendGrid
3. Revise a estrutura dos dados no Turso
