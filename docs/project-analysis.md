# 프로젝트 분석 — MindHub Care Suite (마음기록 × 메디코어 EMR)

> 정신과 케어 연속성 제품군의 두 축(환자측 MindHub · 의사측 Psych-EMR)에 대한 구조 분석·통합 설계·로드맵 문서.
> 작성 기준일 2026-06-24. 두 코드베이스의 실제 구조(테이블·RLS·RPC·seam)에 근거.
>
> ⚠️ 두 시스템은 **현재 한 DB로 연동돼 있지 않은 별개 데모**이며, 모든 데이터는 **가상 환자**다. "제품군"은 동일 설계 철학으로 묶인 비전이며, 통합은 제안이다. 진단·치료를 대신하지 않고, 실서비스 전환 전 의료법·개인정보보호 검토가 별도로 필요하다.

---

## 개요 — 두 축의 역할

| | **MindHub (마음기록)** | **Psych-EMR (메디코어)** |
|---|---|---|
| 위치 | 진료실 **밖** · 환자측 | 진료실 **안** · 의사측 |
| 한 줄 | 일상 AI 대화 → 임상 신호 추출 → 환자가 공유범위를 통제하는 **진료 전 요약** | 1인 정신과 의사용 **외래·입원 진료 EMR** |
| 스택 | HTML/JS 3파일 + Node/Express(Solar 프록시, Render) + Supabase | React 18 / Vite + Supabase(PostgREST·Realtime) |
| 데이터 생산자 | **환자**(자가보고, LLM 추출) | **의사**(임상 입력·평가) |
| 핵심 원칙 | 안전은 LLM 비의존 규칙 · 환자 자기결정권 · 비공개를 **DB에서 강제** | api.js seam+mock 폴백 · `attending_id` 단일 격리 · DSM-5→KCD 진단 분리 |
| 규제선 | 진단·치료 안 함, "기록·요약·전달" 도구 | 의사가 진단·처방·코딩의 **유일 주체** |

→ MindHub는 "진료 사이(between-visits)"의 맥락을, EMR은 "진료 안"의 기록·행위를 담당하는 상호보완 구조.

---

## 1. 현재 구조도 (As-Is — 두 시스템 분리)

### 1-1. MindHub (환자측)

```
┌──────────────────────── 프론트 (GitHub Pages / Cloudflare) ────────────────────────┐
│  index.html         app.html                         doctor.html                   │
│  무로그인 데모       환자 ChatGPT형 챗봇               의사 읽기전용 리포트          │
│  (자동 시나리오)     · 대화 스트리밍                   · 환자 목록→선택              │
│                      · 백그라운드 신호 추출            · Red Flag 트리아지           │
│                      · 규칙기반 위험감지(RISK_WORDS)   · 공유범위 적용 리포트        │
│                      · 진료 전 요약 5영역 + 공유토글                                 │
└───────────┬───────────────────────┬───────────────────────────┬────────────────────┘
            │ Bearer 토큰             │ supabase-js (anon key)     │
            ▼                         ▼                            ▼
   ┌─────────────────┐      ┌───────────────────────────────────────────────┐
   │ Render (Node)   │      │              Supabase                          │
   │ Solar 프록시     │      │  Auth(카카오 OAuth + 이메일)                    │
   │ /chat /extract  │      │  profiles(role patient|doctor, share_*)         │
   │ /adoption-consult│     │  entries(sleep_h·med_taken·mood·stressor·       │
   │ (UPSTAGE_API_KEY)│     │          red_flag·evidence)                     │
   └─────────────────┘      │  RPC get_patient_report_entries (consent 적용)  │
   안전감지는 프론트 규칙     │  RLS: 환자=본인행 / 의사=RPC로만                  │
   (네트워크 비의존)          └───────────────────────────────────────────────┘
```

### 1-2. Psych-EMR (의사측)

