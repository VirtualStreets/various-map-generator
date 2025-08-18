<script setup lang="ts">
import { computed } from 'vue'
import GeoIcon from '@/assets/icons/geoicon.svg'
import GoogleIcon from '@/assets/icons/google.svg'
import AppleIcon from '@/assets/icons/apple.svg'
import MapyCZIcon from '@/assets/icons/mapycz.svg'
import YandexIcon from '@/assets/icons/yandex.svg'
import BingIcon from '@/assets/icons/bing.svg'
import BaiduIcon from '@/assets/icons/baidu.svg'
import KakaoIcon from '@/assets/icons/kakao.svg'
import NaverIcon from '@/assets/icons/naver.svg'
import MapillaryIcon from '@/assets/icons/mapillary.svg'
import OpenMapIcon from '@/assets/icons/openmap.svg'

const props = defineProps<{
  size?: string
  icon?: string
}>()

const { size = '1' } = props

const icons: any = {
  geo: GeoIcon,
  google: GoogleIcon,
  googleZoom:GoogleIcon,
  apple: AppleIcon,
  yandex: YandexIcon,
  bing: BingIcon,
  baidu:BaiduIcon,
  kakao:KakaoIcon,
  naver:NaverIcon,
  mapycz: MapyCZIcon,
  mapillary:MapillaryIcon,
  openmap: OpenMapIcon
}

const iconComponent = computed(() => {
  return icons[props.icon ?? 'geo'] ?? GeoIcon
})
</script>

<template>
  <component :is="iconComponent" :style="{ width: size + 'rem' }"/>
</template>

<style scoped>
svg {
  animation: spin 10s infinite ease-in-out;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-360deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
