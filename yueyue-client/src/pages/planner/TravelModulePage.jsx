import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPlaceSuggestions, getRoutePlan } from '../../api'
import { usePlannerDraft } from '../../store/plannerDraft'

const preferenceOptions = [
  { value: 'easy', label: '省心优先' },
  { value: 'fast', label: '快一点' },
  { value: 'cheap', label: '省钱优先' },
]

const transportModeOptions = [
  { value: 'transit', label: '公共交通' },
  { value: 'drive', label: '打车 / 驾车' },
  { value: 'walk', label: '步行' },
]

const arrivalBufferOptions = [60, 90, 120]

function TravelList({ title, items, tone = 'soft' }) {
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

function PlaceSuggestionList({ items, onSelect }) {
  if (!items.length) return null

  return (
    <div className="planner-suggestion-list">
      {items.map((item) => {
        const key = `${item.name}-${item.location?.lng}-${item.location?.lat}`
        return (
          <button key={key} className="planner-suggestion-item" onClick={() => onSelect(item)} type="button">
            <strong>{item.name}</strong>
            <span>{[item.district, item.address].filter(Boolean).join(' ') || '未提供详细地址'}</span>
          </button>
        )
      })}
    </div>
  )
}

function RouteCard({ route, recommended = false }) {
  if (!route) return null

  return (
    <article className={`planner-route-card${recommended ? ' planner-route-card-primary' : ''}`}>
      <div className="planner-route-card-head">
        <div>
          <p className="planner-section-title">{route.label}</p>
          <h3>{route.title}</h3>
        </div>
        <div className="planner-tag-list">
          {route.tags?.map((tag) => (
            <span key={tag} className="planner-pill">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="planner-route-meta">
        <div>
          <dt>预计耗时</dt>
          <dd>{route.durationMinutes} 分钟</dd>
        </div>
        <div>
          <dt>路程距离</dt>
          <dd>{route.distanceText}</dd>
        </div>
        <div>
          <dt>建议出发</dt>
          <dd>{route.departureTimeRecommended || '待计算'}</dd>
        </div>
        <div>
          <dt>预计到场</dt>
          <dd>{route.arrivalTimeEstimated || '待计算'}</dd>
        </div>
      </div>

      <TravelList items={route.stepsSummary} title="路线摘要" tone="soft" />
      <TravelList items={route.riskFlags} title="风险提示" tone="danger" />

      {route.navigationUrl ? (
        <div className="planner-route-actions">
          <a className="planner-secondary-link" href={route.navigationUrl} rel="noreferrer" target="_blank">
            打开高德导航
          </a>
        </div>
      ) : null}
    </article>
  )
}

export function TravelModulePage() {
  const { draft, updateDraft } = usePlannerDraft()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(draft.latestRoutePlan)
  const [originSuggestions, setOriginSuggestions] = useState([])
  const [destinationSuggestions, setDestinationSuggestions] = useState([])

  const defaultDestination = useMemo(() => [draft.city, draft.venue].filter(Boolean).join(' '), [draft.city, draft.venue])

  const missingBasics = useMemo(() => {
    const missing = []
    if (!draft.city) missing.push('城市')
    if (!draft.venue) missing.push('场馆')
    if (!draft.eventDate) missing.push('日期')
    if (!draft.startTime) missing.push('开始时间')
    return missing
  }, [draft.city, draft.eventDate, draft.startTime, draft.venue])

  useEffect(() => {
    if (!draft.originInput && draft.departureCity) {
      updateDraft({ originInput: draft.departureCity })
    }
  }, [draft.departureCity, draft.originInput, updateDraft])

  useEffect(() => {
    if (!defaultDestination || draft.destinationInput) return
    updateDraft({ destinationInput: defaultDestination })
  }, [defaultDestination, draft.destinationInput, updateDraft])

  useEffect(() => {
    let ignore = false

    if (!draft.originInput || draft.originInput.trim().length < 2) {
      setOriginSuggestions([])
      return undefined
    }

    const timer = window.setTimeout(async () => {
      try {
        const data = await getPlaceSuggestions({ keyword: draft.originInput, city: draft.city })
        if (!ignore) {
          setOriginSuggestions(data.items || [])
        }
      } catch {
        if (!ignore) {
          setOriginSuggestions([])
        }
      }
    }, 250)

    return () => {
      ignore = true
      window.clearTimeout(timer)
    }
  }, [draft.city, draft.originInput])

  useEffect(() => {
    let ignore = false

    if (!draft.destinationInput || draft.destinationInput.trim().length < 2) {
      setDestinationSuggestions([])
      return undefined
    }

    const timer = window.setTimeout(async () => {
      try {
        const data = await getPlaceSuggestions({ keyword: draft.destinationInput, city: draft.city })
        if (!ignore) {
          setDestinationSuggestions(data.items || [])
        }
      } catch {
        if (!ignore) {
          setDestinationSuggestions([])
        }
      }
    }, 250)

    return () => {
      ignore = true
      window.clearTimeout(timer)
    }
  }, [draft.city, draft.destinationInput])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const data = await getRoutePlan({
        origin: {
          name: draft.originInput || draft.departureCity,
          city: draft.city,
          location: draft.originLocation,
        },
        destination: {
          name: draft.destinationInput || defaultDestination,
          city: draft.city,
          location: draft.destinationLocation,
        },
        eventDate: draft.eventDate,
        startTime: draft.startTime,
        arrivalBufferMinutes: draft.arrivalBufferMinutes,
        travelPreference: draft.travelPreference,
        transportModes: draft.preferredTransportModes,
      })

      setResult(data.item)
      updateDraft({
        departureCity: draft.originInput || draft.departureCity,
        latestRoutePlan: data.item,
      })
    } catch (submitError) {
      setError(submitError.message || '路线规划失败，请稍后再试。')
      setResult(null)
    } finally {
      setSubmitting(false)
    }
  }

  function updateField(name, value) {
    updateDraft({ [name]: value })
  }

  function selectOrigin(item) {
    updateDraft({
      originInput: item.name,
      departureCity: item.name,
      originLocation: item.location,
    })
    setOriginSuggestions([])
  }

  function selectDestination(item) {
    updateDraft({
      destinationInput: item.name,
      destinationLocation: item.location,
    })
    setDestinationSuggestions([])
  }

  function toggleTransportMode(mode) {
    const current = Array.isArray(draft.preferredTransportModes) ? draft.preferredTransportModes : []
    const next = current.includes(mode) ? current.filter((item) => item !== mode) : [...current, mode]
    updateDraft({ preferredTransportModes: next.length ? next : ['transit'] })
  }

  return (
    <section className="planner-module-card planner-module-card-compact">
      <div className="planner-module-header">
        <div>
          <p className="planner-section-title">路线与返程模块</p>
          <h2>先把怎么去规划清楚</h2>
          <p className="planner-module-copy">
            这一版先落地图去程规划：输入出发地、目的地和活动时间后，系统会直接给出推荐路线、预计耗时和建议出发时间。就算你还没补完整草稿，也可以在这里单独完成。
          </p>
        </div>
        <div className="planner-module-badge">
          <strong>{result?.recommended ? '可导航' : '待规划'}</strong>
          <span>{draft.originInput || draft.departureCity ? '已补出发地' : '先填出发地'}</span>
        </div>
      </div>

      {missingBasics.length > 0 ? (
        <section className="planner-tip-card">
          <p className="planner-section-title">建议先补充</p>
          <ul>
            <li>当前还缺少：{missingBasics.join('、')}。</li>
            <li>你现在仍然可以直接做路线规划，但活动时间越完整，建议出发时间就越准确。</li>
            <li>
              如果想让路线规划更贴合这场活动，建议先去
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
        <div className="planner-inline-meta-grid">
          <label className="planner-field planner-field-compact">
            <span>活动城市</span>
            <input
              onChange={(event) => updateField('city', event.target.value)}
              placeholder="例如：上海、广州、北京"
              type="text"
              value={draft.city}
            />
          </label>

          <label className="planner-field planner-field-compact">
            <span>活动开始时间</span>
            <input
              onChange={(event) => updateField('startTime', event.target.value)}
              type="time"
              value={draft.startTime}
            />
          </label>

          <label className="planner-field planner-field-compact">
            <span>活动日期</span>
            <input
              onChange={(event) => updateField('eventDate', event.target.value)}
              inputMode="numeric"
              placeholder="例如：2026-06-18"
              type="text"
              value={draft.eventDate}
            />
          </label>
        </div>

        <div className="planner-form-grid planner-form-grid-travel">
          <div className="planner-field planner-field-stack">
            <label>
              <span>出发地</span>
              <input
                onChange={(event) => updateDraft({
                  originInput: event.target.value,
                  departureCity: event.target.value,
                  originLocation: null,
                })}
                placeholder="例如：苏州站、杭州东站、望京 SOHO"
                type="text"
                value={draft.originInput}
              />
            </label>
            <PlaceSuggestionList items={originSuggestions} onSelect={selectOrigin} />
          </div>

          <div className="planner-field planner-field-stack">
            <label>
              <span>目的地</span>
              <input
                onChange={(event) => updateDraft({
                  destinationInput: event.target.value,
                  destinationLocation: null,
                })}
                placeholder="例如：上海体育场、梅赛德斯-奔驰文化中心"
                type="text"
                value={draft.destinationInput}
              />
            </label>
            <PlaceSuggestionList items={destinationSuggestions} onSelect={selectDestination} />
          </div>

          <label className="planner-field">
            <span>路线偏好</span>
            <select
              onChange={(event) => updateField('travelPreference', event.target.value)}
              value={draft.travelPreference}
            >
              {preferenceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="planner-field">
            <span>到场缓冲</span>
            <select
              onChange={(event) => updateField('arrivalBufferMinutes', Number(event.target.value))}
              value={String(draft.arrivalBufferMinutes)}
            >
              {arrivalBufferOptions.map((minutes) => (
                <option key={minutes} value={String(minutes)}>
                  提前 {minutes} 分钟到场
                </option>
              ))}
            </select>
          </label>

          <label className="planner-field planner-field-wide">
            <span>可用路线方式</span>
            <div className="planner-checkbox-grid">
              {transportModeOptions.map((option) => (
                <label key={option.value} className="planner-checkbox-card">
                  <input
                    checked={draft.preferredTransportModes.includes(option.value)}
                    onChange={() => toggleTransportMode(option.value)}
                    type="checkbox"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </label>

          <label className="planner-field planner-field-wide">
            <span>补充备注</span>
            <textarea
              className="planner-textarea"
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="例如：想优先坐地铁、不能走太远、带老人一起去"
              rows={4}
              value={draft.notes}
            />
          </label>
        </div>

        <div className="planner-submit-row">
          <button
            className="hero-primary-v3"
            disabled={submitting || !(draft.originInput || draft.departureCity).trim() || !(draft.destinationInput || defaultDestination).trim()}
            type="submit"
          >
            {submitting ? '正在规划路线...' : '规划去程路线'}
          </button>
          <span className="planner-submit-hint">当前版本优先接入地图去程规划；返程实时路线和 AI 解释层会在下一阶段补齐。</span>
        </div>
      </form>

      {error ? (
        <section className="planner-rule-empty">
          <strong>生成失败</strong>
          <p>{error}</p>
        </section>
      ) : null}

      {result?.recommended ? (
        <div className="planner-rules-layout">
          <section className="planner-rule-overview">
            <div className="planner-rule-overview-head">
              <div>
                <p className="planner-section-title">去程结论</p>
                <h3>{result.recommended.title}</h3>
              </div>
              <div className="planner-rule-meta">
                <span>{result.origin?.name || draft.originInput || '未填写出发地'}</span>
                <span>{result.destination?.name || draft.destinationInput || '未填写目的地'}</span>
              </div>
            </div>

            <p className="planner-rule-summary">
              推荐按“{result.recommended.title}”去安排这次出发节奏，目标是在 {result.meta?.destinationArrivalTarget || '演出开始前'} 到场，把安检、找入口和现场人流缓冲留出来。
            </p>

            <div className="planner-transport-grid">
              <article className="planner-transport-card">
                <p className="planner-section-title">建议出发</p>
                <strong>{result.recommended.departureTimeRecommended || '请尽早出发'}</strong>
                <p>
                  建议至少提前 {result.meta?.arrivalBufferMinutes || draft.arrivalBufferMinutes} 分钟到场，别把安检、换乘和找入口时间压得太紧。
                </p>
              </article>
              <article className="planner-transport-card">
                <p className="planner-section-title">预计到场</p>
                <strong>{result.recommended.arrivalTimeEstimated || '待计算'}</strong>
                <p>{result.recommended.distanceText}，系统会结合活动开始时间倒推最晚建议出发时点。</p>
              </article>
            </div>
          </section>

          <RouteCard recommended route={result.recommended} />
          {result.alternatives?.length ? (
            <section className="planner-rule-section planner-rule-section-source">
              <div className="planner-rule-section-head">
                <h3>备选路线</h3>
                <span>{result.alternatives.length} 条</span>
              </div>
              <div className="planner-route-grid">
                {result.alternatives.map((route) => (
                  <RouteCard key={route.id} route={route} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
