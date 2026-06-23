import { useMemo, useState } from 'react'
import Icon from './Icon'

const ADM_STATUS_CLS = { 입원중: 'b-prog', 격리: 'b-emg', 관찰: 'b-new', 퇴원예정: 'b-done' }

function matches(p, q) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return [p.name, p.chart, p.dx].some((v) => String(v || '').toLowerCase().includes(s))
}

export default function PatientSearch({ queue, admissions, initialQuery = '', onOpen }) {
  const [q, setQ] = useState(initialQuery)
  const [source, setSource] = useState('전체')
  const sources = ['전체', '외래', '입원']

  const people = useMemo(() => {
    const out = queue.map((p) => ({
      kind: '외래', name: p.name, sex: p.sex, age: p.age, chart: p.chart, dx: p.dx, risk: p.risk,
      where: p.status, whereCls: p.statusCls, target: 'dashboard', selectChart: p.chart,
    }))
    const inp = admissions.map((a) => ({
      kind: '입원', name: a.name, sex: a.sex, age: a.age, chart: a.chart, dx: a.dx, risk: a.acuity === '중증' ? 'hi' : a.acuity === '주의' ? 'md' : '',
      where: `${a.wardName || a.ward} · ${a.room}-${a.bed}`, whereBadge: a.status, whereCls: ADM_STATUS_CLS[a.status],
      target: 'ward',
    }))
    return [...out, ...inp]
  }, [queue, admissions])

  const view = people.filter((p) => (source === '전체' || p.kind === source) && matches(p, q))

  return (
    <main className="main">
      <div className="crumb">
        <h1>환자 검색</h1>
        <span className="path">
          <b>정신건강의학과</b> / 담당 환자 통합 검색 (외래 · 입원)
        </span>
      </div>

      <div className="search-screen">
        <div className="search-bar">
          <div className="search-input">
            <Icon name="search" size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setQ('')}
              placeholder="환자명 · 차트번호 · 진단(F코드)으로 검색"
              autoFocus
            />
            {q && (
              <button className="search-clear" onClick={() => setQ('')} aria-label="지우기">×</button>
            )}
          </div>
          <div className="seg">
            {sources.map((s) => (
              <button key={s} className={source === s ? 'on' : ''} onClick={() => setSource(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <section className="card">
          <div className="hd">
            <h3>검색 결과</h3>
            <span className="meta">{q.trim() ? `"${q.trim()}" — ${view.length}건` : `전체 ${view.length}명`}</span>
          </div>
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>환자</th><th>차트번호</th><th>진단(F)</th><th>구분</th><th>현재 위치</th><th aria-label="작업" />
                </tr>
              </thead>
              <tbody>
                {view.length === 0 && (
                  <tr><td colSpan={6} className="queue-empty">검색 결과가 없습니다.</td></tr>
                )}
                {view.map((p, i) => (
                  <tr key={p.kind + p.chart + i}>
                    <td>
                      <div className="pname">
                        {p.name} <span className="meta">{p.sex}·{p.age}</span>
                        {p.risk === 'hi' && <span className="risk-dot risk-hi" />}
                        {p.risk === 'md' && <span className="risk-dot risk-md" />}
                      </div>
                    </td>
                    <td><span className="chartno">{p.chart}</span></td>
                    <td><span className="dx">{p.dx}</span></td>
                    <td>
                      <span className={`badge ${p.kind === '입원' ? 'b-prog' : 'b-wait'}`}>{p.kind}</span>
                    </td>
                    <td>
                      {p.kind === '입원' ? (
                        <span className="ref">{p.where} <span className={`badge ${p.whereCls}`}>{p.whereBadge}</span></span>
                      ) : (
                        <span className={`badge ${p.whereCls}`}>{p.where}</span>
                      )}
                    </td>
                    <td>
                      <button className="row-act" onClick={() => onOpen(p.target, p.selectChart)}>열기</button>
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
