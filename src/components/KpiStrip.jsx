export default function KpiStrip({ kpis }) {
  return (
    <div className="kpis" style={{ gridTemplateColumns: `repeat(${kpis.length}, 1fr)` }}>
      {kpis.map((k) => (
        <div className={`kpi ${k.tone}`} key={k.label}>
          <span className="tick" />
          <span className="lab">{k.label}</span>
          <span className="val">{k.value}</span>
          <span className="sub">
            {k.sub}
            {k.delta && <> <span className={k.deltaTone}>{k.delta}</span></>}
          </span>
        </div>
      ))}
    </div>
  )
}