```
┌──────────────────── React/Vite 프론트 (GitHub Pages) ────────────────────┐
│  App.jsx (view 라우팅 + 전역 상태/핸들러)                                  │
│  ├ 진료 대시보드: 대기열 + 선택환자 패널[척도·검사·처방·노트·추이] + KPI    │
│  ├ 예약 · 입원/병동 · 통계 · 환자검색 · 청구·수납 · 약품·재고               │
│  └ DiagnosisPicker (DSM-5 → ICD-10/KCD)                                    │
│                                                                            │
│  src/data/api.js  ← 단일 seam: env 있으면 Supabase, 없으면 mock.js 폴백    │
└───────────────────────────────┬───────────────────────────────────────────┘
                                 │ @supabase/supabase-js
                                 ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │  Supabase (마이그레이션 0001~0020)                                    │
   │  Auth(GoTrue) + profiles(role doctor|nurse|admin, doctor_id)         │
   │  정규화 20테이블: patients·queue_entries·safety_assessments·          │
   │    rating_scales·trend_points·labs·prescriptions·clinical_notes·      │
   │    admissions·billings·medications·med_stock_logs·diagnoses …         │
   │  RLS 헬퍼(security definer): app_role / app_doctor_id / owns_patient  │
   │  격리: 의사=attending_id 본인환자 / nurse·admin=전체                   │
   │  집계 뷰(security_invoker): dashboard_kpis·ward_summary·billing·med   │
   │  Realtime: queue·notes·rx·admissions (postgres_changes)              │
   └────────────────────────────────────────────────────────────────────┘
```

### 1-3. 공통 골격 (통합을 자연스럽게 만드는 정렬)

```
두 시스템 모두 동일한 4요소를 이미 갖춤:
  Supabase Auth  +  profiles + role  +  RLS  +  "의사는 RPC/뷰로만 환자데이터 접근"
  ───────────────────────────────────────────────────────────────────────────
  MindHub: get_patient_report_entries RPC   ≈   Psych-EMR: owns_patient() + QUEUE_SELECT 임베딩
  (둘 다 "의사 브라우저에 원자료를 직접 노출하지 않는다"는 같은 사상)
```

---

## 2. MindHub → Psych-EMR 데이터 흐름도 (제안)

핵심: **테이블 병합이 아니라 "생산(MindHub) → 동의 다리 → consent RPC → 소비(EMR 읽기전용 탭)"** 파이프.

```
[1. 생성 · 환자측]
  환자가 app.html에서 대화
    ├─ isRisk(text)  규칙기반 동기 위험판정 (LLM/네트워크 비의존)
    ├─ /chat(Solar)  자연스러운 답변 (실패 시 mockReply 폴백)
    └─ collectSignals → /extract(Solar) 보정
         → entries insert (patient_id = auth.uid())
            · sleep_h · med_taken · mood · stressor · red_flag · evidence
            · 일반 대화 원문은 기기에만, text는 red_flag=true일 때만 클라우드
                          │
                          ▼
[2. 연결 · 환자 주도 동의]
  의사(EMR)가 환자 등록 → 1회용 연동코드 발급
  환자가 MindHub 설정에 코드 입력 → care_links(active)
     care_links: mh_user_id(uuid) ↔ emr_patient_id(uuid) ↔ doctor_id(스냅샷)
     "이 병원/의사에게 내 기록을 연결합니다" = consent 상위 게이트
                          │
                          ▼
[3. 소비 · 의사측 EMR]
  의사가 선택환자 패널 → [마음기록] 탭 → api.getMindLog(emr_patient_id)
     │
     ▼  ┌──────────────── get_mind_report() RPC [SECURITY DEFINER] ────────────────┐
        │ ① 담당의?   patients.attending_id == app_doctor_id()  (조회시점 동적)    │
        │ ② 연동?     care_links(active) → mh_user_id                              │
        │ ③ 공유범위? profiles.share_sleep/med/stressor/mood → 비공개 필드 제외     │
        │ ④ 안전?     red_flag/evidence 는 share 무관 ★연동범위 내 항상 포함        │
        │ ⑤ 원문?     전용 뷰(원문 text 미포함) 경유 → 물리적으로 미노출           │
        └────────────────────────────────────────────────────────────────────────┘
     │
     ▼  읽기전용 MindLogTab 렌더
        · mood/sleep 14일 스파크라인 (출처·축방향 라벨 분리)
        · 복약 순응도 % (전반적 자가보고로 라벨)
        · 스트레스원 빈도 (노트 자동입력 ✗, 복사용 제안)
        · 🔒 위험 신호 이력 (규칙기반·미검증·참고용 라벨)
     │
     ▼  의사가 보고 '판단' → 노트/처방/safety/청구는 직접 작성 (자동화 ✗)
```

### 2-1. Consent 우회 차단 (3중 방어)

