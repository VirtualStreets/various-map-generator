<template>
  <div id="map"></div>
  <div id="leaflet-ui"></div>
  <div class="absolute bottom-1 left-1/2 -translate-x-1/2 font-bold text-xs text-black">
    Zoom : {{ currentZoom }}
  </div>
  <div class="absolute top-1 left-1 min-w-30 max-w-[calc(70vw)] max-h-[calc(100vh-50px)] flex flex-col gap-1">
    <Logo />
    <div class="flex-1 min-h-0 flex flex-col gap-1">
      <div v-if="!state.started" class="container flex flex-col">
        <div class="relative cursor-pointer" @click="panels.general = !panels.general">
          <h2>通用</h2>
          <ChevronDownIcon class="collapsible-indicator absolute top-0 right-0" />
        </div>
        <Collapsible :is-open="panels.general" class="flex flex-col gap-1 max-h-[140px] overflow-y-auto mt-2 p-1">
          <div class="flex items-center justify-between">
            主题 :
            <select v-model="themeMode">
              <option value="auto">跟随系统</option>
              <option value="light">白天</option>
              <option value="dark">黑夜</option>
            </select>
          </div>
          <div class="flex items-center justify-between">
            通知 :
            <select v-model="settings.notification.enabled" class="w-20">
              <option :value=true>启用</option>
              <option :value=false>关闭</option>
            </select>
          </div>
          <div v-if="settings.notification.enabled" class="flex-1 min-h-0 overflow-y-auto ml-4 mb-1">
            <Checkbox v-model="settings.notification.anyLocation">
              找到任意一个街景
            </Checkbox>
            <Checkbox v-model="settings.notification.onePolygonComplete">
              任意区域生成完毕
            </Checkbox>
            <Checkbox v-model="settings.notification.allPolygonsComplete">
              所有区域生成完毕
            </Checkbox>
          </div>
        </Collapsible>
      </div>
    </div>
    <div class="flex-1 min-h-0 flex flex-col gap-1">
      <div v-if="!state.started" class="container flex flex-col">
        <div class="relative cursor-pointer" @click="panels.layer = !panels.layer">
          <h2>图层</h2>
          <ChevronDownIcon class="collapsible-indicator absolute top-0 right-0" />
        </div>

        <Collapsible :is-open="panels.layer" class="flex flex-col gap-1 max-h-[140px] overflow-y-auto mt-2 p-1">
          <div v-for="layer in availableLayers" :key="layer.key" class="flex gap-1 justify-between">
            <Checkbox v-model="layer.visible" @change="toggleLayer(layer as LayerMeta)" class="truncate">
              <span class="truncate">{{ layer.label }}</span>
            </Checkbox>
            <div class="flex gap-1">
              <Button size="sm" @click="selectLayer(layer.key)">选择全部</Button>
              <Button size="sm" variant="danger" @click="deselectLayer(layer.key)">
                取消选择
              </Button>
              <Button squared size="sm" title="输出GeoJSON" @click="exportLayer(layer as LayerMeta)">
                <FileExportIcon class="w-5 h-5" />
              </Button>
            </div>
          </div>
          <input type="file" class="mr-auto mt-1" @change="importLayer" accept=".txt,.json,.geojson" />
        </Collapsible>
      </div>

      <div v-if="!state.started" class="container font-bold text-center">{{ select }}</div>

      <div v-if="selected.length" class="container flex-1 min-h-0 flex flex-col gap-1">
        <h2>国家/地区 ({{ selected.length }})</h2>
        <div class="px-1">
          <Checkbox v-model="settings.markersOnImport" title="This may affect performance.">
            为导入街景添加标记
          </Checkbox>
          <Checkbox v-model="settings.checkImports" title="Useful for comprehensive datasets.">
            检查导入街景
          </Checkbox>
          <hr />
        </div>

        <div class="flex flex-col gap-1 overflow-y-auto px-1 pb-1">
          <div v-for="polygon of selected" :key="polygon._leaflet_id" class="flex items-center gap-2">
            <Button size="sm" squared title="导入街景">
              <label class="cursor-pointer">
                <input type="file" accept=".json" hidden @change="importLocations($event, polygon as Polygon)" />
                <FileImportIcon class="w-5 h-5" />
              </label>
            </Button>
            <span v-if="polygon.feature.properties.code"
              :class="`flag-icon flag-` + polygon.feature.properties.code.toLowerCase()"></span>
            <label class="flex-grow truncate min-h-5 cursor-text"
              @click="changePolygonName(polygon.feature.properties)">
              {{ getPolygonName(polygon.feature.properties) }}
            </label>
            <Spinner v-if="state.started && polygon.isProcessing" />

            <div class="ml-auto flex items-center gap-1">
              {{ polygon.found.length }}
              <span>/</span>
              <input type="number" :min="polygon.found ? polygon.found.length : 0" v-model="polygon.nbNeeded" />
            </div>

            <div class="flex gap-1">
              <Clipboard :data="[polygon as Polygon]" :disabled="!polygon.found.length" />
              <Clipboard_Prefix :data="[polygon as Polygon]" :disabled="!polygon.found.length"
                :prefix="settings.provider" />
              <ExportToJSON :data="[polygon as Polygon]" :disabled="!polygon.found.length" />
              <ExportToCSV :data="[polygon as Polygon]" :disabled="!polygon.found.length" />
              <Button size="sm" squared variant="danger" :disabled="!polygon.found.length" title="删除该区域生成街景"
                @click="clearPolygon(polygon as Polygon)">
                <TrashBinIcon class="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="flex items-center gap-2 p-1">
        <h2>导出全部 ({{ totalLocs }})</h2>
        <Button class="ml-auto" size="sm" title="更改所有选定区域的生成数量上限" @click="changeLocationsCap">
          更改生成数量上限
        </Button>
        <div class="flex gap-1">
          <Clipboard :data="selected as Polygon[]" :disabled="!totalLocs" />
          <Clipboard_Prefix :data="selected as Polygon[]" :disabled="!totalLocs" :prefix="settings.provider" />
          <ExportToJSON :data="selected as Polygon[]" :disabled="!totalLocs" />
          <ExportToCSV :data="selected as Polygon[]" :disabled="!totalLocs" />
          <Button size="sm" squared variant="danger" :disabled="!totalLocs" title="删除所有生成街景" @click="clearAllLocations">
            <TrashBinIcon class="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  </div>

  <div class="absolute top-1 right-1 min-w-30 max-w-[calc(70vw)] max-h-[calc(100vh-8px)] overfslow-hidden flex flex-col gap-1">
    <div class="flex flex-col gap-1 flex-1 min-h-0">
      <div v-if="!state.started" class="container flex flex-col">
        <div class="relative cursor-pointer" @click="panels.generatorSettings = !panels.generatorSettings">
          <h2>生成器设置</h2>
          <ChevronDownIcon class="collapsible-indicator absolute top-0 right-0" />
        </div>
        <Collapsible :is-open="panels.generatorSettings" class="mt-1 p-1 pr-2">
          <div class="flex items-center justify-between mr-1">
            街景服务 :
            <select v-model="settings.provider" @change="toggleMap(settings.provider)">
              <option value="apple">苹果</option>
              <option value="bing">必应</option>
              <option value="yandex">Yandex</option>
              <option value="tencent">腾讯</option>
              <option value="baidu">百度</option>
              <option value="kakao">Kakao</option>
            </select>
          </div>
          <div class="flex justify-between">
            生成器数量 :
            <div class="flex items-center gap-4">
              <input type="number" v-model.number="settings.numOfGenerators" min="1" max="10"
                class="w-10 h-5 px-2 py-1 border rounded text-right" />
              <Slider v-model="settings.numOfGenerators" :min="1" :max="10" :step="1" :tooltips="false" class="w-32" />
            </div>
          </div>

          <div class="flex justify-between">
            速度:
            <span>
              <input type="number" v-model.number="settings.speed" min="1" max="1000" @change="handleSpeedInput" />
              次尝试
            </span>
          </div>

          <div class="flex items-center justify-between">
            搜索半径 :
            <span>
              <input type="number" v-model.number="settings.radius" @change="handleRadiusInput" />
              米
            </span>
          </div>

          <Checkbox v-model="settings.oneCountryAtATime">
            一次只检查一个国家/区域
          </Checkbox>

          <div v-if="!settings.rejectOfficial">
            <Checkbox v-model="settings.findRegions">生成街景之间的最小距离</Checkbox>
            <div v-if="settings.findRegions" class="ml-6">
              <input type="number" v-model.number="settings.regionRadius" /> <span> km </span>
            </div>
          </div>
        </Collapsible>
      </div>

      <div v-if="!state.started" class="container flex flex-col flex-1 min-h-0">
        <div class="cursor-pointer relative" @click="panels.coverageSettings = !panels.coverageSettings">
          <h2>街景设置</h2>
          <ChevronDownIcon class="collapsible-indicator absolute top-0 right-0" />
        </div>
        <div class="flex-1 min-h-0 overflow-y-auto">
          <Collapsible :is-open="panels.coverageSettings" class="p-1">
            <Checkbox v-if="!settings.rejectOfficial" v-model="settings.rejectUnofficial">拒绝非官方街景</Checkbox>

            <Checkbox v-if="settings.provider === 'yandex'" v-model="settings.rejectOfficial">寻找非官方街景</Checkbox>

            <div v-if="settings.rejectUnofficial && !settings.rejectOfficial">
              <Checkbox v-model="settings.rejectDateless">拒绝无日期的街景</Checkbox>

              <Checkbox v-if="!settings.rejectDescription" v-model="settings.rejectNoDescription">
                拒绝无描述的街景
              </Checkbox>

              <Checkbox v-model="settings.findNightCoverage" v-if="settings.provider === 'tencent'">
                寻找夜晚街景
              </Checkbox>

              <Checkbox v-model="settings.onlyOneInTimeframe"
                title="Only allow locations that don't have other nearby coverage in timeframe.">
                一个位置仅一张街景
              </Checkbox>

              <Checkbox v-model="settings.checkLinks">检查相邻街景</Checkbox>
              <div v-if="settings.checkLinks" class="flex items-center justify-between ml-6">
                深度 :
                <div class="flex items-center gap-2">
                  {{ settings.linksDepth }}
                  <input type="range" v-model.number="settings.linksDepth" min="1" max="10" />
                </div>
              </div>

              <Checkbox v-model="settings.findByGeneration.enabled"
                v-if="['apple', 'bing', 'yandex'].includes(settings.provider)">根据街景种类/相机代数过滤</Checkbox>
              <div v-if="settings.findByGeneration.enabled && settings.provider === 'apple'" class="ml-6">
                <Checkbox v-model="settings.findByGeneration.apple.bigcam">Big Camera</Checkbox>
                <Checkbox v-model="settings.findByGeneration.apple.smallcam">Small Camera</Checkbox>
                <Checkbox v-model="settings.findByGeneration.apple.backpack">Backpack</Checkbox>
              </div>
              <div v-if="settings.findByGeneration.enabled && settings.provider === 'bing'" class="ml-6">
                <Checkbox v-model="settings.findByGeneration.bing[3]">TomTom</Checkbox>
                <Checkbox v-model="settings.findByGeneration.bing[4]">Bing</Checkbox>
              </div>
              <div v-if="settings.findByGeneration.enabled && settings.provider === 'yandex'" class="ml-6">
                <Checkbox v-model="settings.findByGeneration.yandex[1]">Gen 1</Checkbox>
                <Checkbox v-model="settings.findByGeneration.yandex[2]">Gen 2</Checkbox>
                <Checkbox v-model="settings.findByGeneration.yandex.trekker">徒步者</Checkbox>
              </div>
            </div>

            <div v-if="!settings.selectMonths" class="flex flex-col gap-0.5">
              <div class="flex justify-between">
                从 :
                <input type="month" v-model="settings.fromDate" min="2007-01" :max="currentDate" />
              </div>
              <div class="flex justify-between">
                至 :
                <input type="month" v-model="settings.toDate" min="2007-01" :max="currentDate" />
              </div>
            </div>

            <div v-if="!settings.rejectOfficial">
              <Checkbox v-model="settings.selectMonths">按月份过滤</Checkbox>
              <div v-if="settings.selectMonths" class="flex flex-col gap-0.5 ml-6">
                <div>
                  从
                  <select v-model="settings.fromMonth">
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                  至
                  <select v-model="settings.toMonth">
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
                <div>
                  在
                  <input type="number" v-model.number="settings.fromYear" min="2007" />
                  和
                  <input type="number" v-model.number="settings.toYear" min="2007" />
                  之间
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <Checkbox v-model="settings.filterByMinutes.enabled">按分钟过滤</Checkbox>
              <div v-if="settings.filterByMinutes.enabled" class="flex items-center">
                <span class="ml-6">
                  {{ Math.floor(settings.filterByMinutes.range[0] / 60).toString().padStart(2, '0') }}:{{
                    (settings.filterByMinutes.range[0] % 60).toString().padStart(2, '0') }}
                  -
                  {{ Math.floor(settings.filterByMinutes.range[1] / 60).toString().padStart(2, '0') }}:{{
                    (settings.filterByMinutes.range[1] % 60).toString().padStart(2, '0') }}
                </span>
                <Slider v-model="settings.filterByMinutes.range" :min="0" :max="1439" :step="5" :showTooltip="'focus'"
                  :range="true" class="w-40 ml-4 mr-4" :format="val => {
                    const h = Math.floor(val / 60).toString().padStart(2, '0')
                    const m = Math.floor(val % 60).toString().padStart(2, '0')
                    return `${h}:${m}`
                  }" />
              </div>
            </div>

            <Checkbox v-model="settings.checkAllDates">检查历史街景</Checkbox>

            <Checkbox v-if="settings.rejectUnofficial && !settings.rejectOfficial" v-model="settings.randomInTimeline">
              从历史街景中随机选择
            </Checkbox>
          </Collapsible>
        </div>
      </div>

      <div v-if="!state.started && settings.rejectUnofficial && !settings.rejectOfficial"
        class="container settings flex flex-col flex-1 min-h-0">
        <div class="cursor-pointer relative" @click="panels.mapMakingSettings = !panels.mapMakingSettings">
          <h2>题库设置</h2>
          <ChevronDownIcon class="collapsible-indicator absolute top-0 right-0" />
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto">
          <Collapsible :is-open="panels.mapMakingSettings" class="p-1">
            <div class="flex items-center gap-1 relative">
              <Checkbox v-model="settings.searchInDescription.enabled">根据街景描述过滤
              </Checkbox>
              <Tooltip>
                您可以输入由逗号分开的多个搜索关键词。
              </Tooltip>
            </div>

            <div v-if="settings.searchInDescription.enabled" class="space-y-0.5 ml-6 py-1">
              <div class="flex justify-between items-center gap-1">
                <select v-model="settings.searchInDescription.filterType">
                  <option value="include">包括</option>
                  <option value="exclude">排除</option>
                </select>
                <input type="text" v-model.trim="settings.searchInDescription.searchTerms" class="w-full" />
              </div>

              <div class="flex justify-between items-center gap-2">
                <div class="flex items-center gap-1 relative">
                  Search mode
                  <Tooltip>
                    <strong>Search modes:</strong><br />
                    • <strong>contains</strong>: anywhere in text<br />
                    • <strong>fullword</strong>: exact word<br />
                    • <strong>sectionmatch</strong>: exact comma-separated section<br />
                    (eg: 901 N Main Ave, <strong>Springfield</strong>, Missouri)<br />
                    • <strong>startswith</strong>: beginning of word<br />
                    • <strong>endswith</strong>: end of word<br />
                  </Tooltip>
                </div>
                <select v-model="settings.searchInDescription.searchMode">
                  <option value="contains">contains</option>
                  <option value="fullword">fullword</option>
                  <option value="sectionmatch">sectionmatch</option>
                  <option value="startswith">startswith</option>
                  <option value="endswith">endswith</option>
                </select>
              </div>
            </div>

            <Checkbox v-model="settings.filterByLinksLength.enabled">
              按相邻街景数量过滤
            </Checkbox>
            <div v-if="settings.filterByLinksLength.enabled" class="ml-6">
              <label class="flex items-center justify-between">
                <div class="flex items-center gap-1 relative">
                  范围
                  <Tooltip>
                    0 : 孤立街景<br />
                    1 : 道路尽头<br />
                    > 2 : 路口
                  </Tooltip>
                </div>
                <Slider v-model="settings.filterByLinksLength.range" :min="0" :max="5" tooltipPosition="bottom"
                  class="w-32 pr-2" />
              </label>
            </div>

            <Checkbox v-if="['apple', 'bing', 'baidu'].includes(settings.provider)"
              v-model="settings.filterByAltitude.enabled">
              根据海拔高度过滤</Checkbox>
            <div v-if="settings.filterByAltitude.enabled" class="flex items-center ml-6 gap-2">
              <input v-model.number="settings.filterByAltitude.range[0]" type="number" :min="-200" :max="8848"
                class="w-20 px-1 border rounded text-center" />米
              <span>~</span>
              <input v-model.number="settings.filterByAltitude.range[1]" type="number" :min="-200" :max="8848"
                class="w-20 px-1 border rounded text-center" />米
            </div>

            <Checkbox v-model="settings.getCurve"> 寻找路弯街景 </Checkbox>

            <label v-if="settings.getCurve" class="ml-6 flex items-center justify-between">
              最小弯曲角度 ({{ settings.minCurveAngle }}°)
              <input type="range" v-model.number="settings.minCurveAngle" min="5" max="90" />
            </label>

            <Checkbox v-model="settings.heading.adjust">调整视角朝向</Checkbox>
            <div v-if="settings.heading.adjust" class="ml-6">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="settings.heading.reference" value="link" />
                向路边
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="settings.heading.reference" value="forward" />
                向车头
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="settings.heading.reference" value="backward" />
                向车尾
              </label>
              <label class="flex items-center justify-between">
                偏移度
                <Slider v-model="settings.heading.range" :min="-180" :max="180" tooltipPosition="bottom"
                  class="w-32 pr-2" />
              </label>
              <small>0° 和道路保持一致方向。</small>
              <Checkbox v-model="settings.heading.randomInRange">随机偏移</Checkbox>
            </div>

            <div class="flex items-center justify-between">
              <Checkbox v-model="settings.pitch.adjust">调整俯仰角度</Checkbox>
              <Slider v-if="settings.pitch.adjust" v-model="settings.pitch.range" :min="-90" :max="90"
                tooltipPosition="bottom" class="w-32 pr-2" />
            </div>
            <div v-if="settings.pitch.adjust" class="ml-6">
              <small>默认 0°， -90° 对准地面，+90° 对准天空</small>
              <Checkbox v-model="settings.pitch.randomInRange">随机取值</Checkbox>
            </div>

            <div class="flex items-center justify-between">
              <Checkbox v-model="settings.zoom.adjust">调整缩放水平</Checkbox>
              <Slider v-if="settings.zoom.adjust" v-model="settings.zoom.range" :min="0" :max="4" :step="-1"
                tooltipPosition="top" class="w-36 pr-2 mr-2" />
            </div>
            <Checkbox v-if="settings.zoom.adjust" v-model="settings.zoom.randomInRange" class="ml-6">随机取值
            </Checkbox>
          </Collapsible>
        </div>
      </div>

      <div class="container flex flex-col">
        <div class="cursor-pointer relative" @click="panels.marker = !panels.marker">
          <h2>标记</h2>
          <ChevronDownIcon class="collapsible-indicator absolute top-0 right-0" />
        </div>

        <Collapsible :is-open="panels.marker" class="p-1">
          <Checkbox v-model="settings.markers.newRoad" v-on:change="updateMarkerLayers('newRoad')">
            <span class="h-3 w-3 bg-[#CA283F] rounded-full"></span>New Road
          </Checkbox>
          <Checkbox v-model="settings.markers.gen4" @change="updateMarkerLayers('gen4')">
            <span class="h-3 w-3 bg-[#2880CA] rounded-full"></span>
            Update
          </Checkbox>
          <Checkbox v-model="settings.markers.cluster" v-on:change="updateClusters" title="For lag reduction.">
            <span class="inline-block w-3 h-3 rounded-full" style="background: linear-gradient(
              45deg,
              #FF5F6D 0%,
              #FFC371 20%,
              #F9F871 40%,
              #A1FFCE 60%,
              #58CFFB 80%,
              #845EC2 100%
            );">
            </span>
            聚合标记
          </Checkbox>
          <Button :disabled="!totalLocs" size="sm" variant="warning"
            class="mt-2 w-full justify-center flex items-center gap-1"
            title="Clear markers (for performance, this won't erase your generated locations)" @click="clearMarkers">
            <MarkerIcon class="w-5 h-5" />清理标记
          </Button>
        </Collapsible>
      </div>

      <Button v-if="canBeStarted" @click="handleClickStart" :variant="state.started ? 'danger' : 'primary'"
        title="Space bar/Enter">{{ state.started ? '暂停' : '开始' }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { onMounted, watch, computed, ref } from 'vue'
import { useStorage, useColorMode } from '@vueuse/core'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { llToPX } from 'web-merc-projection'

import Slider from '@vueform/slider'
import Collapsible from '@/components/Elements/Collapsible.vue'
import Button from '@/components/Elements/Button.vue'
import Checkbox from '@/components/Elements/Checkbox.vue'
import Spinner from '@/components/Elements/Spinner.vue'
import Tooltip from '@/components/Elements/Tooltip.vue'
import Logo from '@/components/Elements/Logo.vue'
import Clipboard from '@/components/Clipboard.vue'
import ExportToJSON from '@/components/ExportToJSON.vue'
import ExportToCSV from '@/components/ExportToCSV.vue'
import FileImportIcon from '@/assets/icons/file-import.svg'
import FileExportIcon from '@/assets/icons/file-export.svg'
import MarkerIcon from '@/assets/icons/marker.svg'
import TrashBinIcon from '@/assets/icons/trash-bin.svg'
import ChevronDownIcon from '@/assets/icons/chevron-down.svg'

import { useStore } from '@/store'
import { settings } from '@/settings'

import {
  L,
  initMap,
  toggleMap,
  selectLayer,
  deselectLayer,
  toggleLayer,
  importLayer,
  exportLayer,
  updateMarkerLayers,
  availableLayers,
  markerLayers,
  updateClusters,
  clearMarkers,
  currentZoom,
  icons,
  type LayerMeta,
} from '@/map'

import { blueLineDetector } from '@/composables/blueLineDetector'
import { getTileUrl, getTileColorPresence } from '@/composables/tileColorDetector'
import {
  sendNotification,
  randomPointInPoly,
  isOfficial,
  hasAnyDescription,
  isAcceptableCurve,
  getCameraGeneration,
  searchInDescription,
  getCurrentDate,
  parseDate,
  extractDateFromPanoId,
  isDate,
  randomInRange,
  distanceBetween,
  readFileAsText,
  getPolygonName,
  changePolygonName,
  tencentToGcj02
} from '@/composables/utils.ts'
import StreetViewProviders from './providers'
import Clipboard_Prefix from './components/Clipboard_Prefix.vue'
import { tooltip } from 'leaflet'
const { currentDate } = getCurrentDate()
const themeMode = useColorMode()

/*watch(
  () => settings.rejectOfficial,
  (newVal) => {
    if (newVal) {
      settings.rejectUnofficial = false
    }
  },
)*/

watch(
  () => settings.notification.enabled,
  async (enabled) => {
    if (enabled === true && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          settings.notification.enabled = false
          alert('Notification permission denied.')
        }
      } catch (err) {
        console.warn('Notification request failed:', err)
        settings.notification.enabled = false
      }
    }
  }
)

