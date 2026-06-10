const STORAGE_KEY = 'yueyue-share-history'
const MAX_RECORDS = 12

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readHistory() {
  if (!canUseStorage()) return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeHistory(records) {
  if (!canUseStorage()) return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // Ignore storage failures so sharing still works.
  }
}

export function getSharedBattleBookHistory() {
  return readHistory()
}

export function recordSharedBattleBook({ id, title, shareUrl }) {
  if (!id) return

  const next = readHistory()
    .filter((item) => item.id !== id)
    .concat({
      id,
      title: title || '未命名活动',
      shareUrl: shareUrl || '',
      sharedAt: new Date().toISOString(),
    })
    .sort((a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime())
    .slice(0, MAX_RECORDS)

  writeHistory(next)
}
