<script setup lang="ts">
defineProps<{
  hidden?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const { locales, t } = useI18n()
const localePath = useLocalePath()
const isPostsDesktopMenuOpen = ref(false)
const isPostsDesktopMenuPinned = ref(false)

const availableLocales = computed<Array<{ code: string }>>(() =>
  locales.value.map(item => typeof item === 'string'
    ? { code: item }
    : { code: String(item.code) },
  ),
)
const knownLocaleCodes = computed(() => availableLocales.value.map(item => item.code))
const normalizedRoutePath = computed(() => {
  const segments = route.path.split('/').filter(Boolean)

  if (segments[0] && knownLocaleCodes.value.includes(segments[0])) {
    segments.shift()
  }

  return `/${segments.join('/')}`
})
const postSectionPaths = new Set(['/posts', '/archive', '/categories', '/tags'])
const nonPostContentPaths = new Set(['/about', '/friends', '/bookmarks', '/xiaohongshu'])
const isPostsActive = computed(() => {
  const path = normalizedRoutePath.value

  return postSectionPaths.has(path) || (path !== '/' && !nonPostContentPaths.has(path))
})

const closePostsMenu = () => {
  isPostsDesktopMenuOpen.value = false
  isPostsDesktopMenuPinned.value = false
  emit('close')
}

const closeMenus = () => {
  isPostsDesktopMenuOpen.value = false
  isPostsDesktopMenuPinned.value = false
}

defineExpose({ closeMenus })
</script>

<template>
  <div class="nav-primary nav-search-left flex min-w-0 items-center justify-center gap-6 max-lg:hidden" :class="{ 'nav-search-left-hidden': hidden }">
    <NuxtLink class="nav-link inline-flex items-center gap-[0.35rem] text-[1.1rem] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:opacity-100" :to="localePath('/')">
      <UIcon name="lucide:house" class="nav-link-icon" />
      <span>{{ t('nav.home') }}</span>
    </NuxtLink>
    <div
      class="relative"
      @mouseenter="isPostsDesktopMenuOpen = true"
      @mouseleave="isPostsDesktopMenuOpen = isPostsDesktopMenuPinned"
    >
      <button
        class="nav-link inline-flex items-center gap-[0.35rem] text-[1.1rem] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:opacity-100"
        :class="{ 'nav-link-active': isPostsActive }"
        type="button"
        :aria-label="t('posts.menu')"
        :aria-expanded="isPostsDesktopMenuOpen"
        @click="isPostsDesktopMenuPinned = !isPostsDesktopMenuPinned; isPostsDesktopMenuOpen = isPostsDesktopMenuPinned"
      >
        <UIcon name="lucide:file-text" class="nav-link-icon" />
        <span>{{ t('nav.posts') }}</span>
        <UIcon name="lucide:chevron-down" class="nav-link-chevron" :class="{ 'nav-link-chevron-open': isPostsDesktopMenuOpen }" />
      </button>
      <Transition name="posts-dropdown-pop">
        <div v-if="isPostsDesktopMenuOpen" class="nav-posts-dropdown absolute top-[calc(100%+0.55rem)] left-0 grid min-w-44 gap-[0.15rem] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-[0.35rem] shadow-[0_1rem_2rem_var(--color-shadow)]">
          <NuxtLink class="nav-posts-option block rounded-lg px-[0.6rem] py-[0.45rem] whitespace-nowrap" :to="localePath('/archive')" @click="closePostsMenu">
            {{ t('posts.archive') }}
          </NuxtLink>
          <NuxtLink class="nav-posts-option block rounded-lg px-[0.6rem] py-[0.45rem] whitespace-nowrap" :to="localePath('/categories')" @click="closePostsMenu">
            {{ t('home.categories') }}
          </NuxtLink>
          <NuxtLink class="nav-posts-option block rounded-lg px-[0.6rem] py-[0.45rem] whitespace-nowrap" :to="localePath('/tags')" @click="closePostsMenu">
            {{ t('home.tags') }}
          </NuxtLink>
        </div>
      </Transition>
    </div>
    <NuxtLink class="nav-link inline-flex items-center gap-[0.35rem] text-[1.1rem] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:opacity-100" :to="localePath('/about')">
      <UIcon name="lucide:user" class="nav-link-icon" />
      <span>{{ t('nav.about') }}</span>
    </NuxtLink>
    <NuxtLink class="nav-link inline-flex items-center gap-[0.35rem] text-[1.1rem] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:opacity-100" :to="localePath('/friends')">
      <UIcon name="lucide:link" class="nav-link-icon" />
      <span>{{ t('nav.friends') }}</span>
    </NuxtLink>
    <NuxtLink class="nav-link inline-flex items-center gap-[0.35rem] text-[1.1rem] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:opacity-100" :to="localePath('/bookmarks')">
      <UIcon name="lucide:bookmark" class="nav-link-icon" />
      <span>{{ t('nav.bookmarks') }}</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.nav-search-left {
  transition:
    opacity 0.46s ease,
    transform 0.54s cubic-bezier(0.16, 1, 0.3, 1),
    visibility 0.46s ease;
}

.nav-search-left-hidden {
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-8rem);
}

.nav-link-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex: 0 0 auto;
}

.nav-link {
  position: relative;
  padding-block: 0.2rem;
}

.nav-link::after {
  position: absolute;
  right: 0.15rem;
  bottom: -0.28rem;
  left: 0.15rem;
  height: 0.14rem;
  border-radius: 999px;
  background-color: var(--color-accent);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.24s ease;
  content: '';
}

.nav-link:hover::after,
.nav-link.router-link-exact-active::after,
.nav-link-active::after {
  transform: scaleX(1);
}

.nav-link.router-link-exact-active:hover::after,
.nav-link-active:hover::after {
  animation: nav-active-underline-bounce 0.34s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link.router-link-exact-active,
.nav-link-active {
  color: var(--color-text-main);
  opacity: 1;
}

.nav-link-chevron {
  width: 0.9rem;
  height: 0.9rem;
  flex: 0 0 auto;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link-chevron-open {
  transform: rotate(180deg);
}

.nav-posts-option {
  color: var(--color-text-muted);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.nav-posts-option:hover {
  background-color: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
  color: var(--color-text-main);
  opacity: 1;
}

.posts-dropdown-pop-enter-active,
.posts-dropdown-pop-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.posts-dropdown-pop-enter-from,
.posts-dropdown-pop-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}

@keyframes nav-active-underline-bounce {
  0% {
    transform: scaleX(1);
  }

  45% {
    transform: scaleX(1.22);
  }

  100% {
    transform: scaleX(1);
  }
}
</style>
