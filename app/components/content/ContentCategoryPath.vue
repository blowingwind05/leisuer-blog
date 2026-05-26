<script setup lang="ts">
const props = defineProps<{
  category?: unknown
  fallback?: string
  segmentHover?: boolean
  mode?: 'full' | 'leaf'
  linked?: boolean
}>()

const localePath = useLocalePath()
const categoryPath = computed(() => getCategoryPath(props.category))
const visibleCategoryPath = computed(() => {
  if (props.mode === 'leaf') {
    return categoryPath.value.length ? [categoryPath.value.at(-1) as string] : []
  }

  return categoryPath.value
})
const categoryLink = (index: number) => {
  const linkPath = props.mode === 'leaf' ? categoryPath.value : categoryPath.value.slice(0, index + 1)

  return localePath(`/categories/${linkPath.map(item => encodeURIComponent(item)).join('/')}`)
}
</script>

<template>
  <span class="content-category-path">
    <template v-for="(item, index) in visibleCategoryPath" :key="`${item}-${index}`">
      <UIcon v-if="index > 0" name="lucide:chevron-right" class="content-category-separator" aria-hidden="true" />
      <NuxtLink v-if="linked !== false" class="content-category-segment" :class="{ 'content-category-segment-hover': segmentHover }" :to="categoryLink(index)">
        {{ item }}
      </NuxtLink>
      <span v-else class="content-category-segment">
        {{ item }}
      </span>
    </template>
    <span v-if="!visibleCategoryPath.length && fallback">{{ fallback }}</span>
  </span>
</template>

<style scoped>
.content-category-path {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  min-width: 0;
}

.content-category-separator {
  width: 0.95em;
  height: 0.95em;
  flex: none;
  stroke-width: 2.6;
}

.content-category-segment {
  border-radius: 999px;
  color: inherit;
  padding: 0.16rem 0.38rem;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.content-category-segment-hover:hover {
  background-color: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
  opacity: 1;
}
</style>
