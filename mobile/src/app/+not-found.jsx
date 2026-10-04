import { Text, View } from 'react-native'
import StackHeader from '../components/StackHeader.jsx'
import { styles } from '../theme/commonStyles.js'

export default function NotFound() {
  return (
    <View style={styles.screen}>
      <StackHeader title="未找到" />
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🙈</Text>
        <Text style={styles.emptyText}>页面走丢了</Text>
      </View>
    </View>
  )
}