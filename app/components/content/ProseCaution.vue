<template>
  <Callout type="caution" :title="title">
    <slot mdc-unwrap="p" />
  </Callout>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>
