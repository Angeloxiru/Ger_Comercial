# 📧 Setup do Sistema de Agendamentos de Relatórios

## ✅ O que foi implementado

Sistema completo para agendamento automático de envio de relatórios por e-mail com:

- ✅ Interface web para gerenciar agendamentos
- ✅ Tabela no banco de dados (Turso)
- ✅ Script Node.js para processamento
- ✅ GitHub Actions para execução automática (a cada hora)
- ✅ Suporte a 7 tipos de dashboards/relatórios
- ✅ Filtros dinâmicos por dashboard
- ✅ Múltiplos destinatários
- ✅ Agendamento por dia da semana e horário
- ✅ Histórico de execuções

## 🚀 Como Configurar

### PASSO 1: Configurar SendGrid (Serviço de E-mail)

1. Acesse: https://sendgrid.com/
2. Crie uma conta gratuita (permite 100 emails/dia)
3. Verifique seu e-mail
4. Acesse `Settings > Sender Authentication`
5. Verifique seu domínio ou e-mail remetente
6. Vá em `Settings > API Keys`
7. Clique em `Create API Key`
8. Dê o nome "Ger Comercial"
9. Selecione "Full Access"
10. **Copie a API Key** (você não poderá vê-la novamente!)

### PASSO 2: Configurar Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Vá em `Settings` (no topo da página)
3. No menu lateral, clique em `Secrets and variables` > `Actions`
4. Clique em `New repository secret`
5. Adicione os seguintes secrets:

#### Secret 1: TURSO_URL
- **Name:** `TURSO_URL`
- **Value:** `libsql://comercial-angeloxiru.aws-us-east-1.turso.io` (ou sua URL do Turso)

#### Secret 2: TURSO_TOKEN
- **Name:** `TURSO_TOKEN`
- **Value:** (seu token do Turso - veja em sql/Dados_Banco_Turso)

#### Secret 3: SENDGRID_API_KEY
- **Name:** `SENDGRID_API_KEY`
- **Value:** (a API Key que você copiou no Passo 1)

#### Secret 4: EMAIL_FROM
- **Name:** `EMAIL_FROM`
- **Value:** `sistema@germani.com` (ou seu e-mail verificado no SendGrid)

### PASSO 3: Ativar GitHub Actions

1. Vá na aba `Actions` do repositório
2. Se estiver desabilitado, clique em "I understand my workflows, go ahead and enable them"
3. Você verá o workflow "Enviar Relatórios Agendados"
4. O workflow rodará automaticamente a cada hora

### PASSO 4: Testar Manualmente

1. Na aba `Actions`, clique no workflow "Enviar Relatórios Agendados"
2. Clique em `Run workflow` > `Run workflow`
3. Aguarde a execução (será listada embaixo)
4. Clique na execução para ver os logs
5. Verifique se passou sem erros

## 📝 Como Usar

### Criar Agendamento de Teste

1. Acesse o sistema: https://angeloxiru.github.io/Ger_Comercial/
2. Faça login como admin
3. Vá em "Configurações" (ícone de engrenagem)
4. Role até "📧 Agendamentos de Relatórios"
5. Clique em "➕ Novo Agendamento"
6. Preencha:
   - **Nome:** Produtos Parados - Teste
   - **Dashboard:** Produtos Parados
   - **Filtros:** (deixe em branco ou preencha)
   - **E-mails:** seu-email@gmail.com
   - **Dia:** Todos os dias
   - **Hora:** (a hora atual + 1 hora, em UTC - veja abaixo)
7. Clique em "💾 Salvar Agendamento"

### ⏰ Conversão de Horários (IMPORTANTE!)

O GitHub Actions usa **UTC**. Você precisa converter:

| Hora BRT (Brasília) | Hora UTC (GitHub) |
|---------------------|-------------------|
| 08:00 | 11:00 |
| 09:00 | 12:00 |
| 12:00 | 15:00 |
| 17:00 | 20:00 |
| 18:00 | 21:00 |

**Fórmula**: UTC = BRT + 3 horas

Exemplo: Se você quer receber às 8h da manhã BRT, configure para **11:00** no agendamento.

## 🧪 Testando Localmente (Opcional)

Se quiser testar o script antes de fazer commit:

```bash
# Entre na pasta scripts
cd scripts

# Instale as dependências
npm install

# Configure as variáveis de ambiente
export TURSO_URL="libsql://comercial-angeloxiru.aws-us-east-1.turso.io"
export TURSO_TOKEN="seu_token_aqui"
export SENDGRID_API_KEY="sua_api_key_aqui"
export EMAIL_FROM="sistema@germani.com"

# Execute o script
node processar-agendamentos.js
```

## 📊 Dashboards Disponíveis

1. **📦 Produtos Parados** - Produtos sem venda há várias semanas
2. **🗺️ Vendas por Região** - Vendas agrupadas por rota/região
3. **👥 Vendas por Equipe** - Performance de representantes
4. **📊 Performance de Clientes** - Top clientes por vendas
5. **🏆 Ranking de Clientes** - Ranking anual de clientes
6. **📈 Análise de Produtos** - Produtos mais vendidos
7. **⚠️ Clientes sem Compras** - Clientes inativos

## 🔧 Troubleshooting

### "Erro ao conectar ao banco de dados"
- Verifique se `TURSO_URL` e `TURSO_TOKEN` estão corretos nos secrets

### "Erro ao enviar e-mail"
- Verifique se `SENDGRID_API_KEY` está correto
- Confirme que o e-mail remetente está verificado no SendGrid

### "Workflow não está rodando"
- Verifique se está habilitado em `Actions`
- Confirme que o arquivo está em `.github/workflows/alertas-emails.yml`

### "Relatório não foi enviado no horário"
- Lembre-se da conversão UTC (adicione 3 horas)
- O workflow roda "na hora cheia" (08:00, 09:00, 10:00...)
- Se configurar 08:30, só enviará às 09:00

## 📂 Arquivos Criados/Modificados

```
📁 Ger_Comercial/
├── 📁 .github/workflows/
│   └── alertas-emails.yml           ← Workflow do GitHub Actions
├── 📁 dashboards/
│   └── dashboard-gerenciar-usuarios.html  ← Interface de agendamentos
├── 📁 scripts/
│   ├── processar-agendamentos.js    ← Script de processamento
│   ├── package.json                 ← Dependências Node.js
│   └── README-AGENDAMENTOS.md       ← Documentação detalhada
└── AGENDAMENTOS-SETUP.md            ← Este arquivo
```

## 📚 Documentação Adicional

- **Documentação detalhada**: `scripts/README-AGENDAMENTOS.md`
- **Código do script**: `scripts/processar-agendamentos.js`
- **Workflow**: `.github/workflows/alertas-emails.yml`

## ✅ Checklist de Configuração

- [ ] Conta criada no SendGrid
- [ ] E-mail verificado no SendGrid
- [ ] API Key gerada no SendGrid
- [ ] Secrets configurados no GitHub:
  - [ ] TURSO_URL
  - [ ] TURSO_TOKEN
  - [ ] SENDGRID_API_KEY
  - [ ] EMAIL_FROM
- [ ] GitHub Actions habilitado
- [ ] Workflow testado manualmente
- [ ] Agendamento de teste criado
- [ ] E-mail de teste recebido

## 🎉 Pronto!

Agora você tem um sistema completo de agendamentos de relatórios funcionando!

Os relatórios serão enviados automaticamente no horário configurado, sem precisar de nenhuma intervenção manual.
