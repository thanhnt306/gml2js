import { defineStore } from 'pinia';
import { ref } from 'vue';
import ZoneService, { ZoneResponse, ZoneStatusResponse } from '@/services/ZoneService';

export const useZoneStore = defineStore('zone', () => {
    const zones = ref<ZoneResponse[]>([]);
    const isLoading = ref<boolean>(false);

    const zoneStatus = ref<ZoneStatusResponse | null>(null);
    const isStatusLoading = ref<boolean>(false);

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

    /**
     * Fetch the combined zone status tracking/analysis info.
     */
    const fetchZoneStatus = async () => {
        isStatusLoading.value = true;
        try {
            zoneStatus.value = await ZoneService.getZoneStatus();
        } catch (error) {
            console.error('[ZoneStore] Error fetching zone status:', error);
            zoneStatus.value = null;
        } finally {
            isStatusLoading.value = false;
        }
    };

    /** Add an inlet label to a specific zone. */
    const addInlet = (zoneId: number, label: string) => {
        const zone = zones.value.find(z => z.id === zoneId);
        if (zone) {
            if (!zone.inletLabels) zone.inletLabels = [];
            if (!zone.inletLabels.includes(label)) {
                zone.inletLabels.push(label);
            }
        }
    };

    /** Remove an inlet label from a specific zone. */
    const removeInlet = (zoneId: number, label: string) => {
        const zone = zones.value.find(z => z.id === zoneId);
        if (zone && zone.inletLabels) {
            zone.inletLabels = zone.inletLabels.filter(l => l !== label);
        }
    };

    /** Replace the whole inlet list for a specific zone. */
    const setInletLabels = (zoneId: number, labels: string[]) => {
        const zone = zones.value.find(z => z.id === zoneId);
        if (zone) {
            zone.inletLabels = [...labels];
        }
    };

    return {
        zones,
        isLoading,
        zoneStatus,
        isStatusLoading,
        fetchZones,
        fetchZoneStatus,
        addInlet,
        removeInlet,
        setInletLabels
    };
});
