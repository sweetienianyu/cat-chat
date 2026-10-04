import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { api } from '../../api/endpoints.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import AppHeader from '../../components/AppHeader.jsx'
import Avatar from '../../components/Avatar.jsx'
import Button from '../../components/Button.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import MasonryList, { MasonrySkeleton } from '../../components/MasonryList.jsx'
import SectionTitle from '../../components/SectionTitle.jsx'
import { styles } from '../../theme/commonStyles.js'
import { colors, fontSize, radius, spacing, weights } from '../../theme/tokens.js'
import { toPetCard, toPostCard } from '../../utils/mappers.js'

export default function Mine() {
  const { user, logout, ready } = useAuth()
  const router = useRouter()

  const [posts, setPosts] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setPosts([])
      setFavorites([])
      setLoading(false)
      return
    }
    let cancelled = false
    Promise.all([api.myPosts(), api.myFavoriteItems()])
      .then(([postRes, favRes]) => {
        if (cancelled) return
        setPosts(postRes.items.map(toPostCard))
        setFavorites(
          favRes.items.map((item) => (item.kind === 'pet' ? toPetCard(item) : toPostCard(item))),
        )
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user])

  const remove = (item) => {
    Alert.alert('删除笔记', `确认删除《${item.title}》吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deletePost(item.id)
            setPosts((prev) => prev.filter((row) => row.id !== item.id))
          } catch (err) {
            setError(err.message)
          }
        },
      },
    ])
  }

  return (
    <View style={styles.screen}>
      <AppHeader showSearch={false} />

      {!ready || loading ? (
        <View style={styles.contentPad}>
          <View style={{ marginTop: 18 }}>
            <MasonrySkeleton count={4} />
          </View>
        </View>
      ) : !user ? (
        <View style={styles.contentPad}>
          <View style={[styles.panel, { marginTop: 18, alignItems: 'center' }]}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={{ marginBottom: 8, fontSize: 20, fontWeight: weights.bold, color: colors.text1 }}>
              还没有登录
            </Text>
            <Text style={{ color: colors.text3, fontSize: 13, marginBottom: 18 }}>
              登录后可以管理自己发布的笔记
            </Text>
            <Button variant="primary" size="lg" onPress={() => router.push('/login')}>
              去登录
            </Button>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.contentPad} keyboardShouldPersistTaps="handled">
          <View
            style={[
              styles.panel,
              { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 18 },
            ]}
          >
            <Avatar uri={user.avatar} name={user.nickname || user.username} size={72} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <Text style={{ fontSize: 22, fontWeight: weights.bold, color: colors.text1 }}>
                  {user.nickname || user.username}
                </Text>
                {user.is_admin ? (
                  <Text style={[styles.tag, { marginLeft: 10, backgroundColor: colors.brandSoft, color: colors.brand }]}>
                    管理员
                  </Text>
                ) : null}
              </View>
              <Text style={{ color: colors.text3, fontSize: fontSize.small, marginTop: 6 }}>
                @{user.username} · {user.bio || '这位铲屎官很低调'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.md }}>
            <Button variant="primary" onPress={() => router.push('/publish')}>
              ＋ 发布笔记
            </Button>
            <Button
              variant="ghost"
              onPress={() => {
                logout()
                router.replace('/')
              }}
            >
              退出登录
            </Button>
          </View>

          <SectionTitle>我的笔记（{posts.length}）</SectionTitle>

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          {posts.length === 0 ? (
            <EmptyState text="你还没有发布过笔记" hint="点击「＋ 发布笔记」写下第一篇吧" />
          ) : (
            <View style={styles.panel}>
              {posts.map((item) => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.line,
                  }}
                >
                  <Pressable onPress={() => router.push(`/posts/${item.id}`)}>
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: radius.md,
                        overflow: 'hidden',
                        backgroundColor: '#f1f1f3',
                      }}
                    >
                      <Avatar uri={item.cover} size={56} style={{ borderRadius: radius.md, borderWidth: 0 }} />
                    </View>
                  </Pressable>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Pressable onPress={() => router.push(`/posts/${item.id}`)}>
                      <Text
                        numberOfLines={2}
                        style={{ fontSize: fontSize.body, fontWeight: weights.bold, color: colors.text1 }}
                      >
                        {item.title}
                      </Text>
                    </Pressable>
                    <Text style={{ fontSize: fontSize.tiny, color: colors.text3, marginTop: 6 }}>
                      ❤️ {item.likes} · 👀 {item.views ?? '-'}
                    </Text>
                  </View>
                  <View style={{ gap: 6 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => router.push(`/publish?id=${item.id}`)}
                    >
                      编辑
                    </Button>
                    <Button variant="danger" size="sm" onPress={() => remove(item)}>
                      删除
                    </Button>
                  </View>
                </View>
              ))}
            </View>
          )}

          <SectionTitle>我的收藏（{favorites.length}）</SectionTitle>
          {favorites.length === 0 ? (
            <EmptyState text="还没有收藏任何内容" hint="在宠物档案或笔记详情页点 ☆ 即可收藏" />
          ) : (
            <MasonryList items={favorites} />
          )}
        </ScrollView>
      )}
    </View>
  )
}