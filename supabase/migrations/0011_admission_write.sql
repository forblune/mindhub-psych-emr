-- ════════════════════════════════════════════════════════════════
-- 메디코어 EMR · 입원 CRUD (입퇴원 등록·수정·삭제)
--
-- 입원 등록 시 담당의(attending_id)를 현재 사용자로 자동 설정하는 트리거 +
-- insert/update/delete RLS. 의사는 본인 담당 입원만, nurse/admin 은 전체.
--
-- 적용 순서:  0001 → … → 0010 → 0011 → seed
-- ════════════════════════════════════════════════════════════════

-- 입원 등록 시 attending_id 미지정이면 현재 사용자(의사)로 채움
create or replace function set_admission_attending()
returns trigger language plpgsql as $$
begin
  if new.attending_id is null then
    new.attending_id := app_doctor_id();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_admission_attending on admissions;
create trigger trg_admission_attending
  before insert on admissions
  for each row execute function set_admission_attending();

-- 쓰기 정책 (담당의 본인 또는 nurse/admin)
drop policy if exists adm_write on admissions;
create policy adm_write on admissions
  for insert to authenticated
  with check (app_role() in ('admin','nurse') or attending_id = app_doctor_id());

drop policy if exists adm_update on admissions;
create policy adm_update on admissions
  for update to authenticated
  using (app_role() in ('admin','nurse') or attending_id = app_doctor_id())
  with check (app_role() in ('admin','nurse') or attending_id = app_doctor_id());

drop policy if exists adm_delete on admissions;
create policy adm_delete on admissions
  for delete to authenticated
  using (app_role() in ('admin','nurse') or attending_id = app_doctor_id());

grant insert, update, delete on admissions to authenticated;
