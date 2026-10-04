import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing } from '../theme/tokens.js'

export default function StackHeader({ title, right, onBack }) {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const goBack = () => {
    if (onBack) return onBack()
    if (router.canGoBack()) router.back()
    else router.replace('/')
  }

  return (
    <View
      style={{
        paddingTop: insets.top + 6,
        paddingBottom: 10,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Pressable
        onPress={goBack}
        hitSlop={10}
        style={{ width: 40, height: 34, alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name="chevron-back" size={24} color={colors.text1} />
      </Pressable>
      <Text
        numberOfLines={1}
        style={{ flex: 1, fontSize: 17, fontWeight: '600', color: colors.text1 }}
      >
        {title}
      </Text>
      <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  )
}