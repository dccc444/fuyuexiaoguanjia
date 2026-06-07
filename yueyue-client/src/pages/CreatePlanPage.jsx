import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { generateBattleBook, getBattleBook, getVenueRulePreview, listVenueRules } from '../api'

const initialForm = {
  sceneType: 'concert',
  eventName: '',
  targetName: '',
  city: '',
  venue: '',
  eventDate: '',
  startTime: '19:30',
  departureCity: '',
  companions: 1,
  budgetRange: 'mid',
  ticketArea: '',
  travelPreference: 'easy',
  supportGoal: '',
  outfitFocus: '',
  foodPlan: '',
  stayPlan: '',
  merchPlan: '',
  meetupPlan: '',
  isCrossCity: false,
  isFirstTime: true,
  notes: '',
}

const sceneConfig = {
  concert: {
    label: '演唱会',
    title: '把这次见面先安排顺',
    targetLabel: '艺人 / 主演',
    targetPlaceholder: '例如：周杰伦、陶喆、时代少年团',
    searchHint: '先把艺人、城市、场馆和日期定清楚，再把偏好告诉我。',
    highlights: ['应援提醒', '出片安排', '票档分区', '散场返程'],
  },
  festival: {
    label: '音乐节',
    title: '先把这次音乐节玩得轻松一点',
    targetLabel: '最想看的乐队 / 舞台',
    targetPlaceholder: '例如：草莓音乐节主舞台、万能青年旅店',
    searchHint: '音乐节更看重舞台切换、补给和体力节奏，先把主目标圈出来。',
    highlights: ['舞台切换', '补给防晒', '住宿返程', '会合提醒'],
  },
  match: {
    label: '球赛',
    title: '先把比赛这天的路线和节奏理顺',
    targetLabel: '主队 / 比赛',
    targetPlaceholder: '例如：国安、海港、欧冠决赛',
    searchHint: '球赛更看重看台、入口和散场动线，先把场馆和分区定好。',
    highlights: ['看台入口', '观赛节奏', '散场路线', '返程安排'],
  },
}

const sceneOptions = [
  { value: 'concert', label: '演唱会' },
  { value: 'festival', label: '音乐节' },
  { value: 'match', label: '球赛' },
]

const companionOptions = [
  { value: 1, label: '1 人' },
  { value: 2, label: '2 人' },
  { value: 3, label: '3 人' },
  { value: 4, label: '4 人以上' },
]

const budgetOptions = [
  { value: 'low', label: '省一点' },
  { value: 'mid', label: '平衡一点' },
  { value: 'high', label: '舒服一点' },
]

const travelOptions = [
  { value: 'cheap', label: '省钱优先' },
  { value: 'easy', label: '省心优先' },
  { value: 'fast', label: '快一点' },
]

const preferenceOptions = {
  supportGoal: {
    concert: ['好好应援', '拍到满意照片', '顺利散场', '少走弯路'],
    festival: ['多看几个舞台', '轻松玩到最后', '补给别断', '顺利返程'],
    match: ['看台视野稳一点', '进退场更顺', '和朋友会合方便', '赛后快点回去'],
  },
  outfitFocus: {
    concert: ['想出片', '怕排队热', '怕散场冷', '要方便走路'],
    festival: ['想轻便一点', '防晒最重要', '怕下雨', '要耐脏耐走'],
    match: ['想穿主队颜色', '要方便上下看台', '夜场怕冷', '尽量轻松一点'],
  },
  foodPlan: {
    concert: ['进场前先补给', '散场想吃点东西', '只想快速解决', '找适合会合的店'],
    festival: ['吃得轻一点', '补水补电解质', '想找阴凉休息点', '收摊前吃夜宵'],
    match: ['赛前先垫一口', '赛后去吃夜宵', '只想快点回去', '找球迷会合点'],
  },
  stayPlan: {
    concert: ['当天往返', '住场馆附近', '住地铁方便的地方', '还没定住哪里'],
    festival: ['住园区附近', '洗澡休息最重要', '和朋友拼房', '还没定住哪里'],
    match: ['当天往返', '住球场附近', '住交通方便的地方', '还没定住哪里'],
  },
  merchPlan: {
    concert: ['想领物料', '想买周边', '想换小卡', '尽量轻装'],
    festival: ['想逛市集', '想买官方周边', '想领联名物料', '不打算买太多'],
    match: ['想买球衣周边', '想带应援小物', '先看球再说', '不打算逛太久'],
  },
  meetupPlan: {
    concert: ['和朋友会合', '一个人去', '想找搭子', '场外集合再进场'],
    festival: ['和朋友分舞台后再会合', '一个人去', '想找同城搭子', '进场后再会合'],
    match: ['和朋友一起去', '一个人去', '赛后再集合', '提前约固定碰头点'],
  },
}

