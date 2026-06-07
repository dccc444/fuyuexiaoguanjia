import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSharedBattleBook } from '../api'
import { BattleBookView } from '../components/BattleBookView'
import { displayText } from '../utils/tripMeta'

function SharedSummary({ battleBook }) {
  const summaryItems = useMemo(() => {
    const input = battleBook.input
    return [
      { label: '活动', value: displayText(input.eventName, '这次赴约'), tone: 'blue' },
      { label: '场馆', value: displayText(input.venue, '待定场馆'), tone: 'mint' },
      { label: '日期', value: displayText(input.eventDate, '待定日期'), tone: 'gold' },
      { label: '最在意', value: displayText(input.supportGoal, '把整场安排得更顺'), tone: 'coral' },
    ].filter((item) => item.value)
  }, [battleBook])

  return (
    <section className="share-summary-strip">
      {summaryItems.map((item) => (
        <article className={`share-summary-card tone-${item.tone}`} key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </section>
  )
}

export function SharedBattleBookPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [battleBook, setBattleBook] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return

    getSharedBattleBook(token)
      .then((data) => setBattleBook(data.item))
      .catch((loadError) => setError(loadError.message))
  }, [token])

  if (error) {
    return <section className="panel-v3 panel-v3-light error-text">{error}</section>
  }

  if (!battleBook) {
    return <section className="panel-v3 panel-v3-light loading-state">正在打开分享页...</section>
  }

  return (
    <div className="share-layout-v5">
      <section className="share-banner-v5 share-banner-v5-unified">
        <div>
          <p className="section-kicker-v3">朋友分享给你</p>
          <h2>这是一份可以直接带着出门的赴约摘要页</h2>
          <p>这里已经把这次活动最关键的时间线、场馆提醒、衣食住行票社交重点收好了。你可以先看摘要，再决定要不要自己也生成一份。</p>
        </div>
        <button className="hero-primary-v3 compact" onClick={() => navigate('/create')} type="button">
          我也创建一份
        </button>
      </section>

      <SharedSummary battleBook={battleBook} />
      <BattleBookView battleBook={battleBook} />
    </div>
  )
}
