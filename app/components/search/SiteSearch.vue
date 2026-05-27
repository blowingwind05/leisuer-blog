<script setup lang="ts">
type SearchSection = {
  id: string
  title: string
  titles: string[]
  level: number
  content: string
  path?: string
  category?: unknown
  tags?: unknown[]
  created?: Date | string
  draft?: boolean
}

type ScoredSection = {
  section: SearchSection
  score: number
}

type ArticleSearchResult = {
  key: string
  title: string
  to: string
  section: SearchSection
  matches: ScoredSection[]
  score: number
  totalScore: number
  matchCount: number
}

const props = defineProps<{
  active: boolean
}>()

const emit = defineEmits<{
  activate: []
  close: []
}>()

const { locale, t } = useI18n()
const localePath = useLocalePath()
const placeholderRef = ref<HTMLElement | null>(null)
const flyoutRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const openingFromRect = ref<Partial<CSSStyleDeclaration> | null>(null)
const expandedResultKeys = ref<Set<string>>(new Set())

const { data: sections } = await useAsyncData('site-search-sections-' + locale.value, async () => {
  const results = await queryCollectionSearchSections('content', {
    extraFields: ['path', 'category', 'tags', 'created', 'draft'],
  })

  return results.filter(section => (section as SearchSection).draft !== true) as SearchSection[]
})

const normalizedQuery = computed(() => query.value.trim().toLowerCase())
const searchableSections = computed(() => sections.value ?? [])

const normalizeValue = (value: unknown) => {
  if (Array.isArray(value)) return value.map(normalizeValue).filter(Boolean).join(' ')
  if (value == null) return ''

  return String(value).toLowerCase()
}

const scoreSection = (section: SearchSection, value: string) => {
  if (!value) return 0

  let score = 0
  const title = normalizeValue(section.title)
  const titles = normalizeValue(section.titles)
  const content = normalizeValue(section.content)
  const path = normalizeValue(section.path ?? section.id)
  const category = normalizeValue(getCategoryPath(section.category))
  const tags = normalizeValue(section.tags)

  if (title.includes(value)) score += title === value ? 90 : 60
  if (titles.includes(value)) score += 35
  if (content.includes(value)) score += 22
  if (category.includes(value)) score += 16
  if (tags.includes(value)) score += 14
  if (path.includes(value)) score += 8

  return score
}

const sectionArticlePath = (section: SearchSection) => {
  return section.path ?? section.id.split('#')[0] ?? section.id
}

const sectionArticleTitle = (section: SearchSection) => {
  return section.titles?.[0] ?? section.title
}

const buildArticleResult = (item: ScoredSection): ArticleSearchResult => {
  const key = sectionArticlePath(item.section)

  return {
    key,
    title: sectionArticleTitle(item.section),
    to: item.section.id,
    section: item.section,
    matches: [item],
    score: item.score,
    totalScore: item.score,
    matchCount: 1,
  }
}

const searchResults = computed(() => {
  const value = normalizedQuery.value

  if (!value) return []

  const groupedResults = new Map<string, ArticleSearchResult>()

  searchableSections.value
    .map(section => ({
      section,
      score: scoreSection(section, value),
    }))
    .filter(item => item.score > 0)
    .forEach((item) => {
      const key = sectionArticlePath(item.section)
      const current = groupedResults.get(key)

      if (!current) {
        groupedResults.set(key, buildArticleResult(item))
        return
      }

      current.totalScore += item.score
      current.matchCount += 1
      current.matches.push(item)

      if (item.score > current.score || (item.score === current.score && item.section.level < current.section.level)) {
        current.section = item.section
        current.title = sectionArticleTitle(item.section)
        current.to = item.section.id
        current.score = item.score
      }
    })

  return Array.from(groupedResults.values())
    .map(result => ({
      ...result,
      matches: result.matches.sort((a, b) => b.score - a.score || a.section.level - b.section.level),
    }))
    .sort((a, b) => {
      const aScore = a.score + a.totalScore * 0.12
      const bScore = b.score + b.totalScore * 0.12

      return bScore - aScore || a.section.level - b.section.level
    })
    .slice(0, 8)
})

