import { View } from 'react-native'
import { styles } from '../theme/commonStyles.js'

export default function Skeleton({ width = '100%', height = 220, style }) {
  return <View style={[styles.skeleton, { width, height }, style]} />
}