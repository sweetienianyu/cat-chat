import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import ImageField from '../components/ImageField.jsx'
import { parseTags } from '../utils.js'

export default function Publish() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editId = params.get('id')

  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
    pet_id: '',
    images: [],
  })
  const [pets, setPets] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(Boolean(editId))

  useEffect(() => {
    if (!user) return
    api
      .pets({ size: 50 })
      .then((res) => setPets(res.items))
      .catch(() => {})
  }, [user])

  useEffect(() => {
    if (!editId) return
    api
      .post(editId)
      .then((data) =>
        setForm({
          title: data.title,
          content: data.content,
          tags: (data.tags || []).join(' '),
          pet_id: data.pet_id ? String(data.pet_id) : '',
          images: data.images || [],
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [editId])

  const change = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const payload = {
      title: form.title.trim(),
      content: form.content,
      tags: parseTags(form.tags),
      pet_id: form.pet_id ? Number(form.pet_id) : null,
      images: form.images,
      cover_image: form.images[0] || '',
    }
    try {
      const post = editId
        ? await api.updatePost(editId, payload)
        : await api.createPost(payload)
      navigate(`/posts/${post.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (ready && !user) {
    return (
      <div className="auth-wrap">
        <div className="form-panel" style={{ textAlign: 'center' }}>
          <span className="empty-emoji">🔒</span>
          <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>登录后才能发布笔记</h2>
          <p style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 18 }}>
            使用演示账号 demo / demo123456 也可以体验发布
          </p>
          <Link className="btn btn-primary btn-lg" to="/login">
            去登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-narrow" style={{ margin: '0 auto' }}>
      <div style={{ marginBottom: 14, fontSize: 13, color: '#9a9a9a' }}>
        <Link to={editId ? `/posts/${editId}` : '/'}>← 返回</Link>
      </div>

      <div className="form-panel">
        <h1 style={{ margin: '0 0 6px', fontSize: 22 }}>{editId ? '编辑笔记' : '发布养宠笔记'}</h1>
        <p style={{ margin: '0 0 20px', color: '#9a9a9a', fontSize: 13 }}>
          分享你的养宠经验、日常碎片或者避坑指南，让更多铲屎官看到。
        </p>

        {error && <div className="form-error">{error}</div>}

        {loading ? (
          <div className="skeleton" style={{ height: 260 }} />
        ) : (
          <form onSubmit={submit}>
            <div className="field">
              <label>标题</label>
              <input
                className="input"
                value={form.title}
                onChange={change('title')}
                placeholder="一句话说清楚这篇笔记讲什么"
                maxLength={120}
                required
              />
            </div>

            <div className="field">
              <label>正文</label>
              <textarea
                className="textarea"
                value={form.content}
                onChange={change('content')}
                placeholder={'可以分点写，例如：\n1. 先说结论\n2. 再说原因\n3. 最后给建议'}
              />
            </div>

            <div className="field">
              <label>话题标签</label>
              <input
                className="input"
                value={form.tags}
                onChange={change('tags')}
                placeholder="用空格或逗号分隔，例如：养猫经验 避坑指南"
              />
              <div className="form-hint">最多展示 5 个标签效果最好</div>
            </div>

            <div className="field">
              <label>关联宠物档案（可选）</label>
              <select className="select" value={form.pet_id} onChange={change('pet_id')}>
                <option value="">不关联</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} · {pet.breed || pet.species}
                  </option>
                ))}
              </select>
            </div>

            <ImageField
              images={form.images}
              onChange={(images) => setForm((prev) => ({ ...prev, images }))}
              label="笔记配图（第一张会作为封面）"
            />

            <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
              <button className="btn btn-primary btn-lg" disabled={busy}>
                {busy ? '提交中…' : editId ? '保存修改' : '发布笔记'}
              </button>
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate(-1)}>
                取消
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
