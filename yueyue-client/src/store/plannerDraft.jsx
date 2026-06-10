import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'yueyue-planner-draft-v1'

const defaultDraft = {
  sceneType: 'concert',
  eventName: '',
  targetName: '',
  city: '',
  venue: '',
  eventDate: '',
  startTime: '19:30',
  departureCity: '',
  companions: 1,
  budgetRange: 'mid',
  isCrossCity: false,
  isFirstTime: true,
  travelPreference: 'easy',
  arrivalBufferMinutes: 90,
  preferredTransportModes: ['transit', 'drive'],
  originInput: '',
  originLocation: null,
  destinationInput: '',
  destinationLocation: null,
  latestRoutePlan: null,
  hasTicket: false,
  ticketArea: '',
  merchPlan: '',
  meetupPlan: '',
  notes: '',
  lastUpdatedAt: '',
}

const PlannerDraftContext = createContext(null)

function readStoredDraft() {
  if (typeof window === 'undefined') return defaultDraft

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultDraft
    return { ...defaultDraft, ...JSON.parse(raw) }
  } catch {
    return defaultDraft
  }
}

export function PlannerDraftProvider({ children }) {
  const [draft, setDraft] = useState(readStoredDraft)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  }, [draft])

  const updateDraft = useCallback((patch) => {
    setDraft((current) => ({
      ...current,
      ...patch,
      lastUpdatedAt: new Date().toISOString(),
    }))
  }, [])

  const resetDraft = useCallback(() => setDraft(defaultDraft), [])

  const value = useMemo(
    () => ({
      draft,
      updateDraft,
      resetDraft,
    }),
    [draft, resetDraft, updateDraft],
  )

  return <PlannerDraftContext.Provider value={value}>{children}</PlannerDraftContext.Provider>
}

export function usePlannerDraft() {
  const context = useContext(PlannerDraftContext)

  if (!context) {
    throw new Error('usePlannerDraft must be used inside PlannerDraftProvider')
  }

  return context
}

export function getBasicCompletion(draft) {
  const requiredFields = ['sceneType', 'eventName', 'targetName', 'city', 'venue', 'eventDate', 'startTime']
  const completedCount = requiredFields.filter((field) => String(draft[field] || '').trim()).length

  return {
    completedCount,
    totalCount: requiredFields.length,
    isComplete: completedCount === requiredFields.length,
  }
}

export function getPlannerModuleStatuses(draft) {
  const basic = getBasicCompletion(draft)
  const hasTravelInput = Boolean(String(draft.originInput || draft.departureCity || '').trim())
  const hasTicketInput = Boolean(draft.hasTicket || String(draft.ticketArea || '').trim())
  const hasSocialInput = Boolean(
    String(draft.meetupPlan || '').trim() ||
      String(draft.merchPlan || '').trim() ||
      Number(draft.companions || 1) > 1 ||
      draft.isFirstTime === false,
  )

  return [
    {
      key: 'basic',
      title: '基础信息',
      href: '/planner/basic',
      badge: `${basic.completedCount}/${basic.totalCount}`,
      status: basic.isComplete ? '基础骨架已补齐' : '先把活动、城市、场馆和日期定下来',
      note: '所有模块都会复用这份草稿，不用重复填写。',
      ready: basic.isComplete,
    },
    {
      key: 'rules',
      title: '场馆规则',
      href: '/planner/rules',
      badge: draft.city && draft.venue ? '可查询' : '待补信息',
      status: draft.city && draft.venue ? '可以直接看禁带、入口和交通提醒' : '先补城市和场馆',
      note: '适合先排除最容易翻车的入场风险。',
      ready: Boolean(draft.city && draft.venue),
    },
    {
      key: 'travel',
      title: '路线与返程',
      href: '/planner/travel',
      badge: hasTravelInput ? '可规划' : '待补出发地',
      status: hasTravelInput ? '可以直接规划去程路线' : '先补出发地',
      note: '适合先看怎么去、几点出发更稳。',
      ready: hasTravelInput,
    },
    {
      key: 'ticket',
      title: '门票与位置',
      href: '/planner/ticket',
      badge: hasTicketInput ? '可生成' : '待补票务',
      status: hasTicketInput ? '可以直接看分区和入场建议' : '先补票务状态',
      note: '适合先看票档、看台和散场位置。',
      ready: hasTicketInput,
    },
    {
      key: 'social',
      title: '搭子 / 物料 / 会合',
      href: '/planner/social',
      badge: hasSocialInput ? '可生成' : '待补现场需求',
      status: hasSocialInput ? '可以直接整理会合与搭子方案' : '先补会合、物料或 solo 需求',
      note: '适合一个人去、想找搭子或要领物料时使用。',
      ready: hasSocialInput,
    },
  ]
}
