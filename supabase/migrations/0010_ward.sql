-- ════════════════════════════════════════════════════════════════
-- 메디코어 EMR · 입원 · 병동 모듈
--
-- wards(병동) + admissions(입원). 정신과 특화: 입원유형(자의/보호/행정),
-- 격리·관찰 상태, 중증도(acuity). RLS 는 입원 담당의(attending_id) 기준.
-- ward_summary 집계 뷰 + dashboard_kpis 에 '담당 입원' 추가(security_invoker).
--
-- 적용 순서:  0001 → … → 0009 → 0010 → seed
-- ════════════════════════════════════════════════════════════════

create table if not exists wards (
  id          uuid primary key default gen_random_uuid(),
  sort        int  not null default 0,
  code        text not null unique,
  name        text not null,
  total_beds  int  not null
);

create table if not exists admissions (
  id            uuid primary key default gen_random_uuid(),
  sort          int  not null default 0,
  ward_id       uuid not null references wards(id) on delete cascade,
  attending_id  uuid references doctors(id),
  patient_name  text not null,
  sex           text not null,
  age           int  not null,
  chart_no      text not null,
  room          text not null,
  bed           text not null,
  legal_status  text not null,              -- 자의입원 / 보호입원 / 행정입원
  status        text not null,              -- 입원중 / 격리 / 관찰 / 퇴원예정
  dx            text not null,              -- 주상병 F코드
  admitted_on   text not null,              -- 입원일 'YYYY-MM-DD'
  day_no        int  not null,              -- 입원 N일차
  acuity        text not null default '일반', -- 일반 / 주의 / 중증
  memo          text not null default ''
);

create index if not exists idx_adm_ward on admissions(ward_id, sort);
create index if not exists idx_adm_attending on admissions(attending_id);

-- ── RLS ──────────────────────────────────────────────────────────
alter table wards enable row level security;
alter table admissions enable row level security;

drop policy if exists wards_read on wards;
create policy wards_read on wards for select to authenticated using (true);

drop policy if exists adm_read on admissions;
create policy adm_read on admissions for select to authenticated
  using (app_role() in ('admin','nurse') or attending_id = app_doctor_id());

grant select on wards, admissions to anon, authenticated;

-- ── 병동 요약 뷰 (security_invoker → 보이는 입원만 집계) ──────────
create or replace view ward_summary
with (security_invoker = true) as
select
  (select coalesce(sum(total_beds),0) from wards)                  as total_beds,
  (select count(*) from admissions)                                as occupied,
  (select count(*) from admissions where status = '격리')          as isolation,
  (select count(*) from admissions where status = '관찰')          as observation,
  (select count(*) from admissions where status = '퇴원예정')      as discharge_planned,
  (select count(*) from admissions where acuity = '중증')          as acute;

grant select on ward_summary to anon, authenticated;

-- ── 대시보드 KPI 에 '담당 입원' 추가 (기존 8 + admitted) ──────────
create or replace view dashboard_kpis
with (security_invoker = true) as
select
  (select count(*) from appointments)                                   as appt_total,
  (select count(*) from appointments where badge_cls = 'b-done')         as appt_done,
  (select count(*) from queue_entries where status in ('대기','신규','위기')) as waiting,
  (select count(*) from queue_entries where status = '상담중')           as in_consult,
  (select count(*) from queue_entries)                                   as visits_today,
  (select count(*) from queue_entries where risk = 'hi')                 as high_risk,
  (select count(*) from queue_entries where risk = 'md')                 as mid_risk,
  (select count(*) from prescriptions where is_new)                      as new_rx,
  (select count(*) from admissions)                                      as admitted;