const resultCountText = computed(() => t('search.resultCount', { count: searchResults.value.length }))

watch(normalizedQuery, () => {
  expandedResultKeys.value = new Set()
})

const sectionPathLabel = (section: SearchSection, articleTitle: string) => {
  const labels = [...(section.titles ?? []), section.title]
    .filter(Boolean)
    .filter(label => label !== articleTitle)

  return Array.from(new Set(labels)).join(' / ')
}

const resultPathLabel = (result: ArticleSearchResult) => {
  return sectionPathLabel(result.section, result.title)
}

const sectionContent = (section: SearchSection) => {
  return section.content?.replace(/\s+/g, ' ').trim()
}

const sectionCategory = (section: SearchSection) => {
  return formatCategoryLabel(section.category)
}
const sectionCategoryPath = (section: SearchSection) => getCategoryPath(section.category)
const categorySegmentLink = (path: string[]) => {
  return localePath(`/categories/${path.map(item => encodeURIComponent(item)).join('/')}`)
}
const sectionTags = (section: SearchSection) => {
  return (section.tags ?? [])
    .map(tag => String(tag).trim())
    .filter(Boolean)
}
const tagPath = (tag: string) => localePath(`/tags/${encodeURIComponent(tag)}`)

const escapeRegExp = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const highlightText = (text: string) => {
  const value = normalizedQuery.value

  if (!value || !text) return text

  return text.replace(new RegExp(`(${escapeRegExp(value)})`, 'gi'), '<mark>$1</mark>')
}

const sectionSnippet = (section: SearchSection) => {
  const content = sectionContent(section)

  if (!content) return ''

  const value = normalizedQuery.value
  const index = value ? content.toLowerCase().indexOf(value) : -1

  if (index < 0) return content.slice(0, 120)

  const start = Math.max(0, index - 38)
  const end = Math.min(content.length, index + value.length + 82)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < content.length ? '...' : ''

  return `${prefix}${content.slice(start, end)}${suffix}`
}

const sectionHitLocation = (section: SearchSection, articleTitle: string) => {
  const path = sectionPathLabel(section, articleTitle)

  if (path) return path
  if (section.title && section.title !== articleTitle) return section.title

  return ''
}

const resultExtraMatches = (result: ArticleSearchResult) => {
  return result.matches.filter(item => item.section.id !== result.section.id)
}

const isResultExpanded = (result: ArticleSearchResult) => {
  return expandedResultKeys.value.has(result.key)
}

const toggleResultExpanded = (result: ArticleSearchResult) => {
  const nextKeys = new Set(expandedResultKeys.value)

  if (nextKeys.has(result.key)) {
    nextKeys.delete(result.key)
  } else {
    nextKeys.add(result.key)
  }

  expandedResultKeys.value = nextKeys
}

const resultExpandLabel = (result: ArticleSearchResult) => {
  return isResultExpanded(result)
    ? t('search.collapsePageResults')
    : t('search.moreInPage', { count: resultExtraMatches(result).length })
}

const resultExpandIcon = (result: ArticleSearchResult) => {
  return isResultExpanded(result) ? 'lucide:chevron-up' : 'lucide:chevron-down'
}

const closeSearch = () => {
  query.value = ''
  emit('close')
}

const handleResultClick = () => {
  closeSearch()
}

const activateSearch = () => {
  if (!props.active && import.meta.client) {
    const rect = placeholderRef.value?.getBoundingClientRect()

    if (rect) {
      openingFromRect.value = {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }
    }
  }

  emit('activate')
}

const onKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    activateSearch()
    return
  }

  if (event.key === 'Escape' && props.active) {
    closeSearch()
  }
}

