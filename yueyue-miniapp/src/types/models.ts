export type SceneType = 'concert' | 'festival' | 'match' | 'other'

export interface TrustItem {
  id: string
  title: string
  note: string
}

export interface TripSummary {
  id: string
  sceneType: SceneType
  eventName: string
  targetName: string
  city: string
  venue: string
  eventDate: string
  startTime: string
  ticketArea: string
  progressText: string
  budgetText: string
  routeSummary: string
  meetupSummary: string
}

export interface BuddyPost {
  id: string
  sceneType: SceneType
  eventName: string
  city: string
  venue: string
  eventDate: string
  intentType: string
  content: string
  tags: string[]
  contactVisibility: 'public' | 'after_join'
  nickname: string
}

export interface PlannerModule {
  id: string
  title: string
  note: string
  status: 'ready' | 'pending'
}

export interface MineOverview {
  tripCount: number
  cityCount: number
  shareCount: number
}
