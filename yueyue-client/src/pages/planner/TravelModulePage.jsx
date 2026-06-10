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

const crossCityModeOptions = [
  { value: 'train', label: '火车 / 高铁' },
  { value: 'flight', label: '飞机' },
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

function ResultSnapshotCard({ eyebrow, title, summary }) {
  return (
    <article className="planner-snapshot-card">
      <span>{eyebrow}</span>
      <strong>{title}</strong>
      <p>{summary}</p>
    </article>
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

function JourneyStage({ title, subtitle, summary, route, meta, children }) {
  return (
    <article className="planner-journey-stage">
      <div className="planner-journey-marker" aria-hidden="true" />
      <div className="planner-journey-body">
        <div className="planner-rule-overview-head">
          <div>
            <p className="planner-section-title">{title}</p>
            <h3>{route?.title || subtitle}</h3>
          </div>
          {meta ? <div className="planner-rule-meta">{meta}</div> : null}
        </div>

        {summary ? <p className="planner-rule-summary">{summary}</p> : null}
        {children}
        {route ? <RouteCard recommended route={route} /> : null}
      </div>
    </article>
  )
}

export function TravelModulePage() {
  const { draft, updateDraft } = usePlannerDraft()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(draft.latestRoutePlan)
  const [crossCityResult, setCrossCityResult] = useState(draft.latestCrossCityPlan)
  const [originSuggestions, setOriginSuggestions] = useState([])
  const [destinationSuggestions, setDestinationSuggestions] = useState([])

  const defaultDestination = useMemo(() => [draft.city, draft.venue].filter(Boolean).join(' '), [draft.city, draft.venue])
  const localTransportModes = useMemo(
    () => (draft.isCrossCity ? ['transit'] : draft.preferredTransportModes),
    [draft.isCrossCity, draft.preferredTransportModes],
  )

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
      updateDraft({ originInput: draft.isCrossCity ? '' : draft.departureCity })
    }
  }, [draft.departureCity, draft.isCrossCity, draft.originInput, updateDraft])

  useEffect(() => {
    if (!defaultDestination || draft.destinationInput) return
    updateDraft({ destinationInput: defaultDestination })
  }, [defaultDestination, draft.destinationInput, updateDraft])

  useEffect(() => {
    if (!draft.isCrossCity) return
    if (draft.preferredTransportModes.length === 1 && draft.preferredTransportModes[0] === 'transit') return
    updateDraft({ preferredTransportModes: ['transit'] })
  }, [draft.isCrossCity, draft.preferredTransportModes, updateDraft])

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
        origin: draft.originInput
          ? {
              name: draft.originInput,
              city: draft.city,
              location: draft.originLocation,
            }
          : null,
        destination: {
          name: draft.destinationInput || defaultDestination,
          city: draft.city,
          location: draft.destinationLocation,
        },
        departureCity: draft.departureCity,
        isCrossCity: draft.isCrossCity,
        crossCityTransportModes: draft.crossCityTransportModes,
        eventDate: draft.eventDate,
        startTime: draft.startTime,
        arrivalBufferMinutes: draft.arrivalBufferMinutes,
        travelPreference: draft.travelPreference,
        transportModes: localTransportModes,
      })

      setResult(data.item)
      setCrossCityResult(data.item.crossCity || null)
      updateDraft({
        departureCity: draft.departureCity,
        latestRoutePlan: data.item,
        latestCrossCityPlan: data.item.crossCity || null,
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
      arrivalHub: item.name,
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

  function toggleCrossCityMode(mode) {
    const current = Array.isArray(draft.crossCityTransportModes) ? draft.crossCityTransportModes : []
    const next = current.includes(mode) ? current.filter((item) => item !== mode) : [...current, mode]
    updateDraft({ crossCityTransportModes: next.length ? next : ['train'] })
  }

  const arrivalTarget = result?.meta?.destinationArrivalTarget || '演出开始前'
  const localRouteSummaryCards = result?.recommended
    ? [
        {
          eyebrow: '建议出发',
          title: result.recommended.departureTimeRecommended || '尽量提早出发',
          summary: `至少提前 ${result.meta?.arrivalBufferMinutes || draft.arrivalBufferMinutes} 分钟到场。`,
        },
        {
          eyebrow: '预计到场',
          title: result.recommended.arrivalTimeEstimated || '待计算',
          summary: `${result.recommended.distanceText}，赶在 ${arrivalTarget} 前。`,
        },
        {
          eyebrow: '推荐方式',
          title: result.recommended.title,
          summary: result.recommended.stepsSummary?.[0] || '按你的偏好推荐。',
        },
      ]
    : []

  const crossCitySummaryCards = crossCityResult?.recommended
    ? [
        {
          eyebrow: '跨城方式',
          title: crossCityResult.recommended.title,
          summary: crossCityResult.summary || '先到城，再接第二段。',
        },
        {
          eyebrow: '建议出发',
          title: crossCityResult.recommended.departureTimeRecommended || '尽量提早出发',
          summary: `${crossCityResult.originCity} -> ${crossCityResult.destinationCity}`,
        },
        {
          eyebrow: '预计到达',
          title: crossCityResult.recommended.arrivalTimeEstimated || '待计算',
          summary: crossCityResult.recommended.distanceText || '到城后再接市内路线。',
        },
      ]
    : []

  return (
    <section className="planner-module-card planner-module-card-compact">
      <div className="planner-module-header">
        <div>
          <p className="planner-section-title">路线与返程</p>
          <h2>把到场路线收好</h2>
          <p className="planner-module-copy">跨城先看大交通，到城后再看去场馆。</p>
        </div>
        <div className="planner-module-badge">
          <strong>{result?.recommended ? '可导航' : '待规划'}</strong>
          <span>{draft.originInput || draft.departureCity ? '出发地已填' : '先填出发地'}</span>
        </div>
      </div>

      {missingBasics.length > 0 ? (
        <section className="planner-tip-card">
          <p className="planner-section-title">当前还缺少</p>
          <ul>
            <li>当前还缺少：{missingBasics.join('、')}。</li>
            <li>活动时间越完整，建议出发时间就越准确。</li>
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

      <form className="planner-module-form" onSubmit={handleSubmit}>
        <div className="planner-inline-meta-grid">
          <label className="planner-field planner-field-compact">
            <span>是否跨城</span>
            <select
              onChange={(event) => updateField('isCrossCity', event.target.value === 'true')}
              value={String(draft.isCrossCity)}
            >
              <option value="false">同城出行</option>
              <option value="true">跨城赴约</option>
            </select>
          </label>

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
            <span>活动日期</span>
            <input
              onChange={(event) => updateField('eventDate', event.target.value)}
              inputMode="numeric"
              placeholder="例如：2026-06-18"
              type="text"
              value={draft.eventDate}
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
        </div>

        <div className="planner-form-grid planner-form-grid-travel">
          <label className="planner-field">
            <span>{draft.isCrossCity ? '出发城市' : '所在城市'}</span>
            <input
              onChange={(event) => updateDraft({ departureCity: event.target.value })}
              placeholder={draft.isCrossCity ? '例如：杭州、苏州、北京' : '例如：上海'}
              type="text"
              value={draft.departureCity}
            />
            <p className="planner-field-hint">
              {draft.isCrossCity ? '这里填出发城市后，会优先推荐合适的火车或飞机。' : '这里填你现在所在的城市，下面再补具体出发地点。'}
            </p>
          </label>

          <div className="planner-field planner-field-stack">
            <label>
              <span>{draft.isCrossCity ? '到达活动城市后的出发点' : '出发地'}</span>
              <input
                onChange={(event) => updateDraft({
                  originInput: event.target.value,
                  originLocation: null,
                })}
                placeholder={draft.isCrossCity ? '例如：虹桥火车站、白云机场、酒店' : '例如：苏州站、杭州东站、望京 SOHO'}
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

          {draft.isCrossCity ? (
            <label className="planner-field planner-field-wide">
              <span>跨城大交通可接受方式</span>
              <div className="planner-checkbox-grid">
                {crossCityModeOptions.map((option) => (
                  <label key={option.value} className="planner-checkbox-card">
                    <input
                      checked={draft.crossCityTransportModes.includes(option.value)}
                      onChange={() => toggleCrossCityMode(option.value)}
                      type="checkbox"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </label>
          ) : null}

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

          {draft.isCrossCity ? (
            <section className="planner-field planner-field-wide planner-stage-note">
              <span>第二段市内路线</span>
              <p className="planner-field-hint">
                跨城模式下，第二段默认只规划到达活动城市后的公共交通，不再把火车 / 飞机那一段混进同一条路线里。
              </p>
            </section>
          ) : (
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
          )}

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
            disabled={
              submitting ||
              !((draft.isCrossCity ? draft.departureCity : draft.originInput || draft.departureCity) || '').trim() ||
              !(draft.destinationInput || defaultDestination).trim()
            }
            type="submit"
          >
            {submitting ? '正在规划路线...' : draft.isCrossCity ? '生成两段路线方案' : '规划去程路线'}
          </button>
          <span className="planner-submit-hint">
            {draft.isCrossCity
              ? '先看跨城，再看市内。'
              : '会直接给你去程建议。'}
          </span>
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
          {draft.isCrossCity ? (
            <section className="planner-rule-overview">
              <div className="planner-rule-overview-head">
                <div>
                  <p className="planner-section-title">两段路线时间轴</p>
                  <h3>先跨城，再到场</h3>
                </div>
                <div className="planner-rule-meta">
                  <span>{draft.departureCity || crossCityResult?.originCity || '出发城市未填'}</span>
                  <span>{result.destination?.name || draft.destinationInput || '目的地未填写'}</span>
                </div>
              </div>

              <div className="planner-snapshot-grid">
                {crossCitySummaryCards.map((item) => (
                  <ResultSnapshotCard eyebrow={item.eyebrow} key={item.eyebrow} summary={item.summary} title={item.title} />
                ))}
              </div>

              <div className="planner-journey-timeline">
                {crossCityResult?.recommended ? (
                  <JourneyStage
                    title="第一段 · 跨城出行"
                    route={crossCityResult.recommended}
                    summary={crossCityResult.summary}
                    meta={
                      <>
                        <span>{crossCityResult.originCity}</span>
                        <span>{crossCityResult.destinationCity}</span>
                      </>
                    }
                  >
                    {crossCityResult.alternatives?.length ? (
                      <section className="planner-rule-section planner-rule-section-source">
                        <div className="planner-rule-section-head">
                          <h3>第一段备选</h3>
                          <span>{crossCityResult.alternatives.length} 条</span>
                        </div>
                        <div className="planner-route-grid">
                          {crossCityResult.alternatives.map((route) => (
                            <RouteCard key={route.id} route={route} />
                          ))}
                        </div>
                      </section>
                    ) : null}
                  </JourneyStage>
                ) : null}

                <JourneyStage
                  title="第二段 · 市内到场路线"
                  route={result.recommended}
                  summary={`到 ${draft.city || '活动城市'} 后，按“${result.recommended.title}”去场馆。`}
                  meta={
                    <>
                      <span>{result.origin?.name || draft.originInput || '未填写到达点'}</span>
                      <span>{result.destination?.name || draft.destinationInput || '未填写目的地'}</span>
                    </>
                  }
                >
                  <div className="planner-snapshot-grid">
                    {localRouteSummaryCards.map((item) => (
                      <ResultSnapshotCard eyebrow={item.eyebrow} key={`local-${item.eyebrow}`} summary={item.summary} title={item.title} />
                    ))}
                  </div>
                  <div className="planner-transport-grid">
                    <article className="planner-transport-card planner-transport-card-product">
                      <p className="planner-section-title">建议出发</p>
                      <strong>{result.recommended.departureTimeRecommended || '请尽早出发'}</strong>
                      <p>至少提前 {result.meta?.arrivalBufferMinutes || draft.arrivalBufferMinutes} 分钟到场。</p>
                    </article>
                    <article className="planner-transport-card planner-transport-card-product">
                      <p className="planner-section-title">预计到场</p>
                      <strong>{result.recommended.arrivalTimeEstimated || '待计算'}</strong>
                      <p>{result.recommended.distanceText}</p>
                    </article>
                  </div>
                </JourneyStage>
              </div>
            </section>
          ) : (
            <>
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
                  按“{result.recommended.title}”出发，赶在 {arrivalTarget} 前到场。
                </p>

                <div className="planner-snapshot-grid">
                  {localRouteSummaryCards.map((item) => (
                    <ResultSnapshotCard eyebrow={item.eyebrow} key={item.eyebrow} summary={item.summary} title={item.title} />
                  ))}
                </div>

                <div className="planner-transport-grid">
                  <article className="planner-transport-card planner-transport-card-product">
                    <p className="planner-section-title">建议出发</p>
                    <strong>{result.recommended.departureTimeRecommended || '请尽早出发'}</strong>
                    <p>至少提前 {result.meta?.arrivalBufferMinutes || draft.arrivalBufferMinutes} 分钟到场。</p>
                  </article>
                  <article className="planner-transport-card planner-transport-card-product">
                    <p className="planner-section-title">预计到场</p>
                    <strong>{result.recommended.arrivalTimeEstimated || '待计算'}</strong>
                    <p>{result.recommended.distanceText}</p>
                  </article>
                </div>
              </section>

              <RouteCard recommended route={result.recommended} />
            </>
          )}

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

      {!result?.recommended && crossCityResult?.recommended ? (
        <div className="planner-rules-layout">
          <section className="planner-rule-overview">
            <div className="planner-rule-overview-head">
              <div>
                <p className="planner-section-title">跨城出行结论</p>
                <h3>{crossCityResult.recommended.title}</h3>
              </div>
              <div className="planner-rule-meta">
                <span>{crossCityResult.originCity}</span>
                <span>{crossCityResult.destinationCity}</span>
              </div>
            </div>

            <p className="planner-rule-summary">{crossCityResult.summary}</p>
            <div className="planner-snapshot-grid">
              {crossCitySummaryCards.map((item) => (
                <ResultSnapshotCard eyebrow={item.eyebrow} key={`cross-${item.eyebrow}`} summary={item.summary} title={item.title} />
              ))}
            </div>
            <div className="planner-journey-timeline">
              <JourneyStage
                title="第一段 · 跨城出行"
                route={crossCityResult.recommended}
                summary="跨城大交通已经先整理好了，补上到达后的出发点，就能继续看第二段市内路线。"
                meta={
                  <>
                    <span>{crossCityResult.originCity}</span>
                    <span>{crossCityResult.destinationCity}</span>
                  </>
                }
              >
                {crossCityResult.alternatives?.length ? (
                  <section className="planner-rule-section planner-rule-section-source">
                    <div className="planner-rule-section-head">
                      <h3>第一段备选</h3>
                      <span>{crossCityResult.alternatives.length} 条</span>
                    </div>
                    <div className="planner-route-grid">
                      {crossCityResult.alternatives?.map((route) => (
                        <RouteCard key={route.id} route={route} />
                      ))}
                    </div>
                  </section>
                ) : null}
              </JourneyStage>
              <article className="planner-journey-stage planner-journey-stage-pending">
                <div className="planner-journey-marker" aria-hidden="true" />
                <div className="planner-journey-body">
                  <p className="planner-section-title">第二段 · 市内到场路线</p>
                  <h3>等待补充到达后的出发点</h3>
                  <p className="planner-rule-summary">例如火车站、机场或酒店。补完后就能生成从到达点到场馆的公共交通方案。</p>
                </div>
              </article>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}
