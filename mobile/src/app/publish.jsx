import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { api } from '../api/endpoints.js'
import { useAuth } from '../auth/AuthContext.jsx'
import Button from '../components/Button.jsx'
import ImageField from '../components/ImageField.jsx'
import Select from '../components/Select.jsx'
import Skeleton from '../components/Skeleton.jsx'
import StackHeader from '../components/StackHeader.jsx'
import { styles } from '../theme/commonStyles.js'
import { colors, fontSize, weights } from '../theme/tokens.js'
import { parseTags } from '../utils/format.js'

export default function Publish() {
  const { user, ready } = useAuth()
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const editId = id ? String(id) : ''

  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
    pet_id: '',
    images: [],
  })
  const [pets, setPets] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(Boolean(editId))

  useEffect(() => {
    if (!user) return
    api
      .pets({ size: 50 })
      .then((res) => setPets(res.items))
      .catch(() => {})
  }, [user])

  useEffect(() => {
    if (!editId) return
    api
      .post(editId)
      .then((data) =>
        setForm({
          title: data.title,
          content: data.content,
          tags: (data.tags || []).join(' '),
          pet_id: data.pet_id ? String(data.pet_id) : '',
          images: data.images || [],
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [editId])

  const setField = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))

  const petOptions = useMemo(
    () => [
      { label: '不关联', value: '' },
      ...pets.map((pet) => ({
        label: `${pet.name} · ${pet.breed || pet.species}`,
        value: String(pet.id),
      })),
    ],
    [pets],
  )

  const submit = async () => {
    if (busy) return
    if (!form.title.trim()) {
      setError('请填写标题')
      return
    }
    setBusy(true)
    setError('')
    const payload = {
      title: form.title.trim(),
      content: form.content,
      tags: parseTags(form.tags),
      pet_id: form.pet_id ? Number(form.pet_id) : null,
      images: form.images,
      cover_image: form.images[0] || '',
    }
    try {
      const post = editId
        ? await api.updatePost(editId, payload)
        : await api.createPost(payload)
      router.push(`/posts/${post.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (ready && !user) {
    return (
      <View style={styles.screen}>
        <StackHeader title="发布养宠笔记" />
        <View style={[styles.panel, { margin: 14, alignItems: 'center' }]}>
          <Text style={styles.emptyEmoji}>🔒</Text>
          <Text style={{ marginBottom: 8, fontSize: 20, fontWeight: weights.bold, color: colors.text1 }}>
            登录后才能发布笔记
          </Text>
          <Text style={{ color: colors.text3, fontSize: 13, marginBottom: 18 }}>
            使用演示账号 demo / demo123456 也可以体验发布
          </Text>
          <Button variant="primary" size="lg" onPress={() => router.replace('/login')}>
            去登录
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <StackHeader title={editId ? '编辑笔记' : '发布养宠笔记'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.contentPad} keyboardShouldPersistTaps="handled">
          <View style={[styles.panel, { marginTop: 14 }]}>
            <Text style={{ fontSize: 22, fontWeight: weights.bold, color: colors.text1 }}>
              {editId ? '编辑笔记' : '发布养宠笔记'}
            </Text>
            <Text style={{ marginTop: 6, marginBottom: 20, color: colors.text3, fontSize: fontSize.small }}>
              分享你的养宠经验、日常碎片或者避坑指南，让更多铲屎官看到。
            </Text>

            {error ? <Text style={styles.formError}>{error}</Text> : null}

            {loading ? (
              <Skeleton height={260} />
            ) : (
              <>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>标题</Text>
                  <TextInput
                    style={styles.input}
                    value={form.title}
                    onChangeText={setField('title')}
                    placeholder="一句话说清楚这篇笔记讲什么"
                    placeholderTextColor={colors.text3}
                    maxLength={120}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>正文</Text>
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    value={form.content}
                    onChangeText={setField('content')}
                    placeholder={'可以分点写，例如：\n1. 先说结论\n2. 再说原因\n3. 最后给建议'}
                    placeholderTextColor={colors.text3}
                    multiline
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>话题标签</Text>
                  <TextInput
                    style={styles.input}
                    value={form.tags}
                    onChangeText={setField('tags')}
                    placeholder="用空格或逗号分隔，例如：养猫经验 避坑指南"
                    placeholderTextColor={colors.text3}
                  />
                  <Text style={styles.formHint}>最多展示 5 个标签效果最好</Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>关联宠物档案（可选）</Text>
                  <Select
                    value={form.pet_id}
                    options={petOptions}
                    placeholder="不关联"
                    onChange={setField('pet_id')}
                  />
                </View>

                <ImageField
                  images={form.images}
                  onChange={(images) => setForm((prev) => ({ ...prev, images }))}
                  label="笔记配图（第一张会作为封面）"
                />

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
                  <Button variant="primary" size="lg" loading={busy} onPress={submit}>
                    {busy ? '提交中…' : editId ? '保存修改' : '发布笔记'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                  >
                    取消
                  </Button>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}