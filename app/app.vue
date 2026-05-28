<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()
const runtimeConfig = useRuntimeConfig()
const siteHeader = ref<{ closeMenus: () => void } | null>(null)
const isInitialLoading = ref(true)
const isRouteLoading = ref(false)
const isAnalyticsEnabled = computed(() => runtimeConfig.public.analyticsEnabled !== false && runtimeConfig.public.analyticsEnabled !== 'false')
const isAppLoading = computed(() => isInitialLoading.value || isRouteLoading.value)

provide('isInitialLoading', readonly(isInitialLoading))

const languageCodeMap: Record<string, string> = {
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  en: 'en-US',
  ja: 'ja-JP',
}

const pageKey = computed(() => route.path)
const isBarePage = computed(() => route.path.endsWith('/xiaohongshu'))
const criticalImageSources = [
  '/img/background.jpg',
  '/img/bg_herolineone.jpg',
  '/img/bg_herolinetwo.jpg',
]

const preloadImage = (src: string) => new Promise<void>((resolve) => {
  const image = new Image()

  image.onload = () => resolve()
  image.onerror = () => resolve()
  image.src = src
})

useHead(() => ({
  title: 'Leisuer',
  titleTemplate: title => title && title !== 'Leisuer' ? `${title} | Leisuer` : 'Leisuer',
  htmlAttrs: {
    class: 'vertical-scrollbar',
    lang: languageCodeMap[locale.value] ?? locale.value,
  },
  meta: [
    {
      name: 'description',
      content: 'Leisuer 的个人主页与博客。',
    },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' },
    {
      rel: 'stylesheet',
      href: 'https://fontsapi.zeoseven.com/3/main/result.css?v=20260522',
      referrerpolicy: 'no-referrer',
    },
  ],
  script: isAnalyticsEnabled.value && runtimeConfig.public.umamiScriptUrl && runtimeConfig.public.umamiWebsiteId
    ? [
        {
          key: 'umami-analytics',
          src: runtimeConfig.public.umamiScriptUrl,
          defer: true,
          'data-website-id': runtimeConfig.public.umamiWebsiteId,
          'data-do-not-track': 'true',
          'data-exclude-search': 'true',
          'data-exclude-hash': 'true',
        },
      ]
    : [],
}))

watch(
  () => route.fullPath,
  async () => {
    siteHeader.value?.closeMenus()
    await nextTick()

    if (route.hash === '#about') {
      return
    }

    if (route.hash) {
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  },
)

if (import.meta.client) {
  const nuxtApp = useNuxtApp()

  nuxtApp.hook('page:start', () => {
    isRouteLoading.value = true
  })

  nuxtApp.hook('page:finish', () => {
    isRouteLoading.value = false
  })

  nuxtApp.hook('app:error', () => {
    isRouteLoading.value = false
  })
}

onMounted(async () => {
  const finishLoading = async () => {
    await Promise.all(criticalImageSources.map(src => preloadImage(src)))
    isInitialLoading.value = false
  }

  if (document.readyState === 'complete') {
    void finishLoading()
    return
  }

  window.addEventListener('load', () => {
    void finishLoading()
  }, { once: true })
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtPage v-if="isBarePage" :key="pageKey" />

  <template v-else>
    <div class="app-loading" :class="{ 'app-loading-hidden': !isAppLoading }" aria-hidden="true">
      <div class="app-loading-panel">
        <div class="app-loading-ring"></div>
        <div class="app-loading-text">Loading</div>
      </div>
    </div>
    <SiteHeader ref="siteHeader" />
    <main class="relative isolate flex min-h-screen flex-1 flex-col overflow-x-clip pt-16">
      <SiteBackground />
      <SiteClickFireworks />
      <div class="flex-1">
        <NuxtPage :key="pageKey" />
      </div>
      <SiteFooter />
    </main>
  </template>
</template>

<style scoped>
.app-loading {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: var(--color-bg);
  transition:
    opacity 0.35s ease,
    visibility 0.35s ease;
}

.app-loading-hidden {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

.app-loading-panel {
  display: grid;
  place-items: center;
  gap: 1rem;
  color: var(--color-text-main);
}

.app-loading-ring {
  width: 3.5rem;
  height: 3.5rem;
  border: 0.28rem solid color-mix(in srgb, var(--color-accent) 14%, transparent);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: app-loading-spin 0.9s linear infinite;
}

.app-loading-text {
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0;
}

@keyframes app-loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
