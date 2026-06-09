import { useEffect, useState } from 'react'
import { listFeedbacks } from '../api'

export function AdminPage() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await listFeedbacks()
        setFeedbacks(data.items || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="home-layout home-v3">
      <div className="home-main-v3" style={{ margin: '0 auto', maxWidth: '800px', width: '100%' }}>
        <section className="panel-v3 panel-v3-light">
          <div className="section-head-v3">
            <div>
              <p className="section-kicker-v3">Admin</p>
              <h2>用户反馈与纠错列表</h2>
            </div>
          </div>

          {loading ? (
            <p className="empty-state-v3">正在加载反馈...</p>
          ) : error ? (
            <p className="empty-state-v3" style={{ color: 'red' }}>
              加载失败: {error}
            </p>
          ) : feedbacks.length === 0 ? (
            <p className="empty-state-v3">目前没有任何反馈。</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="panel-v3"
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'var(--color-bg-elevated, #fff)',
                    border: '1px solid var(--color-border, #eaeaea)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '1.1em' }}>{fb.type === 'correction' ? '纠错' : '建议'}</strong>
                    <span style={{ color: 'var(--color-text-secondary, #666)', fontSize: '0.9em' }}>
                      {new Date(fb.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: '8px 0', lineHeight: '1.5' }}>{fb.content}</p>
                  {fb.contact && (
                    <p style={{ color: 'var(--color-text-secondary, #666)', fontSize: '0.9em', marginTop: '8px' }}>
                      联系方式: {fb.contact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