const panels = useStorage('map_generator__panels_v1', {
  general: true,
  layer: true,
  generatorSettings: true,
  coverageSettings: true,
  mapMakingSettings: true,
  marker: true,
})

const { selected, select, state } = useStore()
const allFoundPanoIds = new Set<string>()
const generationStartTime = ref<number>(0)

const canBeStarted = computed(() =>
  selected.value.some((country) => country.found.length < country.nbNeeded),
)
const totalLocs = computed(() =>
  selected.value.reduce((sum, country) => sum + country.found.length, 0),
)

function clearPolygon(polygon: Polygon) {
  Object.values(markerLayers).forEach((markerLayer) => {
    const toRemove = markerLayer.getLayers().filter((layer) => {
      const marker = layer as L.Marker
      return marker.polygonID === polygon._leaflet_id
    })
    toRemove.forEach((marker) => {
      markerLayer.removeLayer(marker)
    })
  })
  polygon.found.length = 0
}

function clearAllLocations() {
  for (const polygon of selected.value) {
    polygon.found.length = 0
  }
  clearMarkers()
}

onMounted(async () => {
  await initMap('map')
})

// Process
document.onkeydown = (event) => {
  const target = event.target as HTMLInputElement
  const tag = target.tagName.toLowerCase()
  if (tag === 'input' && target.type === 'text') return

  if (event.key === ' ') {
    handleClickStart()
  }
}

