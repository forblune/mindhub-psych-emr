-- ════════════════════════════════════════════════════════════════
-- 메디코어 EMR · Realtime (대기열 자동 갱신)
--
-- queue_entries 를 Supabase Realtime publication 에 추가해
-- INSERT/UPDATE/DELETE 변경을 클라이언트가 구독할 수 있게 한다.
-- 변경 수신은 RLS(clinical_read = owns_patient)로 필터되므로
-- 담당의는 본인 환자의 대기열 변경만 받는다.
--
-- supabase_realtime publication 은 Supabase 가 미리 만들어 둔다.
-- (vanilla Postgres 에는 없으므로 가드로 안전하게 no-op 처리)
--
-- 적용 순서:  0001 → … → 0007 → 0008 → seed
-- ════════════════════════════════════════════════════════════════

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'queue_entries'
     )
  then
    alter publication supabase_realtime add table queue_entries;
  end if;
end $$;
