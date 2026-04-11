/**
 * useNetworkMap composable
 *
 * Encapsulates all ArcGIS JS SDK logic for rendering a water network
 * (junctions as Points, pipes as Polylines) on a MapView, and handling
 * node click detection for inlet selection.
 */

import { ref, shallowRef, onBeforeUnmount } from 'vue'
import EsriMap from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'
import Polyline from '@arcgis/core/geometry/Polyline'
import Extent from '@arcgis/core/geometry/Extent'
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol'
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol'
import type { NetworkNode, NetworkGraphData } from '@/services/NetworkGraphService'

// -------------------------------------------------------------------
// Node type → symbol color mapping
// -------------------------------------------------------------------
const NODE_COLORS: Record<string, string> = {
  junction:   '#4FC3F7',  // light blue
  meter:      '#FFB74D',  // orange
  valve:      '#E57373',  // red
  pump:       '#81C784',  // green
  tank:       '#BA68C8',  // purple
  reservoir:  '#64B5F6',  // blue
  inlet:      '#FFEB3B',  // yellow
}

const NODE_SIZES: Record<string, number> = {
  junction:   6,
  meter:      8,
  valve:      8,
  pump:       10,
  tank:       12,
  reservoir:  12,
  inlet:      10,
}

const PIPE_COLOR = '#90CAF9'        // light blue
const INLET_HIGHLIGHT_COLOR = '#FF5722'  // orange-red for selected inlet
const INLET_HIGHLIGHT_SIZE = 14

// -------------------------------------------------------------------
// Composable
// -------------------------------------------------------------------

