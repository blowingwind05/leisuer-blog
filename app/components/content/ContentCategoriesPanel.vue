<script setup lang="ts">
defineProps<{
  categories: Array<{ name: string, count: number, children?: Array<{ name: string, count: number }> }>
}>()
</script>

<template>
  <section class="taxonomy-panel">
    <div class="grid gap-2">
      <a v-for="category in categories" :key="category.name" href="#" class="category-row">
        <span class="category-name">
          <span>{{ category.name }}</span>
          <span v-if="category.children?.length" class="category-children">
            <template v-for="child in category.children" :key="`${category.name}-${child.name}`">
              <UIcon name="lucide:chevron-right" class="category-child-separator" aria-hidden="true" />
              <span>{{ child.name }}</span>
            </template>
          </span>
        </span>
        <span>{{ category.count }}</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.taxonomy-panel {
  border-radius: 1.25rem;
  background: var(--color-surface);
  padding: 1.25rem;
}

.category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 0.75rem;
  padding: 0.75rem 0.9rem;
  color: var(--color-text-main);
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.category-name {
  display: inline-flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 0.65rem;
  color: inherit;
}

.category-children {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  color: var(--color-text-muted);
  font-size: 0.9em;
}

.category-child-separator {
  width: 0.9em;
  height: 0.9em;
  flex: none;
}

.category-row:hover {
  background: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
  opacity: 1;
}

.category-row > span:last-child {
  color: var(--color-accent);
}

@media (min-width: 768px) {
  .taxonomy-panel {
    padding: 1.75rem;
  }
}
</style>
