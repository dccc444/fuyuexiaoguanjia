import { useEffect, useState } from 'react'
import { NavLink, Outlet, useSearchParams } from 'react-router-dom'
import { getBattleBook, importPlannerActivity } from '../api'
import { PlannerDraftProvider, getPlannerModuleStatuses, usePlannerDraft } from '../store/plannerDraft'

export function PlannerWorkspacePage() {
  return (
    <PlannerDraftProvider>
      <PlannerWorkspaceInner />
    </PlannerDraftProvider>
  )
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取图片失败，请重新上传。'))
    reader.readAsDataURL(file)
  })
}

function PlannerWorkspaceInner() {
  const [searchParams] = useSearchParams()
  const { draft, updateDraft } = usePlannerDraft()
  const [importState, setImportState] = useState({
    loading: Boolean(searchParams.get('from')),
    message: '',
  })
  const [importType, setImportType] = useState('text')
  const [textInput, setTextInput] = useState('')
  const [linkInput, setLinkInput] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [manualImportError, setManualImportError] = useState('')
  const [manualImportNotice, setManualImportNotice] = useState('')
  const [manualImportResult, setManualImportResult] = useState(null)
  const [importing, setImporting] = useState(false)
  const moduleStatuses = getPlannerModuleStatuses(draft)

  useEffect(() => {
    const scene = searchParams.get('scene')
    if (!scene || !['concert', 'festival', 'match'].includes(scene)) return
    updateDraft({ sceneType: scene })
  }, [searchParams, updateDraft])

  useEffect(() => {
    const fromId = searchParams.get('from')
    if (!fromId) {
      setImportState({ loading: false, message: '' })
      return
    }

    let active = true
    setImportState({ loading: true, message: '' })

    getBattleBook(fromId)
      .then((data) => {
        if (!active || !data?.item?.input) return
        updateDraft(data.item.input)
        setImportState({
          loading: false,
          message: '已带入上一份安排。你现在可以按模块继续改，不用再回到大表单。',
        })
      })
      .catch(() => {
        if (!active) return
        setImportState({
          loading: false,
          message: '没有找到要复制的安排，已经直接进入需求板块页。',
        })
      })

    return () => {
      active = false
    }
  }, [searchParams, updateDraft])

  async function handleManualImport() {
    try {
      setImporting(true)
      setManualImportError('')
      setManualImportNotice('')

      let payload = null
      if (importType === 'text') {
        payload = { type: 'text', text: textInput }
      } else if (importType === 'link') {
        payload = { type: 'link', url: linkInput }
      } else {
        if (!imageFile) {
          throw new Error('请先上传订单截图。')
        }
        payload = {
          type: 'image',
          imageDataUrl: await fileToDataUrl(imageFile),
          fileName: imageFile.name,
        }
      }

      const data = await importPlannerActivity(payload)
      updateDraft(data.item.draftPatch || {})
      setManualImportResult(data.item)
      setManualImportNotice('已识别并带入活动信息，你现在可以直接继续做规划。')
    } catch (error) {
      setManualImportError(error.message || '导入失败，请稍后再试。')
      setManualImportResult(null)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="planner-hub-page">
      <section className="planner-hub-header">
        <div>
          <p className="planner-hero-kicker">需求入口</p>
          <h1>让这场奔赴，从出发前就开始心动</h1>
          <p className="planner-hero-copy">
            去见重要的人之前，先把规则、路线、门票和同行安排好，让期待更完整，也让见面更安心。
          </p>
          {importState.loading || importState.message ? (
            <p className="planner-hero-copy">
              {importState.loading ? '正在带入上一份安排...' : importState.message}
            </p>
          ) : null}
        </div>
      </section>

      <section className="planner-import-panel">
        <div className="planner-import-head">
          <div>
            <p className="planner-section-title">快速导入</p>
            <h2>把购票信息直接带进来</h2>
            <p className="planner-hero-copy">
              支持订单截图导入、短信 / 订单文本导入、活动链接解析。识别后会自动回填活动名称、艺人、场馆、时间和票档信息。
            </p>
          </div>
        </div>

        <div className="planner-import-mode-row" role="tablist" aria-label="导入方式">
          {[
            { key: 'text', label: '文本导入' },
            { key: 'link', label: '活动链接' },
            { key: 'image', label: '订单截图' },
          ].map((item) => (
            <button
              className={importType === item.key ? 'planner-import-chip active' : 'planner-import-chip'}
              key={item.key}
              onClick={() => setImportType(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="planner-import-body">
          {importType === 'text' ? (
            <label className="planner-field">
              <span>短信 / 订单文本</span>
              <textarea
                className="planner-textarea"
                onChange={(event) => setTextInput(event.target.value)}
                placeholder="例如：周杰伦嘉年华世界巡回演唱会 上海站，2026-06-18 19:30，上海体育场，看台128区，订单编号..."
                rows={5}
                value={textInput}
              />
            </label>
          ) : null}

          {importType === 'link' ? (
            <label className="planner-field">
              <span>活动链接</span>
              <input
                onChange={(event) => setLinkInput(event.target.value)}
                placeholder="粘贴大麦、猫眼、秀动等活动详情链接"
                type="url"
                value={linkInput}
              />
            </label>
          ) : null}

          {importType === 'image' ? (
            <label className="planner-field">
              <span>订单截图</span>
              <input
                accept="image/*"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                type="file"
              />
              <p className="planner-import-file-note">{imageFile ? `已选择：${imageFile.name}` : '建议上传订单详情页、票夹页或活动详情截图。'}</p>
            </label>
          ) : null}

          <div className="planner-submit-row">
            <button className="hero-primary-v3" disabled={importing} onClick={handleManualImport} type="button">
              {importing ? '正在识别并导入...' : '识别并导入'}
            </button>
          </div>
        </div>

        {manualImportNotice ? <section className="planner-rule-loading"><strong>导入成功</strong><p>{manualImportNotice}</p></section> : null}
        {manualImportError ? <section className="planner-rule-empty"><strong>导入失败</strong><p>{manualImportError}</p></section> : null}

        {manualImportResult?.fields ? (
          <section className="planner-import-result">
            <div className="planner-rule-section-head">
              <h3>已识别信息</h3>
              <span>{manualImportResult.sourceSummary}</span>
            </div>
            <div className="planner-import-result-grid">
              {[
                ['活动', manualImportResult.fields.eventName],
                ['艺人 / 目标', manualImportResult.fields.targetName],
                ['城市', manualImportResult.fields.city],
                ['场馆', manualImportResult.fields.venue],
                ['日期', manualImportResult.fields.eventDate],
                ['时间', manualImportResult.fields.startTime],
                ['票档', manualImportResult.fields.ticketArea],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <article className="planner-import-result-card" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </article>
                ))}
            </div>
          </section>
        ) : null}
      </section>

      <nav className="planner-demand-grid" aria-label="需求板块">
        {moduleStatuses.map((item) => (
          <NavLink
            className={({ isActive }) => (isActive ? 'planner-demand-card active' : 'planner-demand-card')}
            key={item.key}
            to={item.href}
          >
            <div className="planner-demand-top">
              <strong>{item.title}</strong>
              <span>{item.badge}</span>
            </div>
            <p>{item.status}</p>
          </NavLink>
        ))}
      </nav>

      <main className="planner-hub-content">
        <Outlet />
      </main>
    </div>
  )
}
