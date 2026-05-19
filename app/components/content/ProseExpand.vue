<template>
  <ProseDetails :title="title" icon="lucide:check" type="expand" open>
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
