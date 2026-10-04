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

function pad(n) {
  return String(n).padStart(2, '0')
}

export function timeAgo(value) {
  if (!value) return ''
  const date = new Date(value)
  const time = date.getTime()
  if (Number.isNaN(time)) return ''
  const diff = Math.max(0, Date.now() - time)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`
  // 避免依赖 Hermes 的 Intl/ICU，手动格式化为 zh-CN 的 YYYY/M/D
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
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

export { pad }