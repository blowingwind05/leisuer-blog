<template>
  <ProseDetails :title="title" icon="lucide:circle-help" type="collapse">
    <slot />
  </ProseDetails>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
}>(), {
  title: 'Details',
})
</script>
