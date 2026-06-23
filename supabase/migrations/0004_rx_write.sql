-- ════════════════════════════════════════════════════════════════
-- 메디코어 EMR · 처방 쓰기 권한
--
-- 노트(0003)와 동일 패턴 — 담당의(또는 nurse/admin)가 본인이 볼 수 있는
-- 환자에 한해 처방 추가. owns_patient() 헬퍼(0002) 재사용.
--
-- 적용 순서:  0001 → 0002 → 0003 → 0004 → seed
-- ════════════════════════════════════════════════════════════════

drop policy if exists rx_write on prescriptions;
create policy rx_write on prescriptions
  for insert to authenticated
  with check (owns_patient(patient_id));

grant insert on prescriptions to authenticated;
