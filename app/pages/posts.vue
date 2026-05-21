<script setup lang="ts">
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
</script>

<template>
  <div class="mx-auto grid w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
    <aside class="hidden flex-col gap-6 self-start md:flex lg:sticky lg:top-24">
      <HomeProfileCard compact />
      <HomeTaxonomyCard :categories="postCategories" :tags="postTags" />
    </aside>

    <section class="flex flex-col gap-5">
      <header class="rounded-[1.25rem] bg-[var(--color-surface)] p-5 md:p-7">
        <p class="mb-3 inline-flex font-bold text-[var(--color-accent)]">{{ t('nav.posts') }}</p>
        <h1 class="posts-title">
          {{ t('posts.title') }}
        </h1>
        <p class="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
          {{ t('posts.description') }}
        </p>
      </header>

      <HomePostCard v-for="post in posts" :key="post.path" :post="post" />
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
</style>
