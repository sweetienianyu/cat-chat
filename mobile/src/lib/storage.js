import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'pet_token'

let cachedToken = null
let hydrated = false

/** 同步读取缓存中的 token，供 request() 直接使用 */
export function getToken() {
  return cachedToken || ''
}

/** 写入 token：同步更新内存缓存，异步落盘 */
export function setToken(token) {
  cachedToken = token || null
  if (token) {
    SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {})
  } else {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {})
  }
}

/** 启动时调用一次，把磁盘中的 token 载入内存 */
export async function hydrateToken() {
  if (hydrated) return getToken()
  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY)
  } catch {
    cachedToken = null
  }
  hydrated = true
  return getToken()
}