import { useEffect, useState } from 'react'
import { listBattleBooks } from '../api'

export function useBattleBooks() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    const data = await listBattleBooks()
    const nextItems = Array.isArray(data?.items) ? data.items : []
    setItems(nextItems)
    return nextItems
  }

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await listBattleBooks()
        if (!active) return
        setItems(Array.isArray(data?.items) ? data.items : [])
        setError('')
      } catch (loadError) {
        if (!active) return
        setItems([])
        setError(loadError.message || '加载安排失败，请稍后再试。')
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

  return {
    items,
    loading,
    error,
    refresh,
    setItems,
  }
}