| 우회 시도 | 차단 지점 |
|---|---|
| 의사가 entries 직접 SELECT | RLS: `patient_id = auth.uid()` 만 (의사 아님) ✗ |
| 의사가 RPC로 비공개 mood 요청 | RPC가 `share_mood=false` 면 SELECT에서 제외 ✗ |
| 연동 안 된 환자 조회 | `care_links(active)` 없음 → 빈 결과 ✗ |
| 프론트 숨김만 했나? | 아님 — DB(RPC/뷰)에서 미전송 ✓ |
| 일반 대화 원문 노출 | red_flag일 때만 저장 + 전용 뷰 미포함 ✓ |

### 2-2. 안전 vs 동의 경계 (가장 중요한 설계 결정)

```
연동(active) 환자  : red_flag 항상 포함 (안전 토글 못 끔, 온보딩 고지)  → EMR 의사에게 전달
미연동/철회 환자   : EMR으로 전달 ✗  → MindHub 자체 위기자원 카드(109·119·등록 병원)로만 안내
  └ "철회 시 위험신호도 의사에게 안 가고 앱 내 자원으로 안내됨"을 온보딩 동의문에 명시
```

---

## 3. 향후 아키텍처 (To-Be — 통합 목표)

**권장 통합 형태: 공유 Supabase 1개 + 두 프론트 유지.** 두 격리 모델이 데이터(entries/care_links)로만 결합 → 프론트는 거의 무수정.

```
                  ┌─────────────────── 단일 Supabase 프로젝트 ───────────────────┐
                  │  Auth (GoTrue · 카카오 + 이메일)                              │
                  │  단일 profiles  role ∈ {patient, doctor, nurse, admin}        │
                  │     + 환자 share_*  + 의료진 doctor_id/title                  │
                  │  RLS 헬퍼 통일: app_role / app_doctor_id / owns_patient        │
                  │     is_doctor() = app_role()='doctor' (MindHub 호환 래퍼)      │
                  │                                                               │
                  │  MindHub 데이터:  entries                                     │
                  │  EMR 데이터:      patients/queue/.../diagnoses (0001~0020)     │
                  │  ★ 다리:          care_links (mh_user_id ↔ emr_patient_id)     │
                  │  ★ consent 합성:  get_mind_report() RPC                        │
                  └──────────────┬─────────────────────────────┬──────────────────┘
                       anon key  │                  anon key   │
            ┌────────────────────┴───────┐     ┌───────────────┴────────────────────┐
            │ MindHub 프론트 (HTML/JS)    │     │ Psych-EMR (React/Vite)              │
            │ 환자 챗봇 · 환자 리포트      │     │ api.js seam + 신규 MindLogTab(읽기) │
            │ mindhub.forblune.com        │     │ GitHub Pages                        │
            └────────────────────────────┘     └─────────────────────────────────────┘
            Render: Solar 프록시 (/chat·/extract) — 변경 없음
```

### 3-1. 인증·RLS 통합 요약

| 항목 | 통합 방안 |
|---|---|
| role | 합집합 `patient · doctor · nurse · admin` |
| 헬퍼 | EMR 세트로 통일, `is_doctor()`는 래퍼로 호환 |
| profiles | 단일 테이블(역할별 컬럼 일부 사용) |
| 가입 트리거 | 기본 role **patient**(최소권한), 의료진은 **자가가입 금지**·admin 초대로만 |
| MindHub 데이터 접근 | `care_links(active)` + **담당의(attending_id)만** (nurse/admin 광역 제외) |

### 3-2. 통합 형태 옵션 비교

| 옵션 | 평가 |
|---|---|
| **A. 공유 Supabase + 두 프론트** | ⭐**권장** — 결합이 데이터뿐, 프론트 최소변경, 안전모델 최강 |
| B. 모노레포(프론트 통합) | 비권장 — HTML vs React 빌드 이질, 공유 이득 < 비용 |
| C. EMR이 MindHub 리포트 iframe 임베드 | 비권장 — consent를 프론트가 강제하게 되어 "DB 강제" 원칙 후퇴 |

---

## 4. 강점

### 4-1. 보안·프라이버시 설계 의식
- **데이터 경계를 UI가 아니라 DB에서 강제**: 보안 RPC(`get_patient_report_entries`), 컬럼 단위 GRANT, security-definer RLS 헬퍼(`owns_patient`/`is_doctor`). 환자가 비공개한 항목은 의사 브라우저로 **애초에 전송되지 않음**.
- **역할 상승 차단**: authenticated의 `profiles.role` UPDATE revoke, `share_*`만 컬럼 GRANT. 환자가 스스로 의사가 될 수 없음.
- **담당의별 환자 격리**를 `patients.attending_id` 한 곳에 고정 → 못 보는 환자의 종속 임상데이터(척도·검사·처방·노트)까지 `owns_patient()`로 일괄 차단. 서버측 before-insert 트리거가 `attending_id`를 강제(클라 신뢰 안 함).

