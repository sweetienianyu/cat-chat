import { Text, View } from 'react-native'
import { styles } from '../theme/commonStyles.js'

export default function EmptyState({ emoji = '🐾', text = '这里还什么都没有', hint }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      {hint ? <Text style={styles.emptyHint}>{hint}</Text> : null}
    </View>
  )
}