<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

withDefaults(defineProps<{
  compact?: boolean
  reveal?: boolean
}>(), {
  compact: false,
  reveal: false,
})
</script>

<template>
  <div
    class="rounded-[1.25rem] p-4 text-center"
    :class="[
      reveal ? 'reveal-card' : '',
      compact ? 'bg-[var(--color-surface)]' : 'profile-card-glass p-6',
    ]"
  >
    <img
      class="avatar-wiggle mx-auto rounded-full object-cover"
      :class="compact ? 'size-48' : 'size-48'"
      src="/img/avatar.jpg"
      :alt="t('home.profileAlt')"
    />
    <div>
      <h2 class="mt-4 mb-1 text-[1.45rem] leading-none font-bold text-[var(--color-text-main)]">Leisuer</h2>
      <div class="mx-auto mt-3 mb-4 h-1 w-8 rounded-full bg-[var(--color-accent)]"></div>
      <p class="mx-auto mb-5 text-base text-[var(--color-text-muted)]" :class="compact ? 'max-w-64' : 'max-w-80'">
        {{ t('home.bio') }}
      </p>
      <div class="flex justify-center gap-2" :aria-label="t('home.socialLinks')">
        <a class="profile-social-link" href="https://github.com/blowingwind05" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
          <UIcon name="simple-icons:github" class="size-5" />
        </a>
        <a class="profile-social-link" href="https://space.bilibili.com/104332491" aria-label="Bilibili" target="_blank" rel="noopener noreferrer">
          <UIcon name="simple-icons:bilibili" class="size-5" />
        </a>
        <NuxtLink class="profile-social-link" :to="localePath('/xiaohongshu')" aria-label="小红书">
          <UIcon name="simple-icons:xiaohongshu" class="size-5" />
        </NuxtLink>
        <a class="profile-social-link" href="mailto:blowingwind05@mail.ustc.edu.cn" aria-label="Email">
          <UIcon name="lucide:mail" class="size-5" />
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-card-glass {
  border: 1px solid var(--color-glass-border);
  background-color: var(--color-glass-bg);
  backdrop-filter: blur(22px) saturate(1.25);
  -webkit-backdrop-filter: blur(22px) saturate(1.25);
}

.profile-social-link {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: 0.5rem;
  background-color: color-mix(in srgb, var(--color-accent) 14%, transparent);
  color: var(--color-accent);
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
}

.profile-social-link:hover {
  background-color: color-mix(in srgb, var(--color-accent) 22%, transparent);
  opacity: 1;
  transform: translateY(-0.125rem);
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
    transform: rotate(-5deg) scale(1.03);
  }

  40% {
    transform: rotate(4deg) scale(1.03);
  }

  60% {
    transform: rotate(-3deg) scale(1.02);
  }

  80% {
    transform: rotate(2deg) scale(1.01);
  }
}
</style>
