import React, { useEffect, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { getBuddyPostById } from '@/services/mockService'
import type { BuddyPost } from '@/types/models'
import { getSceneLabel } from '@/utils/scene'
import styles from './index.module.scss'

const BuddyDetailPage: React.FC = () => {
  const router = useRouter()
  const [detail, setDetail] = useState<BuddyPost | null>(null)

  useEffect(() => {
    async function loadDetail() {
      console.info('[BuddyDetailPage] load detail', router.params.id)
      const data = await getBuddyPostById(router.params.id || '')
      setDetail(data || null)
    }

    loadDetail().catch((error) => {
      console.error('[BuddyDetailPage] load detail failed', error)
    })
  }, [router.params.id])

  if (!detail) {
    return (
      <View className={styles.page}>
        <View className={styles.hero}>
          <Text className={styles.title}>这条搭子信息还没带出来</Text>
          <Text className={styles.meta}>先回广场，再重新打开一次。</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={styles.hero}>
        <Text className={styles.eyebrow}>{`${getSceneLabel(detail.sceneType)} · ${detail.intentType}`}</Text>
        <Text className={styles.title}>{detail.eventName}</Text>
        <Text className={styles.meta}>{`${detail.city} · ${detail.venue} · ${detail.eventDate}`}</Text>
      </View>

      <View className={styles.card}>
        <Text className={styles.label}>这条需求</Text>
        <Text className={styles.value}>{detail.nickname}</Text>
        <Text className={styles.copy}>{detail.content}</Text>
      </View>

      <View className={styles.card}>
        <Text className={styles.label}>需求标签</Text>
        <View className={styles.tagRow}>
          {detail.tags.map((tag) => (
            <Text className={styles.tag} key={tag}>
              {tag}
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.label}>联系方式展示方式</Text>
        <Text className={styles.value}>
          {detail.contactVisibility === 'public' ? '可直接联系' : '点“我也想一起”后再展示'}
        </Text>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.secondaryButton} onClick={() => Taro.switchTab({ url: '/pages/buddy/index' })}>
          回广场
        </Button>
        <Button className={styles.primaryButton} onClick={() => Taro.showToast({ title: '已记录同行意向', icon: 'none' })}>
          我也想一起
        </Button>
      </View>
    </View>
  )
}

export default BuddyDetailPage
