/**
 * Mock Network Graph Service
 *
 * Simulates a backend that processes uploaded shapefiles and returns
 * a water network graph (junctions + pipes) for map rendering.
 *
 * In production, this would be replaced by real API calls
 * (e.g. GET /gis/zones/:zoneId/network/graph).
 */

// -------------------------------------------------------------------
// Types (matching the real database schema)
// -------------------------------------------------------------------

export interface NetworkNode {
  label: string
  elev_m: number
  x: number          // longitude (WGS84)
  y: number          // latitude  (WGS84)
  node_type: 'junction' | 'meter' | 'valve' | 'pump' | 'tank' | 'reservoir' | 'inlet'
  dma_id: number
}

export interface NetworkPipe {
  label: string
  start_node: string  // junction label
  stop_node: string   // junction label
  length_m: number
  d_mm: number
  material: string
  dma_id: number
}

export interface NetworkExtent {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
}

export interface NetworkGraphData {
  nodes: NetworkNode[]
  pipes: NetworkPipe[]
  extent: NetworkExtent
}

// -------------------------------------------------------------------
// Mock Data — small realistic water network around Hanoi
// -------------------------------------------------------------------

const BASE_LON = 105.84
const BASE_LAT = 21.028

function pt(dLon: number, dLat: number): [number, number] {
  return [BASE_LON + dLon, BASE_LAT + dLat]
}

const MOCK_NODES: NetworkNode[] = [
  // Main trunk junctions
  { label: 'J-001', elev_m: 12.0, x: pt(0, 0)[0],           y: pt(0, 0)[1],           node_type: 'junction', dma_id: 1 },
  { label: 'J-002', elev_m: 11.5, x: pt(0.004, 0.001)[0],   y: pt(0.004, 0.001)[1],   node_type: 'junction', dma_id: 1 },
  { label: 'J-003', elev_m: 11.0, x: pt(0.008, 0)[0],       y: pt(0.008, 0)[1],       node_type: 'junction', dma_id: 1 },
  { label: 'J-004', elev_m: 10.5, x: pt(0.012, 0.002)[0],   y: pt(0.012, 0.002)[1],   node_type: 'junction', dma_id: 1 },
  { label: 'J-005', elev_m: 10.0, x: pt(0.016, 0)[0],       y: pt(0.016, 0)[1],       node_type: 'junction', dma_id: 1 },

  // Branch north
  { label: 'J-006', elev_m: 11.8, x: pt(0.004, 0.005)[0],   y: pt(0.004, 0.005)[1],   node_type: 'junction', dma_id: 1 },
  { label: 'J-007', elev_m: 11.3, x: pt(0.008, 0.006)[0],   y: pt(0.008, 0.006)[1],   node_type: 'junction', dma_id: 1 },
  { label: 'J-008', elev_m: 10.8, x: pt(0.012, 0.005)[0],   y: pt(0.012, 0.005)[1],   node_type: 'junction', dma_id: 1 },

  // Branch south
  { label: 'J-009', elev_m: 11.2, x: pt(0.004, -0.004)[0],  y: pt(0.004, -0.004)[1],  node_type: 'junction', dma_id: 1 },
  { label: 'J-010', elev_m: 10.7, x: pt(0.008, -0.005)[0],  y: pt(0.008, -0.005)[1],  node_type: 'junction', dma_id: 1 },
  { label: 'J-011', elev_m: 10.2, x: pt(0.012, -0.004)[0],  y: pt(0.012, -0.004)[1],  node_type: 'junction', dma_id: 1 },

  // Cross connectors
  { label: 'J-012', elev_m: 11.0, x: pt(0.006, 0.003)[0],   y: pt(0.006, 0.003)[1],   node_type: 'junction', dma_id: 1 },
  { label: 'J-013', elev_m: 10.5, x: pt(0.010, 0.003)[0],   y: pt(0.010, 0.003)[1],   node_type: 'junction', dma_id: 1 },
  { label: 'J-014', elev_m: 10.8, x: pt(0.006, -0.002)[0],  y: pt(0.006, -0.002)[1],  node_type: 'junction', dma_id: 1 },
  { label: 'J-015', elev_m: 10.3, x: pt(0.010, -0.002)[0],  y: pt(0.010, -0.002)[1],  node_type: 'junction', dma_id: 1 },

  // Dead ends / leaves
  { label: 'J-016', elev_m: 11.5, x: pt(0.002, 0.004)[0],   y: pt(0.002, 0.004)[1],   node_type: 'junction', dma_id: 1 },
  { label: 'J-017', elev_m: 10.0, x: pt(0.014, 0.007)[0],   y: pt(0.014, 0.007)[1],   node_type: 'junction', dma_id: 1 },
  { label: 'J-018', elev_m: 10.5, x: pt(0.002, -0.003)[0],  y: pt(0.002, -0.003)[1],  node_type: 'junction', dma_id: 1 },
  { label: 'J-019', elev_m:  9.8, x: pt(0.014, -0.006)[0],  y: pt(0.014, -0.006)[1],  node_type: 'junction', dma_id: 1 },

  // Special types
  { label: 'M-001', elev_m: 12.0, x: pt(-0.002, 0.002)[0],  y: pt(-0.002, 0.002)[1],  node_type: 'meter',     dma_id: 1 },
  { label: 'M-002', elev_m: 10.0, x: pt(0.018, 0.001)[0],   y: pt(0.018, 0.001)[1],   node_type: 'meter',     dma_id: 1 },
  { label: 'V-001', elev_m: 11.5, x: pt(0.006, 0)[0],       y: pt(0.006, 0)[1],       node_type: 'valve',     dma_id: 1 },
  { label: 'V-002', elev_m: 10.5, x: pt(0.010, 0)[0],       y: pt(0.010, 0)[1],       node_type: 'valve',     dma_id: 1 },
  { label: 'P-001', elev_m: 12.5, x: pt(-0.003, -0.001)[0], y: pt(-0.003, -0.001)[1], node_type: 'pump',      dma_id: 1 },
  { label: 'T-001', elev_m: 15.0, x: pt(-0.004, 0)[0],      y: pt(-0.004, 0)[1],      node_type: 'tank',      dma_id: 1 },
  { label: 'R-001', elev_m: 18.0, x: pt(-0.005, -0.002)[0], y: pt(-0.005, -0.002)[1], node_type: 'reservoir',  dma_id: 1 },
]

