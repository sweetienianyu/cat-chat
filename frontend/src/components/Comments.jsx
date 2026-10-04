import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import { avatarFallback, timeAgo } from '../utils.js'

function CommentItem({ comment, isReply, onReply, onDelete, canDelete }) {
  return (
    <div className={`comment ${isReply ? 'comment-child' : ''}`}>
      <img
        className="avatar comment-avatar"
        width={isReply ? 30 : 36}
        height={isReply ? 30 : 36}
        src={comment.author?.avatar || avatarFallback(comment.author?.nickname || '匿名')}
        alt=""
      />
      <div className="comment-body">
        <div className="comment-meta">
          <strong>{comment.author?.nickname || '匿名铲屎官'}</strong>
          <span>{timeAgo(comment.created_at)}</span>
        </div>
        <div className="comment-content">{comment.content}</div>
        <div className="comment-actions">
          <button type="button" onClick={() => onReply(comment)}>
            回复
          </button>
          {canDelete(comment) && (
            <button type="button" className="danger" onClick={() => onDelete(comment)}>
              删除
            </button>
          )}
        </div>
        {comment.replies?.length > 0 && (
          <div className="comment-replies">
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
          </div>
        )}
      </div>
    </div>
  )
}

export default function Comments({ targetType, targetId, onCountChange }) {
  const { user } = useAuth()
  const navigate = useNavigate()

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
      navigate('/login')
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

  const remove = async (comment) => {
    if (!window.confirm('确认删除这条评论吗？')) return
    try {
      await api.deleteComment(comment.id)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const canDelete = (comment) => !!user && (user.is_admin || user.id === comment.user_id)

  return (
    <div className="comments">
      <h2 className="section-title" style={{ marginTop: 0 }}>
        共 {data.total} 条评论
      </h2>

      {error && <div className="form-error">{error}</div>}

      <div className="comment-composer">
        <img
          className="avatar comment-avatar"
          width={36}
          height={36}
          src={user?.avatar || avatarFallback(user?.nickname || '游客')}
          alt=""
        />
        <div className="comment-composer-main">
          {replyTo && (
            <div className="comment-reply-hint">
              正在回复 @{replyTo.author?.nickname || '匿名'}
              <button type="button" onClick={() => setReplyTo(null)}>
                取消
              </button>
            </div>
          )}
          {user ? (
            <div className="comment-input-row">
              <input
                className="comment-input"
                placeholder={replyTo ? '回复点什么…' : '说点什么…'}
                value={content}
                maxLength={500}
                onChange={(event) => setContent(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.nativeEvent.isComposing) submit()
                }}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={submitting || !content.trim()}
                onClick={submit}
              >
                {submitting ? '发送中' : '发送'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="comment-input comment-login-btn"
              onClick={() => navigate('/login')}
            >
              登录后参与评论
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="comment-empty">评论加载中…</div>
      ) : data.items.length === 0 ? (
        <div className="comment-empty">还没有评论，快来抢沙发～</div>
      ) : (
        <div className="comment-list">
          {data.items.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={setReplyTo}
              onDelete={remove}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
