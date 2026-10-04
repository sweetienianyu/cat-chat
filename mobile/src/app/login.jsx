import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useAuth } from '../auth/AuthContext.jsx'
import Button from '../components/Button.jsx'
import StackHeader from '../components/StackHeader.jsx'
import { styles } from '../theme/commonStyles.js'
import { colors, fontSize, radius, weights } from '../theme/tokens.js'

export default function Login() {
  const { login, register } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '', nickname: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const setField = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))

  const submit = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      if (mode === 'login') {
        await login({ username: form.username.trim(), password: form.password })
      } else {
        await register({
          username: form.username.trim(),
          password: form.password,
          nickname: form.nickname.trim(),
        })
      }
      router.replace('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <View style={styles.screen}>
      <StackHeader title={mode === 'login' ? '登录' : '注册'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.contentPad}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.panel, { marginTop: 20 }]}>
            <Text style={{ fontSize: 24, fontWeight: weights.bold, color: colors.text1 }}>
              {mode === 'login' ? '欢迎回到宠物星球' : '加入宠物星球'}
            </Text>
            <Text style={{ marginTop: 6, marginBottom: 20, color: colors.text3, fontSize: 13 }}>
              {mode === 'login' ? '登录后可以点赞、发布笔记' : '注册后即可发布你的毛孩子日常'}
            </Text>

            {mode === 'login' ? (
              <View style={styles.tips}>
                <Text style={styles.tipsText}>
                  演示账号：管理员 admin / admin123456{'\n'}普通用户 demo / demo123456
                </Text>
              </View>
            ) : null}

            {error ? <Text style={styles.formError}>{error}</Text> : null}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>用户名</Text>
              <TextInput
                style={styles.input}
                value={form.username}
                onChangeText={setField('username')}
                placeholder="请输入用户名"
                placeholderTextColor={colors.text3}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {mode === 'register' ? (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>昵称</Text>
                <TextInput
                  style={styles.input}
                  value={form.nickname}
                  onChangeText={setField('nickname')}
                  placeholder="展示在社区里的名字（可选）"
                  placeholderTextColor={colors.text3}
                />
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>密码</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={setField('password')}
                placeholder={mode === 'register' ? '至少 6 位' : '请输入密码'}
                placeholderTextColor={colors.text3}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={submit}
              />
            </View>

            <Button variant="primary" size="lg" loading={busy} onPress={submit} style={{ width: '100%' }}>
              {busy ? '处理中…' : mode === 'login' ? '登录' : '注册并登录'}
            </Button>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.text3 }}>
                {mode === 'login' ? '还没有账号？' : '已经有账号了？'}
              </Text>
              <Pressable
                onPress={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setError('')
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: weights.bold, color: colors.brand }}>
                  {mode === 'login' ? '立即注册' : '去登录'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}