const handleClickStart = () => {
  state.started = !state.started
  if (state.started) {
    generationStartTime.value = Date.now()
  }
  start()
}

async function start() {
  if (settings.oneCountryAtATime)
    for (const polygon of selected.value) await generate(polygon as Polygon)

  const generator = []
  for (const polygon of selected.value) {
    for (let i = 0; i < settings.numOfGenerators; i++) {
      generator.push(generate(polygon as Polygon))
    }
  }
  await Promise.all(generator)
  state.started = false
}

async function generate(polygon: Polygon) {
  let detector
  if (settings.onlyCheckBlueLines) {
    const bounds = polygon.getBounds()
    const boundsNW = { lat: bounds.getNorth(), lng: bounds.getWest() }
    const boundsSE = { lat: bounds.getSouth(), lng: bounds.getEast() }
    detector = await blueLineDetector(boundsNW, boundsSE)
  }

  while (polygon.found.length < polygon.nbNeeded) {
    if (!state.started) return
    polygon.isProcessing = true

    const randomCoords = []
    const n = Math.min(polygon.nbNeeded * 100, settings.speed)

    while (randomCoords.length < n) {
      const point = randomPointInPoly(polygon)
      if (
        booleanPointInPolygon([point.lng, point.lat], polygon.feature) &&
        (!settings.onlyCheckBlueLines || detector(point.lat, point.lng, settings.radius))
      ) {
        randomCoords.push(point)
      }
    }

    const chunkSize = settings.findRegions ? 1 : 75
    for (const locationGroup of randomCoords.chunk(chunkSize)) {
      await Promise.allSettled(locationGroup.map((l) => getLoc(l, polygon)))
    }
  }
  polygon.isProcessing = false
}

