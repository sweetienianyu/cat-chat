import { useMemo } from 'react'
import { View } from 'react-native'
import Skeleton from './Skeleton.jsx'
import WaterfallCard from './WaterfallCard.jsx'

const COLUMN_GAP = 12
// 卡片信息区（标题/标签/底部）的估算高度，用于列高平衡
const BODY_WEIGHT = 0.42

/** 两列均衡瀑布流：按累计高度把卡片分配到较矮的一列 */
export default function MasonryList({ items, likedMap = {}, onLike }) {
  const columns = useMemo(() => {
    const cols = [[], []]
    const heights = [0, 0]
    items.forEach((item) => {
      const target = heights[0] <= heights[1] ? 0 : 1
      cols[target].push(item)
      heights[target] += 1 / item.ratio + BODY_WEIGHT
    })
    return cols
  }, [items])

  return (
    <View style={{ flexDirection: 'row', gap: COLUMN_GAP, alignItems: 'flex-start' }}>
      {columns.map((column, index) => (
        <View key={index} style={{ flex: 1 }}>
          {column.map((item) => (
            <WaterfallCard
              key={`${item.type}-${item.id}`}
              item={item}
              liked={likedMap[item.type]?.has(item.id)}
              onLike={onLike}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

const SKELETON_RATIOS = [0.85, 1.15, 0.78, 1.3, 0.95, 1.05, 0.8, 1.2]

export function MasonrySkeleton({ count = 8 }) {
  const columns = [[], []]
  const heights = [0, 0]
  Array.from({ length: count }).forEach((_, index) => {
    const ratio = SKELETON_RATIOS[index % SKELETON_RATIOS.length]
    const target = heights[0] <= heights[1] ? 0 : 1
    columns[target].push(index)
    heights[target] += ratio + BODY_WEIGHT
  })

  return (
    <View style={{ flexDirection: 'row', gap: COLUMN_GAP, alignItems: 'flex-start' }}>
      {columns.map((column, colIndex) => (
        <View key={colIndex} style={{ flex: 1 }}>
          {column.map((index) => {
            const ratio = SKELETON_RATIOS[index % SKELETON_RATIOS.length]
            return (
              <Skeleton key={index} height={Math.round(ratio * 160) + 90} style={{ marginBottom: 16 }} />
            )
          })}
        </View>
      ))}
    </View>
  )
}