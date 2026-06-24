const LINKED_CHART = '00781120'

const DEMO_ENTRIES = [
  { date: '06-16', sleep: 6, med: true, mood: 5, stressor: null, red: false, evidence: null },
  { date: '06-17', sleep: 4, med: true, mood: 4, stressor: '직장 스트레스', red: false, evidence: null },
  { date: '06-18', sleep: 3, med: false, mood: 2, stressor: '직장 스트레스', red: false, evidence: null },
  { date: '06-19', sleep: null, med: null, mood: 1, stressor: null, red: true, evidence: '요즘 다 끝내고 싶다는 생각이 들어.' },
]

function avg(values) {
  const valid = values.filter((v) => v != null)
  return valid.length ? (valid.reduce((sum, v) => sum + v, 0) / valid.length).toFixed(1) : null
}

function buildSummary(entries) {
  const sleepAvg = avg(entries.map((e) => e.sleep))
  const moodAvg = avg(entries.map((e) => e.mood))
  const medItems = entries.filter((e) => e.med != null)
  const medTaken = medItems.filter((e) => e.med).length
  const stressors = [...new Set(entries.map((e) => e.stressor).filter(Boolean))]
  const redItem = entries.find((e) => e.red)
  return { sleepAvg, moodAvg, medTaken, medTotal: medItems.length, stressors, redItem }
}

function MetricCard({ label, value, sub, tone = '' }) {
  return (
    <div className={`mindhub-metric ${tone}`}>
      <span>{label}</span>
      <b>{value}</b>
      {sub && <small>{sub}</small>}
    </div>
  )
}

export default function MindHubTab({ patient }) {
  const isLinked = patient?.chart === LINKED_CHART
  const summary = buildSummary(DEMO_ENTRIES)

  return (
    <div className="pane">
      <div className="mindhub-note">
        <span className="legal lg-vol">MindHub</span>
        <div>
          <b>MindHub 환자앱에서 공유된 데모 데이터입니다</b>
          <span>진단/처방 자동화가 아닌 참고자료입니다.</span>
        </div>
      </div>

      {!isLinked ? (
        <div className="mindhub-empty">
          <b>연결된 MindHub 데모 기록 없음</b>
          <span>대기열에서 강하늘 환자를 선택하면 환자앱 공유 요약 데모가 표시됩니다.</span>
        </div>
      ) : (
        <>
          {summary.redItem && (
            <div className="mindhub-risk">
              <b>안전 신호 — 진료 전 우선 확인</b>
              <span>위험 표현 1건이 감지되었습니다. 실제 안전 평가는 의료진이 직접 수행해야 합니다.</span>
              <em>근거 문장: "{summary.redItem.evidence}"</em>
            </div>
          )}

          <div className="mindhub-grid">
            <MetricCard
              label="수면"
              value={summary.sleepAvg ? `평균 ${summary.sleepAvg}h` : '기록 없음'}
              sub="최근 공유 기록 기준"
              tone={summary.sleepAvg && Number(summary.sleepAvg) < 5 ? 'warn' : ''}
            />
            <MetricCard
              label="복약"
              value={summary.medTotal ? `${summary.medTaken}/${summary.medTotal}일` : '기록 없음'}
              sub="환자 자가보고"
              tone={summary.medTaken < summary.medTotal ? 'warn' : ''}
            />
            <MetricCard
              label="기분"
              value={summary.moodAvg ? `${summary.moodAvg}/10` : '기록 부족'}
              sub="낮을수록 불편감 큼"
              tone={summary.moodAvg && Number(summary.moodAvg) <= 3 ? 'crit' : ''}
            />
            <MetricCard
              label="스트레스원"
              value={summary.stressors.length ? summary.stressors.join(', ') : '특이 사항 없음'}
              sub="대화에서 추출된 후보"
            />
          </div>

          <div className="mindhub-timeline">
            <div className="note-title">공유 신호 타임라인</div>
            {DEMO_ENTRIES.map((entry) => (
              <div className="mindhub-day" key={entry.date}>
                <span className="num">{entry.date}</span>
                <span>수면 {entry.sleep == null ? '-' : `${entry.sleep}h`}</span>
                <span>복약 {entry.med == null ? '-' : entry.med ? '예' : '누락'}</span>
                <span>기분 {entry.mood == null ? '-' : `${entry.mood}/10`}</span>
                <span>{entry.stressor || (entry.red ? '안전 신호' : '특이 사항 없음')}</span>
              </div>
            ))}
          </div>

          <div className="summary">
            <b>요약</b> — MindHub 일상 대화에서 수면 감소, 복약 누락, 직장 스트레스, 안전 신호가 공유된 데모입니다.
            EMR의 진단·처방·안전 평가는 이 정보를 자동 반영하지 않고 의료진 판단으로만 수행합니다.
          </div>
        </>
      )}
    </div>
  )
}