function SearchBar({ value, onChange, onClear, suggestions, onSelect, placeholder }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useState(null)

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      onSelect(suggestions[activeIndex])
      setIsOpen(false)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="planner-search-bar-wrap">
      <div className="planner-search-bar">
        <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || '搜索艺人、场馆或城市...'}
          type="text"
          value={value}
        />
        {value && (
          <button className="planner-search-clear" onClick={onClear} type="button">
            <svg fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {isOpen && suggestions.length > 0 && (
        <div className="planner-search-suggestions">
          <div className="planner-suggestion-section">
            <div className="planner-suggestion-label">搜索建议</div>
            {suggestions.map((item, index) => (
              <button
                className={`planner-suggestion-item ${index === activeIndex ? 'active' : ''}`}
                key={item.venueId || item.city}
                onClick={() => {
                  onSelect(item)
                  setIsOpen(false)
                }}
                type="button"
              >
                <svg fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="venue-name">{item.venueName || item.city}</span>
                {item.city && <span className="venue-city">{item.city}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TrendingSearches({ onSelect }) {
  const trends = [
    { label: '周杰伦', icon: '🎤' },
    { label: '薛之谦', icon: '🎤' },
    { label: '五月天', icon: '🎤' },
    { label: '林俊杰', icon: '🎤' },
    { label: '上海', icon: '📍' },
    { label: '北京', icon: '📍' },
    { label: '广州', icon: '📍' },
    { label: '深圳', icon: '📍' },
  ]

  return (
    <div className="planner-trending-row">
      {trends.map((trend) => (
        <button
          className="planner-trending-tag"
          key={trend.label}
          onClick={() => onSelect(trend.label)}
          type="button"
        >
          <span>{trend.icon}</span>
          {trend.label}
        </button>
      ))}
    </div>
  )
}

function QuickSearchCard({ icon, label, desc, active, onClick }) {
  return (
    <button className={`planner-quick-search-card ${active ? 'active' : ''}`} onClick={onClick} type="button">
      <div className={`planner-quick-icon ${icon}`}>
        {icon === 'concert' ? '🎤' : icon === 'festival' ? '🎸' : '⚽'}
      </div>
      <div className="planner-quick-info">
        <strong>{label}</strong>
        <span>{desc}</span>
      </div>
    </button>
  )
}

function QuickChoiceRow({ title, options, value, onChange }) {
  return (
    <div className="planner-filter-row">
      <span className="planner-filter-label">{title}</span>
      <div className="choice-chip-row">
        {options.map((option) => (
          <button
            className={String(option.value ?? option) === String(value) ? 'choice-chip active' : 'choice-chip'}
            key={option.value ?? option}
            onClick={() => onChange(option.value ?? option)}
            type="button"
          >
            {option.label ?? option}
          </button>
        ))}
      </div>
    </div>
  )
}

function PreferenceCard({ title, value, options, onChange }) {
  return (
    <article className="planner-preference-card">
      <div className="planner-preference-head">
        <strong>{title}</strong>
        <span>{value || '先选一个最接近你的方向'}</span>
      </div>
      <div className="choice-chip-row">
        {options.map((option) => (
          <button className={value === option ? 'choice-chip active' : 'choice-chip'} key={option} onClick={() => onChange(value === option ? '' : option)} type="button">
            {option}
          </button>
        ))}
      </div>
    </article>
  )
}

function SignalCard({ title, value, tone, note }) {
  return (
    <article className={`signal-card signal-card-${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  )
}

function isFilled(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  return String(value || '').trim().length > 0
}

export function CreatePlanPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const fromId = searchParams.get('from')
  const sceneFromQuery = searchParams.get('scene')
  const initialScene = sceneConfig[sceneFromQuery] ? sceneFromQuery : initialForm.sceneType

  const [form, setForm] = useState({ ...initialForm, sceneType: initialScene })
  const [venueCatalog, setVenueCatalog] = useState([])
  const [venueRulePreview, setVenueRulePreview] = useState(null)
  const [useCustomVenue, setUseCustomVenue] = useState(false)
  const [loadingSourcePlan, setLoadingSourcePlan] = useState(Boolean(fromId))
  const [loadingVenueRule, setLoadingVenueRule] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const sceneInfo = sceneConfig[form.sceneType]

  useEffect(() => {
    listVenueRules()
      .then((data) => setVenueCatalog(data.items || []))
      .catch(() => setVenueCatalog([]))
  }, [])

  useEffect(() => {
    if (!fromId) return undefined

    let active = true

    getBattleBook(fromId)
      .then((data) => {
        if (!active || !data?.item?.input) return
        setForm({ ...initialForm, ...data.item.input })
      })
      .catch(() => {
        if (active) setError('没有找到这份原计划，你可以直接新建一份。')
      })
      .finally(() => {
        if (active) setLoadingSourcePlan(false)
      })

    return () => {
      active = false
    }
  }, [fromId])

  const cityOptions = useMemo(
    () => [...new Set(venueCatalog.filter((item) => item.scenes.includes(form.sceneType)).map((item) => item.city))],
    [form.sceneType, venueCatalog]
  )

  const venueOptions = useMemo(
    () =>
      venueCatalog
        .filter((item) => item.scenes.includes(form.sceneType))
        .filter((item) => (!form.city ? true : item.city === form.city)),
    [form.city, form.sceneType, venueCatalog]
  )

  const featuredCities = cityOptions.slice(0, 8)
  const featuredVenues = venueOptions.slice(0, 6)

  const progress = useMemo(() => {
    const importantFields = [
      'sceneType',
      'eventName',
      'targetName',
      'city',
      'venue',
      'eventDate',
      'departureCity',
      'companions',
      'budgetRange',
      'ticketArea',
      'travelPreference',
      'supportGoal',
      'outfitFocus',
      'foodPlan',
      'stayPlan',
      'merchPlan',
      'meetupPlan',
    ]
    const done = importantFields.filter((field) => isFilled(form[field])).length
    return Math.round((done / importantFields.length) * 100)
  }, [form])

  useEffect(() => {
    if (!form.city || !form.venue) return undefined

    const timer = window.setTimeout(() => {
      getVenueRulePreview({ city: form.city, venue: form.venue, sceneType: form.sceneType })
        .then((data) => setVenueRulePreview(data.item || null))
        .catch(() => setVenueRulePreview(null))
        .finally(() => setLoadingVenueRule(false))
    }, 250)

    return () => window.clearTimeout(timer)
  }, [form.city, form.venue, form.sceneType])

  function updateField(event) {
    const { name, value, type, checked } = event.target
    if (name === 'venue' || name === 'city') {
      setLoadingVenueRule(true)
    }
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function setField(name, value) {
    if (name === 'sceneType' || name === 'venue') {
      setLoadingVenueRule(true)
    }

    setForm((current) => {
      const next = { ...current, [name]: value }

      if (name === 'sceneType') {
        const venueStillValid = venueCatalog.some((item) => item.scenes.includes(value) && item.city === current.city && item.venueName === current.venue)
        if (!venueStillValid) next.venue = ''
      }

      return next
    })
  }

  function handleCityChange(value) {
    setLoadingVenueRule(true)
    setUseCustomVenue(false)
    setForm((current) => ({ ...current, city: value, venue: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const data = await generateBattleBook({
        ...form,
        companions: Number(form.companions),
      })
      navigate(`/battle-books/${data.item.id}`)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const visibleVenuePreview = form.city && form.venue ? venueRulePreview : null

  return (
    <div className="planner-shell-v2">
      <aside className="planner-rail">
        <section className="sidebar-card planner-progress-card">
          <p className="sidebar-title">这次赴约准备中</p>
          <div className="create-progress-meter">
            <div className="create-progress-track">
              <div className="create-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <strong>{progress}%</strong>
          </div>
          <div className="planner-rail-stack">
            <div className="planner-rail-item active">
              <span>01</span>
              <strong>搜索基础信息</strong>
              <p>像订行程一样先把城市、场馆和时间定好。</p>
            </div>
            <div className="planner-rail-item">
              <span>02</span>
              <strong>配置赴约偏好</strong>
              <p>把你更在意的衣食住行票社交圈出来。</p>
            </div>
            <div className="planner-rail-item">
              <span>03</span>
              <strong>生成专属手册</strong>
              <p>系统会把规则、提醒和当天节奏收成一份手册。</p>
            </div>
          </div>
        </section>
      </aside>

      <div className="planner-main">
        <section className="panel-v3 panel-v3-light planner-hero-v2">
          <div>
            <p className="section-kicker-v3">Fan Date Planner</p>
            <h1>{sceneInfo.title}</h1>
            <p className="create-hero-subcopy">{sceneInfo.searchHint}</p>
            {fromId ? (
              <div className="create-inline-tip create-inline-tip-v4">
                <strong>{loadingSourcePlan ? '正在带入上一份安排...' : '这页已经带入上一份安排'}</strong>
                <p>{loadingSourcePlan ? '等一下就好，你不用重新从头填写。' : '你可以直接改场馆、日期、预算或偏好，再生成新的手册。'}</p>
              </div>
            ) : null}
          </div>
          <div className="planner-hero-badges">
            {sceneInfo.highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className="planner-signal-grid">
          <SignalCard
            note={form.city ? '城市已锁定，可以继续精确场馆和规则。' : '先定城市，后面的场馆和交通会更准。'}
            title="当前城市"
            tone="blue"
            value={form.city || '等待选择'}
          />
          <SignalCard
            note={form.venue ? '命中系统场馆后，规则预览会持续跟上。' : '优先从系统场馆里点选，别先手填。'}
            title="场馆状态"
            tone="mint"
            value={form.venue || '等待场馆'}
          />
          <SignalCard
            note={form.supportGoal ? '你最在意的目标会直接进入最终手册。' : '先圈一个最在意的方向，手册会更像为你写。'}
            title="赴约重点"
            tone="orange"
            value={form.supportGoal || '等待偏好'}
          />
        </section>

        <form className="planner-form-v2" onSubmit={handleSubmit}>
          <section className="panel-v3 panel-v3-light planner-search-panel-v5">
            <div className="planner-search-hero-v5">
              <div className="section-head-v3">
                <div>
                  <p className="section-kicker-v3">强搜索面板</p>
                  <h2>先把这次赴约的基础信息搜清楚</h2>
                </div>
              </div>

              {/* 场景类型选择 */}
              <div className="planner-quick-search-grid" style={{ marginBottom: '20px' }}>
                <QuickSearchCard
                  active={form.sceneType === 'concert'}
                  desc="艺人演唱会"
                  icon="concert"
                  label="演唱会"
                  onClick={() => setField('sceneType', 'concert')}
                />
                <QuickSearchCard
                  active={form.sceneType === 'festival'}
                  desc="音乐节/舞台"
                  icon="festival"
                  label="音乐节"
                  onClick={() => setField('sceneType', 'festival')}
                />
                <QuickSearchCard
                  active={form.sceneType === 'match'}
                  desc="球赛/体育"
                  icon="match"
                  label="球赛"
                  onClick={() => setField('sceneType', 'match')}
                />
              </div>

              {/* 热门搜索 */}
              <TrendingSearches
                onSelect={(keyword) => {
                  const matchedCity = cityOptions.find((c) => c.includes(keyword))
                  if (matchedCity) handleCityChange(matchedCity)
                  else setForm((f) => ({ ...f, eventName: keyword }))
                }}
              />

              {/* 主搜索栏 */}
              <SearchBar
                onChange={(val) => setForm((f) => ({ ...f, eventName: val }))}
                onClear={() => setForm((f) => ({ ...f, eventName: '' }))}
                placeholder={`搜索${sceneInfo.label}名称、场馆或城市...`}
                suggestions={[]}
                value={form.eventName}
              />
            </div>

            <QuickChoiceRow title="活动类型" options={sceneOptions} value={form.sceneType} onChange={(value) => setField('sceneType', value)} />

            <div className="planner-form-grid-v5">
              <label className="form-field-v3">
                <span>活动名称</span>
                <input name="eventName" onChange={updateField} placeholder="例如：周杰伦上海演唱会" required value={form.eventName} />
              </label>
              <label className="form-field-v3">
                <span>{sceneInfo.targetLabel}</span>
                <input name="targetName" onChange={updateField} placeholder={sceneInfo.targetPlaceholder} value={form.targetName} />
              </label>
              <label className="form-field-v3">
                <span>城市</span>
                <select name="city" onChange={(event) => handleCityChange(event.target.value)} required value={form.city}>
                  <option value="">请选择城市</option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field-v3">
                <span>场馆</span>
                {!useCustomVenue ? (
                  <select disabled={!form.city || venueOptions.length === 0} name="venue" onChange={updateField} required value={form.venue}>
                    <option value="">{form.city ? '请选择场馆' : '先选城市'}</option>
                    {venueOptions.map((venue) => (
                      <option key={venue.venueId} value={venue.venueName}>
                        {venue.venueName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input name="venue" onChange={updateField} placeholder="输入场馆全名" required value={form.venue} />
                )}
              </label>
              <label className="form-field-v3">
                <span>活动日期</span>
                <input name="eventDate" onChange={updateField} required type="date" value={form.eventDate} />
              </label>
              <label className="form-field-v3">
                <span>开始时间</span>
                <input name="startTime" onChange={updateField} type="time" value={form.startTime} />
              </label>
            </div>

            <QuickChoiceRow title="热门城市" options={featuredCities} value={form.city} onChange={handleCityChange} />

            {form.city && featuredVenues.length > 0 ? (
              <div className="planner-venue-strip">
                <div className="planner-filter-row">
                  <span className="planner-filter-label">主流场馆优先直接选</span>
                </div>
                <div className="planner-venue-grid">
                  {featuredVenues.map((venue) => (
                    <button className={form.venue === venue.venueName ? 'planner-venue-card active' : 'planner-venue-card'} key={venue.venueId} onClick={() => setField('venue', venue.venueName)} type="button">
                      <strong>{venue.venueName}</strong>
                      <span>{venue.city}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="create-inline-tip create-inline-tip-v4">
              <strong>系统场馆优先</strong>
              <p>
                {useCustomVenue ? '当前是手动输入模式。' : '优先选系统已有场馆，规则预览会更完整。'}{' '}
                <button className="inline-link-button" onClick={() => setUseCustomVenue((current) => !current)} type="button">
                  {useCustomVenue ? '切回场馆选择' : '没有的话再手动输入'}
                </button>
              </p>
            </div>
          </section>

          <section className="panel-v3 panel-v3-light planner-config-panel">
            <div className="section-head-v3">
              <div>
                <p className="section-kicker-v3">AI 偏好配置</p>
                <h2>把你的预算、路线和赴约重点告诉我</h2>
              </div>
            </div>

            <div className="planner-config-grid">
              <div className="planner-config-group">
                <QuickChoiceRow title="同行人数" options={companionOptions} value={form.companions} onChange={(value) => setField('companions', value)} />
                <QuickChoiceRow title="预算倾向" options={budgetOptions} value={form.budgetRange} onChange={(value) => setField('budgetRange', value)} />
                <QuickChoiceRow title="出行偏好" options={travelOptions} value={form.travelPreference} onChange={(value) => setField('travelPreference', value)} />
              </div>

              <div className="planner-config-group">
                <label className="form-field-v3">
                  <span>出发地</span>
                  <input name="departureCity" onChange={updateField} placeholder="例如：杭州" value={form.departureCity} />
                </label>
                <label className="form-field-v3">
                  <span>票档 / 看台 / 分区</span>
                  <input name="ticketArea" onChange={updateField} placeholder="例如：内场 / 523 区 / A 看台" value={form.ticketArea} />
                </label>
                <div className="planner-toggle-row">
                  <label className="form-check-v3">
                    <input checked={form.isCrossCity} name="isCrossCity" onChange={updateField} type="checkbox" />
                    <span>这次要跨城</span>
                  </label>
                  <label className="form-check-v3">
                    <input checked={form.isFirstTime} name="isFirstTime" onChange={updateField} type="checkbox" />
                    <span>第一次去这类活动</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="panel-v3 panel-v3-light planner-preferences-panel">
            <div className="section-head-v3">
              <div>
                <p className="section-kicker-v3">衣食住行票社交</p>
                <h2>别自己打长表单，直接把最接近你的选项点出来</h2>
              </div>
            </div>

            <div className="planner-preferences-grid">
              <PreferenceCard title="这次最想完成什么" value={form.supportGoal} options={preferenceOptions.supportGoal[form.sceneType]} onChange={(value) => setField('supportGoal', value)} />
              <PreferenceCard title="穿搭 / 妆造关注点" value={form.outfitFocus} options={preferenceOptions.outfitFocus[form.sceneType]} onChange={(value) => setField('outfitFocus', value)} />
              <PreferenceCard title="吃喝补给怎么安排" value={form.foodPlan} options={preferenceOptions.foodPlan[form.sceneType]} onChange={(value) => setField('foodPlan', value)} />
              <PreferenceCard title="住哪里更顺手" value={form.stayPlan} options={preferenceOptions.stayPlan[form.sceneType]} onChange={(value) => setField('stayPlan', value)} />
              <PreferenceCard title="物料 / 周边计划" value={form.merchPlan} options={preferenceOptions.merchPlan[form.sceneType]} onChange={(value) => setField('merchPlan', value)} />
              <PreferenceCard title="搭子 / 会合计划" value={form.meetupPlan} options={preferenceOptions.meetupPlan[form.sceneType]} onChange={(value) => setField('meetupPlan', value)} />
            </div>

            <label className="form-field-v3 form-field-wide-v3">
              <span>还有什么要补充</span>
              <textarea
                name="notes"
                onChange={updateField}
                placeholder="例如：散场后赶高铁、想早一点领物料、要带相机、希望和朋友先会合。"
                rows="4"
                value={form.notes}
              />
            </label>
          </section>

          <section className="panel-v3 panel-v3-light venue-preview-panel venue-preview-panel-v4">
            <div className="section-head-v3">
              <div>
                <p className="section-kicker-v3">场馆规则预览</p>
                <h2>
                  {loadingVenueRule
                    ? '正在替你翻这座场馆的规则...'
                    : visibleVenuePreview
                      ? '这座场馆最容易翻车的地方，我先替你查出来了'
                      : '选好城市和场馆后，我会先把禁带、入口和返程提醒翻出来'}
                </h2>
              </div>
            </div>

            {visibleVenuePreview ? (
              <div className="venue-preview-grid">
                <article className="venue-preview-card venue-preview-main">
                  <strong>{visibleVenuePreview.venueName}</strong>
                  <p>{visibleVenuePreview.summary}</p>
                  <div className="venue-rule-chip-row">
                    <span className="venue-rule-chip">{visibleVenuePreview.city}</span>
                    <span className="venue-rule-chip">{visibleVenuePreview.matchType === 'exact' ? '精确命中' : '模糊命中'}</span>
                    <span className="venue-rule-chip">核验于 {visibleVenuePreview.lastVerified}</span>
                  </div>
                </article>
                <article className="venue-preview-card">
                  <strong>我会优先提醒你</strong>
                  <ul className="bullet-list dreamy-list">
                    {visibleVenuePreview.entryTips.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
                <article className="venue-preview-card">
                  <strong>这些先别乱带</strong>
                  <ul className="bullet-list dreamy-list">
                    {visibleVenuePreview.prohibitedItems.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </div>
            ) : (
              <div className="venue-preview-empty">
                <strong>先从系统场馆里选</strong>
                <p>优先命中系统已有场馆，后面生成出来的手册会更像一份真的能带着出门的攻略。</p>
              </div>
            )}
          </section>

          <section className="panel-v3 panel-v3-light planner-submit-panel">
            <div>
              <p className="section-kicker-v3">准备好了就生成</p>
              <h2>让系统把这次赴约整理成一份 itinerary summary + 攻略手册</h2>
              <p className="section-subcopy-v3">完成度越高，最后那份手册就越像真正为你写的版本。</p>
            </div>
            <div className="planner-submit-actions">
              <div className="planner-submit-badge">当前完成度 {progress}%</div>
              <button className="hero-primary-v3" disabled={submitting} type="submit">
                {submitting ? '正在生成你的赴约手册...' : '生成我的赴约手册'}
              </button>
            </div>
            {error ? <p className="error-text">{error}</p> : null}
          </section>
        </form>
      </div>
    </div>
  )
}
