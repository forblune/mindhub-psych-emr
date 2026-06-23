// Standard psychiatric rating-scale definitions: max score + severity bands.
// band = [upperBound, severityClass, koreanLabel]; first band whose
// upperBound >= score wins.
export const SCALE_DEFS = {
  'PHQ-9': { tag: '우울', max: 27, bands: [[4, 'min', '정상'], [9, 'mild', '경도'], [14, 'mod', '중등도'], [27, 'sev', '중증']] },
  'GAD-7': { tag: '불안', max: 21, bands: [[4, 'min', '정상'], [9, 'mild', '경도'], [14, 'mod', '중등도'], [21, 'sev', '중증']] },
  ISI: { tag: '불면', max: 28, bands: [[7, 'min', '정상'], [14, 'mild', '경도'], [21, 'mod', '중등도'], [28, 'sev', '중증']] },
  AUDIT: { tag: '음주', max: 40, bands: [[7, 'min', '정상'], [15, 'mild', '위험'], [19, 'mod', '주의'], [40, 'sev', '의존']] },
}

export const SCALE_NAMES = Object.keys(SCALE_DEFS)

// Build a UI scale object from a name + raw score (auto severity/pct).
export function classifyScale(name, value) {
  const def = SCALE_DEFS[name]
  if (!def) return null
  const v = Math.max(0, Math.min(def.max, Number(value)))
  const band = def.bands.find(([hi]) => v <= hi) || def.bands[def.bands.length - 1]
  return { name, tag: def.tag, value: v, max: def.max, pct: Math.round((v / def.max) * 100), cls: band[1], label: band[2] }
}
