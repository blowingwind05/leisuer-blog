<script setup lang="ts">
const { locale, t } = useI18n()

const { data: aboutPage } = await useAsyncData('about-page-' + locale.value, async () => {
  const targetPath = locale.value === 'zh' ? '/about' : `/${locale.value}/about`
  let pageData = await queryCollection('content').path(targetPath).first()
  
  if (!pageData && locale.value !== 'zh') {
    pageData = await queryCollection('content').path('/about').first()
  }
  
  return pageData
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

const publishedAt = computed(() => formatContentDate(aboutPage.value?.created, locale.value))
const editedAt = computed(() => formatContentDate(aboutPage.value?.updated, locale.value))
</script>

<template>
  <div class="mx-auto w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] py-10">
    <article class="rounded-[1.25rem] bg-[var(--color-surface)] px-6 py-8 md:px-10 md:py-10">
      <header class="mb-8">
        <p class="mb-3 font-bold text-[var(--color-accent)]">{{ aboutPage?.category ?? 'About' }}</p>
        <h1 class="mb-4 flex items-center gap-4 text-[clamp(2.2rem,5vw,4.8rem)] leading-none font-bold text-[var(--color-text-main)] before:inline-block before:h-7 before:w-1 before:rounded-full before:bg-[var(--color-accent)] before:content-['']">
          {{ aboutPage?.title ?? 'About Leisuer' }}
        </h1>
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-[1.05rem] font-bold text-[var(--color-text-muted)]">
          <span v-if="aboutPage?.created" class="inline-flex flex-wrap items-baseline gap-x-1">
            <time :datetime="String(aboutPage.created)">
              {{ t('article.publishedAt') }} {{ publishedAt }}
            </time>
            <span v-if="aboutPage?.updated" class="modified-tooltip">
              （{{ t('article.modified') }}）
              <time class="modified-tooltip-content" :datetime="String(aboutPage.updated)">
                {{ t('article.updatedAt') }} {{ editedAt }}
              </time>
            </span>
          </span>
          <span v-if="aboutPage?.tags?.length">{{ aboutPage.tags.join(' / ') }}</span>
        </div>
        <SummaryCard v-if="aboutPage?.description" :description="aboutPage.description" class="mt-5" />
      </header>

      <ContentRenderer
        v-if="aboutPage"
        class="markdown-content"
        :value="aboutPage"
      />
    </article>
  </div>
</template>
