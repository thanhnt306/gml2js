import { defineStore } from 'pinia';
import { ref } from 'vue';
import ZoneService, { ZoneResponse } from '@/services/ZoneService';

export const useZoneStore = defineStore('zone', () => {
    const zones = ref<ZoneResponse[]>([]);
    const isLoading = ref<boolean>(false);

    /**
     * Fetch the list of zones from the backend that the current user has access to.
     */
    const fetchZones = async () => {
        isLoading.value = true;
        try {
            zones.value = await ZoneService.getZones();
        } catch (error) {
            console.error('[ZoneStore] Error fetching zones:', error);
            // Optionally, we could show an error notification here based on application standards
            zones.value = [];
        } finally {
            isLoading.value = false;
        }
    };

    return {
        zones,
        isLoading,
        fetchZones
    };
});
