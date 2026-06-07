import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createShareLink, getBattleBook, regenerateBattleBook } from '../api'
import { BattleBookView } from '../components/BattleBookView'

export function BattleBookPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [battleBook, setBattleBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareMessage, setShareMessage] = useState('')
  const [error, setError] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    if (!id) return

    getBattleBook(id)
      .then((data) => {
        setBattleBook(data.item)
        setError('')
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleShare() {
    if (!battleBook) return

    const data = await createShareLink(battleBook.id)
    await navigator.clipboard.writeText(data.shareUrl)
    setShareMessage('分享链接已经复制好了，现在可以直接发给朋友。')
  }

  async function handleRegenerate() {
    if (!battleBook) return

    try {
      setRegenerating(true)
      const data = await regenerateBattleBook(battleBook.id)
      setBattleBook(data.item)
      setShareMessage('这份手册已经重新生成好了，坏掉的文字也一起修过了。')
      setError('')
    } catch (regenerateError) {
      setError(regenerateError.message || '这次重新生成没有成功，请稍后再试。')
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return <section className="panel-v3 panel-v3-light loading-state">正在打开这份赴约手册...</section>
  }

  if (error || !battleBook) {
    return <section className="panel-v3 panel-v3-light error-text">{error || '没有找到这份赴约手册。'}</section>
  }

  return (
    <div className="detail-layout detail-layout-inner">
      {shareMessage ? <section className="panel-v3 panel-v3-light success-banner success-banner-inner">{shareMessage}</section> : null}

      <BattleBookView
        battleBook={battleBook}
        actions={
          <>
            <button className="hero-secondary-v3 compact" onClick={() => navigate(`/money/${battleBook.id}`)} type="button">
              预算与记账
            </button>
            <button className="hero-secondary-v3 compact" onClick={() => navigate('/my-trips')} type="button">
              回到我的安排
            </button>
            <button className="hero-secondary-v3 compact" disabled={regenerating} onClick={handleRegenerate} type="button">
              {regenerating ? '正在重生成...' : '修复文字并重生成'}
            </button>
            <button className="hero-primary-v3 compact" onClick={handleShare} type="button">
              复制分享链接
            </button>
          </>
        }
      />
    </div>
  )
}
