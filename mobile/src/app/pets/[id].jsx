import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { api } from '../../api/endpoints.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import ActionBar from '../../components/ActionBar.jsx'
import Avatar from '../../components/Avatar.jsx'
import Comments from '../../components/Comments.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import MasonryList, { MasonrySkeleton } from '../../components/MasonryList.jsx'
import SectionTitle from '../../components/SectionTitle.jsx'
import StackHeader from '../../components/StackHeader.jsx'
import { styles } from '../../theme/commonStyles.js'
import { colors, fontSize, radius, spacing, weights } from '../../theme/tokens.js'
import { compactNumber, timeAgo } from '../../utils/format.js'
import { toPostCard } from '../../utils/mappers.js'

export default function PetDetail() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const [pet, setPet] = useState(null)
  const [posts, setPosts] = useState([])
  const [active, setActive] = useState(0)
  const [liked, setLiked] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [statusReady, setStatusReady] = useState(false)
  const [liking, setLiking] = useState(false)
  const [favoriting, setFavoriting] = useState(false)
  const [commentsCount, setCommentsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const likeLock = useRef(false)
  const favLock = useRef(false)

  const scrollRef = useRef(null)
  const commentsY = useRef(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setActive(0)
    setPet(null)
    setLiked(false)
    setFavorited(false)
    setStatusReady(false)
    likeLock.current = false
    favLock.current = false
    Promise.all([api.pet(id), api.posts({ pet_id: id, size: 8 })])
      .then(([petData, postData]) => {
        if (cancelled) return
        setPet(petData)
        setCommentsCount(petData.comments_count ?? 0)
        setPosts(postData.items.map(toPostCard))
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!user) {
      setLiked(false)
      setFavorited(false)
      setStatusReady(true)
      return
    }
    let cancelled = false
    setStatusReady(false)
    Promise.all([api.myLikes('pet'), api.myFavorites('pet')])
      .then(([likeRes, favRes]) => {
        if (cancelled) return
        setLiked(likeRes.ids.includes(Number(id)))
        setFavorited(favRes.ids.includes(Number(id)))
      })
      .catch(() => {})
      .finally(() => !cancelled && setStatusReady(true))
    return () => {
      cancelled = true
    }
  }, [user, id])

  const toggleLike = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    if (likeLock.current || !statusReady) return
    likeLock.current = true
    setLiking(true)
    try {
      const res = await api.toggleLike('pet', pet.id)
      setLiked(res.liked)
      setPet((prev) => ({ ...prev, likes: res.likes }))
    } catch (err) {
      setError(err.message)
    } finally {
      likeLock.current = false
      setLiking(false)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      router.push('/login')
      return undefined
    }
    if (favLock.current || !statusReady) return undefined
    favLock.current = true
    setFavoriting(true)
    try {
      const res = await api.toggleFavorite('pet', pet.id)
      setFavorited(res.favorited)
      setPet((prev) => ({ ...prev, favorites_count: res.favorites_count }))
      return res.favorited
    } catch (err) {
      setError(err.message)
      return undefined
    } finally {
      favLock.current = false
      setFavoriting(false)
    }
  }

  const scrollToComments = () =>
    scrollRef.current?.scrollTo({ y: Math.max(0, commentsY.current - 12), animated: true })

  const likeRelated = async (item) => {
    if (!user) {
      router.push('/login')
      return
    }
    try {
      const res = await api.toggleLike('post', item.id)
      setPosts((prev) => prev.map((row) => (row.id === item.id ? { ...row, likes: res.likes } : row)))
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <View style={styles.screen}>
        <StackHeader title="宠物档案" />
        <View style={styles.contentPad}>
          <MasonrySkeleton count={4} />
        </View>
      </View>
    )
  }

  if (!pet) {
    return (
      <View style={styles.screen}>
        <StackHeader title="宠物档案" />
        <EmptyState text={error || '宠物不存在'} />
      </View>
    )
  }

  const gallery = pet.images?.length ? pet.images : [{ id: 0, url: pet.cover_image }]

  const infoCells = [
    ['种类', pet.species || '未知'],
    ['品种', pet.breed || '未知'],
    ['性别', pet.gender],
    ['年龄', pet.age || '未知'],
    ['所在城市', pet.city || '未知'],
    ['档案编号', `#${String(pet.id).padStart(4, '0')}`],
  ]

  return (
    <View style={styles.screen}>
      <StackHeader title={pet.name} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.contentPad}
          keyboardShouldPersistTaps="handled"
        >
        {error ? <Text style={[styles.formError, { marginTop: 14 }]}>{error}</Text> : null}

        <View style={[styles.panel, { marginTop: 14 }]}>
          <Image
            source={{ uri: gallery[active]?.url }}
            style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: radius.md, backgroundColor: '#f1f1f3' }}
            contentFit="cover"
            transition={150}
          />
          {gallery.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm, paddingTop: spacing.md }}
            >
              {gallery.map((image, index) => (
                <Pressable key={image.id ?? index} onPress={() => setActive(index)}>
                  <Image
                    source={{ uri: image.url }}
                    style={{
                      width: 66,
                      height: 66,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: index === active ? colors.brand : 'transparent',
                      backgroundColor: '#f1f1f3',
                    }}
                    contentFit="cover"
                    transition={120}
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>

        <View style={[styles.panel, { marginTop: 16 }]}>
          <Text style={styles.detailTitle}>{pet.name}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>👀 {compactNumber(pet.views)} 次浏览</Text>
            <Text style={styles.metaText}>❤️ {compactNumber(pet.likes)} 喜欢</Text>
            <Text style={styles.metaText}>🕒 {timeAgo(pet.created_at)}</Text>
          </View>

          <View style={styles.infoGrid}>
            {infoCells.map(([label, value]) => (
              <View key={label} style={styles.infoCell}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            ))}
          </View>

          {pet.tags?.length > 0 ? (
            <View style={styles.tagsWrap}>
              {pet.tags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  #{tag}
                </Text>
              ))}
            </View>
          ) : null}

          <Text style={styles.paragraph}>
            {pet.description || '这位小朋友还没有自我介绍～'}
          </Text>

          <View style={[styles.actionRow, { borderTopWidth: 0, paddingTop: 0 }]}>
            <Avatar
              uri={pet.owner?.avatar}
              name={pet.owner?.nickname || '官方'}
              size={38}
            />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: fontSize.body, fontWeight: weights.bold, color: colors.text1 }}>
                {pet.owner?.nickname || '宠物星球官方'}
              </Text>
              <Text style={{ fontSize: fontSize.tiny, color: colors.text3, marginTop: 2 }}>
                {pet.owner?.bio || '负责维护宠物档案'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.panel, { marginTop: 20 }]}>
          <ActionBar
            liked={liked}
            likes={pet.likes}
            favorited={favorited}
            favorites={pet.favorites_count ?? 0}
            comments={commentsCount}
            onLike={toggleLike}
            onFavorite={toggleFavorite}
            onComment={scrollToComments}
            likeBusy={liking || !statusReady}
            favoriteBusy={favoriting || !statusReady}
          />
        </View>

        <View
          style={[styles.panel, { marginTop: 20 }]}
          onLayout={(event) => {
            commentsY.current = event.nativeEvent.layout.y
          }}
        >
          <Comments targetType="pet" targetId={pet.id} onCountChange={setCommentsCount} />
        </View>

        <SectionTitle>相关养宠笔记</SectionTitle>
        {posts.length === 0 ? (
          <EmptyState text="还没有和 ta 相关的笔记" hint="登录后可以发布第一篇" />
        ) : (
          <MasonryList items={posts} onLike={likeRelated} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}