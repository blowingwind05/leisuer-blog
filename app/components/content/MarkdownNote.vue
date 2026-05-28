<template>
  <Callout type="note" :title="title">
    <slot mdc-unwrap="p" />
  </Callout>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>
