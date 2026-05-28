<script setup lang="ts">
defineProps<{
  categories: Array<{ name: string, count: number, children?: Array<{ name: string, count: number }> }>
}>()

const localePath = useLocalePath()
const { getCategoryLabel } = useCategoryLabel()
const categoryPath = (...segments: string[]) => localePath(`/categories/${segments.map(segment => encodeURIComponent(segment)).join('/')}`)
</script>

<template>
  <section class="taxonomy-panel">
    <div class="grid gap-3">
      <div v-for="category in categories" :key="category.name" class="category-group">
        <NuxtLink :to="categoryPath(category.name)" class="category-row">
          <span class="category-name">{{ getCategoryLabel(category.name) }}</span>
          <span class="category-count">{{ category.count }}</span>
        </NuxtLink>
        <div v-if="category.children?.length" class="category-children">
          <NuxtLink v-for="child in category.children" :key="`${category.name}-${child.name}`" :to="categoryPath(category.name, child.name)" class="category-child-row">
            <span>{{ getCategoryLabel(child.name) }}</span>
            <span class="category-child-count">{{ child.count }}</span>
          </NuxtLink>
        </div>
      </div>
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
  gap: 0.6rem;
  border-radius: 0.75rem;
  padding: 0.75rem 0.9rem;
  color: var(--color-text-main);
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.category-name {
  min-width: 0;
  color: inherit;
}

.category-children {
  margin: 0.25rem 0 0.1rem 0.85rem;
  display: grid;
  gap: 0.15rem;
  border-left: 1px solid var(--color-border);
  padding-left: 0.85rem;
}

.category-child-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.7rem;
  padding: 0.55rem 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.95rem;
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.category-row:hover {
  background: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
  opacity: 1;
}

.category-count {
  color: var(--color-accent);
}

.category-child-row:hover {
  background: color-mix(in srgb, var(--color-text-muted) 10%, transparent);
  color: var(--color-text-main);
  opacity: 1;
}

.category-child-count {
  display: inline-flex;
  align-items: center;
  align-self: center;
  color: color-mix(in srgb, var(--color-accent) 78%, var(--color-text-muted));
  font-size: 0.9em;
  line-height: 1;
}

@media (min-width: 768px) {
  .taxonomy-panel {
    padding: 1.75rem;
  }
}
</style>
