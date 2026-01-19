# 📧 Configurar Agendamentos com Gmail (100% Gratuito)

Este guia mostra como configurar o sistema de agendamentos usando sua conta Gmail **gratuitamente**, sem precisar de domínio ou serviços pagos!

## ✨ Vantagens do Gmail

- ✅ **100% Gratuito** - Não precisa pagar nada
- ✅ **500 e-mails por dia** - Mais que suficiente para relatórios
- ✅ **Sem verificação de domínio** - Basta ter uma conta Gmail
- ✅ **Configuração rápida** - 5 minutos para configurar
- ✅ **Confiável** - Infraestrutura do Google

---

## 🚀 Passo a Passo Completo

### PASSO 1: Ativar Autenticação de 2 Fatores no Gmail

1. Acesse: https://myaccount.google.com/security
2. Role até "Como fazer login no Google"
3. Clique em **"Verificação em duas etapas"**
4. Clique em **"Começar"**
5. Siga as instruções para ativar (vai pedir seu celular)
6. ✅ Pronto! A verificação em 2 etapas está ativa

> **⚠️ IMPORTANTE**: Você PRECISA ativar a verificação em 2 etapas para poder gerar senhas de app!

---

### PASSO 2: Gerar Senha de Aplicativo

1. Ainda em https://myaccount.google.com/security
2. Role até "Como fazer login no Google"
3. Clique em **"Senhas de app"**
   - Se não aparecer, procure por "App passwords" na busca
   - Ou acesse direto: https://myaccount.google.com/apppasswords
4. Pode pedir sua senha do Gmail novamente - digite e confirme
5. Em "Selecionar app", escolha: **"Outro (nome personalizado)"**
6. Digite: **"Ger Comercial Relatórios"**
7. Clique em **"Gerar"**
8. 🔑 **Copie a senha de 16 caracteres** que apareceu (exemplo: `abcd efgh ijkl mnop`)
   - ⚠️ Guarde essa senha! Você não poderá vê-la novamente
   - É algo como: `qwer tyui asdf ghjk`

> **💡 DICA**: Você pode gerar quantas senhas de app quiser. Se perder, é só gerar outra!

---

### PASSO 3: Configurar Secrets no GitHub

Agora vamos configurar as credenciais no GitHub:

1. Acesse seu repositório: https://github.com/Angeloxiru/Ger_Comercial
2. Clique em **"Settings"** (no topo da página)
3. No menu lateral, clique em **"Secrets and variables"** > **"Actions"**
4. Clique em **"New repository secret"**

#### Adicione os seguintes secrets:

#### Secret 1: GMAIL_USER
- **Name:** `GMAIL_USER`
- **Secret:** `seu-email@gmail.com`
- Exemplo: `joao.silva@gmail.com`

#### Secret 2: GMAIL_APP_PASSWORD
- **Name:** `GMAIL_APP_PASSWORD`
- **Secret:** (cole a senha de 16 caracteres que você copiou)
- Exemplo: `abcd efgh ijkl mnop`
- ⚠️ Cole exatamente como está, COM os espaços!

#### Secret 3: TURSO_URL
- **Name:** `TURSO_URL`
- **Secret:** `libsql://comercial-angeloxiru.aws-us-east-1.turso.io`
- (ou sua URL do Turso - veja em sql/Dados_Banco_Turso)

#### Secret 4: TURSO_TOKEN
- **Name:** `TURSO_TOKEN`
- **Secret:** (seu token do Turso)
- Está no arquivo `sql/Dados_Banco_Turso`

---

### PASSO 4: Ativar GitHub Actions

1. Ainda no repositório, clique na aba **"Actions"**
2. Se estiver desabilitado, clique em **"I understand my workflows, go ahead and enable them"**
3. Você verá o workflow **"Enviar Relatórios Agendados"**
4. ✅ Pronto! O workflow rodará automaticamente a cada hora

---

### PASSO 5: Testar o Sistema

Vamos testar manualmente antes de esperar a execução automática:

