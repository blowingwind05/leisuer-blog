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
    name: '星野回廊',
    description: '写前端、摄影和日常碎碎念的个人小站。',
    url: 'https://example.com',
    avatar: 'https://api.dicebear.com/9.x/shapes/svg?seed=hoshino',
  },
  {
    name: 'Blue Archive',
    description: '记录工程实践、工具链和一些奇怪但有用的想法。',
    url: 'https://example.com',
    avatar: 'https://api.dicebear.com/9.x/shapes/svg?seed=blue-archive',
  },
  {
    name: '橘子汽水实验室',
    description: '关于设计、阅读、代码和生活方式的灵感笔记。',
    url: 'https://example.com',
    avatar: 'https://api.dicebear.com/9.x/shapes/svg?seed=orange-soda',
  },
  {
    name: 'Northern Lights',
    description: 'A tiny corner for systems, notes, and quiet experiments.',
    url: 'https://example.com',
    avatar: 'https://api.dicebear.com/9.x/shapes/svg?seed=northern-lights',
  },
  {
    name: '纸飞机航线',
    description: '偶尔更新的技术博客，也放一些旅行和游戏记录。',
    url: 'https://example.com',
    avatar: 'https://api.dicebear.com/9.x/shapes/svg?seed=paper-plane',
  },
  {
    name: 'Mellow Code',
    description: '慢慢写代码，慢慢把想法打磨成可以分享的东西。',
    url: 'https://example.com',
    avatar: 'https://api.dicebear.com/9.x/shapes/svg?seed=mellow-code',
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
      <header class="mb-6 rounded-[1.25rem] bg-[var(--color-surface)] p-5 md:p-7">
        <p class="mb-3 inline-flex font-bold text-[var(--color-accent)]">{{ t('nav.friends') }}</p>
        <h1 class="friends-title">
          {{ t('friends.title') }}
        </h1>
        <p class="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
          {{ t('friends.description') }}
        </p>
      </header>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <a
          v-for="friend in friends"
          :key="friend.name"
          class="friend-card"
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
              <span class="friend-url">{{ friend.url.replace(/^https?:\/\//, '') }}</span>
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
.friends-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-main);
  font-size: clamp(1.9rem, 4vw, 3.4rem);
  font-weight: 800;
  line-height: 1.1;
}

.friends-title::before {
  display: inline-block;
  width: 0.25rem;
  height: 1.5rem;
  flex: none;
  border-radius: 999px;
  background: var(--color-accent);
  content: '';
}

.friend-card {
  position: relative;
  display: flex;
  min-height: 11rem;
  flex-direction: column;
  justify-content: center;
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
  box-shadow: 0 0.85rem 1.6rem color-mix(in srgb, var(--color-accent) 14%, transparent);
  opacity: 1;
  transform: translateY(-2px);
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
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
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
  overflow: hidden;
  margin-top: 0.2rem;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-arrow {
  width: 0.95em;
  height: 0.95em;
  flex: none;
  color: var(--color-accent);
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
  grid-template-rows: 42% 1fr;
  overflow: hidden;
  border-top-right-radius: 1.25rem;
  border-bottom-right-radius: 1.25rem;
  background: var(--color-accent);
}

.friend-strip span:first-child {
  background: color-mix(in srgb, var(--color-accent) 86%, #ffffff);
}

.friend-strip span:last-child {
  background: color-mix(in srgb, var(--color-accent) 70%, #ffffff);
}
</style>
