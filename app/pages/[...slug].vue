<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()

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
    if (linkElement) {
      linkElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
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
  <div class="mx-auto grid w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
    <article class="min-w-0 rounded-[1.25rem] bg-[var(--color-surface)] px-6 py-8 md:px-10 md:py-10">
      <header class="mb-8">
        <p v-if="page.category" class="mb-3 font-bold text-[var(--color-accent)]">
          {{ page.category }}
        </p>
        <h1 class="mb-4 flex items-center gap-4 text-[clamp(2.2rem,5vw,4.8rem)] leading-none font-bold text-[var(--color-text-main)] before:inline-block before:h-7 before:w-1 before:rounded-full before:bg-[var(--color-accent)] before:content-['']">
          {{ page.title }}
        </h1>
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-[1.05rem] font-bold text-[var(--color-text-muted)]">
          <span v-if="page.created" class="inline-flex flex-wrap items-baseline gap-x-1">
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
          <span v-if="page.tags?.length">{{ page.tags.join(' / ') }}</span>
        </div>
        <SummaryCard v-if="page.description" :description="page.description" class="mt-5" />
      </header>

      <ContentRenderer
        v-if="page"
        class="markdown-content"
        :value="page"
      />
    </article>

    <aside v-if="tocLinks.length" class="toc-sidebar hidden lg:block">
      <nav class="toc-card rounded-[1.25rem] bg-[var(--color-surface)] px-5 py-6" aria-label="Table of contents">
        <h2 class="mb-4 flex items-center gap-3 text-lg font-bold text-[var(--color-text-main)] before:inline-block before:h-5 before:w-1 before:rounded-full before:bg-[var(--color-accent)] before:content-['']">
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
  </div>
</template>

<style scoped>
.toc-sidebar {
  width: 16rem;
}

.toc-card {
  position: fixed;
  top: 6rem;
  right: max(var(--site-gutter), calc((100vw - var(--site-content-width)) / 2));
  width: 16rem;
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
</style>