1. Na aba **"Actions"**, clique no workflow **"Enviar Relatórios Agendados"**
2. Clique no botão azul **"Run workflow"** (no lado direito)
3. Clique em **"Run workflow"** novamente (no popup)
4. Aguarde alguns segundos, a execução aparecerá na lista
5. Clique na execução para ver os logs
6. Se aparecer **"✅ Processamento concluído!"** = **Funcionou!** 🎉

---

## 📝 Criar Seu Primeiro Agendamento

Agora vamos criar um agendamento de teste:

1. Acesse: https://angeloxiru.github.io/Ger_Comercial/
2. Faça login como admin
3. Clique em **"Configurações"** (ícone de engrenagem)
4. Role até **"📧 Agendamentos de Relatórios"**
5. Clique em **"➕ Novo Agendamento"**

### Preencha assim:

```
📝 Nome do Agendamento:
   Produtos Parados - Teste Diário

📊 Dashboard:
   📦 Produtos Parados

🔍 Filtros:
   (deixe em branco por enquanto)

📧 E-mails dos Destinatários:
   seu-email@gmail.com
   (você pode adicionar mais separados por vírgula)

📅 Dia da Semana:
   Todos os dias

⏰ Hora:
   11:00  (isso é 8h da manhã no Brasil)
```

6. Clique em **"💾 Salvar Agendamento"**

---

## ⏰ IMPORTANTE: Conversão de Horários

O GitHub Actions usa horário **UTC** (Londres). O Brasil está **3 horas à frente**.

### Tabela de Conversão:

| 🇧🇷 Horário Brasil (BRT) | 🌍 Horário UTC (GitHub) | Exemplo de Uso |
|-------------------------|------------------------|----------------|
| 06:00 (6h manhã) | 09:00 | Relatório matinal cedo |
| 08:00 (8h manhã) | 11:00 | Relatório ao chegar no trabalho |
| 12:00 (meio-dia) | 15:00 | Relatório do almoço |
| 17:00 (5h tarde) | 20:00 | Relatório fim do dia |
| 18:00 (6h tarde) | 21:00 | Relatório pós-expediente |

### 🔢 Fórmula Rápida:
```
Hora UTC = Hora Brasil + 3
```

Exemplos:
- Quero receber às **8h da manhã** → Configure para **11:00**
- Quero receber às **5h da tarde** → Configure para **20:00**

---

## 🧪 Testando Agora (Sem Esperar)

Se você criou um agendamento e quer testar AGORA sem esperar o horário:

1. Edite o agendamento que você criou
2. Mude a **Hora** para: **a hora atual + 1 hora em UTC**
3. Exemplo:
   - Agora são 14:00 no Brasil
   - UTC agora é 17:00 (14 + 3)
   - Configure para: **18:00** (próxima hora cheia)
4. Salve e aguarde até a hora cheia
5. Verifique seu e-mail!

---

## 📧 Como Será o E-mail

O e-mail que você vai receber terá:

- ✅ **Assunto**: "📊 Nome do Agendamento - Data/Hora"
- ✅ **Remetente**: Seu próprio Gmail
- ✅ **Conteúdo**:
  - Cabeçalho vermelho com logo
  - Filtros aplicados (se houver)
  - Tabela com os dados
  - Link para o sistema completo
  - Rodapé profissional

---

## 🐛 Problemas Comuns

### "Workflow falhou com erro de autenticação"
- ✅ Verifique se ativou a verificação em 2 etapas
- ✅ Gere uma nova senha de app e atualize o secret
- ✅ Certifique-se que copiou a senha COM os espaços

### "Não recebi o e-mail"
- ✅ Verifique a pasta de SPAM
- ✅ Confirme que o horário está correto (lembre-se do UTC!)
- ✅ Verifique os logs do GitHub Actions

### "Erro: Invalid login"
- ✅ Senha de app está incorreta
- ✅ Gere uma nova senha de app
- ✅ Atualize o secret `GMAIL_APP_PASSWORD`

### "E-mail foi para SPAM"
- ✅ Normal na primeira vez!
- ✅ Marque como "Não é spam"
- ✅ Adicione seu próprio e-mail aos contatos
- ✅ Próximos e-mails chegarão na caixa de entrada

---

## 🔒 Segurança

### É Seguro?

✅ **SIM!** Muito seguro:

