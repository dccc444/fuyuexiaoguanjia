import React, { useEffect, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import SectionHeader from '@/components/SectionHeader'
import { getTripById } from '@/services/mockService'
import type { TripSummary } from '@/types/models'
import { getSceneLabel } from '@/utils/scene'
import styles from './index.module.scss'

const BattleBookPage: React.FC = () => {
  const router = useRouter()
  const [trip, setTrip] = useState<TripSummary | null>(null)

  useEffect(() => {
    async function loadDetail() {
      console.info('[BattleBookPage] load trip detail', router.params.id)
      const data = await getTripById(router.params.id || '')
      setTrip(data || null)
    }

    loadDetail().catch((error) => {
      console.error('[BattleBookPage] load trip detail failed', error)
    })
  }, [router.params.id])

  if (!trip) {
    return (
      <View className={styles.page}>
        <View className={styles.hero}>
          <Text className={styles.title}>这场活动还没带出来</Text>
          <Text className={styles.meta}>先回首页或规划页，再重新打开这场安排。</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={styles.hero}>
        <Text className={styles.eyebrow}>{getSceneLabel(trip.sceneType)}</Text>
        <Text className={styles.title}>{trip.eventName}</Text>
        <Text className={styles.meta}>{`${trip.city} · ${trip.venue} · ${trip.eventDate} ${trip.startTime}`}</Text>
      </View>

      <View className={styles.summaryGrid}>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryLabel}>这次去看</Text>
          <Text className={styles.summaryValue}>{trip.targetName}</Text>
          <Text className={styles.summaryNote}>票区 {trip.ticketArea}</Text>
        </View>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryLabel}>路线</Text>
          <Text className={styles.summaryValue}>{trip.routeSummary}</Text>
          <Text className={styles.summaryNote}>优先把到场时间卡在 18:00 前后。</Text>
        </View>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryLabel}>会合</Text>
          <Text className={styles.summaryValue}>{trip.meetupSummary}</Text>
          <Text className={styles.summaryNote}>一个人去时也建议先定好返程点。</Text>
        </View>
      </View>

      <View className={styles.section}>
        <SectionHeader subtitle='继续处理最要紧的那块' title='现在可以做什么' />
        <View className={styles.actionCard}>
          <Text className={styles.summaryValue}>预算 {trip.budgetText}</Text>
          <Text className={styles.summaryNote}>这场安排的记账、路线和分享动作，下一轮继续接入完整小程序页。</Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.secondaryButton} onClick={() => Taro.switchTab({ url: '/pages/planner/index' })}>
          继续完善
        </Button>
        <Button className={styles.secondaryButton} onClick={() => Taro.showToast({ title: '记账页下一轮接入', icon: 'none' })}>
          去记账
        </Button>
        <Button className={styles.primaryButton} onClick={() => Taro.showToast({ title: '分享功能下一轮接入', icon: 'none' })}>
          立刻分享
        </Button>
      </View>
    </View>
  )
}

export default BattleBookPage
