<script setup lang="ts">
const props = withDefaults(defineProps<{
  page?: {
    title?: string
    description?: string
    category?: string | string[]
    created?: Date | string
    updated?: Date | string
    tags?: string[]
    wordCount?: number
    readingMinutes?: number
  } | null
  collapsible?: boolean
  defaultCollapsed?: boolean
  headingTag?: 'h1' | 'h2'
  reveal?: boolean
}>(), {
  collapsible: false,
  defaultCollapsed: false,
  headingTag: 'h1',
  reveal: false,
})

const { locale, t } = useI18n()
const localePath = useLocalePath()
const isCollapsed = ref(props.defaultCollapsed)
const showExpandNotice = ref(false)
const publishedAt = computed(() => formatContentDate(props.page?.created, locale.value))
const editedAt = computed(() => formatContentDate(props.page?.updated, locale.value))
const tagPath = (tag: string) => localePath(`/tags/${encodeURIComponent(tag)}`)

const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value
  showExpandNotice.value = false
}

const showCollapsedNotice = (event: MouseEvent) => {
  if (!props.collapsible || !isCollapsed.value) return

  const target = event.target

  if (target instanceof Element && target.closest('button, a, [role="button"], input, textarea, select')) {
    return
  }

  showExpandNotice.value = true
}
</script>

<template>
  <article
    class="relative rounded-[1.25rem] bg-[var(--color-surface)] px-6 pt-8 pb-8 md:px-10 md:pt-10 md:pb-10"
    :class="{ 'reveal-card': reveal }"
    @click="showCollapsedNotice"
  >
    <div v-if="collapsible" class="absolute top-4 right-4 flex items-center gap-2 md:top-6 md:right-6">
      <Transition name="about-expand-hint">
        <p v-if="isCollapsed" class="m-0 hidden items-center gap-1.5 text-lg font-bold whitespace-nowrap text-[var(--color-accent)] sm:inline-flex">
          <span>{{ t('home.expandProfileHint') }}</span>
          <UIcon name="lucide:arrow-right" class="size-4" />
        </p>
      </Transition>
      <button
        class="grid size-9 cursor-pointer place-items-center rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[var(--color-accent)] transition hover:bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] hover:opacity-100"
        type="button"
        :aria-label="isCollapsed ? '展开自我介绍' : '收起自我介绍'"
        @click="toggleCollapsed"
      >
        <UIcon :name="isCollapsed ? 'lucide:expand' : 'lucide:minimize-2'" class="size-4" :class="{ 'about-expand-icon-attention': isCollapsed }" />
      </button>
    </div>

    <Transition name="about-expand-notice">
      <div v-if="showExpandNotice" class="about-expand-notice-backdrop" role="presentation">
        <div class="about-expand-notice" role="dialog" aria-modal="true" :aria-label="t('home.expandProfileNotice')">
          <UIcon name="lucide:info" class="about-expand-notice-icon" />
          <p>{{ t('home.expandProfileNotice') }}</p>
          <button class="about-expand-notice-button" type="button" @click="showExpandNotice = false">
            {{ t('common.confirm') }}
          </button>
        </div>
      </div>
    </Transition>

    <header class="transition-[margin] duration-300 ease-out" :class="isCollapsed ? 'mb-0' : 'mb-8'">
      <p class="article-category mb-3 inline-flex cursor-pointer font-bold text-[var(--color-accent)]">
        <ContentCategoryPath :category="page?.category" fallback="About" />
      </p>
      <component
        :is="headingTag"
        class="mb-4 flex items-center gap-4 leading-none font-bold text-[var(--color-text-main)] before:inline-block before:w-1 before:shrink-0 before:rounded-full before:bg-[var(--color-accent)] before:content-['']"
        :class="headingTag === 'h1'
          ? 'text-[clamp(2.2rem,5vw,4.8rem)] before:h-7'
          : 'text-[clamp(2rem,4vw,4.4rem)] before:h-6'"
      >
        {{ page?.title ?? 'About Leisuer' }}
      </component>
      <div class="article-meta grid min-w-0 gap-2 text-[1.05rem] font-bold text-[var(--color-text-muted)]">
        <div class="flex flex-wrap gap-x-4 gap-y-1">
          <span v-if="page?.created" class="inline-flex flex-wrap items-baseline gap-x-1.5">
            <UIcon name="lucide:calendar-days" class="size-4.5 translate-y-[0.12em]" />
            <time :datetime="String(page.created)">
              {{ t('article.publishedAt') }} {{ publishedAt }}
            </time>
            <span v-if="page?.updated" class="modified-tooltip">
              （{{ t('article.modified') }}）
              <time class="modified-tooltip-content" :datetime="String(page.updated)">
                {{ t('article.updatedAt') }} {{ editedAt }}
              </time>
            </span>
          </span>
          <span class="inline-flex items-center gap-1.5">
            <UIcon name="lucide:file-text" class="size-4.5" />
            {{ t('article.wordCount', { count: page?.wordCount ?? 0 }) }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <UIcon name="lucide:clock" class="size-4.5" />
            {{ t('article.readingTime', { minutes: page?.readingMinutes ?? 1 }) }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <UIcon name="lucide:eye" class="size-4.5" />
            {{ t('article.viewCount', { count: 233 }) }}
          </span>
        </div>
        <div v-if="page?.tags?.length" class="article-meta-tags flex flex-wrap items-center gap-x-2 gap-y-1">
          <template v-for="(tag, index) in page.tags" :key="tag">
            <span v-if="index > 0" class="text-[var(--color-text-muted)]">/</span>
            <NuxtLink class="article-tag cursor-pointer" :to="tagPath(tag)">{{ tag }}</NuxtLink>
          </template>
        </div>
      </div>
      <SummaryCard v-if="page?.description && !isCollapsed" :description="page.description" class="mt-5" />
    </header>

    <Transition name="about-article-collapse">
      <div v-show="!isCollapsed" class="about-article-collapse">
        <div class="about-article-collapse-inner">
          <ContentRenderer
            v-if="page"
            class="markdown-content"
            :value="page"
          />
          <p v-else class="text-lg text-[var(--color-text-main)]">
            About content is being prepared.
          </p>
        </div>
      </div>
    </Transition>
  </article>
</template>

<style scoped>
.about-article-collapse {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  transition:
    grid-template-rows 0.32s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.22s ease;
}

.about-article-collapse-inner {
  min-height: 0;
  overflow: hidden;
}

.about-article-collapse-enter-from,
.about-article-collapse-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

.about-article-collapse-enter-to,
.about-article-collapse-leave-from {
  grid-template-rows: 1fr;
  opacity: 1;
}

.about-expand-hint-enter-active,
.about-expand-hint-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.about-expand-hint-enter-from,
.about-expand-hint-leave-to {
  opacity: 0;
  transform: translateX(0.35rem);
}

.about-expand-icon-attention {
  animation: about-expand-icon-attention 2.6s ease-in-out infinite;
  transform-origin: center;
}

@keyframes about-expand-icon-attention {
  0%,
  22%,
  44%,
  62% {
    transform: scale(1) rotate(0deg);
  }

  11%,
  33% {
    transform: scale(1.22) rotate(0deg);
  }

  52% {
    transform: scale(1.06) rotate(0deg);
  }

  78% {
    transform: scale(1.06) rotate(180deg);
  }

  100% {
    transform: scale(1) rotate(180deg);
  }
}

.about-expand-notice-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--color-overlay) 72%, transparent);
  padding: 1.25rem;
}