function getPanoramaRequest(
  loc: LatLng
): StreetViewLocationRequest {
  return {
    location: loc,
    radius: settings.radius,
  }
}


async function getLoc(loc: LatLng, polygon: Polygon) {
  return StreetViewProviders.getPanorama(settings.provider, getPanoramaRequest(loc), (res, status) => {
    if (status != 'OK' || !res || !res.location) return false

    if (settings.searchInDescription.enabled) {
      const descriptionMatchesSearch = searchInDescription(
        res.location,
        settings.searchInDescription,
      )
      if (!descriptionMatchesSearch) return false
    }

    if (settings.rejectUnofficial && !settings.rejectOfficial) {
      // Reject trekkers
      if (
        settings.rejectNoDescription &&
        !settings.rejectDescription &&
        !hasAnyDescription(res.location)
      )
        return false

      // Find trekkers
      if (settings.rejectDescription) {
        if (settings.provider === 'apple') {
          if (res.location.description != 'backpack') return false
        }
        else {
          if (hasAnyDescription(res.location)) return false
        }
      }

      // Exclude Yandex Unofficial
      if (settings.provider === 'yandex' && !res.copyright?.includes('Yandex')) return false
    }

    if (settings.findRegions) {
      settings.checkAllDates = false
      let i = 0
      while (i < polygon.found.length) {
        if (distanceBetween(polygon.found[i], loc) < settings.regionRadius * 1000) {
          return false
        }
        i++
      }
    }

    if (settings.rejectOfficial) {
      if (isOfficial(res.location.pano, settings.provider)) return false
      if (settings.findPhotospheres && !isPhotosphere(res)) return false
      if (settings.findDrones && !isDrone(res)) return false
    }

    if (settings.findNightCoverage && settings.provider === 'tencent') {
      if (!res.location.shortDescription) return false
      return getPano(res.location.shortDescription, polygon)
    }

    if (settings.filterByMinutes.enabled) {
      var panoMinutes
      switch (settings.provider) {
        case 'baidu':
          panoMinutes = Number(res.location.pano.slice(16, 18)) * 60 + Number(res.location.pano.slice(18, 20))
          break
        case 'tencent':
          panoMinutes = Number(res.location.pano.slice(14, 16)) * 60 + Number(res.location.pano.slice(16, 18))
          if (
            res.location.shortDescription &&
            res.location.pano == res.location.shortDescription) panoMinutes += 1200
          break
        case 'apple':
        case 'bing':
        case 'yandex':
        case 'kakao':
          panoMinutes = Number(res.imageDate.slice(11, 13)) * 60 + Number(res.imageDate.slice(14, 16))
          break
      }

      if (panoMinutes < settings.filterByMinutes.range[0] || panoMinutes > settings.filterByMinutes.range[1]) return false
    }

    if (settings.randomInTimeline && res.time) {
      const randomIndex = Math.floor(Math.random() * res.time.length)
      const randomPano = res.time[randomIndex]
      const panoDate = Object.values(randomPano).find((val) => val instanceof Date)
      const parsedDate = panoDate ? panoDate.getTime() : undefined
      if (
        parsedDate &&
        (parsedDate < Date.parse(settings.fromDate) || parsedDate > Date.parse(settings.toDate))
      )
        return false
      getPano(randomPano.pano, polygon)
    }

    if (
      settings.checkAllDates &&
      !settings.selectMonths &&
      !settings.rejectOfficial &&
      !settings.randomInTimeline
    ) {
      if (!res.time?.length) return false
      const fromDate = Date.parse(settings.fromDate)
      const toDate = Date.parse(settings.toDate)
      let dateWithin = false
      for (const loc of res.time) {
        if (settings.rejectUnofficial && !isOfficial(loc.pano, settings.provider)) continue

        const date = Object.values(loc).find((val) => val instanceof Date)
        const iDate = parseDate(date)
        if (iDate >= fromDate && iDate <= toDate) {
          // if date ranges from fromDate to toDate, set dateWithin to true and stop the loop
          dateWithin = true
          getPano(loc.pano, polygon)
        }
      }
      if (!dateWithin) return false
    } else {
      if (settings.rejectDateless && !res.imageDate) return false
      if (
        res.imageDate &&
        (Date.parse(res.imageDate) < Date.parse(settings.fromDate) ||
          Date.parse(res.imageDate) > Date.parse(settings.toDate))
      ) {
        return false
      }
      getPano(res.location.pano, polygon)
    }

    return true
  }
  )
}

