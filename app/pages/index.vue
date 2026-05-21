<script setup lang="ts">
const { locale, t } = useI18n()

useHead(() => ({
  title: 'Leisuer',
  meta: [
    {
      name: 'description',
      content: t('home.bio'),
    },
  ],
}))

const { data: aboutPage } = await useAsyncData('home-about-' + locale.value, async () => {
  const targetPath = locale.value === 'zh' ? '/about' : `/${locale.value}/about`
  let pageData = await queryCollection('content').path(targetPath).first()

  if (!pageData && locale.value !== 'zh') {
    pageData = await queryCollection('content').path('/about').first()
  }

  return pageData
})

const { data: homePosts } = await useAsyncData('home-posts-' + locale.value, async () => {
  const docs = await queryCollection('content').all()

  return docs
    .filter(doc => doc.draft !== true && !['/about', '/index'].includes(doc.path))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1
      }

      const dateA = new Date(String(a.updated ?? a.created ?? '')).getTime()
      const dateB = new Date(String(b.updated ?? b.created ?? '')).getTime()

      return (Number.isNaN(dateB) ? 0 : dateB) - (Number.isNaN(dateA) ? 0 : dateA)
    })
})
const homeTaxonomies = computed(() => buildContentTaxonomies(homePosts.value ?? []))

const postsPerPage = 4
const currentPostPage = ref(1)
const pinnedHomePosts = computed(() => (homePosts.value ?? []).filter(post => post.pinned))
const regularHomePosts = computed(() => (homePosts.value ?? []).filter(post => !post.pinned))
const recommendedHomePosts = shallowRef<NonNullable<typeof homePosts.value>>([])
const refreshRecommendedHomePosts = () => {
  recommendedHomePosts.value = [...regularHomePosts.value]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
}
const totalPostPages = computed(() => Math.max(1, Math.ceil(regularHomePosts.value.length / postsPerPage)))
const paginatedRegularHomePosts = computed(() => {
  const start = (currentPostPage.value - 1) * postsPerPage

  return regularHomePosts.value.slice(start, start + postsPerPage)
})
const homePostItems = computed(() => {
  if (pinnedHomePosts.value.length === 0) {
    return paginatedRegularHomePosts.value.map(post => ({ type: 'post' as const, post }))
  }

  return [
    { type: 'pinned-divider' as const },
    ...pinnedHomePosts.value.map(post => ({ type: 'post' as const, post })),
    { type: 'all-divider' as const },
    ...paginatedRegularHomePosts.value.map(post => ({ type: 'post' as const, post })),
  ]
})
const canGoPreviousPostPage = computed(() => currentPostPage.value > 1)
const canGoNextPostPage = computed(() => currentPostPage.value < totalPostPages.value)
const goToPostPage = (page: number) => {
  currentPostPage.value = Math.min(Math.max(page, 1), totalPostPages.value)
}

watch(totalPostPages, (pageCount) => {
  if (currentPostPage.value > pageCount) {
    currentPostPage.value = pageCount
  }
})
const revealRoot = ref<HTMLElement | null>(null)
let revealObserver: IntersectionObserver | null = null

const observeRevealCards = () => {
  if (!revealRoot.value) {
    return
  }

  if (!revealObserver) {
    revealRoot.value.querySelectorAll('.reveal-card').forEach((element) => {
      element.classList.add('reveal-card-visible')
    })
    return
  }

  revealRoot.value.querySelectorAll('.reveal-card:not(.reveal-card-visible)').forEach((element) => {
    revealObserver?.observe(element)
  })
}

onMounted(async () => {
  refreshRecommendedHomePosts()
  await nextTick()

  if (!revealRoot.value || !('IntersectionObserver' in window)) {
    observeRevealCards()
    return
  }

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return
      }

      entry.target.classList.add('reveal-card-visible')
      revealObserver?.unobserve(entry.target)
    })
  }, {
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.18,
  })

  observeRevealCards()
})

watch(currentPostPage, async () => {
  await nextTick()
  observeRevealCards()
})

watch(regularHomePosts, async () => {
  refreshRecommendedHomePosts()
  await nextTick()
  observeRevealCards()
})

onUnmounted(() => {
  revealObserver?.disconnect()
})
</script>

