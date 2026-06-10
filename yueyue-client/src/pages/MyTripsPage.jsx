import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createShareLink, deleteBattleBook, listMyBuddyPosts, regenerateBattleBook } from '../api'
import { useBattleBooks } from '../hooks/useBattleBooks'
import { getTripMeta, hasBrokenText, sceneLabelFromType } from '../utils/tripMeta'
import { getSharedBattleBookHistory, recordSharedBattleBook } from '../utils/shareHistory'

const sceneFilters = ['全部', '演唱会', '音乐节', '球赛']

function StatsCard({ title, value, note, tone }) {
  return (
    <article className={`trip-stat-card stat-card-base tone-${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  )
}

function QuickActionCard({ title, note, action, onClick, tone = 'pink' }) {
  return (
    <button className={`my-quick-action-card tone-${tone}`} onClick={onClick} type="button">
      <span>{title}</span>
      <strong>{action}</strong>
      <p>{note}</p>
    </button>
  )
}

function formatDateTimeLabel(value) {
  if (!value) return '刚刚更新'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚更新'
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function MyTripsPage() {
  const navigate = useNavigate()
  const { items, loading, error, refresh } = useBattleBooks()
  const [activeFilter, setActiveFilter] = useState('全部')
  const [myBuddyPosts, setMyBuddyPosts] = useState([])
  const [shareHistory, setShareHistory] = useState([])
  const [sharingId, setSharingId] = useState('')
  const [repairingId, setRepairingId] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!notice) return undefined

    const timer = window.setTimeout(() => setNotice(''), 2400)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    let active = true

    async function loadMyBuddyPosts() {
      try {
        const data = await listMyBuddyPosts()
        if (active) {
          setMyBuddyPosts(Array.isArray(data?.items) ? data.items : [])
        }
      } catch {
        if (active) {
          setMyBuddyPosts([])
        }
      }
    }

    loadMyBuddyPosts()
    setShareHistory(getSharedBattleBookHistory())

    return () => {
      active = false
    }
  }, [])

  async function handleDelete(id) {
    try {
      setDeletingId(id)
      setActionError('')
      await deleteBattleBook(id)
      await refresh()
      setNotice('这份安排已经删除。')
    } catch (deleteError) {
      setActionError(deleteError.message || '删除失败，请稍后再试。')
    } finally {
      setDeletingId('')
    }
  }

  async function handleShare(id) {
    try {
      setSharingId(id)
      setActionError('')
      const data = await createShareLink(id)
      await navigator.clipboard.writeText(data.shareUrl)
      const target = items.find((item) => item.id === id)
      recordSharedBattleBook({
        id,
        title: target?.input?.eventName,
        shareUrl: data.shareUrl,
      })
      setShareHistory(getSharedBattleBookHistory())
      setNotice('分享链接已经复制好了。')
    } catch (shareError) {
      setActionError(shareError.message || '复制分享链接失败，请稍后再试。')
    } finally {
      setSharingId('')
    }
  }

  async function handleRepair(id) {
    try {
      setRepairingId(id)
      setActionError('')
      await regenerateBattleBook(id)
      await refresh()
      setNotice('这份手册已经重新生成好了。')
    } catch (repairError) {
      setActionError(repairError.message || '重新生成失败，请稍后再试。')
    } finally {
      setRepairingId('')
    }
  }

  const filteredItems = useMemo(() => {
    if (activeFilter === '全部') return items
    return items.filter((trip) => sceneLabelFromType(trip.input.sceneType) === activeFilter)
  }, [activeFilter, items])

  const featuredTrip = filteredItems[0]
  const contentTrips = filteredItems.slice(1)
  const featuredMeta = featuredTrip ? getTripMeta(featuredTrip) : null
  const upcomingCount = filteredItems.length
  const cityCount = new Set(filteredItems.map((trip) => getTripMeta(trip).city).filter(Boolean)).size
  const shareReadyCount = filteredItems.filter((trip) => !hasBrokenText(trip.input.eventName)).length
  const recentImports = [...items]
    .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime())
    .slice(0, 3)
  const recentShares = shareHistory
    .map((record) => {
      const trip = items.find((item) => item.id === record.id)
      return { record, trip, meta: trip ? getTripMeta(trip) : null }
    })
    .slice(0, 3)
  const latestBuddyPosts = myBuddyPosts.slice(0, 3)

  return (
    <div className="trips-dashboard-v2">
      {notice || actionError || error ? (
        <div className="feedback-stack">
          {notice ? <section className="panel-v3 panel-v3-light success-banner success-banner-inner">{notice}</section> : null}
          {actionError ? <section className="panel-v3 panel-v3-light error-text">{actionError}</section> : null}
          {error ? <section className="panel-v3 panel-v3-light error-text">{error}</section> : null}
        </div>
      ) : null}

      <section className="panel-v3 panel-v3-light trips-shell-hero trips-shell-hero-v4">
        <div className="trips-hero-main">
          <p className="section-kicker-v3">Trip Manager</p>
          <h1>把我的赴约收好</h1>
          <p className="section-subcopy-v3">最近安排、预算和分享，都在这里。</p>
          <div className="trips-hero-pills">
            <span>{upcomingCount} 场安排</span>
            <span>{cityCount || 0} 座城市</span>
            <span>{shareReadyCount} 份可分享</span>
          </div>
        </div>
        <div className="action-cluster trips-hero-actions">
          <button className="hero-secondary-v3" onClick={() => setActiveFilter('全部')} type="button">
            看全部
          </button>
          <button className="hero-primary-v3" onClick={() => navigate('/planner')} type="button">
            新建一场
          </button>
        </div>
      </section>

      <section className="panel-v3 panel-v3-light trips-toolbar-v2">
        <div className="section-head-v3">
          <div>
            <p className="section-kicker-v3">场景筛选</p>
            <h2>最近安排都在这</h2>
          </div>
        </div>
        <div className="choice-chip-row">
          {sceneFilters.map((filter) => (
            <button
              className={activeFilter === filter ? 'choice-chip active' : 'choice-chip'}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="trip-stat-grid">
        <StatsCard note="最近收好的安排。" title="当前安排" tone="blue" value={`${upcomingCount} 场`} />
        <StatsCard note="已经去过的城市，都记在这里。" title="城市跨度" tone="mint" value={`${cityCount || 0} 座`} />
        <StatsCard note="打开就能分享的安排。" title="可直接分享" tone="orange" value={`${shareReadyCount} 份`} />
      </section>

      <section className="my-quick-action-grid">
        <QuickActionCard action="导入活动" note="截图、短信和链接都能带进来。" onClick={() => navigate('/planner')} title="最快开始" tone="pink" />
        <QuickActionCard action="发搭子邀约" note="把同城同场的人更快聚过来。" onClick={() => navigate('/buddy/new')} title="想找人一起" tone="blue" />
        <QuickActionCard action="打开总览" note="路线、票务和预算都继续接着来。" onClick={() => navigate('/planner/overview')} title="继续做安排" tone="mint" />
      </section>

      {loading ? <section className="panel-v3 panel-v3-light empty-state-v3">正在把你的安排带出来...</section> : null}

      {!loading && filteredItems.length === 0 ? (
        <section className="panel-v3 panel-v3-light empty-state-v3">
          <strong>这组筛选下还没有安排</strong>
          <p>先去导入一场，或者直接新建这一类活动。</p>
          <div className="action-cluster">
            <button className="hero-primary-v3 compact" onClick={() => navigate('/planner')} type="button">
              去导入活动
            </button>
            <button className="hero-secondary-v3 compact" onClick={() => setActiveFilter('全部')} type="button">
              看全部安排
            </button>
          </div>
        </section>
      ) : null}

      {!loading && featuredTrip ? (
        <section className="panel-v3 panel-v3-light trip-featured-card trip-featured-card-v4">
          <div className="trip-featured-copy">
            <div className="trip-featured-head">
              <div>
                <p className="section-kicker-v3">最近安排</p>
                <h2>{featuredMeta.eventName}</h2>
              </div>
              <span className="trip-tag-v3">{featuredMeta.sceneLabel}</span>
            </div>
            <p className="section-subcopy-v3">
              {[featuredMeta.city, featuredMeta.venue, featuredMeta.eventDate].filter(Boolean).join(' · ') || '活动信息待补充'}
            </p>
            <div className="trip-featured-summary">
              <article className="trip-featured-summary-card">
                <span>这次去看</span>
                <strong>{featuredMeta.targetName || '待补充'}</strong>
              </article>
              <article className="trip-featured-summary-card">
                <span>票档分区</span>
                <strong>{featuredMeta.ticketArea || '待确认'}</strong>
              </article>
              <article className="trip-featured-summary-card">
                <span>现在进度</span>
                <strong>{hasBrokenText(featuredTrip.input.eventName) ? '建议重整' : '可直接打开'}</strong>
              </article>
            </div>
          </div>
          <div className="trip-featured-actions trip-featured-actions-v4">
            <button className="hero-primary-v3 compact" onClick={() => navigate(`/battle-books/${featuredTrip.id}`)} type="button">
              打开详情
            </button>
            <button className="hero-secondary-v3 compact" onClick={() => navigate(`/money/${featuredTrip.id}`)} type="button">
              预算记账
            </button>
            <button className="hero-secondary-v3 compact" onClick={() => navigate(`/planner?from=${featuredTrip.id}`)} type="button">
              继续完善
            </button>
            <button className="ghost-button" disabled={sharingId === featuredTrip.id} onClick={() => handleShare(featuredTrip.id)} type="button">
              {sharingId === featuredTrip.id ? '正在复制...' : '分享'}
            </button>
            {hasBrokenText(featuredTrip.input.eventName) ? (
              <button className="ghost-button" disabled={repairingId === featuredTrip.id} onClick={() => handleRepair(featuredTrip.id)} type="button">
                {repairingId === featuredTrip.id ? '正在重整...' : '重整手册'}
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="panel-v3 panel-v3-light trips-content-section">
        <div className="section-head-v3">
          <div>
            <p className="section-kicker-v3">内容流</p>
            <h2>这几场，随时接着来</h2>
          </div>
        </div>

        <div className="trips-content-grid">
          {(contentTrips.length > 0 ? contentTrips : featuredTrip ? [featuredTrip] : []).map((trip, index) => {
            const meta = getTripMeta(trip)

            return (
              <article className={`trip-content-card tone-${(index % 3) + 1}`} key={trip.id}>
                <div className="trip-content-top">
                  <span className="trip-tag-v3">{meta.sceneLabel}</span>
                  <span className="trip-date-v2">{meta.eventDate}</span>
                </div>
                <strong>{meta.eventName}</strong>
                <p>
                  {[meta.city, meta.venue].filter(Boolean).join(' · ') || '活动信息待补充'}
                </p>
                <div className="trip-meta-row">
                  <span>{meta.targetName}</span>
                  <span>{meta.ticketArea}</span>
                </div>
                <div className="action-cluster trip-content-actions">
                  <button className="hero-primary-v3 compact" onClick={() => navigate(`/battle-books/${trip.id}`)} type="button">
                    打开详情
                  </button>
                  <button className="hero-secondary-v3 compact" onClick={() => navigate(`/money/${trip.id}`)} type="button">
                    预算记账
                  </button>
                  <button className="hero-secondary-v3 compact" onClick={() => navigate(`/planner?from=${trip.id}`)} type="button">
                    继续完善
                  </button>
                  <button className="ghost-button" disabled={sharingId === trip.id} onClick={() => handleShare(trip.id)} type="button">
                    {sharingId === trip.id ? '复制中...' : '分享'}
                  </button>
                  {hasBrokenText(trip.input.eventName) ? (
                    <button className="ghost-button" disabled={repairingId === trip.id} onClick={() => handleRepair(trip.id)} type="button">
                      {repairingId === trip.id ? '重整中...' : '重整手册'}
                    </button>
                  ) : null}
                  <button className="ghost-button" disabled={deletingId === trip.id} onClick={() => handleDelete(trip.id)} type="button">
                    {deletingId === trip.id ? '删除中...' : '删除'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="my-mobile-grid">
        <article className="panel-v3 panel-v3-light my-mobile-panel">
          <div className="section-head-v3">
            <div>
              <p className="section-kicker-v3">我的发布</p>
              <h2>搭子邀约都在这</h2>
            </div>
            <button className="mobile-text-link" onClick={() => navigate('/my-buddy-posts')} type="button">
              去管理
            </button>
          </div>
          {latestBuddyPosts.length ? (
            <div className="my-mobile-list">
              {latestBuddyPosts.map((item) => (
                <button className="my-mobile-list-card" key={item.id} onClick={() => navigate(`/buddy/${item.id}`)} type="button">
                  <span>{item.intentType || '搭子邀约'}</span>
                  <strong>{item.eventName || '未命名邀约'}</strong>
                  <p>{[item.city, item.venue, item.eventDate].filter(Boolean).join(' · ') || '活动信息待补充'}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="mobile-home-empty-card">
              <strong>还没有搭子发布</strong>
              <p>把你的邀约发出来，同场同城的人更容易看到你。</p>
              <button className="hero-primary-v3 compact" onClick={() => navigate('/buddy/new')} type="button">
                去发第一条
              </button>
            </div>
          )}
        </article>

        <article className="panel-v3 panel-v3-light my-mobile-panel">
          <div className="section-head-v3">
            <div>
              <p className="section-kicker-v3">最近导入</p>
              <h2>最近带进来的活动</h2>
            </div>
            <button className="mobile-text-link" onClick={() => navigate('/planner')} type="button">
              去导入
            </button>
          </div>
          {recentImports.length ? (
            <div className="my-mobile-list">
              {recentImports.map((trip) => {
                const meta = getTripMeta(trip)
                return (
                  <button className="my-mobile-list-card" key={trip.id} onClick={() => navigate(`/planner?from=${trip.id}`)} type="button">
                    <span>{formatDateTimeLabel(trip.createdAt || trip.updatedAt)}</span>
                    <strong>{meta.eventName || '未命名活动'}</strong>
                    <p>{[meta.city, meta.venue, meta.eventDate].filter(Boolean).join(' · ') || '活动信息待补充'}</p>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mobile-home-empty-card">
              <strong>还没有最近导入</strong>
              <p>从截图、短信或链接带进来后，这里会自动留下最近记录。</p>
              <button className="hero-primary-v3 compact" onClick={() => navigate('/planner')} type="button">
                现在去导入
              </button>
            </div>
          )}
        </article>

        <article className="panel-v3 panel-v3-light my-mobile-panel">
          <div className="section-head-v3">
            <div>
              <p className="section-kicker-v3">分享记录</p>
              <h2>最近分享过这些</h2>
            </div>
          </div>
          {recentShares.length ? (
            <div className="my-mobile-list">
              {recentShares.map(({ record, trip, meta }) => (
                <button
                  className="my-mobile-list-card"
                  key={`${record.id}-${record.sharedAt}`}
                  onClick={() => navigate(trip ? `/battle-books/${record.id}` : '/my-trips')}
                  type="button"
                >
                  <span>{formatDateTimeLabel(record.sharedAt)}</span>
                  <strong>{record.title || meta?.eventName || '未命名活动'}</strong>
                  <p>{meta ? [meta.city, meta.venue, meta.eventDate].filter(Boolean).join(' · ') : '分享链接已生成'}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="mobile-home-empty-card">
              <strong>还没有分享记录</strong>
              <p>分享过活动后，这里会记住最近发出去的那几场。</p>
              <button
                className="hero-secondary-v3 compact"
                onClick={() => navigate(featuredTrip ? `/battle-books/${featuredTrip.id}` : '/planner')}
                type="button"
              >
                {featuredTrip ? '去分享最近安排' : '先准备一场'}
              </button>
            </div>
          )}
        </article>
      </section>
    </div>
  )
}
