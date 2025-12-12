Attribute VB_Name = "Module1"
Sub Importar_Clientes()
    On Error GoTo ErrorHandler

    Dim wbOrigem As Workbook
    Dim wsOrigem As Worksheet
    Dim wbNovo As Workbook
    Dim wsNovo As Worksheet
    Dim fd As FileDialog
    Dim caminhoArquivo As String
    Dim caminhoSalvar As String
    Dim dictColunas As Object
    Dim ultimaLinha As Long
    Dim chave As Variant
    Dim colEncontrada As Variant
    Dim colDestino As Long
    Dim dadosOrigem As Variant
    Dim i As Long
    Dim r As Long, c As Long
    Dim linhaFinal As Long
    Dim numCols As Long
    Dim arrTexto() As String
    Dim timestamp As String
    Dim textoFinal As String
    Dim stream As Object
    Dim fso As Object

    ' Otimização
    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual

    ' === Cria o mapeamento dos cabeçalhos ===
    Set dictColunas = CreateObject("Scripting.Dictionary")
    With dictColunas
        .Add "Cliente", "cliente"
        .Add "Nome", "nome"
        .Add "Fantasia", "fantasia"
        .Add "Inscr. Est.", "insc_est"
        .Add "CNPJ/CPF", "cnpj_cpf"
        .Add "Grupo", "grupo"
        .Add "Endereço", "endereco"
        .Add "CEP", "cep"
        .Add "Bairro", "bairro"
        .Add "Cidade", "cidade"
        .Add "Nome (Grupo)", "grupo_desc"
        .Add "Descr. (Rota)", "rota"
        .Add "Descrição (Situação)", "sit_cliente"
        .Add "Descrição (Sub Rota)", "sub_rota"
        .Add "Número Endereço", "num_endereco"
    End With

    ' === Seleciona o arquivo de origem ===
    Set fd = Application.FileDialog(msoFileDialogFilePicker)
    fd.Title = "Selecione o arquivo de origem"
    fd.Filters.Clear
    fd.Filters.Add "Arquivos do Excel", "*.xls; *.xlsx; *.xlsm"

    If fd.Show <> -1 Then
        MsgBox "Nenhum arquivo selecionado. Operação cancelada.", vbExclamation
        GoTo Cleanup
    End If

    caminhoArquivo = fd.SelectedItems(1)

    ' === Abre o arquivo de origem ===
    Set wbOrigem = Workbooks.Open(Filename:=caminhoArquivo, ReadOnly:=True)
    Set wsOrigem = wbOrigem.Sheets(1)

    ' === Valida se tem dados ===
    ultimaLinha = wsOrigem.Cells(wsOrigem.Rows.Count, 1).End(xlUp).Row
    If ultimaLinha < 3 Then
        MsgBox "Arquivo sem dados!", vbExclamation
        GoTo Cleanup
    End If

    ' === Cria novo workbook destino ===
    Set wbNovo = Workbooks.Add
    Set wsNovo = wbNovo.Sheets(1)

    ' === Cabeçalhos destino ===
    i = 1
    For Each chave In dictColunas.Keys
        wsNovo.Cells(1, i).Value = dictColunas(chave)
        i = i + 1
    Next chave

    ' === Copia dados (COMEÇA DA LINHA 3 - PULA LINHA VAZIA) ===
    For Each chave In dictColunas.Keys
        On Error Resume Next
        colEncontrada = Application.Match(chave, wsOrigem.Rows(1), 0)
        On Error GoTo ErrorHandler

        If Not IsError(colEncontrada) Then
            colDestino = Application.Match(dictColunas(chave), wsNovo.Rows(1), 0)

            ' Começa da linha 3 (pula linha 2 vazia)
            dadosOrigem = wsOrigem.Range(wsOrigem.Cells(3, colEncontrada), _
                                         wsOrigem.Cells(ultimaLinha, colEncontrada)).Value

            ' Destino começa na linha 2
            wsNovo.Range(wsNovo.Cells(2, colDestino), _
                        wsNovo.Cells(UBound(dadosOrigem, 1) + 1, colDestino)).Value = dadosOrigem
        End If
    Next chave

    wbOrigem.Close False
    Set wbOrigem = Nothing

    ' === Monta o conteúdo do arquivo texto ===
    linhaFinal = wsNovo.Cells(wsNovo.Rows.Count, 1).End(xlUp).Row
    numCols = wsNovo.Cells(1, wsNovo.Columns.Count).End(xlToLeft).Column

    ReDim arrTexto(1 To linhaFinal)

    For r = 1 To linhaFinal
        Dim linhaTexto As String
        linhaTexto = ""
        For c = 1 To numCols
            Dim valorCelula As String
            valorCelula = ""

            ' Garante conversão correta de valor para string
            If Not IsEmpty(wsNovo.Cells(r, c).Value) Then
                If IsNull(wsNovo.Cells(r, c).Value) Then
                    valorCelula = ""
                Else
                    valorCelula = CStr(wsNovo.Cells(r, c).Value)
                End If
            End If

            ' Substitui aspas por apóstrofo
            valorCelula = Replace(valorCelula, """", "'")

            linhaTexto = linhaTexto & """" & valorCelula & """"
            If c < numCols Then linhaTexto = linhaTexto & vbTab
        Next c
        arrTexto(r) = linhaTexto
    Next r

    wbNovo.Close False
    Set wbNovo = Nothing

    ' === Define caminho de salvamento ===
    timestamp = Format(Now, "yyyymmdd_hhnnss")
    Set fso = CreateObject("Scripting.FileSystemObject")

    ' Tenta Desktop primeiro
    caminhoSalvar = Environ("USERPROFILE") & "\Desktop\Clientes_" & timestamp & ".txt"

    ' === Salva com ADODB.Stream (UTF-8 CORRETO) ===
    On Error Resume Next
    Set stream = CreateObject("ADODB.Stream")

    If Err.Number <> 0 Then
        MsgBox "Erro ao criar ADODB.Stream. Verifique se está disponível.", vbCritical
        GoTo Cleanup
    End If

    On Error GoTo ErrorHandler

    stream.Type = 2  ' Texto
    stream.Charset = "UTF-8"
    stream.Open

    ' Junta todas as linhas
    textoFinal = Join(arrTexto, vbCrLf)
    stream.WriteText textoFinal

    ' Tenta salvar no Desktop
    On Error Resume Next
    stream.SaveToFile caminhoSalvar, 2  ' 2 = sobrescreve se existir

    ' Se falhou no Desktop, tenta C:\Temp
    If Err.Number <> 0 Then
        Err.Clear

        ' Cria C:\Temp se não existir
        If Not fso.FolderExists("C:\Temp") Then
            fso.CreateFolder "C:\Temp"
        End If

        caminhoSalvar = "C:\Temp\Clientes_" & timestamp & ".txt"
        stream.SaveToFile caminhoSalvar, 2

        ' Se ainda falhou, tenta Documentos
        If Err.Number <> 0 Then
            Err.Clear
            caminhoSalvar = Environ("USERPROFILE") & "\Documents\Clientes_" & timestamp & ".txt"
            stream.SaveToFile caminhoSalvar, 2
        End If
    End If

    On Error GoTo ErrorHandler

    stream.Close
    Set stream = Nothing
    Set fso = Nothing

    Application.ScreenUpdating = True
    Application.Calculation = xlCalculationAutomatic

    MsgBox "Arquivo criado e salvo com sucesso!" & vbCrLf & _
           "Local: " & caminhoSalvar, vbInformation
    Exit Sub

ErrorHandler:
    MsgBox "Erro: " & Err.Description & vbCrLf & _
           "Número do erro: " & Err.Number, vbCritical

Cleanup:
    Application.ScreenUpdating = True
    Application.Calculation = xlCalculationAutomatic
    On Error Resume Next
    If Not wbOrigem Is Nothing Then wbOrigem.Close False
    If Not wbNovo Is Nothing Then wbNovo.Close False
    If Not stream Is Nothing Then
        stream.Close
        Set stream = Nothing
    End If
    Set fso = Nothing
End Sub
