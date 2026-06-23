// ─────────────────────────────────────────────────────────────
// 진단 마스터 — DSM-5 진단명으로 고르고, 저장값은 ICD-10(KCD) 코드.
//
//  • code   : 저장·청구에 쓰이는 ICD-10 코드 = KCD-8(한국표준질병·사인분류) 기준.
//  • dsm    : 임상가가 고르는 DSM-5(영문) 진단명.
//  • ko     : KCD-8 한글 진단명(통계청 고시 명칭).
//  • note   : 특정자/중증도 또는 DSM-5(ICD-10-CM)와 KCD가 갈리는 지점.
//
// 코드는 KCD-8 / koicd.kr·kcdcode.kr 기준으로 확인함. ⚠ DSM-5 진단은 흔히
// 특정자(중증도·정신병적 동반 등)에 따라 여러 코드로 갈리므로, 대표 코드만
// 수록한 큐레이션 셋이다. 실제 청구 전 공식 KCD-8 코드북으로 재확인 권장.
// ─────────────────────────────────────────────────────────────

export const DX_GROUPS = [
  '물질 사용 (F10–F19)',
  '조현병 스펙트럼 (F20–F29)',
  '기분장애 (F30–F39)',
  '불안·강박·스트레스 (F40–F48)',
  '섭식·수면 (F50–F59)',
  '인격장애 (F60–F69)',
  '신경발달 (F80–F98)',
]

export const diagnoses = [
  // ── 물질 사용 ──
  { code: 'F10.2', dsm: 'Alcohol use disorder (moderate–severe)', ko: '알코올 사용에 의한 의존증후군', group: '물질 사용 (F10–F19)', note: 'DSM-5 알코올사용장애 중등도 이상 ≈ 의존(F10.2); 경도는 F10.1' },

  // ── 조현병 스펙트럼 ──
  { code: 'F20.0', dsm: 'Schizophrenia (paranoid type)', ko: '편집조현병', group: '조현병 스펙트럼 (F20–F29)', note: 'DSM-5는 아형 폐지 → KCD-8은 아형 유지; 미특정 시 F20.9' },
  { code: 'F20.9', dsm: 'Schizophrenia, unspecified', ko: '상세불명의 조현병', group: '조현병 스펙트럼 (F20–F29)', note: 'DSM-5 조현병의 기본 매핑(아형 미지정)' },
  { code: 'F22.0', dsm: 'Delusional disorder', ko: '망상장애', group: '조현병 스펙트럼 (F20–F29)', note: '' },
  { code: 'F25.0', dsm: 'Schizoaffective disorder, bipolar type', ko: '조현정동장애, 조증형', group: '조현병 스펙트럼 (F20–F29)', note: '' },
  { code: 'F25.1', dsm: 'Schizoaffective disorder, depressive type', ko: '조현정동장애, 우울형', group: '조현병 스펙트럼 (F20–F29)', note: '' },

  // ── 기분장애 ──
  { code: 'F31.1', dsm: 'Bipolar I disorder, current episode manic', ko: '양극성 정동장애, 정신병적 증상이 없는 조증', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F31.2', dsm: 'Bipolar I disorder, manic with psychotic features', ko: '양극성 정동장애, 정신병적 증상이 있는 조증', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F31.8', dsm: 'Bipolar II disorder', ko: '기타 양극성 정동장애', group: '기분장애 (F30–F39)', note: 'KCD-8은 II형을 F31.8에 포함; ICD-10-CM/DSM-5-TR은 F31.81' },
  { code: 'F32.1', dsm: 'Major depressive disorder, single episode, moderate', ko: '중등도 우울에피소드', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F32.2', dsm: 'MDD, single episode, severe without psychotic features', ko: '정신병적 증상이 없는 중증의 우울에피소드', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F32.3', dsm: 'MDD, single episode, severe with psychotic features', ko: '정신병적 증상이 있는 중증의 우울에피소드', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F33.1', dsm: 'MDD, recurrent, moderate', ko: '재발성 우울장애, 현존 중등도', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F33.2', dsm: 'MDD, recurrent, severe without psychotic features', ko: '재발성 우울장애, 정신병적 증상이 없는 중증', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F34.1', dsm: 'Persistent depressive disorder (dysthymia)', ko: '기분저하증', group: '기분장애 (F30–F39)', note: '' },

  // ── 불안·강박·스트레스 ──
  { code: 'F40.1', dsm: 'Social anxiety disorder (social phobia)', ko: '사회공포증', group: '불안·강박·스트레스 (F40–F48)', note: '' },
  { code: 'F41.0', dsm: 'Panic disorder', ko: '공황장애', group: '불안·강박·스트레스 (F40–F48)', note: '' },
  { code: 'F41.1', dsm: 'Generalized anxiety disorder', ko: '범불안장애', group: '불안·강박·스트레스 (F40–F48)', note: '' },
  { code: 'F42.2', dsm: 'Obsessive-compulsive disorder', ko: '강박장애, 혼합형', group: '불안·강박·스트레스 (F40–F48)', note: 'KCD F42 하위(.0 사고/.1 행위/.2 혼합); DSM-5-TR OCD=F42.2' },
  { code: 'F43.1', dsm: 'Posttraumatic stress disorder (PTSD)', ko: '외상후 스트레스장애', group: '불안·강박·스트레스 (F40–F48)', note: '' },
  { code: 'F43.2', dsm: 'Adjustment disorder', ko: '적응장애', group: '불안·강박·스트레스 (F40–F48)', note: '' },

  // ── 섭식·수면 ──
  { code: 'F50.0', dsm: 'Anorexia nervosa', ko: '신경성 식욕부진증', group: '섭식·수면 (F50–F59)', note: 'DSM-5-TR은 아형 분리(제한형 F50.01/폭식-제거형 F50.02)' },
  { code: 'F50.2', dsm: 'Bulimia nervosa', ko: '신경성 폭식증', group: '섭식·수면 (F50–F59)', note: '' },
  { code: 'F51.0', dsm: 'Insomnia disorder', ko: '비기질성 불면증', group: '섭식·수면 (F50–F59)', note: 'KCD는 F51.0; DSM-5-TR 불면장애는 F51.01' },

  // ── 인격장애 ──
  { code: 'F60.2', dsm: 'Antisocial personality disorder', ko: '비사회성 인격장애', group: '인격장애 (F60–F69)', note: '' },
  { code: 'F60.3', dsm: 'Borderline personality disorder', ko: '정서불안정성 인격장애(경계성)', group: '인격장애 (F60–F69)', note: 'KCD 정서불안정성 인격장애 경계성형(F60.31)' },

  // ── 신경발달 ──
  { code: 'F90.0', dsm: 'Attention-deficit/hyperactivity disorder', ko: '활동성 및 주의력 장애', group: '신경발달 (F80–F98)', note: 'KCD는 F90.0; ICD-10-CM 복합형은 F90.2' },
  { code: 'F84.0', dsm: 'Autism spectrum disorder', ko: '소아기 자폐증', group: '신경발달 (F80–F98)', note: 'DSM-5는 ASD로 통합; KCD는 F84.0(소아자폐)/F84.5(아스퍼거) 등 세분' },
]
