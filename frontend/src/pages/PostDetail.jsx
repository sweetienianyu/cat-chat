import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import ActionBar from '../components/ActionBar.jsx'
import Comments from '../components/Comments.jsx'
import { EmptyState } from '../components/WaterfallCard.jsx'
import { avatarFallback, compactNumber, timeAgo } from '../utils.js'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
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
      navigate('/login')
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
      navigate('/login')
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
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const remove = async () => {
    if (!window.confirm('确认删除这篇笔记吗？')) return
    try {
      await api.deletePost(post.id)
      navigate('/mine')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="skeleton" style={{ height: 380 }} />
  if (!post) return <EmptyState text={error || '笔记不存在'} />

  const canEdit = user && (user.is_admin || user.id === post.author?.id)
  const images = post.images?.length ? post.images : post.cover_image ? [post.cover_image] : []

  return (
    <div className="page-narrow" style={{ margin: '0 auto' }}>
      <div style={{ marginBottom: 14, fontSize: 13, color: '#9a9a9a' }}>
        <Link to="/?tab=notes">← 返回养宠笔记</Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="panel">
        <h1 className="detail-title">{post.title}</h1>

        <div className="action-row" style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>
          <div className="author-line">
            <img
              className="avatar"
              width={38}
              height={38}
              src={post.author?.avatar || avatarFallback(post.author?.nickname || '匿名')}
              alt={post.author?.nickname}
            />
            <div>
              <strong>{post.author?.nickname || '匿名铲屎官'}</strong>
              <div style={{ fontSize: 12, color: '#9a9a9a' }}>
                {timeAgo(post.created_at)} · {compactNumber(post.views)} 次浏览
              </div>
            </div>
          </div>
          {canEdit && (
            <div className="row-actions">
              <Link className="btn btn-ghost btn-sm" to={`/publish?id=${post.id}`}>
                编辑
              </Link>
              <button className="btn btn-danger btn-sm" onClick={remove}>
                删除
              </button>
            </div>
          )}
        </div>

        <p className="paragraph" style={{ marginTop: 20 }}>
          {post.content}
        </p>

        {post.tags?.length > 0 && (
          <div className="tags">
            {post.tags.map((tag) => (
              <span className="tag" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {images.length > 0 && (
          <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
            {images.map((url) => (
              <img
                key={url}
                src={url}
                alt={post.title}
                style={{ width: '100%', borderRadius: 14, display: 'block' }}
              />
            ))}
          </div>
        )}

        {post.pet_id && (
          <div style={{ marginTop: 20 }}>
            <Link className="chip" to={`/pets/${post.pet_id}`}>
              🐾 查看关联的宠物档案
            </Link>
          </div>
        )}

        <div className="action-row" style={{ paddingTop: 0, borderTop: 0, marginTop: 12 }}>
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
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/publish')}>
                我也要发布
              </button>
            }
          />
        </div>
      </div>

      <div id="comments" className="panel" style={{ marginTop: 20, scrollMarginTop: 80 }}>
        <Comments targetType="post" targetId={post.id} onCountChange={setCommentsCount} />
      </div>
    </div>
  )
}