### 4-2. 의료 도메인 규제·안전 판단력
- 진단·치료가 아닌 **"기록·요약·전달"로 스코프를 명확히 긋고** 의료기기 규제선을 회피.
- **위험 감지(자살/자해)는 LLM·네트워크에 절대 의존하지 않는 규칙 기반**으로 항상 동기 동작 — API가 죽어도 안전 기능 유지.
- 환자 자기결정권(공유 토글)과 "안전 항목만 항상 포함"의 트레이드오프를 온보딩 고지까지 포함해 설계.
- 진단을 **DSM-5(선택 UX) ↔ ICD-10=KCD-8(저장·청구 코드)로 분리**, KCD 분기점(양극성 II형 F31.8, ADHD F90.0, 불면 F51.0 등)을 데이터에 명시.

### 4-3. 풀스택 아키텍처 감각
- **교체 가능한 단일 seam**(`data/api.js`) + mock 폴백 → 백엔드 교체에도 컴포넌트 수정 0, 백엔드 없이도 CI/데모 동작.
- 정규화 스키마 + **PostgREST 중첩 임베딩 한 방 조회**로 N+1 회피.
- **도메인 이벤트 연쇄**: 처방 → 재고 자동차감 → 입·출고 감사로그, 진료 시작 → 청구 자동생성 → 예약 완료. 단순 CRUD를 넘어 시스템으로 사고.
- 환자측(HTML/Solar)과 의사측(React/PostgREST)을 **같은 Supabase 철학으로 역할 분리**.
- 다층 폴백("백엔드 없어도 데모 안 깨짐")을 양쪽 모두 일관되게 구현.

### 4-4. 검증 문화
- Psych-EMR: Playwright E2E ~40 spec(mock 모드), 로컬 PG16에서 RLS 격리 매트릭스 검증(의사A 6명 / 의사B 1명 / nurse·admin 7명 / 비로그인 0).
- MindHub: 프록시 안전장치(Origin 강제·레이트리밋·타임아웃·body 제한), consent 침투 시나리오 문서화.

---

## 5. 기술 부채

### 5-1. MindHub
| 항목 | 내용 |
|---|---|
| 환자↔의사 연결 미구현 | `care_links` 후보 언급만 — 현재 `is_doctor()`면 전 환자 목록 조회(격리 부재) |
| profiles 광역 노출 | 의사가 연동 없이 환자 명단·display_name·share 설정 열람 가능(명단 자체가 PHI) |
| 식별자 모델 | `entries.patient_id`가 **text에 uuid 저장** → 통합 시 캐스팅·1:N 무결성 위험 |
| consent 강제점 | 비공개 강제가 **단일 RPC 함수 본문**에 의존(RLS 안전망 없음) |
| PHI 정책 | 원문 최소저장·동의·보관기간·암호화는 문서상 TODO(운영 전 검토 필요) |

### 5-2. Psych-EMR
| 항목 | 내용 |
|---|---|
| anon 잔존 위험 | `0002` 미적용 시 `0001`의 데모용 anon 전체읽기 정책이 남음 |
| 호스팅 미검증 | 호스팅 GoTrue 이메일 인증·PostgREST 임베딩 실응답 shape·Realtime 수신은 로컬 검증 불가(검증은 PG16 한정) |
| 청구 insert RLS | 로컬 미검증(패턴만 `0011`과 동일) |
| 운영 기능 미구현 | 앱 수준 감사로그(약품 입출고만), MFA, 세션 정책, 백업·암호화, 전자의무기록 보존 요건 |
| 데모 단순화 | 예약→진료 시작 시 즉시 '완료' 처리, 예약 날짜 당일 고정, 환자검색은 오늘 큐+입원 범위만 |
| 진단 마스터 범위 | 대표 48종 큐레이션(전체 F-챕터 미망라) — 실제 청구 전 공식 KCD-8 재확인 권장 |

