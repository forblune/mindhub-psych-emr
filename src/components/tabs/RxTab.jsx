import { useState } from 'react'
import Icon from '../Icon'

const EMPTY = { name: '', klass: '', brand: '', dose: '', sub: '', qty: '', price: '' }

export default function RxTab({ detail, onAddRx }) {
  const { items, warn } = detail.rx
  const [open, setOpen] = useState(false)
  const [vals, setVals] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const set = (k, v) => setVals((prev) => ({ ...prev, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (!vals.name.trim() || !vals.dose.trim()) {
      setErr('약물명과 용법은 필수입니다.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      await onAddRx({
        name: vals.name.trim(),
        klass: vals.klass.trim() || '처방',
        brand: vals.brand.trim(),
        dose: vals.dose.trim(),
        sub: vals.sub.trim(),
        qty: vals.qty.trim(),
        price: vals.price.trim(),
        isNew: true,
      })
      setVals(EMPTY)
      setOpen(false)
    } catch (e2) {
      setErr(e2.message || '저장에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pane">
      <div className="note-head">
        <span className="note-title">처방 · 오더</span>
        {!open && (
          <button className="btn note-add-btn" onClick={() => setOpen(true)}>
            <Icon name="plus" size={13} />
            처방 추가
          </button>
        )}
      </div>

      {open && (
        <form className="note-form" onSubmit={submit}>
          <div className="note-form-grid">
            <label className="note-field" style={{ gridColumn: '1 / -1' }}>
              <span>약물명 *</span>
              <input value={vals.name} onChange={(e) => set('name', e.target.value)} placeholder="예: 에스시탈로프람 10mg" />
            </label>
            <label className="note-field">
              <span>성분·분류</span>
              <input value={vals.klass} onChange={(e) => set('klass', e.target.value)} placeholder="SSRI · 항우울제" />
            </label>
            <label className="note-field">
              <span>제품명</span>
              <input value={vals.brand} onChange={(e) => set('brand', e.target.value)} placeholder="(렉사프로정)" />
            </label>
            <label className="note-field" style={{ gridColumn: '1 / -1' }}>
              <span>용법 *</span>
              <input value={vals.dose} onChange={(e) => set('dose', e.target.value)} placeholder="1일 1회 1정 · 아침 식후" />
            </label>
            <label className="note-field" style={{ gridColumn: '1 / -1' }}>
              <span>비고</span>
              <input value={vals.sub} onChange={(e) => set('sub', e.target.value)} placeholder="적응증 · 처방일수 등" />
            </label>
            <label className="note-field">
              <span>수량</span>
              <input value={vals.qty} onChange={(e) => set('qty', e.target.value)} placeholder="30T" />
            </label>
            <label className="note-field">
              <span>약가</span>
              <input value={vals.price} onChange={(e) => set('price', e.target.value)} placeholder="₩4,200" />
            </label>
          </div>
          {err && <div className="note-err">{err}</div>}
          <div className="note-form-actions">
            <button type="button" className="btn" onClick={() => setOpen(false)} disabled={busy}>
              취소
            </button>
            <button type="submit" className="btn primary" disabled={busy}>
              {busy ? '저장 중…' : '처방 추가'}
            </button>
          </div>
        </form>
      )}

      {items.map((rx, i) => (
        <div className={`rx${rx.isNew ? ' new' : ''}`} key={i}>
          <span className="pill" />
          <div className="info">
            <span className="klass" style={rx.klassWarn ? { color: 'var(--warn)' } : undefined}>
              {rx.klass}
            </span>
            <br />
            <b>{rx.name}</b> {rx.brand && <span className="d">{rx.brand}</span>}
            <div className="d">{rx.dose}</div>
            <div className="s">
              {rx.sub}
              {rx.subBold && <b style={{ color: 'var(--warn)' }}>{rx.subBold}</b>}
            </div>
          </div>
          <div className="qty">
            {rx.qty}
            <br />
            {rx.price}
          </div>
        </div>
      ))}

      <div className="warnbox">
        <span style={{ color: 'var(--warn)' }}>
          <Icon name="warning" />
        </span>
        <span>
          <b>{warn.title}</b> — {warn.text}
        </span>
      </div>
    </div>
  )
}
