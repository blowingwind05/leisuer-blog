<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()

definePageMeta({
  pageTransition: {
    name: 'article-forward',
    mode: 'out-in',
  },
})

const { data: page } = await useAsyncData('page-' + route.path, async () => {
  let pageData = await queryCollection('content').path(route.path).first()

  // If localized markdown doesn't exist, fallback to the default language markdown
  if (!pageData && locale.value !== 'zh') {
    const prefix = `/${locale.value}`
    if (route.path.startsWith(prefix)) {
      const fallbackPath = route.path.slice(prefix.length) || '/'
      pageData = await queryCollection('content').path(fallbackPath).first()
    }
  }

  return pageData
})

const { data: taxonomies } = await useAsyncData('article-taxonomies-' + locale.value, async () => {
  const docs = await queryCollection('content').all()

  return buildContentTaxonomies(docs)
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

type TocLink = {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

const flattenTocLinks = (links: TocLink[] = []): TocLink[] => {
  return links.flatMap(link => [
    link,
    ...flattenTocLinks(link.children ?? []),
  ])
}

const tocLinks = computed(() => {
  return flattenTocLinks(page.value?.body?.toc?.links ?? [])
    .filter(link => link.depth > 1)
})

const activeHeadingId = ref('')
const activeSidebarPanel = ref<'toc' | 'site'>('toc')
const postCategories = computed(() => taxonomies.value?.categories ?? [])
const postTags = computed(() => taxonomies.value?.tags ?? [])
const publishedAt = computed(() => formatContentDate(page.value?.created, locale.value))
const editedAt = computed(() => formatContentDate(page.value?.updated, locale.value))
const categoryPath = computed(() => getCategoryPath(page.value?.category))

useHead(() => ({
  title: page.value?.title ?? 'Leisuer',
  meta: [
    {
      name: 'description',
      content: page.value?.description ?? page.value?.title ?? 'Leisuer 的个人主页与博客。',
    },
  ],
}))

const scrollActiveTocLinkIntoView = (newId: string) => {
  if (!newId || !import.meta.client || activeSidebarPanel.value !== 'toc') return

  nextTick(() => {
    const linkElement = document.querySelector(`.toc-link[href="#${newId}"]`)
    const tocCard = document.querySelector('.toc-card-scroll')

    if (linkElement instanceof HTMLElement && tocCard instanceof HTMLElement) {
      const linkTop = linkElement.offsetTop
      const linkCenter = linkTop + linkElement.offsetHeight / 2
      tocCard.scrollTo({
        top: linkCenter - tocCard.clientHeight / 2,
        behavior: 'smooth',
      })
    }
  })
}

const updateActiveHeading = () => {
  if (!tocLinks.value.length) {
    activeHeadingId.value = ''
    return
  }

  const headings = tocLinks.value
    .map(link => document.getElementById(link.id))
    .filter((element): element is HTMLElement => Boolean(element))

  const activeHeading = headings
    .filter(heading => heading.getBoundingClientRect().top <= 112)
    .at(-1) ?? headings[0]

  activeHeadingId.value = activeHeading?.id ?? ''
}

watch(activeHeadingId, (newId) => {
  scrollActiveTocLinkIntoView(newId)
})

watch(activeSidebarPanel, (panel) => {
  if (panel === 'toc') {
    scrollActiveTocLinkIntoView(activeHeadingId.value)
  }
})

onMounted(() => {
  updateActiveHeading()
  window.addEventListener('scroll', updateActiveHeading, { passive: true })
  window.addEventListener('resize', updateActiveHeading)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveHeading)
  window.removeEventListener('resize', updateActiveHeading)
})
</script>

<template>
  <div
    class="article-layout mx-auto grid w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-1 gap-6 py-10 lg:pt-8"
    :class="{ 'article-layout-has-sidebar': tocLinks.length }"
  >
    <aside v-if="tocLinks.length" class="article-sidebar hidden self-start lg:sticky lg:top-24 lg:grid">
      <div
        class="article-sidebar-panel"
        :class="`article-sidebar-panel-${activeSidebarPanel}`"
      >
        <div
          class="article-site-panel"
          :class="{ 'article-sidebar-panel-hidden': activeSidebarPanel !== 'site' }"
          :aria-hidden="activeSidebarPanel !== 'site'"
          :inert="activeSidebarPanel !== 'site'"
          :aria-label="t('article.sitePanel')"
        >
          <HomeProfileCard compact />
          <HomeTaxonomyCard :categories="postCategories" :tags="postTags" />
        </div>

        <nav
          class="toc-card rounded-[1.25rem] bg-[var(--color-surface)]"
          :class="{ 'article-sidebar-panel-hidden': activeSidebarPanel !== 'toc' }"
          :aria-hidden="activeSidebarPanel !== 'toc'"
          :inert="activeSidebarPanel !== 'toc'"
          aria-label="Table of contents"
        >
          <h2 class="mx-4 mt-4 mb-2 flex items-center gap-3 text-lg font-bold text-[var(--color-text-main)] before:inline-block before:h-5 before:w-1 before:shrink-0 before:rounded-full before:bg-[var(--color-accent)] before:content-['']">
            {{ t('article.toc') }}
          </h2>
          <div class="toc-card-scroll mx-4 mb-4">
            <ol class="toc-list grid gap-2 pb-2">
              <li
                v-for="link in tocLinks"
                :key="link.id"
                :style="{ paddingLeft: `${Math.max(0, link.depth - 2) * 0.95}rem` }"
              >
                <a
                  class="toc-link block rounded-lg px-2.5 py-2 text-[0.98rem] font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-text-main)] hover:opacity-100"
                  :class="{ 'toc-link-active': activeHeadingId === link.id }"
                  :href="`#${link.id}`"
                >
                  {{ link.text }}
                </a>
              </li>
            </ol>
          </div>
        </nav>
      </div>

      <ArticleSidebarTabs v-model:activeSidebarPanel="activeSidebarPanel" />
    </aside>

    <article class="min-w-0 rounded-[1.25rem] bg-[var(--color-surface)] px-6 py-8 md:px-10 md:py-10">
      <header class="mb-8">
        <p v-if="categoryPath.length" class="article-category mb-3 inline-flex font-bold text-[var(--color-accent)]">
          <ContentCategoryPath :category="page.category" segment-hover />
        </p>
        <h1 class="mb-4 flex items-center gap-4 text-[clamp(1.75rem,3vw,2.8rem)] leading-tight font-bold text-[var(--color-text-main)] before:inline-block before:h-6 before:w-1 before:shrink-0 before:rounded-full before:bg-[var(--color-accent)] before:content-['']">
          {{ page.title }}
        </h1>
        <div class="article-meta grid min-w-0 gap-2 text-[1.05rem] font-bold text-[var(--color-text-muted)]">
          <div class="flex flex-wrap gap-x-4 gap-y-1">
            <span v-if="page.created" class="inline-flex flex-wrap items-baseline gap-x-1.5">
              <UIcon name="lucide:calendar-days" class="size-4.5 translate-y-[0.12em]" />
              <time :datetime="String(page.created)">
                {{ t('article.publishedAt') }} {{ publishedAt }}
              </time>
              <span v-if="page.updated" class="modified-tooltip">
                （{{ t('article.modified') }}）
                <time class="modified-tooltip-content" :datetime="String(page.updated)">
                  {{ t('article.updatedAt') }} {{ editedAt }}
                </time>
              </span>
            </span>
            <span class="inline-flex items-center gap-1.5">
              <UIcon name="lucide:file-text" class="size-4.5" />
              {{ t('article.wordCount', { count: page.wordCount ?? 0 }) }}
            </span>
            <span class="inline-flex items-center gap-1.5">
              <UIcon name="lucide:clock" class="size-4.5" />
              {{ t('article.readingTime', { minutes: page.readingMinutes ?? 1 }) }}
            </span>
            <span class="inline-flex items-center gap-1.5">
              <UIcon name="lucide:eye" class="size-4.5" />
              {{ t('article.viewCount', { count: 414 }) }}
            </span>
          </div>
          <div v-if="page.tags?.length" class="article-meta-tags flex flex-wrap items-center gap-x-2 gap-y-1">
            <template v-for="(tag, index) in page.tags" :key="tag">
              <span v-if="index > 0" class="text-[var(--color-text-muted)]">/</span>
              <span class="article-tag cursor-pointer">{{ tag }}</span>
            </template>
          </div>
        </div>
        <SummaryCard v-if="page.description" :description="page.description" class="mt-5" />
      </header>

      <ContentRenderer
        v-if="page"
        class="markdown-content"
        :value="page"
      />
    </article>
    <ArticleScrollTools />
  </div>
</template>

<style scoped>
.article-layout {
  grid-template-columns: minmax(0, 1fr);
}

@media (min-width: 1024px) {
  .article-layout-has-sidebar {
    grid-template-columns: minmax(12rem, 16rem) minmax(0, 1fr);
  }
}

.article-sidebar {
  --article-sidebar-card-gap: 1.5rem;
  min-width: 0;
  width: 100%;
  max-width: 16rem;
  gap: var(--article-sidebar-card-gap);
  justify-self: start;
  overflow: hidden;
}

.article-sidebar-panel {
  position: relative;
  min-width: 0;
  width: 100%;
  overflow: hidden;
}

.article-site-panel {
  display: flex;
  min-width: 0;
  width: 100%;
  flex-direction: column;
  gap: var(--article-sidebar-card-gap);
  overflow-x: hidden;
  transform: translateX(calc(-100% - var(--article-sidebar-card-gap)));
  transform-origin: center;
  opacity: 0.28;
  transition:
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.42s ease;
  will-change: transform, opacity;
}

.toc-card {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
  overflow: visible;
  transform: translateX(0);
  transform-origin: center;
  opacity: 1;
  transition:
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.42s ease;
  will-change: transform, opacity;
}

.toc-card-scroll {
  --toc-scroll-fade: 1rem;
  min-height: 0;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding-top: 0.2rem;
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 var(--toc-scroll-fade), #000 calc(100% - var(--toc-scroll-fade)), transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 var(--toc-scroll-fade), #000 calc(100% - var(--toc-scroll-fade)), transparent);
  scrollbar-color: var(--color-scrollbar-thumb) transparent;
  scrollbar-width: thin;
}

.article-sidebar-panel-hidden {
  pointer-events: none;
}

.article-sidebar-panel-toc .toc-card {
  transform: translateX(0);
  opacity: 1;
}

.article-sidebar-panel-toc .article-site-panel {
  transform: translateX(calc(-100% - var(--article-sidebar-card-gap)));
  opacity: 0.28;
}

.article-sidebar-panel-site .article-site-panel {
  transform: translateX(0);
  opacity: 1;
}

.article-sidebar-panel-site .toc-card {
  transform: translateX(calc(100% + var(--article-sidebar-card-gap)));
  opacity: 0.28;
}

@media (prefers-reduced-motion: reduce) {
  .article-site-panel,
  .toc-card {
    transition: none;
  }
}

.article-site-panel > :deep(*) {
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

.article-site-panel :deep(.tag-scroll-fade),
.article-site-panel :deep(.category-scroll-fade) {
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}

.toc-card-scroll::-webkit-scrollbar {
  width: 0.25rem;
}

.toc-card-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.toc-card-scroll::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar-thumb);
  border-radius: 999px;
}

.toc-link:hover {
  background: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
}

.toc-link-active,
.toc-link-active:hover {
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
  color: var(--color-accent);
}

.article-category {
  margin-inline-start: -0.38rem;
}

.article-tag {
  position: relative;
  max-width: 100%;
  overflow-wrap: anywhere;
  transition:
    color 0.2s ease,
    opacity 0.2s ease;
}

.article-tag::after {
  position: absolute;
  right: 0;
  bottom: -0.14rem;
  left: 0;
  height: 0.12em;
  border-radius: 999px;
  background-color: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.22s ease;
  content: '';
}

.article-tag:hover {
  color: var(--color-accent);
  opacity: 1;
}

.article-tag:hover::after {
  transform: scaleX(1);
}

.article-meta {
  min-width: 0;
}

.article-meta-tags {
  min-width: 0;
  max-width: 100%;
}
</style>