<template>
  <div class="home-page">
    <div class="home relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-[var(--site-gutter)]">
      <div class="flex w-full flex-col items-center gap-8">
        <section class="hero relative mx-auto w-full max-w-[var(--site-content-width)] px-[3vw] pt-[2.6vw] pb-[1.8vw] [container-type:inline-size]">
          <div class="hero-panel"></div>
          <h1 class="huge-text">
            <span class="line-one">
              <span class="line-one-gray">
                <span class="line-one-hi">HI,</span>
                <span class="line-one-iam">I AM</span>
              </span>
              <span class="line-one-bg">HI, I AM</span>
            </span>
            <span class="line-two">LEISUER</span>
          </h1>
          <p class="hero-motto">- 猛志逸四海，骞翮思远翥 -</p>
        </section>
        <section class="w-full max-w-[var(--site-content-width)] md:hidden">
          <HomeProfileCard />
        </section>
      </div>
      <a class="scroll-hint" href="#about" :aria-label="t('home.scrollHint')">
        <span class="scroll-hint-content">
          <span>{{ t('home.scrollHint') }}</span>
          <svg class="scroll-hint-arrows" viewBox="0 0 28 30" aria-hidden="true">
            <path d="M5 5l9 9 9-9" />
            <path d="M5 13l9 9 9-9" />
            <path d="M5 21l9 9 9-9" />
          </svg>
        </span>
        <span class="scroll-hint-reflection" aria-hidden="true">
          <span>{{ t('home.scrollHint') }}</span>
          <svg class="scroll-hint-arrows" viewBox="0 0 28 30">
            <path d="M5 5l9 9 9-9" />
            <path d="M5 13l9 9 9-9" />
            <path d="M5 21l9 9 9-9" />
          </svg>
        </span>
      </a>
    </div>

    <section id="about" ref="revealRoot" class="blog-section relative z-[1] mx-auto grid scroll-mt-20 w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-1 gap-6 bg-transparent py-24 pt-6 lg:scroll-mt-0 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)] lg:pt-24">
      <aside class="hidden flex-col gap-6 self-start md:flex lg:sticky lg:top-24">
        <HomeProfileCard compact reveal />
        <HomeTaxonomyCard :categories="homeTaxonomies.categories" :tags="homeTaxonomies.tags" reveal />
      </aside>

      <div class="flex flex-col gap-5">
        <HomeAboutArticleCard :page="aboutPage" collapsible default-collapsed heading-tag="h2" reveal />

        <template v-for="item in homePostItems" :key="item.type === 'post' ? item.post.path : item.type">
          <HomePostDivider
            v-if="item.type === 'pinned-divider' || item.type === 'all-divider'"
            :label="item.type === 'pinned-divider' ? t('home.pinnedPosts') : t('home.allPosts')"
            reveal
          />
          <HomePostCard v-else :post="item.post" reveal />
        </template>
        <HomePostPagination
          v-if="regularHomePosts.length > postsPerPage"
          :current-page="currentPostPage"
          :total-pages="totalPostPages"
          :can-go-previous="canGoPreviousPostPage"
          :can-go-next="canGoNextPostPage"
          reveal
          @page-change="goToPostPage"
        />
        <HomeRecommendedPosts
          v-if="recommendedHomePosts.length"
          :posts="recommendedHomePosts"
          reveal
        />
      </div>

      <a
        class="reveal-card hidden size-16 place-items-center place-self-start justify-self-end rounded-[1.25rem] bg-[var(--color-surface)] text-[var(--color-accent)] lg:sticky lg:top-24 lg:col-start-2 lg:grid"
        href="#"
        :aria-label="t('home.backToTop')"
      >
        <UIcon name="heroicons:chevron-up-20-solid" class="block size-10" />
      </a>
    </section>
  </div>
</template>

<style scoped>
.home {
  --home-edge-gap: clamp(1.5rem, 4vh, 2.5rem);
  --scroll-hint-bottom: max(1.25rem, env(safe-area-inset-bottom, 0px));
  --scroll-hint-font-size: 2.5rem;
  --scroll-hint-height: var(--scroll-hint-font-size);
  --scroll-hint-clearance: clamp(1rem, 3vh, 2rem);
}

@media (max-width: 767.98px) {
  .home {
    --scroll-hint-font-size: clamp(1.45rem, 7vw, 2.5rem);
    padding-top: var(--home-edge-gap);
    padding-bottom: calc(
      var(--scroll-hint-bottom) + var(--scroll-hint-height) + var(--scroll-hint-clearance)
    );
  }
}

@media (min-width: 600px) and (max-width: 767.98px) {
  .home {
    padding-bottom: var(--home-edge-gap);
  }

  .scroll-hint {
    display: none;
  }
}

