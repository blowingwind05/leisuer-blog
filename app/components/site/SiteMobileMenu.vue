<script setup lang="ts">
const props = defineProps<{
  hidden?: boolean
}>()

const isOpen = defineModel<boolean>('open', {
  default: false,
})

const route = useRoute()
const { locale, locales, t } = useI18n()
const localePath = useLocalePath()
const activeMobileSidebarPanel = ref<'site' | 'toc'>('site')
const isPostsMobileMenuOpen = ref(false)

type TocLink = {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

const flattenTocLinks = (links: TocLink[] = []): TocLink[] => {
  return links.flatMap(link => [
    link,
    ...flattenTocLinks(link.children ?? []),
  ])
}

const expandCurrentTocBranch = (links: TocLink[] = [], activeId = ''): TocLink[] => {
  const activeTopLevelLink = links.find((link) => {
    return link.id === activeId || flattenTocLinks(link.children ?? []).some(child => child.id === activeId)
  })

  return links.flatMap(link => [
    link,
    ...(link.id === activeTopLevelLink?.id ? flattenTocLinks(link.children ?? []) : []),
  ])
}

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

const { data: menuTaxonomies } = await useAsyncData('site-mobile-menu-taxonomies-' + locale.value, async () => {
  const docs = await queryCollection('content').all()

  return buildContentTaxonomies(docs)
})

const { data: mobileMenuPage } = await useAsyncData('site-mobile-menu-page', async () => {
  let pageData = await queryCollection('content').path(route.path).first()

  if (!pageData && locale.value !== 'zh') {
    const prefix = `/${locale.value}`

    if (route.path.startsWith(prefix)) {
      const fallbackPath = route.path.slice(prefix.length) || '/'
      pageData = await queryCollection('content').path(fallbackPath).first()
    }
  }

  return pageData
}, {
  watch: [() => route.path, () => locale.value],
})

const menuCategories = computed(() => menuTaxonomies.value?.categories ?? [])
const menuTags = computed(() => menuTaxonomies.value?.tags ?? [])
const mobileMenuTocTreeLinks = computed(() => {
  return (mobileMenuPage.value?.body?.toc?.links ?? []).filter(link => link.depth > 1)
})
const mobileMenuTocLinks = computed(() => {
  return flattenTocLinks(mobileMenuTocTreeLinks.value)
})
const visibleMobileMenuTocLinks = computed(() => {
  return expandCurrentTocBranch(mobileMenuTocTreeLinks.value, activeMobileHeadingId.value)
})
const hasMobileMenuToc = computed(() => {
  return normalizedRoutePath.value !== '/' && mobileMenuTocLinks.value.length > 0
})
const activeMobileHeadingId = ref('')
const mobileReadingProgress = ref(0)
const defaultMobileSidebarPanel = computed<'site' | 'toc'>(() => hasMobileMenuToc.value ? 'toc' : 'site')

const closeMobileMenu = () => {
  isOpen.value = false
  isPostsMobileMenuOpen.value = false
}

const updateActiveMobileHeading = () => {
  if (!hasMobileMenuToc.value || !import.meta.client) {
    activeMobileHeadingId.value = ''
    return
  }

  const headings = mobileMenuTocLinks.value
    .map(link => document.getElementById(link.id))
    .filter((element): element is HTMLElement => Boolean(element))

  const activeHeading = headings
    .filter(heading => heading.getBoundingClientRect().top <= 112)
    .at(-1)

  activeMobileHeadingId.value = activeHeading?.id ?? ''
}

const updateMobileReadingProgress = () => {
  if (!hasMobileMenuToc.value || !import.meta.client) {
    mobileReadingProgress.value = 0
    return
  }

  const article = document.querySelector('article')

  if (!(article instanceof HTMLElement)) {
    mobileReadingProgress.value = 0
    return
  }

  const articleTop = article.offsetTop
  const articleHeight = article.offsetHeight
  const readableDistance = articleHeight - window.innerHeight

  if (readableDistance <= 0) {
    mobileReadingProgress.value = window.scrollY >= articleTop ? 100 : 0
    return
  }

  const progress = ((window.scrollY - articleTop) / readableDistance) * 100
  mobileReadingProgress.value = Math.min(100, Math.max(0, progress))
}

const updateMobileArticleScrollState = () => {
  updateActiveMobileHeading()
  updateMobileReadingProgress()
}

const toggleMobileMenu = () => {
  isOpen.value = !isOpen.value
}

watch(() => route.fullPath, () => {
  activeMobileSidebarPanel.value = defaultMobileSidebarPanel.value
  updateMobileArticleScrollState()
})

watch(hasMobileMenuToc, (hasToc) => {
  activeMobileSidebarPanel.value = hasToc ? 'toc' : 'site'
})

watch(isOpen, (nextOpen) => {
  if (nextOpen) {
    activeMobileSidebarPanel.value = defaultMobileSidebarPanel.value
    updateMobileArticleScrollState()
  }
})

onMounted(() => {
  updateMobileArticleScrollState()
  window.addEventListener('scroll', updateMobileArticleScrollState, { passive: true })
  window.addEventListener('resize', updateMobileArticleScrollState)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateMobileArticleScrollState)
  window.removeEventListener('resize', updateMobileArticleScrollState)
})
</script>