async function isPanoGood(pano: StreetViewPanoramaData) {
  if (settings.rejectUnofficial && !settings.rejectOfficial) {
    if (!pano.location || !isOfficial(pano.location.pano, settings.provider)) return false
    // Reject trekkers
    if (
      settings.rejectNoDescription &&
      !settings.rejectDescription &&
      !hasAnyDescription(pano.location)
    )
      return false

    // Find trekkers
    if (settings.rejectDescription && hasAnyDescription(pano.location)) return false

    if (settings.filterByLinksLength.enabled) {
      const links = pano.links ?? []
      if (
        links.length < settings.filterByLinksLength.range[0] ||
        links.length > settings.filterByLinksLength.range[1]
      )
        return
    }

    // Find Generation
    if (
      ['apple', 'yandex', 'bing'].includes(settings.provider) &&
      settings.findByGeneration.enabled &&
      ((!settings.rejectOfficial && !settings.checkAllDates) || settings.selectMonths)
    ) {
      const gen = getCameraGeneration(pano, settings.provider)
      if (gen === 0) return false
      if (!settings.findByGeneration[settings.provider][gen]) return false
    }

    if (settings.filterByAltitude.enabled) {

      if (
        pano.location.altitude < settings.filterByAltitude.range[0] ||
        pano.location.altitude > settings.filterByAltitude.range[1]
      )
        return false
    }

    if (settings.getCurve) {
      const links = pano.links ?? []
      if (!isAcceptableCurve(links, settings.minCurveAngle)) return false
    }

    if (settings.findByTileColor.enabled) {
      const latLng = pano.location.latLng
      if (!latLng) return false
      const anyMatch = await getTileColorPresence(
        { lat: latLng.lat(), lng: latLng.lng() },
        settings.findByTileColor,
      )
      if (!anyMatch) return false
      // debug/preview tile
      // const tileUrl = getTileUrl(
      //   { lat: latLng.lat(), lng: latLng.lng() },
      //   settings.findByTileColor.tileProvider,
      //   settings.findByTileColor.zoom,
      // )
      // console.log('🚀 ~ tileUrl:', tileUrl)
    }
  }

  if (settings.rejectDateless && !pano.imageDate) return false

  const fromDate = Date.parse(settings.fromDate)
  const toDate = Date.parse(settings.toDate)
  const locDate = Date.parse(pano.imageDate)
  const fromMonth = settings.fromMonth
  const toMonth = settings.toMonth
  const fromYear = settings.fromYear
  const toYear = settings.toYear

  if (!settings.selectMonths) {
    if (!settings.checkAllDates || settings.rejectOfficial) {
      if (locDate < fromDate || locDate > toDate) return false
    }
  }

  if (settings.onlyOneInTimeframe) {
    if (!pano.time?.length) return false
    for (const loc of pano.time) {
      if (settings.rejectUnofficial && !isOfficial(loc.pano, settings.provider)) continue
      if (loc.pano == pano.location?.pano) continue
      const date = Object.values(loc).find((val) => val instanceof Date)
      const iDate = parseDate(date)
      if (iDate >= fromDate && iDate <= toDate) return false
    }
  }

  if (settings.checkAllDates && !settings.selectMonths && !settings.rejectOfficial) {
    if (!pano.time?.length) return false

    if (
      settings.findByGeneration.enabled &&
      ['apple', 'yandex', 'bing'].includes(settings.provider)
    ) {
      const gen = getCameraGeneration(pano, settings.provider)
      if (gen === 0) return false
      if (!settings.findByGeneration[settings.provider][gen]) return false
    }

    let dateWithin = false
    for (let i = 0; i < pano.time.length; i++) {
      if (settings.rejectUnofficial && !isOfficial(pano.time[i].pano, settings.provider)) continue

      const timeframeDate = Object.values(pano.time[i]).find((val) => isDate(val))
      const iDate = parseDate(timeframeDate)

      if (iDate >= fromDate && iDate <= toDate) {
        dateWithin = true
        break
      }
    }
    if (!dateWithin) return false
  }

  if (settings.selectMonths && !settings.rejectOfficial) {
    if (!pano.time?.length) return false
    let dateWithin = false

    if (settings.checkAllDates) {
      for (let i = 0; i < pano.time.length; i++) {
        if (settings.rejectUnofficial && !isOfficial(pano.time[i].pano, settings.provider)) continue

        const timeframeDate = Object.values(pano.time[i]).find((val) => isDate(val))
        const iDateMonth = timeframeDate.getMonth() + 1
        const iDateYear = timeframeDate.getFullYear()

        if (fromMonth <= toMonth) {
          if (
            iDateMonth >= fromMonth &&
            iDateMonth <= toMonth &&
            iDateYear >= fromYear &&
            iDateYear <= toYear
          ) {
            dateWithin = true
            break
          }
        } else {
          if (
            (iDateMonth >= fromMonth || iDateMonth <= toMonth) &&
            iDateYear >= fromYear &&
            iDateYear <= toYear
          ) {
            dateWithin = true
            break
          }
        }
      }
      if (!dateWithin) return false
    } else {
      if (pano.imageDate.slice(0, 4) < fromYear || pano.imageDate.slice(0, 4) > toYear) return false
      if (fromMonth <= toMonth) {
        if (pano.imageDate.slice(5) < fromMonth || pano.imageDate.slice(5) > toMonth) return false
      } else {
        if (pano.imageDate.slice(5) < fromMonth && pano.imageDate.slice(5) > toMonth) return false
      }
    }
  }

  return true
}

