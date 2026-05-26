<script setup lang="ts">
const props = defineProps<{
  category?: unknown
  fallback?: string
}>()

const categoryPath = computed(() => getCategoryPath(props.category))
</script>

<template>
  <span class="content-category-path">
    <template v-for="(item, index) in categoryPath" :key="`${item}-${index}`">
      <UIcon v-if="index > 0" name="lucide:chevron-right" class="content-category-separator" aria-hidden="true" />
      <span>{{ item }}</span>
    </template>
    <span v-if="!categoryPath.length && fallback">{{ fallback }}</span>
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
</style>
