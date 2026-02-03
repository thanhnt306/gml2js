// Mock for C++ GeometryManager singleton

class GeometryManager {
    showSensorLocationsFromDatabase(): void {
        console.log("[GeometryManager] showSensorLocationsFromDatabase called")
    }

    removeSensorPlacements(): void {
        console.log("[GeometryManager] removeSensorPlacements called")
    }

    switchSymbolView(mode: string): void {
        console.log(`[GeometryManager] switchSymbolView called with mode: ${mode}`)
    }

    changeBaseMapView(type: string): void {
        console.log(`[GeometryManager] changeBaseMapView called with type: ${type}`)
    }

    showLayer(layerName: string): void {
        console.log(`[GeometryManager] showLayer: ${layerName}`)
    }

    hideLayer(layerName: string): void {
        console.log(`[GeometryManager] hideLayer: ${layerName}`)
    }
}

export default new GeometryManager()
