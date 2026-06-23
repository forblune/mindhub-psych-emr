-- ════════════════════════════════════════════════════════════════
-- 메디코어 EMR · 진단 마스터 (DSM-5 선택 → ICD-10/KCD 저장)
--
-- diagnoses — 임상가는 DSM-5 진단명으로 고르고, 저장값(code)은
-- ICD-10 = KCD-8(한국표준질병·사인분류) 코드. 환자/입원/청구의 dx 는
-- 그대로 이 code(text) 를 담는다(스키마 변경 없음 · 하위호환).
-- 병원 공용 참조 데이터 → 읽기는 모든 인증 사용자, 쓰기는 막음(시드 관리).
--
-- 적용 순서:  0001 → … → 0016 → 0017 → seed
-- ════════════════════════════════════════════════════════════════

create table if not exists diagnoses (
  code      text primary key,        -- ICD-10/KCD-8 코드 (dx 에 저장되는 값)
  dsm_name  text not null,           -- DSM-5 진단명(영문, 선택 UI 표시)
  ko_name   text not null,           -- KCD-8 한글 진단명
  dx_group  text not null,           -- 진단군(F-블록)
  sort      int  not null default 0,
  note      text not null default '' -- 특정자/중증도 · DSM↔KCD 코드 차이 메모
);

create index if not exists idx_dx_group on diagnoses(dx_group, sort);

-- ── RLS ──────────────────────────────────────────────────────────
-- 참조 마스터: 모든 인증 사용자 읽기, 앱에서의 쓰기는 허용하지 않음.
alter table diagnoses enable row level security;

drop policy if exists dx_read on diagnoses;
create policy dx_read on diagnoses for select to authenticated using (true);

grant select on diagnoses to anon, authenticated;
