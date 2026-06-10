import React, { useEffect, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import SectionHeader from '@/components/SectionHeader'
import { getMineOverview, listBuddyPosts, listTrips } from '@/services/mockService'
import type { BuddyPost, MineOverview, TripSummary } from '@/types/models'
import styles from './index.module.scss'

const MinePage: React.FC = () => {
  const [overview, setOverview] = useState<MineOverview>({ tripCount: 0, cityCount: 0, shareCount: 0 })
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [buddies, setBuddies] = useState<BuddyPost[]>([])

  useEffect(() => {
    async function loadMineData() {
      console.info('[MinePage] load mine data')
      const [overviewData, tripData, buddyData] = await Promise.all([getMineOverview(), listTrips(), listBuddyPosts()])
      setOverview(overviewData)
      setTrips(tripData.slice(0, 2))
      setBuddies(buddyData.slice(0, 2))
    }

    loadMineData().catch((error) => {
      console.error('[MinePage] load mine data failed', error)
    })
  }, [])

  return (
    <View className={styles.page}>
      <View className={styles.hero}>
        <Text className={styles.title}>把我的赴约收好</Text>
        <Text className={styles.copy}>最近安排、我的发布和最近分享，都收在这里。</Text>

        <View className={styles.statGrid}>
          <View className={styles.statCard}>
            <Text className={styles.statLabel}>当前安排</Text>
            <Text className={styles.statValue}>{overview.tripCount} 场</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statLabel}>去过的城市</Text>
            <Text className={styles.statValue}>{overview.cityCount} 座</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statLabel}>分享记录</Text>
            <Text className={styles.statValue}>{overview.shareCount} 次</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <SectionHeader subtitle='最快开始的几件事' title='快捷入口' />
        <View className={styles.quickGrid}>
          <Button className={styles.quickButton} onClick={() => Taro.switchTab({ url: '/pages/planner/index' })}>
            <Text className={styles.quickTag}>最快开始</Text>
            <Text className={styles.quickTitle}>导入活动</Text>
            <Text className={styles.quickNote}>先把截图、短信或链接带进来。</Text>
          </Button>
          <Button className={styles.quickButton} onClick={() => Taro.switchTab({ url: '/pages/buddy/index' })}>
            <Text className={styles.quickTag}>想找人一起</Text>
            <Text className={styles.quickTitle}>去搭子广场</Text>
            <Text className={styles.quickNote}>先看看同城同场的人都在发什么。</Text>
          </Button>
        </View>
      </View>

      <View className={styles.section}>
        <SectionHeader subtitle='最近安排' title='上次看到这' />
        <View className={styles.list}>
          {trips.map((item) => (
            <Button
              className={styles.listItem}
              key={item.id}
              onClick={() => Taro.navigateTo({ url: `/pages/battle-book/index?id=${item.id}` })}
            >
              <Text className={styles.itemTag}>{item.progressText}</Text>
              <Text className={styles.itemTitle}>{item.eventName}</Text>
              <Text className={styles.itemMeta}>{`${item.city} · ${item.venue} · ${item.eventDate}`}</Text>
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <SectionHeader subtitle='我的发布' title='最近发过这些' />
        <View className={styles.list}>
          {buddies.map((item) => (
            <Button
              className={styles.listItem}
              key={item.id}
              onClick={() => Taro.navigateTo({ url: `/pages/buddy-detail/index?id=${item.id}` })}
            >
              <Text className={styles.itemTag}>{item.intentType}</Text>
              <Text className={styles.itemTitle}>{item.eventName}</Text>
              <Text className={styles.itemMeta}>{`${item.city} · ${item.venue} · ${item.eventDate}`}</Text>
            </Button>
          ))}
        </View>
      </View>
    </View>
  )
}

export default MinePage