const onPointerdown = (event: PointerEvent) => {
  if (!props.active) return

  const target = event.target instanceof Node ? event.target : null

  if (target && flyoutRef.value?.contains(target)) return

  closeSearch()
}

watch(() => props.active, async (active) => {
  if (active) {
    await nextTick()
    inputRef.value?.focus()
    requestAnimationFrame(() => {
      openingFromRect.value = null
    })
  }
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('pointerdown', onPointerdown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('pointerdown', onPointerdown)
})
</script>

<template>
  <div
    ref="placeholderRef"
    class="site-search-placeholder"
    :class="{ 'site-search-placeholder-active': active }"
  >
    <label v-if="!active" class="site-search-field" :aria-label="t('search.title')">
      <UIcon name="lucide:search" class="site-search-icon" />
      <input
        v-model="query"
        class="site-search-input"
        type="search"
        :placeholder="t('search.placeholder')"
        @focus="activateSearch"
        @click="activateSearch"
      />
      <span v-if="!active" class="site-search-shortcut">{{ t('search.shortcutHint') }}</span>
    </label>
  </div>

  <div
    ref="flyoutRef"
    class="site-search-flyout"
    :class="{ 'site-search-flyout-active': active }"
    :style="openingFromRect"
    :aria-hidden="!active"
  >
    <label class="site-search-field" :aria-label="t('search.title')">
      <UIcon name="lucide:search" class="site-search-icon" />
      <input
        ref="inputRef"
        v-model="query"
        class="site-search-input"
        type="search"
        :placeholder="t('search.placeholder')"
        @focus="activateSearch"
        @click="activateSearch"
      />
      <button
        class="site-search-close"
        type="button"
        :aria-label="t('search.close')"
        @pointerdown.prevent
        @click.stop.prevent="closeSearch"
      >
        <UIcon name="lucide:x" />
      </button>
    </label>
    <Transition name="site-search-panel">
      <div v-if="active" class="site-search-panel" @pointerdown.self="closeSearch">
        <div class="site-search-panel-inner" @pointerdown.self="closeSearch">
          <p class="site-search-heading">{{ t('search.title') }}</p>
          <p v-if="!normalizedQuery" class="site-search-state">{{ t('search.empty') }}</p>
          <template v-else>
            <p class="site-search-count">{{ resultCountText }}</p>
            <div v-if="searchResults.length" class="site-search-results">
              <article
                v-for="result in searchResults"
                :key="result.key"
                class="site-search-result"
              >
                <NuxtLink class="site-search-result-main" :to="result.to" @click="handleResultClick">
                  <span class="site-search-result-title" v-html="highlightText(result.title)"></span>
                  <span v-if="resultPathLabel(result)" class="site-search-result-path" v-html="highlightText(resultPathLabel(result))"></span>
                  <span v-if="sectionHitLocation(result.section, result.title)" class="site-search-result-location" v-html="highlightText(sectionHitLocation(result.section, result.title))"></span>
                  <span v-if="sectionSnippet(result.section)" class="site-search-result-content" v-html="highlightText(sectionSnippet(result.section))"></span>
                </NuxtLink>
                <span class="site-search-result-meta">
                  <span v-if="sectionCategory(result.section)" class="site-search-result-meta-tags">
                    <template v-for="(category, index) in sectionCategoryPath(result.section)" :key="`${category}-${index}`">
                      <span v-if="index > 0">/</span>
                      <NuxtLink class="site-search-result-meta-link" :to="categorySegmentLink(sectionCategoryPath(result.section).slice(0, index + 1))" @click="handleResultClick">
                        <span v-html="highlightText(category)"></span>
                      </NuxtLink>
                    </template>
                  </span>
                  <span v-if="result.section.created">{{ formatContentDate(result.section.created, locale) }}</span>
                  <span v-if="sectionTags(result.section).length" class="site-search-result-meta-tags">
                    <template v-for="(tag, index) in sectionTags(result.section)" :key="tag">
                      <span v-if="index > 0">/</span>
                      <NuxtLink class="site-search-result-meta-link" :to="tagPath(tag)" @click="handleResultClick">
                        <span v-html="highlightText(tag)"></span>
                      </NuxtLink>
                    </template>
                  </span>
                </span>
                <button
                  v-if="resultExtraMatches(result).length"
                  class="site-search-result-more"
                  type="button"
                  @click="toggleResultExpanded(result)"
                >
                  <span>{{ resultExpandLabel(result) }}</span>
                  <UIcon :name="resultExpandIcon(result)" />
                </button>
                <div v-if="isResultExpanded(result)" class="site-search-result-matches">
                  <NuxtLink
                    v-for="match in resultExtraMatches(result)"
                    :key="match.section.id"
                    class="site-search-result-match"
                    :to="match.section.id"
                    @click="handleResultClick"
                  >
                    <span v-if="sectionHitLocation(match.section, result.title)" class="site-search-result-match-location" v-html="highlightText(sectionHitLocation(match.section, result.title))"></span>
                    <span v-if="sectionSnippet(match.section)" class="site-search-result-match-snippet" v-html="highlightText(sectionSnippet(match.section))"></span>
                  </NuxtLink>
                </div>
              </article>
            </div>
            <p v-else class="site-search-state">{{ t('search.noResults') }}</p>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.site-search-placeholder,
.site-search-flyout {
  position: relative;
  z-index: 4;
  width: 7.25rem;
  transition:
    right 0.54s cubic-bezier(0.16, 1, 0.3, 1),
    left 0.54s cubic-bezier(0.16, 1, 0.3, 1),
    width 0.54s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.54s cubic-bezier(0.16, 1, 0.3, 1);
}

.site-search-placeholder-active {
  pointer-events: none;
  visibility: hidden;
}

.site-search-flyout {
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
}

.site-search-flyout-active {
  pointer-events: auto;
  opacity: 1;
  visibility: visible;
}

.site-search-flyout {
  position: fixed;
  top: 0;
  left: max(var(--site-gutter), calc((100% - var(--site-content-width)) / 2));
  display: flex;
  width: min(calc(100% - var(--site-gutter) * 2), var(--site-content-width));
  height: 4rem;
  align-items: center;
}

.site-search-field {
  display: inline-flex;
  width: 100%;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--color-border);
  border-radius: 0.65rem;
  background: var(--color-surface-elevated);
  color: var(--color-text-muted);
  padding: 0.3rem 0.65rem;
  transition:
    border-color 0.24s ease,
    box-shadow 0.24s ease,
    background-color 0.24s ease;
}

