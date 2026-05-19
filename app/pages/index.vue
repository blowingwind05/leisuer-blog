<script setup lang="ts">
const { locale, t } = useI18n()

const { data: aboutPage } = await useAsyncData('home-about-' + locale.value, async () => {
  const targetPath = locale.value === 'zh' ? '/about' : `/${locale.value}/about`
  let pageData = await queryCollection('content').path(targetPath).first()
  
  if (!pageData && locale.value !== 'zh') {
    pageData = await queryCollection('content').path('/about').first()
  }
  
  return pageData
})

const aboutPublishedAt = computed(() => formatContentDate(aboutPage.value?.created, locale.value))
const aboutEditedAt = computed(() => formatContentDate(aboutPage.value?.updated, locale.value))

const revealRoot = ref<HTMLElement | null>(null)
let revealObserver: IntersectionObserver | null = null

onMounted(() => {
  if (!revealRoot.value || !('IntersectionObserver' in window)) {
    revealRoot.value?.querySelectorAll('.reveal-card').forEach((element) => {
      element.classList.add('reveal-card-visible')
    })
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

  revealRoot.value.querySelectorAll('.reveal-card').forEach((element) => {
    revealObserver?.observe(element)
  })
})

onUnmounted(() => {
  revealObserver?.disconnect()
})
</script>

<template>
  <div class="home-page">
    <div class="home relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-[var(--site-gutter)]">
      <div class="flex w-full flex-col items-center gap-8">
        <section class="hero relative mx-auto w-full max-w-[var(--site-content-width)] px-[3vw] py-[4vw] [container-type:inline-size]">
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
        </section>
        <section class="w-full max-w-[var(--site-content-width)] md:hidden">
          <div class="rounded-[1.25rem] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] p-6 text-center backdrop-blur-[22px] backdrop-saturate-125">
            <img
              class="avatar-wiggle mx-auto size-48 rounded-full object-cover"
              src="/img/avatar.png"
              :alt="t('home.profileAlt')"
            />
            <h2 class="mt-4 mb-1 text-[1.45rem] leading-none font-bold text-[var(--color-text-main)]">Leisuer</h2>
            <div class="mx-auto mt-3 mb-4 h-1 w-8 rounded-full bg-[var(--color-accent)]"></div>
            <p class="mx-auto mb-5 max-w-80 text-base text-[var(--color-text-muted)]">
              {{ t('home.bio') }}
            </p>
            <div class="flex justify-center gap-2" :aria-label="t('home.socialLinks')">
              <a
                href="#"
                class="grid size-11 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-accent)] transition hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--color-accent)_22%,transparent)] hover:opacity-100"
                aria-label="GitHub"
              >
                <UIcon name="simple-icons:github" class="size-5" />
              </a>
              <a
                href="#"
                class="grid size-11 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-accent)] transition hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--color-accent)_22%,transparent)] hover:opacity-100"
                aria-label="Bilibili"
              >
                <UIcon name="simple-icons:bilibili" class="size-5" />
              </a>
              <a
                href="#"
                class="grid size-11 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-accent)] transition hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--color-accent)_22%,transparent)] hover:opacity-100"
                aria-label="小红书"
              >
                <UIcon name="simple-icons:xiaohongshu" class="size-5" />
              </a>
              <a
                href="mailto:"
                class="grid size-11 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-accent)] transition hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--color-accent)_22%,transparent)] hover:opacity-100"
                aria-label="Email"
              >
                <UIcon name="lucide:mail" class="size-5" />
              </a>
            </div>
          </div>
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

    <section id="about" ref="revealRoot" class="blog-section relative z-[1] mx-auto grid w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-1 gap-6 bg-transparent py-24 pt-8 lg:grid-cols-[minmax(14rem,20rem)_minmax(0,1fr)] lg:pt-40">
      <aside class="hidden flex-col gap-6 md:flex">
        <div class="reveal-card rounded-[1.25rem] bg-[var(--color-surface)] p-4 pb-5 text-center">
          <img
            class="avatar-wiggle mx-auto size-48 rounded-full object-cover"
            src="/img/avatar.png"
            :alt="t('home.profileAlt')"
          />
          <div>
            <h2 class="mt-4 mb-1 text-[1.45rem] leading-none font-bold text-[var(--color-text-main)]">Leisuer</h2>
            <div class="mx-auto mt-3 mb-4 h-1 w-8 rounded-full bg-[var(--color-accent)]"></div>
            <p class="mx-auto mb-5 max-w-64 text-base text-[var(--color-text-muted)]">
              {{ t('home.bio') }}
            </p>
            <div class="flex justify-center gap-2" :aria-label="t('home.socialLinks')">
              <a
                href="#"
                class="grid size-11 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-accent)] transition hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--color-accent)_22%,transparent)] hover:opacity-100"
                aria-label="GitHub"
              >
                <UIcon name="simple-icons:github" class="size-5" />
              </a>
              <a
                href="#"
                class="grid size-11 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-accent)] transition hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--color-accent)_22%,transparent)] hover:opacity-100"
                aria-label="Bilibili"
              >
                <UIcon name="simple-icons:bilibili" class="size-5" />
              </a>
              <a
                href="#"
                class="grid size-11 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-accent)] transition hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--color-accent)_22%,transparent)] hover:opacity-100"
                aria-label="小红书"
              >
                <UIcon name="simple-icons:xiaohongshu" class="size-5" />
              </a>
              <a
                href="mailto:"
                class="grid size-11 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-accent)] transition hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--color-accent)_22%,transparent)] hover:opacity-100"
                aria-label="Email"
              >
                <UIcon name="lucide:mail" class="size-5" />
              </a>
            </div>
          </div>
        </div>

        <div class="reveal-card hidden rounded-[1.25rem] bg-[var(--color-surface)] px-5 py-6 md:block">
          <h3 class="mb-5 flex items-center gap-3 text-xl font-bold text-[var(--color-text-main)] before:inline-block before:h-5 before:w-1 before:rounded-full before:bg-[var(--color-accent)] before:content-['']">
            {{ t('home.categories') }}
          </h3>
          <a href="#" class="flex items-center justify-between py-2 font-semibold text-[var(--color-text-main)]">
            Examples
            <span class="min-w-9 rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] px-2 py-1 text-center text-[var(--color-accent)]">4</span>
          </a>
          <a href="#" class="flex items-center justify-between py-2 font-semibold text-[var(--color-text-main)]">
            Guides
            <span class="min-w-9 rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] px-2 py-1 text-center text-[var(--color-accent)]">1</span>
          </a>
        </div>

        <div class="reveal-card hidden rounded-[1.25rem] bg-[var(--color-surface)] px-5 py-6 md:block">
          <h3 class="mb-5 flex items-center gap-3 text-xl font-bold text-[var(--color-text-main)] before:inline-block before:h-5 before:w-1 before:rounded-full before:bg-[var(--color-accent)] before:content-['']">
            {{ t('home.tags') }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <span class="rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_9%,transparent)] px-3 py-2 font-semibold text-[var(--color-accent)]">Leisuer</span>
            <span class="rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_9%,transparent)] px-3 py-2 font-semibold text-[var(--color-accent)]">Markdown</span>
            <span class="rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_9%,transparent)] px-3 py-2 font-semibold text-[var(--color-accent)]">Demo</span>
            <span class="rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_9%,transparent)] px-3 py-2 font-semibold text-[var(--color-accent)]">Blogging</span>
          </div>
        </div>
      </aside>

      <div class="flex flex-col gap-5">
        <article class="reveal-card rounded-[1.25rem] bg-[var(--color-surface)] px-6 py-8 md:px-10 md:py-10">
          <header class="mb-8">
            <p class="mb-3 font-bold text-[var(--color-accent)]">{{ aboutPage?.category ?? 'About' }}</p>
            <h2 class="mb-4 flex items-center gap-4 text-[clamp(2rem,4vw,4.4rem)] leading-none font-bold text-[var(--color-text-main)] before:inline-block before:h-6 before:w-1 before:rounded-full before:bg-[var(--color-accent)] before:content-['']">
              {{ aboutPage?.title ?? 'About Leisuer' }}
            </h2>
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-[1.05rem] font-bold text-[var(--color-text-muted)]">
              <span v-if="aboutPage?.created" class="inline-flex flex-wrap items-baseline gap-x-1">
                <time :datetime="String(aboutPage.created)">
                  {{ t('article.publishedAt') }} {{ aboutPublishedAt }}
                </time>
                <span v-if="aboutPage?.updated" class="modified-tooltip">
                  （{{ t('article.modified') }}）
                  <time class="modified-tooltip-content" :datetime="String(aboutPage.updated)">
                    {{ t('article.updatedAt') }} {{ aboutEditedAt }}
                  </time>
                </span>
              </span>
              <span v-if="aboutPage?.tags?.length">{{ aboutPage.tags.join(' / ') }}</span>
            </div>
            <SummaryCard v-if="aboutPage?.description" :description="aboutPage.description" class="mt-5" />
          </header>
          <ContentRenderer
            v-if="aboutPage"
            class="markdown-content"
            :value="aboutPage"
          />
          <p v-else class="text-lg text-[var(--color-text-main)]">
            About content is being prepared.
          </p>
        </article>
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
  font-family: 'Nunito', 'Arial Rounded MT Bold', 'Hiragino Maru Gothic ProN', 'Yu Gothic UI',
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
    background-position-y: 0;
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
  .scroll-hint,
  .scroll-hint-arrows path,
  .reveal-card {
    opacity: 1;
    transform: none;
    clip-path: none;
    animation: none;
  }
}

.avatar-wiggle:hover {
  animation: avatar-wiggle 0.7s ease-in-out;
}

@keyframes avatar-wiggle {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }

  20% {
    transform: rotate(-4deg) scale(1.03);
  }

  40% {
    transform: rotate(4deg) scale(1.03);
  }

  60% {
    transform: rotate(-3deg) scale(1.02);
  }

  80% {
    transform: rotate(3deg) scale(1.01);
  }
}
</style>
