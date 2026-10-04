import { buildImageUrl, cardRatio } from './format.js'

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

export { FALLBACK_COVER }