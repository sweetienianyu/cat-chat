import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { api } from '../api/endpoints.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { styles } from '../theme/commonStyles.js'
import { colors, spacing } from '../theme/tokens.js'
import { timeAgo } from '../utils/format.js'
import Avatar from './Avatar.jsx'
import Button from './Button.jsx'
import SectionTitle from './SectionTitle.jsx'

function CommentItem({ comment, isReply, onReply, onDelete, canDelete }) {
  const size = isReply ? 30 : 36

  return (
    <View style={[styles.comment, isReply && styles.commentChild]}>
      <Avatar uri={comment.author?.avatar} name={comment.author?.nickname || '匿名'} size={size} />
      <View style={styles.commentBody}>
        <View style={styles.commentMeta}>
          <Text style={styles.commentAuthor}>{comment.author?.nickname || '匿名铲屎官'}</Text>
          <Text style={styles.commentTime}>{timeAgo(comment.created_at)}</Text>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <View style={styles.commentActions}>
          <Pressable onPress={() => onReply(comment)} hitSlop={6}>
            <Text style={styles.commentAction}>回复</Text>
          </Pressable>
          {canDelete(comment) ? (
            <Pressable onPress={() => onDelete(comment)} hitSlop={6}>
              <Text style={[styles.commentAction, styles.commentActionDanger]}>删除</Text>
            </Pressable>
          ) : null}
        </View>

        {comment.replies?.length > 0 ? (
          <View style={styles.commentReplies}>
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply
                onReply={() => onReply(comment)}
                onDelete={onDelete}
                canDelete={canDelete}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  )
}

export default function Comments({ targetType, targetId, onCountChange }) {
  const { user } = useAuth()
  const router = useRouter()

  const [data, setData] = useState({ total: 0, items: [] })
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api
      .comments({ target_type: targetType, target_id: targetId, size: 50 })
      .then((res) => {
        setData(res)
        onCountChange?.(res.total)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [targetType, targetId, onCountChange])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const submit = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    const text = content.trim()
    if (!text || submitting) return
    setSubmitting(true)
    setError('')
    try {
      await api.createComment({
        target_type: targetType,
        target_id: targetId,
        content: text,
        parent_id: replyTo?.id ?? null,
      })
      setContent('')
      setReplyTo(null)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const remove = (comment) => {
    Alert.alert('删除评论', '确认删除这条评论吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteComment(comment.id)
            load()
          } catch (err) {
            setError(err.message)
          }
        },
      },
    ])
  }

  const canDelete = (comment) => !!user && (user.is_admin || user.id === comment.user_id)

  return (
    <View style={styles.commentList}>
      <SectionTitle style={{ marginTop: 0 }}>共 {data.total} 条评论</SectionTitle>

      {error ? <Text style={styles.formError}>{error}</Text> : null}

      <View style={styles.commentComposer}>
        <Avatar uri={user?.avatar} name={user?.nickname || '游客'} size={36} />
        <View style={styles.commentComposerMain}>
          {replyTo ? (
            <View style={styles.commentReplyHint}>
              <Text style={styles.commentReplyHintText}>
                正在回复 @{replyTo.author?.nickname || '匿名'}
              </Text>
              <Pressable onPress={() => setReplyTo(null)} hitSlop={6}>
                <Text style={styles.commentReplyCancel}>取消</Text>
              </Pressable>
            </View>
          ) : null}

          {user ? (
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder={replyTo ? '回复点什么…' : '说点什么…'}
                placeholderTextColor={colors.text3}
                value={content}
                maxLength={500}
                onChangeText={setContent}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={submit}
              />
              <Button
                variant="primary"
                size="sm"
                disabled={submitting || !content.trim()}
                onPress={submit}
              >
                {submitting ? '发送中' : '发送'}
              </Button>
            </View>
          ) : (
            <Pressable onPress={() => router.push('/login')} style={[styles.commentInput, { justifyContent: 'center' }]}>
              <Text style={{ color: colors.text3, fontSize: 14 }}>登录后参与评论</Text>
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.commentEmpty}>
          <Text style={styles.emptyText}>评论加载中…</Text>
        </View>
      ) : data.items.length === 0 ? (
        <View style={styles.commentEmpty}>
          <Text style={styles.emptyText}>还没有评论，快来抢沙发～</Text>
        </View>
      ) : (
        <View style={{ marginTop: spacing.xs }}>
          {data.items.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={setReplyTo}
              onDelete={remove}
              canDelete={canDelete}
            />
          ))}
        </View>
      )}
    </View>
  )
}