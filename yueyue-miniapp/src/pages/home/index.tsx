import React, { useEffect, useMemo, useState } from 'react'
import { Button, ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import { listBuddyPosts, listTrustItems, listTrips } from '@/services/mockService'
import type { BuddyPost, SceneType, TripSummary, TrustItem } from '@/types/models'
import { getSceneLabel, sceneOptions } from '@/utils/scene'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const [sceneType, setSceneType] = useState<SceneType>('concert')
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [buddies, setBuddies] = useState<BuddyPost[]>([])
  const [trustList, setTrustList] = useState<TrustItem[]>([])

  useEffect(() => {
    async function loadPageData() {
      console.info('[HomePage] load page data')
      const [tripData, buddyData, trustData] = await Promise.all([listTrips(), listBuddyPosts(), listTrustItems()])
      setTrips(tripData)
      setBuddies(buddyData)
      setTrustList(trustData)
    }

    loadPageData().catch((error) => {
      console.error('[HomePage] load page data failed', error)
    })
  }, [])

  const filteredTrips = useMemo(
    () => trips.filter((item) => item.sceneType === sceneType).slice(0, 2),
    [sceneType, trips],
  )
  const filteredBuddies = useMemo(
    () => buddies.filter((item) => item.sceneType === sceneType).slice(0, 2),
    [buddies, sceneType],
  )

  const heroMap: Record<SceneType, { title: string; copy: string; planner: string }> = {
    concert: { title: '把这次奔赴收好', copy: '同场搭子、路线、票务和预算，都能一起先看清。', planner: '开始规划我的行程' },
    festival: { title: '把这场音乐节收好', copy: '会合、物料、住宿和返程，都能一口气理顺。', planner: '开始规划我的音乐节' },
    match: { title: '把这场球赛收好', copy: '同看台的人、进场路线和散场返程，都先收好。', planner: '开始规划我的球赛' },
    other: { title: '把这次见面收好', copy: '同行、路线和提醒，都可以先收在这里。', planner: '开始规划我的活动' },
  }

  const hero = heroMap[sceneType]

  return (
    <View className={styles.page}>
      <View className={styles.heroCard}>
        <ScrollView className={styles.sceneTabs} scrollX>
          {sceneOptions.map((item) => (
            <Button
              key={item.value}
              className={classNames(styles.sceneTab, sceneType === item.value && styles.sceneTabActive)}
              onClick={() => setSceneType(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </ScrollView>

        <View className={styles.heroMeta}>
          <Text className={styles.heroKicker}>找搭子 · 行程规划</Text>
          <Text className={styles.brandTag}>赴约小管家</Text>
        </View>

        <Text className={styles.heroTitle}>{hero.title}</Text>
        <Text className={styles.heroCopy}>{hero.copy}</Text>

        <View className={styles.heroActions}>
          <Button className={styles.primaryButton} onClick={() => Taro.switchTab({ url: '/pages/buddy/index' })}>
            立即找搭子
          </Button>
          <Button className={styles.secondaryButton} onClick={() => Taro.switchTab({ url: '/pages/planner/index' })}>
            {hero.planner}
          </Button>
        </View>

        <Button className={styles.ghostButton} onClick={() => Taro.switchTab({ url: '/pages/buddy/index' })}>
          浏览热门活动
        </Button>
      </View>

      <View className={styles.section}>
        <SectionHeader subtitle='热门都在这' title='推荐内容' />
        <Text className={styles.sectionCopy}>先看最近这两场，再决定先找人还是先做安排。</Text>

        <View className={styles.showcaseGrid}>
          <View className={styles.showcaseCard}>
            <View className={styles.showcaseHead}>
              <Text className={styles.showcaseHeadText}>热门活动</Text>
              <Button className={styles.textAction} onClick={() => Taro.switchTab({ url: '/pages/planner/index' })}>
                去规划
              </Button>
            </View>

            <View className={styles.list}>
              {filteredTrips.map((item) => (
                <View
                  className={styles.listItem}
                  key={item.id}
                  onClick={() => Taro.navigateTo({ url: `/pages/battle-book/index?id=${item.id}` })}
                >
                  <Text className={styles.itemTag}>{getSceneLabel(item.sceneType)}</Text>
                  <Text className={styles.itemTitle}>{item.eventName}</Text>
                  <Text className={styles.itemMeta}>{`${item.city} · ${item.venue} · ${item.eventDate}`}</Text>
                  <Text className={styles.itemNote}>{item.progressText}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.showcaseCard}>
            <View className={styles.showcaseHead}>
              <Text className={styles.showcaseHeadText}>热门搭子</Text>
              <Button className={styles.textAction} onClick={() => Taro.switchTab({ url: '/pages/buddy/index' })}>
                去广场
              </Button>
            </View>

            <View className={styles.list}>
              {filteredBuddies.map((item) => (
                <View
                  className={styles.listItem}
                  key={item.id}
                  onClick={() => Taro.navigateTo({ url: `/pages/buddy-detail/index?id=${item.id}` })}
                >
                  <Text className={styles.itemTag}>{item.intentType}</Text>
                  <Text className={styles.itemTitle}>{item.eventName}</Text>
                  <Text className={styles.itemMeta}>{`${item.city} · ${item.venue} · ${item.eventDate}`}</Text>
                  <Text className={styles.itemNote}>{item.content}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <SectionHeader subtitle='找搭子和赴约这件事，也可以更安心' title='信任与安全' />
        <View className={styles.trustGrid}>
          {trustList.map((item) => (
            <View className={styles.trustCard} key={item.id}>
              <Text className={styles.trustTitle}>{item.title}</Text>
              <Text className={styles.trustNote}>{item.note}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default HomePage
