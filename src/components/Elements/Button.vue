<script setup lang="ts">
import { computed } from 'vue'

const {
  size = 'md',
  variant = 'default',
  squared = false,
  disabled = false,
} = defineProps<{
  size?: 'sm' | 'md' | 'lg'
  squared?: boolean
  variant?: 'default' | 'primary' | 'danger' | 'warning' | 'bordered'
  disabled?: boolean
}>()

const baseClass =
  'text-nowrap border border-black/20 cursor-pointer rounded-sm transition-colors duration-150'

const sizeClass = computed(() => {
  const squaredSizes = {
    sm: 'text-xs p-0.25',
    md: 'text-sm p-1.5',
    lg: 'p-2',
  }

  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-3 py-2',
    lg: 'px-6 py-3',
  }
  return squared ? squaredSizes[size] : sizes[size]
})

const variantClass = computed(() => {
  const variants = {
    default: 'bg-gray-200 text-black hover:bg-gray-300',
    primary: 'bg-primary text-black hover:bg-primary/90',
    danger: 'bg-danger text-white hover:bg-danger/90',
    warning: 'bg-warning text-black hover:bg-warning/90',
    bordered: 'border border-primary bg-black/50 hover:bg-black/70',
  }
  return variants[variant]
})

const disabledClass = computed(() =>
  disabled ? '!bg-gray-400 text-white pointer-events-none' : '',
)
</script>

<template>
  <button
    @mousedown.prevent
    tabindex="-1"
    :class="[baseClass, sizeClass, variantClass, disabledClass]"
  >
    <slot />
  </button>
</template>
