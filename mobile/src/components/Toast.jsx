import { useEffect, useRef } from 'react'
import { Animated, Text, View } from 'react-native'
import { radius } from '../theme/tokens.js'

export default function Toast({ message }) {
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: message ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start()
  }, [message, opacity])

  if (!message) return null

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 90,
        alignItems: 'center',
        opacity,
        zIndex: 90,
      }}
    >
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0.78)',
          borderRadius: radius.pill,
          paddingHorizontal: 18,
          paddingVertical: 9,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 13 }}>{message}</Text>
      </View>
    </Animated.View>
  )
}