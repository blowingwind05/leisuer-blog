<script setup lang="ts">
const route = useRoute()
const { locale, locales, t } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const colorMode = useColorMode()
const isLocaleMenuOpen = ref(false)
const isNavMenuOpen = ref(false)

const availableLocales = computed<Array<{ code: string, name: string }>>(() =>
  locales.value.map(item => typeof item === 'string'
    ? { code: item, name: item }
    : { code: String(item.code), name: String(item.name ?? item.code) },
  ),
)

const currentLocaleName = computed(() =>
  availableLocales.value.find(item => item.code === locale.value)?.name ?? locale.value,
)
const { data: menuTaxonomies } = await useAsyncData('site-menu-taxonomies-' + locale.value, async () => {
  const docs = await queryCollection('content').all()

  return buildContentTaxonomies(docs)
})
const menuCategories = computed(() => menuTaxonomies.value?.categories ?? [])
const menuTags = computed(() => menuTaxonomies.value?.tags ?? [])
const isPostsDesktopMenuOpen = ref(false)
const isPostsDesktopMenuPinned = ref(false)
const isPostsMobileMenuOpen = ref(false)
const isDark = computed(() => colorMode.value === 'dark')
const colorModeIcon = computed(() => isDark.value ? 'lucide:sun' : 'lucide:moon')
const colorModeLabel = computed(() => isDark.value ? '切换到明亮模式' : '切换到黑暗模式')
const knownLocaleCodes = computed(() => availableLocales.value.map(item => item.code))
const normalizedRoutePath = computed(() => {
  const segments = route.path.split('/').filter(Boolean)

  if (segments[0] && knownLocaleCodes.value.includes(segments[0])) {
    segments.shift()
  }

  return `/${segments.join('/')}`
})
const nonPostContentPaths = new Set(['/about', '/friends', '/bookmarks', '/xiaohongshu'])
const isPostsActive = computed(() => {
  const path = normalizedRoutePath.value

  return path === '/posts' || path === '/archive' || (path !== '/' && !nonPostContentPaths.has(path))
})

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
  isPostsDesktopMenuOpen.value = false
  isPostsDesktopMenuPinned.value = false
  isPostsMobileMenuOpen.value = false
}

