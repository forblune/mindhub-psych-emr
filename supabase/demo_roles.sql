-- ════════════════════════════════════════════════════════════════
-- 메디코어 EMR · 역할 권한 시연 (호스팅 Supabase 용)
--
-- 목적: doctor / nurse / admin / 2번째 doctor 로 역할별 RLS 차이를 직접 확인.
--
-- ▶ 사전 준비 (앱에서 직접 가입)
--   로그인 화면에서 아래 4개 계정을 "가입하기"로 만든다(트리거가 각자 profile 자동 생성):
--     doctorA@medicore.kr / doctorB@medicore.kr / nurse@medicore.kr / admin@medicore.kr
--   (Authentication → Providers → Email 의 "Confirm email" 을 잠시 끄면 메일 인증 없이 바로 로그인)
--
-- ▶ 그런 다음 이 스크립트를 SQL Editor 에서 실행
-- ════════════════════════════════════════════════════════════════

-- 1) 두 번째 의사 등록
insert into doctors (name, title, ext_id, initial)
values ('이준호 과장', '정신건강의학과 전문의', '3300', '이')
on conflict do nothing;

-- 2) 역할/담당의 배정 (가입된 이메일 기준)
--    doctorA = 기본(서연우),  doctorB = 이준호,  nurse = 간호사,  admin = 관리자
update profiles set doctor_id = (select id from doctors where ext_id = '3300')
  where id = (select id from auth.users where email = 'doctorB@medicore.kr');

update profiles set role = 'nurse'
  where id = (select id from auth.users where email = 'nurse@medicore.kr');

update profiles set role = 'admin'
  where id = (select id from auth.users where email = 'admin@medicore.kr');

-- 3) 의사간 격리 시연용: 환자 1명(강하늘)을 이준호에게 재배정
update patients set attending_id = (select id from doctors where ext_id = '3300')
  where chart_no = '00781120';

-- ════════════════════════════════════════════════════════════════
-- 확인 방법 (앱에서 각 계정으로 로그인)
--   • doctorA  → 본인 담당 6명 (강하늘 제외)
--   • doctorB  → 강하늘 1명만
--   • nurse    → 7명 전체
--   • admin    → 7명 전체
--   • 비로그인 → 로그인 화면(데이터 접근 차단)
--
-- 쓰기: doctorA 가 강하늘에 노트 작성 시도 → 거부(담당 아님),
--       doctorB / nurse / admin → 작성 가능.
--
-- 되돌리기:
--   update patients set attending_id = (select id from doctors where ext_id='2208') where chart_no='00781120';
--   update profiles set role='doctor' where id in (select id from auth.users where email in ('nurse@medicore.kr','admin@medicore.kr'));
-- ════════════════════════════════════════════════════════════════
