<script setup lang="ts">
const { locale } = useI18n()

const { data: aboutPage } = await useAsyncData('about-page-' + locale.value, async () => {
  const targetPath = locale.value === 'zh' ? '/about' : `/${locale.value}/about`
  let pageData = await queryCollection('content').path(targetPath).first()
  
  if (!pageData && locale.value !== 'zh') {
    pageData = await queryCollection('content').path('/about').first()
  }
  
  return pageData
})

const { data: taxonomies } = await useAsyncData('about-taxonomies-' + locale.value, async () => {
  const docs = await queryCollection('content').all()

  return buildContentTaxonomies(docs)
})

if (!aboutPage.value) {
  throw createError({ statusCode: 404, statusMessage: 'About page not found', fatal: true })
}

useHead(() => ({
  title: aboutPage.value?.title ?? 'About Leisuer',
  meta: [
    {
      name: 'description',
      content: aboutPage.value?.description ?? 'Personal introduction for Leisuer.',
    },
  ],
}))

const aboutCategories = computed(() => taxonomies.value?.categories ?? [])
const aboutTags = computed(() => taxonomies.value?.tags ?? [])
</script>

<template>
  <div class="mx-auto grid w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
    <aside class="hidden flex-col gap-6 self-start md:flex lg:sticky lg:top-24">
      <HomeProfileCard compact />
      <HomeTaxonomyCard :categories="aboutCategories" :tags="aboutTags" />
    </aside>

    <HomeAboutArticleCard :page="aboutPage" />
  </div>
</template>
