-- ════════════════════════════════════════════════════════════════
-- 메디코어 EMR · 대시보드 KPI 집계 뷰
--
-- 큐레이션 `kpis` 테이블을 대체. 현재 스키마에서 실제 산출 가능한 지표를
-- 라이브로 집계한다.
--
-- ★ security_invoker = true → 조회하는 사용자의 RLS 가 base 테이블에 적용.
--   따라서 의사는 "본인 담당 환자" 기준, 간호사/관리자는 "전체" 기준으로 집계됨.
--   (appointments 는 전체 공용이라 예약 수는 역할 무관 동일)
--
-- 적용 순서:  0001 → … → 0008 → 0009 → seed
-- ════════════════════════════════════════════════════════════════

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
  (select count(*) from prescriptions where is_new)                      as new_rx;

grant select on dashboard_kpis to anon, authenticated;

-- 참고: 큐레이션 kpis 테이블은 이 뷰로 대체되어 더 이상 앱에서 사용하지 않음
-- (테이블/시드는 호환을 위해 남겨두되, getKpis() 는 dashboard_kpis 를 조회).