defineExpose({ closeMenus })
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-[2] flex h-16 items-center bg-[var(--color-nav-bg)] transition-colors duration-300">
    <div class="mx-auto grid h-full w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-[auto_minmax(0,1fr)] items-stretch gap-x-3 sm:gap-x-6 md:gap-x-3">
      <div class="logo flex h-full self-stretch">
        <NuxtLink class="inline-flex h-full self-stretch items-center gap-[0.55rem] text-xl leading-none font-extrabold tracking-[-0.05em] text-[var(--color-text-main)]" :to="localePath({ path: '/', hash: '#about' })">
          <img class="block size-8 shrink-0 rounded-lg object-cover" src="/img/avatar.jpg" alt="" />
          <span class="max-sm:hidden">Leisuer.</span>
        </NuxtLink>
      </div>
      <nav class="grid h-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-6 max-lg:grid-cols-[auto]" :aria-label="t('nav.home')">
        <div class="nav-primary flex min-w-0 items-center justify-center gap-6 max-lg:hidden">
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
                <NuxtLink class="nav-posts-option block rounded-lg px-[0.6rem] py-[0.45rem] whitespace-nowrap" :to="localePath('/archive')" @click="closeMenus">
                  {{ t('posts.archive') }}
                </NuxtLink>
                <NuxtLink class="nav-posts-option block rounded-lg px-[0.6rem] py-[0.45rem] whitespace-nowrap" :to="localePath({ path: '/posts', query: { panel: 'categories' } })" @click="closeMenus">
                  {{ t('home.categories') }}
                </NuxtLink>
                <NuxtLink class="nav-posts-option block rounded-lg px-[0.6rem] py-[0.45rem] whitespace-nowrap" :to="localePath({ path: '/posts', query: { panel: 'tags' } })" @click="closeMenus">
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
        <div class="flex items-center justify-end gap-0.5 sm:gap-6 md:gap-[0.65rem]">
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
                name="lucide:chevron-down"
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
                    <section class="border-b border-[var(--color-border)] pb-6">
                      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
                        <img class="size-18 rounded-full object-cover" src="/img/avatar.jpg" alt="" />
                        <div>
                          <h2 class="m-0 mb-1.5 text-[1.6rem] leading-none text-[var(--color-text-main)]">Leisuer</h2>
                          <p class="m-0 max-w-none leading-relaxed text-[var(--color-text-muted)]">{{ t('home.bio') }}</p>
                        </div>
                      </div>

                      <div class="mt-5 flex items-center justify-center gap-4" :aria-label="t('home.socialLinks')">
                        <a class="mobile-social-link" href="https://github.com/blowingwind05" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                          <UIcon name="simple-icons:github" />
                        </a>
                        <a class="mobile-social-link" href="https://space.bilibili.com/104332491" aria-label="Bilibili" target="_blank" rel="noopener noreferrer">
                          <UIcon name="simple-icons:bilibili" />
                        </a>
                        <NuxtLink class="mobile-social-link" :to="localePath('/xiaohongshu')" aria-label="小红书" @click="isNavMenuOpen = false">
                          <UIcon name="simple-icons:xiaohongshu" />
                        </NuxtLink>
                        <a class="mobile-social-link" href="mailto:blowingwind05@mail.ustc.edu.cn" aria-label="Email">
                          <UIcon name="lucide:mail" />
                        </a>
                      </div>
                    </section>
                    <div class="mobile-posts-stats" aria-label="文章分类与标签统计">
                      <NuxtLink class="mobile-posts-stat" :to="localePath({ path: '/posts', query: { panel: 'categories' } })" @click="isNavMenuOpen = false">
                        <span class="mobile-posts-stat-label">{{ t('home.categories') }}</span>
                        <span class="mobile-posts-stat-count">{{ menuCategories.length }}</span>
                      </NuxtLink>
                      <NuxtLink class="mobile-posts-stat" :to="localePath({ path: '/posts', query: { panel: 'tags' } })" @click="isNavMenuOpen = false">
                        <span class="mobile-posts-stat-label">{{ t('home.tags') }}</span>
                        <span class="mobile-posts-stat-count">{{ menuTags.length }}</span>
                      </NuxtLink>
                    </div>
                    <div class="grid gap-2">
                      <NuxtLink class="mobile-menu-option inline-flex items-center gap-[0.8rem] py-[0.85rem] text-[1.35rem] font-bold whitespace-nowrap text-[var(--color-text-main)]" :to="localePath('/')" @click="isNavMenuOpen = false">
                        <UIcon name="lucide:house" class="size-5 shrink-0" />
                        <span>{{ t('nav.home') }}</span>
                      </NuxtLink>
                      <div class="grid gap-1">
                        <button
                          class="mobile-menu-option inline-flex items-center justify-between gap-[0.8rem] py-[0.85rem] text-[1.35rem] font-bold whitespace-nowrap text-[var(--color-text-main)]"
                          :class="{ 'mobile-menu-option-active': isPostsActive }"
                          type="button"
                          :aria-expanded="isPostsMobileMenuOpen"
                          @click="isPostsMobileMenuOpen = !isPostsMobileMenuOpen"
                        >
                          <span class="inline-flex items-center gap-[0.8rem]">
                            <UIcon name="lucide:file-text" class="size-5 shrink-0" />
                            <span>{{ t('nav.posts') }}</span>
                          </span>
                          <UIcon name="lucide:chevron-down" class="size-4 shrink-0 transition-transform duration-200" :class="{ 'rotate-180': isPostsMobileMenuOpen }" />
                        </button>
                        <Transition name="posts-mobile-pop">
                          <div v-if="isPostsMobileMenuOpen" class="grid gap-1 pl-8">
                            <NuxtLink class="mobile-menu-suboption inline-flex items-center gap-[0.65rem] py-[0.65rem] text-[1.05rem] font-semibold whitespace-nowrap text-[var(--color-text-muted)]" :class="{ 'mobile-menu-suboption-active': normalizedRoutePath === '/archive' }" :to="localePath('/archive')" @click="isNavMenuOpen = false; isPostsMobileMenuOpen = false">
                              <span>{{ t('posts.archive') }}</span>
                            </NuxtLink>
                            <NuxtLink class="mobile-menu-suboption inline-flex items-center gap-[0.65rem] py-[0.65rem] text-[1.05rem] font-semibold whitespace-nowrap text-[var(--color-text-muted)]" :class="{ 'mobile-menu-suboption-active': normalizedRoutePath === '/posts' && route.query.panel === 'categories' }" :to="localePath({ path: '/posts', query: { panel: 'categories' } })" @click="isNavMenuOpen = false; isPostsMobileMenuOpen = false">
                              <span>{{ t('home.categories') }}</span>
                            </NuxtLink>
                            <NuxtLink class="mobile-menu-suboption inline-flex items-center gap-[0.65rem] py-[0.65rem] text-[1.05rem] font-semibold whitespace-nowrap text-[var(--color-text-muted)]" :class="{ 'mobile-menu-suboption-active': normalizedRoutePath === '/posts' && route.query.panel === 'tags' }" :to="localePath({ path: '/posts', query: { panel: 'tags' } })" @click="isNavMenuOpen = false; isPostsMobileMenuOpen = false">
                              <span>{{ t('home.tags') }}</span>
                            </NuxtLink>
                          </div>
                        </Transition>
                      </div>
                      <NuxtLink class="mobile-menu-option inline-flex items-center gap-[0.8rem] py-[0.85rem] text-[1.35rem] font-bold whitespace-nowrap text-[var(--color-text-main)]" :to="localePath('/about')" @click="isNavMenuOpen = false">
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
</template>

