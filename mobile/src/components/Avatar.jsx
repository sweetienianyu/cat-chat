import { Image } from 'expo-image'
import { avatarFallback } from '../utils/mappers.js'

const FALLBACK_BG = '#eeeeee'

export default function Avatar({ uri, name, size = 36, style }) {
  const source = uri || avatarFallback(name || '?')
  return (
    <Image
      source={{ uri: source }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: FALLBACK_BG,
          borderWidth: 2,
          borderColor: '#ffffff',
        },
        style,
      ]}
      contentFit="cover"
      transition={150}
    />
  )
}