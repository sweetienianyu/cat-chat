import { Link } from 'react-router-dom'
import { avatarFallback, compactNumber } from '../utils.js'

export default function WaterfallCard({ item, liked, onLike }) {
  const to = item.type === 'pet' ? `/pets/${item.id}` : `/posts/${item.id}`

  return (
    <div className="masonry-item">
      <Link className="card" to={to}>
        <div className="card-cover" style={{ aspectRatio: `1 / ${item.ratio}` }}>
          <img src={item.cover} alt={item.title} loading="lazy" />
          <span className="card-tag">{item.type === 'pet' ? '宠物档案' : '养宠笔记'}</span>
        </div>
        <div className="card-body">
          <h3 className="card-title">{item.title}</h3>
          {item.sub && <div className="card-sub">{item.sub}</div>}
          {item.chips?.length > 0 && (
            <div className="pet-meta">
              {item.chips.slice(0, 3).map((chip) => (
                <span className="mini-chip" key={chip}>
                  {chip}
                </span>
              ))}
            </div>
          )}
          <div className="card-foot">
            <div className="card-author">
              <img
                className="avatar"
                width={22}
                height={22}
                src={item.authorAvatar || avatarFallback(item.authorName)}
                alt={item.authorName}
              />
              <span>{item.authorName}</span>
            </div>
            <button
              className={`like-btn ${liked ? 'liked' : ''}`}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onLike?.(item)
              }}
            >
              {liked ? '❤️' : '🤍'} {compactNumber(item.likes)}
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}

export function MasonrySkeleton({ count = 8 }) {
  const ratios = [0.85, 1.15, 0.78, 1.3, 0.95, 1.05, 0.8, 1.2]
  return (
    <div className="masonry">
      {Array.from({ length: count }).map((_, index) => (
        <div className="masonry-item" key={index}>
          <div className="skeleton" style={{ height: 220 * ratios[index % ratios.length] }} />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ text = '这里还什么都没有', hint }) {
  return (
    <div className="empty">
      <span className="empty-emoji">🐾</span>
      <div>{text}</div>
      {hint && <div style={{ marginTop: 6, fontSize: 13 }}>{hint}</div>}
    </div>
  )
}
