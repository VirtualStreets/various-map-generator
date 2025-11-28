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
      class="bg-black/50 border border-neutral-500 rounded-sm max-h-48 overflow-y-auto"
    >
      <div
        v-for="(result, index) in searchResults"
        :key="index"
        class="px-2 py-1.5 border-b border-neutral-500/50 last:border-b-0 cursor-pointer hover:bg-black/70 transition-colors"
        :class="{ 'bg-black/70': selectedResult?.osm_id === result.osm_id }"
        @click="handleSelect(result)"
      >
        <div class="text-xs font-semibold text-primary truncate">
          {{ result.display_name.split(',')[0] }}
        </div>
        <div class="text-xs text-gray-400 truncate">
          {{ getAddressInfo(result) }}
        </div>
        <div v-if="isLoading && selectedResult?.osm_id === result.osm_id" class="text-xs text-gray-300 mt-1">
          Importing...
        </div>
      </div>
    </div>

    <div v-if="showResults && !hasResults && !isSearching" class="text-xs text-gray-400 px-2 py-2">
      No places found
    </div>
  </div>
</template>

<style scoped>
input[type='text'] {
  background-color: rgba(0, 0, 0, 0.5);
  text-align: center;
  border-radius: 0.125rem;
  outline: none;
  border: 1px solid rgb(115, 115, 115);
  padding: 0 0.5rem;
}

input[type='text']:hover {
  filter: brightness(1.2);
}

input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
