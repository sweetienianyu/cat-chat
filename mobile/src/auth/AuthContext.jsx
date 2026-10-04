import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/endpoints.js'
import { hydrateToken, setToken } from '../lib/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const token = await hydrateToken()
      if (!token) {
        if (!cancelled) setReady(true)
        return
      }
      try {
        const me = await api.me()
        if (!cancelled) setUser(me)
      } catch {
        setToken('')
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      async login(payload) {
        const data = await api.login(payload)
        setToken(data.token)
        setUser(data.user)
        return data.user
      },
      async register(payload) {
        const data = await api.register(payload)
        setToken(data.token)
        setUser(data.user)
        return data.user
      },
      logout() {
        setToken('')
        setUser(null)
      },
    }),
    [user, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}