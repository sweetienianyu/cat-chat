import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/endpoints.js'
import { toPetCard, toPostCard } from '../utils/mappers.js'

const PAGE_SIZE = 16

export default function useFeed({ tab, keyword = '', species = '全部', sort = 'latest' }) {
  const [page, setPage] = useState(1)
  const [discoverSize, setDiscoverSize] = useState({ pets: 16, posts: 12 })
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const reqKey = `${tab}|${keyword}|${species}|${sort}|${refreshKey}`
  const latest = useRef('')

  useEffect(() => {
    setPage(1)
    setDiscoverSize({ pets: 16, posts: 12 })
    setItems([])
  }, [reqKey])

  useEffect(() => {
    const signature = `${reqKey}|${page}`
    latest.current = signature
    let cancelled = false
    setLoading(true)
    setError('')

    const run = async () => {
      try {
        if (tab === 'discover') {
          const [petRes, postRes] = await Promise.all([
            api.pets({ size: discoverSize.pets, sort: 'hot' }),
            api.posts({ size: discoverSize.posts }),
          ])
          if (cancelled || latest.current !== signature) return
          const merged = [...petRes.items.map(toPetCard), ...postRes.items.map(toPostCard)].sort(
            (a, b) => b.time - a.time,
          )
          setItems(merged)
          setTotal(petRes.total + postRes.total)
        } else if (tab === 'pets') {
          const res = await api.pets({
            page,
            size: PAGE_SIZE,
            sort,
            species: species === '全部' ? undefined : species,
            keyword: keyword || undefined,
          })
          if (cancelled || latest.current !== signature) return
          const cards = res.items.map(toPetCard)
          setItems((prev) => (page === 1 ? cards : [...prev, ...cards]))
          setTotal(res.total)
        } else {
          const res = await api.posts({ page, size: PAGE_SIZE, keyword: keyword || undefined })
          if (cancelled || latest.current !== signature) return
          const cards = res.items.map(toPostCard)
          setItems((prev) => (page === 1 ? cards : [...prev, ...cards]))
          setTotal(res.total)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled && latest.current === signature) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [reqKey, page, discoverSize.pets, discoverSize.posts, tab, species, sort, keyword])

  const loadMore = useCallback(() => {
    if (tab === 'discover') {
      setDiscoverSize((prev) => ({ pets: prev.pets + 16, posts: prev.posts + 12 }))
    } else {
      setPage((prev) => prev + 1)
    }
  }, [tab])

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  return {
    items,
    setItems,
    total,
    loading,
    error,
    setError,
    loadMore,
    refresh,
    canLoadMore: items.length < total,
  }
}