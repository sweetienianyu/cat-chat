import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { styles } from '../theme/commonStyles.js'
import { colors } from '../theme/tokens.js'
import { compactNumber } from '../utils/format.js'
import Toast from './Toast.jsx'

const ICON_SIZE = 23

function HeartIcon({ filled, color }) {
  return (
    <Svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE}>
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function StarIcon({ filled, color }) {
  return (
    <Svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE}>
      <Path
        d="M12 2.6l2.9 6.03 6.6.7-4.9 4.44 1.36 6.5L12 17.2l-5.96 3.07 1.36-6.5-4.9-4.44 6.6-.7L12 2.6z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function CommentIcon({ color }) {
  return (
    <Svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE}>
      <Path
        d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.7 8.7 0 0 1-3.9-.9L3 21l1.9-5.6A8.3 8.3 0 0 1 4 11.5 8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default function ActionBar({
  liked,
  likes = 0,
  favorited,
  favorites = 0,
  comments = 0,
  onLike,
  onFavorite,
  onComment,
  extra,
  likeBusy = false,
  favoriteBusy = false,
}) {
  const [toast, setToast] = useState('')
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const showToast = (text) => {
    setToast(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(''), 1600)
  }

  const handleFavorite = async () => {
    const next = await onFavorite?.()
    if (typeof next === 'boolean') showToast(next ? '已收藏' : '已取消收藏')
  }

  return (
    <>
      <View style={styles.actionBar}>
        <Pressable
          disabled={likeBusy}
          onPress={() => onLike?.()}
          style={({ pressed }) => [
            styles.actionItem,
            likeBusy && styles.btnDisabled,
            pressed && !likeBusy && { opacity: 0.7 },
          ]}
        >
          <HeartIcon filled={liked} color={liked ? colors.brand : colors.text2} />
          <Text style={[styles.actionItemText, liked && { color: colors.brand }]}>
            {compactNumber(likes)}
          </Text>
        </Pressable>

        <Pressable
          disabled={favoriteBusy}
          onPress={handleFavorite}
          style={({ pressed }) => [
            styles.actionItem,
            favoriteBusy && styles.btnDisabled,
            pressed && !favoriteBusy && { opacity: 0.7 },
          ]}
        >
          <StarIcon filled={favorited} color={favorited ? colors.brand : colors.text2} />
          <Text style={[styles.actionItemText, favorited && { color: colors.brand }]}>
            {compactNumber(favorites)}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onComment?.()}
          style={({ pressed }) => [styles.actionItem, pressed && { opacity: 0.7 }]}
        >
          <CommentIcon color={colors.text2} />
          <Text style={styles.actionItemText}>{compactNumber(comments)}</Text>
        </Pressable>

        {extra ? <View style={{ marginLeft: 'auto' }}>{extra}</View> : null}
      </View>
      <Toast message={toast} />
    </>
  )
}