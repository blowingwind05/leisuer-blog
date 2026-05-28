<script setup lang="ts">
const { locale, t } = useI18n()

useHead(() => ({
  title: t('friends.title'),
  meta: [
    {
      name: 'description',
      content: t('friends.description'),
    },
  ],
}))

const { data: taxonomies } = await useAsyncData('friends-taxonomies-' + locale.value, async () => {
  const docs = await queryCollection('content').all()

  return buildContentTaxonomies(docs)
})

const friendCategories = computed(() => taxonomies.value?.categories ?? [])
const friendTags = computed(() => taxonomies.value?.tags ?? [])

const friends = [
  {
    name: 'Tsukumi233',
    description: '好室友，项目经验丰富，二次元老资历',
    url: 'https://blog.hotaron.top',
    avatar: 'https://blog.hotaron.top/img/avatar.png',
    theme: 'blue',
  },
  {
    name: 'cos',
    description: '室友模板的作者，计算机领域大神',
    url: 'https://blog.cosine.ren',
    avatar: 'https://blog.cosine.ren/img/avatar.webp',
    theme: 'cyan',
  },
  {
    name: 'Vertsineu',
    description: '朋友，计算机领域大神，写了很多技术文章',
    url: 'https://blog.vertsineu.top',
    avatar: 'https://avatars.githubusercontent.com/u/97820175?v=4',
    theme: 'green',
  },
  {
    name: 'Innei',
    description: '高产高质量博主，很有设计感',
    url: 'https://innei.in',
    avatar: 'https://innei.in/_next/image?url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F41265413%3Fv%3D4&w=256&q=75',
    theme: 'pink',
  },
]
</script>

<template>
  <div class="mx-auto grid w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
    <aside class="hidden flex-col gap-6 self-start md:flex lg:sticky lg:top-24">
      <HomeProfileCard compact />
      <HomeTaxonomyCard :categories="friendCategories" :tags="friendTags" />
    </aside>

    <section>
      <header class="friend-intro-card">
        <p class="friend-intro-eyebrow">{{ t('nav.friends') }}</p>
        <h1 class="friends-title">
          海内存知己 天涯若比邻
        </h1>
      </header>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <a
          v-for="friend in friends"
          :key="friend.name"
          class="friend-card"
          :class="`friend-card-${friend.theme}`"
          :href="friend.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="friend-main">
            <img class="friend-avatar" :src="friend.avatar" :alt="friend.name" loading="lazy" />
            <span class="min-w-0">
              <span class="friend-name">
                <span class="truncate">{{ friend.name }}</span>
                <UIcon name="lucide:arrow-up-right" class="friend-arrow" />
              </span>
              <span class="friend-url">
                <span class="friend-url-text">{{ friend.url.replace(/^https?:\/\//, '') }}</span>
              </span>
            </span>
          </span>
          <span class="friend-description">{{ friend.description }}</span>
          <span class="friend-strip" aria-hidden="true">
            <span></span>
            <span></span>
          </span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import url("https://fontsapi.zeoseven.com/72/main/result.css");

.friend-intro-card {
  margin-bottom: 1.5rem;
  border-radius: 1.25rem;
  background: var(--color-surface);
  padding: 1.25rem;
}

.friend-intro-eyebrow {
  margin-bottom: 0.75rem;
  display: inline-flex;
  color: var(--color-accent);
  font-weight: 800;
}

.friends-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-main);
  font-family: "Zhi Mang Xing", cursive;
  font-size: clamp(1.75rem, 3.5vw, 3rem);
  font-weight: normal;
  line-height: 1.12;
}

.friends-title::before {
  display: inline-block;
  width: 0.25rem;
  height: 1.45rem;
  flex: none;
  border-radius: 999px;
  background: var(--color-accent);
  content: '';
}

@media (min-width: 768px) {
  .friend-intro-card {
    padding: 1.75rem;
  }
}

.friend-card {
  --friend-accent: var(--color-accent);
  position: relative;
  display: flex;
  min-height: 11rem;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1rem;
  overflow: hidden;
  border-radius: 1.25rem;
  background: var(--color-surface);
  padding: 1.25rem 3.4rem 1.25rem 1.25rem;
  color: var(--color-text-main);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.friend-card:hover {
  box-shadow: 0 0.85rem 1.6rem color-mix(in srgb, var(--friend-accent) 18%, transparent);
  opacity: 1;
  transform: translateY(-2px);
}

.friend-card-blue {
  --friend-accent: #55aef5;
}

.friend-card-yellow {
  --friend-accent: #f5c842;
}

.friend-card-red {
  --friend-accent: #f76565;
}

.friend-card-pink {
  --friend-accent: #f57ab0;
}

.friend-card-cyan {
  --friend-accent: #28cbd9;
}

.friend-card-green {
  --friend-accent: #25cfa3;
}

.friend-card-purple {
  --friend-accent: #a17ef5;
}

.friend-card-orange {
  --friend-accent: #ff8a1f;
}

.friend-main {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.friend-avatar {
  width: 3.45rem;
  height: 3.45rem;
  flex: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--friend-accent) 12%, transparent);
  object-fit: cover;
}

.friend-name {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  font-size: 1.05rem;
  font-weight: 800;
}

.friend-url {
  display: block;
  min-width: 0;
  max-width: 100%;
  margin-top: 0.2rem;
}

.friend-url-text {
  display: inline-block;
  overflow: hidden;
  max-width: 100%;
  padding-bottom: 0.08rem;
  background-image: linear-gradient(var(--friend-accent), var(--friend-accent));
  background-repeat: no-repeat;
  background-position: left bottom;
  background-size: 0 0.08em;
  color: color-mix(in srgb, var(--friend-accent) 72%, #ffffff);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  transition:
    background-size 0.2s ease,
    color 0.2s ease;
  white-space: nowrap;
}

.friend-card:hover .friend-url-text {
  background-size: 100% 0.08em;
}

.friend-arrow {
  width: 0.95em;
  height: 0.95em;
  flex: none;
  color: var(--friend-accent);
  opacity: 0;
  transform: translate(-0.2rem, 0.2rem);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.friend-card:hover .friend-arrow {
  opacity: 1;
  transform: translate(0, 0);
}

.friend-description {
  display: -webkit-box;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.friend-strip {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: grid;
  width: 2.35rem;
  grid-template-rows: 35% 1fr;
  overflow: hidden;
  border-top-right-radius: 1.25rem;
  border-bottom-right-radius: 1.25rem;
  background: var(--friend-accent);
}

.friend-strip span:first-child {
  background: color-mix(in srgb, var(--friend-accent) 86%, #ffffff);
}

.friend-strip span:last-child {
  background: color-mix(in srgb, var(--friend-accent) 70%, #ffffff);
}
</style>
