-- =====================================================
-- SCRIPT PARA INVESTIGAR E CORRIGIR O CAMPO HORA
-- Execute este script no Turso CLI para investigar o problema
-- =====================================================

-- 1. Ver o schema da tabela
SELECT '=== SCHEMA DA TABELA ===' as titulo;
SELECT sql FROM sqlite_master
WHERE type='table' AND name='agendamentos_relatorios';

-- 2. Ver todos os valores de hora com detalhes
SELECT '=== VALORES DE HORA NO BANCO ===' as titulo;
SELECT
    id,
    nome_agendamento,
    hora,
    typeof(hora) as tipo_hora,
    length(hora) as tamanho_hora,
    quote(hora) as hora_quoted,
    hex(hora) as hora_hex
FROM agendamentos_relatorios;

-- 3. Testar query com TRIM
SELECT '=== TESTE COM TRIM ===' as titulo;
SELECT id, nome_agendamento, hora, trim(hora) as hora_trimmed
FROM agendamentos_relatorios
WHERE trim(hora) = '18:00';

-- 4. Testar query com CAST
SELECT '=== TESTE COM CAST ===' as titulo;
SELECT id, nome_agendamento, hora, CAST(hora AS TEXT) as hora_text
FROM agendamentos_relatorios
WHERE CAST(hora AS TEXT) = '18:00';

-- 5. Testar query normal (essa está falhando)
SELECT '=== TESTE QUERY NORMAL (deveria funcionar) ===' as titulo;
SELECT id, nome_agendamento, hora
FROM agendamentos_relatorios
WHERE hora = '18:00';

-- =====================================================
-- SOLUÇÃO 1: Se o problema for ESPAÇOS
-- =====================================================
-- Descomente e execute se o teste com TRIM funcionou:
-- UPDATE agendamentos_relatorios SET hora = trim(hora);

-- =====================================================
-- SOLUÇÃO 2: Se o problema for TIPO DE DADOS
-- =====================================================
-- Se hora estiver como INTEGER ou REAL, precisamos recriar:
-- 1. Criar coluna temporária
-- ALTER TABLE agendamentos_relatorios ADD COLUMN hora_nova TEXT;
--
-- 2. Copiar valores convertendo para TEXT no formato HH:00
-- UPDATE agendamentos_relatorios
-- SET hora_nova = printf('%02d:00', CAST(hora AS INTEGER));
--
-- 3. Remover coluna antiga
-- ALTER TABLE agendamentos_relatorios DROP COLUMN hora;
--
-- 4. Renomear coluna nova
-- ALTER TABLE agendamentos_relatorios RENAME COLUMN hora_nova TO hora;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Após aplicar a solução, execute:
-- SELECT id, nome_agendamento, hora, typeof(hora) FROM agendamentos_relatorios;
-- SELECT id FROM agendamentos_relatorios WHERE hora = '18:00';  -- Deve retornar resultados
