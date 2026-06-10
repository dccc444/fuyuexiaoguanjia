import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteBuddyPost, listMyBuddyPosts, updateBuddyPostStatus } from '../api'

const statusLabels = {
  active: '展示中',
  hidden: '已下架',
  closed: '已结束',
}

const contactVisibilityLabels = {
  public: '联系方式公开展示',
  after_join: '点“我也想一起”后展示联系方式',
}

export function MyBuddyPostsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actingId, setActingId] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await listMyBuddyPosts()
        if (active) {
          setItems(data.items || [])
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || '读取我的发布失败。')
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
  }, [])

  async function handleDelete(id) {
    setActingId(id)
    setActionMessage('')

    try {
      await deleteBuddyPost(id)
      setItems((current) => current.filter((item) => item.id !== id))
      setActionMessage('帖子已删除。')
    } catch (submitError) {
      setActionMessage(submitError.message || '删除失败，请稍后再试。')
    } finally {
      setActingId('')
    }
  }

  async function handleStatusChange(id, status) {
    setActingId(id)
    setActionMessage('')

    try {
      const data = await updateBuddyPostStatus(id, status)
      setItems((current) => current.map((item) => (item.id === id ? data.item : item)))
      setActionMessage(status === 'active' ? '帖子已重新上架。' : '帖子状态已更新。')
    } catch (submitError) {
      setActionMessage(submitError.message || '更新状态失败，请稍后再试。')
    } finally {
      setActingId('')
    }
  }

  return (
    <section className="planner-module-card">
      <div className="planner-module-header">
        <div>
          <p className="planner-section-title">我的找搭子发布</p>
          <h2>先把自己发过的需求集中看起来</h2>
          <p className="planner-module-copy">
            第 2 步补齐管理能力。现在你可以在这里直接编辑、删除、下架或重新上架自己的帖子。
          </p>
        </div>
        <div className="planner-submit-row">
          <Link className="hero-primary-v3" to="/buddy/new">
            再发一条需求
          </Link>
        </div>
      </div>

      {loading ? <section className="planner-rule-empty"><p>正在读取我的发布...</p></section> : null}
      {error ? <section className="planner-rule-empty"><strong>读取失败</strong><p>{error}</p></section> : null}
      {actionMessage ? <section className="planner-rule-empty"><p>{actionMessage}</p></section> : null}

      {!loading && !error ? (
        items.length > 0 ? (
          <div className="planner-rules-layout">
            {items.map((item) => (
              <section className="planner-rule-overview buddy-post-card" key={item.id}>
                <div className="planner-rule-overview-head">
                  <div>
                    <p className="planner-section-title">{item.intentType}</p>
                    <h3>{item.eventName}</h3>
                  </div>
                  <div className="planner-rule-meta">
                    <span>{statusLabels[item.status] || item.status}</span>
                    <span>{item.eventDate}</span>
                  </div>
                </div>
                <p className="planner-rule-summary">
                  {item.city} · {item.venue}
                </p>
                {item.intentTags?.length ? (
                  <div className="tag-chip-row">
                    {item.intentTags.map((tag) => (
                      <span className="tag-chip active" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="planner-module-copy">{item.content}</p>
                <div className="planner-summary-card planner-summary-actions">
                  <span>{item.contactType} / {item.contactValue}</span>
                  <span>{contactVisibilityLabels[item.contactVisibility] || item.contactVisibility}</span>
                  <span>收藏 {item.favoriteCount || 0}</span>
                  <span>想一起 {item.joinIntentCount || 0}</span>
                  <Link className="planner-secondary-link" to={`/buddy/${item.id}/edit`}>
                    编辑
                  </Link>
                  {item.status === 'active' ? (
                    <button
                      className="ghost-button"
                      disabled={actingId === item.id}
                      onClick={() => handleStatusChange(item.id, 'hidden')}
                      type="button"
                    >
                      {actingId === item.id ? '处理中...' : '下架'}
                    </button>
                  ) : (
                    <button
                      className="ghost-button"
                      disabled={actingId === item.id}
                      onClick={() => handleStatusChange(item.id, 'active')}
                      type="button"
                    >
                      {actingId === item.id ? '处理中...' : '重新上架'}
                    </button>
                  )}
                  {item.status !== 'closed' ? (
                    <button
                      className="ghost-button"
                      disabled={actingId === item.id}
                      onClick={() => handleStatusChange(item.id, 'closed')}
                      type="button"
                    >
                      {actingId === item.id ? '处理中...' : '标记结束'}
                    </button>
                  ) : null}
                  <button
                    className="ghost-button"
                    disabled={actingId === item.id}
                    onClick={() => handleDelete(item.id)}
                    type="button"
                  >
                    {actingId === item.id ? '处理中...' : '删除'}
                  </button>
                  <Link className="planner-secondary-link" to={`/buddy/${item.id}`}>
                    查看详情
                  </Link>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <section className="planner-rule-empty">
            <strong>你还没有发布过需求</strong>
            <p>先发第一条，再回来统一管理。</p>
          </section>
        )
      ) : null}
    </section>
  )
}