<template>
  <div class="nav-search-right relative hidden max-lg:block" :class="{ 'nav-search-right-hidden': props.hidden }">
    <button
      class="mobile-menu-trigger grid size-[2.35rem] cursor-pointer place-items-center border-0 bg-transparent text-[var(--color-text-muted)] transition-[color,transform] duration-200 hover:text-[var(--color-text-main)]"
      :class="{ 'mobile-menu-trigger-open': isOpen }"
      type="button"
      :aria-label="t('nav.menu')"
      :aria-expanded="isOpen"
      @click="toggleMobileMenu"
    >
      <UIcon :name="isOpen ? 'lucide:x' : 'lucide:menu'" class="size-[1.2rem]" />
    </button>
    <Transition name="mobile-menu-slide">
      <div v-if="isOpen" class="fixed inset-x-0 top-16 bottom-0 z-[1]">
        <button class="absolute inset-0 cursor-pointer border-0 bg-[var(--color-overlay)]" type="button" :aria-label="t('nav.closeMenu')" @click="isOpen = false"></button>
        <aside class="mobile-menu-drawer absolute top-0 right-0 bottom-0 w-[min(100%,32rem)] overflow-y-auto bg-[var(--color-surface-elevated)] px-6 py-[clamp(1.5rem,6vw,3rem)] shadow-[-1rem_0_2rem_var(--color-shadow)]">
          <div class="flex w-full flex-col gap-5">
            <ArticleSidebarTabs v-if="hasMobileMenuToc" v-model:activeSidebarPanel="activeMobileSidebarPanel" />
            <div
              class="mobile-menu-panel-stack"
              :class="`mobile-menu-panel-stack-${activeMobileSidebarPanel}`"
            >
              <div
                class="mobile-menu-site-panel flex w-full flex-col gap-8"
                :class="{ 'mobile-menu-panel-hidden': hasMobileMenuToc && activeMobileSidebarPanel !== 'site' }"
                :aria-hidden="hasMobileMenuToc && activeMobileSidebarPanel !== 'site'"
                :inert="hasMobileMenuToc && activeMobileSidebarPanel !== 'site'"
              >
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
                    <NuxtLink class="mobile-social-link" :to="localePath('/xiaohongshu')" aria-label="小红书" @click="closeMobileMenu">
                      <UIcon name="simple-icons:xiaohongshu" />
                    </NuxtLink>
                    <a class="mobile-social-link" href="mailto:blowingwind05@mail.ustc.edu.cn" aria-label="Email">
                      <UIcon name="lucide:mail" />
                    </a>
                  </div>
                </section>
                <div class="mobile-posts-stats" aria-label="文章分类与标签统计">
                  <NuxtLink class="mobile-posts-stat" :to="localePath('/categories')" @click="closeMobileMenu">
                    <span class="mobile-posts-stat-label">{{ t('home.categories') }}</span>
                    <span class="mobile-posts-stat-count">{{ menuCategories.length }}</span>
                  </NuxtLink>
                  <NuxtLink class="mobile-posts-stat" :to="localePath('/tags')" @click="closeMobileMenu">
                    <span class="mobile-posts-stat-label">{{ t('home.tags') }}</span>
                    <span class="mobile-posts-stat-count">{{ menuTags.length }}</span>
                  </NuxtLink>
                </div>
                <div class="grid gap-2">
                  <NuxtLink class="mobile-menu-option inline-flex items-center gap-[0.8rem] py-[0.85rem] text-[1.35rem] font-bold whitespace-nowrap text-[var(--color-text-main)]" :to="localePath('/')" @click="closeMobileMenu">
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
                        <NuxtLink class="mobile-menu-suboption inline-flex items-center gap-[0.65rem] py-[0.65rem] text-[1.05rem] font-semibold whitespace-nowrap text-[var(--color-text-muted)]" :class="{ 'mobile-menu-suboption-active': normalizedRoutePath === '/archive' }" :to="localePath('/archive')" @click="closeMobileMenu">
                          <span>{{ t('posts.archive') }}</span>
                        </NuxtLink>
                        <NuxtLink class="mobile-menu-suboption inline-flex items-center gap-[0.65rem] py-[0.65rem] text-[1.05rem] font-semibold whitespace-nowrap text-[var(--color-text-muted)]" :class="{ 'mobile-menu-suboption-active': normalizedRoutePath === '/categories' }" :to="localePath('/categories')" @click="closeMobileMenu">
                          <span>{{ t('home.categories') }}</span>
                        </NuxtLink>
                        <NuxtLink class="mobile-menu-suboption inline-flex items-center gap-[0.65rem] py-[0.65rem] text-[1.05rem] font-semibold whitespace-nowrap text-[var(--color-text-muted)]" :class="{ 'mobile-menu-suboption-active': normalizedRoutePath === '/tags' }" :to="localePath('/tags')" @click="closeMobileMenu">
                          <span>{{ t('home.tags') }}</span>
                        </NuxtLink>
                      </div>
                    </Transition>
                  </div>
                  <NuxtLink class="mobile-menu-option inline-flex items-center gap-[0.8rem] py-[0.85rem] text-[1.35rem] font-bold whitespace-nowrap text-[var(--color-text-main)]" :to="localePath('/about')" @click="closeMobileMenu">
                    <UIcon name="lucide:user" class="size-5 shrink-0" />
                    <span>{{ t('nav.about') }}</span>
                  </NuxtLink>
                  <NuxtLink class="mobile-menu-option inline-flex items-center gap-[0.8rem] py-[0.85rem] text-[1.35rem] font-bold whitespace-nowrap text-[var(--color-text-main)]" :to="localePath('/friends')" @click="closeMobileMenu">
                    <UIcon name="lucide:link" class="size-5 shrink-0" />
                    <span>{{ t('nav.friends') }}</span>
                  </NuxtLink>
                  <NuxtLink class="mobile-menu-option inline-flex items-center gap-[0.8rem] py-[0.85rem] text-[1.35rem] font-bold whitespace-nowrap text-[var(--color-text-main)]" :to="localePath('/bookmarks')" @click="closeMobileMenu">
                    <UIcon name="lucide:bookmark" class="size-5 shrink-0" />
                    <span>{{ t('nav.bookmarks') }}</span>
                  </NuxtLink>
                </div>
              </div>

              <nav
                v-if="hasMobileMenuToc"
                class="mobile-menu-toc-panel"
                :class="{ 'mobile-menu-panel-hidden': activeMobileSidebarPanel !== 'toc' }"
                :aria-hidden="activeMobileSidebarPanel !== 'toc'"
                :inert="activeMobileSidebarPanel !== 'toc'"
                aria-label="Table of contents"
              >
                <h2 class="mobile-menu-toc-heading">
                  <span class="mobile-menu-toc-title">
                    <span class="mobile-menu-toc-title-mark" aria-hidden="true"></span>
                    {{ t('article.toc') }}
                  </span>
                  <ArticleReadingProgress :progress="mobileReadingProgress" />
                </h2>
                <ol class="grid gap-2">
                  <li
                    v-for="link in visibleMobileMenuTocLinks"
                    :key="link.id"
                    :style="{ paddingLeft: `${Math.max(0, link.depth - 2) * 0.95}rem` }"
                  >
                    <a
                      class="mobile-menu-toc-link block rounded-lg px-2.5 py-2 text-[1rem] font-semibold text-[var(--color-text-muted)]"
                      :class="{ 'mobile-menu-toc-link-active': activeMobileHeadingId === link.id }"
                      :href="`#${link.id}`"
                      @click="closeMobileMenu"
                    >
                      {{ link.text }}
                    </a>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.nav-search-right {
  transition:
    opacity 0.46s ease,
    transform 0.54s cubic-bezier(0.16, 1, 0.3, 1),
    visibility 0.46s ease;
}

