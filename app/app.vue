<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()
const runtimeConfig = useRuntimeConfig()
const siteHeader = ref<{ closeMenus: () => void } | null>(null)

const languageCodeMap: Record<string, string> = {
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  en: 'en-US',
  ja: 'ja-JP',
}

const pageKey = computed(() => route.path)
const isBarePage = computed(() => route.path.endsWith('/xiaohongshu'))

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
    { rel: 'stylesheet', href: 'https://fontsapi.zeoseven.com/3/main/result.css' },
  ],
  script: runtimeConfig.public.umamiScriptUrl && runtimeConfig.public.umamiWebsiteId
    ? [
        {
          src: runtimeConfig.public.umamiScriptUrl,
          defer: true,
          'data-website-id': runtimeConfig.public.umamiWebsiteId,
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
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtPage v-if="isBarePage" :key="pageKey" />

  <template v-else>
    <SiteHeader ref="siteHeader" />
    <main class="relative isolate flex min-h-screen flex-1 flex-col overflow-x-clip pt-16">
      <SiteBackground />
      <div class="flex-1">
        <NuxtPage :key="pageKey" />
      </div>
      <SiteFooter />
    </main>
  </template>
</template>
