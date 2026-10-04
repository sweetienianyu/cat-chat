const IMG_API = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'

const RATIOS = [0.78, 1, 0.72, 1.12, 0.85, 1.3]

/** 稳定的瀑布流高度：同一内容每次渲染高度一致 */
export function cardRatio(seed) {
  const n = Number(seed) || 0
  return RATIOS[n % RATIOS.length]
}

export function buildImageUrl(prompt, size = 'portrait_4_3') {
  return `${IMG_API}?prompt=${encodeURIComponent(prompt)}&image_size=${size}`
}

export function timeAgo(value) {
  if (!value) return ''
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return ''
  const diff = Math.max(0, Date.now() - time)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`
  return new Date(value).toLocaleDateString('zh-CN')
}

export function compactNumber(value = 0) {
  if (value < 1000) return `${value}`
  if (value < 10000) return `${(value / 1000).toFixed(1)}k`
  return `${(value / 10000).toFixed(1)}w`
}

export function parseTags(input) {
  if (Array.isArray(input)) return input.map((t) => String(t).trim()).filter(Boolean)
  return String(input || '')
    .split(/[,，\s#]+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

export function avatarFallback(name = '?') {
  return buildImageUrl(
    `Flat vector avatar illustration for a pet community user named ${name}, cute, warm colors, minimal`,
    'square',
  )
}

const FALLBACK_COVER = buildImageUrl(
  'A cute paw print pattern with hearts, flat illustration, soft pink background',
  'portrait_4_3',
)

/** 把后端宠物数据转成瀑布流卡片数据 */
export function toPetCard(pet) {
  return {
    type: 'pet',
    id: pet.id,
    cover: pet.cover_image || FALLBACK_COVER,
    title: pet.name,
    sub: [pet.breed, pet.city].filter(Boolean).join(' · '),
    chips: [pet.species, pet.gender, pet.age, ...(pet.tags || [])].filter(Boolean),
    likes: pet.likes,
    authorName: '宠物星球官方',
    authorAvatar: '',
    time: new Date(pet.created_at).getTime(),
    ratio: cardRatio(pet.id),
  }
}

/** 把后端帖子数据转成瀑布流卡片数据 */
export function toPostCard(post) {
  return {
    type: 'post',
    id: post.id,
    cover: post.cover_image || FALLBACK_COVER,
    title: post.title,
    sub: post.content ? post.content.replace(/\s+/g, ' ').slice(0, 40) : '',
    chips: post.tags || [],
    likes: post.likes,
    views: post.views,
    authorName: post.author?.nickname || '匿名铲屎官',
    authorAvatar: post.author?.avatar || '',
    time: new Date(post.created_at).getTime(),
    ratio: cardRatio(post.id + 3),
  }
}
