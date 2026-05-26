<script setup lang="ts">
const { locale, t } = useI18n()

useHead(() => ({
  title: t('home.tags'),
  meta: [
    {
      name: 'description',
      content: t('home.tags'),
    },
  ],
}))

const { data: taxonomies } = await useAsyncData('tags-page-taxonomies-' + locale.value, async () => {
  const docs = await queryCollection('content').all()

  return buildContentTaxonomies(docs)
})

const categories = computed(() => taxonomies.value?.categories ?? [])
const tags = computed(() => taxonomies.value?.tags ?? [])
</script>

<template>
  <div class="mx-auto grid w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
    <aside class="hidden flex-col gap-6 self-start md:flex lg:sticky lg:top-24">
      <HomeProfileCard compact />
      <HomeTaxonomyCard :categories="categories" :tags="tags" />
    </aside>

    <section class="flex flex-col gap-5">
      <header class="taxonomy-intro-card">
        <p class="taxonomy-intro-eyebrow">{{ t('nav.posts') }}</p>
        <h1 class="taxonomy-title">
          {{ t('home.tags') }}
          <span>{{ tags.length }}</span>
        </h1>
      </header>

      <ContentTagsPanel :tags="tags" />
    </section>
  </div>
</template>

<style scoped>
.taxonomy-intro-card {
  border-radius: 1.25rem;
  background: var(--color-surface);
  padding: 1.25rem;
}

.taxonomy-intro-eyebrow {
  margin-bottom: 0.75rem;
  display: inline-flex;
  color: var(--color-accent);
  font-weight: 800;
}

.taxonomy-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-main);
  font-size: clamp(1.75rem, 3.5vw, 3rem);
  font-weight: 800;
  line-height: 1.12;
}

.taxonomy-title::before {
  display: inline-block;
  width: 0.25rem;
  height: 1.45rem;
  flex: none;
  border-radius: 999px;
  background: var(--color-accent);
  content: '';
}

.taxonomy-title span {
  color: var(--color-text-muted);
}

@media (min-width: 768px) {
  .taxonomy-intro-card {
    padding: 1.75rem;
  }
}
</style>