### 5-3. 통합 시 신규 부채(설계 적색선 — 통합의 선결 조건)
| 등급 | 결함 | 해소 방향 |
|---|---|---|
| 🔴 치명 | consent 강제가 RLS→RPC 함수로 격하 | 화이트리스트 마스킹 + 음성 회귀테스트 + 원문 미포함 전용 뷰 + `text는 red_flag일 때만` CHECK |
| 🔴 치명 | **red_flag "항상" ↔ 동의 게이트 충돌**(미연동/철회 위험신호 미정의) | 연동범위 내만 항상, 미연동/철회는 앱 위기카드로 + 온보딩 고지 |
| 🔴 치명 | 식별자 text↔uuid·1:N 무결성 | uuid 정규화 + active 계정당 1차트 partial unique |
| 🟠 높음 | 신뢰불가 메타(`raw_user_meta_data`)로 role 분기 → 가입만으로 의사 권한 | 기본 patient, 의료진 자가가입 금지(admin 초대) |
| 🟠 높음 | nurse/admin 광역 접근이 환자 동의 초과 | MindHub 데이터는 담당의만 |
| 🟠 높음 | profiles 광역 SELECT로 환자 명단 노출 | 담당 환자로 한정 |
| 🟡 중간 | 규칙기반 위음성 표기 / Realtime 우회 / attending 변경 미추종 / anon 잔존 / mood 축 방향 반대 | 라벨 명시 / publication 제외 / 동적 평가 / 제거 게이트 / 축 정규화 |

> **가장 근본적 부채**: 두 프로젝트가 공통으로 "운영 전 TODO"로 미뤄둔 항목(care_links 미구현 · 호스팅 미검증 · anon 잔존) 위에, 통합이 그것들을 해결했다고 전제하고 안전을 쌓을 위험. **통합은 이 TODO 해결을 선결 조건으로 삼아야 한다.**

---

## 6. 다음 개발 우선순위

| 순위 | 단계 | 작업 | 게이트/검증 |
|---|---|---|---|
| **P0** | 선행(규제) | 동의서·의료기관 검토·원문 최소화·암호화·보관기간·접근로그 정책 | 미완 시 가상데이터 범위 이탈 금지 |
| **P1** | 백엔드 단일화 | 공유 Supabase로 합치기: profiles 통합(role 4종), 헬퍼 통일, 동명 트리거 충돌 해소 | **0001 anon 정책 완전제거를 차단 게이트로** · 호스팅 Supabase에서 RLS/임베딩/Realtime 실검증 · mock 데모 무영향 확인 |
| **P2** | 식별 다리 + consent RPC | `care_links`(uuid·active 1:1) + 연동코드 플로우 + `get_mind_report()`(담당의만·share 합성·red_flag 연동범위 내 항상) | consent 침투 테스트(§2-1) · red_flag↔동의 충돌 케이스(§2-2) 회귀 |
| **P3** | EMR MindLogTab | 선택환자 패널 읽기전용 탭: mood/sleep 오버레이(출처·축방향 라벨) · 복약 순응도 % · 스트레스원 · 위험 이력 · triage 보조 배지(자동 진단/level/처방 변경 ✗) | `api.getMindLog` + mock 폴백 + Playwright spec · "환자 자가보고/비임상" 라벨 |
| **P4** | 각 프로젝트 부채 상환 | (EMR) 호스팅 RLS 실검증·청구 insert 검증·예약 날짜 선택·환자검색 patients 직접조회 / (MindHub) profiles 광역노출 폐기·식별자 uuid 정규화 | 단위·E2E 회귀 |
| **P5** | 의료진 인증 강화 | 초대코드/도메인 기반 역할 부여, MFA, 세션 정책, 앱 수준 감사로그 확대 | 운영 전환 전제 |

### 포트폴리오 서술 권장
> "두 시스템은 동일 설계 철학(Supabase·RLS·RPC 격리·mock 폴백)으로 만든 정신과 케어의 두 축이며, **현재는 연동 전 별개 데모**다. 다음 단계는 `care_links`로 MindHub의 일상 신호를 EMR 차트에 매핑하는 것" — 정직함과 확장성을 동시에 보여주는 프레이밍.

---

## 부록 — 참조

- 분석 대상: `forblune/psych-emr`(로컬, 활성), `forblune/mindhub-mvp`(분석용 클론)
- 근거 문서: psych-emr `README.md`/`DEVLOG.md`/`supabase/migrations/0001~0020`, mindhub `README.md`/`CLAUDE.md`/`SUPABASE_연동_설계.md`/`카카오로그인_역할분리_설계.md`/`프로젝트_가치와_근거.md`/`app.html`/`doctor.html`/`backend/server.js`
- 본 분석은 **읽기 전용**으로 수행됨 — 어떤 코드도 수정하지 않음.