function getPano(id: string, polygon: Polygon) {
  return getPanoDeep(id, polygon, 0)
}

function getPanoDeep(id: string, polygon: Polygon, depth: number) {
  if (depth > settings.linksDepth) return
  if (polygon.checkedPanos.has(id)) return
  else polygon.checkedPanos.add(id)

  StreetViewProviders.getPanorama(settings.provider, { pano: id }, async (pano, status) => {
    if (status == 'UNKNOWN_ERROR') {
      polygon.checkedPanos.delete(id)
      return getPanoDeep(id, polygon, depth)
    } else if (status != 'OK') return

    const inCountry = booleanPointInPolygon(
      [pano.location.latLng.lng, pano.location.latLng.lat],
      polygon.feature,
    )
    const isPanoGoodAndInCountry = (await isPanoGood(pano)) && inCountry

    if (settings.checkAllDates && !settings.selectMonths && pano.time) {
      const fromDate = Date.parse(settings.fromDate)
      const toDate = Date.parse(settings.toDate)

      for (const loc of pano.time) {
        if (settings.rejectUnofficial && !isOfficial(loc.pano, settings.provider)) continue

        const date = Object.values(loc).find((val) => val instanceof Date)
        const iDate = parseDate(date)
        if (iDate >= fromDate && iDate <= toDate) {
          // if date ranges from fromDate to toDate, set dateWithin to true and stop the loop
          getPanoDeep(loc.pano, polygon, isPanoGoodAndInCountry ? 1 : depth + 1)
          // TODO: add settings.onlyOneLoc
          // if(settings.onlyOneLoc)break;
        }
      }
    }
    if (settings.checkLinks) {
      if (pano.links) {
        for (const loc of pano.links) {
          getPanoDeep(loc.pano, polygon, isPanoGoodAndInCountry ? 1 : depth + 1)
        }
      }
      if (pano.time) {
        for (const loc of pano.time) {
          getPanoDeep(loc.pano, polygon, isPanoGoodAndInCountry ? 1 : depth + 1)
        }
      }
    }
    if (isPanoGoodAndInCountry) {
      addLoc(pano, polygon)
    }
    return pano
  })
}

