import { Text, View } from 'react-native'
import { styles } from '../theme/commonStyles.js'

export default function SectionTitle({ children, style }) {
  return (
    <View style={[styles.sectionTitle, style]}>
      <View style={styles.sectionTitleBar} />
      <Text style={styles.sectionTitleText}>{children}</Text>
    </View>
  )
}