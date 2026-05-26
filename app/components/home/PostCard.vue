<script setup lang="ts">
defineProps<{
  post: {
    path: string
    title?: string
    description?: string
    category?: string | string[]
    created?: Date | string
    cover?: string
    tags?: string[]
    wordCount?: number
    readingMinutes?: number
  }
  reveal?: boolean
}>()

const { locale, t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <article
    class="grid grid-cols-1 gap-6 rounded-[1.25rem] bg-[var(--color-surface)] p-4 md:h-60 md:grid-cols-[minmax(0,1fr)_4rem] md:has-[.post-card-cover]:grid-cols-[minmax(0,1fr)_18rem]"
    :class="{ 'reveal-card': reveal }"
  >
    <div class="flex min-h-0 min-w-0 flex-col">
      <div class="post-card-meta mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.95rem] font-bold text-[var(--color-text-muted)] xl:gap-x-4 xl:text-base">
        <span v-if="post.category" class="post-card-category">
          <UIcon name="lucide:folder" class="size-4.5 shrink-0" />
          <ContentCategoryPath :category="post.category" mode="leaf" />
        </span>
        <span v-if="post.created" class="inline-flex items-center gap-1.5 whitespace-nowrap">
          <UIcon name="lucide:calendar-days" class="size-4.5 shrink-0" />
          {{ formatContentDate(post.created, locale) }}
        </span>
        <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
          <UIcon name="lucide:file-text" class="size-4.5 shrink-0" />
          {{ t('article.wordCount', { count: post.wordCount ?? 0 }) }}
        </span>
        <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
          <UIcon name="lucide:clock" class="size-4.5 shrink-0" />
          {{ t('article.readingTime', { minutes: post.readingMinutes ?? 1 }) }}
        </span>
        <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
          <UIcon name="lucide:eye" class="size-4.5 shrink-0" />
          414
        </span>
      </div>
      <h2 class="mb-4 flex items-center gap-4 text-[clamp(1.55rem,2.4vw,2.8rem)] leading-tight font-bold before:inline-block before:h-5 before:w-1 before:shrink-0 before:rounded-full before:bg-[var(--color-accent)] before:content-['']">
        <NuxtLink
          class="post-card-title-link"
          :to="localePath(post.path)"
        >
          <span class="min-w-0 truncate">{{ post.title }}</span>
          <UIcon name="lucide:arrow-right" class="post-card-title-arrow" />
        </NuxtLink>
      </h2>
      <p v-if="post.description" class="post-card-description mb-5 text-lg text-[var(--color-text-main)] opacity-80">
        {{ post.description }}
      </p>
      <PostTagList v-if="post.tags?.length" class="mt-auto" :tags="post.tags" />
    </div>
    <NuxtLink
      v-if="post.cover"
      class="post-card-cover group relative order-first block h-56 overflow-hidden rounded-xl bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] transition hover:opacity-100 md:order-none md:h-full"
      :to="localePath(post.path)"
      :aria-label="post.title"
    >
      <img
        class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        :src="post.cover"
        :alt="post.title ?? ''"
        loading="lazy"
      />
      <span class="absolute inset-0 bg-black/32 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true"></span>
      <span class="absolute inset-0 grid scale-90 place-items-center text-white opacity-0 drop-shadow-[0_0.35rem_0.8rem_rgb(0_0_0/0.35)] transition duration-300 group-hover:scale-100 group-hover:opacity-100" aria-hidden="true">
        <UIcon name="lucide:arrow-right" class="size-12" />
      </span>
    </NuxtLink>
    <NuxtLink
      v-else
      class="grid h-14 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-4xl font-bold text-[var(--color-accent)] transition hover:bg-[color-mix(in_srgb,var(--color-accent)_22%,transparent)] hover:opacity-100 md:h-auto md:min-h-full md:text-5xl"
      :to="localePath(post.path)"
      :aria-label="post.title"
    >
      ›
    </NuxtLink>
  </article>
</template>

<style scoped>
.post-card-description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

@media (min-width: 768px) {
  .post-card-meta {
    flex-wrap: nowrap;
    overflow: visible;
    white-space: nowrap;
  }
}

.post-card-title-link {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
  max-width: 100%;
  color: var(--color-text-main);
  transition:
    color 0.2s ease,
    opacity 0.2s ease;
}

.post-card-title-link:hover {
  color: var(--color-accent);
  opacity: 1;
}

.post-card-title-arrow {
  width: 0.82em;
  height: 0.82em;
  flex: none;
  opacity: 0;
  transform: translateX(-0.25rem);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.post-card-title-link:hover .post-card-title-arrow {
  opacity: 1;
  transform: translateX(0);
}

.post-card-category {
  display: inline-flex;
  align-items: center;
  flex: none;
  gap: 0.375rem;
  border-radius: 999px;
  padding: 0.18rem 0.48rem;
  margin-inline-start: -0.48rem;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.post-card-category:hover {
  background-color: color-mix(in srgb, var(--color-accent) 18%, transparent);
  color: var(--color-accent);
}

.post-card-category :deep(.content-category-segment) {
  color: inherit;
  padding: 0;
  background: transparent;
  opacity: 1;
  transition: none;
}

.post-card-category :deep(.content-category-segment:hover) {
  color: inherit;
  background: transparent;
  opacity: 1;
}
</style>
