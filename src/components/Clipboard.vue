<template>
  <Button v-if="isSupported" size="sm" squared :disabled title="Copy to clipboard" @click="handleCopy">
    <ClipboardCheckedIcon v-if="copied" class="w-5 h-5" />
    <ClipboardIcon v-else class="w-5 h-5" />
  </Button>
</template>

<script setup lang="ts">
import Button from './Elements/Button.vue'
import ClipboardIcon from '@/assets/icons/clipboard.svg'
import ClipboardCheckedIcon from '@/assets/icons/clipboard-checked.svg'
import { useClipboard } from '@vueuse/core'
const { copy, copied, isSupported } = useClipboard()

const props = defineProps<{
  data: Polygon[]
  disabled?: boolean
  mode?: string
  tag?: boolean
}>()

function handleCopy() {
  let data: Panorama[] = []

  props.data.forEach((polygon) => {
    const withSource = polygon.found.map((item) => ({
      ...item,
      panoId: props.mode === 'disable' ? null :
        props.mode === 'prefix' ? `${item.source?.includes('qq') ? 'TENCENT' :
          item.source?.replace('_pano', '').toUpperCase()}:${item.panoId}` : item.panoId,
      links: item.links?.slice(0, 4),
      extra:{
        tags: props.tag ? item.extra?.tags! : [],
      }
    }))
    data = data.concat(withSource)
  })

  copy(JSON.stringify({ customCoordinates: data }))
}
</script>
