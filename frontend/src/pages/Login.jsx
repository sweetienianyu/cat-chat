import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '', nickname: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const change = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'login') {
        await login({ username: form.username.trim(), password: form.password })
      } else {
        await register({
          username: form.username.trim(),
          password: form.password,
          nickname: form.nickname.trim(),
        })
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="form-panel">
        <h1 style={{ margin: '0 0 6px', fontSize: 24 }}>
          {mode === 'login' ? '欢迎回到宠物星球' : '加入宠物星球'}
        </h1>
        <p style={{ margin: '0 0 20px', color: '#9a9a9a', fontSize: 13 }}>
          {mode === 'login' ? '登录后可以点赞、发布笔记' : '注册后即可发布你的毛孩子日常'}
        </p>

        {mode === 'login' && (
          <div className="tips">
            演示账号：管理员 <code>admin / admin123456</code>
            <br />
            普通用户 <code>demo / demo123456</code>
          </div>
        )}

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>用户名</label>
            <input
              className="input"
              value={form.username}
              onChange={change('username')}
              placeholder="请输入用户名"
              autoComplete="username"
              required
            />
          </div>

          {mode === 'register' && (
            <div className="field">
              <label>昵称</label>
              <input
                className="input"
                value={form.nickname}
                onChange={change('nickname')}
                placeholder="展示在社区里的名字（可选）"
              />
            </div>
          )}

          <div className="field">
            <label>密码</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={change('password')}
              placeholder={mode === 'register' ? '至少 6 位' : '请输入密码'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={busy}>
            {busy ? '处理中…' : mode === 'login' ? '登录' : '注册并登录'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? '还没有账号？' : '已经有账号了？'}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
          >
            {mode === 'login' ? '立即注册' : '去登录'}
          </button>
        </div>
      </div>
    </div>
  )
}
