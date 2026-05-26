<script setup lang="ts">
defineProps<{
  tags: Array<{ name: string, count: number }>
}>()

const localePath = useLocalePath()
const tagPath = (tag: string) => localePath(`/tags/${encodeURIComponent(tag)}`)
</script>

<template>
  <section class="taxonomy-panel">
    <div class="tag-cloud">
      <NuxtLink v-for="tag in tags" :key="tag.name" class="tag-item" :to="tagPath(tag.name)">
        <span>{{ tag.name }}</span>
        <span>{{ tag.count }}</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.taxonomy-panel {
  border-radius: 1.25rem;
  background: var(--color-surface);
  padding: 1.25rem;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--color-accent) 9%, transparent);
  padding: 0.45rem 0.75rem;
  color: var(--color-accent);
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.tag-item:hover {
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
  opacity: 1;
}

.tag-item span:last-child {
  font-size: 0.85em;
}

@media (min-width: 768px) {
  .taxonomy-panel {
    padding: 1.75rem;
  }
}
</style>
