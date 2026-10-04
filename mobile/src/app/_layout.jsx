import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from '../auth/AuthContext.jsx'
import { colors } from '../theme/tokens.js'

function Splash() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 46 }}>🐾</Text>
      <Text style={{ marginTop: 12, fontSize: 18, fontWeight: '800', color: colors.text1 }}>
        宠物星球
      </Text>
      <Text style={{ marginTop: 6, fontSize: 13, color: colors.text3 }}>正在唤醒毛孩子们…</Text>
    </View>
  )
}

function RootNavigator() {
  const { ready } = useAuth()

  if (!ready) return <Splash />

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  )
}