<style scoped>
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

.nav-link-chevron {
  width: 0.9rem;
  height: 0.9rem;
  flex: 0 0 auto;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link-chevron-open {
  transform: rotate(180deg);
}

.locale-option-active {
  color: var(--color-text-main);
  background-color: color-mix(in srgb, var(--color-accent) 12%, transparent);
  opacity: 1;
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
.posts-dropdown-pop-leave-active,
.posts-mobile-pop-enter-active,
.posts-mobile-pop-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.posts-dropdown-pop-enter-from,
.posts-dropdown-pop-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}

.posts-mobile-pop-enter-from,
.posts-mobile-pop-leave-to {
  opacity: 0;
  transform: translateY(-0.15rem);
}

.mobile-social-link {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: 0.75rem;
  background-color: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.mobile-social-link:hover {
  background-color: color-mix(in srgb, var(--color-accent) 20%, transparent);
  opacity: 1;
  transform: translateY(-0.08rem);
}

.mobile-social-link svg,
.mobile-social-link span {
  width: 1.15rem;
  height: 1.15rem;
}

.mobile-menu-trigger-open {
  color: var(--color-text-main);
  transform: rotate(90deg);
}

.mobile-menu-option.router-link-exact-active,
.mobile-menu-option-active {
  color: var(--color-accent);
  background-color: color-mix(in srgb, var(--color-accent) 12%, transparent);
  opacity: 1;
}

.mobile-menu-option {
  border-radius: 0.9rem;
  padding-inline: 0.85rem;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.mobile-menu-option:hover {
  background-color: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
  opacity: 1;
}

.mobile-menu-option.router-link-exact-active:hover,
.mobile-menu-option-active:hover {
  background-color: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
}

.mobile-posts-stats {
  display: grid;
  margin-block: -0.75rem -0.85rem;
  padding-inline: 0.85rem;
}

.mobile-posts-stat {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  min-height: 4.35rem;
  color: var(--color-text-main);
  font-weight: 800;
  transition:
    color 0.2s ease,
    opacity 0.2s ease;
}

.mobile-posts-stat:hover {
  color: var(--color-text-main);
  opacity: 0.82;
}

.mobile-posts-stat + .mobile-posts-stat {
  border-top: 1px solid var(--color-border);
}

.mobile-posts-stat::before {
  display: block;
  width: 0.28rem;
  height: 1.65rem;
  border-radius: 999px;
  background-color: var(--color-accent);
  content: '';
}

.mobile-posts-stat-label {
  font-size: clamp(1.45rem, 7vw, 2rem);
  letter-spacing: 0;
}

.mobile-posts-stat-count {
  color: var(--color-text-muted);
  font-size: clamp(1.8rem, 8vw, 2.35rem);
  line-height: 1;
}

.mobile-menu-suboption {
  border-radius: 0.75rem;
  padding-inline: 0.75rem;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.mobile-menu-suboption:hover {
  background-color: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
  color: var(--color-text-main);
  opacity: 1;
}

.mobile-menu-suboption-active,
.mobile-menu-suboption-active:hover {
  background-color: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent);
  opacity: 1;
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

.tag-scroll-fade {
  -webkit-mask-image: linear-gradient(to right, transparent, #000 1rem, #000 calc(100% - 1rem), transparent);
  mask-image: linear-gradient(to right, transparent, #000 1rem, #000 calc(100% - 1rem), transparent);
  scrollbar-width: thin;
}
</style>
