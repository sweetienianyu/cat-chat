import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { memo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { styles } from '../theme/commonStyles.js'
import { colors } from '../theme/tokens.js'
import { compactNumber } from '../utils/format.js'
import Avatar from './Avatar.jsx'

function WaterfallCard({ item, liked, onLike }) {
  const router = useRouter()

  const open = () => {
    router.push(item.type === 'pet' ? `/pets/${item.id}` : `/posts/${item.id}`)
  }

  return (
    <Pressable
      onPress={open}
      style={({ pressed }) => [styles.card, { marginBottom: 16 }, pressed && { opacity: 0.92 }]}
    >
      <View style={[styles.cardCover, { aspectRatio: 1 / item.ratio }]}>
        <Image
          source={{ uri: item.cover }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={150}
        />
        <View style={styles.cardTag}>
          <Text style={styles.cardTagText}>
            {item.type === 'pet' ? '宠物档案' : '养宠笔记'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {item.sub ? (
          <Text style={styles.cardSub} numberOfLines={1}>
            {item.sub}
          </Text>
        ) : null}

        {item.chips?.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {item.chips.slice(0, 3).map((chip) => (
              <Text key={chip} style={styles.miniChip}>
                {chip}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.cardFoot}>
          <View style={styles.cardAuthor}>
            <Avatar uri={item.authorAvatar} name={item.authorName} size={22} style={{ borderWidth: 1 }} />
            <Text style={styles.cardAuthorText} numberOfLines={1}>
              {item.authorName}
            </Text>
          </View>

          <Pressable
            onPress={() => onLike?.(item)}
            hitSlop={8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={14}
              color={liked ? colors.brand : colors.text3}
            />
            <Text style={{ fontSize: 12, color: liked ? colors.brand : colors.text3 }}>
              {compactNumber(item.likes)}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  )
}

export default memo(WaterfallCard)