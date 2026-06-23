import { useState } from 'react'

const won = (n) => '₩' + (n || 0).toLocaleString()
const INS_CLS = { 건강보험: 'lg-vol', 의료급여: 'lg-pro', 자비: 'lg-adm' }

export default function Billing({ billings, summary, onMarkPaid }) {
  const [filter, setFilter] = useState('전체')
  const filters = ['전체', '미수납', '수납완료']
  const rows = billings.map((b, idx) => ({ b, idx })).filter(({ b }) => filter === '전체' || b.status === filter)

  const stats = [
    { tone: 't-acc', label: '청구 건수', value: String(summary.total), sub: '금일 외래' },
    { tone: 't-ok', label: '수납 완료', value: String(summary.paid), sub: won(summary.paidAmount) },
    { tone: 't-crit', label: '미수납', value: String(summary.unpaid), sub: '처리 대기' },
    { tone: 't-ok', label: '금일 수납액', value: won(summary.paidAmount), sub: '본인부담금' },
    { tone: 't-crit', label: '미수금', value: won(summary.outstanding), sub: '미수납 합계' },
  ]

  return (
    <main className="main">
      <div className="crumb">
        <h1>청구 · 수납</h1>
        <span className="path">
          <b>정신건강의학과</b> / 제2진료실 · 2026-06-23 · 본인부담금 수납
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

      <div className="search-screen">
        <section className="card" style={{ flex: 1, minHeight: 0 }}>
          <div className="hd">
            <h3>청구 목록</h3>
            <span className="meta">{rows.length}건</span>
            <div className="right">
              <div className="seg">
                {filters.map((f) => (
                  <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>환자</th><th>보험</th>
                  <th className="ta-r">진찰료</th><th className="ta-r">약제비</th><th className="ta-r">검사료</th>
                  <th className="ta-r">본인부담금</th><th>상태</th><th aria-label="작업" />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={8} className="queue-empty">해당 상태의 청구가 없습니다.</td></tr>}
                {rows.map(({ b, idx }) => (
                  <tr key={b.id ?? b.chart + idx}>
                    <td>
                      <div className="pname">{b.name}</div>
                      <span className="chartno">{b.chart}</span>
                    </td>
                    <td><span className={`legal ${INS_CLS[b.insurance] || ''}`}>{b.insurance}</span></td>
                    <td className="ta-r num">{won(b.consult)}</td>
                    <td className="ta-r num">{won(b.drug)}</td>
                    <td className="ta-r num">{won(b.test)}</td>
                    <td className="ta-r num" style={{ fontWeight: 700 }}>{won(b.copay)}</td>
                    <td>
                      <span className={`badge ${b.status === '수납완료' ? 'b-done' : 'b-emg'}`}>{b.status}</span>
                    </td>
                    <td>
                      {b.status === '미수납' ? (
                        <button className="btn primary" style={{ padding: '4px 10px' }} onClick={() => onMarkPaid(idx)}>
                          수납 처리
                        </button>
                      ) : (
                        <span className="ref">완료</span>
                      )}
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
