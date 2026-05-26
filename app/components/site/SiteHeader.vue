<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const colorMode = useColorMode()
const navLinks = ref<{ closeMenus: () => void } | null>(null)
const isLocaleMenuOpen = ref(false)
const isNavMenuOpen = ref(false)
const isSearchOpen = ref(false)
const isDark = computed(() => colorMode.value === 'dark')
const colorModeIcon = computed(() => isDark.value ? 'lucide:sun' : 'lucide:moon')
const colorModeLabel = computed(() => isDark.value ? '切换到明亮模式' : '切换到黑暗模式')

const toggleColorMode = async () => {
  const nextMode = isDark.value ? 'light' : 'dark'

  if (!import.meta.client) {
    colorMode.preference = nextMode
    return
  }

  if (!document.startViewTransition) {
    colorMode.preference = nextMode
    return
  }

  const transition = document.startViewTransition(() => {
    colorMode.preference = nextMode
  })

  await transition.ready

  document.documentElement.animate(
    {
      clipPath: ['inset(0 100% 0 0)', 'inset(0 0 0 0)'],
    },
    {
      duration: 900,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      pseudoElement: '::view-transition-new(root)',
    },
  )
}

const closeMenus = () => {
  isLocaleMenuOpen.value = false
  isNavMenuOpen.value = false
  navLinks.value?.closeMenus()
}

const openSearch = () => {
  closeMenus()
  isSearchOpen.value = true
}

const closeSearch = () => {
  isSearchOpen.value = false
}

defineExpose({ closeMenus })
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-[2] flex h-16 items-center bg-[var(--color-nav-bg)] transition-colors duration-300">
    <div class="mx-auto grid h-full w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-[auto_minmax(0,1fr)] items-stretch gap-x-3 sm:gap-x-6 md:gap-x-3">
      <div class="logo nav-search-left flex h-full self-stretch" :class="{ 'nav-search-left-hidden': isSearchOpen }">
        <NuxtLink class="inline-flex h-full self-stretch items-center gap-[0.55rem] text-xl leading-none font-extrabold tracking-[-0.05em] text-[var(--color-text-main)]" :to="localePath({ path: '/', hash: '#about' })">
          <img class="block size-8 shrink-0 rounded-lg object-cover" src="/img/avatar.jpg" alt="" />
          <span class="max-sm:hidden">Leisuer.</span>
        </NuxtLink>
      </div>
      <nav class="relative grid h-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-6 max-lg:grid-cols-[auto]" :aria-label="t('nav.home')">
        <SiteNavLinks ref="navLinks" :hidden="isSearchOpen" @close="closeMenus" />
        <div class="nav-tools flex items-center justify-end gap-0.5 sm:gap-6 md:gap-[0.65rem]">
          <SearchSiteSearch :active="isSearchOpen" @activate="openSearch" @close="closeSearch" />
          <button
            class="nav-search-right grid size-9 cursor-pointer place-items-center border-0 bg-transparent text-[var(--color-text-muted)] transition-[color,transform] duration-200 hover:text-[var(--color-text-main)] hover:opacity-100"
            :class="{ 'nav-search-right-hidden': isSearchOpen }"
            type="button"
            :aria-label="colorModeLabel"
            :title="colorModeLabel"
            @click="toggleColorMode"
          >
            <UIcon :name="colorModeIcon" class="size-[1.1rem]" />
          </button>
          <SiteLocaleMenu
            v-model:open="isLocaleMenuOpen"
            :hidden="isSearchOpen"
            @toggle="isNavMenuOpen = false; isSearchOpen = false"
          />
          <SiteMobileMenu
            v-model:open="isNavMenuOpen"
            :hidden="isSearchOpen"
            @click="isLocaleMenuOpen = false; isSearchOpen = false"
          />
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav-search-left,
.nav-search-right {
  transition:
    opacity 0.46s ease,
    transform 0.54s cubic-bezier(0.16, 1, 0.3, 1),
    visibility 0.46s ease;
}

.nav-search-left-hidden,
.nav-search-right-hidden {
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
}

.nav-search-left-hidden {
  transform: translateX(-8rem);
}

.nav-search-right-hidden {
  transform: translateX(8rem);
}

.nav-tools {
  position: relative;
}
</style>
