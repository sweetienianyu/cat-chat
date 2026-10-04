import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import WaterfallCard, { EmptyState, MasonrySkeleton } from '../components/WaterfallCard.jsx'
import { avatarFallback, toPetCard, toPostCard } from '../utils.js'

export default function Mine() {
  const { user, logout, ready } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    Promise.all([api.myPosts(), api.myFavoriteItems()])
      .then(([postRes, favRes]) => {
        setPosts(postRes.items.map(toPostCard))
        setFavorites(
          favRes.items.map((item) => (item.kind === 'pet' ? toPetCard(item) : toPostCard(item))),
        )
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  const remove = async (item) => {
    if (!window.confirm(`确认删除《${item.title}》吗？`)) return
    try {
      await api.deletePost(item.id)
      setPosts((prev) => prev.filter((row) => row.id !== item.id))
    } catch (err) {
      setError(err.message)
    }
  }

  if (!ready || loading) return <MasonrySkeleton count={4} />

  if (!user) {
    return (
      <div className="auth-wrap">
        <div className="form-panel" style={{ textAlign: 'center' }}>
          <span className="empty-emoji">🐾</span>
          <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>还没有登录</h2>
          <p style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 18 }}>
            登录后可以管理自己发布的笔记
          </p>
          <Link className="btn btn-primary btn-lg" to="/login">
            去登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <img
          className="avatar"
          width={72}
          height={72}
          src={user.avatar || avatarFallback(user.nickname || user.username)}
          alt={user.nickname}
        />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 22 }}>
            {user.nickname || user.username}
            {user.is_admin && (
              <span className="tag" style={{ marginLeft: 10, background: '#fff0f2', color: '#ff2442' }}>
                管理员
              </span>
            )}
          </h1>
          <div style={{ color: '#9a9a9a', fontSize: 13 }}>
            @{user.username} · {user.bio || '这位铲屎官很低调'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link className="btn btn-primary" to="/publish">
            ＋ 发布笔记
          </Link>
          {user.is_admin && (
            <Link className="btn btn-ghost" to="/admin">
              管理后台
            </Link>
          )}
          <button
            className="btn btn-ghost"
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            退出登录
          </button>
        </div>
      </div>

      <h2 className="section-title">我的笔记（{posts.length}）</h2>

      {error && <div className="form-error">{error}</div>}

      {posts.length === 0 ? (
        <EmptyState text="你还没有发布过笔记" hint="点击右上角「发布笔记」写下第一篇吧" />
      ) : (
        <>
          <div className="table-wrap" style={{ marginBottom: 26 }}>
            <table className="data">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>封面</th>
                  <th>标题</th>
                  <th style={{ width: 90 }}>点赞</th>
                  <th style={{ width: 110 }}>浏览</th>
                  <th style={{ width: 170 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img className="row-thumb" src={item.cover} alt={item.title} />
                    </td>
                    <td>
                      <Link to={`/posts/${item.id}`} style={{ fontWeight: 600 }}>
                        {item.title}
                      </Link>
                    </td>
                    <td>❤️ {item.likes}</td>
                    <td>👀 {item.views ?? '-'}</td>
                    <td>
                      <div className="row-actions">
                        <Link className="btn btn-ghost btn-sm" to={`/publish?id=${item.id}`}>
                          编辑
                        </Link>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(item)}>
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="section-title">卡片预览</h2>
          <div className="masonry">
            {posts.map((item) => (
              <WaterfallCard key={item.id} item={item} liked={false} />
            ))}
          </div>
        </>
      )}

      <h2 className="section-title">我的收藏（{favorites.length}）</h2>
      {favorites.length === 0 ? (
        <EmptyState text="还没有收藏任何内容" hint="在宠物档案或笔记详情页点 ☆ 即可收藏" />
      ) : (
        <div className="masonry">
          {favorites.map((item) => (
            <WaterfallCard key={`${item.type}-${item.id}`} item={item} liked={false} />
          ))}
        </div>
      )}
    </div>
  )
}
