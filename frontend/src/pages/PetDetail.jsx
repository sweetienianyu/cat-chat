import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import ActionBar from '../components/ActionBar.jsx'
import Comments from '../components/Comments.jsx'
import WaterfallCard, { EmptyState, MasonrySkeleton } from '../components/WaterfallCard.jsx'
import { avatarFallback, compactNumber, timeAgo, toPostCard } from '../utils.js'

export default function PetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
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
      navigate('/login')
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
      navigate('/login')
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
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  if (loading) return <MasonrySkeleton count={4} />
  if (!pet) return <EmptyState text={error || '宠物不存在'} />

  const gallery = pet.images?.length ? pet.images : [{ id: 0, url: pet.cover_image }]

  return (
    <div>
      <div style={{ marginBottom: 14, fontSize: 13, color: '#9a9a9a' }}>
        <Link to="/?tab=pets">← 返回宠物档案</Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="detail">
        <div className="panel">
          <div className="gallery-main">
            <img src={gallery[active]?.url} alt={pet.name} />
          </div>
          {gallery.length > 1 && (
            <div className="thumbs">
              {gallery.map((image, index) => (
                <button
                  key={image.id ?? index}
                  className={`thumb ${index === active ? 'active' : ''}`}
                  onClick={() => setActive(index)}
                >
                  <img src={image.url} alt={`${pet.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h1 className="detail-title">{pet.name}</h1>
          <div className="meta-row">
            <span>👀 {compactNumber(pet.views)} 次浏览</span>
            <span>❤️ {compactNumber(pet.likes)} 喜欢</span>
            <span>🕒 {timeAgo(pet.created_at)}</span>
          </div>

          <div className="info-grid">
            <div className="info-cell">
              <label>种类</label>
              <strong>{pet.species || '未知'}</strong>
            </div>
            <div className="info-cell">
              <label>品种</label>
              <strong>{pet.breed || '未知'}</strong>
            </div>
            <div className="info-cell">
              <label>性别</label>
              <strong>{pet.gender}</strong>
            </div>
            <div className="info-cell">
              <label>年龄</label>
              <strong>{pet.age || '未知'}</strong>
            </div>
            <div className="info-cell">
              <label>所在城市</label>
              <strong>{pet.city || '未知'}</strong>
            </div>
            <div className="info-cell">
              <label>档案编号</label>
              <strong>#{String(pet.id).padStart(4, '0')}</strong>
            </div>
          </div>

          {pet.tags?.length > 0 && (
            <div className="tags">
              {pet.tags.map((tag) => (
                <span className="tag" key={tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <p className="paragraph">{pet.description || '这位小朋友还没有自我介绍～'}</p>

          <div className="action-row">
            <div className="author-line">
              <img
                className="avatar"
                width={38}
                height={38}
                src={pet.owner?.avatar || avatarFallback(pet.owner?.nickname || '官方')}
                alt="主人"
              />
              <div>
                <strong>{pet.owner?.nickname || '宠物星球官方'}</strong>
                <div style={{ fontSize: 12, color: '#9a9a9a' }}>
                  {pet.owner?.bio || '负责维护宠物档案'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
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
      </div>

      <div id="comments" className="panel" style={{ marginTop: 20, scrollMarginTop: 80 }}>
        <Comments targetType="pet" targetId={pet.id} onCountChange={setCommentsCount} />
      </div>

      <h2 className="section-title">相关养宠笔记</h2>
      {posts.length === 0 ? (
        <EmptyState text="还没有和 ta 相关的笔记" hint="登录后可以发布第一篇" />
      ) : (
        <div className="masonry">
          {posts.map((post) => (
            <WaterfallCard
              key={`post-${post.id}`}
              item={post}
              liked={false}
              onLike={async () => {
                if (!user) return navigate('/login')
                const res = await api.toggleLike('post', post.id)
                setPosts((prev) =>
                  prev.map((row) => (row.id === post.id ? { ...row, likes: res.likes } : row)),
                )
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