1. **Senha de app ≠ Senha da conta**
   - Se alguém pegar a senha de app, NÃO consegue acessar seu Gmail
   - Só consegue enviar e-mails através do app

2. **Você pode revogar a qualquer momento**
   - Vá em https://myaccount.google.com/apppasswords
   - Clique em "Remover" na senha de app
   - Pronto! Ninguém mais pode usar

3. **Secrets do GitHub são privados**
   - Apenas você (dono do repositório) pode ver
   - GitHub criptografa todos os secrets
   - Ninguém mais tem acesso

### Boas Práticas:

- ✅ Nunca compartilhe a senha de app
- ✅ Nunca faça commit da senha no código
- ✅ Use apenas através dos GitHub Secrets
- ✅ Se suspeitar de problema, revogue e gere nova

---

## 📊 Limites do Gmail

- **500 e-mails por dia** para contas pessoais
- **2.000 e-mails por dia** para Google Workspace (pago)
- Cada e-mail pode ter múltiplos destinatários

### Isso é suficiente?

✅ **SIM!** Veja:

- 10 agendamentos × 1 envio por dia = **10 e-mails/dia** ✅
- 5 agendamentos × 3 destinatários = **15 e-mails/dia** ✅
- 20 agendamentos × 2 vezes ao dia = **40 e-mails/dia** ✅

Você precisaria de **MUITOS** agendamentos para chegar no limite!

---

## 🆚 Gmail vs SendGrid

| Característica | Gmail | SendGrid |
|----------------|-------|----------|
| **Preço** | 🟢 Gratuito | 🟡 100 emails/dia grátis |
| **Configuração** | 🟢 5 minutos | 🔴 20 minutos |
| **Verificação** | 🟢 Não precisa | 🔴 Precisa verificar domínio |
| **Limite diário** | 🟢 500 emails | 🟡 100 emails (free) |
| **Confiabilidade** | 🟢 Google | 🟢 SendGrid |
| **Recomendação** | 🏆 **MELHOR PARA VOCÊ** | Alternativa |

---

## 🎯 Checklist Final

Antes de considerar tudo pronto, verifique:

- [ ] Verificação em 2 etapas ativada no Gmail
- [ ] Senha de app gerada e copiada
- [ ] Secret `GMAIL_USER` configurado no GitHub
- [ ] Secret `GMAIL_APP_PASSWORD` configurado no GitHub
- [ ] Secret `TURSO_URL` configurado no GitHub
- [ ] Secret `TURSO_TOKEN` configurado no GitHub
- [ ] GitHub Actions habilitado
- [ ] Workflow testado manualmente (rodou sem erros)
- [ ] Agendamento de teste criado
- [ ] E-mail de teste recebido

---

## 📞 Ainda Tem Dúvidas?

### Links Úteis:

- 📧 Gerenciar senhas de app: https://myaccount.google.com/apppasswords
- 🔐 Segurança do Gmail: https://myaccount.google.com/security
- 🤖 GitHub Actions: https://github.com/Angeloxiru/Ger_Comercial/actions

### Documentação Adicional:

- `AGENDAMENTOS-SETUP.md` - Configuração completa (todas as opções)
- `scripts/README-AGENDAMENTOS.md` - Documentação técnica
- `scripts/processar-agendamentos.js` - Código do script

---

## 🎉 Pronto!

Agora você tem um sistema profissional de **relatórios automáticos por e-mail**, 100% gratuito, usando apenas sua conta Gmail!

Os relatórios serão enviados automaticamente no horário que você configurar, sem precisar fazer nada! 🚀

---

## 💡 Dica Extra: E-mails Profissionais

Os e-mails sairão do seu Gmail pessoal. Se quiser mais profissional no futuro:

1. **Google Workspace** (R$ 30/mês)
   - Seu e-mail seria: `sistema@germani.com.br`
   - Limite aumenta para 2.000 emails/dia
   - Mais profissional

2. **Continuar com Gmail** (Grátis)
   - Configure um nome de exibição: "Sistema Ger Comercial"
   - Adicione uma assinatura profissional
   - Funciona perfeitamente!

**Recomendação**: Comece com Gmail gratuitamente. Se crescer muito, aí sim considere o Workspace!
