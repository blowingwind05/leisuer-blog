<script setup lang="ts">
const activeSidebarPanel = defineModel<'toc' | 'site'>('activeSidebarPanel', {
  default: 'toc',
})

const { t } = useI18n()
const hasAnimated = ref(false)

const switchPanel = (panel: 'toc' | 'site') => {
  if (activeSidebarPanel.value === panel) return

  hasAnimated.value = false
  activeSidebarPanel.value = panel
  requestAnimationFrame(() => {
    hasAnimated.value = true
  })

  window.setTimeout(() => {
    hasAnimated.value = false
  }, 420)
}

const indicatorStyle = computed(() => ({
  transform: activeSidebarPanel.value === 'site'
    ? 'translate3d(0, 0, 0)'
    : 'translate3d(calc(100% + 0.375rem), 0, 0)',
}))
</script>

<template>
  <div
    class="article-sidebar-tabs rounded-[1.25rem] bg-[var(--color-surface)] p-1.5"
    :class="{ 'article-sidebar-tabs-animated': hasAnimated }"
    role="tablist"
    :aria-label="t('article.sidebarTabs')"
  >
    <span class="article-sidebar-tab-blob" :style="indicatorStyle" aria-hidden="true"></span>
    <button
      class="article-sidebar-tab"
      :class="{ 'article-sidebar-tab-active': activeSidebarPanel === 'site' }"
      type="button"
      role="tab"
      :aria-selected="activeSidebarPanel === 'site'"
      @click="switchPanel('site')"
    >
      <UIcon name="lucide:user-round" class="size-4" />
      <span>{{ t('article.sitePanel') }}</span>
    </button>
    <button
      class="article-sidebar-tab"
      :class="{ 'article-sidebar-tab-active': activeSidebarPanel === 'toc' }"
      type="button"
      role="tab"
      :aria-selected="activeSidebarPanel === 'toc'"
      @click="switchPanel('toc')"
    >
      <UIcon name="lucide:list-tree" class="size-4" />
      <span>{{ t('article.toc') }}</span>
    </button>
  </div>
</template>

<style scoped>
.article-sidebar-tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.375rem;
  min-height: 3rem;
  overflow: hidden;
}

.article-sidebar-tab-blob {
  position: absolute;
  top: 0.375rem;
  bottom: 0.375rem;
  left: 0.375rem;
  z-index: 0;
  width: calc((100% - 1.125rem) / 2);
  border-radius: 0.95rem;
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
  transform: translate3d(0, 0, 0);
  transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.article-sidebar-tabs-animated.article-sidebar-tabs-site .article-sidebar-tab-blob {
  animation: article-sidebar-tab-blob-site 0.42s cubic-bezier(0.18, 1.35, 0.28, 1);
}

.article-sidebar-tabs-animated.article-sidebar-tabs-toc .article-sidebar-tab-blob {
  animation: article-sidebar-tab-blob-toc 0.42s cubic-bezier(0.18, 1.35, 0.28, 1);
}

.article-sidebar-tab {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-width: 0;
  border-radius: 0.95rem;
  padding: 0.45rem 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.2s ease, opacity 0.2s ease;
}

.article-sidebar-tab span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-sidebar-tab:hover {
  background: transparent;
  color: var(--color-text-main);
  opacity: 1;
}

.article-sidebar-tab-active,
.article-sidebar-tab-active:hover {
  background: transparent;
  color: var(--color-accent);
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .article-sidebar-tab-blob {
    transition: none;
  }
}

@keyframes article-sidebar-tab-blob-site {
  0% {
    transform: translate3d(calc(100% + 0.375rem), 0, 0) scaleX(1);
  }

  45% {
    transform: translate3d(-0.22rem, 0, 0) scaleX(1.16);
  }

  70% {
    transform: translate3d(0.08rem, 0, 0) scaleX(0.97);
  }

  100% {
    transform: translate3d(0, 0, 0) scaleX(1);
  }
}

@keyframes article-sidebar-tab-blob-toc {
  0% {
    transform: translate3d(0, 0, 0) scaleX(1);
  }

  45% {
    transform: translate3d(calc(100% + 0.56rem), 0, 0) scaleX(1.16);
  }

  70% {
    transform: translate3d(calc(100% + 0.29rem), 0, 0) scaleX(0.97);
  }

  100% {
    transform: translate3d(calc(100% + 0.375rem), 0, 0) scaleX(1);
  }
}
</style>
