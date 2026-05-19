<template>
  <details class="markdown-callout markdown-details" :data-type="type" v-bind="open ? { open: true } : {}">
    <summary class="markdown-callout-title">
      <span class="markdown-callout-icon" aria-hidden="true">
        <UIcon :name="icon" />
      </span>
      <span class="markdown-details-title-text">{{ title }}</span>
    </summary>
    <div class="markdown-callout-body">
      <slot />
    </div>
  </details>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  open?: boolean
  icon?: string
  type?: 'details' | 'collapse' | 'expand'
}>(), {
  title: 'Details',
  open: false,
  icon: 'lucide:circle-help',
  type: 'details',
})
</script>
