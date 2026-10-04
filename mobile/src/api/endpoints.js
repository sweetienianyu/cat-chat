import { request, toQuery } from './client.js'

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
}