// Mock for C++ GeometryManager singleton

class GeometryManager {
    showSensorLocationsFromDatabase() {
        console.log("[GeometryManager] showSensorLocationsFromDatabase called")
    }

    removeSensorPlacements() {
        console.log("[GeometryManager] removeSensorPlacements called")
    }

    switchSymbolView(mode) {
        console.log(`[GeometryManager] switchSymbolView called with mode: ${mode}`)
    }

    changeBaseMapView(type) {
        console.log(`[GeometryManager] changeBaseMapView called with type: ${type}`)
    }

    showLayer(layerName) {
        console.log(`[GeometryManager] showLayer: ${layerName}`)
    }

    hideLayer(layerName) {
        console.log(`[GeometryManager] hideLayer: ${layerName}`)
    }
}

export default new GeometryManager()
