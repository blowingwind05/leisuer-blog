<script setup lang="ts">
const props = defineProps<{
  icon?: string
  code?: string
  language?: string
  filename?: string
  highlights?: number[]
  hideHeader?: boolean
  meta?: string
  class?: string | string[] | Record<string, boolean>
  ui?: Record<string, unknown>
}>()

const hasLineNumbers = computed(() => {
  const meta = props.meta ?? ''

  return /(?:^|\s)(?:line-numbers|show-line-numbers|lines)(?:\s|$|[=,{])/.test(meta)
    || /\{[^}]*\.line-numbers[^}]*\}/.test(meta)
    || props.highlights?.includes(0)
})

const filenameInfo = computed(() => {
  const raw = props.filename?.trim() ?? ''
  const match = raw.match(/^(.*?)(?:\s*[:@]\s*(\d+))?$/)

  return {
    filename: match?.[1] || raw,
    start: match?.[2] ? Number(match[2]) : 1,
  }
})

const lineNumberStart = computed(() => filenameInfo.value.start)

const codeTitle = computed(() => filenameInfo.value.filename || props.language || 'Plain')

const codeStyle = computed(() => ({
  '--code-language': JSON.stringify(codeTitle.value),
  '--line-number-start': String(lineNumberStart.value),
}))

const preClass = computed(() => [
  props.class,
  props.language ? `language-${props.language}` : undefined,
  {
    'line-numbers': hasLineNumbers.value,
    'has-filename': !!props.filename,
  },
])
</script>

<template>
  <div
    class="prose-pre"
    :data-language="language"
    :data-filename="filenameInfo.filename"
    :data-title="codeTitle"
    :style="codeStyle"
  >
    <pre :class="preClass"><slot /></pre>
  </div>
</template>
