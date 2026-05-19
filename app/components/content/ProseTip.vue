<template>
  <Callout type="tip" :title="title">
    <slot mdc-unwrap="p" />
  </Callout>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>
