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

export async function getPlaceSuggestions({ keyword, city }) {
  const params = new URLSearchParams()
  if (keyword) params.set('q', keyword)
  if (city) params.set('city', city)

  const response = await fetch(`${API_BASE_URL}/maps/place-suggestions?${params.toString()}`)
  return parseResponse(response)
}

export async function geocodePlace(payload) {
  const response = await fetch(`${API_BASE_URL}/maps/geocode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function getRoutePlan(payload) {
  const response = await fetch(`${API_BASE_URL}/maps/route-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function importPlannerActivity(payload) {
  const response = await fetch(`${API_BASE_URL}/planner/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

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

export async function updateExpenseBookDefaults(expenseBookId, payload) {
  const response = await fetch(`${API_BASE_URL}/expense-books/${expenseBookId}/defaults`, {
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

export async function submitFeedback(payload) {
  const response = await fetch(`${API_BASE_URL}/feedbacks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function listBuddyPosts(filters = {}) {
  const params = new URLSearchParams()
  if (filters.city) params.set('city', filters.city)
  if (filters.eventDate) params.set('eventDate', filters.eventDate)
  if (filters.sceneType) params.set('sceneType', filters.sceneType)
  if (filters.intentType) params.set('intentType', filters.intentType)
  if (filters.venue) params.set('venue', filters.venue)
  if (filters.intentTag) params.set('intentTag', filters.intentTag)

  const queryString = params.toString()
  const response = await fetch(`${API_BASE_URL}/buddy-posts${queryString ? `?${queryString}` : ''}`)
  return parseResponse(response)
}

export async function getBuddyPost(id) {
  const response = await fetch(`${API_BASE_URL}/buddy-posts/${id}`)
  return parseResponse(response)
}

export async function createBuddyPost(payload) {
  const response = await fetch(`${API_BASE_URL}/buddy-posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function updateBuddyPost(id, payload) {
  const response = await fetch(`${API_BASE_URL}/buddy-posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function updateBuddyPostStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/buddy-posts/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

  return parseResponse(response)
}

export async function deleteBuddyPost(id) {
  const response = await fetch(`${API_BASE_URL}/buddy-posts/${id}`, {
    method: 'DELETE',
  })

  return parseResponse(response)
}

export async function reportBuddyPost(id, payload) {
  const response = await fetch(`${API_BASE_URL}/buddy-posts/${id}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function listMyBuddyPosts() {
  const response = await fetch(`${API_BASE_URL}/my/buddy-posts`)
  return parseResponse(response)
}

export async function toggleBuddyFavorite(id) {
  const response = await fetch(`${API_BASE_URL}/buddy-posts/${id}/favorite`, {
    method: 'POST',
  })

  return parseResponse(response)
}

export async function toggleBuddyJoinIntent(id, payload = {}) {
  const response = await fetch(`${API_BASE_URL}/buddy-posts/${id}/join-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function listFeedbacks() {
  const response = await fetch(`${API_BASE_URL}/admin/feedbacks`)
  return parseResponse(response)
}
