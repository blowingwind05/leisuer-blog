<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  description: string
}>()

const { t } = useI18n()

const summaryText = ref(props.description)
const isTyping = ref(false)
const hasStreamed = ref(false)
let typingInterval: ReturnType<typeof setInterval> | null = null

const handleToggle = (e: Event) => {
  const details = e.target as HTMLDetailsElement
  if (details.open) {
    if (hasStreamed.value) {
      summaryText.value = props.description
      return
    }

    if (typingInterval) clearInterval(typingInterval)
    summaryText.value = ''
    isTyping.value = true
    hasStreamed.value = true
    let i = 0

    typingInterval = setInterval(() => {
      if (i < props.description.length) {
        summaryText.value += props.description.charAt(i)
        i++
      } else {
        if (typingInterval) clearInterval(typingInterval)
        isTyping.value = false
      }
    }, 40)
  } else {
    // When closing, if typing is still active, finish it immediately
    if (typingInterval) {
      clearInterval(typingInterval)
      isTyping.value = false
      summaryText.value = props.description
    }
  }
}
</script>

<template>
  <details v-if="description" class="group overflow-hidden border border-[var(--color-border)] rounded-[0.9rem] bg-[var(--color-surface)]" @toggle="handleToggle">
    <summary class="flex cursor-pointer items-center justify-between gap-4 px-4 py-[0.55rem] bg-[color-mix(in_srgb,var(--color-text-main)_5%,transparent)] text-[var(--color-text-main)] text-[1.05rem] font-extrabold list-none [&::-webkit-details-marker]:hidden after:content-[''] after:w-[0.55rem] after:h-[0.55rem] after:border-r-[0.13rem] after:border-b-[0.13rem] after:border-[var(--color-text-muted)] after:rotate-45 after:-translate-y-[0.1rem] after:transition-transform after:duration-[180ms] group-open:after:rotate-[225deg] group-open:after:-translate-x-[0.1rem] group-open:after:-translate-y-[0.1rem]">{{ t('article.summary') }}</summary>
    <p class="m-0 p-4 bg-[color-mix(in_srgb,var(--color-text-main)_2%,transparent)] text-[var(--color-text-muted)] text-[1.05rem] leading-[1.75]">
      {{ summaryText }}<span v-show="isTyping" class="ml-[2px] font-bold animate-[blink_1s_step-end_infinite]">|</span>
    </p>
  </details>
</template>

<style scoped>
@keyframes blink {
  50% { opacity: 0; }
}
</style>
