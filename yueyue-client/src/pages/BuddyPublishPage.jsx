import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { createBuddyPost, getBuddyPost, updateBuddyPost } from '../api'

const intentOptions = [
  '一起进场',
  '一起散场',
  '场外会合',
  '同区看台',
  '一起领物料',
  '拼车',
  '拼房',
  '一个人也想找伴',
]

const intentTagOptions = [
  '一起进场',
  '一起散场',
  '场外会合',
  '同区看台',
  '一起领物料',
  '拼车',
  '拼房',
  '都可以聊',
]

const sceneLabels = {
  concert: '演唱会',
  festival: '音乐节',
  match: '球赛',
}

const contactVisibilityLabels = {
  public: '公开展示',
  after_join: '对方点“我也想一起”后再展示',
}

const defaultForm = {
  sceneType: 'concert',
  eventName: '',
  targetName: '',
  city: '',
  venue: '',
  eventDate: '',
  startTime: '19:30',
  ticketArea: '',
  intentType: '一起进场',
  content: '',
  intentTags: [],
  companionsExpected: 1,
  isFirstTime: true,
  contactType: '微信',
  contactValue: '',
  contactVisibility: 'after_join',
}

export function BuddyPublishPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isEditMode = Boolean(id)
  const prefill = location.state?.prefill || {}
  const [form, setForm] = useState({ ...defaultForm, ...prefill })
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditMode) {
      return undefined
    }

    let active = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const data = await getBuddyPost(id)
        if (active) {
          setForm({ ...defaultForm, ...data.item })
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || '读取帖子内容失败，请稍后再试。')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      active = false
    }
  }, [id, isEditMode])

  const summary = useMemo(
    () => [
      sceneLabels[form.sceneType] || '演出活动',
      form.city || '待定城市',
      form.venue || '待定场馆',
      form.eventDate || '待定日期',
      contactVisibilityLabels[form.contactVisibility] || '联系方式待确认',
    ],
    [form.city, form.contactVisibility, form.eventDate, form.sceneType, form.venue]
  )

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function toggleIntentTag(tag) {
    setForm((current) => ({
      ...current,
      intentTags: current.intentTags.includes(tag)
        ? current.intentTags.filter((item) => item !== tag)
        : [...current.intentTags, tag],
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const data = isEditMode ? await updateBuddyPost(id, form) : await createBuddyPost(form)
      navigate(`/buddy/${data.item.id}`)
    } catch (submitError) {
      setError(submitError.message || (isEditMode ? '保存失败，请稍后再试。' : '发布失败，请稍后再试。'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <section className="planner-rule-empty"><p>正在读取帖子信息...</p></section>
  }

  return (
    <section className="planner-module-card">
      <div className="planner-module-header">
        <div>
          <p className="planner-section-title">{isEditMode ? '编辑搭子邀约' : '找搭子发布'}</p>
          <h2>{isEditMode ? '把这条邀约改顺' : '把这条邀约发出去'}</h2>
          <p className="planner-module-copy">
            {isEditMode
              ? '内容随时改，帖子会一直更新。'
              : '把活动、搭子类型和联系方式写清楚。'}
          </p>
        </div>
        <div className="planner-module-badge">
          <strong>{isEditMode ? '可编辑' : '准备发布'}</strong>
          <span>{isEditMode ? '随时更新帖子内容' : '发出第一条搭子邀约'}</span>
        </div>
      </div>

      <section className="planner-summary-card">
        <div className="planner-rule-overview-head">
          <div>
            <p className="planner-section-title">当前摘要</p>
            <h3>{summary.join(' / ')}</h3>
          </div>
          <Link className="planner-secondary-link" to="/planner/social">
            从会合页带入
          </Link>
        </div>
        <p className="planner-rule-summary">
          只先填会决定匹配的内容，次要信息可以展开后再补。联系方式建议用微信号、小红书号或联系口令。
        </p>
      </section>

      <form className="planner-module-form" onSubmit={handleSubmit}>
        <div className="planner-form-grid planner-form-grid-compact">
          <label className="planner-field">
            <span>活动类型</span>
            <select onChange={(event) => updateField('sceneType', event.target.value)} value={form.sceneType}>
              <option value="concert">演唱会</option>
              <option value="festival">音乐节</option>
              <option value="match">球赛</option>
            </select>
          </label>

          <label className="planner-field">
            <span>想找什么搭子</span>
            <select onChange={(event) => updateField('intentType', event.target.value)} value={form.intentType}>
              {intentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="planner-field">
            <span>活动名称</span>
            <input onChange={(event) => updateField('eventName', event.target.value)} type="text" value={form.eventName} />
          </label>

          <label className="planner-field">
            <span>城市</span>
            <input onChange={(event) => updateField('city', event.target.value)} type="text" value={form.city} />
          </label>

          <label className="planner-field">
            <span>场馆</span>
            <input onChange={(event) => updateField('venue', event.target.value)} type="text" value={form.venue} />
          </label>

          <label className="planner-field">
            <span>日期</span>
            <input onChange={(event) => updateField('eventDate', event.target.value)} type="date" value={form.eventDate} />
          </label>

          <label className="planner-field">
            <span>开始时间</span>
            <input onChange={(event) => updateField('startTime', event.target.value)} type="time" value={form.startTime} />
          </label>

          <label className="planner-field">
            <span>联系方式类型</span>
            <select onChange={(event) => updateField('contactType', event.target.value)} value={form.contactType}>
              <option value="微信">微信</option>
              <option value="小红书">小红书</option>
              <option value="口令">联系口令</option>
              <option value="其他">其他</option>
            </select>
          </label>

          <label className="planner-field planner-field-wide">
            <span>联系方式</span>
            <input
              onChange={(event) => updateField('contactValue', event.target.value)}
              placeholder="例如：微信号 / 小红书号 / 联系口令，不支持手机号和外链"
              type="text"
              value={form.contactValue}
            />
          </label>

          <label className="planner-field planner-field-wide">
            <span>联系方式展示方式</span>
            <select onChange={(event) => updateField('contactVisibility', event.target.value)} value={form.contactVisibility}>
              <option value="after_join">对方点“我也想一起”后再展示</option>
              <option value="public">直接公开展示</option>
            </select>
          </label>

          <label className="planner-field planner-field-wide">
            <span>同行描述</span>
            <textarea
              className="planner-textarea"
              onChange={(event) => updateField('content', event.target.value)}
              placeholder="例如：一个人去，想找同区女生一起进场和散场，最好也会去领物料。"
              rows={3}
              value={form.content}
            />
          </label>
        </div>

        <details className="planner-collapsible-card">
          <summary>
            <span>补充信息</span>
            <strong>票区、人数、标签和更多活动细节</strong>
          </summary>

          <div className="planner-form-grid planner-form-grid-compact">
            <label className="planner-field">
              <span>艺人 / 球队 / 主目标</span>
              <input onChange={(event) => updateField('targetName', event.target.value)} placeholder="例如：张学友 / 某支主队" type="text" value={form.targetName} />
            </label>

            <label className="planner-field">
              <span>票区 / 看台</span>
              <input onChange={(event) => updateField('ticketArea', event.target.value)} placeholder="例如：看台 128 区" type="text" value={form.ticketArea} />
            </label>

            <label className="planner-field">
              <span>想找几个人</span>
              <input min="1" onChange={(event) => updateField('companionsExpected', Number(event.target.value))} type="number" value={form.companionsExpected} />
            </label>

            <label className="planner-field">
              <span>是不是第一次去</span>
              <select onChange={(event) => updateField('isFirstTime', event.target.value === 'true')} value={String(form.isFirstTime)}>
                <option value="true">第一次去</option>
                <option value="false">不是第一次</option>
              </select>
            </label>

            <label className="planner-field planner-field-wide">
              <span>同行标签</span>
              <div className="tag-selector-row">
                {intentTagOptions.map((tag) => (
                  <button
                    className={form.intentTags.includes(tag) ? 'tag-chip active' : 'tag-chip'}
                    key={tag}
                    onClick={() => toggleIntentTag(tag)}
                    type="button"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </label>
          </div>
        </details>

        <div className="planner-submit-row">
          <button className="hero-primary-v3" disabled={submitting} type="submit">
            {submitting ? (isEditMode ? '正在保存...' : '正在发布...') : (isEditMode ? '保存修改' : '发布搭子邀约')}
          </button>
          <Link className="planner-secondary-link" to="/my-buddy-posts">
            我的发布
          </Link>
          {isEditMode ? (
            <Link className="planner-secondary-link" to={`/buddy/${id}`}>
              返回详情
            </Link>
          ) : null}
          <Link className="planner-secondary-link" to="/buddy">
            先去看广场
          </Link>
        </div>
      </form>

      {error ? (
        <section className="planner-rule-empty">
          <strong>{isEditMode ? '保存失败' : '发布失败'}</strong>
          <p>{error}</p>
        </section>
      ) : null}
    </section>
  )
}
