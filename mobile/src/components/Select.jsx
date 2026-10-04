import { useState } from 'react'
import { FlatList, Modal, Pressable, Text, View } from 'react-native'
import { styles } from '../theme/commonStyles.js'
import { colors, radius, shadow } from '../theme/tokens.js'

export default function Select({ value, options = [], placeholder = '请选择', onChange, style }) {
  const [open, setOpen] = useState(false)
  const current = options.find((opt) => String(opt.value) === String(value))

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.input, styles.rowBetween, style]}
      >
        <Text
          numberOfLines={1}
          style={{ flex: 1, color: current ? colors.text1 : colors.text3, fontSize: 14 }}
        >
          {current ? current.label : placeholder}
        </Text>
        <Text style={{ color: colors.text3, fontSize: 12 }}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'center',
            paddingHorizontal: 30,
          }}
        >
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: radius.lg,
              maxHeight: 420,
              overflow: 'hidden',
              ...shadow.md,
            }}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => {
                const active = String(item.value) === String(value)
                return (
                  <Pressable
                    onPress={() => {
                      onChange?.(item.value)
                      setOpen(false)
                    }}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.line,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: active ? colors.brand : colors.text1,
                        fontWeight: active ? '600' : '400',
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                )
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  )
}