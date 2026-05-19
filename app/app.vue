<script setup lang="ts">
const route = useRoute()
const { locale, locales, t } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const colorMode = useColorMode()
const isLocaleMenuOpen = ref(false)
const isNavMenuOpen = ref(false)
const languageCodeMap: Record<string, string> = {
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  en: 'en-US',
  ja: 'ja-JP',
}

const availableLocales = computed<Array<{ code: string, name: string }>>(() =>
  locales.value.map(item => typeof item === 'string'
    ? { code: item, name: item }
    : { code: String(item.code), name: String(item.name ?? item.code) },
  ),
)

const currentLocaleName = computed(() =>
  availableLocales.value.find(item => item.code === locale.value)?.name ?? locale.value,
)

const pageKey = computed(() => route.path)
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

useHead(() => ({
  htmlAttrs: {
    class: 'vertical-scrollbar',
    lang: languageCodeMap[locale.value] ?? locale.value,
  },
  link: [
    { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' },
  ],
}))

const imageRatio = ref(1)
const pointerX = ref(0)
const pointerY = ref(0)

const updateBackgroundOffset = () => {
  const containerWidth = window.innerWidth
  const containerHeight = Math.max(window.innerHeight - 64, window.innerWidth * 0.54)
  const renderedHeight = containerHeight * 1.02
  const renderedWidth = renderedHeight * imageRatio.value
  const overflowX = Math.max(0, renderedWidth - containerWidth)
  const overflowY = Math.max(0, renderedHeight - containerHeight)

  document.documentElement.style.setProperty('--bg-offset-x', `${pointerX.value * overflowY}px`)
  document.documentElement.style.setProperty('--bg-offset-y', `${pointerY.value * overflowY}px`)
}

const handlePointerMove = (event: PointerEvent) => {
  pointerX.value = event.clientX / window.innerWidth - 0.5
  pointerY.value = event.clientY / window.innerHeight - 0.5

  updateBackgroundOffset()
}

onMounted(() => {
  const backgroundImage = new Image()

  backgroundImage.onload = () => {
    imageRatio.value = backgroundImage.naturalWidth / backgroundImage.naturalHeight
    updateBackgroundOffset()
  }

  backgroundImage.src = '/img/background.png'

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('resize', updateBackgroundOffset)
})

onUnmounted(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('resize', updateBackgroundOffset)
})

