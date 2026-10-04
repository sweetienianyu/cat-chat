import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Pressable, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../auth/AuthContext.jsx'
import { colors, radius, spacing, weights } from '../theme/tokens.js'
import Avatar from './Avatar.jsx'

export default function AppHeader({
  search = '',
  onSearchChange,
  onSearchSubmit,
  showSearch = true,
}) {
  const router = useRouter()
  const { user } = useAuth()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        backgroundColor: colors.white,
        paddingTop: insets.top + 8,
        paddingHorizontal: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={() => router.replace('/')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}
        >
          <LinearGradient
            colors={['#ff5b70', colors.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16 }}>🐾</Text>
          </LinearGradient>
          <Text style={{ fontSize: 19, fontWeight: '800', color: colors.text1 }}>宠物星球</Text>
        </Pressable>

        {user ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable
              onPress={() => router.push('/publish')}
              style={{
                height: 32,
                paddingHorizontal: 12,
                borderRadius: radius.pill,
                backgroundColor: colors.brand,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: colors.white, fontSize: 13, fontWeight: weights.bold }}>
                ＋ 发布
              </Text>
            </Pressable>
            <Pressable onPress={() => router.push('/mine')}>
              <Avatar uri={user.avatar} name={user.nickname || user.username} size={34} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => router.push('/login')}
            style={{
              height: 32,
              paddingHorizontal: 14,
              borderRadius: radius.pill,
              backgroundColor: colors.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.white, fontSize: 13, fontWeight: weights.bold }}>
              登录 / 注册
            </Text>
          </Pressable>
        )}
      </View>

      {showSearch ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            height: 38,
            paddingHorizontal: 14,
            borderRadius: radius.pill,
            backgroundColor: '#f3f3f5',
            marginTop: 10,
          }}
        >
          <Ionicons name="search" size={15} color={colors.text3} />
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            onSubmitEditing={() => onSearchSubmit?.(search)}
            placeholder="搜索宠物、品种、养宠笔记"
            placeholderTextColor={colors.text3}
            returnKeyType="search"
            style={{ flex: 1, fontSize: 14, color: colors.text1, paddingVertical: 0 }}
          />
        </View>
      ) : null}
    </View>
  )
}