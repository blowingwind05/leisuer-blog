<script setup lang="ts">
const localePath = useLocalePath()
const textBlock = ref<HTMLElement | null>(null)
const position = reactive({ x: 0, y: 0 })

let velocity = { x: 1.2, y: 0.9 }
let animationFrame = 0

definePageMeta({
  layout: false,
})

useHead(() => ({
  title: '小红书',
  meta: [
    {
      name: 'description',
      content: '不告诉你！',
    },
  ],
}))

const centerTextBlock = () => {
  if (!textBlock.value) {
    return
  }

  const rect = textBlock.value.getBoundingClientRect()
  position.x = (window.innerWidth - rect.width) / 2
  position.y = (window.innerHeight - rect.height) / 2
}

const animateTextBlock = () => {
  if (!textBlock.value) {
    return
  }

  const rect = textBlock.value.getBoundingClientRect()
  const nextX = position.x + velocity.x
  const nextY = position.y + velocity.y
  const maxX = Math.max(0, window.innerWidth - rect.width)
  const maxY = Math.max(0, window.innerHeight - rect.height)

  if (nextX <= 0 || nextX >= maxX) {
    velocity.x *= -1
  }

  if (nextY <= 0 || nextY >= maxY) {
    velocity.y *= -1
  }

  position.x = Math.min(Math.max(nextX, 0), maxX)
  position.y = Math.min(Math.max(nextY, 0), maxY)
  animationFrame = requestAnimationFrame(animateTextBlock)
}

onMounted(async () => {
  await nextTick()
  centerTextBlock()
  velocity = {
    x: Math.random() > 0.5 ? 1.25 : -1.25,
    y: Math.random() > 0.5 ? 0.95 : -0.95,
  }
  animationFrame = requestAnimationFrame(animateTextBlock)
  window.addEventListener('resize', centerTextBlock)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', centerTextBlock)
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-white text-black">
    <section
      ref="textBlock"
      class="fixed text-center"
      :style="{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }"
    >
      <h1 class="mb-5 text-[clamp(4rem,14vw,10rem)] leading-none font-black">
        哈哈，
      </h1>
      <p class="mb-4 text-[clamp(2rem,6vw,4.5rem)] leading-tight font-extrabold">
        不告诉你！
      </p>
      <p class="text-lg font-bold text-neutral-500 md:text-2xl">
        （之后走向正轨了一定会放的QAQ）
      </p>
    </section>

    <NuxtLink
      class="fixed right-6 bottom-6 rounded-xl bg-neutral-100 px-5 py-3 font-bold text-neutral-700 transition hover:bg-neutral-200 hover:opacity-100 md:right-10 md:bottom-10"
      :to="localePath('/')"
    >
      返回首页
    </NuxtLink>
  </div>
</template>
