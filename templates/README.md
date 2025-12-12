# 📂 Templates de Importação

Este diretório contém templates para facilitar a importação de dados no sistema Ger Comercial.

## 📥 Template de Importação de Clientes

### Arquivos Disponíveis

1. **template_importacao_clientes.xlsm** - Template Excel principal (habilitado para macros)
2. **template_importacao_clientes.xlsx** - Versão sem macro (apenas para referência)
3. **Importar_Clientes.bas** - Código VBA da macro (para importação manual)
4. **COMO_ADICIONAR_MACRO.txt** - Guia completo para adicionar a macro ao Excel

### 🎯 Objetivo

O template Excel foi criado para facilitar a importação de dados de clientes para o sistema. Ele resolve o problema de planilhas que:
- Têm colunas com nomes diferentes dos esperados pelo sistema
- Contêm colunas extras que devem ser ignoradas
- Precisam ser convertidas para o formato correto de importação

### ⚙️ Como Funciona

A macro VBA **Importar_Clientes** faz o seguinte:

1. Solicita que você selecione um arquivo Excel de origem (seu arquivo com os dados)
2. Mapeia automaticamente as colunas com base nos nomes:
   - "Cliente" → cliente
   - "Nome" → nome
   - "Fantasia" → fantasia
   - "Inscr. Est." → insc_est
   - "CNPJ/CPF" → cnpj_cpf
   - "Grupo" → grupo
   - "Endereço" → endereco
   - "CEP" → cep
   - "Bairro" → bairro
   - "Cidade" → cidade
   - "Nome (Grupo)" → grupo_desc
   - "Descr. (Rota)" → rota
   - "Descrição (Situação)" → sit_cliente
   - "Descrição (Sub Rota)" → sub_rota
   - "Número Endereço" → num_endereco
3. Cria automaticamente um arquivo de texto (.txt) com:
   - Codificação UTF-8 correta (preserva acentos)
   - Formato delimitado por tabulação
   - Valores entre aspas duplas
   - Pronto para importação no sistema

### 📖 Instruções para os Usuários

#### Download do Template

1. Acesse o dashboard de **Gerenciar Usuários** (Configurações)
2. Na seção **Importar Dados**, selecione **👥 Clientes (tab_cliente)**
3. Clique no botão **📥 Baixar Template Excel com Macro**
4. Siga as instruções que aparecerão na tela

#### Uso da Macro

1. **Abra o arquivo** `template_importacao_clientes.xlsm`
2. **Habilite as macros** quando solicitado (clique em "Habilitar Conteúdo")
3. **Leia as instruções** na primeira aba do arquivo
4. **Execute a macro**:
   - Pressione **ALT + F8**
   - Selecione **Importar_Clientes**
   - Clique em **Executar**
5. **Selecione seu arquivo** Excel com os dados de origem
6. **Aguarde o processamento** - a macro irá:
   - Ler seu arquivo
   - Mapear as colunas
   - Gerar o arquivo .txt
   - Salvar na sua Área de Trabalho (ou C:\Temp ou Documentos)
7. **Importe o arquivo .txt** gerado no sistema Ger Comercial

### 💡 Dicas Importantes

- **Seu arquivo pode ter colunas extras** - elas serão automaticamente ignoradas
- **A macro detecta colunas automaticamente** - não precisa renomear as colunas
- **Linhas vazias são puladas** automaticamente
- **O arquivo final terá encoding UTF-8** - preserva todos os acentos
- **Se houver erro**, verifique se:
  - As macros estão habilitadas
  - Seu arquivo tem pelo menos as colunas essenciais
  - Não há erros nos dados (campos muito longos, caracteres especiais inválidos, etc.)

### 🔧 Para Desenvolvedores

#### Regenerar o Template

Se precisar modificar o template, use os scripts Python fornecidos:

```bash
cd templates
python3 criar_template_excel.py
```

Isso irá:
- Criar um novo arquivo Excel com as abas de instruções e exemplo
- Gerar o arquivo .bas com o código VBA
- Criar um arquivo .xlsm base

#### Adicionar/Atualizar a Macro

Para adicionar ou atualizar a macro VBA no arquivo Excel:

1. **Automático (parcial)**:
   ```bash
   python3 adicionar_macro.py
   ```
   Isso prepara a estrutura do arquivo, mas a macro precisa ser importada manualmente.

2. **Manual (completo)**:
   - Abra o arquivo `template_importacao_clientes.xlsm` no Excel
   - Pressione **ALT + F11** para abrir o VBA Editor
   - Vá em **File > Import File**
   - Selecione o arquivo `Importar_Clientes.bas`
   - Salve o arquivo (Ctrl+S)

#### Estrutura de Arquivos

```
templates/
├── README.md (este arquivo)
├── criar_template_excel.py (script para criar o template)
├── adicionar_macro.py (script para preparar a estrutura VBA)
├── template_importacao_clientes.xlsm (template principal - COM MACRO)
├── template_importacao_clientes.xlsx (template sem macro - referência)
├── Importar_Clientes.bas (código VBA)
└── COMO_ADICIONAR_MACRO.txt (instruções detalhadas)
```

### 🔄 Integração com o Dashboard

O arquivo `dashboards/dashboard-gerenciar-usuarios.html` foi modificado para:

1. Detectar quando a tabela `tab_cliente` é selecionada
2. Alterar o texto do botão para **"📥 Baixar Template Excel com Macro"**
3. Servir o arquivo `.xlsm` em vez de gerar um CSV
4. Mostrar instruções de uso após o download

Código relevante em `dashboard-gerenciar-usuarios.html`:

```javascript
// Função: downloadTemplate()
if (this.selectedTable === 'tab_cliente') {
    const link = document.createElement('a');
    link.href = '../templates/template_importacao_clientes.xlsm';
    link.download = 'template_importacao_clientes.xlsm';
    link.click();
    // ... exibe instruções
}
```

### 📝 Notas Técnicas

- **Formato do arquivo de saída**: Texto delimitado por tabulação (TSV)
- **Encoding**: UTF-8 com BOM (compatível com todos os sistemas)
- **Tratamento de aspas**: Aspas duplas são substituídas por apóstrofos
- **Campos vazios**: Mantidos como strings vazias entre aspas
- **Compatibilidade**: Testado com Excel 2016+ (Windows) e Excel 365

### 🐛 Troubleshooting

**Problema**: Macro não aparece ao pressionar ALT + F8
- **Solução**: Verifique se o arquivo foi salvo como .xlsm e se as macros foram importadas

**Problema**: Excel bloqueia a macro por segurança
- **Solução**:
  - Arquivo > Opções > Central de Confiabilidade
  - Configurações da Central de Confiabilidade
  - Configurações de Macro
  - Selecione "Habilitar todas as macros" (apenas para desenvolvimento)

**Problema**: Erro "ADODB.Stream não disponível"
- **Solução**: Esse componente deve estar disponível no Windows. Se não estiver, contate o suporte de TI.

**Problema**: Arquivo gerado tem caracteres estranhos (�, ã, ç errados)
- **Solução**: O arquivo deveria estar em UTF-8. Verifique se o sistema está lendo como UTF-8.

### 📞 Suporte

Para dúvidas ou problemas:
1. Consulte o arquivo **COMO_ADICIONAR_MACRO.txt**
2. Verifique a aba de **instruções** dentro do template Excel
3. Entre em contato com a equipe de desenvolvimento

---

**Última atualização**: 2025-12-12
**Versão do template**: 1.0
**Compatibilidade**: Excel 2016+, Office 365
