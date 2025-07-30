<template>
  <Button
    v-if="isSupported"
    size="sm"
    squared
    :disabled
    title="Copy to clipboard(prefix with provdier)"
    @click="handleCopy"
  >
    <ClipboardCheckedIcon v-if="copied" class="w-5 h-5" />
    <ClipboardPrefixIcon v-else class="w-5 h-5" />
  </Button>
</template>

<script setup lang="ts">
import Button from './Elements/Button.vue'
import ClipboardPrefixIcon from '@/assets/icons/clipboard-prefix.svg'
import ClipboardCheckedIcon from '@/assets/icons/clipboard-checked.svg'
import { useClipboard } from '@vueuse/core'
const { copy, copied, isSupported } = useClipboard()

const props = defineProps<{
  data: Polygon[]
  disabled?: boolean
  prefix?: string
}>()

function handleCopy() {
  let data: Panorama[] = []

  props.data.forEach((polygon) => {
    const updated = polygon.found.map((panorama) => ({
      ...panorama,
      panoId: `${props.prefix ? `${props.prefix.toUpperCase()}:` : ''}${panorama.panoId}`,
      links: panorama.links?.map((link) =>
        `${props.prefix ? `${props.prefix.toUpperCase()}:` : ''}${link}`
      ),
    }))
    data = data.concat(updated)
  })

  copy(JSON.stringify({ customCoordinates: data }))
}
</script>