const MOCK_PIPES: NetworkPipe[] = [
  // Main trunk
  { label: 'PIPE-001', start_node: 'J-001', stop_node: 'J-002', length_m: 450,  d_mm: 300, material: 'DI',   dma_id: 1 },
  { label: 'PIPE-002', start_node: 'J-002', stop_node: 'V-001', length_m: 200,  d_mm: 300, material: 'DI',   dma_id: 1 },
  { label: 'PIPE-003', start_node: 'V-001', stop_node: 'J-003', length_m: 200,  d_mm: 300, material: 'DI',   dma_id: 1 },
  { label: 'PIPE-004', start_node: 'J-003', stop_node: 'V-002', length_m: 200,  d_mm: 250, material: 'DI',   dma_id: 1 },
  { label: 'PIPE-005', start_node: 'V-002', stop_node: 'J-004', length_m: 200,  d_mm: 250, material: 'DI',   dma_id: 1 },
  { label: 'PIPE-006', start_node: 'J-004', stop_node: 'J-005', length_m: 400,  d_mm: 200, material: 'PVC',  dma_id: 1 },

  // North branch
  { label: 'PIPE-007', start_node: 'J-002', stop_node: 'J-006', length_m: 500,  d_mm: 200, material: 'PVC',  dma_id: 1 },
  { label: 'PIPE-008', start_node: 'J-006', stop_node: 'J-007', length_m: 450,  d_mm: 150, material: 'PVC',  dma_id: 1 },
  { label: 'PIPE-009', start_node: 'J-007', stop_node: 'J-008', length_m: 400,  d_mm: 150, material: 'PVC',  dma_id: 1 },
  { label: 'PIPE-010', start_node: 'J-008', stop_node: 'J-004', length_m: 350,  d_mm: 150, material: 'PVC',  dma_id: 1 },

  // South branch
  { label: 'PIPE-011', start_node: 'J-002', stop_node: 'J-009', length_m: 550,  d_mm: 200, material: 'DI',   dma_id: 1 },
  { label: 'PIPE-012', start_node: 'J-009', stop_node: 'J-010', length_m: 450,  d_mm: 150, material: 'HDPE', dma_id: 1 },
  { label: 'PIPE-013', start_node: 'J-010', stop_node: 'J-011', length_m: 400,  d_mm: 150, material: 'HDPE', dma_id: 1 },
  { label: 'PIPE-014', start_node: 'J-011', stop_node: 'J-004', length_m: 350,  d_mm: 150, material: 'HDPE', dma_id: 1 },

  // Cross connectors (north to trunk)
  { label: 'PIPE-015', start_node: 'J-012', stop_node: 'J-006', length_m: 250,  d_mm: 100, material: 'PVC',  dma_id: 1 },
  { label: 'PIPE-016', start_node: 'J-012', stop_node: 'J-003', length_m: 350,  d_mm: 100, material: 'PVC',  dma_id: 1 },
  { label: 'PIPE-017', start_node: 'J-013', stop_node: 'J-007', length_m: 300,  d_mm: 100, material: 'PVC',  dma_id: 1 },
  { label: 'PIPE-018', start_node: 'J-013', stop_node: 'V-002', length_m: 350,  d_mm: 100, material: 'PVC',  dma_id: 1 },

  // Cross connectors (south to trunk)
  { label: 'PIPE-019', start_node: 'J-014', stop_node: 'J-009', length_m: 250,  d_mm: 100, material: 'HDPE', dma_id: 1 },
  { label: 'PIPE-020', start_node: 'J-014', stop_node: 'V-001', length_m: 250,  d_mm: 100, material: 'HDPE', dma_id: 1 },
  { label: 'PIPE-021', start_node: 'J-015', stop_node: 'J-010', length_m: 300,  d_mm: 100, material: 'HDPE', dma_id: 1 },
  { label: 'PIPE-022', start_node: 'J-015', stop_node: 'J-003', length_m: 550,  d_mm: 100, material: 'HDPE', dma_id: 1 },

  // Dead-end spurs
  { label: 'PIPE-023', start_node: 'J-001', stop_node: 'J-016', length_m: 500,  d_mm: 100, material: 'PVC',  dma_id: 1 },
  { label: 'PIPE-024', start_node: 'J-008', stop_node: 'J-017', length_m: 300,  d_mm: 75,  material: 'PVC',  dma_id: 1 },
  { label: 'PIPE-025', start_node: 'J-001', stop_node: 'J-018', length_m: 400,  d_mm: 100, material: 'PVC',  dma_id: 1 },
  { label: 'PIPE-026', start_node: 'J-011', stop_node: 'J-019', length_m: 300,  d_mm: 75,  material: 'HDPE', dma_id: 1 },

  // Supply connections (pump, tank, reservoir → network)
  { label: 'PIPE-027', start_node: 'T-001', stop_node: 'P-001', length_m: 120,  d_mm: 400, material: 'DI',   dma_id: 1 },
  { label: 'PIPE-028', start_node: 'P-001', stop_node: 'J-001', length_m: 180,  d_mm: 400, material: 'DI',   dma_id: 1 },
  { label: 'PIPE-029', start_node: 'R-001', stop_node: 'T-001', length_m: 150,  d_mm: 500, material: 'Steel',dma_id: 1 },

  // Meter connections
  { label: 'PIPE-030', start_node: 'M-001', stop_node: 'J-001', length_m: 200,  d_mm: 150, material: 'PVC',  dma_id: 1 },
  { label: 'PIPE-031', start_node: 'J-005', stop_node: 'M-002', length_m: 200,  d_mm: 150, material: 'PVC',  dma_id: 1 },
]

// -------------------------------------------------------------------
// Service class
// -------------------------------------------------------------------

class NetworkGraphService {
  /**
   * Simulates the backend processing shapefiles and returning
   * the network graph. Adds a realistic delay.
   */
  async processNetworkGraph(_zoneId: string, _roles: any): Promise<NetworkGraphData> {
    // Simulate backend processing time (1.5–3 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500))

    const nodes = MOCK_NODES
    const pipes = MOCK_PIPES

    // Compute extent from node coordinates
    const xs = nodes.map(n => n.x)
    const ys = nodes.map(n => n.y)
    const pad = 0.002

    return {
      nodes,
      pipes,
      extent: {
        xmin: Math.min(...xs) - pad,
        ymin: Math.min(...ys) - pad,
        xmax: Math.max(...xs) + pad,
        ymax: Math.max(...ys) + pad,
      }
    }
  }

  /**
   * Confirms the selected inlet node(s) with the backend.
   */
  async confirmInletNodes(_zoneId: string, inletLabels: string[]): Promise<boolean> {
    console.log('[NetworkGraphService] Confirming inlet nodes:', inletLabels)
    await new Promise(resolve => setTimeout(resolve, 500))
    return true
  }
}

export default new NetworkGraphService()
