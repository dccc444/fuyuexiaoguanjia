import { useEffect, useState } from 'react'
import { displayText } from '../utils/tripMeta'

function parseEventTime(dateStr, timeStr) {
  if (!dateStr) return null
  const time = timeStr || '19:30'
  return new Date(`${dateStr}T${time}:00`)
}

function CountdownPanel({ eventDate, startTime }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    const targetTime = parseEventTime(eventDate, startTime)
    if (!targetTime) return

    const timer = setInterval(() => {
      const now = new Date()
      const diff = targetTime.getTime() - now.getTime()

      if (diff <= 0) {
        setIsStarted(true)
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        clearInterval(timer)
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60))
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const s = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft({ hours: h, minutes: m, seconds: s })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [eventDate, startTime])

  if (!eventDate) return null

  return (
    <article className="panel-v3 panel-v3-light command-countdown">
      <p className="section-kicker-v3">活动倒计时</p>
      {isStarted ? (
        <h2>活动已经开始了！享受现场吧！</h2>
      ) : (
        <div className="countdown-display" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div className="time-block" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{String(timeLeft.hours).padStart(2, '0')}</span>
            <p className="muted" style={{ fontSize: '0.8rem' }}>小时</p>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>:</span>
          <div className="time-block" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
            <p className="muted" style={{ fontSize: '0.8rem' }}>分钟</p>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>:</span>
          <div className="time-block" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
            <p className="muted" style={{ fontSize: '0.8rem' }}>秒</p>
          </div>
        </div>
      )}
    </article>
  )
}

function CheckableList({ items, title, defaultChecked = false }) {
  const [checkedItems, setCheckedItems] = useState(
    items.reduce((acc, item) => ({ ...acc, [item]: defaultChecked }), {})
  )

  function toggleItem(item) {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }))
  }

  if (!items || items.length === 0) return null

  return (
    <div className="checklist-group" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
      <ul className="bullet-list" style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item) => (
          <li
            key={item}
            onClick={() => toggleItem(item)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              opacity: checkedItems[item] ? 0.6 : 1,
              textDecoration: checkedItems[item] ? 'line-through' : 'none',
            }}
          >
            <input
              type="checkbox"
              checked={checkedItems[item]}
              readOnly
              style={{ cursor: 'pointer' }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CommandCenterView({ battleBook }) {
  const { input, checklist, styleAdvice, foodAdvice } = battleBook

  return (
    <div className="command-center-layout" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
      <section className="panel-v3 panel-v3-light command-header">
        <p className="section-kicker-v3">现场指挥中心</p>
        <h1>{displayText(input.eventName, '本次活动')}</h1>
        <p className="section-subcopy-v3">随时掌握倒计时、勾选清单，还有实时的天气与补给提醒。</p>
      </section>

      <CountdownPanel eventDate={input.eventDate} startTime={input.startTime} />

      <section className="panel-v3 panel-v3-light command-checklist">
        <p className="section-kicker-v3">现场 Checklist</p>
        <h2>出门前最后检查一下</h2>
        <div className="checklist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
          <CheckableList items={checklist?.mustBring || []} title="一定记得带" />
          <CheckableList items={checklist?.recommended || []} title="带上会更顺手" />
        </div>
      </section>

      <section className="panel-v3 panel-v3-light command-reminders">
        <p className="section-kicker-v3">天气与补给提醒</p>
        <h2>现场状态早知道</h2>
        <div className="reminder-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
          <article className="reminder-card tone-mint" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--color-surface-mint, #e8f5e9)' }}>
            <h3 style={{ marginBottom: '1rem' }}>🌤 天气与穿搭</h3>
            <ul className="bullet-list">
              {(styleAdvice?.weather || ['请提前查看当地天气预报，准备好雨具或防晒。']).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="reminder-card tone-gold" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--color-surface-gold, #fff8e1)' }}>
            <h3 style={{ marginBottom: '1rem' }}>🍔 现场补给</h3>
            <ul className="bullet-list">
              {(foodAdvice?.onSite || ['建议带一些小零食和水在排队时补充能量。']).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </div>
  )
}
