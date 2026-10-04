import { Image } from 'expo-image'
import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { styles } from '../theme/commonStyles.js'
import { colors, radius, spacing, weights } from '../theme/tokens.js'
import { buildImageUrl } from '../utils/format.js'
import Button from './Button.jsx'
import Select from './Select.jsx'

const SIZES = [
  { value: 'portrait_4_3', label: '竖图 3:4' },
  { value: 'square', label: '方图 1:1' },
  { value: 'landscape_4_3', label: '横图 4:3' },
  { value: 'landscape_16_9', label: '横图 16:9' },
]

export default function ImageField({ images, onChange, label = '配图' }) {
  const [url, setUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('portrait_4_3')

  const addUrl = () => {
    const value = url.trim()
    if (!value) return
    onChange([...images, value])
    setUrl('')
  }

  const generate = () => {
    const value = prompt.trim()
    if (!value) return
    onChange([...images, buildImageUrl(value, size)])
    setPrompt('')
  }

  const remove = (index) => onChange(images.filter((_, i) => i !== index))

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={url}
          onChangeText={setUrl}
          placeholder="粘贴图片地址"
          placeholderTextColor={colors.text3}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={addUrl}
          returnKeyType="done"
        />
        <Button variant="ghost" onPress={addUrl}>
          添加
        </Button>
      </View>

      <View
        style={{
          marginTop: spacing.md,
          backgroundColor: '#fafafb',
          borderRadius: radius.md,
          padding: 14,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: weights.bold, color: colors.text1, marginBottom: spacing.sm }}>
          ✨ 没有图？用一句话生成配图
        </Text>
        <TextInput
          style={styles.input}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="例如：一只橘猫在窗台晒太阳，温暖午后光线"
          placeholderTextColor={colors.text3}
          multiline
        />
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, alignItems: 'center' }}>
          <Select value={size} options={SIZES} onChange={setSize} style={{ flex: 1 }} />
          <Button variant="primary" onPress={generate}>
            生成配图
          </Button>
        </View>
        <Text style={styles.formHint}>生成的图片会作为图片地址直接保存到数据库，无需上传文件。</Text>
      </View>

      {images.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
          {images.map((item, index) => (
            <View
              key={`${item}-${index}`}
              style={{ width: '31%', aspectRatio: 1, borderRadius: radius.md, overflow: 'hidden' }}
            >
              <Image
                source={{ uri: item }}
                style={{ width: '100%', height: '100%', backgroundColor: '#f1f1f3' }}
                contentFit="cover"
                transition={120}
              />
              <Pressable
                onPress={() => remove(index)}
                hitSlop={6}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: colors.white, fontSize: 14, lineHeight: 16 }}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}