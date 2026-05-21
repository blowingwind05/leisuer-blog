<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

const props = withDefaults(defineProps<{
  tags: string[]
  showIcon?: boolean
}>(), {
  showIcon: true,
})

const container = ref<HTMLElement | null>(null)
const icon = ref<HTMLElement | null>(null)
const moreButton = ref<HTMLElement | null>(null)
const measureUnits = ref<HTMLElement[]>([])
const visibleCount = ref(props.tags.length)
const popoverOpen = ref(false)

let resizeObserver: ResizeObserver | null = null

const hiddenCount = computed(() => Math.max(0, props.tags.length - visibleCount.value))
const visibleTags = computed(() => props.tags.slice(0, visibleCount.value))

const setMeasureUnit = (element: Element | ComponentPublicInstance | null, index: number) => {
  if (element instanceof HTMLElement) {
    measureUnits.value[index] = element
  }
}

const measure = async () => {
  await nextTick()
  await nextTick()

  if (!container.value || props.tags.length === 0) {
    visibleCount.value = props.tags.length
    return
  }

  const containerWidth = container.value.clientWidth
  const iconWidth = props.showIcon ? (icon.value?.offsetWidth ?? 0) : 0
  const moreWidth = moreButton.value?.offsetWidth ?? 0
  const columnGap = 8
  const availableWidth = containerWidth - iconWidth - (props.showIcon ? columnGap : 0)

  let usedWidth = 0
  let count = 0

  for (let index = 0; index < props.tags.length; index += 1) {
    const unitWidth = measureUnits.value[index]?.offsetWidth ?? 0
    const nextUsedWidth = usedWidth + (count > 0 ? columnGap : 0) + unitWidth
    const remainingCount = props.tags.length - index - 1
    const reservedMoreWidth = remainingCount > 0 ? columnGap + moreWidth : 0

    if (nextUsedWidth + reservedMoreWidth > availableWidth) {
      break
    }

    usedWidth = nextUsedWidth
    count += 1
  }

  visibleCount.value = Math.max(0, count)
}

watch(() => props.tags, () => {
  measure()
}, { deep: true })

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    measure()
  })

  if (container.value) {
    resizeObserver.observe(container.value)
  }

  measure()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <div class="post-tag-list-wrapper">
    <div ref="container" class="post-tag-list">
      <span v-if="showIcon" ref="icon" class="post-tag-list-icon">
        <UIcon name="lucide:tags" />
      </span>
      <template v-for="(tag, tagIndex) in visibleTags" :key="tag">
        <span v-if="tagIndex > 0" class="post-tag-separator">/</span>
        <span class="post-card-tag">{{ tag }}</span>
      </template>
      <UPopover v-if="hiddenCount > 0" v-model:open="popoverOpen">
        <button class="post-tag-more" type="button">
          +{{ hiddenCount }}
        </button>

        <template #content>
          <div class="post-tag-popover">
            <button
              class="post-tag-popover-close"
              type="button"
              aria-label="关闭标签弹窗"
              @click="popoverOpen = false"
            >
              <UIcon name="lucide:x" />
            </button>
            <span v-for="tag in tags" :key="tag" class="post-tag-popover-item">
              {{ tag }}
            </span>
          </div>
        </template>
      </UPopover>
    </div>

    <div class="post-tag-measure" aria-hidden="true">
      <span
        v-for="(tag, tagIndex) in tags"
        :key="tag"
        :ref="element => setMeasureUnit(element, tagIndex)"
        class="post-tag-measure-unit"
      >
        <span v-if="tagIndex > 0" class="post-tag-separator">/</span>
        <span class="post-card-tag">{{ tag }}</span>
      </span>
      <button ref="moreButton" class="post-tag-more" type="button">+99</button>
    </div>
  </div>
</template>

<style scoped>
.post-tag-list-wrapper {
  position: relative;
  min-width: 0;
}

.post-tag-list,
.post-tag-measure {
  display: flex;
  align-items: center;
  column-gap: 0.5rem;
  min-width: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.post-tag-list {
  overflow: hidden;
  padding-bottom: 0.14rem;
}

.post-tag-list-icon {
  display: inline-flex;
  width: 1.125rem;
  height: 1.125rem;
  flex: none;
}

.post-tag-list-icon svg,
.post-tag-list-icon span {
  width: 100%;
  height: 100%;
}

.post-tag-separator {
  color: var(--color-text-muted);
}

.post-card-tag {
  position: relative;
  display: inline-flex;
  cursor: pointer;
  transition: color 0.2s ease;
}

.post-card-tag::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 0.12em;
  border-radius: 999px;
  background-color: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.22s ease;
  content: '';
}

.post-card-tag:hover {
  color: var(--color-accent);
}

.post-card-tag:hover::after {
  transform: scaleX(1);
}

.post-tag-more {
  flex: none;
  cursor: pointer;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  padding: 0.05rem 0.45rem;
  color: var(--color-accent);
  font: inherit;
  line-height: 1.35;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.post-tag-more:hover {
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
  opacity: 1;
}

.post-tag-popover {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  width: min(42rem, calc(100vw - 2rem));
  max-width: min(42rem, calc(100vw - 2rem));
  padding: 2.15rem 0.75rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.85rem;
  background: var(--color-surface-elevated);
  box-shadow: 0 1rem 2.5rem var(--color-shadow);
  backdrop-filter: blur(18px) saturate(1.15);
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
  transform-origin: top right;
  animation: post-tag-popover-in 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.post-tag-popover-close {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  display: grid;
  width: 1.8rem;
  height: 1.8rem;
  cursor: pointer;
  place-items: center;
  border: 0;
  border-radius: 0.55rem;
  background: transparent;
  color: var(--color-text-muted);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease;
}

.post-tag-popover-close:hover {
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
  opacity: 1;
}

.post-tag-popover-close svg,
.post-tag-popover-close span {
  width: 1rem;
  height: 1rem;
}

.post-tag-popover-item {
  cursor: pointer;
  border-radius: 0.55rem;
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  padding: 0.25rem 0.55rem;
  color: var(--color-accent);
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.35;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.post-tag-popover-item:hover {
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
  color: var(--color-accent);
}

.post-tag-measure {
  position: absolute;
  inset: auto auto 0 0;
  visibility: hidden;
  pointer-events: none;
}

.post-tag-measure-unit {
  display: inline-flex;
  align-items: center;
  column-gap: 0.5rem;
  flex: none;
}

@keyframes post-tag-popover-in {
  from {
    opacity: 0;
    transform: translateY(-0.35rem) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .post-tag-popover {
    animation: none;
  }
}
</style>
