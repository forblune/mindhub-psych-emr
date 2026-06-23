import { useMemo, useState } from 'react'

const STATUS_CLS = { 입원중: 'b-prog', 격리: 'b-emg', 관찰: 'b-new', 퇴원예정: 'b-done' }
const LEGAL_CLS = { 자의입원: 'lg-vol', 보호입원: 'lg-pro', 행정입원: 'lg-adm' }

export default function Ward({ wards, admissions, summary }) {
  const [wardFilter, setWardFilter] = useState('전체')
  const wardCodes = ['전체', ...wards.map((w) => w.code)]

  // 병동별 재원수
  const occByWard = useMemo(() => {
    const m = {}
    admissions.forEach((a) => {
      m[a.ward] = (m[a.ward] || 0) + 1
    })
    return m
  }, [admissions])

  const view = admissions.filter((a) => wardFilter === '전체' || a.ward === wardFilter)
  const occupancyPct = summary.totalBeds ? Math.round((summary.occupied / summary.totalBeds) * 100) : 0

  const stats = [
    { tone: 't-acc', label: '재원 환자', value: String(summary.occupied), sub: `병상 ${summary.totalBeds}개` },
    { tone: 't-acc', label: '병상 가동률', value: `${occupancyPct}%`, sub: `가용 ${summary.totalBeds - summary.occupied}` },
    { tone: 't-crit', label: '격리', value: String(summary.isolation), sub: '집중 관리' },
    { tone: 't-warn', label: '관찰', value: String(summary.observation), sub: '1:1 관찰' },
    { tone: 't-crit', label: '중증', value: String(summary.acute), sub: '집중 치료' },
    { tone: 't-ok', label: '퇴원 예정', value: String(summary.dischargePlanned), sub: '계획 수립' },
  ]

  return (
    <main className="main">
      <div className="crumb">
        <h1>입원 · 병동</h1>
        <span className="path">
          <b>정신건강의학과</b> / 폐쇄·개방병동 / 2026-06-23 재원 현황
        </span>
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
        {/* 병동별 가동 현황 */}
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
                    <span className="num">
                      {used}/{w.total_beds} · {pct}%
                    </span>
                  </div>
                  <div className="ward-bar">
                    <i className={pct >= 90 ? 'hi' : pct >= 70 ? 'mid' : ''} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 재원 환자 목록 */}
        <section className="card ward-list">
          <div className="hd">
            <h3>재원 환자</h3>
            <span className="meta">{view.length}명</span>
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
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>병실/병상</th>
                  <th>환자</th>
                  <th>진단(F)</th>
                  <th>입원유형</th>
                  <th>입원일</th>
                  <th>재원</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {view.map((a, i) => (
                  <tr key={a.chart + i}>
                    <td>
                      <span className="qno">{a.ward} · {a.room}-{a.bed}</span>
                    </td>
                    <td>
                      <div className="pname">
                        {a.name} <span className="meta">{a.sex}·{a.age}</span>
                        {a.acuity === '중증' && <span className="risk-dot risk-hi" title="중증" />}
                        {a.acuity === '주의' && <span className="risk-dot risk-md" title="주의" />}
                      </div>
                      <span className="chartno">{a.chart}</span>
                    </td>
                    <td>
                      <span className="dx">{a.dx}</span>
                    </td>
                    <td>
                      <span className={`legal ${LEGAL_CLS[a.legal] || ''}`}>{a.legal}</span>
                    </td>
                    <td className="ref">{a.admittedOn}</td>
                    <td>
                      <span className="num">{a.dayNo}일</span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_CLS[a.status] || 'b-wait'}`}>{a.status}</span>
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
