<script setup lang="ts">
import { ref, computed } from 'vue'
import { getOSMID, downloadGeoJSON, type SearchResult } from '@/composables/geojsonSearch'
import Button from '@/components/Elements/Button.vue'
import Tooltip from '@/components/Elements/Tooltip.vue'

const emit = defineEmits<{
  import: [data: GeoJSON.GeoJsonObject, name: string]
}>()

const searchInput = ref('')
const searchResults = ref<SearchResult[]>([])
const selectedResult = ref<SearchResult | null>(null)
const isSearching = ref(false)
const isLoading = ref(false)
const showResults = ref(false)
const error = ref('')

const hasResults = computed(() => searchResults.value.length > 0)

function getAddressInfo(result: SearchResult): string {
  // Build a detailed address from components
  const parts: string[] = []
  
  if (result.address) {
    const { city, county, state, region, country } = result.address
    if (city) parts.push(city)
    if (county && county !== city) parts.push(county)
    if (state && state !== city && state !== county) parts.push(state)
    if (region && region !== state && region !== city) parts.push(region)
  }
  
  if (parts.length === 0) {
    // Fallback: parse from display_name
    const displayParts = result.display_name.split(',')
    return displayParts.slice(0, 2).map(s => s.trim()).join(', ')
  }
  
  return parts.join(', ')
}

async function handleSearch() {
  if (!searchInput.value.trim()) return
  
  isSearching.value = true
  error.value = ''
  
  const results = await getOSMID(searchInput.value)
  if (results) {
    searchResults.value = results
    showResults.value = true
  } else {
    error.value = 'No results found'
    searchResults.value = []
    showResults.value = false
  }
  isSearching.value = false
}

async function handleSelect(result: SearchResult) {
  selectedResult.value = result
  isLoading.value = true
  error.value = ''
  
  try {
    const geojson = await downloadGeoJSON(result.osm_id)
    if (geojson) {
      // Use only the first part of display_name as polygon name
      const placeName = result.display_name.split(',')[0].trim()
      emit('import', geojson, placeName)
      resetSearch()
    } else {
      error.value = 'Failed to download GeoJSON'
    }
  } catch (err) {
    console.error('Error during import:', err)
    error.value = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
  }
  isLoading.value = false
}

function resetSearch() {
  searchInput.value = ''
  searchResults.value = []
  selectedResult.value = null
  showResults.value = false
  error.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleSearch()
  } else if (e.key === 'Escape') {
    resetSearch()
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2 relative">
      <div class="flex-1 flex items-center gap-1">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search place name or OSM ID..."
          class="flex-1 px-2 py-1"
          @keydown="handleKeydown"
          :disabled="isSearching || isLoading"
        />
        <Tooltip>
          Enter a place name (e.g., "Paris", "New York") or OSM ID (e.g., "71525") to search and import as polygon
        </Tooltip>
      </div>
      <Button
        size="sm"
        variant="primary"
        :disabled="!searchInput.trim() || isSearching || isLoading"
        @click="handleSearch"
      >
        {{ isSearching ? 'Searching...' : 'Search' }}
      </Button>
    </div>

    <div v-if="error" class="text-danger text-xs px-2 py-1 bg-danger/10 rounded-sm">
      {{ error }}
    </div>

    <div
      v-if="showResults && hasResults"
      class="rounded-sm max-h-48 overflow-y-auto geojson-results"
    >
      <div
        v-for="(result, index) in searchResults"
        :key="index"
        class="px-2 py-1.5 cursor-pointer transition-colors geojson-result-item"
        :class="{ 'geojson-result-selected': selectedResult?.osm_id === result.osm_id }"
        @click="handleSelect(result)"
      >
        <div class="text-xs font-semibold text-primary truncate">
          {{ result.display_name.split(',')[0] }}
        </div>
        <div class="text-xs truncate geojson-result-secondary">
          {{ getAddressInfo(result) }}
        </div>
        <div v-if="isLoading && selectedResult?.osm_id === result.osm_id" class="text-xs mt-1 geojson-loading">
          Importing...
        </div>
      </div>
    </div>

    <div v-if="showResults && !hasResults && !isSearching" class="text-xs px-2 py-2 geojson-empty">
      No places found
    </div>
  </div>
</template>

<style>
/* Light theme variables (default) */
:root {
  --geojson-input-bg: rgba(255, 255, 255, 0.9);
  --geojson-input-text: black;
  --geojson-input-border: rgb(180, 180, 180);
  --geojson-input-hover-brightness: 0.95;
  --geojson-results-bg: rgba(255, 255, 255, 0.7);
  --geojson-results-border: rgb(150, 150, 150);
  --geojson-result-text: black;
  --geojson-result-secondary-text: rgb(100, 100, 100);
  --geojson-result-hover-bg: rgba(83, 224, 170, 0.15);
  --geojson-result-selected-bg: rgba(83, 224, 170, 0.25);
  --geojson-result-divider: rgba(150, 150, 150, 0.3);
  --geojson-empty-text: rgb(100, 100, 100);
  --geojson-loading-text: rgb(80, 80, 80);
}

/* Dark theme variables */
html.dark {
  --geojson-input-bg: rgba(0, 0, 0, 0.8);
  --geojson-input-text: #eee;
  --geojson-input-border: rgb(115, 115, 115);
  --geojson-input-hover-brightness: 1.2;
  --geojson-results-bg: rgba(0, 0, 0, 0.9);
  --geojson-results-border: rgb(115, 115, 115);
  --geojson-result-text: #eee;
  --geojson-result-secondary-text: rgb(170, 170, 170);
  --geojson-result-hover-bg: rgba(83, 224, 170, 0.2);
  --geojson-result-selected-bg: rgba(83, 224, 170, 0.3);
  --geojson-result-divider: rgba(115, 115, 115, 0.5);
  --geojson-empty-text: rgb(170, 170, 170);
  --geojson-loading-text: rgb(200, 200, 200);
}
</style>

<style scoped>
input[type='text'] {
  background-color: var(--geojson-input-bg);
  color: var(--geojson-input-text);
  text-align: center;
  border-radius: 0.125rem;
  outline: none;
  border: 1px solid var(--geojson-input-border);
  padding: 0 0.5rem;
  transition: background-color 0.2s, border-color 0.2s, filter 0.2s;
}

input[type='text']:hover {
  filter: brightness(var(--geojson-input-hover-brightness));
}

input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.geojson-results {
  background-color: var(--geojson-results-bg);
  border: 0px solid var(--geojson-results-border);
  color: var(--geojson-result-text);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

html.dark .geojson-results {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.geojson-result-item {
  border-bottom: 1px solid var(--geojson-result-divider);
}

.geojson-result-item:last-child {
  border-bottom: none;
}

.geojson-result-item:hover {
  background-color: var(--geojson-result-hover-bg);
}

.geojson-result-item.geojson-result-selected {
  background-color: var(--geojson-result-selected-bg);
}

.geojson-result-secondary {
  color: var(--geojson-result-secondary-text);
}

.geojson-empty {
  color: var(--geojson-empty-text);
}

.geojson-loading {
  color: var(--geojson-loading-text);
}
</style>

<style>
/* Additional non-scoped styles if needed */
</style>
