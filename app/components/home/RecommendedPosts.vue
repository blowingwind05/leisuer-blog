<script setup lang="ts">
defineProps<{
  posts: {
    path: string
    title?: string
    description?: string
    category?: string | string[]
    cover?: string
  }[]
  reveal?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { getCategoryLabel } = useCategoryLabel()
const categoryPath = (category: unknown) => getCategoryPath(category)
const categoryLabel = (category: unknown) => {
  const leafCategory = categoryPath(category).at(-1)

  return leafCategory ? getCategoryLabel(leafCategory) : ''
}
const categoryLink = (category: unknown) => {
  const path = categoryPath(category)

  return localePath(`/categories/${path.map(item => encodeURIComponent(item)).join('/')}`)
}
</script>

<template>
  <section class="flex flex-col gap-4" :class="{ 'reveal-card': reveal }">
    <div class="recommended-posts-heading">
      <span></span>
      <strong>{{ t('home.randomPosts') }}</strong>
      <span></span>
    </div>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <article
        v-for="post in posts"
        :key="post.path"
        class="recommended-post-card relative rounded-[1.25rem] bg-[var(--color-surface)] p-3"
      >
        <NuxtLink v-if="categoryLabel(post.category)" class="recommended-post-category" :to="categoryLink(post.category)">
          {{ categoryLabel(post.category) }}
        </NuxtLink>
        <NuxtLink
          class="block hover:opacity-100"
          :to="localePath(post.path)"
          :aria-label="post.title"
        >
          <div class="recommended-post-cover">
            <img
              v-if="post.cover"
              class="recommended-post-cover-image"
              :src="post.cover"
              :alt="post.title ?? ''"
              loading="lazy"
            />
            <UIcon v-else name="lucide:file-text" class="size-12 text-[var(--color-accent)] opacity-75" />
          </div>
          <div class="flex flex-col px-1 pt-3 pb-1">
            <h2 class="recommended-post-title">
              <span>{{ post.title }}</span>
              <UIcon name="lucide:arrow-right" class="recommended-post-arrow" />
            </h2>
            <p v-if="post.description" class="recommended-post-description">
              {{ post.description }}
            </p>
          </div>
        </NuxtLink>
      </article>
    </div>
  </section>
</template>

<style scoped>
.recommended-posts-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 1rem;
  color: #ffffff;
}

.recommended-posts-heading span {
  height: 1px;
  background: currentColor;
  opacity: 0.78;
}

.recommended-posts-heading strong {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0;
}

.recommended-post-category {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  max-width: min(70%, 14rem);
  overflow: hidden;
  border-top-left-radius: 1.25rem;
  border-bottom-right-radius: 1.25rem;
  background: var(--color-accent);
  color: #ffffff;
  padding: 0.62rem 1.08rem;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  transform: translate(-0.18rem, -0.18rem) scale(1.04);
  white-space: nowrap;
}

.recommended-post-category:hover {
  box-shadow: 0 0.55rem 1.2rem color-mix(in srgb, var(--color-accent) 28%, transparent);
  transform: translate(-0.36rem, -0.36rem) scale(1.1);
}

.recommended-post-cover {
  display: grid;
  height: 9.8rem;
  place-items: center;
  overflow: hidden;
  border-radius: 0.95rem 0.95rem 0 0;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
}

.recommended-post-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  color: var(--color-text-main);
  font-size: 1.12rem;
  font-weight: 800;
  line-height: 1.25;
  transition: color 0.2s ease;
}

.recommended-post-title::before {
  display: inline-block;
  width: 0.22rem;
  height: 1rem;
  flex: none;
  border-radius: 999px;
  background: var(--color-accent);
  content: '';
}

.recommended-post-title span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommended-post-arrow {
  width: 0.95em;
  height: 0.95em;
  flex: none;
  opacity: 0;
  transform: translateX(-0.2rem);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.recommended-post-card:hover:not(:has(.recommended-post-category:hover)) .recommended-post-cover-image {
  transform: scale(1.08);
}

.recommended-post-card:hover:not(:has(.recommended-post-category:hover)) .recommended-post-title {
  color: var(--color-accent);
}

.recommended-post-card:hover:not(:has(.recommended-post-category:hover)) .recommended-post-arrow {
  opacity: 1;
  transform: translateX(0);
}

.recommended-post-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease-out;
}

.recommended-post-description {
  display: -webkit-box;
  overflow: hidden;
  color: var(--color-text-main);
  font-size: 0.98rem;
  line-height: 1.48;
  margin: 0;
  min-height: calc(0.98rem * 1.48 * 2);
  opacity: 0.74;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
