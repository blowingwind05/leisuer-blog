<script setup lang="ts">
const props = defineProps<{
  hidden?: boolean
}>()

const isOpen = defineModel<boolean>('open', {
  default: false,
})

const emit = defineEmits<{
  toggle: []
}>()

const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed<Array<{ code: string, name: string }>>(() =>
  locales.value.map(item => typeof item === 'string'
    ? { code: item, name: item }
    : { code: String(item.code), name: String(item.name ?? item.code) },
  ),
)

const currentLocaleName = computed(() =>
  availableLocales.value.find(item => item.code === locale.value)?.name ?? locale.value,
)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  emit('toggle')
}
</script>

<template>
  <div class="nav-search-right relative" :class="{ 'nav-search-right-hidden': props.hidden }">
    <button
      class="locale-trigger inline-flex cursor-pointer items-center gap-[0.35rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-[0.55rem] py-1 font-[inherit] text-[1.1rem] leading-[1.4] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:opacity-100 max-md:border-transparent max-md:bg-transparent max-md:p-0 max-md:shadow-none"
      type="button"
      :aria-label="t('language.label')"
      :aria-expanded="isOpen"
      @click="toggleMenu"
    >
      <UIcon name="lucide:languages" class="nav-link-icon" />
      <span class="locale-name max-md:hidden">{{ currentLocaleName }}</span>
      <UIcon
        name="lucide:chevron-down"
        class="locale-chevron"
        :class="{ 'locale-chevron-open': isOpen }"
      />
    </button>
    <div v-if="isOpen" class="locale-dropdown absolute top-[calc(100%+0.55rem)] right-0 grid min-w-32 gap-[0.15rem] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-[0.35rem] shadow-[0_1rem_2rem_var(--color-shadow)]">
      <NuxtLink
        v-for="item in availableLocales"
        :key="item.code"
        class="locale-option block rounded-lg px-[0.6rem] py-[0.45rem] whitespace-nowrap"
        :class="{ 'locale-option-active': item.code === locale }"
        :to="switchLocalePath(item.code)"
        @click="isOpen = false"
      >
        {{ item.name }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.nav-search-right {
  transition:
    opacity 0.46s ease,
    transform 0.54s cubic-bezier(0.16, 1, 0.3, 1),
    visibility 0.46s ease;
}

.nav-search-right-hidden {
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transform: translateX(8rem);
}

.nav-link-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex: 0 0 auto;
}

.locale-chevron {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center;
}

.locale-chevron-open {
  transform: rotate(180deg);
}

.locale-option-active {
  color: var(--color-text-main);
  background-color: color-mix(in srgb, var(--color-accent) 12%, transparent);
  opacity: 1;
}
</style>
