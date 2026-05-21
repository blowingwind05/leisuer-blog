<script setup lang="ts">
declare global {
  interface Window {
    Sakura?: new (selector: string, options?: Record<string, unknown>) => { start: () => void, stop: (graceful?: boolean) => void }
  }
}

const imageRatio = ref(1)
const pointerX = ref(0)
const pointerY = ref(0)
const sakuraLayerId = 'site-sakura-layer'
let sakura: InstanceType<NonNullable<typeof window.Sakura>> | null = null

const loadStylesheet = (href: string) => {
  if (document.querySelector(`link[href="${href}"]`)) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`))
    document.head.appendChild(link)
  })
}

const loadScript = (src: string) => {
  if (window.Sakura) {
    return Promise.resolve()
  }

  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)

  if (existingScript) {
    return new Promise<void>((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true })
    })
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.body.appendChild(script)
  })
}

const setupSakura = async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  await loadStylesheet('https://cdn.jsdelivr.net/npm/sakura-js/dist/sakura.min.css')
  await loadScript('https://cdn.jsdelivr.net/npm/sakura-js/dist/sakura.min.js')

  if (!window.Sakura || sakura) {
    return
  }

  sakura = new window.Sakura(`#${sakuraLayerId}`, {
    delay: 260,
    fallSpeed: 1.35,
    maxSize: 16,
    minSize: 8,
    colors: [
      {
        gradientColorStart: 'rgba(255, 183, 197, 0.95)',
        gradientColorEnd: 'rgba(255, 118, 164, 0.82)',
        gradientColorDegree: 120,
      },
      {
        gradientColorStart: 'rgba(255, 216, 228, 0.95)',
        gradientColorEnd: 'rgba(242, 145, 177, 0.82)',
        gradientColorDegree: 120,
      },
      {
        gradientColorStart: 'rgba(255, 202, 214, 0.9)',
        gradientColorEnd: 'rgba(227, 116, 154, 0.78)',
        gradientColorDegree: 120,
      },
    ],
  })
}

const updateBackgroundOffset = () => {
  const containerWidth = window.innerWidth
  const containerHeight = Math.max(window.innerHeight - 64, window.innerWidth * 0.54)
  const renderedHeight = containerHeight * 1.02
  const renderedWidth = renderedHeight * imageRatio.value
  const overflowY = Math.max(0, renderedHeight - containerHeight)

  document.documentElement.style.setProperty('--bg-offset-x', `${pointerX.value * overflowY}px`)
  document.documentElement.style.setProperty('--bg-offset-y', `${pointerY.value * overflowY}px`)
}

const handlePointerMove = (event: PointerEvent) => {
  pointerX.value = event.clientX / window.innerWidth - 0.5
  pointerY.value = event.clientY / window.innerHeight - 0.5

  updateBackgroundOffset()
}

onMounted(() => {
  const backgroundImage = new Image()

  backgroundImage.onload = () => {
    imageRatio.value = backgroundImage.naturalWidth / backgroundImage.naturalHeight
    updateBackgroundOffset()
  }

  backgroundImage.src = '/img/background.png'

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('resize', updateBackgroundOffset)
  setupSakura().catch((error) => {
    console.warn(error)
  })
})

onUnmounted(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('resize', updateBackgroundOffset)
  sakura?.stop()
  sakura = null
})
</script>

<template>
  <div class="page-background pointer-events-none fixed inset-x-0 top-16 -z-[2] h-[max(calc(100vh-4rem),54vw)] bg-[url('/img/background.png')] bg-[length:auto_104%] bg-[position:calc(50%+var(--bg-offset-x))_calc(50%+var(--bg-offset-y))] bg-no-repeat"></div>
  <div :id="sakuraLayerId" class="sakura-layer pointer-events-none fixed inset-x-0 top-16 -z-[1] h-[calc(100vh-4rem)] overflow-hidden" aria-hidden="true"></div>
</template>

<style scoped>
.page-background {
  background-position: calc(50% + var(--bg-offset-x)) calc(50% + var(--bg-offset-y));
  filter: brightness(1);
  transition: filter 0.3s ease;
}

.dark .page-background {
  filter: brightness(0.58);
}

.sakura-layer {
  opacity: 0.72;
}

:global(.sakura) {
  pointer-events: none;
  z-index: -1;
}
</style>
