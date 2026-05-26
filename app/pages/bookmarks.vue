<script setup lang="ts">
import bookmarks from '~/data/bookmarks.json'

const { locale, t } = useI18n()

useHead(() => ({
  title: t('nav.bookmarks'),
  meta: [
    {
      name: 'description',
      content: t('bookmarks.description'),
    },
  ],
}))

const { data: taxonomies } = await useAsyncData('bookmarks-taxonomies-' + locale.value, async () => {
  const docs = await queryCollection('content').all()

  return buildContentTaxonomies(docs)
})

const bookmarkCategories = computed(() => taxonomies.value?.categories ?? [])
const bookmarkTags = computed(() => taxonomies.value?.tags ?? [])
const activeBookmarkCategory = ref('全部')
const bookmarkCategoryIcons: Record<string, string> = {
  字体: 'lucide:type',
  图片: 'lucide:image',
  音频: 'lucide:audio-lines',
  设计灵感: 'lucide:sparkles',
  图标: 'lucide:apple',
  插画: 'lucide:palette',
  前端: 'lucide:code-2',
  背景视频: 'lucide:video',
  论文: 'lucide:book-open-text',
}
const bookmarkIcon = (category: string, icon?: string) => icon ?? bookmarkCategoryIcons[category] ?? 'lucide:bookmark'
const bookmarkFaviconUrl = (url: string) => {
  const hostname = new URL(url).hostname

  return `/img/bookmarks/favicons/${hostname}.ico`
}
const failedBookmarkImages = ref(new Set<string>())
const bookmarkImageUrl = (bookmark: typeof bookmarks[number]) => {
  if (bookmark.image === false || failedBookmarkImages.value.has(bookmark.title)) {
    return undefined
  }

  return bookmark.image ?? bookmarkFaviconUrl(bookmark.url)
}
const markBookmarkImageFailed = (title: string) => {
  failedBookmarkImages.value = new Set([...failedBookmarkImages.value, title])
}
const bookmarkCategoryTabs = computed(() => {
  return ['全部', ...Array.from(new Set(bookmarks.map(bookmark => bookmark.category)))]
})
const visibleBookmarks = computed(() => {
  if (activeBookmarkCategory.value === '全部') return bookmarks

  return bookmarks.filter(bookmark => bookmark.category === activeBookmarkCategory.value)
})
</script>

<template>
  <div class="mx-auto grid w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
    <aside class="hidden flex-col gap-6 self-start md:flex lg:sticky lg:top-24">
      <HomeProfileCard compact />
      <HomeTaxonomyCard :categories="bookmarkCategories" :tags="bookmarkTags" />
    </aside>

    <section>
      <header class="bookmark-intro-card">
        <p class="bookmark-intro-eyebrow">{{ t('nav.bookmarks') }}</p>
        <h1 class="bookmarks-title">
          也许会有用的网站
        </h1>
      </header>

      <nav class="bookmark-category-nav" aria-label="收藏分类">
        <button
          v-for="category in bookmarkCategoryTabs"
          :key="category"
          class="bookmark-category-tab"
          :class="{ 'bookmark-category-tab-active': activeBookmarkCategory === category }"
          type="button"
          :aria-pressed="activeBookmarkCategory === category"
          @click="activeBookmarkCategory = category"
        >
          <span>{{ category }}</span>
        </button>
      </nav>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <a
          v-for="bookmark in visibleBookmarks"
          :key="bookmark.title"
          class="bookmark-card"
          :href="bookmark.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="bookmark-media" aria-hidden="true">
            <img
              v-if="bookmarkImageUrl(bookmark)"
              class="bookmark-image"
              :src="bookmarkImageUrl(bookmark)"
              alt=""
              loading="lazy"
              @error="markBookmarkImageFailed(bookmark.title)"
            />
            <UIcon :name="bookmarkIcon(bookmark.category, bookmark.icon)" class="bookmark-icon bookmark-icon-fallback" />
          </span>
          <span class="min-w-0">
            <span class="bookmark-name">
              <span class="truncate">{{ bookmark.title }}</span>
              <UIcon name="lucide:arrow-up-right" class="bookmark-arrow" />
            </span>
            <span class="bookmark-description">{{ bookmark.description }}</span>
            <span class="bookmark-category">{{ bookmark.category }}</span>
          </span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import url("https://fontsapi.zeoseven.com/629/main/result.css");

.bookmark-intro-card {
  margin-bottom: 1.5rem;
  border-radius: 1.25rem;
  background: var(--color-surface);
  padding: 1.25rem;
}

.bookmark-intro-eyebrow {
  margin-bottom: 0.75rem;
  display: inline-flex;
  color: var(--color-accent);
  font-weight: 800;
}

.bookmarks-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-main);
  font-family: "MaokenYingBiKaiShuJ", cursive;
  font-size: clamp(1.75rem, 3.5vw, 3rem);
  font-weight: normal;
  line-height: 1.12;
}

.bookmarks-title::before {
  display: inline-block;
  width: 0.25rem;
  height: 1.45rem;
  flex: none;
  border-radius: 999px;
  background: var(--color-accent);
  content: '';
}

@media (min-width: 768px) {
  .bookmark-intro-card {
    padding: 1.75rem;
  }
}

.bookmark-category-nav {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  margin-bottom: 1.5rem;
  border-radius: 1rem;
  background: var(--color-surface);
  padding: 0.65rem;
  scrollbar-width: thin;
}

.bookmark-category-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex: none;
  border-radius: 0.8rem;
  padding: 0.55rem 0.8rem;
  color: var(--color-text-muted);
  font-weight: 800;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease;
}

.bookmark-category-tab:hover {
  background: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
  color: var(--color-text-main);
  opacity: 1;
}

.bookmark-category-tab-active,
.bookmark-category-tab-active:hover {
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
  color: var(--color-accent);
  opacity: 1;
}

.bookmark-card {
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr);
  align-items: center;
  gap: 1rem;
  border-radius: 1rem;
  background: var(--color-surface);
  padding: 1rem;
  color: var(--color-text-main);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.bookmark-card:hover {
  box-shadow: 0 0.85rem 1.6rem color-mix(in srgb, var(--color-accent) 14%, transparent);
  opacity: 1;
  transform: translateY(-2px);
}

.bookmark-media {
  position: relative;
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  overflow: hidden;
  border-radius: 0.85rem;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
}

.bookmark-image {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: var(--color-surface);
}

.bookmark-icon {
  width: 1.35rem;
  height: 1.35rem;
}

.bookmark-icon-fallback {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
}

.bookmark-name {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  font-size: 1.05rem;
  font-weight: 800;
}

.bookmark-arrow {
  width: 0.95em;
  height: 0.95em;
  flex: none;
  color: var(--color-accent);
  opacity: 0;
  transform: translate(-0.2rem, 0.2rem);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.bookmark-card:hover .bookmark-arrow {
  opacity: 1;
  transform: translate(0, 0);
}

.bookmark-description {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 0.3rem;
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.bookmark-category {
  display: inline-flex;
  width: fit-content;
  margin-top: 0.65rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  padding: 0.2rem 0.55rem;
  color: var(--color-accent);
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.2;
}
</style>
