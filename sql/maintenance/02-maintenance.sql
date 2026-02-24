-- =====================================================
-- SCRIPT DE MANUTENÇÃO MENSAL
-- =====================================================
--
-- Execute este script 1x por mês para manter o banco
-- otimizado e funcionando rapidamente.
--
-- TEMPO DE EXECUÇÃO: ~30 segundos
-- FREQUÊNCIA: Mensal
-- =====================================================

-- =====================================================
-- 1. ATUALIZAR ESTATÍSTICAS (NÃO SUPORTADO NO TURSO)
-- =====================================================
-- O Turso/libSQL NÃO suporta o comando ANALYZE.
-- Os índices funcionam automaticamente sem necessidade
-- de ANALYZE — o query planner do Turso escolhe os
-- índices corretos baseado na estrutura das queries.
--
-- ANALYZE;  -- NÃO EXECUTAR NO TURSO

-- =====================================================
-- 2. REORGANIZAR E COMPACTAR O BANCO (VACUUM)
-- =====================================================
-- O VACUUM:
-- - Remove espaço desperdiçado
-- - Reorganiza dados para acesso mais rápido
-- - Pode reduzir tamanho do banco em 10-30%
--
-- ATENÇÃO:
-- - Pode demorar alguns minutos em bancos grandes
-- - Cria uma cópia temporária (precisa espaço em disco)

-- VACUUM;

-- ⚠️ DESCOMENTE A LINHA ACIMA SE:
-- - Seu banco cresceu muito (>100MB)
-- - Você deletou muitos dados recentemente
-- - Queries estão lentas mesmo com índices

-- =====================================================
-- 3. VERIFICAR INTEGRIDADE DO BANCO
-- =====================================================
-- Verifica se há corrupção nos dados

PRAGMA integrity_check;

-- Se retornar "ok" = tudo certo! ✅
-- Se retornar erros = problema no banco, backup urgente! ⚠️

-- =====================================================
-- 4. VERIFICAR TAMANHO DOS ÍNDICES
-- =====================================================
-- Mostra quanto espaço cada índice está ocupando

-- Para ver estatísticas de espaço:
PRAGMA page_count;
PRAGMA page_size;

-- Cálculo: page_count * page_size = tamanho total do banco

-- =====================================================
-- 5. REMOVER ÍNDICES NÃO UTILIZADOS (Opcional)
-- =====================================================
-- Se você criou índices que não estão sendo usados,
-- pode removê-los para economizar espaço.

-- Para ver quais índices existem:
-- SELECT name, tbl_name
-- FROM sqlite_master
-- WHERE type = 'index'
-- AND name LIKE 'idx_%';

-- Para remover um índice específico:
-- DROP INDEX IF EXISTS nome_do_indice;

-- =====================================================
-- 6. ESTATÍSTICAS DE USO (Opcional)
-- =====================================================
-- Ver quantos registros existem em cada tabela

SELECT 'vendas' as tabela, COUNT(*) as total FROM vendas
UNION ALL
SELECT 'tab_cliente', COUNT(*) FROM tab_cliente
UNION ALL
SELECT 'tab_produto', COUNT(*) FROM tab_produto
UNION ALL
SELECT 'tab_representante', COUNT(*) FROM tab_representante;

-- =====================================================
-- FIM DO SCRIPT DE MANUTENÇÃO
-- =====================================================

-- 📅 CALENDÁRIO DE MANUTENÇÃO RECOMENDADO:
--
-- SEMANALMENTE:
-- - Nenhuma ação necessária (índices se mantém automaticamente)
--
-- MENSALMENTE:
-- - Executar ANALYZE (sempre)
-- - Verificar PRAGMA integrity_check
-- - Ver estatísticas de uso
--
-- TRIMESTRALMENTE:
-- - Executar VACUUM (se banco > 100MB)
-- - Revisar índices não utilizados
--
-- ANUALMENTE:
-- - Backup completo do banco
-- - Revisar estrutura de índices baseado em novos dashboards
