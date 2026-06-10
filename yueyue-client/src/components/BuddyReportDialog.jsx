import { useEffect, useState } from 'react'

const reportReasonOptions = [
  '疑似广告或引流',
  '疑似票务交易',
  '疑似骚扰或不友善内容',
  '联系方式或描述异常',
  '其他问题',
]

const defaultForm = {
  reason: reportReasonOptions[0],
  description: '',
  reporterContact: '',
}

export function BuddyReportDialog({ open, submitting, onClose, onSubmit }) {
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    if (open) {
      setForm(defaultForm)
    }
  }, [open])

  if (!open) {
    return null
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="dialog-backdrop" onClick={onClose} role="presentation">
      <section
        aria-labelledby="buddy-report-title"
        aria-modal="true"
        className="dialog-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="dialog-header">
          <div>
            <p className="planner-section-title">举报这条帖子</p>
            <h3 id="buddy-report-title">告诉平台具体是什么问题</h3>
          </div>
          <button className="ghost-button" onClick={onClose} type="button">
            关闭
          </button>
        </div>

        <form className="planner-module-form" onSubmit={handleSubmit}>
          <div className="planner-form-grid">
            <label className="planner-field planner-field-wide">
              <span>举报原因</span>
              <select onChange={(event) => updateField('reason', event.target.value)} value={form.reason}>
                {reportReasonOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="planner-field planner-field-wide">
              <span>补充说明</span>
              <textarea
                className="planner-textarea"
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="例如：包含广告引流、票务交易、骚扰内容，或联系方式明显异常。"
                rows={4}
                value={form.description}
              />
            </label>

            <label className="planner-field planner-field-wide">
              <span>你的联系方式（选填）</span>
              <input
                onChange={(event) => updateField('reporterContact', event.target.value)}
                placeholder="方便平台必要时回访，不会公开展示"
                type="text"
                value={form.reporterContact}
              />
            </label>
          </div>

          <div className="planner-submit-row">
            <span className="planner-submit-hint">举报信息仅用于平台审核，不会直接公开给对方。</span>
            <button className="hero-primary-v3" disabled={submitting} type="submit">
              {submitting ? '正在提交举报...' : '提交举报'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
