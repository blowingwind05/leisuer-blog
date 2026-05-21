<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
  canGoPrevious: boolean
  canGoNext: boolean
  reveal?: boolean
}>()

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const { t } = useI18n()
</script>

<template>
  <nav
    class="flex items-center justify-center gap-3 rounded-[1.25rem] bg-[var(--color-surface)] p-4 text-[var(--color-text-muted)]"
    :class="{ 'reveal-card': reveal }"
    :aria-label="t('home.postPagination')"
  >
    <button
      class="post-pagination-icon-button"
      type="button"
      :disabled="!canGoPrevious"
      :aria-label="t('home.firstPage')"
      :title="t('home.firstPage')"
      @click="emit('pageChange', 1)"
    >
      <UIcon name="lucide:chevrons-left" class="size-4" />
    </button>
    <button
      class="post-pagination-button"
      type="button"
      :disabled="!canGoPrevious"
      @click="emit('pageChange', currentPage - 1)"
    >
      <UIcon name="lucide:chevron-left" class="size-4" />
      <span>{{ t('home.previousPage') }}</span>
    </button>
    <span class="min-w-20 text-center font-bold text-[var(--color-text-main)]">
      {{ currentPage }} / {{ totalPages }}
    </span>
    <button
      class="post-pagination-button"
      type="button"
      :disabled="!canGoNext"
      @click="emit('pageChange', currentPage + 1)"
    >
      <span>{{ t('home.nextPage') }}</span>
      <UIcon name="lucide:chevron-right" class="size-4" />
    </button>
    <button
      class="post-pagination-icon-button"
      type="button"
      :disabled="!canGoNext"
      :aria-label="t('home.lastPage')"
      :title="t('home.lastPage')"
      @click="emit('pageChange', totalPages)"
    >
      <UIcon name="lucide:chevrons-right" class="size-4" />
    </button>
  </nav>
</template>

<style scoped>
.post-pagination-button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 6.25rem;
  justify-content: center;
  cursor: pointer;
  border: 0;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  padding: 0.55rem 0.85rem;
  color: var(--color-accent);
  font-weight: 800;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.post-pagination-icon-button {
  display: inline-grid;
  width: 2.45rem;
  height: 2.45rem;
  cursor: pointer;
  place-items: center;
  border: 0;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent);
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.post-pagination-button:hover:not(:disabled),
.post-pagination-icon-button:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
  opacity: 1;
}

.post-pagination-button:disabled,
.post-pagination-icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}
</style>
