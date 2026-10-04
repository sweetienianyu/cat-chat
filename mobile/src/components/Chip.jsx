import { Pressable, Text } from 'react-native'
import { styles } from '../theme/commonStyles.js'

export default function Chip({ label, active = false, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipOn,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  )
}