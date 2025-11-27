// iOS Bundle ID Finder API 服务，带缓存机制

interface BundleIdResult {
  bundleId: string
  name: string
  category?: string
}

interface CacheEntry {
  data: BundleIdResult[]
  timestamp: number
}

// 内存缓存，key 为搜索关键词，value 为缓存条目
const cache = new Map<string, CacheEntry>()

// 缓存有效期：5 分钟
const CACHE_TTL = 5 * 60 * 1000

/**
 * 从缓存中获取数据
 */
function getFromCache(query: string): BundleIdResult[] | null {
  const entry = cache.get(query)
  if (!entry) {
    return null
  }

  // 检查缓存是否过期
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(query)
    return null
  }

  return entry.data
}

/**
 * 将数据存入缓存
 */
function setCache(query: string, data: BundleIdResult[]): void {
  cache.set(query, {
    data,
    timestamp: Date.now(),
  })
}

/**
 * 搜索 Bundle ID
 * @param query 搜索关键词
 * @returns Promise<BundleIdResult[]>
 */
export async function searchBundleId(query: string): Promise<BundleIdResult[]> {
  if (!query || query.trim().length === 0) {
    return []
  }

  const trimmedQuery = query.trim().toLowerCase()

  // 先检查缓存
  const cached = getFromCache(trimmedQuery)
  if (cached) {
    return cached
  }

  try {
    // 调用 iosbundleidfinder API
    // API 端点：https://iosbundleidfinder.com/api/search
    const response = await fetch(`https://iosbundleidfinder.com/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; ClashRuleEditor/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()

    // 假设 API 返回格式为 { results: BundleIdResult[] } 或直接是数组
    const results: BundleIdResult[] = Array.isArray(data) ? data : data.results || []

    // 存入缓存
    setCache(trimmedQuery, results)

    return results
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error searching bundle ID:', error)
    // 返回空数组而不是抛出错误，避免影响用户体验
    return []
  }
}

/**
 * 清除所有缓存
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * 清除过期的缓存条目
 */
export function clearExpiredCache(): void {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key)
    }
  }
}
