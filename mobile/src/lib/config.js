import Constants from 'expo-constants'
import { Platform } from 'react-native'

const API_PORT = 8000

/** 从 Expo 开发服务器的 hostUri 推导出运行主机，例如 "192.168.1.5:8081" -> "192.168.1.5" */
function devHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    ''
  return String(hostUri).split(':')[0] || ''
}

function resolveBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL
  if (fromEnv) return fromEnv.replace(/\/+$/, '')

  const host = devHost()
  if (host) return `http://${host}:${API_PORT}/api`

  return Platform.select({
    android: `http://10.0.2.2:${API_PORT}/api`,
    default: `http://localhost:${API_PORT}/api`,
  })
}

export const API_BASE = resolveBaseUrl()