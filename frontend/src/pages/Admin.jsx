import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import ImageField from '../components/ImageField.jsx'
import { EmptyState } from '../components/WaterfallCard.jsx'
import { parseTags } from '../utils.js'

const EMPTY_FORM = {
  name: '',
  species: '猫',
  breed: '',
  gender: '未知',
  age: '',
  city: '',
  description: '',
  tags: '',
  images: [],
}

const SPECIES = ['猫', '狗', '兔', '仓鼠', '鸟', '其他']
const GENDERS = ['公', '母', '未知']

export default function Admin() {
  const { user, ready } = useAuth()
  const [stats, setStats] = useState(null)
  const [pets, setPets] = useState([])
  const [keyword, setKeyword] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async (kw = '') => {
    try {
      const [statRes, petRes] = await Promise.all([
        api.adminStats(),
        api.pets({ size: 50, keyword: kw || undefined }),
      ])
      setStats(statRes)
      setPets(petRes.items)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    if (user?.is_admin) load()
  }, [user, load])

  const change = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const startCreate = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
    setError('')
  }

  const startEdit = async (pet) => {
    setError('')
    const detail = await api.pet(pet.id).catch(() => null)
    if (!detail) {
      setError('读取宠物详情失败')
      return
    }
    setForm({
      name: detail.name,
      species: detail.species,
      breed: detail.breed,
      gender: detail.gender,
      age: detail.age,
      city: detail.city,
      description: detail.description,
      tags: (detail.tags || []).join(' '),
      images: detail.images.map((image) => image.url),
    })
    setEditingId(pet.id)
    setShowForm(true)
  }

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const payload = {
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim(),
      gender: form.gender,
      age: form.age.trim(),
      city: form.city.trim(),
      description: form.description,
      tags: parseTags(form.tags),
      images: form.images,
      cover_image: form.images[0] || '',
    }
    try {
      if (editingId) await api.updatePet(editingId, payload)
      else await api.createPet(payload)
      setNotice(editingId ? '宠物档案已更新' : '宠物档案已创建')
      setShowForm(false)
      setForm(EMPTY_FORM)
      setEditingId(null)
      load(keyword)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (pet) => {
    if (!window.confirm(`确认删除「${pet.name}」的档案吗？相关图片会一起删除。`)) return
    try {
      await api.deletePet(pet.id)
      setNotice('已删除')
      load(keyword)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!ready) return <div className="skeleton" style={{ height: 240 }} />

  if (!user?.is_admin) {
    return (
      <div className="auth-wrap">
        <div className="form-panel" style={{ textAlign: 'center' }}>
          <span className="empty-emoji">🛡️</span>
          <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>需要管理员权限</h2>
          <p style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 18 }}>
            使用管理员账号 admin / admin123456 登录后可管理宠物档案
          </p>
          <Link className="btn btn-primary btn-lg" to="/login">
            切换账号
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <span>注册用户</span>
          <strong>{stats?.users ?? '-'}</strong>
        </div>
        <div className="stat-card">
          <span>宠物档案</span>
          <strong>{stats?.pets ?? '-'}</strong>
        </div>
        <div className="stat-card">
          <span>社区笔记</span>
          <strong>{stats?.posts ?? '-'}</strong>
        </div>
        <div className="stat-card">
          <span>累计点赞</span>
          <strong>{stats?.likes ?? '-'}</strong>
        </div>
      </div>

      <div className="toolbar">
        <h2 style={{ margin: 0, fontSize: 20 }}>宠物档案管理</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="input"
            style={{ width: 220 }}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索名字 / 品种"
            onKeyDown={(event) => {
              if (event.key === 'Enter') load(keyword)
            }}
          />
          <button className="btn btn-ghost" onClick={() => load(keyword)}>
            搜索
          </button>
          <button className="btn btn-primary" onClick={startCreate}>
            ＋ 新增宠物
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {notice && (
        <div className="tips" style={{ background: '#f0f9f0', color: '#2f7d3a' }}>
          {notice}
        </div>
      )}

      {showForm && (
        <div className="form-panel" style={{ marginBottom: 22 }}>
          <h3 style={{ margin: '0 0 18px', fontSize: 18 }}>
            {editingId ? '编辑宠物档案' : '新增宠物档案'}
          </h3>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div className="field">
                <label>名字</label>
                <input className="input" value={form.name} onChange={change('name')} required />
              </div>
              <div className="field">
                <label>种类</label>
                <select className="select" value={form.species} onChange={change('species')}>
                  {SPECIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>品种</label>
                <input className="input" value={form.breed} onChange={change('breed')} />
              </div>
              <div className="field">
                <label>性别</label>
                <select className="select" value={form.gender} onChange={change('gender')}>
                  {GENDERS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>年龄</label>
                <input className="input" value={form.age} onChange={change('age')} placeholder="如 1岁3个月" />
              </div>
              <div className="field">
                <label>城市</label>
                <input className="input" value={form.city} onChange={change('city')} />
              </div>
            </div>

            <div className="field">
              <label>标签</label>
              <input
                className="input"
                value={form.tags}
                onChange={change('tags')}
                placeholder="空格或逗号分隔，如：黏人精 干饭王"
              />
            </div>

            <div className="field">
              <label>介绍</label>
              <textarea className="textarea" value={form.description} onChange={change('description')} />
            </div>

            <ImageField
              images={form.images}
              onChange={(images) => setForm((prev) => ({ ...prev, images }))}
              label="宠物图片（第一张作为封面）"
            />

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn btn-primary btn-lg" disabled={busy}>
                {busy ? '保存中…' : '保存'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-lg"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {pets.length === 0 ? (
        <EmptyState text="还没有宠物档案" hint="点击「新增宠物」创建第一条" />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th style={{ width: 70 }}>封面</th>
                <th>名字</th>
                <th style={{ width: 90 }}>种类</th>
                <th style={{ width: 130 }}>品种</th>
                <th style={{ width: 110 }}>城市</th>
                <th style={{ width: 90 }}>点赞</th>
                <th style={{ width: 170 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id}>
                  <td>
                    <img className="row-thumb" src={pet.cover_image} alt={pet.name} />
                  </td>
                  <td>
                    <Link to={`/pets/${pet.id}`} style={{ fontWeight: 600 }}>
                      {pet.name}
                    </Link>
                  </td>
                  <td>{pet.species}</td>
                  <td>{pet.breed || '-'}</td>
                  <td>{pet.city || '-'}</td>
                  <td>❤️ {pet.likes}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(pet)}>
                        编辑
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(pet)}>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
