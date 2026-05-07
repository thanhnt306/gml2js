import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { parseNetworkResponse } from '@/services/NetworkGraphService'
import type { NetworkGraphData } from '@/services/NetworkGraphService'

// Send a heartbeat every 5 minutes to prevent geometry-service TTL eviction.
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000

export const useNetworkStore = defineStore('network', () => {
  const networkData    = ref<NetworkGraphData | null>(null)
  const currentZoneId  = ref<number | null>(null)
  const isLoading      = ref(false)
  const error          = ref<string | null>(null)

  // Internal heartbeat timer — never exposed outside the store.
  let _heartbeatTimer: ReturnType<typeof setInterval> | null = null

  function _startHeartbeat(zoneId: number) {
    _stopHeartbeat()
    _heartbeatTimer = setInterval(async () => {
      try {
        await api.put(`/system/zones/${zoneId}/heartbeat`)
      } catch {
        // Silent — geometry-service may be temporarily down, not critical
      }
    }, HEARTBEAT_INTERVAL_MS)
  }

  function _stopHeartbeat() {
    if (_heartbeatTimer !== null) {
      clearInterval(_heartbeatTimer)
      _heartbeatTimer = null
    }
  }

  /**
   * Called from NetworkSetupWizard after parsing completes.
   * No API call needed — data is already available.
   */
  function setNetworkData(data: NetworkGraphData, zoneId: number) {
    networkData.value   = data
    currentZoneId.value = zoneId
    error.value         = null
    _startHeartbeat(zoneId)
  }

  /**
   * Called from ZonesTable when the user selects a zone.
   * Fetches network data directly from the database (no shapefile re-parse).
   * Results are cached by zoneId — selecting the same zone twice skips the fetch.
   */
  async function loadNetworkForZone(zoneId: number) {
    if (currentZoneId.value === zoneId && networkData.value) return // already cached
    isLoading.value  = true
    networkData.value = null
    error.value       = null
    try {
      const resp        = await api.get(`/gis/zones/${zoneId}/network`)
      networkData.value = parseNetworkResponse(resp.data, zoneId)
      currentZoneId.value = zoneId
      _startHeartbeat(zoneId)
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
    _stopHeartbeat()
    networkData.value   = null
    currentZoneId.value = null
    error.value         = null
  }

  async function startAutoConnect(zoneId: number, distance: number, diameter: number, inletLabels: string[] = []) {
    try {
      const resp = await api.post(`/geometry/zones/${zoneId}/network/auto-connect`, {
        distance,
        diameter,
        inlet_labels: inletLabels
      })
      return resp.data.taskId
    } catch (err) {
      console.error('Failed to start auto-connect:', err)
      throw err
    }
  }

  async function checkAutoConnectStatus(taskId: string) {
    const resp = await api.get(`/geometry/zones/network/tasks/${taskId}`)
    console.log('[checkAutoConnectStatus] raw resp.data:', JSON.stringify(resp.data).slice(0, 300))
    return resp.data
  }

  /**
   * Starts a Re-check connected task on the backend.
   */
  async function startReCheckConnected(zoneId: number, inletLabels: string[]) {
    const resp = await api.post(`/geometry/zones/${zoneId}/network/re-check-connected`, {
      inlet_labels: inletLabels
    })
    return resp.data.taskId as string
  }

  // Stop heartbeat on page unload (tab close / refresh).
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', _stopHeartbeat)
  }

  return {
    networkData,
    currentZoneId,
    isLoading,
    error,
    setNetworkData,
    loadNetworkForZone,
    clearNetwork,
    startAutoConnect,
    checkAutoConnectStatus,
    startReCheckConnected,
  }
})
