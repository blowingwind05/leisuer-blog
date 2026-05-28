import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

const FALLBACK_PAGEVIEWS = 233
const SHARE_TOKEN_CACHE_TTL = 30 * 60 * 1000

type UmamiStatsValue = number | { value?: number }

type UmamiStatsResponse = {
  pageviews?: UmamiStatsValue
}

type UmamiShareTokenResponse = {
  token?: string
}

let shareJwtCache: { key: string, token: string, baseUrl: string, expiresAt: number } | null = null

const isRuntimeFlagEnabled = (value: unknown) => value === true || value === 'true'

const readStatsValue = (value: UmamiStatsValue | undefined) => {
  if (typeof value === 'number') return value
  if (value && typeof value.value === 'number') return value.value

  return null
}

const getUmamiBaseUrl = (baseUrl: string, scriptUrl: string) => {
  if (baseUrl) return baseUrl.replace(/\/$/, '')

  try {
    return new URL(scriptUrl).origin
  }
  catch {
    return ''
  }
}

const getUmamiApiBaseUrls = (baseUrl: string, scriptUrl: string) => {
  const resolvedBaseUrl = getUmamiBaseUrl(baseUrl, scriptUrl)

  if (!resolvedBaseUrl) return []

  const urls = [resolvedBaseUrl]

  try {
    const url = new URL(resolvedBaseUrl)

    if (url.hostname === 'cloud.umami.is' && !url.pathname.startsWith('/analytics/')) {
      urls.push(`${url.origin}/analytics/us`)
    }
  }
  catch {
    // Keep the original value; fetch will fail softly later if it is invalid.
  }

  return Array.from(new Set(urls.map(url => url.replace(/\/$/, ''))))
}

const normalizeUmamiPath = (path: string) => {
  const normalizedPath = path.split(/[?#]/)[0] || '/'
  const pathWithoutTrailingSlash = normalizedPath.length > 1 ? normalizedPath.replace(/\/$/, '') : normalizedPath

  return pathWithoutTrailingSlash.replace(/^\/(?:en|zh-TW|ja)(?=\/|$)/, '') || '/'
}

const getLocalizedPathVariants = (path: string) => {
  const canonicalPath = normalizeUmamiPath(path)

  if (canonicalPath === '/') {
    return ['/', '/en', '/zh-TW', '/ja']
  }

  return [
    canonicalPath,
    `/en${canonicalPath}`,
    `/zh-TW${canonicalPath}`,
    `/ja${canonicalPath}`,
  ]
}

const resolveShareJwt = async (baseUrls: string[], shareToken: string) => {
  const key = `${baseUrls.join('|')}:${shareToken}`

  if (shareJwtCache?.key === key && shareJwtCache.expiresAt > Date.now()) {
    return shareJwtCache
  }

  for (const baseUrl of baseUrls) {
    const data = await $fetch<UmamiShareTokenResponse>(
      `${baseUrl}/api/share/${encodeURIComponent(shareToken)}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    ).catch(() => null)

    if (!data?.token) continue

    shareJwtCache = {
      key,
      baseUrl,
      token: data.token,
      expiresAt: Date.now() + SHARE_TOKEN_CACHE_TTL,
    }

    return shareJwtCache
  }

  return null
}

const fetchSharedPathPageviews = async (baseUrl: string, websiteId: string, jwt: string, path: string) => {
  const stats = await $fetch<UmamiStatsResponse>(
    `${baseUrl}/api/websites/${encodeURIComponent(websiteId)}/stats`,
    {
      query: {
        startAt: 0,
        endAt: Date.now(),
        path,
      },
      headers: {
        Accept: 'application/json',
        'x-umami-share-token': jwt,
        'x-umami-share-context': '1',
      },
    },
  )

  return readStatsValue(stats.pageviews)
}

const fetchSharedPageviews = async (path: string) => {
  const config = useRuntimeConfig()
  const baseUrls = getUmamiApiBaseUrls(config.public.umamiBaseUrl, config.public.umamiScriptUrl)
  const shareToken = config.public.umamiShareToken
  const websiteId = config.public.umamiWebsiteId

  if (!isRuntimeFlagEnabled(config.public.pageviewsEnabled) || !baseUrls.length || !shareToken || !websiteId || !path) return null

  const jwt = await resolveShareJwt(baseUrls, shareToken)

  if (!jwt) return null

  const views = await Promise.all(
    getLocalizedPathVariants(path).map(async (pathVariant) => {
      return await fetchSharedPathPageviews(jwt.baseUrl, websiteId, jwt.token, pathVariant).catch(() => null)
    }),
  )

  const resolvedViews = views.filter((count): count is number => typeof count === 'number')

  if (!resolvedViews.length) return null

  return resolvedViews.reduce((total, count) => total + count, 0)
}

export const useUmamiPageviews = (path: MaybeRefOrGetter<string | undefined | null>) => {
  const normalizedPath = computed(() => {
    const value = toValue(path)

    if (!value) return ''

    return normalizeUmamiPath(value)
  })

  const config = useRuntimeConfig()
  const hasShareToken = computed(() => {
    return Boolean(
      isRuntimeFlagEnabled(config.public.pageviewsEnabled)
      && getUmamiApiBaseUrls(config.public.umamiBaseUrl, config.public.umamiScriptUrl).length
      && config.public.umamiShareToken
      && config.public.umamiWebsiteId,
    )
  })

  const { data: sharedData } = useAsyncData(
    () => `umami-shared-pageviews-${normalizedPath.value}`,
    async () => {
      if (!hasShareToken.value || !normalizedPath.value) return null

      return await fetchSharedPageviews(normalizedPath.value)
    },
    {
      server: false,
      watch: [normalizedPath, hasShareToken],
    },
  )

  return computed(() => {
    if (typeof sharedData.value === 'number') return sharedData.value

    return FALLBACK_PAGEVIEWS
  })
}

export const useUmamiPageviewsEnabled = () => {
  const config = useRuntimeConfig()

  return computed(() => isRuntimeFlagEnabled(config.public.pageviewsEnabled))
}
