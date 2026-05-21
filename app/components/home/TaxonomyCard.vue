<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  categories: Array<{ name: string, count: number }>
  tags: Array<{ name: string, count: number }>
  reveal?: boolean
}>()

const categoriesHovered = ref(false)
const categoriesLockedOpen = ref(false)
const categoriesOpen = computed(() => categoriesHovered.value || categoriesLockedOpen.value)
</script>

<template>
  <div class="hidden rounded-[1.25rem] bg-[var(--color-surface)] p-4 lg:block" :class="{ 'reveal-card': reveal }">
    <section
      @mouseenter="categoriesHovered = true"
      @mouseleave="categoriesHovered = false"
    >
      <button
        class="flex w-full items-center gap-3 text-left text-xl font-bold text-[var(--color-text-main)]"
        type="button"
        @click="categoriesLockedOpen = !categoriesLockedOpen"
      >
        <span class="inline-block h-5 w-1 rounded-full bg-[var(--color-accent)]"></span>
        <span>{{ t('home.categories') }}</span>
        <span class="text-[1.6rem] text-[var(--color-text-muted)]">{{ categories.length }}</span>
        <UIcon
          name="lucide:chevron-down"
          class="ml-auto size-5 transition-transform duration-200"
          :class="{ 'rotate-180': categoriesOpen }"
        />
      </button>
      <div v-show="categoriesOpen" class="pt-3">
        <div class="category-scroll-fade -mx-1 max-h-[8.7rem] overflow-y-auto px-1 pb-2">
          <a v-for="category in categories" :key="category.name" href="#" class="flex items-center justify-between rounded-lg px-3 py-2 font-semibold text-[var(--color-text-main)] transition hover:bg-[color-mix(in_srgb,var(--color-accent)_9%,transparent)] hover:text-[var(--color-accent)] hover:opacity-100">
            {{ category.name }}
            <span class="min-w-9 rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] px-2 py-1 text-center text-[var(--color-accent)]">{{ category.count }}</span>
          </a>
        </div>
        <a href="#" class="mt-1 inline-flex items-center gap-1 text-sm font-bold text-[var(--color-accent)] hover:opacity-80">
          {{ t('home.showAll') }}
          <UIcon name="lucide:arrow-right" class="size-4" />
        </a>
      </div>
    </section>

    <section class="mt-4 border-t border-[var(--color-border)] pt-4">
      <h3 class="mb-3 flex items-center gap-3 text-xl font-bold text-[var(--color-text-main)] before:inline-block before:h-5 before:w-1 before:shrink-0 before:rounded-full before:bg-[var(--color-accent)] before:content-['']">
        <span>{{ t('home.tags') }}</span>
        <span class="text-[1.6rem] text-[var(--color-text-muted)]">{{ tags.length }}</span>
      </h3>
      <div class="tag-scroll-fade -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 whitespace-nowrap">
        <span v-for="tag in tags" :key="tag.name" class="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_9%,transparent)] px-3 py-1.5 font-semibold text-[var(--color-accent)] transition hover:bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)] hover:opacity-100">
          <span>{{ tag.name }}</span>
          <span class="text-[0.85em]">{{ tag.count }}</span>
        </span>
      </div>
      <a href="#" class="mt-1 inline-flex items-center gap-1 text-sm font-bold text-[var(--color-accent)] hover:opacity-80">
        {{ t('home.showAll') }}
        <UIcon name="lucide:arrow-right" class="size-4" />
      </a>
    </section>
  </div>
</template>

<style scoped>
.tag-scroll-fade {
  -webkit-mask-image: linear-gradient(to right, transparent, #000 1rem, #000 calc(100% - 1rem), transparent);
  mask-image: linear-gradient(to right, transparent, #000 1rem, #000 calc(100% - 1rem), transparent);
  scrollbar-width: thin;
}

.category-scroll-fade {
  -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 1.4rem), transparent);
  mask-image: linear-gradient(to bottom, #000 calc(100% - 1.4rem), transparent);
  scrollbar-width: thin;
}
</style>
