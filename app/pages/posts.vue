<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()

useHead(() => ({
  title: t('nav.posts'),
  meta: [
    {
      name: 'description',
      content: t('posts.description'),
    },
  ],
}))

const { data: posts } = await useAsyncData('posts-page-' + locale.value, async () => {
  const docs = await queryCollection('content').all()

  return docs
    .filter(doc => doc.draft !== true && !['/about', '/index'].includes(doc.path))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1
      }

      const dateA = new Date(String(a.updated ?? a.created ?? '')).getTime()
      const dateB = new Date(String(b.updated ?? b.created ?? '')).getTime()

      return (Number.isNaN(dateB) ? 0 : dateB) - (Number.isNaN(dateA) ? 0 : dateA)
    })
})

const { data: taxonomies } = await useAsyncData('posts-taxonomies-' + locale.value, async () => {
  const docs = await queryCollection('content').all()

  return buildContentTaxonomies(docs)
})

const postCategories = computed(() => taxonomies.value?.categories ?? [])
const postTags = computed(() => taxonomies.value?.tags ?? [])
const postsPanel = computed<'archive' | 'categories' | 'tags'>(() => {
  const panel = route.query.panel

  if (panel === 'categories' || panel === 'tags') {
    return panel
  }

  return 'archive'
})
</script>

<template>
  <div class="mx-auto grid w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
    <aside class="hidden flex-col gap-6 self-start md:flex lg:sticky lg:top-24">
      <HomeProfileCard compact />
      <HomeTaxonomyCard :categories="postCategories" :tags="postTags" />
    </aside>

    <section class="flex flex-col gap-5">
      <header v-if="postsPanel === 'archive'" class="rounded-[1.25rem] bg-[var(--color-surface)] p-5 md:p-7">
        <p class="mb-3 inline-flex font-bold text-[var(--color-accent)]">{{ t('nav.posts') }}</p>
        <h1 class="posts-title">
          {{ t('posts.title') }}
        </h1>
        <p class="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
          {{ t('posts.description') }}
        </p>
      </header>

      <template v-if="postsPanel === 'archive'">
        <HomePostCard v-for="post in posts" :key="post.path" :post="post" />
      </template>
      <template v-else-if="postsPanel === 'categories'">
        <section class="posts-taxonomy-panel">
          <h2 class="posts-taxonomy-title">
            {{ t('home.categories') }}
            <span>{{ postCategories.length }}</span>
          </h2>
          <div class="grid gap-2">
            <a v-for="category in postCategories" :key="category.name" href="#" class="posts-category-row">
              <span class="posts-category-name">
                <span>{{ category.name }}</span>
                <span v-if="category.children?.length" class="posts-category-children">
                  <template v-for="(child, index) in category.children" :key="`${category.name}-${child.name}`">
                    <UIcon name="lucide:chevron-right" class="posts-category-child-separator" aria-hidden="true" />
                    <span>{{ child.name }}</span>
                  </template>
                </span>
              </span>
              <span>{{ category.count }}</span>
            </a>
          </div>
        </section>
      </template>
      <template v-else>
        <section class="posts-taxonomy-panel">
          <h2 class="posts-taxonomy-title">
            {{ t('home.tags') }}
            <span>{{ postTags.length }}</span>
          </h2>
          <div class="posts-tag-cloud">
            <span v-for="tag in postTags" :key="tag.name" class="posts-tag">
              <span>{{ tag.name }}</span>
              <span>{{ tag.count }}</span>
            </span>
          </div>
        </section>
      </template>
    </section>
  </div>
</template>

<style scoped>
.posts-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-main);
  font-size: clamp(1.9rem, 4vw, 3.4rem);
  font-weight: 800;
  line-height: 1.1;
}

.posts-title::before {
  display: inline-block;
  width: 0.25rem;
  height: 1.5rem;
  flex: none;
  border-radius: 999px;
  background: var(--color-accent);
  content: '';
}

.posts-taxonomy-panel {
  border-radius: 1.25rem;
  background: var(--color-surface);
  padding: 1.25rem;
}

.posts-taxonomy-title {
  margin: 0 0 1rem;
  display: flex;
  align-items: baseline;
  gap: 0.65rem;
  color: var(--color-text-main);
  font-size: 1.35rem;
  font-weight: 800;
}

.posts-taxonomy-title::before {
  display: inline-block;
  width: 0.25rem;
  height: 1.15rem;
  flex: none;
  border-radius: 999px;
  background: var(--color-accent);
  content: '';
}

.posts-taxonomy-title span {
  color: var(--color-text-muted);
  font-size: 1.6rem;
}

.posts-category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 0.75rem;
  padding: 0.75rem 0.9rem;
  color: var(--color-text-main);
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.posts-category-name {
  display: inline-flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 0.65rem;
  color: inherit;
}

.posts-category-children {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  color: var(--color-text-muted);
  font-size: 0.9em;
}

.posts-category-child-separator {
  width: 0.9em;
  height: 0.9em;
  flex: none;
}

.posts-category-row:hover {
  background: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
  opacity: 1;
}

.posts-category-row > span:last-child {
  color: var(--color-accent);
}

.posts-tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.posts-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--color-accent) 9%, transparent);
  padding: 0.45rem 0.75rem;
  color: var(--color-accent);
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.posts-tag:hover {
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
  opacity: 1;
}

.posts-tag span:last-child {
  font-size: 0.85em;
}
</style>
