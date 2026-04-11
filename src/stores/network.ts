import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { parseNetworkResponse } from '@/services/NetworkGraphService'
import type { NetworkGraphData } from '@/services/NetworkGraphService'

export const useNetworkStore = defineStore('network', () => {
  const networkData = ref<NetworkGraphData | null>(null)
  const currentZoneId = ref<number | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Called from NetworkSetupWizard after parsing completes.
   * No API call needed — data is already available.
   */
  function setNetworkData(data: NetworkGraphData, zoneId: number) {
    networkData.value = data
    currentZoneId.value = zoneId
    error.value = null
  }

  /**
   * Called from ZonesTable when the user selects a zone.
   * Fetches network data directly from the database (no shapefile re-parse).
   * Results are cached by zoneId — selecting the same zone twice skips the fetch.
   */
  async function loadNetworkForZone(zoneId: number) {
    if (currentZoneId.value === zoneId && networkData.value) return // already cached
    isLoading.value = true
    networkData.value = null
    error.value = null
    try {
      const resp = await api.get(`/gis/zones/${zoneId}/network`)
      networkData.value = parseNetworkResponse(resp.data, zoneId)
      currentZoneId.value = zoneId
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to load network data'
      error.value = msg
      console.error('[NetworkStore] Failed to load network for zone', zoneId, err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clears cached network data (e.g., when changing zones or logging out).
   */
  function clearNetwork() {
    networkData.value = null
    currentZoneId.value = null
    error.value = null
  }

  return {
    networkData,
    currentZoneId,
    isLoading,
    error,
    setNetworkData,
    loadNetworkForZone,
    clearNetwork,
  }
})
