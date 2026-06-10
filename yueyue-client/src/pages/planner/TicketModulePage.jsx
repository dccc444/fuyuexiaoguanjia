import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { generateBattleBook } from '../../api'
import { usePlannerDraft } from '../../store/plannerDraft'

const ticketAreaExamples = {
  concert: '例如：内场 A 区 / 看台 128 区 / VIP',
  festival: '例如：普通票 / VIP 区 / 主舞台前排',
  match: '例如：主队看台 / 客队看台 / 东看台 3 区',
}

const fallbackEventNames = {
  concert: '这次演唱会赴约',
  festival: '这次音乐节赴约',
  match: '这次球赛赴约',
}

function TicketList({ title, items, tone = 'soft' }) {
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

export function TicketModulePage() {
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

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const eventName = String(draft.eventName || '').trim() || fallbackEventNames[draft.sceneType] || fallbackEventNames.concert
      const data = await generateBattleBook({
        sceneType: draft.sceneType,
        eventName,
        targetName: draft.targetName,
        city: draft.city,
        venue: draft.venue,
        eventDate: draft.eventDate,
        startTime: draft.startTime,
        budgetRange: draft.budgetRange || 'mid',
        hasTicket: draft.hasTicket,
        ticketArea: draft.ticketArea,
        notes: draft.notes,
      })

      setResult(data.item)
    } catch (submitError) {
      setError(submitError.message || '生成门票与位置建议失败，请稍后再试。')
      setResult(null)
    } finally {
      setSubmitting(false)
    }
  }

  function updateField(name, value) {
    updateDraft({ [name]: value })
  }

  return (
    <section className="planner-module-card">
      <div className="planner-module-header">
        <div>
          <p className="planner-section-title">门票与位置模块</p>
          <h2>先把票务状态和分区位置看清楚</h2>
          <p className="planner-module-copy">
            这个模块现在会在当前页补齐最小活动信息，再收集你是否已购票和大致票档 / 看台信息，然后直接返回票务提醒、分区差异、入场建议和散场建议。
          </p>
        </div>
        <div className="planner-module-badge">
          <strong>{result?.ticketAdvice ? `票务 ${result.ticketAdvice.status}` : '待生成'}</strong>
          <span>{draft.ticketArea ? '已补分区信息' : draft.hasTicket ? '已填购票状态' : '先填票务信息'}</span>
        </div>
      </div>

      {missingBasics.length > 0 ? (
        <section className="planner-tip-card">
          <p className="planner-section-title">建议先补充</p>
          <ul>
            <li>当前还缺少：{missingBasics.join('、')}。</li>
            <li>你现在仍然可以先看票务和位置建议，但如果场馆和日期未补齐，结果会偏通用。</li>
            <li>
              如果想让分区和入场建议更像这场活动，建议先去
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
              placeholder="例如：周杰伦演唱会 / 上海德比 / 草莓音乐节"
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
              placeholder="例如：上海体育场、梅奔、工体"
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
            <span>票务状态</span>
            <select onChange={(event) => updateField('hasTicket', event.target.value === 'true')} value={String(draft.hasTicket)}>
              <option value="false">还没买票</option>
              <option value="true">已经买票</option>
            </select>
          </label>

          <label className="planner-field">
            <span>票档 / 看台 / 分区</span>
            <input
              onChange={(event) => updateField('ticketArea', event.target.value)}
              placeholder={ticketAreaExamples[draft.sceneType] || ticketAreaExamples.concert}
              type="text"
              value={draft.ticketArea}
            />
          </label>

          <label className="planner-field planner-field-wide">
            <span>补充说明</span>
            <textarea
              className="planner-textarea"
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="例如：担心看台太高、内场排队久、客队看台怕走错、想早点离场"
              rows={4}
              value={draft.notes}
            />
          </label>
        </div>

        <div className="planner-submit-row">
          <button className="hero-primary-v3" disabled={submitting} type="submit">
            {submitting ? '正在生成票务建议...' : '生成门票与位置建议'}
          </button>
          <span className="planner-submit-hint">先复用现有完整生成接口，但这里只展示票务与位置结果。</span>
        </div>
      </form>

      {error ? (
        <section className="planner-rule-empty">
          <strong>生成失败</strong>
          <p>{error}</p>
        </section>
      ) : null}

      {result?.ticketAdvice || result?.seatAdvice ? (
        <div className="planner-rules-layout">
          <section className="planner-rule-overview">
            <div className="planner-rule-overview-head">
              <div>
                <p className="planner-section-title">票务结论</p>
                <h3>{result.ticketAdvice?.status || (draft.hasTicket ? '已购票' : '未购票')}</h3>
              </div>
              <div className="planner-rule-meta">
                <span>{draft.ticketArea || '未填写分区'}</span>
                <span>{draft.sceneType === 'match' ? '球赛分区' : draft.sceneType === 'festival' ? '音乐节区域' : '演唱会票档'}</span>
              </div>
            </div>

            <p className="planner-rule-summary">
              {result.seatAdvice?.zoneSummary ||
                (draft.ticketArea
                  ? `你这次重点关注的区域是“${draft.ticketArea}”，建议提前确认分区图和对应入口。`
                  : '如果票档信息还不明确，至少提前确认官方入口、分区图和实名规则。')}
            </p>

            <div className="planner-transport-grid">
              <article className="planner-transport-card">
                <p className="planner-section-title">入场方向</p>
                <strong>入口别走错</strong>
                <p>{result.seatAdvice?.entryTips?.[0] || '先确认票面分区和检票口，再开始排队。'}</p>
              </article>
              <article className="planner-transport-card">
                <p className="planner-section-title">离场方向</p>
                <strong>散场提前分流</strong>
                <p>{result.seatAdvice?.exitTips?.[0] || '散场路线最好提前想好，不要在出口再临时决定。'}</p>
              </article>
            </div>
          </section>

          <TicketList items={result.ticketAdvice?.tips} title="票务提醒" tone="soft" />
          <TicketList items={result.seatAdvice?.entryTips} title="入场建议" tone="safe" />
          <TicketList items={result.seatAdvice?.exitTips} title="散场建议" tone="danger" />

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
