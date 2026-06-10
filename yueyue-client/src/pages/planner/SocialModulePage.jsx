import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { generateBattleBook } from '../../api'
import { usePlannerDraft } from '../../store/plannerDraft'

const companionOptions = [
  { value: 1, label: '一个人去' },
  { value: 2, label: '两个人' },
  { value: 3, label: '三个人' },
  { value: 4, label: '四个人以上' },
]

const meetupExamples = {
  concert: '例如：和朋友在地铁口会合、场外领物料后一起进场',
  festival: '例如：和朋友分舞台看，晚上在主舞台旁集合',
  match: '例如：和朋友在南广场碰头，赛后再一起吃饭',
}

const merchExamples = {
  concert: '例如：想领应援物、换小卡、买官方周边',
  festival: '例如：想逛市集、买联名周边、领品牌物料',
  match: '例如：想买球衣周边、带应援小物、赛后再逛',
}

function SocialList({ title, items, tone = 'soft' }) {
  if (!items?.length) return null

  return (
    <section className={`planner-rule-section planner-rule-section-${tone}`}>
      <div className="planner-rule-section-head">
        <h3>{title}</h3>
        <span>{items.length} 条</span>
      </div>
      <ul className="planner-rule-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

function ResultSnapshotCard({ eyebrow, title, summary }) {
  return (
    <article className="planner-snapshot-card">
      <span>{eyebrow}</span>
      <strong>{title}</strong>
      <p>{summary}</p>
    </article>
  )
}

export function SocialModulePage() {
  const { draft, updateDraft } = usePlannerDraft()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const missingBasics = useMemo(() => {
    const missing = []
    if (!draft.city) missing.push('城市')
    if (!draft.venue) missing.push('场馆')
    if (!draft.eventDate) missing.push('日期')
    return missing
  }, [draft.city, draft.eventDate, draft.venue])

  const buddyPrefill = useMemo(
    () => ({
      sceneType: draft.sceneType,
      eventName: draft.eventName,
      targetName: draft.targetName,
      city: draft.city,
      venue: draft.venue,
      eventDate: draft.eventDate,
      startTime: draft.startTime,
      ticketArea: draft.ticketArea,
      intentType: Number(draft.companions || 1) > 1 ? '一起进场' : '一个人也想找伴',
      content: [draft.meetupPlan, draft.merchPlan, draft.notes].filter(Boolean).join('；'),
      companionsExpected: 1,
      isFirstTime: draft.isFirstTime,
    }),
    [
      draft.city,
      draft.eventDate,
      draft.eventName,
      draft.isFirstTime,
      draft.meetupPlan,
      draft.merchPlan,
      draft.notes,
      draft.sceneType,
      draft.startTime,
      draft.targetName,
      draft.ticketArea,
      draft.venue,
      draft.companions,
    ],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const data = await generateBattleBook({
        sceneType: draft.sceneType,
        eventName: draft.eventName || '本次赴约',
        targetName: draft.targetName,
        city: draft.city || '待定城市',
        venue: draft.venue || '待定场馆',
        eventDate: draft.eventDate || '2026-01-01',
        startTime: draft.startTime,
        budgetRange: draft.budgetRange || 'mid',
        companions: Number(draft.companions || 1),
        merchPlan: draft.merchPlan,
        meetupPlan: draft.meetupPlan,
        isFirstTime: draft.isFirstTime,
        notes: draft.notes,
      })

      setResult(data.item)
    } catch (submitError) {
      setError(submitError.message || '生成搭子与物料建议失败，请稍后再试。')
      setResult(null)
    } finally {
      setSubmitting(false)
    }
  }

  function updateField(name, value) {
    updateDraft({ [name]: value })
  }

  const canSubmit = Boolean(
    String(draft.meetupPlan || '').trim() ||
      String(draft.merchPlan || '').trim() ||
      Number(draft.companions || 1) > 1 ||
      draft.isFirstTime,
  )

  const socialSummaryCards = result?.socialAdvice
    ? [
        {
          eyebrow: '同行状态',
          title: draft.companions > 1 ? `${draft.companions} 人同行` : '一个人去',
          summary: draft.companions > 1 ? '会合和进场先说好。' : '入口、返程和联系点先想好。',
        },
        {
          eyebrow: '会合安排',
          title: draft.meetupPlan || '待确认',
          summary: result.socialAdvice.meetup?.[0] || '先定明显地标。',
        },
        {
          eyebrow: '物料安排',
          title: draft.merchPlan || '按现场节奏安排',
          summary: result.socialAdvice.merch?.[0] || '领物料和进场分开走。',
        },
      ]
    : []

  const eventSnapshot = [draft.eventName || '这场活动', draft.city, draft.venue, draft.eventDate].filter(Boolean)

  return (
    <section className="planner-module-card">
      <div className="planner-module-header">
        <div>
          <p className="planner-section-title">搭子 / 物料 / 会合</p>
          <h2>把会合物料收好</h2>
          <p className="planner-module-copy">会合点、物料和现场节奏，先想好就不慌。</p>
        </div>
        <div className="planner-module-badge">
          <strong>{result?.socialAdvice ? '可执行' : '待生成'}</strong>
          <span>{draft.meetupPlan || draft.merchPlan ? '已补会合信息' : '补上会合或物料'}</span>
        </div>
      </div>

      {missingBasics.length > 0 ? (
        <section className="planner-tip-card">
          <p className="planner-section-title">当前还缺少</p>
          <ul>
            <li>当前还缺少：{missingBasics.join('、')}。</li>
            <li>场馆信息越完整，会合点和入口提醒会越贴近这场活动。</li>
            <li>
              补齐
              {' '}
              <Link className="planner-inline-link" to="/planner/basic">
                基础信息
              </Link>
              。
            </li>
          </ul>
        </section>
      ) : null}

      {missingBasics.length === 0 ? (
        <section className="planner-summary-card">
          <div className="planner-rule-overview-head">
            <div>
              <p className="planner-section-title">当前活动</p>
              <h3>{draft.eventName || '这场活动'}</h3>
            </div>
            <Link className="planner-secondary-link" to="/planner/basic">
              去改基础信息
            </Link>
          </div>
          <div className="planner-inline-meta-grid">
            <article className="planner-meta-card">
              <span>城市</span>
              <strong>{draft.city || '待补充'}</strong>
            </article>
            <article className="planner-meta-card">
              <span>场馆</span>
              <strong>{draft.venue || '待补充'}</strong>
            </article>
            <article className="planner-meta-card">
              <span>时间</span>
              <strong>{[draft.eventDate, draft.startTime].filter(Boolean).join(' · ') || '待补充'}</strong>
            </article>
          </div>
        </section>
      ) : null}

      <form className="planner-module-form" onSubmit={handleSubmit}>
        <div className="planner-form-grid">
          <label className="planner-field">
            <span>同行情况</span>
            <select onChange={(event) => updateField('companions', Number(event.target.value))} value={String(draft.companions)}>
              {companionOptions.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="planner-field">
            <span>是不是第一次去</span>
            <select onChange={(event) => updateField('isFirstTime', event.target.value === 'true')} value={String(draft.isFirstTime)}>
              <option value="true">第一次去</option>
              <option value="false">不是第一次</option>
            </select>
          </label>

          <label className="planner-field planner-field-wide">
            <span>会合 / 搭子计划</span>
            <input
              onChange={(event) => updateField('meetupPlan', event.target.value)}
              placeholder={meetupExamples[draft.sceneType] || meetupExamples.concert}
              type="text"
              value={draft.meetupPlan}
            />
          </label>

          <label className="planner-field planner-field-wide">
            <span>物料 / 周边计划</span>
            <input
              onChange={(event) => updateField('merchPlan', event.target.value)}
              placeholder={merchExamples[draft.sceneType] || merchExamples.concert}
              type="text"
              value={draft.merchPlan}
            />
          </label>

        </div>

        <details className="planner-collapsible-card">
          <summary>
            <span>补充说明</span>
            <strong>{eventSnapshot.join(' · ') || '把顾虑和特殊情况补在这里'}</strong>
          </summary>
          <label className="planner-field planner-field-wide">
            <span>补充说明</span>
            <textarea
              className="planner-textarea"
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="例如：想在场外领应援物、一个人去怕找不到入口、担心和朋友走散"
              rows={3}
              value={draft.notes}
            />
          </label>
        </details>

        <div className="planner-submit-row">
          <button className="hero-primary-v3" disabled={submitting || !canSubmit} type="submit">
            {submitting ? '正在生成会合与物料建议...' : '生成搭子 / 物料 / 会合建议'}
          </button>
          <span className="planner-submit-hint">会合、物料和 solo 提醒会一起出来。</span>
        </div>
      </form>

      <section className="planner-summary-card planner-summary-actions">
        <Link className="hero-primary-v3" to="/buddy/new" state={{ prefill: buddyPrefill }}>
          直接发布搭子邀约
        </Link>
        <Link className="planner-secondary-link" to="/buddy">
          去找搭子广场
        </Link>
        <Link className="planner-secondary-link" to="/my-buddy-posts">
          看我的发布
        </Link>
      </section>

      {error ? (
        <section className="planner-rule-empty">
          <strong>生成失败</strong>
          <p>{error}</p>
        </section>
      ) : null}

      {result?.socialAdvice ? (
        <div className="planner-rules-layout">
          <section className="planner-rule-overview">
            <div className="planner-rule-overview-head">
              <div>
                <p className="planner-section-title">当前建议</p>
                <h3>{draft.companions > 1 ? '会合点提前定好' : '一个人去也能从容'}</h3>
              </div>
              <div className="planner-rule-meta">
                <span>{draft.companions > 1 ? `${draft.companions} 人同行` : '单人赴约'}</span>
                <span>{draft.isFirstTime ? '第一次参加' : '已有经验'}</span>
              </div>
            </div>

            <p className="planner-rule-summary">
              {draft.meetupPlan || draft.merchPlan
                ? `这次重点是“${draft.meetupPlan || '会合'} / ${draft.merchPlan || '物料'}”。`
                : '会合、周边和进场，别堆到最后一刻。'}
            </p>

            <div className="planner-snapshot-grid">
              {socialSummaryCards.map((item) => (
                <ResultSnapshotCard eyebrow={item.eyebrow} key={item.eyebrow} summary={item.summary} title={item.title} />
              ))}
            </div>

            <div className="planner-transport-grid">
              <article className="planner-transport-card planner-transport-card-product">
                <p className="planner-section-title">会合方向</p>
                <strong>会合点先定死</strong>
                <p>{result.socialAdvice.meetup?.[0] || '尽量约在明显地标。'}</p>
              </article>
              <article className="planner-transport-card planner-transport-card-product">
                <p className="planner-section-title">solo 方向</p>
                <strong>一个人也别慌</strong>
                <p>{result.socialAdvice.solo?.[0] || '入口、洗手间和返程先想好。'}</p>
              </article>
            </div>
          </section>

          <SocialList items={result.socialAdvice.meetup} title="会合提醒" tone="soft" />
          <SocialList items={result.socialAdvice.merch} title="物料 / 周边提醒" tone="safe" />
          <SocialList items={result.socialAdvice.solo} title="一个人去的建议" tone="danger" />

          <section className="planner-summary-card planner-summary-actions">
            <Link className="planner-secondary-link" to={`/battle-books/${result.id}`}>
              打开完整手册
            </Link>
          </section>
        </div>
      ) : null}
    </section>
  )
}
