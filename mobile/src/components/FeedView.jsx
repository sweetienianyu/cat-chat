import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { api } from '../api/endpoints.js'
import { useAuth } from '../auth/AuthContext.jsx'
import useFeed from '../hooks/useFeed.js'
import { styles } from '../theme/commonStyles.js'
import { colors, fontSize, radius, weights } from '../theme/tokens.js'
import AppHeader from './AppHeader.jsx'
import Button from './Button.jsx'
import Chip from './Chip.jsx'
import EmptyState from './EmptyState.jsx'
import MasonryList, { MasonrySkeleton } from './MasonryList.jsx'

const SPECIES = ['全部', '猫', '狗', '兔', '仓鼠', '鸟']
const HEADINGS = { discover: '为你推荐', pets: '宠物档案', notes: '养宠笔记' }

export default function FeedView({ tab }) {
  const router = useRouter()
  const { user } = useAuth()

  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [species, setSpecies] = useState('全部')
  const [sort, setSort] = useState('latest')
  const [liked, setLiked] = useState({ pet: new Set(), post: new Set() })

  const { items, setItems, total, loading, error, setError, loadMore, refresh, canLoadMore } =
    useFeed({ tab, keyword, species, sort })

  useEffect(() => {
    if (!user) {
      setLiked({ pet: new Set(), post: new Set() })
      return
    }
    Promise.all([api.myLikes('pet'), api.myLikes('post')])
      .then(([petRes, postRes]) =>
        setLiked({ pet: new Set(petRes.ids), post: new Set(postRes.ids) }),
      )
      .catch(() => {})
  }, [user])

  const toggleLike = async (item) => {
    if (!user) {
      router.push('/login')
      return
    }
    const type = item.type
    try {
      const res = await api.toggleLike(type, item.id)
      setLiked((prev) => {
        const next = new Set(prev[type])
        if (res.liked) next.add(item.id)
        else next.delete(item.id)
        return { ...prev, [type]: next }
      })
      setItems((prev) =>
        prev.map((row) =>
          row.type === type && row.id === item.id ? { ...row, likes: res.likes } : row,
        ),
      )
    } catch (err) {
      setError(err.message)
    }
  }

  const heading = keyword ? `“${keyword}” 的搜索结果` : HEADINGS[tab]

  return (
    <View style={styles.screen}>
      <AppHeader
        search={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={(value) => setKeyword(String(value || '').trim())}
      />

      <ScrollView
        contentContainerStyle={styles.contentPad}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading && items.length > 0} onRefresh={refresh} />}
      >
        {tab === 'discover' ? (
          <LinearGradient
            colors={['#fff0f2', '#fff7f0', '#f4f7ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              marginTop: 16,
              marginBottom: 22,
              borderRadius: radius.lg,
              padding: 20,
            }}
          >
            <Text style={{ fontSize: fontSize.h1, fontWeight: weights.bold, color: colors.text1 }}>
              发现你的心动毛孩子 🐾
            </Text>
            <Text style={{ marginTop: 8, color: colors.text2, fontSize: 14, lineHeight: 22 }}>
              浏览真实宠物档案与养宠笔记，登录后即可发布属于你的毛孩子日常。
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Button variant="ghost" onPress={() => router.push('/pets')}>
                看宠物档案
              </Button>
              <Button variant="primary" onPress={() => router.push(user ? '/publish' : '/login')}>
                {user ? '发布笔记' : '登录后发布'}
              </Button>
            </View>
          </LinearGradient>
        ) : null}

        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: fontSize.h2, fontWeight: weights.bold, color: colors.text1 }}>
            {heading}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <Text style={{ color: colors.text3, fontSize: fontSize.small }}>共 {total} 条内容</Text>
            {keyword ? (
              <Pressable onPress={() => { setKeyword(''); setSearchInput('') }}>
                <Text style={{ color: colors.brand, fontSize: fontSize.small }}>{' · 清除搜索'}</Text>
              </Pressable>
            ) : null}
          </View>

          {tab === 'pets' ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              {SPECIES.map((name) => (
                <Chip
                  key={name}
                  label={name}
                  active={species === name}
                  onPress={() => setSpecies(name)}
                />
              ))}
              <View style={{ width: 1, height: 20, backgroundColor: colors.line, alignSelf: 'center' }} />
              <Chip label="最新" active={sort === 'latest'} onPress={() => setSort('latest')} />
              <Chip label="最热" active={sort === 'hot'} onPress={() => setSort('hot')} />
            </View>
          ) : null}
        </View>

        {error ? <Text style={styles.formError}>{error}</Text> : null}

        {loading && items.length === 0 ? (
          <MasonrySkeleton count={10} />
        ) : items.length === 0 ? (
          <EmptyState text="没有找到相关内容" hint="换个关键词，或去宠物档案逛逛" />
        ) : (
          <>
            <MasonryList items={items} likedMap={liked} onLike={toggleLike} />
            <View style={{ alignItems: 'center', marginTop: 22 }}>
              {canLoadMore ? (
                <Button variant="ghost" size="lg" loading={loading} onPress={loadMore}>
                  {loading ? '加载中…' : '加载更多'}
                </Button>
              ) : (
                <Text style={{ color: colors.text3, fontSize: fontSize.small }}>已经到底啦 ~</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}