<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'note' | 'tip' | 'warning' | 'caution'
  title?: string
}>(), {
  type: 'note',
})

const defaultTitles = {
  note: 'NOTE',
  tip: 'TIP',
  warning: 'WARNING',
  caution: 'CAUTION',
}

const icons = {
  note: 'lucide:info',
  tip: 'lucide:lightbulb',
  warning: 'lucide:triangle-alert',
  caution: 'lucide:circle-alert',
}

const calloutTitle = computed(() => props.title || defaultTitles[props.type])
const hasCustomTitle = computed(() => !!props.title)
const iconName = computed(() => icons[props.type])
</script>

<template>
  <aside class="markdown-callout" :data-type="type">
    <span class="markdown-callout-icon" aria-hidden="true">
      <UIcon :name="iconName" />
    </span>
    <div class="markdown-callout-content">
      <div class="markdown-callout-title" :class="{ 'sr-only': !hasCustomTitle }">
        {{ calloutTitle }}
      </div>
      <div class="markdown-callout-body">
        <slot />
      </div>
    </div>
  </aside>
</template>
