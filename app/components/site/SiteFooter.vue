<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="footer-gradient mt-16" aria-hidden="true"></div>
  <footer class="site-footer bg-[var(--color-nav-bg)]">
    <div class="mx-auto grid w-[min(calc(100%-var(--site-gutter)*2),var(--site-content-width))] gap-4 py-8 text-sm text-[var(--color-text-muted)] md:grid-cols-[1fr_auto_1fr] md:items-center">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>Leisuer</span>
        <span>© {{ currentYear }}</span>
        <span>Built with Nuxt</span>
      </div>
      <p class="order-first m-0 text-center text-sm leading-none md:order-none">
        「猛志逸四海，骞翮思远翥」
      </p>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
        <a class="text-inherit hover:text-[var(--color-text-main)] hover:opacity-100" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          ICP备XXXXXXXX号
        </a>
        <a class="text-inherit hover:text-[var(--color-text-main)] hover:opacity-100" href="https://icp.gov.moe/" target="_blank" rel="noopener noreferrer">
          萌ICP备XXXXXXXX号
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-gradient {
  height: 1.5rem;
  background: linear-gradient(to bottom, transparent, var(--color-nav-bg) 85%, var(--color-nav-bg));
}
</style>
