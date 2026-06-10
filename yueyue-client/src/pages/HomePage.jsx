import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listBattleBooks, listBuddyPosts } from '../api'

const activityTypes = [
  { key: 'concert', label: '演唱会' },
  { key: 'festival', label: '音乐节' },
  { key: 'match', label: '球赛' },
  { key: 'other', label: '其他' },
]

function sceneLabel(sceneType) {
  if (sceneType === 'festival') return '音乐节'
  if (sceneType === 'match') return '球赛'
  return '演唱会'
}

const sceneDescriptions = {
  concert: {
    title: '找同场搭子，也把这场行程一次收好',
    copy: '从演唱会搭子到路线、票务和预算，一次打开就能接着安排。',
    plannerTitle: '一键收好这场安排',
    plannerNote: '路线、票务、预算一站式整理',
    buddyNote: '匹配同城同场的人，一起进场或散场',
    featuredTitle: '热门演唱会',
    featuredCopy: '同场的人、路线和场馆提醒，都在这里一起出现。',
  },
  festival: {
    title: '找同频的人，也把音乐节节奏先排顺',
    copy: '会合、物料、返程和住宿，一页里就能先看清。',
    plannerTitle: '一键收好这场音乐节',
    plannerNote: '多日安排、物料、返程更容易统筹',
    buddyNote: '适合同城拼住、拼车、一起领物料',
    featuredTitle: '热门音乐节',
    featuredCopy: '同场的人、会合点和返程节奏，都先看一眼。',
  },
  match: {
    title: '找同主队的人，也把这场球赛安排明白',
    copy: '从看台、进场路线到散场返程，都能提前排好。',
    plannerTitle: '一键收好这场球赛',
    plannerNote: '进场路线、散场返程和位置更清楚',
    buddyNote: '先找同主队、同看台、同城市的搭子',
    featuredTitle: '热门球赛',
    featuredCopy: '同场同主队的人和散场节奏，都在这里同步看。',
  },
  other: {
    title: '找同行的人，也把这次活动安排顺',
    copy: '同行、路线和提醒，一起收进同一个移动端助手里。',
    plannerTitle: '一键收好这次活动',
    plannerNote: '活动、路线和预算一起看',
    buddyNote: '看看有没有同城同场的人也想一起去',
    featuredTitle: '热门活动',
    featuredCopy: '先看最近活动，再选现在最想马上处理的那一块。',
  },
}

const trustItems = [
  { title: '实名认证标识', note: '身份更清楚，见面更安心。'},
  { title: '举报与安全反馈', note: '遇到不舒服的情况，随时处理。'},
  { title: '公开场所建议', note: '第一次见面，尽量约在公开场所。'},
]

function sceneMatches(sceneType, activeType) {
  if (activeType === 'other') {
    return !['concert', 'festival', 'match'].includes(sceneType)
  }
  return sceneType === activeType
}

function buildBuddySummary(item) {
  const tags = Array.isArray(item.intentTags) ? item.intentTags.filter(Boolean).slice(0, 2) : []
  if (tags.length) {
    return tags.join(' · ')
  }
  return item.intentType || '想找同场搭子'
}

function buildBuddySnippet(item) {
  const content = String(item.content || '').trim()
  if (!content) return '看看这条搭子信息，确认是不是同场同频的人。'
  return content.length > 48 ? `${content.slice(0, 48)}...` : content
}

function dataSlice(items, size) {
  return Array.isArray(items) ? items.slice(0, size) : []
}

