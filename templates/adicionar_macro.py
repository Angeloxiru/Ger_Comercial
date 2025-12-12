#!/usr/bin/env python3
"""
Script para adicionar macro VBA ao arquivo Excel.
Arquivos .xlsm são arquivos ZIP com estrutura Office Open XML.
"""

import zipfile
import os
import shutil
from xml.etree import ElementTree as ET

def adicionar_macro_ao_xlsm():
    """Adiciona a macro VBA ao arquivo XLSM."""

    xlsm_file = 'template_importacao_clientes.xlsm'
    bas_file = 'Importar_Clientes.bas'

    # Lê o código VBA
    with open(bas_file, 'r', encoding='utf-8') as f:
        vba_code = f.read()

    # Remove "Attribute VB_Name" line for processing
    vba_lines = [line for line in vba_code.split('\n') if not line.startswith('Attribute')]
    vba_clean = '\n'.join(vba_lines)

    # Diretório temporário
    temp_dir = 'temp_xlsm'
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)

    # Descompacta o XLSM
    print(f"📦 Descompactando {xlsm_file}...")
    with zipfile.ZipFile(xlsm_file, 'r') as zip_ref:
        zip_ref.extractall(temp_dir)

    # Cria a estrutura VBA
    print("🔧 Criando estrutura VBA...")

    # Cria diretórios necessários
    xl_dir = os.path.join(temp_dir, 'xl')
    os.makedirs(xl_dir, exist_ok=True)

    # Atualiza [Content_Types].xml para incluir VBA
    content_types_path = os.path.join(temp_dir, '[Content_Types].xml')
    if os.path.exists(content_types_path):
        tree = ET.parse(content_types_path)
        root = tree.getroot()

        # Define namespace
        ns = {'ct': 'http://schemas.openxmlformats.org/package/2006/content-types'}
        ET.register_namespace('', ns['ct'])

        # Adiciona override para vbaProject.bin se não existir
        override_exists = False
        for override in root.findall('ct:Override', ns):
            if override.get('PartName') == '/xl/vbaProject.bin':
                override_exists = True
                break

        if not override_exists:
            override = ET.Element('{%s}Override' % ns['ct'])
            override.set('PartName', '/xl/vbaProject.bin')
            override.set('ContentType', 'application/vnd.ms-office.vbaProject')
            root.append(override)

            tree.write(content_types_path, encoding='UTF-8', xml_declaration=True)
            print("   ✓ [Content_Types].xml atualizado")

    # Atualiza xl/_rels/workbook.xml.rels para incluir relação com VBA
    rels_dir = os.path.join(xl_dir, '_rels')
    os.makedirs(rels_dir, exist_ok=True)
    workbook_rels_path = os.path.join(rels_dir, 'workbook.xml.rels')

    if os.path.exists(workbook_rels_path):
        tree = ET.parse(workbook_rels_path)
        root = tree.getroot()

        ns = {'r': 'http://schemas.openxmlformats.org/package/2006/relationships'}
        ET.register_namespace('', ns['r'])

        # Verifica se já existe relação com vbaProject
        vba_rel_exists = False
        for rel in root.findall('r:Relationship', ns):
            if rel.get('Target') == 'vbaProject.bin':
                vba_rel_exists = True
                break

        if not vba_rel_exists:
            # Encontra o próximo ID disponível
            max_id = 0
            for rel in root.findall('r:Relationship', ns):
                rel_id = rel.get('Id', 'rId0')
                try:
                    num = int(rel_id.replace('rId', ''))
                    max_id = max(max_id, num)
                except:
                    pass

            new_id = f'rId{max_id + 1}'

            rel = ET.Element('{%s}Relationship' % ns['r'])
            rel.set('Id', new_id)
            rel.set('Type', 'http://schemas.microsoft.com/office/2006/relationships/vbaProject')
            rel.set('Target', 'vbaProject.bin')
            root.append(rel)

            tree.write(workbook_rels_path, encoding='UTF-8', xml_declaration=True)
            print("   ✓ workbook.xml.rels atualizado")

    # NOTA: A criação do vbaProject.bin requer um compilador VBA
    # que não está facilmente disponível em Linux/Python
    print("\n⚠️  AVISO: Não é possível criar vbaProject.bin automaticamente em Linux")
    print("   Para finalizar, você precisará:")
    print("   1. Abrir o arquivo XLSM no Excel (Windows ou Mac)")
    print("   2. Pressionar ALT + F11 para abrir o VBA Editor")
    print("   3. Ir em File > Import File")
    print(f"   4. Selecionar o arquivo: {bas_file}")
    print("   5. Salvar o arquivo")

    # Cria arquivo de instruções
    with open('COMO_ADICIONAR_MACRO.txt', 'w', encoding='utf-8') as f:
        f.write("""
╔══════════════════════════════════════════════════════════════╗
║  INSTRUÇÕES PARA ADICIONAR A MACRO AO TEMPLATE EXCEL        ║
╚══════════════════════════════════════════════════════════════╝

🎯 OBJETIVO:
   Adicionar a macro VBA "Importar_Clientes" ao arquivo Excel
   para automatizar a conversão de planilhas de clientes.

📋 PASSOS:

1️⃣  ABRIR O ARQUIVO
   • Abra o arquivo: template_importacao_clientes.xlsm
   • Se aparecer aviso de segurança, clique em "Habilitar Conteúdo"

2️⃣  ABRIR O EDITOR VBA
   • Pressione: ALT + F11
   • Ou vá em: Desenvolvedor > Visual Basic

   ⚠️  Se não vir a aba "Desenvolvedor":
       • Arquivo > Opções > Personalizar Faixa de Opções
       • Marque a caixa "Desenvolvedor"
       • Clique OK

3️⃣  IMPORTAR A MACRO
   • No VBA Editor, vá em: File > Import File
   • Selecione o arquivo: Importar_Clientes.bas
   • Clique "Abrir"

4️⃣  VERIFICAR
   • Na janela "Project Explorer" (Ctrl+R se não estiver visível)
   • Você verá: VBAProject (template_importacao_clientes.xlsm)
   • Expandindo, verá: Modules > Module1
   • Dê duplo clique em Module1 para ver o código

5️⃣  SALVAR
   • Pressione Ctrl+S ou vá em File > Save
   • Feche o VBA Editor (ALT + Q)

6️⃣  TESTAR A MACRO
   • De volta ao Excel, pressione: ALT + F8
   • Selecione: Importar_Clientes
   • Clique "Executar" para testar (você precisará de um arquivo Excel de teste)

✅ PRONTO!
   Agora o arquivo template_importacao_clientes.xlsm está completo
   com as instruções E a macro incorporada.

   Os usuários só precisarão:
   1. Baixar o arquivo template
   2. Habilitar macros quando solicitado
   3. Pressionar ALT + F8 e executar "Importar_Clientes"

═══════════════════════════════════════════════════════════════

💡 DICAS:

• Configurações de Segurança:
  Se o Excel bloquear a macro:
  - Arquivo > Opções > Central de Confiabilidade
  - Configurações da Central de Confiabilidade
  - Configurações de Macro
  - Selecione "Habilitar todas as macros" (uso em desenvolvimento)

• Distribuição:
  Quando distribuir o arquivo para os usuários:
  - Certifique-se de que é um arquivo .xlsm (não .xlsx)
  - Instrua-os a "Habilitar Conteúdo" quando abrirem
  - As instruções de uso estão na primeira aba do arquivo

• Troubleshooting:
  Se a macro não aparecer:
  - Verifique se o arquivo foi salvo como .xlsm
  - Confirme que a macro foi importada (ALT+F11 > Modules)
  - Tente fechar e reabrir o Excel

═══════════════════════════════════════════════════════════════
""")

    print(f"\n📄 Arquivo de instruções criado: COMO_ADICIONAR_MACRO.txt")

    # Limpa diretório temporário
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)

    print("\n✅ Processo concluído!")
    print(f"📁 Arquivos prontos:")
    print(f"   • {xlsm_file} (template com instruções)")
    print(f"   • {bas_file} (código VBA)")
    print(f"   • COMO_ADICIONAR_MACRO.txt (guia completo)")

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    adicionar_macro_ao_xlsm()
