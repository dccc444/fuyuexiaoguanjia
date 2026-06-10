import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BuddyReportDialog } from '../components/BuddyReportDialog'
import { getBuddyPost, reportBuddyPost, toggleBuddyFavorite, toggleBuddyJoinIntent } from '../api'

const statusLabels = {
  active: '展示中',
  hidden: '已下架',
  closed: '已结束',
}

const contactVisibilityLabels = {
  public: '公开展示',
  after_join: '点“我也想一起”后展示',
}

export function BuddyDetailPage() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reporting, setReporting] = useState(false)
  const [reportStatus, setReportStatus] = useState('')
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinMessage, setJoinMessage] = useState('')
  const [interactionMessage, setInteractionMessage] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await getBuddyPost(id)
        if (active) {
          setItem(data.item)
          setJoinMessage(data.item.latestJoinMessage || '')
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || '读取详情失败。')
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
  }, [id])

  async function handleReport(payload) {
    setReporting(true)
    setReportStatus('')

    try {
      await reportBuddyPost(id, payload)
      setReportStatus('已提交举报，平台后续会处理。')
      setReportDialogOpen(false)
    } catch (submitError) {
      setReportStatus(submitError.message || '举报失败，请稍后再试。')
    } finally {
      setReporting(false)
    }
  }

  async function handleFavorite() {
    setFavoriteLoading(true)
    setInteractionMessage('')

    try {
      const data = await toggleBuddyFavorite(id)
      setItem(data.item)
      setInteractionMessage(data.item.isFavorited ? '已加入收藏，后续可以继续跟进。' : '已取消收藏。')
    } catch (submitError) {
      setInteractionMessage(submitError.message || '收藏失败，请稍后再试。')
    } finally {
      setFavoriteLoading(false)
    }
  }

  async function handleJoinIntent() {
    setJoinLoading(true)
    setInteractionMessage('')

    try {
      const data = await toggleBuddyJoinIntent(id, { message: joinMessage })
      setItem(data.item)
      setJoinMessage(data.item.hasJoined ? (data.item.latestJoinMessage || joinMessage) : '')
      setInteractionMessage(
        data.item.hasJoined
          ? (data.item.canViewContact && data.item.contactVisibility === 'after_join'
              ? '已表达一起同行意向，联系方式已解锁。'
              : '已表达一起同行意向。')
          : '已取消一起同行意向。'
      )
    } catch (submitError) {
      setInteractionMessage(submitError.message || '操作失败，请稍后再试。')
    } finally {
      setJoinLoading(false)
    }
  }

  if (loading) {
    return <section className="planner-rule-empty"><p>正在加载帖子详情...</p></section>
  }

  if (error || !item) {
    return (
      <section className="planner-rule-empty">
        <strong>没有找到这条邀约</strong>
        <p>{error || '帖子可能已被删除或下架。'}</p>
      </section>
    )
  }

  return (
    <section className="planner-module-card">
      <div className="planner-module-header">
        <div>
          <p className="planner-section-title">找搭子详情</p>
          <h2>{item.eventName}</h2>
          <p className="planner-module-copy">{item.content}</p>
        </div>
        <div className="planner-module-badge">
          <strong>{item.intentType}</strong>
          <span>{item.city} / {item.eventDate} / {statusLabels[item.status] || item.status}</span>
        </div>
      </div>

      <div className="planner-rules-layout">
        <section className="planner-rule-overview">
          <div className="planner-rule-overview-head">
            <div>
              <p className="planner-section-title">活动信息</p>
              <h3>{item.venue}</h3>
            </div>
            <div className="planner-rule-meta">
              <span>{item.sceneType}</span>
              <span>{item.ticketArea || '票区待沟通'}</span>
            </div>
          </div>

          <div className="planner-transport-grid">
            <article className="planner-transport-card">
              <p className="planner-section-title">同行偏好</p>
              <strong>想找 {item.companionsExpected} 人</strong>
              <p>{item.isFirstTime ? '对方是第一次去，建议先约清楚会合点和进场节奏。' : '已有经验，可以更快对齐会合和散场安排。'}</p>
            </article>
            <article className="planner-transport-card">
              <p className="planner-section-title">联系方式</p>
              <strong>{item.contactType}</strong>
              <p>
                {item.canViewContact
                  ? item.contactValue
                  : `当前未直接公开，预览：${item.maskedContactValue}`}
              </p>
              <p className="planner-submit-hint">
                展示方式：{contactVisibilityLabels[item.contactVisibility] || item.contactVisibility}
              </p>
              {!item.canViewContact ? (
                <p className="planner-submit-hint">先点“我也想一起”，再决定是否继续联系会更安全。</p>
              ) : null}
            </article>
          </div>
        </section>

        <section className="planner-tip-card">
          <p className="planner-section-title">安全提示</p>
          <ul>
            <li>平台仅提供找搭子信息展示，不参与线下约见或交易担保。</li>
            <li>建议优先选择公开场所会合，不要提前转账，也不要轻易泄露敏感隐私。</li>
            <li>如果发现广告、票务交易或骚扰内容，可以直接举报这条帖子。</li>
          </ul>
        </section>

        <section className="planner-tip-card">
          <p className="planner-section-title">互动状态</p>
          <ul>
            <li>已有 {item.joinIntentCount || 0} 人表达“我也想一起”。</li>
            <li>已有 {item.favoriteCount || 0} 人收藏这条邀约。</li>
            <li>{item.intentTags?.length ? `当前标签：${item.intentTags.join(' / ')}` : '当前还没有补充同行标签。'}</li>
            <li>{item.canViewContact ? '当前可以直接查看联系方式。' : '当前需要先表达“我也想一起”才能查看联系方式。'}</li>
          </ul>
          <div className="planner-form-grid">
            <label className="planner-field planner-field-wide">
              <span>我也想一起留言</span>
              <input
                onChange={(event) => setJoinMessage(event.target.value)}
                placeholder="例如：我也是同城出发，可以一起进场。"
                type="text"
                value={joinMessage}
              />
            </label>
          </div>
          <div className="planner-submit-row">
            <button className="ghost-button" disabled={favoriteLoading} onClick={handleFavorite} type="button">
              {favoriteLoading ? '处理中...' : item.isFavorited ? `取消收藏 (${item.favoriteCount || 0})` : `收藏帖子 (${item.favoriteCount || 0})`}
            </button>
            <button className="hero-primary-v3" disabled={joinLoading} onClick={handleJoinIntent} type="button">
              {joinLoading
                ? '处理中...'
                : item.hasJoined
                  ? `取消我也想一起 (${item.joinIntentCount || 0})`
                  : item.contactVisibility === 'after_join'
                    ? `我也想一起并查看联系方式 (${item.joinIntentCount || 0})`
                    : `我也想一起 (${item.joinIntentCount || 0})`}
            </button>
          </div>
          {interactionMessage ? <p className="planner-submit-hint">{interactionMessage}</p> : null}
        </section>

        <section className="planner-summary-card planner-summary-actions">
          <Link className="planner-secondary-link" to={`/buddy/${item.id}/edit`}>
            编辑帖子
          </Link>
          <Link className="planner-secondary-link" to="/my-buddy-posts">
            我的发布
          </Link>
          <Link className="planner-secondary-link" to="/buddy">
            返回广场
          </Link>
          <button className="hero-primary-v3" disabled={reporting} onClick={() => setReportDialogOpen(true)} type="button">
            {reporting ? '正在提交举报...' : '举报这条帖子'}
          </button>
        </section>

        {reportStatus ? (
          <section className="planner-rule-empty">
            <p>{reportStatus}</p>
          </section>
        ) : null}
      </div>

      <BuddyReportDialog
        onClose={() => setReportDialogOpen(false)}
        onSubmit={handleReport}
        open={reportDialogOpen}
        submitting={reporting}
      />
    </section>
  )
}