.site-search-field:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 18%, transparent);
}

.site-search-icon {
  width: 1rem;
  height: 1rem;
  flex: none;
}

.site-search-input {
  min-width: 0;
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--color-text-main);
  font-size: 0.95rem;
  outline: 0;
}

.site-search-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.7;
}

.site-search-shortcut {
  display: none;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 800;
}

.site-search-close {
  display: grid;
  width: 1.8rem;
  height: 1.8rem;
  flex: none;
  cursor: pointer;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
  color: var(--color-text-main);
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.site-search-close:hover {
  background: color-mix(in srgb, var(--color-text-muted) 18%, transparent);
  opacity: 1;
}

.site-search-close svg {
  width: 1rem;
  height: 1rem;
}

.site-search-panel {
  position: fixed;
  top: 4rem;
  right: 0;
  left: 0;
  z-index: 3;
  overflow: hidden;
  background: var(--color-nav-bg);
  box-shadow: 0 1.1rem 1.65rem -1.15rem var(--color-shadow);
}

.site-search-panel-inner {
  width: min(calc(100% - var(--site-gutter) * 2), var(--site-content-width));
  max-height: min(70vh, 34rem);
  margin: 0 auto;
  overflow-y: auto;
  padding: 1rem 0 1.25rem;
}

.site-search-heading,
.site-search-count,
.site-search-state {
  margin: 0;
  font-weight: 800;
}

.site-search-heading {
  color: var(--color-accent);
  font-size: 0.95rem;
}

.site-search-count,
.site-search-state {
  margin-top: 0.55rem;
  color: var(--color-text-muted);
}

.site-search-results {
  display: grid;
  gap: 0.55rem;
  margin-top: 0.85rem;
}

.site-search-result {
  display: grid;
  gap: 0.42rem;
  border-radius: 0.9rem;
  color: var(--color-text-main);
  padding: 0.75rem 0.85rem;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.site-search-result:hover {
  background: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
  opacity: 1;
}

.site-search-result-main {
  display: grid;
  gap: 0.28rem;
  min-width: 0;
  color: var(--color-text-main);
}

.site-search-result-main:hover {
  opacity: 1;
}

.site-search-result-title {
  font-size: 1rem;
  font-weight: 900;
}

.site-search-result-path,
.site-search-result-location,
.site-search-result-content,
.site-search-result-meta {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.site-search-result-location {
  color: var(--color-text-main);
  font-size: 0.86rem;
  font-weight: 800;
}

.site-search-result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  color: var(--color-accent);
  font-size: 0.82rem;
  font-weight: 800;
}

.site-search-result-meta-link {
  color: var(--color-accent);
}

.site-search-result-meta-link:hover {
  opacity: 0.8;
}

.site-search-result-meta-tags {
  display: inline-flex;
  gap: 0.35rem;
  min-width: 0;
}

.site-search-result-more {
  display: inline-flex;
  width: fit-content;
  cursor: pointer;
  align-items: center;
  gap: 0.35rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-muted);
  padding: 0.12rem 0;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 800;
  transition:
    color 0.18s ease,
    opacity 0.18s ease;
}

.site-search-result-more:hover {
  color: var(--color-text-main);
  opacity: 1;
}

.site-search-result-more svg {
  width: 0.9rem;
  height: 0.9rem;
}

.site-search-result-matches {
  display: grid;
  gap: 0.35rem;
  border-left: 0.16rem solid color-mix(in srgb, var(--color-accent) 28%, transparent);
  margin-left: 0.15rem;
  padding-left: 0.75rem;
}

.site-search-result-match {
  display: grid;
  gap: 0.18rem;
  min-width: 0;
  border-radius: 0.65rem;
  color: var(--color-text-main);
  padding: 0.45rem 0.55rem;
  transition:
    background-color 0.18s ease,
    opacity 0.18s ease;
}

.site-search-result-match:hover {
  background: color-mix(in srgb, var(--color-text-muted) 10%, transparent);
  opacity: 1;
}

.site-search-result-match-location {
  overflow: hidden;
  color: var(--color-text-main);
  font-size: 0.85rem;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.site-search-result-match-snippet {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 0.83rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.site-search-result :deep(mark) {
  border-radius: 0.24rem;
  background: color-mix(in srgb, var(--color-accent) 24%, transparent);
  color: inherit;
  padding: 0 0.08rem;
}

.site-search-panel-enter-active,
.site-search-panel-leave-active {
  transition:
    opacity 0.44s ease,
    clip-path 0.54s cubic-bezier(0.16, 1, 0.3, 1);
}

.site-search-panel-enter-from,
.site-search-panel-leave-to {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
}

.site-search-panel-enter-to,
.site-search-panel-leave-from {
  clip-path: inset(0 0 0 0);
}

@media (min-width: 640px) {
  .site-search-placeholder {
    width: 9rem;
  }

  .site-search-shortcut {
    display: inline-flex;
  }
}

@media (min-width: 768px) {
  .site-search-placeholder {
    width: 12rem;
  }
}
</style>