export function useNetworkMap() {
  const mapView = shallowRef<MapView | null>(null)
  const pipeLayer = shallowRef<GraphicsLayer | null>(null)
  const nodeLayer = shallowRef<GraphicsLayer | null>(null)

  const isMapReady = ref(false)
  const isSelectingInlet = ref(false)
  const selectedInletLabels = ref<string[]>([])

  // Node lookup for quick access
  const nodeMap = new globalThis.Map<string, NetworkNode>()
  // Adjacency map: junction label → connected pipe labels
  const adjacency = new globalThis.Map<string, { pipeLabel: string; role: 'start' | 'stop' }[]>()

  // Click handler reference (for cleanup)
  let clickHandler: __esri.Handle | null = null
  // Track if popups were enabled before selection
  let popupsWereEnabled = true

  // -------------------------------------------------------------------
  // Initialize the ArcGIS map in a container element
  // -------------------------------------------------------------------
  function initMap(container: HTMLDivElement): MapView {
    const map = new EsriMap({
      basemap: 'dark-gray-vector',
    })

    pipeLayer.value = new GraphicsLayer({ id: 'pipes', title: 'Pipes' })
    nodeLayer.value = new GraphicsLayer({ id: 'nodes', title: 'Nodes' })

    // Add pipe layer first so nodes render on top
    map.addMany([pipeLayer.value, nodeLayer.value])

    const view = new MapView({
      container,
      map,
      center: [105.84, 21.028],
      zoom: 15,
      ui: { components: ['zoom'] },
      popup: {
        dockEnabled: false,
      },
      constraints: {
        maxZoom: 24, // Allow zooming in closer than the basemap's default limit
        minScale: 0,
        maxScale: 0
      }
    })

    view.when(() => {
      isMapReady.value = true
      console.log('[useNetworkMap] Map ready')
    })

    mapView.value = view
    return view
  }

  // -------------------------------------------------------------------
  // Render network data onto the map
  // -------------------------------------------------------------------
  function renderNetwork(data: NetworkGraphData) {
    if (!pipeLayer.value || !nodeLayer.value || !mapView.value) {
      console.warn('[useNetworkMap] Map not ready for rendering')
      return
    }

    // Clear existing graphics
    pipeLayer.value.removeAll()
    nodeLayer.value.removeAll()
    nodeMap.clear()
    adjacency.clear()

    // Build node lookup
    for (const node of data.nodes) {
      nodeMap.set(node.label, node)
    }

    // Build adjacency map
    for (const pipe of data.pipes) {
      if (!adjacency.has(pipe.start_node)) adjacency.set(pipe.start_node, [])
      if (!adjacency.has(pipe.stop_node)) adjacency.set(pipe.stop_node, [])
      adjacency.get(pipe.start_node)!.push({ pipeLabel: pipe.label, role: 'start' })
      adjacency.get(pipe.stop_node)!.push({ pipeLabel: pipe.label, role: 'stop' })
    }

    // Render pipes as Polyline graphics
    for (const pipe of data.pipes) {
      // Build path: prefer pipe.path from GeoJSON (may have intermediate vertices)
      // Fall back to startNode/stopNode lookup for backward compatibility
      let pathCoords: number[][]
      if (pipe.path && pipe.path.length >= 2) {
        pathCoords = pipe.path.map(([lon, lat]) => [lon, lat])
      } else {
        const startNode = nodeMap.get(pipe.start_node)
        const stopNode  = nodeMap.get(pipe.stop_node)
        if (!startNode || !stopNode) continue
        pathCoords = [[startNode.x, startNode.y], [stopNode.x, stopNode.y]]
      }

      const pipeGraphic = new Graphic({
        geometry: new Polyline({
          paths: [pathCoords],
          spatialReference: { wkid: 4326 },
        }),
        symbol: new SimpleLineSymbol({
          color: PIPE_COLOR,
          width: Math.max(1, (pipe.d_mm ?? 0) / 100),
          style: 'solid',
        }),
        attributes: {
          label:      pipe.label,
          start_node: pipe.start_node,
          stop_node:  pipe.stop_node,
          length_m:   pipe.length_m,
          d_mm:       pipe.d_mm,
          material:   pipe.material,
          type: 'pipe',
        },
        popupTemplate: {
          title: 'Pipe: {label}',
          content: [
            {
              type: 'fields',
              fieldInfos: [
                { fieldName: 'start_node', label: 'Start Node' },
                { fieldName: 'stop_node',  label: 'Stop Node' },
                { fieldName: 'length_m',   label: 'Length (m)' },
                { fieldName: 'd_mm',       label: 'Diameter (mm)' },
                { fieldName: 'material',   label: 'Material' },
              ]
            }
          ]
        }
      })

      pipeLayer.value.add(pipeGraphic)
    }


    // Render nodes as Point graphics
    for (const node of data.nodes) {
      const nodeGraphic = new Graphic({
        geometry: new Point({
          longitude: node.x,
          latitude: node.y,
          spatialReference: { wkid: 4326 },
        }),
        symbol: new SimpleMarkerSymbol({
          style: 'circle',
          color: NODE_COLORS[node.node_type] || NODE_COLORS.junction,
          size: NODE_SIZES[node.node_type] || 6,
          outline: {
            color: '#ffffff',
            width: 1,
          },
        }),
        attributes: {
          label: node.label,
          node_type: node.node_type,
          elev_m: node.elev_m,
          type: 'node',
        },
        popupTemplate: {
          title: '{node_type}: {label}',
          content: [
            {
              type: 'fields',
              fieldInfos: [
                { fieldName: 'label', label: 'Label' },
                { fieldName: 'node_type', label: 'Type' },
                { fieldName: 'elev_m', label: 'Elevation (m)' },
              ]
            }
          ]
        }
      })

      nodeLayer.value.add(nodeGraphic)
    }

    // Zoom to network extent
    zoomToExtent(data.extent)

    console.log(`[useNetworkMap] Rendered ${data.pipes.length} pipes, ${data.nodes.length} nodes`)
  }

  // -------------------------------------------------------------------
  // Zoom to extent
  // -------------------------------------------------------------------
  function zoomToExtent(ext: { xmin: number; ymin: number; xmax: number; ymax: number }) {
    if (!mapView.value) return

    const extent = new Extent({
      xmin: ext.xmin,
      ymin: ext.ymin,
      xmax: ext.xmax,
      ymax: ext.ymax,
      spatialReference: { wkid: 4326 }
    })

    mapView.value.goTo(extent, { duration: 1000 })
  }

  // -------------------------------------------------------------------
  // Enable inlet selection mode (hitTest on click)
  // -------------------------------------------------------------------
  function enableInletSelection(onNodeClicked: (nodeLabel: string) => void) {
    if (!mapView.value) return

    isSelectingInlet.value = true

    // Disable popup so click goes to our handler instead
    if (mapView.value.popup) {
      popupsWereEnabled = true
      mapView.value.popupEnabled = false
    }

    clickHandler = mapView.value.on('click', async (event) => {
      if (!mapView.value) return

      const response = await mapView.value.hitTest(event, {
        include: nodeLayer.value ? [nodeLayer.value] : [],
      })

      if (response.results.length > 0) {
        const hit = response.results[0]
        if (hit.type === 'graphic') {
          const graphic = hit.graphic
          if (graphic.attributes?.type === 'node') {
            const label = graphic.attributes.label
            onNodeClicked(label)
          }
        }
      }
    })
  }

  // -------------------------------------------------------------------
  // Disable inlet selection mode
  // -------------------------------------------------------------------
  function disableInletSelection() {
    isSelectingInlet.value = false

    if (clickHandler) {
      clickHandler.remove()
      clickHandler = null
    }

    // Re-enable popups
    if (mapView.value && popupsWereEnabled) {
      mapView.value.popupEnabled = true
    }
  }

  // -------------------------------------------------------------------
  // Highlight a node as inlet
  // -------------------------------------------------------------------
  function highlightAsInlet(nodeLabel: string) {
    if (!nodeLayer.value) return

    const graphic = nodeLayer.value.graphics.find(
      g => g.attributes?.label === nodeLabel
    )

    if (graphic) {
      graphic.symbol = new SimpleMarkerSymbol({
        style: 'diamond',
        color: INLET_HIGHLIGHT_COLOR,
        size: INLET_HIGHLIGHT_SIZE,
        outline: { color: '#ffffff', width: 2 },
      })

      if (!selectedInletLabels.value.includes(nodeLabel)) {
        selectedInletLabels.value.push(nodeLabel)
      }
    }
  }

  // -------------------------------------------------------------------
  // Remove inlet highlight from a node (undo)
  // -------------------------------------------------------------------
  function removeInletHighlight(nodeLabel: string) {
    if (!nodeLayer.value) return

    const node = nodeMap.get(nodeLabel)
    if (!node) return

    const graphic = nodeLayer.value.graphics.find(
      g => g.attributes?.label === nodeLabel
    )

    if (graphic) {
      graphic.symbol = new SimpleMarkerSymbol({
        style: 'circle',
        color: NODE_COLORS[node.node_type] || NODE_COLORS.junction,
        size: NODE_SIZES[node.node_type] || 6,
        outline: { color: '#ffffff', width: 1 },
      })
    }

    selectedInletLabels.value = selectedInletLabels.value.filter(l => l !== nodeLabel)
  }

  // -------------------------------------------------------------------
  // Undo last inlet selection
  // -------------------------------------------------------------------
  function undoLastInlet() {
    const last = selectedInletLabels.value.pop()
    if (last) {
      removeInletHighlight(last)
    }
  }

  // -------------------------------------------------------------------
  // Undo all inlet selections
  // -------------------------------------------------------------------
  function undoAllInlets() {
    const labels = [...selectedInletLabels.value]
    for (const label of labels) {
      removeInletHighlight(label)
    }
    selectedInletLabels.value = []
  }

  // -------------------------------------------------------------------
  // Search and zoom to a node by label
  // -------------------------------------------------------------------
  function searchAndZoomToNode(searchText: string): boolean {
    const node = nodeMap.get(searchText)
    if (!node || !mapView.value) return false

    mapView.value.goTo(
      { center: [node.x, node.y], zoom: 18 },
      { duration: 800 }
    )
    return true
  }

  // -------------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------------
  function destroy() {
    disableInletSelection()
    if (mapView.value) {
      mapView.value.destroy()
      mapView.value = null
    }
    pipeLayer.value = null
    nodeLayer.value = null
    nodeMap.clear()
    adjacency.clear()
  }

  onBeforeUnmount(() => {
    destroy()
  })

  return {
    // State
    mapView,
    isMapReady,
    isSelectingInlet,
    selectedInletLabels,

    // Methods
    initMap,
    renderNetwork,
    zoomToExtent,
    enableInletSelection,
    disableInletSelection,
    highlightAsInlet,
    removeInletHighlight,
    undoLastInlet,
    undoAllInlets,
    searchAndZoomToNode,
    destroy,
  }
}
