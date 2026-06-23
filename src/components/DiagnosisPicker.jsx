import { useMemo, useRef, useState } from 'react'

// DSM-5 진단명으로 검색·선택 → 상위에는 ICD-10(KCD) code 만 올려보낸다.
// value = 선택된 code, onChange(code) = 선택 콜백.
export default function DiagnosisPicker({ diagnoses, value, onChange, autoFocus }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const blurTimer = useRef(null)

  const selected = diagnoses.find((d) => d.code === value) || null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return diagnoses
    return diagnoses.filter(
      (d) => d.dsm.toLowerCase().includes(q) || d.ko.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
    )
  }, [diagnoses, query])

  function pick(d) {
    onChange(d.code)
    setQuery('')
    setOpen(false)
  }

  // mousedown on an option fires before input blur — guard blur close with a timer.
  function onBlur() {
    blurTimer.current = setTimeout(() => setOpen(false), 120)
  }
  function cancelBlur() {
    if (blurTimer.current) clearTimeout(blurTimer.current)
  }

  return (
    <div className="dx-picker">
      <input
        className="dx-search"
        value={query}
        autoFocus={autoFocus}
        placeholder="DSM-5 진단명 검색 (예: anxiety · 우울 · F41)"
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={onBlur}
      />

      {selected && (
        <div className="dx-selected">
          <span className="legal lg-vol">{selected.code}</span>
          <span className="dx-sel-name">{selected.dsm}</span>
          <span className="dx-sel-ko">· {selected.ko}</span>
        </div>
      )}

      {open && (
        <ul className="dx-list" onMouseDown={cancelBlur}>
          {filtered.length === 0 && <li className="dx-empty">일치하는 진단이 없습니다.</li>}
          {filtered.map((d) => (
            <li key={d.code}>
              <button type="button" className={`dx-opt${d.code === value ? ' on' : ''}`} onClick={() => pick(d)}>
                <span className="code num">{d.code}</span>
                <span className="dsm">{d.dsm}</span>
                <span className="ko">{d.ko}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
