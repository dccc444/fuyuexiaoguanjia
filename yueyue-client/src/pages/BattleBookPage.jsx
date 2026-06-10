import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import html2canvas from 'html2canvas'
import { createShareLink, getBattleBook, regenerateBattleBook } from '../api'
import { BattleBookView } from '../components/BattleBookView'
import { CommandCenterView } from '../components/CommandCenterView'
import { getTripMeta, hasBrokenText } from '../utils/tripMeta'
import { recordSharedBattleBook } from '../utils/shareHistory'

export function BattleBookPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [battleBook, setBattleBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareMessage, setShareMessage] = useState('')
  const [error, setError] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [isCommandMode, setIsCommandMode] = useState(false)
  const [exporting, setExporting] = useState(false)

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

  async function handleExportImage() {
    const element = document.querySelector('.battlebook-layout')
    if (!element || !battleBook) return

    try {
      setExporting(true)
      setShareMessage('正在生成长图，请稍候...')
      // 临时隐藏操作按钮以免被截进去
      const actions = element.querySelector('.handbook-cover-actions')
      if (actions) actions.style.display = 'none'

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      if (actions) actions.style.display = ''

      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = `赴约作战书-${battleBook.input.eventName || '活动'}.png`
      link.click()
      setShareMessage('长图已生成并开始下载！')
    } catch {
      setError('生成长图失败，请稍后再试。')
      setShareMessage('')
    } finally {
      setExporting(false)
    }
  }

  async function handleShare() {
    if (!battleBook) return

    const data = await createShareLink(battleBook.id)
    await navigator.clipboard.writeText(data.shareUrl)
    recordSharedBattleBook({
      id: battleBook.id,
      title: battleBook.input?.eventName,
      shareUrl: data.shareUrl,
    })
    setShareMessage('分享链接已复制，发给朋友就行。')
  }

  async function handleRegenerate() {
    if (!battleBook) return

    try {
      setRegenerating(true)
      const data = await regenerateBattleBook(battleBook.id)
      setBattleBook(data.item)
      setShareMessage('手册已重新整理好。')
      setError('')
    } catch (regenerateError) {
      setError(regenerateError.message || '重新整理失败，请稍后再试。')
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

  const tripMeta = getTripMeta(battleBook)
  const detailMeta = [tripMeta.sceneLabel, tripMeta.city, tripMeta.venue, tripMeta.eventDate].filter(Boolean)
  const needsRepair = hasBrokenText(battleBook.input.eventName)

  return (
    <div className="detail-layout detail-layout-inner">
      {shareMessage ? <section className="panel-v3 panel-v3-light success-banner success-banner-inner">{shareMessage}</section> : null}

      <section className="panel-v3 panel-v3-light detail-page-hero">
        <div className="detail-page-copy">
          <p className="section-kicker-v3">活动详情</p>
          <h1>{isCommandMode ? '当天模式' : '把这场赴约收好'}</h1>
          <p className="section-subcopy-v3">{detailMeta.join(' · ') || '这场活动的安排都在这里。'}</p>
          <div className="detail-page-pills">
            {detailMeta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="detail-page-actions">
          <button
            className={isCommandMode ? 'hero-secondary-v3 compact' : 'hero-primary-v3 compact'}
            onClick={() => setIsCommandMode(false)}
            type="button"
          >
            手册详情
          </button>
          <button
            className={isCommandMode ? 'hero-primary-v3 compact' : 'hero-secondary-v3 compact'}
            onClick={() => setIsCommandMode(true)}
            type="button"
          >
            当天模式
          </button>
        </div>
      </section>

      {isCommandMode ? (
        <CommandCenterView battleBook={battleBook} />
      ) : (
        <>
          <BattleBookView
            battleBook={battleBook}
            actions={
              <>
                <button className="hero-secondary-v3 compact" onClick={() => navigate(`/money/${battleBook.id}`)} type="button">
                  去记账
                </button>
                <button className="hero-secondary-v3 compact" onClick={() => navigate(`/planner?from=${battleBook.id}`)} type="button">
                  继续完善
                </button>
                <button className="hero-secondary-v3 compact" onClick={() => navigate('/my-trips')} type="button">
                  回到我的
                </button>
                <button className="hero-secondary-v3 compact" disabled={exporting} onClick={handleExportImage} type="button">
                  {exporting ? '正在生成...' : '保存长图'}
                </button>
                <button className="hero-primary-v3 compact" onClick={handleShare} type="button">
                  立刻分享
                </button>
                {needsRepair ? (
                  <button className="hero-secondary-v3 compact" disabled={regenerating} onClick={handleRegenerate} type="button">
                    {regenerating ? '正在重整...' : '重整手册'}
                  </button>
                ) : null}
              </>
            }
          />

          <section className="detail-bottom-bar">
            <button className="hero-secondary-v3 compact" onClick={() => navigate(`/money/${battleBook.id}`)} type="button">
              记账
            </button>
            <button className="hero-secondary-v3 compact" onClick={() => navigate(`/planner?from=${battleBook.id}`)} type="button">
              完善
            </button>
            <button className="hero-primary-v3 compact" onClick={handleShare} type="button">
              分享
            </button>
          </section>
        </>
      )}
    </div>
  )
}
