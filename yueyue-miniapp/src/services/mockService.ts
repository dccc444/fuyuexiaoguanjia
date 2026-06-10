import { buddyPosts, mineOverview, plannerModules, quickSceneCopy, tripSummaries, trustItems } from '@/data/mock'
import type { BuddyPost, MineOverview, PlannerModule, SceneType, TripSummary, TrustItem } from '@/types/models'

const WAIT_MS = 120

function wait<T>(payload: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(payload), WAIT_MS)
  })
}

export const listTrips = async (): Promise<TripSummary[]> => wait(tripSummaries)

export const listBuddyPosts = async (): Promise<BuddyPost[]> => wait(buddyPosts)

export const listPlannerModules = async (): Promise<PlannerModule[]> => wait(plannerModules)

export const listTrustItems = async (): Promise<TrustItem[]> => wait(trustItems)

export const getMineOverview = async (): Promise<MineOverview> => wait(mineOverview)

export const getTripById = async (id: string): Promise<TripSummary | undefined> =>
  wait(tripSummaries.find((item) => item.id === id))

export const getBuddyPostById = async (id: string): Promise<BuddyPost | undefined> =>
  wait(buddyPosts.find((item) => item.id === id))

export const getSceneCopy = async (sceneType: SceneType) => wait(quickSceneCopy[sceneType] || quickSceneCopy.concert)