.scroll-hint {
  position: absolute;
  left: 50%;
  bottom: var(--scroll-hint-bottom);
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  width: max-content;
  color: #ffffff;
  font-family: '寒蝉全圆体', 'Nunito', 'Arial Rounded MT Bold', 'Hiragino Maru Gothic ProN', 'Yu Gothic UI',
    system-ui, sans-serif;
  font-size: var(--scroll-hint-font-size);
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 1px 8px rgb(0 0 0 / 0.28);
  opacity: 0;
  animation:
    scroll-hint-rise 1s cubic-bezier(0.16, 1, 0.3, 1) 3.1s forwards,
    scroll-hint-bounce 1.8s ease-in-out 4.1s infinite;
}

.scroll-hint:hover {
  opacity: 1;
}

.scroll-hint-content,
.scroll-hint-reflection {
  display: inline-flex;
  align-items: center;
  gap: inherit;
}

.scroll-hint-reflection {
  position: absolute;
  bottom: -1.18em;
  left: 0;
  opacity: 0.45;
  transform: scaleY(-1);
  transform-origin: center;
  filter: blur(0.6px);
  mask-image: linear-gradient(to bottom, rgb(0 0 0 / 0.9), transparent 82%);
  -webkit-mask-image: linear-gradient(to bottom, rgb(0 0 0 / 0.9), transparent 82%);
  pointer-events: none;
}

.scroll-hint-arrows {
  width: 0.82em;
  height: 0.92em;
  overflow: visible;
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.scroll-hint-arrows path {
  animation: scroll-arrow-flow 1.45s ease-in-out infinite;
}

.scroll-hint-arrows path:nth-child(2) {
  animation-delay: 0.16s;
}

.scroll-hint-arrows path:nth-child(3) {
  animation-delay: 0.32s;
}

.reveal-card {
  opacity: 0;
  transform: translate3d(0, 3rem, 0);
  transition:
    opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay, 0s),
    transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay, 0s);
}