watch(
  () => route.fullPath,
  async () => {
    isLocaleMenuOpen.value = false
    isNavMenuOpen.value = false
    await nextTick()

    if (route.hash === '#about') {
      document.querySelector(route.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    if (route.hash) {
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  },
)
</script>

<template>
  <NuxtRouteAnnouncer />
  <header class="fixed inset-x-0 top-0 z-[2] flex h-16 items-center bg-[var(--color-nav-bg)] transition-colors duration-300">
    <div class="mx-auto grid h-full w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-[auto_minmax(0,1fr)] items-stretch gap-x-6 md:gap-x-3">
      <div class="logo flex h-full self-stretch">
        <NuxtLink class="inline-flex h-full self-stretch items-center gap-[0.55rem] text-xl leading-none font-extrabold tracking-[-0.05em] text-[var(--color-text-main)]" :to="localePath({ path: '/', hash: '#about' })">
          <img class="block size-8 shrink-0 rounded-lg object-cover" src="/img/avatar.png" alt="" />
          <span class="max-sm:hidden">Leisuer.</span>
        </NuxtLink>
      </div>
      <nav class="grid h-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-6 max-lg:grid-cols-[auto]" :aria-label="t('nav.home')">
        <div class="nav-primary flex min-w-0 items-center justify-center gap-6 max-lg:hidden">
          <NuxtLink class="nav-link inline-flex items-center gap-[0.35rem] text-[1.1rem] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:opacity-100" :to="localePath('/')">
            <UIcon name="lucide:house" class="nav-link-icon" />
            <span>{{ t('nav.home') }}</span>
          </NuxtLink>
          <NuxtLink class="nav-link inline-flex items-center gap-[0.35rem] text-[1.1rem] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:opacity-100" :to="localePath('/posts')">
            <UIcon name="lucide:file-text" class="nav-link-icon" />
            <span>{{ t('nav.posts') }}</span>
          </NuxtLink>
          <NuxtLink
            class="nav-link about-nav-link inline-flex items-center gap-[0.35rem] text-[1.1rem] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:opacity-100"
            :to="localePath({ path: '/', hash: '#about' })"
            active-class=""
            exact-active-class=""
          >
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
        <div class="flex items-center justify-end gap-6 md:gap-[0.65rem]">
          <label class="nav-search inline-flex w-[7.25rem] items-center gap-[0.45rem] rounded-[0.65rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-[0.65rem] py-[0.3rem] text-[var(--color-text-muted)] transition-[width,border-color,box-shadow,background-color] duration-200 ease-out focus-within:w-36 focus-within:border-[#53a3f1] focus-within:shadow-[0_0_0_3px_rgb(83_163_241/0.12)] sm:w-36 sm:focus-within:w-44 md:w-48 md:focus-within:w-60">
            <UIcon name="lucide:search" class="size-4 shrink-0" />
            <input class="min-w-0 w-full border-0 bg-transparent text-[0.95rem] text-[var(--color-text-main)] outline-0 placeholder:text-[var(--color-text-muted)] placeholder:opacity-70" type="search" :placeholder="t('search.placeholder')" />
          </label>
          <button
            class="grid size-9 cursor-pointer place-items-center border-0 bg-transparent text-[var(--color-text-muted)] transition-[color,transform] duration-200 hover:text-[var(--color-text-main)] hover:opacity-100"
            type="button"
            :aria-label="colorModeLabel"
            :title="colorModeLabel"
            @click="toggleColorMode"
          >
            <UIcon :name="colorModeIcon" class="size-[1.1rem]" />
          </button>
          <div class="relative">
            <button
              class="locale-trigger inline-flex cursor-pointer items-center gap-[0.35rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-[0.55rem] py-1 font-[inherit] text-[1.1rem] leading-[1.4] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:opacity-100 max-md:border-transparent max-md:bg-transparent max-md:p-0 max-md:shadow-none"
              type="button"
              :aria-label="t('language.label')"
              :aria-expanded="isLocaleMenuOpen"
              @click="isLocaleMenuOpen = !isLocaleMenuOpen; isNavMenuOpen = false"
            >
              <UIcon name="lucide:languages" class="nav-link-icon" />
              <span class="locale-name max-md:hidden">{{ currentLocaleName }}</span>
              <UIcon
                name="lucide:chevron-up"
                class="locale-chevron"
                :class="{ 'locale-chevron-open': isLocaleMenuOpen }"
              />
            </button>
            <div v-if="isLocaleMenuOpen" class="locale-dropdown absolute top-[calc(100%+0.55rem)] right-0 grid min-w-32 gap-[0.15rem] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-[0.35rem] shadow-[0_1rem_2rem_var(--color-shadow)]">
              <NuxtLink
                v-for="item in availableLocales"
                :key="item.code"
                class="locale-option block rounded-lg px-[0.6rem] py-[0.45rem] whitespace-nowrap"
                :class="{ 'locale-option-active': item.code === locale }"
                :to="switchLocalePath(item.code)"
                @click="isLocaleMenuOpen = false"
              >
                {{ item.name }}
              </NuxtLink>
            </div>
          </div>
          <div class="relative hidden max-lg:block">
            <button
              class="mobile-menu-trigger grid size-[2.35rem] cursor-pointer place-items-center border-0 bg-transparent text-[var(--color-text-muted)] transition-[color,transform] duration-200 hover:text-[var(--color-text-main)]"
              :class="{ 'mobile-menu-trigger-open': isNavMenuOpen }"
              type="button"
              :aria-label="t('nav.menu')"
              :aria-expanded="isNavMenuOpen"
              @click="isNavMenuOpen = !isNavMenuOpen; isLocaleMenuOpen = false"
            >
              <UIcon :name="isNavMenuOpen ? 'lucide:x' : 'lucide:menu'" class="size-[1.2rem]" />
            </button>
            <Transition name="mobile-menu-slide">
              <div v-if="isNavMenuOpen" class="fixed inset-x-0 top-16 bottom-0 z-[1]">
                <button class="absolute inset-0 cursor-pointer border-0 bg-[var(--color-overlay)]" type="button" :aria-label="t('nav.closeMenu')" @click="isNavMenuOpen = false"></button>
                <aside class="mobile-menu-drawer absolute top-0 right-0 bottom-0 w-[min(100%,32rem)] overflow-y-auto bg-[var(--color-surface-elevated)] px-6 py-[clamp(1.5rem,6vw,3rem)] shadow-[-1rem_0_2rem_var(--color-shadow)]">
                  <div class="flex w-full flex-col gap-8">
                    <section class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 border-b border-[var(--color-border)] pb-6">
                      <img class="size-18 rounded-2xl object-cover" src="/img/avatar.png" alt="" />
                      <div>
                        <h2 class="m-0 mb-1.5 text-[1.6rem] leading-none text-[var(--color-text-main)]">Leisuer</h2>
                        <p class="m-0 max-w-none leading-relaxed text-[var(--color-text-muted)]">{{ t('home.bio') }}</p>
                      </div>
                    </section>
                    <div class="grid gap-2">
                      <NuxtLink class="mobile-menu-option inline-flex items-center gap-[0.8rem] py-[0.85rem] text-[1.35rem] font-bold whitespace-nowrap text-[var(--color-text-main)]" :to="localePath('/')" @click="isNavMenuOpen = false">
                        <UIcon name="lucide:house" class="size-5 shrink-0" />
                        <span>{{ t('nav.home') }}</span>
                      </NuxtLink>
                      <NuxtLink class="mobile-menu-option inline-flex items-center gap-[0.8rem] py-[0.85rem] text-[1.35rem] font-bold whitespace-nowrap text-[var(--color-text-main)]" :to="localePath('/posts')" @click="isNavMenuOpen = false">
                        <UIcon name="lucide:file-text" class="size-5 shrink-0" />
                        <span>{{ t('nav.posts') }}</span>
                      </NuxtLink>
                      <NuxtLink
                        class="mobile-menu-option about-nav-link inline-flex items-center gap-[0.8rem] py-[0.85rem] text-[1.35rem] font-bold whitespace-nowrap text-[var(--color-text-main)]"
                        :to="localePath({ path: '/', hash: '#about' })"
                        active-class=""
                        exact-active-class=""
                        @click="isNavMenuOpen = false"
                      >
                        <UIcon name="lucide:user" class="size-5 shrink-0" />
                        <span>{{ t('nav.about') }}</span>
                      </NuxtLink>
                      <NuxtLink class="mobile-menu-option inline-flex items-center gap-[0.8rem] py-[0.85rem] text-[1.35rem] font-bold whitespace-nowrap text-[var(--color-text-main)]" :to="localePath('/friends')" @click="isNavMenuOpen = false">
                        <UIcon name="lucide:link" class="size-5 shrink-0" />
                        <span>{{ t('nav.friends') }}</span>
                      </NuxtLink>
                      <NuxtLink class="mobile-menu-option inline-flex items-center gap-[0.8rem] py-[0.85rem] text-[1.35rem] font-bold whitespace-nowrap text-[var(--color-text-main)]" :to="localePath('/bookmarks')" @click="isNavMenuOpen = false">
                        <UIcon name="lucide:bookmark" class="size-5 shrink-0" />
                        <span>{{ t('nav.bookmarks') }}</span>
                      </NuxtLink>
                    </div>
                  </div>
                </aside>
              </div>
            </Transition>
          </div>
        </div>
      </nav>
    </div>
  </header>

  <main class="relative isolate flex-1 overflow-x-hidden pt-16 pb-20">
    <div class="page-background pointer-events-none fixed inset-x-0 top-16 -z-[1] h-[max(calc(100vh-4rem),54vw)] bg-[url('/img/background.png')] bg-[length:auto_104%] bg-[position:calc(50%+var(--bg-offset-x))_calc(50%+var(--bg-offset-y))] bg-no-repeat"></div>
    <NuxtPage :key="pageKey" />
  </main>
</template>

<style scoped>
.nav-link-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex: 0 0 auto;
}

.nav-link.router-link-exact-active {
  color: var(--color-text-main);
  opacity: 1;
}

.nav-link.about-nav-link.router-link-active,
.nav-link.about-nav-link.router-link-exact-active {
  color: var(--color-text-muted);
  opacity: 1;
}

.locale-chevron {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center;
}

.locale-chevron-open {
  transform: rotate(180deg);
}

.locale-option-active {
  color: var(--color-text-main);
  background-color: color-mix(in srgb, var(--color-accent) 12%, transparent);
  opacity: 1;
}

.mobile-menu-trigger-open {
  color: var(--color-text-main);
  transform: rotate(90deg);
}

.mobile-menu-option.router-link-exact-active {
  color: var(--color-accent);
  background-color: transparent;
  opacity: 1;
}

.mobile-menu-option.about-nav-link.router-link-active,
.mobile-menu-option.about-nav-link.router-link-exact-active {
  color: var(--color-text-main);
}

.mobile-menu-slide-enter-active,
.mobile-menu-slide-leave-active {
  transition:
    opacity 0.28s ease;
}

.mobile-menu-slide-enter-active .mobile-menu-drawer,
.mobile-menu-slide-leave-active .mobile-menu-drawer {
  transition: transform 0.34s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-menu-slide-enter-from,
.mobile-menu-slide-leave-to {
  opacity: 0;
}

.mobile-menu-slide-enter-from .mobile-menu-drawer,
.mobile-menu-slide-leave-to .mobile-menu-drawer {
  transform: translateX(100%);
}

.page-background {
  background-position: calc(50% + var(--bg-offset-x)) calc(50% + var(--bg-offset-y));
  filter: brightness(1);
  transition: filter 0.3s ease;
}

.dark .page-background {
  filter: brightness(0.58);
}
</style>
