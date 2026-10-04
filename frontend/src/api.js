const TOKEN_KEY = 'pet_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function toQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.set(key, String(value))
  })
  return search.toString()
}

export async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const detail = data?.detail
    throw new Error(
      typeof detail === 'string' ? detail : detail?.[0]?.msg || `请求失败（${res.status}）`,
    )
  }
  return data
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),

  pets: (query = {}) => request(`/pets?${toQuery(query)}`),
  petFilters: () => request('/pets/filters'),
  pet: (id) => request(`/pets/${id}`),
  createPet: (payload) => request('/pets', { method: 'POST', body: payload }),
  updatePet: (id, payload) => request(`/pets/${id}`, { method: 'PUT', body: payload }),
  deletePet: (id) => request(`/pets/${id}`, { method: 'DELETE' }),

  posts: (query = {}) => request(`/posts?${toQuery(query)}`),
  post: (id) => request(`/posts/${id}`),
  createPost: (payload) => request('/posts', { method: 'POST', body: payload }),
  updatePost: (id, payload) => request(`/posts/${id}`, { method: 'PUT', body: payload }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),

  toggleLike: (target_type, target_id) =>
    request('/likes/toggle', { method: 'POST', body: { target_type, target_id } }),
  myLikes: (target_type) => request(`/likes/mine?target_type=${target_type}`),

  toggleFavorite: (target_type, target_id) =>
    request('/favorites/toggle', { method: 'POST', body: { target_type, target_id } }),
  myFavorites: (target_type) => request(`/favorites/mine?target_type=${target_type}`),
  myFavoriteItems: () => request('/me/favorites'),

  comments: (query = {}) => request(`/comments?${toQuery(query)}`),
  createComment: (payload) => request('/comments', { method: 'POST', body: payload }),
  deleteComment: (id) => request(`/comments/${id}`, { method: 'DELETE' }),

  myPosts: () => request('/me/posts'),
  adminStats: () => request('/admin/stats'),
}
