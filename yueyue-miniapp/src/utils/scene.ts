import type { SceneType } from '@/types/models'

export const sceneOptions: Array<{ value: SceneType; label: string }> = [
  { value: 'concert', label: '演唱会' },
  { value: 'festival', label: '音乐节' },
  { value: 'match', label: '球赛' },
  { value: 'other', label: '其他' },
]

export function getSceneLabel(sceneType: SceneType): string {
  const current = sceneOptions.find((item) => item.value === sceneType)
  return current?.label || '活动'
}
