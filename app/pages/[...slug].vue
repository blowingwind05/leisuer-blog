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
const publishedAt = computed(() => formatContentDate(page.value?.created, locale.value))
const editedAt = computed(() => formatContentDate(page.value?.updated, locale.value))

useHead(() => ({
  title: page.value?.title ?? 'Leisuer',
  meta: [
    {
      name: 'description',
      content: page.value?.description ?? page.value?.title ?? 'Leisuer 的个人主页与博客。',
    },
  ],
}))

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
  if (!newId || !import.meta.client) return
  nextTick(() => {
    const linkElement = document.querySelector(`.toc-link[href="#${newId}"]`)
    const tocCard = document.querySelector('.toc-card')

    if (linkElement instanceof HTMLElement && tocCard instanceof HTMLElement) {
      const linkTop = linkElement.offsetTop
      const linkCenter = linkTop + linkElement.offsetHeight / 2
      tocCard.scrollTo({
        top: linkCenter - tocCard.clientHeight / 2,
        behavior: 'smooth',
      })
    }
  })
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
    class="mx-auto grid w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-1 gap-6 py-10"
    :class="tocLinks.length ? 'lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]' : 'lg:grid-cols-1'"
  >
    <aside v-if="tocLinks.length" class="toc-sidebar hidden self-start lg:sticky lg:top-24 lg:block">
      <nav class="toc-card rounded-[1.25rem] bg-[var(--color-surface)] p-4" aria-label="Table of contents">
        <h2 class="mb-4 flex items-center gap-3 text-lg font-bold text-[var(--color-text-main)] before:inline-block before:h-5 before:w-1 before:shrink-0 before:rounded-full before:bg-[var(--color-accent)] before:content-['']">
          {{ t('article.toc') }}
        </h2>
        <ol class="grid gap-2">
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
      </nav>
    </aside>

    <article class="min-w-0 rounded-[1.25rem] bg-[var(--color-surface)] px-6 py-8 md:px-10 md:py-10">
      <header class="mb-8">
        <p v-if="page.category" class="article-category mb-3 inline-flex cursor-pointer font-bold text-[var(--color-accent)]">
          {{ page.category }}
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
  </div>
</template>

<style scoped>
.toc-sidebar {
  width: 100%;
}

.toc-card {
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
  scrollbar-color: var(--color-scrollbar-thumb) transparent;
  scrollbar-width: thin;
}

.toc-card::-webkit-scrollbar {
  width: 0.25rem;
}

.toc-card::-webkit-scrollbar-track {
  background: transparent;
}

.toc-card::-webkit-scrollbar-thumb {
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
  border-radius: 999px;
  padding: 0.2rem 0.58rem;
  margin-inline-start: -0.58rem;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease;
}

.article-category:hover {
  background-color: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
  opacity: 1;
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
