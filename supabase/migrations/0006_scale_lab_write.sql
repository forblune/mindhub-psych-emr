-- ════════════════════════════════════════════════════════════════
-- 메디코어 EMR · 평가척도 / 검사 입력·삭제 권한
--
-- 노트·처방(0003~0005)과 동일하게 owns_patient() 로 담당의 본인 환자에
-- 한해 insert / delete 허용. (update 는 추후 필요 시 동일 패턴으로 추가)
--
-- 적용 순서:  0001 → 0002 → 0003 → 0004 → 0005 → 0006 → seed
-- ════════════════════════════════════════════════════════════════

-- 평가척도
drop policy if exists scales_write on rating_scales;
create policy scales_write on rating_scales
  for insert to authenticated
  with check (owns_patient(patient_id));

drop policy if exists scales_delete on rating_scales;
create policy scales_delete on rating_scales
  for delete to authenticated
  using (owns_patient(patient_id));

grant insert, delete on rating_scales to authenticated;

-- 검사
drop policy if exists labs_write on labs;
create policy labs_write on labs
  for insert to authenticated
  with check (owns_patient(patient_id));

drop policy if exists labs_delete on labs;
create policy labs_delete on labs
  for delete to authenticated
  using (owns_patient(patient_id));

grant insert, delete on labs to authenticated;
