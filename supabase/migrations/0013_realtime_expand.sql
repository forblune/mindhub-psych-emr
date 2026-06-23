-- ════════════════════════════════════════════════════════════════
-- 메디코어 EMR · Realtime 확장 (노트 / 처방 / 입원)
--
-- 0008(queue_entries)에 이어 clinical_notes·prescriptions·admissions 를
-- supabase_realtime publication 에 추가. 변경 수신은 각 테이블 RLS 로 필터됨.
-- (가드로 vanilla PG no-op, 멱등)
--
-- 적용 순서:  0001 → … → 0012 → 0013 → seed
-- ════════════════════════════════════════════════════════════════

do $$
declare t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['clinical_notes','prescriptions','admissions']
    loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table %I;', t);
      end if;
    end loop;
  end if;
end $$;