.nav-search-right-hidden {
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transform: translateX(8rem);
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

.mobile-menu-panel-stack {
  position: relative;
  display: grid;
  min-width: 0;
  overflow: hidden;
  --mobile-menu-panel-gap: 1.25rem;
}

.mobile-menu-site-panel,
.mobile-menu-toc-panel {
  grid-area: 1 / 1;
  min-width: 0;
  transition:
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.42s ease;
  will-change: transform, opacity;
}

.mobile-menu-toc-panel {
  transform: translateX(calc(100% + var(--mobile-menu-panel-gap)));
  opacity: 0.28;
}

.mobile-menu-panel-stack-toc .mobile-menu-site-panel {
  transform: translateX(calc(-100% - var(--mobile-menu-panel-gap)));
  opacity: 0.28;
}

.mobile-menu-panel-stack-toc .mobile-menu-toc-panel {
  transform: translateX(0);
  opacity: 1;
}

.mobile-menu-panel-hidden {
  pointer-events: none;
}

.mobile-menu-toc-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: var(--color-text-main);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.mobile-menu-toc-title {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
}

.mobile-menu-toc-title-mark {
  display: inline-block;
  width: 0.25rem;
  height: 1.25rem;
  flex: none;
  border-radius: 999px;
  background: var(--color-accent);
}

.mobile-menu-toc-link {
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease;
}

.mobile-menu-toc-link:hover {
  background-color: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
  color: var(--color-text-main);
  opacity: 1;
}

.mobile-menu-toc-link-active,
.mobile-menu-toc-link-active:hover {
  background-color: color-mix(in srgb, var(--color-accent) 18%, transparent);
  color: var(--color-accent);
  opacity: 1;
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

.posts-mobile-pop-enter-active,
.posts-mobile-pop-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.posts-mobile-pop-enter-from,
.posts-mobile-pop-leave-to {
  opacity: 0;
  transform: translateY(-0.15rem);
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

@media (prefers-reduced-motion: reduce) {
  .mobile-menu-site-panel,
  .mobile-menu-toc-panel {
    transition: none;
  }
}
</style>
