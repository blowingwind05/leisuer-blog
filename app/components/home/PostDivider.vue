<script setup lang="ts">
defineProps<{
  label: string
  reveal?: boolean
}>()
</script>

<template>
  <div class="pinned-post-divider" :class="{ 'reveal-card': reveal }">
    <span></span>
    <strong>{{ label }}</strong>
    <span></span>
  </div>
</template>

<style scoped>
.pinned-post-divider {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 1rem;
  color: #fff;
  text-shadow: 0 0.12rem 0.6rem rgb(0 0 0 / 0.18);
}

.pinned-post-divider span {
  height: 0.12rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.78);
  box-shadow: 0 0.12rem 0.8rem rgb(0 0 0 / 0.14);
}

.pinned-post-divider strong {
  font-size: 1.05rem;
  font-weight: 800;
  white-space: nowrap;
}
</style>
