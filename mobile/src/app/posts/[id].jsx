import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Alert,
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
import Button from '../../components/Button.jsx'
import Comments from '../../components/Comments.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import StackHeader from '../../components/StackHeader.jsx'
import { styles } from '../../theme/commonStyles.js'
import { colors, fontSize, spacing, weights } from '../../theme/tokens.js'
import { compactNumber, timeAgo } from '../../utils/format.js'

export default function PostDetail() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const [post, setPost] = useState(null)
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
    setPost(null)
    setLiked(false)
    setFavorited(false)
    setStatusReady(false)
    likeLock.current = false
    favLock.current = false
    api
      .post(id)
      .then((data) => {
        if (cancelled) return
        setPost(data)
        setCommentsCount(data.comments_count ?? 0)
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
    Promise.all([api.myLikes('post'), api.myFavorites('post')])
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
      const res = await api.toggleLike('post', post.id)
      setLiked(res.liked)
      setPost((prev) => ({ ...prev, likes: res.likes }))
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
      const res = await api.toggleFavorite('post', post.id)
      setFavorited(res.favorited)
      setPost((prev) => ({ ...prev, favorites_count: res.favorites_count }))
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

  const remove = () => {
    Alert.alert('删除笔记', '确认删除这篇笔记吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deletePost(post.id)
            if (router.canGoBack()) router.back()
            else router.replace('/')
          } catch (err) {
            setError(err.message)
          }
        },
      },
    ])
  }

  if (loading) {
    return (
      <View style={styles.screen}>
        <StackHeader title="养宠笔记" />
        <View style={styles.contentPad}>
          <Skeleton height={380} style={{ marginTop: 14 }} />
        </View>
      </View>
    )
  }

  if (!post) {
    return (
      <View style={styles.screen}>
        <StackHeader title="养宠笔记" />
        <EmptyState text={error || '笔记不存在'} />
      </View>
    )
  }

  const canEdit = user && (user.is_admin || user.id === post.author?.id)
  const images = post.images?.length ? post.images : post.cover_image ? [post.cover_image] : []

  return (
    <View style={styles.screen}>
      <StackHeader title="养宠笔记" />
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
          <Text style={styles.detailTitle}>{post.title}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.cardAuthor, { flex: 1 }]}>
              <Avatar
                uri={post.author?.avatar}
                name={post.author?.nickname || '匿名'}
                size={38}
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: fontSize.body, fontWeight: weights.bold, color: colors.text1 }}>
                  {post.author?.nickname || '匿名铲屎官'}
                </Text>
                <Text style={{ fontSize: fontSize.tiny, color: colors.text3, marginTop: 2 }}>
                  {timeAgo(post.created_at)} · {compactNumber(post.views)} 次浏览
                </Text>
              </View>
            </View>

            {canEdit ? (
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push(`/publish?id=${post.id}`)}
                >
                  编辑
                </Button>
                <Button variant="danger" size="sm" onPress={remove}>
                  删除
                </Button>
              </View>
            ) : null}
          </View>

          <Text style={[styles.paragraph, { marginTop: 20 }]}>{post.content}</Text>

          {post.tags?.length > 0 ? (
            <View style={styles.tagsWrap}>
              {post.tags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  #{tag}
                </Text>
              ))}
            </View>
          ) : null}

          {images.length > 0 ? (
            <View style={{ gap: spacing.md, marginTop: 18 }}>
              {images.map((url) => (
                <Image
                  key={url}
                  source={{ uri: url }}
                  style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 14, backgroundColor: '#f1f1f3' }}
                  contentFit="cover"
                  transition={150}
                />
              ))}
            </View>
          ) : null}

          {post.pet_id ? (
            <Pressable
              onPress={() => router.push(`/pets/${post.pet_id}`)}
              style={[styles.chip, { alignSelf: 'flex-start', marginTop: 20 }]}
            >
              <Text style={styles.chipText}>🐾 查看关联的宠物档案</Text>
            </Pressable>
          ) : null}

          <View style={{ marginTop: spacing.md }}>
            <ActionBar
              liked={liked}
              likes={post.likes}
              favorited={favorited}
              favorites={post.favorites_count ?? 0}
              comments={commentsCount}
              onLike={toggleLike}
              onFavorite={toggleFavorite}
              onComment={scrollToComments}
              likeBusy={liking || !statusReady}
              favoriteBusy={favoriting || !statusReady}
              extra={
                <Button variant="ghost" size="sm" onPress={() => router.push('/publish')}>
                  我也要发布
                </Button>
              }
            />
          </View>
        </View>

        <View
          style={[styles.panel, { marginTop: 20 }]}
          onLayout={(event) => {
            commentsY.current = event.nativeEvent.layout.y
          }}
        >
          <Comments targetType="post" targetId={post.id} onCountChange={setCommentsCount} />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}