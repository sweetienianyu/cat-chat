import { useEffect, useRef, useState } from 'react'
import { compactNumber } from '../utils.js'

function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true">
      <path
        d="M12 2.6l2.9 6.03 6.6.7-4.9 4.44 1.36 6.5L12 17.2l-5.96 3.07 1.36-6.5-4.9-4.44 6.6-.7L12 2.6z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true">
      <path
        d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.7 8.7 0 0 1-3.9-.9L3 21l1.9-5.6A8.3 8.3 0 0 1 4 11.5 8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ActionBar({
  liked,
  likes = 0,
  favorited,
  favorites = 0,
  comments = 0,
  onLike,
  onFavorite,
  onComment,
  extra,
  likeBusy = false,
  favoriteBusy = false,
}) {
  const [toast, setToast] = useState('')
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const showToast = (text) => {
    setToast(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(''), 1600)
  }

  const handleFavorite = async () => {
    const next = await onFavorite?.()
    if (typeof next === 'boolean') showToast(next ? '已收藏' : '已取消收藏')
  }

  return (
    <div className="action-bar">
      <button
        type="button"
        className={`action-item ${liked ? 'on' : ''}`}
        disabled={likeBusy}
        onClick={() => onLike?.()}
      >
        <HeartIcon filled={liked} />
        <span>{compactNumber(likes)}</span>
      </button>
      <button
        type="button"
        className={`action-item action-fav ${favorited ? 'on' : ''}`}
        disabled={favoriteBusy}
        onClick={handleFavorite}
      >
        <StarIcon filled={favorited} />
        <span>{compactNumber(favorites)}</span>
      </button>
      <button type="button" className="action-item" onClick={() => onComment?.()}>
        <CommentIcon />
        <span>{compactNumber(comments)}</span>
      </button>
      {extra && <div className="action-bar-extra">{extra}</div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
