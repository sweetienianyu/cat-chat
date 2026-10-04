import { ActivityIndicator, Pressable, Text } from 'react-native'
import { styles } from '../theme/commonStyles.js'
import { colors } from '../theme/tokens.js'

const VARIANTS = {
  default: { box: null, text: styles.btnText },
  primary: { box: styles.btnPrimary, text: styles.btnTextPrimary },
  ghost: { box: styles.btnGhost, text: styles.btnTextGhost },
  danger: { box: styles.btnDanger, text: styles.btnTextDanger },
}

const SIZES = {
  sm: { box: styles.btnSm, text: styles.btnTextSm },
  md: { box: null, text: null },
  lg: { box: styles.btnLg, text: styles.btnTextLg },
}

export default function Button({
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  children,
  style,
}) {
  const v = VARIANTS[variant] || VARIANTS.default
  const s = SIZES[size] || SIZES.md
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        v.box,
        s.box,
        isDisabled && styles.btnDisabled,
        pressed && !isDisabled && { opacity: 0.85 },
        style,
      ]}
    >
      {loading && (
        <ActivityIndicator size="small" color={variant === 'primary' ? colors.white : colors.text2} />
      )}
      <Text style={[styles.btnText, v.text, s.text]} numberOfLines={1}>
        {children}
      </Text>
    </Pressable>
  )
}