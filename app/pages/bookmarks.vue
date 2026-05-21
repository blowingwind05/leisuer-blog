<script setup lang="ts">
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

const bookmarks = [
  {
    title: 'Nuxt',
    description: 'Nuxt 官方文档和生态入口。',
    url: 'https://nuxt.com',
    icon: 'simple-icons:nuxt',
  },
  {
    title: 'Vue',
    description: 'Vue 官方文档，前端开发常用参考。',
    url: 'https://vuejs.org',
    icon: 'simple-icons:vuedotjs',
  },
  {
    title: 'MDN Web Docs',
    description: 'Web API、CSS、HTML 与 JavaScript 参考。',
    url: 'https://developer.mozilla.org',
    icon: 'simple-icons:mdnwebdocs',
  },
]
</script>

<template>
  <div class="mx-auto grid w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
    <aside class="hidden flex-col gap-6 self-start md:flex lg:sticky lg:top-24">
      <HomeProfileCard compact />
      <HomeTaxonomyCard :categories="bookmarkCategories" :tags="bookmarkTags" />
    </aside>

    <section>
      <header class="mb-6 rounded-[1.25rem] bg-[var(--color-surface)] p-5 md:p-7">
        <p class="mb-3 inline-flex font-bold text-[var(--color-accent)]">{{ t('nav.bookmarks') }}</p>
        <h1 class="bookmarks-title">
          {{ t('bookmarks.title') }}
        </h1>
        <p class="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
          {{ t('bookmarks.description') }}
        </p>
      </header>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <a
          v-for="bookmark in bookmarks"
          :key="bookmark.title"
          class="bookmark-card"
          :href="bookmark.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <UIcon :name="bookmark.icon" class="size-6 shrink-0 text-[var(--color-accent)]" />
          <span class="min-w-0">
            <span class="bookmark-name">
              <span class="truncate">{{ bookmark.title }}</span>
              <UIcon name="lucide:arrow-up-right" class="bookmark-arrow" />
            </span>
            <span class="bookmark-description">{{ bookmark.description }}</span>
          </span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bookmarks-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-main);
  font-size: clamp(1.9rem, 4vw, 3.4rem);
  font-weight: 800;
  line-height: 1.1;
}

.bookmarks-title::before {
  display: inline-block;
  width: 0.25rem;
  height: 1.5rem;
  flex: none;
  border-radius: 999px;
  background: var(--color-accent);
  content: '';
}

.bookmark-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
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
</style>