function addLoc(pano: StreetViewPanoramaData, polygon: Polygon) {
  let heading = 0
  if (settings.heading.adjust) {
    if (settings.heading.reference === 'forward') {
      heading = pano.tiles.centerHeading
    } else if (settings.heading.reference === 'backward') {
      heading = (pano.tiles.centerHeading + 180) % 360
    } else if (settings.heading.reference === 'link' && pano.links.length > 0) {
      heading = pano.links[0].heading
    }
    if (settings.heading.randomInRange) {
      heading += randomInRange(settings.heading.range[0], settings.heading.range[1])
    } else {
      heading += Math.random() < 0.5 ? settings.heading.range[0] : settings.heading.range[1]
    }
  }

  let pitch = 0
  if (settings.pitch.adjust) {
    if (settings.pitch.randomInRange) {
      pitch = randomInRange(settings.pitch.range[0], settings.pitch.range[1])
    } else {
      pitch = Math.random() < 0.5 ? settings.pitch.range[0] : settings.pitch.range[1]
    }
  }

  let zoom = 0
  if (settings.zoom.adjust) {
    if (settings.zoom.randomInRange) {
      zoom = randomInRange(settings.zoom.range[0], settings.zoom.range[1])
    } else {
      zoom = Math.random() < 0.5 ? settings.zoom.range[0] : settings.zoom.range[1]
    }
  }

  const location: Panorama = {
    panoId: pano.location.pano,
    lat: pano.location.latLng.lat,
    lng: pano.location.latLng.lng,
    heading,
    pitch,
    zoom,
    imageDate: pano.imageDate,
    links: [
      ...new Set(pano.links.map((loc) => loc.pano).concat(pano.time.map((loc) => loc.pano))),
    ].sort(),
  }

  const index = location.links.indexOf(pano.location.pano)
  if (index != -1) location.links.splice(index, 1)

  // Remove ari
  const time = settings.rejectUnofficial
    ? pano.time.filter((entry) => isOfficial(entry.pano, settings.provider))
    : pano.time
  const previousPano = time[time.length - 2]?.pano

  // New road
  if (!previousPano) {
    addLocation(location, polygon, icons.newLoc)
  } else {
    return addLocation(location, polygon, icons.gen4)
  }
}

