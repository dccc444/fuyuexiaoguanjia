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

  return (
    <section className="planner-module-card">
      <div className="planner-module-header">
        <div>
          <p className="planner-section-title">搭子 / 物料 / 会合模块</p>
          <h2>先把会合、领物料和一个人去的节奏想清楚</h2>
          <p className="planner-module-copy">
            这个模块聚焦现场最容易慌乱的三件事：在哪里会合、物料和周边怎么安排、一个人去时要不要提前做准备。现在也可以在这里直接补活动信息，不必回到别的模块。
          </p>
        </div>
        <div className="planner-module-badge">
          <strong>{result?.socialAdvice ? '可执行' : '待生成'}</strong>
          <span>{draft.meetupPlan || draft.merchPlan ? '已补社交信息' : '先填会合或物料计划'}</span>
        </div>
      </div>

      {missingBasics.length > 0 ? (
        <section className="planner-tip-card">
          <p className="planner-section-title">建议先补充</p>
          <ul>
            <li>当前还缺少：{missingBasics.join('、')}。</li>
            <li>你现在仍然可以先生成会合和物料建议，但如果场馆未补齐，会合点和入口提醒会偏通用。</li>
            <li>
              如果想让建议更贴合这场活动，建议先去
              {' '}
              <Link className="planner-inline-link" to="/planner/basic">
                基础信息模块
              </Link>
              {' '}
              补全活动信息。
            </li>
          </ul>
        </section>
      ) : null}

      <form className="planner-module-form" onSubmit={handleSubmit}>
        <div className="planner-form-grid">
          <label className="planner-field">
            <span>活动名称</span>
            <input
              onChange={(event) => updateField('eventName', event.target.value)}
              placeholder="例如：周杰伦演唱会 / 草莓音乐节 / 德比赛"
              type="text"
              value={draft.eventName}
            />
          </label>

          <label className="planner-field">
            <span>活动城市</span>
            <input
              onChange={(event) => updateField('city', event.target.value)}
              placeholder="例如：上海、广州、北京"
              type="text"
              value={draft.city}
            />
          </label>

          <label className="planner-field">
            <span>场馆</span>
            <input
              onChange={(event) => updateField('venue', event.target.value)}
              placeholder="例如：上海体育场、工体、梅奔"
              type="text"
              value={draft.venue}
            />
          </label>

          <label className="planner-field">
            <span>活动日期</span>
            <input
              onChange={(event) => updateField('eventDate', event.target.value)}
              type="date"
              value={draft.eventDate}
            />
          </label>

          <label className="planner-field">
            <span>开始时间</span>
            <input
              onChange={(event) => updateField('startTime', event.target.value)}
              type="time"
              value={draft.startTime}
            />
          </label>

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

          <label className="planner-field planner-field-wide">
            <span>补充说明</span>
            <textarea
              className="planner-textarea"
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="例如：想在场外领应援物、一个人去怕找不到入口、担心和朋友走散"
              rows={4}
              value={draft.notes}
            />
          </label>
        </div>

        <div className="planner-submit-row">
          <button className="hero-primary-v3" disabled={submitting || !canSubmit} type="submit">
            {submitting ? '正在生成会合与物料建议...' : '生成搭子 / 物料 / 会合建议'}
          </button>
          <span className="planner-submit-hint">复用现有手册生成能力，但这里只展示 socialAdvice 结果。</span>
        </div>
      </form>

      <section className="planner-summary-card planner-summary-actions">
        <Link className="hero-primary-v3" to="/buddy/new" state={{ prefill: buddyPrefill }}>
          直接发布找搭子需求
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
                <p className="planner-section-title">模块结论</p>
                <h3>{draft.companions > 1 ? '先把会合点定死' : '一个人去也能很稳'}</h3>
              </div>
              <div className="planner-rule-meta">
                <span>{draft.companions > 1 ? `${draft.companions} 人同行` : '单人赴约'}</span>
                <span>{draft.isFirstTime ? '第一次参加' : '已有经验'}</span>
              </div>
            </div>

            <p className="planner-rule-summary">
              {draft.meetupPlan || draft.merchPlan
                ? `这次重点围绕“${draft.meetupPlan || '会合'} / ${draft.merchPlan || '物料'}”来安排节奏，建议把场外动作和正式入场分开。`
                : '这一块最关键的是把会合点、周边安排和入场节奏拆开，别把所有事情都压到临进场前。'}
            </p>

            <div className="planner-transport-grid">
              <article className="planner-transport-card">
                <p className="planner-section-title">会合方向</p>
                <strong>会合点先定死</strong>
                <p>{result.socialAdvice.meetup?.[0] || '尽量约在地铁口、服务台或固定雕塑这种明显地标。'}</p>
              </article>
              <article className="planner-transport-card">
                <p className="planner-section-title">solo 方向</p>
                <strong>一个人也别慌</strong>
                <p>{result.socialAdvice.solo?.[0] || '先把入口、洗手间和返程路线想好，现场会轻松很多。'}</p>
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