.reveal-card-visible {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.blog-section > aside .reveal-card:nth-child(2),
.blog-section > div .reveal-card:nth-child(2) {
  --reveal-delay: 0.08s;
}

.blog-section > aside .reveal-card:nth-child(3),
.blog-section > div .reveal-card:nth-child(3) {
  --reveal-delay: 0.16s;
}

.blog-section > .reveal-card {
  --reveal-delay: 0.24s;
}

.hero-panel {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 2rem;
  backdrop-filter: blur(22px) saturate(1.25);
  -webkit-backdrop-filter: blur(22px) saturate(1.25);
  opacity: 0;
  transform: translateY(3rem);
  animation: hero-panel-rise 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.huge-text {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.95;
  text-transform: uppercase;
}

.line-two,
.line-one-bg {
  display: inline-block;
  color: transparent;
  padding-right: 0.12em;
  -webkit-background-clip: text;
  background-clip: text;
  background-repeat: no-repeat;
  opacity: 0;
  clip-path: inset(0 100% 0 0);
  animation: hero-title-reveal 10s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.line-one {
  position: relative;
  display: inline-block;
  font-size: 15.6cqw;
  font-style: italic;
  padding-right: 0.12em;
  white-space: nowrap;
}

.line-one-gray {
  display: inline-block;
  color: #cbcbcb;
  white-space: nowrap;
  animation: hero-gray-swap-out 1.25s cubic-bezier(0.16, 1, 0.3, 1) 2s forwards;
}

.line-one-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: max-content;
  white-space: nowrap;
  background-image: url('/img/7c9da87600c333a45ef720502e30ea2c.jpg');
  background-size: 140%;
  background-position: 0 50%;
  opacity: 1;
  clip-path: inset(0 0 0 100%);
  animation:
    hero-bg-swap-in 1.25s cubic-bezier(0.16, 1, 0.3, 1) 2s forwards,
    hero-image-drift 60s linear 0s infinite alternate;
}

.line-one-hi,
.line-one-iam {
  display: inline-block;
  opacity: 0;
}

.line-one-iam {
  margin-left: 0.18em;
  padding-right: 0.16em;
}

.line-one-hi {
  mask-image: linear-gradient(135deg, #000 50%, transparent 50%);
  mask-size: 260% 260%;
  mask-position: 100% 100%;
  -webkit-mask-image: linear-gradient(135deg, #000 50%, transparent 50%);
  -webkit-mask-size: 260% 260%;
  -webkit-mask-position: 100% 100%;
  animation: hero-hi-reveal 2.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
}

.line-one-iam {
  animation: hero-iam-reveal 2.2s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards;
}

.line-two {
  font-size: 22.6cqw;
  font-style: italic;
  background-image: url('/img/3367cc759193fdee11352d04eaef4a42.jpg');
  background-size: cover;
  background-position: center 100%;
  margin-left: -0.05em;
  animation:
    hero-title-reveal 3s cubic-bezier(0.16, 1, 0.3, 1) 2s forwards,
    hero-image-drift-y 60s linear 0s infinite alternate;
}

.hero-motto {
  position: relative;
  z-index: 1;
  margin: 0 auto;
  font-family: '寒蝉全圆体', 'Arial Rounded MT Bold', 'Hiragino Maru Gothic ProN', 'Yu Gothic UI', system-ui, sans-serif;
  font-size: clamp(1.6rem, 4cqw, 2.65rem);
  font-weight: 400;
  line-height: 1.4;
  text-align: center;
  text-shadow: 0 0.08em 0.45em rgb(70 70 80 / 0.28);
  color: transparent;
  background-image: linear-gradient(
    105deg,
    var(--color-accent) 0%,
    var(--color-accent) 38%,
    rgb(225 242 255) 48%,
    var(--color-accent) 58%,
    var(--color-accent) 100%
  );
  background-size: 260% 100%;
  background-position: 130% 50%;
  -webkit-background-clip: text;
  background-clip: text;
  opacity: 0;
  transform: translateY(0.5rem);
  animation:
    hero-motto-rise 1.2s cubic-bezier(0.16, 1, 0.3, 1) 2.6s forwards,
    hero-motto-shine 5s ease-in-out 4s infinite;
}

@keyframes hero-title-reveal {
  from {
    opacity: 0;
    clip-path: inset(0 100% 0 0);
  }

  to {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
}

@keyframes hero-panel-rise {
  from {
    opacity: 0;
    transform: translateY(3rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hero-gray-swap-out {
  from {
    clip-path: inset(0 0 0 0);
  }

  to {
    clip-path: inset(0 100% 0 0);
  }
}

@keyframes hero-bg-swap-in {
  from {
    clip-path: inset(0 0 0 100%);
  }

  to {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes hero-hi-reveal {
  0% {
    opacity: 0;
    mask-position: 100% 100%;
    -webkit-mask-position: 100% 100%;
  }

  12% {
    opacity: 1;
  }

  100% {
    opacity: 1;
    mask-position: 0 0;
    -webkit-mask-position: 0 0;
  }
}

@keyframes hero-iam-reveal {
  0% {
    opacity: 0;
    transform: translate3d(0, 0.7em, 0);
    clip-path: inset(100% 0 0 0);
  }

  60% {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }

  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    clip-path: inset(0 0 0 0);
  }
}

@keyframes hero-motto-rise {
  to {
    opacity: 0.72;
    transform: translateY(0);
  }
}

@keyframes hero-motto-shine {
  0%,
  18% {
    background-position: 130% 50%;
  }

  92%,
  100% {
    background-position: -30% 50%;
  }
}

@keyframes hero-image-drift {
  from {
    background-position-x: 0;
  }

  to {
    background-position-x: 100%;
  }
}

@keyframes hero-image-drift-y {
  from {
    background-position-y: 100%;
  }

  to {
    background-position-y: 40%;
  }
}

@keyframes scroll-hint-rise {
  from {
    opacity: 0;
    transform: translate3d(-50%, 0.75rem, 0);
  }

  to {
    opacity: 0.82;
    transform: translate3d(-50%, 0, 0);
  }
}

@keyframes scroll-hint-bounce {
  0%,
  100% {
    transform: translate3d(-50%, 0, 0);
  }

  50% {
    transform: translate3d(-50%, 0.35rem, 0);
  }
}

@keyframes scroll-arrow-flow {
  0% {
    opacity: 0.2;
    transform: translateY(-0.12em);
  }

  45% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0.2;
    transform: translateY(0.12em);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-panel,
  .line-one-hi,
  .line-one-iam,
  .line-two,
  .hero-motto,
  .scroll-hint,
  .scroll-hint-arrows path,
  .reveal-card {
    opacity: 1;
    transform: none;
    clip-path: none;
    animation: none;
  }

  .hero-motto {
    background-position: 130% 50%;
  }
}

</style>
