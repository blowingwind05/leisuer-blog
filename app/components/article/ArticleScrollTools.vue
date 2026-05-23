<script setup lang="ts">
const { t } = useI18n()

const scrollBehavior = () => (
  import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
)

const scrollToTop = () => {
  if (!import.meta.client) return

  window.scrollTo({
    top: 0,
    behavior: scrollBehavior(),
  })
}

const scrollToBottom = () => {
  if (!import.meta.client) return

  window.scrollTo({
    top: document.documentElement.scrollHeight - window.innerHeight,
    behavior: scrollBehavior(),
  })
}
</script>

<template>
  <div class="article-scroll-tools" :aria-label="t('article.scrollTools')">
    <button
      class="article-scroll-tool"
      type="button"
      :aria-label="t('article.backToTop')"
      @click="scrollToTop"
    >
      <UIcon name="lucide:chevron-up" class="size-5" />
    </button>
    <button
      class="article-scroll-tool"
      type="button"
      :aria-label="t('article.goToBottom')"
      @click="scrollToBottom"
    >
      <UIcon name="lucide:chevron-down" class="size-5" />
    </button>
  </div>
</template>

<style scoped>
.article-scroll-tools {
  position: fixed;
  right: max(0.75rem, env(safe-area-inset-right, 0px));
  bottom: max(1.5rem, env(safe-area-inset-bottom, 0px));
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.article-scroll-tool {
  display: grid;
  width: 2.55rem;
  height: 2.55rem;
  place-items: center;
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-accent);
  box-shadow: 0 0.75rem 1.5rem color-mix(in srgb, var(--color-shadow) 70%, transparent);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
}

.article-scroll-tool:hover {
  background: color-mix(in srgb, var(--color-accent) 14%, var(--color-surface));
  color: var(--color-accent);
  opacity: 1;
  transform: translateY(-0.08rem);
}

@media (min-width: 1024px) {
  .article-scroll-tools {
    right: max(1rem, calc(max(var(--site-gutter), (100vw - var(--site-content-width)) / 2) - 3.5rem));
    bottom: clamp(4rem, 10vh, 7rem);
  }

  .article-scroll-tool {
    width: 2.75rem;
    height: 2.75rem;
  }
}
</style>
