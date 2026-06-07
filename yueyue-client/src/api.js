const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function parseResponse(response) {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || '请求失败，请稍后再试')
  }

  return data
}

export async function generateBattleBook(payload) {
  const response = await fetch(`${API_BASE_URL}/battle-books/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function regenerateBattleBook(id, payload = {}) {
  const response = await fetch(`${API_BASE_URL}/battle-books/${id}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function getBattleBook(id) {
  const response = await fetch(`${API_BASE_URL}/battle-books/${id}`)
  return parseResponse(response)
}

export async function listBattleBooks() {
  const response = await fetch(`${API_BASE_URL}/battle-books`)
  return parseResponse(response)
}

export async function deleteBattleBook(id) {
  const response = await fetch(`${API_BASE_URL}/battle-books/${id}`, {
    method: 'DELETE',
  })

  return parseResponse(response)
}

export async function createShareLink(id) {
  const response = await fetch(`${API_BASE_URL}/battle-books/${id}/share`, {
    method: 'POST',
  })

  const data = await parseResponse(response)

  if (typeof window !== 'undefined' && data.shareUrl) {
    try {
      const shareUrl = new URL(data.shareUrl, window.location.origin)
      const isLocalApiHost = ['localhost', '127.0.0.1'].includes(shareUrl.hostname) && shareUrl.port === '4000'

      if (isLocalApiHost) {
        data.shareUrl = `${window.location.origin}/shared/${data.token}`
      }
    } catch {
      data.shareUrl = `${window.location.origin}/shared/${data.token}`
    }
  }

  return data
}

export async function getSharedBattleBook(token) {
  const response = await fetch(`${API_BASE_URL}/shared/${token}`)
  return parseResponse(response)
}

export async function getVenueRulePreview({ city, venue, sceneType }) {
  const params = new URLSearchParams()
  if (city) params.set('city', city)
  if (venue) params.set('venue', venue)
  if (sceneType) params.set('sceneType', sceneType)

  const response = await fetch(`${API_BASE_URL}/venue-rules?${params.toString()}`)
  return parseResponse(response)
}

export async function listVenueRules() {
  const response = await fetch(`${API_BASE_URL}/venue-rules`)
  return parseResponse(response)
}

export async function getMoneyDashboard(battleBookId) {
  const response = await fetch(`${API_BASE_URL}/battle-books/${battleBookId}/money`)
  return parseResponse(response)
}

export async function suggestBudgetPlan(battleBookId, totalBudget) {
  const response = await fetch(`${API_BASE_URL}/battle-books/${battleBookId}/budget/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ totalBudget }),
  })

  return parseResponse(response)
}

export async function saveBudgetPlan(battleBookId, payload) {
  const response = await fetch(`${API_BASE_URL}/battle-books/${battleBookId}/budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function addExpenseMember(expenseBookId, payload) {
  const response = await fetch(`${API_BASE_URL}/expense-books/${expenseBookId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function removeExpenseMember(memberId) {
  const response = await fetch(`${API_BASE_URL}/expense-members/${memberId}`, {
    method: 'DELETE',
  })

  return parseResponse(response)
}

export async function addExpenseItem(expenseBookId, payload) {
  const response = await fetch(`${API_BASE_URL}/expense-books/${expenseBookId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function removeExpenseItem(itemId) {
  const response = await fetch(`${API_BASE_URL}/expense-items/${itemId}`, {
    method: 'DELETE',
  })

  return parseResponse(response)
}