export function HomePage() {
  const navigate = useNavigate()
  const [recentTrips, setRecentTrips] = useState([])
  const [buddyPosts, setBuddyPosts] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [loadingBuddy, setLoadingBuddy] = useState(true)
  const [activeType, setActiveType] = useState('concert')

  useEffect(() => {
    let ignore = false

    async function loadHomeData() {
      try {
        const [tripData, buddyData] = await Promise.all([listBattleBooks(), listBuddyPosts()])
        if (!ignore) {
          setRecentTrips(dataSlice(tripData.items, 6))
          setBuddyPosts(dataSlice(buddyData.items, 6))
        }
      } catch {
        if (!ignore) {
          setRecentTrips([])
          setBuddyPosts([])
        }
      } finally {
        if (!ignore) {
          setLoadingRecent(false)
          setLoadingBuddy(false)
        }
      }
    }

    loadHomeData()

    return () => {
      ignore = true
    }
  }, [])

  const sceneMeta = sceneDescriptions[activeType] || sceneDescriptions.concert
  const filteredRecentTrips = recentTrips.filter((trip) => sceneMatches(trip.input?.sceneType, activeType))
  const displayedTrips = filteredRecentTrips.length ? filteredRecentTrips.slice(0, 2) : recentTrips.slice(0, 2)
  const filteredBuddyPosts = buddyPosts.filter((item) => sceneMatches(item.sceneType, activeType))
  const displayedBuddyPosts = filteredBuddyPosts.length ? filteredBuddyPosts.slice(0, 2) : buddyPosts.slice(0, 2)

  return (
    <div className="mobile-home-page">
      <section className="mobile-home-hero">
        <div className="mobile-home-type-row" aria-label="活动类型">
          {activityTypes.map((item) => (
            <button
              key={item.key}
              className={activeType === item.key ? 'mobile-home-type-chip active' : 'mobile-home-type-chip'}
              onClick={() => setActiveType(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mobile-home-hero-meta">
          <p className="mobile-home-kicker">活动搭子 + 行程助手</p>
          <span className="mobile-home-meta-pill">赴约小管家</span>
        </div>
        <h1>
          <span>{sceneMeta.title}</span>
        </h1>
        <p className="mobile-home-copy">{sceneMeta.copy}</p>

        <div className="mobile-home-actions">
          <button className="hero-primary-v3" onClick={() => navigate('/buddy')} type="button">
            马上找同场搭子
          </button>
          <button className="hero-secondary-v3" onClick={() => navigate('/planner')} type="button">
            {sceneMeta.plannerTitle}
          </button>
        </div>

        <button className="mobile-home-ghost-cta" onClick={() => navigate('/buddy')} type="button">
          先看看现在谁也想一起去
        </button>

      </section>

      <section className="mobile-home-panel mobile-home-panel-soft">
        <div className="mobile-section-head">
          <div>
            <p className="planner-section-title">{sceneMeta.featuredTitle}</p>
            <h2>热门都在这</h2>
          </div>
        </div>
        <p className="mobile-home-panel-copy">{sceneMeta.featuredCopy}</p>

        <div className="mobile-home-showcase-grid" aria-label="推荐内容">
          <article className="mobile-showcase-card">
            <div className="mobile-showcase-head">
              <span>热门活动</span>
              <button className="mobile-text-link" onClick={() => navigate('/planner')} type="button">
                去规划
              </button>
            </div>

            {loadingRecent ? <p className="mobile-home-empty">正在读取活动...</p> : null}

            {!loadingRecent && !displayedTrips.length ? (
              <div className="mobile-home-empty-card">
                <strong>还没有热门活动卡片</strong>
                <p>有活动后，这里就会出现。</p>
              </div>
            ) : null}

            {!loadingRecent && displayedTrips.length ? (
              <div className="mobile-showcase-list">
                {displayedTrips.map((trip) => (
                  <button key={trip.id} className="mobile-showcase-item" onClick={() => navigate(`/battle-books/${trip.id}`)} type="button">
                    <span>{sceneLabel(trip.input?.sceneType)}</span>
                    <strong>{trip.input?.eventName || '未命名活动'}</strong>
                    <p>{[trip.input?.city, trip.input?.venue, trip.input?.eventDate].filter(Boolean).join(' · ') || '活动信息待补充'}</p>
                    <em>{trip.input?.targetName || '打开后继续看路线、票务和预算'}</em>
                  </button>
                ))}
              </div>
            ) : null}
          </article>

          <article className="mobile-showcase-card">
            <div className="mobile-showcase-head">
              <span>热门搭子</span>
              <button className="mobile-text-link" onClick={() => navigate('/buddy')} type="button">
                去广场
              </button>
            </div>

            {loadingBuddy ? <p className="mobile-home-empty">正在读取搭子...</p> : null}

            {!loadingBuddy && !displayedBuddyPosts.length ? (
              <div className="mobile-home-empty-card">
                <strong>还没有热门搭子卡片</strong>
                <p>有人发帖后，这里就会更新。</p>
              </div>
            ) : null}

            {!loadingBuddy && displayedBuddyPosts.length ? (
              <div className="mobile-showcase-list">
                {displayedBuddyPosts.map((item) => (
                  <button key={item.id} className="mobile-showcase-item" onClick={() => navigate(`/buddy/${item.id}`)} type="button">
                    <span>{buildBuddySummary(item)}</span>
                    <strong>{item.eventName || '未命名搭子邀约'}</strong>
                    <p>{[item.city, item.venue, item.eventDate].filter(Boolean).join(' · ') || '看看这条搭子信息'}</p>
                    <em>{buildBuddySnippet(item)}</em>
                  </button>
                ))}
              </div>
            ) : null}
          </article>
        </div>
      </section>

      <section className="mobile-home-panel">
        <div className="mobile-section-head">
          <div>
            <p className="planner-section-title">最近活动</p>
            <h2>上次看到这</h2>
          </div>
          <button className="mobile-text-link" onClick={() => navigate('/my-trips')} type="button">
            全部
          </button>
        </div>

        {loadingRecent ? <p className="mobile-home-empty">正在读取最近活动...</p> : null}

        {!loadingRecent && !displayedTrips.length ? (
          <div className="mobile-home-empty-card">
            <strong>还没有最近安排</strong>
            <p>导入购票信息或新建活动后，最近安排会留在这里。</p>
          </div>
        ) : null}

        {!loadingRecent && displayedTrips.length ? (
          <div className="mobile-recent-list">
            {displayedTrips.map((trip) => (
              <button key={trip.id} className="mobile-recent-card" onClick={() => navigate(`/battle-books/${trip.id}`)} type="button">
                <span>{sceneLabel(trip.input?.sceneType)}</span>
                <strong>{trip.input?.eventName || '未命名活动'}</strong>
                <p>{[trip.input?.city, trip.input?.venue, trip.input?.eventDate].filter(Boolean).join(' · ') || '活动信息待补充'}</p>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mobile-home-panel mobile-home-panel-soft">
        <div className="mobile-section-head">
          <div>
            <p className="planner-section-title">信任与安全</p>
            <h2>见面也能更安心</h2>
          </div>
        </div>
        <div className="mobile-feature-list">
          {trustItems.map((item) => (
            <article key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
