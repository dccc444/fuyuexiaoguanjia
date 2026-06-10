import React from 'react'
import { Button, Text, View } from '@tarojs/components'
import classNames from 'classnames'
import styles from './index.module.scss'

interface SectionHeaderProps {
  title: string
  subtitle: string
  actionText?: string
  onAction?: () => void
  compact?: boolean
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, actionText, onAction, compact = false }) => {
  return (
    <View className={classNames(styles.wrapper, compact && styles.compact)}>
      <View className={styles.copy}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.subtitle}>{subtitle}</Text>
      </View>
      {actionText && onAction ? (
        <Button className={styles.action} onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </View>
  )
}

export default SectionHeader
