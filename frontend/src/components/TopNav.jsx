import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { avatarFallback } from '../utils.js'

export default function TopNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [keyword, setKeyword] = useState(params.get('kw') || '')

  const tab = params.get('tab') || 'discover'
  const isHome = location.pathname === '/'
  const links = [
    { key: 'discover', label: '发现', to: '/' },
    { key: 'pets', label: '宠物档案', to: '/?tab=pets' },
    { key: 'notes', label: '养宠笔记', to: '/?tab=notes' },
  ]

  const submit = (event) => {
    event.preventDefault()
    const kw = keyword.trim()
    navigate(kw ? `/?kw=${encodeURIComponent(kw)}` : '/')
  }

  return (
    <header className="topnav">
      <Link className="brand" to="/">
        <span className="brand-badge">🐾</span>
        宠物星球
      </Link>

      <nav className="nav-links">
        {links.map((link) => (
          <Link
            key={link.key}
            to={link.to}
            className={`nav-link ${isHome && tab === link.key ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
        {user?.is_admin && (
          <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
            管理后台
          </Link>
        )}
      </nav>

      <div className="nav-spacer" />

      <form className="search" onSubmit={submit}>
        <span className="search-icon">🔍</span>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索宠物、品种、养宠笔记"
        />
      </form>

      {user ? (
        <>
          <Link className="btn btn-primary" to="/publish">
            ＋ 发布笔记
          </Link>
          <div className="nav-user">
            <Link className="avatar-btn" to="/mine" title="我的主页">
              <img
                className="avatar"
                width={34}
                height={34}
                src={user.avatar || avatarFallback(user.nickname || user.username)}
                alt={user.nickname}
              />
              <span className="nav-name">{user.nickname || user.username}</span>
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              退出
            </button>
          </div>
        </>
      ) : (
        <Link className="btn btn-primary" to="/login">
          登录 / 注册
        </Link>
      )}
    </header>
  )
}
