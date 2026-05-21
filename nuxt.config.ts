// https://nuxt.com/docs/api/configuration/nuxt-config
import { getContentStats } from './app/utils/contentStats'

export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxt/ui', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  ui: {
    fonts: false,
  },
  runtimeConfig: {
    public: {
      umamiScriptUrl: process.env.NUXT_PUBLIC_UMAMI_SCRIPT_URL || '',
      umamiWebsiteId: process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID || '',
    },
  },
  content: {
    build: {
      markdown: {
        toc: {
          depth: 3,
          searchDepth: 4,
        },
      },
    },
  },
  mdc: {
    components: {
      map: {
        collapse: 'ProseCollapse',
        details: 'ProseDetails',
        expand: 'ProseExpand',
      },
    },
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
  },
  i18n: {
    defaultLocale: 'zh',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'zh', name: '简体中文', language: 'zh-CN', file: 'zh.ts' },
      { code: 'zh-TW', name: '繁體中文', language: 'zh-TW', file: 'zh-TW.ts' },
      { code: 'en', name: 'English', language: 'en-US', file: 'en.ts' },
      { code: 'ja', name: '日本語', language: 'ja-JP', file: 'ja.ts' },
    ],
  },
  hooks: {
    'content:file:afterParse'(ctx) {
      const stats = getContentStats(ctx.content.body)

      ctx.content.wordCount = stats.wordCount
      ctx.content.readingMinutes = stats.readingMinutes
    },
  },
  compatibilityDate: '2024-04-03',
})