.about-expand-notice {
  display: grid;
  justify-items: center;
  width: min(22rem, 100%);
  border: 1px solid color-mix(in srgb, var(--color-accent) 22%, transparent);
  border-radius: 1.2rem;
  background: var(--color-surface-elevated);
  box-shadow: 0 1.2rem 3rem var(--color-shadow);
  color: var(--color-text-main);
  padding: 1.5rem;
  text-align: center;
}

.about-expand-notice-icon {
  width: 2.3rem;
  height: 2.3rem;
  margin-bottom: 0.8rem;
  color: var(--color-accent);
}

.about-expand-notice p {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.6;
}

.about-expand-notice-button {
  margin-top: 1.2rem;
  min-width: 6rem;
  border: 0;
  border-radius: 0.85rem;
  background: var(--color-accent);
  color: white;
  cursor: pointer;
  padding: 0.65rem 1.2rem;
  font-weight: 800;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.about-expand-notice-button:hover {
  opacity: 0.88;
  transform: translateY(-0.04rem);
}

.about-expand-notice-enter-active,
.about-expand-notice-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.about-expand-notice-enter-from,
.about-expand-notice-leave-to {
  opacity: 0;
}

.about-expand-notice-enter-from .about-expand-notice,
.about-expand-notice-leave-to .about-expand-notice {
  transform: translateY(0.35rem) scale(0.98);
}

.article-category {
  border-radius: 999px;
  padding: 0.3rem 0.82rem;
  margin-inline-start: -0.82rem;
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

.article-category :deep(.content-category-segment) {
  padding: 0;
}

.article-tag {
  position: relative;
  max-width: 100%;
  color: inherit;
  overflow-wrap: anywhere;
  text-decoration: none;
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
