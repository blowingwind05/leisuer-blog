<script setup lang="ts">
import { createTimeline, createTimer, utils } from 'animejs'

type Particle = {
  x: number
  y: number
  color: string
  radius: number
  endPos: {
    x: number
    y: number
  }
  draw: () => void
}

type Circle = {
  x: number
  y: number
  color: string
  radius: number
  alpha: number
  lineWidth: number
  draw: () => void
}

type Drawable = Particle | Circle

const canvasRef = ref<HTMLCanvasElement | null>(null)
const particleCount = 30
let context: CanvasRenderingContext2D | null = null
let pixelRatio = 1

const getAccentColor = () => getComputedStyle(document.documentElement)
  .getPropertyValue('--color-accent')
  .trim() || '#53a3f1'

const getParticleColors = () => {
  const accent = getAccentColor()

  return [
    accent,
    `color-mix(in srgb, ${accent} 78%, white)`,
    `color-mix(in srgb, ${accent} 68%, #7dd3fc)`,
    `color-mix(in srgb, ${accent} 86%, #ffffff)`,
  ]
}

const getRingColor = () => document.documentElement.classList.contains('dark')
  ? 'rgb(226 232 240)'
  : 'rgb(71 85 105)'

const setCanvasSize = () => {
  const canvas = canvasRef.value

  if (!canvas) {
    return
  }

  pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(window.innerWidth * pixelRatio)
  canvas.height = Math.round(window.innerHeight * pixelRatio)
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight}px`

  context = canvas.getContext('2d')
  context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
}

const setParticleDirection = (particle: Pick<Particle, 'x' | 'y'>) => {
  const angle = utils.random(0, 360) * Math.PI / 180
  const value = utils.random(42, 140)
  const radius = [-1, 1][utils.random(0, 1)] * value

  return {
    x: particle.x + radius * Math.cos(angle),
    y: particle.y + radius * Math.sin(angle),
  }
}

const createParticle = (x: number, y: number): Particle => {
  const colors = getParticleColors()
  const particle = {
    x,
    y,
    color: colors[utils.random(0, colors.length - 1)],
    radius: utils.random(12, 24),
    endPos: { x, y },
    draw() {
      if (!context) {
        return
      }

      context.beginPath()
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2, true)
      context.fillStyle = particle.color
      context.fill()
    },
  }

  particle.endPos = setParticleDirection(particle)

  return particle
}

const createCircle = (x: number, y: number): Circle => {
  const circle = {
    x,
    y,
    color: getRingColor(),
    radius: 0.1,
    alpha: 0.72,
    lineWidth: 7,
    draw() {
      if (!context) {
        return
      }

      context.globalAlpha = circle.alpha
      context.beginPath()
      context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, true)
      context.lineWidth = circle.lineWidth
      context.strokeStyle = circle.color
      context.stroke()
      context.globalAlpha = 1
    },
  }

  return circle
}

const renderDrawable = ({ targets }: { targets: Drawable[] }) => {
  targets.forEach(target => target.draw())
}

const animateParticles = (x: number, y: number) => {
  const circle = createCircle(x, y)
  const particles = Array.from({ length: particleCount }, () => createParticle(x, y))

  createTimeline()
    .add(particles, {
      x: particle => particle.endPos.x,
      y: particle => particle.endPos.y,
      radius: 0.1,
      duration: utils.random(1200, 1800),
      ease: 'outExpo',
      onRender: renderDrawable,
    })
    .add(circle, {
      radius: utils.random(64, 124),
      lineWidth: 0,
      alpha: 0,
      duration: utils.random(1200, 1800),
      ease: 'outExpo',
      onRender: renderDrawable,
    }, 0)
}

const clearCanvas = () => {
  context?.clearRect(0, 0, window.innerWidth, window.innerHeight)
}

const handlePointerDown = (event: PointerEvent) => {
  if (event.button !== 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  animateParticles(event.clientX, event.clientY)
}

onMounted(() => {
  setCanvasSize()

  createTimer({
    duration: Number.POSITIVE_INFINITY,
    onUpdate: clearCanvas,
  })

  window.addEventListener('resize', setCanvasSize)
  document.addEventListener('pointerdown', handlePointerDown)
})

onUnmounted(() => {
  window.removeEventListener('resize', setCanvasSize)
  document.removeEventListener('pointerdown', handlePointerDown)
})
</script>

<template>
  <canvas ref="canvasRef" class="click-fireworks" aria-hidden="true"></canvas>
</template>

<style scoped>
.click-fireworks {
  position: fixed;
  inset: 0;
  z-index: 90;
  pointer-events: none;
}
</style>
