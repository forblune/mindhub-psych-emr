-- ════════════════════════════════════════════════════════════════
-- 메디코어 EMR · 청구 · 수납 모듈
--
-- billings(청구) — 진찰료/약제비/검사료 + 보험유형 + 본인부담금 + 수납상태.
-- RLS 는 담당의(attending_id) 기준. 수납 처리(update)만 쓰기 허용.
-- billing_summary 집계 뷰(security_invoker → 역할별 RLS 집계).
--
-- 적용 순서:  0001 → … → 0014 → 0015 → seed
-- ════════════════════════════════════════════════════════════════

create table if not exists billings (
  id            uuid primary key default gen_random_uuid(),
  sort          int  not null default 0,
  patient_id    uuid not null references patients(id) on delete cascade,
  attending_id  uuid references doctors(id),
  visit_date    date not null default current_date,
  insurance     text not null,               -- 건강보험 / 의료급여 / 자비
  consult_fee   int  not null default 0,      -- 진찰료
  drug_fee      int  not null default 0,      -- 약제비
  test_fee      int  not null default 0,      -- 검사료
  copay         int  not null default 0,      -- 본인부담금
  status        text not null default '미수납',-- 미수납 / 수납완료
  paid_at       timestamptz
);

create index if not exists idx_billing_attending on billings(attending_id);

alter table billings enable row level security;

drop policy if exists billing_read on billings;
create policy billing_read on billings for select to authenticated
  using (app_role() in ('admin','nurse') or attending_id = app_doctor_id());

drop policy if exists billing_update on billings;
create policy billing_update on billings for update to authenticated
  using (app_role() in ('admin','nurse') or attending_id = app_doctor_id())
  with check (app_role() in ('admin','nurse') or attending_id = app_doctor_id());

grant select, update on billings to anon, authenticated;

-- ── 청구·수납 요약 뷰 ────────────────────────────────────────────
create or replace view billing_summary
with (security_invoker = true) as
select
  (select count(*) from billings)                                          as total,
  (select count(*) from billings where status = '수납완료')                as paid,
  (select count(*) from billings where status = '미수납')                  as unpaid,
  (select coalesce(sum(copay),0) from billings where status = '수납완료')  as paid_amount,
  (select coalesce(sum(copay),0) from billings where status = '미수납')    as outstanding;

grant select on billing_summary to anon, authenticated;
