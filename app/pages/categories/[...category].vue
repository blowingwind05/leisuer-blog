<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const categoryPath = computed(() => {
  const value = route.params.category
  const segments = Array.isArray(value) ? value : [value]

  return segments.map(segment => decodeURIComponent(String(segment))).filter(Boolean).slice(0, 2)
})

const categoryLabel = computed(() => categoryPath.value.join(' / '))

useHead(() => ({
  title: categoryLabel.value || t('home.categories'),
  meta: [
    {
      name: 'description',
      content: categoryLabel.value || t('home.categories'),
    },
  ],
}))

const { data } = await useAsyncData('category-posts-' + locale.value + '-' + route.path, async () => {
  const docs = await queryCollection('content').all()
  const taxonomies = buildContentTaxonomies(docs)
  const posts = docs
    .filter((doc) => {
      if (doc.draft === true || ['/about', '/index'].includes(doc.path)) return false

      const path = getCategoryPath(doc.category)

      if (!categoryPath.value.length) return false
      if (path[0] !== categoryPath.value[0]) return false

      return categoryPath.value.length === 1 || path[1] === categoryPath.value[1]
    })
    .sort((a, b) => {
      const dateA = new Date(String(a.created ?? a.updated ?? '')).getTime()
      const dateB = new Date(String(b.created ?? b.updated ?? '')).getTime()

      return (Number.isNaN(dateB) ? 0 : dateB) - (Number.isNaN(dateA) ? 0 : dateA)
    })

  return {
    posts,
    taxonomies,
  }
})

const posts = computed(() => data.value?.posts ?? [])
const categories = computed(() => data.value?.taxonomies.categories ?? [])
const tags = computed(() => data.value?.taxonomies.tags ?? [])
const postCount = computed(() => posts.value.length)
const formatArchiveDate = (value?: Date | string) => {
  if (!value) return ''

  const date = new Date(String(value))

  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
const archiveYears = computed(() => {
  const groups = new Map<string, typeof posts.value>()

  for (const post of posts.value) {
    const date = new Date(String(post.created ?? post.updated ?? ''))
    const year = Number.isNaN(date.getTime()) ? t('posts.undated') : String(date.getFullYear())

    groups.set(year, [...(groups.get(year) ?? []), post])
  }

  return Array.from(groups, ([year, items]) => ({
    year,
    items,
  }))
})
</script>

<template>
  <div class="mx-auto grid w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
    <aside class="hidden flex-col gap-6 self-start md:flex lg:sticky lg:top-24">
      <HomeProfileCard compact />
      <HomeTaxonomyCard :categories="categories" :tags="tags" />
    </aside>

    <section class="flex flex-col gap-5">
      <header class="taxonomy-archive-intro-card">
        <p class="taxonomy-archive-eyebrow">{{ categoryLabel }}</p>
        <h1 class="taxonomy-archive-title">
          {{ t('posts.archiveTitle', { count: postCount }) }}
        </h1>
      </header>

      <section class="taxonomy-archive-card">
        <div v-for="group in archiveYears" :key="group.year" class="taxonomy-archive-year">
          <h2 class="taxonomy-archive-year-title">
            {{ group.year }}
            <span>{{ group.items.length }}</span>
          </h2>
          <div class="taxonomy-archive-list">
            <NuxtLink
              v-for="post in group.items"
              :key="post.path"
              class="taxonomy-archive-item"
              :to="localePath(post.path)"
            >
              <time class="taxonomy-archive-date" :datetime="String(post.created ?? post.updated ?? '')">
                {{ formatArchiveDate(post.created ?? post.updated) }}
              </time>
              <span class="taxonomy-archive-item-title">{{ post.title }}</span>
            </NuxtLink>
          </div>
        </div>
      </section>
    </section>
  </div>
</template>

<style scoped>
.taxonomy-archive-intro-card,
.taxonomy-archive-card {
  border-radius: 1.25rem;
  background: var(--color-surface);
  padding: 1.25rem;
}

.taxonomy-archive-eyebrow {
  margin-bottom: 0.75rem;
  display: inline-flex;
  color: var(--color-accent);
  font-weight: 800;
}

.taxonomy-archive-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-main);
  font-size: clamp(1.75rem, 3.5vw, 3rem);
  font-weight: 800;
  line-height: 1.12;
}

.taxonomy-archive-title::before {
  display: inline-block;
  width: 0.25rem;
  height: 1.45rem;
  flex: none;
  border-radius: 999px;
  background: var(--color-accent);
  content: '';
}

.taxonomy-archive-card {
  display: grid;
  gap: 1.5rem;
}

.taxonomy-archive-year {
  display: grid;
  gap: 0.9rem;
}

.taxonomy-archive-year-title {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  align-self: start;
  margin: 0;
  color: var(--color-accent);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
  line-height: 1;
}

.taxonomy-archive-year-title span {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 800;
}

.taxonomy-archive-list {
  display: grid;
  gap: 0.45rem;
  border-left: 0.16rem solid color-mix(in srgb, var(--color-accent) 18%, transparent);
  padding-left: 1rem;
}

.taxonomy-archive-item {
  position: relative;
  display: grid;
  grid-template-columns: 6.5rem minmax(0, 1fr);
  align-items: center;
  gap: 0.9rem;
  border-radius: 0.9rem;
  padding: 0.7rem 0.8rem;
  color: var(--color-text-main);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.taxonomy-archive-item::before {
  position: absolute;
  top: 50%;
  left: -1.3rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: var(--color-accent);
  transform: translateY(-50%);
  content: '';
}

.taxonomy-archive-item:hover {
  background: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
  opacity: 1;
}

.taxonomy-archive-date {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 800;
  white-space: nowrap;
}

.taxonomy-archive-item-title {
  min-width: 0;
  overflow: hidden;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .taxonomy-archive-intro-card,
  .taxonomy-archive-card {
    padding: 1.75rem;
  }
}

@media (max-width: 767.98px) {
  .taxonomy-archive-item {
    grid-template-columns: 1fr;
    align-items: start;
    gap: 0.25rem;
  }
}
</style>
