import React, { useEffect, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import SectionHeader from '@/components/SectionHeader'
import { listPlannerModules, listTrips } from '@/services/mockService'
import type { PlannerModule, TripSummary } from '@/types/models'
import styles from './index.module.scss'

const PlannerPage: React.FC = () => {
  const [modules, setModules] = useState<PlannerModule[]>([])
  const [trips, setTrips] = useState<TripSummary[]>([])

  useEffect(() => {
    async function loadPlannerData() {
      console.info('[PlannerPage] load planner data')
      const [moduleData, tripData] = await Promise.all([listPlannerModules(), listTrips()])
      setModules(moduleData)
      setTrips(tripData.slice(0, 2))
    }

    loadPlannerData().catch((error) => {
      console.error('[PlannerPage] load planner data failed', error)
    })
  }, [])

  const readyCount = modules.filter((item) => item.status === 'ready').length

  return (
    <View className={styles.page}>
      <View className={styles.hero}>
        <Text className={styles.heroTitle}>把这场安排一路收好</Text>
        <Text className={styles.heroCopy}>导入活动后，路线、票务、会合和预算都能在这里接着做。</Text>

        <View className={styles.progressCard}>
          <Text className={styles.progressLabel}>当前进度</Text>
          <Text className={styles.progressValue}>{`${readyCount}/${modules.length}`}</Text>
          <Text className={styles.heroCopy}>已经收好 {readyCount} 项，剩下的从最急的那块继续。</Text>
        </View>

        <View className={styles.actionRow}>
          <Button className={styles.primaryButton} onClick={() => Taro.showToast({ title: '导入功能下一轮接入', icon: 'none' })}>
            导入活动
          </Button>
          <Button className={styles.secondaryButton} onClick={() => Taro.navigateTo({ url: '/pages/battle-book/index?id=trip-1' })}>
            查看整份计划
          </Button>
        </View>
      </View>

      <View className={styles.section}>
        <SectionHeader subtitle='先做最需要的那块' title='规划入口' />
        <View className={styles.moduleGrid}>
          {modules.map((item) => (
            <Button
              className={styles.moduleButton}
              key={item.id}
              onClick={() => Taro.showToast({ title: `${item.title}已排进小程序页`, icon: 'none' })}
            >
              <Text className={styles.moduleStatus}>{item.status === 'ready' ? '已收好' : '待补'}</Text>
              <Text className={styles.moduleTitle}>{item.title}</Text>
              <Text className={styles.moduleNote}>{item.note}</Text>
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <SectionHeader subtitle='最近都接着从这开始' title='最近安排' />
        <View className={styles.tripList}>
          {trips.map((item) => (
            <Button
              className={styles.tripButton}
              key={item.id}
              onClick={() => Taro.navigateTo({ url: `/pages/battle-book/index?id=${item.id}` })}
            >
              <Text className={styles.tripLabel}>{item.progressText}</Text>
              <Text className={styles.tripTitle}>{item.eventName}</Text>
              <Text className={styles.tripMeta}>{`${item.city} · ${item.venue} · ${item.eventDate}`}</Text>
            </Button>
          ))}
        </View>
      </View>
    </View>
  )
}

export default PlannerPage
