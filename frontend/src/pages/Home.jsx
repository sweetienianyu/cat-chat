import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import WaterfallCard, { EmptyState, MasonrySkeleton } from '../components/WaterfallCard.jsx'
import { toPetCard, toPostCard } from '../utils.js'

const SPECIES = ['全部', '猫', '狗', '兔', '仓鼠', '鸟']

export default function Home() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const tab = params.get('tab') || 'discover'
  const keyword = params.get('kw') || ''

  const [species, setSpecies] = useState('全部')
  const [sort, setSort] = useState('latest')
  const [page, setPage] = useState(1)
  const [discoverSize, setDiscoverSize] = useState({ pets: 16, posts: 12 })
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState({ pet: new Set(), post: new Set() })

  const reqKey = useMemo(
    () => `${tab}|${keyword}|${species}|${sort}`,
    [tab, keyword, species, sort],
  )
  const latest = useRef('')

  useEffect(() => {
    setPage(1)
    setDiscoverSize({ pets: 16, posts: 12 })
    setItems([])
  }, [reqKey])

  useEffect(() => {
    const signature = `${reqKey}|${page}`
    latest.current = signature
    let cancelled = false
    setLoading(true)
    setError('')

    const run = async () => {
      try {
        if (tab === 'discover') {
          const [petRes, postRes] = await Promise.all([
            api.pets({ size: discoverSize.pets, sort: 'hot' }),
            api.posts({ size: discoverSize.posts }),
          ])
          if (cancelled || latest.current !== signature) return
          const merged = [
            ...petRes.items.map(toPetCard),
            ...postRes.items.map(toPostCard),
          ].sort((a, b) => b.time - a.time)
          setItems(merged)
          setTotal(petRes.total + postRes.total)
        } else if (tab === 'pets') {
          const res = await api.pets({
            page,
            size: 16,
            sort,
            species: species === '全部' ? undefined : species,
            keyword: keyword || undefined,
          })
          if (cancelled || latest.current !== signature) return
          const cards = res.items.map(toPetCard)
          setItems((prev) => (page === 1 ? cards : [...prev, ...cards]))
          setTotal(res.total)
        } else {
          const res = await api.posts({ page, size: 16, keyword: keyword || undefined })
          if (cancelled || latest.current !== signature) return
          const cards = res.items.map(toPostCard)
          setItems((prev) => (page === 1 ? cards : [...prev, ...cards]))
          setTotal(res.total)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled && latest.current === signature) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [reqKey, page, sort, species, keyword, tab, discoverSize.pets, discoverSize.posts])

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
      navigate('/login')
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

  const resetFilters = (patch) => {
    setItems([])
    setPage(1)
    Object.entries(patch).forEach(([key, value]) => {
      if (key === 'species') setSpecies(value)
      if (key === 'sort') setSort(value)
    })
  }

  const canLoadMore = items.length < total

  const heading =
    tab === 'discover' ? '为你推荐' : tab === 'pets' ? '宠物档案' : '养宠笔记'

  return (
    <div>
      {tab === 'discover' && (
        <section
          style={{
            marginBottom: 22,
            borderRadius: 18,
            padding: '24px 26px',
            background: 'linear-gradient(120deg, #fff0f2 0%, #fff7f0 60%, #f4f7ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: 26 }}>发现你的心动毛孩子 🐾</h1>
            <p style={{ margin: 0, color: '#4f4f4f', fontSize: 14, lineHeight: 1.7 }}>
              浏览真实宠物档案与养宠笔记，登录后即可发布属于你的毛孩子日常。
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/?tab=pets')}
            >
              看宠物档案
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(user ? '/publish' : '/login')}
            >
              {user ? '发布笔记' : '登录后发布'}
            </button>
          </div>
        </section>
      )}

      <div className="feed-head">
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>
            {keyword ? `“${keyword}” 的搜索结果` : heading}
          </h2>
          <div style={{ color: '#9a9a9a', fontSize: 13, marginTop: 6 }}>
            共 {total} 条内容
            {keyword && (
              <>
                {' · '}
                <Link to={`/?tab=${tab}`} style={{ color: '#ff2442' }}>
                  清除搜索
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="filter-row">
          {tab === 'pets' &&
            SPECIES.map((name) => (
              <button
                key={name}
                className={`chip ${species === name ? 'active' : ''}`}
                onClick={() => resetFilters({ species: name })}
              >
                {name}
              </button>
            ))}
          {tab === 'pets' && (
            <>
              <span className="divider-dot" />
              <button
                className={`chip ${sort === 'latest' ? 'active' : ''}`}
                onClick={() => resetFilters({ sort: 'latest' })}
              >
                最新
              </button>
              <button
                className={`chip ${sort === 'hot' ? 'active' : ''}`}
                onClick={() => resetFilters({ sort: 'hot' })}
              >
                最热
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading && items.length === 0 ? (
        <MasonrySkeleton count={10} />
      ) : items.length === 0 ? (
        <EmptyState text="没有找到相关内容" hint="换个关键词，或去宠物档案逛逛" />
      ) : (
        <>
          <div className="masonry">
            {items.map((item) => (
              <WaterfallCard
                key={`${item.type}-${item.id}`}
                item={item}
                liked={liked[item.type].has(item.id)}
                onLike={toggleLike}
              />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 22 }}>
            {canLoadMore ? (
              <button
                className="btn btn-ghost btn-lg"
                disabled={loading}
                onClick={() =>
                  tab === 'discover'
                    ? setDiscoverSize((prev) => ({ pets: prev.pets + 16, posts: prev.posts + 12 }))
                    : setPage((prev) => prev + 1)
                }
              >
                {loading ? '加载中…' : '加载更多'}
              </button>
            ) : (
              <span style={{ color: '#9a9a9a', fontSize: 13 }}>已经到底啦 ~</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
