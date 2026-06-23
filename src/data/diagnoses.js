// ─────────────────────────────────────────────────────────────
// 진단 마스터 — DSM-5 진단명으로 고르고, 저장값은 ICD-10(KCD) 코드.
//
//  • code   : 저장·청구에 쓰이는 ICD-10 코드 = KCD-8(한국표준질병·사인분류) 기준.
//  • dsm    : 임상가가 고르는 DSM-5(영문) 진단명.
//  • ko     : KCD-8 한글 진단명(통계청 고시 명칭).
//  • note   : 특정자/중증도 또는 DSM-5(ICD-10-CM)와 KCD가 갈리는 지점.
//
// 코드는 KCD-8 / koicd.kr·kcdcode.kr 기준으로 확인함. 흔한 진단은 중증도·정신병적
// 동반·아형 특정자에 따라 여러 코드로 갈리므로(우울·양극성·조현병·강박·알코올 등)
// 그 다중 코드를 함께 수록. 그래도 전체 F-챕터를 망라하진 않으므로, 실제 청구
// 전에는 공식 KCD-8 코드북으로 재확인 권장.
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
  { code: 'F10.1', dsm: 'Alcohol use disorder, mild (harmful use)', ko: '알코올의 유해한 사용', group: '물질 사용 (F10–F19)', note: 'DSM-5 경도 알코올사용장애 ≈ 유해한 사용(F10.1)' },
  { code: 'F10.2', dsm: 'Alcohol use disorder (moderate–severe)', ko: '알코올 사용에 의한 의존증후군', group: '물질 사용 (F10–F19)', note: 'DSM-5 중등도 이상 ≈ 의존(F10.2)' },

  // ── 조현병 스펙트럼 ──  (DSM-5는 아형 폐지 → KCD-8은 아형 유지)
  { code: 'F20.0', dsm: 'Schizophrenia, paranoid type', ko: '편집조현병', group: '조현병 스펙트럼 (F20–F29)', note: 'DSM-5는 아형 폐지 → 미특정 시 F20.9' },
  { code: 'F20.1', dsm: 'Schizophrenia, disorganized (hebephrenic) type', ko: '파과형조현병', group: '조현병 스펙트럼 (F20–F29)', note: '' },
  { code: 'F20.2', dsm: 'Schizophrenia, catatonic type', ko: '긴장성 조현병', group: '조현병 스펙트럼 (F20–F29)', note: '' },
  { code: 'F20.3', dsm: 'Schizophrenia, undifferentiated type', ko: '미분화조현병', group: '조현병 스펙트럼 (F20–F29)', note: '' },
  { code: 'F20.5', dsm: 'Schizophrenia, residual type', ko: '잔류조현병', group: '조현병 스펙트럼 (F20–F29)', note: '' },
  { code: 'F20.9', dsm: 'Schizophrenia, unspecified', ko: '상세불명의 조현병', group: '조현병 스펙트럼 (F20–F29)', note: 'DSM-5 조현병의 기본 매핑(아형 미지정)' },
  { code: 'F22.0', dsm: 'Delusional disorder', ko: '망상장애', group: '조현병 스펙트럼 (F20–F29)', note: '' },
  { code: 'F25.0', dsm: 'Schizoaffective disorder, bipolar type', ko: '조현정동장애, 조증형', group: '조현병 스펙트럼 (F20–F29)', note: '' },
  { code: 'F25.1', dsm: 'Schizoaffective disorder, depressive type', ko: '조현정동장애, 우울형', group: '조현병 스펙트럼 (F20–F29)', note: '' },

  // ── 기분장애 ──
  { code: 'F31.1', dsm: 'Bipolar I disorder, current episode manic', ko: '양극성 정동장애, 정신병적 증상이 없는 조증', group: '기분장애 (F30–F39)', note: '조증: F31.1 정신병− · F31.2 정신병+' },
  { code: 'F31.2', dsm: 'Bipolar I disorder, manic with psychotic features', ko: '양극성 정동장애, 정신병적 증상이 있는 조증', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F31.3', dsm: 'Bipolar I disorder, current episode mild–moderate depression', ko: '양극성 정동장애, 현존 경증 또는 중등도의 우울증', group: '기분장애 (F30–F39)', note: '양극성 우울: F31.3 경/중등도 · F31.4 중증(정신병−) · F31.5 중증(정신병+)' },
  { code: 'F31.4', dsm: 'Bipolar I disorder, current severe depression without psychotic features', ko: '양극성 정동장애, 현존 정신병적 증상이 없는 심한 우울증', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F31.5', dsm: 'Bipolar I disorder, current severe depression with psychotic features', ko: '양극성 정동장애, 현존 정신병적 증상이 있는 심한 우울증', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F31.8', dsm: 'Bipolar II disorder', ko: '기타 양극성 정동장애', group: '기분장애 (F30–F39)', note: 'KCD-8은 II형을 F31.8에 포함; ICD-10-CM/DSM-5-TR은 F31.81' },
  { code: 'F32.0', dsm: 'Major depressive disorder, single episode, mild', ko: '경도 우울에피소드', group: '기분장애 (F30–F39)', note: '단일삽화 중증도: F32.0 경도 · .1 중등도 · .2 중증(정신병−) · .3 중증(정신병+)' },
  { code: 'F32.1', dsm: 'MDD, single episode, moderate', ko: '중등도 우울에피소드', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F32.2', dsm: 'MDD, single episode, severe without psychotic features', ko: '정신병적 증상이 없는 중증의 우울에피소드', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F32.3', dsm: 'MDD, single episode, severe with psychotic features', ko: '정신병적 증상이 있는 중증의 우울에피소드', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F33.0', dsm: 'MDD, recurrent, mild', ko: '재발성 우울장애, 현존 경도', group: '기분장애 (F30–F39)', note: '재발성 중증도: F33.0 경도 · .1 중등도 · .2 중증(정신병−) · .3 중증(정신병+)' },
  { code: 'F33.1', dsm: 'MDD, recurrent, moderate', ko: '재발성 우울장애, 현존 중등도', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F33.2', dsm: 'MDD, recurrent, severe without psychotic features', ko: '재발성 우울장애, 정신병적 증상이 없는 중증', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F33.3', dsm: 'MDD, recurrent, severe with psychotic features', ko: '재발성 우울장애, 정신병적 증상이 있는 중증', group: '기분장애 (F30–F39)', note: '' },
  { code: 'F34.1', dsm: 'Persistent depressive disorder (dysthymia)', ko: '기분저하증', group: '기분장애 (F30–F39)', note: '' },

  // ── 불안·강박·스트레스 ──
  { code: 'F40.0', dsm: 'Agoraphobia', ko: '광장공포증', group: '불안·강박·스트레스 (F40–F48)', note: '' },
  { code: 'F40.1', dsm: 'Social anxiety disorder (social phobia)', ko: '사회공포증', group: '불안·강박·스트레스 (F40–F48)', note: '' },
  { code: 'F40.2', dsm: 'Specific (isolated) phobia', ko: '특정(고립)공포증', group: '불안·강박·스트레스 (F40–F48)', note: '' },
  { code: 'F41.0', dsm: 'Panic disorder', ko: '공황장애', group: '불안·강박·스트레스 (F40–F48)', note: '' },
  { code: 'F41.1', dsm: 'Generalized anxiety disorder', ko: '범불안장애', group: '불안·강박·스트레스 (F40–F48)', note: '' },
  { code: 'F41.2', dsm: 'Mixed anxiety and depressive disorder', ko: '혼합형 불안 및 우울장애', group: '불안·강박·스트레스 (F40–F48)', note: '' },
  { code: 'F42.0', dsm: 'OCD, predominantly obsessional thoughts', ko: '강박장애, 강박성 사고 또는 되새김 우세', group: '불안·강박·스트레스 (F40–F48)', note: 'KCD F42 하위: .0 사고 · .1 행위 · .2 혼합' },
  { code: 'F42.1', dsm: 'OCD, predominantly compulsive acts', ko: '강박장애, 현저한 강박행위 우세', group: '불안·강박·스트레스 (F40–F48)', note: '' },
  { code: 'F42.2', dsm: 'Obsessive-compulsive disorder, mixed', ko: '강박장애, 혼합형', group: '불안·강박·스트레스 (F40–F48)', note: 'DSM-5-TR OCD 기본 코드 = F42.2' },
  { code: 'F43.0', dsm: 'Acute stress reaction', ko: '급성 스트레스반응', group: '불안·강박·스트레스 (F40–F48)', note: '' },
  { code: 'F43.1', dsm: 'Posttraumatic stress disorder (PTSD)', ko: '외상후 스트레스장애', group: '불안·강박·스트레스 (F40–F48)', note: '' },
  { code: 'F43.2', dsm: 'Adjustment disorder', ko: '적응장애', group: '불안·강박·스트레스 (F40–F48)', note: '' },

  // ── 섭식·수면 ──
  { code: 'F50.0', dsm: 'Anorexia nervosa', ko: '신경성 식욕부진증', group: '섭식·수면 (F50–F59)', note: 'DSM-5-TR은 아형 분리(제한형 F50.01/폭식-제거형 F50.02)' },
  { code: 'F50.2', dsm: 'Bulimia nervosa', ko: '신경성 폭식증', group: '섭식·수면 (F50–F59)', note: '' },
  { code: 'F51.0', dsm: 'Insomnia disorder', ko: '비기질성 불면증', group: '섭식·수면 (F50–F59)', note: 'KCD는 F51.0; DSM-5-TR 불면장애는 F51.01' },

  // ── 인격장애 ──
  { code: 'F60.0', dsm: 'Paranoid personality disorder', ko: '편집성 인격장애', group: '인격장애 (F60–F69)', note: '' },
  { code: 'F60.1', dsm: 'Schizoid personality disorder', ko: '분열성 인격장애', group: '인격장애 (F60–F69)', note: '' },
  { code: 'F60.2', dsm: 'Antisocial personality disorder', ko: '비사회성 인격장애', group: '인격장애 (F60–F69)', note: '' },
  { code: 'F60.3', dsm: 'Borderline personality disorder', ko: '정서불안정성 인격장애(경계성)', group: '인격장애 (F60–F69)', note: 'KCD 정서불안정성 인격장애 경계성형(F60.31)' },
  { code: 'F60.5', dsm: 'Anankastic (obsessive-compulsive) personality disorder', ko: '강박성 인격장애', group: '인격장애 (F60–F69)', note: '' },

  // ── 신경발달 ──
  { code: 'F84.0', dsm: 'Autism spectrum disorder', ko: '소아기 자폐증', group: '신경발달 (F80–F98)', note: 'DSM-5는 ASD로 통합; KCD는 F84.0(소아자폐)/F84.5(아스퍼거) 등 세분' },
  { code: 'F90.0', dsm: 'Attention-deficit/hyperactivity disorder', ko: '활동성 및 주의력 장애', group: '신경발달 (F80–F98)', note: 'KCD는 F90.0; ICD-10-CM 복합형은 F90.2' },
]
