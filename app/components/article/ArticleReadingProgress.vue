<script setup lang="ts">
const props = defineProps<{
  progress: number
}>()

const progressPercent = computed(() => {
  return Math.round(Math.min(100, Math.max(0, props.progress)))
})
</script>

<template>
  <span
    class="article-reading-progress"
    :class="{ 'article-reading-progress-complete': progressPercent >= 100 }"
    :style="{ '--article-reading-progress': progressPercent }"
    aria-hidden="true"
  >
    <svg class="article-reading-progress-ring" viewBox="0 0 40 40">
      <circle class="article-reading-progress-fill" cx="20" cy="20" r="16" />
      <circle class="article-reading-progress-track" cx="20" cy="20" r="16" pathLength="100" />
      <circle class="article-reading-progress-value" cx="20" cy="20" r="16" pathLength="100" />
    </svg>
    <span class="article-reading-progress-text">{{ progressPercent }}</span>
  </span>
</template>

<style scoped>
.article-reading-progress {
  --article-reading-progress: 0;
  position: relative;
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  flex: none;
  place-items: center;
  color: var(--color-accent);
}

.article-reading-progress-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.article-reading-progress-fill {
  fill: var(--color-accent);
  opacity: 0;
  transform: scale(0);
  transform-origin: center;
  transition:
    opacity 0.18s ease,
    transform 0.3s cubic-bezier(0.18, 1.25, 0.28, 1);
}

.article-reading-progress-track,
.article-reading-progress-value {
  fill: none;
  stroke-width: 3;
}

.article-reading-progress-track {
  stroke: color-mix(in srgb, var(--color-accent) 14%, transparent);
}

.article-reading-progress-value {
  stroke: var(--color-accent);
  stroke-dasharray: 100;
  stroke-dashoffset: calc(100 - var(--article-reading-progress));
  stroke-linecap: round;
  transition: stroke-dashoffset 0.18s ease;
}

.article-reading-progress-text {
  position: relative;
  z-index: 1;
  color: var(--color-accent);
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1;
  transition:
    color 0.18s ease,
    transform 0.28s cubic-bezier(0.18, 1.35, 0.28, 1);
}

.article-reading-progress-complete .article-reading-progress-fill {
  opacity: 1;
  transform: scale(1);
}

.article-reading-progress-complete .article-reading-progress-value {
  opacity: 0;
  stroke-linecap: butt;
}

.article-reading-progress-complete .article-reading-progress-text {
  color: #fff;
  transform: scale(1.02);
}
</style>
