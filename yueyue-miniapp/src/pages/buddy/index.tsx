import React, { useEffect, useMemo, useState } from 'react'
import { Button, ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import { listBuddyPosts } from '@/services/mockService'
import type { BuddyPost, SceneType } from '@/types/models'
import { getSceneLabel, sceneOptions } from '@/utils/scene'
import styles from './index.module.scss'

const BuddyPage: React.FC = () => {
  const [sceneType, setSceneType] = useState<SceneType>('concert')
  const [items, setItems] = useState<BuddyPost[]>([])

  useEffect(() => {
    async function loadItems() {
      console.info('[BuddyPage] load buddy posts')
      const data = await listBuddyPosts()
      setItems(data)
    }

    loadItems().catch((error) => {
      console.error('[BuddyPage] load buddy posts failed', error)
    })
  }, [])

  const filteredItems = useMemo(() => items.filter((item) => item.sceneType === sceneType), [items, sceneType])

  return (
    <View className={styles.page}>
      <View className={styles.hero}>
        <Text className={styles.eyebrow}>同城同场一起去</Text>
        <Text className={styles.title}>先锁定活动，再找对的人</Text>
        <Text className={styles.copy}>先看同场同城的人，再决定一起进场、散场，还是拼房拼车。</Text>

        <ScrollView className={styles.chipScroll} scrollX>
          {sceneOptions.map((item) => (
            <Button
              key={item.value}
              className={classNames(styles.chip, sceneType === item.value && styles.chipActive)}
              onClick={() => setSceneType(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </ScrollView>
      </View>

      <View className={styles.section}>
        <View className={styles.summaryGrid}>
          <View className={styles.summaryCard}>
            <Text className={styles.summaryLabel}>当前场景</Text>
            <Text className={styles.summaryValue}>{getSceneLabel(sceneType)}</Text>
            <Text className={styles.summaryNote}>先看同场的人，沟通成本会低很多。</Text>
          </View>
          <View className={styles.summaryCard}>
            <Text className={styles.summaryLabel}>当前数量</Text>
            <Text className={styles.summaryValue}>{filteredItems.length} 条需求</Text>
            <Text className={styles.summaryNote}>先从最像你这场的人开始看。</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <SectionHeader subtitle='同场的人都在这' title='找搭子广场' />
        <View className={styles.list}>
          {filteredItems.map((item) => (
            <View className={styles.card} key={item.id}>
              <View className={styles.cardHead}>
                <View>
                  <Text className={styles.cardTag}>{item.intentType}</Text>
                  <Text className={styles.cardTitle}>{item.eventName}</Text>
                </View>
                <Text className={styles.cardStatus}>
                  {item.contactVisibility === 'public' ? '立即联系' : '我也想一起'}
                </Text>
              </View>

              <Text className={styles.cardMeta}>{`${item.city} · ${item.venue} · ${item.eventDate}`}</Text>
              <Text className={styles.cardCopy}>{item.content}</Text>

              <View className={styles.tagRow}>
                {item.tags.map((tag) => (
                  <Text className={styles.tagItem} key={tag}>
                    {tag}
                  </Text>
                ))}
              </View>

              <View className={styles.actionRow}>
                <Button
                  className={styles.primaryButton}
                  onClick={() => Taro.navigateTo({ url: `/pages/buddy-detail/index?id=${item.id}` })}
                >
                  {item.contactVisibility === 'public' ? '立即联系' : '我也想一起'}
                </Button>
                <Button
                  className={styles.secondaryButton}
                  onClick={() => Taro.navigateTo({ url: `/pages/buddy-detail/index?id=${item.id}` })}
                >
                  查看详情
                </Button>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.floatingBar}>
        <Button
          className={styles.floatingButton}
          onClick={() => Taro.showToast({ title: '发布页下一轮接入', icon: 'none' })}
        >
          发布我的搭子需求
        </Button>
      </View>
    </View>
  )
}

export default BuddyPage
