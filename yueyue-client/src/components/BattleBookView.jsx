import { useState } from 'react'
import { displayText } from '../utils/tripMeta'
import { submitFeedback } from '../api'

function FeedbackModal({ onClose }) {
  const [type, setType] = useState('规则错误')
  const [content, setContent] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    setMessage('')
    try {
      await submitFeedback({ type, content, contact })
      setMessage('感谢你的反馈，我们会尽快核实更新！')
      setTimeout(() => onClose(), 2000)
    } catch (err) {
      setMessage(err.message || '提交失败，请稍后再试。')
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content panel-v3 panel-v3-light" onClick={e => e.stopPropagation()}>
        <div className="section-head-v3">
          <h2>我要纠错</h2>
        </div>
        <form onSubmit={handleSubmit} className="v3-form-grid">
          <div className="v3-form-field">
            <label>错误类型</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="规则错误">场馆规则错误/过时</option>
              <option value="建议补充">补充遗漏的建议</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div className="v3-form-field">
            <label>具体内容 *</label>
            <textarea
              required
              rows={4}
              placeholder="请描述具体的错误或需要补充的信息..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          <div className="v3-form-field">
            <label>联系方式 (选填)</label>
            <input
              type="text"
              placeholder="微信号/邮箱等，方便我们向你确认"
              value={contact}
              onChange={e => setContact(e.target.value)}
            />
          </div>
          {message && <p className={message.includes('感谢') ? 'success-text' : 'error-text'}>{message}</p>}
          <div className="button-row">
            <button type="button" className="hero-secondary-v3" onClick={onClose} disabled={submitting}>取消</button>
            <button type="submit" className="hero-primary-v3" disabled={submitting || !content.trim()}>
              {submitting ? '提交中...' : '提交'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, tone = 'blue', note }) {
  if (!value) return null

  return (
    <article className={`handbook-summary-card tone-${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      {note ? <p>{note}</p> : null}
    </article>
  )
}

function getReturnStatusLabel(riskLevel) {
  if (riskLevel === 'high') return '返程压力偏高'
  if (riskLevel === 'medium') return '返程要提前想好'
  return '返程相对轻松'
}

function DynamicPulseStrip({ input, successScore, venueRules, returnAdvice }) {
  const cards = [
    {
      title: '当前场馆',
      value: displayText(input.venue, '等待场馆'),
      note: venueRules ? '规则已命中，可以优先看官方提醒。' : '系统还没命中完整规则。',
      tone: 'blue',
    },
    {
      title: '返程状态',
      value: getReturnStatusLabel(returnAdvice?.riskLevel),
      note: '散场交通和赶车节奏要提前想。',
      tone: 'orange',
    },
    {
      title: '赴约安心度',
      value: `${successScore?.value || 0} 分`,
      note: successScore?.summary,
      tone: 'mint',
    },
  ]

  return (
    <section className="pulse-strip-grid">
      {cards.map((card) => (
        <article className={`pulse-strip-card tone-${card.tone}`} key={card.title}>
          <span>{card.title}</span>
          <strong>{card.value}</strong>
          <p>{card.note}</p>
        </article>
      ))}
    </section>
  )
}

function ChecklistList({ items }) {
  return (
    <ul className="bullet-list handbook-bullet-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function HandbookCover({ battleBook, actions }) {
  const { input } = battleBook
  const successScore = battleBook.successScore || battleBook.score
  const metaItems = [input.sceneLabel, input.city, input.venue, input.eventDate].filter(Boolean)

  return (
    <section className="panel-v3 panel-v3-light handbook-summary-hero">
      <div className="handbook-summary-copy">
        <p className="section-kicker-v3">Itinerary Summary</p>
        <h1>{displayText(input.eventName, '这次赴约')}</h1>
        <p className="section-subcopy-v3">先把这次赴约最关键的时间、场馆、规则和提醒收成一份清楚的摘要，再往下看完整攻略手册。</p>
        <div className="handbook-meta-row">
          {metaItems.map((item) => (
            <span className="handbook-meta-pill" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="handbook-summary-side">
        <article className="handbook-score-overview">
          <span>赴约安心度</span>
          <div className="score-circle">
            <svg viewBox="0 0 36 36" className="circular-chart" style={{ width: '80px', height: '80px' }}>
              <path
                className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${successScore?.value || 0}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">{successScore?.value || 0}</text>
            </svg>
          </div>
          <p>{successScore?.summary}</p>
          {successScore?.improvementTips && successScore.improvementTips.length > 0 && (
            <div className="improvement-tips">
              <strong>提分建议：</strong>
              <ul>
                {successScore.improvementTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </article>
        <div className="button-row handbook-cover-actions">{actions}</div>
      </div>
    </section>
  )
}

function FanSummary({ input }) {
  return (
    <section className="panel-v3 panel-v3-light handbook-summary-grid">
      <SummaryCard title="这次去见谁" value={input.targetName} tone="pink" />
      <SummaryCard title="最想完成什么" value={input.supportGoal} tone="blue" />
      <SummaryCard title="穿搭妆造重点" value={input.outfitFocus} tone="gold" />
      <SummaryCard title="吃喝补给" value={input.foodPlan} tone="mint" />
      <SummaryCard title="住哪里" value={input.stayPlan} tone="blue" />
      <SummaryCard title="物料周边" value={input.merchPlan} tone="gold" />
      <SummaryCard title="搭子会合" value={input.meetupPlan} tone="pink" />
      <SummaryCard title="票务状态" value={input.hasTicket ? '已购票' : '未购票'} tone="mint" />
      <SummaryCard title="票档 / 分区" value={input.ticketArea} tone="slate" />
    </section>
  )
}

function GuideModules({ styleAdvice, foodAdvice, stayAdvice, ticketAdvice, seatAdvice, socialAdvice, returnAdvice, suggestions }) {
  return (
    <section className="panel-v3 panel-v3-light handbook-guide-board">
      <div className="section-head-v3">
        <div>
          <p className="section-kicker-v3">攻略手册</p>
          <h2>把衣食住行票社交拆开看，这次赴约会更顺</h2>
        </div>
      </div>

      <div className="handbook-guide-grid">
        {styleAdvice ? (
          <article className="handbook-guide-card tone-pink">
            <h3>穿</h3>
            <p>穿搭和妆造</p>
            <ChecklistList items={[...(styleAdvice.outfit || []), ...(styleAdvice.beauty || [])].slice(0, 4)} />
          </article>
        ) : null}

        {foodAdvice ? (
          <article className="handbook-guide-card tone-gold">
            <h3>吃</h3>
            <p>吃喝补给</p>
            <ChecklistList items={[...(foodAdvice.beforeEntry || []), ...(foodAdvice.afterShow || [])].slice(0, 4)} />
          </article>
        ) : null}

        {stayAdvice ? (
          <article className="handbook-guide-card tone-mint">
            <h3>住</h3>
            <p>住宿落脚</p>
            <ChecklistList items={[stayAdvice.stayDecision, ...(stayAdvice.locationTips || [])].filter(Boolean).slice(0, 4)} />
          </article>
        ) : null}

        {returnAdvice || suggestions ? (
          <article className="handbook-guide-card tone-blue">
            <h3>行</h3>
            <p>到场与返程</p>
            <ChecklistList items={[...(suggestions?.arrival || []), ...(returnAdvice?.tips || [])].slice(0, 4)} />
          </article>
        ) : null}

        {ticketAdvice ? (
          <article className="handbook-guide-card tone-mint">
            <h3>购票</h3>
            <p>票务建议 ({ticketAdvice.status})</p>
            <ChecklistList items={(ticketAdvice.tips || []).slice(0, 4)} />
          </article>
        ) : null}

        {seatAdvice ? (
          <article className="handbook-guide-card tone-slate">
            <h3>票</h3>
            <p>票档与分区</p>
            <ChecklistList items={[seatAdvice.zoneSummary, ...(seatAdvice.entryTips || [])].filter(Boolean).slice(0, 4)} />
          </article>
        ) : null}

        {socialAdvice ? (
          <article className="handbook-guide-card tone-coral">
            <h3>社交</h3>
            <p>搭子与会合</p>
            <ChecklistList items={[...(socialAdvice.meetup || []), ...(socialAdvice.merch || [])].slice(0, 4)} />
          </article>
        ) : null}
      </div>
    </section>
  )
}

function RulesAndChecklist({ venueRules, risks, checklist }) {
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <section className="handbook-detail-grid">
      {venueRules ? (
        <section className="panel-v3 panel-v3-light handbook-module">
          <div className="section-head-v3">
            <div>
              <p className="section-kicker-v3">场馆规则</p>
              <h2>这座场馆的官方重点提醒</h2>
            </div>
            <button className="hero-secondary-v3 compact" onClick={() => setShowFeedback(true)} type="button">
              我要纠错
            </button>
          </div>
          <div className="venue-preview-grid">
            <article className="venue-preview-card venue-preview-main">
              <strong>{venueRules.venueName}</strong>
              <p>{venueRules.summary}</p>
              <ChecklistList items={(venueRules.entryTips || []).slice(0, 4)} />
            </article>
            <article className="venue-preview-card">
              <strong>官方禁带</strong>
              <ChecklistList items={(venueRules.prohibitedItems || []).slice(0, 4)} />
            </article>
            <article className="venue-preview-card">
              <strong>额外留意</strong>
              <ChecklistList items={(venueRules.allowedOrConditional || []).slice(0, 4)} />
            </article>
          </div>
        </section>
      ) : null}

      <section className="panel-v3 panel-v3-light handbook-module">
        <div className="section-head-v3">
          <div>
            <p className="section-kicker-v3">提前提醒你</p>
            <h2>这些地方最容易忙乱，我先圈出来</h2>
          </div>
        </div>
        <div className="risk-grid">
          {risks.map((risk, index) => (
            <article className={`risk-card risk-card-${(index % 3) + 1}`} key={`${risk.title}-${risk.level}`}>
              <div className="risk-head">
                <span className="risk-seq">0{index + 1}</span>
                <span className={`risk-pill ${risk.level}`}>{risk.level === 'high' ? '高提醒' : risk.level === 'medium' ? '中提醒' : '低提醒'}</span>
              </div>
              <strong>{risk.title}</strong>
              <p>{risk.reason}</p>
              <p className="muted">建议：{risk.advice}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-v3 panel-v3-light handbook-module">
        <div className="section-head-v3">
          <div>
            <p className="section-kicker-v3">出发前清单</p>
            <h2>把要带的东西先理好，现场会踏实很多</h2>
          </div>
        </div>
        <div className="checklist-grid lively-checklist">
          <article className="check-card check-card-1">
            <div className="check-card-head">
              <span className="check-icon">OK</span>
              <p className="section-kicker-v3">一定记得带</p>
            </div>
            <ChecklistList items={checklist.mustBring || []} />
          </article>
          <article className="check-card check-card-2">
            <div className="check-card-head">
              <span className="check-icon">+</span>
              <p className="section-kicker-v3">带上会更顺手</p>
            </div>
            <ChecklistList items={checklist.recommended || []} />
          </article>
          <article className="check-card check-card-3">
            <div className="check-card-head">
              <span className="check-icon">!</span>
              <p className="section-kicker-v3">尽量别带</p>
            </div>
            <ChecklistList items={checklist.avoidBring || []} />
          </article>
        </div>
      </section>

      {!venueRules && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button className="hero-secondary-v3 compact" onClick={() => setShowFeedback(true)} type="button">
            我要补充场馆信息
          </button>
        </div>
      )}

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </section>
  )
}

function TimelineSection({ timeline, successScore, returnAdvice }) {
  return (
    <section className="panel-v3 panel-v3-light handbook-module">
      <div className="section-head-v3">
        <div>
          <p className="section-kicker-v3">当天节奏</p>
          <h2>像 itinerary 一样看这次活动，从到场到返程都更清楚</h2>
        </div>
        <div className="planner-submit-badge">
          {successScore?.value || 0} 分 · {getReturnStatusLabel(returnAdvice?.riskLevel)}
        </div>
      </div>
      <div className="timeline lively-timeline">
        {timeline.map((item, index) => (
          <article className="timeline-item lively-item" key={`${item.phase}-${item.timeLabel}`}>
            <div className="timeline-dot-wrap">
              <span className={`timeline-dot dot-${(index % 4) + 1}`} />
              <div className="timeline-meta">
                <span>{item.timeLabel}</span>
                <strong>{item.phaseLabel}</strong>
              </div>
            </div>
            <div className="timeline-card">
              <h4>{item.action}</h4>
              <p>{item.note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function BattleBookView({ battleBook, actions }) {
  const {
    input,
    risks,
    timeline,
    checklist,
    venueRules,
    styleAdvice,
    foodAdvice,
    stayAdvice,
    ticketAdvice,
    seatAdvice,
    socialAdvice,
    returnAdvice,
    suggestions,
  } = battleBook

  const successScore = battleBook.successScore || battleBook.score
  const themeClass = input?.sceneType ? `theme-${input.sceneType}` : 'theme-default'

  return (
    <div className={`battlebook-layout handbook-layout-v5 ${themeClass}`}>
      <HandbookCover actions={actions} battleBook={battleBook} />
      <DynamicPulseStrip input={input} returnAdvice={returnAdvice} successScore={successScore} venueRules={venueRules} />
      <FanSummary input={input} />
      <GuideModules
        foodAdvice={foodAdvice}
        returnAdvice={returnAdvice}
        ticketAdvice={ticketAdvice}
        seatAdvice={seatAdvice}
        socialAdvice={socialAdvice}
        stayAdvice={stayAdvice}
        styleAdvice={styleAdvice}
        suggestions={suggestions}
      />
      <RulesAndChecklist checklist={checklist} risks={risks} venueRules={venueRules} />
      <TimelineSection returnAdvice={returnAdvice} successScore={successScore} timeline={timeline} />
    </div>
  )
}