function addLocation(
  location: Panorama,
  polygon: Polygon,
  iconType: L.Icon,
  addMarker: boolean = true,
) {
  if (allFoundPanoIds.has(location.panoId)) return
  allFoundPanoIds.add(location.panoId)

  let markerLayer = markerLayers['gen4']
  let zIndex = 1
  switch (iconType) {
    case icons.newLoc:
      markerLayer = markerLayers['newRoad']
      zIndex = 4
      break
  }

  if (polygon.found.length < polygon.nbNeeded) {
    polygon.found.push(location)
    if (settings.notification.anyLocation && polygon.found.length === 1) {
      const elapsedTime = ((Date.now() - generationStartTime.value) / 1000).toFixed(1)
      sendNotification('找到街景',
        `在${getPolygonName(polygon.feature.properties)}中找到一个街景，用时${elapsedTime}秒`
      )
    }

    if (settings.notification.onePolygonComplete && polygon.found.length >= polygon.nbNeeded) {
      const elapsedTime = ((Date.now() - generationStartTime.value) / 1000).toFixed(1)
      sendNotification('完成区域',
        `${getPolygonName(polygon.feature.properties)} 已完成， 用时${elapsedTime}秒`
      )
    }

    if (settings.notification.allPolygonsComplete) {
      const allComplete = selected.value.every(p => p.found.length >= p.nbNeeded)
      if (allComplete) {
        const elapsedTime = ((Date.now() - generationStartTime.value) / 1000).toFixed(1)
        sendNotification('生成完毕',
          `所有区域已生成完毕，用时${elapsedTime}秒`
        )
      }
    }
    if (addMarker) {
      const marker = L.marker([location.lat, location.lng], { icon: iconType, forceZIndex: zIndex })
        .on('click', () => {
          const heading = location.heading ?? 0
          const pitch = location.pitch ?? 0
          const zoom = location.zoom ?? 0
          let url = ''

          switch (settings.provider) {
            case 'yandex':
              url = `https://yandex.com/maps/?l=stv%2Csta&ll=${location.lng},${location.lat}&panorama%5Bdirection%5D=${heading},0&panorama%5Bfull%5D=true&panorama%5Bid%5D=${location.panoId}&panorama%5Bpoint%5D=${location.lng},${location.lat}`
              break
            case 'tencent':
              url = `https://qq-map.netlify.app/#base=roadmap&zoom=18&center=${location.lat},${location.lng}&pano=${location.panoId}&heading=${heading}&pitch=${pitch}&svz=0`
              break
            case 'baidu':
              url = `https://map.baidu.com/?newmap=1&shareurl=1&panotype=street&l=21&tn=B_NORMAL_MAP&sc=0&panoid=${location.panoId}&heading=${heading}&pitch=${pitch}&pid=${location.panoId}`
              break
            case 'apple':
              url = `https://lookmap.eu.pythonanywhere.com/#c=18/${location.lat}/${location.lng}&p=${location.lat}/${location.lng}&a=${heading}/${pitch}`
              break
            case 'bing':
              url = `https://www.bing.com/maps/?style=x&lvl=18&id=${location.panoId}&cp=${location.lat}%7E${location.lng}&dir=${heading || 0}&pi=${pitch || 0}`
              break
            case 'kakao':
              url = `https://map.kakao.com/?map_type=TYPE_MAP&map_attribute=ROADVIEW&panoid=${location.panoId}&pan=${heading}&tilt=${pitch}`
              break
            default:
              url = `about:blank`
          }

          window.open(url, '_blank')
        })
        .setZIndexOffset(zIndex)
        .addTo(markerLayer)
      marker.polygonID = polygon._leaflet_id
    }
  }
}

async function importLocations(e: Event, polygon: Polygon) {
  const input = e.target as HTMLInputElement
  if (!input.files) return

  for (const file of input.files) {
    const result = await readFileAsText(file)
    if (file.type == 'application/json') {
      let JSONResult
      try {
        JSONResult = JSON.parse(result)
        if (!JSONResult.customCoordinates) {
          throw Error
        }
      } catch (e) {
        alert('Invalid JSON.')
        console.error(e)
      }

      for (const location of JSONResult.customCoordinates) {
        if (!location.panoId || !location.lat || !location.lng) continue
        if (settings.checkImports) {
          for (const link of location.links) {
            if (!JSONResult.customCoordinates.some((loc: Panorama) => loc.panoId === link))
              getPano(link, polygon)
          }
        }
        addLocation(location, polygon, icons.gen4, settings.markersOnImport)
      }
    } else {
      alert('Unknown file type: ' + file.type + '. Only JSON may be imported.')
    }
  }
}

async function changeLocationsCap() {
  const input = prompt('What would you like to set the locations cap to ?')
  if (input === null) return
  const newCap = Math.abs(parseInt(input))
  if (isNaN(newCap)) return

  for (const polygon of selected.value) {
    polygon.nbNeeded = newCap
  }
}

function handleSpeedInput(e: Event) {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value)
  if (!value || value < 1) settings.speed = 1
  else if (value > 1000) settings.speed = 1000
}

function handleRadiusInput(e: Event) {
  const target = e.target as HTMLInputElement
  const value = parseInt(target.value)
  if (!value || value < 10) settings.radius = 10
  else if (value > 1000000) settings.radius = 1000000
}

window.onbeforeunload = function () {
  if (totalLocs.value > 0) {
    return 'Are you sure you want to stop the generator ?'
  }
}

  // window.type = !0
  // not sure if really needed
  ; (function (global: typeof L.Marker | undefined) {
    const MarkerMixin = {
      _updateZIndex: function (offset: number) {
        // @ts-expect-error error
        this._icon.style.zIndex = this.options.forceZIndex
          ? // @ts-expect-error error
          this.options.forceZIndex + (this.options.zIndexOffset || 0)
          : // @ts-expect-error error
          this._zIndex + offset
      },
      setForceZIndex: function (forceZIndex?: number | null) {
        // @ts-expect-error error
        this.options.forceZIndex = forceZIndex ? forceZIndex : null
      },
    }
    if (global) global.include(MarkerMixin)
  })(L.Marker)

Array.prototype.chunk = function (n) {
  if (!this.length) {
    return []
  }
  return [this.slice(0, n)].concat(this.slice(n).chunk(n))
}
</script>

<style>
@import '@vueform/slider/themes/default.css';

:root {
  --bg-color: white;
  --text-color: black;
  --container-bg: rgba(255, 255, 255, 0.7);
  --leaflet-bg: #f0f0f0;
  --leaflet-control-bg: rgba(255, 255, 255, 0.6);
  --leaflet-control-color: black;
}

html.dark {
  --bg-color: #121212;
  --text-color: #eee;
  --container-bg: rgba(0, 0, 0, 0.7);
  --leaflet-bg: #2c2c2c;
  --leaflet-control-bg: rgba(0, 0, 0, 0.6);
  --leaflet-control-color: white;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}

.container {
  background: var(--container-bg);
  color: var(--text-color);
}

.logo {
  color: var(--text-color);
  background-color: var(--container-bg);
}

input,
select,
option {
  color: var(--text-color);
  background-color: var(--container-bg) !important;
}

.leaflet-container {
  background-color: var(--leaflet-bg);
}

.leaflet-control-layers {
  background-color: var(--leaflet-control-bg);
  font-size: 10px;
  color: var(--text-color);
}

.slider-connects {
  background-color: rgba(0, 0, 0, 0.8);
}

.slider-tooltip {
  background-color: rgb(59, 59, 59);
  border: 1px solid black;
  font-size: 0.75rem;
  font-weight: 400;
  padding: 0px 4px;
}

#map {
  z-index: 0;
  height: 100vh;
}

/* Leaflet Controls */
#leaflet-ui {
  z-index: 99;
}

.leaflet-left .leaflet-control,
.leaflet-bottom .leaflet-control {
  margin-left: 4px;
  margin-bottom: 4px;
}
</style>
