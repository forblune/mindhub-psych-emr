import { useMemo, useState } from 'react'
import Icon from './Icon'

const STATUS_CLS = { 입원중: 'b-prog', 격리: 'b-emg', 관찰: 'b-new', 퇴원예정: 'b-done' }
const LEGAL_CLS = { 자의입원: 'lg-vol', 보호입원: 'lg-pro', 행정입원: 'lg-adm' }
const LEGALS = ['자의입원', '보호입원', '행정입원']
const STATUSES = ['입원중', '격리', '관찰', '퇴원예정']
const ACUITIES = ['일반', '주의', '중증']

const pad = (n) => String(n).padStart(2, '0')
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function daysSince(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return 1
  const now = new Date()
  const ms = new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.max(1, Math.floor(ms / 86400000) + 1)
}

export default function Ward({ wards, admissions, summary, onAddAdmission, onUpdateAdmission, onDeleteAdmission }) {
  const [wardFilter, setWardFilter] = useState('전체')
  const [mode, setMode] = useState(null) // null | 'add' | <originalIndex>
  const [vals, setVals] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [opErr, setOpErr] = useState('')

  const wardCodes = ['전체', ...wards.map((w) => w.code)]
  const occByWard = useMemo(() => {
    const m = {}
    admissions.forEach((a) => (m[a.ward] = (m[a.ward] || 0) + 1))
    return m
  }, [admissions])

  // 원본 인덱스 보존하며 필터
  const rows = admissions
    .map((a, idx) => ({ a, idx }))
    .filter(({ a }) => wardFilter === '전체' || a.ward === wardFilter)

  const occupancyPct = summary.totalBeds ? Math.round((summary.occupied / summary.totalBeds) * 100) : 0
  const editing = typeof mode === 'number'

  const blank = () => ({
    ward: wards[0]?.code || '', room: '', bed: '', name: '', sex: '남', age: '',
    chart: '', legal: '자의입원', status: '입원중', dx: '', admittedOn: todayStr(), acuity: '일반', memo: '',
  })
  const openAdd = () => { setMode('add'); setVals(blank()); setErr('') }
  const openEdit = (idx) => {
    const a = admissions[idx]
    setMode(idx)
    setVals({ ward: a.ward, room: a.room, bed: a.bed, name: a.name, sex: a.sex, age: String(a.age), chart: a.chart, legal: a.legal, status: a.status, dx: a.dx, admittedOn: a.admittedOn, acuity: a.acuity, memo: a.memo })
    setErr(''); setOpErr('')
  }
  const close = () => { setMode(null); setVals(null) }
  const set = (k, v) => setVals((p) => ({ ...p, [k]: v }))

  const stats = [
    { tone: 't-acc', label: '재원 환자', value: String(summary.occupied), sub: `병상 ${summary.totalBeds}개` },
    { tone: 't-acc', label: '병상 가동률', value: `${occupancyPct}%`, sub: `가용 ${summary.totalBeds - summary.occupied}` },
    { tone: 't-crit', label: '격리', value: String(summary.isolation), sub: '집중 관리' },
    { tone: 't-warn', label: '관찰', value: String(summary.observation), sub: '1:1 관찰' },
    { tone: 't-crit', label: '중증', value: String(summary.acute), sub: '집중 치료' },
    { tone: 't-ok', label: '퇴원 예정', value: String(summary.dischargePlanned), sub: '계획 수립' },
  ]

  async function submit(e) {
    e.preventDefault()
    if (!vals.name.trim() || !vals.chart.trim() || !vals.dx.trim()) return setErr('환자명·차트번호·진단은 필수입니다.')
    if (!vals.room.trim() || !vals.bed.trim()) return setErr('병실·병상을 입력하세요.')
    setBusy(true); setErr('')
    try {
      if (mode === 'add') {
        await onAddAdmission({
          ward: vals.ward, room: vals.room.trim(), bed: vals.bed.trim(), name: vals.name.trim(),
          sex: vals.sex, age: Number(vals.age) || 0, chart: vals.chart.trim(), legal: vals.legal,
          status: vals.status, dx: vals.dx.trim(), admittedOn: vals.admittedOn, dayNo: daysSince(vals.admittedOn),
          acuity: vals.acuity, memo: vals.memo.trim(),
        })
      } else {
        await onUpdateAdmission(mode, {
          room: vals.room.trim(), bed: vals.bed.trim(), legal: vals.legal, status: vals.status,
          dx: vals.dx.trim(), acuity: vals.acuity, memo: vals.memo.trim(),
        })
      }
      close()
    } catch (e2) {
      setErr(e2.message || '저장에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  async function discharge(idx, name) {
    if (!window.confirm(`${name} 님을 퇴원 처리할까요?`)) return
    try {
      await onDeleteAdmission(idx)
    } catch (e2) {
      setOpErr(e2.message || '퇴원 처리에 실패했습니다.')
    }
  }

  return (
    <main className="main">
      <div className="crumb">
        <h1>입원 · 병동</h1>
        <span className="path">
          <b>정신건강의학과</b> / 폐쇄·개방병동 / 2026-06-23 재원 현황
        </span>
        <div className="crumb-actions">
          {mode === null && (
            <button className="btn primary" onClick={openAdd}>
              <Icon name="plus" size={13} />
              입원 등록
            </button>
          )}
        </div>
      </div>

      <div className="kpis" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
        {stats.map((k) => (
          <div className={`kpi ${k.tone}`} key={k.label}>
            <span className="tick" />
            <span className="lab">{k.label}</span>
            <span className="val">{k.value}</span>
            <span className="sub">{k.sub}</span>
          </div>
        ))}
      </div>

      <div className="ward-content">
        <section className="card ward-occ">
          <div className="hd">
            <h3>병동 가동 현황</h3>
            <span className="meta">실시간 병상</span>
          </div>
          <div className="scroll" style={{ padding: '4px 0' }}>
            {wards.map((w) => {
              const used = occByWard[w.code] || 0
              const pct = w.total_beds ? Math.round((used / w.total_beds) * 100) : 0
              return (
                <div className="ward-row" key={w.code}>
                  <div className="ward-row-top">
                    <b>{w.name}</b>
                    <span className="num">{used}/{w.total_beds} · {pct}%</span>
                  </div>
                  <div className="ward-bar">
                    <i className={pct >= 90 ? 'hi' : pct >= 70 ? 'mid' : ''} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="card ward-list">
          <div className="hd">
            <h3>재원 환자</h3>
            <span className="meta">{rows.length}명</span>
            <div className="right">
              <div className="seg">
                {wardCodes.map((c) => (
                  <button key={c} className={wardFilter === c ? 'on' : ''} onClick={() => setWardFilter(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {mode !== null && (
            <form className="note-form ward-form" onSubmit={submit}>
              <div className="note-form-grid">
                <label className="note-field"><span>병동</span>
                  <select value={vals.ward} onChange={(e) => set('ward', e.target.value)} disabled={editing}>
                    {wards.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
                  </select>
                </label>
                <label className="note-field"><span>병실 / 병상 *</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={vals.room} onChange={(e) => set('room', e.target.value)} placeholder="501" />
                    <input value={vals.bed} onChange={(e) => set('bed', e.target.value)} placeholder="A" style={{ width: 56 }} />
                  </div>
                </label>
                <label className="note-field"><span>환자명 *</span>
                  <input value={vals.name} onChange={(e) => set('name', e.target.value)} disabled={editing} placeholder="홍길동" />
                </label>
                <label className="note-field"><span>차트번호 *</span>
                  <input value={vals.chart} onChange={(e) => set('chart', e.target.value)} disabled={editing} placeholder="00640100" />
                </label>
                <label className="note-field"><span>성별 / 나이</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <select value={vals.sex} onChange={(e) => set('sex', e.target.value)} disabled={editing}>
                      <option>남</option><option>여</option>
                    </select>
                    <input value={vals.age} onChange={(e) => set('age', e.target.value)} disabled={editing} placeholder="40" type="number" style={{ width: 70 }} />
                  </div>
                </label>
                <label className="note-field"><span>진단 (F) *</span>
                  <input value={vals.dx} onChange={(e) => set('dx', e.target.value)} placeholder="F32.2" />
                </label>
                <label className="note-field"><span>입원유형</span>
                  <select value={vals.legal} onChange={(e) => set('legal', e.target.value)}>
                    {LEGALS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </label>
                <label className="note-field"><span>상태</span>
                  <select value={vals.status} onChange={(e) => set('status', e.target.value)}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label className="note-field"><span>입원일</span>
                  <input value={vals.admittedOn} onChange={(e) => set('admittedOn', e.target.value)} disabled={editing} type="date" />
                </label>
                <label className="note-field"><span>중증도</span>
                  <select value={vals.acuity} onChange={(e) => set('acuity', e.target.value)}>
                    {ACUITIES.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </label>
                <label className="note-field" style={{ gridColumn: '1 / -1' }}><span>메모</span>
                  <input value={vals.memo} onChange={(e) => set('memo', e.target.value)} placeholder="경과·치료 메모" />
                </label>
              </div>
              {err && <div className="note-err">{err}</div>}
              <div className="note-form-actions">
                <button type="button" className="btn" onClick={close} disabled={busy}>취소</button>
                <button type="submit" className="btn primary" disabled={busy}>
                  {busy ? '저장 중…' : editing ? '수정 저장' : '입원 등록'}
                </button>
              </div>
            </form>
          )}
          {opErr && <div className="note-err" style={{ margin: '0 13px 8px' }}>{opErr}</div>}

          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>병실/병상</th><th>환자</th><th>진단(F)</th><th>입원유형</th><th>입원일</th><th>재원</th><th>상태</th><th aria-label="작업" />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={8} className="queue-empty">재원 환자가 없습니다.</td></tr>
                )}
                {rows.map(({ a, idx }) => (
                  <tr key={a.id ?? a.chart + idx} className={mode === idx ? 'lab-editing' : undefined}>
                    <td><span className="qno">{a.ward} · {a.room}-{a.bed}</span></td>
                    <td>
                      <div className="pname">
                        {a.name} <span className="meta">{a.sex}·{a.age}</span>
                        {a.acuity === '중증' && <span className="risk-dot risk-hi" title="중증" />}
                        {a.acuity === '주의' && <span className="risk-dot risk-md" title="주의" />}
                      </div>
                      <span className="chartno">{a.chart}</span>
                    </td>
                    <td><span className="dx">{a.dx}</span></td>
                    <td><span className={`legal ${LEGAL_CLS[a.legal] || ''}`}>{a.legal}</span></td>
                    <td className="ref">{a.admittedOn}</td>
                    <td><span className="num">{a.dayNo}일</span></td>
                    <td><span className={`badge ${STATUS_CLS[a.status] || 'b-wait'}`}>{a.status}</span></td>
                    <td>
                      <span className="row-actions">
                        <button className="row-act" onClick={() => openEdit(idx)}>수정</button>
                        <button className="row-act danger" onClick={() => discharge(idx, a.name)}>퇴원</button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
